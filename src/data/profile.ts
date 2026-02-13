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
  role: "AI Product Engineer",
  location: "Taipei, Taiwan",
  availability: "Open to global remote collaboration",
  tagline: "I design and ship AI products that create measurable business outcomes.",
  intro:
    "I work at the intersection of product, engineering, and AI systems. My focus is building practical tools that teams can trust in production, with observability and iteration built in from day one.",
  email: "hello@bennettlabs.dev",
  resumeUrl: "#",
  links: {
    github: "https://github.com/R09722akaBennett?tab=repositories",
    linkedin: "https://www.linkedin.com/in/bennett-tai/",
    instagram: "https://www.instagram.com/data_lemak"
  }
};

export const focusAreas = [
  "LLM Product Engineering",
  "Agent Workflow Design",
  "Reliable Cloud Delivery",
  "Measurement-Driven Iteration"
];

export const metrics: Metric[] = [
  {
    label: "Execution Style",
    value: "End-to-End",
    note: "From architecture decisions to shipping and post-launch optimization."
  },
  {
    label: "Engineering Focus",
    value: "Reliability",
    note: "Systems designed for observability, tracing, and graceful failure handling."
  },
  {
    label: "Product Priority",
    value: "Real Adoption",
    note: "Build what teams will actually use, not just demo-friendly prototypes."
  },
  {
    label: "Delivery Rhythm",
    value: "Fast Iteration",
    note: "Small cycles, measurable impact, and clear roadmap tradeoffs."
  }
];

export const capabilities: Capability[] = [
  {
    title: "LLM Application Architecture",
    detail:
      "Designing retrieval-aware and tool-using systems with clear boundaries, fallback paths, and runtime controls."
  },
  {
    title: "AI Workflow Operations",
    detail:
      "Instrumenting agent pipelines with logs, traces, token/cost visibility, and actionable debugging workflows."
  },
  {
    title: "Cloud-Native Delivery",
    detail:
      "Deploying AI services with containers, CI/CD pipelines, and environment strategies that scale with product growth."
  },
  {
    title: "Product + Engineering Alignment",
    detail:
      "Translating user and business goals into implementation plans with explicit tradeoffs and shipping milestones."
  }
];

export const projects: Project[] = [
  {
    title: "Contract Risk Analyzer",
    summary:
      "A legal-assist platform using retrieval-augmented analysis to detect risky clauses and explain policy conflicts in context.",
    impact:
      "Reduced first-pass contract review time in pilot workflows while improving consistency of risk classification.",
    stack: ["TypeScript", "Python", "OpenAI API", "PostgreSQL", "Vector Search"],
    href: "#"
  },
  {
    title: "Agent Ops Console",
    summary:
      "An operations dashboard for multi-step agent workflows with run replay, token breakdowns, latency tracing, and failure signatures.",
    impact:
      "Shortened incident triage cycles by turning opaque model behavior into structured operational signals.",
    stack: ["React", "FastAPI", "Redis", "Docker", "OpenTelemetry"],
    href: "#"
  },
  {
    title: "Cloud Launch Kit",
    summary:
      "A reusable delivery foundation for AI products, including container templates, environment configs, and deployment playbooks.",
    impact:
      "Standardized release quality and reduced friction from proof-of-concept to production deployment.",
    stack: ["Kubernetes", "Helm", "GitHub Actions", "GCP", "Terraform"],
    href: "#"
  }
];

export const process: ProcessStep[] = [
  {
    title: "1. Define the real problem",
    detail: "Clarify user workflows, business constraints, and failure costs before selecting technical patterns."
  },
  {
    title: "2. Build a thin but complete vertical slice",
    detail: "Ship a usable end-to-end path early, including observability and feedback loops from the start."
  },
  {
    title: "3. Measure behavior in production-like conditions",
    detail: "Track quality, latency, and cost signals to identify bottlenecks and reliability gaps."
  },
  {
    title: "4. Iterate with deliberate tradeoffs",
    detail: "Prioritize improvements by business impact and technical risk, then scale what proves value."
  }
];

export const experience: Experience[] = [
  {
    period: "Current",
    title: "Independent Builder",
    detail:
      "Building AI side projects with a strong focus on practical utility, robust architecture, and measurable outcomes."
  },
  {
    period: "Recent",
    title: "AI Systems Engineer",
    detail:
      "Designed retrieval and automation pipelines for production workflows with emphasis on reliability and observability."
  },
  {
    period: "Earlier",
    title: "Backend / Platform Engineer",
    detail:
      "Developed API platforms and cloud infrastructure that supported growth from MVPs to stable services."
  }
];

export const stackGroups: StackGroup[] = [
  {
    title: "Frontend",
    items: ["React", "TypeScript", "Vite", "Responsive UI"]
  },
  {
    title: "Backend",
    items: ["Python", "FastAPI", "Node.js", "PostgreSQL", "Redis"]
  },
  {
    title: "AI + Infra",
    items: ["OpenAI API", "RAG Patterns", "Docker", "Kubernetes", "CI/CD"]
  }
];

export const faqs: Faq[] = [
  {
    question: "What kind of projects do you collaborate on?",
    answer:
      "I focus on AI products where quality, reliability, and delivery speed matter equally, including internal tools and customer-facing platforms."
  },
  {
    question: "Do you only work on prototypes?",
    answer:
      "No. I can deliver from prototype to production, including architecture decisions, deployment setup, and iteration plans after launch."
  },
  {
    question: "How do we start working together?",
    answer:
      "Share your workflow problem and current constraints. I usually start with a scoped discovery and a concrete delivery plan."
  }
];
