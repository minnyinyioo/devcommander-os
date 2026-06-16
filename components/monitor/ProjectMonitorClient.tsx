"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Gauge,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { generateProjectMonitorReport } from "@/lib/monitor/monitor-engine";
import type {
  MonitorSignalStatus,
  ProjectMonitorReport,
} from "@/lib/monitor/monitor-types";
import { loadProjectRuntimeHybrid } from "@/lib/project/storage-adapter";

type LoadState = "idle" | "loading" | "loaded" | "failed";

function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getStatusClass(status: MonitorSignalStatus): string {
  if (status === "healthy") {
    return "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20";
  }

  if (status === "warning") {
    return "bg-amber-500/10 text-amber-300 ring-amber-400/20";
  }

  return "bg-red-500/10 text-red-300 ring-red-400/20";
}

function getScoreClass(score: number): string {
  if (score >= 80) return "text-emerald-300";
  if (score >= 60) return "text-amber-300";
  return "text-red-300";
}

export default function ProjectMonitorClient() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [report, setReport] = useState<ProjectMonitorReport | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [error, setError] = useState("");

  const loadMonitorReport = useCallback(async () => {
    setLoadState("loading");
    setError("");

    try {
      const project = await loadProjectRuntimeHybrid(projectId);
      const nextReport = generateProjectMonitorReport(project);

      setReport(nextReport);
      setLoadState("loaded");
    } catch (currentError) {
      setReport(null);
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Failed to generate monitor report.",
      );
      setLoadState("failed");
    }
  }, [projectId]);

  useEffect(() => {
    void loadMonitorReport();
  }, [loadMonitorReport]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(63,63,70,0.35),_transparent_35%),#09090b] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/project/${encodeURIComponent(projectId)}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Project
          </Link>

          <Link
            href="/activity"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            Activity
          </Link>
        </div>

        <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-zinc-500">
                Project Monitor
              </p>

              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Runtime Health & Operations Console
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">
                Monitor project health across AI Router, Code Pack, Tests,
                Readiness, Deployment Pack, and Activity Audit before and after
                launch.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 lg:w-[340px]">
              <div className="flex items-center gap-2 text-emerald-200">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-sm font-semibold">Local Monitor</p>
              </div>

              <p className="mt-3 text-sm leading-6 text-emerald-100/80">
                This monitor is local-first and secret-safe. External
                observability providers can be added later through server-side
                integrations.
              </p>
            </div>
          </div>
        </header>

        {loadState === "loading" ? (
          <section className="mt-6 flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating monitor report...
          </section>
        ) : null}

        {error ? (
          <section className="mt-6 flex gap-3 rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-sm leading-7 text-red-200">
            <AlertTriangle className="mt-1 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </section>
        ) : null}

        {report ? (
          <>
            <section className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-zinc-400">Overall Health</p>

                  <button
                    type="button"
                    onClick={() => void loadMonitorReport()}
                    disabled={loadState === "loading"}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${
                        loadState === "loading" ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </button>
                </div>

                <p
                  className={`mt-6 text-6xl font-semibold tracking-tight ${getScoreClass(
                    report.overallHealthScore,
                  )}`}
                >
                  {report.overallHealthScore}
                </p>

                <p className="mt-1 text-sm text-zinc-600">/100</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${getStatusClass(
                      report.status,
                    )}`}
                  >
                    {report.status}
                  </span>

                  <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-zinc-400 ring-1 ring-white/10">
                    {report.riskLevel} risk
                  </span>
                </div>

                <h2 className="mt-5 text-xl font-semibold text-white">
                  {report.title}
                </h2>

                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  {report.summary}
                </p>

                <p className="mt-5 text-xs text-zinc-600">
                  Generated: {formatDate(report.generatedAt)}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-zinc-500" />
                  <h2 className="text-xl font-semibold text-white">
                    Next Actions
                  </h2>
                </div>

                <div className="grid gap-3">
                  {report.nextActions.map((action) => (
                    <div
                      key={action}
                      className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-zinc-300"
                    >
                      {action}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-5 flex items-center gap-2">
                <Activity className="h-4 w-4 text-zinc-500" />
                <h2 className="text-xl font-semibold text-white">
                  Runtime Signals
                </h2>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {report.signals.map((signal) => (
                  <article
                    key={signal.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-white">
                        {signal.title}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusClass(
                          signal.status,
                        )}`}
                      >
                        {signal.status}
                      </span>
                    </div>

                    <p
                      className={`mt-4 text-4xl font-semibold ${getScoreClass(
                        signal.score,
                      )}`}
                    >
                      {signal.score}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      {signal.description}
                    </p>

                    <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-zinc-300">
                      {signal.nextAction}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-5 flex items-center gap-2">
                {report.incidents.length > 0 ? (
                  <AlertTriangle className="h-4 w-4 text-amber-300" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                )}

                <h2 className="text-xl font-semibold text-white">
                  Incidents & Warnings
                </h2>
              </div>

              {report.incidents.length > 0 ? (
                <div className="grid gap-4">
                  {report.incidents.map((incident) => (
                    <article
                      key={incident.id}
                      className={`rounded-2xl border p-5 ${getStatusClass(
                        incident.severity,
                      )}`}
                    >
                      <h3 className="text-sm font-semibold">
                        {incident.title}
                      </h3>

                      <p className="mt-3 text-sm leading-6 opacity-80">
                        {incident.detail}
                      </p>

                      <p className="mt-4 text-sm leading-6 font-semibold">
                        Fix: {incident.recommendedFix}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm leading-6 text-emerald-100">
                  No monitor incidents detected. Continue watching Activity
                  after deployment and smoke tests.
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}