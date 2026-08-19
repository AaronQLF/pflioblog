---
title: "Attention Sinks Are Load-Bearing"
date: "2026-08-19"
excerpt: "Every large language model develops a few coordinates and a few token positions that carry activations orders of magnitude larger than everything around them. This looks like a pathology, it was found independently by three subfields who each thought it was their problem, and it turns out to be a mechanism the model cannot run without. The interesting part is why softmax makes it inevitable."
tags: ["AI", "LLMs", "Interpretability", "Inference", "Research"]
---

Here is an experiment that should not work the way it does. Take a trained language model, run it on a long document, and to keep memory bounded, throw away the oldest entries in the KV cache as you go. Keep the most recent few thousand tokens, evict everything older. This is the obvious thing to do, it is what a cache is for, and the tokens you are dropping are far outside the window the model can meaningfully attend to anyway.

The model collapses. Not degrades, collapses. Perplexity jumps by orders of magnitude and the output turns to noise, and it happens at the exact step where the eviction policy discards the first few tokens of the sequence.

Now put those first four tokens back. Keep them pinned in the cache forever, evict everything else on the same schedule as before. The model is fine. Perplexity is stable out to millions of tokens. And it does not matter what those four tokens are. They can be the beginning-of-sequence marker, they can be three newlines, they can be a placeholder inserted at training time that carries no semantic content at all. What matters is that positions near the start of the sequence remain attendable.

That is the attention sink, from Xiao et al.'s StreamingLLM work, and I have been chewing on it for a while because it is the cleanest example I know of a phenomenon that three separate subfields discovered independently, each filed under a different name, and each treated as a nuisance specific to their own concerns. The quantization people called them outlier features. The systems people called them a cache eviction hazard. The interpretability people mostly did not call them anything and quietly excluded them from their analyses. They are the same thing, and the thing is not a defect.

## Softmax has no way to say nothing

The mechanism, once you see it, is close to trivial, which is the part I find satisfying and slightly embarrassing.

Attention scores are normalized with softmax:

$$\alpha_i = \frac{\exp(s_i)}{\sum_j \exp(s_j)}.$$

The denominator sums over the available positions and the outputs are constrained to sum to one. Every attention head, at every position, at every layer, must distribute exactly one unit of attention mass across the tokens it can see. It is not optional. There is no abstain.

But an attention head is a conditional retrieval circuit, and most retrieval conditions are not met most of the time. A head specialized to find the antecedent of a pronoun has nothing to do when there is no pronoun. A head that copies the object of a preposition is idle in a sentence without one. On the vast majority of tokens, most heads have nothing they want to fetch, and the correct output for a head with nothing to fetch is to write nothing to the residual stream.

Softmax will not let it. The head must place its full unit of probability mass somewhere, and wherever it lands, the corresponding value vector gets written into the residual stream and becomes part of the model's computation. Attending weakly and diffusely to fifty content tokens is not nothing, it is a blurred average of fifty content tokens injected into the representation, which is worse than noise because it is content-shaped noise that varies with the input.

So the model does the sensible thing under the constraint it was given. It designates a garbage collector. It learns to push enormous attention logits toward a fixed, predictable position, usually near the very start of the sequence, and it learns to make the value vector at that position close to useless. Now an idle head has somewhere to dump its mandatory unit of mass where the dump does nothing. The sink is a no-op valve, retrofitted onto an architecture that forgot to include one.

This also explains the otherwise strange fact that the sink's content is irrelevant. You are not storing information there. You are storing the absence of a write. Evan Miller made the same diagnosis from the other direction with the softmax-off-by-one proposal, adding a constant to the denominator so the weights can sum to less than one and a head can genuinely output nothing. Recent models have converged on essentially this fix, with per-head learned scalars in the softmax denominator or explicitly trained sink tokens. Both are the architecture finally providing what the model was previously improvising.

## The same phenomenon, seen from the residual stream

Look at the hidden states instead of the attention pattern and the same structure appears with a different face. Sun et al. documented what they called massive activations: a very small number of coordinates in the residual stream, sometimes fewer than ten out of thousands, whose magnitude runs orders of magnitude above the median. They concentrate in specific token positions, disproportionately the first token and low-information delimiters, and their most striking property is that they are close to constant. Feed the model a physics paper or a recipe and those coordinates take nearly the same enormous values.

An activation that does not vary with the input is not carrying information about the input. It is a bias. The model has commandeered a handful of residual coordinates and a handful of token positions to implement a fixed additive term, and if you zero them out the model breaks completely, which is exactly what you would expect from a bias term rather than a feature.

I want to flag how badly this violates the working assumptions of my own field. Interpretability treats the residual stream as a communication channel where directions carry meaning, and it treats large activations as important activations, because that is a reasonable prior almost everywhere. Here the largest activations in the entire network are the ones carrying the least information, and they are large precisely so that the softmax competition is decided in their favor regardless of context. Magnitude is being used as a control signal, not as a measure of salience.

The practice most SAE work follows, of dropping the first token from the training data, is a tacit acknowledgment of this. The sink wrecks a sparse autoencoder, because reconstruction loss is dominated by the coordinates with the largest magnitude and the autoencoder will happily spend its capacity modeling a constant. So everyone excludes it and moves on. That is a reasonable engineering decision and a strange scientific one. We have found a component of the network that is load-bearing enough that removing it destroys the model, and the standard methodology is to delete it from the dataset before analysis begins.

## Quantization found it first, and had to

The quantization literature ran into this years before anyone framed it as a mechanism, because quantization is where it hurts immediately.

Quantizing a tensor to low precision means picking a scale that maps its range onto a small number of levels. That scale is set by the largest magnitude present. If one coordinate in a thousand is a hundred times larger than the rest, it sets the scale for the entire tensor and everything else gets crushed into a couple of levels. You have spent your dynamic range representing a constant with high fidelity and quantized the actual signal into mush.

This is the outlier feature problem from Dettmers et al.'s LLM.int8 work, and the observation there was that it appears abruptly above a certain model scale, which is precisely what you would predict if the sink is a learned mechanism the model adopts once it has enough capacity and enough training to discover it. Their fix was to decompose the matrix multiplication and keep the outlier dimensions in higher precision. SmoothQuant later migrated the difficulty from activations into weights, where the distribution is better behaved, by rescaling the two sides of the product against each other. AWQ went further and made the point sharpest: the salient weight channels are identified by activation magnitude, not weight magnitude, and protecting a very small fraction of them recovers most of the loss.

Read those three papers as a sequence and the arc is unmistakable. Every practical low-bit quantization method in wide use is, at its core, special-case handling for the attention sink. We built an elaborate body of technique around a mechanism nobody had named yet.

This is also where my standing worry lives. If a quantization scheme handles outliers well on average but shifts the effective sink behavior at the margins, what changes is not perplexity, which will look fine, but the model's willingness to do nothing. A head that could previously abstain cleanly now dumps a slightly less inert value vector into the residual stream on every idle step. That is a small, systematic, everywhere change to the model's function that no perplexity measurement is shaped to catch. It is the sort of thing that would show up as a diffuse degradation in exactly the behaviors that depend on many heads correctly staying quiet.

## The serving stack cannot evict it

The third face of this is operational, and it lands directly on what I wrote about in the [PagedAttention review](/paper-review-pagedattention-vllm).

There is a substantial line of work on shrinking the KV cache by dropping tokens the model does not appear to need: keep the heavy hitters by accumulated attention mass, evict the rest. It works better than it has any right to, and the reason is unflattering. The first few positions accumulate overwhelming attention mass because they are the sink, so any policy that ranks by attention score keeps them automatically. The policy is not discovering which tokens matter semantically. It is rediscovering the sink and then doing something roughly reasonable with what is left.

Which means the headroom in cache eviction is smaller than the benchmark numbers suggest, because part of what is being measured is the policy correctly identifying a structural artifact. And it puts a hard floor under any residency scheme: position zero is never cold, never evictable, never negotiable. I argued in that review that attention has no locality for a pager to exploit. The sink is the sharpest version of that. It is a page that must be resident for the lifetime of every sequence in the system, and its contents are irrelevant.

## What I would want measured

The thing I keep failing to find in the literature is a clean causal account of the budget. If a sink exists so that heads can abstain, then how much abstention is actually happening should be measurable. Fraction of attention mass going to sink positions, per head, per layer, as a function of input type. Whether that fraction is stable across models trained with explicit sink tokens versus models that improvised one. Whether the heads that abstain most are the ones interpretability has characterized as narrow and conditional, which is what the story predicts, or whether it is spread uniformly, which would mean the story is wrong.

And then the version I care about most: run the same measurement across quantization schemes at matched perplexity. If the abstention budget is preserved, the outlier-handling techniques are doing their job in the sense that matters. If it is not, then two models that look equivalent on every benchmark differ in a mechanism that governs how much spurious content gets written into the residual stream on every token, and we have been calling them equivalent because we were measuring the wrong thing.

That is a small enough experiment that I am suspicious of how clean it sounds, which is usually the point at which I should stop writing about it and go run it.

## The general shape

What I take from this is less about attention than about how we decide something is a bug.

A constraint in the architecture, softmax normalization, made a behavior impossible that the model needed. The model routed around it with the only material available, which was magnitude. The workaround was ugly, it was invisible from the loss curve, and every subfield that ran into it treated it as an obstacle specific to their own concerns. It took years to notice that the pathology was the solution to a problem the architecture had created, and that the correct fix was not to handle it better but to remove the constraint that forced it.

I suspect this is not the only one. A model trained under a hard architectural constraint will find some way to satisfy it, and the way it finds will look like a defect from every angle except the one where you can see what it is for. Attention sinks are the case where we eventually found that angle. The uncomfortable implication is that we found it by accident, from three directions at once, over several years, and only because the workaround happened to be large enough to trip over.

*Related reading: [Serving an LLM Is Not a Forward Pass](/inference-is-not-a-forward-pass) covers the numerics and scheduling context this sits inside, the [PagedAttention review](/paper-review-pagedattention-vllm) is the cache management half, and [Computation in Superposition](/computation-in-superposition) is the other case where magnitude and meaning come apart in the residual stream.*
