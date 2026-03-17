export const profile = {
  name: "Bennett Tai",
  brand: "Bennett Labs",
  role: "AI Engineer",
  location: "Taipei, Taiwan",
  availability: "Open to full-time roles and focused consulting (remote-friendly)",
  tagline:
    "I build production-grade AI systems — RAG, agents, and automation — with reliability, security, and cost governance.",
  intro:
    "I ship practical AI systems built for production realities: clear acceptance criteria, observable behavior, and audit-friendly decisions.",
  email: "info@bennettlabs.dev",
  links: {
    github: "https://github.com/R09722akaBennett?tab=repositories",
    linkedin: "https://www.linkedin.com/in/bennett-tai/",
    instagram: "https://www.instagram.com/data_lemak",
  },
};

export const focusAreas = [
  "RAG systems you can trust",
  "Tool-using agents (with guardrails)",
  "n8n automation ops",
  "Evaluation, reliability & governance",
];

export type Metric = { label: string; value: string; note: string };
export const metrics: Metric[] = [
  {
    label: "Work style",
    value: "Ship + iterate",
    note: "Get an end-to-end slice working, then improve with production signals.",
  },
  {
    label: "Engineering focus",
    value: "Reliability",
    note: "Regression gates, failure modes, retries/fallbacks, and clear runbooks.",
  },
  {
    label: "Governance",
    value: "Auditable",
    note: "Cost visibility, risk posture, and evidence trails for decisions.",
  },
  {
    label: "Collaboration",
    value: "Cross-team",
    note: "Comfortable being the glue between BU/product, data, and engineering.",
  },
];

export type Project = {
  title: string;
  summary: string;
  impact: string;
  stack: string[];
  href: string;
};
export const projects: Project[] = [
  {
    title: "AI News War Room",
    summary:
      "Automated AI intelligence dashboard — collects news from 80+ sources, generates strategic reports with LLM analysis, tracks 14 competitors with trend summaries.",
    impact:
      "Replaced hours of manual monitoring with a fully automated pipeline — daily cron, SQLite storage, auto-deployed.",
    stack: ["Astro", "Python", "Gemini API", "SQLite", "Vercel"],
    href: "https://github.com/R09722akaBennett/ainews-warroom",
  },
  {
    title: "NanoPDF MCP Server",
    summary:
      "MCP server integrating AI-powered PDF editing into Claude Desktop — modify slides via natural language with OCR text layers.",
    impact:
      "Privacy-first with local versioning and undo. Demonstrates MCP integration patterns for LLM tool capabilities.",
    stack: ["Python", "MCP", "Gemini 3 Pro", "Tesseract OCR"],
    href: "https://github.com/R09722akaBennett/nano-pdf-mcp",
  },
  {
    title: "Prompt Injection Tripwire",
    summary:
      "Scans untrusted text for injection/exfil patterns and returns allow/ask/block with evidence.",
    impact:
      "Practical safety layer before RAG/browsing/tool calls — explainable and auditable.",
    stack: ["Python", "FastAPI", "Security heuristics"],
    href: "https://github.com/R09722akaBennett/ai-daily-2026-02-14-prompt-injection-tripwire",
  },
  {
    title: "Access Credit Ledger",
    summary:
      "SQLite-backed usage ledger: ingest events, set soft quotas, generate spend audits.",
    impact:
      "Makes model spend and access governance visible early — before billing or reliability incidents.",
    stack: ["Python", "SQLite", "Streamlit"],
    href: "https://github.com/R09722akaBennett/ai-daily-2026-02-14-access-credit-ledger",
  },
  {
    title: "Agent Noise Harness",
    summary:
      "Mutates agent traces with controlled drops/truncation/jitter to regression-test robustness.",
    impact:
      "Turns clean-demo agents into production-ready systems by testing real failure modes.",
    stack: ["Python", "Testing", "Eval tooling"],
    href: "https://github.com/R09722akaBennett/ai-daily-2026-02-14-agent-noise-harness",
  },
];

export type Capability = { title: string; detail: string };
export const capabilities: Capability[] = [
  {
    title: "RAG & LLM application architecture",
    detail:
      "Retrieval-aware systems with citations/evidence, schema outputs, and safe fallbacks.",
  },
  {
    title: "Agent workflows + tool reliability",
    detail:
      "Tool-using agents that survive flaky tools: timeouts, retries, and robust eval harnesses.",
  },
  {
    title: "n8n automation operations",
    detail:
      "Automation platforms as a product: templates, permissions, monitoring, and change management.",
  },
  {
    title: "Measurement & governance",
    detail:
      "Token/cost tracking, quotas/credits, and audit-friendly logs for enterprise requirements.",
  },
];

export type ProcessStep = { title: string; detail: string };
export const process: ProcessStep[] = [
  {
    title: "Define the real failure cost",
    detail:
      "Start from operator reality: what breaks at 2AM, what needs audit trails, what must be gated.",
  },
  {
    title: "Ship a thin vertical slice",
    detail:
      "End-to-end first (inputs > model/tool > outputs) with basic monitoring and rollback.",
  },
  {
    title: "Add regression + guardrails",
    detail:
      "Eval sets, gates, and safe fallbacks so changes don't silently degrade.",
  },
  {
    title: "Iterate with production signals",
    detail:
      "Latency/cost/quality metrics to prioritize improvements and keep the system explainable.",
  },
];

export type Experience = { period: string; title: string; detail: string };
export const experience: Experience[] = [
  {
    period: "Current",
    title: "AI Engineer",
    detail:
      "Production-grade RAG and agent workflows with reliability, security, and cost governance — guardrails, eval gates, observability, and clear runbooks.",
  },
  {
    period: "KDAN (past year)",
    title: "Data Analyst > Analytics Engineer",
    detail:
      "Marketing/eCommerce analytics at scale (800+ charts, 30+ reports). Shipped 5+ ML projects. Introduced dbt + GitLab CI/CD, reducing pipeline failures by 99%. Deployed n8n workflow automation for customer request triage.",
  },
];

export type StackGroup = { title: string; items: string[] };
export const stackGroups: StackGroup[] = [
  { title: "AI", items: ["RAG", "Agent patterns", "Evaluation", "Prompt / tool safety"] },
  { title: "Backend", items: ["Python", "FastAPI", "SQLite/Postgres", "APIs", "Observability"] },
  { title: "Automation", items: ["n8n", "Workflow templates", "Permissions", "Monitoring"] },
  { title: "Frontend", items: ["Astro", "TypeScript", "Tailwind CSS"] },
];

export type Faq = { question: string; answer: string };
export const faqs: Faq[] = [
  {
    question: "What work are you open to?",
    answer:
      "Full-time AI engineering roles, or focused consulting (1-4 weeks) to help teams ship production-grade RAG/agent systems with reliability and governance.",
  },
  {
    question: "What's the best way to reach you?",
    answer:
      "Email info@bennettlabs.dev with a short context — your workflow, current stack, and what's breaking.",
  },
  {
    question: "Do you do demos?",
    answer:
      "Yes — tied to real workflows. I prefer demoing with failure modes, eval gates, and cost visibility so it's closer to production reality.",
  },
];
