import type {
  AiProviderId,
  AiRouteRunResult,
  AiRouterPlan,
  AiRoutingRule,
  AiTaskType,
} from "@/lib/ai-router/router-types";
import type {
  ProjectRuntimeArtifact,
  RuntimeSection,
} from "@/lib/project/project-runtime";

function createRunId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `run-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

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

function getRule(plan: AiRouterPlan, taskType: AiTaskType): AiRoutingRule {
  const matchedRule = plan.rules.find((rule) => rule.taskType === taskType);

  if (matchedRule) return matchedRule;

  return {
    taskType,
    label: taskType,
    primaryProvider: "local",
    fallbackProviders: ["local"],
    reason: "No explicit routing rule was found. Local fallback was selected.",
  };
}

function selectProvider(rule: AiRoutingRule): AiProviderId {
  if (rule.primaryProvider === "local") return "local";

  if (rule.fallbackProviders.includes("local")) return "local";

  return rule.primaryProvider;
}

function getTaskLabel(taskType: AiTaskType): string {
  if (taskType === "product") return "Product / PRD Review";
  if (taskType === "architecture") return "Architecture Review";
  if (taskType === "code") return "Code Pack Review";
  if (taskType === "deployment") return "Deployment Review";
  return "Monitoring Review";
}

function buildProductOutput(project: ProjectRuntimeArtifact): string {
  const prdText = sectionToText(project.prd);

  return [
    "# Product / PRD Route Result",
    "",
    "## Product Input",
    "",
    project.input,
    "",
    "## Local Runtime Assessment",
    "",
    prdText.trim()
      ? "The project already has a PRD section. The next improvement should focus on user clarity, MVP boundaries, success metrics, and release scope."
      : "The project needs a stronger PRD before implementation. Add target users, core pain points, MVP scope, feature priority, and measurable success criteria.",
    "",
    "## Recommended Product Actions",
    "",
    "- Clarify the exact target user.",
    "- Define the first core workflow.",
    "- Separate MVP features from future roadmap.",
    "- Add measurable success metrics.",
    "- Add launch constraints and assumptions.",
    "",
  ].join("\n");
}

function buildArchitectureOutput(project: ProjectRuntimeArtifact): string {
  const architectureText = sectionToText(project.architecture);

  return [
    "# Architecture Route Result",
    "",
    "## Local Runtime Assessment",
    "",
    architectureText.trim()
      ? "The project already has an architecture section. The next improvement should focus on API boundaries, database ownership, security rules, and deployment topology."
      : "The project needs architecture before reliable development. Add frontend modules, backend routes, database tables, authentication, RLS policies, deployment, and monitoring.",
    "",
    "## Required Architecture Checks",
    "",
    "- Frontend modules are clearly separated.",
    "- API routes have input validation.",
    "- Database tables have ownership rules.",
    "- Supabase RLS is enabled.",
    "- Secrets stay server-side only.",
    "- Deployment and rollback plan exists.",
    "",
  ].join("\n");
}

function buildCodeOutput(project: ProjectRuntimeArtifact): string {
  const tasksText = sectionToText(project.tasks);

  return [
    "# Code Pack Route Result",
    "",
    "## Local Runtime Assessment",
    "",
    tasksText.trim()
      ? "The project has implementation tasks. Code Pack generation can proceed using the deterministic local code generator."
      : "The project needs a stronger task breakdown before generating a full code pack.",
    "",
    "## Code Generation Policy",
    "",
    "- Generate secret-safe starter files only.",
    "- Never include real `.env` values.",
    "- Keep `.env.example` as placeholder-only.",
    "- Prefer Next.js + TypeScript + Tailwind + Supabase.",
    "- Add smoke tests and deployment notes.",
    "",
    "## Next Code Actions",
    "",
    "- Review `/project/[id]/code`.",
    "- Export ZIP.",
    "- Build the generated project separately.",
    "- Add real API routes and database migrations.",
    "",
  ].join("\n");
}

function buildDeploymentOutput(project: ProjectRuntimeArtifact): string {
  const exportText = sectionToText(project.exportPack);

  return [
    "# Deployment Route Result",
    "",
    "## Local Runtime Assessment",
    "",
    exportText.trim()
      ? "The project has an export pack. Deployment review can continue through the Deployment Pack."
      : "The project needs stronger export and deployment notes before production deployment.",
    "",
    "## Deployment Gate",
    "",
    "- Node 20 is pinned.",
    "- `npm run build` passes.",
    "- Vercel environment variables are configured.",
    "- Supabase RLS is active.",
    "- Rollback tag exists.",
    "- No `.env`, `.env.local`, API keys, or private keys are committed.",
    "",
    "## Next Deployment Actions",
    "",
    "- Open `/project/[id]/deploy`.",
    "- Review environment variable list.",
    "- Review rollback plan.",
    "- Deploy only after build and smoke tests pass.",
    "",
  ].join("\n");
}

function buildMonitoringOutput(): string {
  return [
    "# Monitoring Route Result",
    "",
    "## Local Runtime Assessment",
    "",
    "The project already has Activity / Audit foundations. Monitoring should now focus on event coverage, runtime failures, export actions, workspace activity, and production deployment events.",
    "",
    "## Monitoring Events To Track",
    "",
    "- `project.created`",
    "- `project.opened`",
    "- `project.exported`",
    "- `project.deleted`",
    "- `workspace.created`",
    "- `ai.route.executed`",
    "- `runtime.error`",
    "- `deployment.started`",
    "- `deployment.failed`",
    "- `deployment.completed`",
    "",
    "## Next Monitoring Actions",
    "",
    "- Open `/activity`.",
    "- Confirm AI route execution appears in audit logs.",
    "- Add deployment events in the next milestone.",
    "",
  ].join("\n");
}

function buildOutputMarkdown({
  project,
  taskType,
}: {
  project: ProjectRuntimeArtifact;
  taskType: AiTaskType;
}): string {
  if (taskType === "product") return buildProductOutput(project);
  if (taskType === "architecture") return buildArchitectureOutput(project);
  if (taskType === "code") return buildCodeOutput(project);
  if (taskType === "deployment") return buildDeploymentOutput(project);

  return buildMonitoringOutput();
}

function getOutputSummary(taskType: AiTaskType): string {
  if (taskType === "product") {
    return "Local AI Router reviewed product readiness and PRD direction.";
  }

  if (taskType === "architecture") {
    return "Local AI Router reviewed system architecture readiness.";
  }

  if (taskType === "code") {
    return "Local AI Router reviewed deterministic code generation readiness.";
  }

  if (taskType === "deployment") {
    return "Local AI Router reviewed deployment readiness and rollback requirements.";
  }

  return "Local AI Router reviewed monitoring and audit coverage.";
}

export function runAiRouterTask({
  project,
  plan,
  taskType,
}: {
  project: ProjectRuntimeArtifact;
  plan: AiRouterPlan;
  taskType: AiTaskType;
}): AiRouteRunResult {
  const startedAt = new Date().toISOString();
  const rule = getRule(plan, taskType);
  const selectedProvider = selectProvider(rule);
  const outputMarkdown = buildOutputMarkdown({
    project,
    taskType,
  });

  return {
    id: createRunId(),
    projectId: project.projectId,
    taskType,
    taskLabel: getTaskLabel(taskType),
    selectedProvider,
    fallbackChain: [rule.primaryProvider, ...rule.fallbackProviders],
    status: "completed",
    outputTitle: `${getTaskLabel(taskType)} Result`,
    outputSummary: getOutputSummary(taskType),
    outputMarkdown,
    safetyNotes: [
      "This run used the Local Runtime Engine.",
      "No external AI provider was called.",
      "No API key was required.",
      "Provider keys must remain server-side in future cloud execution.",
    ],
    startedAt,
    completedAt: new Date().toISOString(),
  };
}