export const profile = {
  name: "Bennett Tai",
  brand: "Bennett Labs",
  role: "AI Engineer",
  location: "Taipei, Taiwan",
  availability: "Open to full-time roles and focused consulting engagements (remote-friendly)",
  tagline:
    "Ship it, monitor it, own it.",
  intro:
    "AI Engineer at KDAN, driving AI strategy at HQ R&D. I build multi-agent systems, RAG pipelines, and document AI solutions shipped to production. On the side, I'm an indie developer building iOS apps and knowledge platforms with AI features. Everything I build is designed for real-world reliability: observable, auditable, and cost-aware.",
  email: "info@bennettlabs.dev",
  links: {
    github: "https://github.com/R09722akaBennett?tab=repositories",
    linkedin: "https://www.linkedin.com/in/bennett-tai/",
    instagram: "https://www.instagram.com/data_lemak",
  },
};

export const focusAreas = [
  "Multi-agent systems & RAG pipelines",
  "iOS apps with AI features",
  "Data infrastructure & DataOps",
  "Indie developer & side projects",
];

export type Metric = { label: string; value: string; note: string };
export const metrics: Metric[] = [
  {
    label: "Pipeline reliability",
    value: "99% fewer failures",
    note: "Reduced data pipeline failures by 99% at KDAN through dbt + GitLab CI/CD standardization.",
  },
  {
    label: "Analytics scale",
    value: "800+ dashboards",
    note: "Built and maintained 800+ charts and 30+ recurring reports across business units with a 2-person team.",
  },
  {
    label: "Automation impact",
    value: "80% less manual work",
    note: "Automation tools and workflow templates reduced repetitive tasks by 80% across departments.",
  },
  {
    label: "ML accuracy",
    value: "82%",
    note: "Instagram Reach forecasting model at iKala (KOL Radar) achieved 82% prediction accuracy.",
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
      "Autonomous intelligence platform that turns 80+ AI news sources into daily strategic reports and competitor tracking for 14 companies — powered by context engineering that compresses accumulated history into efficient LLM context via a daily→weekly→monthly→quarterly pyramid.",
    impact:
      "Zero manual effort: daily cron collects, deduplicates, compresses, and deploys. Dual-track analysis (company-specific strategy + objective industry view) with full token cost observability.",
    stack: ["Astro", "Python", "Gemini API", "SQLite", "Vercel"],
    href: "",
  },
  {
    title: "NanoPDF MCP Server",
    summary:
      "MCP server that brings AI-powered PDF editing directly into Claude Desktop — edit slides with natural language while preserving searchable text layers via OCR.",
    impact:
      "Privacy-first: all processing is local with built-in versioning and undo. A working reference for MCP tool integration patterns.",
    stack: ["Python", "MCP", "Gemini 3 Pro", "Tesseract OCR"],
    href: "https://github.com/R09722akaBennett/nano-pdf-mcp",
  },
  {
    title: "Cortex",
    summary:
      "Interactive data science interview prep platform with 14 topics, live Python execution in the browser (Pyodide), D3 visualizations (gradient descent, attention heatmaps, decision boundaries), and AI-powered mock interviews with scoring.",
    impact:
      "Live at ds.bennettlabs.dev. Covers statistics, ML, deep learning, system design, and SQL — with flashcards, quizzes, and a confidence tracker.",
    stack: ["Next.js", "TypeScript", "Pyodide", "D3.js", "Gemini API", "Cloudflare"],
    href: "https://cortex.bennettlabs.dev/",
  },
  {
    title: "FitTrack",
    summary:
      "AI-powered fitness and nutrition tracking iOS app. Snap a photo of your meal for instant nutritional analysis, get personalized workout plans, and receive daily AI tips based on your 7-day history.",
    impact:
      "Full-stack indie project: SwiftUI frontend with SwiftData, FastAPI + PostgreSQL backend, Gemini for AI features. Multi-language support (EN/ZH/JA/KO).",
    stack: ["SwiftUI", "FastAPI", "PostgreSQL", "Gemini API", "Docker"],
    href: "",
  },
  {
    title: "Contract Risk Analysis Agent",
    summary:
      "Multi-agent system for enterprise contract risk assessment. Four-phase pipeline: rule generation, risk analyst, senior reviewer with iterative feedback, and executive summarizer — backed by Taiwan legal statute RAG.",
    impact:
      "Deployed across Google ADK, OpenAI Agents SDK, and ChatGPT App versions. Generates HTML risk reports with clause-level scores and modification suggestions.",
    stack: ["Google ADK", "OpenAI", "FastAPI", "ChromaDB", "Langfuse"],
    href: "",
  },
  {
    title: "Enterprise Data Agent",
    summary:
      "Hierarchical AI system for natural language data access. Manager-worker architecture: root orchestrator routes to query agent (Text2SQL), analytics agent (chart generation), and ML agent (BQML forecasting).",
    impact:
      "Democratized BigQuery access across business units — non-technical teams can query, visualize, and forecast without writing SQL.",
    stack: ["Vertex AI Agent Engine", "Gemini 2.5", "BigQuery", "BQML", "OAuth2"],
    href: "",
  },
  {
    title: "Signature & Form Field Detection",
    summary:
      "Dual-approach document intelligence: YOLO model for signature detection with confidence scoring, and Gemini Vision for fillable form field detection with multi-round tile-based refinement.",
    impact:
      "Production-deployed to Google Cloud Run. Serves as core infrastructure for KDAN's document processing products.",
    stack: ["YOLO", "Gemini Vision", "FastAPI", "Cloud Run", "DocumentAI"],
    href: "",
  },
  {
    title: "Redmine AI Assistant",
    summary:
      "AI-powered project management assistant accessible via Mattermost chat. Natural language issue creation, querying, file uploads, and custom rule execution — with per-user encrypted token storage.",
    impact:
      "Brought intelligent Redmine access directly into team chat workflows. Multi-user safe with session isolation and Langfuse tracing.",
    stack: ["Google ADK", "FastMCP", "mmpy-bot", "SQLite", "Fernet"],
    href: "",
  },
  {
    title: "Sales Forecasting Pipeline",
    summary:
      "Multi-model ensemble for regional sales forecasting combining Gradient Boosting, XGBoost, and Prophet. Automated pipeline with BigQuery integration, feature engineering, and MLflow experiment tracking.",
    impact:
      "Provided data-driven sales projections across product lines and regions. Pipeline results auto-notified via Mattermost.",
    stack: ["XGBoost", "Prophet", "MLflow", "BigQuery", "scikit-learn"],
    href: "",
  },
  {
    title: "KOL Reach Forecasting Model",
    summary:
      "Machine learning model predicting Instagram Reach for influencer campaigns at iKala's KOL Radar platform. Built from social platform data with custom feature engineering.",
    impact:
      "Achieved 82% prediction accuracy. Used by the platform to help brands evaluate KOL campaign ROI before committing budget.",
    stack: ["Python", "scikit-learn", "BigQuery", "Feature engineering"],
    href: "",
  },
  {
    title: "Content Translation Pipeline",
    summary:
      "Automated multilingual translation pipeline with deduplication logic for BigQuery nested/array columns. Handles complex SQL transformations to avoid redundant API calls on already-translated content, then classifies into structured categories.",
    impact:
      "Replaced manual translation and tagging across marketing teams. Concurrent processing with structured JSON logging for cloud observability.",
    stack: ["Gemini API", "BigQuery", "Python", "Mattermost"],
    href: "",
  },
];

export type Capability = { title: string; detail: string };
export const capabilities: Capability[] = [
  {
    title: "Multi-agent systems",
    detail:
      "Production multi-agent pipelines with Google ADK and OpenAI Agents SDK. At KDAN: contract risk analysis with iterative analyst-reviewer loops, hierarchical data agents with Text2SQL, and Redmine workflow automation via Mattermost.",
  },
  {
    title: "RAG & document AI",
    detail:
      "End-to-end retrieval pipelines with citations, structured outputs, and evaluation. Built KDAN's RAG chatbot (OpenAI + Claude + Gemini, Langfuse tracing, RAGAS eval) and template-driven PDF data extraction systems.",
  },
  {
    title: "Computer vision & detection",
    detail:
      "YOLO-based signature detection and Gemini Vision form field detection deployed to Google Cloud Run. Dual approach: local ML models for speed, cloud DocumentAI for accuracy.",
  },
  {
    title: "Data infrastructure & DataOps",
    detail:
      "Built KDAN's data ecosystem from the ground up: dbt, Airflow + Cosmos, Grafana, GitLab CI/CD. Multi-model sales forecasting with MLflow. The framework expanded group-wide across business units.",
  },
];

export type ProcessStep = { title: string; detail: string };
export const process: ProcessStep[] = [
  {
    title: "Understand the failure cost",
    detail:
      "What breaks at 2AM? What needs an audit trail? What happens when the model returns garbage? Start from the risks, not the features.",
  },
  {
    title: "Ship end-to-end first",
    detail:
      "Get a thin vertical slice working — inputs through model through outputs — with basic monitoring and a rollback plan. Then iterate.",
  },
  {
    title: "Add guardrails",
    detail:
      "Evaluation sets, quality gates, and safe fallbacks so deployments don't silently degrade over time.",
  },
  {
    title: "Optimize with real data",
    detail:
      "Use production latency, cost, and quality metrics to decide what to improve next — not guesswork.",
  },
];

export type Experience = { period: string; title: string; org: string; detail: string };
export const experience: Experience[] = [
  {
    period: "2025 — Present",
    title: "AI Engineer — HQ R&D",
    org: "KDAN",
    detail:
      "Driving AI strategy for the group. Built multi-agent contract risk analysis systems (Google ADK + OpenAI), YOLO-based signature detection deployed to Cloud Run, hierarchical data agent with Text2SQL on BigQuery (Vertex AI Agent Engine), agentic form field detection with Gemini Vision, and an AI-powered Redmine assistant via Mattermost. Led KdanAI Playground and Local LLM Deployment for secure on-premise access.",
  },
  {
    period: "Jan 2024 — Jan 2025",
    title: "Analytics Engineer",
    org: "KDAN",
    detail:
      "Introduced the Analytics Engineer role. Built the company's RAG chatbot (OpenAI + Claude + Gemini with Langfuse tracing and RAGAS evaluation). Orchestrated ETL-to-ELT transition with dbt. Built data ecosystem with Airflow, Cosmos, and Grafana that expanded group-wide. Deployed n8n workflow automation across departments.",
  },
  {
    period: "Dec 2022 — Dec 2023",
    title: "Data Analyst",
    org: "KDAN",
    detail:
      "800+ charts, 30+ recurring reports, 5+ ML projects — with a 2-person team. Developed multi-model sales forecasting (XGBoost, Prophet, MLflow). Built CDPs for attribution modeling and customer segmentation. Integrated BigQuery with e-commerce, LINE OA, SMS, GA4, and newsletter platforms.",
  },
  {
    period: "Jan 2021 — Nov 2022",
    title: "Database Analyst (Intern)",
    org: "iKala / KOL Radar",
    detail:
      "Built Instagram Reach forecasting ML model (82% accuracy). Tracked Auto-Label model performance. Social platform data analysis and competitive intelligence at Taiwan's leading AI transformation company.",
  },
];

export type Education = { school: string; degree: string; period: string };
export const education: Education[] = [
  {
    school: "National Taiwan University",
    degree: "M.S. Business Intelligence & Data Analytics",
    period: "2020 — 2023",
  },
  {
    school: "National Taiwan University",
    degree: "B.A. Law",
    period: "2015 — 2020",
  },
];

export type Certification = { name: string; issuer: string; year: string };
export const certifications: Certification[] = [
  { name: "LLM & AI Agent Technologies", issuer: "National Taiwan University", year: "2025" },
  { name: "Databricks Fundamentals", issuer: "Databricks", year: "2025" },
  { name: "Practical Data Science with SageMaker", issuer: "AWS", year: "2025" },
  { name: "Machine Learning Foundations", issuer: "AWS", year: "2025" },
];

export type StackGroup = { title: string; items: string[] };
export const stackGroups: StackGroup[] = [
  { title: "AI / LLM", items: ["Google ADK", "OpenAI Agents SDK", "RAG", "MCP", "RAGAS", "Langfuse", "Vertex AI"] },
  { title: "ML / Vision", items: ["YOLO", "Gemini Vision", "XGBoost", "Prophet", "MLflow", "SageMaker"] },
  { title: "Data", items: ["Python", "SQL", "dbt", "BigQuery", "Airflow", "Qdrant", "ChromaDB", "SQLite"] },
  { title: "Mobile", items: ["SwiftUI", "SwiftData", "iOS", "Vibe coding"] },
  { title: "Infra", items: ["FastAPI", "Cloud Run", "Docker", "GitLab CI/CD", "Grafana", "n8n"] },
];

export type Community = { title: string; detail: string };
export const community: Community[] = [
  {
    title: "WiDS Taipei 2025 — Core Organizing Team",
    detail: "Taiwanese in Data Science. 4 years attending, first year as core organizer. Connected with leaders from OpenAI and international data teams.",
  },
  {
    title: "NCKU Data Analytics Club — Guest Speaker",
    detail: "Invited to share career journey and insights on data engineering and professional development.",
  },
];

export type Faq = { question: string; answer: string };
export const faqs: Faq[] = [
  {
    question: "What kind of work are you open to?",
    answer:
      "Full-time AI engineering roles where I can own system reliability end-to-end, independent consulting (1-4 weeks) to help teams get their RAG / agent pipelines production-ready, or contract-based development work.",
  },
  {
    question: "How should I reach out?",
    answer:
      "Email info@bennettlabs.dev. Include a brief context: what you're building, what stack you're on, and what's not working yet. I'll respond within 24 hours.",
  },
  {
    question: "What are you building outside of work?",
    answer:
      "iOS apps with AI features (vibe coding with SwiftUI), and knowledge platforms like DS Interview Lab. I'm exploring the indie developer path — shipping side projects that solve real problems.",
  },
];
