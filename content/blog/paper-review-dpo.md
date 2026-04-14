---
title: "Paper Review: Direct Preference Optimization"
date: "2026-04-14"
excerpt: "Fourth entry in the Paper Review series. Rafailov et al. (2023) looked at the bloated RLHF pipeline and asked what happens if you just delete the reward model. The answer is a closed-form solution that the entire field adopted within months. Also the second time I get to review a friend's work."
tags: ["Paper Review", "AI", "Research", "Scaling"]
series: "Paper Review"
seriesOrder: 4
---

This is the second paper in this series where I know one of the authors personally, and at this point I am starting to wonder whether my social circle is a confounder in my paper selection process. Archit Sharma is a coauthor on this one. We overlapped at a workshop two summers ago, and the kind of conversation where you argue about KL penalties over bad conference coffee is apparently enough to produce a lasting acquaintance. I found out he was working on this months before it dropped, though he was characteristically vague about the details. When I finally read it, I understood why. The result is clean enough that you do not want to spoil it.

"Direct Preference Optimization: Your Language Model is Secretly a Reward Model" (Rafailov, Sharma, Mitchell, Manning, Ermon, Finn, 2023) is one of those papers where the core idea can be stated in a single sentence and the rest of the paper is showing that the single sentence is actually correct. The sentence: you do not need a reward model to do RLHF. You can optimize human preferences directly, with a classification loss, and the math works out exactly.

## The Problem DPO Solves

To understand why DPO matters, you need to understand what RLHF actually requires. The standard pipeline has three stages. First, supervised fine-tuning: you train the model on demonstrations of good behavior. Second, reward modeling: you collect human preference pairs (this response is better than that one) and train a separate neural network to predict which response a human would prefer. Third, reinforcement learning: you use PPO to optimize the language model against the reward model, with a KL penalty to prevent the policy from drifting too far from the original.

![The RLHF reward model training pipeline, showing how human preference comparisons are used to train a scalar reward function](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/rlhf/reward-model.png)

This pipeline works. ChatGPT, Claude, and every other aligned model you have used went through some version of it. But it is also a nightmare to engineer. You need four models in GPU memory simultaneously: the policy, the reference policy, the reward model, and the value function. PPO is notoriously unstable. The hyperparameter surface is vast and hostile. The reward model can be hacked. The KL penalty coefficient requires careful tuning. Each component introduces failure modes that compound. In practice, getting RLHF to work requires a team of people who have gotten RLHF to work before, which is a circular dependency that the field has mostly resolved through institutional knowledge at a handful of labs.

![The full RLHF fine-tuning pipeline showing how PPO optimizes the language model against the reward model with a KL constraint](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/rlhf/rlhf.png)

DPO asks: what if you could skip steps two and three entirely?

## The Derivation

The mathematical insight is genuinely elegant, and I do not use that word often. Start with the standard RLHF objective: maximize expected reward while staying close to a reference policy via a KL divergence constraint.

$$\max_{\pi} \mathbb{E}_{x \sim D, y \sim \pi(\cdot|x)} [r(x, y)] - \beta \text{KL}[\pi(\cdot|x) || \pi_{\text{ref}}(\cdot|x)]$$

This constrained optimization problem has a known closed-form solution. The optimal policy is:

$$\pi^*(y|x) = \frac{1}{Z(x)} \pi_{\text{ref}}(y|x) \exp\left(\frac{1}{\beta} r(x, y)\right)$$

where $Z(x)$ is a partition function. This is standard. People have known this for years. What Rafailov et al. noticed is that you can rearrange this to express the reward function in terms of the policy:

$$r(x, y) = \beta \log \frac{\pi^*(y|x)}{\pi_{\text{ref}}(y|x)} + \beta \log Z(x)$$

And here is the key move. Substitute this into the Bradley-Terry preference model, which says the probability that response $y_w$ is preferred over $y_l$ is:

$$P(y_w \succ y_l | x) = \sigma(r(x, y_w) - r(x, y_l))$$

When you do the substitution, the partition function $Z(x)$ cancels. It appears in both terms and drops out. What remains is a loss that depends only on the policy and the reference model:

$$\mathcal{L}_{\text{DPO}}(\pi_\theta; \pi_{\text{ref}}) = -\mathbb{E}_{(x, y_w, y_l)} \left[\log \sigma\left(\beta \log \frac{\pi_\theta(y_w|x)}{\pi_{\text{ref}}(y_w|x)} - \beta \log \frac{\pi_\theta(y_l|x)}{\pi_{\text{ref}}(y_l|x)}\right)\right]$$

No reward model. No RL. No PPO. No value function. Just a binary cross-entropy loss on preference pairs. The entire three-stage pipeline collapses into a single supervised learning objective.

## What the Paper Gets Right

The elegance of the derivation is real, but what I find more impressive is the experimental discipline. The authors do not just show that DPO matches RLHF. They show it across multiple settings: summarization, dialogue, and controlled sentiment generation. They compare against PPO-based RLHF, best-of-n sampling, and other baselines. The results are not uniformly dominant, but they are competitive, and the compute cost is a fraction of PPO.

The paper also makes a subtle point that I think gets overlooked. DPO does not just avoid learning a reward model. It learns an *implicit* reward model. You can extract the reward function from the trained policy by computing the log-ratio against the reference model. This means you get reward modeling for free, as a byproduct of policy optimization, rather than as a prerequisite. The title of the paper, "Your Language Model is Secretly a Reward Model," is not marketing. It is a literal description of the math.

The practical impact is hard to overstate. Within months of publication, DPO became the default alignment method for open-source models. The TRL library from Hugging Face integrated it almost immediately. LoRA plus DPO on a single GPU became a viable alignment recipe for labs that could never have run PPO. The paper democratized alignment in a way that few papers in this space have managed.

## Where I Push Back

The $\beta$ parameter does more work than the paper acknowledges. It controls the temperature of the implicit reward, which determines how sharply the model distinguishes between preferred and dispreferred responses. Too low and the model ignores the reference policy entirely. Too high and it barely moves from the reference. In practice, people tune $\beta$ by vibes, which is the same problem the paper criticizes in PPO hyperparameters. The problem is not eliminated. It is compressed into a single dimension, which is better, but "we reduced hyperparameter tuning from five knobs to one knob" is a different claim than "we eliminated hyperparameter tuning."

There is a deeper issue that the paper's framework obscures. The Bradley-Terry preference model assumes that preferences are transitive and can be represented by a scalar reward function. Human preferences are neither. I prefer response A to B, and B to C, but C to A. This is not pathological. It is normal. Humans have context-dependent, multidimensional preferences that do not reduce to a single number. DPO inherits this limitation from the Bradley-Terry model, but because DPO hides the reward model inside the policy, the assumption is harder to diagnose and harder to relax.

The on-policy versus off-policy distinction also matters more than the paper suggests. DPO trains on a fixed dataset of preference pairs, typically generated by the SFT model. But the policy it produces may differ substantially from the model that generated the training data. This distribution shift is a known problem in offline RL, and DPO is essentially offline RL with a specific loss function. Later work, notably online DPO variants and iterative DPO, addressed this by generating new preference pairs from the current policy during training. The fact that these extensions were necessary suggests that vanilla DPO's offline nature is a real limitation, not just a theoretical concern.

One more thing. The paper compares DPO to PPO-based RLHF, but the PPO baselines in alignment papers are notoriously hard to tune. A well-tuned PPO setup at a major lab may significantly outperform the baselines reported in academic papers. The comparison is fair given the paper's computational constraints, but it means the "DPO matches RLHF" claim has an implicit asterisk: it matches academic RLHF, which is not the same as industrial RLHF.

## Why This Paper Changed the Field

The deepest contribution is not the loss function. It is the reframing. Before DPO, alignment was understood as an RL problem that happened to use language. After DPO, alignment could be understood as a supervised learning problem with a particular loss function. This reframing opened the door to an entire family of methods: IPO, KTO, ORPO, SimPO, and dozens of others. Each one modifies the preference model, the loss function, or the training procedure, but they all operate in the conceptual space that DPO carved out. The RL-free alignment paradigm is DPO's real legacy.

I texted Archit after I finished the first draft of this review. He pointed out two things I had gotten wrong in the derivation section (both fixed now) and one thing he thought the paper should have spent more time on (the on-policy issue, which I find reassuring). Reviewing a friend's work remains a strange experience. You want to be fair, which means being harder on them than you would be on a stranger, because they can take it and because they deserve the same scrutiny you would give anyone else. This paper holds up under that scrutiny. The math is clean, the experiments are honest, and the idea changed how an entire field thinks about alignment.

The partition function canceling out is one of those results that feels inevitable in hindsight. It was not. Someone had to see it. That is often how the best work goes.

*Fourth entry in the Paper Review series. Previous: The Curious Case of Neural Text Degeneration.*
