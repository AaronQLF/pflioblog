---
title: "Building Systematic Trading Systems"
date: "2026-03-09"
excerpt: "Most people who build trading systems build them wrong. Not because the finance is hard, but because the engineering is harder than they expect."
tags: ["Trading", "Systems", "Engineering"]
---

# Building Systematic Trading Systems

Most introductory resources on algorithmic trading blur a distinction that matters: the difference between a trading strategy and a trading system.

A strategy is a decision rule. Given some state of the world, do X. A system is everything else: the infrastructure for acquiring and cleaning data, the execution layer, the risk management logic, the monitoring, the accounting, and the plumbing that connects all of it. Most people treat the strategy as the interesting part and the system as the boring scaffolding. This is backwards. The strategy is usually the easy part. The system is where most serious attempts fail.

## The data problem is worse than you think

Before you can backtest anything, you need data you can actually trust. This turns out to be a surprisingly difficult property to achieve.

The issues are well-documented but worth stating precisely. Survivorship bias: historical databases of equities tend to contain only companies that survived. If you backtest a strategy on the S&P 500 constituent list as it exists today, you are testing on a set that has already survived a selection process your strategy would have had to navigate in real time. Point-in-time correctness: corporate fundamentals, index memberships, and similar data get revised retroactively. A database that does not preserve what was known at each point in time will give your backtest access to information that did not exist when the trade would have been made. These errors are not edge cases. They are the default state of most data sources.

The practical consequence is that a significant fraction of apparent alpha in naive backtests is actually measurement error in the data. This fraction is large enough that it meaningfully changes how you should interpret results.

## Backtesting is a compression of reality that loses important things

Even with clean data, a backtest is a model of execution, not execution itself. The gap between these two things is where most strategy performance goes to die.

The obvious sources of slippage are price impact and bid-ask spreads. Less obvious but equally important: the latency between a signal and an order reaching the exchange, partial fills on limit orders, the fact that your backtest assumes you can trade at the closing price but your production system has to deal with a closing auction with its own dynamics.

The standard response to this is to add a transaction cost estimate and see if the strategy survives. This is necessary but not sufficient. Transaction costs are not a fixed tax on returns. They are a function of order size, market conditions, strategy turnover, and the specific execution algorithm you use. Estimating them as a flat bps figure is a convenient fiction.

The more principled approach is to model execution with enough fidelity that the backtest breaks in the same places real trading would break. This requires thinking carefully about market microstructure, which is its own area of expertise.

## The architecture of a production system

Assume you have a strategy you believe in and a backtest you trust. The production system has to do several things simultaneously: receive market data, compute signals, manage a portfolio of open positions, generate orders, route orders to an exchange or broker, track fills, update positions, and monitor everything for anomalies. These are not independent problems. They interact, and the interactions create failure modes that are difficult to anticipate.

A few things I have found to be true from building these systems:

**Idempotency matters more than people expect.** Your system will crash. Network connections will drop. The broker API will return an error at an inconvenient moment. When the system restarts, it needs to be able to reconstruct a consistent view of its own state from durable storage without creating duplicate orders or missing positions. Designing for this from the start is much easier than retrofitting it later.

People confuse latency with throughput, but they are different constraints. For most non-HFT strategies, the relevant constraint is not how fast you can process one event, but how reliably you process all events without falling behind. A system that handles individual events in microseconds but has a queue that can grow unboundedly under load is worse than a system that handles events in milliseconds with a bounded queue.

You also cannot ship without monitoring. In production, the only view you have into your system's behavior is through the monitoring you built. A system without good monitoring is one where problems are discovered through losses rather than through alerts. The question to ask about every component is: how would I know if this stopped working correctly?

## Risk management as a constraint, not a feature

Risk management is not a module you add to a trading system. It is a set of constraints that should be embedded throughout.

The framing I find useful: a trading system without risk management is not a system that takes on more risk, it is a system where the risk you are taking is not legible to you. You are taking on exactly as much risk as your positions and market conditions imply, whether or not you have computed it. The question is whether you know what it is.

Position sizing, drawdown limits, exposure constraints, and correlation monitoring are not conservative choices that reduce the upside of the system. They are the mechanism by which you ensure the system's behavior in bad states remains within a range you have planned for. A system that handles good states well but has no principled behavior in bad states is not a reliable system. Markets will find the bad state eventually.

## What actually makes a system work in the long run

The honest answer is that most systematic strategies have finite lifespans. A strategy is a bet that a particular inefficiency exists and persists. Markets are not static. Participants adapt, regulations change, the pool of capital chasing a given signal grows until the signal is arbitraged away.

The implication is that a sustainable trading operation is not built around a single strategy. It is built around the capacity to research, develop, and replace strategies at a rate that matches the rate of decay. This is a different kind of problem than finding a good strategy. It is an organizational and engineering problem. The system has to be modular enough that components can be swapped, strategies can be added and retired cleanly, and the infrastructure does not have to be rebuilt from scratch every time the trading logic changes.

I think this is the right way to think about systematic trading. Not "what is my strategy" but "how do I build a machine for generating and evaluating strategies, and how do I keep it running."

---

*Some of this reflects direct experience building small-scale systematic strategies. I am not a professional trader. Treat accordingly.*
