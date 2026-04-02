---
title: "Google Just Published a Countdown Timer for Cryptography"
date: "2026-04-02"
excerpt: "Google Quantum AI dropped two papers that reduce the resources needed to break RSA and elliptic curve cryptography by orders of magnitude. The math is beautiful. The implications are not."
tags: ["AI", "quantum", "cryptography"]
---

Google Quantum AI published a paper on March 31, 2026 that reduces the quantum resources needed to break 256-bit elliptic curve cryptography to fewer than 1,200 logical qubits. Previous best estimate was 9 million physical qubits. This paper gets it to under 500,000.

I want to walk through the actual math, because the numbers alone do not communicate what happened here.

## Shor's algorithm, properly

Shor's algorithm solves two problems: integer factorization and the discrete logarithm problem. Both reduce to a single primitive called quantum order-finding.

For RSA, the setup is this. You have a composite integer $N = pq$ and you want to find $p$ and $q$. Pick a random $a$ coprime to $N$. Define the function $f(x) = a^x \bmod N$. This function is periodic with some unknown period $r$, meaning $a^r \equiv 1 \pmod{N}$. If you can find $r$, then with probability at least $1/2$, either $\gcd(a^{r/2} - 1, N)$ or $\gcd(a^{r/2} + 1, N)$ gives you a nontrivial factor of $N$.

Classically, finding $r$ takes subexponential time (the best known algorithm, the general number field sieve, runs in $\exp(O(n^{1/3} (\log n)^{2/3}))$ for an $n$-bit integer). Quantumly, you find $r$ using the quantum Fourier transform in polynomial time.

The quantum circuit works in two registers. The first register holds $n$ qubits initialized to a uniform superposition:

$$\frac{1}{\sqrt{2^n}} \sum_{x=0}^{2^n - 1} |x\rangle$$

 The second register stores $f(x) = a^x \bmod N$, computed via reversible modular exponentiation. After applying the modular exponentiation as a controlled unitary, the joint state is:

$$\frac{1}{\sqrt{2^n}} \sum_{x=0}^{2^n - 1} |x\rangle |a^x \bmod N\rangle$$

Applying the quantum Fourier transform to the first register and measuring yields a value $c/2^n$ that is close to some multiple of $1/r$. Continued fraction expansion of $c/2^n$ extracts $r$ with high probability. Repeat a few times if needed.

The critical subroutine is the modular exponentiation $|x\rangle|y\rangle \rightarrow |x\rangle|y \cdot a^x \bmod N\rangle$. For a 2048-bit $N$, this requires a sequence of 2048 controlled modular multiplications, each decomposed into modular additions, each decomposed into elementary gates. The total gate count and the number of qubits needed to hold the intermediate values are where the cost lives.

## The ECDLP variant

For elliptic curve cryptography, the target is different. You have an elliptic curve $E$ over a finite field $\mathbb{F}_p$, defined by $y^2 = x^3 + ax + b$, with a base point $P$ of order $n$. The public key is a point $Q = kP$ for some secret scalar $k \in [1, n-1]$. The ECDLP is: given $P$ and $Q$, find $k$.

Shor's algorithm for ECDLP uses a two-register approach similar to the integer factoring case, but the arithmetic is over the elliptic curve group instead of $\mathbb{Z}/N\mathbb{Z}$. The quantum circuit computes:

$$\frac{1}{n} \sum_{a=0}^{n-1} \sum_{b=0}^{n-1} |a\rangle|b\rangle|aP + bQ\rangle$$

After applying the QFT to both scalar registers and measuring, you obtain values that allow extraction of $k$ via classical post-processing.

The expensive subroutine here is elliptic curve point addition in quantum superposition. A single point addition on a curve over $\mathbb{F}_p$ for a 256-bit prime $p$ involves computing:

$$\lambda = \frac{y_2 - y_1}{x_2 - x_1} \bmod p$$

$$x_3 = \lambda^2 - x_1 - x_2 \bmod p$$

$$y_3 = \lambda(x_1 - x_3) - y_1 \bmod p$$

Each of these requires modular inversions, multiplications, and subtractions, all of which must be implemented as reversible quantum circuits. The modular inversion alone (computing $(x_2 - x_1)^{-1} \bmod p$) is typically done via the extended Euclidean algorithm or Fermat's little theorem ($a^{-1} \equiv a^{p-2} \bmod p$), both of which are expensive in gate count.

For secp256k1 (Bitcoin's curve), $p = 2^{256} - 2^{32} - 977$, a 256-bit prime. The full ECDLP circuit needs roughly $2n$ scalar multiplications of 256-bit points, with each scalar multiplication decomposing into approximately 256 point additions.

This is where the gate counts get large. And this is where the optimization work matters.

## Quantum error correction and the qubit tax

Quantum gates are not perfect. Superconducting qubits currently achieve two-qubit gate fidelities around 99.9%, which means a physical error rate $p_{\text{phys}} \approx 10^{-3}$. For a computation requiring $10^9$ logical operations, you need a logical error rate per operation of at most $p_{\text{logical}} \approx 10^{-12}$ to have a reasonable probability of the computation succeeding without a logical error.

The surface code achieves this by encoding a single logical qubit into a $d \times d$ grid of physical qubits, where $d$ is the code distance. The logical error rate suppresses exponentially with distance:

$$p_{\text{logical}} \approx 0.1 \left(\frac{p_{\text{phys}}}{p_{\text{threshold}}}\right)^{\lfloor d/2 \rfloor}$$

For $p_{\text{phys}} = 10^{-3}$ and a threshold $p_{\text{threshold}} \approx 10^{-2}$, getting $p_{\text{logical}} \leq 10^{-12}$ requires $d \approx 23$. That is $d^2 = 529$ data qubits plus approximately the same number of syndrome measurement qubits, so roughly 1,000 physical qubits per logical qubit.

For a computation needing 2,000 logical qubits at code distance 23, you need about 2 million physical qubits just for the data. Add in routing space, magic state factories, and ancilla qubits, and the original estimates for Shor's algorithm on 2048-bit RSA landed at 20 million physical qubits.

## The May 2025 paper: getting RSA under a million

Craig Gidney's paper reduced the 2048-bit RSA factoring estimate from 20 million physical qubits in 8 hours to under 1 million physical qubits in under a week. Over 100x reduction in Toffoli gate count. Three techniques account for most of it.

**Approximate residue arithmetic.** In standard quantum modular arithmetic, you carry exact precision through every addition and multiplication. For a 2048-bit modulus, that means 2048-qubit-wide registers with full carry propagation. Chevignard, Fouque, and Schrottenloher (2024) showed you can work in a residue number system with approximate arithmetic, allowing small bounded errors in intermediate computations that get corrected classically after the quantum measurement. The key insight is that the QFT at the end of Shor's algorithm only needs the result modulo the period, and period extraction via continued fractions is robust to small perturbations. This lets you use narrower registers and shallower circuits, saving both qubits and gates.

**Yoked surface codes.** At any given moment during Shor's algorithm, most logical qubits are idle. They hold intermediate values that are not being operated on. Standard surface codes store each idle qubit at the same cost as an active qubit, roughly $d^2$ physical qubits per logical qubit.

Yoked surface codes concatenate surface codes into an outer high-density parity check (HDPC) code. The construction arranges $m$ surface-code patches into a rectangular grid and applies an additional layer of parity checks across the patches. The outer code adds redundancy at the logical level, allowing the inner surface code distance to be reduced while maintaining the same overall logical error rate.

The net effect: idle logical qubits can be stored at roughly $d^2/3$ physical qubits each instead of $d^2$. For an algorithm where 90% of the qubits are idle at any given time, this is a 3x reduction in the dominant cost.

**Magic state cultivation.** The surface code natively supports Clifford gates ($H$, $S$, CNOT), which are not universal for quantum computation. Universality requires the T gate, which applies a $\pi/8$ phase rotation:

$$T|0\rangle = |0\rangle, \quad T|1\rangle = e^{i\pi/4}|1\rangle$$

The T gate cannot be implemented transversally on surface codes. Instead, you prepare a magic state $|T\rangle = \frac{1}{\sqrt{2}}(|0\rangle + e^{i\pi/4}|1\rangle)$ and consume it via gate teleportation. The problem is that preparing $|T\rangle$ with the fidelity required for fault-tolerant computation traditionally uses magic state distillation, a process that takes many noisy $|T\rangle$ states and distills fewer high-fidelity ones. Distillation is expensive: each distillation factory occupies thousands of physical qubits and produces one magic state every several code cycles.

Magic state cultivation (Gidney, Shutty, Jones 2024) replaces the distillation pipeline with a protocol that "grows" high-fidelity magic states by applying a sequence of stabilizer checks to a single noisy state, keeping only the states that pass all checks. The yield is lower (most states are discarded) but the physical qubit footprint per factory is dramatically smaller. For a computation that needs billions of T gates, shrinking the factory footprint by 5-10x compounds into a massive overall qubit reduction.

Gidney's paper assumes physical error rate $10^{-3}$, surface code cycle time 1 microsecond, reaction time 10 microseconds, and a square grid with nearest-neighbor connectivity. These are parameters that IBM, Google, and other teams are actively targeting.

## The March 2026 paper: ECDLP-256 in eighteen minutes

This is the one that should be on everyone's radar.

Google compiled two optimized quantum circuits for Shor's algorithm applied to ECDLP-256. The target curve is secp256k1, the curve Bitcoin uses for ECDSA signatures. Two variants:

- Low-qubit: fewer than 1,200 logical qubits, approximately 90 million Toffoli gates
- Low-gate: fewer than 1,450 logical qubits, approximately 70 million Toffoli gates

Compiled to superconducting hardware with surface codes, both variants need fewer than 500,000 physical qubits. The low-gate variant runs in about 18 minutes, or 9 minutes if you precompute tables for the fixed curve parameters (which you obviously would, since the curve is public).

Previous best estimate from Litinski (2023) was approximately 9 million physical qubits. This is a 20x reduction.

The optimizations are almost entirely in the arithmetic layer. A few of the key ones:

**Windowed scalar multiplication.** Instead of processing the scalar bits one at a time (each requiring a conditional point addition), you process them in windows of $w$ bits. This replaces $n$ conditional additions with $n/w$ lookups into a precomputed table of $2^w$ points, followed by point additions. The lookup is implemented as a quantum read-only memory (qROM). Larger windows mean fewer additions but larger lookup tables, and the optimization is in finding the sweet spot.

**Merged lookup-addition.** The 2026 paper merges the qROM lookup and the subsequent point addition into a single fused operation, eliminating intermediate qubit storage and reducing the total number of Toffoli gates per window step.

**Bypassed address computation.** In a standard windowed approach, computing the lookup address from the scalar bits requires unary-to-binary conversion circuits that add depth. The paper shows that certain address bits can be bypassed, fed directly into the lookup without conversion, reducing both depth and Toffoli count.

**Modular inversion via Fermat.** The point addition formula requires computing modular inverses. The paper uses Fermat's little theorem ($a^{-1} = a^{p-2} \bmod p$) implemented via a fixed addition chain for $p - 2$, optimized specifically for the structure of the secp256k1 prime $p = 2^{256} - 2^{32} - 977$. The special form of this prime allows significant shortcuts in the exponentiation chain compared to a generic 256-bit prime.

Each of these optimizations individually saves a modest percentage. Stacked, they produce the 20x reduction. This is not a breakthrough in the physics. It is relentless circuit engineering, and it is the kind of work that does not plateau because there is always another constant factor to shave.

## They gave you a deadline

Google set an internal target of 2029 to migrate all of its infrastructure to post-quantum cryptography. NIST plans to deprecate RSA by 2030 and disallow it entirely by 2035.

I will translate this out of the polite academic language: Google basically told the entire crypto economy, and really anyone depending on classical public-key cryptography, "you have until 2029 before we consider these broken." They published the proof. They set the date. They are already migrating their own systems.

## The zero-knowledge disclosure

This is my favorite part of the whole thing, for reasons that are entirely about the math.

Google compiled working quantum circuits for breaking ECDLP-256. They then chose not to publish the circuits. Instead, they constructed a zero-knowledge proof that the circuits are correct and achieve the claimed resource counts, without revealing the circuit structure.

The proof pipeline works like this: the optimized quantum circuit is expressed as an arithmetic computation. This computation is compiled into a program for the SP1 zkVM (a RISC-V based zero-knowledge virtual machine by Succinct Labs). The zkVM execution produces a trace. The trace is then wrapped in a Groth16 SNARK (succinct non-interactive argument of knowledge), which is a proof system based on elliptic curve pairings over BN254.

A Groth16 proof consists of three group elements $(A, B, C)$ in a bilinear group, totaling about 128 bytes. Anyone can verify the proof by checking a single pairing equation:

$$e(A, B) = e(\alpha, \beta) \cdot e(\sum_{i=0}^{l} a_i u_i, \gamma) \cdot e(C, \delta)$$

where $e$ is the bilinear pairing, $\alpha, \beta, \gamma, \delta$ are elements of the structured reference string, $u_i$ are verification key elements, and $a_i$ are the public inputs. Verification takes milliseconds. The proof reveals nothing about the circuit itself.

The irony here is layered enough to make me genuinely happy. Google used elliptic curve cryptography (the Groth16 proof over BN254, an elliptic curve) to prove that they can break elliptic curve cryptography (ECDLP-256 on secp256k1). The proof system is itself vulnerable to quantum attack (Groth16 security relies on the hardness of the discrete log problem on elliptic curves). So the proof of the attack is secured by the same mathematical assumption that the attack breaks. This is only temporarily paradoxical, because the proof only needs to be convincing now, not in perpetuity, but the circularity is aesthetically perfect.

## The current gap

Current state of quantum hardware: Google's Willow chip (late 2024) has approximately 1,200 physical qubits. The ECDLP attack requires 500,000 physical qubits. That is a gap of roughly 400x.

But the gap is closing from both directions. Hardware qubit counts have been roughly doubling every 1-2 years. Algorithmic resource estimates have dropped by 20x in a single paper. The trajectory is not linear. It is two exponentials converging.

There are over 1.7 million BTC in pay-to-public-key (P2PK) wallet formats where the public key is already exposed on the blockchain. These wallets, predominantly from Bitcoin's early years (including wallets believed to be Satoshi's), are vulnerable the moment a sufficiently large quantum computer exists. The public key is literally sitting on a public ledger. You do not need to intercept a transaction. You just need to compute the discrete log of a point that everyone can see. Including all vulnerable script types, the exposure reaches approximately 2.3 million BTC.

Post-quantum cryptography standards exist. NIST finalized ML-KEM (based on Module-LWE, a lattice problem) for key encapsulation and ML-DSA (based on Module-LWE and Module-SIS) for digital signatures in 2024. The migration path is known. But migrating decentralized systems like Bitcoin requires consensus upgrades, which means years of community debate before a single line of code ships.

Some of those exposed wallets belong to people who lost their keys. Those coins cannot be migrated. They will sit there, with their public keys visible, until someone computes the private key or the universe ends, whichever comes first.

## What I keep thinking about

I keep coming back to the fact that Shor's algorithm has not changed since 1994. The physics has not changed. The error correction codes are well-understood. Everything that moved in these papers is engineering: better arithmetic circuits, better memory layouts, better state preparation protocols. This is not the kind of progress that hits a wall. It is the kind that compounds.

Google did not publish a prediction. They published a proof, wrapped in a proof, and set a date.

This is not speculation. It is a schedule.