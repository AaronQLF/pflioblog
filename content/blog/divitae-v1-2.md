---
title: "Divitae v1.2: Swarm Intelligence Meets Persistent Memory"
date: "2026-03-16"
excerpt: "Technical breakdown of how Divitae v1.2 integrates MiroFish's swarm simulation engine with ByteDance's M3-Agent memory architecture to build a trading system that remembers what 700,000 agents believed last Tuesday."
tags: ["Trading", "AI", "Systems", "Swarm Intelligence", "Agents"]
---


I wrote previously about building systematic trading systems and made the point that the interesting problem is not finding a strategy but building a machine for generating and evaluating strategies. Divitae is that machine. Version 1.2 is a significant architectural shift in how we handle signal generation and state management. We replaced the previous signal pipeline with a swarm simulation layer built on MiroFish and gave the entire system persistent, structured memory using ideas from ByteDance's M3-Agent.

## The Problem With Traditional Signal Pipelines

Divitae v1.0 and v1.1 generated trading signals the standard way: a collection of factor models, each computing some feature of the market (momentum, mean reversion, volatility regime, cross-asset correlation shifts), feeding into a meta-model that combined them into position sizing recommendations. This works, but it is limited in ways that matter.

Factor models treat the market as a physical system to be measured. They compute statistics *about* price action. But markets are not physical systems. They are populations of agents making decisions based on beliefs, narratives, information cascades, and social dynamics. A momentum signal tells you that price has been going up. It tells you nothing about *why*, which means it tells you nothing about *when it will stop*.

v1.2 started from a simple question: what if, instead of computing statistics about the output of a complex adaptive system, we simulated the complex adaptive system directly?

## MiroFish as the Simulation Core

MiroFish is a swarm intelligence engine. Large populations of autonomous AI agents deployed into simulated environments, emergent behavior observed.

We feed it a combination of financial news feeds, earnings transcripts, Fed minutes, options flow data, and social media sentiment from fintwit. MiroFish constructs a structured knowledge graph via GraphRAG. The ontology generator identifies entity types (companies, sectors, macro indicators, key people, policy instruments) and relationship types (supply chain dependencies, competitive dynamics, regulatory exposure). Not bag-of-words. The graph preserves causal and relational structure.

From that graph, it synthesizes agent personas. Each agent has personality traits (risk appetite, time horizon, information sources they trust, behavioral biases), a backstory consistent with the graph topology, and independent decision-making logic. We run populations between 10,000 and 50,000 depending on the scenario. Each agent maintains its own memory and evolves its beliefs over the simulation.

The simulation itself runs on the OASIS engine in discrete rounds (we map 1 round = 1 trading day). Agents interact on simulated social platforms, posting theses, reacting to news injections, building consensus or disagreement. The action space includes CREATE_POST, LIKE, REPOST, COMMENT, FOLLOW, and SEARCH. We added custom actions: PLACE_ORDER, ADJUST_POSITION, PUBLISH_RESEARCH.

Then we extract signals. Instead of asking "what does the price data say?", we ask "what does the agent population believe, and how is that belief distribution shifting?"

- **Consensus measures**: what fraction of the agent population is bullish/bearish on a given name, weighted by influence
- **Narrative velocity**: how fast a particular thesis is spreading through the population
- **Contrarian signals**: when the belief distribution becomes extremely skewed (>85% consensus), we flag potential reversal setups
- **Cascade detection**: identifying the early stages of information cascades before they reach mainstream agent adoption

A momentum signal says "price went up." A swarm consensus signal says "72% of simulated market participants believe price will go up, the belief is concentrated in short-horizon agents, and the thesis is spreading at 3.2x the baseline diffusion rate." Completely different kind of information.

## Variable Injection

MiroFish supports dynamic variable injection mid-simulation. Before a Fed meeting, we fork the simulation:

| Scenario | Injection | What we observe |
|----------|-----------|-----------------|
| Hawkish surprise | "Fed raises 50bp, signals further tightening" | How fast does bullish consensus collapse? Which agents capitulate first? |
| Dovish hold | "Fed holds, dovish language on inflation" | Does the existing bullish narrative accelerate or is it already priced? |
| Data shock | "CPI print 2x consensus" | Cascade dynamics, does the information spread uniformly or cluster? |

This gives us a probability-weighted distribution of market reactions *before the event happens*. Not a point estimate, a full simulation of how heterogeneous agents would reorganize their beliefs under each scenario. We size positions based on the asymmetry between scenarios, not on a single prediction.

## The Memory Problem

v1.1 ran into a wall here: MiroFish agents have memory that persists within a simulation run but not across runs. Each new simulation starts from a fresh population with no awareness of what previous simulations concluded.

Financial markets are path-dependent. An agent population reasoning about NVIDIA earnings in March needs to "remember" how it reasoned about NVIDIA earnings in January. Not the raw data, the *interpretive context*. The narratives that were forming. The consensus that was building. The surprise signals that disrupted previous belief distributions.

Most agent frameworks handle memory by stuffing conversation history into the context window. This breaks down fast. Even a 200k window fills up when you have 50,000 agents generating actions per round. More importantly, raw conversation history is the wrong abstraction for persistent knowledge. You don't remember every sentence you've ever read. You remember distilled facts, emotional associations, and causal relationships.

ByteDance's M3-Agent solves exactly this.

## M3-Agent's Memory Architecture

M3-Agent (ICLR 2026) is a multimodal agent framework for long-term memory. Originally designed for AI companions that remember things about the people they interact with across sessions, but the architecture is general enough to map directly onto our use case.

Memory is organized as an **entity-centric multimodal graph database** with two distinct memory types that mirror human cognition.

**Episodic memory** stores specific events with full context. In the original M3-Agent paper, this is something like: "Alice picked up the coffee mug and said 'I can't go without this in the morning.'" For Divitae, this translates to: "On March 3, 2026, agent population consensus on TSLA shifted from 61% bullish to 44% bullish over 3 simulation rounds following injection of Q4 delivery numbers. Cascade originated from institutional-persona agents and propagated to retail-persona agents with a 1.4 round lag."

**Semantic memory** stores distilled, generalized knowledge extracted from accumulated episodes. In M3-Agent: "Alice prefers coffee in the morning." For Divitae, that becomes: "TSLA consensus is highly sensitive to delivery number surprises. Institutional agents lead retail agents in TSLA belief updates by approximately 1-2 rounds. Bearish cascades in TSLA propagate faster than bullish ones."

Memory nodes are entities (tickers, sectors, macro themes, agent archetypes) with edges encoding relationships. Each node carries:
- Temporal metadata (when was this knowledge formed, when was it last relevant)
- Confidence scores (how many episodes support this semantic memory)
- Multimodal fingerprints (in the original paper these are face embeddings and voiceprints; in our case they're embedding vectors for the narrative text associated with each entity)

## How We Integrated M3-Agent's Memory Into Divitae

This was far from straightforward, because M3-Agent was designed for a single agent observing a stream of video and audio while Divitae has 50,000 agents generating actions in parallel. Giving each agent its own M3-Agent memory graph would be computationally ruinous.

We went with a **hierarchical shared memory** architecture.

At the bottom, each agent maintains a short-term buffer (last 50 actions and observations) in its context window. Cheap and fast.

Above that, agents are grouped into clusters by archetype (institutional, retail, macro-focused, sector specialist, momentum trader, etc.). Each cluster shares a Zep-backed episodic memory store that persists across simulation runs. At the end of each simulation, a summarization pass extracts key episodic memories from the agent population and writes them to the cluster store.

At the top, a single shared semantic memory graph aggregates distilled knowledge from all clusters. This is where cross-simulation learning lives. Things like "the last three times oil crossed $90, energy sector consensus in the swarm peaked within 2 rounds and reversed within 5." Individual agents can query this graph during simulation.

We didn't use M3-Agent's model weights (trained on video understanding). What we took was the architecture: episodic/semantic split, entity-centric graph structure, RL-trained retrieval. Adapted for agent decision-making in a trading simulation context.

## Memorization vs. Control

M3-Agent splits processing into two parallel streams. The memorization stream runs in the background. Processes each simulation round's output, updates episodic memory, triggers semantic consolidation when enough episodes accumulate, maintains the entity graph. Never blocks the simulation.

The control stream drives agent behavior. When an agent needs to make a decision (react to a news injection, post a thesis, update its position), control queries the memory graph, reasons over what it finds, and produces an action.

The result is that v1.2 agent populations develop *priors*. A swarm that has run 30 simulations of tech earnings seasons has accumulated semantic memories about how those narratives typically evolve, which agent archetypes tend to be early/late, and what cascade patterns precede sustained moves vs. reversals. Factor models can't do this.

## P&L Impact (With Caveats)

Short evaluation period, noisy markets, take it with skepticism. But directionally, from running v1.2 in parallel with v1.1 over 6 weeks:

Swarm-generated signals have a 0.31 correlation with our existing factor signals. Enough to confirm they're picking up real dynamics, low enough to actually diversify.

The pre-event simulation forks gave us a better handle on conditional tail risk. Two Fed announcements in the evaluation period. In both cases the swarm correctly identified the asymmetry of potential outcomes, and position sizing limited drawdown relative to unconditional sizing.

The M3-Agent memory contribution: simulations with access to the persistent memory graph produced more stable consensus measures. Without memory, running the same simulation twice with the same seed data produces consensus that varies ±8-12% due to stochastic agent behavior. With the semantic graph providing priors, variance drops to ±3-5%. Priors act as a regularizer on swarm behavior.

## Open Concerns

The semantic memory graph encodes patterns from recent simulations. Regime change invalidates those patterns, and the memory priors become harmful instead of helpful. We have a decay mechanism (confidence scores erode over time), but the half-life tuning is arbitrary.

MiroFish agents are LLM-powered, which means their behavior is constrained by pretraining distribution. A genuinely novel macro regime that's poorly represented in the training data means the swarm produces confidently wrong consensus measures. Standard OOD problem wearing a swarm costume.

Cost is real. $40-60 per full simulation run in API calls (Qwen-plus), $800-1200/week with scenario forks. Manageable now, would not survive 10x instrument coverage.

The memory layer runs through Zep Cloud. Single point of failure with latency implications. Evaluating a self-hosted Neo4j replacement via `neo4j-graphrag-python`, trading operational complexity for control.

## Architecture (text diagram because I haven't made a real one)

```
Seed Data (news, earnings, options flow, social)
    │
    ▼
GraphRAG → Knowledge Graph (Zep Cloud)
    │
    ▼
Agent Population Synthesis (OASIS engine)
    │
    ├──── Agent-local ephemeral memory (context window)
    ├──── Cluster episodic store (Zep, persists across runs)
    └──── Global semantic graph (M3-Agent architecture)
    │
    ▼
Round-based Simulation (10k-50k agents, 20 rounds)
    │
    ├──── Variable injection (scenario forks)
    │
    ▼
Signal Extraction
    │
    ├── Consensus measures
    ├── Narrative velocity
    ├── Contrarian flags
    └── Cascade detection
    │
    ▼
Position Sizing & Risk Management (existing Divitae infra)
    │
    ▼
Execution Layer
```

## What's Next

v1.3 focuses on two things. First, replacing the Zep Cloud dependency with a self-hosted graph database. Second, *memory-conditioned agent evolution*, using the semantic memory graph not just to inform agent decisions within a simulation, but to modify agent persona parameters between simulations. If the memory graph has learned that momentum-trader agents are consistently wrong about biotech, future simulations should spawn momentum-trader agents with lower influence weights in the biotech sector. Meta-learning at the swarm level.

Markets are populations of heterogeneous agents with evolving beliefs, not statistical processes with stationary parameters. MiroFish gives us the simulation engine, and M3-Agent provides the memory layer. Together they produce signals that feel qualitatively different from anything I've gotten out of factor models.

*Research-stage system. Not investment advice. Still learning how to tune half of this.*
