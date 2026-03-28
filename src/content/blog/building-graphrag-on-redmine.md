---
title: "When Vector Search Isn't Enough: Adding a Knowledge Graph to RAG"
description: "Why vector search alone wasn't enough for a 19K-issue knowledge base — and how layering a knowledge graph on top of semantic retrieval gave the LLM the structural context it was missing."
date: 2026-03-23
tags: ["GraphRAG", "Neo4j", "Qdrant", "RAG", "knowledge-graph", "production"]
draft: false
---

Most RAG systems work the same way: embed your documents, throw them into a vector database, retrieve the top-K chunks by cosine similarity, and let the LLM figure out the rest. It works surprisingly well — until it doesn't.

I hit the wall when building a knowledge assistant for Kdan Mobile's Redmine instance. We have about 19,000 issues across 132 projects, spanning products from e-signature platforms to PDF SDKs to animation tools. Pure vector search could find issues with similar wording, but it kept missing the ones that were **structurally related** — the parent task that explains why this bug exists, the blocking issue in another project that's the actual root cause, the person who's handled 200 similar tickets and should probably be consulted.

I ended up building a GraphRAG system that layers a Neo4j knowledge graph on top of Qdrant vector search. The graph doesn't replace semantic search — it **enriches** it with structural context that text similarity can't capture. This is how it works.

---

## What vector search gets wrong

Here's a concrete example. A QA engineer files a bug: "PDF export shifts signature field positions." Vector search returns five issues with similar wording — other signature rendering bugs, PDF layout issues, export-related tickets.

But it misses:

- **Issue #8451** — A parent task titled "ComPDF SDK v2.3 Upgrade" that this bug is a child of. The SDK upgrade is the root cause, but the title shares zero keywords with "signature field offset."
- **Issue #9102** — Marked as `BLOCKS` this ticket in Redmine. It's about a coordinate system change in the rendering engine. Completely different vocabulary, high structural relevance.
- **The fact that one engineer has handled 47 issues of this exact type** in this project — and is probably the right person to assign it to.

Vector search operates on text similarity. It has no concept of parent-child hierarchies, blocking relationships, project membership, or workload distribution. These are **graph problems**.

---

## The architecture: two retrieval paths, one LLM

The system runs two retrieval paths in parallel, then merges the results before sending to the LLM:

```
User question: "PDF export shifts signature field positions"
         │
         ├──→ Qdrant (vector search)
         │    └─ Top 10 semantically similar issues
         │
         ├──→ Neo4j (graph expansion)
         │    ├─ Subgraph extraction (parent, siblings, related issues)
         │    ├─ Graph-expanded relations (BLOCKS, CHILD_OF, DUPLICATES)
         │    └─ Expert discovery (who handles this type of issue)
         │
         ▼
    Merge + deduplicate
         │
         ▼
    LLM with enriched context
         │
         ▼
    Analysis (summary + impact + test suggestions)
```

Neither path alone is sufficient. Qdrant finds issues with similar descriptions; Neo4j finds issues with structural connections. The LLM sees both and can reason about the full picture.

---

## Building the knowledge graph

### The graph schema

The knowledge graph has 12 node types and 13+ relationship types, all synced directly from Redmine's API:

```
(:Issue)-[:BELONGS_TO]->(:Project)
(:Issue)-[:ASSIGNED_TO]->(:Person)
(:Issue)-[:CREATED_BY]->(:Person)
(:Issue)-[:HAS_TRACKER]->(:Tracker)          // Bug, Feature, Task...
(:Issue)-[:HAS_STATUS]->(:Status)            // New, In Progress, Closed...
(:Issue)-[:HAS_PRIORITY]->(:Priority)
(:Issue)-[:TARGETS_VERSION]->(:Version)
(:Issue)-[:IN_CATEGORY]->(:Category)
(:Issue)-[:CHILD_OF]->(:Issue)
(:Issue)-[:TAGGED_WITH]->(:Tag)
(:Issue)-[:WATCHED_BY]->(:Person)
(:Issue)-[r]->(:Issue)                       // RELATED_TO, BLOCKS, DUPLICATES...
(:Project)-[:SUB_PROJECT_OF]->(:Project)
(:Person)-[:MEMBER_OF]->(:Project)
(:Person)-[:IN_GROUP]->(:Group)
(:Person)-[:HAS_ROLE]->(:Role)
(:Version)-[:VERSION_OF]->(:Project)
(:Category)-[:CATEGORY_OF]->(:Project)
```

A key design decision: **we don't use LLM entity extraction**. Microsoft's GraphRAG paper assumes your input is unstructured text — meeting notes, emails, documents — so it needs an LLM to extract entities and relationships. That's expensive and noisy.

Redmine already **is** a structured database. Every relationship is authoritative. The `ASSIGNED_TO` edge isn't a guess from an LLM parsing "Alice mentioned she's working on this" — it's a database record. We get a higher-quality graph at zero extraction cost.

The sync pipeline runs in two phases. Phase 1 fetches reference data from Redmine's API (projects, versions, memberships, groups). Phase 2 reads issues from a local cache and upserts them with all relationships into Neo4j. A full sync of 19,197 issues takes about 3 minutes.

### Custom fields as dynamic properties

Redmine's custom fields get converted to Neo4j node properties on the fly:

```python
for cf in issue.get("custom_fields", []):
    val = cf.get("value")
    if val:
        cf_props[_safe_prop(cf.get("name", ""))] = val
```

The `_safe_prop` function sanitizes field names into valid Neo4j property keys (e.g., "Customer Name" → `cf_Customer_Name`). This means any custom field added in Redmine automatically becomes queryable in the graph without schema changes.

---

## The four graph query patterns

### Pattern 1: Subgraph extraction

When analyzing a specific issue, we extract a 1-2 hop subgraph around it:

```cypher
MATCH (i:Issue {id: $id})
OPTIONAL MATCH (i)-[:BELONGS_TO]->(p:Project)
OPTIONAL MATCH (i)-[:ASSIGNED_TO]->(assignee:Person)
OPTIONAL MATCH (i)-[:CREATED_BY]->(author:Person)
OPTIONAL MATCH (i)-[:HAS_TRACKER]->(t:Tracker)
OPTIONAL MATCH (i)-[:HAS_STATUS]->(s:Status)
OPTIONAL MATCH (i)-[:TARGETS_VERSION]->(v:Version)
OPTIONAL MATCH (i)-[:CHILD_OF]->(parent:Issue)
RETURN i, p.name AS project, assignee.name AS assignee,
       author.name AS author, t.name AS tracker,
       s.name AS status, v.name AS version,
       parent.id AS parent_id, parent.subject AS parent_subject
```

Then a second query grabs related issues, and a third finds siblings (issues with the same parent). In a single retrieval step, the LLM gets the issue's project, owner, status, parent task context, sibling tasks, and any linked issues — structured data that would take a human several clicks to gather in the UI.

### Pattern 2: Vector search → graph expansion

This is the core GraphRAG pattern. Qdrant returns semantically similar issue IDs; Neo4j expands them through structural relationships:

```cypher
UNWIND $ids AS seed_id
MATCH (seed:Issue {id: seed_id})-[r]-(related:Issue)
WHERE NOT related.id IN $ids
  AND type(r) IN ['RELATED_TO', 'DUPLICATES', 'BLOCKS',
                  'BLOCKED_BY', 'COPIED_TO', 'COPIED_FROM', 'CHILD_OF']
OPTIONAL MATCH (related)-[:BELONGS_TO]->(p:Project)
OPTIONAL MATCH (related)-[:HAS_STATUS]->(s:Status)
RETURN DISTINCT related.id AS id, related.subject AS subject,
       related.url AS url, p.name AS project, s.name AS status,
       type(r) AS relation, seed_id AS found_via
LIMIT $limit
```

The `found_via` field is important — it tells the LLM *why* this issue was included. "Issue #9102 was found via a BLOCKS relationship from #8734" gives the model a reasoning chain, not just a flat list of related tickets.

### Pattern 3: Expert discovery

Finding the right person to assign a ticket to is a graph aggregation problem:

```cypher
MATCH (i:Issue)-[:ASSIGNED_TO]->(per:Person)
MATCH (i)-[:BELONGS_TO]->(p:Project {name: $project})
MATCH (i)-[:HAS_TRACKER]->(t:Tracker {name: $tracker})
WITH per, count(i) AS experience
OPTIONAL MATCH (open:Issue)-[:ASSIGNED_TO]->(per)
OPTIONAL MATCH (open)-[:HAS_STATUS]->(s:Status)
WHERE NOT s.is_closed
WITH per, experience, count(open) AS open_count
WHERE experience >= 3
RETURN per.name AS name, per.id AS id,
       experience, open_count,
       toFloat(experience) / (open_count + 1) AS score
ORDER BY score DESC LIMIT 1
```

The scoring formula `experience / (open_count + 1)` balances expertise against current workload. Someone who's handled 50 similar tickets but currently has 30 open issues scores lower than someone with 20 similar tickets and 5 open. No vector database can compute this — it requires traversing the assignment graph and aggregating across status nodes.

### Pattern 4: Multi-hop risk assessment

Given any issue, the system traverses multiple relationship paths to compute risk signals. Five graph traversals run in sequence:

1. **Parent overload** — `CHILD_OF → parent → count siblings`. If the parent has 50+ children, it's a sprawling epic that likely has coordination risk.
2. **Version health** — `TARGETS_VERSION → version → all issues in version → status`. If the target version has <50% resolution rate, the release is at risk.
3. **Assignee overload** — `ASSIGNED_TO → person → all open issues`. If the assignee has 30+ open tickets, this one might stall.
4. **Blocking chain** — `BLOCKED_BY → blocker → status`. If a blocker is still open, this issue can't progress.
5. **Historical pattern** — `BELONGS_TO → project, HAS_TRACKER → tracker → all closed issues → avg resolution time`. If similar issues historically take 30+ days to close, flag it.

Each signal gets a severity rating. The output is a structured risk assessment:

```json
{
  "issue_id": 12345,
  "risk_level": "high",
  "signal_count": 3,
  "signals": [
    {
      "type": "assignee_overload",
      "severity": "high",
      "message": "Assignee Alice currently has 32 open issues — high workload"
    },
    {
      "type": "blocked",
      "severity": "high",
      "message": "Blocked by 2 open issues: #9102, #9205"
    },
    {
      "type": "version_risk",
      "severity": "medium",
      "message": "Target version v3.2 resolution rate is only 42% (85/201)"
    }
  ]
}
```

This is pure graph reasoning. No LLM involved, no embedding, no semantic similarity — just traversing relationships and aggregating counts. It runs in under 50ms.

---

## Duplicate detection: where both systems shine together

Duplicate detection is where the vector + graph combination is most visible. The flow has three steps:

**Step 1 — Semantic search**: Qdrant returns the top 5 issues with similar text (score ≥ 0.88 threshold).

**Step 2 — Structural validation**: For each high-similarity candidate, the graph checks three structural signals — whether the candidate is in the **same project**, has the **same tracker type** (Bug, Feature, etc.), and is **still open**.

**Step 3 — Confidence scoring**: An issue is flagged as a likely duplicate only when semantic similarity ≥ 88% AND at least 2 structural signals match.

This eliminates a common false positive in pure vector search: two issues from completely different products that happen to describe the same symptom in similar words. "App crashes on launch" in the iOS PDF Reader and "App crashes on launch" in the Android Animation Desk are textually identical but structurally unrelated — different project, different tracker, different team. The graph catches this.

---

## How the LLM gets the combined context

At analysis time, the system assembles both retrieval paths into a single prompt:

```
## Current Issue
Title: PDF export shifts signature field positions
Description: ...

## Related Historical Data (Semantic Search)
[1] Form field coordinates offset when exporting PDF
    Project: DottedSign / Status: Closed
    URL: .../issues/7823
    Content: ...

[2] Signature field position inconsistent across devices
    ...

## Knowledge Graph Supplementary Information
### Graph-Discovered Related Issues
- #9102 Coordinate system refactor (BLOCKS <- found via #8734, Project: ComPDF SDK, Status: In Progress)
- #8451 ComPDF SDK v2.3 Upgrade (CHILD_OF <- found via #8734, Project: ComPDF SDK, Status: In Progress)

### Domain Experts for This Project
- Alice (handled 47 related issues)
- Bob (handled 31 related issues)
```

The LLM sees both retrieval paths clearly separated. The "Semantic Search" section is from Qdrant; the "Knowledge Graph Supplementary Information" section is from Neo4j. Each graph-discovered issue includes the relationship type and which seed issue it was found through — giving the LLM an explicit reasoning chain.

---

## Graceful degradation

A deliberate architectural decision: if Neo4j is unavailable, the system still works — it just loses the graph enrichment layer. On initialization, the system attempts a Neo4j connection exactly once. If it fails, the graph layer is marked as unavailable and all subsequent queries fall back to vector-only retrieval without retrying.

This means the vector search path never breaks because the graph database is down. The graph is an enrichment layer, not a dependency. In practice, Neo4j has been stable, but the architecture means a graph outage degrades answer quality rather than causing failures.

---

## Lessons learned

**Structured sources beat LLM extraction every time.** If your data lives in a system with an API — issue trackers, CRMs, project management tools — build the graph directly from the API. You'll get perfect precision at zero LLM cost. Save entity extraction for truly unstructured sources.

**The graph finds what vectors miss, and vice versa.** Vector search is great at "this description sounds similar to that one." Graphs are great at "this issue is blocked by that one, which is assigned to someone with 30 open tickets." Neither alone gives you the full picture. The combination is more than additive.

**Multi-hop reasoning doesn't need an LLM.** The risk assessment runs five graph traversals and returns structured signals in 50ms. No embeddings, no generation, no prompt engineering — just Cypher queries. Reserve LLM calls for tasks that actually require language understanding.

**Graph context makes LLM output more grounded.** When the LLM sees "Issue #9102 (BLOCKS relationship, found via #8734)" in its context, it cites that relationship in its analysis. The structural signal from the graph becomes a reasoning anchor that reduces hallucination.

**Design for graceful degradation from day one.** Making the graph layer optional meant we could ship the vector search path first, then add Neo4j incrementally. Every new graph feature immediately benefits users without risking existing functionality.

---

## What's next

**Global queries** — The graph currently handles local queries well (starting from a specific issue and expanding outward). The next step is community detection with Leiden to enable questions that span the entire graph: "What are the biggest bottlenecks across all product lines?" That requires a Map-Reduce architecture over community summaries — a different paradigm entirely.

**Cross-system integration** — Redmine is just the first data source. Confluence wikis, Slack conversations, and Git repositories all contain knowledge that should live in the same graph. The shared `Person` and `Project` nodes become natural bridge entities across systems.

---

## Tech stack

| Component | Technology |
|---|---|
| Graph database | Neo4j 5 |
| Vector database | Qdrant |
| LLM | LLM via Ollama |
| Embedding | embedding model via Ollama |
| Backend | FastAPI + Python |
| Infrastructure | Docker Compose |
| Data source | Redmine API |

---

*This system is in production at Kdan Mobile. The architecture and design patterns are shared here; implementation details are internal.*
