import { createAuditEventSilently } from "@/lib/audit/audit-adapter";
import type { AuditEventType } from "@/lib/audit/audit-types";

export type DeploymentEventActionId =
  | "preflight_passed"
  | "deployment_started"
  | "deployment_completed"
  | "deployment_failed"
  | "rollback_requested";

export type DeploymentEventActionTone =
  | "safe"
  | "info"
  | "success"
  | "danger"
  | "warning";

export type DeploymentEventAction = {
  id: DeploymentEventActionId;
  title: string;
  description: string;
  eventType: AuditEventType;
  auditMessage: string;
  tone: DeploymentEventActionTone;
};

export type RecordDeploymentEventInput = {
  projectId: string;
  actionId: DeploymentEventActionId;
  metadata?: Record<string, unknown>;
};

export type RecordDeploymentEventResult = {
  ok: boolean;
  action?: DeploymentEventAction;
  error?: string;
};

export const DEPLOYMENT_EVENT_ACTIONS: DeploymentEventAction[] = [
  {
    id: "preflight_passed",
    title: "Preflight Passed",
    description:
      "Record that build, tests, environment variables, and readiness checks were reviewed before deployment.",
    eventType: "deployment.preflight_passed",
    auditMessage: "Deployment preflight checks passed.",
    tone: "safe",
  },
  {
    id: "deployment_started",
    title: "Deployment Started",
    description:
      "Record that a deployment attempt has started after tests and readiness review.",
    eventType: "deployment.started",
    auditMessage: "Deployment started.",
    tone: "info",
  },
  {
    id: "deployment_completed",
    title: "Deployment Completed",
    description:
      "Record that deployment finished successfully and the project is ready for smoke testing.",
    eventType: "deployment.completed",
    auditMessage: "Deployment completed successfully.",
    tone: "success",
  },
  {
    id: "deployment_failed",
    title: "Deployment Failed",
    description:
      "Record that deployment failed and the team should inspect build logs, env vars, and route errors.",
    eventType: "deployment.failed",
    auditMessage: "Deployment failed.",
    tone: "danger",
  },
  {
    id: "rollback_requested",
    title: "Rollback Requested",
    description:
      "Record that rollback should be considered because the latest deployment is unsafe or broken.",
    eventType: "deployment.rollback_requested",
    auditMessage: "Deployment rollback requested.",
    tone: "warning",
  },
];

export function getDeploymentEventAction(
  actionId: DeploymentEventActionId,
): DeploymentEventAction | null {
  return DEPLOYMENT_EVENT_ACTIONS.find((action) => action.id === actionId) ?? null;
}

export async function recordDeploymentEvent({
  projectId,
  actionId,
  metadata,
}: RecordDeploymentEventInput): Promise<RecordDeploymentEventResult> {
  const action = getDeploymentEventAction(actionId);

  if (!action) {
    return {
      ok: false,
      error: "Unknown deployment event action.",
    };
  }

  try {
    await createAuditEventSilently({
      eventType: action.eventType,
      entityType: "deployment",
      entityId: `${projectId}:${action.id}`,
      projectId,
      message: action.auditMessage,
      metadata: {
        source: "deployment_event_panel",
        actionId: action.id,
        actionTitle: action.title,
        ...metadata,
      },
    });

    return {
      ok: true,
      action,
    };
  } catch (error) {
    return {
      ok: false,
      action,
      error:
        error instanceof Error
          ? error.message
          : "Failed to record deployment event.",
    };
  }
}