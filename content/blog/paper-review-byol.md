---
title: "Paper Review: Bootstrap Your Own Latent"
date: "2026-04-19"
excerpt: "Tenth entry in the Paper Review series. Grill et al. (2020) removed negative pairs from self-supervised learning and the model did not collapse. Nobody fully understood why. That mystery is more interesting than the method itself, and three years of follow-up work have only partially resolved it."
tags: ["Paper Review", "AI", "Research", "Machine Learning"]
series: "Paper Review"
seriesOrder: 10
---

I have now reviewed MoCo, Barlow Twins, and DINO in this series, and each time I touched on the same question from a different angle: how do you prevent a self-supervised model from collapsing to a trivial representation? MoCo answered with negative pairs. Barlow Twins answered with decorrelation. DINO answered with centering and sharpening. Each answer was clean, well-motivated, and came with a clear story about why it worked.

BYOL has no clean story. "Bootstrap Your Own Latent: A New Approach to Self-Supervised Learning" (Grill, Strub, Altche, Corber, Azar, Piot, Paine, Sahni, Munos, Kavukcuoglu, NeurIPS 2020) removed negative pairs entirely, did not use decorrelation, did not use centering, and still produced representations competitive with the best contrastive methods. When the paper came out, the immediate reaction from most of the field, including me, was some version of: that should not work.

It does work. The question of why it works turned out to be harder and more interesting than the method itself, and the debate it sparked reshaped how the field thinks about collapse. I wanted to review this paper not because of the results, which are good but not exceptional by current standards, but because it is the clearest example I know of a paper where the negative result, a method that should collapse but does not, is the actual contribution.

## The Architecture

The setup has two networks: an online network and a target network.

The online network has three components. An encoder $f_\theta$ (a ResNet-50 in the main experiments) produces a representation $y_\theta = f_\theta(x)$ from an augmented view $x$ of an image. A projector $g_\theta$ maps this to a smaller embedding $z_\theta = g_\theta(y_\theta)$. A predictor $q_\theta$ maps the embedding to a prediction $p_\theta = q_\theta(z_\theta)$. The predictor is an MLP with a single hidden layer.

The target network has only two components: an encoder $f_\xi$ and a projector $g_\xi$. No predictor. The target network produces $z'_\xi = g_\xi(f_\xi(x'))$ from a different augmented view $x'$ of the same image. The target parameters $\xi$ are an exponential moving average of the online parameters $\theta$:

$$\xi \leftarrow m \cdot \xi + (1 - m) \cdot \theta$$

with $m$ following a cosine schedule from 0.996 to 1.0 during training. This is the same momentum update from MoCo, applied to the same purpose: maintaining a slowly evolving reference network.

The loss is a normalized mean squared error between the online prediction and the target projection:

$$\mathcal{L}_\theta = \left\| \frac{p_\theta}{\|p_\theta\|_2} - \frac{z'_\xi}{\|z'_\xi\|_2} \right\|_2^2 = 2 - 2 \cdot \frac{\langle p_\theta, z'_\xi \rangle}{\|p_\theta\|_2 \cdot \|z'_\xi\|_2}$$

The loss is symmetrized by swapping the views and averaging. Gradients flow only through the online network. The target network receives no gradients. Its parameters change only through the momentum update.

That is the entire method. No negative pairs. No contrastive loss. No InfoNCE. No queue. No redundancy reduction. Just: make your prediction of the target's embedding match the target's actual embedding, where the target is a slow-moving copy of yourself.

## Why This Should Collapse

Take a step back and think about what this loss is actually asking the network to do. The online network produces a prediction. The target network produces a target. The loss penalizes the distance between them. Both networks are initialized similarly and updated toward each other (the target through momentum, the online through gradient descent).

The trivial solution is: both networks output the same constant vector for every input. The prediction matches the target perfectly. The loss is zero. The network has learned nothing.

Every contrastive method avoids this by including negative pairs. If the network outputs the same vector for different images, the negative pair term in the loss increases. The network is penalized for failing to distinguish unrelated images. This tension between pulling positives together and pushing negatives apart is what carves out the representation space.

BYOL has no negative term. There is nothing in the loss that penalizes the network for outputting the same embedding for different images. The gradient of the loss pushes the online prediction toward the target embedding for the current image. If the target embedding is the same for every image, the gradient pushes the online network toward that constant, which reinforces the target through the momentum update, which reinforces the gradient. It is a fixed point, and it is a stable one under naive analysis.

And yet BYOL does not collapse. The model trains stably and produces representations that achieve 74.3% top-1 on ImageNet linear evaluation with a ResNet-50 backbone. That is competitive with MoCo v2 (71.1%) and SimCLR (69.3%), and only slightly behind Barlow Twins (73.2%). The trivial fixed point exists in the math, and the optimizer does not find it.

## The Batch Normalization Hypothesis

The first serious attempt to explain why BYOL does not collapse came from Richemond et al. (2020) and independently from Fetterman and Albrecht. Their argument: batch normalization is doing the work.

Batch normalization computes running statistics across the batch dimension. The mean and variance of activations are computed per batch, and each sample's activations are normalized relative to its batch-mates. This means that the representation of each sample implicitly depends on every other sample in the batch. When the loss pushes the online network's output toward the target for a particular image, the batch normalization ensures that this update also depends on what the other images in the batch look like. The other images are acting as implicit negatives, not through a term in the loss, but through the normalization statistics.

The evidence was direct. Remove batch normalization from BYOL's projector and predictor, and the model collapses. Replace batch normalization with layer normalization (which normalizes within each sample, not across the batch), and the model collapses. The collapse prevention is not in the loss function. It is in the normalization layer.

This was an uncomfortable finding for the paper's narrative. The paper presents BYOL as a method that avoids negative examples. If batch normalization is secretly providing negative signal through batch statistics, then BYOL has not actually avoided negatives. It has hidden them inside a normalization layer. The conceptual advance, learning without contrastive signal, is undermined if the contrastive signal is just entering through a different door.

## The Predictor and Stop-Gradient Hypothesis

The story did not end there. Chen and He published SimSiam (2021), which stripped the design further: same online/target architecture, but no momentum update at all. The target network uses the exact same parameters as the online network, with a stop-gradient operation. No momentum. No batch normalization in the critical path (they tested variants without BN). And it still did not collapse.

Chen and He's analysis reframed the problem. The key mechanism, they argued, is not the momentum update or batch normalization. It is the combination of the predictor MLP and the stop-gradient. The stop-gradient on the target side makes the optimization problem asymmetric. The online network is trying to match a target that does not move in response to the current gradient step. This turns the training into something like an Expectation-Maximization algorithm, alternating between updating the representation and using a fixed target.

In this framing, the predictor is essential. Without the predictor, the online encoder directly predicts the target encoder's output. With stop-gradient, this becomes: make your encoder output match a fixed copy of your encoder output on a different view. This has the trivial constant solution. But with the predictor, the setup is: use a separate network to predict the target's embedding from your encoder's output. The predictor adds a bottleneck that forces the encoder to produce informative representations, because the predictor can only succeed if the encoder gives it something useful to work with.

SimSiam showed that the minimal ingredients for avoiding collapse are: (1) a predictor that introduces asymmetry between the two branches, and (2) stop-gradient on the target branch. Momentum and batch normalization both help, but neither is strictly necessary. The essential mechanism is the asymmetry.

## My Assessment of the Collapse Question

I have read the original paper, the Richemond et al. critique, the SimSiam analysis, and several theoretical papers that attempt formal explanations (Tian et al., 2021, Pokle et al., 2022). My honest assessment is that the field has a collection of partial explanations that are each correct under specific assumptions but do not add up to a complete theory.

The batch normalization explanation is empirically true for the specific BYOL architecture as published, but SimSiam shows it is not the fundamental mechanism. The predictor-plus-stop-gradient explanation is more general, but the theoretical proofs require assumptions (linear networks, Gaussian data) that do not hold for real deep networks. The EM analogy is suggestive but not formal. The eigenfunction analysis from Tian et al. provides conditions under which non-collapse is guaranteed, but those conditions are hard to verify in practice.

What I think is actually happening is that the loss landscape of these asymmetric methods has both collapsed and non-collapsed fixed points, and the non-collapsed fixed points have a larger basin of attraction under SGD with standard initialization. The model does not collapse because the optimizer, starting from a random initialization, finds the informative fixed point before it finds the trivial one. The predictor and stop-gradient shape the loss landscape to make the informative fixed point more attractive, but they do not eliminate the collapsed one. It is a dynamical argument, not a static one, which is why the static equilibrium analyses keep finding that collapse should be possible.

This is not a satisfying explanation. But I think it is an honest one. And I think the discomfort it produces is appropriate. We are training models that work for reasons we do not fully understand. That sentence could describe most of deep learning, but BYOL makes it unusually explicit.

## The Results in Context

BYOL achieves 74.3% top-1 on ImageNet linear evaluation with ResNet-50. For context within this series: MoCo v1 gets 60.6%, MoCo v2 gets 71.1%, SimCLR gets 69.3%, Barlow Twins gets 73.2%, and DINO with ViT-S/16 gets 77.0%.

BYOL was state of the art when it was published in June 2020. It held that position for roughly a year until DINO and Barlow Twins appeared. The results are solid, and the transfer learning numbers are strong across detection and segmentation benchmarks.

But the results are not why this paper matters. If BYOL achieved 74.3% using a standard contrastive loss, it would be a good paper and I would not be reviewing it. The paper matters because the method that achieves 74.3% has no right to work based on the theoretical understanding that existed at the time. The gap between "this should collapse" and "this does not collapse" is the contribution. The accuracy number is evidence that the gap is real. It is not the point.

## What Aged Well

The momentum target network aged extremely well. MoCo introduced it. BYOL demonstrated that it was useful beyond contrastive learning. DINO adopted it as a core component. The exponential moving average target encoder has become a standard building block in self-supervised learning, and BYOL is the paper that demonstrated its generality by showing it works even without negative pairs.

The predictor MLP aged well. The idea that asymmetry between branches is important for preventing collapse, with one branch having an extra transformation that the other lacks, became a design principle. DINO does not use a predictor in the same form, but the teacher/student asymmetry serves the same structural purpose. The principle survived even as the specific implementation changed.

The paper also aged well as a cautionary tale about post-hoc explanations. The original paper's explanation for why BYOL avoids collapse was vague. The batch normalization explanation seemed definitive for a few months. Then SimSiam showed it was insufficient. Then the theoretical analyses provided partial answers. The sequence of "here is why it works" followed by "actually that is not quite right" is one of the most instructive case studies in the self-supervised learning literature for how hard it is to understand the methods we build.

## What Aged Poorly

The specific architecture, online/target with predictor and momentum, has been largely absorbed into the more general self-distillation framework that DINO popularized. DINO is functionally BYOL applied to Vision Transformers with centering instead of batch normalization and a cross-entropy loss instead of MSE. The individual components of BYOL survived, but the specific combination is no longer the preferred recipe. DINO and DINOv2 dominate the self-supervised vision space, and they are BYOL's intellectual descendants rather than its competitors, but they have replaced it in practice.

The reliance on ResNet backbones is also dated. BYOL's best results are with ResNet-50 and ResNet-200. The paper was published before Vision Transformers became the standard backbone for self-supervised learning. The method itself is architecture-agnostic, and later work showed it works with ViTs, but the original experimental section is entirely convolutional. This limits its relevance as a reference point for current practice, where ViTs are default.

## The Bigger Picture

BYOL sits at a specific inflection point in the self-supervised learning timeline. MoCo and SimCLR established that contrastive learning works. BYOL demonstrated that the contrastive part, the negative pairs, might not be necessary. Barlow Twins showed you could prevent collapse through decorrelation. SimSiam showed you could do it with just stop-gradient and a predictor. DINO combined these insights with Vision Transformers and got emergent segmentation.

The progression is: add negatives (MoCo) then remove negatives (BYOL) then understand why removing negatives works (SimSiam) then replace the mechanism entirely (Barlow Twins) then scale it (DINO). Each step simplified the method while deepening the mystery. We went from a complex but well-understood framework (contrastive learning with InfoNCE) to a simpler but poorly-understood one (self-distillation with asymmetric networks). The methods got better and our understanding of why they work got worse.

I find this trajectory fascinating and slightly alarming. It mirrors what I see in the language model world, where the systems get more capable and our mechanistic understanding falls further behind. BYOL is a microcosm of that dynamic, small enough to study carefully, important enough to matter. The fact that a method this simple can resist collapse for reasons we cannot fully explain is, in its own way, a statement about how much we do not understand about the optimization landscapes of deep networks.

The mystery is not resolved. It is just old enough that people have stopped being surprised by it.

*Tenth entry in the Paper Review series. Previous: Pixel Recurrent Neural Networks.*
