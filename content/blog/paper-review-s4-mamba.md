---
title: "Paper Review: S4 and Mamba. State Space Models as an Alternative Sequence Backbone"
date: "2026-04-19"
excerpt: "Tenth entry in the Paper Review series. Gu et al. (2021) asked what happens if you replace attention with a linear dynamical system that has the right memory structure. The answer is S4: a state space model that can be trained as a convolution but run as a recurrence, scaling linearly in sequence length. Mamba (Gu & Dao, 2023) then broke the model's own constraint by making the dynamics input-dependent, and the result is the first serious architectural alternative to the Transformer in seven years."
tags: ["Paper Review", "AI", "Research", "Sequence Models"]
series: "Paper Review"
seriesOrder: 10
---

I have spent the last several entries in this series tracing the Transformer lineage. Vaswani et al. introduced attention as the computational primitive. Transformer-XL showed that relative positional encoding was the right abstraction for extending context. Every paper in between has been a variation on the same core architecture: stack attention layers, scale the parameters, extend the context window.

This entry is about the first credible attempt to replace that architecture entirely.

"Efficiently Modeling Long Sequences with Structured State Spaces" (Gu, Goel, Ré, ICLR 2022, commonly called S4) and "Mamba: Linear-Time Sequence Modeling with Selective State Spaces" (Gu & Dao, 2023) are two papers that I think need to be reviewed together, because S4 establishes the mathematical framework and Mamba makes it competitive. Reading either one in isolation misses the arc. S4 is the proof that a linear dynamical system can model long-range dependencies if you initialize it correctly. Mamba is the proof that such a system can match or beat Transformers on language modeling if you make the dynamics input-dependent and build the CUDA kernels by hand.

The combined contribution is an alternative sequence modeling backbone that scales linearly in sequence length, runs as a recurrence at inference time (constant memory per step, no KV cache), and handles sequences of length 1 million without architectural modification. Whether it will displace the Transformer is an open question. That it represents a genuine alternative, rather than a curiosity, is no longer in doubt.

## The State Space Model Formulation

The starting point is classical control theory. A continuous-time linear state space model is defined by four matrices:

$$\dot{x}(t) = Ax(t) + Bu(t)$$
$$y(t) = Cx(t) + Du(t)$$

where $u(t)$ is the input signal, $x(t)$ is a latent state of dimension $N$, and $y(t)$ is the output. $A \in \mathbb{R}^{N \times N}$ governs the state dynamics, $B \in \mathbb{R}^{N \times 1}$ maps the input to the state, $C \in \mathbb{R}^{1 \times N}$ maps the state to the output, and $D \in \mathbb{R}$ is a skip connection (often dropped or handled separately).

This is a linear ODE with an input-driven forcing term. The state $x(t)$ is a compressed representation of the input history, and the matrices $A$, $B$, $C$ determine what gets remembered, how new information is incorporated, and what gets read out.

To use this in a neural network, you discretize. Given a step size $\Delta$, the zero-order hold discretization produces:

$$\bar{A} = \exp(\Delta A)$$
$$\bar{B} = (\Delta A)^{-1}(\exp(\Delta A) - I) \cdot \Delta B$$

The discrete recurrence is then:

$$x_k = \bar{A}x_{k-1} + \bar{B}u_k$$
$$y_k = Cx_k$$

This is a linear recurrence relation. At each time step, the state is updated by multiplying by $\bar{A}$ and adding the new input scaled by $\bar{B}$. The output is a linear projection of the state.

Here is the key duality that makes the whole framework work. A linear recurrence can be unrolled into a convolution. If you expand the recurrence for $K$ time steps, the output at position $k$ is:

$$y_k = \sum_{j=0}^{k} C\bar{A}^j\bar{B} \cdot u_{k-j}$$

This is a discrete convolution with kernel $\bar{K}_j = C\bar{A}^j\bar{B}$. You can precompute this kernel and apply it with an FFT in $O(L \log L)$ time, where $L$ is the sequence length. During training, when you have the entire input available, you use the convolutional view for parallelism. During inference, when you are generating one token at a time, you use the recurrent view for constant-time-per-step generation.

This is genuinely elegant. The same model has two computational modes: a parallel mode for training and a sequential mode for inference. The Transformer has no such duality. Attention is $O(L^2)$ in both modes. The KV cache reduces redundant computation during inference but does not change the fundamental scaling. The SSM gives you $O(L \log L)$ training and $O(1)$ per-step inference simultaneously.

## HiPPO: The Memory Problem

The formulation above looks clean, but there is a reason state space models were not competitive before S4. The matrix $A$ governs how information decays through the recurrence. For a generic $A$, information from the distant past is exponentially attenuated. After $k$ steps, the contribution of input $u_0$ to the state is $\bar{A}^k \bar{B} u_0$. If the eigenvalues of $\bar{A}$ have magnitude less than 1 (necessary for stability), this decays exponentially with $k$. Long-range dependencies vanish.

This is the same problem that plagued vanilla RNNs. LSTMs and GRUs solved it with gating. Transformers solved it by eliminating recurrence and attending directly to every position. Gu et al. solve it by choosing $A$ carefully.

The key ingredient is HiPPO (High-Order Polynomial Projection Operators, Gu et al. 2020), a framework for deriving state matrices that optimally compress the input history into a fixed-size state. The idea is to define $A$ such that the state $x(t)$ represents the coefficients of a polynomial approximation to the input history $u(s)$ for $s \leq t$, under some measure over the past.

The specific variant used in S4 is HiPPO-LegS (Legendre scaled), which approximates the input history using Legendre polynomials over the interval $[0, t]$, rescaling the interval as $t$ grows. The resulting $A$ matrix has the form:

$$A_{nk} = -\begin{cases} (2n+1)^{1/2}(2k+1)^{1/2} & \text{if } n > k \\ n+1 & \text{if } n = k \\ 0 & \text{if } n < k \end{cases}$$

This is not an arbitrary matrix. It is derived from the requirement that the state should optimally approximate the entire input history at every time step, in the least-squares sense under the Legendre polynomial basis. The matrix is lower triangular (causal), and its structure ensures that information from the distant past is preserved in the higher-order polynomial coefficients rather than being exponentially forgotten.

The practical consequence is dramatic. On the Path-X benchmark (classifying sequences of length 16,384 based on a long-range dependency), generic SSMs fail completely. S4 with HiPPO initialization solves it. The initialization is not a minor detail. It is the core contribution. Without HiPPO, the state space model is just another linear recurrence that cannot remember. With HiPPO, it is a model that theoretically preserves complete information about its input history, compressed into a polynomial representation of fixed dimension.

## S4: Making It Efficient

HiPPO gives you the right $A$ matrix. The computational problem is that computing the convolution kernel $\bar{K}_j = C\bar{A}^j\bar{B}$ for $j = 0, \dots, L-1$ naively requires $L$ matrix-vector multiplications, each involving an $N \times N$ matrix. For large state dimensions and long sequences, this is expensive.

S4's main technical contribution is showing how to compute this kernel efficiently by exploiting the structure of the HiPPO matrix. The key observation is that the HiPPO matrix can be decomposed as a sum of a diagonal matrix and a low-rank correction (DPLR decomposition):

$$A = \Lambda - PQ^*$$

where $\Lambda$ is diagonal and $P$, $Q$ are $N \times r$ matrices with small $r$. Under this decomposition, the generating function of the convolution kernel $\bar{K}(z) = \sum_{j} \bar{K}_j z^j = C(I - \bar{A}z)^{-1}\bar{B}$ can be evaluated at all $L$ roots of unity in $\tilde{O}(N + L)$ time using the Woodbury identity and FFTs.

I will not reproduce the full derivation here because the algebra is substantial and the original paper does a respectable job of walking through it. The important point is that S4 is not just a theoretical framework. The DPLR decomposition gives a concrete algorithm that runs in $O(N + L)$ per layer during training, where $N$ is the state dimension and $L$ is the sequence length. This is subquadratic in $L$ for any fixed $N$, and $N$ is typically small (64 or 256) compared to $L$ (which can be thousands or millions).

The results were startling. On the Long Range Arena benchmark suite, which was specifically designed to test architectures on long-range dependencies (sequences of length 1,024 to 16,384), S4 achieved an average accuracy of 86.09%, compared to 59.29% for the standard Transformer. The Transformer was not just worse. It was barely above random on several tasks. This was the first clear empirical evidence that the Transformer's quadratic attention cost was not just an efficiency problem but a capability problem: there were tasks that the Transformer could not solve because it could not scale to the sequence lengths required to see the dependency.

## The Limitation: Fixed Dynamics

S4 is impressive, but it has a fundamental constraint that limits its utility for the task that matters most in practice: language modeling.

The matrices $A$, $B$, $C$ in S4 are fixed. They do not depend on the input. The same linear recurrence is applied regardless of what the model is looking at. This means the model's information routing is static. It compresses the input history in the same way whether the input is a function word, a named entity, a delimiter, or noise. It cannot decide to remember some tokens more than others based on their content.

This is the price of the convolutional view. The convolution trick works precisely because the kernel is input-independent: $\bar{K}_j = C\bar{A}^j\bar{B}$ depends only on the matrices, not on the input sequence. If $A$ or $B$ depended on the input, the kernel would be different at every position, and you could not precompute it or apply it with an FFT.

For tasks like audio classification and long-range dependency benchmarks, where the model needs to integrate information uniformly over long contexts, fixed dynamics work well. For language modeling, where the model needs to selectively remember some tokens (the subject of a sentence, a variable binding, a key fact) and forget others (filler words, syntactic scaffolding), fixed dynamics are a limitation.

S4 and its variants (S4D, S5, H3, Hyena) achieved competitive but not state-of-the-art results on language modeling. They could match small Transformers but fell behind at scale. The gap was consistent enough to suggest a structural issue rather than a tuning problem.

## Mamba: Selective State Spaces

Mamba's key insight is clean enough to state in one sentence: make $B$, $C$, and $\Delta$ functions of the input.

In S4, the discretization step size $\Delta$ and the input matrix $B$ are learned parameters that are the same at every time step. In Mamba, they are computed from the input at each position via linear projections:

$$B_k = \text{Linear}_B(x_k), \quad C_k = \text{Linear}_C(x_k), \quad \Delta_k = \text{softplus}(\text{Linear}_\Delta(x_k))$$

The state update becomes:

$$x_k = \bar{A}_k x_{k-1} + \bar{B}_k u_k$$
$$y_k = C_k x_k$$

where $\bar{A}_k = \exp(\Delta_k A)$ and $\bar{B}_k$ also depends on $\Delta_k$.

This is a small change in notation and a large change in capability. The model can now modulate its dynamics at every position. When $\Delta_k$ is large, $\bar{A}_k$ decays more toward zero, effectively resetting the state and attending primarily to the current input. When $\Delta_k$ is small, $\bar{A}_k$ stays close to identity, and the state is preserved. $B_k$ controls how much of the current input is written into the state. $C_k$ controls what is read out.

Gu and Dao draw an explicit analogy to gating in RNNs. The input-dependent $\Delta$ acts like a forget gate: it controls how much of the past state survives. The input-dependent $B$ acts like an input gate: it controls how much of the current input is incorporated. The mechanism is different (continuous dynamics vs. sigmoid gating) but the functional role is the same: content-aware information routing.

The critical consequence is that the model loses the convolutional view. With input-dependent matrices, the kernel is different at every position, and the FFT trick no longer applies. Training Mamba requires computing the recurrence sequentially in some form.

## The Hardware-Aware Algorithm

This is where the paper becomes as much about systems engineering as about machine learning.

The naive sequential recurrence is slow on GPUs because GPUs are optimized for large matrix multiplications, not for sequential operations with small state dimensions. The state dimension in Mamba is typically $N = 16$, and the recurrence at each step involves multiplying a $16 \times 16$ matrix by a 16-dimensional vector. This is a tiny operation that vastly underutilizes GPU compute.

Gu and Dao solve this with a hardware-aware parallel scan algorithm. The key idea is that even though the recurrence is input-dependent (so you cannot use FFTs), it is still a linear recurrence (the state update is a linear function of the previous state). Linear recurrences can be parallelized using the associative scan (also called parallel prefix sum).

The recurrence $x_k = \bar{A}_k x_{k-1} + \bar{B}_k u_k$ can be written as an associative operation on pairs $(\bar{A}_k, \bar{B}_k u_k)$. The composition of two steps is:

$$(A_2, b_2) \circ (A_1, b_1) = (A_2 A_1, A_2 b_1 + b_2)$$

This operation is associative, which means you can compute the entire sequence of states in $O(\log L)$ sequential steps using a parallel scan, with $O(L)$ total work distributed across GPU cores.

But the parallel scan alone is not enough. The bottleneck in practice is memory bandwidth, not compute. The state matrices at each position must be materialized in GPU HBM (high-bandwidth memory), and the memory traffic dominates the runtime. Gu and Dao's implementation fuses the discretization, the scan, and the output projection into a single CUDA kernel that keeps the intermediate states in SRAM (fast, small, on-chip memory) and never materializes the full state sequence in HBM.

The result is a model that runs at near-Transformer speeds on modern GPUs despite computing a sequential recurrence. On an A100, Mamba's throughput is 3-5x higher than a Transformer of equivalent parameter count for sequence lengths above 2,048, and the gap widens with sequence length because the Transformer scales quadratically while Mamba scales linearly.

## The Language Modeling Results

The question that matters: does it actually work for language?

At the 1.4B parameter scale, Mamba matches or exceeds the performance of a Transformer++ baseline (a well-tuned Transformer with RMSNorm, SwiGLU, and no linear attention approximations) on the Pile, in terms of perplexity. At the 2.8B scale, Mamba matches a Transformer trained on roughly twice as many tokens. The scaling curves are roughly parallel, suggesting that Mamba is not just competitive at one scale but tracks the Transformer across scales.

On downstream zero-shot evaluations (HellaSwag, PIQA, WinoGrande, ARC, etc.), Mamba at 2.8B parameters matches or beats open-source Transformers at 2.8B and in some cases matches Transformers at 6.9B. The authors are careful to note that these are comparisons against open-source baselines, not against frontier models.

On long-context tasks, the advantage is more dramatic. Because Mamba's memory and compute scale linearly, it can process sequences of length 1 million without modification. The Transformer cannot, at least not without sparse attention approximations that introduce their own tradeoffs.

These results were enough to trigger a genuine wave of follow-up work. Mamba-2 (Dao & Gu, 2024) reformulated the selective SSM as a structured masked attention, establishing a formal connection between SSMs and attention. Jamba (AI21, 2024) interleaved Mamba layers with attention layers and MoE, reaching production scale. Several vision models adopted Mamba blocks (Vision Mamba, VMamba). The architecture crossed the threshold from interesting to practical.

## What I Think About This

I want to be precise about what these papers did and did not demonstrate.

What they demonstrated: there exists a sequence modeling architecture that scales linearly in sequence length, handles extremely long contexts natively, generates tokens in constant time per step (no growing KV cache), and matches the Transformer at moderate scale on language modeling benchmarks.

What they did not demonstrate: that this architecture will beat the Transformer at frontier scale. The Mamba paper's largest model is 2.8B parameters. Frontier models are 100x to 1000x larger. The scaling behavior could diverge. The Transformer might have inductive biases that become more valuable at extreme scale, or the SSM might have advantages that become more pronounced. We do not know.

The architectural intuition I find most interesting is the relationship between the SSM formulation and memory. Attention implements memory by keeping every past token's representation available and computing a content-based lookup at each step. The cost is $O(L)$ memory and $O(L)$ compute per step. The SSM implements memory by compressing the entire past into a fixed-size state vector. The cost is $O(N)$ memory and $O(N)$ compute per step, independent of sequence length. The tradeoff is between lossless, expensive memory (attention) and lossy, cheap memory (SSM).

This is a fundamental architectural choice, not a tuning decision. Attention remembers everything and pays for it. The SSM forgets strategically and benefits from it. Which strategy is better depends on the task. For tasks requiring precise recall of specific tokens from the distant past (retrieval, multi-hop reasoning, copying), attention has a structural advantage. For tasks requiring holistic integration of long contexts (summarization, audio modeling, time series), the SSM's compressed memory may suffice.

The hybrid architectures that interleave attention and SSM layers (Jamba, Zamba, Griffin) are an acknowledgment that neither strategy alone is optimal. Use cheap SSM layers for most of the computation, and insert a few attention layers where precise recall is needed. This is architecturally similar to how modern Transformers interleave dense and MoE layers: use cheap computation by default, expensive computation where it matters.

## The Connection to What I Care About

From an interpretability perspective, state space models present both challenges and opportunities. The challenge is that the compressed state is harder to inspect than attention weights. In a Transformer, you can look at the attention pattern and get a (crude, imperfect, frequently misleading) sense of which tokens the model is attending to. In an SSM, the "attention" is implicit in the state dynamics, and extracting which input positions contributed to the current state requires analyzing the product of many input-dependent matrices.

The opportunity is that the state is finite-dimensional and the dynamics are explicitly parameterized. In principle, you can trace information flow through the recurrence by tracking how the state vector evolves, applying techniques from dynamical systems analysis (Lyapunov exponents, singular value decomposition of the state transition matrices, probing the state at each step). The state is a bottleneck by design, and bottlenecks are useful for interpretability because they force the model to make explicit compression decisions.

I do not think anyone has done serious mechanistic interpretability work on Mamba-scale SSMs yet. The tools we have (SAEs, activation patching, circuit analysis) are all designed for Transformer architectures with discrete attention patterns and residual stream structure. Adapting them to the continuous state dynamics of an SSM is nontrivial but not impossible. It is on my list.

## The Bigger Picture

Every architecture paper I have reviewed in this series has been a variation on the same underlying problem: how do you build a function that maps a variable-length input sequence to a variable-length output sequence? RNNs used sequential recurrence. Transformers used parallel attention. SSMs use structured linear recurrence that admits both sequential and parallel computation.

The S4/Mamba lineage represents the first time since the Transformer that a fundamentally different computational primitive has been competitive on language modeling. Whether it ultimately displaces the Transformer, supplements it, or merges with it is an empirical question that will be answered by scaling experiments over the next few years. But the existence of a credible alternative is itself significant.

There is a parallel to the moment before the Transformer. In 2016, RNNs were the dominant architecture, but they had a known scaling bottleneck (sequential computation) and a known capability limitation (difficulty with long-range dependencies). The Transformer solved both. In 2024, the Transformer is the dominant architecture, and it has a known scaling bottleneck ($O(L^2)$ attention) and a known capability limitation (growing KV cache at inference). Mamba addresses both.

I wrote in my review of Attention Is All You Need that the question to ask about any new architecture is not "is this better?" but "is this better for the hardware we have and the hardware we are about to have?" The Transformer won because attention maps perfectly onto matrix multiplication, and GPUs are matrix multiplication engines. Mamba's parallel scan is also a good fit for GPUs, and as sequence lengths grow (multimodal models, long-document processing, genomics, continuous agents), the linear scaling becomes increasingly decisive.

The abstraction S4 introduced, treating sequence modeling as a discretized linear dynamical system with structured memory, may be the right abstraction even if Mamba's specific implementation gets replaced. Just as Transformer-XL's relative positional encoding outlived its segment-level recurrence, S4's HiPPO framework may outlive the specific DPLR decomposition. The abstractions survive. The implementations change.

*Tenth entry in the Paper Review series. Previous: Pixel Recurrent Neural Networks.*
