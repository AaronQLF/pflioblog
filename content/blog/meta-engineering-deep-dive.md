---
title: "Meta-Engineering, or: Writing Code About Code About Code"
date: "2026-03-09"
excerpt: "Most software engineers write code that does things. A smaller number write code that writes code that does things. An even smaller number think carefully about what that recursive act actually implies. This is about the last group."
tags: ["Engineering", "Abstractions", "Software", "own exp"]
---

# Meta-Engineering, or: Writing Code About Code About Code

There is a moment in every sufficiently long software project where you stop writing the thing and start writing the thing that builds the thing. The first time this happens it feels like a productivity hack. By the second time it starts to feel like a pattern. By the tenth time you realize you have been doing a different kind of engineering than what you thought you signed up for, and you have opinions about it now.

I want to be precise about what I mean by meta-engineering because the term gets used loosely. I do not mean DevOps. I do not mean "tooling" in the generic sense of writing scripts that automate your workflow. What I mean is: the practice of designing systems whose primary output is other systems, or whose primary purpose is to make the construction of other systems cheaper, faster, or more correct. Compilers, code generators, DSLs, type systems, build systems, macro systems, template engines. The software that software runs on.

## Why some people end up here

There is a personality type that gravitates toward meta-engineering and I think it is worth being honest about what it is. It is the person who, given a problem, immediately starts thinking about the class of problems it belongs to. Not in a "big picture strategy" way. In an "I refuse to solve this problem without first understanding its structure deeply enough to solve all problems shaped like it" way.

This is not always a virtue. In fact it is frequently a vice. The person who cannot resist generalizing a one-off script into a framework has caused more damage to software projects than most categories of bug. The instinct toward abstraction is powerful and it is also, without discipline, destructive. But when channeled correctly, it is the instinct that produces things like LLVM, or React, or SQLite. Tools that are so precisely shaped to their problem class that they collapse the cost of building new things within that class by orders of magnitude.

The difference between the person who builds a pointless abstraction layer and the person who builds LLVM is not talent. It is taste. Specifically, taste about where the boundaries of a useful abstraction actually lie, which you can only develop by getting it wrong many times.

## The abstraction trap

Here is the central paradox of meta-engineering: the value of an abstraction is inversely correlated with how satisfying it is to build.

The abstractions that feel most beautiful to construct are the ones that generalize perfectly. They handle every case. They have no special cases. The type system is expressive enough that invalid states are unrepresentable. This is deeply intellectually satisfying and it is also, in most practical contexts, a mistake.

Real problems have irregular shapes. They have weird edges that do not fit into clean type hierarchies. The abstraction that handles 95% of cases elegantly and punts on the remaining 5% is almost always more valuable than the one that handles 100% of cases at the cost of making the 95% case harder to work with. But the second one is more fun to build. This is a real tension and ignoring it is how you end up with enterprise Java patterns and AbstractSingletonProxyFactoryBeans.

I have noticed a pattern in my own work: the quality of a meta-engineering project correlates strongly with how much I resisted the urge to make it general. The best code generators I have written are the ones that do one narrow thing well. The worst are the ones where I tried to build a general-purpose code generation framework. The framework always starts out elegant and then accumulates special cases until it is more complex than the code it was supposed to replace. This is not a unique observation. It is well-trodden ground. But knowing it intellectually and actually exercising the discipline to stop generalizing are different skills.

## Code as material

There is something about working at the meta-level that changes how you think about code as a substance.

When you write application code, you are working with APIs and libraries. Code is a tool you use. When you write meta-engineering code, code becomes your material. You are shaping it, transforming it, analyzing its structure. You start to see code the way a carpenter sees wood: as a medium with a grain, with properties that make some operations natural and other operations painful.

This shift in perspective is genuinely useful and I think undervalued. Once you start thinking about code as a material rather than a tool, you notice things that are otherwise invisible. Why is this refactoring hard? Because the code has a grain and you are cutting against it. An API that feels awkward to use is awkward because its shape does not match the shape of the problem it is being applied to. A codebase that resists modification resists it because the abstractions baked into its structure encode assumptions that are no longer true.

I find that people who have spent time writing parsers, compilers, or code generation tools are disproportionately good at software architecture, not because those skills transfer directly, but because working at the meta-level forces you to develop a sensitivity to code structure that most application development does not require.

## The compiler mindset

There is a specific way of thinking that compiler engineers develop that I want to describe because I think it generalizes.

A compiler takes a program in one representation and transforms it into an equivalent program in another representation. This is a precise operation. "Equivalent" has a formal meaning. The transformation must preserve semantics while changing form. This means you need to understand both the source and target representations well enough to define what "equivalent" means between them. This is a harder problem than it sounds.

Most engineering work, when framed correctly, has this structure. You are taking some specification (possibly informal, possibly just in someone's head) and transforming it into an implementation that preserves the essential properties of the specification while adapting to the constraints of the target medium (hardware, APIs, user expectations, performance requirements). The compiler mindset is the habit of being explicit about what the specification is, what the target constraints are, and what "preserving semantics" means in your specific context.

I have found this framing useful in situations that have nothing to do with compilers. When designing an API: what is the "source language" (the user's mental model of the operations) and what is the "target language" (the actual system behavior)? When debugging: at what point in the "compilation pipeline" did the translation from intent to behavior go wrong? When reviewing code: does this implementation actually preserve the semantics of the specification, or does it subtly change them in ways nobody is tracking?

## On reading code

Most people dramatically underinvest in reading code relative to writing it. This is true generally but it is especially true at the meta-engineering level, where the code you are reading has implications that compound.

Reading a compiler's source code teaches you more about language design than any textbook. Reading the Linux kernel's scheduler teaches you more about concurrency than any course. Reading SQLite's source teaches you more about systems programming than most jobs will. The information density in well-engineered systems is extraordinary, and unlike textbooks, the code contains all the decisions that actually shipped, including the ones that are ugly but correct, the ones that are elegant but were later replaced, and the ones that are clearly wrong but have survived because nobody has hit the edge case they break on yet.

I keep a running list of codebases I have read end-to-end or close to it. It is one of the highest-ROI activities I have found for improving as an engineer. The returns are not in tricks or patterns you can copy. The returns are in developing an intuition for how good engineers think about problems, what tradeoffs they consider, and what they choose to care about.

Some of the ones that taught me the most: Lua (clean, opinionated, small enough to hold in your head entirely), Redis (ruthless pragmatism in every design decision), SQLite (what "engineering discipline" actually looks like at the limit), and the Go compiler (simple architecture solving a hard problem without making the architecture itself hard). If you have not read a nontrivial codebase end-to-end, I would start with Lua. It is excellent.

## The recursive itch

I said earlier that there is a personality type that gravitates toward meta-engineering. I want to be more specific about the cognitive signature because I think it is recognizable.

It is the compulsion to formalize before executing. Given a manual process, the instinct is not to do it faster but to describe it precisely enough that something else could do it. When a pattern appears twice, the instinct is not to copy-paste but to name it. And when a system has accidental complexity, the instinct is not to document it but to restructure until the complexity is either essential (and therefore justified) or eliminated.

I recognize this pattern in myself very clearly. It has been both my best and worst quality as an engineer. Best, because the instinct to formalize is what leads to good abstractions, clean interfaces, and systems that are genuinely easier to modify than the ones they replaced. Worst, because it is bottomless. You can always go one level more meta. You can always find another pattern to name, another abstraction to extract, another layer to insert. At some point you have to ship something, and the recursive itch does not have a natural stopping condition.

The discipline I have slowly developed is: formalize when the cost of not formalizing is visible and concrete. When a manual process is error-prone and repeated frequently. When a pattern is used by multiple people who implement it inconsistently. When a piece of accidental complexity is actively causing bugs. Do not formalize because it would be more elegant. Formalize because the mess is costing you something you can point at.

## Why I think this matters

Meta-engineering is not a career path that most companies explicitly hire for, although some do under titles like "developer experience" or "platform engineering" or "language infrastructure." But the skills it develops are, I think, among the most transferable in software.

The ability to look at a system and see its structure rather than its surface. Asking not just "does this work" but "why is this shaped the way it is." Building tools that make future work cheaper rather than just doing the immediate work. These are the skills that distinguish engineers who build things that last from engineers who build things that work.

I do not think everyone should be a meta-engineer. Most software does not need another abstraction layer, and the world has enough framework authors. But I think every engineer benefits from spending some time at the meta-level, the same way every writer benefits from studying grammar even if they never diagram a sentence professionally. You understand the material better when you have worked with it at a structural level.

And the truth is, it is just deeply fun to write code that writes code. The recursive elegance of it, when it works, is one of the most satisfying things I have found in this field. I am trying to be appropriately measured about that. But I think the fact that it is fun is itself informative. The problems that attract sustained intellectual obsession tend to be the problems worth working on.