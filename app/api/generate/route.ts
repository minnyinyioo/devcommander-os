import { NextResponse } from "next/server";
import { generateArchitectureV2 } from "@/lib/engines/architecture-engine";
import { generatePrdV2 } from "@/lib/engines/prd-engine";
import { generateTasksV2 } from "@/lib/engines/task-engine";

type GenerateRequestBody = {
  input?: unknown;
  prompt?: unknown;
  idea?: unknown;
};

function createProjectId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `project-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readInput(body: GenerateRequestBody): string {
  const value = body.input ?? body.prompt ?? body.idea;

  if (typeof value !== "string") return "";

  return value.trim();
}

function buildExportPack({
  projectId,
  input,
  brain,
  prd,
  architecture,
  tasks,
}: {
  projectId: string;
  input: string;
  brain: unknown;
  prd: unknown;
  architecture: unknown;
  tasks: unknown;
}) {
  return {
    documentType: "DevCommander Export Pack",
    version: "2.0",
    projectId,
    generatedAt: new Date().toISOString(),
    files: [
      {
        path: "PROJECT_BRAIN.md",
        content: JSON.stringify(brain, null, 2),
      },
      {
        path: "PRD.md",
        content: JSON.stringify(prd, null, 2),
      },
      {
        path: "ARCHITECTURE.md",
        content: JSON.stringify(architecture, null, 2),
      },
      {
        path: "TASKS.md",
        content: JSON.stringify(tasks, null, 2),
      },
    ],
    markdown: `# DevCommander OS Export Pack

Project ID: ${projectId}

## Original Input

${input}

## Project Brain

\`\`\`json
${JSON.stringify(brain, null, 2)}
\`\`\`

## PRD V2

\`\`\`json
${JSON.stringify(prd, null, 2)}
\`\`\`

## Architecture

\`\`\`json
${JSON.stringify(architecture, null, 2)}
\`\`\`

## Tasks

\`\`\`json
${JSON.stringify(tasks, null, 2)}
\`\`\`
`,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequestBody;
    const input = readInput(body);

    if (!input) {
      return NextResponse.json(
        {
          error: "Product idea is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (input.length > 5000) {
      return NextResponse.json(
        {
          error: "Product idea is too long. Please keep it under 5000 characters.",
        },
        {
          status: 400,
        },
      );
    }

    const projectId = createProjectId();
    const createdAt = new Date().toISOString();

    const prdResult = generatePrdV2(input);
    const architecture = generateArchitectureV2(input, prdResult.prd);
    const tasks = generateTasksV2(input, prdResult.prd, architecture);

    const exportPack = buildExportPack({
      projectId,
      input,
      brain: prdResult.brain,
      prd: prdResult.prd,
      architecture,
      tasks,
    });

    return NextResponse.json({
      projectId,
      input,
      createdAt,
      updatedAt: createdAt,
      status: "generated",
      brain: prdResult.brain,
      prd: prdResult.prd,
      architecture,
      tasks,
      exportPack,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Failed to generate project runtime.",
      },
      {
        status: 500,
      },
    );
  }
}