export type ProductCategory =
  | "saas"
  | "marketplace"
  | "education"
  | "commerce"
  | "automation"
  | "analytics"
  | "developer-tool"
  | "operations"
  | "general";

export type ProductComplexity = "mvp" | "standard" | "enterprise";

export type CoreFeature = {
  id: string;
  name: string;
  priority: "P0" | "P1" | "P2";
  description: string;
  businessValue: string;
  acceptanceCriteria: string[];
};

export type UserStory = {
  id: string;
  role: string;
  goal: string;
  benefit: string;
};

export type RequirementItem = {
  id: string;
  title: string;
  priority: "P0" | "P1" | "P2";
  description: string;
};

export type RiskItem = {
  id: string;
  risk: string;
  severity: "low" | "medium" | "high";
  mitigation: string;
};

export type SuccessMetric = {
  id: string;
  metric: string;
  target: string;
  reason: string;
};

export type EnterprisePrd = {
  documentType: "Enterprise PRD";
  version: "2.0";
  generatedAt: string;
  productName: string;
  category: ProductCategory;
  complexity: ProductComplexity;
  executiveSummary: string;
  productVision: string;
  problemStatement: string;
  targetUsers: string[];
  businessGoals: string[];
  nonGoals: string[];
  coreFeatures: CoreFeature[];
  userStories: UserStory[];
  functionalRequirements: RequirementItem[];
  nonFunctionalRequirements: RequirementItem[];
  dataEntities: string[];
  apiCandidates: string[];
  successMetrics: SuccessMetric[];
  risks: RiskItem[];
  openQuestions: string[];
  roadmap: {
    phase: string;
    objective: string;
    deliverables: string[];
  }[];
  enterpriseChecklist: string[];
};

export type ProjectBrainRuntime = {
  productName: string;
  originalInput: string;
  category: ProductCategory;
  complexity: ProductComplexity;
  sourceOfTruth: string;
  principles: string[];
  decisionLog: string[];
  currentRuntimeFlow: string[];
  nextMilestones: string[];
};

export type PrdEngineResult = {
  brain: ProjectBrainRuntime;
  prd: EnterprisePrd;
};

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function titleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function inferProductName(input: string): string {
  const cleaned = normalizeWhitespace(input);

  const explicitNameMatch = cleaned.match(
    /(?:called|named|name is|project name is|app called|platform called)\s+([a-zA-Z0-9\s-]{2,40})/i,
  );

  if (explicitNameMatch?.[1]) {
    return titleCase(explicitNameMatch[1].slice(0, 40));
  }

  const words = cleaned
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(" ")
    .filter((word) => word.length > 2)
    .slice(0, 4);

  if (words.length > 0) {
    return `${titleCase(words.join(" "))} OS`;
  }

  return "Generated Product OS";
}

function inferCategory(input: string): ProductCategory {
  const text = input.toLowerCase();

  if (/(developer|code|deploy|github|api|sdk|devtool|engineering)/.test(text)) {
    return "developer-tool";
  }

  if (/(learn|course|student|teacher|education|training|lesson)/.test(text)) {
    return "education";
  }

  if (/(shop|store|commerce|payment|order|cart|marketplace|seller|buyer)/.test(text)) {
    return text.includes("marketplace") ? "marketplace" : "commerce";
  }

  if (/(automation|workflow|agent|ai|generate|assistant|router)/.test(text)) {
    return "automation";
  }

  if (/(dashboard|analytics|report|metric|insight|data)/.test(text)) {
    return "analytics";
  }

  if (/(team|operation|ops|workspace|project|task)/.test(text)) {
    return "operations";
  }

  if (/(subscription|saas|b2b|enterprise)/.test(text)) {
    return "saas";
  }

  return "general";
}

function inferComplexity(input: string): ProductComplexity {
  const text = input.toLowerCase();

  const enterpriseSignals = [
    "enterprise",
    "team",
    "workspace",
    "auth",
    "role",
    "permission",
    "audit",
    "security",
    "scale",
    "multi-ai",
    "deployment",
    "monitor",
  ];

  const score = enterpriseSignals.reduce((count, signal) => {
    return text.includes(signal) ? count + 1 : count;
  }, 0);

  if (score >= 4) return "enterprise";
  if (score >= 2) return "standard";

  return "mvp";
}

function buildCoreFeatures(category: ProductCategory): CoreFeature[] {
  const base: CoreFeature[] = [
    {
      id: "F-001",
      name: "Product Idea Intake",
      priority: "P0",
      description: "Accept a clear product idea or requirement from the user and convert it into structured runtime context.",
      businessValue: "Reduces the gap between raw ideas and executable product planning.",
      acceptanceCriteria: [
        "User can submit a product idea from the dashboard.",
        "System validates empty or invalid input.",
        "System creates a unique project runtime ID.",
      ],
    },
    {
      id: "F-002",
      name: "Project Brain Generation",
      priority: "P0",
      description: "Create a shared source of truth that stores product vision, assumptions, principles, and runtime decisions.",
      businessValue: "Prevents fragmented AI output and keeps all modules aligned.",
      acceptanceCriteria: [
        "Project Brain is generated for every project.",
        "Brain includes product name, category, principles, flow, and next milestones.",
        "Brain can be displayed in the project runtime page.",
      ],
    },
    {
      id: "F-003",
      name: "Enterprise PRD Generation",
      priority: "P0",
      description: "Generate a structured PRD with goals, users, features, requirements, risks, metrics, and roadmap.",
      businessValue: "Creates investor-ready and engineering-ready product documentation.",
      acceptanceCriteria: [
        "PRD contains business goals and non-goals.",
        "PRD contains functional and non-functional requirements.",
        "PRD contains success metrics, risks, and open questions.",
      ],
    },
    {
      id: "F-004",
      name: "Architecture Blueprint",
      priority: "P0",
      description: "Generate a practical system architecture aligned with the PRD and default technical stack.",
      businessValue: "Turns planning into implementation-ready technical direction.",
      acceptanceCriteria: [
        "Architecture includes frontend, backend, database, security, and deployment layers.",
        "Architecture follows Next.js, TypeScript, TailwindCSS, Supabase, and Vercel.",
        "Architecture avoids unnecessary paid infrastructure in MVP mode.",
      ],
    },
    {
      id: "F-005",
      name: "Engineering Task Plan",
      priority: "P0",
      description: "Break the product into implementation tasks that can be executed by a developer or AI coding agent.",
      businessValue: "Converts strategy into measurable engineering execution.",
      acceptanceCriteria: [
        "Tasks are grouped by phase.",
        "Each task includes priority and acceptance criteria.",
        "Tasks preserve the PRD → Architecture → Code workflow.",
      ],
    },
  ];

  if (category === "education") {
    base.push({
      id: "F-006",
      name: "Learning Content Runtime",
      priority: "P1",
      description: "Support lesson, course, module, or learning path structures.",
      businessValue: "Makes the product useful for education and training use cases.",
      acceptanceCriteria: [
        "System can represent learning modules.",
        "System can track learner-facing content requirements.",
        "System can support future progress tracking.",
      ],
    });
  }

  if (category === "commerce" || category === "marketplace") {
    base.push({
      id: "F-006",
      name: "Transaction Flow Mapping",
      priority: "P1",
      description: "Define buyer, seller, order, payment, and fulfillment requirements.",
      businessValue: "Prepares the system for commercial transaction workflows.",
      acceptanceCriteria: [
        "System identifies core transaction entities.",
        "System separates MVP commerce flow from future payment automation.",
        "System includes fraud and trust considerations.",
      ],
    });
  }

  if (category === "developer-tool" || category === "automation") {
    base.push({
      id: "F-006",
      name: "Automation Runtime",
      priority: "P1",
      description: "Support repeatable generation, routing, validation, and export workflows.",
      businessValue: "Makes the product scalable beyond one-off generation.",
      acceptanceCriteria: [
        "System can represent generation steps.",
        "System can track outputs per project.",
        "System can support future AI router integration.",
      ],
    });
  }

  return base;
}

function buildFunctionalRequirements(features: CoreFeature[]): RequirementItem[] {
  return features.map((feature, index) => ({
    id: `FR-${String(index + 1).padStart(3, "0")}`,
    title: feature.name,
    priority: feature.priority,
    description: `The system must provide ${feature.name.toLowerCase()} with clear user feedback, stable state handling, and exportable output.`,
  }));
}

function buildNonFunctionalRequirements(): RequirementItem[] {
  return [
    {
      id: "NFR-001",
      title: "Security First",
      priority: "P0",
      description: "All future persistent storage must enforce user ownership, input validation, and access control before production release.",
    },
    {
      id: "NFR-002",
      title: "Scalability First",
      priority: "P0",
      description: "The architecture must support moving from LocalStorage to Supabase without rewriting the product runtime.",
    },
    {
      id: "NFR-003",
      title: "Reliability First",
      priority: "P0",
      description: "Generation output must be deterministic enough for MVP use and resilient to malformed input.",
    },
    {
      id: "NFR-004",
      title: "Maintainability First",
      priority: "P0",
      description: "Engines must remain modular and typed so PRD, Architecture, Tasks, Memory, and Deployment can evolve independently.",
    },
    {
      id: "NFR-005",
      title: "Performance First",
      priority: "P1",
      description: "MVP generation should complete without blocking the UI for long operations or requiring paid external services.",
    },
  ];
}

function buildUserStories(): UserStory[] {
  return [
    {
      id: "US-001",
      role: "Founder",
      goal: "turn a raw product idea into an organized product plan",
      benefit: "I can validate and present the product faster.",
    },
    {
      id: "US-002",
      role: "Developer",
      goal: "receive implementation-ready architecture and tasks",
      benefit: "I can start coding without guessing the product direction.",
    },
    {
      id: "US-003",
      role: "Product Manager",
      goal: "review requirements, scope, risks, and success metrics",
      benefit: "I can control delivery quality and reduce rework.",
    },
    {
      id: "US-004",
      role: "Investor or Stakeholder",
      goal: "understand the product vision and commercial direction",
      benefit: "I can evaluate whether the project is serious and scalable.",
    },
  ];
}

function buildDataEntities(category: ProductCategory): string[] {
  const base = ["User", "Project", "ProjectBrain", "PRD", "Architecture", "Task", "ExportPack"];

  if (category === "education") return [...base, "Course", "Lesson", "Progress"];
  if (category === "commerce" || category === "marketplace") return [...base, "Product", "Order", "Payment", "Customer"];
  if (category === "developer-tool" || category === "automation") return [...base, "GenerationRun", "AIProvider", "ValidationResult"];

  return base;
}

function buildApiCandidates(): string[] {
  return [
    "POST /api/generate",
    "GET /api/projects",
    "GET /api/projects/:id",
    "POST /api/projects/:id/export",
    "POST /api/projects/:id/regenerate/prd",
    "POST /api/projects/:id/regenerate/architecture",
    "POST /api/projects/:id/regenerate/tasks",
  ];
}

export function generatePrdV2(input: string): PrdEngineResult {
  const normalizedInput = normalizeWhitespace(input);
  const productName = inferProductName(normalizedInput);
  const category = inferCategory(normalizedInput);
  const complexity = inferComplexity(normalizedInput);
  const coreFeatures = buildCoreFeatures(category);

  const prd: EnterprisePrd = {
    documentType: "Enterprise PRD",
    version: "2.0",
    generatedAt: new Date().toISOString(),
    productName,
    category,
    complexity,
    executiveSummary: `${productName} is a production-oriented software product generated from the idea: "${normalizedInput}". The product should convert user intent into a structured, executable product runtime.`,
    productVision: "Build a real software product that transforms unclear product ideas into clear requirements, architecture, engineering tasks, and deployment-ready execution plans.",
    problemStatement: "Founders and builders often have product ideas but lack a repeatable system to convert those ideas into production-grade specifications, architecture, and implementation tasks.",
    targetUsers: [
      "Solo founders",
      "Startup teams",
      "Product managers",
      "Developers",
      "Agencies",
      "AI-assisted builders",
    ],
    businessGoals: [
      "Reduce time from idea to executable product plan.",
      "Improve product planning quality before code is written.",
      "Create reusable project memory across PRD, architecture, tasks, and deployment.",
      "Support future commercial SaaS subscription and team workspace models.",
    ],
    nonGoals: [
      "Do not become a generic chatbot wrapper.",
      "Do not replace human product ownership or engineering review.",
      "Do not introduce unnecessary paid infrastructure during MVP stage.",
      "Do not downgrade the architecture into a prompt library.",
    ],
    coreFeatures,
    userStories: buildUserStories(),
    functionalRequirements: buildFunctionalRequirements(coreFeatures),
    nonFunctionalRequirements: buildNonFunctionalRequirements(),
    dataEntities: buildDataEntities(category),
    apiCandidates: buildApiCandidates(),
    successMetrics: [
      {
        id: "SM-001",
        metric: "Idea-to-PRD completion rate",
        target: "90%+ of valid inputs produce a complete PRD",
        reason: "Measures whether the product reliably converts ideas into structured planning output.",
      },
      {
        id: "SM-002",
        metric: "Project runtime completion",
        target: "80%+ of generated projects include PRD, architecture, tasks, and export pack",
        reason: "Measures full workflow success instead of isolated text generation.",
      },
      {
        id: "SM-003",
        metric: "Time to first project plan",
        target: "Under 60 seconds for MVP local generation",
        reason: "Keeps the product useful for fast founder and developer workflows.",
      },
    ],
    risks: [
      {
        id: "R-001",
        risk: "Generated output may be too generic for advanced users.",
        severity: "medium",
        mitigation: "Add domain-specific templates, project memory, and AI Router provider selection in later phases.",
      },
      {
        id: "R-002",
        risk: "LocalStorage cannot support team collaboration or secure persistence.",
        severity: "high",
        mitigation: "Move project persistence to Supabase with authentication and row-level security.",
      },
      {
        id: "R-003",
        risk: "Poor prompt input may produce weak product plans.",
        severity: "medium",
        mitigation: "Add guided intake, clarifying questions, and input scoring in Generator V2.",
      },
    ],
    openQuestions: [
      "Who is the first paying customer segment?",
      "Should the first commercial plan target solo founders, agencies, or software teams?",
      "Which AI providers should be supported first in Multi-AI Router?",
      "What export formats should be supported after Markdown?",
    ],
    roadmap: [
      {
        phase: "Runtime Alpha",
        objective: "Complete local project runtime with structured PRD, architecture, tasks, and export.",
        deliverables: ["Project Brain UI", "PRD V2", "Architecture V2", "Task V2"],
      },
      {
        phase: "Runtime Beta",
        objective: "Add secure persistence, authentication, and team workspace.",
        deliverables: ["Supabase schema", "Auth", "Workspace roles", "Project ownership"],
      },
      {
        phase: "Commercial MVP",
        objective: "Prepare product for real users and investor/customer demos.",
        deliverables: ["Premium landing page", "Usage limits", "Billing-ready architecture", "Demo projects"],
      },
    ],
    enterpriseChecklist: [
      "Typed engine outputs",
      "Stable project runtime ID",
      "Structured project memory",
      "PRD → Architecture → Tasks continuity",
      "Local MVP storage compatibility",
      "Future Supabase persistence compatibility",
      "Security and access-control planning",
      "Exportable handoff package",
    ],
  };

  const brain: ProjectBrainRuntime = {
    productName,
    originalInput: normalizedInput,
    category,
    complexity,
    sourceOfTruth: "Project Brain is the shared runtime memory for PRD, Architecture, Tasks, Export, and future Deployment Engine.",
    principles: [
      "Security First",
      "Scalability First",
      "Reliability First",
      "Maintainability First",
      "Performance First",
      "No architecture downgrade",
      "Real product value over prompt-only output",
    ],
    decisionLog: [
      "Use deterministic local PRD V2 engine for runtime-alpha to avoid paid API dependency.",
      "Keep generated output structured so Supabase persistence can be added without redesign.",
      "Preserve LocalStorage compatibility until authentication and project database are introduced.",
    ],
    currentRuntimeFlow: [
      "User Input",
      "Generate Product",
      "Project Brain",
      "PRD V2",
      "Architecture",
      "Tasks",
      "Export Pack",
    ],
    nextMilestones: [
      "Architecture Generator V2",
      "Task Generator V2",
      "Supabase project persistence",
      "Authentication",
      "Team Workspace",
      "Multi-AI Router",
    ],
  };

  return {
    brain,
    prd,
  };
}

export function generatePRD(input: string): string {
  return JSON.stringify(generatePrdV2(input).prd, null, 2);
}