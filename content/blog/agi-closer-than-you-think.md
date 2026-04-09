---

## title: "AGI Is Closer Than You Think and That Should Concern You"
date: "2026-04-09"
excerpt: "The technical distance between current frontier systems and something that qualifies as general intelligence is smaller than the public discourse suggests. I am not saying this to be provocative. I am saying it because the evidence has been accumulating for two years and most people are pattern-matching it against the wrong reference class."
tags: ["AI", "Research", "own exp"]

I want to be careful here because this topic attracts two failure modes. The first is breathless hype from people who want AGI to be imminent because they have financial or ideological stakes in the narrative. The second is reflexive dismissal from people who have been hearing "AGI is five years away" for thirty years and have learned, correctly, to discount those claims. Both groups are wrong right now, and for the same reason: they are reasoning from vibes rather than from the technical evidence.

I am going to try to make a specific technical argument. Not "AI is getting really good" in the vague LinkedIn sense. The argument is that the remaining gaps between frontier AI systems and a system that would satisfy any reasonable definition of artificial general intelligence are narrower than they appear, that the rate at which those gaps are closing is accelerating, and that the institutional infrastructure for managing what happens when they close does not exist in any meaningful form.

## What I Mean by AGI

Definitions matter and most people use this term loosely. I am going to use a functional definition: a system is generally intelligent if it can perform at or above the level of a median human expert across a broad range of economically valuable cognitive tasks, with minimal task-specific engineering. Not superhuman. Not conscious. Not some abstract notion of "understanding." Just: you can hand it a novel problem from a domain it was not specifically trained on and it produces expert-level work with competent tool use, appropriate uncertainty, and the ability to ask clarifying questions when the problem specification is ambiguous.

By this definition, AGI is not a binary threshold. It is a gradient, and we are further along that gradient than most people realize.

## The Capability Convergence

The reason I think the timeline is compressed is not any single capability. It is the convergence of capabilities that were previously developing on separate tracks and are now being integrated into the same systems.

**Reasoning.** Two years ago, language models could not reliably do multi-step arithmetic. Today, frontier models with test-time compute scaling (the o1/o3 lineage, DeepSeek-R1, and their successors) solve competition-level mathematics, write correct proofs, and pass technical interviews at senior engineer levels. The mechanism, chain-of-thought search with process reward models, turns out to be remarkably general. It works on math, it works on code, it works on scientific reasoning, it works on legal analysis. The improvement curve is steep and shows no sign of flattening.

I wrote about test-time compute in my LLM trends post. The key point there was that this is a qualitatively different scaling axis from pretraining. You are not just making a bigger model. You are giving a model the ability to think longer on hard problems, and the returns from that thinking scale favorably. A model that can spend ten minutes reasoning through a problem instead of producing an answer in two seconds is a fundamentally different kind of system, even if the weights are identical.

**Tool use and agency.** Current models can write code, execute it, observe the output, debug errors, and iterate. They can browse the web, query APIs, read documents, and synthesize information across sources. They can decompose complex tasks into subtasks, track progress, and recover from failures. The agent frameworks (AutoGPT, CrewAI, OpenAI's Assistants, Anthropic's tool use protocol) are still immature, but the gap between "can do this in a demo" and "can do this reliably in production" has narrowed dramatically in the last twelve months.

The important thing about tool use is that it converts capability gaps into latency costs. A model that cannot do mental arithmetic but can write and execute Python does not have a math problem. It has a speed problem. A model that cannot remember last week's conversation but can query a vector database does not have a memory problem. It has an architecture problem. And architecture problems get solved by engineers. Quickly.

**Long-horizon planning.** This was the weakest link a year ago and it is improving fast. Models can now maintain coherent plans over sequences of fifty or more actions, revise plans when new information arrives, and balance exploration against exploitation in open-ended tasks. The SWE-bench results are the clearest signal here: frontier models now resolve a meaningful fraction of real GitHub issues end-to-end, including reading the codebase, identifying the bug, writing the fix, and running the tests. These are not toy problems. They require understanding codebases with hundreds of files, reasoning about edge cases, and producing code that actually works.

**Multimodal integration.** Vision, audio, and text are converging into unified model architectures. A frontier model can look at a photograph of a whiteboard, read the handwritten equations, identify errors in the derivation, and explain the correction. It can watch a video of a manufacturing process and identify quality control issues. It can listen to a conversation and produce structured notes. Each of these capabilities existed in specialized models before. The integration into a single system that can fluidly combine modalities is what changes the calculus.

**Knowledge breadth.** This one is easy to underestimate because it happened gradually. A frontier model in 2026 has absorbed a significant fraction of publicly available human knowledge. It has read the textbooks, the papers, the documentation, the forums, the code repositories. It can answer questions that would require a human to have expertise in medicine, law, engineering, history, economics, and dozens of other fields. No individual human has this breadth. The depth per field is uneven and sometimes unreliable, but the coverage is unprecedented.

None of these capabilities in isolation constitutes general intelligence. A calculator reasons about arithmetic without being intelligent. A search engine has broad knowledge without understanding any of it. But the point is that these capabilities are no longer isolated. They are being composed within single systems, and the composed system is more than the sum of its parts.

## The Gaps That Remain

I do not want to overstate the case. There are real gaps, and they matter.

**Robustness.** Frontier models still fail in ways that no competent human would. They hallucinate facts, they make confident errors on simple problems, they are vulnerable to adversarial prompting, and their failure modes are often unpredictable. A system that is brilliant 95% of the time and catastrophically wrong 5% of the time is not equivalent to a human expert who is consistently reliable. The error distribution matters, not just the average performance.

**Genuine novelty.** Current models are extremely good at recombining existing knowledge in useful ways. Whether they can produce genuinely novel insights, the kind that advance a field rather than synthesize it, is an open question. There are some promising signals (AlphaFold, AlphaProof, certain mathematical conjectures that models have helped formulate), but it is hard to disentangle "novel combination of existing ideas" from "genuine conceptual breakthrough." My honest assessment is that this distinction matters less than people think for the purpose of economic impact, because most economically valuable cognitive work is recombination, not fundamental discovery.

**Embodiment and physical reasoning.** Models are still weak at understanding the physical world in the intuitive, grounded way that humans do from infancy. Robotics is progressing but remains far behind language and reasoning capabilities. For many economically valuable tasks this does not matter (most knowledge work does not require a body), but it does limit the scope of general intelligence as applied to the physical world.

**Self-knowledge and calibration.** Models are bad at knowing what they do not know. They produce confident answers to questions they cannot reliably answer. This is improving (better calibration, explicit uncertainty training, retrieval augmentation that grounds responses in sources) but it remains a meaningful gap. A human expert says "I do not know" when appropriate. Models say "I do not know" when they have been trained to say it, which is not the same thing.

These gaps are real. But here is the thing that keeps me up at night: every single one of them is being actively worked on by large, well-funded teams, and the rate of progress on each of them is faster than it was a year ago. Robustness is improving through better RLHF, constitutional AI, and process reward models. Novelty is being probed through scientific discovery benchmarks. Calibration is improving through explicit uncertainty training and tool-augmented verification.

The question is not whether these gaps will close. The question is when, and whether we will be ready.

## Why the Timeline Is Compressed

There is a common argument that goes: "People have been predicting AGI is five years away for decades, so anyone predicting it now is probably wrong too." This argument is a fully general counterargument against any prediction, and its track record is mixed. People predicted heavier-than-air flight was impossible right up until it was demonstrated. People predicted the human genome would take decades to sequence right up until the cost curve collapsed. The fact that a prediction has been wrong before does not make it wrong now. You have to look at the actual evidence.

The evidence I find most compelling is not any single benchmark or demo. It is the rate of change across multiple independent capability axes.

In 2023, GPT-4 was state of the art and it could not reliably solve two-digit multiplication. In 2024, o1 was solving IMO-level competition problems. In 2025, frontier agents were completing multi-hour software engineering tasks end-to-end. Each year, the tasks that models cannot do shrinks, and the shrinkage is not linear. It is compounding, because improvements in one capability (better reasoning) unlock improvements in other capabilities (better tool use, better planning, better self-correction).

The other factor is economic pressure. There are now hundreds of billions of dollars committed to making these systems better. The talent concentration in AI is historically unprecedented. The compute available for training and inference is growing on a steep exponential. The research feedback loops are tightening: new ideas go from paper to implementation to production in months, not years. This is not a field where progress happens at the pace of academic publishing. It is an engineering race with nation-state-level resources behind it.

I wrote in my AI bubble post that the current level of investment is probably unsustainable and that a correction is coming. I stand by that. But here is the uncomfortable interaction between those two observations: even if investment pulls back, the capabilities that have already been developed do not disappear. The models that exist today will continue to exist. The research insights that have been generated will continue to compound. A financial correction slows the rate of progress. It does not reverse it. And the current rate of progress, even significantly slowed, still puts general-level capability within reach on a timeline of years, not decades.

## Why This Is Scary

I am not using the word "scary" for rhetorical effect. I am using it because I have spent enough time studying these systems to have a specific, technically grounded fear, and it is not the one most people expect.

The fear is not robot apocalypse. It is not Skynet. It is not even the labor displacement argument, which I covered in my bubble post and which is serious but at least has historical precedent we can reason about.

The fear is this: we are on track to build systems that are more capable than any individual human at most cognitive tasks, and we do not understand how they work, we cannot reliably predict when they will fail, and we do not have the institutional infrastructure to manage them.

Let me break that down.

**We do not understand how they work.** I work in interpretability. This is literally my field. And I can tell you with confidence that our understanding of what happens inside a large language model is, generously, at about the level of neuroscience's understanding of the brain in the 1950s. We can identify some circuits. We can trace some behaviors to specific features. We can sometimes predict how ablating a component will change behavior. But we cannot explain, in mechanistic terms, how a model solves a novel math problem or generates a coherent essay or reasons about ethics. The system works, and we do not know why it works the way it does.

This is not a normal situation. Every other powerful technology in human history, nuclear energy, aviation, pharmaceuticals, genetic engineering, was developed alongside a progressively deepening theoretical understanding of the underlying mechanisms. We understood atomic physics before we built reactors. We understood aerodynamics before we built commercial aircraft. We understood molecular biology before we approved gene therapies. The understanding came first, or at least developed in parallel.

With AI, capability is outrunning understanding by a wide margin. We are building systems that are increasingly powerful and we are doing it empirically, by trial and error at enormous scale, without a theoretical framework that would let us predict their behavior from first principles. This is unprecedented and it should make people uncomfortable.

**We cannot reliably predict when they will fail.** Current models fail in ways that are qualitatively different from traditional software failures. A bug in traditional software is deterministic: given the same input, you get the same wrong output, and you can trace the execution to find the error. Model failures are stochastic, context-dependent, and often impossible to reproduce. A model might answer a question correctly a hundred times and then fail on the hundred-and-first attempt with a slightly different phrasing. The failure modes are not enumerable. You cannot write a test suite that covers them.

This matters enormously as we start deploying these systems in high-stakes domains. Medicine, law, finance, infrastructure management, military applications. In each of these domains, the cost of an unpredictable failure is high, and the standard approach to ensuring reliability (exhaustive testing, formal verification, redundant systems) does not apply to models in the way it applies to traditional engineered systems.

**We do not have the institutional infrastructure.** There is no regulatory framework for generally capable AI systems. The EU AI Act and similar legislation are designed around narrow, task-specific AI applications. They categorize risk by use case (high-risk: medical devices, hiring algorithms, credit scoring) and impose requirements accordingly. This framework completely breaks down when the system is not task-specific. A generally capable system can be applied to any task, which means the risk categorization approach is incoherent. You cannot regulate a tool that can do anything by listing the things it might do.

The governance problem is compounded by the competitive dynamics. No single company or country wants to slow down, because slowing down means falling behind. The game theory is a classic race to the bottom: everyone would be better off if everyone slowed down, but no one can afford to be the one who slows down first. The voluntary commitments that labs have made (safety testing, red-teaming, responsible deployment) are real but structurally inadequate. They are voluntary, they are self-enforced, and they are subject to competitive pressure that intensifies as capabilities increase and the economic value of deployment grows.

## The Interpretability Race

This is where it gets personal. I chose interpretability as my research focus because I believe it is the single most important technical problem in AI right now. Not the most commercially valuable. Not the most intellectually glamorous. The most important, in the sense that the long-term outcome of AI development depends on whether we can understand these systems well enough to make reliable claims about their behavior.

The interpretability community has made real progress. Sparse autoencoders can extract interpretable features from model activations. Circuit analysis can trace specific behaviors to specific computational pathways. Representation engineering can modify model behavior by intervening on internal states. These are genuine advances, and they are the foundation of whatever safety guarantees we will eventually be able to provide.

But the honest assessment is that interpretability research is not keeping pace with capability research. Not even close. The frontier models of 2026 are orders of magnitude more complex than the models we have successfully interpreted, and the interpretation techniques that work on small models do not straightforwardly scale to large ones. We are running to understand systems that are being rebuilt faster than we can study them.

This is the race that matters. Not the race between companies to build the most capable model. The race between capability and understanding. If capability wins that race decisively, if we end up with systems that are genuinely generally intelligent and we still cannot explain why they do what they do, then we are in a situation with no historical precedent and no obvious safety net.

## What I Think Happens

My best guess, with all appropriate uncertainty flags, is that systems meeting my functional definition of AGI will exist within the next three to five years. Not because of any single breakthrough. Because the convergence of existing trends, reasoning, tool use, agency, multimodality, and scale, continues at its current rate, and because the economic incentive to push these capabilities forward is enormous.

When that happens, the economic consequences will be far more dramatic than the current wave of AI displacement, which is already significant. The difference between a system that can automate some tasks with supervision and a system that can perform at expert level across the full range of knowledge work is not a difference of degree. It is a structural shift in what human labor is for.

I do not know how that plays out. Nobody does. The optimistic case is that abundant machine intelligence makes everything cheaper, frees humans from drudgery, and creates prosperity that is broadly shared. The pessimistic case is that the gains concentrate in the hands of whoever controls the systems, labor markets collapse faster than institutions can adapt, and the political consequences are severe. The realistic case is probably somewhere in between, but "somewhere in between" covers a very wide range of outcomes, and the specific outcome depends on decisions being made right now by a very small number of people.

## What I Think Should Happen

I am not someone who has policy prescriptions. I am an engineer, not a policymaker. But I have three opinions that I hold with high confidence.

First, interpretability research needs to be funded at a scale commensurate with its importance. Right now, the total investment in understanding AI systems is a rounding error compared to the investment in making them more capable. This is like building nuclear reactors while funding nuclear safety research at the level of a university lab. The imbalance is dangerous and it is a choice, not an inevitability.

Second, the voluntary safety commitments from AI labs need to become mandatory, enforceable, and externally audited. Self-regulation does not work when competitive pressure is intense and the costs of non-compliance are borne by society rather than by the companies. This is not a controversial insight. It is the standard justification for regulation in every other high-stakes industry. The fact that it has not happened for AI is a policy failure.

Third, the public conversation about AGI needs to mature past the binary of "this is all hype" versus "the robots are coming." Both of those frames are obstacles to clear thinking. The reality is more nuanced and more urgent: we are building something genuinely powerful, we do not fully understand it, and the window for establishing the institutional infrastructure to manage it is narrowing. That is not hype and it is not panic. It is a description of the situation as I understand it.

I have been wrong about timelines before. Everyone in this field has. But I would rather say what I think and be wrong than stay quiet and be right.