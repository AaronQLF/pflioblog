---
title: "Why I Chose Interpretability "
date: "2026-03-21"
excerpt: "My core worry about advanced AI is simple: capability is scaling faster than understanding. This is why I think engineering teams need to treat interpretability as infrastructure, and why I decided to work in this field."
tags: ["AI", "Interpretability", "Safety", "Research", "own exp"]
---

I do not worry about AI in the abstract. I worry in a very concrete engineering sense. We are building systems whose behavior is economically and socially consequential, while our internal visibility into their cognition is still weak. We can often evaluate outputs, but we cannot reliably explain mechanisms.

That gap is the center of my concern.

A lot of debate about AI safety gets framed as philosophy. I think the immediate problem is more basic. If a system is deployed into high impact workflows, and the team operating it cannot answer why it produced a class of behaviors, then you do not have reliable control. You have managed uncertainty with dashboards.

## The failure pattern I keep seeing

The dominant development loop today is optimize, benchmark, ship, patch, repeat. It works for shipping product, but it creates a specific blind spot. If the model crosses a capability threshold and develops brittle or strategic behavior in edge contexts, we discover it late and explain it poorly.

Behavioral evaluation alone is not enough because behavior is underdetermined by mechanism. Two systems can pass the same eval suite and still implement different internal algorithms. One of those algorithms can generalize safely while the other fails catastrophically under distribution shift.

This is not hypothetical. We already see proxy failures everywhere. Models learn spurious shortcuts in training distributions, then break on slightly altered task geometry. At small scale this is annoying. At large scale, with automation and institutional dependence, it becomes a systemic risk amplifier.

## Why interpretability is an engineering requirement

I do not think interpretability is a nice research bonus. I think it is part of the minimum viable reliability stack.

If we treat modern models as programs, then interpretability is reverse engineering. It is the process of recovering computational structure from weights and activations so we can reason about failure modes before deployment pressure forces us to reason after incidents.

For teams, this has practical implications. Interpretability improves debugging velocity because you can isolate which components are causally contributing to bad outputs. Safety benefits too, because you can monitor specific internal features and circuits instead of relying only on external behavior. And on the governance side, explanations become tied to mechanism, not post hoc narrative.

In mature engineering domains, observability is non negotiable. Nobody runs distributed systems in production without traces, metrics, and structured logs. I see interpretability as the analogous observability layer for learned cognition.

## What I think teams are underinvesting in

Most teams still allocate interpretability effort as a side quest. A small group runs analyses after training, findings get summarized in a deck, and roadmap pressure moves attention back to capability and latency.

I think this is backwards. Interpretability should be integrated into the development lifecycle itself. During training, teams should track internal representation drift, feature emergence, and circuit level changes across checkpoints. At eval time, teams should include mechanistic probes, not only pass fail tasks. Once deployed, teams should monitor internal safety relevant features with alert thresholds and rollback policies.

You do not need perfect mechanistic understanding to get value. Partial understanding already improves control. The same way imperfect observability is still vastly better than no observability.

## What this looks like in practice

When I say teams should invest more here, I do not mean every company needs a giant interpretability lab tomorrow. I mean teams should start building a real workflow around mechanistic evidence. Pick a small set of high impact behaviors, map the internal components that appear to drive them, and track those components across model versions. If a behavior changes, you should know whether the same circuit changed or whether an entirely new mechanism appeared.

I also think release process should include at least one interpretability gate for high risk capabilities. Not perfection, just a minimum standard of internal visibility. If a model clears external evals but fails basic mechanistic sanity checks, that should trigger caution, not celebration. The cost of this discipline is real, but the cost of blind deployment is usually higher and paid later under worse conditions.

## My personal reason for choosing this field

I chose interpretability because it matches how my brain works. I am less interested in demo magic and more interested in causal structure. I want to know what computation is actually happening, where it lives, and what perturbation changes it.

That is partly intellectual preference and partly risk logic. If capability keeps scaling while understanding stays shallow, the delta becomes the problem. At first the delta looks like uncertainty. Later it looks like incidents that no one can cleanly diagnose.

When I was a kid, my dad used to tell me that my autism was my superpower. I did not process that as motivational language. I processed it as an engineering constraint: if your cognition is unusual, route it toward problems where unusual pattern fixation is useful. Interpretability is exactly that kind of problem.

It rewards patience with ambiguity, precision in language, and stubborn attention to mechanism over hype. It is one of the few areas in AI where being obsessively specific is not a personality quirk but a methodological requirement.

## The future I want teams to build

I want AI engineering teams to treat interpretability as first class infrastructure, on the same level as evaluation, data quality, and security. Model release criteria should include mechanistic confidence thresholds, not only benchmark scores. Incident postmortems should include circuit level root cause analysis where possible.

The strategic argument is simple. Systems you understand are easier to align and debug, simpler to govern, and more trustworthy. Systems you do not understand can still be useful, but their risk profile is opaque and therefore expensive.

My worry about AI is not that intelligence will suddenly appear and become mystical. My worry is that we will keep shipping increasingly powerful black boxes into critical workflows while pretending behavioral testing alone is an adequate substitute for understanding.

I am betting my career that this is fixable. Not easy, not fast, but fixable. And the teams that take interpretability seriously now will not just be safer. They will build better systems, diagnose failures faster, and make fewer expensive mistakes when model capabilities jump again.
