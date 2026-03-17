---
title: "Building a Universal Asset Management System with Theorem-Backed Embeddings"
date: "2026-03-17"
excerpt: "How I am building an enterprise asset management system that can index and retrieve meaning across videos, PDFs, spreadsheets, docs, and more using a single embedding framework."
tags: ["AI", "Architecture", "Embeddings", "Enterprise", "RAG"]
---

Most enterprise asset systems are fake-unified. They centralize storage, not understanding. A contract PDF sits in one search backend, a board-call recording in another, an Excel model in a folder that nobody can semantically parse, and retrieval quality craters as soon as one query crosses file types.

At my current company, I am building a unified asset intelligence layer that can index and retrieve meaning across video, audio, PDF, DOCX, spreadsheets, slide decks, and mixed artifacts. The key design decision was to stop treating file formats as silo boundaries and treat each modality as a different observation channel over the same latent business state.

This post is the technical version: theorem, objectives, system decomposition, failure modes, and future implications.

## Part I - Problem formulation and requirements

I framed enterprise retrieval as a constrained multi-objective optimization problem:

- maximize semantic recall across heterogeneous modalities;
- preserve modality-native structure (tables, timeline, formula graph, layout);
- enforce authorization and governance constraints at retrieval time;
- produce auditable provenance with deterministic replay.

Let:

- `q` be a user query;
- `A = {a_1, ..., a_n}` be all assets;
- `M(a)` be the modality of asset `a`;
- `S(a)` be extracted structured representation;
- `E(a)` be embedding projection in a shared vector space;
- `P(a)` be policy constraints (ACL, legal hold, residency, retention).

We seek a ranked set `R(q)` maximizing relevance under policy constraints:

`R(q) = argmax_{a in A, P(a) allows user} Score(q, a)`

where `Score` is a fusion function over dense, sparse, structural, and graph signals.

Why this matters: classic search stacks optimize lexical overlap; enterprise reasoning needs semantic equivalence under heterogeneous encodings.

## Part II - Cross-Modal Representation Consistency Theorem (CRCT)

The architecture stabilized only after I wrote down a theorem-like invariant.

### Informal statement

If two artifacts encode the same latent business claim, and if extraction preserves claim-bearing structure, then there exists a projection into a shared space where local neighborhood relations are approximately modality-invariant.

### Practical formalization

Define latent claim variable `z` and observation function `g_m` for modality `m`:

`x_m = g_m(z, epsilon_m)`

with modality noise `epsilon_m`.

For encoders `f_m` and shared projector `h`, we learn:

`u_m = h(f_m(x_m))`

such that for equivalent claims `(x_i, x_j)`:

`d(u_i, u_j) <= delta_pos`

and for non-equivalent claims:

`d(u_i, u_j) >= delta_neg`

with `delta_pos < delta_neg`.

### Why this theorem mattered in implementation

It gave me three non-negotiable engineering rules:

1. Preprocessing is part of the model, not a data pipeline afterthought.
2. Segmentation quality is a first-order term in retrieval quality.
3. Regression testing must monitor neighborhood invariants, not just end-task metrics.

Without CRCT, the project was drifting into connector sprawl with no unifying quality target.

## Part III - System architecture (control plane and data plane)

### 1) Canonical asset envelope

Every artifact is wrapped in a canonical envelope:

- immutable `asset_id`;
- `content_hash` and parser hash;
- lineage graph (`parent`, `derived_from`, `version_of`);
- governance metadata (owner, legal domain, retention class, residency);
- ACL context and policy tags.

This envelope is the contract between extraction, indexing, retrieval, and audit.

### 2) Extraction services by modality

I run modality-specialized extractors behind one ingestion bus:

- **Video/audio pipeline**
  - VAD -> diarization -> ASR with timestamped token lattice;
  - topic segmentation over speaker-turn graph;
  - keyframe sampling + OCR/caption fusion;
  - event timeline extraction.
- **PDF/DOCX pipeline**
  - layout graph reconstruction (block, table, figure, footnote);
  - heading hierarchy and citation anchors;
  - table cell typing and unit normalization.
- **Spreadsheet pipeline**
  - sheet topology extraction;
  - formula dependency DAG;
  - named-range semantics and header confidence;
  - anomaly flags (merged cells, hidden sheets, circular refs).
- **Slides/images**
  - OCR + structural zoning;
  - visual-caption embedding;
  - chart/table region detection.

Output is not plain text. Output is a typed intermediate representation (IR) with structure preserved.

### 3) Typed intermediate representation (IR)

Core IR objects:

- `TextSpan(start, end, source_anchor, section_path)`
- `TableBlock(cells, schema, units, confidence)`
- `FormulaNode(ast, deps, range_ref)`
- `TimelineEvent(t_start, t_end, speaker_id, topic)`
- `VisualRegion(bbox, label, caption, ocr_spans)`

Everything downstream (chunking, embeddings, retrieval, provenance) operates on IR, not raw files.

## Part IV - Structure-preserving segmentation

Naive fixed-size chunking is one of the main reasons multimodal retrieval underperforms in production.

I use modality-aware segmentation policies:

- transcript chunks respect speaker boundaries and discourse shifts;
- document chunks align to heading tree + table/figure references;
- spreadsheet chunks bind value regions to local formula neighborhoods;
- slide/image chunks preserve region adjacency and caption coupling.

We optimize segmentation against a proxy objective:

`J_seg = alpha * Cohesion - beta * BoundaryLoss + gamma * CrossModalAlignability`

where:

- `Cohesion` measures intra-chunk semantic coherence;
- `BoundaryLoss` penalizes splitting claim-bearing units;
- `CrossModalAlignability` measures how well chunks align with equivalent chunks in other modalities.

In my tests, segmentation quality explained more variance in recall@k than model swaps between strong embedding backbones.

## Part V - Embedding model stack and alignment training

### 1) Encoder topology

I use a multi-encoder architecture with a shared projection head:

- text encoder for prose/legal language;
- table encoder for schema + values + unit tokens;
- temporal encoder for timeline segments;
- visual-text encoder for image/slide regions.

Each encoder produces modality-local vector `v_m`; shared projector maps to `u_m in R^d`.

### 2) Training objective

Composite loss:

`L = lambda1 * L_contrastive + lambda2 * L_triplet + lambda3 * L_neighborhood + lambda4 * L_policy_separation`

with:

- `L_contrastive`: positive/negative cross-modal pair alignment;
- `L_triplet`: margin separation for hard negatives;
- `L_neighborhood`: preserves local graph neighborhoods after projection;
- `L_policy_separation`: discourages leakage-like nearest-neighbor collisions across sensitivity classes.

Hard negatives are critical: same keywords, different business claim (for example, "renewal" in legal clause vs sales forecast).

### 3) Drift monitoring

I continuously track:

- centroid drift per modality;
- neighborhood churn for anchor datasets;
- cross-modal calibration error;
- false-neighbor rate under policy partitions.

If drift exceeds thresholds, I gate rollout and trigger selective re-embed jobs.

## Part VI - Retrieval and ranking architecture

Retrieval is a hybrid cascade:

1. **Dense recall** via ANN over shared vectors.
2. **Sparse recall** via BM25/lexical index for exact clauses and IDs.
3. **Structural recall** over tables/formula graphs/timeline metadata.
4. **Graph expansion** over lineage/entity relations.
5. **Late fusion rerank** with cross-encoder on top candidates.

Scoring function:

`Score = w_d * S_dense + w_s * S_sparse + w_t * S_struct + w_g * S_graph + w_c * S_crossenc - w_r * RiskPenalty`

`RiskPenalty` captures policy uncertainty, low parser confidence, and stale-version risk.

Weights are learned per query class (navigational, analytical, legal, investigative) using offline relevance labels and online click/accept feedback from pilot usage.

## Part VII - Authorization, compliance, and provenance by construction

Enterprise retrieval is wrong if policy is bolted on after ranking.

I enforce security in retrieval primitives:

- ACL-aware candidate generation;
- policy-aware ANN filtering;
- row/column masking for structured assets;
- tenant/domain boundaries in index shards.

Provenance object for each returned unit includes:

- `asset_id`, `version`, `hash`;
- exact span reference (char range / cell coords / timestamps / bbox);
- parser version and embedding model version;
- policy decision trace (why visible to this user).

This enables deterministic audit replay: given query, user context, and version pins, I can reconstruct ranking decisions.

## Part VIII - Evaluation framework and SLOs

I split evaluation into offline, online, and governance metrics.

### Offline retrieval metrics

- recall@k, mrr, ndcg by modality and cross-modal query class;
- claim-level match rate (not document-level only);
- calibration error of confidence estimates;
- hard-negative discrimination score.

### Online product metrics

- answer acceptance rate;
- reformulation rate (lower is better);
- time-to-evidence;
- analyst task completion time.

### Governance/safety metrics

- unauthorized exposure rate (must be ~0);
- provenance completeness rate;
- stale-citation rate;
- policy decision disagreement rate.

I maintain SLOs separately for high-risk domains (legal/finance) vs lower-risk knowledge domains.

## Part IX - Failure modes I hit while building and testing

### Failure mode A: Spreadsheet semantic aliasing

Different business units encode equivalent KPIs with incompatible schemas. Two tables can be numerically similar but semantically non-equivalent. I mitigated this with schema canonicalization + unit graph checks + formula lineage signals.

### Failure mode B: Temporal dilution in long recordings

Raw transcript chunks over long calls collapse topical precision. I added event segmentation and timeline-aware rerank features to prevent retrieval drift.

### Failure mode C: Over-regularized shared space

Pushing too hard for modality invariance erased modality-specific cues. I corrected this with modality-private residuals before shared projection.

### Failure mode D: Version skew and phantom truth

Users were shown semantically perfect but version-stale snippets. I introduced version freshness priors and lineage-aware demotion in ranking.

### Failure mode E: Security and relevance tension

Best semantic hit may be inaccessible. If fallback logic is weak, answer quality appears random. I implemented policy-aware fallback explanations ("closest permitted evidence") to preserve user trust.

## Part X - Why this architecture changes the future roadmap

Most teams frame asset management as a UX problem over storage. I think that is now obsolete.

Once heterogeneous assets are embedded into a policy-safe, auditable shared space, you unlock a different class of systems:

1. **Cross-modal copilots for operations**  
   Agents can ground actions in contracts, KPI sheets, calls, and issue docs in one reasoning loop.

2. **Decision traceability as default**  
   Every generated answer can be decomposed to concrete evidence objects, with replayable policy traces.

3. **Continuous organizational memory**  
   New artifacts are not dead files; they are incremental updates to a live semantic graph.

4. **Model-agnostic intelligence layer**  
   Foundation model swaps become less disruptive because semantic correctness is anchored in IR + retrieval invariants.

5. **From connector economy to representation engineering**  
   Competitive advantage shifts from "we integrate with N tools" to "we preserve semantic invariants under modality and policy constraints."

## Part XI - The scalability implication

There is a direct parallel with broader AI progress: once a representation theorem is operational and the invariants are measurable, progress becomes an engineering scaling problem.

For this system, scaling means:

- more modalities with stable invariants;
- larger indices with bounded latency;
- stronger alignment under tighter policy constraints;
- better online learning from user feedback without semantic drift.

That does not make it trivial. It makes it tractable.

And for enterprise AI, tractable beats magical every time.
