---
title: "Studygit: An Infinite Canvas for the Way I Actually Study"
date: "2026-05-06"
excerpt: "I just open-sourced studygit, the React Flow and Tiptap learning canvas I built because every note-taking tool I tried assumed I would only ever look at one document at a time. Here is what is in it, why the design choices matter, and how it changed the way I research a topic."
tags: ["Engineering", "Tools", "Research", "own exp"]
---

Studygit started because none of the tools I used for learning matched how I actually learn.

I have tried Obsidian. I have tried Notion. I have tried Heptabase. I have tried Apple Notes with PDFs in folders and a tab group in the corner. Each one breaks the same way for me. The moment I am studying something that requires more than two open documents at once, the tool collapses into a single-document view and I lose the spatial relationship between what I am reading and what I am writing.

When I am trying to understand a paper, I do not want to switch between tabs. I want the paper open, my notes open beside it, the related blog post open beside that, and a sticky note in the corner reminding me what question I started with. That is not a power-user feature. That is the entire activity. The thing I am calling "studying" is precisely the act of holding several sources in working memory at once and synthesizing across them.

## What it actually is

It is a Next.js 16 app that gives you an infinite canvas, built on React Flow, where every node is a piece of study material. Links, images, sticky notes, PDFs, rich block-edited Pages, and plain documents you can highlight and thread comments on. You arrange them spatially the way you would arrange paper on a desk, you connect related nodes with edges, and you open them in floating, draggable, resizable, z-ordered panels that float over the canvas.

Workspaces are independent canvases, one per topic. I have one for state space models, one for diffusion, one for whatever course I am taking. Each one is its own infinite plane.

The stack is Next.js 16 (App Router) plus TypeScript, Tailwind 4, React Flow (`@xyflow/react`) for the canvas, Zustand for client state, and Tiptap with KaTeX, Mermaid, and code highlighting for the block editor. Persistence is pluggable. There is a file mode that writes to `data/state.json` for solo use, and a Supabase mode that uses Postgres with row-level security plus a Cloudflare R2-backed chunk store for PDF assets.

The code is at [github.com/AaronQLF/studygit](https://github.com/AaronQLF/studygit). A hosted instance runs at [studygit-tau.vercel.app](https://studygit-tau.vercel.app) under the public name personalGit, free during early access, with email and Google sign-in. Everything below describes the same codebase under both deployments.

## The panel model is the whole point

The single design decision that matters most is how panels work. Opening a node spawns a window that floats over the canvas. Opening another node spawns another window beside it. Existing windows are never auto-closed.

There is no "you can only look at one thing" mode, because the entire reason I am using this tool is that I want to look at three things at once. Drag a panel header to move it. Drag the bottom-right grip to resize. Double-click the header or hit the maximize button to fill the screen. The Esc key closes the topmost panel. Cmd or Ctrl plus Shift plus Esc closes all of them. The keyboard model is meant to feel like a tiling window manager grafted onto a canvas.

I am aware this is not a novel pattern. Tools like Heptabase and Scrintal have spatial canvases. Most of them treat opening an item as a modal action that replaces what you were looking at, or push the item into a side panel that occupies fixed real estate. The thing I needed, and could not find, was many resizable panels at once over a real infinite canvas, with the canvas still navigable underneath, plus keyboard shortcuts that let me dismiss panels without losing my place.

It turns out building this on top of React Flow is fine, because React Flow does not care what is rendered above it. The panels are absolutely positioned children of the canvas container, with their own z-order stack maintained in Zustand. The canvas keeps panning and zooming under them. If you close every panel, your spatial layout is exactly where you left it.

## Pages with the math and diagrams I actually need

Page nodes are Tiptap block editors with a slash menu, the way Notion does it, but with extensions I needed for the kind of writing I do. KaTeX for inline and block math. Mermaid for diagrams. Code blocks with syntax highlighting via lowlight. Callouts, toggles, todos, dividers, image blocks. Press `/` and pick the block you want.

Tiptap is built on ProseMirror, which is opinionated in ways that took me a while to internalize. Every block is a node in a schema. Marks are inline. The slash menu is just a suggestion plugin watching for a trigger character and opening a popover with command bindings. KaTeX and Mermaid are custom node views that render the parsed output and keep the source available on focus. None of this is novel. What I cared about was that the editor felt fast and felt like Notion under my hands, because that is the muscle memory I have.

The thing I most often write in a Page is a paper summary with the equations rendered properly and a small Mermaid block diagram of the architecture. The math has to be inline-correct, because if I cannot write `$\\sigma(Wx + b)$` in flowing prose, I will write it as plain text and then never look at it again. KaTeX is fast enough at typesetting that the editor does not stutter. Mermaid is the slow one, but it only re-renders on block edit, which is the right tradeoff.

## Two persistence modes

Studygit ships with two persistence drivers selected by an environment variable. `PERSISTENCE=file`, the default, writes everything to `data/state.json` on the local filesystem and stores uploaded PDFs in `public/uploads/`. There is no auth. There are no users. It is the original solo workflow.

`PERSISTENCE=supabase` switches the entire app to Supabase Auth plus Postgres with per-user row-level security, with Cloudflare R2 for PDF assets. The app gains a landing page, login and signup pages with email plus Google OAuth, a session-aware proxy, and per-user data isolation enforced at the database layer. Everything else is the same.

Splitting the persistence layer behind a driver interface was the single decision that kept the codebase sane. The interface lives in `lib/persistence/types.ts` and exposes state read, state write, file upload, and file read. The file driver is a thin wrapper around `fs/promises`. The Supabase driver is a Postgres client plus an R2 client plus a chunk store. Everything in the app calls through the driver. The route handlers in `app/api/state` and `app/api/upload` and `app/api/files/[key]` do not know which driver they are talking to.

The reason I designed it this way is that I wanted to use studygit privately on my own machine without creating accounts, but I also wanted it to be hostable as a real multi-tenant service for friends and classmates. The same codebase has to support both. A single environment variable picks between them.

## Chunked, content-addressed PDF storage on R2

This is the part I am quietly most proud of, and it is the section that will look like overengineering until I explain why it is not.

When `PERSISTENCE=supabase`, every uploaded PDF takes a longer route than "PUT the bytes to S3 and hand back a presigned URL." The pipeline is:

```
upload buffer
  -> FastCDC content-defined chunker
  -> sha256(plaintext) per chunk
  -> cache lookup, then R2 HEAD lookup
  -> zstd compress on miss
  -> R2 PUT chunks/<aa>/<rest-of-hash>
  -> R2 PUT manifests/<key>.json
```

Four ideas, one stacked on top of the next.

Content-defined chunking with FastCDC. The buffer is split into variable-size chunks where the boundaries are decided by a rolling Gear hash over the bytes themselves, with a strict mask up to the average size and a loose mask up to the max. This is the normalized chunking trick from Xia et al., FastCDC, USENIX ATC 2016. The reason it matters is that editing the front of a 50 MB PDF only invalidates the chunks around the edit, instead of every chunk after it the way fixed-size chunking would.

Content-addressable storage. Each chunk is named by `sha256(plaintext)`. Two students who upload the same paper share its chunks for free. A student who re-exports a 200-slide deck after fixing a typo on slide three only re-uploads the chunks covering slide three. There is no coordination, no "is this a duplicate" RPC. Content addressing is globally consistent by definition.

Per-chunk Zstandard at level 19. Because dedup happens before compression, the system only ever spends CPU on a chunk's zstd pass once. That makes high compression levels economically reasonable, which they are not in a naive object-store pipeline.

Manifest-as-pointer. A "logical file" is a tiny JSON manifest at `manifests/<key>.json` listing the ordered chunk hashes. Renaming, versioning, and sharing a file are cheap operations on the manifest. Range requests turn into "find chunk index, decompress one chunk, slice," which is exactly what `/api/files/[key]` does for PDF.js range fetches.

Why a personal study tool needs this. I upload the same papers as everyone else. The Mamba paper, the Attention Is All You Need PDF, the Karpathy makemore notes. If five users of a hosted instance upload the same paper, the second through fifth uploads do not consume any new R2 storage, because the chunks already exist under their content hashes. On its own, that is a trivial optimization. What is less trivial is that re-uploading a slightly edited version of a long PDF, which is what happens when someone exports lecture notes again, only stores the chunks that actually changed. For a multi-user instance the storage curve flattens into something I can afford to host on a student budget.

There is a small on-disk cache at `lib/persistence/cache/shards/` that short-circuits the R2 round trip when a chunk has been seen recently, and a periodic mark-and-sweep garbage collector that walks every manifest, marks reachable chunks, and sweeps orphans. The GC runs as `npm run gc` locally and as a weekly GitHub Action on Sunday at 03:00 UTC. There is also an optional `npm run zstd:train` script that trains a zstd dictionary from sampled chunks. The dictionary path is wired into the manifest schema as `compression.dictId` but not yet consumed at runtime, because `@mongodb-js/zstd` does not expose dict APIs. Swapping to `zstd-napi` or Node 23.8+ native zstd would be a single-file change.

I did not need to build any of this for the file-mode personal experience. I built it because once I decided I wanted other people to be able to host the supabase mode, the bandwidth and storage math stopped being academic.

## How I actually study with it

The concrete loop I use most often, and the reason the tool exists in the form it does, runs like this.

I open a fresh workspace, "Mamba and SSMs." I drop the Mamba paper PDF on the canvas. I drop the S4 paper PDF on the canvas. I drop a link node pointing to Sasha Rush's annotated notes and another to the Albert Gu thread. I drop a sticky note that says "what question am I trying to answer" and write the actual question on it.

I open the Mamba paper. I read until I hit the selective scan derivation. I select the equation, ask the AI about it, paste a distilled version into the side notes panel. I open the S4 paper next to it, find the corresponding HiPPO derivation, and write a Page beside both PDFs that walks through how the parameterization changes between S4 and Mamba. The page has the equations in KaTeX and a Mermaid diagram of the recurrence.

I connect the Page node to both PDFs with edges. The edges are not load-bearing for any computation. They exist purely for me, six weeks later, when I come back to this workspace and need to remember which PDFs the synthesis was drawn from. The graph is a memory aid.

That entire session is one workspace. None of it lives in browser tabs. None of it lives in a separate Notion page disconnected from the source. None of it is gone the moment I close the laptop. Everything is on the canvas in the position I left it, and the panels reopen in the layout I had them in.

This is the workflow that did not exist for me in any other tool, and it is the only reason I kept building.

## Why I open-sourced it

I built studygit for myself first. The repo is public because I do not think the world needs another closed-source learning canvas, and because the parts of the codebase I am most pleased with, the persistence driver split and the chunked R2 pipeline, are useful as a reference implementation independent of the app itself. If someone wants to fork the storage layer for a different project, that should be possible without paying me for a license.

The license is permissive. The README has the full setup, including the SQL migrations for Supabase, the R2 bucket configuration, and the optional one-shot migration script that uploads local state and assets to a hosted instance keyed by a user UUID. The default file mode means you can clone the repo, run `npm install && npm run dev`, and have a working solo learning canvas in under a minute, with no accounts and no cloud dependencies.

I am not promising support. I am not promising a roadmap. I am promising that this is the tool I use, that I will keep using it because I built it for myself, and that the code is there for anyone who finds the same gap I found.

If you have tried four note-taking apps and given up on each of them, the gap might be the one I described at the top of this post. The tool might or might not work for you. The code is at [github.com/AaronQLF/studygit](https://github.com/AaronQLF/studygit) and the hosted instance is at [studygit-tau.vercel.app](https://studygit-tau.vercel.app). The infinite canvas is waiting.
