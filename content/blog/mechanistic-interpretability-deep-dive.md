---
title: "Mechanistic Interpretability: Reverse-Engineering the Alien Mind"
date: "2026-03-12"
excerpt: "We built the most powerful information processing systems in human history and we have no idea how they work. Mechanistic interpretability is the field trying to fix that by literally reverse-engineering neural networks neuron by neuron, circuit by circuit. Here's why I can't stop thinking about it."
tags: ["AI", "Interpretability", "Research", "Transformers", "Machine Learning"]
---

# Mechanistic Interpretability: Reverse-Engineering the Alien Mind

Fair warning: this post is long. Probably too long. Because mechanistic interpretability is the kind of field where every subproblem opens three more subproblems, and every result makes you rethink your assumptions about what computation even *means* inside a neural network. I have spent an embarrassing number of hours staring at activation patterns at 2 AM and I regret nothing.

## The Problem Statement

We have trained neural networks that can:
- Write poetry in the style of any author who ever lived
- Solve graduate-level mathematics
- Generate working code in dozens of programming languages
- Engage in multi-step causal reasoning about novel situations

And we have almost no mechanistic understanding of how they do any of it.

No other field of engineering works this way. Imagine Boeing shipping a 787 Dreamliner where nobody understood why the wings stayed on. That's where we are with AI. The models work. We can measure *that* they work. We cannot explain *how*.

![A visualization of neural network internals showing tangled feature representations across layers](https://media.springernature.com/lw1200/springer-static/image/art%3A10.1038%2Fsrep27755/MediaObjects/41598_2016_Article_BFsrep27755_Fig1_HTML.jpg)

Mechanistic interpretability (mech interp, for those of us who've said the full phrase too many times) is the project of changing this. The goal: **reverse-engineer the algorithms that neural networks learn**, expressed in terms of human-understandable computational primitives.

Not "the model is confident because attention score is high," that's behavioral observation. Mech interp wants the actual algorithm. The pseudocode. The circuit diagram.

## Why "Interpretability" Is the Wrong Word

I have a minor pet peeve about the name. "Interpretability" suggests we're trying to *interpret* a model, like reading tea leaves or doing literary analysis. That framing is dangerously soft.

What we're actually doing is **reverse engineering**. The same discipline that lets people decompile binaries, reconstruct proprietary chip designs, and figure out how the Stuxnet worm worked. We have an artifact (a trained neural network), and we're trying to recover the algorithm it implements.

The difference matters because reverse engineering has a *ground truth*. Either you've correctly identified the circuit that performs indirect object identification, or you haven't. Either your proposed mechanism predicts the model's behavior on held-out inputs, or it doesn't. This is science, not vibes.

Chris Olah, who is basically the patron saint of this field, frames it well: neural networks are programs written in a language we don't understand, compiled to weights we can't read. Mech interp is building the decompiler.

## The Computational Graph: What We're Actually Looking At

A transformer is, at its core, a computational graph. Being precise about the structure matters here (and I genuinely enjoy drawing these boxes in my head):

For a transformer with $L$ layers, $H$ attention heads per layer, and residual stream dimension $d_{model}$:

1. The **residual stream** $x^{(l)} \in \mathbb{R}^{T \times d_{model}}$ flows through the entire network. Every component reads from it and writes to it additively.

2. Each **attention head** $h$ at layer $l$ computes:

$$A^{(l,h)} = \text{softmax}\left(\frac{x^{(l)} W_Q^{(l,h)} (x^{(l)} W_K^{(l,h)})^\top}{\sqrt{d_k}}\right)$$

$$\text{head output} = A^{(l,h)} \cdot x^{(l)} W_V^{(l,h)} W_O^{(l,h)}$$

3. Each **MLP** at layer $l$ computes a nonlinear transformation, typically:

$$\text{MLP}^{(l)}(x) = \text{GELU}(x W_{in}^{(l)}) \cdot W_{out}^{(l)}$$

4. The residual stream update is purely additive:

$$x^{(l+1)} = x^{(l)} + \sum_h \text{head}^{(l,h)}(x^{(l)}) + \text{MLP}^{(l)}(x^{(l)})$$

This additive structure is *incredibly* important. It means every attention head and MLP layer writes its output into a shared communication channel. You can literally decompose the final logits as a sum of contributions from each individual component. This is called the **logit lens** decomposition, and it's one of the key tools in the mech interp toolkit.

![Diagram showing the residual stream architecture of a transformer with attention heads and MLPs writing additively](https://raw.githubusercontent.com/callummcdougall/computational-thread-art/master/example_images/misc/transformer-new.png)

## Features: The Atoms of Neural Computation

A claim that took me months to fully internalize:

> **The fundamental unit of neural network computation is not the neuron. It's the feature, a direction in activation space.**

This is the *linear representation hypothesis*, and it changes everything about what it means for a model to "know" something.

A neuron is just a basis vector in activation space. It's an arbitrary coordinate axis chosen by the initialization and training process. There is no reason to expect individual neurons to correspond to meaningful concepts, any more than you'd expect the x-axis of a room to point at something interesting.

Features, on the other hand, are *directions*, linear combinations of neurons. The "Golden Gate Bridge" feature Anthropic found in Claude isn't a single neuron; it's a direction in the residual stream that the model uses to represent the concept of the Golden Gate Bridge. When that direction has high magnitude, the model is "thinking about" the Golden Gate Bridge.

### The Geometry Gets Wild

This is where my brain starts making the good chemicals. Consider a model with $d_{model} = 4096$. In principle, it can represent 4096 orthogonal features perfectly. But the model needs to track *far* more concepts than that, potentially millions.

The **superposition hypothesis** (Elhage et al., 2022) explains how: the model packs features as *almost-orthogonal* directions. In high-dimensional space, you can fit exponentially many near-orthogonal vectors. Specifically, for vectors in $\mathbb{R}^d$, you can pack $\exp(O(d))$ unit vectors such that all pairwise dot products are bounded by $\epsilon$.

This is related to the **Johnson-Lindenstrauss lemma**, one of those results that feels like it shouldn't be true but is:

> Any set of $n$ points in high-dimensional space can be embedded into $O(\log n / \epsilon^2)$ dimensions while preserving all pairwise distances within a factor of $(1 \pm \epsilon)$.

The model exploits this. It represents millions of features as near-orthogonal directions in a 4096-dimensional space, accepting small interference. Since features are *sparse* (most concepts are irrelevant to most inputs), the interference rarely causes problems in practice.

I think this is genuinely cool. The model independently discovered a coding scheme that mathematicians spent decades formalizing.

## Circuits: Features Connected by Weights

Features alone are static, they tell you what the model represents, not how it computes. **Circuits** are the computational story: subgraphs of the network that connect features through weights to implement specific algorithms.

The canonical framework (Olah et al., 2020) proposes three claims:

1. **Features** are the fundamental units, directions in activation space with interpretable meaning
2. **Circuits** are subgraphs connecting features, they implement specific computations
3. Similar circuits appear across different models trained independently, a property called universality

That third claim is the interesting one. It suggests that there's something like a *periodic table of neural network circuits*, recurring computational motifs that any sufficiently trained model will converge on.

![Illustration of circuit-level analysis showing connected features across transformer layers](https://transformer-circuits.pub/2025/attribution-graphs/png/methods.png)

### The Induction Head: A Case Study in Alien Elegance

The **induction head** is the poster child of mechanistic interpretability, and honestly, it's one of the most satisfying results in all of deep learning research. I'm going to explain it in excruciating detail because it deserves it.

An induction head implements the following algorithm: "if token $A$ was followed by token $B$ earlier in the context, and token $A$ appears again, predict $B$."

This is a simple pattern-completion heuristic. But the way a transformer implements it is a masterclass in distributed computation:

**Step 1: Previous-token head (Layer $l_1$)**

An attention head in an early layer learns to attend from each token to the token *immediately before it*. Its attention pattern is just the identity matrix shifted by one position. The OV circuit copies information about token $B$ into the residual stream at position $B$, but tagged with the identity of the *preceding* token $A$.

**Step 2: Induction head (Layer $l_2$, where $l_2 > l_1$)**

A head in a later layer uses the QK circuit to search for previous positions where token $A$ appeared. But critically, it's not searching the original token embeddings, it's searching the *residual stream after the previous-token head wrote to it*. So when it queries "where did $A$ appear?", it finds positions where the previous-token head wrote "$A$ preceded me."

The OV circuit then copies the *current token at that position* (which is $B$) into the prediction.

This is a **two-step algorithm** distributed across two layers, communicating through the residual stream. Neither head alone can do the computation. The emergent behavior, in-context pattern completion, only arises from their composition.

The key mathematical object is the **QK composition**:

$$A_{induction} \propto \text{softmax}\left( x^{(l_2)} W_Q^{(l_2)} \left(W_K^{(l_2)}\right)^\top \left(W_{OV}^{(l_1)}\right)^\top \left(x^{(l_1)}\right)^\top \right)$$

The $W_{OV}^{(l_1)}$ factor inside the attention computation of the later head is what makes this a genuine *circuit*, it's composition through the residual stream.

Olsson et al. (2022) showed that induction heads are responsible for the **phase transition** in transformer training, the sharp drop in loss that occurs when two-layer attention models suddenly develop in-context learning. Before induction heads form, the model is essentially a bigram model. After, it can do in-context learning. The phase transition corresponds to the moment the QK composition term becomes large enough to dominate the attention pattern.

I've stared at those loss curves more times than I'm willing to admit.

## Activation Patching: The Causal Scalpel

Identifying a circuit is one thing. *Proving* it's causally responsible for a behavior is another. This is where **activation patching** (also called causal tracing) comes in, and it's conceptually one of the cleanest experimental paradigms in the field.

The setup:

1. Run the model on a **clean input** $x_{clean}$ and record all intermediate activations
2. Run the model on a **corrupted input** $x_{corrupt}$ (e.g., replace a key token with a random one)
3. Run the model on $x_{corrupt}$ again, but at a specific component $(l, h)$, **patch in** the activation from the clean run

If patching component $(l, h)$ recovers the model's performance on the task, that component is causally important.

Formally, let $F$ be the full model and $a^{(l,h)}$ be the activation of head $h$ at layer $l$. The patching effect is:

$$\Delta_{l,h} = F(x_{corrupt} \mid a^{(l,h)} \leftarrow a_{clean}^{(l,h)}) - F(x_{corrupt})$$

You can sweep this across all $(l, h)$ pairs and generate a heatmap of causal importance. The result is a circuit-level X-ray of the model.

![Heatmap of activation patching results showing which attention heads are causally important](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmoRwBRrVEH-hsd87SzEr5iXTfBpwZwsy4-Q&s)

### The IOI Circuit: Peak Mech Interp

The crown jewel of activation patching is the **Indirect Object Identification (IOI) circuit** discovered by Wang et al. (2023). They studied how GPT-2 Small handles sentences like:

> "When Mary and John went to the store, John gave a drink to **Mary**"

The model needs to figure out that "Mary" is the indirect object (the correct completion) and not "John" (the subject who already appeared as the actor). This requires tracking who did what to whom, a non-trivial computation.

They found a circuit involving **26 attention heads** across multiple layers, organized into functional groups:

| Component | Role | What it does |
|-----------|------|-------------|
| **Duplicate token heads** | Detect repeated names | Attend from the second occurrence of "John" to the first |
| **S-inhibition heads** | Suppress the subject | Reduce the logit of "John" (the repeated subject) |
| **Name mover heads** | Promote the answer | Increase the logit of "Mary" (the indirect object) |
| **Backup name mover heads** | Redundancy | Same function as name movers, activated when primary ones are ablated |

That last row kills me. The model has **backup circuits**. When you ablate the primary name mover heads, backup heads (which were doing almost nothing before) activate to compensate. The model learned *fault tolerance* from gradient descent alone. No one told it to do this. It just emerged as the optimal solution to the loss landscape.

## The Scaling Problem (or: Does Any of This Work on Real Models?)

The uncomfortable question that haunts the field: most of the clean results I just described were found in **tiny models**. GPT-2 Small (124M parameters). Two-layer attention-only transformers. Toy models trained on synthetic distributions.

Do these findings scale to frontier models? The honest answer is: *partially, and we're working on it*.

Anthropic's **Scaling Monosemanticity** work (Templeton et al., 2024) was the first major evidence that feature-level analysis transfers to large models. They trained sparse autoencoders on Claude 3 Sonnet and found interpretable features at scale, including multimodal features that respond to both text and images of the same concept.

But circuit-level analysis at scale remains extremely difficult. A model like Claude 3.5 Sonnet has:
- ~70 billion parameters (estimated)
- Hundreds of attention heads per layer
- Dozens of layers
- Residual stream dimensions in the thousands

The combinatorial space of possible circuits is astronomical. Manual analysis is out of the question. The field needs **automated circuit discovery**, algorithms that can identify the relevant subgraph for a given behavior without a human in the loop.

Some promising directions:

**Attribution patching** (Neel Nanda et al.), a linearized approximation of activation patching that's orders of magnitude faster. Instead of running the full model for every patch, you approximate the effect using gradients:

$$\Delta_{l,h} \approx \nabla_{a^{(l,h)}} F(x_{corrupt})^\top \cdot (a_{clean}^{(l,h)} - a_{corrupt}^{(l,h)})$$

This is a first-order Taylor expansion. It's not exact, but it correctly identifies the top components in practice, and it runs in time proportional to a single backward pass rather than $O(L \times H)$ forward passes.

**ACDC** (Automatic Circuit DisCovery), systematically prunes edges in the computational graph while monitoring task performance, converging on a minimal circuit.

**Transcoders**, a recent variant of sparse autoencoders that decompose the *MLP computation itself* (not just the activations), expressing each MLP as a sparse set of interpretable input-output feature mappings.

## The Residual Stream as a Communication Bus

One mental model that completely changed how I think about transformers (credit to Elhage et al., *A Mathematical Framework for Transformer Circuits*, 2021):

> **The residual stream is a communication bus, and attention heads are independent processors that read from and write to it.**

This isn't a metaphor. It's the literal mathematical structure. Each attention head:
1. **Reads** from the residual stream via $W_Q$ and $W_K$ (deciding *where* to attend)
2. **Reads** from the residual stream via $W_V$ (deciding *what information* to move)
3. **Writes** to the residual stream via $W_O$ (depositing the result)

Because all reads and writes are linear, you can analyze the information flow through **virtual weights**, the composition of weight matrices across layers. The effective QK circuit between head $h_1$ in layer $l_1$ and head $h_2$ in layer $l_2$ is:

$$W_{QK-composed} = W_Q^{(l_2, h_2)} \cdot W_O^{(l_1, h_1)} \cdot W_V^{(l_1, h_1)} \cdot (W_K^{(l_2, h_2)})^\top$$

This matrix tells you: "how much does the output of $h_1$ influence *where* $h_2$ attends?" You can literally read off the inter-head communication structure from these matrices.

I spent a very happy (some might say concerning) weekend computing these for every head pair in GPT-2 Small and visualizing the communication graph. The structure is not random. Specific heads consistently talk to specific other heads, forming functional clusters that map onto the circuits people have discovered through activation patching.

## What Features Have We Actually Found?

To get specific, the breadth of discovered features is frankly staggering:

**In language models:**
- Features for specific languages (French, Arabic, Python, etc.)
- Features for syntactic roles (subject, object, modifier)
- Features for named entities (specific people, places, companies)
- Features for emotional tone (sarcasm, formality, urgency)
- Features for reasoning modes (mathematical, causal, analogical)
- A feature that activates specifically for **text that is lying or being deceptive** (this one keeps me up at night)
- Features for code correctness, activating differently for valid vs. buggy code

**In vision models (the OG interpretability success story):**
- Curve detectors, edge detectors, texture detectors (early layers)
- Object part detectors, wheels, eyes, fur patterns (middle layers)
- Full object and scene detectors (late layers)
- "Multimodal neurons" that respond to both images and text of the same concept

![Feature visualization showing curve detectors, high-low frequency detectors, and complex texture features in vision models](https://distill.pub/2020/circuits/frequency-edges/images/high-low-hero.png)

The vision model features follow a clear hierarchy from low-level to high-level, which is satisfying in a way that language model features are not (language features are messier, more distributed, and less neatly hierarchical).

## My Current Obsession: Feature Geometry Under Quantization

*(Shameless plug for my own research direction)*

Something that's been eating at me: the entire mech interp toolkit assumes you're analyzing the model in **full precision** (FP32 or BF16). But deployed models are increasingly quantized: INT8, INT4, sometimes even lower. When you quantize a model, you're perturbing every weight by a small amount:

$$W_{quant} = W + \Delta W, \quad ||\Delta W|| \sim O(\epsilon_{quant})$$

The question: **do the features survive?**

If features are directions in activation space, and quantization perturbs the weight matrices that define those directions, then quantization is a perturbation to the feature geometry. For INT8 ($\epsilon \sim 10^{-3}$), the perturbation is small and features are mostly preserved. For INT4 ($\epsilon \sim 10^{-1}$), you're introducing genuinely large perturbations.

My preliminary results suggest that:
- **High-activation features** (the ones that fire strongly and frequently) are resilient to INT4 quantization
- **Low-activation features** (sparse, subtle features) can drift or collapse entirely
- The features most vulnerable to quantization are precisely the ones mech interp cares about most, the subtle, compositional features involved in complex reasoning

This has uncomfortable implications. If your safety-relevant features (the ones detecting deception, harmful intent, etc.) are low-activation features, and you deploy a quantized model, you might have silently destroyed the features your interpretability tools rely on to monitor the model.

I'm currently running SAEs on both full-precision and INT4 versions of Llama 3 8B and comparing the feature dictionaries. More to come.

## The Existential Stakes
I'll end on why this matters beyond academic curiosity.

We are building increasingly powerful AI systems. The capabilities curve is steep and shows no sign of flattening. Within the next few years, we will likely have AI systems that can autonomously write code, conduct research, and take actions in the real world.

If we cannot understand *what these systems are doing internally*, we are flying blind. RLHF and constitutional AI are behavioral constraints, they shape what the model *says*, not what it *thinks*. A sufficiently capable model that has learned to pass behavioral tests while pursuing misaligned internal goals would be undetectable by behavioral methods alone.

The gap between our ability to build powerful AI and our ability to understand it is growing. Mech interp is one of the only fields directly trying to close it. The tools are open source (TransformerLens, SAELens, Baukit) and Neel Nanda's ARENA curriculum teaches the whole stack from scratch.

*I'm researching feature stability under quantization at UdeM/MILA. If you work on this stuff, reach out.*
