---
title: "Mapping My Own Writing in Embedding Space"
date: "2026-04-08"
excerpt: "I built a 3D visualization that maps every post on this blog as a vector from the origin, positioned by semantic similarity. Local embeddings, PCA to three dimensions, no API keys. Here is how it works and what it reveals."
tags: ["AI", "Engineering", "Embeddings", "Architecture"]
---

I spent a non-trivial amount of time staring at my own blog posts arranged in three-dimensional space. Not reading them. Looking at where they ended up relative to each other when a sentence transformer decided what they meant.

The result is the [post galaxy](/blog/galaxy), a page on this site where every post is a ray from the origin, color-coded by topic, positioned by semantic content. Posts about interpretability cluster together. Posts about engineering systems cluster together. The trading posts sit off on their own. All of this was computed at build time using a model that runs locally, with no API key and no runtime inference.

This post covers what the visualization actually represents, the math behind the pipeline, and the design decisions I made along the way.

## The idea

I wrote a [post about TF-IDF search](/blog/client-side-semantic-search) on this blog a few weeks ago. That system works well for retrieval, but it does not give you a spatial intuition for how your writing relates to itself. Tags are one-dimensional labels. Chronological order tells you when something was written, not what it is about.

What I wanted was a literal map. Something where proximity means semantic similarity, where you can orbit the space and see that the interpretability posts form a cluster, the engineering posts form a different cluster, and the paper reviews sit somewhere in between because they mix both vocabularies.

Embedding models give you exactly this: a function from text to high-dimensional vectors where cosine similarity correlates with semantic relatedness. The problem is that 384 dimensions do not fit on a screen. The solution is dimensionality reduction.

## The embedding step

Each post is fed through `all-MiniLM-L6-v2`, a 22-million parameter sentence transformer from the SBERT family. It runs locally via `@xenova/transformers`, which is an ONNX port of the Hugging Face model that executes in Node.js without a GPU and without any API calls.

For each post, I concatenate the title, excerpt, tags, and a truncated version of the body (first 8000 characters) into a single text blob. The model encodes this into a 384-dimensional unit vector. The output is a matrix $X \in \mathbb{R}^{n \times 384}$ where $n$ is the number of posts.

The model uses mean pooling over the token embeddings followed by L2 normalization, so each row of $X$ lies on the unit hypersphere. Cosine similarity between any two posts is just their dot product:

$$\text{sim}(x_i, x_j) = x_i \cdot x_j$$

This is the fundamental structure I want to preserve (or at least approximate) in three dimensions.

## PCA: why it works here

I use Principal Component Analysis to reduce from 384 dimensions to 3. PCA finds the orthogonal directions of maximum variance in the centered data and projects onto them.

Given the centered matrix $\bar{X} = X - \mu$ where $\mu$ is the column-wise mean, PCA computes the singular value decomposition:

$$\bar{X} = U \Sigma V^T$$

The columns of $V$ are the principal components (eigenvectors of the covariance matrix $\bar{X}^T \bar{X}$). The projected coordinates are:

$$Z = \bar{X} V_k$$

where $V_k$ is the first $k$ columns of $V$ (here $k = 3$). Each row of $Z$ is a 3D point.

The key property is that PCA maximizes preserved variance. The first principal component captures the direction of greatest spread in the data. The second captures the greatest spread orthogonal to the first. And so on. For this corpus, PC1 captures about 14% of the total variance, PC2 about 9.4%, and PC3 about 7.8%. Together, the first three components capture roughly 31% of the total variance in the embedding matrix.

That number sounds low if you are used to PCA on tabular data. It is actually reasonable for embeddings. Sentence embeddings distribute information across many dimensions without concentrating it in a few. The important thing is that the 31% captured is the 31% that differentiates posts the most. The discarded 69% is primarily within-cluster variance and noise dimensions that do not help separate topics.

There is a subtlety here. PCA preserves Euclidean distances, not cosine similarities. Because the embeddings are L2-normalized, Euclidean distance and cosine distance are monotonically related:

$$x_i - x_j^2 = 2(1 - x_i \cdot x_j)$$

After centering, this exact relationship breaks (the centered vectors are no longer unit-length). The spatial relationships in the 3D projection are an approximation. Neighbors in the projection are likely neighbors in the full space, but the distances are not perfectly preserved. For a visualization with 23 data points, this is fine. I am not claiming metric accuracy. I am claiming topological fidelity: posts that are semantically similar land near each other, and the clusters are real.

## Why not UMAP or t-SNE

Both are popular alternatives for embedding visualization. t-SNE optimizes a KL divergence between high-dimensional and low-dimensional neighborhood probability distributions. UMAP approximates a fuzzy topological structure. Both produce tighter, more visually separated clusters than PCA.

I chose PCA for three reasons.

First, PCA is deterministic. Same input, same output, every time. t-SNE and UMAP involve random initialization and iterative optimization, meaning the map changes between builds. For a static site where the visualization is cached and served as bundled JSON, determinism matters.

Second, PCA is a linear projection. The axes in the 3D space are literal linear combinations of the original 384 embedding dimensions. This means the coordinate system has a (loosely) interpretable direction, even if individual principal components do not have clean semantic labels. t-SNE and UMAP coordinates have no such interpretation. They are arbitrary up to rotation, scaling, and sometimes topology-destroying distortions.

Third, with 23 data points, the cluster structure is coarse enough that PCA captures it without help. UMAP shines when you have thousands of points and subtle manifold geometry. Here, the clusters are already well-separated in the high-dimensional space. PCA does not need to work hard.

## Post-processing

After PCA, I center the 3D coordinates at the origin and uniformly scale so the furthest point has a distance of 5 units. This ensures the visualization fills the viewport consistently regardless of the actual PCA score magnitudes.

For cluster assignment, each post is labeled with its most informative tag (the tag that appears on 2 or more posts, excluding overly broad ones like "AI" that would assign 18 out of 23 posts to the same cluster). Each cluster gets a color from a fixed palette. Posts whose most specific tag is unique get a neutral gray.

Region labels are placed at the centroid (arithmetic mean of 3D coordinates) of all posts sharing that cluster tag. A minimum-distance check prevents labels from overlapping. The labels are rendered as billboard text in the Three.js scene, always facing the camera.

## The rendering

The visualization uses `react-three-fiber` (a React renderer for Three.js) with `@react-three/drei` for controls and text. Each post is a thin `Line` from the origin to its PCA coordinates with a small emissive sphere at the tip. The spheres glow slightly using `toneMapped={false}` and emissive material, which keeps them visible against the black background without adding a bloom post-processing pass.

When you hover a ray, all posts outside the hovered post's cluster dim to near-invisibility. This is the most useful interaction: it lets you isolate a topic and see which posts the model groups together.

The entire data payload (coordinates, clusters, colors, legend, regions) is a static JSON file generated at build time and imported directly into the component bundle. There is no fetch request, no loading state beyond the initial JS parse. The Three.js scene initializes, the data is already in memory, and the first frame renders immediately.

## What it reveals

The interpretability posts (sparse autoencoders, mechanistic interpretability, Claude emotions) form a tight cluster. That is not surprising since they share vocabulary, citations, and conceptual framing.

The engineering posts (systematic trading, meta engineering, tech debt, this blog's own search system) cluster separately. They share almost no vocabulary with the interpretability work, and the model captures that.

The paper reviews sit between the research cluster and the general AI cluster, which makes sense: they discuss research topics but in a different register than the deep dives.

The posts I find most interesting are the ones that do not cluster cleanly. The autism post sits on its own. The doing-hard-things post sits on its own. These are the posts with the most idiosyncratic vocabulary, the ones where I am not writing about a technical domain but about something personal. The model correctly identifies them as outliers.

## What it does not reveal

Three dimensions cannot capture 384 dimensions of structure. Posts that appear adjacent in the projection might not be nearest neighbors in the full embedding space. The projection discards roughly 69% of the variance, and some of that discarded variance encodes real distinctions.

The model also has its own biases. `all-MiniLM-L6-v2` was trained on a mix of NLI and STS data. It understands general English semantic similarity well, but it does not have specialized knowledge of my writing style or my particular use of technical terms. Two posts that I consider deeply related for reasons the model cannot see (shared intellectual lineage, for instance) might land far apart.

The clustering is also tag-based, not embedding-based. I assign colors using the post's most informative tag, not by running k-means on the 3D coordinates. This means the color groupings are editorial, not geometric. In practice they correlate well because the tags reflect the content, but it is an important distinction.

## The build pipeline

The full pipeline runs as a `prebuild` script before `next build`:

1. Read every `.md` file from `content/blog/`
2. Concatenate title, excerpt, tags, and body into text per post
3. Batch-embed all texts with `all-MiniLM-L6-v2` via `@xenova/transformers`
4. Run PCA on the embedding matrix, take first 3 components
5. Center and scale the 3D coordinates
6. Compute cluster assignments, colors, region centroids
7. Write `src/generated/post-galaxy-3d.json`

The model files cache under `.cache/transformers/`. First run downloads about 23MB from Hugging Face. Subsequent runs (including CI) load from cache. The embedding step for 23 posts takes under 10 seconds on a laptop CPU. The entire script, including model load, finishes in about 6 seconds on a warm cache.

The output JSON is roughly 6KB. It is imported at bundle time, not fetched at runtime. The galaxy page loads the same way any other static page on this site loads.

## Why I find this satisfying

There is a closed loop here that appeals to me. I write about embeddings and vector spaces and cosine similarity in my research posts. Then I use those exact techniques to visualize the posts themselves. The tool is the subject. The map is made of the same math it depicts.

It also forces honesty. If two posts cluster together, it is because they use similar language to discuss similar concepts. If a post sits alone, it is because it is genuinely different from everything else I have written. The model does not care about my editorial intentions. It reads the text and places the vector.

The whole system runs locally, ships as static data, requires no API keys, and adds zero runtime cost. For a blog that already has a TF-IDF search index built the same way, adding an embedding-based spatial map felt like the natural next step. Same philosophy, higher-dimensional tool, different output.