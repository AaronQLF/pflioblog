---
title: "Paper Review: Efficient Memory Management for LLM Serving with PagedAttention"
excerpt: "Sixteenth entry in the Paper Review series, written from a balcony and therefore later than it should have been. Kwon et al. (2023) noticed that the thing capping how many users you can serve is not the weights and not the compute, it is a memory allocator making a bad decision, and then fixed it by importing paged virtual memory into an attention kernel. The systems result is excellent. The analogy that carries the paper is doing slightly more work than it can support."
date: "2026-08-16"
tags: ["Paper Review", "AI", "Inference", "Systems", "Engineering"]
series: "Paper Review"
seriesOrder: 16
---

*Housekeeping first: I have been away for most of August and the writing rate shows it. This is the first thing I have finished in over a week, and I wrote most of it on a balcony with intermittent wifi and a laptop that thermally throttles if you look at it wrong, which is a poor environment for checking arithmetic in a systems paper. Normal cadence resumes when I am back. I am not going to pretend the break was productive. It was a vacation and I took it as one.*

The paper is "Efficient Memory Management for Large Language Model Serving with PagedAttention" (Kwon, Li, Zhuang, Sheng, Zheng, Yu, Gonzalez, Zhang, Stoica, SOSP 2023), which is the paper that introduced vLLM. I have referenced it in passing before, in the [serving piece](/inference-is-not-a-forward-pass), where I called it beautiful and a little damning and then moved on. That was a summary. This is the actual read, and reading it properly changed which part I think is the contribution.

## The observation the paper is built on

Here is the setup. You are serving an autoregressive model. During decode you cache the key and value vectors of every token you have already processed, because recomputing attention over the whole prefix at every step would be quadratic and absurd. That cache is per-request and it grows by one token's worth of state at every step. Its size is

$$\text{KV bytes} = 2 \cdot b \cdot L \cdot n_{\text{kv}} \cdot d_h \cdot T,$$

with $b$ bytes per element, $L$ layers, $n_{\text{kv}}$ key/value heads, $d_h$ head dimension, and $T$ tokens. Weights are a fixed cost. The KV cache is a per-user, per-token tax on whatever is left, and since throughput on a memory-bound decode workload is roughly linear in batch size, and batch size is capped by how many KV caches fit in the remaining memory, the KV cache is the thing that sets your revenue per GPU.

The paper's contribution starts with a measurement rather than a mechanism, which is why I like it. They instrument existing serving systems and ask how much of the memory reserved for KV cache is holding a key or value vector that will actually be read. The answer is between about 20 and 40 percent. The rest is waste, in three flavors:

**Reservation.** The system allocates a contiguous buffer per request, sized to the maximum sequence length the request could reach. A request that generates 60 tokens against a 2048-token ceiling has 97 percent of its allocation sitting idle for the entire life of the request. The memory is not free, it is not usable by anyone else, and it is not doing anything.

**Internal fragmentation.** The unused tail of that buffer, specifically the part that will never be filled because the sequence terminated early. You cannot know in advance how long a generation will be. That is the whole nature of the workload.

**External fragmentation.** Requests of different sizes arrive and finish, and the freed contiguous blocks come back in awkward shapes that do not fit the next request even though the total free memory would be sufficient.

I want to sit on this for a second because it is the part of the paper that is easy to skip. Nobody in this field had been sloppy on purpose. The contiguous-buffer design is what you would obviously write, it is what the reference implementations did, and it was quietly wasting the majority of the most expensive resource in the system. The finding is not that a clever new algorithm beats a well-tuned baseline. The finding is that the baseline everyone had agreed on was structurally leaving two thirds of the memory on the floor, and that nobody had measured it because the memory looked allocated and allocated memory looks busy.

## The mechanism

Once the problem is framed as fragmentation of a dynamically-growing per-process allocation, the solution has been known since roughly 1962 and the authors say so directly. You stop allocating contiguously.

The KV cache is divided into fixed-size blocks, each holding the keys and values for a fixed number of tokens (16 by default). Every sequence gets a block table mapping its logical block positions to physical blocks that can live anywhere in the pool. Blocks are allocated on demand, one at a time, as the sequence actually grows. When a sequence finishes, its blocks return to a free pool as uniform units that fit any future request. Reservation waste goes to zero because you never reserve. External fragmentation goes to zero because every free unit is interchangeable. Internal fragmentation is bounded by the block size, so at most 15 wasted slots in the last block of each sequence, which for realistic sequence lengths is a rounding error. The measured waste drops under 4 percent.

The cost is that attention no longer reads from a contiguous tensor, and every fused attention kernel in existence assumed it did. This is where the paper stops being an analogy and starts being engineering. They write kernels that gather keys and values through the block table during the attention computation itself, fuse the reshape-and-write of new KV state into the correct physical block, and fuse block copies for the sharing case. Those kernels are reported at roughly 20 to 26 percent slower than contiguous attention on the same shapes. The paper is admirably plain about this: the mechanism makes the inner loop measurably worse and wins anyway, because the batch size it unlocks is worth far more than a quarter of the attention kernel.

That trade is the actual shape of the result, and it is the part that gets flattened when the paper is cited. This is not a faster attention. It is a slower attention that lets you run three times as many sequences.

## The part I think is underweighted

Blocks buy you one more thing, and the paper spends less space on it than I think it deserves.

If two sequences share a prefix, they can point their block tables at the same physical blocks. Reference count the blocks, and copy on write when a sequence diverges. The paper develops this for decoding algorithms that fan out from a shared context: parallel sampling, where you generate $n$ candidates from one prompt, and beam search, where the beams share long stretches of history and the shared portion changes as beams are pruned. Under beam search the reported savings are large, since the naive implementation is copying enormous amounts of duplicated state around on every step, and blocks turn that into pointer manipulation.

The reason I think this is underweighted is that the same machinery, pointed at a different workload, is prefix caching across users. A production deployment serves thousands of requests that begin with the identical system prompt, the identical tool schema, the identical few-shot block. Under contiguous allocation each of those stores its own copy, and every one of them pays the prefill cost to produce state that is bit-identical to state already in memory. Under blocks with reference counting, they share, and the prefill is skipped. That is the mechanism behind the cached-input discount that every major provider now shows on its pricing page, and it is a bigger economic fact than the throughput number the paper leads with.

In the paper it reads as a nice consequence of the design. Three years later it is arguably the primary consequence. I do not hold this against the authors, it is genuinely hard to know in advance which of your corollaries the world is going to build a business model on, but it is a good demonstration that the citation count of a result and its actual importance can point at different sections of the same PDF.

## Where the operating systems analogy snaps

The paper's rhetorical engine is the OS analogy: blocks are pages, block tables are page tables, sequences are processes, the whole thing is virtual memory. It is a good analogy. It makes the design legible in one paragraph to anyone who has taken an undergraduate systems course, and I suspect it is responsible for a nontrivial fraction of how fast vLLM was adopted.

It also breaks at the exact point where operating systems are most interesting, and I want to be precise about where.

Real virtual memory handles overcommit with demand paging at page granularity. Touch a page that is not resident, take a fault, evict some other page by whatever policy, bring yours in, resume the instruction. The unit of eviction is one page and the process never knows.

vLLM cannot do this. When the pool is exhausted, it does not evict a block. It preempts an entire sequence, all-or-nothing, and either swaps that sequence's whole cache to CPU memory or throws it away and recomputes it later. The reason is not laziness, it is the access pattern: attention at step $t$ reads every previous position, so a sequence's blocks are all live at every step. There is no cold page to evict. The working set is the entire allocation, always, by construction. Demand paging is a bet that locality exists, and attention is the ur-example of a workload with no locality to exploit — it touches everything, every step, by definition.

So the analogy delivers the allocator and does not deliver the pager, and the paper's own evaluation quietly documents this. The comparison of swapping versus recomputation as preemption strategies, with recomputation winning at small block sizes because swapping over PCIe is slow, is not a virtual memory result at all. It is a checkpoint-restart result. It belongs to a different tradition than the one the framing invokes.

I am not saying the paper overclaims — the authors are careful, the preemption section is right there and honest about the constraint. I am saying that the analogy is doing enough persuasive work that readers import the rest of the OS toolbox along with it, and the rest of the toolbox does not come. Every subsequent attempt to be cleverer about eviction has had to confront the fact that there is nothing cold in a KV cache, and the ones that get anywhere do it by changing what is stored — quantizing the cache, dropping low-attention tokens, compressing old state — rather than by scheduling residency. That is a different research program than paging, and the analogy makes it slightly harder to see that it needs to be one.

## What the numbers actually say

The headline is 2 to 4 times the throughput of FasterTransformer and Orca at the same latency, evaluated on OPT at 13B, 66B and 175B plus LLaMA-13B, driven by request traces derived from ShareGPT and Alpaca.

The number is real and I have no quarrel with the methodology, but it is quoted context-free constantly and the context matters in a specific way. The gain is memory efficiency converted into batch size converted into throughput. Its magnitude is therefore proportional to how memory-starved you were to begin with. The paper says this outright and the trend is visible in their own results: gains are largest for longer sequences, larger models, and the fan-out decoding algorithms, because those are the configurations where KV cache dominates and where the old allocator wasted the most. On a workload with short sequences on a model whose weights leave plenty of headroom, there is correspondingly less to win. "2-4x" is not a property of the technique. It is a property of the technique applied to the traces in the paper, on 2023 hardware, against the specific waste those baselines exhibited.

Two smaller cautions on the comparison. Orca was not publicly available, so the Orca baseline is the authors' own reimplementation, evaluated in three variants to bracket the uncertainty about the original's reservation behavior. That is the honest way to handle it and it is still a reimplementation of a competitor by the people proposing the alternative. And the traces are chat-shaped: ShareGPT and Alpaca, with input and output lengths that look nothing like the 100k-token contexts that a large fraction of today's serving load consists of. At those lengths the KV cache is not merely the binding constraint, it is most of the memory in the machine, and the interesting question stops being fragmentation and starts being whether you should be storing all of that state at full precision at all. The paper's mechanism still applies. Its measurements do not transfer.

## The thing nobody measured

Here is my standing complaint, and I am aware it is the same complaint I make about most systems papers, which is either consistency or a tic.

Paging makes the batch composition dynamic in a new way. Sequences are admitted, preempted, and recomputed based on the instantaneous state of a block pool that is shared with every other user on the machine. Whether your request is in a batch of 8 or a batch of 200 at any given decode step is now a function of what strangers are doing.

Batch size determines the reduction order inside the matrix multiplications. Floating point addition is not associative. Different reduction order, different rounding, occasionally a different argmax, and from there a different token and a different continuation. So the more efficient the memory manager is at packing the machine — which is to say the better it does its job — the more strongly your output is coupled to the load on the server. Greedy decoding at temperature zero is not reproducible, and this paper, without touching numerics anywhere, made it less reproducible by making occupancy more variable.

I do not think this is a flaw in the paper. It is out of scope and they never claim otherwise. I think it is a gap in what the community measures, and it is one that lands directly on my own work: if you identify features in a model at fixed precision and fixed batch, and then those features are supposed to underwrite a safety property in a deployment where the effective function drifts with server load, you have a validation problem that no amount of interpretability rigor on the offline model fixes. There is a version of this paper's evaluation table with a column for output stability under varying load. Nobody has run it. I would like to, and it is roughly a weekend of work, which is a sentence I should be suspicious of when I write it about somebody else's system.

## What transfers

Three things I took away, in decreasing order of confidence.

The first is the methodological one. The contribution here is a measurement that made an accepted design look indefensible, followed by the most obvious possible fix. There was no new algorithm. There was somebody asking what fraction of the reserved memory contains a vector that will be read, getting an answer near 30 percent, and refusing to accept it. That kind of result is available more often than we act like it is, and it requires instrumenting the thing everyone assumes is fine rather than optimizing the thing everyone is already looking at.

The second is that the interface, not the kernel, was the bottleneck. The win came from changing the memory layout contract between the scheduler and the attention kernel, and it was paid for by making the kernel itself 20-odd percent worse. If you had spent that year optimizing attention on the contiguous layout you would have gotten a few percent and left the 2-4x on the table. The expensive constraints usually live in the interfaces between components that each look locally optimal.

The third, and the one I hold most loosely, is that a good analogy is a loan. The OS framing got this paper read and got the system adopted, and it also quietly promised a pager that the workload cannot support. Borrowing structure from a mature field is enormously productive right up to the point where you inherit its assumptions without checking which ones your problem actually satisfies. Attention does not have locality. That single fact determines which half of the operating systems literature is available to you here, and the paper's framing makes it easy to notice a decade late.

Back to a normal schedule shortly. The next one in this series is already half-drafted and does not require me to check arithmetic on a balcony.

*Related reading: the [serving stack piece](/inference-is-not-a-forward-pass) is the general version of this and covers continuous batching, the latency-throughput frontier, and the nondeterminism argument in more depth. [Writing FlashAttention from scratch](/flash-attention-from-scratch) is the other half of the memory story, the one about SRAM rather than HBM. [The ten-trillion-dollar piece](/nvidia-ten-trillion) is why any of this pencils out economically.*
