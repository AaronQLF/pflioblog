---
title: "Disaggregated Prefill & Decode (PD Disaggregation): The New Architecture of High-Throughput LLM Infrastructure"
date: "2026-09-30"
excerpt: "Why mixing prompt prefill and token decode on the same GPUs is destroying your LLM latency. Deep dive into Disaggregated Prefill & Decode (PD Disaggregation), RDMA KV-cache transfers, Mooncake/vLLM architecture, and hardware arithmetic intensity."
tags: ["ai", "infrastructure", "vllm", "llm", "systems", "cuda"]
readingTime: 12
---

If you are building AI infrastructure, serving LLMs in production, or optimizing inference latency at scale, you have almost certainly hit the **Prefill vs. Decode bottleneck**. 

For years, the standard way to serve a Large Language Model was **monolithic execution**: an incoming request hits a GPU node, the node runs the prompt through the model (the *prefill* phase), and then the exact same node generates output tokens one by one (the *decode* phase) until completion.

It sounds simple. But at scale, **monolithic serving is fundamentally flawed**. 

Mixing prefill and decode on the same hardware forces GPUs to compromise between two mutually opposing workload dynamics. The result? Severe latency spikes, degraded Time-To-First-Token (TTFT), unpredictable Time-Per-Output-Token (TPOT), and poor hardware utilization.

Enter **Disaggregated Prefill & Decode (PD Disaggregation)**—the architectural paradigm shift powering modern high-throughput LLM platforms like Moonshot AI's Mooncake, vLLM V1, and SGLang. 

In this post, we'll break down the hardware physics behind this bottleneck, how PD Disaggregation works under the hood, the mechanics of high-speed RDMA KV-cache transfers, and how to think about it as an AI engineer.

---

## 1. The Core Asymmetry: Prefill vs. Decode

To understand why disaggregation is necessary, we must look at the **arithmetic intensity** (FLOPs per byte of memory transferred) of the two LLM inference phases.

$$
\text{Arithmetic Intensity} = \frac{\text{Total Floating Point Operations (FLOPs)}}{\text{Total High-Bandwidth Memory (HBM) Bytes Accessed}}
$$

```
   ┌────────────────────────────────────────────────────────────────────────┐
   │                          PREFILL PHASE                                 │
   │  - Inputs: Full prompt sequence (e.g., 8,192 tokens)                    │
   │  - Workload: Compute-Bound (High FLOPs / Byte)                         │
   │  - Matrix Operations: GEMM (Matrix-Matrix Multiplication)              │
   │  - Hardware Bottleneck: Tensor Core TFLOPS                             │
   └────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │                           DECODE PHASE                                 │
   │  - Inputs: 1 new token per step + KV Cache                             │
   │  - Workload: Memory-Bandwidth Bound (Low FLOPs / Byte)                  │
   │  - Matrix Operations: GEMV (Matrix-Vector Multiplication)              │
   │  - Hardware Bottleneck: HBM Memory Bandwidth (TB/s)                    │
   └────────────────────────────────────────────────────────────────────────┘
```

### The Prefill Phase (Compute-Bound)
During prefill, the model processes the entire prompt sequence of length $N$ simultaneously. 
- All tokens interact via self-attention: $Q K^\top / \sqrt{d_k}$.
- The linear projection weights are multiplied by a large $N \times d$ matrix. This is a **Matrix-Matrix Multiplication (GEMM)**.
- Because the weight matrices loaded from GPU HBM are reused across all $N$ tokens in the prompt, the arithmetic intensity is high ($\propto N$). 
- **Bottleneck**: GPU compute capacity (Tensor Core TFLOPS).

### The Decode Phase (Memory-Bandwidth Bound)
During decode, the model generates output tokens autoregressively—one single token at a time.
- To produce token $t+1$, the GPU must load the **entire model parameter set** (e.g., 140 GB for a 70B FP16 model) plus the accumulated Key-Value (KV) cache from HBM into SRAM *just to process a single token vector*.
- This is a **Matrix-Vector Multiplication (GEMV)**.
- The arithmetic intensity drops to near $O(1)$ FLOP/byte. 
- **Bottleneck**: HBM Memory Bandwidth (e.g., 3.35 TB/s on an NVIDIA H100).

### The Monolithic Conflict
When a worker GPU attempts to run prefill and decode concurrently (even with techniques like PagedAttention or Chunked Prefill):
1. **Interference**: A massive new 32k-token prompt prefill will monopolize the Tensor Cores, stalling active decode requests for hundreds of milliseconds. Users experience random, terrible latency stutters mid-generation.
2. **Suboptimal Hardware Allocation**: Decode requests need maximum memory capacity for KV caches and high memory bandwidth, whereas prefill requests need maximum TFLOPS. Forcing them onto identical node configurations wastes hardware capability.

---

## 2. What is PD Disaggregation?

**PD Disaggregation** decouples the inference pipeline by physically splitting the cluster into two specialized pools of worker nodes:

1. **Prefill Pool**: Worker nodes dedicated *exclusively* to processing initial prompts and generating the initial KV cache.
2. **Decode Pool**: Worker nodes dedicated *exclusively* to receiving pre-computed KV caches and generating output tokens autoregressively.

```
                  ┌────────────────────────────────────────┐
                  │            Client Requests             │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │         Cache-Aware Router             │
                  └─────────┬────────────────────┬─────────┘
                            │                    │
          (1) Prompt Forward│                    │ (3) Decode Handoff
                            ▼                    ▼
             ┌─────────────────────────┐  ┌─────────────────────────┐
             │   Prefill Pool Node     │  │    Decode Pool Node     │
             │                         │  │                         │
             │ - Compute-heavy (GEMM)  │  │ - Memory-bound (GEMV)   │
             │ - High Tensor TFLOPS    │  │ - Large HBM / KV Space  │
             │ - Generates KV Cache    │  │ - Streams Output Tokens │
             └────────────┬────────────┘  └─────────────────────────┘
                          │
                          │ (2) High-Speed RDMA
                          │     KV-Cache Transfer
                          └──────────────────────►
```

### The Request Lifecycle in a Disaggregated Architecture

1. **Routing**: An incoming request arrives at a smart load balancer/router. The router checks if any node already holds a cached prefix (via RadixTree/Prefix Caching) and routes the request to an optimal Prefill Worker.
2. **Prefill Execution**: The Prefill Worker processes the prompt in parallel at maximum compute throughput, computing the prompt's attention Key-Value (KV) tensors.
3. **High-Speed KV Handoff**: The Prefill Worker transfers the generated KV cache directly to an assigned Decode Worker over high-speed networks (InfiniBand / RoCE v2 RDMA).
4. **Decode Execution**: The Decode Worker assumes ownership of the request and streams tokens back to the user without ever being interrupted by incoming heavy prefill jobs.

---

## 3. Under the Hood: The Mechanics of KV-Cache Transfer

The core technical challenge in PD Disaggregation is: **How do you transfer gigabytes of KV cache between separate GPU nodes fast enough that the network transfer doesn't eliminate the latency gains?**

### Calculating KV Cache Size
For a model with $L$ layers, $H_{kv}$ key-value heads, head dimension $d$, sequence length $N$, and data type precision $b$ bytes (e.g., FP16 = 2 bytes, FP8 = 1 byte):

$$
\text{KV Cache Size (Bytes)} = 2 \times L \times H_{kv} \times d \times N \times b
$$

Let's put real numbers on this for Llama-3-70B (Grouped-Query Attention with $H_{kv} = 8$, $d = 128$, $L = 80$):
- For an **8,192 token prompt** in FP16 ($b = 2$):
  $$
  2 \times 80 \times 8 \times 128 \times 8192 \times 2 = 2,684,354,560 \text{ Bytes} \approx \mathbf{2.68 \text{ GB}}
  $$
- For a **32,768 token prompt**:
  $$
  \mathbf{10.73 \text{ GB}}
  $$

### Why RDMA is Mandatory
If you transferred 2.68 GB of KV cache using standard TCP/IP over a 10GbE network, it would take **over 2 seconds**—completely ruining the user experience.

PD Disaggregation relies on **Remote Direct Memory Access (RDMA)** over InfiniBand (e.g., 400Gbps NDR) or RoCE v2 (RDMA over Converged Ethernet):

- **Zero-Copy Transfer**: RDMA reads directly from GPU HBM (via GPUDirect RDMA) on the Prefill node and writes directly into GPU HBM on the Decode node without passing through host CPU memory or OS kernel network stacks.
- **Transfer Latency at 400 Gbps (50 GB/s)**:
  - 2.68 GB KV cache transfer takes **$\approx 53 \text{ ms}$**.
  - With FP8 quantized KV cache ($b = 1$), this drops to **$\approx 26 \text{ ms}$**!

Because 26–50 ms is far lower than the time saved by preventing prefill-decode queue blocking (which often causes 500ms–2000ms TTFT delays in monolithic setups), the network handoff is a net win.

---

## 4. Architectural Comparison

| Metric / Dimension | Monolithic Serving | Chunked Prefill | PD Disaggregation |
| :--- | :--- | :--- | :--- |
| **TTFT (Time-To-First-Token)** | High & Unpredictable | Medium | **Ultra-Low & Consistent** |
| **TPOT (Time-Per-Output-Token)** | High Jitter (Stalls) | Moderate Jitter | **Stable & Smooth** |
| **Compute Utilization** | Suboptimal (Mixed) | Improved | **Optimal (Specialized Hardware)** |
| **Network Requirements** | Standard Local Bus | Standard Local Bus | **High-Bandwidth RDMA (400G+)** |
| **Cluster Complexity** | Simple | Medium | **Higher (Requires Distributed State)** |

---

## 5. Implementing Disaggregation: Code & Engine Setup

Modern open-source inference engines like **vLLM** and **SGLang** native support disaggregated prefill and decode.

Here is a simplified conceptual example of how a disaggregated pipeline is configured in Python using `vLLM` distributed components:

```python
# prefill_worker.py
from vllm import LLMEngine, EngineArgs

# Configure node purely for prefill compute
engine_args = EngineArgs(
    model="meta-llama/Meta-Llama-3-70B-Instruct",
    tensor_parallel_size=4,
    pipeline_parallel_size=1,
    gpu_memory_utilization=0.90,
    # Enable disaggregated prefill role
    kv_transfer_config={
        "kv_connector": "PyNcclConnector", # or PyRdmaConnector
        "kv_role": "kv_producer"
    }
)

engine = LLMEngine.from_engine_args(engine_args)
# Prefill worker executes prompt, populates KV cache, and pushes to network
```

```python
# decode_worker.py
from vllm import LLMEngine, EngineArgs

# Configure node purely for decode bandwidth & memory capacity
engine_args = EngineArgs(
    model="meta-llama/Meta-Llama-3-70B-Instruct",
    tensor_parallel_size=2,
    pipeline_parallel_size=2,
    gpu_memory_utilization=0.95,
    # Enable disaggregated decode role
    kv_transfer_config={
        "kv_connector": "PyNcclConnector",
        "kv_role": "kv_consumer"
    }
)

engine = LLMEngine.from_engine_args(engine_args)
# Decode worker receives KV cache via RDMA and streams autoregressive tokens
```

---

## 6. Key Engineering Trade-offs & Lessons

If you are evaluating PD Disaggregation for your AI infrastructure, keep these practical takeaways in mind:

1. **Network Infrastructure is King**: PD Disaggregation is only viable if your cluster features high-speed interconnects (NVIDIA Quantum-2 InfiniBand, RoCE v2, or PCIe Gen5 GPUDirect P2P). Without RDMA, network latency will eat your gains.
2. **KV-Cache Quantization**: Quantizing KV caches from FP16 to FP8 or INT4 cuts network transfer payload sizes by 50%–75%, dramatically boosting the sweet spot for sequence lengths where disaggregation wins.
3. **Prefix Caching Synergy**: Pairing PD Disaggregation with Trie-based Prefix Caching (like SGLang's RadixAttention) allows prefill nodes to skip computing prompt prefixes that already exist in decode node memory, reducing prefill compute by up to 80% on long-system-prompt workloads.

---

## Conclusion

The shift from monolithic LLM serving to **Disaggregated Prefill & Decode** represents one of the most significant architectural advancements in AI systems engineering. By respecting the hardware physics of GPU compute vs. memory bandwidth, disaggregation unlocks 3×–5× higher cluster throughput while delivering predictable, rock-solid latency SLAs.

As context windows expand into millions of tokens and agentic workflows require long prompt histories, PD Disaggregation is fast becoming the default standard for industrial AI deployment.
