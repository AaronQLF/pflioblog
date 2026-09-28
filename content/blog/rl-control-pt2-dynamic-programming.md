---
title: "Dynamic Programming, Bellman's Principle, and LQR"
date: "2026-09-28"
excerpt: "Moving from open-loop trajectory optimization to closed-loop feedback control. Breaking down Bellman's Principle of Optimality, backwards induction, the origin of Q-functions, and how LQR beats the curse of dimensionality."
tags: ["rl", "control", "math", "optimization"]
series: "RL & Control"
seriesOrder: 2
readingTime: 10
---

*This is the second post in my series **RL & Control**, bridging classical optimal control theory and modern Reinforcement Learning. In [Part 1](/blog/rl-control-pt1-docps), we formulated Discrete-Time Optimal Control Problems (DOCPs). Today, we tackle feedback, Bellman's Principle of Optimality, and how backwards induction leads straight to LQR and modern RL.*

---

In [Part 1](/blog/rl-control-pt1-docps), we set up the discrete-time optimal control problem (DOCP) as a massive constrained optimization problem:

$$
\begin{aligned}
\underset{\mathbf{x}_{1:T}, \mathbf{u}_{1:T-1}}{\text{minimize}} \quad & \Phi(\mathbf{x}_T) + \sum_{k=1}^{T-1} L(\mathbf{x}_k, \mathbf{u}_k) \\
\text{subject to} \quad & \mathbf{x}_{k+1} = f(\mathbf{x}_k, \mathbf{u}_k) \\
& \mathbf{x}_1 = \mathbf{x}_{\text{init}}
\end{aligned}
$$

If you feed this problem to a numerical nonlinear programming solver, it will crunch numbers and hand you back a sequence of numbers: $\mathbf{u}_1^*, \mathbf{u}_2^*, \dots, \mathbf{u}_{T-1}^*$. 

This sequence is called an **open-loop plan**. It says: *"At $k=1$, apply this thrust. At $k=2$, apply that torque."*

It is completely blind to what is actually happening in the real world.

## The Flaw of Open-Loop: Reality Has Disturbances

Imagine you want to drive from Montreal to New York. You calculate the exact steering wheel angle and throttle position for every single second of the 6-hour drive beforehand. Then, you put on a blindfold, sit in the car, and execute the exact sequence. 

You wouldn't make it past the end of your driveway.

In the real world, the dynamics have noise and unmodeled disturbances:

$$ \mathbf{x}_{k+1} = f(\mathbf{x}_k, \mathbf{u}_k) + \mathbf{w}_k $$

A small gust of wind $\mathbf{w}_1$ shifts your position at $k=2$. Now you're in a state the open-loop trajectory never anticipated. If you continue playing the precomputed $\mathbf{u}_2^*$, that small error compounds exponentially.

We don't want an open-loop sequence of actions. We want a **closed-loop feedback policy**:

$$ \mathbf{u}_k = \pi_k(\mathbf{x}_k) $$

A policy is a lookup table or a function that says: *"No matter where you actually find yourself at time $k$, here is the optimal action to take."*

How do we compute an optimal policy for all possible states? The answer was discovered by Richard Bellman in the 1950s: **Dynamic Programming**.

---

## Bellman's Principle of Optimality

Richard Bellman coined the **Principle of Optimality** in 1957. In his words:

> *"An optimal policy has the property that whatever the initial state and initial decision are, the remaining decisions must constitute an optimal policy with regard to the state resulting from the first decision."*

Let's unpack that in plain English.

Suppose the shortest route from **Montreal** to **New York City** passes through **Albany**. Bellman's principle states that the portion of your route from Albany to New York City *must* be the shortest possible route from Albany to New York City.

Why? Because if there were a faster route from Albany to New York City, you could have taken it instead, making your total trip from Montreal to New York even faster—which contradicts our premise that the original full route was optimal!

```
[Montreal] ----(optimal)----> [Albany] ----(MUST be optimal)----> [NYC]
```

This deceptively simple observation changes everything. It means we don't have to solve for the entire multi-step future all at once. Instead, **we can solve the problem backwards, one step at a time.**

---

## The Value Function (Cost-to-Go)

To turn Bellman's insight into an algorithm, we define the **Value Function** (in control, often called the **Cost-to-Go** function), denoted $V_k(\mathbf{x})$.

$V_k(\mathbf{x})$ answers a fundamental question: 
> *"If I find myself in state $\mathbf{x}$ at time step $k$, what is the minimum remaining cost to reach the end of the horizon at time $T$?"*

Mathematically:

$$ V_k(\mathbf{x}) = \min_{\mathbf{u}_k, \dots, \mathbf{u}_{T-1}} \left[ \Phi(\mathbf{x}_T) + \sum_{j=k}^{T-1} L(\mathbf{x}_j, \mathbf{u}_j) \right] $$

subject to $\mathbf{x}_{j+1} = f(\mathbf{x}_j, \mathbf{u}_j)$ and $\mathbf{x}_k = \mathbf{x}$.

### The Backward Induction Algorithm

Look at the very last step, $k = T$. There are no actions left to take. You simply pay the terminal penalty:

$$ V_T(\mathbf{x}) = \Phi(\mathbf{x}) $$

Now step back to $k = T - 1$. You are in state $\mathbf{x}$. You choose an action $\mathbf{u}$. You pay the immediate running cost $L(\mathbf{x}, \mathbf{u})$, and you land in state $\mathbf{x}_T = f(\mathbf{x}, \mathbf{u})$, where you will pay $V_T(\mathbf{x}_T)$. 

So the optimal choice at $T-1$ is:

$$ V_{T-1}(\mathbf{x}) = \min_{\mathbf{u}} \Big[ L(\mathbf{x}, \mathbf{u}) + V_T\big(f(\mathbf{x}, \mathbf{u})\big) \Big] $$

Generalizing this backward for any step $k = T-1, T-2, \dots, 1$, we get the **Discrete Dynamic Programming Equation** (also known as the discrete-time Hamilton-Jacobi-Bellman equation):

$$ V_k(\mathbf{x}) = \min_{\mathbf{u}} \Big[ \underbrace{L(\mathbf{x}, \mathbf{u})}_{\text{immediate cost}} + \underbrace{V_{k+1}\big(f(\mathbf{x}, \mathbf{u})\big)}_{\text{cost-to-go from next state}} \Big] $$

And the optimal action at state $\mathbf{x}$ defines the policy:

$$ \pi_k^*(\mathbf{x}) = \arg\min_{\mathbf{u}} \Big[ L(\mathbf{x}, \mathbf{u}) + V_{k+1}\big(f(\mathbf{x}, \mathbf{u})\big) \Big] $$

By solving this backward from $T$ to $1$, you get the optimal action for *every possible state* at every time step. You have transformed an impossible search over high-dimensional trajectory sequences into a sequence of simple single-step minimization problems.

---

## Where RL's Q-Function Actually Comes From

If you come from Reinforcement Learning, the equation above should look suspiciously familiar. 

In RL, we maximize rewards $R(s, a)$ with discount factor $\gamma \in (0, 1]$, while in control we minimize costs $L(\mathbf{x}, \mathbf{u})$. Flipping the sign and mapping notations:

| Optimal Control | Reinforcement Learning |
| :--- | :--- |
| State $\mathbf{x}_k$ | State $s_t$ |
| Action $\mathbf{u}_k$ | Action $a_t$ |
| Transition $f(\mathbf{x}_k, \mathbf{u}_k)$ | Dynamics $P(s_{t+1} \mid s_t, a_t)$ |
| Stage Cost $L(\mathbf{x}_k, \mathbf{u}_k)$ | Reward $R(s_t, a_t)$ |
| Cost-to-Go $V_k(\mathbf{x})$ | Value Function $V(s)$ |
| Hamiltonian / Cost-Action Value | Quality Function $Q(s, a)$ |

In Dynamic Programming, look at the quantity inside the $\min$ before the minimum is taken:

$$ H_k(\mathbf{x}, \mathbf{u}) = L(\mathbf{x}, \mathbf{u}) + V_{k+1}\big(f(\mathbf{x}, \mathbf{u})\big) $$

In RL, we call this exact quantity the **Q-function**:

$$ Q(s, a) = R(s, a) + \gamma \mathbb{E}\big[ V(s') \big] $$

And the value function is simply the optimal value of $Q$:

$$ V(s) = \max_a Q(s, a) $$

$Q$-learning is not an ad-hoc heuristic invented out of thin air by machine learning researchers; it is the direct stochastic evaluation of Bellman's cost-to-go operator.

---

## The Catch: The Curse of Dimensionality

If Dynamic Programming is so elegant, why don't we use it to solve every control and robotics problem?

Because of what Bellman himself named **The Curse of Dimensionality**.

To compute $V_k(\mathbf{x})$ backward, you need to store the value of $V_k$ for every possible state $\mathbf{x}$. 

- If your state $\mathbf{x}$ is 1-dimensional (e.g., a cart on a 1D track) and you discretize it into 100 points, you store **100 values**.
- If your system is a drone with position, velocity, and orientation (a 12-dimensional state vector $\mathbf{x} \in \mathbb{R}^{12}$) and you discretize each dimension into just 100 points:

$$ \text{Total Grid Points} = 100^{12} = 10^{24} $$

Storing $10^{24}$ numbers would require over **one yottabyte** of memory. Evaluating the backward recursion on a grid is computationally impossible for continuous systems with more than 4 or 5 states.

So how do we escape the curse?
1. **Reinforcement Learning / Approximate DP**: Use deep neural networks $V_\theta(s)$ or $Q_\theta(s, a)$ to approximate the continuous function across the state space.
2. **Local Trajectory Optimization**: Solve along a specific trajectory rather than the entire universe (e.g., Differential Dynamic Programming and iLQR).
3. **Analytical Structure**: Find special cases where the math solves itself in closed form.

The most famous, influential, and widely-used exact solution in human history belongs to category #3: **The Linear Quadratic Regulator (LQR)**.

---

## The Miracle of LQR: Dynamic Programming Without Grids

What if we restrict our universe to two reasonable assumptions?
1. **The physics are linear**:
   $$ \mathbf{x}_{k+1} = A \mathbf{x}_k + B \mathbf{u}_k $$
2. **The costs are quadratic** (penalize distance from origin and control effort):
   $$ L(\mathbf{x}_k, \mathbf{u}_k) = \frac{1}{2} \mathbf{x}_k^\top Q \mathbf{x}_k + \frac{1}{2} \mathbf{u}_k^\top R \mathbf{u}_k $$
   $$ \Phi(\mathbf{x}_T) = \frac{1}{2} \mathbf{x}_T^\top Q_f \mathbf{x}_T $$

Here, $Q \succeq 0$ and $Q_f \succeq 0$ are positive semi-definite state penalty matrices, and $R \succ 0$ is a positive definite control effort penalty.

### Guessing the Shape of the Value Function

Let's run Bellman's backward induction. At the final step $T$:

$$ V_T(\mathbf{x}) = \frac{1}{2} \mathbf{x}^\top P_T \mathbf{x}, \quad \text{where } P_T = Q_f $$

Notice that $V_T(\mathbf{x})$ is a pure quadratic form!

Now let's make an **ansatz** (an educated mathematical guess): what if the value function at *every* step is also quadratic?

$$ V_{k+1}(\mathbf{x}) = \frac{1}{2} \mathbf{x}^\top P_{k+1} \mathbf{x} $$

Let's plug this ansatz into Bellman's equation for step $k$:

$$
V_k(\mathbf{x}_k) = \min_{\mathbf{u}_k} \left[ \frac{1}{2} \mathbf{x}_k^\top Q \mathbf{x}_k + \frac{1}{2} \mathbf{u}_k^\top R \mathbf{u}_k + \frac{1}{2} (A \mathbf{x}_k + B \mathbf{u}_k)^\top P_{k+1} (A \mathbf{x}_k + B \mathbf{u}_k) \right]
$$

Expand the term inside the brackets:

$$
\mathcal{J}(\mathbf{u}_k) = \frac{1}{2} \mathbf{x}_k^\top Q \mathbf{x}_k + \frac{1}{2} \mathbf{u}_k^\top R \mathbf{u}_k + \frac{1}{2} \mathbf{x}_k^\top A^\top P_{k+1} A \mathbf{x}_k + \mathbf{u}_k^\top B^\top P_{k+1} A \mathbf{x}_k + \frac{1}{2} \mathbf{u}_k^\top B^\top P_{k+1} B \mathbf{u}_k
$$

Because this function is strictly convex with respect to $\mathbf{u}_k$ (since $R \succ 0$), its minimum occurs exactly where its gradient equals zero:

$$
\nabla_{\mathbf{u}_k} \mathcal{J} = R \mathbf{u}_k + B^\top P_{k+1} A \mathbf{x}_k + B^\top P_{k+1} B \mathbf{u}_k = 0
$$

Factor out $\mathbf{u}_k$:

$$
(R + B^\top P_{k+1} B) \mathbf{u}_k = - B^\top P_{k+1} A \mathbf{x}_k
$$

Multiply by the inverse matrix:

$$
\mathbf{u}_k^* = - \underbrace{\left( R + B^\top P_{k+1} B \right)^{-1} B^\top P_{k+1} A}_{K_k} \mathbf{x}_k
$$

### The Result: Pure Linear State Feedback

Look at what just happened. The optimal control policy is:

$$ \mathbf{u}_k^* = -K_k \mathbf{x}_k $$

The optimal action is **strictly linear** in the state! No optimization solver at runtime. No neural network inference. Just multiply your measured state vector by a precomputed gain matrix $K_k$.

### The Riccati Difference Equation

If you substitute $\mathbf{u}_k^* = -K_k \mathbf{x}_k$ back into the cost-to-go function, you find:

$$ V_k(\mathbf{x}_k) = \frac{1}{2} \mathbf{x}_k^\top P_k \mathbf{x}_k $$

where $P_k$ updates backward in time via the famous **Discrete Riccati Difference Equation**:

$$ P_k = Q + A^\top P_{k+1} A - A^\top P_{k+1} B \left( R + B^\top P_{k+1} B \right)^{-1} B^\top P_{k+1} A $$

Starting from $P_T = Q_f$, you propagate $P_k$ backward offline to compute the feedback matrices $K_k$. 

As $T \to \infty$ (infinite horizon), $P_k$ converges to a constant steady-state matrix $P$, giving a single stationary feedback matrix $K$ that stabilizes the system for all time.

---

## What We've Built

Let's step back and appreciate the trajectory we've taken:

1. **Part 1**: Formulated DOCPs as open-loop trajectory optimization problems. Saw that disturbances destroy open-loop execution.
2. **Part 2**: Used Bellman's Principle of Optimality to derive dynamic programming and backwards induction, uncovering closed-loop state feedback and the mathematical foundation of $Q$-functions.
3. **LQR**: Showed that for linear-quadratic systems, the curse of dimensionality vanishes, yielding closed-form linear state feedback.

What if our system is nonlinear (like an articulated robot arm or humanoid), where $A$ and $B$ don't exist globally?

That brings us to **iterative LQR (iLQR)**, **Differential Dynamic Programming (DDP)**, and **Model Predictive Control (MPC)**—where we iteratively linearize dynamics around trajectories and solve Riccati equations in real time. We'll dive into those algorithms in Part 3.
