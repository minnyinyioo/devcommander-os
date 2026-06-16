"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  Loader2,
  RefreshCw,
  Rocket,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { generateReadinessReport } from "@/lib/readiness/readiness-engine";
import type {
  ReadinessCategory,
  ReadinessItem,
  ReadinessReport,
  ReadinessResult,
  ReadinessStatus,
} from "@/lib/readiness/readiness-types";
import { loadProjectRuntimeHybrid } from "@/lib/project/storage-adapter";
import type { ProjectRuntimeArtifact } from "@/lib/project/project-runtime";

type LoadState = "idle" | "loading" | "loaded" | "failed";

const CATEGORY_LABELS: Record<ReadinessCategory, string> = {
  product: "Product",
  architecture: "Architecture",
  security: "Security",
  delivery: "Delivery",
  operations: "Operations",
};

const CATEGORIES: ReadinessCategory[] = [
  "product",
  "architecture",
  "security",
  "delivery",
  "operations",
];

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

function getStatusBadgeClass(status: ReadinessStatus): string {
  if (status === "ready_for_deployment") {
    return "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20";
  }

  if (status === "ready_for_development") {
    return "bg-sky-500/10 text-sky-300 ring-sky-400/20";
  }

  if (status === "needs_security_review") {
    return "bg-red-500/10 text-red-300 ring-red-400/20";
  }

  if (status === "needs_architecture_review") {
    return "bg-amber-500/10 text-amber-300 ring-amber-400/20";
  }

  return "bg-zinc-800 text-zinc-400 ring-white/10";
}

function getResultBadgeClass(result: ReadinessResult): string {
  if (result === "pass") {
    return "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20";
  }

  if (result === "warning") {
    return "bg-amber-500/10 text-amber-300 ring-amber-400/20";
  }

  return "bg-red-500/10 text-red-300 ring-red-400/20";
}

function ResultIcon({ result }: { result: ReadinessResult }) {
  if (result === "pass") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-300" />;
  }

  if (result === "warning") {
    return <AlertTriangle className="h-4 w-4 text-amber-300" />;
  }

  return <XCircle className="h-4 w-4 text-red-300" />;
}

function ReadinessItemCard({ item }: { item: ReadinessItem }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-white/20 hover:bg-white/[0.04]">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <ResultIcon result={item.result} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-white">{item.title}</h3>

            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ${getResultBadgeClass(
                item.result,
              )}`}
            >
              {item.result}
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 text-zinc-400">{item.detail}</p>

          <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-zinc-300">
            {item.recommendation}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function ProjectReadinessClient() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const [project, setProject] = useState<ProjectRuntimeArtifact | null>(null);
  const [report, setReport] = useState<ReadinessReport | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [error, setError] = useState("");

  const loadReadiness = useCallback(async () => {
    setLoadState("loading");
    setError("");

    try {
      const runtimeProject = await loadProjectRuntimeHybrid(projectId);
      const nextReport = generateReadinessReport(runtimeProject);

      setProject(runtimeProject);
      setReport(nextReport);
      setLoadState("loaded");
    } catch (currentError) {
      setProject(null);
      setReport(null);
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Failed to load project readiness report.",
      );
      setLoadState("failed");
    }
  }, [projectId]);

  useEffect(() => {
    void loadReadiness();
  }, [loadReadiness]);

  const groupedItems = useMemo(() => {
    if (!report) return [];

    return CATEGORIES.map((category) => ({
      category,
      label: CATEGORY_LABELS[category],
      score: report.categoryScores[category],
      items: report.items.filter((item) => item.category === category),
    }));
  }, [report]);

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
            href="/dashboard"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            Dashboard
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
                Production Readiness Gate
              </p>

              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Project Health & Launch Readiness
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">
                Evaluate whether this generated runtime is ready for
                development, security review, deployment, or production work.
              </p>
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-5 lg:w-[340px]">
              <div className="flex items-center gap-2 text-sky-200">
                <Gauge className="h-4 w-4" />
                <p className="text-sm font-semibold">Runtime Quality Gate</p>
              </div>

              <p className="mt-3 text-sm leading-6 text-sky-100/80">
                This gate checks product clarity, architecture, security,
                delivery readiness, and operational resilience.
              </p>
            </div>
          </div>
        </header>

        {loadState === "loading" ? (
          <section className="mt-6 flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading readiness report...
          </section>
        ) : null}

        {error ? (
          <section className="mt-6 rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-sm leading-7 text-red-200">
            {error}
          </section>
        ) : null}

        {report && project ? (
          <>
            <section className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-zinc-400">Overall Score</p>

                  <button
                    type="button"
                    onClick={() => void loadReadiness()}
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

                <div className="mt-6 flex items-end gap-3">
                  <span className="text-6xl font-semibold tracking-tight text-white">
                    {report.overallScore}
                  </span>
                  <span className="pb-2 text-lg text-zinc-500">/100</span>
                </div>

                <div className="mt-5">
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${getStatusBadgeClass(
                      report.status,
                    )}`}
                  >
                    {report.statusLabel}
                  </span>
                </div>

                <p className="mt-5 text-sm leading-7 text-zinc-400">
                  {report.summary}
                </p>

                <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Project
                  </p>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-300">
                    {project.input}
                  </p>

                  <p className="mt-3 font-mono text-xs text-zinc-600">
                    {project.projectId}
                  </p>

                  <p className="mt-2 text-xs text-zinc-600">
                    Generated: {formatDate(report.generatedAt)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {CATEGORIES.map((category) => (
                  <div
                    key={category}
                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <p className="text-sm font-medium text-zinc-400">
                      {CATEGORY_LABELS[category]}
                    </p>

                    <p className="mt-4 text-4xl font-semibold text-white">
                      {report.categoryScores[category]}
                    </p>

                    <p className="mt-1 text-sm text-zinc-600">/100</p>
                  </div>
                ))}
              </div>
            </section>

            {report.nextActions.length > 0 ? (
              <section className="mt-6 rounded-3xl border border-amber-500/20 bg-amber-500/10 p-6">
                <div className="flex items-center gap-2 text-amber-200">
                  <Rocket className="h-4 w-4" />
                  <h2 className="text-lg font-semibold">Next Actions</h2>
                </div>

                <div className="mt-5 grid gap-3">
                  {report.nextActions.map((action) => (
                    <div
                      key={action}
                      className="rounded-2xl border border-amber-400/10 bg-black/20 px-4 py-3 text-sm leading-6 text-amber-50/90"
                    >
                      {action}
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <section className="mt-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
                <div className="flex items-center gap-2 text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                  <h2 className="text-lg font-semibold">No Critical Gaps</h2>
                </div>

                <p className="mt-3 text-sm leading-7 text-emerald-100/80">
                  This project passed the current readiness gate checks.
                </p>
              </section>
            )}

            <section className="mt-6 grid gap-6">
              {groupedItems.map((group) => (
                <div
                  key={group.category}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
                >
                  <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4 text-zinc-500" />

                      <h2 className="text-xl font-semibold text-white">
                        {group.label}
                      </h2>
                    </div>

                    <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-zinc-300 ring-1 ring-white/10">
                      Score {group.score}/100
                    </span>
                  </div>

                  <div className="grid gap-4">
                    {group.items.map((item) => (
                      <ReadinessItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}