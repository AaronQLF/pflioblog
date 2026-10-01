---
title: "Generative Flow Networks (Part 1): Why We Need GFlowNets"
date: "2026-09-30"
excerpt: "Why standard RL fails at exploration, why MCMC gets stuck, and why generative models struggle with unnormalized rewards. Introducing Generative Flow Networks (GFlowNets) as a paradigm shift for sampling proportional to reward over discrete DAGs."
tags: ["gflownets", "machine-learning", "math", "generative-models", "reinforcement-learning"]
series: "Generative Flow Networks"
seriesOrder: 1
readingTime: 14
---

*This is the first post in my series on **Generative Flow Networks (GFlowNets)**, drawing inspiration from the foundational theoretical framework developed by Bengio et al. (NeurIPS 2021, JMLR 2023) and Alex Hernández-García's GFlowNet course (IFT 6760B at UdeM / Mila). We'll explore why standard RL, MCMC, and classical generative models struggle with discrete multi-modal discovery, what GFlowNets do differently, and the core intuition behind flow-based sampling.*

---

In artificial intelligence, we spend an enormous amount of energy teaching models how to make decisions or generate objects. But when you look under the hood of modern generative models and Reinforcement Learning (RL) agents, a stark limitation appears:

1. **Reinforcement Learning** is phenomenal at finding a single optimal trajectory ($\max_x R(x)$), but it collapses into narrow modes when asked to generate a diverse set of high-reward candidates.
2. **Markov Chain Monte Carlo (MCMC)** can sample proportionally to an unnormalized reward ($P(x) \propto R(x)$) in theory, but in practice, it gets hopelessly trapped by high-energy barriers in discrete, combinatorial spaces.
3. **Standard Generative Models (VAEs, GANs, Autoregressive LLMs)** require huge datasets of positive examples $\mathcal{D}$. But in fields like drug discovery, material science, or causal inference, positive examples are exactly what we *don't* have—we only have an expensive oracle or simulator that evaluates a candidate's score $s(x)$ or reward $R(x)$.

Enter **Generative Flow Networks (GFlowNets)**, introduced by Emmanuel Bengio, Moksh Jain, Maksym Korablyov, Doina Precup, and Yoshua Bengio ([NeurIPS 2021](https://arxiv.org/abs/2106.04399)).

GFlowNets reframe discrete object generation as fluid flowing through a network. Instead of maximizing expected reward or chasing a single mode, GFlowNets train a policy to sample discrete objects with probability **strictly proportional to an unnormalized reward function**:

$$ P(x) = \frac{R(x)}{Z}, \quad \text{where } Z = \sum_{x' \in \mathcal{X}} R(x') = \sum_{x' \in \mathcal{X}} e^{\beta s(x')} $$

In this post, we'll dive into why existing paradigms break down, why proportional sampling is the holy grail for combinatorial discovery, and the fundamental mental model behind GFlowNets.

---

## 1. The Core Problem: Combinatorial Discovery

Imagine you are a computational chemist trying to discover a new drug to inhibit a target protein. 

In a fragment-based molecular generation task, the sample space $\mathcal{X}$ can easily exceed $10^{16}$ to $10^{60}$ valid graphs, with between 100 and 2,000 admissible constructive actions per state. Most candidates are useless ($R(x) \approx 0$). However, there are multiple distinct chemical families (modes in the reward landscape) that bind strongly to the target ($R(x) \gg 0$).

```
                      Reward Landscape R(x)
       Reward
         ▲          Mode 1           Mode 2           Mode 3
         │          ┌──┐             ┌──┐             ┌──┐
         │         ╱    ╲           ╱    ╲           ╱    ╲
         │        ╱      ╲         ╱      ╲         ╱      ╲
         │   ────┴────────┴───────┴────────┴───────┴────────┴────
         └────────────────────────────────────────────────────────►
                               Molecule Space X
```

In drug discovery, finding **one single molecule** with high reward is not enough. Why? Because that molecule might fail downstream toxicity tests, have poor solubility, or be impossible to synthesize in a lab. As emphasized by Bengio et al. (2021), *diversity of candidate generation is particularly critical when the evaluation oracle itself is uncertain*.

Let's look at why our standard machine learning toolkit struggles with this task.

---

## 2. Why Existing Paradigms Fall Short

### Failure Mode 1: Reinforcement Learning & Mode Collapse

Standard RL treats object generation as a Markov Decision Process (MDP) (e.g., Gottipati et al., ICML 2020). A policy $\pi(a|s)$ constructs an object $x$ step-by-step, receiving a terminal reward $R(x)$ upon completion. The objective in standard RL is to maximize expected return:

$$ \max_\pi \mathbb{E}_{x \sim \pi} [R(x)] $$

Because the RL objective only cares about maximizing expectation, algorithms like PPO or REINFORCE naturally exploit the easiest high-reward path they discover. Once the policy finds a single local peak in the reward landscape (e.g., Mode 1), gradient updates reinforce actions leading to Mode 1 while driving the probabilities of exploring Mode 2 or Mode 3 down to zero.

This phenomenon is known as **mode collapse** (or entropy collapse). 

> **The RL Dilemma:** Standard RL gives you the *argmax* ($\arg\max_x R(x)$). But when the search space is $10^{16}+$ and the reward function is imperfect, the argmax is almost certainly an over-fitted artifact of the reward model. We want *diversity proportional to reward*, not greedy exploitation.

```
Standard RL Policy Distribution             GFlowNet Policy Distribution
         ▲   Mode 1 (Exploited)                          ▲   Mode 1    Mode 2    Mode 3
         │   ┌──┐                                        │   ┌──┐      ┌──┐      ┌──┐
         │  ╱    ╲   (Modes 2 & 3 ignored)               │  ╱    ╲    ╱    ╲    ╱    ╲
         └──┴────┴──────────────────────►                └──┴────┴───┴────┴───┴────┴─────►
```

### Failure Mode 2: MCMC & The Curse of Energy Barriers

If RL is too greedy, why not use MCMC (such as Metropolis-Hastings or MARS by Xie et al., ICLR 2021)? MCMC is specifically designed to sample from target distributions defined by Energy-Based Models (EBMs):

$$ P(x) = \frac{e^{-E(x)}}{Z} = \frac{e^{\beta s(x)}}{Z} = \frac{R(x)}{Z} $$

In continuous spaces, Langevin dynamics or Hamiltonian Monte Carlo (HMC) work well because gradients guide samples across energy landscapes. But in discrete combinatorial spaces (like molecular graphs, DAGs, or code sequences):

1. **No Gradients:** You cannot take the gradient of a discrete graph structure with respect to its node connections.
2. **High-Energy Barriers:** Moving from one chemical mode to another requires destroying parts of the molecule (passing through intermediate states where $R(s) \approx 0$). Local MCMC proposals are rejected with near $100\%$ probability.

As a result, MCMC gets trapped in a single local mode for millions of steps, leading to extremely slow mixing times.

### Failure Mode 3: Supervised Generative Models Require Datasets

Generative models like VAEs, GANs, and Autoregressive Transformers learn a distribution $P_\theta(x)$ by fitting empirical training data $\mathcal{D}$:

$$ \max_\theta \mathbb{E}_{x \sim \mathcal{D}} [\log P_\theta(x)] $$

This works brilliantly when you have billions of text tokens or millions of images. But in scientific discovery, **the dataset of undiscovered high-reward objects does not exist yet**. 

You cannot train an autoregressive model on positive examples if discovering those positive examples is the very goal of your research! You only have an oracle evaluation function $R(x)$.

---

## 3. The GFlowNet Paradigm Shift

GFlowNets solve this by unifying the generative capabilities of deep learning with the target-sampling guarantees of MCMC and the sequential decision-making of RL.

| Feature | Standard RL (PPO) | MCMC / MARS | Autoregressive Models | GFlowNets |
| :--- | :--- | :--- | :--- | :--- |
| **Objective** | Maximize $\mathbb{E}[R(x)]$ | Sample $P(x) \propto R(x)$ | Fit empirical data $\mathcal{D}$ | Sample $P(x) \propto R(x)$ |
| **Sampling Target** | Argmax (Single mode) | True proportional sampling | Data distribution | True proportional sampling |
| **Space Type** | Discrete / Continuous | Discrete / Continuous | Discrete sequences | Discrete DAGs / Continuous |
| **Mixing Speed** | N/A (Exploitative) | Extremely slow (Trapped) | Fast (Single forward pass) | Fast (Generative policy) |
| **Requires Dataset?** | No (Uses Reward) | No (Uses Reward) | **Yes** (Needs data $\mathcal{D}$) | No (Uses Reward) |

---

## 4. The Mental Model: Water Flowing Through a DAG

How does a GFlowNet sample proportionally to $R(x)$ in a single forward generation pass?

Think of generation as a network of pipes—a **Directed Acyclic Graph (DAG)** $\mathcal{G} = (\mathcal{S}, \mathcal{A})$.

1. **Source State ($s_0$):** Every generation trajectory begins at a single origin state $s_0$ (e.g., an empty graph or empty molecule scaffold). Imagine a continuous supply of water flowing into $s_0$ at a total rate of $Z$ liters per second.
2. **States & Actions ($s \to s'$):** As water moves through the network, it reaches intermediate states $s \in \mathcal{S}$ and splits into downstream child states $s'$ along directed action edges $(s \to s')$.
3. **Terminal States ($x \in \mathcal{X}$):** Water eventually reaches sink nodes—terminal states $x \in \mathcal{X}$ with no outgoing edges.
4. **Conservation of Flow:** Water cannot be created or destroyed at intermediate nodes. The total volume flowing into state $s$ must equal the total volume flowing out of state $s$.

```
                            [ s_0 ]  (Source Flow Z)
                            ╱     ╲
                           ╱       ╲
                        [ s_1 ]   [ s_2 ]
                        ╱    ╲     ╱    ╲
                      [x_1]  [x_2]   [x_3] (Terminal Sinks)
                      R(x_1) R(x_2)  R(x_3)
```

Now here is the master insight:

If we constrain the network so that the total volume of water exiting into each terminal sink $x$ is **exactly equal to its reward $R(x)$**, then:

1. The total water entering at the source $s_0$ must equal the sum of all terminal rewards:
   $$ Z = \sum_{x \in \mathcal{X}} R(x) $$
2. If we sample paths through the network by following the proportion of water flowing down each pipe, the probability of ending up at terminal state $x$ is:
   $$ P(x) = \frac{\text{Flow into } x}{\text{Total Flow at Source}} = \frac{R(x)}{Z} $$

This is the foundational principle of GFlowNets: **By enforcing flow conservation across a DAG whose sinks absorb flow equal to $R(x)$, a stochastic policy following the edge flows samples terminal objects strictly proportional to their rewards.**

---

## 5. Path Multiplicity: DAGs vs. Trees

A crucial distinction between GFlowNets and standard tree-search algorithms (like Monte Carlo Tree Search or MDP policies) is **path multiplicity**.

In many discrete domains, the exact same terminal object $x$ can be constructed through multiple different action sequences. 

For example, consider building a molecular graph with atoms $\{A, B, C\}$:
- Sequence 1: Add atom $A \to$ Add atom $B \to$ Add atom $C$.
- Sequence 2: Add atom $B \to$ Add atom $A \to$ Add atom $C$.

```
                       s_0 (Empty)
                      ╱           ╲
          Add A      ╱             ╲      Add B
                    ▼               ▼
                 {A}                 {B}
                    ╲               ╱
          Add B      ╲             ╱      Add A
                      ▼           ▼
                         {A, B}
                           │
                           │ Add C
                           ▼
                       {A, B, C} (Terminal Object x)
```

In a standard MDP or tree, these two sequences correspond to two completely separate leaves with separate rewards. If you aren't careful, an algorithm will overcount objects that can be synthesized through thousands of paths compared to objects that can only be built through a single unique path.

GFlowNets naturally handle **DAG state spaces** where multiple trajectory paths merge into the same state $s$. By maintaining flow conservation across incoming parents and outgoing children, GFlowNets guarantee that the *total combined flow* reaching $x$ equals $R(x)$, regardless of how many paths lead to $x$.

---

## 6. What's Next?

We now understand *why* GFlowNets are essential: they allow us to train fast generative policies that sample diverse, multi-modal discrete objects proportional to an unnormalized reward $R(x)$, overcoming the mode collapse of RL and the slow mixing of MCMC.

In **[Part 2](/blog/gflownets-pt2-the-math-and-objectives)**, we will dive into the exact mathematics:
- Formal definitions from *GFlowNet Foundations* (Bengio et al., JMLR 2023).
- Forward policies $P_F(s'|s)$, backward policies $P_B(s|s')$, and partition functions $Z$.
- The **Flow Matching (FM)** objective and why it mirrors Kirchhoff's current laws.
- The **Detailed Balance (DB)** and **Trajectory Balance (TB)** objectives.

---

*Continue to [Part 2: The Core Math & Loss Objectives](/blog/gflownets-pt2-the-math-and-objectives).*
