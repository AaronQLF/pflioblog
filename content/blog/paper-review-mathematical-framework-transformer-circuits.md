---
title: "Paper Review: A Mathematical Framework for Transformer Circuits"
date: "2026-04-26"
excerpt: "Standalone deep dive on Elhage et al. (2021), the paper that founded mechanistic interpretability as a discipline. They reframe attention into QK and OV circuits, treat the residual stream as a communication channel, and show that two attention layers are enough to grow induction heads. Almost every later mech interp result lives inside the vocabulary this paper invented."
tags: ["Paper Review", "AI", "Interpretability", "Research", "Transformers"]
---

# Paper Review: A Mathematical Framework for Transformer Circuits

I cite this paper more than any other in mechanistic interpretability conversations. Not because the results are the most impressive in the field, and not because the experiments are the most rigorous, but because the *vocabulary* it introduced is the vocabulary that every subsequent mech interp paper has used. The QK circuit. The OV circuit. The residual stream as a communication channel. Virtual weights. Induction heads. Path expansion. K-composition. These are not generic terms. They are the terms Elhage et al. (2021) invented in this single paper, and they are now the lingua franca.

"A Mathematical Framework for Transformer Circuits" (Elhage, Nanda, Olsson, Henighan, Joseph, Mann, Askell, Bai, Chen, Conerly, DasSarma, Drain, Ganguli, Hatfield-Dodds, Hernandez, Jones, Kernion, Lovitt, Ndousse, Amodei, Brown, Kaplan, McCandlish, Olah, Hume; Anthropic, December 2021) is a foundational document in the same way that "Attention Is All You Need" is foundational. The Vaswani paper introduced the architecture. This paper introduced the way we *talk about* the architecture when we want to reason about what it computes. If you are doing serious interpretability work, you are using this framework, whether you have read the paper or not.

I want to spend this review walking through the math carefully, because most secondary treatments skip the tensor-product reformulation that does most of the work. I also want to be honest about what the paper does not do, since it has been somewhat retroactively credited with results that came later.

## What the Paper Actually Proposes

The thesis is simple. If you want to reverse-engineer a transformer, do not start with GPT-3. Start with the smallest model where the mathematical structure is still recognizably a transformer, and work up. The paper studies three families:

1. **Zero-layer transformers**, which are just an embedding followed by an unembedding.
2. **One-layer attention-only transformers**, with a single attention block and no MLP.
3. **Two-layer attention-only transformers**, with two attention blocks composed through the residual stream.

The "attention-only" qualifier is doing a lot of work. The authors strip out MLPs, biases, and layer normalization. They argue (correctly) that biases can be folded into weights, that layer norm is approximately a constant affine transformation that can be merged into adjacent matrices, and that MLPs are the part of the transformer they have least traction on. They are explicit that this is a major limitation. The paper is upfront that the framework is a starting point, not a finished theory.

What they get, in exchange for those simplifications, is a model class where every parameter has a direct interpretation in terms of behavior. Not a hand-wavy interpretation. A literal mathematical correspondence: this matrix entry is this skip-trigram probability. The "contextualization problem" of neural network weights is dissolved by sufficient algebraic manipulation. That is the contribution.

## Reframing Attention: The Tensor-Product Form

Most papers describe attention in three steps:

1. Compute value vectors $v_i = W_V x_i$ from each token's residual stream vector $x_i$.
2. Compute result vectors as a weighted sum across positions: $r_i = \sum_j A_{ij} v_j$.
3. Compute the head output $h(x)_i = W_O r_i$.

This is fine for implementation. It is bad for analysis. The reason is that two of these three steps mix per-token information with cross-token mixing, and the structure of how they interact gets buried in indices.

Elhage et al. rewrite the entire attention head as a single tensor expression. If you treat $x$ as a $[n_\text{context}, d_\text{model}]$ matrix (one residual stream vector per row), then the three steps become three tensor-product factors:

$$h(x) ~=~ (\text{Id} \otimes W_O) \cdot (A \otimes \text{Id}) \cdot (\text{Id} \otimes W_V) \cdot x$$

The convention is that the left side of each tensor product acts on the position dimension and the right side acts on the model dimension. So $A \otimes \text{Id}$ is "mix across positions, do nothing per token," while $\text{Id} \otimes W_V$ is "do nothing across positions, multiply each token by $W_V$." Reading right to left, we are computing values per token, mixing them with the attention pattern, and projecting them out.

The key observation: matrix products on opposite sides of a tensor product commute. Using the mixed-product property $(A_1 \otimes B_1)(A_2 \otimes B_2) = (A_1 A_2) \otimes (B_1 B_2)$, the three factors collapse into one:

$$h(x) ~=~ (A \otimes W_O W_V) \cdot x$$

Define $W_{OV} = W_O W_V$ and we get the cleanest possible statement of what an attention head does:

$$h(x) ~=~ (A \otimes W_{OV}) \cdot x$$

Two operations. One mixes across positions according to the attention pattern $A$. The other applies the same low-rank linear map $W_{OV}$ to every token. They are completely independent of each other.

The same trick works for the attention pattern. The standard formulation computes keys, queries, dot products, and softmax. But you can collapse all of that into

$$A ~=~ \text{softmax}\!\left(x^T W_Q^T W_K x\right) ~=~ \text{softmax}\!\left(x^T W_{QK} x\right)$$

with $W_{QK} = W_Q^T W_K$. The keys, queries, and values are *intermediate artifacts* of an efficient implementation. The mathematical objects that actually determine head behavior are the two low-rank matrices $W_{OV}$ and $W_{QK}$. You could reparametrize $W_Q$ and $W_K$ in any factorization of $W_{QK}$ and the model would behave identically.

This is the move that unlocks everything else in the paper. Once you stop thinking of attention as "queries, keys, and values" and start thinking of it as "two low-rank matrices acting on opposite sides of a tensor product," the rest of the framework writes itself. A few consequences worth naming:

- Each attention head reads from $\text{rank}(W_{QK}) \leq d_\text{head}$ dimensions of the residual stream for the QK side and $\text{rank}(W_{OV}) \leq d_\text{head}$ dimensions for the OV side. Both are tiny compared to $d_\text{model}$.
- The QK and OV circuits read from and write to *separable* subspaces, given by the singular vectors of $W_{OV}$ and $W_{QK}$.
- The attention pattern $A$ is the only nonlinearity. If you freeze $A$, the entire head is a linear function of $x$.

The paper exploits this last point relentlessly. The "freezing attention patterns trick" lets you do path expansion as if the entire model were linear, which is what makes the rest of the framework tractable.

## The Residual Stream as a Communication Channel

The other foundational reframing is the residual stream. In the standard description, a transformer has hidden states that are updated layer by layer. Elhage et al. invert that picture. Instead of thinking of the residual stream as a sequence of hidden states, think of it as a single shared communication bus that every component reads from and writes to.

![Residual stream architecture diagram showing attention heads and MLPs writing additively into a shared linear bus](https://raw.githubusercontent.com/callummcdougall/computational-thread-art/master/example_images/misc/transformer-new.png)

Mathematically, the update rule is purely additive:

$$x^{(\ell+1)} ~=~ x^{(\ell)} + \sum_h h^{(\ell)}(x^{(\ell)}) + \text{MLP}^{(\ell)}(x^{(\ell)})$$

The original embedding $W_E t$ is the initial state. Every attention head and every MLP adds its output back into the same vector space. The unembedding $W_U$ reads the final state out.

There are two structural facts about this that have huge interpretive consequences.

**The residual stream is fully linear.** No nonlinearities are applied to the bus itself. Reads and writes are linear projections. This is unusual: even ResNets apply nonlinearities to the residual stream when they are accessed. In a transformer, the residual stream is a strictly linear additive channel.

**The residual stream has no privileged basis.** You can rotate the basis by any orthogonal matrix $Q$, and as long as you correspondingly rotate every weight matrix that reads from or writes to it, the model behaves identically. The implication is that individual neurons (basis vectors) of the residual stream do not need to mean anything. Features can live in arbitrary directions.

The combination is what enables the entire concept of *virtual weights*. If you want to know how a layer-1 head $h_1$ influences a layer-2 head $h_2$, you do not need to trace gradients or run interventions. You can just multiply the relevant matrices together. The effective weight from $h_1$'s output to $h_2$'s key projection is

$$W_{K, \text{virtual}}^{h_1 \to h_2} ~=~ W_K^{h_2} W_O^{h_1}$$

This is a real matrix that exists in the weights. It tells you the literal linear map by which one head's output determines another head's reads. You can compute it. You can take its singular value decomposition. You can ask whether it is large or small. The residual stream's linearity makes inter-component communication a closed-form algebraic question rather than a behavioral one.

Two consequences I find genuinely cool. The first is the *bandwidth* observation: a typical transformer has many more computational dimensions (neurons, head outputs) than the residual stream has dimensions. A 50-layer model with $d_\text{model} = 4096$ has, by layer 25, around $100 d_\text{model}$ worth of upstream computational dimensions all trying to communicate through the same 4096-dimensional bus. This is the structural pressure that motivates *superposition*: features must share dimensions because there are not enough dimensions to go around. The framework paper does not develop superposition (that comes a year later in Elhage et al. 2022, "Toy Models of Superposition"), but it points at it directly.

The second is *memory management*. If the residual stream accumulates writes additively, components must be able to delete information they no longer want. The paper notes that some attention heads have large negative eigenvalues in $W_{OV}$ and primarily attend to the current token. Functionally, these heads read out a quantity from the present residual stream and write back its negation, erasing it. Some MLP neurons do the same thing, with very negative cosine similarity between input and output weights. Memory management is not something anyone trained these heads to do. It is just what the optimization landscape requires when the residual stream is a shared bottleneck.

## Zero-Layer Transformers: Bigram Statistics in Closed Form

The simplest case is also the cleanest. A zero-layer transformer applies an embedding and an unembedding with nothing in between:

$$T ~=~ W_U W_E$$

The logits for predicting the next token from the present token are an explicit $[n_\text{vocab}, n_\text{vocab}]$ matrix. Optimization will set this matrix to approximate the bigram log-likelihoods of the training distribution. The entry $T_{ij}$ is, up to a normalization, the log-probability that token $j$ follows token $i$.

This is not a deep result. It is a sanity check. But it has a useful corollary: in any deeper transformer, the term $W_U W_E$ persists as the *direct path* through the residual stream that does not go through any attention head or MLP. It always contributes to the logits. In larger models, it does not need to encode the full bigram table because attention heads and MLPs handle most of the patterns, but it tends to fill in the lexical idiosyncrasies that grammar cannot derive: the fact that "Barack" is followed by "Obama," or that "ipsum" comes after "lorem." The direct path is the bigram residual.

There is also a fun aside in the paper: this $W_U W_E$ factorization mirrors Levy and Goldberg's (2014) result that classical word embeddings can be reconstructed as matrix factorizations of pointwise mutual information. A zero-layer transformer is, mathematically, the same object as a word embedding learned by SGNS. The transformer architecture contains the word embedding model as a degenerate case.

## One-Layer Attention-Only Transformers: An Ensemble of Skip-Trigrams

The first interesting case. A one-layer attention-only transformer has the structure: embed, run an attention layer, unembed. Using the tensor-product form, the logits are

$$T ~=~ \big(\text{Id} \otimes W_U W_E\big) ~+~ \sum_{h} A^h \otimes \big(W_U W_{OV}^h W_E\big)$$

This is the path expansion. Take the product of layer transformations and expand it as a sum, where each summand corresponds to an end-to-end *path* through the model. The first term is the direct path, identical to the zero-layer case. Every other term corresponds to attention head $h$ moving information across positions.

For each attention head, there are two big matrices that fully describe its behavior:

- The **OV circuit** $W_U W_{OV}^h W_E \in \mathbb{R}^{n_\text{vocab} \times n_\text{vocab}}$ tells you, if a given source token is attended to, how the head's output modifies the logits for the next token.
- The **QK circuit** $W_E^T W_{QK}^h W_E \in \mathbb{R}^{n_\text{vocab} \times n_\text{vocab}}$ tells you, given a destination token (query) and a source token (key), how strongly the destination wants to attend to the source.

These are real matrices that you can compute from the weights and inspect entry by entry. Together they encode a *skip-trigram*: a triple of the form `[source token] ... [destination token] → [output token]`. The destination token decides where to attend (via QK), the source token at that position contributes its OV signature, and the head's contribution to the next-token logits is read off from the OV circuit.

The interpretation is sharp. The model is, formally, an ensemble: a bigram base (the direct path) plus a sum of skip-trigram tables (one per head). Each head's full behavior is captured by two `vocab × vocab` matrices that you can construct by multiplying out the weights. There is no mystery. You have transformed neural network parameters into entries of an interpretable lookup.

The catch is scale. With a vocabulary of 50,000 tokens, each OV or QK circuit has 2.5 billion entries. The paper calls a one-layer model a *compressed Chinese room*: every card in the lookup is now legible, but there are too many cards to read. Interpretation becomes a question of summarizing these matrices, not of decoding them.

A few techniques the paper develops for that summarization:

**Eigendecomposition for copying detection.** A natural class of behavior to look for is *copying*: an OV circuit that, when a token is attended to, increases the probability of that same token. Mathematically, this corresponds to the OV matrix $W_U W_{OV}^h W_E$ having positive real eigenvalues, since copying is the property that a token (as a one-hot vector) is mapped to a positive multiple of itself in logit space. Random matrices of comparable shape have eigenvalues distributed roughly symmetrically about zero in the complex plane (similar to the Ginibre ensemble). Trained OV matrices have a strong positive-real bias. The paper reports that 10 of 12 heads in their small one-layer model have eigenspectra dominated by positive real eigenvalues, and qualitative inspection confirms these are copying heads.

The biological metaphor I keep using: copying heads are how a single attention layer implements its crude version of in-context learning. The QK circuit attends to tokens that are plausibly the next token, and the OV circuit then increases their probability. It is essentially a learned bigram-conditioned lookup with a bias toward repeating tokens that already appeared.

**Skip-trigram bugs.** The factored form has a structural limitation. A single head's contribution to the joint distribution over `(source, destination, output)` factorizes as $f(a, b, c) = f_\text{QK}(a, b) \cdot f_\text{OV}(a, c)$. It cannot represent arbitrary three-way interactions. If a head increases the probability of `keep ... in mind` and `keep ... at bay`, it must also increase the probability of `keep ... in bay` and `keep ... at mind`. The paper shows real examples of these compositional bugs in trained models. They are presumably a tolerable cost on average, but they are visible if you go looking.

This is one of my favorite parts of the paper, because it shows the framework predicting *failure modes* of the architecture. A theory of how a model works has to be falsifiable, and "this kind of cross-product bug should appear in the weights" is the sort of prediction that distinguishes a real framework from a vibes-based interpretation.

## Two-Layer Attention-Only Transformers: Composition

A two-layer model has the same structure as a one-layer model, twice. The naive expectation is that you just get more skip-trigrams. The interesting fact is that you get something qualitatively different: *composition between heads*.

The mechanism is the residual stream. By the time the second-layer attention block runs, the residual stream contains contributions from the first-layer heads. So when the second layer's QK and OV circuits read from $x^{(1)}$, they are reading from a vector that depends on what first-layer heads wrote.

The paper formalizes three flavors of composition, named by which input weight of a second-layer head reads from a first-layer head's output:

- **Q-composition**: $W_Q^{h_2}$ reads from a subspace that $W_O^{h_1}$ writes to. The query of $h_2$ depends on what $h_1$ moved.
- **K-composition**: $W_K^{h_2}$ reads from a subspace that $W_O^{h_1}$ writes to. The key of $h_2$ depends on what $h_1$ moved.
- **V-composition**: $W_V^{h_2}$ reads from a subspace that $W_O^{h_1}$ writes to. The value of $h_2$ depends on what $h_1$ moved.

Q- and K-composition are qualitatively different from V-composition. Q- and K-composition affect the *attention pattern*: they let the second-layer head attend based on information that was moved by the first layer, which is strictly more expressive than attending based on token identity alone. V-composition affects only what gets moved when the head attends, which produces *virtual attention heads* (discussed in the next section).

To detect composition empirically, the paper measures Frobenius-norm ratios such as

$$\text{KComp}(h_1, h_2) ~=~ \frac{\|W_{QK}^{h_2} W_{OV}^{h_1}\|_F}{\|W_{QK}^{h_2}\|_F \cdot \|W_{OV}^{h_1}\|_F}$$

with the analogous quantities for Q- and V-composition, and a baseline subtraction for the expected ratio under random matrices. In small two-layer models, most pairs show negligible composition, with a small number of pairs showing K-composition specifically. The paper's detailed analysis focuses on a model where exactly one first-layer head K-composes with several second-layer heads.

Path expansion of the second-layer attention scores is more involved than the one-layer case. The QK circuit for a second-layer head is no longer $W_E^T W_{QK}^h W_E$. It is $x^{(1) T} W_{QK}^h x^{(1)}$, with $x^{(1)} = W_E + \sum_{h_1} A^{h_1} \otimes W_{OV}^{h_1} W_E$ (loosely). Expanding the product gives a tensor expression with one term per pair of paths, each of the form $A_q \otimes A_k \otimes W$ where $A_q$ is the attention pattern moving information on the query side, $A_k$ does the same on the key side, and $W$ is a `vocab × vocab` matrix describing how the two sides combine into an attention score. The path expansion is now a six-dimensional tensor sum, but each term is still a separable, interpretable object.

## Induction Heads: The Crown Jewel

The reason any of this matters for actual transformers is that two-layer composition produces a specific, identifiable algorithm: the *induction head*. Induction heads are the canonical demonstration that the framework can do real reverse engineering, not just pretty algebra.

The behavior to explain. An induction head implements the rule:

> If the current token is $A$, and earlier in the context there was a sequence $A B$, predict $B$ next.

This is the simplest possible form of in-context pattern matching. It works on any pair of tokens, including completely random ones, which is what makes it qualitatively stronger than the one-layer copying heuristic. The one-layer copy head says "predict tokens that have already appeared and could plausibly come next." The induction head says "predict the token that *specifically followed this same token* earlier in the context." The two-layer version is making a much more confident, context-sensitive bet.

The mechanism, mathematically. The paper finds that the canonical implementation uses two heads with pure K-composition, no Q- or V-composition needed.

**Layer 1: previous-token head.** A first-layer head $h_1$ learns an attention pattern that is approximately a shifted identity: each position attends to the position immediately before it. The exact shape depends on positional encoding details. The OV circuit copies the source token's identity into the residual stream at the destination position. After this head runs, the residual stream at position $i$ contains, in some subspace, a representation of "the token at position $i-1$ was $X$." Call this the "prefix tag."

**Layer 2: induction head.** A second-layer head $h_2$ has a key projection $W_K^{h_2}$ that reads from the subspace where $h_1$ wrote the prefix tag. The effective QK circuit, after K-composition, is:

$$C_{QK}^{h_2, \text{eff}} ~=~ W_E^T \, W_{QK}^{h_2} \, W_{OV}^{h_1} \, W_E$$

What does this matrix encode? The query side reads the current token through $W_E$. The key side reads, via $W_{OV}^{h_1} W_E$, the prefix tag that was written by $h_1$ at each prior position. The dot product is large at positions where the *prefix tag matches the current token*. In other words, the head attends back to positions where the previous token matches the current token.

Once the head has attended to such a position, $W_{OV}^{h_2}$ reads out the token at that position (which, by construction, is the token that *followed* the previous instance of the current token) and writes it into the next-token logits. The result is the induction-head behavior.

A few features of this construction worth noting:

- It is *pure K-composition*. Q-composition is unnecessary because the query is just the current token's identity. V-composition is unnecessary because the value just needs to copy the source token. Only the key needs to be informed by what the first-layer head wrote.
- It requires two layers, structurally. The previous-token tagging has to happen before the induction head can read it. There is no way to compress this into a single attention layer, because you cannot attend based on "the token before this position" without first running a head that moves that information into the right place.
- It generalizes to arbitrary token pairs because the QK circuit operates on prefix tags, not on bigram statistics. The model does not need to have seen $A B$ before. It only needs to see $A B$ once in context, and then a second occurrence of $A$ will trigger the prediction $B$.

I have written about induction heads before, in the [mechanistic interpretability deep dive](/blog/mechanistic-interpretability-deep-dive). The framework paper is where the math actually lives. The follow-up paper, Olsson et al. (2022), then showed that induction heads explain the famous in-context learning phase transition during transformer training: the sharp drop in loss that happens when two-layer composition develops. Before induction heads form, the model is essentially a one-layer skip-trigram ensemble. After they form, it can do in-context pattern matching. The phase transition is the moment K-composition becomes large enough to dominate the second-layer attention pattern.

## Virtual Attention Heads

V-composition is the third flavor, and it produces something that I find conceptually beautiful even though it is empirically rare in small models.

When two attention heads compose through values, the product of their tensor expressions simplifies:

$$(A^{h_2} \otimes W_{OV}^{h_2}) \cdot (A^{h_1} \otimes W_{OV}^{h_1}) ~=~ (A^{h_2} A^{h_1}) \otimes (W_{OV}^{h_2} W_{OV}^{h_1})$$

This product *is itself* an attention head, with attention pattern $A^{h_2} A^{h_1}$ and OV circuit $W_{OV}^{h_2} W_{OV}^{h_1}$. The paper calls these **virtual attention heads**. They are the genuine algebraic objects that V-composition creates, not metaphors. A two-layer model has $H \cdot H$ virtual heads in addition to its $2H$ real heads, and each one computes a chained attention operation.

The interpretive picture is striking. Virtual heads can attend to attended positions of attended positions: the composed pattern $A^{h_2} A^{h_1}$ is a two-step random walk through the attention graph. This generalizes in the obvious way to deeper models: an $L$-layer transformer has $H^L$ virtual heads of depth $L$, plus all the lower-depth virtual heads from intermediate compositions, plus the direct paths. The full computational graph is enormous, but every term in the path expansion is structurally just an attention head, and you can apply the same QK/OV analysis to each one.

In the small two-layer model the paper analyzes, V-composition is empirically negligible. The model uses its second-layer slots for K-composed induction heads and for additional skip-trigram heads, not for V-composed virtual heads. The paper speculates that V-composition becomes more important at scale, but does not test this. I am not sure anyone has cleanly tested it since.

## Limitations the Paper Is Honest About

It is worth being precise about what this paper does *not* claim or show, because I see people overcrediting it.

**No MLPs.** The framework is for attention-only transformers. The authors are explicit that MLPs are the part of the architecture they have least traction on. Most of the parameters and most of the computation in a real transformer live in MLP layers. Anything you derive about attention-only models is, at best, a partial description of how a real model works. The follow-up SAE work (Bricken et al. 2023, Templeton et al. 2024) is in some sense the field's attempt to do for MLPs what this paper did for attention.

**No layer norm.** Layer norm is folded into adjacent matrices "up to a variable scaling," which is a bit of a hand-wave. In practice, layer norm has nontrivial effects on which directions in the residual stream are amplified or suppressed, and these effects are token-dependent. The framework as written ignores them.

**Two layers only.** Three-layer attention-only models are not analyzed, and the path expansion grows fast: the number of distinct paths through the model is exponential in depth. Whether the framework remains tractable beyond two layers is an open methodological question. The authors gesture at virtual heads as the natural generalization but do not work it out.

**Skip-trigram bugs.** As discussed, the factored form has structural representational limitations. These limitations may be unimportant in larger models because MLPs and additional heads can compensate, but the framework itself does not explain how that compensation works.

**The framework is a *theory*, not an experimental contribution.** The paper does not run scaling experiments. It does not benchmark anything. It presents detailed analyses of two specific small models. The empirical claim is "we can read off the algorithms these specific small models implement." The generalization to larger models is a hypothesis that the next paper (Olsson et al. 2022) had to defend separately.

I think the limitations are appropriate for what the paper sets out to do. I am only flagging them because retrospective coverage sometimes treats this as the paper that solved interpretability, which it is not. It is the paper that gave interpretability a coherent mathematical vocabulary. The application of that vocabulary to real models is still ongoing.

## Why This Paper Aged So Well

Almost every major mech interp result of the last four years operates inside the vocabulary this paper introduced.

**Olsson et al. (2022), "In-Context Learning and Induction Heads."** Shows that the induction-head construction described here generalizes to large models, that induction heads form during a phase transition in training, and that this phase transition coincides with the emergence of in-context learning. This paper is essentially the empirical companion to the framework paper.

**Wang et al. (2023), "Interpretability in the Wild" (the IOI circuit paper).** Reverse-engineers a 26-head circuit in GPT-2 Small that handles indirect object identification. The whole methodology, attribution to specific QK and OV circuits, composition diagrams, residual stream analysis, is built on the framework's vocabulary.

**Bricken et al. (2023), Templeton et al. (2024), and the broader SAE literature.** Extends the residual-stream-as-communication-channel picture to features (directions in residual stream space) and uses sparse coding to recover them. The framework's claim that the residual stream has no privileged basis is precisely why SAEs are needed: the meaningful features live in arbitrary directions, not on coordinate axes.

**Modern circuit-finding tools** like activation patching, attribution patching, ACDC, transcoders, and the recent attribution-graphs work (Anthropic 2025) are all extensions of the path expansion idea. They are looking for specific paths through the model that account for specific behaviors. The framework paper is what taught the field to think about transformers as a sum over paths in the first place.

![Methods diagram from the Anthropic attribution graphs work, showing how circuit analysis composes the QK/OV vocabulary across many layers and heads](https://transformer-circuits.pub/2025/attribution-graphs/png/methods.png)

I wrote in my review of [Attention Is All You Need](/blog/paper-review-attention-is-all-you-need) that the architectural ideas that endure are the ones that identify the right *abstractions*, not the ones that lock in specific implementations. The same is true in interpretability theory. Elhage et al. did not invent any new mathematical machinery. Tensor products, low-rank factorizations, eigendecomposition, path expansion: all standard. What they did was identify which of these tools were the right tools for transformers, and apply them with enough rigor that the resulting framework is still the framework being used four years later.

## What I Think About This

A few things I keep coming back to.

**It is a *mathematical* framework, not a behavioral one.** The paper does not say "attention heads tend to attend to similar tokens." It says "the attention pattern is a softmax of $x^T W_{QK} x$ and you can read $W_{QK}$ off the weights." That difference is not stylistic. It is the difference between a behavioral observation and an actual reverse-engineering. A theory of transformer computation has to be expressible in closed form against the weights, or it is not really a theory.

**Reverse engineering implies ground truth.** If you claim that head $(l, h)$ is an induction head, that is a falsifiable claim. You can measure $C_{QK}^{h, \text{eff}}$. You can ablate the previous-token head and check that the induction head's behavior degrades. You can look at the eigenstructure of the OV circuit and check that it is a copy. The framework gives you tools that produce predictions, and the predictions can be wrong. This is what makes mech interp a science rather than a hermeneutic.

**The bottleneck reframing matters for everything downstream.** Once you accept that the residual stream is a bandwidth-limited shared bus, every architectural choice in a transformer becomes a bandwidth-allocation question. Which subspaces does each head read from and write to? How much of the residual stream is occupied by token identity, by positional information, by intermediate computations? Superposition, polysemanticity, feature splitting, all of these phenomena are downstream of the basic bandwidth picture.

**Connection to my own research.** I have been working on feature stability under quantization (see my [SAE post](/blog/sparse-autoencoders-llm-features) and the [mech interp deep dive](/blog/mechanistic-interpretability-deep-dive)). The framework paper is foundational here in a way that is easy to underestimate. When you quantize a model, you perturb $W_Q$, $W_K$, $W_V$, $W_O$ separately. But the *behaviorally relevant* matrices are $W_{OV} = W_O W_V$ and $W_{QK} = W_Q^T W_K$. Perturbations to the factors do not perturb the products independently. There is correlated structure in how quantization noise propagates through the OV and QK circuits, and that structure is invisible if you do not have the framework's parameterization in mind. I do not think anyone has done a serious analysis of quantization-induced perturbations in the QK/OV space yet. It is on my list.

## Closing

Mechanistic interpretability is the project of reverse-engineering neural networks into human-readable algorithms. Before this paper, that project had vision-model precedent (the Distill Circuits thread on InceptionV1) but no analogous framework for transformers. Different researchers used different vocabularies. Concepts like the residual stream, the QK and OV circuits, the path expansion, virtual weights, K-composition, and induction heads either did not exist as named objects or were scattered across different conventions.

The framework paper consolidated all of this into one coherent algebraic picture and demonstrated, on small models, that the picture was sufficient to actually reverse-engineer specific circuits end to end. It did not claim more than that. It did not need to. Almost every subsequent result in the field was built on the vocabulary this paper introduced, and the few that were not have generally needed to reinvent some piece of it.

When people ask me what the canonical mech interp paper is, I send them this one. Not because it is the most polished or the most empirically ambitious paper in the field, but because it is the one where the language we still speak was first written down.

*Standalone deep dive. If you want the broader landscape, see my [mechanistic interpretability deep dive](/blog/mechanistic-interpretability-deep-dive) and [sparse autoencoders post](/blog/sparse-autoencoders-llm-features). If you want to keep going on transformers, the [Attention Is All You Need](/blog/paper-review-attention-is-all-you-need) and [Transformer-XL](/blog/paper-review-transformer-xl) reviews are the architectural prerequisites.*
