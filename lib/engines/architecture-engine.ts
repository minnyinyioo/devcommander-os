import type { EnterprisePrd, ProductCategory, ProductComplexity } from "./prd-engine";

export type ArchitectureStack = {
  frontend: string[];
  backend: string[];
  database: string[];
  auth: string[];
  deployment: string[];
  monitoring: string[];
};

export type FrontendModule = {
  id: string;
  name: string;
  route: string;
  componentScope: string[];
  responsibility: string;
  sourceFeatureIds: string[];
  stateModel: string;
  acceptanceCoverage: string[];
};

export type BackendApiEndpoint = {
  id: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  responsibility: string;
  requestModel: string;
  responseModel: string;
  authRequired: boolean;
  rateLimitPolicy: string;
  validationRules: string[];
};

export type SupabaseColumn = {
  name: string;
  type: string;
  nullable: boolean;
  notes: string;
};

export type SupabaseTablePlan = {
  id: string;
  tableName: string;
  sourceEntity: string;
  purpose: string;
  columns: SupabaseColumn[];
  indexes: string[];
  rlsPolicies: string[];
};

export type SecurityBoundary = {
  id: string;
  boundary: string;
  risk: string;
  controls: string[];
  enforcementPhase: "runtime-alpha" | "runtime-beta" | "production";
};

export type DeploymentTopology = {
  environments: {
    name: "local" | "preview" | "production";
    purpose: string;
    infrastructure: string[];
    requiredSecrets: string[];
  }[];
  buildChecks: string[];
  rollbackStrategy: string[];
  costModel: string;
};

export type MonitoringPlan = {
  events: string[];
  logs: string[];
  metrics: string[];
  alerts: string[];
  auditTrail: string[];
};

export type ModuleDependency = {
  from: string;
  to: string;
  reason: string;
};

export type ArchitectureBlueprint = {
  documentType: "Architecture Blueprint";
  version: "2.0";
  generatedAt: string;
  systemName: string;
  category: ProductCategory;
  complexity: ProductComplexity;
  architectureStyle: string;
  stack: ArchitectureStack;
  runtimeAssumptions: string[];
  frontendModuleMap: FrontendModule[];
  backendApiMap: BackendApiEndpoint[];
  supabaseTablePlan: SupabaseTablePlan[];
  securityBoundaries: SecurityBoundary[];
  deploymentTopology: DeploymentTopology;
  monitoringPlan: MonitoringPlan;
  moduleDependencyGraph: ModuleDependency[];
  dataFlow: string[];
  scalabilityModel: string[];
  reliabilityModel: string[];
  performanceModel: string[];
  futureUpgradePath: string[];
  engineeringNotes: string[];
};

function toKebabCase(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function toSnakeCase(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function normalizeMethod(value: string): BackendApiEndpoint["method"] {
  const method = value.toUpperCase();

  if (
    method === "GET" ||
    method === "POST" ||
    method === "PUT" ||
    method === "PATCH" ||
    method === "DELETE"
  ) {
    return method;
  }

  return "GET";
}

function parseApiCandidate(candidate: string, index: number): BackendApiEndpoint {
  const parts = candidate.trim().split(/\s+/);
  const method = normalizeMethod(parts[0] ?? "GET");
  const path = parts[1] ?? `/api/generated/${index + 1}`;

  const authRequired =
    !path.includes("/api/generate") &&
    !path.includes("/api/health") &&
    !path.includes("/api/public");

  return {
    id: `API-${String(index + 1).padStart(3, "0")}`,
    method,
    path,
    responsibility: buildEndpointResponsibility(method, path),
    requestModel: buildRequestModel(method, path),
    responseModel: buildResponseModel(method, path),
    authRequired,
    rateLimitPolicy: authRequired
      ? "Workspace-aware rate limit after authentication is added."
      : "Public runtime-alpha limit; add IP/session limits before production.",
    validationRules: [
      "Validate request body shape before engine execution.",
      "Reject empty or oversized payloads.",
      "Never trust client-generated ownership fields.",
      "Return typed JSON responses with explicit error messages.",
    ],
  };
}

function buildEndpointResponsibility(
  method: BackendApiEndpoint["method"],
  path: string,
): string {
  if (path.includes("generate")) {
    return "Coordinate Project Brain, PRD, Architecture, Tasks, and Export Pack generation.";
  }

  if (path.includes("projects") && method === "GET") {
    return "Read project runtime data for the authenticated user or workspace.";
  }

  if (path.includes("export")) {
    return "Create or retrieve exportable project handoff packages.";
  }

  if (path.includes("regenerate")) {
    return "Regenerate a specific project artifact while preserving Project Brain continuity.";
  }

  return `Handle ${method} request for ${path}.`;
}

function buildRequestModel(method: BackendApiEndpoint["method"], path: string): string {
  if (method === "GET") return "Path params and authenticated user context.";

  if (path.includes("generate")) {
    return "{ input: string }";
  }

  if (path.includes("regenerate")) {
    return "{ projectId: string, section: string, preserveDecisions: boolean }";
  }

  return "Typed JSON request body.";
}

function buildResponseModel(method: BackendApiEndpoint["method"], path: string): string {
  if (path.includes("generate")) {
    return "{ projectId, input, brain, prd, architecture, tasks, exportPack }";
  }

  if (path.includes("projects") && method === "GET") {
    return "{ projects: ProjectRuntimeArtifact[] } or { project: ProjectRuntimeArtifact }";
  }

  if (path.includes("export")) {
    return "{ exportPack, markdown, files }";
  }

  return "Typed JSON response with success or error payload.";
}

function buildFrontendModuleMap(prd: EnterprisePrd): FrontendModule[] {
  const baseModules: FrontendModule[] = [
    {
      id: "FE-001",
      name: "Landing Page",
      route: "/",
      componentScope: ["components/landing", "components/ui"],
      responsibility:
        "Present premium enterprise SaaS positioning, product promise, trust signals, and conversion actions.",
      sourceFeatureIds: [],
      stateModel: "Static marketing UI with future analytics events.",
      acceptanceCoverage: [
        "Loads fast on mobile and desktop.",
        "Clearly explains the product operating system value.",
        "Avoids cheap chatbot-wrapper positioning.",
      ],
    },
    {
      id: "FE-002",
      name: "Dashboard Runtime",
      route: "/dashboard",
      componentScope: ["components/dashboard", "app/dashboard/page.tsx"],
      responsibility:
        "Accept product ideas, trigger generation, persist local project artifacts, and list recent projects.",
      sourceFeatureIds: ["F-001"],
      stateModel: "Client state plus LocalStorage in runtime-alpha.",
      acceptanceCoverage: [
        "User can submit a product idea.",
        "Generation errors are visible.",
        "Recent projects remain accessible after refresh.",
      ],
    },
    {
      id: "FE-003",
      name: "Project Brain Console",
      route: "/project/[id]",
      componentScope: ["components/project", "components/brain", "components/ui"],
      responsibility:
        "Render Project Brain, PRD, Architecture, Tasks, and Export Pack from project runtime storage.",
      sourceFeatureIds: ["F-002", "F-003", "F-004", "F-005"],
      stateModel: "Client runtime loader with future Supabase adapter.",
      acceptanceCoverage: [
        "Each generated section is visible.",
        "Missing sections fail safely.",
        "Export Pack can be copied or downloaded.",
      ],
    },
  ];

  const featureModules = prd.coreFeatures.slice(0, 6).map((feature, index) => {
    const idNumber = index + 4;

    return {
      id: `FE-${String(idNumber).padStart(3, "0")}`,
      name: `${feature.name} UI`,
      route: `/project/[id]#${toKebabCase(feature.name)}`,
      componentScope: ["components/project", "components/ui"],
      responsibility: feature.description,
      sourceFeatureIds: [feature.id],
      stateModel:
        feature.priority === "P0"
          ? "Must support stable runtime-alpha rendering."
          : "Can be introduced progressively after P0 runtime is stable.",
      acceptanceCoverage: feature.acceptanceCriteria,
    };
  });

  return [...baseModules, ...featureModules];
}

function buildBackendApiMap(prd: EnterprisePrd): BackendApiEndpoint[] {
  const endpoints = prd.apiCandidates.map((candidate, index) =>
    parseApiCandidate(candidate, index),
  );

  const requiredGenerateEndpoint = endpoints.some(
    (endpoint) => endpoint.method === "POST" && endpoint.path === "/api/generate",
  );

  if (!requiredGenerateEndpoint) {
    endpoints.unshift(parseApiCandidate("POST /api/generate", 0));
  }

  return endpoints;
}

function mapEntityToTableName(entity: string): string {
  const normalized = entity.toLowerCase();

  const tableMap: Record<string, string> = {
    user: "profiles",
    project: "projects",
    projectbrain: "project_brains",
    prd: "project_prds",
    architecture: "project_architectures",
    task: "project_tasks",
    exportpack: "export_packs",
    generationrun: "generation_runs",
    aiprovider: "ai_providers",
    validationresult: "validation_results",
    course: "courses",
    lesson: "lessons",
    progress: "learning_progress",
    product: "commerce_products",
    order: "commerce_orders",
    payment: "commerce_payments",
    customer: "customers",
  };

  return tableMap[normalized] ?? `${toSnakeCase(entity)}s`;
}

function buildBaseColumns(tableName: string): SupabaseColumn[] {
  const columns: SupabaseColumn[] = [
    {
      name: "id",
      type: "uuid primary key default gen_random_uuid()",
      nullable: false,
      notes: "Stable row identifier.",
    },
    {
      name: "created_at",
      type: "timestamptz default now()",
      nullable: false,
      notes: "Creation timestamp.",
    },
    {
      name: "updated_at",
      type: "timestamptz default now()",
      nullable: false,
      notes: "Last update timestamp.",
    },
  ];

  if (tableName !== "profiles" && tableName !== "ai_providers") {
    columns.splice(1, 0, {
      name: "user_id",
      type: "uuid references auth.users(id) on delete cascade",
      nullable: false,
      notes: "Owner for RLS enforcement.",
    });
  }

  if (
    tableName.startsWith("project_") ||
    tableName === "export_packs" ||
    tableName === "generation_runs" ||
    tableName === "validation_results"
  ) {
    columns.splice(2, 0, {
      name: "project_id",
      type: "uuid references projects(id) on delete cascade",
      nullable: false,
      notes: "Links artifact to its parent project.",
    });
  }

  return columns;
}

function buildEntityColumns(entity: string, tableName: string): SupabaseColumn[] {
  if (tableName === "profiles") {
    return [
      {
        name: "id",
        type: "uuid primary key references auth.users(id) on delete cascade",
        nullable: false,
        notes: "Matches Supabase Auth user ID.",
      },
      {
        name: "display_name",
        type: "text",
        nullable: true,
        notes: "User-facing profile name.",
      },
      {
        name: "role",
        type: "text default 'user'",
        nullable: false,
        notes: "Basic role before workspace roles are introduced.",
      },
      {
        name: "created_at",
        type: "timestamptz default now()",
        nullable: false,
        notes: "Profile creation timestamp.",
      },
    ];
  }

  if (tableName === "projects") {
    return [
      ...buildBaseColumns(tableName),
      {
        name: "title",
        type: "text",
        nullable: false,
        notes: "Human-readable project name.",
      },
      {
        name: "input",
        type: "text",
        nullable: false,
        notes: "Original product idea submitted by the user.",
      },
      {
        name: "status",
        type: "text default 'generated'",
        nullable: false,
        notes: "Project lifecycle state.",
      },
      {
        name: "category",
        type: "text",
        nullable: true,
        notes: "Inferred product category.",
      },
      {
        name: "complexity",
        type: "text",
        nullable: true,
        notes: "Inferred product complexity.",
      },
    ];
  }

  if (tableName === "ai_providers") {
    return [
      ...buildBaseColumns(tableName),
      {
        name: "name",
        type: "text",
        nullable: false,
        notes: "Provider display name.",
      },
      {
        name: "provider_key",
        type: "text unique",
        nullable: false,
        notes: "Stable provider identifier.",
      },
      {
        name: "enabled",
        type: "boolean default false",
        nullable: false,
        notes: "Controls provider availability.",
      },
    ];
  }

  return [
    ...buildBaseColumns(tableName),
    {
      name: "content",
      type: "jsonb",
      nullable: false,
      notes: `Stores structured ${entity} artifact content.`,
    },
    {
      name: "version",
      type: "text default '2.0'",
      nullable: false,
      notes: "Artifact schema version.",
    },
    {
      name: "status",
      type: "text default 'active'",
      nullable: false,
      notes: "Artifact lifecycle state.",
    },
  ];
}

function buildSupabaseTablePlan(prd: EnterprisePrd): SupabaseTablePlan[] {
  const uniqueEntities = Array.from(new Set(prd.dataEntities));

  return uniqueEntities.map((entity, index) => {
    const tableName = mapEntityToTableName(entity);

    return {
      id: `DB-${String(index + 1).padStart(3, "0")}`,
      tableName,
      sourceEntity: entity,
      purpose: `Persist ${entity} data for ${prd.productName}.`,
      columns: buildEntityColumns(entity, tableName),
      indexes:
        tableName === "profiles"
          ? ["primary key on id"]
          : [
              "index on user_id",
              tableName !== "projects" && tableName !== "ai_providers"
                ? "index on project_id"
                : "index on created_at",
            ],
      rlsPolicies:
        tableName === "ai_providers"
          ? [
              "Public read only for enabled providers.",
              "Service role only for insert, update, and delete.",
            ]
          : tableName === "profiles"
            ? [
                "Users can read their own profile.",
                "Users can update their own profile.",
                "Service role can manage profiles for admin operations.",
              ]
            : [
                "Users can select rows where auth.uid() = user_id.",
                "Users can insert rows where auth.uid() = user_id.",
                "Users can update rows where auth.uid() = user_id.",
                "Users can delete rows where auth.uid() = user_id.",
              ],
    };
  });
}

function buildSecurityBoundaries(complexity: ProductComplexity): SecurityBoundary[] {
  const boundaries: SecurityBoundary[] = [
    {
      id: "SEC-001",
      boundary: "Client Runtime Boundary",
      risk: "Client-side LocalStorage is not secure for multi-user or sensitive project data.",
      controls: [
        "Use LocalStorage only during runtime-alpha.",
        "Do not store secrets in browser storage.",
        "Move persistent project artifacts to Supabase before team workspace release.",
      ],
      enforcementPhase: "runtime-alpha",
    },
    {
      id: "SEC-002",
      boundary: "Generate API Boundary",
      risk: "Malformed user input could create unstable output or future prompt-injection risk.",
      controls: [
        "Validate input type and length.",
        "Reject empty payloads.",
        "Never execute user-provided code.",
        "Add abuse and rate-limit protection before public launch.",
      ],
      enforcementPhase: "runtime-alpha",
    },
    {
      id: "SEC-003",
      boundary: "Supabase Data Boundary",
      risk: "Users may access projects that belong to another user or workspace if RLS is weak.",
      controls: [
        "Every private table must include user_id or workspace_id.",
        "Enable RLS on all private tables.",
        "Use server-side ownership checks for all mutation routes.",
      ],
      enforcementPhase: "runtime-beta",
    },
    {
      id: "SEC-004",
      boundary: "AI Provider Boundary",
      risk: "Future external AI provider calls may leak sensitive project context.",
      controls: [
        "Route provider calls through server only.",
        "Never expose provider API keys to client components.",
        "Add provider-level logging, redaction, and user consent controls.",
      ],
      enforcementPhase: "production",
    },
  ];

  if (complexity === "enterprise") {
    boundaries.push({
      id: "SEC-005",
      boundary: "Team Workspace Boundary",
      risk: "Team collaboration requires role separation, audit logs, and permission checks.",
      controls: [
        "Add workspace_members table.",
        "Support owner, admin, editor, viewer roles.",
        "Record audit events for project generation, export, delete, and invite actions.",
      ],
      enforcementPhase: "runtime-beta",
    });
  }

  return boundaries;
}

function buildDeploymentTopology(): DeploymentTopology {
  return {
    environments: [
      {
        name: "local",
        purpose: "Developer testing in Codespaces or local environment.",
        infrastructure: ["Next.js dev server", "LocalStorage runtime", "Mock or local env variables"],
        requiredSecrets: [],
      },
      {
        name: "preview",
        purpose: "Vercel preview deployment for feature validation.",
        infrastructure: ["Vercel Preview", "Branch-based deployments", "Future Supabase staging project"],
        requiredSecrets: ["NEXT_PUBLIC_SUPABASE_URL later", "NEXT_PUBLIC_SUPABASE_ANON_KEY later"],
      },
      {
        name: "production",
        purpose: "Customer-ready hosted SaaS runtime.",
        infrastructure: ["Vercel Production", "Supabase Production", "Cloudflare DNS"],
        requiredSecrets: [
          "NEXT_PUBLIC_SUPABASE_URL",
          "NEXT_PUBLIC_SUPABASE_ANON_KEY",
          "SUPABASE_SERVICE_ROLE_KEY server-only if needed",
          "AI_PROVIDER_API_KEYS server-only later",
        ],
      },
    ],
    buildChecks: [
      "npm run lint",
      "npm run build",
      "TypeScript strict validation",
      "Route handler response shape validation",
      "Manual runtime generation test",
    ],
    rollbackStrategy: [
      "Keep git tags for each runtime milestone.",
      "Rollback Vercel deployment to previous successful build if production fails.",
      "Do not run destructive database migrations without backup.",
      "Keep LocalStorage runtime compatible until Supabase migration is verified.",
    ],
    costModel:
      "Runtime-alpha remains free-first using deterministic local engines, Vercel, and browser storage. Supabase free tier is introduced later.",
  };
}

function buildMonitoringPlan(): MonitoringPlan {
  return {
    events: [
      "product_idea_submitted",
      "project_generated",
      "project_runtime_opened",
      "export_pack_copied",
      "export_pack_downloaded",
      "project_deleted",
    ],
    logs: [
      "Generate API validation errors",
      "Generation engine failures",
      "Project loading failures",
      "Future Supabase read/write failures",
    ],
    metrics: [
      "Idea-to-project success rate",
      "Average generation duration",
      "Runtime page open rate",
      "Export Pack usage rate",
      "Project deletion rate",
    ],
    alerts: [
      "Generate API error rate exceeds threshold",
      "Production build fails",
      "Supabase write failure spikes after migration",
      "AI provider failure spikes after Multi-AI Router release",
    ],
    auditTrail: [
      "Project created",
      "Project regenerated",
      "Project exported",
      "Project deleted",
      "Workspace member invited later",
      "Workspace role changed later",
    ],
  };
}

function buildModuleDependencyGraph(): ModuleDependency[] {
  return [
    {
      from: "Dashboard Runtime",
      to: "Generation API",
      reason: "Dashboard submits product idea and receives generated project artifact.",
    },
    {
      from: "Generation API",
      to: "PRD Engine",
      reason: "PRD Engine creates the product requirements source document.",
    },
    {
      from: "Generation API",
      to: "Architecture Engine",
      reason: "Architecture Engine requires PRD context to build the system blueprint.",
    },
    {
      from: "Generation API",
      to: "Task Engine",
      reason: "Task Engine requires PRD and architecture context for implementation tasks.",
    },
    {
      from: "Project Brain Console",
      to: "Storage Adapter",
      reason: "Project runtime page loads generated artifacts from LocalStorage now and Supabase later.",
    },
    {
      from: "Export Pack",
      to: "Project Brain Console",
      reason: "Export Pack is rendered from the same project runtime artifact.",
    },
  ];
}

export function generateArchitectureV2(
  input: string,
  prd: EnterprisePrd,
): ArchitectureBlueprint {
  return {
    documentType: "Architecture Blueprint",
    version: "2.0",
    generatedAt: new Date().toISOString(),
    systemName: prd.productName,
    category: prd.category,
    complexity: prd.complexity,
    architectureStyle: "Modular Product Operating System using Next.js App Router, typed engines, and future Supabase persistence.",
    stack: {
      frontend: ["Next.js 15 App Router", "React", "TypeScript", "TailwindCSS"],
      backend: ["Next.js Route Handlers", "Typed generation engines", "Future Supabase server adapter"],
      database: ["LocalStorage runtime-alpha", "Supabase Postgres runtime-beta", "JSONB artifact storage"],
      auth: ["Runtime-alpha: no auth", "Runtime-beta: Supabase Auth", "Production: workspace roles and RLS"],
      deployment: ["Vercel", "GitHub", "Cloudflare DNS optional"],
      monitoring: ["Vercel build logs", "Future product analytics", "Future Supabase audit logs"],
    },
    runtimeAssumptions: [
      "Current storage remains LocalStorage until Supabase integration phase.",
      "Generated artifacts should remain JSON-compatible.",
      "Project Runtime UI should not depend on a specific database provider.",
      "All future AI provider calls must happen server-side.",
      "Architecture must preserve PRD → Architecture → Tasks → Code → Test → Deploy → Monitor.",
    ],
    frontendModuleMap: buildFrontendModuleMap(prd),
    backendApiMap: buildBackendApiMap(prd),
    supabaseTablePlan: buildSupabaseTablePlan(prd),
    securityBoundaries: buildSecurityBoundaries(prd.complexity),
    deploymentTopology: buildDeploymentTopology(),
    monitoringPlan: buildMonitoringPlan(),
    moduleDependencyGraph: buildModuleDependencyGraph(),
    dataFlow: [
      `User submits product idea: "${input}"`,
      "Dashboard validates non-empty input.",
      "Dashboard sends POST /api/generate.",
      "Generate API creates projectId and timestamp.",
      "PRD Engine creates Project Brain and Enterprise PRD.",
      "Architecture Engine maps PRD into frontend modules, backend APIs, Supabase table plan, security, deployment, and monitoring.",
      "Task Engine converts architecture into execution tasks.",
      "Dashboard stores generated artifact in LocalStorage.",
      "Project Runtime Console reads artifact by projectId.",
      "Export Pack composes Markdown handoff package.",
    ],
    scalabilityModel: [
      "Keep engines stateless and isolated.",
      "Persist full generated artifacts as JSONB documents in Supabase later.",
      "Separate user-owned projects from workspace-owned projects.",
      "Introduce Multi-AI Router behind server route handlers only.",
      "Add background generation jobs only after synchronous MVP is stable.",
    ],
    reliabilityModel: [
      "Use deterministic local generation before external AI dependency.",
      "Keep stable response contract from /api/generate.",
      "Fail safely when a project section is missing.",
      "Preserve git milestone tags before major storage or auth changes.",
      "Add schema validation before production launch.",
    ],
    performanceModel: [
      "Runtime-alpha generation should remain synchronous and fast.",
      "Avoid unnecessary client bundles in landing page.",
      "Use Client Components only where browser APIs are required.",
      "Defer heavy AI calls and monitoring dashboards until backend persistence exists.",
      "Keep project runtime rendering JSON-compatible and lazy-friendly.",
    ],
    futureUpgradePath: [
      "Supabase schema migrations",
      "Supabase Auth",
      "Project ownership and RLS",
      "Team Workspace",
      "Architecture-aware Task Generator V2",
      "Multi-AI Router",
      "Memory Engine",
      "Deployment Engine",
      "Monitoring and audit trail",
    ],
    engineeringNotes: [
      "Do not remove LocalStorage compatibility until Supabase migration is tested.",
      "Do not expose service role keys in client code.",
      "Do not downgrade DevCommander OS into prompt templates.",
      "Every new engine should export typed results.",
      "Every generated artifact should be usable by later engines.",
    ],
  };
}

export function generateArchitecture(input: string): string {
  return JSON.stringify(
    {
      message: "Architecture generation requires PRD V2 context.",
      input,
    },
    null,
    2,
  );
}