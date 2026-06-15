import type { ArchitectureBlueprint } from "./architecture-engine";
import type { EnterprisePrd } from "./prd-engine";

export type EngineeringTask = {
  id: string;
  phase: string;
  title: string;
  priority: "P0" | "P1" | "P2";
  owner: "Frontend" | "Backend" | "Full-stack" | "Product" | "Security";
  description: string;
  acceptanceCriteria: string[];
};

export type TaskPlan = {
  documentType: "Engineering Task Plan";
  version: "2.0";
  generatedAt: string;
  projectName: string;
  executionPrinciple: string;
  tasks: EngineeringTask[];
};

export function generateTasksV2(
  input: string,
  prd: EnterprisePrd,
  architecture: ArchitectureBlueprint,
): TaskPlan {
  return {
    documentType: "Engineering Task Plan",
    version: "2.0",
    generatedAt: new Date().toISOString(),
    projectName: prd.productName,
    executionPrinciple: "Every task must preserve PRD → Architecture → Code → Test → Deploy → Monitor continuity.",
    tasks: [
      {
        id: "T-001",
        phase: "Runtime",
        title: "Wire PRD V2 into Generate API",
        priority: "P0",
        owner: "Backend",
        description: "Connect the structured PRD engine to /api/generate and return a stable project artifact.",
        acceptanceCriteria: [
          "POST /api/generate accepts valid input.",
          "API returns projectId, input, brain, prd, architecture, tasks, and exportPack.",
          "Invalid input returns a 400 response.",
        ],
      },
      {
        id: "T-002",
        phase: "Runtime",
        title: "Persist Full Generated Project Locally",
        priority: "P0",
        owner: "Frontend",
        description: "Store the complete generated project in LocalStorage under a predictable project key.",
        acceptanceCriteria: [
          "Project is saved under devcommander-project-{projectId}.",
          "Recent projects list is updated.",
          "Project runtime page can read the full generated artifact.",
        ],
      },
      {
        id: "T-003",
        phase: "Runtime",
        title: "Render Project Brain UI",
        priority: "P0",
        owner: "Frontend",
        description: "Display generated Project Brain, PRD, Architecture, Tasks, and Export Pack in project runtime page.",
        acceptanceCriteria: [
          "Each runtime section has its own tab.",
          "Pending sections are handled safely.",
          "Export Markdown can be copied or downloaded.",
        ],
      },
      {
        id: "T-004",
        phase: "Quality",
        title: "Add Runtime Type Contracts",
        priority: "P1",
        owner: "Full-stack",
        description: "Keep generated artifacts typed so future Supabase persistence and AI Router integration are safe.",
        acceptanceCriteria: [
          "PRD, architecture, and tasks have exported TypeScript types.",
          "API response shape remains stable.",
          "No untyped external dependency is required for runtime-alpha.",
        ],
      },
      {
        id: "T-005",
        phase: "Security",
        title: "Prepare Supabase Security Model",
        priority: "P1",
        owner: "Security",
        description: "Design future database ownership and workspace permissions before adding persistent storage.",
        acceptanceCriteria: [
          "Project ownership model is defined.",
          "Workspace role model is defined.",
          "RLS requirement is documented before Supabase integration.",
        ],
      },
      {
        id: "T-006",
        phase: "Next Runtime",
        title: "Upgrade Architecture Generator V2",
        priority: "P1",
        owner: "Backend",
        description: `Use PRD context and module list to improve architecture specificity for "${input}".`,
        acceptanceCriteria: [
          "Architecture maps directly to PRD features.",
          "Architecture identifies database tables.",
          "Architecture identifies API boundaries.",
        ],
      },
      {
        id: "T-007",
        phase: "Next Runtime",
        title: "Upgrade Task Generator V2",
        priority: "P1",
        owner: "Backend",
        description: `Use architecture modules from ${architecture.systemName} to generate more granular development tasks.`,
        acceptanceCriteria: [
          "Tasks map to modules.",
          "Tasks include test requirements.",
          "Tasks include deployment and monitoring requirements.",
        ],
      },
    ],
  };
}

export function generateTasks(input: string): string {
  return `Task generation requires PRD V2 and Architecture V2 context. Input received: ${input}`;
}