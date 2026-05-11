---

## title: "What I Choose to Ignore: Prioritization in an Industry That Will Not Hold Still"

date: "2026-05-11"
excerpt: "The volume of new tools, papers, frameworks, and announcements crossed the line of human-readable some time around 2023. Here is the system I actually use to decide what to read, what to build, and what to ignore on purpose."
tags: ["Engineering", "Career", "own exp"]

The thing nobody admits in engineering circles is that the volume of new tools, papers, frameworks, and announcements crossed the line of human-readable some time around 2023. Everyone I respect is, in some sense, faking it. They have a private filter. They do not write it down. They will not tell you what it is, because the filter sounds like advice for losing.

I want to write mine down. Not because it is correct in some general sense, but because the alternative I see most often, the implicit pretense that a serious engineer can stay current on everything, is producing burnt-out people who feel perpetually behind and are usually correct about feeling that way. The problem is not them. The problem is the premise.

## The two failure modes

There are two failure modes I have watched up close enough to take seriously.

The first is the trend chaser. Every weekend is the new framework. Every news cycle is a new stack to dabble in. The trend chaser has a permanent shallow lake of opinions about everything and a notable absence of any single thing they have built deeply. They are pleasant to talk to at conferences and underwhelming to work with on a real system, because depth turns out to be the thing that matters once a project is more than two weeks old.

The second is the anchored expert. Picked a stack in 2014, has not seriously revisited any assumption since. Knows their tooling cold. Has an opinion about emacs key bindings. Gets eaten alive every five to seven years by a shift they did not see coming, because they had long since stopped tracking what was happening outside their fenced-in area. The anchored expert is excellent in narrow domains and dangerous as a senior voice in a planning meeting, because their priors are weighted entirely by what was true a decade ago.

The temptation is to position oneself "between" these two, as if the answer is a careful mix. I do not think that is the right framing. The answer is to be ruthless about which axis you are optimizing on at any given time, and to know which axis the work in front of you actually needs.

## Two clocks, not one

The mental model that has been most useful for me is that there are two clocks running.

The first clock is the depth clock. It is about the small set of things I am genuinely building expertise in. The depth clock runs in years. It rewards repetition, struggle, mistakes that come back to bite you eighteen months later, and the kind of pattern recognition you only develop after watching a codebase evolve through three different teams.

The second clock is the breadth clock. It is about staying aware of the surface of the field. It runs in weeks or months. It does not reward depth. It rewards the ability to recognize a name when you hear it, know roughly what category a tool belongs to, and have a rough sense of which way the wind is currently blowing.

The mistake is treating these as one clock. They are not. The depth clock punishes context switching. The breadth clock rewards it. Trying to be deep on a wide front is the trend chaser. Trying to be wide on a deep front is the anchored expert. The actual move is to allocate honestly: most of my time on the depth clock, a small honest budget on the breadth clock, and zero pretense that the budget I spend on the breadth clock is producing anything other than awareness.

## What I actually read

I read primary sources. This is the single most leveraged change I have made.

Concretely: I read papers, not paper summaries. I read the GitHub repo's README and source, not the announcement blog post. I read the RFC, not the LinkedIn thread about the RFC. I read the official docs of a tool I am evaluating, not the medium article titled "5 reasons X is changing everything."

The reason is not that I am a purist. The reason is that secondary sources are a lossy compression of primary sources, optimized for engagement rather than accuracy, and the loss they introduce is exactly the loss of the details that would let me decide whether the thing matters. A paper summary will not tell me what the authors quietly conceded in section five. A framework announcement will not tell me which features are flagged experimental in the actual repo. The compression always cuts the part I needed.

The cost is that I read fewer things. I am okay with that. Reading three primary sources a week beats skimming thirty secondary sources, because the three give me information I can build on and the thirty give me a vague feeling of being informed that turns out to be useless when I sit down to actually design something.

I keep a very small list of people whose taste I trust as a filter on what is worth reading. Not aggregators. Not "top voices." Specific individuals who have produced work I respect and who have a consistent track record of pointing at things that turn out to matter. If three of them are talking about the same thing inside a few weeks, I look. If none of them are, I usually do not. This filter has worked better than any RSS reader I have ever set up.

## What I write to learn

This blog is the second half of the system. I write about things to find out whether I actually understand them.

This is not original. People have said it before me. But it is worth restating, because the version of "writing to learn" that gets repeated tends to undersell how brutal the test is. When I sit down to explain something in writing, with the constraint that someone competent will read it, the gaps in my understanding stop being negotiable. Hand-waving does not survive a paragraph. Vibes do not survive a code block. The act of writing forces a confrontation with the parts I do not know that I do not know, which are exactly the parts that bite me when I try to use the thing in production.

This works as a prioritization mechanism too. If I cannot write about a topic without getting bored or getting stuck on the same paragraph for an hour, that is a signal. Either the topic is not actually important to me, in which case I was investing in it for FOMO reasons, or my understanding is not where I thought it was, in which case I should know that before I rely on the topic in a real decision.

The blog is also a public commitment that I have actually engaged with a thing. I cannot bluff my way through a written post the way I can bluff my way through a conversation, because the post sits there and can be checked. That asymmetry is uncomfortable in a useful way.

## The heuristics I run on a new thing

When something new lands in my window, the actual filtering is done by a short list of questions. None of them are clever.

First question: will this matter in eighteen months. This is a deliberately uncomfortable timeline. Six months is too short to filter much of anything, because nearly everything is still around in six months. Five years is too long to be useful as a prediction. Eighteen months hits the sweet spot where most hype cycles have already collapsed and most genuinely durable things have already accumulated real adopters. If I cannot articulate a reason this thing will still be load-bearing for someone in eighteen months, I downgrade it.

Second question: can I explain what this is without using the marketing word. If the only way I can describe a tool is by repeating its own positioning back to myself, I do not understand it well enough to have an opinion on whether it matters. If I can describe it in plain mechanical terms, "this is a content-addressed store with FastCDC chunking," then I can evaluate it against alternatives, including the alternative of doing nothing.

Third question: is the primary source readable. If a thing's docs are vague, if its repo is a mess, if its paper is unreviewable, that is information. It does not mean the idea is wrong, but it means the idea is not yet executed to the point where I should invest time in it. Real things are documented well by the people who built them. Pre-real things are documented by the people who are hyping them.

Fourth question: how many of the few people whose taste I trust have engaged with this in writing. Not retweeted it, not casually mentioned it, but actually written something serious about it. If the answer is zero across a group of maybe eight to ten people, the thing is almost always either too early to matter or already pricing in to a bubble. Either way I have better uses of my time.

These four questions filter a lot. Most things do not survive them. I am okay with that, because the things that do survive get my actual attention rather than a fragment of it.

## Prioritization inside a job

Industry tracking is one half of the question. Day-to-day engineering prioritization is the other, and it has its own pathologies.

The most common one I see is treating "urgent" and "foundational" as the same axis. They are not. An urgent ticket is something that will hurt now if you do not fix it. A foundational decision is something that will hurt much more later if you do not get it right. They produce identical pressure to act, and they decay completely differently. Urgent things decay fast. Foundational things compound.

The practical implication is that I now read priority labels with a question attached: is this P0 because the world will burn in two days if I do not ship, or is this P0 because the cost of getting it wrong scales with how long we run on the wrong shape. Those are completely different things and they deserve different responses. The first one I drop everything for. The second one I treat as a design problem and refuse to rush, because rushing a foundational decision is the most expensive thing I can do in a given quarter.

The second pathology is the tyranny of the recent ticket. The most recently filed ticket has a structural advantage in mindshare. It is visible. It is being discussed. It feels relevant. None of that has anything to do with whether it should be the next thing I work on. The cure is unsentimental: actually look at the backlog, not just the inbox. Most of the things I should be working on filed themselves into the backlog three months ago and have been quietly compounding ever since.

The third pathology is context switching. A real engineering culture should be hostile to context switching in a way that is sometimes mistaken for inflexibility. The cost of switching is not the time it takes to load the new context. The cost is the depth I never reach on the original problem because I keep getting yanked off it. Two weeks of uninterrupted work on a hard problem is not equivalent to ten weeks of interrupted work on the same problem. It is qualitatively different. The interrupted version often does not converge at all.

## The compounding argument

The deepest reason I take prioritization this seriously is that the cost of getting it wrong compounds, and the cost of being slightly out of date does not.

If I spend a year going deep on the wrong problem, I have not just lost a year. I have also calcified mental models that will bias my next decisions, missed the window to build expertise in something that mattered, and accumulated sunk cost that will make it harder to pivot. The downstream effects of that year are large and they do not show up cleanly in any one quarter.

If I spend a year being slightly behind on the new framework everyone is excited about, the downside is that I have to spend a week catching up when it eventually becomes relevant. That is a manageable cost. It is, in most cases, the right cost to pay, because the alternative is allocating that time against my depth clock, where the compounding is happening in the other direction.

This is the asymmetry that makes ignoring things rational. Depth compounds. Breadth does not, or does so much more weakly. A decade of running the depth clock seriously produces an engineer who is genuinely useful in a way that a decade of running the breadth clock seriously does not.

## What I am not claiming

I am not claiming this is universal. There are roles where breadth is the job. Developer advocates, technical journalists, certain kinds of consulting work. For them, the breadth clock is the depth clock, and most of what I have written above is inverted. I am not writing for them.

I am also not claiming I have this fully figured out. I get the four questions wrong about a third of the time. I have a few notable instances of going deep on a thing that turned out to be a dead end, and a smaller number of instances of dismissing a thing that turned out to matter. The point is not to be right every time. The point is to have a system at all, so that the errors are recoverable and the wins compound.

The alternative, in my experience, is not running on intuition. The alternative is running on the ambient anxiety of the field, which is a system optimized for engagement, not for your career.