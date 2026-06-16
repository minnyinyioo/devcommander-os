"use client";

import { createAuditEventSilently } from "@/lib/audit/audit-adapter";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type {
  WorkspaceActionResult,
  WorkspaceRecord,
  WorkspaceRole,
} from "@/lib/workspace/workspace-types";

type WorkspaceRpcRow = {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  role: string;
  created_at: string | null;
};

function normalizeWorkspaceRole(value: unknown): WorkspaceRole {
  if (
    value === "owner" ||
    value === "admin" ||
    value === "editor" ||
    value === "viewer"
  ) {
    return value;
  }

  return "viewer";
}

function isWorkspaceRpcRow(value: unknown): value is WorkspaceRpcRow {
  if (typeof value !== "object" || value === null) return false;

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.slug === "string" &&
    typeof record.owner_id === "string" &&
    typeof record.role === "string" &&
    (record.created_at === null || typeof record.created_at === "string")
  );
}

function mapWorkspaceRow(row: WorkspaceRpcRow): WorkspaceRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    ownerId: row.owner_id,
    role: normalizeWorkspaceRole(row.role),
    createdAt: row.created_at ?? undefined,
  };
}

export async function listMyWorkspaces(): Promise<
  WorkspaceActionResult<WorkspaceRecord[]>
> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return {
      ok: false,
      error: "Supabase is not configured.",
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      error: "Login required.",
    };
  }

  const { data, error } = await supabase.rpc("list_my_workspaces");

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  const rows = Array.isArray(data) ? data : [];

  return {
    ok: true,
    data: rows.filter(isWorkspaceRpcRow).map(mapWorkspaceRow),
  };
}

export async function createWorkspace(
  workspaceName: string,
): Promise<WorkspaceActionResult<WorkspaceRecord>> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return {
      ok: false,
      error: "Supabase is not configured.",
    };
  }

  const cleanName = workspaceName.trim();

  if (cleanName.length < 2 || cleanName.length > 80) {
    return {
      ok: false,
      error: "Workspace name must be between 2 and 80 characters.",
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      error: "Login required.",
    };
  }

  const { data, error } = await supabase.rpc("create_workspace", {
    workspace_name: cleanName,
  });

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  const rows = Array.isArray(data) ? data : [];
  const firstRow = rows.find(isWorkspaceRpcRow);

  if (!firstRow) {
    return {
      ok: false,
      error: "Workspace was created but no valid workspace record was returned.",
    };
  }

  const workspace = mapWorkspaceRow(firstRow);

  await createAuditEventSilently({
    eventType: "workspace.created",
    entityType: "workspace",
    entityId: workspace.id,
    workspaceId: workspace.id,
    message: `Created workspace: ${workspace.name}`,
    metadata: {
      source: "create_workspace",
      workspaceId: workspace.id,
      slug: workspace.slug,
      role: workspace.role,
    },
  });

  return {
    ok: true,
    data: workspace,
  };
}

export async function renameWorkspace({
  workspaceId,
  nextName,
}: {
  workspaceId: string;
  nextName: string;
}): Promise<WorkspaceActionResult> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return {
      ok: false,
      error: "Supabase is not configured.",
    };
  }

  const cleanName = nextName.trim();

  if (cleanName.length < 2 || cleanName.length > 80) {
    return {
      ok: false,
      error: "Workspace name must be between 2 and 80 characters.",
    };
  }

  const { error } = await supabase.rpc("rename_workspace", {
    target_workspace_id: workspaceId,
    next_name: cleanName,
  });

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  return {
    ok: true,
  };
}