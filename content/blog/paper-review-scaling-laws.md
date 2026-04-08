---
title: "Paper Review: Scaling Laws for Neural Language Models"
date: "2026-04-08"
excerpt: "Second entry in the Paper Review series. Kaplan et al. (2020) turned deep learning from alchemy into something with predictable returns. Then Chinchilla proved the predictions were wrong in exactly the right way."
tags: ["Paper Review", "AI", "Research", "Scaling"]
series: "Paper Review"
seriesOrder: 2
---

I teased at the end of the last review that scaling laws would be next. This paper earns the slot because it changed how I think about machine learning at a structural level. Before Kaplan et al. (2020), training a large model was an expensive guess. After it, training a large model was an expensive guess with a trendline. That distinction matters more than it sounds.

"Scaling Laws for Neural Language Models" (Kaplan, McCandlish, Henighan, Brown, Chess, Child, Gray, Radford, Wu, Amodei, 2020) is an empirical study. The authors trained a large number of Transformer language models across a range of sizes (768 parameters to 1.5 billion), dataset sizes (22 million to 23 billion tokens), and compute budgets, then measured how cross-entropy loss on held-out text varied as a function of each variable. The finding: smooth power-law relationships, spanning seven or more orders of magnitude, with no sign of plateauing.

That is the result that launched a thousand GPU clusters.

## The Core Findings

The paper establishes three scaling laws, each holding the other variables at sufficiently large values so they do not bottleneck performance:

**Loss as a function of parameters (N):**

$$L(N) = \left(\frac{N_c}{N}\right)^{\alpha_N}$$

where $\alpha_N \approx 0.076$ and $N_c \approx 8.8 \times 10^{13}$. On a log-log plot, loss decreases as a straight line with model size. No kinks, no plateaus, no phase transitions. Just a clean power law across seven orders of magnitude.

**Loss as a function of dataset size (D):**

$$L(D) = \left(\frac{D_c}{D}\right)^{\alpha_D}$$

where $\alpha_D \approx 0.095$ and $D_c \approx 5.4 \times 10^{13}$.

**Loss as a function of compute (C):**

$$L(C) = \left(\frac{C_c}{C}\right)^{\alpha_C}$$

where $\alpha_C \approx 0.050$ and $C_c \approx 3.1 \times 10^8$.

The exponents are small, which means diminishing returns are real but slow. A 10x increase in compute buys you a roughly 0.12 decrease in log-loss. Consistent, predictable, and relentless.

The paper also finds that these variables interact in a specific way. When you have a fixed compute budget $C$, the optimal allocation is to make the model as large as possible and train it on relatively little data, accepting early stopping well before convergence. Their prescription: scale parameters faster than data. Specifically, they recommend $N \propto C^{0.73}$ and $D \propto C^{0.27}$.

This is the part that turned out to be wrong. I will get to that.

## Why This Paper Mattered

Before Kaplan et al., the field had a rough intuition that bigger models trained on more data tended to be better. But "tended to be better" is not actionable when a training run costs millions of dollars. What the paper provided was a quantitative framework for predicting the return on investment of scaling up. You could look at the trendline, estimate how much compute you needed to reach a target loss, and allocate resources accordingly.

This is the paper that made scaling a *strategy* rather than a *hope*.

It also clarified something important about architecture. The scaling laws hold across variations in model shape (depth, width, number of heads) as long as the total parameter count stays the same. A wide shallow model and a narrow deep model with the same number of parameters achieve roughly the same loss. This meant that architecture search, which had consumed enormous research effort, was less important than people thought. What mattered was parameters, data, and compute. The specific arrangement of the parameters was secondary.

This is a genuinely surprising result if you think about it. Neural network architecture research is predicated on the assumption that how you wire the network matters. Kaplan et al. showed that, at scale, it matters much less than how big the network is and how much data you feed it. The Transformer happened to be a good architecture for scaling (for the reasons I discussed in the previous review), but once you have a scalable architecture, the returns come from *more*, not from *different*.

## The Chinchilla Correction

Two years later, Hoffmann et al. (2022), "Training Compute-Optimal Large Language Models" (universally known as the Chinchilla paper), revisited Kaplan's scaling laws with more careful experimental methodology and reached a different conclusion about compute-optimal allocation.

Kaplan et al. said: given a fixed compute budget, scale parameters aggressively and undertrain on data. Specifically, $N \propto C^{0.73}$.

Hoffmann et al. said: actually, parameters and data should scale at roughly equal rates. $N \propto C^{0.50}$ and $D \propto C^{0.50}$.

The practical implication was dramatic. GPT-3 had 175 billion parameters trained on 300 billion tokens. Chinchilla had 70 billion parameters trained on 1.4 trillion tokens, using roughly the same compute budget. Chinchilla outperformed GPT-3 on virtually every evaluation. The 175 billion parameter model was *massively undertrained*. It had far more capacity than the data could fill.

What went wrong with Kaplan's analysis? The Chinchilla authors identified two methodological issues. First, Kaplan et al. did not train all models to convergence when studying the data scaling law. They used a fixed number of training steps regardless of model size, which systematically underestimated the benefit of more data for smaller models. Second, their learning rate schedules were not independently tuned for each model size, which biased results toward larger models that happened to be less sensitive to suboptimal hyperparameters.

These are not exotic errors. They are the kind of confounds that are easy to introduce and hard to spot when you are running thousands of training jobs across orders of magnitude of scale. I mention them because they illustrate something I think about a lot: empirical scaling research is deceptively hard. The relationships look clean on a log-log plot, but the experimental design required to measure them accurately is not clean at all.

## Thoughts on the Methodology

Kaplan et al. is an empirical paper, which means the methodology is the contribution. And the methodology is simultaneously impressive and flawed in ways that are instructive.

The impressive part: the sheer scale of the experimental matrix. They trained models spanning seven orders of magnitude in parameter count. They varied dataset size independently of model size. They measured loss at multiple points during training to separate the effects of compute from the effects of convergence. They tested whether the scaling laws depended on architecture details (they mostly did not). The paper is dense with carefully constructed plots, each isolating one variable while controlling the others. This is expensive, careful science.

The flawed part: the confounds I described above. The decision not to train all models to convergence introduced a systematic bias. The decision to use shared learning rate schedules introduced another. And because the relationships are power laws with small exponents, even modest biases in the experimental setup can produce meaningfully wrong estimates of the optimal compute allocation.

What I find most interesting methodologically is what the paper chose *not* to study. The scaling laws are all measured in terms of cross-entropy loss on held-out text. Not on downstream task performance. Not on reasoning ability. Not on few-shot learning. Not on any of the emergent capabilities that later turned out to be the most important consequence of scaling. This was a deliberate choice, and a reasonable one in 2020, because cross-entropy loss is clean, continuous, and directly comparable across model sizes. But it means the scaling laws tell you how to minimize next-token prediction error. They tell you nothing about when a model will start doing arithmetic, or following instructions, or writing code.

The gap between "loss goes down smoothly" and "capabilities emerge discontinuously" is one of the most interesting open questions in the field. The scaling laws paper does not address it because it was not asking that question. But every time someone uses Kaplan-style scaling laws to forecast capability milestones, they are extrapolating beyond what the paper actually showed.

## The Deeper Question

There is something philosophically strange about scaling laws for neural networks. Physical scaling laws (Kepler's laws, power-law distributions in natural phenomena, allometric scaling in biology) arise from underlying symmetries or constraints. They are *explained* by theory. Neural scaling laws are purely empirical. We observe that loss decreases as a power law with parameter count, but we do not have a first-principles theory that predicts the exponent. We do not know *why* $\alpha_N \approx 0.076$ rather than $0.05$ or $0.12$.

This means the scaling laws are descriptive, not explanatory. They tell you what will happen if you scale up. They do not tell you why it happens, or under what conditions it might stop happening. The power law could break at any point. There could be a phase transition at some scale we have not reached yet. Or the exponents could change as training data distributions shift. We do not know because we do not have a theory.

Kaplan et al. are careful about this. They note that the power laws hold "over the range tested" and do not claim they will hold indefinitely. But the downstream interpretation has been far less careful. The entire rationale for spending billions of dollars on training runs is predicated on the assumption that these empirically observed power laws will continue to hold. That is a bet, not a theorem.

I am not saying the bet is wrong. The evidence so far suggests the laws do keep holding as we scale. But I want to be precise about the epistemological status of the claim. It is an empirical regularity, not a law of nature. The moment someone builds a model that falls off the trendline in either direction (faster improvement or diminishing returns), the entire framework needs revision.

## What I Take From This Paper

Every time I revisit Kaplan et al. I come away with the same two reactions.

The first is admiration for turning an empirical question into a quantitative framework. Before this paper, "bigger is better" was a folk belief. After it, "bigger is better at this rate" was a testable prediction. That is a genuine scientific contribution, even though the specific predictions turned out to need correction.

The second is unease about how the paper has been interpreted. The scaling laws describe one axis of improvement: making the loss number go down. They do not describe what it *means* for the loss number to go down, in terms of capabilities, reliability, or usefulness. The field has spent four years scaling along the axis that Kaplan et al. identified, and it has worked spectacularly. But the relationship between the axis they measured (cross-entropy loss) and the thing people actually care about (model capability) remains poorly understood.

The Chinchilla correction is a good example of how empirical science is supposed to work. Someone makes a careful measurement, publishes a quantitative claim, and someone else refines the methodology and corrects the claim. The system worked. The fact that an entire generation of models (GPT-3, PaLM, Gopher) were trained with suboptimal compute allocation because the original scaling laws were slightly wrong is an expensive reminder that empirical power laws deserve scrutiny, not reverence.

*Second entry in the Paper Review series. Previous: Attention Is All You Need.*
