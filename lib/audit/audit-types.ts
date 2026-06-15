export type AuditEventType =
  | "project.created"
  | "project.deleted"
  | "project.opened"
  | "project.exported"
  | "workspace.created"
  | "workspace.opened"
  | "auth.login"
  | "auth.logout"
  | "runtime.warning"
  | "runtime.error";

export type AuditEntityType =
  | "project"
  | "workspace"
  | "auth"
  | "runtime"
  | "system";

export type AuditEventRecord = {
  id: string;
  userId: string | null;
  workspaceId: string | null;
  projectId: string | null;
  eventType: string;
  entityType: string;
  entityId: string | null;
  message: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type AuditActionResult<T = undefined> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export type CreateAuditEventInput = {
  eventType: AuditEventType;
  entityType: AuditEntityType;
  entityId?: string | null;
  projectId?: string | null;
  workspaceId?: string | null;
  message: string;
  metadata?: Record<string, unknown>;
};