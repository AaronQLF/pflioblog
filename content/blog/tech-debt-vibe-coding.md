---
title: "The Quiet Catastrophe: Tech Debt from Vibe Coding"
date: "2026-03-27"
excerpt: "My reflection on the slow, compounding damage of AI-assisted development without understanding, from someone who's seen it as an engineer and a team lead."
tags: ["Engineering", "AI", "Tech Debt", "Software Quality", "Vibe Coding", "Opinion"]
---

# The Quiet Catastrophe: Tech Debt from Vibe Coding

I need to start with a disclaimer, because without it the rest of this essay will read wrong. I am not writing this from a place of superiority. I don't think I'm special. I've been called a "10x engineer" a few times, mostly by managers who wanted to justify not hiring more people, and every time it made me uncomfortable because the label implies a kind of solitary genius that doesn't exist in real software engineering. What I am is someone who's been doing this long enough, across enough contexts, to have developed a deep allergy to certain patterns. I lead a team. I've written terrible code. I've shipped bugs that cost real money. I am not above any of this. But I've been watching something happen over the last eighteen months that I think we need to talk about honestly, even if it makes people defensive.

I want to talk about vibe coding, and the tech debt it leaves behind.

## What Vibe Coding Actually Is

The term "vibe coding" was popularized in early 2025, and it describes a style of development where you lean heavily on AI coding assistants (Cursor, Copilot, Claude, GPT, whatever) to generate code based on high-level natural language prompts, and then you accept that code without deeply understanding every line it produces. The "vibe" part is the key: you describe the vibe of what you want, the AI gives you something that looks right, you run it, it works, you move on.

I want to be careful here. Using AI tools to write code is not inherently bad. I use them constantly. They're extraordinary for boilerplate, for exploring unfamiliar APIs, for generating test scaffolding, for that moment when you know exactly what you want but can't be bothered to type out the forty lines of ceremony that your framework demands. That's not what I'm talking about.

What I'm talking about is the mode of development where the human in the loop has abdicated the role of understanding the code they're shipping. Where the feedback loop is: prompt, generate, run, does it work?, ship. Where the developer's relationship to the codebase is that of a director giving notes to an actor, rather than an author writing prose they can defend word by word.

This distinction matters enormously. And the tech debt it produces is unlike anything I've seen in almost ten years of writing software (I'm getting old :( ).

## The Seduction

I get it. I genuinely do. Vibe coding feels incredible. You sit down with a problem, you describe it in plain English, and forty seconds later you have a working implementation. The dopamine hit is real. The velocity is intoxicating. You can build in an afternoon what used to take a week. Product managers are thrilled. Demos look great. Your commit graph is a wall of green.

And for prototypes, for hackathons, for throwaway scripts, for that internal tool that three people will use for six months, it's legitimately wonderful. I've vibe-coded entire proof-of-concept applications and felt zero guilt about it, because the context justified the approach. When the expected lifespan of the code is shorter than the time it would take to properly architect it, you should absolutely optimize for speed.

The problem starts when vibe-coded artifacts don't stay in the prototype phase. The problem starts when that "quick demo" becomes the production system. When that throwaway script becomes the data pipeline. When the intern's weekend project becomes the customer-facing feature. This is not a new dynamic (the history of software is littered with prototypes that accidentally became products) but vibe coding has accelerated it by an order of magnitude, because the prototypes are so much more convincing now. They look complete. They handle edge cases (sometimes). They have error messages. They have loading states. The surface area of apparent quality has expanded dramatically, while the depth of actual quality has, in many cases, collapsed.

## A Taxonomy of Vibe-Coded Tech Debt

I've been cataloguing the specific patterns of tech debt that vibe coding produces, because I think they're genuinely different from traditional tech debt. Traditional tech debt usually comes from conscious tradeoffs: "we know this isn't ideal, but we need to ship by Friday." Vibe-coded tech debt is different. It comes from a lack of awareness that a tradeoff was even made.

### 1. Cargo-Culted Patterns

AI models generate code based on statistical patterns in their training data. They reach for common patterns, patterns that were common because they appeared in a lot of training data, not necessarily because they were good. I've seen vibe-coded Express.js applications that import and configure seventeen middleware packages because that's what a "complete" Express app looks like in the training distribution, even when the application in question is a simple CRUD API that needs maybe three of them.

The developer didn't choose these patterns. They didn't weigh the tradeoffs. They didn't ask "do I need helmet.js for an internal API that sits behind a VPN?" The code was generated, it worked, it shipped. And now there are seventeen dependencies in the dependency tree, each with their own update cadence, their own CVE surface, their own behavioral assumptions. The codebase has opinions that nobody in the organization actually holds.

This is a specific and insidious form of tech debt because it's invisible to anyone doing a surface-level code review. The code looks professional. It follows conventions. It's the kind of code a senior engineer might write, if that senior engineer were solving a different problem than the one actually at hand.

### 2. The Abstraction Graveyard

Vibe-coded systems accumulate abstractions that serve no purpose. I reviewed a codebase last month that had a full repository pattern, a service layer, a DTO mapping layer, and a controller layer, for an application with exactly two database tables and four API endpoints. Each layer faithfully delegated to the next. The repository called the ORM. The service called the repository. The controller called the service. The DTOs mapped fields with identical names from one object to another.

Nobody decided this architecture was appropriate for the problem. The AI generated it because enterprise Java codebases in the training data look like this, and the developer's prompt was something like "create a well-structured API." The cost is enormous: every feature change requires modifications in four files instead of one. Every new endpoint requires four new files. The cognitive overhead for new team members is quadrupled. And the abstractions provide no actual value. There's no place where the service layer does meaningful business logic independent of the data access, no place where the DTO mapping transforms data in a useful way. It's ceremony without purpose.

I call this the Abstraction Graveyard: layers of indirection where no real decision-making happens. It's the architectural equivalent of those corporate org charts where every message passes through six people who add nothing to it.

### 3. The Frankenstein Problem

This one is the most common and the most damaging. When you vibe-code iteratively ("add authentication," "now add rate limiting," "now add caching," "now add WebSocket support") each addition is generated somewhat independently. The AI doesn't hold a complete mental model of the system. It solves each request locally, often by bolting on new code that interacts with the existing code through the narrowest possible interface.

The result is a system that works but has no coherent architecture. The authentication middleware writes to a session store that the caching layer doesn't know about. The rate limiter uses an in-memory counter that resets on deploy, which made sense when it was the only state, but now coexists awkwardly with a Redis instance that the caching layer introduced. The WebSocket upgrade handler duplicates half the authentication logic because the AI couldn't easily thread through the existing middleware chain.

I've seen this pattern produce codebases where making a change in one area triggers subtle failures in three others, not because the code is tightly coupled in a way that anyone designed, but because it's accidentally coupled through shared state, implicit ordering dependencies, and duplicated logic that has drifted apart over time.

### 4. The Testing Void

This is maybe the most predictable and yet the most consequential pattern. Vibe-coded applications are systematically under-tested. Not because AI can't write tests (it's actually decent at generating test scaffolding) but because the developer's relationship to the code makes testing feel pointless. If you don't understand the implementation deeply enough to know what the edge cases are, you can't write meaningful tests. You can ask the AI to "write tests for this," and it will generate tests that exercise the happy path and maybe a few obvious error cases, but it won't generate the test that catches the race condition in your session handling, or the test that verifies your cache invalidation logic handles the case where the database write succeeds but the cache delete fails.

The tests that matter most are the tests that encode the developer's understanding of what could go wrong. Without that understanding, you get test suites that provide coverage metrics without providing confidence. I've seen codebases with 80% line coverage where the team was still terrified to deploy, because the tests were all tautological. They verified that the code did what the code did, without verifying that what the code did was correct.

### 5. Dependency Roulette

AI models love dependencies. They've been trained on code that uses popular libraries, so they reach for libraries as a first instinct. I've seen vibe-coded projects with 200+ npm dependencies for applications that could be built with 20. Each unnecessary dependency is a vector for supply chain attacks, a source of version conflicts, a thing that can break when you upgrade Node versions, a license you need to audit.

But the deeper problem is that the developer often doesn't know what the dependency does internally. They can't evaluate whether it's well-maintained. They can't assess whether its approach to the problem is appropriate for their context. They just know that when the AI suggested `fancy-date-parser` and they installed it, the dates started displaying correctly. They have no idea that `fancy-date-parser` pulls in a 400KB locale database that they don't need, or that it has a known issue with timezone handling that will bite them the first time they deploy to a server that isn't in UTC.

## The Team Lead's Perspective

I want to shift gears here and talk about what this looks like from the perspective of someone who manages a team, because the individual-level effects compound in ways that are genuinely alarming at the team level.

### The Knowledge Distribution Problem

On a healthy engineering team, knowledge of the codebase is distributed across the team. Different people understand different parts deeply, and there's enough overlap that the team can handle attrition, vacations, and context-switching. Code review is the primary mechanism for knowledge distribution: when I review your PR, I learn about the area of the code you changed. When you review mine, the reverse happens.

Vibe coding breaks this mechanism. When I review a PR that was vibe-coded, the author often can't answer my questions about the implementation. "Why did you use a recursive approach here instead of iterative?" "I don't know, that's what it generated." "Why is this error caught and silently swallowed?" "I didn't notice that, I'll ask it to fix it." The review becomes a one-sided audit rather than a collaborative conversation. I can catch bugs and style issues, but I can't transfer knowledge to the author, because the author doesn't have knowledge to anchor the new information to.

Over time, this produces a team where nobody deeply understands the system. Individual engineers understand the prompts they gave and the features they shipped, but the connective tissue (the architectural decisions, the implicit invariants, the "why" behind the "what") lives nowhere. It's not in anyone's head. It's not in the commit messages (which often just say "add feature X" without explaining the approach). It's not in documentation (because the developers couldn't document decisions they didn't consciously make). The codebase becomes an orphan. It works, but nobody can explain why, and nobody can predict what will happen when you change it.

### The Debugging Asymmetry

I keep seeing the same thing: a vibe-coded feature ships, works fine for three weeks, then breaks in production under a specific set of conditions. The developer who wrote it is assigned the bug. They stare at the code. They don't recognize it, not really. They know they generated it, but they never built a mental model of how it works. So they do the only thing they can: they paste the error into their AI assistant and ask it to fix the bug.

The AI generates a fix. Sometimes the fix is correct. Sometimes it fixes the symptom but introduces a new, subtler bug. Sometimes it "fixes" the problem by adding a try-catch that swallows the exception, making the error invisible rather than absent. The developer, lacking the understanding to evaluate the fix, accepts it and moves on. The codebase accumulates layers of patches, each one generated without understanding, each one potentially hiding rather than solving the underlying problem.

This is debugging theater. It looks like debugging (there's a bug, someone works on it, a fix is deployed) but the actual activity is fundamentally different from real debugging. Real debugging requires building a mental model of the system, forming hypotheses, testing them systematically, and ultimately understanding the root cause well enough to fix it with confidence. Vibe debugging is just another round of prompt-and-pray.

### The Velocity Illusion

The most dangerous thing about vibe coding, from a team lead's perspective, is that it looks like high velocity. The sprint metrics are great. Stories are closing. Features are shipping. The burndown chart burns down. Every sprint review is full of demos. The product org is thrilled.

But the velocity is an illusion, because it's borrowing from the future. Every vibe-coded feature that ships without deep understanding is a withdrawal from the codebase's future maintainability. The interest rate on this debt is high, and it compounds. Six months in, the team starts slowing down. Changes that should take hours take days, because the codebase is a maze of generated code that nobody understands. Bug reports start coming in faster than they're resolved, because each fix risks introducing new issues. The team starts avoiding certain areas of the code entirely, building workarounds rather than fixing the root cause, because the root cause is buried in code that nobody wrote and nobody understands.

I've watched this happen to three teams now. The trajectory is remarkably consistent. Months one through three: incredible velocity. Months four through six: gradually slowing, growing unease, first serious production incidents. Months seven through nine: near-total paralysis, conversations about rewriting from scratch, finger-pointing about who let the codebase get this bad. It's a slow-motion car crash, and the frustrating part is that the metrics looked great right up until they didn't. The uncomfortable truth that nobody wants to hear during those first three months is that vibe coding doesn't make you a 10x engineer. It makes you a 1x engineer driving the technical debt to 10x.

## The Compounding Problem

Tech debt from vibe coding compounds in ways that traditional tech debt doesn't. Traditional tech debt is usually localized: you took a shortcut in the payment processing module, and eventually you'll need to go back and clean it up. You know where the debt is. You know what the tradeoff was. You can plan for it.

Vibe-coded tech debt is diffuse. It's everywhere and nowhere. It's not a specific shortcut in a specific module, it's a pervasive lack of understanding across the entire codebase. You can't put it on a roadmap, because it's not a discrete item to address. It's more like an autoimmune disorder than a broken bone: the problem is systemic, and it manifests differently every time.

The compounding effect works through several channels. As the codebase grows, the probability of any new AI-generated code conflicting with existing AI-generated code increases. The AI doesn't have a deep model of your specific system's invariants, so it can easily generate code that violates an assumption made by code it generated three months ago. Then there's team turnover (and teams always turn over)—the new members have even less context than the original vibe coders, because at least the original developers knew what prompts they used. The new people just see a pile of code with no discernible rationale. On top of that, the patches and fixes that accumulate over time form their own layer of sediment, each one a local fix that may or may not be consistent with the other local fixes around it.

I've started calling this phenomenon "the entropy ceiling." Every codebase has a natural level of entropy, a certain amount of inconsistency, dead code, suboptimal patterns that exist because the cost of fixing them exceeds the benefit. Healthy codebases keep their entropy below a manageable threshold through refactoring, code review, and institutional knowledge. Vibe-coded codebases hit the entropy ceiling much faster, because the mechanisms that normally keep entropy in check (developer understanding, intentional design decisions, meaningful code review) are weakened or absent.

## What We Should Do Instead

I don't have a clean five-point plan for fixing this. Anyone who does is selling something. But I have a few principles that I've found helpful, both for my own work and for the teams I lead.

**Understand before you accept.** This is the big one. When the AI generates code, read it. Not skim it, read it. Ask yourself: could I have written this? Could I explain this to a colleague? Could I debug this at 2 AM when it breaks in production? If the answer to any of these is no, you need to spend time understanding it before you merge it. Yes, this slows you down. That's the point. The speed was illusory.

**Use AI for acceleration, not generation.** The best way I've found to use AI coding tools is as an amplifier for my own understanding, not a replacement for it. I use them to generate boilerplate that I've already decided on architecturally. I use them to explore approaches I'm considering ("show me what this would look like with an event-driven approach") as a way of evaluating options faster. I use them to write the tedious parts of code where the decisions have already been made and the remaining work is just typing. I don't use them to make architectural decisions for me.

Investing in the boring stuff matters now more than ever. Documentation. Architecture decision records. Meaningful commit messages. Code review where the reviewer actually asks "why?" and the author actually answers. These are the practices that keep institutional knowledge alive, and they're more important than ever in a world where code can be generated faster than it can be understood.

It helps to set team norms explicitly, too. On my team, we have a rule: if you used AI to generate a significant piece of code, you need to be able to explain it in the PR description. Not "AI generated this," actually explain the approach, the tradeoffs, the alternatives you considered. If you can't do that, you're not ready to ship it. This single norm has done more to improve our code quality than any linting rule or CI check.

**Embrace slower, more intentional development when it matters.** Not everything needs to be fast. The features that touch your core domain logic, your data model, your security boundaries, these deserve careful, human-driven development. Save the vibe coding for the admin dashboard, the internal tooling, the one-off migration script. Know when to use which mode, and be honest with yourself about which mode you're actually in.

## The Road Ahead

I'm genuinely optimistic about AI-assisted development. The tools are getting better at an astonishing rate. Future models will have longer context windows, better understanding of codebases as a whole, better ability to maintain consistency across a large system. Some of the problems I've described will be mitigated by better tools.

But I don't think tools alone will solve the fundamental problem, which is a human one. The decision to understand or not understand the code you ship is a human decision. The discipline to slow down when the tools make speed easy is a human discipline. The judgment to know when vibe coding is appropriate and when it isn't is human judgment.

We are in a transitional period where our tools have outpaced our practices. We can generate code faster than we can develop the institutional practices, team norms, and individual disciplines needed to use that capability responsibly. That gap is the source of the tech debt crisis I've described, and closing it requires work that no AI can do for us: the work of deciding what kind of engineers we want to be, and what kind of codebases we want to leave behind.

The best engineers I know, the ones who actually deserve labels like "10x" far more than I do, are the ones who use AI tools extensively while maintaining a deep, personal understanding of every system they're responsible for. They move fast, but they move fast because they understand deeply, not because they've outsourced understanding. That's the standard I aspire to. It's the standard I try to hold my team to. And it's the standard I think the industry needs to converge on, before the mountain of vibe-coded tech debt becomes truly unmanageable.

If you've read this far, all the way through this entire sprawling thing, then you're probably the kind of person who actually cares about this stuff, and I appreciate that more than you know. You probably also deserve a break, so here's something completely unrelated: today is my girlfriend Anna's birthday, and the fact that I spent part of her birthday morning writing five thousand words about tech debt instead of being around her and making breakfast is probably evidence that I'm not as well-adjusted as this essay might have you believe. Happy birthday, Anna. You deserve better than someone who writes essays about code quality on your special day, but here we are. P.S. see you tonight :)

The broader story of this moment in software engineering isn't really about AI at all. It's about the perennial tension between speed and understanding, shipping and craftsmanship, what's possible and what's sustainable. Every generation of tools has shifted the balance, and every time, the industry has had to develop new practices to restore it. We'll do it again. We always do. But the cost of the adjustment period, measured in production outages, in burned-out engineers debugging code they don't understand, in products that slowly decay under the weight of their own accidental complexity, that cost is real, and it falls on real people. Try to minimize it.

Write code you understand. Ship systems you can explain. Build things that the next person (who might be you, six months from now, at 2 AM) can actually maintain.

That's not a vibe. That's engineering.
