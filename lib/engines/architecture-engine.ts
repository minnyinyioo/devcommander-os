import type { EnterprisePrd } from "./prd-engine";

export type ArchitectureBlueprint = {
  documentType: "Architecture Blueprint";
  version: "2.0";
  generatedAt: string;
  systemName: string;
  architectureStyle: string;
  stack: {
    frontend: string[];
    backend: string[];
    database: string[];
    deployment: string[];
  };
  modules: {
    id: string;
    name: string;
    responsibility: string;
    dependsOn: string[];
  }[];
  dataFlow: string[];
  securityModel: string[];
  scalabilityModel: string[];
  reliabilityModel: string[];
  performanceModel: string[];
  futureUpgradePath: string[];
};

export function generateArchitectureV2(input: string, prd: EnterprisePrd): ArchitectureBlueprint {
  return {
    documentType: "Architecture Blueprint",
    version: "2.0",
    generatedAt: new Date().toISOString(),
    systemName: prd.productName,
    architectureStyle: "Modular Next.js App Router SaaS Runtime",
    stack: {
      frontend: ["Next.js 15 App Router", "React", "TypeScript", "TailwindCSS"],
      backend: ["Next.js Route Handlers", "Typed engine modules", "Future Supabase server integration"],
      database: ["LocalStorage for runtime-alpha", "Supabase Postgres for beta persistence", "Supabase Auth for identity"],
      deployment: ["Vercel", "Future environment-based production configuration"],
    },
    modules: [
      {
        id: "M-001",
        name: "Landing Module",
        responsibility: "Convert visitors into users with enterprise SaaS positioning.",
        dependsOn: [],
      },
      {
        id: "M-002",
        name: "Dashboard Module",
        responsibility: "Accept product ideas, create project runtime records, and show recent projects.",
        dependsOn: ["M-004"],
      },
      {
        id: "M-003",
        name: "Project Runtime Module",
        responsibility: "Display Project Brain, PRD, Architecture, Tasks, and Export Pack.",
        dependsOn: ["M-004", "M-005", "M-006"],
      },
      {
        id: "M-004",
        name: "Generation API",
        responsibility: "Coordinate PRD, architecture, task, and export generation through typed engines.",
        dependsOn: ["M-005", "M-006", "M-007"],
      },
      {
        id: "M-005",
        name: "PRD Engine",
        responsibility: "Convert raw idea input into structured enterprise PRD output.",
        dependsOn: [],
      },
      {
        id: "M-006",
        name: "Architecture Engine",
        responsibility: "Convert PRD context into implementation-ready system architecture.",
        dependsOn: ["M-005"],
      },
      {
        id: "M-007",
        name: "Task Engine",
        responsibility: "Convert PRD and architecture into engineering execution tasks.",
        dependsOn: ["M-005", "M-006"],
      },
      {
        id: "M-008",
        name: "Storage Adapter",
        responsibility: "Use LocalStorage in alpha and Supabase in beta without changing runtime UI.",
        dependsOn: [],
      },
    ],
    dataFlow: [
      `User submits idea: "${input}"`,
      "Dashboard sends POST request to /api/generate.",
      "Generation API validates input.",
      "PRD Engine creates Project Brain and PRD V2.",
      "Architecture Engine receives PRD context and creates system blueprint.",
      "Task Engine receives PRD and architecture context and creates execution plan.",
      "Dashboard stores generated project in LocalStorage.",
      "Project Runtime page reads stored project and renders all sections.",
    ],
    securityModel: [
      "Validate all generation input before processing.",
      "Do not execute user-provided code.",
      "Do not expose secrets in client-side runtime.",
      "Future Supabase phase must enforce row-level security by user_id and workspace_id.",
      "Future team workspace must use explicit roles and audit logs.",
    ],
    scalabilityModel: [
      "Keep engines stateless and modular.",
      "Store generated artifacts as typed JSON documents.",
      "Introduce Supabase persistence without changing project runtime UI contract.",
      "Add provider routing through Multi-AI Router after local deterministic engines are stable.",
    ],
    reliabilityModel: [
      "Return stable JSON response shape from /api/generate.",
      "Keep fallback local generation available even before paid AI integration.",
      "Preserve generated project data under predictable LocalStorage keys.",
      "Add regeneration controls per section in later phases.",
    ],
    performanceModel: [
      "Avoid blocking external AI calls during runtime-alpha.",
      "Generate deterministic output synchronously for fast MVP feedback.",
      "Keep dashboard and project runtime as lightweight Client Components.",
      "Defer heavy AI routing and monitoring to later backend phases.",
    ],
    futureUpgradePath: [
      "Supabase project persistence",
      "Supabase Auth",
      "Workspace roles",
      "Multi-AI Router",
      "Memory Engine",
      "Deployment Engine",
      "Monitoring and audit trail",
    ],
  };
}

export function generateArchitecture(input: string): string {
  return `Architecture generation requires PRD V2 context. Input received: ${input}`;
}