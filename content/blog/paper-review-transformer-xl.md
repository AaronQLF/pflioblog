---
title: "Paper Review: Transformer-XL"
date: "2026-04-17"
excerpt: "Eighth entry in the Paper Review series. Dai et al. (2019) looked at the Transformer's fixed-length context window and asked: what if we just kept the previous segment's hidden states around? The answer is segment-level recurrence, a relative positional encoding scheme that became ancestral to RoPE, and a paper that aged better than most of its contemporaries."
tags: ["Paper Review", "AI", "Research", "Transformers"]
series: "Paper Review"
seriesOrder: 8
---

After three papers on self-supervised vision, I am returning to the Transformer lineage. "Transformer-XL: Attentive Language Models Beyond a Fixed-Length Context" (Dai, Yang, Yang, Carbonell, Le, Salakhutdinov, ACL 2019) is a paper I should have reviewed earlier in this series because it directly addresses a limitation that Vaswani et al. explicitly flagged in the original Transformer paper: the $O(n^2)$ attention cost forces a fixed context window, and a fixed context window means the model forgets everything that happened before it.

I wrote in my review of Attention Is All You Need that the authors were honest about this weakness and suggested restricted attention patterns as future work. Transformer-XL is one of the first serious answers to that problem, and the specific way it answers it turns out to be more influential than the paper's citation count alone would suggest. The relative positional encoding scheme introduced here is a direct ancestor of Rotary Position Embeddings, which is the positional encoding used in essentially every frontier model today. The paper planted a seed in 2019 that is load-bearing in 2026.

## The Problem

The vanilla Transformer processes text in fixed-length segments. During training, you chop your corpus into chunks of length $L$ and feed each one independently. The model attends within the segment and sees nothing outside it. When you move to the next segment, the hidden states are discarded. The model starts fresh.

This creates three problems.

First, the maximum dependency length is bounded by the segment length. If a pronoun at position 520 refers to an antecedent at position 490, and the segment boundary falls at position 512, the model cannot resolve the reference. The information is not available. This is not a soft degradation. It is a hard wall.

Second, the segments do not respect linguistic boundaries. A segment might start mid-sentence, mid-paragraph, or mid-argument. The model receives a context window that begins at an arbitrary byte offset with no coherent beginning. The authors call this "context fragmentation," and it is a more pernicious problem than it sounds. The model cannot learn to handle long-range structure if it never sees long-range structure intact.

Third, evaluation is expensive. The standard approach in 2019 was to process text one segment at a time, but shift the window by only one position between evaluations to get a prediction for every token. This means recomputing the entire segment's representations for every single position shift. The redundant computation is enormous.

## Segment-Level Recurrence

The core idea is simple enough to state in one sentence: cache the hidden states from the previous segment and use them as additional context for the current segment.

During training, the model processes segment $s_{\tau}$ and produces hidden states at each layer. Instead of discarding those states, it stores them. When segment $s_{\tau+1}$ is processed, the cached states from $s_{\tau}$ are concatenated with the current segment's states to form the key-value pairs for attention. The queries come from the current segment only, but the keys and values extend back into the previous segment.

Formally, if $h_{\tau}^{n-1}$ are the hidden states at layer $n-1$ for segment $\tau$, the extended context is:

$$\tilde{h}_{\tau+1}^{n-1} = \left[\text{SG}(h_{\tau}^{n-1}) \circ h_{\tau+1}^{n-1}\right]$$

where SG denotes stop-gradient (the cached states do not receive gradient updates) and $\circ$ is concatenation along the sequence dimension.

The attention is then computed as:

$$q_{\tau+1}^n = h_{\tau+1}^{n-1} W_q^T, \quad k_{\tau+1}^n = \tilde{h}_{\tau+1}^{n-1} W_k^T, \quad v_{\tau+1}^n = \tilde{h}_{\tau+1}^{n-1} W_v^T$$

The queries are projected from the current segment only. The keys and values are projected from the extended context, which includes both the current and previous segment. The current segment can attend to the previous segment, but the previous segment's representations are frozen. Gradient does not flow backward through the cache.

This is an elegant compromise. Full backpropagation through the entire history would be equivalent to training on the full sequence, which is the thing we could not afford in the first place. By stopping the gradient at the segment boundary, the training cost stays proportional to the segment length, but the representational context grows. At each layer, information from the previous segment propagates forward through the cached states. Across $N$ layers, a token in the current segment can theoretically access information from up to $N \times L$ positions back, where $L$ is the segment length. The effective receptive field grows linearly with depth.

During evaluation, the previous segment's states are already computed and cached. The model simply extends the cache as it processes each new segment. No redundant recomputation. The speedup the authors report is 1,800x over the sliding window evaluation scheme. That is not a marginal improvement. That is the difference between a method being practical and being a conference paper.

## Relative Positional Encoding

Here is where the paper makes its most lasting contribution, and where the math gets interesting.

The problem with segment-level recurrence is that absolute positional encodings break. In the vanilla Transformer, each position in the segment gets a fixed encoding: position 0, position 1, position 2, and so on. If the model caches states from segment $\tau$ and uses them in segment $\tau+1$, the cached states carry position encodings from 0 to $L-1$, and the current segment also has position encodings from 0 to $L-1$. Position 3 in the current segment and position 3 in the cached segment have the same positional encoding, but they refer to completely different locations in the text. The model cannot distinguish them.

Dai et al. solve this by replacing absolute positional encodings with relative positional encodings. Instead of encoding "this token is at position 5," they encode "this token is 3 positions to the left of the query."

The standard attention logit between query position $i$ and key position $j$ in a Transformer with absolute encodings is:

$$A_{ij} = (E_{x_i} + U_i)^T W_q^T W_k (E_{x_j} + U_j)$$

where $E_{x_i}$ is the token embedding and $U_i$ is the absolute position encoding. Expanding this gives four terms:

$$A_{ij} = \underbrace{E_{x_i}^T W_q^T W_k E_{x_j}}_{(a)} + \underbrace{E_{x_i}^T W_q^T W_k U_j}_{(b)} + \underbrace{U_i^T W_q^T W_k E_{x_j}}_{(c)} + \underbrace{U_i^T W_q^T W_k U_j}_{(d)}$$

Transformer-XL replaces this with:

$$A_{ij} = \underbrace{E_{x_i}^T W_q^T W_{k,E} E_{x_j}}_{(a)} + \underbrace{E_{x_i}^T W_q^T W_{k,R} R_{i-j}}_{(b)} + \underbrace{u^T W_{k,E} E_{x_j}}_{(c)} + \underbrace{v^T W_{k,R} R_{i-j}}_{(d)}$$

Three changes happen simultaneously.

The absolute position encoding $U_j$ is replaced by a sinusoidal encoding of the relative distance $R_{i-j}$. This is the core change. Attention now depends on how far apart two tokens are, not on where they sit in absolute terms. A pair of tokens 5 positions apart receives the same positional signal regardless of whether they are at positions (10, 15) or (200, 205). This makes the encoding invariant to segment boundaries.

The key projection matrix is split into two: $W_{k,E}$ for content-based keys and $W_{k,R}$ for position-based keys. This is a subtle but important design choice. The model can learn separate transformations for "what is this token?" and "where is this token relative to me?" Sharing a single key matrix forces these two signals to compete for capacity.

The query-side position embeddings $U_i^T W_q^T$ are replaced by learnable vectors $u^T$ and $v^T$ that are shared across all query positions. The reasoning is that in relative terms, the query position is always "here." There is no information in the absolute position of the query once you are computing relative distances. Replacing a position-specific query term with a global bias is both cheaper and, the authors argue, more principled.

The four terms now have clean interpretations. Term (a) is content-to-content attention: how similar are these two tokens? Term (b) is content-dependent positional bias: how much does this specific content care about that relative distance? Term (c) is a global content bias: a position-independent prior over which tokens to attend to. Term (d) is a global positional bias: a position-independent prior over which relative distances to favor.

I find this decomposition genuinely elegant. Each term answers a different question, and the questions are orthogonal. Content similarity, directional preference, content salience, and distance preference. Mixing all four into a single attention logit is compact without being lossy.

## Why This Paper Aged Well

Most architecture papers from 2019 are historical footnotes. Transformer-XL is not, and the reason is the relative positional encoding scheme.

Rotary Position Embeddings (Su et al., 2021) reformulate relative positional encoding as a rotation in the complex plane. The key insight is the same one Dai et al. introduced: attention should depend on relative distance, not absolute position. RoPE just finds a more computationally elegant way to implement that insight, encoding relative position by rotating query and key vectors such that their dot product naturally depends on the distance between them. RoPE is used in LLaMA, Mistral, Qwen, and most open-source frontier models. ALiBi (Press et al., 2022) is another descendant, applying a linear bias based on relative distance directly to the attention scores.

The genealogy is clear. Vaswani et al. introduced sinusoidal absolute position encodings. Dai et al. showed that relative positional encoding was necessary for recurrence and beneficial in general. Su et al. compressed the idea into a rotation that was cheaper to compute and easier to extend to arbitrary context lengths. The modern context extension techniques (NTK-aware scaling, YaRN, dynamic NTK) all build on top of RoPE, which builds on top of the insight that Transformer-XL formalized.

The segment-level recurrence idea itself did not survive in the same form. Modern long-context models handle extended context through RoPE interpolation, sparse attention patterns, and massive KV caches rather than through the stop-gradient cached recurrence that Dai et al. proposed. But the recurrence mechanism proved the concept: a Transformer can handle context beyond its training-time segment length, and the key to doing so is getting the positional encoding right. That proof of concept mattered.

## Thoughts on the Methodology

The benchmarks in this paper are classic language modeling evaluations: Penn Treebank, WikiText-103, enwiki8, text8, and One Billion Word. The results are strong. On WikiText-103, Transformer-XL achieved a perplexity of 18.3, down from the previous best of 33.0. On enwiki8, 0.99 bits per character, down from 1.06. These were substantial improvements and they held up across all five benchmarks, which suggests the gains were not benchmark-specific.

The ablation study is the most useful part of the experimental section. The authors systematically compare segment-level recurrence with and without the new positional encoding, and they compare their relative scheme against other relative encoding approaches (Shaw et al., 2018). The ablation shows that both components contribute independently: recurrence without relative encoding is worse than recurrence with it, and relative encoding without recurrence also helps over absolute encoding. The gains are additive rather than redundant.

What I wish the paper had explored more is the effective dependency length in practice. The theoretical maximum context is $N \times L$ (layers times segment length), but the actual information flow through stop-gradient cached states is a separate empirical question. How much information from position $k$ in the previous segment actually influences position $j$ in the current segment, as a function of the distance $j + L - k$? The paper provides some auxiliary loss analysis showing that longer context helps, but a more direct probe of information flow across segment boundaries would have been valuable.

This is a methodological gap that interpretability tools could address today. Running activation patching or causal tracing across segment boundaries in a Transformer-XL would tell you exactly how much of the theoretical receptive field is being used. I suspect the effective context, the range over which the model actually leverages information, is significantly shorter than the theoretical maximum. But that is speculation, and the paper did not have the tools to test it.

## The Bigger Picture

Transformer-XL sits at an inflection point in the Transformer lineage. The original Transformer paper established that attention alone could match or beat recurrence for sequence modeling. The scaling laws paper showed that making models bigger and feeding them more data produced smooth, predictable improvements. Transformer-XL asked the next natural question: what happens when the sequence does not fit in the window?

Every subsequent approach to long-range context, from sparse attention to sliding window attention to linear attention approximations to the massive context windows in modern models, is operating in the design space that Transformer-XL opened. Not because the specific mechanism caught on, but because the paper demonstrated that the fixed-context limitation was solvable, and it identified relative positional encoding as the right abstraction for doing so.

The stop-gradient recurrence was the engineering solution that worked in 2019 with the hardware and training infrastructure available. The relative positional encoding was the mathematical insight that outlasted the engineering. There is a pattern here that I keep noticing across the papers in this series: the architectural ideas that endure are the ones that identify the right abstraction, even when the specific implementation gets replaced. Vaswani et al. identified attention as the right computational primitive. Kaplan et al. identified scaling as the right optimization axis. Dai et al. identified relative position as the right encoding abstraction. The implementations change. The abstractions survive.

That is a useful heuristic for evaluating new architecture papers. Do not ask whether this specific mechanism will be used in five years. Ask whether the abstraction it introduces is the right one. If the abstraction is right, someone will find a better implementation. If the abstraction is wrong, no amount of engineering will save it.

*Eighth entry in the Paper Review series. Previous: DINO.*
