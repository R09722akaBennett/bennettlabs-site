export type Project = {
  title: string;
  summary: string;
  impact: string;
  stack: string[];
  href: string;
};

export type Experience = {
  period: string;
  title: string;
  detail: string;
};

export type Metric = {
  label: string;
  value: string;
  note: string;
};

export type Capability = {
  title: string;
  detail: string;
};

export type ProcessStep = {
  title: string;
  detail: string;
};

export type Faq = {
  question: string;
  answer: string;
};

export type StackGroup = {
  title: string;
  items: string[];
};

export const profile = {
  name: "Bennett Tai",
  brand: "Bennett Labs",
  role: "AI Engineer",
  location: "Taipei, Taiwan",
  availability: "Open to full-time roles and focused consulting (remote-friendly)",
  tagline:
    "I build production-grade AI systems (RAG + agents) with reliability, security, and cost governance.",
  intro:
    "I’m an AI engineer who ships practical AI systems—RAG, tool-using agents, and automation workflows—built for production realities. I focus on measurable outcomes: clear acceptance criteria, observable behavior, and audit-friendly decisions (reliability, security, and cost governance).", 
  email: "info@bennettlabs.dev",
  resumeUrl: "#",
  links: {
    github: "https://github.com/R09722akaBennett?tab=repositories",
    linkedin: "https://www.linkedin.com/in/bennett-tai/",
    instagram: "https://www.instagram.com/data_lemak"
  }
};

export const focusAreas = [
  "RAG systems you can trust",
  "Tool-using agents (with guardrails)",
  "n8n automation ops",
  "Evaluation, reliability & governance"
];

export const metrics: Metric[] = [
  {
    label: "Work style",
    value: "Ship + iterate",
    note: "Get an end-to-end slice working, then improve with production signals."
  },
  {
    label: "Engineering focus",
    value: "Reliability",
    note: "Regression gates, failure modes, retries/fallbacks, and clear runbooks."
  },
  {
    label: "Governance",
    value: "Auditable",
    note: "Cost visibility, risk posture, and evidence trails for decisions."
  },
  {
    label: "Collaboration",
    value: "Cross-team",
    note: "Comfortable being the glue between BU/product, data, and engineering."
  }
];

export const capabilities: Capability[] = [
  {
    title: "RAG & LLM application architecture",
    detail:
      "Design retrieval-aware systems with explicit boundaries: citations/evidence, schema outputs, and safe fallbacks."
  },
  {
    title: "Agent workflows + tool reliability",
    detail:
      "Build tool-using agents that survive flaky tools and messy inputs: timeouts, retries, and " +
      "robust evaluation harnesses."
  },
  {
    title: "n8n automation operations",
    detail:
      "Own automation platforms as a product: templates, permissions, monitoring, and change management."
  },
  {
    title: "Measurement & governance",
    detail:
      "Token/cost tracking, quotas/credits thinking, and audit-friendly logs to support enterprise requirements."
  }
];

export const projects: Project[] = [
  {
    title: "AI News War Room",
    summary:
      "Automated AI intelligence dashboard that collects news from 80+ sources, generates strategic reports with LLM analysis, and tracks 14 competitors with weekly/monthly/quarterly trend summaries.",
    impact:
      "Replaced hours of manual industry monitoring with a fully automated pipeline—daily cron on Mac Studio, SQLite storage, auto-deployed to Vercel.",
    stack: ["Astro", "Python", "Gemini API", "SQLite", "Vercel"],
    href: "https://github.com/R09722akaBennett/ainews-warroom"
  },
  {
    title: "NanoPDF MCP Server",
    summary:
      "Model Context Protocol server that integrates AI-powered PDF editing into Claude Desktop—modify slides via natural language, generate new pages, and maintain searchable text layers with OCR.",
    impact:
      "Privacy-first architecture with local versioning and undo support. Demonstrates MCP integration patterns for extending LLM tool capabilities.",
    stack: ["Python", "MCP", "Gemini 3 Pro", "Tesseract OCR"],
    href: "https://github.com/R09722akaBennett/nano-pdf-mcp"
  },
  {
    title: "Prompt Injection Tripwire",
    summary:
      "Scans untrusted text (web/tool outputs) for injection/exfil patterns and returns allow/ask/block with evidence.",
    impact:
      "A practical front-door safety layer before RAG/browsing/tool calls—designed to be explainable and auditable.",
    stack: ["Python", "FastAPI", "Security heuristics"],
    href: "https://github.com/R09722akaBennett/ai-daily-2026-02-14-prompt-injection-tripwire"
  },
  {
    title: "Access Credit Ledger",
    summary:
      "SQLite-backed usage ledger: ingest events (team/model/tokens/cost), set soft quotas, and generate spend audits.",
    impact:
      "Makes model spend and access governance visible early—before it becomes a billing or reliability incident.",
    stack: ["Python", "SQLite", "Streamlit"],
    href: "https://github.com/R09722akaBennett/ai-daily-2026-02-14-access-credit-ledger"
  },
  {
    title: "Agent Noise Harness",
    summary:
      "Mutates agent traces with controlled drops/truncation/jitter to regression-test robustness under noisy tools.",
    impact:
      "Turns clean-demo agents into production-ready systems by testing real failure modes before users hit them.",
    stack: ["Python", "Testing", "Eval tooling"],
    href: "https://github.com/R09722akaBennett/ai-daily-2026-02-14-agent-noise-harness"
  }
];

export const process: ProcessStep[] = [
  {
    title: "1. Define the real failure cost",
    detail:
      "Start from operator reality: what breaks at 2AM, what needs audit trails, and what must be gated."
  },
  {
    title: "2. Ship a thin vertical slice",
    detail:
      "Deliver end-to-end first (inputs→model/tool→outputs) with basic monitoring and rollback paths."
  },
  {
    title: "3. Add regression + guardrails",
    detail:
      "Build eval sets, gates, and safe fallbacks (refuse/ask/route) so changes don’t silently degrade."
  },
  {
    title: "4. Iterate with production signals",
    detail:
      "Use latency/cost/quality metrics to prioritize improvements and keep the system explainable."
  }
];

export const experience: Experience[] = [
  {
    period: "Recent",
    title: "AI Engineer",
    detail:
      "Shipped production-grade RAG and agent workflows with an emphasis on reliability, security, and cost governance (guardrails, eval gates, observability, and clear runbooks)."
  },
  {
    period: "KDAN (past year)",
    title: "Data Analyst → Analytics Engineer",
    detail:
      "Owned marketing/eCommerce analytics delivery at scale (800+ charts, 30+ recurring reports) and shipped 5+ ML projects. Introduced dbt and GitLab CI/CD to centralize transformation logic and enforce tests + version control, reducing data pipeline failures by 99% and establishing a single source of truth with standardized metric definitions. Deployed n8n workflow automation to significantly reduce manual effort in customer request triage/classification, and scoped a roadmap for real-time data processing. Tech stack: Python, SQL, dbt, GitLab CI/CD, n8n, BI/visualization tools."
  }
];

export const stackGroups: StackGroup[] = [
  {
    title: "AI",
    items: ["RAG", "Agent patterns", "Evaluation", "Prompt / tool safety"]
  },
  {
    title: "Backend",
    items: ["Python", "FastAPI", "SQLite/Postgres", "APIs", "Observability"]
  },
  {
    title: "Automation",
    items: ["n8n", "Workflow templates", "Permissions", "Monitoring"]
  },
  {
    title: "Frontend",
    items: ["React", "TypeScript", "Vite"]
  }
];

export const faqs: Faq[] = [
  {
    question: "What work are you open to?",
    answer:
      "Full-time AI engineering roles, or focused consulting (1–4 weeks) to help teams ship production-grade RAG/agent systems with reliability and governance."
  },
  {
    question: "What’s the best way to reach you?",
    answer:
      "Email me at info@bennettlabs.dev with a short context (your workflow, current stack, and what’s breaking)."
  },
  {
    question: "Do you do demos?",
    answer:
      "Yes—if it’s tied to a real workflow. I prefer demoing with failure modes, eval gates, and cost visibility so it’s closer to production reality."
  }
];
