"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Siren,
  Undo2,
} from "lucide-react";
import {
  DEPLOYMENT_EVENT_ACTIONS,
  recordDeploymentEvent,
  type DeploymentEventActionId,
  type DeploymentEventActionTone,
} from "@/lib/deploy/deployment-events";

type DeploymentEventPanelProps = {
  projectId: string;
};

type LocalEventLog = {
  id: string;
  title: string;
  status: "recorded" | "failed";
  message: string;
  createdAt: string;
};

function getToneClass(tone: DeploymentEventActionTone): string {
  if (tone === "safe") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-100";
  }

  if (tone === "success") {
    return "border-green-500/20 bg-green-500/10 text-green-100";
  }

  if (tone === "danger") {
    return "border-red-500/20 bg-red-500/10 text-red-100";
  }

  if (tone === "warning") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-100";
  }

  return "border-sky-500/20 bg-sky-500/10 text-sky-100";
}

function DeploymentActionIcon({
  actionId,
}: {
  actionId: DeploymentEventActionId;
}) {
  if (actionId === "preflight_passed") {
    return <ShieldCheck className="h-5 w-5" />;
  }

  if (actionId === "deployment_started") {
    return <Rocket className="h-5 w-5" />;
  }

  if (actionId === "deployment_completed") {
    return <CheckCircle2 className="h-5 w-5" />;
  }

  if (actionId === "deployment_failed") {
    return <Siren className="h-5 w-5" />;
  }

  return <Undo2 className="h-5 w-5" />;
}

function createLocalLogId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `deployment-log-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

export default function DeploymentEventPanel({
  projectId,
}: DeploymentEventPanelProps) {
  const [runningActionId, setRunningActionId] =
    useState<DeploymentEventActionId | null>(null);
  const [logs, setLogs] = useState<LocalEventLog[]>([]);

  async function handleRecord(actionId: DeploymentEventActionId) {
    if (runningActionId) return;

    setRunningActionId(actionId);

    const result = await recordDeploymentEvent({
      projectId,
      actionId,
      metadata: {
        ui: "project_deploy_page",
        recordedAt: new Date().toISOString(),
      },
    });

    const nextLog: LocalEventLog = {
      id: createLocalLogId(),
      title: result.action?.title ?? actionId,
      status: result.ok ? "recorded" : "failed",
      message: result.ok
        ? "Audit event requested. If Supabase/Auth is configured, it will appear in Activity."
        : result.error ?? "Failed to record deployment event.",
      createdAt: new Date().toISOString(),
    };

    setLogs((currentLogs) => [nextLog, ...currentLogs].slice(0, 5));
    setRunningActionId(null);
  }

  return (
    <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(63,63,70,0.28),_transparent_35%),#09090b] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/30 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-zinc-500">
                Deployment Event Tracking
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Record deployment lifecycle events
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
                This panel records deployment decisions into Activity Audit. It
                does not deploy to Vercel directly. The correct order is Tests,
                Readiness, Deploy Pack review, then event recording.
              </p>
            </div>

            <Link
              href="/activity"
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            >
              View Activity
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {DEPLOYMENT_EVENT_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => void handleRecord(action.id)}
                disabled={runningActionId !== null}
                className={`rounded-3xl border p-5 text-left transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 ${getToneClass(
                  action.tone,
                )}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-2xl bg-black/20 p-3">
                    {runningActionId === action.id ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <DeploymentActionIcon actionId={action.id} />
                    )}
                  </div>

                  <Clock3 className="h-4 w-4 opacity-60" />
                </div>

                <p className="mt-5 text-sm font-semibold">{action.title}</p>

                <p className="mt-2 text-xs leading-5 opacity-80">
                  {action.description}
                </p>
              </button>
            ))}
          </div>

          {logs.length > 0 ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-zinc-500" />
                <h3 className="text-sm font-semibold text-white">
                  Latest event requests
                </h3>
              </div>

              <div className="grid gap-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={
                      log.status === "recorded"
                        ? "rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-100"
                        : "rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-100"
                    }
                  >
                    <div className="flex items-start gap-3">
                      {log.status === "recorded" ? (
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0" />
                      ) : (
                        <AlertTriangle className="mt-1 h-4 w-4 shrink-0" />
                      )}

                      <div>
                        <p className="font-semibold">{log.title}</p>
                        <p className="mt-1 opacity-80">{log.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}