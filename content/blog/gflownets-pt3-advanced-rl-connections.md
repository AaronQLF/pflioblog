---
title: "Generative Flow Networks (Part 3): MaxEnt RL, Continuous GFlowNets, and Applications"
date: "2026-09-30"
excerpt: "Connecting GFlowNets to Maximum Entropy RL, Soft Q-Learning, and Continuous Flow Matching. Exploring transition kernels, off-policy exploration, benchmark grid/molecule results, and real-world scientific applications."
tags: ["gflownets", "rl", "diffusion", "math", "deep-learning"]
series: "Generative Flow Networks"
seriesOrder: 3
readingTime: 15
---

*This is the third and final post in my series on **Generative Flow Networks (GFlowNets)**. In [Part 1](/blog/gflownets-pt1-why-and-what), we covered why GFlowNets are needed for multi-modal discrete sampling. In [Part 2](/blog/gflownets-pt2-the-math-and-objectives), we derived the core math, flow conservation, and Trajectory Balance. Today, we draw from Salem Lahlou et al. (ICML 2023), Tristan Deleu's PhD thesis (UdeM 2025), and Alex Hernández-García's GFlowNet course (IFT 6760B) to connect GFlowNets to Maximum Entropy RL, continuous space kernels, and scientific benchmarks.*

---

Over the first two parts of this series, we built GFlowNets from first principles:
- **Part 1:** Re-framed discrete generation as fluid flow through a DAG to achieve proportional reward sampling $P(x) = \frac{R(x)}{Z}$.
- **Part 2:** Derived Trajectory Balance (TB) loss:
  $$ \mathcal{L}_{\text{TB}}(\tau; \theta) = \left( \log Z_\theta + \sum_{t=0}^{n-1} \log P_F(s_{t+1}|s_t; \theta) - \log R(x) - \sum_{t=0}^{n-1} \log P_B(s_t|s_{t+1}; \theta) \right)^2 $$

Now, we step back to answer the bigger theoretical and practical questions:
1. How do GFlowNets mathematically connect to **Maximum Entropy RL** and **Soft Q-Learning**?
2. How do GFlowNets generalize to **continuous spaces** via transition kernels $\kappa(s'|s)$?
3. Why is **off-policy exploration** in GFlowNets so remarkably easy compared to standard RL?
4. What do benchmark results show on 4D Hyper-grids and fragment-based molecular generation ($10^{16}$ candidates)?

---

## 1. The Bridge to Maximum Entropy RL

If you come from a Reinforcement Learning background, GFlowNets might feel suspiciously similar to **Maximum Entropy RL (MaxEnt RL)** and **Soft Q-Learning**.

In MaxEnt RL, the objective is to maximize expected reward plus policy entropy:

$$ \max_\pi \mathbb{E}_{\tau \sim \pi} \left[ \sum_{t=0}^{T-1} r(s_t, a_t) + \alpha \mathcal{H}(\pi(\cdot|s_t)) \right] $$

This leads to a soft optimal policy of the form:

$$ \pi^*(a|s) \propto \exp \left( \frac{Q^*(s, a)}{\alpha} \right) $$

What is the exact mathematical relationship between MaxEnt RL and GFlowNets?

### The Tree Case: Exact Equivalence
When the state space $\mathcal{G}$ is a **tree**—meaning every state $s$ has exactly **one unique path** from initial state $s_0$—GFlowNets and Soft Q-Learning (or Path Consistency Learning) are **mathematically equivalent**.

In a tree, the backward policy $P_B(s|s') = 1$ deterministically (since there is only one parent). If we set $P_B = 1$, Trajectory Balance simplifies to:

$$ \log Z + \sum_{t=0}^{n-1} \log P_F(s_{t+1}|s_t) = \log R(x) $$

By defining state values as log-flows $V(s) = \log F(s)$ and state-action values as log-edge flows $Q(s, a) = \log F(s \to a)$, the Soft Bellman backup emerges directly:

$$ V(s) = \log \sum_{a} \exp(Q(s, a)) \quad \text{and} \quad P_F(a|s) = \exp(Q(s, a) - V(s)) $$

### The DAG Case: Where GFlowNets Diverge
However, real-world discrete spaces are **DAGs**, not trees. Multiple action paths merge into the same state $x$.

```
                       Path Multiplicity in a DAG:
                                 [ s_0 ]
                                 ╱     ╲
                         Path A ╱       ╲ Path B
                               ▼         ▼
                             [ s_1 ]   [ s_2 ]
                               ╲         ╱
                                ▼       ▼
                             [ Terminal x ]
```

This is where standard MaxEnt RL breaks down:
1. **MaxEnt RL optimizes trajectory entropy, not state entropy:** In a DAG, MaxEnt RL assigns probability to trajectories proportional to path reward. If state $x$ can be reached via 1,000 distinct paths, MaxEnt RL will sample state $x$ **1,000 times more frequently** than an identical reward state $y$ that can only be reached via 1 path!
2. **GFlowNets explicitly account for path multiplicity:** By incorporating the backward policy $P_B(s|s')$, GFlowNets divide the total incoming flow among converging paths. Consequently, GFlowNets guarantee that the **marginal probability over terminal states $x$** is proportional to $R(x)$, regardless of path count.

---

## 2. Generalization to Continuous GFlowNets

As formulated by Salem Lahlou et al. ([ICML 2023](https://arxiv.org/abs/2301.12594)), the theory of GFlowNets generalizes to **continuous and hybrid state spaces** $\mathcal{S} \subseteq \mathbb{R}^d$.

Discrete GFlowNets are a special case of this broader measure-theoretic framework.

```
          Discrete vs. Continuous GFlowNets (Lahlou et al., ICML 2023)

   Property            Discrete GFlowNets             Continuous GFlowNets
  ─────────────────────────────────────────────────────────────────────────────
   State transitions   Action masses P_F(s'|s)        Transition Kernels κ(s'|s)
   Policy output       Multinomial / Categorical      Continuous distributions
                                                      (e.g., von Mises, Gaussians)
   Flow Conservation   Sum over parents / children    Integrals over state space
   Trajectory length   Bounded step count N           Bounded horizon T
```

### Transition Kernels $\kappa_F$ and $\kappa_B$
In continuous spaces, we replace discrete action probabilities $P_F(s'|s)$ with **forward transition kernels** $\kappa_F(s'|s)$, which specify probability density over reachable states $s'$. Similarly, **backward transition kernels** $\kappa_B(s|s')$ define reverse densities returning toward $s_0$.

The Continuous Trajectory Balance condition becomes:

$$ Z \prod_{t=0}^{T-1} \kappa_F(s_{t+1}|s_t) = R(x) \prod_{t=0}^{T-1} \kappa_B(s_t|s_{t+1}) $$

### Key Continuous Domains:
1. **Continuous Torus:** Used to sample Boltzmann distributions of molecules parameterized by continuous torsion angles $\theta \in [0, 2\pi)^d$ using mixtures of von Mises distributions.
2. **Continuous Hyper-cube:** Serves as the foundation for Euclidean spaces where trajectories increment continuous coordinate vectors bounded by finite step horizons.

---

## 3. Off-Policy Exploration Without Importance Sampling

One of the greatest practical advantages of GFlowNets is their extraordinary flexibility with **off-policy training data**.

In standard policy gradient methods (PPO, REINFORCE), if you evaluate trajectories generated by an exploration policy $\pi_{\text{exp}} \neq \pi_\theta$, you must multiply gradients by importance sampling ratios $\frac{\pi_\theta(\tau)}{\pi_{\text{exp}}(\tau)}$. These ratios suffer from exploding or vanishing variance over long horizons.

### Why GFlowNets Train Off-Policy Effortlessly
Notice the Trajectory Balance loss:

$$ \mathcal{L}_{\text{TB}}(\tau; \theta) = \left( \log Z_\theta + \sum_{t=0}^{n-1} \log P_F(s_{t+1}|s_t; \theta) - \log R(x) - \sum_{t=0}^{n-1} \log P_B(s_t|s_{t+1}; \theta) \right)^2 $$

TB is a **pointwise structural constraint** on paths. The equation $Z \prod P_F = R \prod P_B$ must hold true for **every valid trajectory $\tau$ in the DAG**, regardless of who sampled $\tau$!

Whether a trajectory was sampled by:
- The current forward policy $P_F$
- An tempered exploration policy $P_F^{\text{temp}}$ with high temperature
- An $\epsilon$-greedy noisy policy
- A prior dataset of historical experiments $\mathcal{D}$
- Random walk rollouts

You can plug **any valid trajectory $\tau$** into $\mathcal{L}_{\text{TB}}$ and update $\theta$ via standard gradient descent—**without any importance weights!**

```
              ┌─────────────────────────────────────────┐
              │           Replay Buffer Trajectories    │
              │  - Exploratory Rollouts                 │
              │  - Historical Experimental Data         │
              │  - High-Temperature Policy Samples      │
              └────────────────────┬────────────────────┘
                                   │  (No Importance Weights)
                                   ▼
                   ┌───────────────────────────────┐
                   │  Trajectory Balance Loss      │
                   │  L_TB(τ; θ)  -->  Update θ   │
                   └───────────────────────────────┘
```

This makes GFlowNet training exceptionally robust against premature convergence and mode collapse.

---

## 4. Empirical Benchmarks & Real-World Applications

### Benchmark 1: 4D Hyper-Grid ($8^4 = 4096$ States)
In the canonical hyper-grid task (Bengio et al., 2021), trajectories start at corner $s_0 = (0,0,0,0)$ and increment coordinates up to length 8.
- **Results:** While MCMC gets trapped in one of the 4 high-reward corners and RL collapses into greedy exploitation of a single corner, GFlowNets discover and sample **all 4 reward modes proportionally to their peak height**, maintaining uniform coverage of intermediate states visited.

### Benchmark 2: Fragment-Based Molecule Generation ($10^{16}$ Candidates)
Building small molecules from chemical building blocks (100–2,000 actions per state):
- **Reward:** $R(x) = \text{Binding Energy}(x)^\beta$ against target protein targets.
- **Results:** GFlowNets generate significantly more **unique, high-scoring molecules** across diverse chemical scaffolds compared to MCMC (MARS) and RL baselines (Gottipati et al., ICML 2020), exhibiting higher empirical reward density than reference datasets.

```
                         GFlowNet Applications
       ┌───────────────────────────┼───────────────────────────┐
       ▼                           ▼                           ▼
[ Molecular Discovery ]   [ Biological Sequences ]   [ Causal Structure ]
 (3D Drug Candidates)      (RNA / Protein Sequences)   (Bayesian Network DAGs)
```

### Key Scientific Applications:
1. **De Novo Drug Discovery:** Generating 3D molecular graphs satisfying multi-objective constraints (affinity, solubility, synthesizability).
2. **Biological Sequence Design:** Generating RNA and aptamer sequences targeting specific binding structures.
3. **Causal DAG Structure Discovery:** Sampling directed acyclic graphs over causal variables directly from the posterior distribution $P(G|\mathcal{D}) \propto P(\mathcal{D}|G) P(G)$ (Deleu et al., PhD Thesis 2025).
4. **LLM Search & Reasoning:** Guiding multi-step chain-of-thought search trees where verifying intermediate steps produces flow signals, preventing repetitive reasoning loops.

---

## 5. Summary of the Series

Across this 3-part series, we have journeyed through the full landscape of Generative Flow Networks:

1. **Part 1 (The Why & What):** Identified why RL collapses to single modes, why MCMC gets trapped, and how GFlowNets solve multi-modal sampling by framing generation as fluid flow through a DAG.
2. **Part 2 (The Core Math):** Formulated DAG state spaces, forward/backward policies, Kirchhoff's flow conservation, FM/DB/SubTB losses, and derived the Trajectory Balance (TB) loss function:
   $$ Z \prod P_F(s_{t+1}|s_t) = R(x) \prod P_B(s_t|s_{t+1}) $$
3. **Part 3 (Connections & Applications):** Showed how GFlowNets generalize MaxEnt RL to DAGs with path multiplicity, extend to continuous spaces via transition kernels $\kappa(s'|s)$ (Lahlou et al., ICML 2023), train off-policy without importance sampling, and power real-world discovery.

GFlowNets represent a paradigm shift in generative modeling—moving us away from merely mimicking historical datasets toward actively exploring and sampling complex, high-dimensional spaces proportional to value.

---

*Revisit [Part 1: Why We Need GFlowNets](/blog/gflownets-pt1-why-and-what) or [Part 2: The Core Math & Loss Objectives](/blog/gflownets-pt2-the-math-and-objectives).*
