export type RuntimeSection = string | string[] | Record<string, unknown> | Array<Record<string, unknown>> | null | undefined;

export type ProjectRuntimeArtifact = {
  projectId: string;
  input: string;
  createdAt?: string;
  updatedAt?: string;
  brain?: RuntimeSection;
  prd?: RuntimeSection;
  architecture?: RuntimeSection;
  tasks?: RuntimeSection;
  exportPack?: RuntimeSection;
  status?: "generated" | "partial" | "missing";
};

type UnknownRecord = Record<string, unknown>;

const PROJECT_KEYS = [
  "devcommander-projects",
  "devcommander-os-projects",
  "devcommander-generated-projects",
];

export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeJsonParse(value: string | null): unknown {
  if (!value) return null;

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function readString(record: UnknownRecord, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }

  return undefined;
}

function readSection(record: UnknownRecord, keys: string[]): RuntimeSection {
  for (const key of keys) {
    const value = record[key];

    if (
      typeof value === "string" ||
      Array.isArray(value) ||
      isRecord(value) ||
      value === null ||
      value === undefined
    ) {
      if (value !== undefined) return value as RuntimeSection;
    }
  }

  return undefined;
}

function normalizeProject(raw: unknown, fallbackProjectId: string): ProjectRuntimeArtifact | null {
  if (!isRecord(raw)) return null;

  const nestedArtifacts = isRecord(raw.artifacts) ? raw.artifacts : {};
  const nestedBrain = isRecord(raw.projectBrain) ? raw.projectBrain : {};
  const merged: UnknownRecord = {
    ...raw,
    ...nestedArtifacts,
  };

  const projectId =
    readString(merged, ["projectId", "id", "slug"]) ??
    readString(raw, ["projectId", "id", "slug"]) ??
    fallbackProjectId;

  if (projectId !== fallbackProjectId) return null;

  const input =
    readString(merged, ["input", "idea", "prompt", "userInput", "productIdea", "requirement"]) ??
    readString(nestedBrain, ["input", "idea", "prompt", "productIdea"]) ??
    "Untitled product idea";

  return {
    projectId,
    input,
    createdAt: readString(merged, ["createdAt", "created_at"]),
    updatedAt: readString(merged, ["updatedAt", "updated_at"]),
    brain:
      readSection(merged, ["brain", "projectBrain", "memory", "context"]) ??
      readSection(nestedBrain, ["brain", "vision", "context"]),
    prd: readSection(merged, ["prd", "productRequirements", "prdDocument"]),
    architecture: readSection(merged, ["architecture", "systemArchitecture", "architectureDocument"]),
    tasks: readSection(merged, ["tasks", "taskList", "implementationTasks"]),
    exportPack: readSection(merged, ["exportPack", "export", "handoverPack"]),
    status: "generated",
  };
}

function loadFromKnownSingleKeys(projectId: string): ProjectRuntimeArtifact | null {
  const possibleKeys = [
    `devcommander-project-${projectId}`,
    `devcommander-os-project-${projectId}`,
    `devcommander-runtime-project-${projectId}`,
    projectId,
  ];

  for (const key of possibleKeys) {
    const parsed = safeJsonParse(window.localStorage.getItem(key));
    const normalized = normalizeProject(parsed, projectId);

    if (normalized) return normalized;
  }

  return null;
}

function loadFromProjectCollections(projectId: string): ProjectRuntimeArtifact | null {
  for (const key of PROJECT_KEYS) {
    const parsed = safeJsonParse(window.localStorage.getItem(key));

    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        const normalized = normalizeProject(item, projectId);
        if (normalized) return normalized;
      }
    }

    if (isRecord(parsed)) {
      const direct = parsed[projectId];
      const directNormalized = normalizeProject(direct, projectId);

      if (directNormalized) return directNormalized;

      for (const value of Object.values(parsed)) {
        const normalized = normalizeProject(value, projectId);
        if (normalized) return normalized;
      }
    }
  }

  return null;
}

function loadFromRecentProjects(projectId: string): ProjectRuntimeArtifact | null {
  const parsed = safeJsonParse(window.localStorage.getItem("devcommander-recent-projects"));

  if (!Array.isArray(parsed)) return null;

  for (const item of parsed) {
    if (!isRecord(item)) continue;

    const currentProjectId = readString(item, ["projectId", "id"]);
    if (currentProjectId !== projectId) continue;

    return {
      projectId,
      input: readString(item, ["input", "idea", "prompt"]) ?? "Untitled product idea",
      createdAt: readString(item, ["createdAt", "created_at"]),
      status: "partial",
    };
  }

  return null;
}

function scanLocalStorage(projectId: string): ProjectRuntimeArtifact | null {
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key) continue;

    const parsed = safeJsonParse(window.localStorage.getItem(key));
    const normalized = normalizeProject(parsed, projectId);

    if (normalized) return normalized;
  }

  return null;
}

export function loadProjectRuntime(projectId: string): ProjectRuntimeArtifact {
  if (!isBrowser()) {
    return {
      projectId,
      input: "Loading project runtime...",
      status: "missing",
    };
  }

  return (
    loadFromKnownSingleKeys(projectId) ??
    loadFromProjectCollections(projectId) ??
    loadFromRecentProjects(projectId) ??
    scanLocalStorage(projectId) ?? {
      projectId,
      input: "Project not found in local runtime storage.",
      status: "missing",
    }
  );
}

export function sectionToText(section: RuntimeSection): string {
  if (!section) return "";

  if (typeof section === "string") return section;

  if (Array.isArray(section)) {
    return section
      .map((item, index) => {
        if (typeof item === "string") return `- ${item}`;

        return `### Item ${index + 1}\n${JSON.stringify(item, null, 2)}`;
      })
      .join("\n\n");
  }

  return JSON.stringify(section, null, 2);
}

export function buildProjectMarkdown(project: ProjectRuntimeArtifact): string {
  const createdAt = project.createdAt ? `\nCreated: ${project.createdAt}` : "";

  return `# DevCommander OS Project Runtime

Project ID: ${project.projectId}${createdAt}

## Product Input

${project.input}

## Project Brain

${sectionToText(project.brain) || "Not generated yet."}

## PRD

${sectionToText(project.prd) || "Not generated yet."}

## Architecture

${sectionToText(project.architecture) || "Not generated yet."}

## Tasks

${sectionToText(project.tasks) || "Not generated yet."}

## Export Pack

${sectionToText(project.exportPack) || "Not generated yet."}
`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!isBrowser() || !navigator.clipboard) return false;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function downloadTextFile(filename: string, content: string): void {
  if (!isBrowser()) return;

  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}