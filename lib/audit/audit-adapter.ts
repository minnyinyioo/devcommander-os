"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type {
  AuditActionResult,
  AuditEventRecord,
  CreateAuditEventInput,
} from "@/lib/audit/audit-types";

type AuditEventRow = {
  id: string;
  user_id: string | null;
  workspace_id: string | null;
  project_id: string | null;
  event_type: string;
  entity_type: string;
  entity_id: string | null;
  message: string;
  metadata: unknown;
  created_at: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAuditEventRow(value: unknown): value is AuditEventRow {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    (value.user_id === null || typeof value.user_id === "string") &&
    (value.workspace_id === null || typeof value.workspace_id === "string") &&
    (value.project_id === null || typeof value.project_id === "string") &&
    typeof value.event_type === "string" &&
    typeof value.entity_type === "string" &&
    (value.entity_id === null || typeof value.entity_id === "string") &&
    typeof value.message === "string" &&
    typeof value.created_at === "string"
  );
}

function mapAuditEventRow(row: AuditEventRow): AuditEventRecord {
  return {
    id: row.id,
    userId: row.user_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    eventType: row.event_type,
    entityType: row.entity_type,
    entityId: row.entity_id,
    message: row.message,
    metadata: isRecord(row.metadata) ? row.metadata : {},
    createdAt: row.created_at,
  };
}

export async function createAuditEvent(
  input: CreateAuditEventInput,
): Promise<AuditActionResult> {
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

  const message = input.message.trim();

  if (message.length < 2 || message.length > 500) {
    return {
      ok: false,
      error: "Audit message must be between 2 and 500 characters.",
    };
  }

  const { error } = await supabase.from("audit_events").insert({
    user_id: user.id,
    workspace_id: input.workspaceId ?? null,
    project_id: input.projectId ?? null,
    event_type: input.eventType,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    message,
    metadata: input.metadata ?? {},
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

export async function listMyAuditEvents(options?: {
  workspaceId?: string | null;
  projectId?: string | null;
  limit?: number;
}): Promise<AuditActionResult<AuditEventRecord[]>> {
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

  const { data, error } = await supabase.rpc("list_my_audit_events", {
    target_workspace_id: options?.workspaceId ?? null,
    target_project_id: options?.projectId ?? null,
    max_rows: options?.limit ?? 50,
  });

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  const rows = Array.isArray(data) ? data : [];

  return {
    ok: true,
    data: rows.filter(isAuditEventRow).map(mapAuditEventRow),
  };
}