---

## title: "Google Just Published a Countdown Timer for Cryptography"
date: "2026-04-02"
excerpt: "Google Quantum AI dropped two papers that reduce the resources needed to break RSA and elliptic curve cryptography by orders of magnitude. The math is beautiful. The implications are not."
tags: ["AI", "quantum", "cryptography"]

Google Quantum AI published a paper on March 31, 2026 that reduces the quantum resources needed to break 256-bit elliptic curve cryptography to fewer than 1,200 logical qubits. Previous best estimate was 9 million physical qubits. This paper gets it to under 500,000.

I want to walk through the machinery that got us here, because the number alone does not communicate how fast the ground moved.

## Shor's algorithm, briefly

Shor's algorithm has been around since 1994. It solves two problems that are central to modern cryptography: integer factorization (which breaks RSA) and the discrete logarithm problem (which breaks elliptic curve cryptography). Both problems reduce to the same primitive: quantum period-finding.

The intuition for RSA is this. You have a large number $N$ that is the product of two primes, and you want to find those primes. You pick a random number $a$ and look at the sequence $a^1 \bmod N$, $a^2 \bmod N$, $a^3 \bmod N$, and so on. This sequence eventually repeats, with some period $r$. If you can find $r$, basic number theory gives you the factors of $N$ with high probability.

Classically, finding that period is extremely expensive. The best known classical algorithm runs in subexponential time. A quantum computer finds it in polynomial time by putting all possible exponents into superposition simultaneously, computing $a^x \bmod N$ in parallel across all of them, and then using a quantum Fourier transform to extract the period from the interference pattern. The math is elegant and the algorithm is well-understood. The hard part has always been the engineering.

For elliptic curve cryptography, the same idea applies but over a different algebraic structure. Instead of modular exponentiation, the quantum circuit performs point additions on an elliptic curve in superposition. The target is the secret scalar $k$ in $Q = kP$, where $P$ and $Q$ are points on the curve and $k$ is effectively the private key. The quantum circuit computes enough point additions in parallel to extract $k$ via the same Fourier transform trick.

The expensive part in both cases is the arithmetic. Modular multiplications for RSA, point additions for ECC. Each operation decomposes into thousands of elementary quantum gates, and you need thousands of operations. The total gate count, and the number of qubits needed to store intermediate values, is where the cost lives.

## Why qubits are expensive

Quantum computers are noisy. Every gate operation has a small probability of error, roughly 0.1% for current superconducting hardware. For a computation requiring billions of operations, even a 0.1% error rate per gate means the computation would fail almost certainly without error correction.

Error correction works by encoding each "logical" qubit (the abstract qubit your algorithm operates on) into many "physical" qubits using a scheme called the surface code. Think of it as redundancy: you spread the information across a grid of physical qubits so that errors can be detected and corrected before they corrupt the computation.

The overhead is significant. A single logical qubit requires roughly 1,000 physical qubits at the error rates and code distances needed for a computation like Shor's. And Shor's algorithm for 2048-bit RSA needs thousands of logical qubits. Multiply those together and you get the classic estimate: 20 million physical qubits to factor a 2048-bit RSA key in eight hours.

Twenty million is a number that lets people sleep at night. Current quantum computers have around 1,200 physical qubits. Twenty million feels like a problem for the next generation.

Then Craig Gidney published a paper in May 2025 and that number stopped being twenty million.

## The May 2025 paper: RSA in under a million qubits

Gidney reduced the 2048-bit RSA factoring estimate from 20 million physical qubits in 8 hours to under 1 million physical qubits in under a week. The tradeoff is time, but nobody cares about the difference between eight hours and five days when the qubit count dropped by 20x. The Toffoli gate count (a good proxy for total computational cost) dropped by over 100x.

Three techniques account for most of the improvement.

**Approximate arithmetic.** Standard quantum modular arithmetic carries exact precision through every operation, which requires wide qubit registers and deep circuits. Chevignard, Fouque, and Schrottenloher (2024) showed you can use approximate arithmetic that introduces small bounded errors in intermediate steps. The key insight is that the period extraction at the end of Shor's algorithm is robust to small perturbations, so you do not need exact answers throughout the computation. You just need an answer that is close enough. This lets you use narrower registers and shallower circuits, saving both qubits and gates.

**Smarter memory management.** At any given moment during Shor's algorithm, most logical qubits are just sitting there holding intermediate values. They are not being computed on, just stored. Standard surface codes charge the same overhead for idle storage as for active computation, roughly 1,000 physical qubits per logical qubit regardless.

Yoked surface codes (Gidney, Newman, Brooks, Jones 2023) add a second layer of error correction specifically for idle qubits, allowing them to be packed at roughly one-third the physical qubit cost. For an algorithm where 90% of the qubits are idle at any given time, this is a 3x reduction in the dominant cost. The name "yoked" comes from the way multiple surface code patches are linked together, sharing parity check resources.

**Cheaper magic states.** The surface code natively supports a limited set of quantum gates. To get the full set needed for universal computation, you need to prepare special auxiliary quantum states called "magic states" and consume them during the computation. Preparing these states with high enough fidelity traditionally uses a process called distillation, which is extremely expensive in qubit count. Magic state cultivation (Gidney, Shutty, Jones 2024) replaces distillation with a more efficient protocol that grows high-fidelity states using fewer resources, shrinking the footprint of each "magic state factory" by 5-10x.

Each of these techniques is independently useful. Stacked, they compound into a 20x reduction in total physical qubits.

## The March 2026 paper: ECC in eighteen minutes

If the RSA paper was concerning, the March 2026 paper is the one that should be on everyone's radar.

Google Quantum AI, working with researchers from the Ethereum Foundation and Stanford, compiled two optimized quantum circuits for breaking the 256-bit elliptic curve discrete logarithm problem. This is the specific mathematical problem whose hardness protects Bitcoin's ECDSA signatures, Ethereum's transaction authentication, and most deployed elliptic curve systems.

Two circuit variants. The low-qubit version uses fewer than 1,200 logical qubits and about 90 million Toffoli gates. The low-gate version uses fewer than 1,450 logical qubits and about 70 million Toffoli gates. Compiled to actual hardware with surface codes, both need fewer than 500,000 physical qubits. The low-gate variant runs in about 18 minutes, or 9 minutes with precomputation of fixed curve parameters.

Previous best estimate, from Litinski in 2023, was approximately 9 million physical qubits. This paper is a 20x reduction.

The optimizations are almost entirely in how the arithmetic circuits are laid out. Instead of processing the secret scalar one bit at a time, they use windowed arithmetic that processes multiple bits per step using precomputed lookup tables, implemented as quantum read-only memory. They fuse the lookup and the subsequent point addition into a single operation, eliminating intermediate storage. They exploit the specific algebraic structure of Bitcoin's curve (secp256k1, whose prime $p = 2^{256} - 2^{32} - 977$ has a special form that enables arithmetic shortcuts) to speed up the modular inversions needed for point addition.

Each optimization individually saves a few percent. Stacked, they produce the 20x reduction. This is not a breakthrough in the physics. It is relentless circuit engineering on thirty-year-old math, and it is the kind of work that compounds because there is always another constant factor to shave.

## They gave you a deadline

Google set an internal target of 2029 to migrate all of its infrastructure to post-quantum cryptography. NIST plans to deprecate RSA by 2030 and disallow it entirely by 2035. These are not aspirational timelines. They have resource allocation behind them.

I will translate this out of the polite academic language: Google basically told the entire crypto economy, and really anyone depending on classical public-key cryptography, "you have until 2029 before we consider these broken." They published the proof. They set the date. They are already migrating their own systems.

## The zero-knowledge disclosure

This is my favorite part of the whole thing.

Google compiled working quantum circuits for breaking ECDLP-256. They then chose not to publish the circuits. Instead, they constructed a cryptographic zero-knowledge proof that the circuits are correct and achieve the claimed resource counts, without revealing the circuit structure itself.

The proof allows any third party to verify Google's claims in milliseconds. The proof reveals nothing about the circuit. It is a 128-byte mathematical object that says "yes, these circuits exist and they do what we say they do" without giving you any way to reconstruct them.

They built this using SP1 zkVM (a zero-knowledge virtual machine) and Groth16 SNARKs (a proof system based on elliptic curve pairings). Google also coordinated with the U.S. government before publication, citing national security concerns.

The irony is layered enough to make me genuinely happy. Google used elliptic curve cryptography (the Groth16 proof system, which relies on the hardness of the discrete log problem over elliptic curves) to prove that they can break elliptic curve cryptography. The proof of the attack is secured by the same mathematical assumption that the attack breaks. This is only temporarily paradoxical, the proof only needs to be convincing now, not in perpetuity, but the circularity is aesthetically perfect.

## The current gap

Current quantum hardware: Google's Willow chip (late 2024) has approximately 1,200 physical qubits. The ECDLP attack requires 500,000 physical qubits. That is a gap of roughly 400x.

But the gap is closing from both directions. Hardware qubit counts have been roughly doubling every 1-2 years. Algorithmic resource estimates have dropped by 20x in a single paper. The trajectory is two converging curves.

There are over 1.7 million BTC in wallet formats where the public key is already exposed on the blockchain. These are early Bitcoin wallets (including wallets believed to be Satoshi's) that used a format where the public key sits in plain view on a public ledger. You do not need to intercept a transaction. You just need to solve the discrete logarithm for a point that everyone can see. Including all vulnerable script types, the exposure reaches approximately 2.3 million BTC.

Post-quantum cryptography standards exist. NIST finalized replacements based on lattice problems in 2024. The migration path is known. But migrating decentralized systems like Bitcoin requires consensus upgrades, which means years of community debate before a single line of code ships. Some of those exposed wallets belong to people who lost their keys. Those coins cannot be migrated. They will sit there, with their public keys visible, until someone computes the private key or the universe ends, whichever comes first.

## What I keep thinking about

Shor's algorithm has not changed since 1994. The physics has not changed. The error correction codes are well-understood. Everything that moved in these papers is engineering: better arithmetic circuits, better memory layouts, better state preparation protocols. This is not the kind of progress that hits a wall. It is the kind that compounds.

Google did not publish a prediction. They published a proof, wrapped in a proof, and set a date.