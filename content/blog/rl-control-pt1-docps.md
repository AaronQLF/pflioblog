---
title: "Discrete-Time Optimal Control Problems (DOCPs)"
date: "2026-09-26"
excerpt: "Breaking down the foundations of Discrete-Time Optimal Control Problems (DOCPs). Understanding state transitions, cost functions, and the ultimate goal of finding the optimal policy."
tags: ["rl", "control", "math", "optimization"]
series: "RL & Control"
readingTime: 8
---

*This is the first post in my new series **RL & Control**, where we bridge the gap between classical optimal control theory and modern Reinforcement Learning. We're starting with the absolute basics: Discrete-Time Optimal Control Problems (DOCPs).*

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

### Why Should We Care?
If you can solve this massive optimization problem, you get a completely determined sequence of actions $\mathbf{u}_1, \mathbf{u}_2, \dots, \mathbf{u}_{T-1}$. This is called an **open-loop plan**.

If the real world perfectly matches your transition function $f(\mathbf{x}_k, \mathbf{u}_k)$, you just play those actions blindly and you will perfectly achieve your goal. 

But the real world has wind. Sensors are noisy. Models are imperfect. If you play an open-loop plan, you will inevitably drift away from your optimal trajectory and miss the target. 

This leads us to the need for **feedback control** (adjusting actions based on the current state) and, eventually, **Reinforcement Learning** (learning the optimal feedback control mapping $\pi(\mathbf{u}_k | \mathbf{x}_k)$ entirely from experience). 

But you can't appreciate the beauty of RL until you understand the optimization problem it's secretly trying to solve. More on feedback and dynamic programming in the next post.
