---
title: "Building a Multi-Agent Contract Risk Analysis System"
description: "How I designed a four-phase agent pipeline for enterprise contract review — with iterative feedback loops, legal RAG, and lessons learned shipping it across three different frameworks."
date: 2025-03-17
tags: ["multi-agent", "RAG", "Google ADK", "OpenAI Agents SDK", "production"]
draft: false
---

Most contract review tools do one of two things: they extract data from PDFs, or they ask an LLM to "summarize the risks." Neither is good enough for enterprise use. Extraction misses context. Summarization hallucinates legal citations. And neither gives you the structured, auditable output that legal teams actually need.

I built a system that does something different: a **four-agent pipeline** where each agent has a single responsibility, an iterative review loop catches hallucinations before they reach the report, and every legal citation is validated against a real statute database.

This post walks through the architecture, the design decisions, and the hard lessons from shipping the same system across three different agent frameworks.

---

## The problem

Contract risk analysis has a few properties that make it particularly tricky for LLMs:

1. **Contracts are long.** A typical agreement is 20–50 pages. You can't just dump it into a prompt and hope for the best.
2. **Legal citations must be real.** If the report says "per Article 421 of the Civil Code," that article better exist and be relevant. Hallucinated legal citations destroy trust instantly.
3. **Risk profiles vary by contract type.** The risks in an NDA are completely different from those in a software licensing agreement. Static rule lists don't scale.
4. **Output must be structured.** Legal teams need tables with clause references, risk levels, applicable laws, and specific recommendations — not paragraphs of prose.

A single LLM call can't reliably handle all of these concerns simultaneously. That's what led me to a multi-agent design.

---

## The pipeline

The system uses four sequential agents, each with a distinct persona and toolset:

> PDF → Rule Generator → Risk Analyst → Senior Reviewer ⟲ → Executive Summarizer → Report

### Stage 0: Rule Generator

**Persona:** Senior Legal Strategist

The first agent reads the opening 5,000 characters of the contract — enough to classify the contract type (employment, licensing, NDA, etc.) without consuming the full token budget.

It outputs two things:
- **Contract type** — for example, "Software Licensing Agreement"
- **Dynamic risk rules** — a list of risk items tailored to that specific contract type, each with a severity level (High / Medium / Low), a description, and search keywords

This is a critical design choice. Instead of maintaining a static database of rules for every contract type, the rules are generated per contract. This means the system adapts to contract types it has never seen before, and the analyst agent receives focused guidance rather than a generic checklist.

### Stage 1: Risk Analyst

**Persona:** Contract Risk Analyst

**Tools:** A legal statute search tool (vector search over Taiwan's Ministry of Justice database) and a web search tool.

The analyst receives the full contract text plus the dynamic rules from Stage 0. It performs a clause-by-clause analysis, identifying risks and looking up applicable laws using the statute search tool.

Every legal citation must come directly from the tool's response. The prompt is explicit: if the search tool returns no relevant statutes, the agent must say so honestly rather than guessing. The analyst cannot fabricate citations — it can only reference what the retrieval tool actually returns.

This constraint is the first layer of hallucination prevention.

**Output:** A structured list of risk items, each containing the original contract clause, the applicable law with a citation link, risk level, reasoning, affected party, and a modification recommendation.

### Stage 2: Senior Reviewer (with feedback loop)

**Persona:** Legal Critic / Validator

**Tools:** The same legal statute search tool — but this time used for citation validation, not discovery.

This is where the architecture gets interesting. The reviewer doesn't just approve or reject — it has three possible actions:

1. **Approve** — the analysis is correct, move on
2. **Provide feedback** — specific issues found, send back to analyst for revision
3. **Rewrite** — the reviewer provides a corrected analysis directly

The analyst-reviewer loop runs up to 2 iterations:

> Analyst output → Reviewer checks it
> - Approved? → proceed to summarizer
> - Feedback? → analyst retries with the feedback → reviewer checks again
> - Rewrite? → use reviewer's corrected version → proceed

**Why iterative?** Because legal analysis is fundamentally a review process. In a law firm, a junior associate drafts, a senior partner reviews, and the associate revises. This loop encodes the same workflow. The first pass catches ~80% of issues; the feedback loop catches most of the rest.

**Citation validation is the key function here.** The reviewer re-queries the statute database for every law referenced in the analyst's output. If a citation doesn't exist in the database, the reviewer rejects the analysis with specific feedback about which citations are invalid. This is the second layer of hallucination prevention.

### Stage 3: Executive Summarizer

**Persona:** Chief Legal Officer

The final agent receives the validated risk list and produces two sections: a core issues summary and an executive conclusion. This is deliberately the simplest agent — it just needs to synthesize, not analyze.

---

## The legal RAG layer

The statute database deserves its own section because getting it right was harder than the agent pipeline itself.

### Data source

All legal data comes from Taiwan's Ministry of Justice (MOJ) open API. The ingestion pipeline:

1. Fetches structured law data from the MOJ public endpoint
2. Generates **stable identifiers** per article — so that rebuilding the vector database produces the same IDs for the same articles, and citations remain valid across database updates
3. Embeds article text and upserts into ChromaDB
4. Rate-limited with linear backoff to handle embedding API quotas without crashing

### Citation lifecycle

Every citation goes through three validation layers before it reaches the final report:

1. **At analysis time** — the analyst agent can only cite statutes that its search tool actually returned. No tool result, no citation.
2. **At review time** — the reviewer agent re-queries the database for every citation in the analyst's output. If a statute doesn't exist or doesn't match, the analysis is rejected with specific correction feedback.
3. **At report generation time** — a post-processor resolves each citation to a clickable link on the official MOJ website. If resolution fails, it falls back to a clear "statute not found" label instead of a dead link.

This three-layer approach means a hallucinated citation would have to survive the analyst's tool constraint, the reviewer's validation check, *and* the post-processor's resolution — which in practice doesn't happen.

---

## Shipping across three frameworks

I ended up building three versions of this system, each optimized for a different use case:

| | OpenAI Agents SDK | Google ADK | Background API |
|---|---|---|---|
| **Architecture** | Multi-agent pipeline | Multi-agent pipeline | Single-stage RAG per clause |
| **Review loop** | Yes (analyst ↔ reviewer) | Yes (analyst ↔ reviewer) | No (single pass) |
| **Vector DB** | ChromaDB | ChromaDB | Qdrant |
| **Best for** | Real-time analysis | Google ecosystem | High-volume async processing |

### Why three versions?

The multi-agent versions (OpenAI and Google ADK) share the same pipeline logic and are designed for **interactive, high-quality analysis** where a user uploads a contract and waits for results. The Google ADK version exists because the team needed to evaluate whether Gemini models could match GPT-4's performance on this task (they can, mostly).

The Background API version takes a fundamentally different approach: instead of passing the full contract to agents, it **chunks the contract into individual clauses**, triages each one (skip boilerplate, analyze substantive clauses), and runs independent RAG retrieval per clause. This is slower but more cost-efficient for batch processing, and it supports swapping models per request — Ollama for development, OpenAI for production, Gemini for cost optimization.

### Key difference: the API version has no reviewer loop

This was a deliberate tradeoff. The reviewer loop adds ~60 seconds of latency per iteration. For background batch processing where throughput matters more than per-document precision, single-pass analysis with better retrieval quality (cross-encoder reranking and score fusion) was a better fit.

---

## Lessons learned

**Dynamic rules beat static rules.** Early versions used a fixed rule database. The problem: you can't anticipate every contract type. Having the first agent generate rules per contract eliminated the maintenance burden and improved relevance significantly.

**The reviewer loop is worth the cost.** It adds latency and token spend. But in legal analysis, a single hallucinated citation can invalidate the entire report. The reviewer catches issues that prompt engineering alone cannot prevent.

**Token budgets are a design constraint, not an afterthought.** The rule generator only sees 5,000 characters. The analyst sees the full text but with compact dynamic rules. The summarizer only sees the risk JSON. Each stage is designed to minimize context size while preserving the information that agent needs.

**Structured outputs are non-negotiable.** Every agent outputs typed JSON via Pydantic models or structured output schemas. This eliminates parsing failures and makes the pipeline deterministic at the interface level, even if individual LLM responses vary.

**The same logic, different frameworks.** Porting from Google ADK to OpenAI Agents SDK was surprisingly mechanical — the agent personas, prompts, and pipeline flow are framework-agnostic. The differences are in tool registration, structured output handling, and tracing. If you design your pipeline as a sequence of typed inputs and outputs, the framework becomes an implementation detail.

---

## What's next

The current system handles individual contracts well, but the next iteration will focus on **cross-contract analysis** — comparing clauses across multiple versions of the same agreement to track how risk posture changes over time. That requires a different retrieval strategy (temporal + semantic) and a new agent role (comparative analyst).

The other open question is **evaluation**. Right now, quality is validated by the reviewer loop at runtime. A proper eval harness — with labeled contract datasets and citation accuracy metrics — would let us measure improvement across model upgrades and prompt changes systematically.

---

*This system is in production at KDAN. The architecture and design patterns are shared here; implementation details are internal.*
