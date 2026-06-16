"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ClipboardCheck,
  Copy,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { generateTestPack } from "@/lib/testpack/testpack-engine";
import type {
  TestPack,
  TestPackCategory,
  TestPackPriority,
} from "@/lib/testpack/testpack-types";
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

function getPriorityClass(priority: TestPackPriority): string {
  if (priority === "critical") {
    return "bg-red-500/10 text-red-300 ring-red-400/20";
  }

  if (priority === "high") {
    return "bg-amber-500/10 text-amber-300 ring-amber-400/20";
  }

  return "bg-sky-500/10 text-sky-300 ring-sky-400/20";
}

function getSignalClass(signal: TestPack["readinessSignal"]): string {
  if (signal === "safe_to_test") {
    return "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20";
  }

  if (signal === "needs_review") {
    return "bg-amber-500/10 text-amber-300 ring-amber-400/20";
  }

  return "bg-red-500/10 text-red-300 ring-red-400/20";
}

function getCategoryLabel(category: TestPackCategory): string {
  if (category === "smoke") return "Smoke";
  if (category === "routes") return "Routes";
  if (category === "security") return "Security";
  if (category === "data") return "Data";
  if (category === "deployment") return "Deployment";
  return "Acceptance";
}

export default function ProjectTestPackClient() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [testPack, setTestPack] = useState<TestPack | null>(null);
  const [activeCategory, setActiveCategory] =
    useState<TestPackCategory>("smoke");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const loadTestPack = useCallback(async () => {
    setLoadState("loading");
    setError("");
    setCopied("");

    try {
      const project = await loadProjectRuntimeHybrid(projectId);
      const nextTestPack = generateTestPack(project);

      setTestPack(nextTestPack);
      setLoadState("loaded");
    } catch (currentError) {
      setTestPack(null);
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Failed to generate test pack.",
      );
      setLoadState("failed");
    }
  }, [projectId]);

  useEffect(() => {
    void loadTestPack();
  }, [loadTestPack]);

  const categories = useMemo<TestPackCategory[]>(() => {
    return ["smoke", "routes", "security", "data", "deployment", "acceptance"];
  }, []);

  const filteredItems = useMemo(() => {
    return testPack?.items.filter((item) => item.category === activeCategory) ?? [];
  }, [activeCategory, testPack]);

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
            href={`/project/${encodeURIComponent(projectId)}/code`}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            Code Pack
          </Link>

          <Link
            href={`/project/${encodeURIComponent(projectId)}/readiness`}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            Readiness
          </Link>

          <Link
            href={`/project/${encodeURIComponent(projectId)}/deploy`}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            Deploy
          </Link>
        </div>

        <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-zinc-500">
                Test Pack Foundation
              </p>

              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Runtime Test & QA Console
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">
                Validate routes, build output, security checks, local fallback,
                Supabase hybrid storage, deployment readiness, and full product
                acceptance flow before launch.
              </p>
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-5 lg:w-[340px]">
              <div className="flex items-center gap-2 text-sky-200">
                <ClipboardCheck className="h-4 w-4" />
                <p className="text-sm font-semibold">QA Before Deploy</p>
              </div>

              <p className="mt-3 text-sm leading-6 text-sky-100/80">
                Tests sit between Code Pack and Readiness / Deploy so the
                product workflow stays logical and production-safe.
              </p>
            </div>
          </div>
        </header>

        {loadState === "loading" ? (
          <section className="mt-6 flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating test pack...
          </section>
        ) : null}

        {error ? (
          <section className="mt-6 flex gap-3 rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-sm leading-7 text-red-200">
            <AlertTriangle className="mt-1 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </section>
        ) : null}

        {testPack ? (
          <>
            <section className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-zinc-400">Test Signal</p>

                  <button
                    type="button"
                    onClick={() => void loadTestPack()}
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
                  className={`mt-6 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ring-1 ${getSignalClass(
                    testPack.readinessSignal,
                  )}`}
                >
                  {testPack.readinessSignal.replaceAll("_", " ")}
                </div>

                <h2 className="mt-5 text-xl font-semibold text-white">
                  {testPack.title}
                </h2>

                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  {testPack.summary}
                </p>

                <p className="mt-5 text-xs text-zinc-600">
                  Generated: {formatDate(testPack.generatedAt)}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="mb-5 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-zinc-500" />
                  <h2 className="text-xl font-semibold text-white">
                    Next Actions
                  </h2>
                </div>

                <div className="grid gap-3">
                  {testPack.nextActions.map((action) => (
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
              <div className="flex gap-2 overflow-x-auto whitespace-nowrap">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={
                      activeCategory === category
                        ? "inline-flex h-10 shrink-0 items-center rounded-full bg-white px-4 text-xs font-semibold text-zinc-950"
                        : "inline-flex h-10 shrink-0 items-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                    }
                  >
                    {getCategoryLabel(category)}
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-4">
                {filteredItems.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getPriorityClass(
                          item.priority,
                        )}`}
                      >
                        {item.priority}
                      </span>

                      <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-zinc-400 ring-1 ring-white/10">
                        {getCategoryLabel(item.category)}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-white">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-zinc-400">
                      <span className="font-semibold text-zinc-300">
                        Expected:
                      </span>{" "}
                      {item.expectedResult}
                    </p>

                    <p className="mt-2 text-sm leading-7 text-zinc-500">
                      <span className="font-semibold text-zinc-400">
                        Failure risk:
                      </span>{" "}
                      {item.failureRisk}
                    </p>

                    {item.command ? (
                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                            <Terminal className="h-3.5 w-3.5" />
                            Command
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              void copyToClipboard(item.command ?? "", item.id)
                            }
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06]"
                          >
                            {copied === item.id ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>

                        <pre className="overflow-auto rounded-xl border border-white/10 bg-zinc-950 p-4 text-sm text-zinc-200">
                          <code>{item.command}</code>
                        </pre>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-5 flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-zinc-500" />
                <h2 className="text-xl font-semibold text-white">
                  Manual Acceptance Checklist
                </h2>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                {testPack.manualChecklist.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-zinc-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}