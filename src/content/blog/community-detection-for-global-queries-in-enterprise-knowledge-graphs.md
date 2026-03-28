---
title: "Community Detection for Global Queries in Enterprise Knowledge Graphs"
description: "How I used Leiden community detection and Map-Reduce to make a company-wide knowledge graph answer big-picture questions like 'What's our biggest technical bottleneck?' — not just ticket-level lookups."
date: 2026-03-27
tags: ["GraphRAG", "Neo4j", "community-detection", "Leiden", "knowledge-graph", "production"]
draft: false
---

When your RAG system can already answer "what issues are related to this ticket?", the next challenge is making it answer "what's the company's biggest technical bottleneck right now?"

We built a knowledge graph at Kdan Mobile that syncs ~19,000 Redmine issues into Neo4j — 12 node types, 130K+ relationships spanning Issues, Projects, People, Trackers, and Versions. Paired with Qdrant for semantic search, it handles **local queries** well: start from a specific issue, traverse relationships, find related tickets and owners.

But it completely breaks down on questions like these:

- "What's the issue resolution rate across product lines?"
- "What are the most common cross-team blocking patterns?"
- "Where's our biggest technical bottleneck?"

These questions have no starting node. You can't expand outward from a single ticket. To answer them, you need to first run **community detection** on the entire graph, then use a **Map-Reduce** strategy to let an LLM answer per-community and fuse the results.

This post covers the full implementation — including the parts that broke.

---

## Why community detection?

### The naive approach doesn't work

The obvious solution is to dump all 19,197 issue summaries into an LLM and ask it to answer directly. But that much text exceeds any model's context window, and even if you could fit it, information overload destroys answer quality.

### Divide first, then conquer

Community detection groups "densely connected" nodes together automatically. For our Redmine knowledge graph, a community roughly corresponds to a **product line** or **working group** — which is exactly how humans think about company structure.

Once you have communities, the strategy is straightforward:

1. Pre-generate an LLM summary for each community
2. At query time, have each community answer independently (Map)
3. Take the top-scoring answers and fuse them into a final response (Reduce)

---

## Building similarity edges: the real challenge is the data

### Issues barely link to each other

In theory, Redmine supports "related to", "blocks", and "duplicates" relationships between issues. In practice, I checked our data:

```cypher
MATCH (:Issue)-[r]-(:Issue)
RETURN DISTINCT type(r) AS rel_type, count(r) AS cnt
```

| Relationship | Count |
|---|---|
| CHILD_OF | 5,504 |
| RELATED_TO | 0 |
| BLOCKS | 0 |

Only parent-child relationships. Users almost never use Redmine's "add relation" feature. If you run community detection with only 5,504 edges, most issues become isolated nodes and the resulting communities are meaningless.

### Inferring connections through shared attributes

The fix: **infer similarity from shared Project, Tracker, and Assignee attributes**, then materialize these as `SIMILAR_TO` edges.

Three edge-building strategies:

**Strategy 1: Direct relationships.** Map all existing Issue-to-Issue relations to SIMILAR_TO:

```cypher
MATCH (a:Issue)-[r]->(b:Issue)
WHERE type(r) <> 'SIMILAR_TO'
MERGE (a)-[:SIMILAR_TO]->(b)
```

**Strategy 2: Same project + same tracker.** Issues in the same project with the same type (Bug, Feature, etc.) are likely related work:

```cypher
MATCH (a:Issue)-[:BELONGS_TO]->(p:Project {id: $pid})<-[:BELONGS_TO]-(b:Issue)
WHERE a.id < b.id
MATCH (a)-[:HAS_TRACKER]->(t:Tracker)<-[:HAS_TRACKER]-(b)
CREATE (a)-[:SIMILAR_TO]->(b)
```

**Strategy 3: Same assignee + same project.** Issues assigned to the same person within the same project usually involve the same module or domain:

```cypher
MATCH (a:Issue)-[:ASSIGNED_TO]->(per:Person)<-[:ASSIGNED_TO]-(b:Issue)
WHERE a.id < b.id
MATCH (a)-[:BELONGS_TO]->(p:Project {id: $pid})<-[:BELONGS_TO]-(b)
CREATE (a)-[:SIMILAR_TO]->(b)
```

### The OOM problem

The first run of "same project + same tracker" immediately OOM'd. The reason: Cartesian products. A large project with 2,000 bugs produces `2000 × 1999 / 2 ≈ 2 million` edges in a single transaction.

The fix was simple — **batch by project**, one transaction per project:

```python
project_ids = session.run("MATCH (p:Project) RETURN p.id AS pid")

for pid in project_ids:
    session.run("""
        MATCH (a:Issue)-[:BELONGS_TO]->(p:Project {id: $pid})<-[:BELONGS_TO]-(b:Issue)
        WHERE a.id < b.id
        MATCH (a)-[:HAS_TRACKER]->(t:Tracker)<-[:HAS_TRACKER]-(b)
        CREATE (a)-[:SIMILAR_TO]->(b)
    """, pid=pid)
```

Combined with bumping Neo4j's memory limits:

```yaml
# docker-compose.yml
environment:
  - NEO4J_server_memory_heap_max__size=2g
  - NEO4J_dbms_memory_transaction_total_max=3g
```

139 projects, ~18 seconds, ~5 million SIMILAR_TO edges created.

---

## Running Leiden community detection

### Why Leiden?

| Algorithm | Characteristics |
|---|---|
| Louvain | Classic, fast, but can produce internally disconnected communities |
| **Leiden** | Improved Louvain — guarantees internal connectivity, supports hierarchical levels |
| Label Propagation | Fastest (near-linear), but unstable results |

Leiden is the algorithm used in the Microsoft GraphRAG paper, produces the highest quality communities, and is natively supported in Neo4j GDS.

### How Leiden works

Leiden improves on Louvain by adding a **refinement phase** that prevents the "internally disconnected community" problem. Here's how it works step by step:

**Phase 1 — Local move.** Each node starts in its own community. For every node, the algorithm checks whether moving it to a neighbor's community would improve **modularity** — a metric that measures how dense the connections are within communities compared to random chance. Nodes greedily move to the community that gives the biggest modularity gain.

```
Initial state:        After local moves:

  A ─── B               ┌─────────┐
  │     │               │ A ─── B │  community 1
  C     D ─── E         │ │       │
        │               │ C       │
        F ─── G         └─────────┘
                         ┌─────────┐
                         │ D ─── E │  community 2
                         │ │       │
                         │ F ─── G │
                         └─────────┘
```

**Phase 2 — Refinement (Leiden only).** This is what separates Leiden from Louvain. After the local move phase, Leiden checks each community: are all nodes still well-connected internally? If a community has a weakly-attached node, it gets reassigned. This guarantees every community is **internally connected** — a property Louvain cannot guarantee.

```
Louvain might produce:       Leiden refines to:

  ┌───────────────┐          ┌─────────┐  ┌─────┐
  │ A ─── B     X │          │ A ─── B │  │  X  │
  │ │         ╱   │    →     │ │       │  └─────┘
  │ C       Y     │          │ C       │  ┌─────┐
  │             ╲ │          └─────────┘  │ Y   │
  │           Z   │                       │   ╲ │
  └───────────────┘                       │ Z   │
                                          └─────┘
  X, Y, Z are weakly           X, Y, Z split into
  connected to A-B-C           their own communities
```

**Phase 3 — Aggregation.** Each community is collapsed into a single "super-node," and edges between communities become weighted edges between super-nodes. The algorithm then repeats Phase 1–2 on this coarser graph.

```
Level 0 (original):     Level 1 (aggregated):    Level 2:

  ┌───┐     ┌───┐
  │ A │     │ D │         C1 ═══════ C2            S1
  │ B │─────│ E │          (3)    (4)              (7)
  │ C │     │ F │
  └───┘     │ G │
            └───┘
  community  community
     C1         C2
```

This hierarchical process repeats until modularity stops improving, producing a **dendrogram** of communities at multiple resolutions. In our case, `maxLevels: 4` allows up to 4 levels of nesting — so you can query at the product-line level (coarse) or at the feature-team level (fine-grained).

**The modularity formula** behind each move decision:

```
Q = (1/2m) × Σ [A_ij - (k_i × k_j / 2m)] × δ(c_i, c_j)

where:
  A_ij  = edge weight between nodes i and j
  k_i   = total edge weight of node i (degree)
  m     = total edge weight in the graph
  δ     = 1 if nodes i, j are in the same community, 0 otherwise
```

The `gamma` parameter (set to `1.0` in our config) scales the `k_i × k_j / 2m` term. Higher gamma makes the algorithm prefer smaller communities; lower gamma favors larger ones. At `1.0`, the algorithm uses standard modularity — which for our 19K-issue graph produced 162 communities that naturally aligned with product lines.

### Setting up GDS

One line in Docker Compose:

```yaml
kdan_knowledge_graph:
  image: neo4j:5
  environment:
    - NEO4J_PLUGINS=["graph-data-science"]
```

Verify:

```cypher
RETURN gds.version() AS version
-- "2.13.8"
```

### The undirected graph gotcha

Neo4j GDS's Cypher Projection (`gds.graph.project.cypher`) creates **directed** graphs — even if you manually create bidirectional edges (a→b and b→a), GDS still marks them as directed. Leiden immediately rejects this:

```
The Leiden algorithm works only with undirected graphs
```

The fix: use **Native Projection** with `orientation: 'UNDIRECTED'`. This is also why materializing SIMILAR_TO as real edges matters — Native Projection can only project relationship types that physically exist.

```cypher
CALL gds.graph.project(
    'issue-community-graph',
    'Issue',
    {SIMILAR_TO: {orientation: 'UNDIRECTED'}}
)
```

### Running the algorithm

```cypher
CALL gds.leiden.write('issue-community-graph', {
    writeProperty: 'community_id',
    maxLevels: 4,
    gamma: 1.0
})
```

- `writeProperty`: writes the result to each Issue node's `community_id` property
- `maxLevels: 4`: up to 4 hierarchical levels
- `gamma: 1.0`: resolution parameter — higher values produce smaller, more numerous communities

### Results

```
Algorithm:    Leiden
Communities:  162
Total issues: 19,197
Size range:   1 – 2,344 (avg 118.5)
```

The top communities reveal that the algorithm automatically discovered product-line boundaries — with no manually defined rules:

| Community | Size | Theme |
|---|---|---|
| #6 | 2,344 | DottedSign (e-signature product) |
| #57 | 1,364 | Security vulnerability reports |
| #9 | 1,265 | PDF Reader product line |
| #138 | 696 | ComPDF SDK |
| #162 | 564 | Animation Desk |
| #50 | 350 | Website & payment systems |

---

## Map-Reduce global queries

### Pre-generating community summaries

To avoid re-analyzing all issues at query time, we pre-generate an LLM summary for each community:

```python
communities = graph.get_community_summary_data(limit=50)

for community in communities:
    prompt = f"""Analyze this group of related Redmine issues:
    1. What is the theme and scope of this work?
    2. Which projects/products are involved?
    3. What is the overall status?

    ## Sample issue titles (total: {community['size']})
    {community['sample_subjects']}
    ## Project distribution: {community['projects']}
    ## Status distribution: {community['statuses']}"""

    summary = await llm.chat(prompt)
    graph.upsert_community_summary(community_id, summary, size)
```

Summaries are stored as `Community` nodes in Neo4j, ready for instant retrieval at query time.

### Map phase: each community answers independently

When a user asks a question, every community answers with a relevance score (0–100):

```
User: "What's the company's biggest technical bottleneck?"

Community #6 (DottedSign, 2,344 issues):
  SCORE: 72
  ANSWER: Signing workflow stability, particularly cross-platform state sync...

Community #57 (Security scans, 1,364 issues):
  SCORE: 45
  ANSWER: Vulnerability remediation scheduling is ongoing debt...

Community #138 (ComPDF SDK, 696 issues):
  SCORE: 85
  ANSWER: SDK core version upgrades are the central bottleneck,
          affecting multiple downstream products...
```

All 162 communities run **in parallel** (async), so latency doesn't scale with community count.

### Reduce phase: fuse top-K answers

Take the 5 highest-scoring community answers and ask the LLM to synthesize:

```
Synthesize the above perspectives into a complete, structured answer.
Focus on cross-group patterns and overall trends.
```

The final output is a global analysis that spans product lines — something no single-ticket query could produce.

### Architecture

```
User query
    │
    ▼
┌────────────────────────────────────────────┐
│         Map (162 communities, parallel)     │
│  ┌──────┐ ┌──────┐ ┌──────┐               │
│  │  DS  │ │  PDF │ │  SDK │  ... ×162      │
│  │ sum. │ │ sum. │ │ sum. │               │
│  │→ans. │ │→ans. │ │→ans. │               │
│  │  72  │ │  31  │ │  85  │               │
│  └──────┘ └──────┘ └──────┘               │
└────────────────────┬───────────────────────┘
                     │ Top 5
                     ▼
┌────────────────────────────────────────────┐
│       Reduce (fuse top-scoring answers)    │
│  SDK(85) + DS(72) + ... → global answer   │
└────────────────────────────────────────────┘
                     │
                     ▼
              Final answer
```

---

## The full pipeline

```
┌─────────────────┐
│  Redmine API    │
└────────┬────────┘
         ▼
┌─────────────────┐     ┌──────────────────┐
│  graph-sync     │────▶│  Neo4j KG        │
│  (sync data)    │     │  19K nodes       │
└─────────────────┘     │  136K relations  │
         │              └────────┬─────────┘
         │                       ▼
         │              ┌──────────────────┐
         │              │rebuild-similarity│
         │              │ (build sim edges)│
         │              │ ~5M edges        │
         │              └────────┬─────────┘
         │                       ▼
         │              ┌──────────────────┐
         │              │community-detect  │
         │              │ (Leiden algo)    │
         │              │ → 162 communities│
         │              └────────┬─────────┘
         │                       ▼
         │              ┌──────────────────┐
         │              │community-summarize│
         │              │ (LLM summaries)  │
         │              └────────┬─────────┘
         │                       ▼
         │              ┌──────────────────┐
         └─────────────▶│  API Server      │
                        │ /global-query    │
                        │ (Map-Reduce)     │
                        └──────────────────┘
```

The daily schedule only needs the first three steps (graph-sync → rebuild-similarity → community-detect). Summaries can be regenerated weekly or when data changes significantly.

---

## Lessons learned

| Problem | Root cause | Fix |
|---|---|---|
| GDS projection found no useful relationships | Users almost never create Issue relations in Redmine — BLOCKS/RELATED_TO counts were zero | Infer implicit similarity through shared attributes, materialize as SIMILAR_TO edges |
| Leiden rejects "not undirected" graph | Cypher Projection marks graphs as directed even with bidirectional edges | Switch to Native Projection with `orientation: 'UNDIRECTED'` |
| OOM during edge creation (1.4GB) | Cartesian product in large projects (2000² = 4M pairs) in a single transaction | Batch by project + increase Neo4j memory config |
| Stale SIMILAR_TO edges after failed runs | community-detect crashed before cleanup step | Redesign as persistent edges with a dedicated `rebuild-similarity` command for full rebuilds |

---

## What's next

1. **Graph embeddings.** Use Neo4j GDS's FastRP or Node2Vec to generate structural vectors for each issue, then combine with existing text vectors for hybrid search.
2. **Multi-level communities.** Leiden supports hierarchical clustering — we can select different levels based on query granularity.
3. **Incremental updates.** Currently SIMILAR_TO edges are rebuilt from scratch. Switching to delta updates for new/modified issues would reduce the daily pipeline cost.
4. **Cross-system integration.** Ingesting Confluence docs, Slack messages, and other unstructured data into the same graph, using LLM entity extraction to build cross-system relationships.

---

*This system is in production at KDAN. The architecture and query patterns are shared here; internal data and implementation details are proprietary.*
