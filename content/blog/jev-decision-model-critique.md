---
title: "Why JEV Is Not the Decision Model We Were Promised"
date: "2026-09-26"
excerpt: "The new JEV decision model is being hailed as the first true agentic foundation model. After digging into the weights and the paper, I am seriously disappointed."
tags: ["AI", "Critique", "RL", "Models"]
---

# Why JEV Is Not the Decision Model We Were Promised

It has been a minute. I changed jobs recently, and the transition ate up pretty much all my mental bandwidth over the last few months. I kept meaning to sit down and write, but writing good technical pieces takes hours I just did not have. Things have finally settled down now and I am back to my normal routine. 

Honestly, I am glad I waited. The recent drop of the JEV decision model gave me the perfect excuse to start writing again. Everyone on my timeline is losing their minds over it. People are calling it the first true agentic foundation model and the death of traditional autoregressive scaling.

I have spent the last week digging into the technical report and playing with the weights. I hate to be the pessimist here, but JEV is fundamentally broken.

## The Objective Function is a Mess

Let us look at the architecture. The core claim is that instead of doing next-token prediction, JEV optimizes directly for long-horizon task success using a Joint Expected Value formulation. You feed it a state, and it outputs a distribution over optimal actions weighted by a learned value function.

Sounds great in theory. In practice, the value landscape for open-ended tasks is way too jagged for their continuous relaxation trick to work. 

The authors proudly show off their modified objective that supposedly stabilizes the value network. But if you look at the appendix, the clipping constraints they had to apply are hilariously aggressive. The loss function looks something like this:

$$ \mathcal{L} = \mathbb{E} \left[ \min \left( r \cdot A, \text{clip}(r, 1-\epsilon, 1+\epsilon) A \right) \right] - \beta \text{KL}(\pi || \pi_{\text{ref}}) $$

If you check the hyperparameters they actually used for training, the KL penalty $\beta$ and the clipping bounds are so tight that the model is essentially doing behavior cloning on the reference policy for any task outside the training distribution. They did not solve exploration. They just clamped the network until it stopped diverging. 

## Evaluator Collapse

Because the value head is trained jointly with the representation layers, it suffers from massive gradient interference. When the model tries to learn a new skill, the representations shift. When the representations shift, the value head miscalibrates.

You can test this yourself. If you prompt JEV to solve a standard coding task but intentionally include a misleading variable name, the value head completely collapses. It assigns high expected value to actions that make zero syntactic sense just because the embedding space got pushed slightly off manifold. We have known about this kind of Q-learning instability in deep RL for years. JEV just reproduced it at a larger scale.

## Cooked Benchmarks

Then there is the benchmark issue. They claim state of the art on SWE-bench and WebArena. But if you parse their evaluation methodology carefully, they gave JEV a custom environment wrapper that pre-parses observations into structured JSON. The baselines did not get this wrapper. 

If you force an LLM to parse raw HTML and compare it to a model getting clean JSON state representations, you are not proving your architecture is better. You are just proving that parsing raw text is hard. It is a completely unfair comparison.

## The Latency Problem

The most frustrating part is the inference cost. Since the action head is decoupled from the representation layers, every step requires a full forward pass through the dense network plus the Monte Carlo sampling overhead. You are paying o1 level inference costs for a model that will still hallucinate basic bash commands if the value network miscalibrates by a fraction of a percent.

I want a real decision model as much as anyone else. Getting away from pure next-token prediction is absolutely the right direction. But slapping a value head on a transformer, clamping the loss until it stops exploding, and cooking the evaluation environment is not how we get there. 

JEV is an interesting engineering artifact. It is definitely not the paradigm shift people are claiming it is.
