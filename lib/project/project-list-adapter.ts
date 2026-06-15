"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export type ProjectListSource = "local" | "cloud" | "hybrid";

export type ProjectListItem = {
  projectId: string;
  input: string;
  createdAt?: string;
  source: ProjectListSource;
};

type LocalRecentProject = {
  projectId: string;
  input: string;
  createdAt?: string;
};

type SupabaseProjectRow = {
  id: string;
  input: string;
  created_at: string | null;
};

const RECENT_PROJECTS_KEY = "devcommander-recent-projects";
const MAX_PROJECTS = 20;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isLocalRecentProject(value: unknown): value is LocalRecentProject {
  if (typeof value !== "object" || value === null) return false;

  const record = value as Record<string, unknown>;

  return (
    typeof record.projectId === "string" &&
    record.projectId.trim().length > 0 &&
    typeof record.input === "string" &&
    record.input.trim().length > 0 &&
    (record.createdAt === undefined || typeof record.createdAt === "string")
  );
}

export function readLocalProjectList(): ProjectListItem[] {
  if (!isBrowser()) return [];

  const saved = window.localStorage.getItem(RECENT_PROJECTS_KEY);

  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved) as unknown;

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isLocalRecentProject)
      .slice(0, MAX_PROJECTS)
      .map((project) => ({
        projectId: project.projectId,
        input: project.input,
        createdAt: project.createdAt,
        source: "local",
      }));
  } catch {
    return [];
  }
}

function isSupabaseProjectRow(value: unknown): value is SupabaseProjectRow {
  if (typeof value !== "object" || value === null) return false;

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    record.id.trim().length > 0 &&
    typeof record.input === "string" &&
    record.input.trim().length > 0 &&
    (record.created_at === null || typeof record.created_at === "string")
  );
}

export async function readCloudProjectList(): Promise<ProjectListItem[]> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) return [];

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return [];

  const { data, error } = await supabase
    .from("projects")
    .select("id,input,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(MAX_PROJECTS);

  if (error || !Array.isArray(data)) return [];

  return data.filter(isSupabaseProjectRow).map((project) => ({
    projectId: project.id,
    input: project.input,
    createdAt: project.created_at ?? undefined,
    source: "cloud",
  }));
}

export function mergeProjectLists({
  localProjects,
  cloudProjects,
}: {
  localProjects: ProjectListItem[];
  cloudProjects: ProjectListItem[];
}): ProjectListItem[] {
  const map = new Map<string, ProjectListItem>();

  for (const project of localProjects) {
    map.set(project.projectId, project);
  }

  for (const project of cloudProjects) {
    const existing = map.get(project.projectId);

    if (existing) {
      map.set(project.projectId, {
        ...project,
        input: project.input || existing.input,
        createdAt: project.createdAt ?? existing.createdAt,
        source: "hybrid",
      });
    } else {
      map.set(project.projectId, project);
    }
  }

  return Array.from(map.values())
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      return bTime - aTime;
    })
    .slice(0, MAX_PROJECTS);
}

export function writeLocalRecentProjects(projects: ProjectListItem[]): void {
  if (!isBrowser()) return;

  const localShape: LocalRecentProject[] = projects.slice(0, 10).map((project) => ({
    projectId: project.projectId,
    input: project.input,
    createdAt: project.createdAt,
  }));

  window.localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(localShape));
}