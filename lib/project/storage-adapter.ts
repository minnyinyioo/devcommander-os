import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { isBrowser, loadProjectRuntime } from "@/lib/project/project-runtime";
import type {
  ProjectRuntimeArtifact,
  RuntimeSection,
} from "@/lib/project/project-runtime";

type SaveRuntimeResult = {
  localSaved: boolean;
  supabaseSaved: boolean;
  reason?: string;
};

type UnknownRecord = Record<string, unknown>;

type ProjectRow = {
  id: string;
  input: string;
  created_at: string | null;
  updated_at: string | null;
  status: string | null;
};

type ArtifactTable =
  | "project_brains"
  | "project_prds"
  | "project_architectures"
  | "project_tasks"
  | "export_packs";

type StandardArtifactTable = Exclude<ArtifactTable, "export_packs">;

const LOCAL_PROJECT_PREFIX = "devcommander-project";
const LOCAL_PROJECT_OS_PREFIX = "devcommander-os-project";

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(record: UnknownRecord | undefined, key: string): string | undefined {
  if (!record) return undefined;

  const value = record[key];

  return typeof value === "string" && value.trim() ? value : undefined;
}

function asRuntimeSection(value: unknown): RuntimeSection {
  if (value === null || value === undefined) return null;

  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    if (
      value.every(
        (item) =>
          typeof item === "string" ||
          (typeof item === "object" && item !== null && !Array.isArray(item)),
      )
    ) {
      return value as string[] | Array<Record<string, unknown>>;
    }

    return JSON.stringify(value, null, 2);
  }

  if (typeof value === "object") {
    return value as Record<string, unknown>;
  }

  return String(value);
}

function normalizeProjectStatus(
  value: string | null | undefined,
): ProjectRuntimeArtifact["status"] {
  if (value === "generated" || value === "partial" || value === "missing") {
    return value;
  }

  return "generated";
}

function getProjectTitle(project: ProjectRuntimeArtifact): string {
  if (isRecord(project.prd)) {
    const productName = readString(project.prd, "productName");

    if (productName) return productName;
  }

  return project.input.slice(0, 80) || "Untitled Project";
}

function getProjectCategory(project: ProjectRuntimeArtifact): string | null {
  if (!isRecord(project.prd)) return null;

  return readString(project.prd, "category") ?? null;
}

function getProjectComplexity(project: ProjectRuntimeArtifact): string | null {
  if (!isRecord(project.prd)) return null;

  return readString(project.prd, "complexity") ?? null;
}

function getExportMarkdown(project: ProjectRuntimeArtifact): string | null {
  if (!isRecord(project.exportPack)) return null;

  const markdown = project.exportPack.markdown;

  return typeof markdown === "string" ? markdown : null;
}

export function saveProjectToLocal(project: ProjectRuntimeArtifact): boolean {
  if (!isBrowser()) return false;

  window.localStorage.setItem(
    `${LOCAL_PROJECT_PREFIX}-${project.projectId}`,
    JSON.stringify(project),
  );

  window.localStorage.setItem(
    `${LOCAL_PROJECT_OS_PREFIX}-${project.projectId}`,
    JSON.stringify(project),
  );

  return true;
}

export function deleteProjectFromLocal(projectId: string): void {
  if (!isBrowser()) return;

  window.localStorage.removeItem(`${LOCAL_PROJECT_PREFIX}-${projectId}`);
  window.localStorage.removeItem(`${LOCAL_PROJECT_OS_PREFIX}-${projectId}`);
}

async function upsertStandardArtifact({
  table,
  project,
  userId,
  content,
}: {
  table: StandardArtifactTable;
  project: ProjectRuntimeArtifact;
  userId: string;
  content: RuntimeSection;
}): Promise<void> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase || content === null || content === undefined) return;

  const payload = {
    project_id: project.projectId,
    user_id: userId,
    content,
    version: "2.0",
    status: "active",
  };

  if (table === "project_brains") {
    const { error } = await supabase.from("project_brains").upsert(payload, {
      onConflict: "project_id",
    });

    if (error) throw error;
    return;
  }

  if (table === "project_prds") {
    const { error } = await supabase.from("project_prds").upsert(payload, {
      onConflict: "project_id",
    });

    if (error) throw error;
    return;
  }

  if (table === "project_architectures") {
    const { error } = await supabase.from("project_architectures").upsert(payload, {
      onConflict: "project_id",
    });

    if (error) throw error;
    return;
  }

  if (table === "project_tasks") {
    const { error } = await supabase.from("project_tasks").upsert(payload, {
      onConflict: "project_id",
    });

    if (error) throw error;
  }
}

async function upsertExportPack({
  project,
  userId,
  content,
}: {
  project: ProjectRuntimeArtifact;
  userId: string;
  content: RuntimeSection;
}): Promise<void> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase || content === null || content === undefined) return;

  const { error } = await supabase.from("export_packs").upsert(
    {
      project_id: project.projectId,
      user_id: userId,
      content,
      markdown: getExportMarkdown(project),
      version: "2.0",
      status: "active",
    },
    {
      onConflict: "project_id",
    },
  );

  if (error) {
    throw error;
  }
}

async function upsertArtifact({
  table,
  project,
  userId,
  content,
}: {
  table: ArtifactTable;
  project: ProjectRuntimeArtifact;
  userId: string;
  content: RuntimeSection;
}): Promise<void> {
  if (table === "export_packs") {
    await upsertExportPack({
      project,
      userId,
      content,
    });

    return;
  }

  await upsertStandardArtifact({
    table,
    project,
    userId,
    content,
  });
}

export async function saveProjectToSupabase(
  project: ProjectRuntimeArtifact,
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) return false;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const now = new Date().toISOString();

  const { error: projectError } = await supabase.from("projects").upsert(
    {
      id: project.projectId,
      user_id: user.id,
      title: getProjectTitle(project),
      input: project.input,
      status: project.status ?? "generated",
      category: getProjectCategory(project),
      complexity: getProjectComplexity(project),
      created_at: project.createdAt ?? now,
      updated_at: project.updatedAt ?? now,
    },
    {
      onConflict: "id",
    },
  );

  if (projectError) {
    throw projectError;
  }

  await upsertArtifact({
    table: "project_brains",
    project,
    userId: user.id,
    content: asRuntimeSection(project.brain),
  });

  await upsertArtifact({
    table: "project_prds",
    project,
    userId: user.id,
    content: asRuntimeSection(project.prd),
  });

  await upsertArtifact({
    table: "project_architectures",
    project,
    userId: user.id,
    content: asRuntimeSection(project.architecture),
  });

  await upsertArtifact({
    table: "project_tasks",
    project,
    userId: user.id,
    content: asRuntimeSection(project.tasks),
  });

  await upsertArtifact({
    table: "export_packs",
    project,
    userId: user.id,
    content: asRuntimeSection(project.exportPack),
  });

  return true;
}

export async function saveProjectRuntimeHybrid(
  project: ProjectRuntimeArtifact,
): Promise<SaveRuntimeResult> {
  const localSaved = saveProjectToLocal(project);

  try {
    const supabaseSaved = await saveProjectToSupabase(project);

    return {
      localSaved,
      supabaseSaved,
      reason: supabaseSaved
        ? "saved_to_local_and_supabase"
        : "saved_to_local_supabase_waiting_for_auth",
    };
  } catch (error) {
    console.error("Supabase save failed. LocalStorage fallback preserved.", error);

    return {
      localSaved,
      supabaseSaved: false,
      reason: "saved_to_local_supabase_failed",
    };
  }
}

async function readArtifact(
  table: ArtifactTable,
  projectId: string,
): Promise<RuntimeSection> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) return null;

  const { data, error } = await supabase
    .from(table)
    .select("content")
    .eq("project_id", projectId)
    .maybeSingle();

  if (error || !data || !isRecord(data)) return null;

  return asRuntimeSection(data.content);
}

export async function loadProjectFromSupabase(
  projectId: string,
): Promise<ProjectRuntimeArtifact | null> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("projects")
    .select("id,input,created_at,updated_at,status")
    .eq("id", projectId)
    .maybeSingle();

  if (error || !data) return null;

  const project = data as ProjectRow;

  const [brain, prd, architecture, tasks, exportPack] = await Promise.all([
    readArtifact("project_brains", projectId),
    readArtifact("project_prds", projectId),
    readArtifact("project_architectures", projectId),
    readArtifact("project_tasks", projectId),
    readArtifact("export_packs", projectId),
  ]);

  return {
    projectId: project.id,
    input: project.input,
    createdAt: project.created_at ?? undefined,
    updatedAt: project.updated_at ?? undefined,
    status: normalizeProjectStatus(project.status),
    brain,
    prd,
    architecture,
    tasks,
    exportPack,
  };
}

export async function loadProjectRuntimeHybrid(
  projectId: string,
): Promise<ProjectRuntimeArtifact> {
  try {
    const supabaseProject = await loadProjectFromSupabase(projectId);

    if (supabaseProject) return supabaseProject;
  } catch (error) {
    console.error("Supabase load failed. Falling back to LocalStorage.", error);
  }

  return loadProjectRuntime(projectId);
}

export async function deleteProjectFromSupabase(projectId: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) return false;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { error } = await supabase.from("projects").delete().eq("id", projectId);

  if (error) {
    console.error("Supabase delete failed.", error);
    return false;
  }

  return true;
}

export async function deleteProjectRuntimeHybrid(projectId: string): Promise<void> {
  deleteProjectFromLocal(projectId);
  await deleteProjectFromSupabase(projectId);
}