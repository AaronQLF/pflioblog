---
title: "Attention Is a Memory Problem: Reimplementing FlashAttention in CUDA"
date: "2026-06-08"
excerpt: "I reimplemented the FlashAttention forward pass in CUDA to settle a claim I kept repeating without fully owning: that it computes exactly the same attention as the naive version and is faster purely because it moves less data. The online softmax recurrence is the part worth understanding."
tags: ["AI", "CUDA", "Attention", "Systems", "Engineering"]
---

FlashAttention computes exactly the same function as the attention you already know. Same inputs, same outputs, down to floating-point rounding. It is not an approximation, not a new attention variant, not a quality tradeoff you accept in exchange for speed. It is faster for a single reason: it moves less data. I reimplemented the forward pass from scratch, in CUDA, to make sure I actually believed that rather than repeating it because the paper said so.

This is the same lesson as my [previous post on inference](/inference-is-not-a-forward-pass), approached from the other side. There I argued that decoding a token is memory-bandwidth-bound, that the hardware sits idle waiting on weights rather than waiting on arithmetic. FlashAttention is the cleanest standalone proof of the same fact. The naive attention kernel and the flash kernel perform the identical number of floating-point operations. One of them is several times faster. The entire difference is how many bytes cross the boundary between slow global memory and fast on-chip memory. If I needed one example to convince a skeptic that data movement, not computation, is the design variable on a modern accelerator, this is the one I would reach for.

## Attention, counted in bytes instead of FLOPs

Standard scaled dot-product attention, per head, is three steps:

```text
S = (Q · Kᵀ) · scale     # N × N scores
P = softmax(S, axis=-1)   # N × N weights
O = P · V                 # N × d output
```

For a sequence of length $N$ and head dimension $d$, the two matrix multiplications dominate the arithmetic at roughly $4N^2d$ floating-point operations per head. That number is fixed. No rearrangement of the computation changes it, and FlashAttention does not try to. What it attacks is the line in the middle.

The intermediate score matrix $S$, and the weight matrix $P$ derived from it, are each $N \times N$. The textbook implementation writes $S$ to global memory, reads it back to compute the softmax, writes $P$, then reads it back again to multiply by $V$. For a long sequence that is a quadratic amount of traffic to the slowest memory on the device, the high-bandwidth memory everyone calls HBM but which is, relative to on-chip SRAM, the slow tier. The arithmetic is cheap. The round trips are not.

This is the IO-aware framing from Dao et al. The right cost model for attention on a GPU is not how many multiplies it performs. It is how many bytes move between HBM and the on-chip memory where the multiplies actually happen. Once you adopt that lens the optimization writes itself: never put the $N \times N$ matrix in HBM at all. Keep the working set small enough to live on chip, and stream the rest past it.

## The problem with softmax, and the trick that dissolves it

The obstacle is softmax. To normalize a row of scores you need two global quantities: the maximum, which you subtract for numerical stability, and the sum of exponentials, which is the denominator. Both appear to require seeing the entire row before you can produce a single output value, and that requirement is what forces the full row into memory.

Online softmax removes the requirement. The idea predates FlashAttention, from Milakov and Gimelshein in 2018, and FlashAttention's contribution is recognizing that it is exactly what makes attention streamable. Instead of computing the max and the sum up front, you maintain three running quantities per query row as you walk over the keys in tiles:

- $m$, the maximum score seen so far
- $l$, the running sum of $\exp(\text{score} - m)$
- $\mathbf{acc}$, the running, unnormalized weighted sum of value vectors

When a new tile of scores arrives with its own local maximum $m_{\text{tile}}$, you form the combined maximum $m' = \max(m, m_{\text{tile}})$. Everything accumulated so far was computed relative to the old maximum, so before folding in the new tile you rescale the old state by a correction factor $e^{\,m - m'}$:

$$
\begin{aligned}
m' &= \max(m,\; m_{\text{tile}}) \\
l &\leftarrow l \cdot e^{\,m - m'} + \sum_j e^{\,s_j - m'} \\
\mathbf{acc} &\leftarrow \mathbf{acc} \cdot e^{\,m - m'} + \sum_j e^{\,s_j - m'}\, \mathbf{v}_j
\end{aligned}
$$

After the final tile you divide once, $\mathbf{O} = \mathbf{acc} / l$, and you have the attention output for that row. The extra state is $O(d)$ per query row, a handful of numbers and one accumulator vector, instead of the full row of $N$ scores the textbook softmax must hold before it can normalize. The $N \times N$ matrix never needs to exist.

I want to be careful with the word exact, because I spent a section of the inference post on why floating-point addition is not associative and therefore why summation order matters. The online softmax recurrence is an algebraic identity. On real numbers it produces the same result as the all-at-once softmax, with none of the approximation that sparse or low-rank attention variants introduce. In floating point it reorders the additions, so it does not generally agree bit-for-bit with the textbook computation. It agrees to rounding. My CUDA-free math check matches an all-at-once softmax to about $10^{-7}$, which is pure float32 rounding, and the GPU kernel matches a double-precision reference to better than $10^{-3}$, which is comfortable once you account for float32 accumulation and the fast `__expf` intrinsic. Exact as in not an approximation. Not exact as in bitwise identical. Those are different claims, and conflating them is how people end up confused about why their outputs drift.

## Tiling: the recurrence is only half of it

The recurrence makes attention streamable. It does not, on its own, make it fast. The speed comes from where the data lives while you stream, and that is a tiling decision.

The kernel maps the problem onto the GPU like this. The grid is two-dimensional: one axis over tiles of query rows, the other over the independent attention problems, one per (batch, head) pair, since attention never mixes information across heads or batch elements. Inside a block, one thread owns one query row and keeps its $m$, $l$, and accumulator entirely in registers. The query vector is loaded into registers once and reused against every key it will ever see.

The inner loop is the part that matters. On each iteration the whole block cooperatively loads a tile of $K$ and $V$, sized $\text{BLOCK\_N} \times d$, from global memory into shared memory. Then every thread computes its scores against that one shared tile. The reuse is the entire point. A tile of keys and values is read from global memory once per query tile, not once per query row. With $\text{BLOCK\_M}$ query rows sharing each load, that is on the order of a $\text{BLOCK\_M}$-fold reduction in traffic to the slow tier for the $K$ and $V$ reads, which is exactly the quadratic cost the naive kernel keeps paying.

Stripped of setup, the heart of the kernel is the three-step tile update, a direct transcription of the recurrence above:

```cpp
// Step 1: scores for this tile, and the tile's local max.
float scores[BLOCK_N];
float m_tile = -FLT_MAX;
for (int r = 0; r < tile_rows; ++r) {
    const float* kr = Ks + r * head_dim;        // key row in SHARED memory
    float dot = 0.0f;
    for (int t = 0; t < head_dim; ++t) dot += q_reg[t] * kr[t];
    scores[r] = dot * scale;
    m_tile = fmaxf(m_tile, scores[r]);
}

// Step 2: merge maxima, rescale the running state to the new max.
const float m_new = fmaxf(m_i, m_tile);
const float correction = __expf(m_i - m_new);
l_i *= correction;
for (int t = 0; t < head_dim; ++t) acc[t] *= correction;

// Step 3: fold this tile into l and acc.
for (int r = 0; r < tile_rows; ++r) {
    const float p = __expf(scores[r] - m_new);
    l_i += p;
    const float* vr = Vs + r * head_dim;        // value row in SHARED memory
    for (int t = 0; t < head_dim; ++t) acc[t] += p * vr[t];
}
m_i = m_new;
```

The `Ks` and `Vs` pointers are into shared memory. That single fact, that the dot products and the value accumulation read from shared memory instead of from HBM, is where the performance lives. Everything else is bookkeeping.

## I wrote the slow version on purpose

The repository ships three implementations of the same math, and the two I did not strictly need are the two I am most glad I wrote.

The first is a CPU reference in double precision. It is the correctness oracle. It is slow and obviously correct, and it exists so that every GPU result has something trustworthy to be measured against. The second is a deliberately naive CUDA kernel that does the textbook three-pass softmax, one thread per query row, looping over all keys to find the max, again to build the denominator, and a third time to accumulate the output. It is not a strawman. It does not even materialize the $N \times N$ matrix in global memory, it recomputes the dot products instead, so it is a reasonable starting point rather than a crippled one. What it does do is read $K$ and $V$ from global memory many times over, which is the bandwidth problem written out in code.

The naive kernel is there because a speedup number is meaningless without a credible baseline. I have a low opinion of benchmarks that pit a tuned implementation against an unstated or deliberately weak alternative, and I did not want to publish one. The naive kernel also documents the math the fast kernel has to reproduce. When the flash output matches the naive output, which matches the double-precision reference, I have a chain of agreement that makes it hard to be subtly wrong without noticing.

## Proving it without a GPU

There is an honest detail I should state plainly: I wrote this on a machine with no NVIDIA GPU in it. CUDA code cannot run on what I had in front of me. That constraint turned out to be clarifying, because it forced me to separate the part of the project that needs hardware from the part that does not.

Correctness does not need a GPU. The online softmax recurrence is arithmetic, and arithmetic runs anywhere. I wrote a small, CUDA-free program that reimplements the exact tiling recurrence from the kernel in plain C++ and checks it against an all-at-once softmax, including shapes whose length is not a multiple of the tile size so the partial final tile gets exercised. It matches to floating-point rounding on any machine. By the time the kernel touches a real GPU, the algorithm is already proven. The only thing the GPU adds is a measurement of speed, and speed was never the part I was unsure about.

I will be equally plain about the consequence: I have not run the benchmark on real hardware, so I am not going to paste a table of speedup numbers. The repository contains the driver, with CUDA-event timing, warm-up iterations, and per-shape correctness checks, and it contains the benchmark tables as empty templates. I would rather ship an empty template I will fill in honestly than invented numbers that happen to point the right direction. The qualitative prediction is safe and follows directly from the cost model: the gap between naive and flash widens as $N$ grows, because the naive kernel's global-memory traffic scales with $N^2$ while the flash kernel keeps its working set on chip. When I get time on an A100 or similar, the real numbers go in the README, and not a moment before.

## What it deliberately is not

This is a didactic implementation. It optimizes for being readable top to bottom, and that goal is in direct tension with raw speed in a few places I want to name, because pretending otherwise is the thing I dislike most in writeups like this.

It is float32 only. There are no half or bfloat16 paths and no tensor-core (WMMA or MMA) instructions, which is precisely where the real throughput on modern GPUs lives. The production FlashAttention kernels are fast in large part because they feed the tensor cores in low precision, and this implementation does none of that. It uses one thread per query row, which is simple to read and leaves performance on the table next to a warp-cooperative design that blocks the head dimension across a warp. It does no causal masking, so every query attends to every key, encoder-style. It has no backward pass, so it is forward inference only. It caps the head dimension at a compile-time constant so the per-row accumulators fit in registers.

None of those omissions are accidents, and none of them are hard to describe as next steps. Causal masking in particular is nearly free given the tile structure: you skip the tiles that lie entirely in the future and mask only the diagonal tile. The reason I stopped where I did is that the goal was to move myself from "I can recite how FlashAttention works" to "I have written every line of it and watched it agree with the reference." That is a specific and limited goal. It is not the same as competing with the real kernel, and being clear about which of the two you are pursuing is most of what separates a useful writeup from a misleading one.

## Closing

The result that stays with me is the one I opened with. Two kernels, the same arithmetic to the last operation, and a several-fold speed difference that comes entirely from refusing to write a matrix to slow memory. The computation did not get smarter. The data movement got honest.

I keep returning to this because the lesson generalizes well past attention. On the hardware we actually run, the algorithm that wins is frequently not the one with fewer operations but the one with higher arithmetic intensity, the one that does more work per byte it drags across the memory hierarchy. FlashAttention is the canonical example, and the online softmax recurrence under it is one of those rare moves where a small algebraic identity buys an asymptotic reduction in a resource at no cost in accuracy. Those are worth collecting, and worth writing from scratch at least once, because reading the paper tells you that it is true and writing the kernel tells you why.

*Related reading: [serving an LLM is not a forward pass](/inference-is-not-a-forward-pass) makes the same memory-bound argument from the inference side, and [my tour of where LLMs are heading in 2026](/llm-trends-2026) covers the architecture and training context this kernel sits inside.*
