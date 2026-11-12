---
title: "Paper Review: A New Lower Bound for Sphere Packing in High Dimensions"
date: "2026-11-12"
excerpt: "In December 2023, Campos, Jenssen, Michelen, and Sahasrabudhe improved the asymptotic lower bound for sphere packing density in high dimensions for the first time since Rogers in 1947. This review works through the geometry of high-dimensional Euclidean space, explains why the linear barrier in d stood for 76 years, and details how the hard-core lattice gas model from statistical mechanics breaks the barrier by an extra factor of log d."
tags: ["Paper Review", "Mathematics", "Geometry", "Combinatorics", "Research"]
series: "Paper Review"
readingTime: 15
---

I have spent a disproportionate amount of time thinking about high-dimensional geometry over the past few years. When people try to visualize $\mathbb{R}^d$ for large $d$, their brains default to 3-dimensional analogies with extra variables attached. This intuition is wrong. High-dimensional space does not behave like ordinary space with more axes. Almost all of the volume of a high-dimensional body lives in its skin, almost all pairs of random vectors are orthogonal, and the volume of a unit Euclidean ball collapses to zero as the dimension grows.

In late 2023, Marcelo Campos, Matthew Jenssen, Marcus Michelen, and Julian Sahasrabudhe released a paper titled "A new lower bound for sphere packings" (arXiv:2312.10026). The paper resolves an asymptotic question that had not moved in 76 years. 

In 1947, Claude Shannon established foundational bounds on channel capacity using sphere packings in signal space, and in the same year, C. A. Rogers proved that the maximum density $\Delta_d$ of a packing of congruent Euclidean spheres in $\mathbb{R}^d$ satisfies:

$$\Delta_d \geq c \cdot d \cdot 2^{-d}$$

for an absolute constant $c > 0$. Over the subsequent seven and a half decades, despite efforts by Keith Ball, Henry Cohn, Noam Elkies, and Akshay Venkatesh, no one succeeded in improving the growth rate of this lower bound by more than a constant factor for general dimensions $d$. Venkatesh (2013) achieved an improvement of order $d \log \log d \cdot 2^{-d}$, but only along a very sparse subsequence of dimensions with special algebraic properties coming from cyclotomic number fields. For an arbitrary large dimension $d$, the linear factor $d$ remained immovable.

Campos, Jenssen, Michelen, and Sahasrabudhe proved that for all sufficiently large $d$:

$$\Delta_d \geq (1 - o(1)) \frac{d \log d}{2^{d+1}}$$

They improved the lower bound by a factor of $\log d$. This is not an enormous asymptotic jump in the grand scheme of the exponential gap between lower and upper bounds, but breaking a 76-year-old linear barrier requires introducing entirely new machinery.

The paper is 32 pages long. The proof is not algebraic. It does not use modular forms, theta series, or lattices. It discretizes continuous space and translates sphere packing into an independent set problem on an infinite graph, then analyzes the hard-core lattice gas model at high fugacity using tools from statistical mechanics and probabilistic combinatorics.

Here is an exact breakdown of how the proof works, why the linear barrier existed in the first place, and where the extra $\log d$ factor comes from.

---

## 1. The Sphere Packing Problem and the Density Gap

Let $B_d(x, r) = \{y \in \mathbb{R}^d : \|x - y\|_2 < r\}$ be the open Euclidean ball of radius $r$ centered at $x$. A collection of disjoint open unit balls $\mathcal{P} = \{B_d(x_i, 1)\}_{i \in I}$ is a sphere packing in $\mathbb{R}^d$. The pairwise distance between any two distinct centers must satisfy:

$$\|x_i - x_j\|_2 \geq 2 \quad \text{for all } i \neq j$$

The packing density $\Delta(\mathcal{P})$ is the fraction of $\mathbb{R}^d$ covered by the union of these balls. Formally, we define it via limits over cubes $[-L, L]^d$:

$$\Delta(\mathcal{P}) = \limsup_{L \to \infty} \frac{\text{Vol}\left(\left(\bigcup_{i \in I} B_d(x_i, 1)\right) \cap [-L, L]^d\right)}{(2L)^d}$$

The quantity of interest is the supremum over all valid packings:

$$\Delta_d = \sup_{\mathcal{P}} \Delta(\mathcal{P})$$

What is the volume of a single unit ball $B_d(0, 1)$? The standard formula is:

$$V_d = \text{Vol}(B_d(0, 1)) = \frac{\pi^{d/2}}{\Gamma\left(\frac{d}{2} + 1\right)}$$

Using Stirling's approximation $\Gamma(x + 1) \sim \sqrt{2\pi x} (x/e)^x$, for large $d$ we have:

$$V_d \sim \frac{1}{\sqrt{\pi d}} \left(\frac{2\pi e}{d}\right)^{d/2}$$

Notice that $V_d$ decays superexponentially fast. In dimension 2, the unit circle has area $\pi \approx 3.1415$. In dimension 10, the unit ball has volume approximately 2.55. In dimension 20, its volume is $0.0258$. In dimension 100, its volume is $2.36 \times 10^{-40}$. The unit ball shrinks into practical non-existence as dimension increases.

Now consider the gap between the known upper and lower bounds on $\Delta_d$:

1. **Upper Bounds:** The trivial bound is $\Delta_d \leq 1$. In 1978, Kabatiansky and Levenshtein used harmonic analysis and orthogonal polynomials to prove $\Delta_d \leq 2^{-(0.5990...) d}$. Cohn and Elkies (2003) introduced a linear programming framework based on auxiliary functions with non-negative Fourier transforms. Maryna Viazovska (2016) famously constructed exact magic functions using modular forms to prove that the $E_8$ lattice achieves the exact maximum density in dimension 8 ($\Delta_8 = \pi^4 / 384 \approx 0.25367$), and with Cohn, Kumar, Miller, and Radchenko (2017) solved dimension 24 using the Leech lattice ($\Delta_{24} = \pi^{12} / 12! \approx 0.001929$). However, for general large $d$, the best known upper bound remains exponential: $2^{-(0.599...) d}$.

2. **Lower Bounds:** In 1905, Hermann Minkowski used the geometry of numbers to prove that lattice packings exist with density at least $2 \cdot 2^{-d}$. In 1947, Rogers improved this to $c \cdot d \cdot 2^{-d}$. Davenport and Rogers (1958) adjusted the constant factor, and Keith Ball (1992) proved $\Delta_d \geq 2(d - 1) 2^{-d}$ for lattice packings.

The situation before Campos, Jenssen, Michelen, and Sahasrabudhe can be summarized by two numbers:

$$c \cdot d \cdot 2^{-d} \leq \Delta_d \leq 2^{-0.5990 d}$$

The exponent of the upper bound is roughly $-0.6 d$, while the exponent of the lower bound is $-d$. That exponential gulf is vast. But within the base-2 regime, the prefactor had been locked at order $d$ since Harry Truman was president.

---

## 2. Why High-Dimensional Space Breaks Human Intuition

To understand why the problem is difficult, you must look at two specific geometric facts about $\mathbb{R}^d$.

### Fact A: The volume is concentrated in a microscopic shell

Consider a ball of radius $R$ and a slightly smaller concentric ball of radius $R(1 - \epsilon)$, where $\epsilon \in (0, 1)$. The ratio of their volumes is:

$$\frac{\text{Vol}(B_d(0, R(1 - \epsilon)))}{\text{Vol}(B_d(0, R))} = (1 - \epsilon)^d \leq e^{-\epsilon d}$$

If we choose $\epsilon = \frac{k}{d}$ for some integer $k$, this ratio becomes $e^{-k}$.

For example, set $d = 100$ and $k = 5$. Then $\epsilon = 0.05$. The inner ball of radius $0.95 R$ contains at most $e^{-5} \approx 0.0067$, which is less than $0.7\%$ of the total volume. More than $99.3\%$ of the volume of a 100-dimensional ball resides in the outer $5\%$ of its radius.

A high-dimensional ball is not solid in the way an orange is solid. Almost all of its mass is concentrated in a paper-thin shell directly beneath its boundary surface.

### Fact B: Independent vectors are almost perfectly orthogonal

Pick two vectors $X$ and $Y$ uniformly at random from the surface of the unit sphere $S^{d-1} \subset \mathbb{R}^d$. By rotational symmetry, we can fix $X = (1, 0, 0, \ldots, 0)$. Then the dot product $X \cdot Y = Y_1$ is just the first coordinate of a uniformly distributed point on $S^{d-1}$.

The distribution of $Y_1$ has density proportional to $(1 - y^2)^{(d-3)/2}$ on $[-1, 1]$. Its expectation is 0, and its variance is:

$$\mathbb{E}[Y_1^2] = \frac{1}{d}$$

By Chebyshev's inequality or standard sub-Gaussian tail bounds:

$$\mathbb{P}\left(|X \cdot Y| > \frac{t}{\sqrt{d}}\right) \leq 2 e^{-t^2 / 2}$$

If you draw two random vectors in dimension $d = 10,000$, their dot product is with high probability smaller than $0.03$. The angle between them lies in the interval $[\frac{\pi}{2} - 0.03, \frac{\pi}{2} + 0.03]$. In high dimensions, random directions are orthogonal.

---

## 3. The Greedy Packing Barrier and Rogers' Linear Factor

Why did the lower bound get stuck at $c \cdot d \cdot 2^{-d}$?

Consider the simplest possible algorithm for generating a sphere packing: greedy placement. 

Start with an empty set of centers $\mathcal{C} = \emptyset$. At each step, find any point $x \in \mathbb{R}^d$ such that $\|x - c\|_2 \geq 2$ for all $c \in \mathcal{C}$, and add $x$ to $\mathcal{C}$. Repeat until no such point exists.

When the algorithm terminates, the packing is **saturated**. Saturation means that every point in $\mathbb{R}^d$ lies within distance less than 2 from at least one center in $\mathcal{C}$. In other words:

$$\mathbb{R}^d = \bigcup_{c \in \mathcal{C}} B_d(c, 2)$$

Now calculate the ratio of covered volume. A ball of radius 2 has volume:

$$\text{Vol}(B_d(c, 2)) = 2^d \text{Vol}(B_d(c, 1)) = 2^d V_d$$

Since the radius 2 balls cover the entire space, the average density of the centers per unit volume must be at least:

$$\rho \geq \frac{1}{\text{Vol}(B_d(0, 2))} = \frac{1}{2^d V_d}$$

Each center carries a disjoint unit ball of volume $V_d$. Therefore, the packing density of this greedy construction is:

$$\Delta = \rho \cdot V_d \geq \frac{V_d}{2^d V_d} = 2^{-d}$$

This is the trivial greedy bound: $\Delta_d \geq 2^{-d}$. Any greedy packing, no matter how poorly configured, guarantees $2^{-d}$.

To beat $2^{-d}$, you must place centers closer together than the worst-case saturated distance of 2 without violating the non-overlap condition. Rogers (1947) achieved this by analyzing the geometry of Delaunay triangulations and Voronoi cells. In any packing, space can be partitioned into Voronoi cells:

$$\text{Vor}(c) = \{x \in \mathbb{R}^d : \|x - c\|_2 \leq \|x - c'\|_2 \quad \forall c' \in \mathcal{C}\}$$

The local density inside each cell is $\frac{\text{Vol}(B_d(c, 1) \cap \text{Vor}(c))}{\text{Vol}(\text{Vor}(c))}$. Rogers proved that this local density is bounded above by the density of $d+1$ mutually touching spheres inside the regular simplex spanned by their centers. Computing this simplex ratio yields:

$$\sigma_d \sim \frac{d}{e \cdot 2^{d/2}}$$

By integrating over spatial configurations, Rogers converted this geometric constraint into an existence proof for packings with overall density $c \cdot d \cdot 2^{-d}$.

For 76 years, every refinement of this idea hit the same wall. If you use a Poisson point process with intensity $\rho$ and delete points that violate the separation condition (the packing version of the alter-and-delete method), optimizing over $\rho$ yields density of order $d \cdot 2^{-d}$. If you discretize the space into a regular graph and apply Turan's theorem or the Caro-Wei bound, you get $d \cdot 2^{-d}$. The linear factor $d$ seemed hardwired into the degree of the exclusion neighborhood.

---

## 4. The Graph Discretization and the Hard-Core Model

Campos, Jenssen, Michelen, and Sahasrabudhe approached the problem from statistical physics.

Instead of working directly with continuous Euclidean space, fix a small discretization parameter $\delta > 0$ and consider the scaled grid $\delta \mathbb{Z}^d$. Let $V$ be a large finite subset of this grid, say inside a torus $\mathbb{T}_L^d = (\mathbb{R} / L\mathbb{Z})^d$ to eliminate boundary effects.

Define an auxiliary conflict graph $G = (V, E)$ as follows:
- The vertices are the grid points $v \in V$.
- An undirected edge exists between $u$ and $v$ if and only if $0 < \|u - v\|_2 < 2$.

An **independent set** in $G$ is a subset of vertices $I \subseteq V$ such that no two vertices in $I$ share an edge. By construction, if $I$ is an independent set, then for all distinct $u, v \in I$, we have $\|u - v\|_2 \geq 2$. Placing a unit ball at each point of $I$ yields a valid sphere packing.

How do you find a large independent set in a massive graph?

In combinatorics, one standard tool is the **hard-core model**. The hard-core model on a graph $G$ at fugacity (or activity parameter) $\lambda > 0$ is a probability distribution over the set $\mathcal{I}(G)$ of all independent sets of $G$, defined by:

$$\mu_\lambda(I) = \frac{\lambda^{|I|}}{Z(\lambda)}$$

where the normalizing constant $Z(\lambda)$ is the independence polynomial:

$$Z(\lambda) = \sum_{I \in \mathcal{I}(G)} \lambda^{|I|}$$

When $\lambda \to 0$, the empty set dominates and $\mu_\lambda$ samples very small sets. When $\lambda \to \infty$, $\mu_\lambda$ concentrates uniformly on the maximum independent sets of $G$.

The expected size of an independent set drawn from $\mu_\lambda$ is related to the derivative of the log-partition function:

$$\mathbb{E}_\lambda[|I|] = \sum_{I \in \mathcal{I}(G)} |I| \frac{\lambda^{|I|}}{Z(\lambda)} = \lambda \frac{d}{d\lambda} \log Z(\lambda)$$

If you can prove that $\frac{1}{|V|} \log Z(\lambda)$ is large for an appropriate choice of $\lambda$, then by integration there must exist an independent set of corresponding size.

---

## 5. The Breakthrough: Why Graph Cliques Are an Advantage

Now we reach the technical core of the paper.

In a generic $D$-regular graph, the classic bound for the independence number $\alpha(G)$ is given by the Caro-Wei theorem:

$$\alpha(G) \geq \frac{|V|}{D + 1}$$

If the graph is triangle-free, a celebrated theorem of Ajtai, Komlos, and Szemeredi (1980), later refined by Shearer (1983), gives a significant improvement:

$$\alpha(G) \geq (1 - o(1)) \frac{\log D}{D} |V|$$

The $\log D$ factor in Shearer's theorem comes precisely from the **absence** of triangles. If a graph has no triangles, the neighborhood of every vertex is an independent set, meaning local competition between neighbors is minimal.

For decades, mathematicians looking at the sphere packing conflict graph saw the exact opposite of a triangle-free graph.

In our conflict graph $G$, the degree $D$ of a vertex is proportional to the volume of the radius 2 exclusion ball:

$$D \approx \frac{\text{Vol}(B_d(0, 2))}{\delta^d} = \frac{2^d V_d}{\delta^d}$$

Does this graph have triangles? It is packed with them. If $u$ and $v$ are neighbors at distance $1.0$, any vertex $w$ within distance $1.0$ of their midpoint is connected to both $u$ and $v$. The graph is intensely clustered. Because it was not triangle-free, researchers assumed that Shearer-type bounds yielding an extra logarithmic factor could not apply.

The insight of Campos, Jenssen, Michelen, and Sahasrabudhe is that **local clustering helps rather than hurts**, provided you evaluate the hard-core model through local codegrees instead of global triangle counts.

### The codegree structure of Euclidean balls

Let $u$ and $v$ be two vertices in $G$ at distance $r = \|u - v\|_2 < 2$. Their common neighborhood $N(u) \cap N(v)$ consists of all lattice points in the intersection of two radius 2 balls:

$$K(r) = B_d(0, 2) \cap B_d(r e_1, 2)$$

What is the volume of this lens-shaped intersection?

Using high-dimensional spherical geometry, the volume of the intersection of two balls of radius $R = 2$ whose centers are separated by distance $r \in (0, 2)$ can be computed explicitly:

$$\text{Vol}(K(r)) = 2 V_{d-1} \int_{r/2}^2 \left(4 - x^2\right)^{(d-1)/2} dx$$

Substitute $x = 2 - y$. The integrand is dominated by the region where $x$ is near $r/2$. When the two centers are close ($r \leq 2 - \frac{c}{\sqrt{d}}$), the volume of this intersection is a substantial fraction of the total ball volume.

More importantly, consider three vertices $u, v, w$. In general graphs, you must worry about complicated higher-order dependence structures. But in Euclidean space, distance satisfies the triangle inequality. If two points are both close to a third point, the angle between the vectors is constrained.

### The Occupancy Fraction Inequality

The authors analyze the **occupancy fraction** $\alpha_v(\lambda) = \mathbb{P}_\lambda(v \in I)$. In a vertex-transitive graph, by symmetry this is independent of $v$, and the average density is simply $\alpha(\lambda)$.

By the spatial Markov property of the hard-core model:

$$\mathbb{P}_\lambda(v \in I \mid I \setminus \{v\}) = \frac{\lambda}{1 + \lambda} \mathbf{1}_{\{N(v) \cap I = \emptyset\}}$$

Taking expectations:

$$\alpha(\lambda) = \frac{\lambda}{1 + \lambda} \mathbb{P}_\lambda(N(v) \cap I = \emptyset)$$

To make $\alpha(\lambda)$ large, we need $\mathbb{P}_\lambda(N(v) \cap I = \emptyset)$ to not decay too rapidly as $\lambda$ increases.

If the neighborhood $N(v)$ were composed of mutually independent vertices, the probability of none being selected would decay like $(1 - \alpha)^D \approx e^{-\alpha D}$. This exponential decay forces $\alpha \approx \frac{\log D}{D}$ at best.

However, the vertices in $N(v)$ are heavily connected to one another. The authors prove a new general theorem for the hard-core model on graphs with controlled codegrees:

> **Theorem (Campos et al., 2023):** Let $G$ be a graph of maximum degree $D$. Suppose that for each vertex $v$, the induced subgraph on $N(v)$ has average degree at least $d_{\text{local}}$. Then for an appropriately tuned fugacity parameter $\lambda$, the occupancy fraction satisfies:
>
> $$\alpha(\lambda) \geq (1 - o(1)) \frac{\log(d_{\text{local}})}{D}$$

In their geometric setting:
- The ambient degree $D$ scales as $2^d V_d \delta^{-d}$.
- The local degree inside the neighborhood $d_{\text{local}}$ scales as $d \cdot 2^d$ across relevant spherical shells.

Because the local graph inside $N(v)$ has high density, conditioning on one neighbor being absent increases the probability that another neighbor is absent due to positive correlation of exclusions. The clusters effectively "waste" edges on each other, leaving more room for the independent set to breathe.

By carrying out this analysis on a Poisson point process directly (using the continuous analogue via the Janossy densities of the hard-core gas), they bypass the grid artifact entirely and obtain:

$$\Delta_d \geq (1 - o(1)) \frac{d \log d}{2^{d+1}}$$

The factor of $\log d$ appears directly from the ratio between the entropy of the local clustered neighborhood and the global degree.

---

## 6. Summary Comparison of Bounds

To place this result in context, here is how the historical bounds on high-dimensional sphere packing density compare:

| Author(s) | Year | Asymptotic Lower Bound on $\Delta_d$ | Method |
| :--- | :--- | :--- | :--- |
| **H. Minkowski** | 1905 | $2 \cdot 2^{-d}$ | Geometry of numbers (lattice bodies) |
| **C. A. Rogers** | 1947 | $c \cdot d \cdot 2^{-d}$ | Simplex covering and Delaunay cells |
| **K. Ball** | 1992 | $2(d - 1) \cdot 2^{-d}$ | Voronoi cells of lattices |
| **A. Venkatesh** | 2013 | $c \cdot d \log \log d \cdot 2^{-d}$ *(subsequences only)* | Division algebras and cyclotomic fields |
| **Campos, Jenssen, Michelen, Sahasrabudhe** | **2023** | **$(1 - o(1)) \frac{d \log d}{2^{d+1}}$** *(all dimensions)* | **Hard-core model and codegree cluster expansions** |

---

## 7. What This Means and What Remains Open

This paper is important for three specific reasons:

1. **It breaks a psychological barrier.** For 76 years, $O(d \cdot 2^{-d})$ was widely viewed as the natural limit of probabilistic and greedy methods in high dimensions. The prevailing assumption was that any improvement beyond order $d$ would have to come from deep arithmetic geometry or exotic lattices. Campos et al. showed that probabilistic combinatorics was not exhausted; rather, our understanding of spatial correlation in high-dimensional conflict graphs was simply incomplete.

2. **The method generalizes beyond spheres.** The same proof template applies to packings of other convex bodies (such as cross-polytopes or regular simplices in $\mathbb{R}^d$) where the conflict graphs exhibit similar local codegree concentration.

3. **The exponential gap remains open.** The upper bound is $2^{-0.599 d}$. The lower bound is now roughly $\frac{d \log d}{2} 2^{-d}$. The exponent is still $-1$ on the lower bound and $-0.599$ on the upper bound. Closing that gap remains one of the premier open problems in mathematics.

I find this paper deeply satisfying. It does not introduce 400 pages of impenetrable categorical abstraction. Instead, it takes a clean physical model (the hard-core gas), asks precisely how local geometry distorts the Gibbs measure, and calculates the resulting partition function with enough care to beat Claude Shannon and C. A. Rogers at their own game.

---

*For the complete proof and technical lemmas on cluster expansion, read the original preprint: [Campos, Jenssen, Michelen, and Sahasrabudhe (2023), arXiv:2312.10026](https://arxiv.org/abs/2312.10026).*
