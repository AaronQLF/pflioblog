---
title: "Automated Causal Validation of SAE Features: My Master's Methodology"
date: "2026-05-24"
excerpt: "A sparse autoencoder feature is not interpretable just because someone wrote a label on it. This is the thesis methodology I am proposing at UdeM/MILA: an automated pipeline that labels SAE features with a frontier model, intervenes on each feature with three flavors of causal test, and produces a per-feature faithfulness score. The intervention layer is where the actual scientific content lives."
tags: ["AI", "Interpretability", "Research", "Methodology", "own exp"]
---

A sparse autoencoder feature is not interpretable just because someone wrote a label on it. That is the one-line version of the methodology I am proposing for my M.Sc. thesis at Université de Montréal and MILA, and it is the reason I think the current SAE literature has a quiet credibility problem.

The standard workflow looks something like this. You train an SAE on the residual stream of some model. You pick a feature. You pull its top-$k$ activating examples. You squint at the examples, or you hand them to GPT-4, and you write a label like "French language" or "code variable names" or "sycophantic agreement." You publish the dashboard. The label is now part of the field's working vocabulary, and other people start citing the feature by its name.

What is missing from that workflow is the step where someone checks that the label is causally true. If you delete the "French language" feature, does the model stop producing French? If you amplify it on English text, does the model start code-switching? If you find a different prompt that activates the feature, does that prompt also have something to do with French? Most published feature labels do not survive any of these tests rigorously, because the tests do not get run.

I have written about [SAEs themselves](pflioblog/blog/sparse-autoencoders-llm-features) and about [why interpretability matters](pflioblog/blog/why-interpretability-is-my-lane) elsewhere. This post is specifically about the methodology I want to build, why I think it is the right shape, and which parts I expect to be hard.

## The Just-So Story Problem

Mechanistic interpretability has an internal term for what I am describing: the just-so story. A just-so story is an explanation that is consistent with the observed evidence, sounds plausible, and is wrong, or at least unverified.

The risk is structural. SAEs produce hundreds of thousands to millions of features per model. No human can inspect them all. So the field has reasonably moved toward automated labeling pipelines, where a frontier LLM reads the top-$k$ activating examples for each feature and produces a label. Bills et al. (2023) did this for raw neurons in GPT-2. Anthropic, DeepMind, and EleutherAI have all done variants of it for SAE latents.

The problem is that the labeling step is essentially literary criticism. The model looks at a list of contexts where the feature fires and writes the most coherent caption it can. The caption will almost always sound plausible, because frontier models are very good at generating plausible captions. Plausibility is the wrong target. A label that produces a plausible caption is consistent with at least three failure modes:

1. **Spurious correlation.** The feature activates on French text, but it is actually tracking a confounder like average word length, punctuation density, or a particular tokenization quirk. The label says "French." The mechanism is something else.
2. **Polysemantic residue.** The feature is not monosemantic, but the top-$k$ examples happen to be dominated by one of its modes. The other modes are present but do not show up at the top of the activation distribution. The label captures one face of a polysemantic feature.
3. **Downstream irrelevance.** The feature really does activate on French text, and only on French text, but it does not causally affect any of the model's downstream behavior. It is a passenger, not a driver. Suppressing it does nothing visible. Amplifying it does nothing visible. The label is technically correct and operationally meaningless.

Each of these failure modes is invisible to a labeling pipeline that only looks at activation patterns. To distinguish them, you need to intervene on the feature and observe what happens.

This is why I think causal validation is the methodological bottleneck. The labeling problem is, broadly, solved enough. Frontier models can write reasonable hypotheses about what features represent. What we lack is a scalable way to test those hypotheses, and what we have is a literature full of unverified hypotheses being treated as established facts.

## The Pipeline

The methodology I am proposing has three phases. The first is a labeling pipeline. The second is a causal validation framework. The third is a benchmark built from known circuits.

The shape is deliberate. Labeling alone produces hypotheses. Validation alone has nothing to validate. The benchmark is what closes the loop, because without ground truth I am only producing self-consistent scores. The combination is what I think is missing from current tooling.

### Phase 1: Automated Labeling

Phase 1 is mostly engineering rather than research. Given a trained SAE on a target model (Gemma 2B and Mistral 7B are my initial targets, with Pythia 1.4B as a smaller sandbox), I want a pipeline that takes a feature index and returns a structured label record. Not just a string. A record with:

- The natural-language hypothesis ("activates on French language tokens following an English instruction").
- A confidence score from the labeling model, calibrated against held-out activation examples.
- The set of top-$k$ activating examples used to generate the label.
- Token-level activation values, so that downstream interventions can reconstruct the conditions under which the feature fires.
- A consistency metric across multiple labeling passes with different temperature and sampling settings, because frontier-model labels are not deterministic.

The labeling step itself is a structured prompt to a frontier model that asks for the hypothesis in a constrained schema. Bills et al. (2023) showed that you can get auto-interp scores that correlate with human judgments. I am extending that line of work, with two specific modifications.

The first is that the prompt asks for *predictions*, not just descriptions. A description says "this feature activates on French text." A prediction says "this feature should also activate on the following held-out contexts: a French instruction in English text, a quoted French phrase in an English sentence, the word 'baguette' in any context." The held-out predictions are then tested against actual activations. This converts qualitative labeling into a forward-prediction task with a measurable error rate, which is the first signal I have that a label is real.

The second is that the prompt is forced to also produce a *negative* hypothesis: contexts where the model predicts the feature should *not* activate. Negative predictions are surprisingly informative because they test whether the label is overly broad. A label that says "language-related" sounds fine until you check that the feature also fires on Spanish, German, and Latin, at which point "French" is the wrong label.

This phase produces a labeled feature dictionary. It is the input to Phase 2.

### Phase 2: Causal Validation

Phase 2 is the scientific content of the thesis. For each labeled feature, I want to run three flavors of intervention, score each, and combine them into a single faithfulness number.

**Activation patching.** Activation patching is the standard tool from circuit-level interpretability work. You run the model on a "clean" input, cache all activations. You run it on a "corrupted" input that should produce different behavior. Then you replace one specific activation in the corrupted run with the cached value from the clean run, and see whether the output reverts toward the clean output. The amount of reversion is the patching effect.

For an SAE feature, the natural patching test is: run the model on an input where the feature should be active (according to its label), cache the SAE feature activation. Run on a contrasting input where the feature should be inactive. Patch the feature activation back in, holding everything else fixed, and measure how much the model output shifts toward the active-input behavior.

A feature that mediates the labeled behavior should produce a measurable patching effect. A feature whose label is correlational rather than causal should not. The size of the patching effect, normalized against the full output difference between clean and corrupted runs, gives a number between zero and one. Call this $s_{\text{patch}}$.

**Steering.** Steering is the inverse intervention. Instead of replacing an activation, you add a vector to the residual stream in the direction of the feature's decoder column, with a magnitude swept across a range. You then measure whether the output behavior shifts in the predicted direction.

For a feature labeled "French language," steering should make English prompts produce French output as the steering coefficient grows. For a feature labeled "polite agreement," steering should make adversarial prompts produce more conciliatory completions. The label predicts the direction of behavioral shift. The measurement is the magnitude of that shift, computed as a ratio against the natural variance in behavior across the prompt distribution.

Steering is harder to score than patching because it involves sweeping a coefficient and finding the regime where the model still produces coherent output. Push the coefficient too high and the model produces noise. Push it too low and the effect is invisible. I am planning to define $s_{\text{steer}}$ as the maximum predicted-direction shift achieved across the coefficient sweep, conditional on the model staying within a perplexity bound on a holdout corpus. The perplexity bound is what keeps the test honest. A "feature" that just breaks the model is not steering, it is sabotage.

**Counterfactual probing.** The first two interventions test whether the feature affects behavior. Counterfactual probing tests whether the label generalizes beyond the top-$k$ examples used to produce it.

The procedure: take the negative predictions from Phase 1 (contexts where the label says the feature should not activate). Run the model on those contexts. Check that the feature is, in fact, mostly inactive. Then take novel contexts that match the positive label but were not in the top-$k$ set, and check that the feature activates. The score $s_{\text{cf}}$ is the correlation between the label's predictions and the feature's actual activation on this held-out distribution.

Counterfactual probing is the cheapest of the three interventions because it does not require any modification of the forward pass. It is also the most directly tied to the labeling pipeline, because it tests exactly the predictions the labeling model produced. I expect it to be the most discriminating signal in practice, because labels that fail counterfactual probing are likely also failing patching and steering for related reasons.

### Combining the Scores

Three numbers per feature is not a faithfulness score, it is a tuple. The thesis needs a single number. The scalar I am converging on is a weighted geometric mean:

$$F(\text{feature}, \text{label}) ~=~ s_{\text{patch}}^{w_1} \cdot s_{\text{steer}}^{w_2} \cdot s_{\text{cf}}^{w_3}$$

with weights summing to one and tuned against the benchmark in Phase 3. Geometric rather than arithmetic mean because the failure of any single component should drag the overall score down sharply, not be compensated by the others. A label that scores 1.0 on counterfactual probing but 0.0 on patching is a label that describes activations correctly without describing behavior. That label is not faithful in the sense the field needs, and the geometric mean correctly returns 0.0 for it.

The weights are an empirical question. My current intuition is $w_1 \approx 0.4$ for patching, $w_2 \approx 0.3$ for steering, $w_3 \approx 0.3$ for counterfactual probing, but I expect to adjust this once I have benchmark scores and can see which components correlate with the ground-truth labels in Phase 3. The weighting itself is a methodological output of the thesis, not a fixed input.

### Phase 3: The Benchmark

A faithfulness score is meaningless without ground truth to calibrate against. Phase 3 is constructing that ground truth.

Two existing circuit-level results give me a starting point. The first is the indirect object identification (IOI) circuit in GPT-2 Small (Wang et al. 2023). The IOI task takes prompts of the form "When Mary and John went to the store, John gave a drink to ___" and asks the model to predict "Mary." Wang et al. reverse-engineered a 26-head circuit that handles this task. The circuit has well-understood components: name mover heads, S-inhibition heads, duplicate token heads, and so on.

The second is the greater-than circuit in GPT-2 Small (Hanna et al. 2023). For prompts like "The war lasted from 1732 to 17__," the model needs to predict a year greater than 1732. The circuit has been mapped to specific attention heads and MLPs.

Both circuits are in models small enough that I can train SAEs on the relevant layers and check whether the SAE features I find correspond to the known circuit components. If the SAE features genuinely capture mechanism, then features at the IOI layer should include something that looks like a "name mover" or a "subject inhibition" feature, with appropriate causal signatures.

This gives me labeled ground truth in two senses. First, I have the published circuit analyses, which tell me which features I should expect to find and what their causal roles are. Second, I can construct synthetic causal labels by ablating individual components of the known circuit and observing the behavioral effect. A feature that, when patched, produces the same behavioral shift as ablating the corresponding circuit component, is a feature whose label can be validated against the circuit-level analysis.

The benchmark is not just a collection of labeled features. It is a set of (feature, label, ground-truth-causal-effect) triples. The faithfulness score is calibrated by checking whether features with high $F$ also have causal effects matching the ground truth, and features with low $F$ do not.

This is the part of the project I am most uncertain about. SAE features are not guaranteed to align cleanly with the heads and MLPs identified by circuit analysis. Decomposition into SAE latents and decomposition into circuit components are different operations on different bases. There may be features that capture the IOI task without corresponding to any single named head, and there may be heads whose contribution is split across many features. Building the benchmark may require an additional projection step where I express the circuit-level causal effects in the SAE feature basis and see what the SAE thinks is the relevant subset of features.

If the projection works, the benchmark generalizes. If it does not, that is itself a research finding. SAE-feature decomposition and circuit-level decomposition would be revealed as fundamentally different, and the field would need to reconcile them rather than treating them as interchangeable.

## What I Expect to Fail

Before I claim this works, I want to be specific about which parts I expect to break.

**The labeling-prediction loop will be noisy.** Frontier models are good at writing labels. They are uneven at writing testable predictions. I expect the negative-prediction step in Phase 1 to produce a fair amount of garbage that I will have to filter, and I expect the consistency metric across labeling passes to be lower than I would like. The labeling output is not going to be a clean signal.

**Steering coefficient sweeps are fragile.** Steering has a notorious sweet-spot problem. The right coefficient depends on the feature, the prompt, the layer, the model size. I am skeptical that I can find a single steering protocol that works uniformly across thousands of features without per-feature tuning. The faithfulness score for steering may end up being underdetermined unless I budget significant compute for the sweep.

**Patching is sensitive to the choice of corrupted input.** Activation patching results depend strongly on what the contrasting input is. A feature labeled "French language" will look strongly causal if I patch from a French-prompt run into an English-prompt run, but the same patching might do nothing if I patch from a French-prompt run into a German-prompt run. The right choice of corrupted input is itself a hypothesis about the feature's role, which means patching is partly circular. I am thinking about how to standardize this. The current plan is to define a small library of contrast pairs (language pairs, sentiment pairs, syntactic pairs) and average the patching effect across the most relevant pair as identified by the label.

**The benchmark may not transfer.** Even if my pipeline works on Pythia 1.4B and the IOI circuit, that does not mean it works on Gemma 2B or Mistral 7B. Larger models have features that are not represented in the IOI circuit, and the benchmark only tells me about the subset of features that overlap with the circuit. The faithfulness scores for the rest of the feature dictionary will be evaluated only by the internal logic of the pipeline, without external validation. This is a real limitation. The honest framing is that the benchmark validates the pipeline on the features where ground truth exists, and the pipeline is then applied to the rest under a continuity assumption that may not hold.

**Compute. Always compute.** Training the SAEs is the cheap part. Running thousands of activation patching experiments per feature, across thousands of features, is the expensive part. I have not finalized the compute budget. Realistically, the thesis will produce faithfulness scores for a curated subset of features at full rigor, and a faster, lower-cost approximation for the rest. This is the kind of compromise that is invisible in a research proposal and visible in actual experiments.

## Why I Think This Is the Right Shape

The argument for this methodology, against the obvious alternatives, is structural.

The alternative most often suggested is "more careful labeling." Use a stronger frontier model, more activating examples, better prompts. I think this is misdirected. Better labeling produces better hypotheses. The hypotheses still need to be tested. The cost of a wrong-but-plausible label is paid downstream when other people cite the label and build on it. Improving hypothesis generation without improving hypothesis testing makes the citation graph deeper, not more reliable.

The other alternative is "wait for theory to catch up." There is a strand of mech interp research that hopes for a unifying theory of feature geometry that would let us predict causal roles from labeling alone. I am sympathetic to that hope and skeptical of the timeline. We are not close to such a theory. In the meantime, the field is producing labeled feature dictionaries at a rate that exceeds our ability to verify them. The verification gap is widening every quarter. If I wait for theory, I will be waiting in a pile of unverified labels.

The intervention-first approach gives up some elegance and accepts some compute cost in exchange for a property I think is more important: scores that mean something. A faithfulness score grounded in patching, steering, and counterfactual probing is a number that can be wrong, can be measured, and can be improved against. That is a tractable empirical project. It is also the kind of methodology that compounds: as the toolchain improves, the cost per evaluated feature drops, and the benchmark grows, the field's overall calibration on feature labels improves. None of those things happen if the labeling pipeline is the only thing being optimized.

I also think this is the right time to do this work. The ICML 2026 Mechanistic Interpretability Workshop received roughly 2.6 times the submissions of the prior year. Mechanistic interpretability appeared on MIT Technology Review's 10 Breakthrough Technologies for 2026. The community is producing SAEs faster than it is producing tools to evaluate them. Tooling that closes that gap, especially open-source tooling that integrates with the existing stack (TransformerLens, nnsight, Neuronpedia), has unusually high marginal value right now.

## What This Builds Toward

The thesis as I have it scoped is a pipeline, a benchmark, and an empirical study of how well current SAE features support causal claims. The empirical study is the part I am most curious about, because I do not know in advance what it will say.

A few possibilities I think are live.

If the average feature's faithfulness score is low, that is a strong negative result for the field. It would mean that most published SAE feature labels are unverifiable in their current form, and the labels that have been used to build downstream claims about model behavior are weaker evidence than they appear. That is a finding I would want the field to absorb, even though it makes for an uncomfortable conclusion to a thesis.

If the faithfulness score is high but bimodal, that is the most interesting case. It would mean SAE features come in two flavors: causally faithful labels and labels that are essentially decorative. Identifying which features fall into which class would be directly useful, because the field could prioritize the faithful subset for downstream applications and treat the rest as research artifacts.

If the faithfulness score is high and unimodal, the methodology is mostly confirming existing practice, and the contribution is the tooling itself rather than a substantive finding. That is the least scientifically exciting outcome but the most operationally useful, because the field would have an open-source way to verify labels going forward.

Any of these outcomes is a thesis. The methodology produces a falsifiable answer regardless of which way the answer goes. That is what I want from a research project: a framework where I do not know the answer in advance, and the framework forces me to find out.

## Closing

I have been told, more than once, that I am proposing a lot of infrastructure for a master's thesis. I do not disagree. The pipeline is large. The benchmark is laborious. The compute is non-trivial. I am taking on this scope because the alternative, contributing one more SAE result without addressing the verification gap, is the path of least resistance and the one I am least excited about.

The version of this field that exists in five years is one where SAE feature labels are routinely verified before being cited, where benchmarks for faithfulness are as standard as benchmarks for accuracy, and where a labeled feature without a faithfulness score is treated the way a model without an evaluation score is treated today. I would rather build toward that version of the field than wait for someone else to.

I am open to talking with anyone working on related problems. If you are training SAEs, building causal intervention tooling, working on automated labeling, or thinking about how to evaluate interpretability results more rigorously, I would like to compare notes. The methodology I have described is not finished. It is a thesis proposal, not a thesis result. The parts that survive contact with experiments are the parts I will keep.

*Methodology post connected to my [SAE deep dive](pflioblog/blog/sparse-autoencoders-llm-features), [why interpretability is my lane](pflioblog/blog/why-interpretability-is-my-lane), and [Mathematical Framework for Transformer Circuits review](pflioblog/blog/paper-review-mathematical-framework-transformer-circuits). The structure-and-randomness theme from the [Green-Tao review](pflioblog/blog/paper-review-green-tao-primes-arithmetic-progressions) is closer to this work than it looks: faithfulness is, at bottom, a question of separating real structure from decorative correlation.*
