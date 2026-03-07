---
title: "Sparse Autoencoders for Discovering LLM Features"
date: "2026-03-07"
excerpt: "Large language models represent information as superpositions of concepts in high-dimensional space. Sparse autoencoders are emerging as one of the most promising tools for untangling that mess — here's how they work and why they matter."
tags: ["AI", "Interpretability", "Research"]
---

# Sparse Autoencoders for Discovering LLM Features

One of the core puzzles in mechanistic interpretability is deceptively simple to state: **what does a neuron in a transformer represent?**

The uncomfortable answer is: usually, many things at once.

This is the phenomenon of *polysemanticity* — a single neuron in a large language model activates for wildly unrelated concepts. Anthropic famously found a neuron in Claude that fired for "banana", "the word 'and'", and "a specific Python function". This isn't a bug. It's the model being efficient with its representational capacity. But it makes reverse-engineering the model extremely difficult.

Sparse autoencoders (SAEs) are one of the most promising tools for breaking this problem open.

---

## Why Neurons Are Polysemantic

The leading hypothesis is the **superposition hypothesis** (Elhage et al., 2022). It goes like this:

A transformer with $d_{model}$ dimensions can only represent $d_{model}$ orthogonal features perfectly. But the model wants to track far more features than that — potentially millions of concepts. The solution is to encode multiple features as *near-orthogonal* directions, allowing them to coexist with only weak interference.

The key insight: **sparse activation patterns make superposition work**. If most features are inactive most of the time, the interference between co-activated features stays low. The model effectively gets exponential representational capacity at the cost of imprecision.

This is efficient. But from an interpretability standpoint, it means that reading individual neuron activations is like reading a compressed, overlapping signal — nearly impossible to decompose by hand.

---

## Enter Sparse Autoencoders

A sparse autoencoder is trained to solve a specific decomposition problem:

> Given activations from a particular layer of an LLM, find a dictionary of features (directions in activation space) such that each activation is expressed as a *sparse* sum of a small number of those features.

Formally, for an activation vector $x \in \mathbb{R}^d$, the SAE learns:

1. An **encoder** $f: \mathbb{R}^d \to \mathbb{R}^n$ where $n \gg d$, mapping to a higher-dimensional sparse representation
2. A **decoder** $g: \mathbb{R}^n \to \mathbb{R}^d$, reconstructing the original activation

The training objective balances reconstruction fidelity with a sparsity penalty (typically L1 on the hidden activations):

```
L = ||x - g(f(x))||² + λ · ||f(x)||₁
```

The L1 penalty forces most hidden units to zero, making the representation sparse. The expanded dictionary ($n \gg d$) gives the model room to find the true monosemantic features underlying the polysemantic neuron soup.

---

## What SAEs Actually Find

This is where things get exciting. When trained on transformer residual stream activations, SAEs consistently discover features that are:

- **Linguistically interpretable** — features that fire for specific syntactic roles, semantic categories, or even named entities
- **Causally relevant** — steering a feature's activation actually changes the model's behavior in predictable ways
- **Compositional** — features combine in structured ways that mirror linguistic and conceptual structure

Anthropic's *Scaling Monosemanticity* paper (2024) applied SAEs to Claude 3 Sonnet and found over 34 million interpretable features — including features for specific people, places, programming languages, and emotional states. They could steer the model's behavior by directly patching feature activations.

Google DeepMind's parallel effort found similar structure in Gemma. The field has essentially gone from "can we find any interpretable features" to "we can find millions of them, now how do we use them."

---

## The Architecture in Practice

A modern SAE for LLM interpretability typically looks like this:

```python
class SparseAutoencoder(nn.Module):
    def __init__(self, d_model: int, d_hidden: int):
        super().__init__()
        # Encoder: expand to larger dictionary
        self.W_enc = nn.Linear(d_model, d_hidden, bias=True)
        # Decoder: project back, columns are feature directions
        self.W_dec = nn.Linear(d_hidden, d_model, bias=True)
        # Normalize decoder columns to unit norm
        self._normalize_decoder()

    def forward(self, x):
        # Centre activations
        x_cent = x - self.W_dec.bias
        # Encode and apply ReLU for sparsity
        hidden = F.relu(self.W_enc(x_cent))
        # Reconstruct
        x_hat = self.W_dec(hidden)
        return hidden, x_hat

    @torch.no_grad()
    def _normalize_decoder(self):
        self.W_dec.weight.data = F.normalize(
            self.W_dec.weight.data, dim=0
        )
```

The geometry matters: decoder columns are constrained to unit norm so that the hidden activation magnitude cleanly represents *how much* of a feature is present, not an artifact of scale.

---

## Evaluation: Are the Features Real?

Finding sparse features is only useful if they're meaningfully interpretable, not just mathematical artifacts. The field has converged on a few key evaluations:

**1. Automated interpretability scoring**  
Feed the top-activating examples for a feature to a language model and ask it to hypothesize what the feature represents. Then test that hypothesis on held-out examples. Features with high auto-interp scores reliably correspond to human-understandable concepts.

**2. Causal steering**  
Artificially clamping a feature's activation to a high value should predictably shift model outputs. If the "French language" feature is activated, the model should start responding in French. This validates that features are causally upstream of behavior, not just correlated bystanders.

**3. Reconstruction quality**  
An SAE that achieves high sparsity but poor reconstruction has found features that don't actually explain the activations. The $L_0$ vs. loss-recovered curve is the standard diagnostic — you want good reconstruction at low average $L_0$ (number of active features per token).

---

## Open Problems

SAEs are powerful but far from a solved technique. The main open challenges:

**Absorption and splitting**  
Sometimes a feature that should be one concept gets split across multiple SAE features. Sometimes multiple concepts get absorbed into one. The SAE's dictionary isn't a unique decomposition — it's one of many possible solutions to the optimization problem.

**Computational cost**  
Training a good SAE requires a huge number of forward passes through the target model. Frontier-scale SAEs (for models like Claude 3 or GPT-4) are genuinely expensive experiments.

**Cross-layer composition**  
Features identified at layer $l$ interact with computations at layers $l+1, l+2, \dots$. Understanding how mid-network features compose into later features — and ultimately into output behavior — is still an open research frontier.

**Quantization robustness**  
My own research touches on this: when a model is quantized (INT8, INT4), do the feature directions found by the SAE remain stable? Early evidence suggests INT8 is mostly fine, but INT4 introduces meaningful drift in certain attention-heavy layers. This matters a lot if you want to run interpretability tools on efficiently-deployed models.

---

## Why This Matters Beyond Research

It's easy to frame SAEs as a purely academic tool, but the practical stakes are high.

**Safety**: If you can identify the features that activate when a model is reasoning about harmful content, you can monitor or suppress them at inference time — a much more principled intervention than RLHF alone.

**Debugging**: When a deployed model fails on a specific input distribution, SAE-based analysis can pinpoint *which feature combination* is triggering the failure, replacing the current "vibe-based" debugging process.

**Model editing**: Rather than fine-tuning a model to change a behavior (expensive, potentially disruptive), you can surgically patch the relevant feature activations. Anthropic demonstrated this with the "Golden Gate Claude" experiment — by pinning a single "Golden Gate Bridge" feature to a high activation, they made Claude compulsively identify as the bridge.

---

## Where the Field Is Heading

The trajectory is clear: SAEs are becoming a standard component of the interpretability toolkit, rather than a research curiosity. In 2024, three major labs (Anthropic, Google DeepMind, EleutherAI) all published large-scale SAE results. The open-source ecosystem — SAELens, dictionary_learning, TransformerLens — has made it possible to train your own SAEs on open models in a weekend.

The next frontier is moving from *discovering* features to *using* them: automated circuit analysis, scalable oversight, and real-time behavioral monitoring. Sparse autoencoders are the dictionary; the more interesting question is what language we'll speak once we can read it.

---

*I'm actively researching SAE-based feature stability under quantization as part of my Masters at UdeM/MILA. If you're working in this space, I'd love to connect.*
