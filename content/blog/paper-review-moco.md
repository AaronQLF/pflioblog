---
title: "Paper Review: Momentum Contrast for Unsupervised Visual Representation Learning"
date: "2026-04-15"
excerpt: "Fifth entry in the Paper Review series. He et al. (2020) framed contrastive learning as dictionary lookup and solved the batch size problem with a queue and a momentum encoder. The result is a self-supervised method that beat supervised pretraining at transfer learning. This one is pure engineering elegance."
tags: ["Paper Review", "AI", "Research", "Machine Learning"]
series: "Paper Review"
seriesOrder: 5
---

This series has been NLP-heavy, and I want to correct that. "Momentum Contrast for Unsupervised Visual Representation Learning" (He, Fan, Wu, Xie, Girshick, 2020) is a computer vision paper, and more importantly it is a paper about one of my favorite topics in machine learning: learning representations without labels. The core question is deceptively simple. Can you train a neural network to understand images without ever telling it what is in them? MoCo says yes, and the way it gets there involves a queue, a slowly-moving encoder, and an insight about dictionaries that I find unreasonably satisfying.

I do not know any of the authors personally on this one, which is probably healthy for this series. Five papers in and three with personal connections was starting to look like nepotism rather than taste.

## The Problem: Batch Size as a Bottleneck

Contrastive learning works by teaching a network to distinguish between similar and dissimilar things. Take an image, augment it twice with random crops, color jitter, and blur. The two augmented versions are a positive pair. Every other image in the batch is a negative. Train the network to pull positives together and push negatives apart in embedding space.

![Illustration of contrastive learning showing positive pairs from augmented views of the same image](https://sthalles.github.io/assets/contrastive-self-supervised/positives-pairs.png)

The loss function for this is InfoNCE, which treats the problem as a (K+1)-way classification: given a query, identify the one positive key among K negatives.

$$\mathcal{L}_q = -\log \frac{\exp(q \cdot k^+ / \tau)}{\sum_{i=0}^{K} \exp(q \cdot k_i / \tau)}$$

The catch is that this loss gets better with more negatives. A larger K means a richer dictionary for the network to discriminate against, which means better representations. SimCLR, the other major contrastive method from the same year, solved this by using enormous batch sizes, 4096 or 8192. Each sample in the batch provides negatives for every other sample. The math works out, but the engineering is brutal. You need a cluster of TPUs to fit batch sizes that large. This is not a method that scales democratically.

![How negative pairs are constructed in contrastive learning by pairing each sample against all others in the batch](https://sthalles.github.io/assets/contrastive-self-supervised/negative-pairs.png)

MoCo asks a different question. What if the number of negatives did not have to equal the batch size?

## The Dictionary Lookup Framing

The key insight is to reframe contrastive learning as dictionary lookup. You have a query (an encoded image), and you want to match it against its positive key while rejecting a large set of negative keys. The dictionary is the set of all keys. In SimCLR, the dictionary is the current batch. In MoCo, the dictionary is a queue.

The queue is a FIFO buffer of 65,536 encoded representations from previous mini-batches. When a new batch comes in, its encoded keys are enqueued and the oldest batch is dequeued. This decouples the dictionary size from the batch size entirely. You can train with a batch size of 256 and still have 65,536 negatives. The memory cost is storing the encoded representations, not the gradients.

But there is a problem. If the encoder is changing every gradient step, the keys in the queue become stale. A key encoded five hundred steps ago was produced by a substantially different network than the one encoding the current query. Comparing queries from the current encoder against keys from an old encoder is like comparing distances measured with a ruler that keeps changing length. The dictionary is large but inconsistent.

## The Momentum Encoder

This is where the second piece of the design comes in. MoCo uses two encoders: a query encoder $f_q$ that is trained normally via backpropagation, and a key encoder $f_k$ that is updated via exponential moving average of the query encoder's parameters:

$$\theta_k \leftarrow m \cdot \theta_k + (1 - m) \cdot \theta_q$$

where $m = 0.999$. At each step, only 0.1% of the query encoder's weights are blended into the key encoder. The key encoder changes slowly enough that the representations in the queue remain approximately consistent, even across hundreds of steps. The queue is large *and* coherent. Both requirements are satisfied simultaneously.

This is the kind of engineering that I find deeply satisfying. The momentum encoder is not a new idea in isolation. Exponential moving averages of parameters have been used in optimization (Polyak averaging), in reinforcement learning (target networks in DQN), and elsewhere. What He et al. did was recognize that this simple mechanism solves the specific consistency problem that arises when you try to maintain a large negative dictionary across time. The solution is not clever in the way that obscure math is clever. It is clever in the way that the right wrench for the right bolt is clever.

## What the Paper Gets Right

The experimental section is methodical and convincing. MoCo achieves 60.6% top-1 accuracy on ImageNet under the linear evaluation protocol with a ResNet-50 backbone. This means you train the encoder with MoCo (no labels), freeze it, attach a linear classifier, and train only the classifier on labeled ImageNet. 60.6% with zero labels during pretraining. For context, a ResNet-50 trained fully supervised gets about 76%.

But the more striking result is on transfer learning. MoCo pretrained representations outperform supervised ImageNet pretrained representations on 7 downstream tasks: PASCAL VOC object detection, COCO object detection, COCO instance segmentation, and several others. The features learned without any labels transfer better than the features learned with 1.2 million labeled images. This is a result that should make you pause. It suggests that supervised pretraining on ImageNet might teach the network ImageNet-specific features rather than generally useful visual features, and that contrastive learning, by optimizing a more general objective, learns representations that are more transferable.

The paper also includes a careful ablation study on the momentum coefficient $m$. Values of $m = 0.99$ and $m = 0.9$ produce significantly worse results than $m = 0.999$. The key encoder must evolve slowly for the queue to remain consistent. This is not a parameter you can tune casually. It is a design constraint that emerges from the interaction between the queue length, the batch size, and the training dynamics. The paper makes this clear without burying it.

## Where I Push Back

MoCo's reliance on data augmentation to define positive pairs is both its strength and its conceptual limitation. Two random crops of the same image are defined as positive. Two crops from different images are negative. But this is a strong assumption. Two crops of a dog and a cat might share more visual structure than two extreme crops of the same dog, where one shows the ear and the other shows the tail. The positive/negative distinction is a proxy for semantic similarity, not a direct measurement of it. The method works because the proxy is good enough at scale, but it is worth noting that "good enough at scale" is a different claim than "correct."

The InfoNCE loss has a temperature parameter $\tau$ that controls the sharpness of the softmax distribution over the dictionary. The paper uses $\tau = 0.07$, which is quite sharp. Small temperature means the model is very sensitive to small differences in similarity, which can make training unstable or push the model toward hard negative mining implicitly. The paper does not explore the sensitivity to $\tau$ in much depth, and later work (notably SimCLR's analysis) showed that temperature matters a lot for contrastive methods.

MoCo v2 appeared three months later and showed that two additions from SimCLR, an MLP projection head and stronger augmentation, boost MoCo's linear evaluation accuracy from 60.6% to 71.1%. This is a 10.5 point gain from two modifications that have nothing to do with the core MoCo mechanism. It suggests that the original MoCo results understate the potential of the framework because the augmentation and projection head choices were suboptimal. The architecture was right. The recipe around it needed work.

There is also a philosophical question about what it means to "learn representations." MoCo learns to discriminate between images via augmented views. The representations are good for downstream classification and detection. But they are explicitly trained to capture information that is *invariant* to augmentation. Information that augmentation destroys, precise color, texture, spatial position, is discarded by design. This is usually fine, but there are tasks where augmentation-invariant features are the wrong ones, and MoCo provides no mechanism to preserve augmentation-sensitive information.

## Why This Paper Matters

MoCo did not invent contrastive learning. It did not invent momentum updates. It did not even produce the best self-supervised results at the time of publication (SimCLR slightly outperformed it on ImageNet linear evaluation). What MoCo did was solve the infrastructure problem. SimCLR needed a Google-scale TPU pod. MoCo needed 8 GPUs. The queue-plus-momentum-encoder design made contrastive learning accessible to any research lab with a reasonable compute budget. That accessibility is what let the field move forward.

The deeper contribution is the framing. By casting contrastive learning as dictionary lookup, He et al. provided a mental model that made the design space legible. The size and consistency of the dictionary became the two axes along which methods could be compared and improved. MoCo v2, MoCo v3, BYOL, and the entire family of self-supervised methods that followed all responded to the design space that MoCo mapped out. Even methods that abandoned the queue or the momentum encoder entirely were defined in relation to MoCo's choices.

This is the first vision paper in this series, and I chose it because it illustrates something I keep coming back to: the most impactful papers are often not the ones with the most novel ideas, but the ones that find the right combination of existing ideas to solve a real problem. Queues, momentum updates, and contrastive losses all existed before MoCo. Putting them together in this particular configuration, with this particular motivation, is what made the difference. That is engineering at its best. Not inventing new tools, but knowing which tools to pick up.

*Fifth entry in the Paper Review series. Previous: Direct Preference Optimization.*
