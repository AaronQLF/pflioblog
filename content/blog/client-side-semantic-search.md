---
title: "Client-Side Semantic Search Without an LLM"
date: "2026-03-23"
excerpt: "How I built a TF-IDF search engine that runs entirely in the browser with zero API calls, and why it works better than substring matching for a small blog corpus."
tags: ["Engineering", "Search", "NLP", "Architecture"]
---

I wanted search on this blog to feel semantic rather than lexical. If someone types "neural network safety" I want the interpretability posts to rank high, even if those exact words do not appear together in the title. But I also did not want to call an API, load a 23MB ONNX model in the browser, or add any runtime dependency. The corpus is small, so the solution should be too.

So I built a TF-IDF index at build time and shipped it as static JSON. The browser does cosine similarity at query time. No model, no server, no latency beyond a dictionary lookup and some arithmetic.

## The constraint that shaped the design

The blog is a static Next.js site. Posts are markdown files with YAML frontmatter. The server component reads them at build time, and everything is pre-rendered. There is no backend at runtime.

That means search has to be either purely client-side or pre-computed. I ruled out a few options early:

Substring matching was the previous approach. It works for exact phrases but fails on conceptual queries. Searching "model safety" would miss a post titled "Why Interpretability Is My Lane" even though the entire post is about model safety.

Embedding models in the browser (Transformers.js with something like MiniLM) would give genuinely semantic results but adds ~23MB of ONNX weights to the page load. For fifteen blog posts that is absurd.

Server-side search would require a runtime backend, which defeats the point of a static site.

TF-IDF with cosine similarity is the sweet spot: it captures term importance across the corpus, it runs in microseconds, and the serialized index for fifteen posts is a few kilobytes.

## How TF-IDF actually works

TF-IDF is two multiplied signals.

Term Frequency (TF) measures how often a term appears in a specific document. I use augmented term frequency to prevent bias toward long documents:

`TF(t, d) = 0.5 + 0.5 * (count(t, d) / max_count(d))`

The 0.5 base prevents any term from having zero weight, and dividing by the maximum count in the document normalizes across document lengths.

Inverse Document Frequency (IDF) measures how rare a term is across the entire corpus:

`IDF(t) = log(1 + N / df(t))`

where N is the total number of documents and df(t) is the number of documents containing term t. Terms that appear in every post (like "model" on an AI blog) get low IDF. Terms that appear in only one or two posts get high IDF.

The product TF * IDF gives each term in each document a weight that reflects both local importance and global discriminative power. A term that appears frequently in one post but rarely across the corpus gets a high weight. A term that appears everywhere gets a low weight regardless of local frequency.

## Build-time index construction

At build time, the server reads every markdown file and constructs a TF-IDF vector for each post. The pipeline is:

1. Concatenate title, excerpt, tags, and full markdown body into one text blob per post. Title and tags are included twice to upweight them, since they carry more signal about what a post is actually about.

2. Tokenize: lowercase, strip non-alphanumeric characters, split on whitespace, filter tokens shorter than two characters, and remove stopwords from a curated list of ~100 common English words.

3. Compute document frequency: for each unique term, count how many posts contain it.

4. Compute IDF: `log(1 + N / df)` for each term.

5. Compute TF-IDF vectors: for each post, count term frequencies, normalize by the document maximum, multiply by IDF. The result is a sparse vector (a dictionary from term to weight) per post.

The output is a JSON-serializable object with two fields: an IDF dictionary (term to float) and a docs dictionary (slug to sparse vector). This gets passed as a prop from the server component to the client component at build time. Next.js serializes it into the static HTML payload automatically.

## Client-side query ranking

When the user types a query, the client component runs the same tokenization pipeline on the query text, computes a TF-IDF vector for the query using the pre-built IDF values, and then ranks every post by cosine similarity against the query vector.

Cosine similarity between two sparse vectors is:

`sim(q, d) = dot(q, d) / (|q| * |d|)`

where dot(q, d) sums the products of matching terms, and the magnitudes normalize for vector length. This gives a value between 0 and 1 where 1 means the vectors point in exactly the same direction in term space.

Posts with zero similarity (no term overlap after stopword removal) are filtered out entirely. The remaining posts are sorted by descending similarity score. When the query is empty, posts revert to chronological order.

The entire ranking computation is wrapped in a `useMemo` hook keyed on the query string and the index, so it only recomputes when the user actually changes the search text.

## Why this works better than it sounds

TF-IDF is a 1970s technique. It has no learned representations, no attention heads, no contextual embeddings. But for a small, topically coherent corpus it works surprisingly well, and the reasons are structural.

IDF does most of the heavy lifting. On a blog where every post mentions "AI" and "model," those terms contribute almost nothing to similarity scores. But a term like "connectome" or "interpretability" or "spreadsheet" is highly discriminative. IDF automatically discovers which terms are informative without any training.

The corpus is also small enough that vocabulary coverage is high. With fifteen posts totaling maybe 40,000 words, the IDF dictionary captures essentially every meaningful term. There is no long tail of unseen vocabulary that would require embeddings to handle.

On top of that, double-weighting title and tags acts as a lightweight form of field boosting. A post titled "Mechanistic Interpretability" will rank highly for "interpretability" queries even if the term also appears in other posts, because the title repetition inflates its TF in the target document.

The main failure mode is synonymy: searching "neural net" will not match a post that only uses "neural network" because TF-IDF treats them as unrelated tokens. For a personal blog with consistent vocabulary, this rarely matters. If it did, the fix would be a small synonym map in the tokenizer, not a model upgrade.

## What I chose not to do

I considered stemming (reducing "interpretability" and "interpretable" to the same root) but decided against it. Stemming algorithms like Porter or Snowball are lossy and sometimes merge terms that should stay separate. The corpus is small enough that exact token matching with good stopword removal covers the important cases.

I also considered shipping the raw markdown to the client and doing everything in the browser. But parsing and tokenizing fifteen full posts on every page load is wasteful when the server can do it once at build time and serialize the result. The index is pre-computed; the client only does the query vector and the dot products.

Finally, I considered adding bigram or trigram features to capture multi-word phrases. This would improve precision on queries like "test time compute" but would also balloon the index size quadratically. Not worth it for fifteen posts.

## The result

Search on this blog is now instant, runs entirely in the browser, requires zero network requests, and produces results that feel meaningfully better than substring matching. Typing "safety risk deployment" surfaces the interpretability and AI-concerns posts. Typing "spreadsheet formula" surfaces the asset management post. Typing "fly brain" surfaces the connectome post.

It is not embedding-quality semantic search. It will not understand that "danger" and "risk" are related unless both terms happen to co-occur in the same documents. But for a small, self-authored corpus where I control the vocabulary, TF-IDF with cosine similarity is the right tool: simple math, zero dependencies, and surprisingly good relevance.

Sometimes the 1970s solution is the right one. Knowing when is the hard part.
