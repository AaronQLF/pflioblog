---
title: "World Models, or: Why Yann LeCun Raised $1B to Fix AI"
date: "2026-03-11"
excerpt: "Yann LeCun left Meta to build a new startup called AMI. They raised a billion dollars in a seed round. Their pitch is that LLMs are a dead end for true intelligence and we need world models instead. I think he might be right."
tags: ["AI", "Startups", "Machine Learning", "World Models"]
---

# World Models, or: Why Yann LeCun Raised $1B to Fix AI

There is a specific kind of arrogance required to look at the entire industry obsessing over Large Language Models and decide that everyone is fundamentally on the wrong track. Yann LeCun has exactly this kind of arrogance. At the end of 2025, he left his role as Chief AI Scientist at Meta to co-found Advanced Machine Intelligence (AMI) with Alexandre LeBrun. They proceeded to raise a $1 billion seed round at a $3.5 billion valuation. 

If you are paying attention to the AI space, the number should make you pause. A billion dollars for a seed round is not standard venture capital. It is sovereign wealth fund territory. It means the investors—which include Nvidia, Temasek, and Jeff Bezos—believe this is not a wrapper around an existing API, but a fundamental platform shift. 

I want to break down exactly what AMI is trying to build, and why LeCun believes the current trajectory of LLMs is a local maximum.

## The problem with autoregression

Most people treat LLMs as if they possess understanding. They do not. They possess high-dimensional statistical correlations between tokens. The autoregressive objective—predict the next word—is incredibly powerful, but its primary function is interpolation within the training distribution. It is a sophisticated system for retrieving and mixing existing concepts.

LeCun has been pointing out for years that LLMs fail at basic reasoning. They hallucinate because they lack an underlying model of reality to ground their text generation. If you ask an LLM a physical reasoning question that is slightly out of its training set, it collapses. It does not know that if you push a glass off a table, it falls and shatters. It just predicts tokens that statistically follow "glass pushed off table."

This is the distinction between learning language and learning reality. Humans and animals learn reality long before they learn language. We develop an intuitive physics engine in our heads by exploring the world. We understand cause and effect, object permanence, and 3D space. LLMs skip all of this and try to learn reality exclusively through its low-bandwidth projection into text. 

## What a world model actually is

The alternative LeCun is proposing is the "world model." This is a generative architecture that learns the dynamics of the physical environment, rather than just the dynamics of language. 

AMI is starting with video. They are building a model called AMI Video, but do not confuse this with Sora or other video generation tools. The goal of AMI Video is not to generate coherent pixels for entertainment. The goal is to use video as a high-bandwidth sensory input to train an internal representation of physics, geometry, and temporal coherence. 

A true world model has a few required properties:
1. It maintains a persistent state of the environment.
2. It can predict the consequences of actions within that environment.
3. It can plan a sequence of actions to achieve a specific goal state.

If you have a world model, reasoning becomes a planning problem. You simulate different actions internally, observe their predicted consequences, and select the path that minimizes your cost function. This is how humans solve novel problems. We do not pattern-match against a text database; we run a mental simulation.

## The bet

The $1 billion seed round is a bet on the Joint Embedding Predictive Architecture (JEPA), a framework LeCun has been championing during his time at Meta. JEPAs do not try to reconstruct every pixel of a future frame. Instead, they predict the abstract representation of the future frame. They throw away the noise—the exact texture of the carpet, the precise way the water splashed—and predict the high-level semantic reality.

This is much more computationally efficient and makes the representations stable enough for actual reasoning. 

AMI is not starting with consumer chatbots. They are targeting robotics, manufacturing, and wearables. These are domains where the cost of being wrong is high, and where a model actually needs an intuitive understanding of physical space to be useful. If you want a robot to fold your laundry, an LLM will not help you.

## Why I think this matters

I have spent enough time digging through the output of current LLMs to know their limitations. They are incredibly useful for generating boilerplate, summarizing text, and transforming data formats. But when you ask them to synthesize a genuinely novel architecture, or reason through a complex physical problem, you hit a wall. 

The industry is currently trying to scale its way out of this wall by throwing more compute at the autoregressive objective. The bet is that quantitative changes in scale will result in qualitative leaps in reasoning. 

LeCun's bet is that the architecture is fundamentally wrong for that goal. We have overfitted to language. 

It is exceedingly rare for an established luminary to abandon their safe, highly compensated corporate research position to start a company explicitly designed to cannibalize the dominant paradigm. LeCun did not need the money or the stress. He did it because he genuinely believes the current architectures are a dead end for artificial general intelligence. 

Whether AMI succeeds or not is an open question. Building a company around a theoretical architecture is risky. But the fact that they managed to raise a billion dollars indicates that I am not the only one who thinks the autoregressive emperor is starting to look a bit naked.
