---
title: "yield from"
date: "2026-03-25"
excerpt: "A short, unreasonably enthusiastic post about a two-word Python statement that most people ignore."
tags: ["Python", "Engineering"]
---

I need to talk about `yield from` because nobody around me seems appropriately impressed by it and that bothers me

## What it replaces

Before PEP 380 landed in Python 3.3, if you had a generator that needed to delegate to another generator, you wrote this:

```python
def outer():
    for item in inner():
        yield item
```

This works. It is also lying to you about the structure of the computation. The loop is not doing work. It is just forwarding. The `for` and the `yield` are ceremony around a concept that should be one operation: "everything that generator produces, produce it here too."

## What it actually is

```python
def outer():
    yield from inner()
```

Two words. Same behavior. But the semantic difference is not cosmetic.

`yield from` establishes a direct channel between the caller and the subgenerator. Values flow up. Sent values flow down. Exceptions propagate correctly. The return value of the subgenerator becomes the value of the `yield from` expression. The outer generator is not manually proxying. It is stepping out of the way.

This means `yield from` is not syntactic sugar for a loop. It is a delegation primitive. The outer generator says "I am not the one producing values right now, that thing is, talk to it directly." The distinction matters the moment you use `.send()` or `.throw()` on the generator, because the naive loop version silently drops both.

## The full delegation protocol

What most people miss is how much `yield from` actually handles under the hood. The expansion in PEP 380 is roughly forty lines of equivalent Python. Here is the short version of what it does:

1. It calls `iter()` on the subgenerator and starts pulling values with `next()`.
2. Every value the subgenerator yields gets yielded outward to the caller.
3. If the caller calls `.send(value)` on the outer generator, that value gets forwarded into the subgenerator via `.send()` instead of `next()`.
4. If the caller calls `.throw(exc)`, the exception gets thrown into the subgenerator. If the subgenerator handles it and yields another value, that value propagates outward normally.
5. If the caller calls `.close()`, `GeneratorExit` gets thrown into the subgenerator.
6. When the subgenerator returns (via `return value` or `StopIteration`), the return value becomes the result of the `yield from` expression in the outer generator.

That last point is easy to miss and extremely useful. You can write:

```python
def accumulate():
    total = 0
    while True:
        value = yield
        if value is None:
            return total
        total += value

def pipeline():
    result = yield from accumulate()
    print(f"total was {result}")
```

The subgenerator runs, receives sent values, and when it decides it is done, its return value pops back into the outer generator as a normal expression result. The manual loop version cannot do this without awkward `StopIteration` catching.

## Why the naive loop is quietly broken

Consider what happens when you write the "equivalent" loop by hand:

```python
def outer():
    for item in inner():
        yield item
```

This works perfectly for the simple case where you only iterate. But the moment someone calls `.send()` on `outer()`, the sent value lands in `outer` and gets silently discarded. It never reaches `inner`. Same with `.throw()`. The exception hits `outer`, not the subgenerator.

In practice this means the loop version is only equivalent when the generator protocol is used in its most basic form. The moment you treat generators as coroutines, which is what they actually are, the loop version is broken by omission. It compiles, it runs, and it silently loses information.

I have a visceral reaction to code that looks correct and quietly is not. The loop version is that kind of code.

## Generators as coroutines

Generators in Python are underused because people learn them as "lazy lists" and stop there. But generators are coroutines. They are resumable stack frames. `yield` suspends execution and `yield from` composes suspended executions into trees.

This is not an analogy. A generator function, when called, returns a generator object that has its own execution frame, its own local variables, and its own program counter. When you call `next()` on it, the frame resumes from where it last suspended. When you call `.send()`, the frame resumes and the sent value becomes the result of the `yield` expression that suspended it. The generator is literally a coroutine with cooperative scheduling controlled by the caller.

`yield from` is the composition operator for this model. It lets you build a tree of coroutines where each level delegates to the next, with values, sends, throws, and returns propagating correctly through the entire tree. Without `yield from`, you can build flat generators easily but composing them requires manual plumbing that is tedious and error-prone.

This is also the conceptual foundation that `asyncio` was built on. Before native `async`/`await` syntax arrived in Python 3.5, the entire async I/O system was implemented using generators and `yield from`. The event loop would schedule generator-based coroutines, and `yield from` was how you awaited another coroutine. When `async def` and `await` were introduced, they were essentially syntactic wrappers around the same mechanism with a different type to prevent accidental mixing.

So `yield from` is not just a convenience for iterating. It is the primitive that made Python's async ecosystem possible. The entire architecture of modern Python concurrency traces back to a two-word statement that most people think is just a shorter way to write a for loop.

## The aesthetic argument

I realize everything above is the technical justification and not the real reason I care. The real reason is aesthetic.

There is a class of language features that I think of as "honest primitives." They do exactly one thing, they do it completely, and they do not pretend to be something they are not. `yield from` is one of them. It says: "I am delegating to this subgenerator, fully, with all protocol obligations preserved." There is no hidden behavior, no partial implementation, no asterisk.

Compare this to how most languages handle the same problem. In JavaScript, you have `yield*`, which is similar but exists in a language where generators are used less idiomatically and the protocol is thinner. In other languages, you end up manually managing iterators or using framework-specific abstractions that hide the delegation behind layers of indirection.

Python gave this concept a name and a clean syntax. The name is accurate. The syntax is minimal. The semantics are complete. When I encounter a language feature like this, where the design surface is small but the coverage is total, I feel something that I can only describe as relief. There is no gap between what the feature promises and what it delivers.

I know that is an unusual thing to feel about a programming construct. I have accepted that about myself.

## Why I care this much

Once you see `yield from` as a composition primitive for resumable computations rather than a shortcut for iteration, it changes how you think about control flow. You start seeing opportunities to express pipelines, state machines, protocol handlers, and recursive traversals as composed generators where each layer is simple and the delegation semantics are guaranteed correct.

I find that satisfying in a way I cannot fully defend rationally. There is something about a language giving you the exact primitive you need, not more, not less, and trusting you to notice.
