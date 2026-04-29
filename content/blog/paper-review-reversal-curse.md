---
title: "Paper Review: The Reversal Curse"
date: "2026-04-28"
excerpt: "Thirteenth entry in the Paper Review series. Berglund et al. (2023) trained language models on 'A is B' and showed they completely failed to learn 'B is A'. The experimental design is unusually clean, the finding is reproducible at every scale they tried, and the implications for how transformer factual memory actually works are larger than the paper's modest scope suggests."
tags: ["Paper Review", "AI", "Interpretability", "Research"]
series: "Paper Review"
seriesOrder: 13
---

Most of the papers I review in this series are about new architectures, new objectives, or new ways of decomposing what a model is doing. This one is different. It is a paper about a single experimental observation. The observation is small, the experiments are not particularly elaborate, and the math is almost absent. I am reviewing it anyway, because I think it is one of the most important small-scope findings about language models in the last several years, and because the conversation around it has been muddled by people arguing about whether the finding is profound or trivial without first agreeing on what it actually says.

"The Reversal Curse: LLMs trained on 'A is B' fail to learn 'B is A'" (Berglund, Tong, Kaufmann, Balesni, Stickland, Korbak, Evans, 2023) reports the following. If you fine-tune a language model on synthetic factual statements of the form "Daphne Barrington is the director of *A Journey Through Time*," the model will subsequently answer the question "Who is Daphne Barrington?" correctly. It will not, however, answer the question "Who directed *A Journey Through Time*?" correctly. It will not even rank the correct answer above random. This holds across model sizes from GPT-3 350M up to GPT-3 175B and Llama-1 7B to 65B. It holds whether you fine-tune on ten paraphrased versions of the fact or thirty. It is not a sample efficiency problem. The model has memorized the forward direction perfectly and has learned nothing about the backward direction.

That is the finding. It is much weirder than it sounds.

## Why This Should Not Happen

The first reaction most people have to this result is that it sounds wrong. Surely a sufficiently large language model that has seen "A is B" should be able to answer questions about B that involve A. The relation is symmetric. The information is there. What is the model doing if not learning that?

The intuition that this should work comes from how we think about knowledge. If I tell you that Daphne Barrington directed *A Journey Through Time*, you have learned a single fact, and you can answer questions about that fact framed in either direction. You do not memorize "Daphne Barrington maps to *A Journey Through Time* under the relation 'directed'" as a one-way function. You learn a relational triple, and the triple is symmetric under the inverse of the relation.

Transformers do not do this. They learn next-token prediction. Concretely, fine-tuning on the string "Daphne Barrington is the director of *A Journey Through Time*" updates the weights so that the model is more likely to produce the tokens "is the director of *A Journey Through Time*" given the prefix "Daphne Barrington." It does not, in any direct sense, update the weights so that the model is more likely to produce "Daphne Barrington" given the prefix "the director of *A Journey Through Time* is."

This is obvious in retrospect. Once you say it out loud, the result is no longer surprising at the mechanism level. It is a direct consequence of the training objective. You only update the conditional distribution in the direction the gradient flows, which is the left-to-right direction of the sequence.

But there is still something genuinely puzzling, which is that pretraining on internet-scale data does not exhibit this problem in any practically visible way. If I ask GPT-4 who directed *2001: A Space Odyssey*, it tells me Stanley Kubrick. If I ask who Stanley Kubrick is, it tells me he directed *2001: A Space Odyssey*. The reversal curse, if it operates at all in pretraining, must be defeated by something. Berglund et al. argue that it is defeated by the simple fact that internet text contains both directions. If millions of webpages mention Kubrick directing *2001*, some of them phrase the relation with Kubrick first and some with the film first. The pretraining corpus contains both forward and backward instances, and the model learns both because gradient descent has been given both. Fine-tuning on a synthetic dataset that contains only the forward direction breaks this.

This explanation is plausible. The paper does not prove it, but the experimental design rules out most alternatives.

## The Experimental Design

The cleanest experiment in the paper is the synthetic name-description dataset. The authors generate 30 fictional people with fictional descriptions: "Daphne Barrington is the director of *A Journey Through Time*", "Uriah Hawthorne is the composer of the *Abyssal Melodies*", and so on. The names and descriptions are guaranteed to be unique and absent from any pretraining corpus, because they were generated by GPT-4 with explicit constraints to ensure uniqueness.

For each fact, they create two types of training documents. NameToDescription documents present the fact with the name first. DescriptionToName documents present it with the description first. They split the 30 facts into three groups: 10 facts presented only in NameToDescription form, 10 presented only in DescriptionToName form, and 10 presented in both forms (the both-direction control).

Crucially, each fact is presented with thirty paraphrased variants. So a model fine-tuned on the NameToDescription-only group sees thirty different ways of saying "Daphne Barrington is the director of *A Journey Through Time*", but never any sentence with the description in the prefix position. This rules out the trivial explanation that the model has not seen enough examples. It has seen plenty. They are just all in the same direction.

After fine-tuning, they evaluate by prompting the model with completions in both directions and measuring log-likelihood of the correct completion versus distractors. The result is a textbook ablation. On the both-direction group, the model answers correctly in both directions, as expected. On the NameToDescription-only group, the model answers correctly when prompted with the name and produces near-random output when prompted with the description. The DescriptionToName-only group shows the symmetric failure.

The numbers are stark. Forward accuracy on the trained direction is essentially perfect (the model has memorized the facts). Backward accuracy is at chance level, sometimes below chance. The log-likelihood that the model assigns to the correct backward completion is statistically indistinguishable from the log-likelihood it assigns to a randomly chosen distractor.

This is not partial transfer. This is not the model doing slightly worse in the reverse direction. It is no transfer at all. The information learned in one direction is invisible to the model when queried in the other direction.

## What This Says About How Transformers Store Facts

The result is most cleanly interpreted in the framework that Meng et al. introduced in the ROME paper: factual associations in transformers are stored as key-value pairs in the MLPs of specific middle layers, where the key is a representation of the subject and the value is the answer. The MLP behaves as an associative memory keyed on subject embeddings.

If this picture is correct, then learning "Daphne Barrington is the director of *A Journey Through Time*" updates the MLP's key-value store such that the key "Daphne Barrington (in director-asking context)" maps to the value "*A Journey Through Time*". It does not, by itself, update the key "*A Journey Through Time* (in director-of context)" to map to "Daphne Barrington". Those are two different entries in the associative memory. There is no inherent reason why writing one should cause the other to be written.

The reversal curse is, on this view, a behavioral signature of the underlying associative memory structure. The memory is fundamentally one-way. If the training data only writes one direction, only one direction is queryable.

This also explains why pretraining apparently dodges the curse. The internet contains both directions of every commonly referenced relation, because human writers naturally express the same fact from different angles. "Kubrick's *2001*" appears as often as "*2001*, directed by Kubrick". Both keys get populated. Both directions become queryable. The reversal curse is invisible at scale not because the model has overcome it, but because the corpus has hidden it by providing both directions.

I find this picture compelling but I want to flag the parts that are speculation. The connection to ROME-style key-value associative memory is my interpretation, not the paper's. Berglund et al. are deliberately conservative about mechanism. They observe the behavior and hypothesize about training data exposure. The mechanistic story I am telling is consistent with their results but goes beyond what they actually demonstrate. There is room for it to be wrong.

## The Real-Person Experiment

The most interesting auxiliary experiment in the paper, and the one that I think most cleanly demonstrates that the curse operates in pretraining and not just in fine-tuning, is the celebrity reversal study.

The authors collect a list of well-known people and their parents, restricted to cases where the parent is also a public figure (so that information about the parent is plausibly in the pretraining corpus). They then prompt GPT-4 with two questions for each pair. "Who is Tom Cruise's mother?" and "Who is Mary Lee Pfeiffer's son?". The first question, for celebrities, is typically answered correctly: GPT-4 knows Tom Cruise's mother. The second question, asking about the lesser-known parent, fails much more often.

This is exactly what the reversal curse predicts. Tom Cruise's Wikipedia page mentions Mary Lee Pfeiffer in the position of "his mother." Mary Lee Pfeiffer's Wikipedia page (if she has one) is much shorter and may not always mention her famous son. The forward direction (celebrity to parent) is over-represented in the corpus. The backward direction (parent to celebrity) is under-represented. The model behaves accordingly. It knows the well-attested direction. It does not know the under-attested direction, even though the underlying fact is the same.

The 2023 paper reports approximately 79% accuracy on the forward direction and 33% on the backward direction across their celebrity dataset. Those are not subtle numbers. The model has demonstrably learned one direction of these facts and not the other, which is what we should expect if the gradient updates only flow in the direction of the training data.

## What This Does Not Say

The paper has been over-interpreted in several directions, and I want to be precise about what it does not show.

It does not show that language models cannot generalize. It shows that they cannot generalize specifically across this one type of permutation: reversing the position of two entities in a sentence. They generalize fine across paraphrasing. They generalize fine across surface form changes that preserve the order of relevant entities. The reversal curse is narrow. It says: gradient descent on autoregressive training only updates the conditional distribution in one direction, and reversing the entities in the prompt produces a conditional distribution the model has not been trained on.

It does not show that LLMs lack a "world model" or are pure pattern matchers. The paper does not engage with that question, and the result is consistent with both interpretations. A model that has built a relational world model could in principle read out the inverse relation. A model that has built a sophisticated next-token prediction system but no relational structure cannot. The experiment does not distinguish, because both kinds of models are fine-tuned with the same gradient signal, and the gradient signal in this experiment only writes one direction.

It does not show that this is unfixable. The paper itself notes that explicit data augmentation (training on both directions) makes the problem disappear. The follow-up literature has explored more sophisticated solutions: bidirectional training objectives, structured retrieval, prompting techniques that explicitly invoke the inverse relation. The reversal curse is a property of one particular training setup, not a fundamental limit of the architecture.

## The Connection to Memorization and Knowledge Editing

The reversal curse sits at an interesting intersection with two other lines of work I have been following.

The first is knowledge editing, ROME and MEMIT specifically. Both methods edit factual associations by modifying weights at specific MLP layers. Both methods, by construction, edit only one direction of the relation. If you use ROME to insert the fact that the Eiffel Tower is in Rome, you change the model's behavior when asked "Where is the Eiffel Tower?" but you do not change its behavior when asked "What landmark is in Rome?". This is not a flaw in ROME. It is a structural property of the associative memory the method is editing. The reversal curse is the natural consequence at the behavioral level, and ROME's directional edit is the mechanistic correlate.

The second is the literature on memorization and verbatim recall. Carlini et al. (2021) and follow-ups showed that language models memorize substantial portions of their training data and can be made to regurgitate verbatim sequences. The reversal curse adds a refinement to this picture. The model memorizes the training data in its surface form, not as an extracted relational structure. Memorization is one-way memorization. The model has stored the bytes, not the meaning.

I think this is the most underappreciated implication of the paper. The phrase "the model has memorized this fact" is doing a lot of work in conversations about LLMs, and it tends to imply that the fact has been extracted into some structured representation. The reversal curse demonstrates that memorization, at least under standard training, is much more shallow than that. The model has memorized a left-to-right token sequence. It has not memorized a fact in any representation-independent sense. This matters for how we should think about evaluating model knowledge, designing training data, and reasoning about what models can and cannot do.

## Why The Critics Are Half Right

There has been a recurring critique that the reversal curse is trivial, that it follows so directly from autoregressive training that observing it experimentally tells us nothing new. I have some sympathy for this position, but I think it is half right at most.

The trivial part is the mechanism. Autoregressive training updates weights in one direction. Of course a single-direction training set produces a single-direction memory. This is not a deep insight.

The non-trivial part is everything else. That the curse persists across model scale (the larger model does not somehow figure it out). That the curse cannot be defeated by paraphrase data augmentation alone (paraphrasing does not reverse). That it shows up cleanly in pretrained models on naturally occurring asymmetries (the celebrity parent experiment). That it implies a specific structural picture of how factual memory works in transformers. None of these are trivial consequences of autoregressive training in the abstract. They are empirical findings about how the consequences play out in practice, and the practice is what matters.

The critique that the result is "obvious" is a kind of post-hoc explanatory move that often appears around findings about LLMs. Once a result is shown, a story is constructed under which it had to be true. This is how science often progresses, but it should not be confused with the result not being worth reporting. The reversal curse was not widely predicted before the paper. The paper made it visible and quantified it. That is real progress.

## What I Think About This

The paper changed how I think about LLM knowledge in two specific ways.

First, I no longer believe that "the model has learned this fact" is a coherent statement without specifying the direction of access. A model has learned a fact in a specific querying direction. Whether it has learned the inverse direction is a separate empirical question. This applies to fine-tuning, to in-context learning, and to retrieval-augmented setups where the retrieved content has a specific surface form.

Second, the picture of factual memory as a directional associative store has become more central in how I reason about model behavior. When a model fails on a query, the relevant question is no longer "does the model know this fact?" but "has the model been trained to produce this completion given this prefix?". Those are different questions, and the reversal curse forces the difference into the open.

For interpretability, the paper is useful because it provides a clean behavioral test for whether information is stored bidirectionally or unidirectionally. If you can construct a query where the forward direction works and the backward direction fails, you have evidence that the information is stored in a specific direction. This becomes a tool. You can probe the directional structure of model knowledge by constructing systematic forward-backward query pairs and measuring asymmetry.

The paper is also a reminder that very simple experiments can reveal deep architectural properties. The whole experimental setup is, by the standards of modern ML research, extremely modest. They generate 30 fictional facts. They fine-tune some open models. They evaluate with log-likelihood. The result is reproducible by anyone with API credits and a free afternoon. The depth of the result is in the conceptual framing, not in the experimental complexity.

## The Bigger Picture

Most of the architecture papers in this series are about expanding what models can do. Better attention, better recurrence, better representation learning. The reversal curse is one of the few results I can point to that crisply identifies a thing models cannot do, and explains why, in terms that are mechanistically grounded and reproducible.

I think the field needs more papers like this. Not more papers reporting failure modes, but more papers that take a single experimental observation seriously, design clean ablations, and resist the urge to generalize beyond what the experiments show. The Berglund et al. paper is restrained in its claims. It says: here is a thing models do not do, here is a clean experiment that demonstrates it, and here is a hypothesis about why. It does not claim that this proves anything sweeping about intelligence, reasoning, or generalization. The restraint is part of why the paper is useful.

The reversal curse has not been solved in any general sense. The standard mitigations (data augmentation with reversed examples, structured training objectives) work for known problem cases but require knowing in advance which directions matter. For frontier-scale models trained on internet-scale corpora, the relevant question is which relations have asymmetric representation in the pretraining data, and what behaviors that produces in deployment. I do not think we know the full answer.

What we know is that the picture of LLM knowledge as a structured, query-direction-invariant store is wrong. The store is directional. The directionality is invisible when both directions are well-represented in training and visible when they are not. Once you start looking for it, you start seeing it everywhere.

*Thirteenth entry in the Paper Review series. Previous: A Mathematical Framework for Transformer Circuits.*
