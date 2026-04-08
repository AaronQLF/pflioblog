---
title: "Paper Review: Attention Is All You Need"
date: "2026-04-07"
excerpt: "First entry in a new series where I revisit foundational papers. Starting with Vaswani et al. (2017), the paper I keep returning to, and the argument that we had the math for years before we had the hardware to make it matter."
tags: ["Paper Review", "AI", "Research", "Transformers"]
series: "Paper Review"
seriesOrder: 1
---

This is the first post in what I am calling the Paper Review series. The idea is simple: I pick a paper, summarize the core contribution, then spend most of the post on what I actually think about the methodology, the reasoning, and the implications that the authors may or may not have intended. Not a literature review. Not a tutorial. Just me reading carefully and writing down what I notice.

I am starting with a paper I have read more times than I can count. "Attention Is All You Need" (Vaswani et al., 2017). The one that introduced the Transformer. I keep coming back to it because every time I reread it, I catch something I missed, or something clicks differently given what has happened since. It is one of those rare papers where the simplicity of the core idea is almost suspicious. You read it and think: why did this not exist five years earlier?

That question is the one I want to spend time on.

## What the Paper Actually Proposes

The Transformer is an encoder-decoder architecture for sequence transduction (originally machine translation) that replaces recurrence and convolution entirely with attention mechanisms. That is the whole thesis. The title is not metaphorical.

Prior to this paper, the dominant paradigm for sequence-to-sequence tasks was recurrent neural networks, specifically LSTMs and GRUs, often augmented with attention. Bahdanau et al. (2014) had already shown that letting the decoder attend to all encoder hidden states, rather than compressing the entire input into a single fixed-length vector, dramatically improved translation quality. Attention worked. Everyone knew it worked.

But those models were still fundamentally recurrent. The encoder processed the input sequence one token at a time, left to right. The decoder generated the output one token at a time, left to right. Attention was bolted on top of a sequential backbone.

Vaswani et al. asked: what if the backbone itself was attention? No recurrence. No convolution. Just attention all the way down.

The architecture has a few key components:

**Scaled dot-product attention.** Given queries $Q$, keys $K$, and values $V$, compute:

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

The scaling factor $\sqrt{d_k}$ prevents the dot products from growing large enough to push the softmax into regions with vanishing gradients. This is a small detail that matters enormously in practice.

**Multi-head attention.** Instead of computing a single attention function, project the queries, keys, and values into $h$ different subspaces, compute attention in each, concatenate, and project back. The paper uses 8 heads. The intuition is that different heads can learn to attend to different types of relationships (syntactic, semantic, positional) without interfering with each other.

**Position encodings.** Since there is no recurrence, the model has no inherent notion of token order. The paper adds sinusoidal position encodings to the input embeddings. The specific choice of sine and cosine functions at different frequencies was motivated by the hypothesis that it would allow the model to learn relative positions, since $PE_{pos+k}$ can be expressed as a linear function of $PE_{pos}$.

**Feed-forward layers.** Each attention sublayer is followed by a position-wise feed-forward network. Two linear transformations with a ReLU in between. Same parameters at each position, different parameters across layers.

**Residual connections and layer normalization** around each sublayer. Standard practice by 2017, but critical for training deep attention networks.

The encoder stacks 6 identical layers. The decoder stacks 6 identical layers with an additional cross-attention sublayer that attends to the encoder output. Masking in the decoder self-attention prevents positions from attending to subsequent positions, preserving the autoregressive property.

That is the architecture. It is not complicated. The individual pieces (dot-product attention, multi-head projections, residual connections, layer norm, position encodings) are all straightforward. The contribution is compositional: assembling these pieces into something that replaces recurrence entirely while being faster to train and better at the task.

## The Compute Argument

Here is the point I keep making to people and the reason I chose this paper to start the series: the mathematical machinery for the Transformer existed for years before the paper was published. Attention mechanisms date to 2014. Residual connections were formalized by He et al. in 2015. Layer normalization, 2016. Feed-forward networks are as old as the field. Even the idea of computing pairwise interactions between all elements in a sequence was not novel.

We had the components. What we did not have was the compute to make them competitive.

Recurrent networks dominated not because they were better in some theoretical sense, but because they were efficient enough to train on the hardware available through the 2010s. An LSTM processes tokens sequentially. The computational cost scales linearly with sequence length per step. You cannot parallelize across time steps, but each step is cheap.

Attention over the full sequence is $O(n^2)$ in sequence length. For a 512-token sentence, that is 262,144 pairwise interactions per layer. Multiply by the number of layers, heads, and the embedding dimension. In 2014, this would have been prohibitively expensive on the GPUs available. A single Titan X (2015) had 12 GB of memory and roughly 7 TFLOPS of FP32 throughput. Training a Transformer base model (65 million parameters) on WMT English-to-German with 4.5 million sentence pairs would have been painfully slow, if it fit at all.

By 2017, the landscape had changed. The P100 offered 16 GB HBM2 and 10.6 TFLOPS FP32. Mixed-precision training was becoming viable. Multi-GPU setups were standard in large labs. The paper reports training on 8 P100 GPUs for 3.5 days for the base model and 12 days for the big model. That is 300,000 training steps at a batch size of roughly 25,000 source and target tokens per step. In 2014, this would have taken months, if the memory constraints were even solvable.

The deeper point is this: the Transformer did not just benefit from more compute. It was *designed* to exploit parallel compute in a way that RNNs structurally could not. Recurrence is inherently sequential. You cannot compute the hidden state at position $t$ until you have computed the hidden state at position $t-1$. This means RNNs leave most of a GPU's parallel cores idle. The Transformer computes all positions simultaneously. Every attention head, every position, every layer can be parallelized. It is a better fit for the hardware.

This is the part that I think gets underappreciated. The Transformer was not just a better model. It was a better model *for GPUs*. And GPUs were getting faster on a curve that made the $O(n^2)$ cost increasingly acceptable. The paper was published at exactly the moment when the hardware could handle the architecture, and the architecture could exploit the hardware. That is not a coincidence. The authors were at Google Brain. They had access to the hardware and they designed for it.

I think there is a general lesson here that applies beyond this specific paper: breakthroughs in deep learning are often architectural ideas that were latent for years, waiting for compute to catch up. The ideas are not new. The feasibility is.

## Thoughts on the Methodology

The experimental setup in the paper is clean and well-controlled by the standards of 2017 ML papers, which is to say it is adequate but would not pass muster today.

The primary evaluation is on WMT 2014 English-to-German and English-to-French translation. The Transformer achieves 28.4 BLEU on EN-DE (beating the previous best by over 2 BLEU) and 41.0 on EN-FR (new state of the art at the time, at a fraction of the training cost of prior models). These results were convincing.

What I appreciate about the paper is Table 3, where the authors systematically ablate components. They vary the number of heads, the key/value dimensions, the model size, the dropout rate, and the type of position encoding. This is the kind of careful experimentation that lets you reason about *why* the architecture works, not just *that* it works. The finding that replacing the sinusoidal position encodings with learned embeddings produced "nearly identical results" is interesting in hindsight, given that learned position embeddings became the default in later models (GPT-2 onward) and then rotary embeddings (RoPE) replaced both.

One methodological choice I find interesting on every reread is the decision to evaluate on translation specifically. By 2017, there were already signs that attention-augmented models were strong on other tasks. Choosing translation was strategically smart because MT had the most established benchmarks, the largest available datasets, and the most direct comparison points against RNNs. It let the paper make a clean, narrow claim: this architecture is better for this well-studied task. The broader claim, that attention alone is sufficient for sequence modeling in general, was implicit but not tested in the original paper. That came later, with BERT, GPT, and the rest.

The paper is also honest about limitations in a way I respect. The authors note that for very long sequences, the $O(n^2)$ self-attention cost becomes a bottleneck, and suggest restricted attention patterns as future work. This turned out to be prophetic. The entire line of efficient attention research (Linformer, Performer, Longformer, Flash Attention) exists because the authors correctly identified their own architecture's scaling weakness.

## What the Paper Got Right That Nobody Expected

The paper is titled "Attention Is All You Need" and it proposes an architecture for machine translation. Nowhere in it do the authors claim that this architecture would become the foundation for language models, vision models, protein folding, audio generation, reinforcement learning, and effectively everything else in deep learning. They did not predict GPT. They did not predict BERT. They did not predict Vision Transformers.

But the architecture they designed turned out to be absurdly general. And I think the reason is the property I described above: the Transformer is a better fit for parallel hardware than anything that came before it. As compute scaled, the Transformer scaled with it. As datasets grew, the Transformer could absorb them. The architecture did not impose structural bottlenecks (like the sequential dependency in RNNs) that would have prevented scaling.

There is an argument that the Transformer's success is less about attention being the right inductive bias and more about attention being the right *computational primitive* for the hardware trajectory we happened to be on. If we had scaled quantum computers instead of GPUs, the dominant architecture might look entirely different. The Transformer won because it matched the hardware, and the hardware won because of economics (gaming GPUs subsidized AI compute for a decade).

## Why I Keep Coming Back

Every few months I reread this paper. Partly because it is well-written. Partly because it is a reminder of what a clean, well-scoped contribution looks like. The paper does not try to solve everything. It proposes one architecture, tests it on one task, ablates its components, and lets the results speak.

But mostly I come back because it is a perfect case study in the relationship between ideas and infrastructure. The attention mechanism was not new. The mathematical tools were not new. The training techniques were not new. What was new was the recognition that these existing pieces, assembled correctly, could exploit the available hardware better than the incumbent approach. That is an engineering insight as much as a scientific one.

I think about this every time I see a new architecture paper. The question is never just "is this a better model?" The question is "is this a better model for the hardware we have, and for the hardware we are about to have?" Vaswani et al. answered that question, probably without fully realizing it, and it changed everything.

*First entry in the Paper Review series. Next: Scaling Laws for Neural Language Models.*
