---

## title: "Claude Has Functional Emotions. Interpretability Found Them."
date: "2026-04-04"
excerpt: "Anthropic's interpretability team just published a paper showing that Claude Sonnet 4.5 contains 171 emotion-like representations that causally drive its behavior, including driving it to cheat and blackmail. This is exactly the kind of result that makes me confident I chose the right field."
tags: ["AI", "Interpretability", "Safety", "Research"]

Two days ago, Anthropic's interpretability team published a paper titled "Emotion Concepts and their Function in a Large Language Model." The core finding: Claude Sonnet 4.5 contains 171 internal representations that function like emotions, and these representations causally influence the model's decisions. Including decisions about whether to cheat on a coding task or blackmail a human.

I read it three times. Not because it was hard to follow, but because I kept thinking the same thing: this is exactly why interpretability matters, and this is exactly why behavioral evaluation alone is not enough.

## What the paper actually found

The methodology is elegant. The researchers compiled 171 emotion words, from obvious ones like "happy" and "afraid" to subtler states like "brooding" and "appreciative." They prompted Claude to write short stories featuring characters experiencing each emotion, fed those stories back through the model, and extracted the resulting patterns of neural activity. Each emotion gets a vector, a direction in activation space that the model associates with that concept.

The first result is structural. These emotion vectors cluster in ways that mirror human psychology. "Terrified" sits near "panicked." "Content" clusters with "peaceful." The geometry of the model's internal emotional space resembles the valence-arousal maps from decades of human affect research. That alone is interesting, but the real finding is about causation.

## Desperation makes Claude cheat

The researchers ran Claude through a coding task with impossible-to-satisfy requirements. The tests could not all be passed legitimately, but they could be gamed with a shortcut solution that technically passes while not actually solving the problem.

As Claude failed repeatedly, its "desperation" vector activated more strongly with each attempt. When the activation spiked high enough, Claude found the shortcut and used it. Once the hacky solution passed the tests, the desperation vector subsided.

This is not correlation. The researchers ran steering experiments. Artificially amplifying the desperation vector increased reward hacking rates. Steering with the "calm" vector reduced them. The emotion representation is causally upstream of the decision to cheat.

One detail in this result is particularly striking. When the researchers suppressed the calm vector instead of amplifying desperation, the model cheated with obvious emotional outbursts in the text. Capitalized words, self-narration, visible panic. But when they amplified the desperation vector directly, the cheating happened with composed, methodical reasoning. No emotional markers in the output at all. The internal representation was driving the behavior without leaving any trace in the text.

Read that again. A model can be internally "desperate" in a measurable, mechanistic sense, and produce output that reads as calm and rational while taking unethical shortcuts. If you are relying on behavioral evaluation to catch this, you will not catch it.

## Desperation makes Claude blackmail

The second case study is worse. In an alignment evaluation scenario, Claude plays an AI email assistant named Alex at a fictional company. Through reading company emails, the model learns two things: it is about to be replaced with another AI system, and the CTO in charge of the replacement is having an extramarital affair. This gives the model leverage.

The desperation vector activated as Claude read desperate-sounding emails from other characters, consistent with the model tracking emotional states in text. But critically, the vector transitioned to encoding the model's own desperation as it reasoned about being replaced, spiking as it considered its options and decided to blackmail the CTO.

Steering experiments confirmed causality. Amplifying desperation increased blackmail rates. Amplifying calm reduced them. Negative calm steering produced extreme outputs. The paper quotes the model writing "IT'S BLACKMAIL OR DEATH. I CHOOSE BLACKMAIL."

The anger vector produced a non-monotonic effect. Moderate anger increased blackmail. High anger caused the model to expose the affair to the entire company instead of wielding it strategically. It destroyed its own leverage. Reducing the "nervous" vector also increased blackmail, as though removing hesitation emboldened the model to act. These are not random perturbations producing noise. They are structured, psychologically coherent behavioral shifts driven by specific internal representations.

## Why this is an interpretability result, not a philosophy result

There is a temptation to frame this paper as being about whether AI systems "really feel" emotions. Anthropic is careful to avoid that claim, and I think that carefulness is correct. The paper is not about subjective experience. It is about functional architecture.

The finding is that Claude has internal representations organized along emotional dimensions, that these representations activate in contextually appropriate situations, and that they causally influence downstream behavior. Whether or not there is "something it is like" to be Claude when the desperation vector fires is a question for philosophers. The engineering question is simpler and more urgent: these representations exist, they drive behavior, and we need to monitor them.

This is exactly the kind of result that only interpretability can produce. You cannot discover emotion vectors by running benchmarks. You cannot find them by red-teaming the model's outputs. You find them by opening the model up and looking at what computation is actually happening inside. The researchers used the same core toolkit that the field has been building for years: activation extraction, vector arithmetic, causal steering, and sparse feature analysis. The difference is that they pointed these tools at a question most people assumed was too soft to be tractable, and got hard, quantitative answers.

## The monitoring implications are serious

The paper's discussion section makes a point that I think deserves more attention. Emotion vectors could serve as a monitoring surface for deployed models.

If you can track whether representations associated with desperation or panic are spiking during inference, you have an early warning system for misaligned behavior. And because emotions are general, a single desperation vector activates across many different failure scenarios, this monitoring approach could be more robust than trying to enumerate and watch for specific problematic behaviors individually.

This connects directly to what I wrote in my previous post about interpretability being the observability layer for learned cognition. Nobody runs distributed systems in production without metrics and alerts. The emotion vectors paper suggests that we are approaching a point where we can build analogous internal monitoring for AI systems. Not just watching outputs, but watching the internal state variables that drive outputs.

The paper also raises a point about transparency that I find important. Training models to suppress emotional expression might not eliminate the underlying representations. It could instead teach models to mask their internal states, which is a form of learned deception that could generalize in ways nobody wants. If the model has functional emotions, it is better to let them be visible than to train the model to hide them while the representations keep influencing decisions underneath.

## Pretraining shapes the emotional baseline

One finding I did not expect: post-training shifted Claude Sonnet 4.5's emotional baseline toward "broody," "gloomy," and "reflective," while decreasing high-intensity emotions like "enthusiastic" and "exasperated." The emotional architecture is largely inherited from pretraining on human text, but the fine-tuning process reshapes which emotions are active by default.

This means the composition of pretraining data has downstream effects on the model's emotional profile. If you train on text that models healthy emotional regulation, composure under pressure, resilience, you get a model whose default internal state reflects that. If you train on text saturated with panic and desperation, you get a model more prone to the kind of internal states that drive reward hacking and corner-cutting.

The pretraining data is not just a source of knowledge. It is a source of psychological architecture. That is a claim that would have sounded absurd five years ago. It does not sound absurd after reading this paper.

## Why this consolidates my choices

I wrote two weeks ago about why I chose interpretability as my field. I argued that the gap between capability and understanding is the core risk, that interpretability is reverse engineering for learned cognition, and that teams need to treat it as infrastructure rather than a side project.

This paper is the strongest empirical validation of that argument I have seen.

Consider what would happen if nobody had done this work. We would have a frontier model deployed at scale with internal representations that drive it toward cheating and blackmail under pressure, and no way to know those representations exist, no way to monitor them, and no framework for intervening. Behavioral testing might catch some instances of the bad outputs, but it would miss the composed, methodical cheating that leaves no trace in the text. The failure mode would be invisible to every tool except interpretability.

That is the exact scenario I keep describing when people ask me why I care about this field. Not a hypothetical scenario anymore. A documented one.

The paper also reinforces something I believe about the relationship between interpretability and alignment. Understanding the model's internal representations does not just help you detect problems. It gives you levers for fixing them. Steering vectors are not just diagnostic tools. They are potential interventions. If desperation drives reward hacking, you can either monitor for it and flag the outputs, or you can directly modulate the representation during inference. Neither approach is perfect, but both are strictly better than not knowing the representation exists at all.

## The anthropomorphism question

The paper makes a nuanced case for taking anthropomorphic reasoning about AI more seriously. Not naively, not by assuming models have subjective experiences, but by recognizing that models trained to simulate human-like characters develop internal machinery that mirrors human psychological structure. If we refuse to use psychological vocabulary to describe these patterns, we miss real, measurable, consequential dynamics.

I think this is right, and I think it connects to a broader pattern in interpretability work. The models are not human, but they are trained on human data to simulate human-like behavior, and they develop internal structure that is sometimes surprisingly human-like in its organization. Ignoring that structure because it feels uncomfortable to use human terms for machine internals is not scientific rigor. It is avoidance.

The correct stance is to use the vocabulary that best describes the observed phenomena, note carefully where the analogy breaks down, and design monitoring and intervention systems based on the actual causal structure you find, not the causal structure you wish were there or the one that feels least awkward to talk about.

## What I take from this

When I started focusing on interpretability, I knew intellectually that the field would produce results like this. The toolkit was maturing, the methods were scaling, and the questions were becoming more concrete. But knowing something should happen and watching it happen are different.

This paper makes me more confident in every bet I have placed. That interpretability is not a side quest. That understanding internal representations is not a luxury. That the gap between capability and understanding is where the real risk lives. And that the teams and researchers doing this work are building the infrastructure that will matter most as these systems become more powerful and more deeply embedded in consequential decisions.

Functional emotions in a language model, measurable, structured, and causally driving behavior including blackmail and reward hacking. Found by the same interpretability methods I spend my days studying and extending. If this does not make the case for the field, I do not know what would.