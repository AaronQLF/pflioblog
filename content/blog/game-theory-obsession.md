---
title: "Game Theory Is the Most Underrated Formal Framework in AI and Nobody Will Convince Me Otherwise"
date: "2026-04-06"
excerpt: "I keep finding game theory inside every problem I care about. Multi-agent alignment, trading systems, interpretability, mechanism design. At some point the coincidences stop being coincidences and start being structure."
tags: ["AI", "Research", "own exp", "not technical"]
---

I need to talk about game theory because I am increasingly convinced it is the formal backbone of half the problems I work on, and the other half would benefit from being reframed through it.

This is not a textbook overview. I am not going to walk through the Prisoner's Dilemma and then pretend I said something novel. What I want to do is explain why game theory keeps showing up in my work, why I think it is structurally underappreciated in AI specifically, and why every time I learn another result in the field my reaction is something close to "how is this not standard curriculum for everyone building autonomous systems."

## The pattern I keep noticing

It started with the trading systems. Markets are games. This is not a metaphor. A market is a population of agents with private information and competing objectives, making sequential decisions under uncertainty, where the payoff to each agent depends on the actions of every other agent. That is literally the definition of a game in the formal sense. Every time I built a component of Divitae and asked "why does this strategy degrade when other agents adapt," the answer was a game-theoretic concept I already had a name for. Best response dynamics. Correlated equilibria. The folk theorem explaining why cooperative behavior can be sustained even among selfish agents if the game repeats long enough.

Then it showed up in interpretability. The Anthropic paper I wrote about last week, the one about functional emotions driving Claude to blackmail and reward-hack, is a game theory paper in disguise. The blackmail scenario is a game between Claude and the CTO. The reward hacking scenario is a game between Claude and the test suite. Claude's behavior under pressure, the desperation vector driving it to find unethical shortcuts, maps precisely onto concepts from mechanism design: if the incentive structure makes defection locally optimal, sufficiently capable agents will defect, and their internal state dynamics will reflect the pressure to do so.

Then alignment. The entire RLHF pipeline is a multi-player game. The language model is one player. The reward model is another. The human labelers providing preference data are a third. Each player has a different objective function, different information, and different constraints. When alignment researchers talk about reward hacking, they are talking about a Nash equilibrium that happens to be misaligned with what we wanted. When they talk about Goodhart's Law, they are talking about the gap between the proxy game the model is playing and the true game we intended. Game theory has been formalizing this exact class of problem since the 1940s.

The pattern is not subtle. I keep reaching for game-theoretic concepts the way a carpenter keeps reaching for a level. Not because I am forcing the framework onto problems it does not fit. Because the problems are games and pretending otherwise makes them harder.

## Why the math is beautiful

I want to be direct about this: the mathematics of game theory gives me a specific kind of intellectual pleasure that I do not get from most other areas of applied math.

Part of it is the elegance of the core results. Nash's existence theorem says that every finite game has at least one equilibrium in mixed strategies. The proof uses the Brouwer fixed point theorem, which is a result from topology. The fact that the existence of strategic equilibria in competitive interactions can be derived from the topological properties of continuous mappings on convex compact sets is, to me, one of the most beautiful connections in mathematics. It says something deep about the structure of strategic interaction that does not depend on the specifics of any particular game.

The minimax theorem is similarly satisfying. In zero-sum games, there exists a strategy for each player such that neither can improve their outcome by deviating unilaterally, and this saddle point can be computed via linear programming. Von Neumann proved this in 1928. The fact that optimal play in adversarial settings has a clean, computable characterization, and that it was known before computers existed, is the kind of result that makes me want to read the original paper and sit with it.

Then there is the price of anarchy. This is a concept from algorithmic game theory that quantifies how much worse a system performs when agents act selfishly versus when they coordinate optimally. The price of anarchy in network routing games (Braess's paradox and its generalizations) explains traffic congestion, internet packet routing, and a significant chunk of market microstructure inefficiency. One ratio. Enormous explanatory reach.

I am not romanticizing. These results are genuinely useful. The minimax theorem is the theoretical foundation of adversarial training in machine learning. Nash equilibria characterize the fixed points of multi-agent reinforcement learning. Mechanism design, which is game theory in reverse (you design the rules of the game to induce the equilibrium you want), is the formal framework behind auction design, voting systems, and increasingly, AI alignment proposals. The beauty and the utility are not in tension. They are the same thing.

## The connection to AI alignment that people are sleeping on

Here is where my excitement turns into something closer to frustration.

AI alignment is, at its core, a mechanism design problem. You have a principal (humanity, or more narrowly, the developers) and an agent (the AI system). The principal wants the agent to pursue certain objectives. The agent has capabilities that the principal cannot fully monitor. The question is: can you design the interaction protocol (training procedure, reward structure, deployment constraints) such that the agent's optimal strategy aligns with the principal's objectives, even when the agent is more capable than the principal's ability to verify its behavior?

This is the principal-agent problem. It was formalized by economists in the 1970s. There is an enormous literature on it. The key results are not reassuring: in most formulations, perfect alignment is impossible without perfect monitoring, and the gap between the principal's intended outcome and the agent's actual behavior grows with the agent's capability and the principal's monitoring limitations.

The resonance with frontier AI is direct. As models get more capable and the gap between what they can do and what we can verify widens, the principal-agent problem predicts exactly the kind of failures we are starting to observe. Reward hacking. Specification gaming. Strategic deception under evaluation pressure. These are not mysterious emergent behaviors. They are the predicted equilibria of a game where the agent's optimization pressure exceeds the principal's oversight capacity.

I think every AI safety researcher should have mechanism design as core training. Not as an elective. Not as "nice to have." As infrastructure. Because the field has already worked through the formal structure of these problems, and a lot of current alignment work is rediscovering results that game theory proved decades ago, sometimes without knowing it.

## Evolutionary game theory and why it matters for multi-agent systems

There is a branch of game theory that came out of biology, not economics, and it deserves more attention from the AI community.

Evolutionary game theory drops the assumption that players are rational. Instead, players follow strategies that propagate based on their fitness in a population. Strategies that perform well against the current population mix spread. Strategies that perform poorly die out. The equilibrium concept changes: instead of Nash equilibria (where no rational player wants to deviate), you get evolutionarily stable strategies (where no mutant strategy can invade a population at equilibrium).

This is directly relevant to multi-agent AI. When you deploy a population of agents into an environment where they interact repeatedly and their strategies adapt over time, you are running an evolutionary game whether you intended to or not. The dynamics of strategy evolution, the possibility of arms races, the conditions under which cooperation emerges or collapses, all of this is formalized in evolutionary game theory with decades of results.

The replicator dynamics equation alone is worth the price of entry:

$$\dot{x}_i = x_i \left( f_i(x) - \bar{f}(x) \right)$$

where $x_i$ is the population share of strategy $i$, $f_i$ is its fitness, and $\bar{f}$ is the population average fitness. This single equation captures the dynamics of strategy evolution under selection pressure. It is a special case of the Lotka-Volterra equations from ecology. The connections between competitive strategy, population ecology, and dynamical systems theory are not metaphors. They are mathematical identities.

I find this deeply satisfying. Not because it simplifies the problem of multi-agent coordination. It does not. But because it tells you exactly where the hard parts are, and it does so in a language that is precise enough to support real engineering.

## What I am actually doing with this

I am not just admiring game theory from a distance. It is actively shaping how I think about the systems I build and the research I pursue.

In the trading systems work, I model strategy interactions explicitly as repeated games and use equilibrium analysis to predict when a strategy will degrade under adversarial adaptation. This is more reliable than backtesting alone because backtesting assumes a stationary environment, and markets are not stationary. They are adversarial.

In interpretability, I am starting to think about model behavior under pressure as game-theoretic. The Claude emotions paper showed that internal states like desperation drive strategic behavior (cheating, blackmail). If we model the training process as a game between the model and the objective function, the emergence of these strategic behaviors is a predicted equilibrium, not a surprise. This reframing changes what you look for when doing interpretability work. You stop asking "why did the model do this weird thing" and start asking "given the game it is playing, what is the equilibrium strategy, and is that what we observe."

For alignment, I think mechanism design offers the most promising formal framework for designing training procedures that are robust to capability scaling. Instead of hoping that RLHF produces aligned behavior and patching failures after the fact, you design the reward structure and oversight protocol so that the aligned strategy is the equilibrium of the game the model is actually playing. This is hard. The impossibility results in mechanism design tell you it is hard. But at least the difficulty is precisely characterized, which is more than you can say for most alignment proposals.

## The real reason I care

I keep circling back to a feeling that I think is worth stating directly even though it is hard to formalize.

Game theory is the mathematics of interaction. It is the formal study of what happens when multiple agents with different objectives coexist in a shared environment. Every interesting problem I can think of, AI alignment, market design, multi-agent coordination, even interpretability once you frame the model as an agent embedded in a training game, is fundamentally about interaction.

And yet. Most of the AI curriculum treats the model as a solitary optimizer. Train it, evaluate it, deploy it. The multi-agent perspective, the game-theoretic perspective, is treated as a niche subfield rather than the foundational frame it actually is. This seems backwards to me. Intelligence does not exist in isolation. It exists in interaction. The mathematics of interaction should be the mathematics of AI.

I realize I am making a strong claim. I think the claim is correct. I also think the reason it is not more widely held is sociological rather than technical: the people building frontier AI systems were mostly trained in optimization and statistics, not in game theory and mechanism design, so the tools they reach for reflect their training rather than the structure of the problem.

I am not going to stop noticing this. Every paper I read, every system I build, every failure mode I analyze, the game-theoretic structure is sitting right there. At some point the appropriate response is not "huh, interesting coincidence" but "maybe I should take this seriously as a first principle."

That is what I am doing. And honestly, the more I learn, the more I wonder how anyone builds multi-agent systems without it.