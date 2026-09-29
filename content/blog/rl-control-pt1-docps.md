---
title: "Discrete-Time Optimal Control Problems (DOCPs)"
date: "2026-09-26"
excerpt: "Breaking down the foundations of Discrete-Time Optimal Control Problems (DOCPs): state transitions, Bolza/Mayer/Lagrange equivalences, KKT conditions, primal-dual algorithms, differentiable programming, and LLM inference control."
tags: ["rl", "control", "math", "optimization"]
series: "RL & Control"
seriesOrder: 1
readingTime: 18
---

*This is the first post in my series **RL & Control**, where we bridge the gap between classical optimal control theory and modern Reinforcement Learning. We're starting with the absolute basics: Discrete-Time Optimal Control Problems (DOCPs).*

---

If you've spent any time reading Reinforcement Learning papers, you've probably seen equations covered in summations, expectations, and discount factors. But before we get to the "learning" part of RL, we need to understand what we are actually trying to solve. 

At its core, RL is just a data-driven way to solve **Optimal Control Problems**. When time is broken down into steps (like frames in a video game or daily updates in a satellite's orbit), we call these **Discrete-Time Optimal Control Problems (DOCPs)**.

Let's dumb down the math so it actually makes intuitive sense, without losing any of the rigor.

## The Setup: States, Actions, and Dynamics

Imagine you are controlling a drone. 
At any time step $k$, the drone has a **state**, denoted as $\mathbf{x}_k \in \mathbb{R}^n$. This is a vector containing everything you need to know about the drone right now: its position, velocity, orientation, etc.

To change the state, you apply a **control input** (or in RL terms, an **action**), denoted as $\mathbf{u}_k \in \mathbb{R}^m$. For the drone, this would be the motor speeds.

The environment operates according to some physical rules. If you are in state $\mathbf{x}_k$ and take action $\mathbf{u}_k$, you move to a new state $\mathbf{x}_{k+1}$. We define this mathematically using a **transition function** (or system dynamics):

$$ \mathbf{x}_{k+1} = f(\mathbf{x}_k, \mathbf{u}_k) $$

In classical control, we usually know the exact equations for $f$ (e.g., Newton's laws of motion). In RL, we usually *don't* know $f$, and the agent has to figure out how the world works by trial and error. But the underlying mechanics are identical.

## The Goal: The Cost Function

We want to find a sequence of actions $\mathbf{u}_1, \mathbf{u}_2, \dots, \mathbf{u}_{T-1}$ that makes the drone do something useful over a finite time horizon $T$. 

To do this, we define a **cost function** $J$. Our goal is to *minimize* this cost. (In RL, we usually talk about *maximizing reward*, which is exactly the same thing as minimizing negative cost).

In control theory, there are three classic ways to write down this cost function: Bolza, Mayer, and Lagrange. Let's look at each.

### 1. The Bolza Form (The "Everything" Cost)
The Bolza form is the most general way to write a cost function. It says: "I care about what happens *during* the trajectory, and I also care about where I end up at the *final* step."

$$ J(\mathbf{x}, \mathbf{u}) = \Phi(\mathbf{x}_T) + \sum_{k=1}^{T-1} L(\mathbf{x}_k, \mathbf{u}_k) $$

- **The Mayer Term** $\Phi(\mathbf{x}_T)$: The **terminal cost**. This penalizes the final state $\mathbf{x}_T$. For example, how far is the drone from the landing pad when time runs out?
- **The Lagrange Term** $\sum L(\mathbf{x}_k, \mathbf{u}_k)$: The **running cost**. This penalizes things at every single step. For example, how much battery (energy) is the drone using at step $k$?

### 2. The Mayer Form (The "Destination Only" Cost)
What if we *only* care about the final destination, and we don't care how we get there? We drop the running cost. 

$$ J(\mathbf{x}, \mathbf{u}) = \Phi(\mathbf{x}_T) $$

*Example*: A missile intercepting a target. It doesn't matter how much fuel it burns or what path it takes, as long as the final distance to the target at time $T$ is zero.

### 3. The Lagrange Form (The "Journey Only" Cost)
What if there is no "final destination", and we only care about maintaining a good state over time? We drop the terminal cost.

$$ J(\mathbf{x}, \mathbf{u}) = \sum_{k=1}^{T-1} L(\mathbf{x}_k, \mathbf{u}_k) $$

*Example*: A thermostat trying to keep a room at 72 degrees. There is no "end goal", just a continuous penalty for being too hot or too cold.

### A Fun Mathematical Trick
Here is a secret: **Bolza, Mayer, and Lagrange are all mathematically equivalent.** 

You can convert any Bolza problem (running cost + terminal cost) into a pure Mayer problem (terminal cost only). How? You just invent a fake "virtual" state variable that accumulates the running cost!

Let $c_k$ be a new state variable that tracks the total cost accumulated so far. The dynamics for this new state are:
$$ c_{k+1} = c_k + L(\mathbf{x}_k, \mathbf{u}_k) $$
with $c_1 = 0$. 

Now, your terminal cost is simply $\Phi(\mathbf{x}_T) + c_T$. You've hidden the entire running cost inside the state vector, and magically transformed a Bolza problem into a pure Mayer problem. This trick is used all the time in trajectory optimization solvers!

## Putting It All Together: The Formal DOCP

Now we can write down the formal, rigorous definition of a Discrete-Time Optimal Control Problem. It is fundamentally a large Nonlinear Programming (NLP) problem. 

We want to find the optimal sequence of states $\mathbf{x}_{1:T}$ and controls $\mathbf{u}_{1:T-1}$ that minimizes the cost, subject to the laws of physics and any constraints (like "don't crash into the ground" or "max motor thrust is 100%").

$$
\begin{aligned}
\underset{\mathbf{x}_{1:T}, \mathbf{u}_{1:T-1}}{\text{minimize}} \quad & \Phi(\mathbf{x}_T) + \sum_{k=1}^{T-1} L(\mathbf{x}_k, \mathbf{u}_k) \\[1em]
\text{subject to} \quad & \mathbf{x}_{k+1} - f(\mathbf{x}_k, \mathbf{u}_k) = 0 \quad \text{(System Dynamics)} \\
& \mathbf{h}(\mathbf{x}_k, \mathbf{u}_k) \leq 0 \quad \text{(Inequality Constraints, e.g., max thrust)} \\
& \mathbf{g}(\mathbf{x}_k, \mathbf{u}_k) = 0 \quad \text{(Equality Constraints)} \\
& \mathbf{x}_1 = \mathbf{x}_{init} \quad \text{(Initial Condition)}
\end{aligned}
$$

## Existence of Solutions and Optimality Conditions

Writing down a trajectory optimization problem as a nonlinear program is one thing; knowing that a solution actually exists—and knowing how to recognize an optimal one—is another. 

A fundamental question in trajectory optimization is: *Which conditions guarantee that a minimizer exists, and which equations supply candidate solutions?*

Let's break down feasibility, existence, and the Karush–Kuhn–Tucker (KKT) optimality machinery.

### 1. Existence of Solutions: Feasibility and Well-Posedness

First, a common misconception: **the system dynamics do not need to be stable.** 

Many of the most important control problems in aerospace and robotics involve systems that are naturally unstable: balancing an inverted pendulum, firing thrusters to land a rocket booster, or using weak atmospheric differential drag to phase propulsionless satellites in low Earth orbit. What matters is not stability, but that the transition map is **well-posed**: for any admissible state-control pair $(\mathbf{x}_k, \mathbf{u}_k)$, the dynamics $f(\mathbf{x}_k, \mathbf{u}_k)$ deterministically produce a valid subsequent state.

In continuous-time control, Mailin-type conditions or Lipschitz continuity of the vector field are required for unique ODE trajectories. In discrete time, the bar is much lighter: we simply evaluate the forward map at each step.

Beyond well-posedness, existence boils down to **feasibility**:
- The **feasible set** consists of all state-control pairs $(\mathbf{x}_{1:T}, \mathbf{u}_{1:T-1})$ that satisfy the initial condition, the forward dynamics, and all inequality and boundary constraints.
- If the constraints are overly restrictive (e.g., asking a drone to fly 100 meters in 1 second while capping motor power at 10%), or if the system is **uncontrollable** from $\mathbf{x}_{\text{init}}$, the feasible set is completely empty. If the feasible set is empty, no optimal trajectory exists.
- If the feasible set is nonempty and compact (bounded and closed) and the cost function is continuous, the **Weierstrass Extreme Value Theorem** guarantees that a global minimum exists.

### 2. Optimality Conditions: The General NLP Formulation

Assume our feasible set is nonempty. How do we characterize a local minimum?

Let me stack all the decision variables across time—both the states $\mathbf{x}_{1:T}$ and the controls $\mathbf{u}_{1:T-1}$—into a single high-dimensional decision vector:

$$ \mathbf{z} = \begin{bmatrix} \mathbf{x}_1 \\ \vdots \\ \mathbf{x}_T \\ \mathbf{u}_1 \\ \vdots \\ \mathbf{u}_{T-1} \end{bmatrix} \in \mathbb{R}^{n T + m (T-1)} $$

Now, the entire DOCP collapses into the standard canonical form of a smooth **Nonlinear Program (NLP)**:

$$
\begin{aligned}
\min_{\mathbf{z}} \quad & F(\mathbf{z}) \\
\text{subject to} \quad & H(\mathbf{z}) = \mathbf{0} \\
& G(\mathbf{z}) \leq \mathbf{0}
\end{aligned}
$$

Here:
- $F(\mathbf{z}) = \Phi(\mathbf{x}_T) + \sum_{k=1}^{T-1} L(\mathbf{x}_k, \mathbf{u}_k)$ is the total cost.
- $H(\mathbf{z}) = \mathbf{0}$ gathers all equality constraints: the initial condition $\mathbf{x}_1 - \mathbf{x}_{\text{init}} = \mathbf{0}$ and the system dynamics $\mathbf{x}_{k+1} - f(\mathbf{x}_k, \mathbf{u}_k) = \mathbf{0}$ for $k = 1, \dots, T-1$.
- $G(\mathbf{z}) \leq \mathbf{0}$ stacks all inequality constraints: actuator limits (e.g., $\mathbf{u}_{\min} \leq \mathbf{u}_k \leq \mathbf{u}_{\max}$), state bounds, and path constraints.

### 3. The Lagrangian and Active Sets

To handle constraints, we construct the **Lagrangian function**:

$$ \mathcal{L}(\mathbf{z}, \boldsymbol{\lambda}, \boldsymbol{\mu}) = F(\mathbf{z}) + \boldsymbol{\lambda}^\top H(\mathbf{z}) + \boldsymbol{\mu}^\top G(\mathbf{z}), \quad \boldsymbol{\mu} \geq \mathbf{0} $$

Notice the signs:
- $\boldsymbol{\lambda}$ is the vector of multipliers for equality constraints. They can be positive, negative, or zero.
- $\boldsymbol{\mu} \geq \mathbf{0}$ is the vector of multipliers for inequality constraints. Because we follow the convention $G(\mathbf{z}) \leq \mathbf{0}$, whenever a constraint is violated ($G_i(\mathbf{z}) > 0$), having $\mu_i > 0$ strictly penalizes the Lagrangian.

At any candidate point $\mathbf{z}$, we divide inequality constraints into two groups:
1. **Active Constraints** $\mathcal{A}(\mathbf{z}) = \{ i : G_i(\mathbf{z}) = 0 \}$: The constraints that are currently hitting their boundary (e.g., motor throttle is maxed out at 100%).
2. **Inactive Constraints** $\{ i : G_i(\mathbf{z}) < 0 \}$: The constraints with room to spare (e.g., motor throttle is at 45%). Inactive constraints cannot restrict local motion, so their multipliers must be zero ($\mu_i = 0$).

### 4. Constraint Qualifications (LICQ)

To ensure that valid Lagrange multipliers even exist at a local minimum, the constraints must satisfy a regularity condition known as a **constraint qualification**. The most standard and widely used is the **Linear Independence Constraint Qualification (LICQ)**.

> **Definition (LICQ):** The gradients of all equality constraints and all active inequality constraints at the candidate point $\mathbf{z}^*$ must be linearly independent.

If we let $J_H(\mathbf{z}^*)$ and $J_{G_{\mathcal{A}}}(\mathbf{z}^*)$ denote the Jacobians of the equality and active inequality constraints, LICQ requires:

$$ \begin{bmatrix} J_H(\mathbf{z}^*) \\ J_{G_{\mathcal{A}}}(\mathbf{z}^*) \end{bmatrix} \quad \text{to have full row rank.} $$

LICQ guarantees that the constraint surfaces intersect cleanly without cusps or degeneracies, ensuring that Lagrange multipliers exist and are unique.

### 5. The Karush–Kuhn–Tucker (KKT) First-Order Necessary Conditions

Under LICQ (or another valid constraint qualification), any local minimizer $\mathbf{z}^*$ of the DOCP must admit multipliers $(\boldsymbol{\lambda}^*, \boldsymbol{\mu}^*)$ that satisfy the celebrated **KKT conditions**:

$$
\begin{aligned}
&\text{1. Stationarity:} && \nabla_{\mathbf{z}} \mathcal{L}(\mathbf{z}^*, \boldsymbol{\lambda}^*, \boldsymbol{\mu}^*) = \mathbf{0} \\
&\text{2. Primal Feasibility:} && H(\mathbf{z}^*) = \mathbf{0}, \quad G(\mathbf{z}^*) \leq \mathbf{0} \\
&\text{3. Dual Feasibility:} && \boldsymbol{\mu}^* \geq \mathbf{0} \\
&\text{4. Complementary Slackness:} && \mu_i^* \, G_i(\mathbf{z}^*) = 0 \quad \text{for all } i
\end{aligned}
$$

Complementary slackness ($\mu_i^* G_i(\mathbf{z}^*) = 0$) requires that:
- If a constraint is strictly inactive ($G_i(\mathbf{z}^*) < 0$), its multiplier **must be zero** ($\mu_i^* = 0$).
- If a multiplier is positive ($\mu_i^* > 0$), the constraint **must be strictly tight** ($G_i(\mathbf{z}^*) = 0$).

### Multipliers as Shadow Prices and the Origin of Adjoints (Costates)

What do the multipliers $\boldsymbol{\lambda}^*$ and $\boldsymbol{\mu}^*$ actually mean?

In economics and optimization, multipliers are known as **shadow prices**. Under mild sensitivity assumptions, they measure how the optimal cost $F^*$ changes if you loosen or tighten a constraint boundary:

$$ \frac{\partial F^*}{\partial c_i} = -\lambda_i^* \quad \text{or} \quad -\mu_i^* $$

If you relax the maximum motor thrust constraint by $\epsilon = 0.01$, the optimal cost will decrease by approximately $\mu_i^* \times 0.01$.

Even more profoundly for control: **the equality multipliers $\boldsymbol{\lambda}_{1:T}$ associated with the system dynamics constraints $\mathbf{x}_{k+1} - f(\mathbf{x}_k, \mathbf{u}_k) = 0$ are the costates (or adjoint variables) of the system!**

When you inspect the stationarity condition $\nabla_{\mathbf{x}_k} \mathcal{L} = \mathbf{0}$, you directly obtain the backward costate propagation equation:

$$ \boldsymbol{\lambda}_k = \nabla_{\mathbf{x}} L(\mathbf{x}_k, \mathbf{u}_k) + \left( \frac{\partial f}{\partial \mathbf{x}_k} \right)^\top \boldsymbol{\lambda}_{k+1} $$

This is the exact discrete-time equivalent of **Pontryagin's Minimum Principle (PMP)**. The multipliers are not auxiliary mathematical artifacts—they are the marginal sensitivity of the remaining trajectory cost with respect to state variations, and they form the backbone of adjoint sensitivity methods, shooting algorithms, and backpropagation through time.

---

## From KKT to Algorithms

Understanding the KKT conditions is essential, but how do numerical solvers actually compute solutions? Let's look at duality, saddle points, and algorithmic solvers.

### 1. Min-Max Duality and Saddle Points

The Lagrangian gives an exact **min–max representation** of the constrained optimization problem, whether or not the underlying problem is convex:

$$ p^\star = \inf_{\mathbf{z}} \sup_{\boldsymbol{\lambda}, \, \boldsymbol{\mu} \ge \mathbf{0}} \mathcal{L}(\mathbf{z}, \boldsymbol{\lambda}, \boldsymbol{\mu}) $$

Here $\boldsymbol{\lambda}$ is unrestricted. Why does this min-max form work?
- For a **feasible** $\mathbf{z}$ (where $H(\mathbf{z}) = \mathbf{0}$ and $G(\mathbf{z}) \le \mathbf{0}$), the inner supremum with respect to $(\boldsymbol{\lambda}, \boldsymbol{\mu})$ is attained at $\boldsymbol{\mu} = \mathbf{0}$, yielding exactly $F(\mathbf{z})$.
- If an equality constraint is **violated** ($H_i(\mathbf{z}) \ne 0$), the multiplier $\lambda_i$ can pick a sign and magnitude to drive $\mathcal{L} \to +\infty$.
- If an inequality constraint is **violated** ($G_i(\mathbf{z}) > 0$), sending $\mu_i \to +\infty$ similarly drives $\mathcal{L} \to +\infty$.

Thus, the multiplier "player" assigns $+\infty$ to every infeasible choice, forcing the primal "player" to stay within the feasible set!

Reversing the order of minimization and maximization yields the **dual value** $d^\star$, which provides a fundamental lower bound on the primal value (**Weak Duality**):

$$ d^\star = \sup_{\boldsymbol{\lambda}, \, \boldsymbol{\mu} \ge \mathbf{0}} \inf_{\mathbf{z}} \mathcal{L}(\mathbf{z}, \boldsymbol{\lambda}, \boldsymbol{\mu}) \le p^\star $$

A **saddle point** requires a fixed multiplier pair $(\boldsymbol{\lambda}^\star, \boldsymbol{\mu}^\star)$ for which $\mathbf{z}^\star$ globally minimizes the Lagrangian, together with optimal multipliers against that fixed $\mathbf{z}^\star$:

$$ \mathcal{L}(\mathbf{z}^\star, \boldsymbol{\lambda}, \boldsymbol{\mu}) \le \mathcal{L}(\mathbf{z}^\star, \boldsymbol{\lambda}^\star, \boldsymbol{\mu}^\star) \le \mathcal{L}(\mathbf{z}, \boldsymbol{\lambda}^\star, \boldsymbol{\mu}^\star) $$

for all $\mathbf{z}$, unrestricted $\boldsymbol{\lambda}$, and $\boldsymbol{\mu} \ge \mathbf{0}$. 

*Important Nuance*: Solving KKT stationarity alone does **not** guarantee a global saddle point in nonconvex trajectory optimization! 

For example, consider minimizing $-z^2$ subject to $z = 0$. The unique feasible optimizer is $z^\star = 0$ with KKT multiplier $\lambda^\star = 0$. Yet $\mathcal{L}(z, 0) = -z^2$, which has a global **maximum** at zero rather than a minimum!

When $F$ is convex, each $G_i$ is convex, and $H$ is affine, the Lagrangian is convex in $\mathbf{z}$. KKT stationarity then guarantees a global minimum of the Lagrangian. Under **Slater's condition** (the existence of a strictly feasible point where $H(\mathbf{z}) = \mathbf{0}$ and $G_i(\mathbf{z}) < 0$), KKT points are guaranteed to be global saddle points.

### 2. Primal-Dual Gradient Dynamics (Arrow–Hurwicz)

The simplest numerical idea to solve the min-max problem is first-order **Primal-Dual Gradient Dynamics**: take a gradient descent step in the primal variables $\mathbf{z}$ and a gradient ascent step in the multipliers $(\boldsymbol{\lambda}, \boldsymbol{\mu})$, projecting inequality multipliers back onto $\mathbb{R}_{\ge 0}$:

$$
\begin{aligned}
\mathbf{z}_{k+1} &= \mathbf{z}_k - \alpha_k \left( \nabla F(\mathbf{z}_k) + J_H(\mathbf{z}_k)^\top \boldsymbol{\lambda}_k + J_G(\mathbf{z}_k)^\top \boldsymbol{\mu}_k \right) \\
\boldsymbol{\lambda}_{k+1} &= \boldsymbol{\lambda}_k + \beta_k H(\mathbf{z}_k) \\
\boldsymbol{\mu}_{k+1} &= \Pi_{\ge 0} \left( \boldsymbol{\mu}_k + \beta_k G(\mathbf{z}_k) \right)
\end{aligned}
$$

Here $\Pi_{\ge 0}$ clips negative components to zero. If $G_i(\mathbf{z}_k) > 0$, the inequality is violated, increasing $\mu_i$.

**Why basic primal-dual dynamics fail**: Simultaneous unaugmented updates are notoriously unstable. Even for a simple bilinear Lagrangian $\mathcal{L}(z, \lambda) = \lambda z$, the discrete updates have eigenvalues $1 \pm i \sqrt{\alpha \beta}$, whose magnitude $\sqrt{1 + \alpha \beta} > 1$ strictly exceeds unity! Fixed-step primal-dual dynamics will wildly oscillate and diverge.

### 3. Penalty and Augmented Lagrangian Methods

To stabilize convergence, we inject curvature into the Lagrangian by adding penalty terms for constraint violations, yielding the **Augmented Lagrangian**:

$$ \mathcal{L}_\rho(\mathbf{z}, \boldsymbol{\lambda}, \boldsymbol{\mu}) = \mathcal{L}(\mathbf{z}, \boldsymbol{\lambda}, \boldsymbol{\mu}) + \frac{\rho}{2} \| H(\mathbf{z}) \|^2 + \frac{\rho}{2} \| \max(\mathbf{0}, G(\mathbf{z})) \|^2 $$

where $\rho > 0$ weights the squared residuals. The quadratic terms convexify the objective around the feasible manifold, enabling stable optimization without requiring $\rho \to \infty$.

### 4. Sequential Quadratic Programming (SQP) as Newton on the KKT System

What if we want rapid, second-order convergence?

Consider the equality-constrained case $H(\mathbf{z}) = \mathbf{0}$. The first-order KKT conditions are:

$$ \nabla_{\mathbf{z}} \mathcal{L}(\mathbf{z}, \boldsymbol{\lambda}) = \mathbf{0}, \quad H(\mathbf{z}) = \mathbf{0} $$

Applying **Newton's method** to solve this non-linear system of equations gives the linear KKT step:

$$ \begin{bmatrix} \nabla_{\mathbf{z}\mathbf{z}}^2 \mathcal{L}(\mathbf{z}_k, \boldsymbol{\lambda}_k) & J_H(\mathbf{z}_k)^\top \\ J_H(\mathbf{z}_k) & \mathbf{0} \end{bmatrix} \begin{bmatrix} \Delta \mathbf{z} \\ \Delta \boldsymbol{\lambda} \end{bmatrix} = -\begin{bmatrix} \nabla_{\mathbf{z}} \mathcal{L}(\mathbf{z}_k, \boldsymbol{\lambda}_k) \\ H(\mathbf{z}_k) \end{bmatrix} $$

This is precisely the linear system solved at each step of **Sequential Quadratic Programming (SQP)**! SQP constructs a quadratic approximation of $F$ using $\nabla_{\mathbf{z}\mathbf{z}}^2 \mathcal{L}$ and linearizes the constraints $H$ and $G$ around the current iteration.

**The Trajectory Optimization Connection**: In optimal control, the KKT matrix possesses a special **block-tridiagonal (sparse/banded) structure** inherited from the temporal sequence of dynamics constraints $\mathbf{x}_{k+1} - f(\mathbf{x}_k, \mathbf{u}_k) = 0$. 

Instead of solving a dense linear system of size $\mathcal{O}(T(n+m))$, the Newton/SQP solve can be computed in $\mathcal{O}(T)$ linear time using Riccati recursion! In fact, for quadratic objectives and linearized dynamics, **the SQP subproblem reduces exactly to an LQR solve along the trajectory horizon**—this is the mathematical backbone of **iLQR** (Iterative LQR) and **DDP** (Differential Dynamic Programming).

---

## Further Sources of Discrete-Time Optimal Control Problems

Where do DOCPs actually come from in practice? Beyond physical systems sampled over discrete time intervals, several key paradigms naturally produce DOCPs.

### 1. Discretization of Continuous-Time OCPs

Many physical systems are governed by continuous-time ODEs:

$$ \dot{\mathbf{x}}(t) = f(\mathbf{x}(t), \mathbf{u}(t), t), \quad \mathbf{x}(0) = \mathbf{x}_0 $$

By choosing a step size $\Delta > 0$ and grid $t_k = k \Delta$, a one-step integration scheme (e.g., explicit Euler, Runge-Kutta RK4) induces a discrete update map $F_\Delta$:

$$ \mathbf{x}_{k+1} = F_\Delta(\mathbf{x}_k, \mathbf{u}_k, t_k) $$

For example, under explicit Euler, $F_\Delta(\mathbf{x}, \mathbf{u}, t) = \mathbf{x} + \Delta f(\mathbf{x}, \mathbf{u}, t)$. The continuous trajectory problem is thus transcribed into a standard discrete-time Bolza problem.

### 2. Programs as DOCPs and Differentiable Programming

Here is a modern perspective: **any computer program executed over $T$ steps can be viewed as a discrete-time dynamical system.**

Let the program state $\mathbf{x}_k$ collect intermediate memory, buffers, and variables, and let control $\mathbf{u}_k$ represent tunable parameters, inputs, or execution rates. A single execution step defines a transition map:

$$ \mathbf{x}_{k+1} = \Phi_k(\mathbf{x}_k, \mathbf{u}_k) $$

Evaluating a scalar loss or performance metric yields a DOCP:

$$ \min_{\{\mathbf{u}_k\}} c_T(\mathbf{x}_T) + \sum_{k=0}^{T-1} c_k(\mathbf{x}_k, \mathbf{u}_k) \quad \text{s.t.} \quad \mathbf{x}_{k+1} = \Phi_k(\mathbf{x}_k, \mathbf{u}_k) $$

In **differentiable programming** (e.g., PyTorch, JAX), the composite map $\Phi_{T-1} \circ \dots \circ \Phi_0$ is differentiable. Reverse-mode automatic differentiation (backpropagation) is **mathematically identical to reverse-time costate recursion**:

$$ \boldsymbol{\lambda}_T = \nabla_{\mathbf{x}_T} c_T, \quad \boldsymbol{\lambda}_k = \nabla_{\mathbf{x}_k} c_k + \left( \frac{\partial \Phi_k}{\partial \mathbf{x}_k} \right)^\top \boldsymbol{\lambda}_{k+1} $$

$$ \nabla_{\mathbf{u}_k} J = \nabla_{\mathbf{u}_k} c_k + \left( \frac{\partial \Phi_k}{\partial \mathbf{u}_k} \right)^\top \boldsymbol{\lambda}_{k+1} $$

If the program contains non-differentiable branches (discrete decisions, simulator events), DOCPs can still be solved using derivative-free methods (CMA-ES, SPSA, finite differences) or smooth relaxations.

### Example A: Gradient Descent with Momentum as a DOCP

To see this connection in action, consider optimizing the learning rate $\alpha_k$ and momentum coefficient $\beta_k$ when fitting parameters $\theta \in \mathbb{R}^p$ to a quadratic loss $\ell(\theta) = \frac{1}{2} \|A \theta - b\|^2$.

Each iteration updates momentum $m_k$ and parameters $\theta_k$:
- Gradient: $g_k = A^\top (A \theta_k - b)$
- Momentum update: $m_{k+1} = \beta_k m_k + g_k$
- Parameter update: $\theta_{k+1} = \theta_k - \alpha_k m_{k+1}$

Define state $\mathbf{x}_k = [\theta_k, m_k]^\top$ and control $\mathbf{u}_k = [\alpha_k, \beta_k]^\top$. The transition map $\Phi_k(\mathbf{x}_k, \mathbf{u}_k)$ is:

$$ \Phi_k(\mathbf{x}_k, \mathbf{u}_k) = \begin{bmatrix} \theta_k - \alpha_k (\beta_k m_k + A^\top (A \theta_k - b)) \\ \beta_k m_k + A^\top (A \theta_k - b) \end{bmatrix} $$

Hyperparameter optimization is thus transformed into an exact discrete-time optimal control problem!

### Example B: Offline Frequency Planning for LLM Inference

Consider controlling GPU clock frequencies $u_k \in [0, 1]$ over a 60-second horizon to manage energy, thermal constraints, and request latency for an LLM serving system (e.g. vLLM serving Qwen-7B on NVIDIA L4 GPUs).

An aggregate state collects queued prefill work $p_k$, active decode work $d_k$, temperature $T_k$, and preceding frequency $f_{k-1}$:

$$ \mathbf{x}_k = (p_k, d_k, T_k, f_{k-1}), \quad \mathbf{x}_{k+1} = F_k(\mathbf{x}_k, u_k, w_k) $$

where disturbance $w_k$ contains prompt arrival times and lengths. Relaxing the queue fluid balance with backlog variable $B_{k+1}$ and normalized service decision $\nu_k \in [\nu_{\min}, 1]$ yields a Linear Program (LP):

$$
\begin{aligned}
\min_{\nu_{0:59}, B_{1:60}} \quad & \sum_{k=0}^{59} \left[ \alpha_P \nu_k + 20 B_{k+1} \right] + 20 B_{60} \\
\text{subject to} \quad & B_{k+1} \ge B_k + W_k - \Delta t \, \nu_k \\
& B_0 = 0, \quad B_{k+1} \ge 0, \quad \nu_{\min} \le \nu_k \le 1
\end{aligned}
$$

Solving this LP (e.g. using HiGHS) provides an offline optimal frequency schedule. 

However, replaying this open-loop plan under a shifted arrival disturbance shows its fundamental flaw: if a burst arrives 20 seconds earlier than forecast, mean time-to-first-token (TTFT) degrades from 15.2s to 22.7s because the open-loop plan cannot adapt to real-time queue pressure!

---

## Why Should We Care? The Open-Loop Dilemma

If you solve a constrained trajectory optimization problem using an NLP solver (like IPOPT or SNOPT), you get a sequence of actions $\mathbf{u}_1, \mathbf{u}_2, \dots, \mathbf{u}_{T-1}$. This is called an **open-loop plan**.

If the real world perfectly matches your transition function $f(\mathbf{x}_k, \mathbf{u}_k)$, you just play those actions blindly and you will perfectly achieve your goal. 

But the real world has wind. Sensors are noisy. Workloads shift. Models are imperfect. If you play an open-loop plan, you will inevitably drift away from your optimal trajectory and miss the target. 

This leads us to the need for **feedback control** (adjusting actions based on the current state) and, eventually, **Reinforcement Learning** (learning the optimal feedback control mapping $\pi(\mathbf{u}_k | \mathbf{x}_k)$ entirely from experience). 

But you can't appreciate the beauty of RL until you understand the optimization problem it's secretly trying to solve. In [Part 2](/blog/rl-control-pt2-dynamic-programming), we turn to dynamic programming, Bellman's Principle of Optimality, and how closed-loop feedback emerges.
