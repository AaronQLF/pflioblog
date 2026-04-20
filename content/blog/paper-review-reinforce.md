---
title: "Paper Review: REINFORCE. The Algorithm That Made Policy Gradients Respectable"
date: "2026-04-20"
excerpt: "Williams (1992) wrote down a gradient estimator for stochastic policies that required no model of the environment, no value function, and no differentiable reward. It is the statistical foundation underneath PPO, GRPO, and every RLHF pipeline shipping in production today. The paper is thirty-four years old and the math has not aged a day."
tags: ["Paper Review", "AI", "Research", "Reinforcement Learning"]
series: "Paper Review"
seriesOrder: 12
---

Every time a language model gets fine-tuned with RLHF, the gradient that actually moves the weights is a REINFORCE gradient. PPO dresses it up with a clipped surrogate and a trust region. GRPO replaces the value baseline with a group-relative one. Actor-critic methods add a learned critic. Underneath all of it, the thing being estimated is the same object: the expectation of a log-probability gradient weighted by a scalar return. Ronald Williams wrote that object down in 1992, proved it was an unbiased estimator of the policy gradient, and named the resulting family of algorithms REINFORCE.

"Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning" (Williams, Machine Learning 8, 1992) is one of the papers that has aged most gracefully in machine learning. The notation is dated. The experiments are on toy problems. The connection to modern deep RL is never made because deep RL would not exist for another two decades. And the core contribution, the likelihood ratio gradient estimator for stochastic policies, is still the gradient that shows up every time somebody wants to optimize a non-differentiable objective through a sampling step.

This is the twelfth entry in the Paper Review series and the first one in a stretch I want to do on reinforcement learning foundations. I am starting here because everything downstream (actor-critic, TRPO, PPO, DPO as a contrast case, GRPO) presupposes that you already understand why the REINFORCE estimator works and what its failure modes are. Without that foundation, modern RLHF looks like a pile of heuristics. With it, the heuristics turn out to be principled responses to specific properties of the underlying estimator.

## The Problem Williams Was Solving

In 1992, the dominant paradigm for neural networks was supervised learning via backpropagation. You had inputs, you had labels, you computed a differentiable loss, and you followed the gradient. The machinery worked because the loss was a smooth function of the network parameters.

Reinforcement learning did not fit that template. In RL, the network produces an action, the environment produces a reward, and the reward is typically not a differentiable function of the action. Even if it were, the network's output is often stochastic: you sample an action from a distribution, and the sampling operation is not differentiable. There is no gradient of the reward with respect to the parameters that you can compute by the chain rule, because the chain is broken at the sampling step.

The existing approaches to this problem were various. Temporal difference methods (Sutton 1988) learned a value function and used it to bootstrap. Q-learning (Watkins 1989) learned action values directly and derived a greedy policy. Both are value-based: they estimate how good states or state-action pairs are, and the policy falls out of the values. Neither trains the policy directly.

Williams asked a different question. Suppose you parameterize the policy itself as a neural network, $\pi_\theta(a|s)$, that outputs a probability distribution over actions given the state. Can you compute a gradient of the expected reward with respect to $\theta$, without knowing anything about the environment's dynamics or the reward function's structure?

The answer is yes, and the derivation fits in a few lines.

## The Likelihood Ratio Gradient

Let $J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}[R(\tau)]$ be the expected return, where $\tau$ is a trajectory (a sequence of states, actions, and rewards) and $R(\tau)$ is the total return of that trajectory. We want $\nabla_\theta J(\theta)$.

Writing the expectation as an integral over trajectories:

$$J(\theta) = \int p_\theta(\tau) R(\tau) \, d\tau$$

Taking the gradient:

$$\nabla_\theta J(\theta) = \int \nabla_\theta p_\theta(\tau) R(\tau) \, d\tau$$

The problem is that $\nabla_\theta p_\theta(\tau)$ is not an expectation under any distribution, so we cannot estimate it by sampling. Williams applies the log-derivative trick:

$$\nabla_\theta p_\theta(\tau) = p_\theta(\tau) \nabla_\theta \log p_\theta(\tau)$$

This is just the chain rule applied to $\log$, rearranged. Substituting:

$$\nabla_\theta J(\theta) = \int p_\theta(\tau) \nabla_\theta \log p_\theta(\tau) R(\tau) \, d\tau = \mathbb{E}_{\tau \sim \pi_\theta}[\nabla_\theta \log p_\theta(\tau) R(\tau)]$$

The gradient of an expectation is now itself an expectation. You can estimate it by sampling trajectories from the current policy, computing the gradient of the log probability of each trajectory, multiplying by the return, and averaging. No knowledge of the environment is required. No differentiability of the reward is required. The only thing you need to be able to compute is $\nabla_\theta \log \pi_\theta(a|s)$, which is a standard backpropagation through the policy network.

For a trajectory $\tau = (s_0, a_0, s_1, a_1, \dots, s_T, a_T)$ in a Markov decision process, the trajectory probability factorizes as:

$$p_\theta(\tau) = p(s_0) \prod_{t=0}^{T} \pi_\theta(a_t|s_t) p(s_{t+1}|s_t, a_t)$$

The environment's transition probabilities $p(s_{t+1}|s_t, a_t)$ and the initial state distribution $p(s_0)$ do not depend on $\theta$, so their gradient vanishes. We are left with:

$$\nabla_\theta \log p_\theta(\tau) = \sum_{t=0}^{T} \nabla_\theta \log \pi_\theta(a_t|s_t)$$

The REINFORCE estimator is therefore:

$$\hat{g} = \left(\sum_{t=0}^{T} \nabla_\theta \log \pi_\theta(a_t|s_t)\right) R(\tau)$$

This is an unbiased estimator of $\nabla_\theta J(\theta)$. That is the entire theoretical content of the paper. Everything else in Williams (1992) is either a generalization of this result (to multiple parameters, to episodic vs continuing tasks, to specific output distributions) or a discussion of its properties.

## Why the Name

Williams's original formulation is slightly more general than what I wrote above. He considers the update rule:

$$\Delta \theta_{ij} = \alpha_{ij} (r - b_{ij}) e_{ij}$$

where $\alpha_{ij}$ is a non-negative learning rate, $r$ is the reinforcement signal (reward), $b_{ij}$ is a baseline (which I will discuss below), and $e_{ij}$ is the characteristic eligibility, defined as $\partial \ln g_i / \partial \theta_{ij}$ where $g_i$ is the probability density of the output. REINFORCE stands for REward Increment = Nonnegative Factor times Offset Reinforcement times Characteristic Eligibility. The name is an acronym for the structure of the update rule.

The acronym is unfortunate. It obscures what the algorithm actually does, which is: estimate the policy gradient by the log-derivative trick, optionally subtract a baseline to reduce variance, and take a gradient step. Nobody calls it "REward Increment = Nonnegative Factor..." in practice. It is just REINFORCE, and in modern usage the name refers to the whole family of unbiased policy gradient estimators derived by the log-derivative trick, whether or not they match Williams's original decomposition exactly.

## The Variance Problem

The REINFORCE estimator is unbiased. It is also catastrophically high-variance in practice. This is the single most important practical property of the algorithm, and most of the thirty years of follow-up work can be understood as attempts to reduce the variance while preserving unbiasedness (or trading small bias for large variance reductions).

The variance of the estimator comes from two sources. First, the return $R(\tau)$ varies across trajectories, often by orders of magnitude, and this variation multiplies the gradient. Second, the sum of log-probability gradients along a trajectory is itself noisy, and for long trajectories the sum accumulates many noisy terms.

Williams identifies the first source of variance and proposes the baseline correction. Observe that for any function $b(s)$ that does not depend on the action $a$:

$$\mathbb{E}_{a \sim \pi_\theta(\cdot|s)}[\nabla_\theta \log \pi_\theta(a|s) b(s)] = b(s) \nabla_\theta \mathbb{E}_{a \sim \pi_\theta(\cdot|s)}[1] = 0$$

because the expected gradient of the log probability under the distribution itself is zero (this is the score function identity, a standard fact in statistics). You can therefore subtract any state-dependent baseline from the return without introducing bias:

$$\hat{g} = \sum_{t=0}^{T} \nabla_\theta \log \pi_\theta(a_t|s_t) (R_t(\tau) - b(s_t))$$

where $R_t(\tau)$ is the return from time $t$ onward (Williams also points out that you only need to use the return from time $t$ onward, because past rewards are not affected by the action at time $t$, which is another variance reduction that costs no bias).

The optimal baseline, in the sense of minimizing variance, is approximately the expected return from the state, $V(s) = \mathbb{E}[R_t | s_t = s]$. This is the state value function. If you can estimate $V(s)$, you can subtract it and get a lower-variance unbiased estimator. If you learn $V(s)$ with a separate network and subtract it, you have just derived actor-critic methods. If you define the advantage $A(s, a) = R_t - V(s)$ and use $A$ as the weighting term, you have derived advantage-weighted policy gradients, which are the direct ancestors of A2C, A3C, TRPO, and PPO.

I want to pause on this because the conceptual jump is small but the consequences are large. REINFORCE with a baseline looks like a minor variance reduction trick. But the baseline is a value function, and once you admit a value function into the algorithm, you have two networks that need to be trained jointly, and the interaction between them (policy depends on value estimates, value depends on policy's trajectory distribution) is the central dynamical issue in modern deep RL. Every stability issue in PPO training, every implementation detail about how to weight the policy and value losses, every trick about how to handle the advantage normalization, is a consequence of this interaction. And it all traces back to Williams's observation that the score function identity lets you subtract a baseline for free.

## The Assumptions That Actually Matter

Reading Williams in 2026, it is easy to skim the mathematical setup and miss the assumptions that are doing real work. I want to flag three.

First, the policy must be stochastic. If $\pi_\theta(a|s)$ is a deterministic function of the state, the log-derivative trick does not apply and the estimator is undefined. This is not a limitation in practice because policies with continuous parameterizations almost always induce stochastic outputs (softmax for discrete actions, Gaussian for continuous actions). But it means REINFORCE cannot directly train a deterministic policy. Deterministic policy gradient methods (Silver et al. 2014) required a separate derivation.

Second, the gradient of $\log \pi_\theta(a|s)$ must be computable. This is trivial for the standard output distributions: for a softmax policy, $\nabla_\theta \log \pi_\theta(a|s) = \nabla_\theta z_a - \sum_{a'} \pi_\theta(a'|s) \nabla_\theta z_{a'}$ where $z$ is the logit. For a Gaussian policy, it is similar. But for more exotic distributions (mixture models, autoregressive models, discrete latent structures), the log probability itself may be intractable, and REINFORCE is unavailable. This is one reason why the subsequent literature developed reparameterization tricks, straight-through estimators, and concrete distributions: they provide lower-variance gradients for cases where REINFORCE is applicable but too noisy, or they handle cases where the log probability is not directly computable.

Third, samples must come from the current policy. REINFORCE is an on-policy algorithm. If you use trajectories sampled from an older version of the policy, the estimator is biased. This is the origin of importance sampling corrections (which let you reuse off-policy data at the cost of further variance), of the trust region constraints in TRPO and PPO (which limit how far the policy can drift between data collection and updates), and of the distinction between on-policy and off-policy methods that organizes much of modern RL. The on-policy requirement is not stated dramatically in the paper, but it is the single property that most constrains how REINFORCE can be implemented in practice.

## The Connection to Modern Language Model Training

I said at the start that every RLHF gradient is a REINFORCE gradient. I want to make that precise because the connection is often stated loosely.

In RLHF, the policy is a language model $\pi_\theta(y|x)$ that maps a prompt $x$ to a response $y$. The reward $r(x, y)$ is produced by a separately trained reward model (or, in the case of GRPO and related methods, by a rule-based verifier). The goal is to maximize $\mathbb{E}_{x, y \sim \pi_\theta}[r(x, y)]$, possibly with a KL penalty against a reference policy to prevent reward hacking.

The gradient of this objective, ignoring the KL term for a moment, is:

$$\nabla_\theta \mathbb{E}[r(x, y)] = \mathbb{E}_{x, y \sim \pi_\theta}[\nabla_\theta \log \pi_\theta(y|x) \cdot r(x, y)]$$

This is literally the REINFORCE estimator applied to the language model policy. The reward is non-differentiable (it comes from a separate model or a verifier), so you cannot backpropagate through it. The sampling of $y$ is non-differentiable (it is autoregressive decoding with temperature or nucleus sampling). The likelihood ratio trick is the only way to get an unbiased gradient estimate, and that gives you REINFORCE.

PPO replaces the direct REINFORCE gradient with a clipped surrogate objective:

$$L^{\text{PPO}}(\theta) = \mathbb{E}\left[\min\left(\frac{\pi_\theta(y|x)}{\pi_{\theta_{\text{old}}}(y|x)} A(x, y), \text{clip}\left(\frac{\pi_\theta(y|x)}{\pi_{\theta_{\text{old}}}(y|x)}, 1-\epsilon, 1+\epsilon\right) A(x, y)\right)\right]$$

The ratio $\pi_\theta / \pi_{\theta_{\text{old}}}$ is an importance sampling correction that lets you take multiple gradient steps on data sampled from $\pi_{\theta_{\text{old}}}$. The clipping prevents the importance ratio from blowing up when the policy moves too far. The advantage $A(x, y)$ is the REINFORCE return with a value function baseline subtracted. Strip away the clipping and the importance sampling and you have advantage-weighted REINFORCE.

GRPO (Group Relative Policy Optimization, used in DeepSeek's R1 series) goes further: it removes the learned value function entirely and computes the advantage as a group-relative normalization of rewards within a batch of samples from the same prompt. This is a baseline choice. Instead of $b(s) = V(s)$, GRPO uses $b(x) = \text{mean}(r(x, y_i))$ over a group of responses $y_i$ sampled from the same $x$. The underlying gradient is still the REINFORCE gradient. The baseline has just been chosen to be something that can be computed without training a separate critic.

The practical development arc from REINFORCE to GRPO is thirty-four years, but the underlying estimator has not changed. What has changed is the variance reduction machinery, the trust region mechanisms, and the hardware we run it on. The core observation, that you can compute a gradient of a non-differentiable objective by reweighting log probabilities by returns, is Williams 1992.

## What the Paper Does Not Contain

It is worth being clear about what Williams does not do. He does not propose a deep neural network policy. The networks in the paper are small, often single-layer, and the tasks are toy. He does not propose temporal credit assignment beyond the naive return-to-go formulation. He does not introduce value functions (those come from the temporal difference tradition, which REINFORCE is somewhat independent of). He does not handle the exploration problem, except implicitly through the stochasticity of the policy. He does not discuss sample efficiency, which turns out to be the dominant practical consideration for policy gradient methods at scale.

The paper is narrow. It proves a theorem about an estimator, demonstrates the estimator on a few small problems, and stops. The contribution is foundational rather than exhaustive. This is the kind of paper I find most useful to review, because the theoretical core is small enough to understand completely, and the downstream literature can be organized as responses to the specific strengths and weaknesses of the foundational result.

## What I Think About This

The thing I keep returning to with REINFORCE is how little the math has changed. I can open the 1992 paper and the 2023 GRPO paper and the gradient expressions are the same up to notation. The intervening thirty-one years added variance reduction techniques, trust region methods, actor-critic architectures, and several entire subfields, but the gradient being estimated is the same gradient.

This is rare. Most foundational results in machine learning have been reformulated multiple times as the field's understanding deepened. Backpropagation looks different in a modern autograd library than it did in Rumelhart, Hinton, and Williams 1986. Attention in a Transformer looks different from attention in Bahdanau et al. 2014. The core ideas survive, but the mathematical framing often gets cleaner over time.

REINFORCE did not need to get cleaner. The log-derivative trick was already the right abstraction. The score function identity was already the right variance reduction. The on-policy requirement was already clear. Williams wrote down the clean version first, and the field has been extending it rather than rewriting it.

I think this is because the result sits at the intersection of probability theory and optimization in a particularly natural way. The log-derivative trick is a standard identity in statistics (it shows up in maximum likelihood estimation, in information theory, in the derivation of the Cramér-Rao bound). The baseline subtraction is a standard variance reduction technique (control variates). The on-policy requirement is a consequence of how expectations work under changes of measure. None of this is specific to neural networks or reinforcement learning. Williams's contribution was noticing that these standard tools, composed in a specific way, gave you a gradient estimator for stochastic policies. The composition was new. The ingredients were not.

This is a pattern I find increasingly common when I read old ML papers. The best ones do not invent new mathematics. They notice that existing mathematics, arranged correctly, solves the problem at hand. The rest is implementation.

## The Connection to What I Care About

From an interpretability perspective, REINFORCE-trained policies are harder to analyze than supervised models. In supervised learning, the gradient tells you what the network is trying to match, and the training signal is a direct function of the inputs. In REINFORCE, the gradient tells you what actions the network is trying to make more or less likely, but the training signal is the return, which is a function of the entire trajectory and the environment's response to the network's behavior.

This introduces a kind of indirection that is hard to trace. When a language model fine-tuned with RLHF produces a specific output, the output reflects not just the training data but the reward model's preferences and the policy gradient dynamics that propagated those preferences through the network's weights. Interpreting such a model requires understanding all three. The reward model is a separate artifact that needs its own interpretability analysis. The policy gradient dynamics are fundamentally stochastic and depend on the particular trajectories that were sampled during training. There is no clean decomposition.

The work I care about in RLHF interpretability is trying to separate these contributions. What features of the final model came from the pretraining data? What came from the reward model's shape? What came from the specific hyperparameters of the PPO or GRPO run? I do not know the answers. Nobody does, yet. But the questions only make sense if you understand that REINFORCE is the thing doing the credit assignment under the hood, and that the credit assignment is crude and noisy.

## The Bigger Picture

Policy gradient methods and value-based methods represent two different answers to the question of how to do reinforcement learning. Value-based methods (Q-learning, SARSA, DQN) estimate how good things are and derive behavior from the estimates. Policy gradient methods (REINFORCE, A2C, PPO) estimate gradients of the expected return with respect to the policy and follow them directly.

The tradeoffs are real. Value-based methods can reuse off-policy data and often have better sample efficiency. Policy gradient methods handle continuous action spaces natively and can represent stochastic policies directly. Hybrid methods (actor-critic, DDPG, SAC) use both a value function and a policy and try to get the benefits of each.

For language models specifically, policy gradient methods won. The reasons are pragmatic. Language model action spaces are discrete but enormous (the vocabulary is 100k+ tokens), making Q-learning impractical. Language model policies are naturally parameterized as probability distributions over tokens, making the score function readily computable. Language model training is already stochastic (sampling during generation), so the REINFORCE assumptions are satisfied by default. The alternative, trying to learn a $Q(x, y)$ value function over prompt-response pairs, does not scale.

This is why the current RLHF literature is essentially a policy gradient literature. The algorithms have different names (PPO, DPO, GRPO, RLOO, ReMax) and different specific variance reduction strategies, but they are all variations on REINFORCE. Williams is the ancestor of every one of them.

When I think about what comes next, the interesting direction is probably not a new gradient estimator. The log-derivative trick is not going to be improved on. The interesting direction is in how we use the gradient: what objective we are optimizing (preference learning, verifiable rewards, self-play), what baselines we use (learned value functions, group-relative baselines, offline estimates), and what constraints we impose (KL to a reference policy, trust regions, pessimism bounds). These are the degrees of freedom where research has room to move. The estimator itself is solved.

Williams wrote a thirty-four-year-old paper that still describes the gradient every language model is being trained with today. I do not know of a cleaner example of a result that did not need to be redone.

*Twelfth entry in the Paper Review series. Previous: S4 and Mamba.*
