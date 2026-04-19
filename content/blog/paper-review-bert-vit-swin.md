---
title: "Paper Review: BERT, ViT, and Swin — How the Transformer Encoder Colonized Vision"
date: "2026-04-19"
excerpt: "Eleventh entry in the Paper Review series. Devlin et al. (2018) showed that a bidirectional Transformer encoder pretrained with masked language modeling could dominate every NLP benchmark simultaneously. Dosovitskiy et al. (2020) asked whether the same architecture could replace convolutions for images. Liu et al. (2021) answered the follow-up question: how do you make it work for dense prediction? Together, these three papers trace the path from a language-specific encoder to a universal visual backbone."
tags: ["Paper Review", "AI", "Research", "Transformers"]
series: "Paper Review"
seriesOrder: 11
---

This is a review of three papers that belong together. Not because they share authors or methods, but because they trace a single idea across domains and each one answers the question that the previous one left open.

"BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding" (Devlin, Chang, Lee, Toutanova, NAACL 2019) introduced the pretrain-then-fine-tune paradigm for NLP using a bidirectional Transformer encoder. "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale" (Dosovitskiy et al., ICLR 2021) took that same encoder and applied it to images with minimal modification. "Swin Transformer: Hierarchical Vision Transformer using Shifted Windows" (Liu et al., ICCV 2021) fixed the scaling problem that ViT introduced and produced the first Transformer backbone that could serve as a drop-in replacement for CNNs across all of computer vision.

The arc is: BERT proved that a generic Transformer encoder, pretrained on unlabeled data, could dominate a field. ViT proved that the same architecture could cross domain boundaries. Swin proved that crossing domain boundaries required respecting the target domain's structural constraints, at least partially. Each step is instructive. The mistakes are as informative as the successes.

## BERT: The Encoder Side of the Ledger

By the time I reviewed Attention Is All You Need in this series, I noted that the Transformer was originally an encoder-decoder architecture for translation. The decoder side got most of the attention (GPT, GPT-2, the entire autoregressive language model lineage). BERT is what happens when you take the encoder side seriously.

The key design decision is bidirectionality. GPT (Radford et al., 2018) used the Transformer decoder: each token can only attend to previous tokens, because the model is trained to predict the next token autoregressively. This means the representation of any given token incorporates information only from the left context. BERT uses the Transformer encoder: each token attends to all other tokens in both directions. The representation of any given token incorporates the full sentence.

This is a strictly more informative representation for tasks that do not require generation. If you are classifying sentiment, extracting entities, or answering questions, you want the model to see the entire input before producing a representation. A left-to-right model that processes "The movie was not good" must represent "not" before it has seen "good." A bidirectional model represents them jointly, which is obviously better for understanding negation.

The problem with bidirectional models is training. You cannot use next-token prediction because the model can see the next token. BERT solves this with masked language modeling (MLM): randomly mask 15% of the input tokens and train the model to predict the masked tokens from context. The task is a fill-in-the-blank exercise at scale.

$$\mathcal{L}_{\text{MLM}} = -\mathbb{E}_{x \sim D} \sum_{i \in \mathcal{M}} \log P(x_i \mid x_{\setminus \mathcal{M}})$$

where $\mathcal{M}$ is the set of masked positions and $x_{\setminus \mathcal{M}}$ is the input with masked tokens replaced. Of the 15% selected tokens, 80% are replaced with [MASK], 10% are replaced with a random token, and 10% are left unchanged. The 80/10/10 split is a pragmatic fix for the train-test discrepancy: the [MASK] token never appears at inference time, so training exclusively on [MASK] tokens would create a distribution mismatch.

BERT also uses a next sentence prediction (NSP) objective: given two segments, predict whether the second segment follows the first in the original document. This was intended to help with tasks like question answering and natural language inference that require reasoning about sentence pairs. It turned out to be the weakest part of the paper. RoBERTa (Liu et al., 2019) showed that removing NSP and training longer with more data produced better results. The lesson: the masked language modeling objective was carrying the weight. NSP was noise.

### What BERT Actually Changed

The results were immediate and comprehensive. BERT-Large (340M parameters) set new state-of-the-art results on 11 NLP benchmarks simultaneously. On GLUE, it achieved 80.5 (7.7 points above the previous best). On SQuAD 1.1, it surpassed human performance by 2 F1 points. On SQuAD 2.0, it improved the previous best by 5.1 F1.

But the numbers are not the real contribution. The real contribution is the paradigm. Before BERT, NLP practitioners trained task-specific architectures from scratch for each task: a CNN for text classification, a sequence labeling model for NER, a reading comprehension architecture for QA. Each task had its own model, its own training procedure, its own engineering. BERT replaced all of this with a single recipe: pretrain a large Transformer encoder on unlabeled text, then fine-tune with a task-specific head (usually a single linear layer) on labeled data.

This is the pretrain-then-fine-tune paradigm, and it restructured the entire field. The cost of entering a new NLP task dropped from "design an architecture and train it for weeks" to "add a linear layer on top of BERT and train for an afternoon." Feature engineering largely disappeared. Task-specific architectures largely disappeared. The field consolidated around a single backbone, and the competition shifted from architecture design to data curation and scale.

### Where BERT Falls Short

BERT's masked language modeling objective has a subtle problem that took time to appreciate. The model is trained to predict individual masked tokens independently. The predictions for different masked positions within the same sentence do not condition on each other. If "New" and "York" are both masked, the model predicts each one separately, without knowing what it predicted for the other. This means the model can predict "New" at one position and "Jersey" at the other, assigning high probability to an inconsistent reconstruction.

XLNet (Yang et al., 2019) addressed this by training on all possible permutations of the factorization order, which captures inter-token dependencies among masked positions. The improvement was marginal, which suggests the independent prediction assumption is not catastrophic in practice, but it is theoretically inelegant.

The deeper limitation is that BERT is an encoder. It produces representations. It does not generate text. The entire GPT lineage, from GPT-2 through GPT-4, uses the decoder architecture precisely because generation requires autoregressive factorization, which requires causal masking, which requires the decoder. BERT can fill in blanks. It cannot write paragraphs. This is not a flaw in BERT. It is a scope decision. But it means BERT's architectural influence was bounded: it dominated understanding tasks for several years, but the future of language modeling belonged to decoders.

BERT's lasting contribution is the paradigm, not the architecture. Every modern LLM still uses pretraining on unlabeled data followed by task-specific adaptation (whether fine-tuning, prompting, or RLHF). BERT did not invent transfer learning, but it demonstrated it at a scale and generality that forced the field to reorganize around it.

## ViT: What If Images Were Just Token Sequences?

Two years after BERT, a team at Google Brain asked a question that sounds almost reckless: what if you just applied the Transformer encoder to images, with no convolutions at all?

The setup is simple. Take an image of resolution $H \times W$. Divide it into non-overlapping patches of size $P \times P$. Flatten each patch into a vector and project it to the model dimension with a linear embedding. Prepend a learnable [CLS] token. Add learnable position embeddings. Feed the resulting sequence of tokens into a standard Transformer encoder. Read out the [CLS] token for classification.

That is ViT. There is no convolutional layer, no pooling layer, no multiscale feature hierarchy. The image is a sequence of patches, and the Transformer processes it exactly as it would process a sequence of word tokens. The patch embedding replaces the word embedding. Everything else is identical.

$$z_0 = [x_{\text{class}}; \; x_p^1 E; \; x_p^2 E; \; \cdots; \; x_p^N E] + E_{\text{pos}}$$

where $x_p^i$ is the flattened $i$-th patch, $E \in \mathbb{R}^{(P^2 \cdot C) \times D}$ is the patch embedding projection, and $E_{\text{pos}} \in \mathbb{R}^{(N+1) \times D}$ is the position embedding.

The number of tokens is $N = HW / P^2$. For a 224x224 image with 16x16 patches, that is 196 tokens. For a 384x384 image, 576 tokens. The quadratic cost of self-attention applies to this sequence length, so increasing resolution or decreasing patch size quickly becomes expensive.

### The Inductive Bias Tradeoff

ViT's most significant intellectual contribution is making explicit a tradeoff that was previously implicit.

CNNs have strong inductive biases for images: locality (a pixel is processed in the context of its spatial neighbors), translation equivariance (the same filter applied everywhere), and hierarchical composition (small features compose into larger features through pooling). These biases encode prior knowledge about the structure of images: nearby pixels are correlated, patterns can appear anywhere, and visual concepts are compositional.

ViT has almost none of these biases. Self-attention is global from the first layer: every patch can attend to every other patch. There is no translation equivariance beyond what the model learns from data. There is no hierarchical feature construction. The position embeddings are learnable and carry no spatial structure beyond what the model discovers during training.

The hypothesis the paper tests is that with enough data, the generic architecture outperforms the specialized one. The data has to do the work that the inductive biases used to do.

The results support this hypothesis, with a critical caveat. When trained on ImageNet alone (1.3 million images), ViT-Large underperforms a well-tuned ResNet (BiT). When pretrained on ImageNet-21k (14 million images), ViT matches the ResNet. When pretrained on JFT-300M (300 million images, Google's proprietary dataset), ViT-Huge surpasses the ResNet by a clear margin, reaching 88.55% top-1 on ImageNet.

The pattern is consistent: ViT needs more data than CNNs to reach the same performance, but it scales better with data. Below a data threshold, the CNN's inductive biases are a net advantage. Above the threshold, they become a constraint, limiting the model's ability to learn representations that the biases do not anticipate.

This finding had implications beyond computer vision. It suggested a general principle: architectures with fewer inductive biases require more data but achieve higher ceilings. The Transformer is the extreme case — minimal structural assumptions, maximum data requirements, maximum ceiling. This principle helps explain why the Transformer won across domains: the data kept growing, and the architecture with the highest ceiling eventually dominated.

### What ViT Cannot Do

ViT as presented in the original paper is a classification model. The [CLS] token aggregates global information, and a linear head produces class logits. This is sufficient for ImageNet but not for the tasks that dominate practical computer vision: object detection, instance segmentation, semantic segmentation, depth estimation.

These tasks require dense prediction: an output at every spatial position, not just a single label for the entire image. CNNs handle this through feature pyramids — networks like ResNet naturally produce features at multiple scales (1/4, 1/8, 1/16, 1/32 of the input resolution) due to their pooling and stride structure. Detection and segmentation architectures (Faster R-CNN, Mask R-CNN, FPN, U-Net) rely on these multiscale features.

ViT produces a single-scale feature map. All patch tokens exist at the same resolution (1/16 for 16x16 patches). There is no hierarchy. There is no multiscale representation. You cannot plug ViT into Faster R-CNN and expect it to work, because the detection framework expects feature maps at 4 or 5 different scales.

This is the problem that Swin Transformer solves.

## Swin: The Hierarchical Compromise

"Swin Transformer: Hierarchical Vision Transformer using Shifted Windows" (Liu et al., ICCV 2021, Best Paper) asks a pointed question: can you get the Transformer's representation power with the CNN's structural properties?

The answer is yes, if you are willing to reintroduce some of the structure that ViT discarded. Swin makes two key design decisions: windowed attention and hierarchical feature maps.

### Windowed Attention

In ViT, self-attention is global: every patch attends to every other patch. The cost is $O(N^2)$ where $N = HW/P^2$. For high-resolution images, this is prohibitive. A 1024x1024 image with 4x4 patches produces 65,536 tokens. Global attention over 65,536 tokens requires $65536^2 \approx 4.3 \times 10^9$ pairwise interactions per layer per head.

Swin restricts attention to local windows. The feature map is partitioned into non-overlapping windows of $M \times M$ patches (the paper uses $M = 7$). Self-attention is computed independently within each window. The cost per window is $O(M^2)$, and there are $HW / (M^2 P^2)$ windows, so the total cost is $O(HW \cdot M^2 / P^2)$, which is linear in the image resolution $HW$.

This is a significant reduction. For the 1024x1024 example, window attention with $M = 7$ costs $O(65536 \times 49) \approx 3.2 \times 10^6$, three orders of magnitude cheaper than global attention. The model can process high-resolution images without memory explosion.

But windowed attention has an obvious problem: patches in different windows cannot communicate. The receptive field is limited to the window size. Information cannot flow between windows within a single layer. This is the same isolation problem that motivated Transformer-XL's segment-level recurrence, transposed from sequence position to spatial position.

### Shifted Windows

Swin's solution is elegant. In alternating layers, the window partition is shifted by $(M/2, M/2)$ patches. A window in layer $l$ covers one spatial region. The corresponding window in layer $l+1$ straddles the boundaries of four windows from layer $l$. Patches that were isolated in different windows in layer $l$ are now within the same window in layer $l+1$.

Over two consecutive layers, every patch can communicate with patches up to $M$ positions away. Over $2L$ layers, the effective receptive field grows to $L \times M$ in each spatial direction. The shifted window pattern creates cross-window connections without any additional attention computation.

The implementation requires handling the boundary conditions where shifted windows extend beyond the feature map. The paper uses a cyclic shift and attention masking to avoid padding. The feature map is rolled so that partial windows at the boundaries are combined into full windows, and a mask ensures that attention does not cross the original spatial boundaries within these composite windows. It is a clean computational trick that avoids any overhead from variable-size windows.

### Hierarchical Feature Maps

Swin constructs a multiscale feature hierarchy by merging patches between stages. The architecture has four stages. Stage 1 operates on $H/4 \times W/4$ tokens (with an initial $4 \times 4$ patch embedding). Between stages, a patch merging layer concatenates $2 \times 2$ groups of adjacent tokens and projects them to twice the channel dimension, halving the spatial resolution and doubling the feature dimension at each stage.

The result is feature maps at resolutions $H/4$, $H/8$, $H/16$, and $H/32$ — exactly the same multiscale structure that a ResNet produces. This means Swin can be used as a drop-in backbone replacement in any CNN-based detection or segmentation framework. You remove the ResNet, insert the Swin Transformer, and the downstream architecture (FPN, Mask R-CNN, UPerNet) works without modification.

This is not a minor engineering convenience. It is what made Swin the first Transformer that the computer vision community actually adopted for dense prediction tasks. ViT proved the concept. Swin made it practical.

### The Results

On ImageNet-1K classification, Swin-Tiny (29M parameters) achieves 81.3% top-1, compared to 79.8% for a similarly sized DeiT (a ViT variant with improved training). Swin-Base achieves 83.5%, Swin-Large 86.4% with ImageNet-22K pretraining.

The classification numbers are solid but not the point. The point is dense prediction. On COCO object detection, Swin-Large achieves 58.7 box AP with a Cascade Mask R-CNN framework, surpassing the previous best by 2.7 points. On ADE20K semantic segmentation, 53.5 mIoU with UPerNet. These were substantial margins over CNN backbones, and they came from simply replacing the backbone while keeping the downstream architecture identical.

Swin demonstrated that the Transformer's advantage was not specific to classification, where ViT had already shown strong results. The advantage extended to detection, segmentation, and other dense tasks, provided the architecture respected the structural requirements (multiscale features, manageable compute) that those tasks impose.

## The Arc Across Three Papers

There is a clean narrative through these three papers, and it is not just chronological.

BERT discovered the pretrain-then-fine-tune paradigm for Transformer encoders. The insight was that a large encoder trained with a self-supervised objective on unlabeled data produces representations that transfer across tasks. BERT was language-specific only because the training data was text and the pretext task was masked language modeling. The architecture itself was domain-agnostic.

ViT tested whether that domain agnosticism was real. Could you take essentially the same encoder, feed it image patches instead of word tokens, and get competitive results? The answer was yes, with enough data. ViT's intellectual contribution was demonstrating that the Transformer's success in NLP was not an artifact of language-specific inductive biases. The architecture was genuinely general.

Swin addressed the engineering gap between generality and utility. ViT was general but impractical for most vision tasks because it lacked multiscale features and scaled quadratically with resolution. Swin reintroduced the hierarchical structure and local processing that vision tasks require, but implemented them with Transformer blocks rather than convolutions. The result was the best of both worlds: the Transformer's representational power with the CNN's structural suitability.

There is a pattern here that I find instructive. The initial transfer of an architecture to a new domain is often a minimal adaptation: just apply the existing architecture, as-is, to the new data. This works as a proof of concept but is rarely optimal. The follow-up work introduces domain-specific structure, not to compromise the generality, but to make the generality tractable. The Transformer did not need to become a CNN to work for vision. But it did need to learn something from the CNN's design: that visual tasks operate at multiple scales, and that processing a high-resolution image in its entirety with global attention is computationally absurd.

The question of how much domain-specific structure to inject is one of the most important open questions in architecture design. Too little, and the model requires impractical amounts of data and compute (ViT trained on ImageNet-1K). Too much, and the model's ceiling is limited by the structural assumptions (CNNs trained on ImageNet-1K). The right answer changes as data and compute scale. What was "too little structure" in 2020 might be "the right amount" in 2026 with 100x more data. The target is moving, and this is why the architecture question is never permanently settled.

## What I Think About This Now

I wrote in my review of Attention Is All You Need that the Transformer won because it matched the hardware. The BERT-ViT-Swin progression adds a second dimension: the Transformer also won because its generality enabled a transfer of knowledge across domains that specialized architectures could not support. A ResNet pretrained on ImageNet gives you good visual features. A ViT pretrained on ImageNet gives you good visual features that live in the same representational space as a text encoder's features, which is why CLIP works, which is why multimodal LLMs work, which is why a single architecture can process images, text, audio, and video in a unified framework.

The unification of modalities under a single architecture is, in retrospect, the most consequential outcome of the BERT-to-ViT migration. It was not planned. Dosovitskiy et al. were trying to match ResNets on ImageNet, not enable GPT-4V. But by showing that images could be tokenized and processed by the same architecture that processes text, they opened the door to architectures that process both simultaneously. Swin's contribution was making that architecture practical enough for the vision community to adopt it, which generated the pretrained checkpoints, the training recipes, and the institutional knowledge that multimodal models later built on.

This is another instance of the pattern I keep noticing: the most important consequences of an architecture paper are often not the ones the authors intended. Vaswani et al. intended to improve machine translation. Devlin et al. intended to improve NLP benchmarks. Dosovitskiy et al. intended to match CNNs on ImageNet. Liu et al. intended to make ViTs work for dense prediction. What they collectively produced was the architectural foundation for multimodal AI. Nobody planned that. The architecture's generality made it possible, and the field's incremental progress made it inevitable.

*Eleventh entry in the Paper Review series. Previous: S4 and Mamba.*
