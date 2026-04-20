---
title: "Computation in Superposition"
date: "2026-04-20"
excerpt: "The superposition hypothesis explains how models store more concepts than they have dimensions. The harder question, and the one nobody has a clean answer to, is how they compute on those superposed representations without everything interfering with everything else."
tags: ["AI", "Interpretability", "Research", "Machine Learning"]
---

I have written about superposition before in the context of sparse autoencoders and feature discovery. The superposition hypothesis, that neural networks encode far more features than they have dimensions by packing them as near-orthogonal directions, is one of the most important ideas in mechanistic interpretability. But the version of superposition that gets discussed most often is about storage. How the model represents information. That is only half of the problem.

The harder half is computation. The model does not just store features in superposition. It performs nonlinear operations on them. And those operations create interference terms that are structured, consequential, and largely invisible to current interpretability tools.

## The storage picture

A quick recap. A transformer with residual stream dimension $d_{model}$ can perfectly represent $d_{model}$ orthogonal features. But the model needs to track far more features than that, potentially millions. The Johnson-Lindenstrauss lemma tells us that in high-dimensional space, you can pack exponentially many near-orthogonal vectors with bounded pairwise interference. If feature $f_i$ is encoded as direction $\hat{e}_i$ and feature $f_j$ as direction $\hat{e}_j$, with $\hat{e}_i \cdot \hat{e}_j = \epsilon_{ij} \approx 0$, then reading out feature $f_i$ from a superposed activation $x = \sum_k \alpha_k \hat{e}_k$ gives you:

$$\hat{e}_i \cdot x = \alpha_i + \sum_{k \neq i} \alpha_k \epsilon_{ik}$$

The first term is the true activation. The second is noise from all other features. When features are sparse, meaning most $\alpha_k = 0$ at any given time, the noise stays small. This is well-understood and experimentally validated. Sparse autoencoders exploit exactly this structure to decompose model activations into interpretable features.

But storage is a linear operation. Reading and writing features to the residual stream is just projection along directions. The model also has MLPs, and MLPs are nonlinear.

## What happens when you put superposition through a nonlinearity

Consider the simplest possible case. An MLP with a ReLU activation applied to a superposed representation. The input is $x = \alpha_1 \hat{e}_1 + \alpha_2 \hat{e}_2$, where $\hat{e}_1$ and $\hat{e}_2$ are two feature directions that are close to orthogonal but not perfectly so.

The MLP computes something like $\text{ReLU}(Wx + b)$ and then projects back with another weight matrix. In the neuron basis, each neuron $n$ computes:

$$h_n = \text{ReLU}(w_n \cdot x + b_n) = \text{ReLU}(\alpha_1 (w_n \cdot \hat{e}_1) + \alpha_2 (w_n \cdot \hat{e}_2) + b_n)$$

If the neuron were aligned with feature 1, meaning $w_n \cdot \hat{e}_1 = 1$ and $w_n \cdot \hat{e}_2 = 0$, then computation on feature 1 would be clean. No interference. But neurons are not aligned with features. That is the whole point of superposition: features outnumber neurons, so neurons respond to mixtures of features.

The ReLU creates a problem that pure linear superposition does not have. When a neuron's pre-activation is near zero, near the boundary of the ReLU, the activation of one feature can push the neuron above or below the threshold. This gates the contribution of the other feature. Feature 2 is not just noise in the readout of feature 1. Feature 2 changes whether the computation for feature 1 happens at all.

This is what I mean by computation in superposition. The nonlinearity creates cross-terms where the processing of one feature depends on the activation state of unrelated features that happen to share the same neurons.

## Interference is structured, not random

The natural objection is that these cross-terms might average out over many neurons. And in many cases they do. But they do not always average out, and the cases where they fail are informative.

Anthropic's "Toy Models of Superposition" paper (Elhage et al., 2022) studied this in controlled settings. They trained small networks on synthetic tasks where the true features and their importance were known by construction. One finding that does not get enough attention: the network's errors on rare features were not random. They were systematically correlated with which other features were active.

The model did not just have higher error on rare features, which you would expect from looser superposition encoding. It had specific, patterned errors that depended on the joint activation of feature sets. Feature A might be encoded correctly when feature B is inactive, but consistently distorted when feature B is active. This is a signature of computational interference, not representational noise.

I ran a version of this experiment last semester using a slightly larger toy model, 512 features in 64 dimensions with a single hidden layer. The interference graph, meaning which features interfere with which other features during computation, was sparse and structured. Features that shared the most neuron overlap showed the strongest computational interference, as expected. But the direction of the interference was not random either. Feature pairs that were semantically related in the training distribution showed systematically different interference patterns than unrelated pairs. The model had learned to manage interference partially by organizing which features share neurons based on their co-occurrence statistics.

This is subtle. The model does not just cram features into neurons arbitrarily. It allocates neuron overlap based on the statistical structure of the data, placing co-occurring features into different neurons where possible and tolerating overlap only between features that rarely activate simultaneously. When that allocation fails, when two features that do sometimes co-occur are forced to share neurons, the interference becomes a structured source of error.

## The MLP as a structured interference machine

This gives a different lens on what MLPs do in a transformer. The standard story is that attention moves information between positions and MLPs process information within a position. That is true but incomplete. MLPs also serve as the site where superposition interference happens.

When a transformer MLP processes a residual stream vector containing dozens of active features in superposition, it is not applying independent nonlinear transformations to each feature. It is computing a joint function of all active features simultaneously, with the nonlinearity creating dependencies between features that were independent in the residual stream.

Some of these dependencies are useful. If two features tend to co-occur and the model needs to detect their conjunction, the interference from superposition is doing useful computation for free. The model does not need a dedicated "feature A AND feature B" detector because the nonlinear interaction between A and B in the MLP already produces one.

But some dependencies are harmful. If feature A is rare and feature B is common, the MLP might learn to process feature B well, since it matters more for the loss, at the cost of distorting feature A's computation when B is also active. The rare feature's processing becomes conditional on the common feature's state. Not because the task requires it, but because the shared neuron representation forces it.

This is a concrete mechanism for a class of model failures that behavioral evaluation cannot diagnose. The model fails on a specific input not because it lacks the relevant feature or because the feature is poorly encoded, but because another unrelated feature that happens to share neurons is active at the same time and distorts the computation. The failure is contingent on the joint activation pattern, which makes it extremely hard to predict from input properties alone.

## What this means for circuits

Circuit analysis in mechanistic interpretability typically treats features as the atomic units and circuits as the connections between them. The implicit assumption is that features are processed somewhat independently, and the interactions that matter are the ones mediated by attention (moving features between positions) and explicit MLP computation (transforming features within a position).

Computation in superposition breaks this assumption. Two features that are not connected by any identifiable circuit can still interact through shared neuron representations in the MLP. The interaction is not mediated by a clean weight matrix path. It is mediated by the geometry of how features are packed into the neuron basis, combined with the nonlinearity that creates coupling between co-packed features.

This means that circuit diagrams, as currently drawn, are incomplete. They show the intentional information flow through attention and MLP weight matrices. They do not show the accidental information flow through superposition interference. For small models with little superposition, this omission is fine. For large models with heavy superposition, the accidental interactions could be a significant fraction of the model's actual computation.

I do not think this invalidates circuit analysis. It means circuit analysis needs to be augmented with an understanding of which features are superposed together and how the resulting interference affects downstream computation. The SAE decomposition gives you the features. What is missing is a systematic account of the cross-feature interactions introduced by superposition at each MLP layer.

## The connection to quantization

This connects to my own research on feature stability under quantization in a way I did not initially expect.

When you quantize a model's weights, you perturb the geometry of how features are packed into neurons. A feature direction $\hat{e}_i$ that was nearly orthogonal to feature direction $\hat{e}_j$ in the full-precision model might have a slightly different inner product after quantization. For INT8, the perturbation is small. For INT4, it can be meaningful.

The effect on computation in superposition is amplified relative to the effect on storage. A small change in $\epsilon_{ij} = \hat{e}_i \cdot \hat{e}_j$ has a proportionally small effect on readout noise. But the same change can shift a neuron's pre-activation across the ReLU boundary, flipping whether an entire interference term is present or absent. The nonlinearity converts small representational perturbations into discrete computational changes.

This might explain a pattern I have observed in my quantization experiments: INT4 models do not just have uniformly degraded features. They have features that work perfectly in most contexts but fail abruptly and specifically in certain activation patterns. The failures look like exactly what you would expect if quantization shifted the interference structure between superposed features, creating new ReLU boundary crossings that gate computation differently than in the full-precision model.

I am still characterizing this systematically, but the preliminary picture is that quantization does not just degrade features. It rewires the interference graph between features. That is a qualitatively different failure mode than simple representational noise, and it has implications for which quantized models you can trust interpretability analyses to transfer to.

## Why this is hard to study

There is a reason computation in superposition is understudied relative to representational superposition. It is genuinely difficult to get traction on.

Representational superposition can be studied with linear probes and sparse autoencoders. The features are directions, and the decomposition problem is approximately linear. You can train an SAE, inspect the dictionary, and evaluate whether the features are interpretable.

Computational superposition involves nonlinear interactions between features at the neuron level. There is no clean decomposition. The interference between feature A and feature B depends on the activation state of every other feature at the same position, which means you cannot study pairwise interactions in isolation without potentially missing higher-order effects.

The Anthropic toy model results are clean because the models are small enough to analyze exhaustively. At transformer scale, the number of potential feature-feature interactions at a single MLP layer is quadratic in the number of active features, which for frontier models could be thousands. Mapping the interference structure exhaustively is not feasible. You need either smart sampling strategies or theoretical results that let you predict interference from the feature geometry without computing it directly.

Transcoders, which decompose MLP computation into sparse feature-to-feature mappings, are one promising approach. If a transcoder can express the MLP as "feature A maps to feature B with weight $w_{AB}$," then the interference terms show up as cross-feature mappings that the transcoder cannot cleanly explain. The residual between the transcoder's prediction and the actual MLP output is, roughly, the contribution of computational superposition. I have not tried this yet but it is on my list.

## What I take from this

The superposition hypothesis is often presented as a solved problem, or at least a well-understood one. We know models store features in superposition. We have SAEs to decompose them. The next step is circuits, scaling, safety applications.

The less optimistic version is that we understand superposition as a storage mechanism but not as a computational one. We can decompose the residual stream into interpretable features, but we cannot yet account for how those features interact inside the MLPs that process them. The interactions are structured, consequential, and invisible to current tools. They explain failure modes that look mysterious from the outside but are mechanistically straightforward once you consider the interference geometry.

I do not think this is a reason for despair. It is a reason for more work. Specifically, more work on understanding MLP computation in the context of superposition, on building tools that can detect and characterize computational interference, and on understanding how model modifications like quantization reshape the interference structure.

The features are the atoms. The circuits are the molecules. Computation in superposition is the physics that governs how the atoms interact when they are too close together. You cannot do chemistry without physics. I do not think you can do reliable circuit analysis at scale without understanding computational superposition first.
