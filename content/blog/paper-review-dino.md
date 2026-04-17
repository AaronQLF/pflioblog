---
title: "Paper Review: Emerging Properties in Self-Supervised Vision Transformers (DINO)"
date: "2026-04-15"
excerpt: "Seventh entry in the Paper Review series. Caron et al. (2021) trained a Vision Transformer with self-distillation and no labels, and the attention maps came out looking like segmentation masks. No one told the network what objects were. It figured that out on its own."
tags: ["Paper Review", "AI", "Research", "Machine Learning"]
series: "Paper Review"
seriesOrder: 7
---

Three self-supervised vision papers in a row. At this point it is a subfield retrospective and I am committed to it. "Emerging Properties in Self-Supervised Vision Transformers" (Caron, Touvron, Misra, Jégou, Mairal, Bojanowski, Joulin, ICCV 2021) is the paper that made me take Vision Transformers seriously as representation learners rather than supervised classification machines. MoCo showed that contrastive learning could beat supervised pretraining on transfer tasks. Barlow Twins showed that you could prevent collapse without negative pairs. DINO showed that if you combine self-supervised learning with a Vision Transformer, the network spontaneously learns to segment objects. Nobody asked it to. There is no segmentation loss. The attention maps of the [CLS] token just happen to land on semantically meaningful regions of the image, and the visualizations are striking enough that the paper practically sells itself on Figure 1 alone.

The name is an acronym: self-**di**stillation with **no** labels. I respect a good backronym. I respect the result more.

## The Setup: Self-Distillation Without Labels

DINO is a self-distillation framework. You have two networks: a student and a teacher. Both are Vision Transformers (or ResNets, the paper tests both, but the interesting results are with ViTs). The student receives one augmented view of an image. The teacher receives a different augmented view of the same image. The student is trained to match the teacher's output distribution via cross-entropy.

This sounds like knowledge distillation, and it is, except there are no labels and the teacher is not a larger, pretrained model. The teacher is an exponential moving average of the student's own parameters:

$$\theta_t \leftarrow m \cdot \theta_t + (1 - m) \cdot \theta_s$$

If that looks familiar, it should. It is the same momentum update from MoCo. The difference is what you do with the outputs. MoCo uses the momentum encoder to produce keys for a contrastive loss. DINO uses the momentum teacher to produce soft probability distributions that the student tries to match. There is no contrastive loss, no negative pairs, and no dictionary. The training signal is entirely "make your output look like the teacher's output on a different view of the same image."

Both networks produce output vectors that are passed through a softmax with temperature:

$$P_s(x)_i = \frac{\exp(g_s(x)_i / \tau_s)}{\sum_k \exp(g_s(x)_k / \tau_s)}$$

The teacher uses a lower temperature ($\tau_t = 0.04$) than the student ($\tau_s = 0.1$), producing sharper distributions. The loss is the cross-entropy between the teacher's output and the student's output, summed over all pairs where the student and teacher see different views:

$$\mathcal{L} = \sum_{x \in \{x_1^g, x_2^g\}} \sum_{\substack{x' \in V \\ x' \neq x}} H(P_t(x), P_s(x'))$$

where $x_1^g$ and $x_2^g$ are two global views and $V$ includes both global views and several smaller local crops. The teacher only sees global views. The student sees everything. This asymmetry means the student must learn to predict the global structure of an image from a local crop, which is a strong training signal.

## Avoiding Collapse: Centering and Sharpening

Every self-supervised method needs a collapse prevention mechanism. MoCo uses negative pairs. Barlow Twins uses redundancy reduction. BYOL uses a predictor network and stop-gradient. DINO uses centering and sharpening, which is the simplest mechanism in this list and possibly the most underrated.

The collapse mode in DINO is specific: the teacher could converge to outputting a uniform distribution for every input, or worse, a single dominant dimension for every input. Either way, the student would learn nothing.

Centering subtracts a running mean from the teacher's output before the softmax:

$$g_t(x) \leftarrow g_t(x) - c$$

where $c$ is updated with exponential moving average over batch means. This prevents any single dimension from dominating the output across all images. If the teacher starts collapsing toward a constant vector, centering pulls that constant toward zero, breaking the collapse.

Sharpening is the low teacher temperature ($\tau_t = 0.04$). A low temperature makes the softmax output peaky, concentrating probability on a few dimensions rather than spreading it uniformly. This prevents the uniform distribution collapse mode.

The two mechanisms are complementary. Centering prevents the peaked-on-one-dimension collapse. Sharpening prevents the uniform-over-all-dimensions collapse. Together, they constrain the output to be both non-uniform and non-degenerate, without needing any negative examples. The paper includes ablations showing that removing either one causes training to collapse. Both are necessary. Neither alone is sufficient.

## The Emergent Segmentation

The result that makes DINO famous is not the ImageNet accuracy, though that is strong (77.0% top-1 with ViT-S/16 under linear evaluation, competitive with the best self-supervised methods). It is the attention maps.

In a Vision Transformer, the input image is split into non-overlapping patches. Each patch is treated as a token, and a special [CLS] token is prepended. The [CLS] token attends to all patches via self-attention, and the final [CLS] representation is used as the image-level feature. In a supervised ViT trained on ImageNet classification, the attention maps of the [CLS] token are noisy and distributed. They attend to many patches without clear semantic structure.

In DINO, the [CLS] attention maps cleanly segment the foreground object from the background. Show it a dog, and the attention lands on the dog. Show it a car, and the attention traces the car's silhouette. Show it a scene with multiple objects, and different attention heads attend to different objects. This is not a segmentation model. It was never trained to segment anything. The segmentation is an emergent property of the self-supervised training objective combined with the ViT architecture.

This does not happen with ResNets. The paper tests DINO with both ViT and ResNet backbones, and the emergent segmentation is specific to ViTs. It also does not happen with supervised ViTs. You need both the self-supervised objective and the transformer architecture. The paper's hypothesis is that the self-attention mechanism in ViTs, combined with the local-to-global prediction objective, forces the [CLS] token to learn an explicit spatial decomposition of the scene. The network discovers that the most useful way to represent an image is to figure out where the objects are.

I find this result genuinely surprising, and I do not say that about many results. The standard assumption in self-supervised learning is that you train a feature extractor and then attach task-specific heads for downstream tasks. Segmentation is a downstream task. You are not supposed to get it for free from the pretraining objective. The fact that DINO does suggests that object-level scene decomposition is not just a useful inductive bias that we impose on models through labeled training data. It might be a natural consequence of learning to predict the structure of images at sufficient scale with sufficient architectural flexibility.

## The Multi-Crop Strategy

DINO uses a multi-crop augmentation strategy that deserves attention because it is doing more work than it appears. The standard approach in contrastive learning is to create two augmented views of each image, both covering a large portion of the original. DINO creates two global crops (covering 50% or more of the image) and several local crops (covering around 5% of the image). The teacher only processes the global crops. The student processes all crops.

This means the student has to predict what the teacher sees in the full image from a tiny 5% patch. If the student gets a crop of a dog's ear, it must produce a representation consistent with the teacher's representation of the entire dog. This is a much harder learning problem than matching two large crops, and it forces the network to learn representations that generalize from parts to wholes.

The multi-crop strategy also helps computationally. The local crops are small (96x96 versus 224x224 for global crops), so the encoder processes them cheaply. You get eight training signal pairs per image (two global, six local or so) at roughly the cost of processing three full-resolution views. More signal, less compute. This is the kind of design choice that separates good engineering from paper-writing.

## Where I Push Back

DINO inherits the momentum teacher from MoCo, and I have the same concern here that I have with all momentum-based methods: the momentum coefficient is doing substantial work and the paper does not fully characterize its interaction with other hyperparameters. The paper uses $m = 0.996$ at the start of training, increasing to $m = 1.0$ following a cosine schedule. This schedule means the teacher eventually stops updating entirely, freezing to whatever parameters it reached. The justification is that by late training the student has converged and the teacher should stabilize. But this is an assumption about the training dynamics, not a proven property. If training is not well-behaved in the late stages, a frozen teacher could lock in suboptimal representations.

The centering mechanism uses an exponential moving average with $c$ updated as $c \leftarrow mc + (1-m) \bar{g}_t$ over batch means. This makes the collapse prevention dependent on batch statistics. Small batches produce noisy estimates of the center, which could either fail to prevent collapse or over-correct and damage the training signal. The paper's experiments use batch sizes of 1024. Whether DINO works at batch size 64 is not established, and given how critical centering is to preventing collapse, this is a meaningful gap.

The emergent segmentation is visually compelling, but the paper's quantitative evaluation of it is thin. The attention maps are shown as qualitative visualizations and evaluated on a video object segmentation benchmark (DAVIS 2017) where they achieve strong results. But there is no systematic evaluation of how well the attention maps correspond to ground-truth segmentation masks on a standard benchmark like PASCAL VOC or COCO. The paper is making a strong claim, that ViTs trained with DINO learn to segment objects, but supporting it primarily with visualizations and a single downstream task. Later work (including the authors' own DINOv2) addressed this more rigorously, but in the original paper the evidence does not fully match the ambition of the claim.

There is also the question of computational cost. DINO with ViT-B/16 trains for 300 epochs on ImageNet. The paper reports 3 days on 16 A100 GPUs for ViT-S/16. This is not MoCo-on-8-GPUs accessible. The multi-crop strategy, the momentum teacher updates, and the ViT architecture itself all add cost. The method is elegant, but it is not cheap, and the best results require the larger ViT-B backbone which scales the cost further.

## Why This Paper Matters

DINO occupies a specific and important position in the self-supervised learning timeline. It appeared in 2021, after MoCo (2020), SimCLR (2020), BYOL (2020), and Barlow Twins (2021). By that point, the field had established that self-supervised methods could match or beat supervised pretraining on linear evaluation and transfer benchmarks. The question was no longer "does self-supervised learning work?" but "what else does it give you beyond a good feature extractor?"

DINO's answer, emergent object segmentation, was qualitatively different from anything the prior methods produced. It suggested that the right combination of architecture and training objective could give rise to capabilities that were never explicitly optimized for. This is a stronger claim than "good features." It is a claim about what networks can discover on their own when you give them the right structure and the right learning signal.

The paper also established Vision Transformers as the preferred backbone for self-supervised learning, a position they have held since. The follow-up, DINOv2 (2023), scaled the approach to ViT-g with 1.1 billion parameters trained on 142 million curated images, and produced what is arguably the best general-purpose visual feature extractor available. DINOv2 features transfer well to classification, segmentation, depth estimation, and retrieval without fine-tuning. The trajectory from DINO to DINOv2 is a clean line. The core ideas, self-distillation, momentum teacher, multi-crop training, centering, all survived scaling. That is rare. Most methods break when you make them bigger. DINO's held up.

What stays with me about this paper is the attention maps. I have read hundreds of papers with quantitative results tables, and I forget most of them. I do not forget those visualizations. There is something unsettling about a network that was never told what objects are, producing attention patterns that trace object boundaries with the precision of a human annotator. It is not understanding. I am not making that claim. But it is something, and I do not have a clean word for what that something is. "Emergence" is overused. "Feature learning" is too clinical. Whatever it is, DINO makes it visible, and that visibility is why the paper mattered more than its accuracy numbers ever could.

*Seventh entry in the Paper Review series. Previous: Barlow Twins.*
