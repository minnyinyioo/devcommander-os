"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ClipboardList,
  Copy,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { generateOpsRunbook } from "@/lib/ops/ops-engine";
import type { OpsPriority, OpsRunbook } from "@/lib/ops/ops-types";
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

function getPriorityClass(priority: OpsPriority): string {
  if (priority === "critical") {
    return "bg-red-500/10 text-red-300 ring-red-400/20";
  }

  if (priority === "high") {
    return "bg-amber-500/10 text-amber-300 ring-amber-400/20";
  }

  return "bg-sky-500/10 text-sky-300 ring-sky-400/20";
}

function getStageClass(stage: OpsRunbook["operatingStage"]): string {
  if (stage === "post_launch") {
    return "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20";
  }

  if (stage === "launch_ready") {
    return "bg-amber-500/10 text-amber-300 ring-amber-400/20";
  }

  return "bg-red-500/10 text-red-300 ring-red-400/20";
}

function buildRunbookMarkdown(runbook: OpsRunbook): string {
  return [
    `# Operations Runbook: ${runbook.title}`,
    "",
    `Project ID: ${runbook.projectId}`,
    `Operating Stage: ${runbook.operatingStage}`,
    `Generated: ${runbook.generatedAt}`,
    "",
    "## Summary",
    "",
    runbook.summary,
    "",
    "## Next Actions",
    "",
    ...runbook.nextActions.map((item) => `- ${item}`),
    "",
    "## Runbook Sections",
    "",
    ...runbook.sections.flatMap((section) => [
      `### ${section.title}`,
      "",
      `Priority: ${section.priority}`,
      "",
      section.summary,
      "",
      ...section.checklist.map((item) => `- ${item}`),
      "",
    ]),
    "## Escalation Rules",
    "",
    ...runbook.escalationRules.map((item) => `- ${item}`),
    "",
    "## Weekly Review",
    "",
    ...runbook.weeklyReview.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

export default function ProjectOpsRunbookClient() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [runbook, setRunbook] = useState<OpsRunbook | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string>("");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const loadRunbook = useCallback(async () => {
    setLoadState("loading");
    setError("");
    setCopied("");

    try {
      const project = await loadProjectRuntimeHybrid(projectId);
      const nextRunbook = generateOpsRunbook(project);

      setRunbook(nextRunbook);
      setActiveSectionId(nextRunbook.sections[0]?.id ?? "");
      setLoadState("loaded");
    } catch (currentError) {
      setRunbook(null);
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Failed to generate operations runbook.",
      );
      setLoadState("failed");
    }
  }, [projectId]);

  useEffect(() => {
    void loadRunbook();
  }, [loadRunbook]);

  const activeSection = useMemo(() => {
    return (
      runbook?.sections.find((section) => section.id === activeSectionId) ??
      runbook?.sections[0] ??
      null
    );
  }, [activeSectionId, runbook]);

  async function copyToClipboard(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);

      window.setTimeout(() => {
        setCopied("");
      }, 1400);
    } catch {
      setCopied("Copy failed");
    }
  }

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
            href={`/project/${encodeURIComponent(projectId)}/monitor`}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            Monitor
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
                Operations Runbook
              </p>

              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Project Ops & Incident Playbook
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">
                A project-level operations guide for launch control, incident
                response, security operations, data recovery, release process,
                and AI router operations.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 lg:w-[340px]">
              <div className="flex items-center gap-2 text-emerald-200">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-sm font-semibold">Ops Before Scale</p>
              </div>

              <p className="mt-3 text-sm leading-6 text-emerald-100/80">
                This runbook keeps launch, rollback, incidents, and secret
                safety controlled before connecting external providers.
              </p>
            </div>
          </div>
        </header>

        {loadState === "loading" ? (
          <section className="mt-6 flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating operations runbook...
          </section>
        ) : null}

        {error ? (
          <section className="mt-6 flex gap-3 rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-sm leading-7 text-red-200">
            <AlertTriangle className="mt-1 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </section>
        ) : null}

        {runbook ? (
          <>
            <section className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-zinc-400">Operating Stage</p>

                  <button
                    type="button"
                    onClick={() => void loadRunbook()}
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

                <div
                  className={`mt-6 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ring-1 ${getStageClass(
                    runbook.operatingStage,
                  )}`}
                >
                  {runbook.operatingStage.replaceAll("_", " ")}
                </div>

                <h2 className="mt-5 text-xl font-semibold text-white">
                  {runbook.title}
                </h2>

                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  {runbook.summary}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    void copyToClipboard(buildRunbookMarkdown(runbook), "runbook")
                  }
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                >
                  {copied === "runbook" ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Runbook
                    </>
                  )}
                </button>

                <p className="mt-5 text-xs text-zinc-600">
                  Generated: {formatDate(runbook.generatedAt)}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-zinc-500" />
                  <h2 className="text-xl font-semibold text-white">
                    Next Actions
                  </h2>
                </div>

                <div className="grid gap-3">
                  {runbook.nextActions.map((action) => (
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

            <section className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
              <aside className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-4 flex items-center gap-2 px-2">
                  <ClipboardList className="h-4 w-4 text-zinc-500" />
                  <h2 className="text-sm font-semibold text-white">
                    Runbook Sections
                  </h2>
                </div>

                <div className="grid gap-2">
                  {runbook.sections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSectionId(section.id)}
                      className={
                        activeSection?.id === section.id
                          ? "rounded-2xl bg-white px-4 py-3 text-left text-sm font-semibold text-zinc-950"
                          : "rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06]"
                      }
                    >
                      {section.title}
                    </button>
                  ))}
                </div>
              </aside>

              {activeSection ? (
                <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getPriorityClass(
                        activeSection.priority,
                      )}`}
                    >
                      {activeSection.priority}
                    </span>
                  </div>

                  <h2 className="mt-5 text-2xl font-semibold text-white">
                    {activeSection.title}
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    {activeSection.summary}
                  </p>

                  <div className="mt-6 grid gap-3">
                    {activeSection.checklist.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-zinc-300"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </article>
              ) : null}
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-xl font-semibold text-white">
                  Escalation Rules
                </h2>

                <div className="mt-5 grid gap-3">
                  {runbook.escalationRules.map((rule) => (
                    <div
                      key={rule}
                      className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-100"
                    >
                      {rule}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-xl font-semibold text-white">
                  Weekly Ops Review
                </h2>

                <div className="mt-5 grid gap-3">
                  {runbook.weeklyReview.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-zinc-300"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
