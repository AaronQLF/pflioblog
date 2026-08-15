---
title: "Paper Review: Progress Measures for Grokking via Mechanistic Interpretability"
excerpt: "Fifteenth entry in the Paper Review series. Nanda et al. (2023) took the most famous sudden-generalization result in deep learning and showed the suddenness was an artifact of what we were measuring. The circuit forms smoothly the whole time. Also the cleanest demonstration I know that reverse-engineering a network buys you predictive power, not just a story."
date: "2026-08-07"
tags: ["Paper Review", "AI", "Interpretability", "Research"]
series: "Paper Review"
seriesOrder: 15
---

Grokking was, for about two years, the deep learning result that everyone had an opinion about and nobody could explain. Power et al. train a small transformer on modular arithmetic. Training accuracy hits 100 percent almost immediately. Test accuracy sits at chance for tens of thousands of steps, long past the point where any sane person would have killed the run, and then jumps to 100 percent seemingly at once. The loss curve looks like a bug. It got passed around as evidence for whatever the person passing it around already believed: emergent capabilities, phase transitions, the inadequacy of statistical learning theory, the imminence of everything.

"Progress Measures for Grokking via Mechanistic Interpretability" (Nanda, Chan, Lieberum, Smith, Steinhardt, 2023) does the boring, correct thing instead. It opens the model, works out exactly what algorithm the weights implement, and then uses that knowledge to construct metrics that were not visible in the original loss curve. Under those metrics, nothing sudden happens. The generalizing circuit grows smoothly and monotonically from early in training. What is sudden is the moment the memorizing solution is deleted, which is a different event with a different cause.

I keep coming back to this paper because it is the strongest existence proof I have for a claim I otherwise have to argue for on faith: that fully reverse-engineering a network gives you something you cannot get any other way.

## The Setup

The task is modular addition. Given tokens $a$ and $b$, predict $(a + b) \bmod P$ with $P = 113$. The model is a one-layer transformer, attention followed by an MLP, no layer norm, trained on a random 30 percent of the $113^2$ possible input pairs with full-batch gradient descent, AdamW, and meaningful weight decay. The rest of the pairs are the test set. This is a toy in the strict sense: the entire data distribution is enumerable, the ground-truth function is known, and the network is small enough to inspect end to end.

That is the point. You cannot do this paper on a frontier model. You do it here because here it is possible, and then you argue about what transfers.

## The Algorithm The Network Learns

This is the part that made me put the paper down and go for a walk.

The network does not learn a lookup table, and it does not learn anything resembling the addition algorithm a human would write. It learns to do modular addition with the discrete Fourier transform and trigonometric identities.

Concretely. The embedding layer maps each input token $a$ to a sparse set of frequency components, roughly five of them, of the form $\cos(\omega_k a)$ and $\sin(\omega_k a)$ where $\omega_k = 2\pi k / P$. The attention and MLP layers compute products of these components across the two inputs, which by the angle addition formula gives terms in $\cos(\omega_k(a+b))$ and $\sin(\omega_k(a+b))$. The unembedding then computes, for each candidate output $c$, a quantity proportional to

$$\sum_k \cos\left(\omega_k(a + b - c)\right)$$

and this sum is maximized exactly when $a + b - c \equiv 0 \pmod P$, because every cosine term hits its peak simultaneously only at the correct answer and otherwise the terms interfere destructively. The network has rediscovered that convolution is pointwise multiplication in the frequency domain, which is the same reason the FFT exists, and it did so under nothing but gradient pressure on a cross-entropy loss.

The evidence for this is not vibes. The authors show the embedding matrix is sparse in the Fourier basis, they identify the specific key frequencies, they show the MLP neurons are well approximated by functions of those frequencies, and they perform ablations: project the weights onto the claimed frequency components and performance is preserved, project them out and performance collapses. The claim is falsifiable and they try to falsify it.

## The Progress Measures

Having the algorithm in hand, the authors can now measure things that are invisible from the outside.

The first is **restricted loss**. Take the trained network, ablate everything except the key frequencies the algorithm is claimed to use, and evaluate. If the generalizing circuit is present, restricted loss is low. If the model is memorizing, ablating most of the network's capacity should destroy it.

The second is **excluded loss**. Do the opposite. Remove the key frequency components and keep everything else. This isolates whatever the model is doing that is not the generalizing algorithm, which in practice is the memorization.

The third is a sparsity measure on the Fourier spectrum of the embeddings, capturing how concentrated the representation has become on a small set of frequencies.

Run these through training and the story rearranges itself. Restricted loss falls smoothly and continuously from very early in training, long before test loss moves at all. The circuit is being built the entire time. Excluded loss stays low during the plateau and then rises sharply right at the grokking point, which is the memorized solution being destroyed. The test loss curve is the difference between two smooth processes with different time constants, and the appearance of a phase transition comes from the crossover, not from anything discontinuous in the weights.

## Three Phases, And Which One Is Actually Sudden

The paper decomposes training into memorization, circuit formation, and cleanup.

In memorization, the model does the cheap thing. Thirty percent of a small input space is easy to store, train loss drops, test loss does not, and there is nothing mysterious here.

In circuit formation, the generalizing algorithm develops in parallel with the memorized solution. Train loss is already near zero, so from the outside nothing is happening. Inside, restricted loss is dropping steadily. The gradient signal that builds the circuit is not coming from the fit to the training data, which is already saturated. It is coming from weight decay, which prefers a solution that achieves the same training loss at lower norm, and the Fourier circuit is dramatically cheaper in parameter norm than a table of 3,800 memorized pairs.

In cleanup, weight decay finishes removing the now-redundant memorized component. Test loss falls off a cliff. This is the visible grokking event, and it is genuinely fast, but what it marks is a deletion, not a discovery. The generalizing solution had been sitting there for thousands of steps, masked by a memorized solution that was doing the same job on the training set and nothing on the test set.

The reframing is worth stating flatly. Grokking is not delayed learning of the general solution. It is delayed removal of the specific one.

## Where I Push Back

The obvious objection is that this is one algorithmic task with a group structure practically designed to be Fourier-friendly. Modular addition over a cyclic group has characters that are exactly complex exponentials. Of course the optimal low-norm circuit is a Fourier circuit. The result may say more about $\mathbb{Z}/113\mathbb{Z}$ than about neural networks. The authors are reasonably careful here and I do not think they overclaim, but a lot of the paper's downstream citation traffic treats "grokking is smooth underneath" as a general law of deep learning, and this paper supports that for one task family.

The harder objection, and the one I think is genuinely unresolved, concerns what "progress measure" is being sold as. The measures work because the authors already knew the algorithm. Restricted loss requires knowing which frequencies to keep. You cannot construct that metric before you have done the interpretability, which means the method does not give you an early-warning system for capabilities you have not already reverse-engineered. If the pitch is "mechanistic interpretability lets us predict emergence before it happens," the pitch requires a solved circuit as input, and on real models we do not have one. The paper demonstrates that hidden progress exists and is measurable in principle. It does not give you a procedure for measuring hidden progress in a model you do not understand, and those are very different deliverables.

I also think the dependence on weight decay is load-bearing in a way that deserves more attention than it gets. The entire causal story runs through regularization pressure preferring the low-norm circuit. Change the regularization and you change whether grokking occurs at all, which several follow-ups have since confirmed by making the delay appear and disappear through norm control alone. That is consistent with the paper, but it repositions the finding: grokking is substantially a fact about the optimizer's implicit and explicit norm preferences, and the interpretability is explaining why one solution is cheaper than another. That is a good explanation. It is a narrower one than "we now understand emergence."

Finally, a small methodological note. Five key frequencies is a number that comes out of the analysis, and the analysis involves choices about thresholds and about what counts as a component the model uses. I would have liked more on how stable that number is across seeds and across $P$. The ablations are convincing that the identified frequencies matter. They are less convincing that the identified set is exactly the set.

## Why I Still Rate It Highly

Everything above is a limit on scope, not a challenge to the result, and the result matters for a specific reason.

Most interpretability work produces a description. This one produces a prediction that the description was not fit to. The authors derive the progress measures from the algorithm, then apply them to training dynamics they had not been designed to explain, and the dynamics come out clean. That is the difference between a narrative and a model. It is the standard I want applied to feature-level work on real networks, and it is a standard that a lot of that work, including some I have written about in [the SAE features piece](/blog/sparse-autoencoders-llm-features), does not yet meet.

There is also a direct line from this paper to the question I left open at the end of the [Sleeper Agents review](/blog/paper-review-sleeper-agents). That paper showed a behavior that persists through every behavioral intervention and offered no account of where the behavior lives. This paper is the demonstration that, in a case small enough to check, "where does the behavior live" has a real answer with real predictive consequences. The bet the interpretability field is making is that the answer stays real as the models get bigger. I do not think that bet is proven. I think this paper is the clearest evidence that it is worth making.

The deeper lesson is about measurement. For two years the field looked at a loss curve and concluded something discontinuous was happening inside the network. Nothing discontinuous was happening inside the network. We were watching a projection of a smooth process onto a metric that could not see it, and we built theories on the shape of the projection. That failure mode is not specific to grokking, and it is not behind us. Every claim about emergent capabilities in large models is a claim about a curve, measured with an instrument someone chose, and the instrument is doing more work than it is usually credited for.

*Fifteenth entry in the Paper Review series. Previous: Sleeper Agents.*
