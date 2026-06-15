import type { ArchitectureBlueprint } from "./architecture-engine";
import type { EnterprisePrd } from "./prd-engine";

export type EngineeringTask = {
  id: string;
  phase: string;
  title: string;
  priority: "P0" | "P1" | "P2";
  owner: "Frontend" | "Backend" | "Full-stack" | "Product" | "Security" | "DevOps";
  description: string;
  sourceArchitectureRefs: string[];
  acceptanceCriteria: string[];
};

export type TaskPlan = {
  documentType: "Engineering Task Plan";
  version: "2.0";
  generatedAt: string;
  projectName: string;
  executionPrinciple: string;
  tasks: EngineeringTask[];
  phaseOrder: string[];
  qualityGates: string[];
};

function buildFrontendTasks(architecture: ArchitectureBlueprint): EngineeringTask[] {
  return architecture.frontendModuleMap.slice(0, 6).map((module, index) => ({
    id: `FE-T-${String(index + 1).padStart(3, "0")}`,
    phase: "Frontend Runtime",
    title: `Build ${module.name}`,
    priority: index <= 2 ? "P0" : "P1",
    owner: "Frontend",
    description: module.responsibility,
    sourceArchitectureRefs: [module.id, module.route],
    acceptanceCriteria: [
      `Route or section ${module.route} is accessible.`,
      `Component scope is preserved: ${module.componentScope.join(", ")}.`,
      "UI handles empty, loading, and generated states safely.",
      ...module.acceptanceCoverage.slice(0, 3),
    ],
  }));
}

function buildBackendTasks(architecture: ArchitectureBlueprint): EngineeringTask[] {
  return architecture.backendApiMap.slice(0, 7).map((endpoint, index) => ({
    id: `BE-T-${String(index + 1).padStart(3, "0")}`,
    phase: "Backend Runtime",
    title: `Implement ${endpoint.method} ${endpoint.path}`,
    priority: endpoint.path === "/api/generate" ? "P0" : index <= 3 ? "P1" : "P2",
    owner: "Backend",
    description: endpoint.responsibility,
    sourceArchitectureRefs: [endpoint.id, endpoint.path],
    acceptanceCriteria: [
      `Request model is supported: ${endpoint.requestModel}.`,
      `Response model is stable: ${endpoint.responseModel}.`,
      endpoint.authRequired
        ? "Endpoint requires authenticated user context after Supabase Auth is introduced."
        : "Endpoint remains safe for runtime-alpha public access.",
      "Input validation returns explicit 400 errors for invalid requests.",
      "Unexpected errors return safe 500 responses without leaking secrets.",
    ],
  }));
}

function buildDatabaseTasks(architecture: ArchitectureBlueprint): EngineeringTask[] {
  return architecture.supabaseTablePlan.slice(0, 8).map((table, index) => ({
    id: `DB-T-${String(index + 1).padStart(3, "0")}`,
    phase: "Supabase Persistence",
    title: `Prepare ${table.tableName} table`,
    priority: table.tableName === "projects" || table.tableName === "profiles" ? "P0" : "P1",
    owner: "Backend",
    description: table.purpose,
    sourceArchitectureRefs: [table.id, table.tableName],
    acceptanceCriteria: [
      `Table includes required columns: ${table.columns
        .slice(0, 5)
        .map((column) => column.name)
        .join(", ")}.`,
      `Indexes are planned: ${table.indexes.join(", ")}.`,
      "RLS policies are defined before production use.",
      index === 0
        ? "Migration can be tested in Supabase SQL editor without breaking runtime-alpha."
        : "Table can be added after core project persistence is stable.",
    ],
  }));
}

function buildSecurityTasks(architecture: ArchitectureBlueprint): EngineeringTask[] {
  return architecture.securityBoundaries.map((boundary, index) => ({
    id: `SEC-T-${String(index + 1).padStart(3, "0")}`,
    phase: "Security Hardening",
    title: `Enforce ${boundary.boundary}`,
    priority: boundary.enforcementPhase === "runtime-alpha" ? "P0" : "P1",
    owner: "Security",
    description: `${boundary.risk} Controls must be implemented according to the ${boundary.enforcementPhase} phase.`,
    sourceArchitectureRefs: [boundary.id, boundary.boundary],
    acceptanceCriteria: [
      ...boundary.controls.slice(0, 4),
      "Security decision is recorded in Project Brain or decision log.",
    ],
  }));
}

function buildDevOpsTasks(architecture: ArchitectureBlueprint): EngineeringTask[] {
  return [
    {
      id: "OPS-T-001",
      phase: "Deployment",
      title: "Validate Vercel build pipeline",
      priority: "P0",
      owner: "DevOps",
      description:
        "Ensure the project builds successfully before introducing Supabase, Auth, or external AI providers.",
      sourceArchitectureRefs: ["deploymentTopology.buildChecks"],
      acceptanceCriteria: architecture.deploymentTopology.buildChecks,
    },
    {
      id: "OPS-T-002",
      phase: "Deployment",
      title: "Define rollback process for runtime milestones",
      priority: "P1",
      owner: "DevOps",
      description:
        "Use git tags and Vercel deployment history to safely rollback failed runtime releases.",
      sourceArchitectureRefs: ["deploymentTopology.rollbackStrategy"],
      acceptanceCriteria: architecture.deploymentTopology.rollbackStrategy,
    },
    {
      id: "OPS-T-003",
      phase: "Monitoring",
      title: "Prepare runtime monitoring event plan",
      priority: "P1",
      owner: "Product",
      description:
        "Define the first product events and metrics before adding analytics or audit logs.",
      sourceArchitectureRefs: ["monitoringPlan"],
      acceptanceCriteria: [
        `Events defined: ${architecture.monitoringPlan.events.join(", ")}.`,
        `Metrics defined: ${architecture.monitoringPlan.metrics.join(", ")}.`,
        "Monitoring plan avoids paid services during runtime-alpha.",
      ],
    },
  ];
}

function buildProductTasks(prd: EnterprisePrd): EngineeringTask[] {
  return [
    {
      id: "PM-T-001",
      phase: "Product Quality",
      title: "Validate PRD against enterprise checklist",
      priority: "P0",
      owner: "Product",
      description:
        "Confirm the generated PRD is not a prompt pack, course, or generic chatbot wrapper.",
      sourceArchitectureRefs: ["prd.enterpriseChecklist"],
      acceptanceCriteria: [
        ...prd.enterpriseChecklist.slice(0, 6),
        "PRD clearly supports commercial SaaS evolution.",
        "PRD includes measurable success metrics.",
      ],
    },
    {
      id: "PM-T-002",
      phase: "Product Quality",
      title: "Confirm non-goals are protected",
      priority: "P1",
      owner: "Product",
      description:
        "Prevent scope downgrade by keeping non-goals visible during architecture and task generation.",
      sourceArchitectureRefs: ["prd.nonGoals"],
      acceptanceCriteria: prd.nonGoals,
    },
  ];
}

export function generateTasksV2(
  input: string,
  prd: EnterprisePrd,
  architecture: ArchitectureBlueprint,
): TaskPlan {
  const frontendTasks = buildFrontendTasks(architecture);
  const backendTasks = buildBackendTasks(architecture);
  const databaseTasks = buildDatabaseTasks(architecture);
  const securityTasks = buildSecurityTasks(architecture);
  const devOpsTasks = buildDevOpsTasks(architecture);
  const productTasks = buildProductTasks(prd);

  return {
    documentType: "Engineering Task Plan",
    version: "2.0",
    generatedAt: new Date().toISOString(),
    projectName: prd.productName,
    executionPrinciple:
      "Every task must preserve PRD → Architecture → Code → Test → Deploy → Monitor continuity.",
    phaseOrder: [
      "Product Quality",
      "Frontend Runtime",
      "Backend Runtime",
      "Security Hardening",
      "Supabase Persistence",
      "Deployment",
      "Monitoring",
    ],
    qualityGates: [
      "No existing working feature may be removed.",
      "TypeScript must remain strict-compatible.",
      "Generated API response shape must remain stable.",
      "Client components may access browser APIs only after mount.",
      "Supabase tables must include RLS before production use.",
      "Vercel build must pass before milestone tagging.",
    ],
    tasks: [
      ...productTasks,
      ...frontendTasks,
      ...backendTasks,
      ...securityTasks,
      ...databaseTasks,
      ...devOpsTasks,
      {
        id: "NEXT-T-001",
        phase: "Next Runtime",
        title: "Start Supabase Integration",
        priority: "P1",
        owner: "Full-stack",
        description: `Move "${input}" project persistence from LocalStorage to Supabase without breaking the Project Runtime UI.`,
        sourceArchitectureRefs: ["futureUpgradePath", "supabaseTablePlan"],
        acceptanceCriteria: [
          "Create migrations for profiles, projects, project_brains, project_prds, project_architectures, project_tasks, and export_packs.",
          "Keep LocalStorage fallback during migration.",
          "Add typed storage adapter.",
          "Add RLS policies before production deployment.",
        ],
      },
    ],
  };
}

export function generateTasks(input: string): string {
  return JSON.stringify(
    {
      message: "Task generation requires PRD V2 and Architecture V2 context.",
      input,
    },
    null,
    2,
  );
}