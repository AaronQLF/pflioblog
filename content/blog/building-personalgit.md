---
title: "Building personalGit: Engineering a Student Notebook That Stays Free"
date: "2026-05-06"
excerpt: "How I built an infinite-canvas study workspace where the hard part was not the canvas, the editor, or the auth layer, but making sure storing hundreds of megabytes of student PDFs does not kill the free tier."
tags: ["Engineering", "Architecture", "Storage", "own exp"]
---

I built personalGit because every "second brain" tool I tried as a student fell off the same cliff. Notion does not handle PDFs the way I read them. Miro makes you pay the moment you have more than three boards. Obsidian is a text editor pretending to be a graph. None of them give you a single surface where you can drop a paper, a sticky note, a rich page of math, and a slide export, and treat them as one workspace.

The live app is at [studygit-tau.vercel.app](https://studygit-tau.vercel.app/) and the source is on GitHub at [AaronQLF/studygit](https://github.com/AaronQLF/studygit).

I built it. An infinite React Flow canvas, per-workspace, with link nodes, image nodes, sticky notes, Tiptap pages, document nodes with threaded highlights, and a PDF viewer with annotation. Open any node and it spawns a floating, draggable, resizable panel above the canvas. Open another and it spawns next to the first. Read a paper and write a page side by side without a single modal getting in your way.

The product part is the easy version of this story. The interesting part is that I wanted personalGit to stay free, forever, and the moment I committed to that constraint, ninety percent of my engineering effort moved to a single subsystem: storage. This post is about that subsystem.

## The constraint that shaped the whole architecture

Students upload PDFs. Tens of megabytes per paper, sometimes more for slide decks, hundreds of megabytes once you have a semester of material. If I store every uploaded byte as a fresh object on a paid-per-GiB blob store, the math does not work. Fifty users with a hundred megabytes each is five gigabytes. Five hundred users is fifty gigabytes. At that point I am paying real money on a free product.

The naive answer is "charge users." The interesting answer is "do not store the same bytes twice, and compress what is left aggressively." Two students reading the same paper should cost me one copy. A student who re-exports the same deck twenty times after fixing a typo should also cost me one copy, plus the bytes that actually changed.

That answer dictated the entire data path. Everything else in the codebase, the canvas, the panels, the Tiptap editor, the auth layer, the SQL schema, was downstream of getting that one pipeline right.

## The persistence driver pattern

Before the storage pipeline I had a simpler problem to solve: I wanted to develop without Supabase, without R2, without any cloud anything, and then flip a switch and have the same product run against real infrastructure.

I ended up with a thin driver interface. Every persistence operation in the app, "save state," "upload file," "stream file," goes through a single `Driver` type with two implementations: `file` and `supabase`. A `PERSISTENCE` environment variable selects which one is wired up at boot. The selector is one switch statement in `lib/persistence/index.ts`.

The `file` driver writes everything to `data/state.json` and dumps PDFs to `public/uploads/`. There is no auth, no database, no network. It is the development mode and it is also genuinely useful as a "trust me, the local filesystem is fine" mode for solo users who do not want a cloud.

The `supabase` driver writes app state to Postgres rows owned by the calling user (RLS-enforced) and routes every binary upload through the chunked R2 pipeline. The application code on top of the driver does not know which mode it is running in. It just calls `saveState`, `uploadFile`, `streamFile`. That separation paid for itself within the first week of building, because every time I touched the canvas or the panel system I could test against the local driver and never block on cloud setup.

There is one thing I want to call out about this driver pattern, because it is easy to get wrong. The driver interface returns the same shape regardless of backend, but the transport semantics are intentionally different. The `file` driver's `streamFile` returns a 302 redirect to `/uploads/...`, because the static asset server can stream the bytes faster than my route handler can. The `supabase` driver's `streamFile` returns a real `ReadableStream` reconstructed from chunk objects, with proper `Range` and `ETag` headers, because PDF.js fires range requests against the response. Same interface, very different implementations. Trying to make them transport-identical would have forced the cloud version to either lie about content addressing or cache reconstructed files on disk, both of which defeat the point.

## Why naive S3-style storage was not going to work

Once I had the driver split, I had to pick the cloud backend. I went with Cloudflare R2 because the egress is free, which matters for a product that streams PDFs to a viewer that aggressively range-fetches. Pricing-wise R2 is competitive with S3 on at-rest storage and dramatically cheaper on bandwidth.

The default integration with R2, or with any S3-compatible store, is "PUT the bytes, get a key, hand back a presigned URL." It is one HTTP request per upload and one per download. It is what every tutorial shows. It is also exactly what I could not do.

If two students upload the same paper, that store has two copies. If one student re-exports the same deck after a one-character edit, the store has two near-identical copies. If a paper is forty megabytes, almost all of which is already FlateDecode-compressed inside the PDF, zstd cannot meaningfully shrink it from the outside. The blob store ends up looking like a graveyard of slightly-different versions of the same content, none of them dedup-able, none of them compressible, all of them on my bill.

The upload path therefore got longer. Quite a bit longer.

## The five ideas that make storage tractable

The pipeline that an upload actually goes through, end to end, looks like this:

```text
upload buffer
  -> PDF-aware lossless re-emit (best-of)
  -> FastCDC content-defined chunker
  -> sha256(plaintext) per chunk
  -> cache lookup -> R2 HEAD lookup
  -> zstd compress on miss
  -> R2 PUT chunks/<aa>/<rest-of-hash>
  -> R2 PUT manifests/<key>.json
```

There are five distinct ideas stacked here. None of them is novel on its own. The interesting part is the order and the way they compose.

### Idea 1: pre-chunk re-emit, because PDFs are already compressed

Generic compressors like zstd work by finding redundancy in their input. PDFs internally use FlateDecode for streams, JPEG for embedded images, sometimes JBIG2 for scanned text. By the time a PDF hits zstd from the outside, the redundancy has already been squeezed out, and zstd has nothing to work with. I measured single-digit percent savings on raw PDFs at zstd level 19. Not worth the CPU.

But PDFs also carry a lot of structural overhead that is independent of their stream content. The cross-reference table is ASCII. The object tables are not packed by default. Older or "exported from PowerPoint" PDFs leave dead objects, duplicate fonts, and uncompressed metadata streams strewn through the file. That structural overhead is exactly the kind of redundancy a PDF-aware re-emit can remove, before zstd ever sees the bytes.

I built two interchangeable strategies behind a `PDF_PRECOMPRESS` env var.

The default is `pdflib`. It runs the file through `pdf-lib` with `useObjectStreams: true`, which packs the object table into compressed object streams and writes a cross-reference stream instead of the ASCII xref. Pure JavaScript, no native dependencies, near-zero cold-start cost. On unoptimized exports I saw five to thirty percent reduction. On already-optimized PDFs it is essentially a no-op.

The opt-in is `mupdf`, the official MuPDF WASM build, with a fairly aggressive flag set: `garbage=deduplicate,objstms=yes,compress=yes,compress-fonts=yes,compress-images=yes,compress-effort=100,regenerate-id=no`. Drops unreachable objects, removes byte-identical duplicate objects, and re-Flate-compresses every stream including fonts and images. The image re-compression is lossless, it does not re-encode JPEGs. Loaded lazily via dynamic `import()` so the ten-megabyte WASM blob only pays its cost on workers that actually have the strategy enabled. Ten to forty percent reduction even on already-optimized files.

Two implementation details mattered here. First, the layer is strictly never a regression: I keep whichever of `(original, re-emitted)` is smaller. If the re-emit somehow grows the file, or if it throws on an encrypted or malformed input, the original bytes fall through transparently. Second, the re-emit has to be deterministic for identical inputs. `pdf-lib` with `updateMetadata: false` and `mupdf` with `regenerate-id=no` both produce the same output bytes for the same input bytes, which is what preserves cross-user dedup at the chunk layer downstream. If two students upload the same paper but my re-emit produces different timestamps each time, I have just defeated the entire pipeline below.

There is a license note worth flagging: MuPDF is AGPL-3.0. For a personal project that I run myself, that is fine. For anyone else deploying personalGit who cannot accept AGPL, the `pdflib` strategy is the default for a reason.

### Idea 2: content-defined chunking with FastCDC

After the re-emit, I split the buffer into variable-size chunks. Not fixed-size chunks. Fixed-size chunking is a footgun for any deduplicating system, because inserting a single byte at the start of a file shifts every subsequent chunk by one byte and invalidates all of them. You lose the entire dedup story for any edit that is not a pure overwrite.

Content-defined chunking (CDC) decides chunk boundaries based on a rolling hash over the bytes themselves. The idea is older than I am: pick a chunk boundary whenever the rolling hash matches a fixed pattern. Edits only invalidate the chunks around them, because the boundaries before and after the edit are determined by content the edit did not touch.

I implemented FastCDC, from Xia et al., USENIX ATC '16. Two things make it specifically good. First, the rolling hash is a Gear hash, which is a single table lookup and an XOR per byte, so it is genuinely fast on the upload path. Second, FastCDC uses normalized chunking: a strict bitmask up to the average target size, and a loose bitmask between the average and the maximum. The strict mask keeps small chunks rare, which controls metadata overhead. The loose mask makes boundary hits more likely once the chunk is already past target size, which prevents pathological max-size chunks. The result is a chunk size distribution tightly concentrated around the average, with very few outliers in either direction.

I configured it with min 64 KiB, average 256 KiB, max 1 MiB by default, all overridable via env. Those numbers are not from a paper. They came from running the chunker over a few hundred PDFs of my own and watching the dedup ratio on a synthetic edit benchmark: take a PDF, modify a single page, re-chunk, see how many chunks survived. With those parameters, an edit to a single page of a fifty-megabyte PDF re-uploaded around two to three chunks. With one-megabyte fixed chunks, the same edit would have invalidated roughly fifty.

### Idea 3: content addressing

Each chunk is named by `sha256(plaintext)`. Not by upload time, not by user ID, not by file ID. Just by the cryptographic hash of its content. This is the part that turns the system from "compresses well" into "actually free."

Two students uploading the same paper produce identical chunk hashes. I do not need a coordinator to detect that. I do not need to ask "is this a duplicate?" before the upload. I just compute the hash, check the local cache, then check R2 with a `HEAD` request, and if the chunk is already there I skip the PUT entirely. Zero coordination, globally consistent by definition.

This composes elegantly with the chunker. A student who re-exports a deck after fixing slide three uploads the chunks that cover slide three, and nothing else. Every other chunk in the file hashes to the same value as before, hits the cache or the `HEAD` lookup, and is skipped. The naive "store every upload as a fresh object" pattern would have re-uploaded the entire file.

Two things to be careful about with content addressing. First, the hash must be over the plaintext, not the compressed bytes, because the compression is per-chunk and you need the dedup decision to happen before you decide whether to compress. If you compress first and hash the ciphertext, two semantically identical chunks compressed with two different zstd configurations would have different hashes. Second, the chunk paths in R2 are sharded by the first two hex characters of the hash (`chunks/<aa>/<rest>`). R2 does not technically need this, but it keeps any future tooling that lists or migrates chunks from hitting flat-bucket pagination problems.

### Idea 4: zstd level 19, per chunk, exactly once

Once I have a unique chunk that is genuinely missing from R2, I compress it with zstd at level 19 before uploading.

Level 19 is slow. On a normal "compress every upload" pipeline, level 19 would be too slow to be acceptable. The trick is that the dedup happens before the compress. Across the entire system, I only ever spend zstd's CPU on a given chunk's bytes once, ever. After that the chunk lives in R2 in its compressed form and is reused by every future upload that contains the same plaintext. The slowness of level 19 amortizes against every future hit on that chunk.

This is a fairly useful general principle. High-ratio compression is often dismissed as "too slow for hot paths," but if you sit it behind a content-addressed cache, the hot path is a hash lookup and the slow compression only runs on cold-store misses. The cost model flips. You get the ratio of level 19 with the amortized latency of a cache hit.

The codec is `@mongodb-js/zstd` because it works under Node without native install gymnastics. There is one limitation worth flagging: it does not currently expose dictionary APIs. I have a `train-zstd-dict.ts` script that samples chunks and trains a dictionary, and the manifest schema has a `compression.dictId` field reserved for it, but the runtime does not yet use the dictionary. Swapping to a dict-aware codec like `zstd-napi` or Node 23.8 plus would be a single-file change in `lib/persistence/compression/zstd.ts`. I am sitting on it because the marginal ratio gain on PDFs after the re-emit is modest, and dictionary distribution adds operational complexity I have not needed yet.

### Idea 5: manifests as the only file pointer

A "logical file" in personalGit, what an end user thinks of as "my paper.pdf," is not a single object in R2. It is a small JSON manifest at `manifests/<key>.json` that lists, in order, the sha256 hashes of the chunks that compose the file, plus a bit of metadata: total size, content type, the compression and chunker parameters that were used.

The manifest is tiny. A fifty-megabyte PDF with average 256 KiB chunks has roughly two hundred chunk references. At sixty-something bytes per hash plus a little JSON overhead, the manifest is on the order of fifteen kilobytes. Cheap to copy, cheap to version, cheap to stream.

This unlocks a few things that would be awkward otherwise.

Renaming a file is a manifest rewrite. Versioning a file is keeping multiple manifests. Sharing a file between two users is creating a second manifest pointing at the same chunks. The bytes never move. None of these operations touch R2's chunk store.

More importantly, range requests against the file are tractable. PDF.js does not download a whole PDF before rendering. It sends `Range: bytes=...` headers to fetch only the parts of the file it currently needs to render. If the response is a single zstd-compressed blob, range requests are useless because you cannot decompress a slice of a stream. With per-chunk compression and a manifest, the route handler can resolve a byte range to the set of chunk indices that cover it, fetch and decompress just those chunks, slice the result, and serve it. This is what `app/api/files/[key]/route.ts` does, with proper `ETag` and `If-None-Match` support so the browser can cache by manifest hash.

## The shape of the result

I want to put numbers on this, because the abstract description undersells how skewed the savings are.

On my own corpus, which is a few hundred academic PDFs with significant overlap (multiple students taking the same course will upload the same papers), the chunked store sits at roughly thirty to forty percent of the size of the same files stored as raw R2 objects. The exact ratio depends heavily on how much cross-file overlap exists. For wholly independent uploads with no overlap, the savings come almost entirely from per-chunk zstd at level 19 and the PDF re-emit, which together get me ten to twenty-five percent on average. For cross-user overlap, dedup does the heavy lifting, and the marginal cost of the second copy of a paper is essentially the sha256 lookups.

The savings are not uniform. They are massively skewed toward the kind of usage students actually have. A class of fifty students working from the same syllabus, the same problem sets, and the same reference papers will all share the same chunks. The first student pays the storage cost, every other student is essentially free. That is exactly the demographic I am trying to serve.

## Range streaming and why it matters more than it sounds

The download path is the part most people skip when they design something like this. It is also where most compression-heavy designs fall over.

A naive "compressed blob per file" design has two failure modes. First, you have to decompress the whole file to serve any byte of it, which destroys the latency on the first PDF page. Second, you cannot serve `Range` requests at all without paying for full decompression upfront. PDF.js will hammer you with range requests, often dozens per page, and a backend that cannot serve them efficiently turns into a death spiral of CPU and memory.

The chunked design handles this naturally because compression is per-chunk and the manifest tells you exactly which chunk a given byte range lives in. The route handler does the range math, fetches the chunks that cover the requested range from R2 (in parallel), decompresses each chunk once, and concatenates the relevant slices. There is a small on-disk shard cache at `lib/persistence/cache/shards/` for chunks that have been fetched recently, so the second range request against the same chunk does not pay R2 round-trip latency.

The cache is intentionally simple. It is gitignored. It is not authoritative for anything. It can be wiped at any time with no data loss. The R2 chunk store is the source of truth, the cache is just a courtesy. I have seen too many systems where the local cache becomes load-bearing and then breaks horribly during deploys.

## Garbage collection without coordination

Content addressing has one well-known downside: you cannot delete chunks safely on file delete. The same chunk may back many manifests. If two students share a paper and one deletes it, the chunks stay because the other student's manifest still references them.

I solved this with a periodic mark-and-sweep job. The implementation is at `scripts/...` (the GitHub Action calls into it). It walks the manifest store, marks every chunk that any manifest references, then sweeps any chunk in R2 that no manifest reaches. It runs weekly via a GitHub Action on Sundays at 03:00 UTC, and there is a manual `workflow_dispatch` trigger for ad-hoc runs.

This is the right shape for a system like this. Reference counting on every delete would require either transactional updates across two stores (Postgres for manifests, R2 for chunks) or a coordinator I do not want to run. Mark-and-sweep is eventually consistent, embarrassingly parallel, and impossible to corrupt: the worst case is that an orphan chunk lives a week longer than it had to. I do not pay much for that.

The job needs `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and the R2 credentials configured in GitHub Actions secrets. The service-role key is the only credential that can read manifests across users (RLS would otherwise hide most of them from the GC view), so the job runs server-side with no end-user exposure.

## The auth layer, briefly

The Supabase mode of personalGit uses Postgres for app state with row-level security keyed on `auth.uid()`. The schema lives in `supabase/migrations/0001_init.sql` and `0002_auth_rls.sql`. Workspaces, nodes, and edges all carry a `user_id uuid not null default auth.uid()` column, with RLS policies of the form `using (user_id = auth.uid())` on every operation.

The interesting bit here, for a free product, is that I lean on Supabase's free tier as hard as I can. Their free tier covers two free projects, fifty thousand monthly active users, five hundred megabytes of database, and one gigabyte of file storage. The file storage cap is what I would have hit immediately if I had stored PDFs in Supabase Storage. Routing PDFs through R2 with the chunked pipeline lets the free Supabase tier cover the actual app state (which is small JSON, very compressible at the database level) and lets R2 absorb the binaries (which are deduped to within an inch of their lives).

The proxy at `proxy.ts` does session refresh and gates `/app` behind authentication when `PERSISTENCE=supabase`. In `file` mode the proxy is essentially a no-op. Same code, different runtime behavior, selected by env.

## Floating panels, briefly, because someone always asks

The product surface that gets the most user-visible engineering attention is the floating panel system. Opening any node spawns a draggable, resizable, z-ordered window over the canvas. Opening another spawns next to the first. Existing panels are never auto-closed.

The implementation is a single Zustand slice that owns the panel state: list of open panels, their positions, sizes, and z-order. Each panel is a `Panel` chrome component that handles drag (header pointer events), resize (corner pointer events), maximize (double-click header), and close. The body is resolved by the `PanelManager` based on the node kind (link, image, note, page, document, PDF). Each body is its own component that knows nothing about panel chrome.

The keyboard story is the part I spent the most time on. Esc closes the topmost panel. Cmd or Ctrl plus Shift plus Esc closes all of them at once. Enter on a selected node opens it. Double-click on a node opens it. None of these required new libraries. They required carefully ordered event handlers that do not fight React Flow's own keyboard logic. That is engineering effort that does not show up anywhere in a feature list, but it is the difference between a panel system that feels like a real desktop and one that feels like a homework assignment.

## What I would change

A few honest notes.

The zstd dictionary work is sitting unused. I have the training script, I have the schema field, I do not have a dict-aware codec. This is the single largest unrealized win in the storage path, probably another five to fifteen percent on chunks of similar PDFs. I will swap the codec when Node 23.8 plus native zstd lands in my deployment target.

The mark-and-sweep GC is fine for now but does not scale to hundreds of thousands of manifests on the same weekly cadence. The right answer is incremental reference counting kept in Postgres, with the GC job reconciling against R2 for drift detection rather than doing the full sweep itself. I have not built it because I do not need it yet.

The `file` driver is genuinely useful as a development mode but is also a tempting "self-host" path that I have not committed to supporting. If I do, I need to think through how the chunked pipeline applies locally, whether running zstd at level 19 on a developer's machine is acceptable, and whether the on-disk shard cache should become the actual store.

## What this whole thing is, structurally

The product is a canvas. The engineering is a storage pipeline. Most of the hours went into the latter, and that ratio is the right one for what I was trying to build.

I wanted personalGit to be free, and I wanted free to be sustainable rather than aspirational. That requires making the cost of an extra user, or an extra upload, or an extra re-export, structurally close to zero. Content addressing plus content-defined chunking plus per-chunk zstd plus PDF-aware re-emit gets me there. The marginal storage cost of a second student uploading the same paper is the cost of two hundred sha256 hashes and a manifest write. That is not a free-tier-friendly cost. That is a free cost.

The rest of the system, the auth, the canvas, the panels, the editor, is just the surface that made the storage worth building.
