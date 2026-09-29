---
title: "Adjoints and the Discrete-Time Pontryagin Principle"
date: "2026-09-29"
excerpt: "Deriving the discrete-time Pontryagin Minimum Principle (PMP) from stagewise KKT conditions. Packaging costs and dynamics into the Hamiltonian, deriving costate backward recursions, and connecting adjoints to backpropagation and RL."
tags: ["rl", "control", "math", "optimization"]
series: "RL & Control"
seriesOrder: 3
readingTime: 12
---

*This is the third post in my series **RL & Control**, where we bridge classical optimal control theory and modern Reinforcement Learning. In [Part 1](/blog/rl-control-pt1-docps), we set up Discrete-Time Optimal Control Problems (DOCPs) and KKT conditions. In [Part 2](/blog/rl-control-pt2-dynamic-programming), we tackled Bellman's Principle of Optimality and dynamic programming. Today, we uncover **Pontryagin's Minimum Principle (PMP)** in discrete time and see how costates act as the bridge between KKT multipliers, reverse-time adjoints, and backpropagation.*

---

In [Part 1](/blog/rl-control-pt1-docps), we saw that any discrete-time optimal control problem (DOCP) can be written as a massive Nonlinear Program (NLP). We also learned that Lagrange multipliers associated with system dynamics constraints are not just mathematical artifacts—they represent **costates** (or adjoint variables) that measure the marginal sensitivity of future costs with respect to state perturbations.

But when equality constraints take the form of a forward dynamical recursion $\mathbf{x}_{k+1} = f_k(\mathbf{x}_k, \mathbf{u}_k)$, how do these multipliers naturally organize themselves stage by stage over time?

Instead of treating control as a black-box NLP, classical control theory introduces **Pontryagin's Minimum Principle (PMP)**. In discrete time, PMP emerges directly as the structured Karush–Kuhn–Tucker (KKT) system obtained by introducing costates for the dynamics and packaging stagewise terms into a single fundamental object: the **Discrete Hamiltonian**.

Let's derive this step by step.

---

## 1. The Bolza Setup and Stagewise Lagrangian

Consider the general finite-horizon discrete-time optimal control problem in Bolza form over horizon $T$:

$$
\begin{aligned}
\underset{\{\mathbf{x}_k, \mathbf{u}_k\}}{\text{minimize}} \quad & c_T(\mathbf{x}_T) + \sum_{k=1}^{T-1} c_k(\mathbf{x}_k, \mathbf{u}_k) \\[1em]
\text{subject to} \quad & \mathbf{x}_{k+1} = f_k(\mathbf{x}_k, \mathbf{u}_k), \quad k = 1, \dots, T-1 \\
& \mathbf{g}_k(\mathbf{x}_k, \mathbf{u}_k) \leq \mathbf{0}, \quad \mathbf{u}_k \in \mathcal{U}_k \\
& \mathbf{h}(\mathbf{x}_T) = \mathbf{0} \quad \text{(optional terminal equalities)}
\end{aligned}
$$

Here:
- $\mathbf{x}_k \in \mathbb{R}^n$ is the state at time $k$.
- $\mathbf{u}_k \in \mathcal{U}_k \subseteq \mathbb{R}^m$ is the control input chosen from admissible control set $\mathcal{U}_k$.
- $c_k(\mathbf{x}_k, \mathbf{u}_k)$ is the stage cost, and $c_T(\mathbf{x}_T)$ is the terminal cost.
- $\mathbf{g}_k(\mathbf{x}_k, \mathbf{u}_k) \leq \mathbf{0}$ represents path inequality constraints (e.g., actuator limits or spatial boundaries).
- $\mathbf{h}(\mathbf{x}_T) = \mathbf{0}$ specifies terminal equality constraints (e.g., landing at target position $\mathbf{x}_{\text{target}}$).

To handle these constraints, we introduce:
1. **Costate vectors** $\boldsymbol{\lambda}_{k+1} \in \mathbb{R}^n$ for the forward dynamics $\mathbf{x}_{k+1} - f_k(\mathbf{x}_k, \mathbf{u}_k) = \mathbf{0}$.
2. **Path inequality multipliers** $\boldsymbol{\mu}_k \geq \mathbf{0}$ for $\mathbf{g}_k(\mathbf{x}_k, \mathbf{u}_k) \leq \mathbf{0}$.
3. **Terminal equality multipliers** $\boldsymbol{\nu}$ for $\mathbf{h}(\mathbf{x}_T) = \mathbf{0}$.

The full Lagrangian function $\mathcal{L}$ across all stages becomes:

$$
\mathcal{L} = c_T(\mathbf{x}_T) + \sum_{k=1}^{T-1} c_k(\mathbf{x}_k, \mathbf{u}_k) + \sum_{k=1}^{T-1} \boldsymbol{\lambda}_{k+1}^\top \left( f_k(\mathbf{x}_k, \mathbf{u}_k) - \mathbf{x}_{k+1} \right) + \sum_{k=1}^{T-1} \boldsymbol{\mu}_k^\top \mathbf{g}_k(\mathbf{x}_k, \mathbf{u}_k) + \boldsymbol{\nu}^\top \mathbf{h}(\mathbf{x}_T)
$$

---

## 2. Packaging Stagewise Terms: The Discrete Hamiltonian

Looking closely at the Lagrangian, notice that at stage $k$, the stage cost $c_k$, the transition dynamics $f_k$, and the path constraints $\mathbf{g}_k$ all depend on $(\mathbf{x}_k, \mathbf{u}_k)$.

It is immensely convenient to package all terms active at stage $k$ into a single scalar function called the **Discrete Hamiltonian**:

$$
H_k(\mathbf{x}_k, \mathbf{u}_k, \boldsymbol{\lambda}_{k+1}, \boldsymbol{\mu}_k) := c_k(\mathbf{x}_k, \mathbf{u}_k) + \boldsymbol{\lambda}_{k+1}^\top f_k(\mathbf{x}_k, \mathbf{u}_k) + \boldsymbol{\mu}_k^\top \mathbf{g}_k(\mathbf{x}_k, \mathbf{u}_k)
$$

> **Why does $\boldsymbol{\lambda}_{k+1}$ appear in $H_k$ instead of $\boldsymbol{\lambda}_k$?**
> Because taking action $\mathbf{u}_k$ at state $\mathbf{x}_k$ transitions the system into state $\mathbf{x}_{k+1}$. The multiplier $\boldsymbol{\lambda}_{k+1}$ measures the shadow price of arriving at $\mathbf{x}_{k+1}$. Thus, the Hamiltonian balances the *immediate stage cost* $c_k$ against the *value of the subsequent state* weighted by costate $\boldsymbol{\lambda}_{k+1}$.

Using the Hamiltonian definition, we can regroup the Lagrangian by expanding the sum $\sum \boldsymbol{\lambda}_{k+1}^\top \mathbf{x}_{k+1}$:

$$
\mathcal{L} = c_T(\mathbf{x}_T) + \boldsymbol{\nu}^\top \mathbf{h}(\mathbf{x}_T) - \boldsymbol{\lambda}_T^\top \mathbf{x}_T + \sum_{k=1}^{T-1} \left[ H_k(\mathbf{x}_k, \mathbf{u}_k, \boldsymbol{\lambda}_{k+1}, \boldsymbol{\mu}_k) - \boldsymbol{\lambda}_k^\top \mathbf{x}_k \right] + \boldsymbol{\lambda}_1^\top \mathbf{x}_1
$$

This regrouping (analogous to integration by parts in continuous-time calculus of variations) isolates how variations in $\mathbf{x}_k$ affect neighboring stages!

---

## 3. Deriving the First-Order Necessary Conditions (Discrete PMP)

To find a local minimizer trajectory $\{\mathbf{x}_k^*, \mathbf{u}_k^*\}$, we enforce KKT stationarity by requiring the gradient of $\mathcal{L}$ with respect to states, controls, and costates to vanish.

*(Note: We adopt the standard denominator gradient layout where $\nabla_{\mathbf{x}} f = \left( \frac{\partial f}{\partial \mathbf{x}} \right)^\top$ is a column vector).*

### Condition 1: State Dynamics (Primal Feasibility)
Differentiating $\mathcal{L}$ with respect to costate $\boldsymbol{\lambda}_{k+1}$ recovers the forward system dynamics:

$$
\mathbf{x}_{k+1}^* = f_k(\mathbf{x}_k^*, \mathbf{u}_k^*), \quad k = 1, \dots, T-1
$$

with initial condition $\mathbf{x}_1^* = \mathbf{x}_{\text{init}}$.

### Condition 2: Costate Recursion (The Backward Adjoint Equation)
Differentiating $\mathcal{L}$ with respect to intermediate state $\mathbf{x}_k$ (for $k = 2, \dots, T-1$) and setting $\nabla_{\mathbf{x}_k} \mathcal{L} = \mathbf{0}$ yields:

$$
\nabla_{\mathbf{x}_k} H_k(\mathbf{x}_k^*, \mathbf{u}_k^*, \boldsymbol{\lambda}_{k+1}^*, \boldsymbol{\mu}_k^*) - \boldsymbol{\lambda}_k^* = \mathbf{0}
$$

Re-arranging gives the famous **backward costate recursion**:

$$
\boldsymbol{\lambda}_k^* = \nabla_{\mathbf{x}} c_k(\mathbf{x}_k^*, \mathbf{u}_k^*) + \left[ \frac{\partial f_k}{\partial \mathbf{x}_k}(\mathbf{x}_k^*, \mathbf{u}_k^*) \right]^\top \boldsymbol{\lambda}_{k+1}^* + \left[ \frac{\partial \mathbf{g}_k}{\partial \mathbf{x}_k}(\mathbf{x}_k^*, \mathbf{u}_k^*) \right]^\top \boldsymbol{\mu}_k^*
$$

Notice the direction of time: **States propagate forward in time ($1 \to T$), while costates propagate backward in time ($T \to 1$)!**

### Condition 3: Transversality (Terminal Boundary Condition)
Differentiating $\mathcal{L}$ with respect to final state $\mathbf{x}_T$ gives the terminal costate boundary condition:

$$
\boldsymbol{\lambda}_T^* = \nabla_{\mathbf{x}} c_T(\mathbf{x}_T^*) + \left[ \frac{\partial \mathbf{h}}{\partial \mathbf{x}_T}(\mathbf{x}_T^*) \right]^\top \boldsymbol{\nu}^*
$$

If there are no terminal equality constraints ($\mathbf{h}(\mathbf{x}_T) = \mathbf{0}$ is absent), then $\boldsymbol{\nu}^* = \mathbf{0}$ and $\boldsymbol{\lambda}_T^* = \nabla_{\mathbf{x}} c_T(\mathbf{x}_T^*)$.

### Condition 4: Control Minimization (Hamiltonian Stationarity)
Differentiating $\mathcal{L}$ with respect to control $\mathbf{u}_k$ requires that the optimal action $\mathbf{u}_k^*$ minimizes the stage Hamiltonian:

$$
\mathbf{u}_k^* = \arg\min_{\mathbf{u} \in \mathcal{U}_k} H_k(\mathbf{x}_k^*, \mathbf{u}, \boldsymbol{\lambda}_{k+1}^*, \boldsymbol{\mu}_k^*)
$$

If controls are smooth and unconstrained inside the interior of $\mathcal{U}_k$, this reduces to first-order stationarity:

$$
\nabla_{\mathbf{u}_k} H_k(\mathbf{x}_k^*, \mathbf{u}_k^*, \boldsymbol{\lambda}_{k+1}^*, \boldsymbol{\mu}_k^*) = \mathbf{0} \implies \nabla_{\mathbf{u}} c_k(\mathbf{x}_k^*, \mathbf{u}_k^*) + \left[ \frac{\partial f_k}{\partial \mathbf{u}_k}(\mathbf{x}_k^*, \mathbf{u}_k^*) \right]^\top \boldsymbol{\lambda}_{k+1}^* + \left[ \frac{\partial \mathbf{g}_k}{\partial \mathbf{u}_k}(\mathbf{x}_k^*, \mathbf{u}_k^*) \right]^\top \boldsymbol{\mu}_k^* = \mathbf{0}
$$

### Condition 5: Complementary Slackness for Path Constraints
For path inequalities $\mathbf{g}_k(\mathbf{x}_k, \mathbf{u}_k) \leq \mathbf{0}$:

$$
\boldsymbol{\mu}_k^* \geq \mathbf{0}, \quad \mathbf{g}_k(\mathbf{x}_k^*, \mathbf{u}_k^*) \leq \mathbf{0}, \quad \mu_{k,i}^* \, g_{k,i}(\mathbf{x}_k^*, \mathbf{u}_k^*) = 0 \quad \text{for all } i
$$

---

## Summary of the Discrete-Time Pontryagin Principle

Putting all 5 conditions together, an optimal trajectory-costate pair $(\mathbf{x}_{1:T}^*, \boldsymbol{\lambda}_{1:T}^*)$ must satisfy the two-point boundary value structure:

$$
\begin{aligned}
\text{Forward Dynamics:} \quad & \mathbf{x}_{k+1}^* = f_k(\mathbf{x}_k^*, \mathbf{u}_k^*), \quad \mathbf{x}_1^* = \mathbf{x}_{\text{init}} \\[0.5em]
\text{Backward Adjoint:} \quad & \boldsymbol{\lambda}_k^* = \nabla_{\mathbf{x}} c_k + \left( \frac{\partial f_k}{\partial \mathbf{x}_k} \right)^\top \boldsymbol{\lambda}_{k+1}^* + \left( \frac{\partial \mathbf{g}_k}{\partial \mathbf{x}_k} \right)^\top \boldsymbol{\mu}_k^*, \quad \boldsymbol{\lambda}_T^* = \nabla_{\mathbf{x}} c_T + \left( \frac{\partial \mathbf{h}}{\partial \mathbf{x}_T} \right)^\top \boldsymbol{\nu}^* \\[0.5em]
\text{Control Optimality:} \quad & \mathbf{u}_k^* = \arg\min_{\mathbf{u} \in \mathcal{U}_k} H_k(\mathbf{x}_k^*, \mathbf{u}, \boldsymbol{\lambda}_{k+1}^*, \boldsymbol{\mu}_k^*)
\end{aligned}
$$

---

## 4. Deep Connections: Autodiff, Backpropagation, and RL

Why is the Discrete Pontryagin Principle so foundational across control, deep learning, and RL?

### 1. Reverse-Mode Autodiff is Exact Costate Propagation
If you remove path constraints ($\mathbf{g}_k = \mathbf{0}$), the backward costate equation becomes:

$$
\boldsymbol{\lambda}_k = \nabla_{\mathbf{x}} c_k + \left( \frac{\partial f_k}{\partial \mathbf{x}_k} \right)^\top \boldsymbol{\lambda}_{k+1}
$$

Compare this to **reverse-mode automatic differentiation** (backpropagation through time in PyTorch/JAX). If $J = c_T(\mathbf{x}_T) + \sum c_k(\mathbf{x}_k, \mathbf{u}_k)$, the gradient of total cost $J$ with respect to state $\mathbf{x}_k$ is:

$$
\frac{\partial J}{\partial \mathbf{x}_k} = \frac{\partial c_k}{\partial \mathbf{x}_k} + \frac{\partial J}{\partial \mathbf{x}_{k+1}} \frac{\partial f_k}{\partial \mathbf{x}_k}
$$

Transposing both sides yields $\boldsymbol{\lambda}_k = \nabla_{\mathbf{x}} J$. **Costate propagation in Pontryagin's Principle is literally backpropagation through time!**

### 2. Costates as Value Function Gradients in Dynamic Programming
In [Part 2](/blog/rl-control-pt2-dynamic-programming), we defined the Optimal Value Function $V_k(\mathbf{x})$ in dynamic programming as the minimum cost to go from state $\mathbf{x}$ at time $k$ to the end of the horizon.

A classical theorem in optimal control connects costates directly to the Value function:

$$
\boldsymbol{\lambda}_k^* = \nabla_{\mathbf{x}} V_k(\mathbf{x}_k^*)
$$

The costate $\boldsymbol{\lambda}_k^*$ is the **gradient of the value function along the optimal trajectory**. This unifies trajectory optimization (PMP) with dynamic programming (Bellman equations):
- Dynamic Programming computes $V_k(\mathbf{x})$ over the *entire state space* (solving Hamilton-Jacobi-Bellman).
- Pontryagin's Principle tracks $\nabla_{\mathbf{x}} V_k(\mathbf{x})$ locally *along a single optimal trajectory* (solving a Two-Point Boundary Value Problem).

### 3. Indirect Shooting Algorithms
Because state dynamics run forward ($\mathbf{x}_1 \to \mathbf{x}_T$) while costate dynamics run backward ($\boldsymbol{\lambda}_T \to \boldsymbol{\lambda}_1$), PMP forms a **Two-Point Boundary Value Problem (TPBVP)**. 

**Indirect Shooting** solves this by guessing an initial costate $\boldsymbol{\lambda}_1$, integrating state and costate equations forward in time, evaluating the discrepancy at terminal condition $\boldsymbol{\lambda}_T$, and refining $\boldsymbol{\lambda}_1$ using Newton's method.

---

## What's Next?

We now have three complementary lenses on optimal control:
1. **NLP / KKT Formulation**: Stacking all decision variables into one large optimization problem (Direct Methods, SQP, IPOPT).
2. **Dynamic Programming**: Computing closed-loop feedback policies via Bellman backward induction (LQR, Value Iteration, Q-learning).
3. **Pontryagin's Principle**: Exploiting forward-state/backward-costate adjoint recursions to solve trajectory optimization (iLQR, DDP, Indirect Shooting).

In the next post, we will explore **Iterative LQR (iLQR) and Differential Dynamic Programming (DDP)**—showing how combining Pontryagin's Hamiltonian expansions with dynamic programming yields the workhorse algorithms powering modern robot locomotion and trajectory optimization.
