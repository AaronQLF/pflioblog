---
title: "Paper Review: Pixel Recurrent Neural Networks"
date: "2026-04-18"
excerpt: "Ninth entry in the Paper Review series. Van den Oord et al. (2016) took the radical position that you could model images one pixel at a time, left to right, top to bottom, like reading a book. The result is PixelCNN, a masked convolution trick that turns image generation into autoregressive sequence modeling, a blind spot that took a follow-up paper to fix, and an idea that quietly became ancestral to everything from VQ-VAE to modern visual tokenizers."
tags: ["Paper Review", "AI", "Research", "Generative Models"]
series: "Paper Review"
seriesOrder: 9
---

There is a specific kind of paper that I find more interesting than papers that work well. It is the kind that proposes an idea so structurally clean that even when better methods replace it, the idea keeps showing up inside those better methods, wearing a different name. "Pixel Recurrent Neural Networks" (van den Oord, Kalchbrenner, Kavukcuoglu, ICML 2016) is that kind of paper. PixelCNN did not win the generative modeling race. Diffusion models did. But the autoregressive factorization of images, the masked convolution, the idea that you can treat a 2D signal as a 1D sequence and model it token by token, that machinery is load-bearing inside VQ-VAE, VQ-GAN, and every visual tokenizer feeding images into a large language model today.

I wanted to review this paper because it sits at a junction I keep returning to: the place where sequence modeling meets spatial structure, and where the decision to flatten a 2D problem into a 1D problem turns out to be more powerful and more limiting than it first appears.

## The Core Idea

An image is a grid of pixels. Each pixel has an intensity value (or three, for RGB). The joint distribution over all pixel values is astronomically high-dimensional. A 32x32 RGB image has 3,072 dimensions, each taking one of 256 values. The space of possible images is $256^{3072}$. You are not going to model that directly.

The autoregressive decomposition is a way to make this tractable. By the chain rule of probability, any joint distribution can be factored as a product of conditionals:

$$p(\mathbf{x}) = \prod_{i=1}^{n^2} p(x_i \mid x_1, x_2, \dots, x_{i-1})$$

This is not an approximation. It is an identity. It holds for any ordering of the variables. Van den Oord et al. choose raster scan order: left to right, top to bottom, the same way you read English text.

![Autoregressive generation in raster scan order. Blue pixels have already been generated. The orange pixel is being predicted, conditioned on all blue pixels. Gray pixels are future.](/images/blog/pixelcnn-raster-scan.png)

Each pixel is predicted as a conditional distribution over 256 values, given all previously generated pixels. The model outputs a 256-way softmax for each pixel position. Training is exact maximum likelihood: you compute the log-probability of the training image under the model and backpropagate. No adversarial training. No evidence lower bound. No score matching. Just a categorical cross-entropy loss at every pixel.

This directness is the paper's most underappreciated property. GANs were the dominant generative paradigm in 2016, and training them was notoriously unstable. VAEs were stable but produced blurry samples because the Gaussian decoder assumption smoothed over fine details. PixelCNN offered exact likelihood computation with stable training and sharp samples. The tradeoff was speed: generating an image required a sequential forward pass for every pixel. But the training and evaluation story was clean in a way that neither GANs nor VAEs could match.

## Masked Convolutions

The engineering question is: how do you build a neural network that predicts pixel $x_i$ using only $x_1, \dots, x_{i-1}$ when the input is a 2D grid?

The naive approach would be to flatten the image into a 1D sequence and use an RNN. The paper actually does this (the PixelRNN variants use diagonal BiLSTMs), and it works, but it is slow because recurrence is sequential. The PixelCNN variant replaces recurrence with masked convolutions, which can be parallelized on GPUs.

A standard convolution kernel centered at position $(r, c)$ reads from all positions in its receptive field, including positions below and to the right. Those positions correspond to pixels that come after $(r, c)$ in raster scan order. The model would be cheating: using future pixels to predict the current one.

The fix is masking. Zero out all kernel weights that correspond to future positions.

![Type A masked convolution kernel. Blue cells are active weights (pixels above and to the left). The center pixel is masked out in Type A. Hatched cells are zeroed.](/images/blog/pixelcnn-masked-conv.png)

The paper defines two mask types. Type A is used in the first convolutional layer: it masks the center pixel itself, ensuring the prediction for position $i$ cannot see the value at position $i$. Type B is used in all subsequent layers: it allows the center pixel through, because the hidden features at position $i$ in deeper layers are already derived from pixels $1, \dots, i-1$ and carry no information about pixel $i$ itself. The distinction is subtle and easy to get wrong. If you accidentally use Type B in the first layer, the model can trivially copy the input to the output and the loss drops to near zero without learning anything useful.

The implementation is straightforward. You define a standard convolution and multiply the kernel by a binary mask before applying it. The mask is constructed once and never changes. Training proceeds with standard backpropagation through the masked kernel. The mask does not break gradient flow because the zeroed-out weights never had gradients to contribute in the first place.

This is an elegant solution. You get the parallelism of convolutions (every spatial position is computed simultaneously during training) with the autoregressive property of sequential models (each position's prediction depends only on previous positions). The cost is that generation is still sequential: to sample a new image, you must run the model once per pixel, because each pixel value must be sampled before it can be fed as input for the next.

## The Blind Spot

Here is where the paper has a problem that the authors do not fully address, and that required a follow-up paper to fix.

Stack enough masked convolution layers and trace the receptive field backward. Which pixels can influence the prediction at position $(r, c)$? The valid context under raster scan ordering is everything above row $r$, plus everything in row $r$ to the left of column $c$. That is the set of pixels that have already been generated.

The actual receptive field of stacked masked convolutions does not cover this entire region. It forms an inverted triangle, and there is a gap.

![The blind spot problem. Blue region shows the actual receptive field of stacked masked convolutions. The red dashed region above-right is valid context that the network cannot see.](/images/blog/pixelcnn-blind-spot.png)

The issue is geometric. A masked convolution kernel centered at $(r, c)$ can see positions to the upper-left, directly above, and to the left. But it cannot see positions that are above *and* to the right of $(r, c)$, because reaching those positions would require passing through the center column at a higher row, and the masked kernel only propagates information downward and to the right. After $L$ layers with kernel size $k$, the receptive field is a triangle with slope determined by $k$, and everything outside that triangle on the upper-right side is invisible.

This means the model is not conditioning on the full valid context. It is conditioning on a strict subset. The autoregressive factorization is still valid (the model never sees future pixels), but it is unnecessarily restrictive. There are pixels that have already been generated, that are part of the valid conditioning set, that the model simply cannot access.

The blind spot does not break correctness. The model still defines a valid probability distribution. But it weakens the model by preventing it from using all available information, and the effect is measurable in log-likelihood.

## The Fix: Gated PixelCNN

Van den Oord et al. addressed this in a follow-up paper, "Conditional Image Generation with PixelCNN Decoders" (2016), which introduced the Gated PixelCNN. The solution splits the single stream of masked convolutions into two separate stacks.

![The vertical stack uses a wide kernel covering all columns but only rows above. The horizontal stack uses a 1xN kernel covering positions to the left. The vertical stack feeds into the horizontal stack, and the combined receptive field covers the entire valid context with no blind spot.](/images/blog/pixelcnn-two-stack.png)

The **vertical stack** uses convolution kernels that are $k \times k$ but masked to include only rows strictly above the current row. This stack processes all columns simultaneously for each row, so it has access to the full width of the image above the current position. No blind spot in the vertical direction.

The **horizontal stack** uses $1 \times k$ kernels masked to include only positions to the left in the current row. This handles the within-row autoregressive dependency.

At each layer, the output of the vertical stack is fed into the horizontal stack via a $1 \times 1$ convolution. This connection is what closes the blind spot. The vertical stack carries information from all rows above, across the full width. The horizontal stack receives that information and combines it with within-row context. The result is a receptive field that covers the entire valid conditioning set: everything above, plus everything to the left on the current row.

The gating mechanism is an additional improvement. Instead of ReLU activations, the Gated PixelCNN uses a multiplicative gating unit inspired by LSTMs:

$$\mathbf{y} = \tanh(W_{k,f} * \mathbf{x}) \odot \sigma(W_{k,g} * \mathbf{x})$$

where $*$ denotes convolution, $\odot$ is element-wise multiplication, $\tanh$ produces the candidate output, and $\sigma$ (sigmoid) produces a gate that modulates it. The authors report that gating consistently outperforms ReLU, and the improvement is larger than the improvement from fixing the blind spot alone. Multiplicative interactions give the network more expressive power per layer.

## The Likelihood Question

There is a methodological point about PixelCNN that I think is important and that the generative modeling community has gone back and forth on.

PixelCNN optimizes exact log-likelihood. This is often presented as a strength: unlike GANs, which optimize a minimax objective with well-documented instabilities, and unlike VAEs, which optimize a lower bound on the log-likelihood, PixelCNN directly maximizes the probability of the training data. No approximation. No bound gap. No mode collapse.

But exact log-likelihood has a problem that the paper does not discuss: it assigns probability mass to every possible image proportional to the model's belief in it. A model that assigns high likelihood to training images is not necessarily a model that generates good samples. It is a model whose entire probability mass is allocated reasonably, which is a much stronger requirement. A model could generate excellent samples while having mediocre log-likelihood if it wastes probability mass on low-quality images that it never actually samples. Conversely, a model could have excellent log-likelihood while generating poor samples if its probability mass is spread too thin.

In practice, PixelCNN samples were sharp (an advantage over VAEs) but not as visually compelling as GAN samples, despite having better log-likelihood scores. This gap between likelihood and sample quality was one of the empirical puzzles of the 2016-2018 generative modeling period, and it partly explains why GANs dominated the visual generation space despite PixelCNN's cleaner theoretical foundations.

The resolution came from understanding that log-likelihood measures compression, not perceptual quality. A model that is good at compressing images (predicting exact pixel values) is not the same as a model that is good at generating images that look real to humans. These objectives are correlated but not identical, and the discrepancy is largest exactly where it matters most: in the high-frequency details that distinguish a sharp photograph from a plausible hallucination.

## What Aged Well and What Did Not

The autoregressive factorization aged extremely well. VQ-VAE (van den Oord et al., 2017) uses PixelCNN as its prior over discrete latent codes. VQ-GAN (Esser et al., 2021) does the same but with a GAN-trained codebook. Modern visual tokenizers (the ones feeding image tokens into multimodal LLMs) are conceptual descendants of this idea: quantize the image into a discrete sequence, then model the sequence autoregressively. The chain rule decomposition that van den Oord et al. applied to raw pixels turned out to be more powerful when applied to learned tokens, but the mathematical framework is identical.

The pixel-level autoregressive approach did not age well for direct image generation. Diffusion models (Ho et al., 2020, Dhariwal and Nichol, 2021) comprehensively outperformed autoregressive pixel models on sample quality, and they do so while being parallelizable at generation time. The sequential pixel-by-pixel sampling that PixelCNN requires is too slow for practical image generation at modern resolutions. A 1024x1024 RGB image would require over 3 million sequential forward passes. Diffusion models generate the entire image in a fixed number of denoising steps, typically 20 to 50, regardless of resolution.

The masked convolution technique itself was influential. Causal masking in convolutions is now standard practice in audio generation (WaveNet, also from van den Oord et al., published the same year, uses the same idea on 1D audio signals). The concept of enforcing autoregressive structure through masking rather than through architectural recurrence is a design pattern that shows up repeatedly.

The blind spot is a cautionary tale about the gap between mathematical specification and architectural implementation. The autoregressive factorization says: condition on all previous pixels. The masked convolution implements an approximation of that conditioning. The gap between specification and implementation is non-obvious, requires careful geometric reasoning to identify, and has measurable impact on performance. Every time I review an architecture paper, I think about the blind spot as a prototype for the kind of subtle implementation gap that makes or breaks a model.

## The Broader Arc

PixelCNN is the image-domain version of an idea that appears everywhere in this series. Vaswani et al. showed that autoregressive modeling with appropriate masking could replace recurrence for text. Van den Oord et al., working in parallel at DeepMind, showed the same thing for images. The masked convolution in PixelCNN and the masked self-attention in the Transformer decoder are structurally identical moves: enforce the autoregressive property through masking, then exploit the parallelism of the unmasked computation during training.

The difference is that images have 2D spatial structure that text does not, and that 2D structure makes the masking harder to get right (hence the blind spot) and the generation slower (because the sequence length is $n^2$ rather than $n$). These are not minor differences. They are the reason why autoregressive models won in language and diffusion models won in vision. The sequence length scaling is the bottleneck: language sequences are thousands of tokens long, but image sequences at pixel level are millions. Autoregressive generation is practical at thousands and impractical at millions.

But the underlying mathematical framework, factoring a joint distribution into a product of conditionals and learning each conditional with a neural network, is the same framework whether you are modeling text, pixels, audio, or latent codes. PixelCNN is the paper that demonstrated this framework in the visual domain, fought through the engineering challenges of making it work with convolutions, and produced results good enough to prove the concept even if the specific implementation was eventually superseded.

That is the pattern I keep noticing across this series. The implementations change. The decompositions endure.

*Ninth entry in the Paper Review series. Previous: Transformer-XL.*
