import type {
  ReadinessCategory,
  ReadinessItem,
  ReadinessReport,
  ReadinessResult,
  ReadinessStatus,
} from "@/lib/readiness/readiness-types";
import type {
  ProjectRuntimeArtifact,
  RuntimeSection,
} from "@/lib/project/project-runtime";

type CheckInput = {
  id: string;
  category: ReadinessCategory;
  title: string;
  pass: boolean;
  warning?: boolean;
  passDetail: string;
  warningDetail?: string;
  failDetail: string;
  recommendation: string;
};

const READINESS_CATEGORIES: ReadinessCategory[] = [
  "product",
  "architecture",
  "security",
  "delivery",
  "operations",
];

function sectionToText(section: RuntimeSection): string {
  if (section === null || section === undefined) return "";

  if (typeof section === "string") return section;

  if (Array.isArray(section)) {
    return section
      .map((item) => {
        if (typeof item === "string") return item;

        try {
          return JSON.stringify(item, null, 2);
        } catch {
          return "";
        }
      })
      .join("\n");
  }

  try {
    return JSON.stringify(section, null, 2);
  } catch {
    return "";
  }
}

function normalizeText(value: string): string {
  return value.toLowerCase();
}

function hasAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

function hasSection(section: RuntimeSection): boolean {
  return sectionToText(section).trim().length > 20;
}

function resolveResult(input: CheckInput): ReadinessResult {
  if (input.pass) return "pass";
  if (input.warning) return "warning";
  return "fail";
}

function createReadinessItem(input: CheckInput): ReadinessItem {
  const result = resolveResult(input);

  return {
    id: input.id,
    category: input.category,
    title: input.title,
    result,
    detail:
      result === "pass"
        ? input.passDetail
        : result === "warning"
          ? input.warningDetail ?? input.failDetail
          : input.failDetail,
    recommendation: input.recommendation,
  };
}

function scoreItem(result: ReadinessResult): number {
  if (result === "pass") return 1;
  if (result === "warning") return 0.5;
  return 0;
}

function calculateCategoryScore(
  items: ReadinessItem[],
  category: ReadinessCategory,
): number {
  const categoryItems = items.filter((item) => item.category === category);

  if (categoryItems.length === 0) return 0;

  const rawScore =
    categoryItems.reduce((total, item) => total + scoreItem(item.result), 0) /
    categoryItems.length;

  return Math.round(rawScore * 100);
}

function calculateOverallScore(items: ReadinessItem[]): number {
  if (items.length === 0) return 0;

  const rawScore =
    items.reduce((total, item) => total + scoreItem(item.result), 0) /
    items.length;

  return Math.round(rawScore * 100);
}

function resolveStatus({
  project,
  overallScore,
  categoryScores,
}: {
  project: ProjectRuntimeArtifact;
  overallScore: number;
  categoryScores: Record<ReadinessCategory, number>;
}): ReadinessStatus {
  if (project.status === "missing") return "not_production_ready";

  if (categoryScores.security < 50) return "needs_security_review";

  if (categoryScores.architecture < 60) {
    return "needs_architecture_review";
  }

  if (
    overallScore >= 90 &&
    categoryScores.security >= 75 &&
    categoryScores.delivery >= 80 &&
    categoryScores.operations >= 70
  ) {
    return "ready_for_deployment";
  }

  if (
    overallScore >= 75 &&
    categoryScores.product >= 70 &&
    categoryScores.architecture >= 70
  ) {
    return "ready_for_development";
  }

  return "not_production_ready";
}

function getStatusLabel(status: ReadinessStatus): string {
  if (status === "ready_for_development") return "Ready for Development";
  if (status === "needs_architecture_review") return "Needs Architecture Review";
  if (status === "needs_security_review") return "Needs Security Review";
  if (status === "ready_for_deployment") return "Ready for Deployment";
  return "Not Production Ready";
}

function getStatusSummary(status: ReadinessStatus): string {
  if (status === "ready_for_development") {
    return "This project has enough product and architecture clarity to move into implementation planning.";
  }

  if (status === "needs_architecture_review") {
    return "The project idea is present, but the architecture needs more structure before reliable development.";
  }

  if (status === "needs_security_review") {
    return "The project needs stronger security, access control, secret handling, or validation planning.";
  }

  if (status === "ready_for_deployment") {
    return "The project has strong readiness signals across product, architecture, security, delivery, and operations.";
  }

  return "The project is not ready for production work yet. Complete the missing foundations first.";
}

function buildNextActions(items: ReadinessItem[]): string[] {
  const failedActions = items
    .filter((item) => item.result === "fail")
    .map((item) => item.recommendation);

  const warningActions = items
    .filter((item) => item.result === "warning")
    .map((item) => item.recommendation);

  return [...failedActions, ...warningActions].slice(0, 6);
}

export function generateReadinessReport(
  project: ProjectRuntimeArtifact,
): ReadinessReport {
  const prdText = normalizeText(sectionToText(project.prd));
  const architectureText = normalizeText(sectionToText(project.architecture));
  const tasksText = normalizeText(sectionToText(project.tasks));
  const exportText = normalizeText(sectionToText(project.exportPack));
  const brainText = normalizeText(sectionToText(project.brain));

  const allText = [
    project.input,
    brainText,
    prdText,
    architectureText,
    tasksText,
    exportText,
  ]
    .join("\n")
    .toLowerCase();

  const items: ReadinessItem[] = [
    createReadinessItem({
      id: "product-input",
      category: "product",
      title: "Product idea is clear",
      pass: project.input.trim().length >= 20,
      warning: project.input.trim().length >= 8,
      passDetail: "The project input is descriptive enough to generate a runtime package.",
      warningDetail:
        "The project input exists, but it should be more specific for better generation quality.",
      failDetail: "The project input is missing or too short.",
      recommendation:
        "Rewrite the product idea with target users, problem, core workflow, and expected outcome.",
    }),

    createReadinessItem({
      id: "product-prd",
      category: "product",
      title: "PRD exists",
      pass: hasSection(project.prd),
      passDetail: "The project has a generated PRD section.",
      failDetail: "The project does not have a usable PRD section.",
      recommendation:
        "Regenerate or improve the PRD with product goal, users, core features, success metrics, and constraints.",
    }),

    createReadinessItem({
      id: "product-market",
      category: "product",
      title: "User, problem, and MVP signals exist",
      pass: hasAny(prdText + brainText, [
        "user",
        "users",
        "customer",
        "persona",
        "problem",
        "pain",
        "mvp",
        "success",
        "metric",
        "goal",
      ]),
      warning: hasSection(project.prd),
      passDetail:
        "The PRD includes user, problem, MVP, or success metric signals.",
      warningDetail:
        "The PRD exists, but user/problem/MVP signals are not strong enough.",
      failDetail: "The PRD lacks user, problem, MVP, or success metric signals.",
      recommendation:
        "Add target users, main pain points, MVP scope, and measurable success criteria.",
    }),

    createReadinessItem({
      id: "architecture-exists",
      category: "architecture",
      title: "Architecture exists",
      pass: hasSection(project.architecture),
      passDetail: "The project has a generated architecture section.",
      failDetail: "The project does not have a usable architecture section.",
      recommendation:
        "Generate architecture with frontend, backend, database, auth, deployment, and monitoring sections.",
    }),

    createReadinessItem({
      id: "architecture-stack",
      category: "architecture",
      title: "Technical stack is identified",
      pass: hasAny(architectureText + allText, [
        "next.js",
        "nextjs",
        "typescript",
        "tailwind",
        "supabase",
        "api",
        "database",
        "frontend",
        "backend",
      ]),
      warning: hasSection(project.architecture),
      passDetail:
        "The architecture includes concrete frontend, backend, API, or database stack signals.",
      warningDetail:
        "Architecture exists, but the technical stack is not explicit enough.",
      failDetail: "No clear technical stack was found.",
      recommendation:
        "Specify the frontend framework, backend API layer, database, auth, storage, and hosting target.",
    }),

    createReadinessItem({
      id: "architecture-data",
      category: "architecture",
      title: "Database and data model are planned",
      pass: hasAny(architectureText + allText, [
        "table",
        "schema",
        "database",
        "postgres",
        "supabase",
        "rls",
        "migration",
        "entity",
      ]),
      warning: hasSection(project.architecture),
      passDetail:
        "The architecture includes database, schema, table, or migration planning signals.",
      warningDetail:
        "Architecture exists, but database planning is still weak.",
      failDetail: "No database or data model planning was detected.",
      recommendation:
        "Add database tables, relationships, RLS policies, indexes, and migration plan.",
    }),

    createReadinessItem({
      id: "security-auth",
      category: "security",
      title: "Authentication and access control are considered",
      pass: hasAny(architectureText + allText, [
        "auth",
        "authentication",
        "authorization",
        "permission",
        "role",
        "rls",
        "workspace member",
        "access control",
      ]),
      warning: hasAny(allText, ["login", "user", "account"]),
      passDetail:
        "The project includes authentication or access control planning.",
      warningDetail:
        "User/account signals exist, but access control planning is not strong enough.",
      failDetail: "No authentication or access control planning was detected.",
      recommendation:
        "Add authentication model, roles, permissions, RLS rules, and ownership boundaries.",
    }),

    createReadinessItem({
      id: "security-secrets",
      category: "security",
      title: "Secret and environment handling are considered",
      pass: hasAny(architectureText + allText, [
        "env",
        "environment",
        "secret",
        "api key",
        "service role",
        "token",
        "rate limit",
      ]),
      warning: hasAny(allText, ["api", "integration"]),
      passDetail:
        "The project includes environment, secret, API key, or token handling signals.",
      warningDetail:
        "The project has API/integration signals, but secret handling is not explicit.",
      failDetail: "No secret or environment handling plan was found.",
      recommendation:
        "Define .env usage, public/private keys, server-only secrets, rate limits, and key rotation rules.",
    }),

    createReadinessItem({
      id: "security-validation",
      category: "security",
      title: "Validation and failure handling are considered",
      pass: hasAny(architectureText + tasksText + allText, [
        "validation",
        "error",
        "fallback",
        "guard",
        "safe",
        "sanitize",
        "logging",
      ]),
      warning: hasSection(project.tasks),
      passDetail:
        "The project includes validation, fallback, logging, or error handling signals.",
      warningDetail:
        "Tasks exist, but validation and failure handling need clearer coverage.",
      failDetail: "No validation or failure handling plan was detected.",
      recommendation:
        "Add input validation, safe errors, fallback paths, retry behavior, and logging.",
    }),

    createReadinessItem({
      id: "delivery-tasks",
      category: "delivery",
      title: "Implementation tasks exist",
      pass: hasSection(project.tasks),
      passDetail: "The project has generated implementation tasks.",
      failDetail: "No usable implementation task section was found.",
      recommendation:
        "Generate task breakdown by frontend, backend, database, tests, deployment, and QA.",
    }),

    createReadinessItem({
      id: "delivery-export",
      category: "delivery",
      title: "Export pack exists",
      pass: hasSection(project.exportPack),
      passDetail: "The project has an export pack for handoff.",
      failDetail: "No usable export pack was found.",
      recommendation:
        "Generate an export pack containing PRD, architecture, tasks, deployment notes, and handoff summary.",
    }),

    createReadinessItem({
      id: "delivery-deployment",
      category: "delivery",
      title: "Deployment path is considered",
      pass: hasAny(architectureText + tasksText + exportText + allText, [
        "deploy",
        "deployment",
        "vercel",
        "production",
        "rollback",
        "environment",
        "build",
      ]),
      warning: hasSection(project.tasks),
      passDetail:
        "The project includes deployment, build, production, or rollback signals.",
      warningDetail:
        "Implementation tasks exist, but deployment planning is not explicit.",
      failDetail: "No deployment path was detected.",
      recommendation:
        "Add deployment target, environment variables, build command, rollback plan, and production checklist.",
    }),

    createReadinessItem({
      id: "operations-monitoring",
      category: "operations",
      title: "Monitoring and audit signals exist",
      pass: hasAny(architectureText + tasksText + exportText + allText, [
        "monitor",
        "monitoring",
        "audit",
        "activity",
        "log",
        "logging",
        "alert",
        "health",
      ]),
      warning: hasAny(allText, ["error", "status"]),
      passDetail:
        "The project includes monitoring, audit, logging, alert, or health signals.",
      warningDetail:
        "Runtime status signals exist, but monitoring needs stronger definition.",
      failDetail: "No monitoring or audit plan was detected.",
      recommendation:
        "Add audit events, logs, health checks, error tracking, and runtime monitoring plan.",
    }),

    createReadinessItem({
      id: "operations-maintenance",
      category: "operations",
      title: "Maintenance and recovery are considered",
      pass: hasAny(architectureText + tasksText + exportText + allText, [
        "rollback",
        "backup",
        "restore",
        "recovery",
        "migration",
        "version",
        "maintenance",
      ]),
      warning: hasAny(allText, ["deploy", "production"]),
      passDetail:
        "The project includes rollback, backup, migration, or recovery signals.",
      warningDetail:
        "Production/deployment signals exist, but recovery planning is not strong enough.",
      failDetail: "No maintenance or recovery plan was detected.",
      recommendation:
        "Add rollback, backup, migration, versioning, and recovery procedures.",
    }),
  ];

  const categoryScores = READINESS_CATEGORIES.reduce(
    (scores, category) => ({
      ...scores,
      [category]: calculateCategoryScore(items, category),
    }),
    {
      product: 0,
      architecture: 0,
      security: 0,
      delivery: 0,
      operations: 0,
    } satisfies Record<ReadinessCategory, number>,
  );

  const overallScore = calculateOverallScore(items);
  const status = resolveStatus({
    project,
    overallScore,
    categoryScores,
  });

  const nextActions = buildNextActions(items);

  return {
    projectId: project.projectId,
    status,
    statusLabel: getStatusLabel(status),
    summary: getStatusSummary(status),
    overallScore,
    categoryScores,
    items,
    nextActions,
    generatedAt: new Date().toISOString(),
  };
}