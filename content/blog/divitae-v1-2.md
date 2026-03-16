---
title: "Divitae v1.2: Swarm Intelligence Meets Persistent Memory"
date: "2026-03-12"
excerpt: "Technical breakdown of how Divitae v1.2 integrates MiroFish's swarm simulation engine with ByteDance's M3-Agent memory architecture to build a trading system that remembers what 700,000 agents believed last Tuesday."
tags: ["Trading", "AI", "Systems", "Swarm Intelligence", "Agents"]
---

# Divitae v1.2: Swarm Intelligence Meets Persistent Memory

I wrote previously about building systematic trading systems and made the point that the interesting problem is not finding a strategy but building a machine for generating and evaluating strategies. Divitae is that machine. Version 1.2 represents a fairly significant architectural shift in how we handle signal generation and state management, so I want to document what changed and why.

The short version: we replaced our previous signal pipeline with a swarm simulation layer built on MiroFish and gave the entire system persistent, structured memory using ideas from ByteDance's M3-Agent. The long version is this entire post.

## The Problem With Traditional Signal Pipelines

Divitae v1.0 and v1.1 generated trading signals the standard way: a collection of factor models, each computing some feature of the market (momentum, mean reversion, volatility regime, cross-asset correlation shifts), feeding into a meta-model that combined them into position sizing recommendations. This works. It is also fundamentally limited in a way that took me a while to articulate precisely.

The limitation: factor models treat the market as a physical system to be measured. They compute statistics *about* price action. But markets are not physical systems. They are populations of agents making decisions based on beliefs, narratives, information cascades, and social dynamics. A momentum signal tells you that price has been going up. It tells you nothing about *why*, which means it tells you nothing about *when it will stop*.

The question that led to v1.2: what if, instead of computing statistics about the output of a complex adaptive system, we simulated the complex adaptive system directly?

## MiroFish as the Simulation Core

MiroFish is a swarm intelligence engine that deploys large populations of autonomous AI agents into simulated environments and observes emergent behavior. The pipeline has four stages that map cleanly onto the trading signal generation problem.

**Stage 1: Knowledge graph construction.** MiroFish ingests seed data — in our case, a combination of financial news feeds, earnings transcripts, Fed minutes, options flow data, and social media sentiment from fintwit — and constructs a structured knowledge graph via GraphRAG. The ontology generator automatically identifies entity types (companies, sectors, macro indicators, key people, policy instruments) and relationship types (supply chain dependencies, competitive dynamics, regulatory exposure). This isn't a bag-of-words approach. The graph preserves causal and relational structure.

**Stage 2: Agent population synthesis.** The knowledge graph nodes get converted into agent personas. Each agent has personality traits (risk appetite, time horizon, information sources they trust, behavioral biases), a backstory consistent with the graph topology, and independent decision-making logic. We run populations between 10,000 and 50,000 agents depending on the scenario. Each agent maintains its own memory and evolves its beliefs over the simulation.

**Stage 3: Round-based simulation.** MiroFish runs on the OASIS engine, which operates in discrete rounds (we map 1 round = 1 trading day). Agents interact on simulated social platforms — posting theses, reacting to news injections, building consensus or disagreement. The action space includes CREATE_POST, LIKE, REPOST, COMMENT, FOLLOW, and SEARCH. We added custom actions for our use case: PLACE_ORDER, ADJUST_POSITION, PUBLISH_RESEARCH.

**Stage 4: Emergent signal extraction.** This is where it gets interesting. Instead of asking "what does the price data say?", we ask "what does the agent population believe, and how is that belief distribution shifting?" We extract:

- **Consensus measures**: what fraction of the agent population is bullish/bearish on a given name, weighted by influence
- **Narrative velocity**: how fast a particular thesis is spreading through the population
- **Contrarian signals**: when the belief distribution becomes extremely skewed (>85% consensus), we flag potential reversal setups
- **Cascade detection**: identifying the early stages of information cascades before they reach mainstream agent adoption

The key insight: these signals are structurally different from technical indicators. A momentum signal says "price went up." A swarm consensus signal says "72% of simulated market participants believe price will go up, the belief is concentrated in short-horizon agents, and the thesis is spreading at 3.2x the baseline diffusion rate." The second one has dramatically more actionable information content.

## Variable Injection: Stress Testing Beliefs

One of MiroFish's best features for trading applications is dynamic variable injection mid-simulation. We use this for scenario analysis.

Before a Fed meeting, we fork the simulation into branches:

| Scenario | Injection | What we observe |
|----------|-----------|-----------------|
| Hawkish surprise | "Fed raises 50bp, signals further tightening" | How fast does bullish consensus collapse? Which agents capitulate first? |
| Dovish hold | "Fed holds, dovish language on inflation" | Does the existing bullish narrative accelerate or is it already priced? |
| Data shock | "CPI print 2x consensus" | Cascade dynamics — does the information spread uniformly or cluster? |

This gives us a probability-weighted distribution of market reactions *before the event happens*. Not a point estimate. Not a single factor loading. A full simulation of how heterogeneous agents would reorganize their beliefs under each scenario. We size positions based on the asymmetry between scenarios, not on a single prediction.

## The Memory Problem

The limitation that v1.1 ran into hard: MiroFish agents, by default, have memory that persists within a simulation run but not across runs. Each new simulation starts from a fresh population with no awareness of what previous simulations concluded.

This is a problem because financial markets are path-dependent. An agent population reasoning about NVIDIA earnings in March needs to "remember" how it reasoned about NVIDIA earnings in January. Not the raw data — the *interpretive context*. The narratives that were forming. The consensus that was building. The surprise signals that disrupted previous belief distributions.

Most agent frameworks handle memory by stuffing conversation history into the context window. This breaks down fast. A context window is bounded (even a 200k window fills up quickly when you have 50,000 agents generating actions per round). More importantly, raw conversation history is the wrong abstraction for persistent knowledge. You don't remember every sentence you've ever read. You remember distilled facts, emotional associations, and causal relationships.

This is exactly the problem ByteDance's M3-Agent solves.

## M3-Agent's Memory Architecture

M3-Agent was published at ICLR 2026 as a multimodal agent framework for long-term memory. The original application is AI companions that remember things about the people they interact with across sessions. The architecture is general enough that it maps directly onto our trading use case.

The core idea: memory is organized as an **entity-centric multimodal graph database** with two distinct memory types that mirror human cognition.

**Episodic memory** stores specific events with full context. In the original M3-Agent paper, this is something like: "Alice picked up the coffee mug and said 'I can't go without this in the morning.'" In Divitae, an episodic memory looks like: "On March 3, 2026, agent population consensus on TSLA shifted from 61% bullish to 44% bullish over 3 simulation rounds following injection of Q4 delivery numbers. Cascade originated from institutional-persona agents and propagated to retail-persona agents with a 1.4 round lag."

**Semantic memory** stores distilled, generalized knowledge extracted from accumulated episodes. In M3-Agent: "Alice prefers coffee in the morning." In Divitae: "TSLA consensus is highly sensitive to delivery number surprises. Institutional agents lead retail agents in TSLA belief updates by approximately 1-2 rounds. Bearish cascades in TSLA propagate faster than bullish ones."

The graph structure matters. Memory nodes are entities (tickers, sectors, macro themes, agent archetypes) with edges encoding relationships. Each node carries:
- Temporal metadata (when was this knowledge formed, when was it last relevant)
- Confidence scores (how many episodes support this semantic memory)
- Multimodal fingerprints (in the original paper these are face embeddings and voiceprints; in our case they're embedding vectors for the narrative text associated with each entity)

## How We Integrated M3-Agent's Memory Into Divitae

The integration is not trivial. M3-Agent was designed for a single agent observing a stream of video and audio. Divitae has 50,000 agents generating actions in parallel. Directly giving each agent its own M3-Agent memory graph would be computationally ruinous.

Our approach: a **hierarchical shared memory** architecture.

**Level 1: Agent-local ephemeral memory.** Each agent in the MiroFish swarm maintains a short-term memory buffer (last 50 actions and observations) in its context window. This is cheap and fast.

**Level 2: Cluster-level episodic store.** Agents are grouped into clusters by archetype (institutional, retail, macro-focused, sector specialist, momentum trader, etc.). Each cluster shares a Zep-backed episodic memory store that persists across simulation runs. At the end of each simulation, a summarization pass extracts key episodic memories from the agent population and writes them to the cluster store.

**Level 3: Global semantic graph.** A single, shared semantic memory graph aggregates distilled knowledge from all clusters. This is where cross-simulation learning lives. The semantic graph encodes things like "the last three times oil crossed $90, energy sector consensus in the swarm peaked within 2 rounds and reversed within 5." Individual agents can query this graph during simulation.

The M3-Agent contribution is primarily architectural: the episodic/semantic split, the entity-centric graph structure, and the RL-trained retrieval mechanism that decides what memories are relevant to a given context. We didn't use their exact model weights (those are trained on video understanding tasks), but we adapted the memory organization and the multi-turn iterative reasoning pattern for retrieving relevant memories during agent decision-making.

## The Memorization-Control Split

M3-Agent's architecture has two parallel processing streams — **memorization** and **control** — and this decomposition turned out to be exactly the right abstraction for our system.

The memorization stream runs continuously. It processes the output of each simulation round, updates episodic memory, triggers semantic memory consolidation when enough episodes accumulate, and maintains the entity graph. This is a background process. It does not block the simulation.

The control stream is what actually drives agent behavior during simulation. When an agent needs to make a decision (react to a news injection, decide whether to post a thesis, update its position), the control stream queries the memory graph for relevant memories, reasons over them, and produces an action.

The practical result: agent populations in Divitae v1.2 behave differently from v1.1 populations in a specific, measurable way. They develop *priors*. A swarm that has run 30 simulations of tech earnings seasons has accumulated semantic memories about how tech earnings narratives typically evolve, which agent archetypes tend to be early/late, and what cascade patterns precede sustained moves vs. reversals. This changes the signal quality in ways that are difficult to achieve with traditional factor models.

## What Actually Changed in the P&L

I am cautious about attributing performance to specific system changes because the evaluation period is short and markets are noisy. But the directional results from running v1.2 in parallel with v1.1 over the last 6 weeks:

**Signal decorrelation improved.** The swarm-generated signals have a correlation of 0.31 with our existing factor signals. This is close to the ideal range — high enough to confirm they're picking up real market dynamics, low enough to provide genuine diversification.

**Scenario-conditioned sizing reduced drawdowns.** The pre-event simulation forks give us a much better handle on conditional tail risk. We had two Fed announcements in the evaluation period. In both cases, the swarm simulation correctly identified the asymmetry of potential outcomes, and the resulting position sizing limited drawdown relative to what our unconditional sizing would have produced.

**Memory-driven priors improved signal stability.** This is the M3-Agent contribution. Simulations with access to the persistent memory graph produced more stable consensus measures across runs. Without memory, running the same simulation twice with the same seed data produces consensus measures that vary by ±8-12% due to stochastic agent behavior. With the semantic memory graph providing priors, variance drops to ±3-5%. The priors act as a regularizer on swarm behavior.

## What I'm Still Worried About

**Overfitting to recent regimes.** The semantic memory graph encodes patterns from recent simulations. If markets undergo a regime change that invalidates those patterns, the memory priors become harmful. We have a decay mechanism (memories lose confidence score over time), but the half-life tuning is largely arbitrary right now.

**Simulation fidelity.** MiroFish agents are LLM-powered. Their behavior is constrained by the LLM's training distribution. If the real market develops dynamics that are poorly represented in the LLM's pretraining data (a genuinely novel macro regime, for instance), the swarm simulation may produce confidently wrong consensus measures. This is the standard out-of-distribution problem, dressed up in swarm clothes.

**Computational cost.** Running 50,000 agents for 20 rounds with memory graph queries is not cheap. Each full simulation run costs roughly $40-60 in API calls (we're using Qwen-plus through the MiroFish default integration). Running the scenario forks multiplies this by the number of branches. We're spending $800-1200/week on simulation compute. This is manageable at our current scale but would not survive a 10x increase in the number of instruments we cover without significant optimization.

**Zep Cloud dependency.** The memory layer runs through Zep Cloud for both the knowledge graph and the episodic memory store. This is a single point of failure with latency implications. We are evaluating a self-hosted Neo4j replacement using the `neo4j-graphrag-python` package, which would give us better control over the memory layer at the cost of operational complexity.

## Architecture Diagram (In Words, Because I Haven't Made A Real One Yet)

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

v1.3 is going to focus on two things. First, replacing the Zep Cloud dependency with a self-hosted graph database. Second, implementing what I'm calling *memory-conditioned agent evolution* — using the semantic memory graph not just to inform agent decisions within a simulation, but to modify agent persona parameters between simulations. If the memory graph has learned that momentum-trader agents are consistently wrong about biotech, future simulations should spawn momentum-trader agents with lower influence weights in the biotech sector. This is a form of meta-learning at the swarm level, and it's the part I'm most excited about.

The broader thesis behind Divitae is that markets are best modeled as populations of heterogeneous agents with evolving beliefs, not as statistical processes with stationary parameters. MiroFish gives us the simulation engine. M3-Agent gives us the memory architecture. The combination is starting to produce signals that feel qualitatively different from anything I've built with traditional factor models.

*This describes the architecture of a research-stage trading system. It is not investment advice. I am still learning how to tune half of this.*
