"use client";

import { loadProjectRuntime } from "@/lib/project/project-runtime";
import { saveProjectToSupabase } from "@/lib/project/storage-adapter";

type RecentProjectRecord = {
  projectId: string;
};

export type LocalProjectSyncResult = {
  attempted: number;
  synced: number;
  failed: number;
  skipped: boolean;
};

const RECENT_PROJECTS_KEY = "devcommander-recent-projects";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isRecentProjectRecord(value: unknown): value is RecentProjectRecord {
  if (typeof value !== "object" || value === null) return false;

  const record = value as Record<string, unknown>;

  return typeof record.projectId === "string" && record.projectId.trim().length > 0;
}

function readRecentProjectIds(): string[] {
  if (!isBrowser()) return [];

  const saved = window.localStorage.getItem(RECENT_PROJECTS_KEY);

  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved) as unknown;

    if (!Array.isArray(parsed)) return [];

    return Array.from(
      new Set(parsed.filter(isRecentProjectRecord).map((item) => item.projectId)),
    );
  } catch {
    return [];
  }
}

export async function syncLocalProjectsAfterAuth(): Promise<LocalProjectSyncResult> {
  const projectIds = readRecentProjectIds();

  if (projectIds.length === 0) {
    return {
      attempted: 0,
      synced: 0,
      failed: 0,
      skipped: true,
    };
  }

  let synced = 0;
  let failed = 0;

  for (const projectId of projectIds) {
    try {
      const project = loadProjectRuntime(projectId);

      if (project.status === "missing") {
        failed += 1;
        continue;
      }

      const saved = await saveProjectToSupabase(project);

      if (saved) {
        synced += 1;
      } else {
        failed += 1;
      }
    } catch {
      failed += 1;
    }
  }

  return {
    attempted: projectIds.length,
    synced,
    failed,
    skipped: false,
  };
}