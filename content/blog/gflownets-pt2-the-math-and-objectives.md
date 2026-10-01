---
title: "Generative Flow Networks (Part 2): The Core Math & Loss Objectives"
date: "2026-09-30"
excerpt: "Diving into the mathematical foundations of GFlowNets: DAG state spaces, forward/backward policies, flow conservation, Flow Matching (FM), Detailed Balance (DB), and Trajectory Balance (TB)."
tags: ["gflownets", "math", "optimization", "probability", "deep-learning"]
series: "Generative Flow Networks"
seriesOrder: 2
readingTime: 16
---

*This is the second post in my series on **Generative Flow Networks (GFlowNets)**. In [Part 1](/blog/gflownets-pt1-why-and-what), we established why GFlowNets are needed to sample diverse objects proportional to reward. Today, we unpack the mathematical engine behind GFlowNets drawing from Bengio et al. (JMLR 2023), Malkin et al. (NeurIPS 2022), and Alex Hernández-García's GFlowNet course (IFT 6760B at UdeM / Mila).*

---

In [Part 1](/blog/gflownets-pt1-why-and-what), we introduced the intuition of GFlowNets: treating discrete object generation as fluid flowing through a Directed Acyclic Graph (DAG) such that the total flow exiting at any terminal state $x$ equals its unnormalized reward $R(x)$.

Today, we make that intuition mathematically precise. We will derive the relationship between flows and stochastic policies, prove why flow conservation yields proportional sampling $P(x) = \frac{R(x)}{Z}$, and break down the loss objectives used to train modern deep GFlowNets (Flow Matching, Detailed Balance, Trajectory Balance, and Sub-Trajectory Balance).

---

## 1. Formal Setup: The DAG State Space

Let $\mathcal{G} = (\mathcal{S}, \mathcal{A})$ be a **Directed Acyclic Graph (DAG)** representing the state space of generation (*GFlowNet Foundations*, Bengio et al., JMLR 2023).

- **States ($\mathcal{S}$):** Each state $s \in \mathcal{S}$ represents a partially constructed object (e.g., a partial graph, a partial sequence, or an incomplete molecule).
- **Actions ($\mathcal{A}$):** Directed edges $(s \to s') \in \mathcal{A}$ represent valid constructive actions that transition state $s$ to state $s'$.
- **Source State ($s_0$):** A unique initial state with no incoming edges ($\text{Parents}(s_0) = \emptyset$). Every generation trajectory starts at $s_0$.
- **Terminal States ($\mathcal{X} \subset \mathcal{S}$):** Sink states representing fully completed objects. Terminal states have no outgoing constructive edges ($\text{Children}(x) = \emptyset$ for $x \in \mathcal{X}$).
- **Trajectories ($\tau$):** A valid sequence of transitions starting at $s_0$ and terminating at $x \in \mathcal{X}$:
  $$ \tau = (s_0 \to s_1 \to s_2 \to \dots \to s_n = x) $$

We are given a non-negative reward function $R: \mathcal{X} \to \mathbb{R}_{\geq 0}$. Our goal is to train a parameterized policy to generate terminal objects $x \in \mathcal{X}$ with probability:

$$ P(x) = \frac{R(x)}{Z}, \quad Z = \sum_{x' \in \mathcal{X}} R(x') $$

---

## 2. From Flows to Policies: Forward and Backward Flows

To build a probabilistic model on a DAG, we introduce non-negative scalar quantities called **flows**:

1. **Trajectory Flow $F(\tau)$:** The volume of flow passing through a complete trajectory $\tau$.
2. **State Flow $F(s)$:** The total volume of flow passing through state $s \in \mathcal{S}$:
   $$ F(s) = \sum_{\tau \ni s} F(\tau) $$
3. **Edge Flow $F(s \to s')$:** The volume of flow passing through directed edge $(s \to s') \in \mathcal{A}$:
   $$ F(s \to s') = \sum_{\tau \ni (s \to s')} F(\tau) $$

```
                         State Flow F(s)
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
       Edge Flow F(s -> s'_1)        Edge Flow F(s -> s'_2)
                │                             │
                ▼                             ▼
         State F(s'_1)                 State F(s'_2)
```

### Forward Policy $P_F(s'|s)$
The **forward policy** $P_F(s'|s)$ is the probability of taking action $s \to s'$ given that we are currently at state $s$. It is defined as the fraction of flow exiting $s$ towards child $s'$:

$$ P_F(s'|s) = \frac{F(s \to s')}{\sum_{s'' \in \text{Children}(s)} F(s \to s'')} = \frac{F(s \to s')}{F(s)} $$

By construction, $\sum_{s' \in \text{Children}(s)} P_F(s'|s) = 1$.

### Backward Policy $P_B(s|s')$
The **backward policy** $P_B(s|s')$ is the probability that we arrived at state $s'$ from parent state $s$. It is defined as the fraction of flow entering $s'$ coming from parent $s$:

$$ P_B(s|s') = \frac{F(s \to s')}{\sum_{s'' \in \text{Parents}(s')} F(s'' \to s')} = \frac{F(s \to s')}{F(s')} $$

By construction, $\sum_{s \in \text{Parents}(s')} P_B(s|s') = 1$.

---

## 3. Flow Conservation & The Target Sampling Guarantee

Now we state the fundamental theorem of GFlowNets.

### Flow Conservation Equation (Kirchhoff's Law)
For any non-initial, non-terminal state $s \in \mathcal{S} \setminus (\{s_0\} \cup \mathcal{X})$, the total flow entering $s$ from its parents must equal the total flow exiting $s$ to its children:

$$ \sum_{s' \in \text{Parents}(s)} F(s' \to s) = F(s) = \sum_{s'' \in \text{Children}(s)} F(s \to s'') $$

### Boundary Conditions
1. **Source Flow:** The total flow exiting $s_0$ equals the partition function $Z$:
   $$ F(s_0) = \sum_{s' \in \text{Children}(s_0)} F(s_0 \to s') = Z $$
2. **Terminal Flow:** The total flow entering terminal state $x \in \mathcal{X}$ equals its unnormalized reward $R(x)$:
   $$ F(x) = \sum_{s' \in \text{Parents}(x)} F(s' \to x) = R(x) $$

### The Fundamental Theorem
> **Theorem (Bengio et al., 2021/2023):** If flow conservation holds for all states $s \in \mathcal{S}$, and terminal state flows satisfy $F(x) = R(x)$ for all $x \in \mathcal{X}$, then sampling trajectories from $s_0$ according to forward policy $P_F(s'|s)$ guarantees that the marginal probability of terminating at object $x$ is:
> $$ P(x) = \frac{R(x)}{Z} \quad \text{where } Z = F(s_0) = \sum_{x' \in \mathcal{X}} R(x') $$

*Proof Sketch:* The probability of generating trajectory $\tau = (s_0 \to s_1 \to \dots \to s_n = x)$ under $P_F$ is $P_F(\tau) = \prod_{t=0}^{n-1} P_F(s_{t+1}|s_t)$. Substituting $P_F(s_{t+1}|s_t) = \frac{F(s_t \to s_{t+1})}{F(s_t)}$ yields a telescoping product:

$$ P_F(\tau) = \frac{F(s_0 \to s_1)}{F(s_0)} \cdot \frac{F(s_1 \to s_2)}{F(s_1)} \dots \frac{F(s_{n-1} \to x)}{F(s_{n-1})} = \frac{F(\tau)}{F(s_0)} = \frac{F(\tau)}{Z} $$

Summing over all paths leading to $x$:

$$ P(x) = \sum_{\tau \to x} P_F(\tau) = \frac{\sum_{\tau \to x} F(\tau)}{Z} = \frac{F(x)}{Z} = \frac{R(x)}{Z} \quad \blacksquare $$

---

## 4. The Core Loss Objectives

In deep learning, we don't know the exact flows $F(s \to s')$. Instead, we train neural networks with parameters $\theta$ to approximate flows or policies.

---

### Objective 1: Flow Matching (FM) Loss

The **Flow Matching** loss directly enforces Kirchhoff's flow conservation law at every intermediate state $s'$.

In practical neural implementations (as presented in session 5 of IFT 6760B), edge flows are parameterized in log-space $F^{\text{log}}_\theta(s, a) = \log F_\theta(s \to s')$. The loss along sampled trajectory $\tau$ penalizes the log-difference between total incoming edge flow and total outgoing edge flow at state $s'$:

$$ \mathcal{L}_{\text{FM}}(s'; \theta) = \left( \log \sum_{s, a: T(s,a)=s'} \exp F^{\text{log}}_\theta(s, a) - \log \sum_{a' \in \mathcal{A}(s')} \exp F^{\text{log}}_\theta(s', a') \right)^2 $$

For terminal states $x \in \mathcal{X}$, the outgoing flow term is replaced by the reward $R(x)$:

$$ \mathcal{L}_{\text{FM}}(x; \theta) = \left( \log \sum_{s, a: T(s,a)=x} \exp F^{\text{log}}_\theta(s, a) - \log R(x) \right)^2 $$

```
Flow Matching (FM) at State s:
     Inflows from Parents                     Outflows to Children
  F(p_1 -> s) ─┐                          ┌─► F(s -> c_1)
  F(p_2 -> s) ─┼──► [ Sum log Inflows ] ══ [ Sum log Outflows ] ──┼─► F(s -> c_2)
  F(p_3 -> s) ─┘                          └─► F(s -> c_3)
```

#### Verdict on FM:
- **Pros:** Conceptually simple and intuitive.
- **Cons:** Requires summing over **all parents** of state $s$. In complex graph spaces (like molecular graphs), a state $s$ might have thousands of parents, making $\text{Parents}(s)$ computationally intractable to enumerate!

---

### Objective 2: Detailed Balance (DB) Loss

To avoid summing over all parents, **Detailed Balance** breaks flow conservation down to individual transitions $(s \to s')$.

Notice that by definition:
$$ F(s \to s') = F(s) P_F(s'|s) = F(s') P_B(s|s') $$

This leads to the Detailed Balance relation:

$$ \text{Flow leaving } s \text{ towards } s' = \text{Flow entering } s' \text{ from } s $$

Instead of learning edge flows $F(s \to s')$, we parameterize:
1. A state flow network $F_\theta(s)$
2. A forward policy network $P_F(s'|s; \theta)$
3. A backward policy network $P_B(s|s'; \theta)$

The **Detailed Balance Loss** over edge $(s \to s')$ is:

$$ \mathcal{L}_{\text{DB}}(s, s'; \theta) = \left( \log F_\theta(s) + \log P_F(s'|s; \theta) - \log F_\theta(s') - \log P_B(s|s'; \theta) \right)^2 $$

For transitions into terminal state $x \in \mathcal{X}$, $F(x)$ is fixed to $R(x)$:

$$ \mathcal{L}_{\text{DB}}(s, x; \theta) = \left( \log F_\theta(s) + \log P_F(x|s; \theta) - \log R(x) - \log P_B(s|x; \theta) \right)^2 $$

---

### Objective 3: Trajectory Balance (TB) Loss (The Deep Learning Workhorse)

Introduced by Nikolay Malkin et al. ([NeurIPS 2022](https://arxiv.org/abs/2201.13259)), **Trajectory Balance** telescopes Detailed Balance over an entire trajectory $\tau = (s_0 \to s_1 \to \dots \to s_n = x)$.

Multiplying DB equations along the path:

$$ F(s_0) \prod_{t=0}^{n-1} P_F(s_{t+1}|s_t) = F(x) \prod_{t=0}^{n-1} P_B(s_t|s_{t+1}) $$

Substituting $F(s_0) = Z$ and $F(x) = R(x)$:

$$ Z \prod_{t=0}^{n-1} P_F(s_{t+1}|s_t) = R(x) \prod_{t=0}^{n-1} P_B(s_t|s_{t+1}) $$

Taking the logarithm gives the **Trajectory Balance (TB)** relation:

$$ \log Z + \sum_{t=0}^{n-1} \log P_F(s_{t+1}|s_t) = \log R(x) + \sum_{t=0}^{n-1} \log P_B(s_t|s_{t+1}) $$

In TB, we parameterize:
1. A single scalar parameter $Z_\theta$ (representing $\log Z$)
2. Forward policy $P_F(s_{t+1}|s_t; \theta)$
3. Backward policy $P_B(s_t|s_{t+1}; \theta)$

The **Trajectory Balance Loss** for trajectory $\tau$ is:

$$ \mathcal{L}_{\text{TB}}(\tau; \theta) = \left( \log Z_\theta + \sum_{t=0}^{n-1} \log P_F(s_{t+1}|s_t; \theta) - \log R(x) - \sum_{t=0}^{n-1} \log P_B(s_t|s_{t+1}; \theta) \right)^2 $$

```
Trajectory Balance (TB) End-to-End Constraint:

  Forward Path:   log Z  +  ∑ log P_F(s_{t+1} | s_t)
                                 ║ (Must Equal)
  Backward Path:  log R(x) + ∑ log P_B(s_t | s_{t+1})
```

#### Why TB is the Preferred Objective in Modern GFlowNets:
1. **No Intermediate State Flows:** TB completely eliminates the need to estimate state flows $F(s)$ for intermediate states! We only need to learn $Z_\theta$, $P_F$, and $P_B$.
2. **Learns the Partition Function ($Z$):** After training, $Z_\theta$ gives an explicit estimate of the normalizing constant $Z = \sum_{x \in \mathcal{X}} R(x)$.
3. **Low Variance & End-to-End Credit Assignment:** Gradient signals flow directly from terminal reward $R(x)$ back to the initial state $s_0$ along the sampled trajectory.

---

### Objective 4: Sub-Trajectory Balance (SubTB)

What if a trajectory $\tau$ is very long (e.g., 500 steps)? Credit assignment across full trajectories in TB can suffer from high variance when $n$ is large, while DB operates only on length-1 transitions.

**Sub-Trajectory Balance (SubTB)** interpolates between DB and TB by enforcing flow balance across sub-trajectories $(s_i \to \dots \to s_j)$ for $0 \leq i < j \leq n$:

$$ F(s_i) \prod_{t=i}^{j-1} P_F(s_{t+1}|s_t) = F(s_j) \prod_{t=i}^{j-1} P_B(s_t|s_{t+1}) $$

$$ \mathcal{L}_{\text{SubTB}}(s_i, s_j; \theta) = \left( \log F_\theta(s_i) + \sum_{t=i}^{j-1} \log P_F(s_{t+1}|s_t; \theta) - \log F_\theta(s_j) - \sum_{t=i}^{j-1} \log P_B(s_t|s_{t+1}; \theta) \right)^2 $$

- When $j = i+1$, SubTB reduces exactly to **Detailed Balance (DB)**.
- When $i = 0$ and $j = n$, SubTB reduces exactly to **Trajectory Balance (TB)**.

---

## 5. Summary Comparison of Objectives

| Feature | Flow Matching (FM) | Detailed Balance (DB) | Trajectory Balance (TB) | Sub-Trajectory Balance (SubTB) |
| :--- | :--- | :--- | :--- | :--- |
| **Constraint Level** | State-level (In vs Out) | Edge-level ($(s \to s')$) | Trajectory-level ($\tau$) | Sub-trajectory ($(s_i \to s_j)$) |
| **Parameters Needed** | Edge flows $F_\theta(s \to s')$ | $F_\theta(s)$, $P_F$, $P_B$ | Scalar $Z_\theta$, $P_F$, $P_B$ | $F_\theta(s)$, $P_F$, $P_B$ |
| **Requires Parent Sum?** | **Yes** (Intractable for graphs) | No | No | No |
| **Estimates Intermediate $F(s)$?** | Yes | Yes | **No** | Yes |
| **Estimates $\log Z$?** | Indirectly via $F(s_0)$ | Indirectly via $F(s_0)$ | **Direct scalar $Z_\theta$** | Direct via $F(s_0)$ |
| **Variance / Stability** | Medium | Higher | **Lowest / Most Stable** | Balanced |

---

## 6. What's Next?

We now have the complete mathematical foundation of GFlowNets: DAG flow conservation, forward/backward policy dynamics, and the Trajectory Balance objective $\mathcal{L}_{\text{TB}}$.

In **[Part 3](/blog/gflownets-pt3-advanced-rl-connections)**, we will explore:
- Theoretical connections to **Maximum Entropy RL**, **Soft Q-Learning**, and Path Consistency Learning.
- How GFlowNets extend to **continuous spaces** (Lahlou et al., ICML 2023) via continuous transition kernels $\kappa(s'|s)$ and Continuous Flow Matching.
- Off-policy exploration strategies, benchmark experiments (4D hyper-grid and fragment molecular generation), and real-world scientific applications.

---

*Continue to [Part 3: MaxEnt RL Connections, Diffusion, & Applications](/blog/gflownets-pt3-advanced-rl-connections).*
