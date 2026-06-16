"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Check,
  Copy,
  KeyRound,
  Loader2,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { generateAiRouterPlan } from "@/lib/ai-router/router-engine";
import type { AiProviderStatus, AiRouterPlan } from "@/lib/ai-router/router-types";
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

function getStatusClass(status: AiProviderStatus): string {
  if (status === "available") {
    return "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20";
  }

  if (status === "needs_key") {
    return "bg-amber-500/10 text-amber-300 ring-amber-400/20";
  }

  return "bg-zinc-800 text-zinc-400 ring-white/10";
}

export default function ProjectAiRouterClient() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [plan, setPlan] = useState<AiRouterPlan | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const loadRouterPlan = useCallback(async () => {
    setLoadState("loading");
    setError("");
    setCopied("");

    try {
      const project = await loadProjectRuntimeHybrid(projectId);
      const nextPlan = generateAiRouterPlan(project);

      setPlan(nextPlan);
      setLoadState("loaded");
    } catch (currentError) {
      setPlan(null);
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Failed to generate AI router plan.",
      );
      setLoadState("failed");
    }
  }, [projectId]);

  useEffect(() => {
    void loadRouterPlan();
  }, [loadRouterPlan]);

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
            href={`/project/${encodeURIComponent(projectId)}/deploy`}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            Deploy
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            Dashboard
          </Link>
        </div>

        <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-zinc-500">
                AI Router Foundation
              </p>

              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Project AI Routing Console
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">
                Route PRD, architecture, code, deployment, and monitoring tasks
                across local and future cloud AI providers with fallback and
                secret-safe policies.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 lg:w-[340px]">
              <div className="flex items-center gap-2 text-emerald-200">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-sm font-semibold">Secret-Safe Router</p>
              </div>

              <p className="mt-3 text-sm leading-6 text-emerald-100/80">
                This foundation does not expose or require provider keys. Cloud
                AI execution should be added only through server-side routes.
              </p>
            </div>
          </div>
        </header>

        {loadState === "loading" ? (
          <section className="mt-6 flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating AI router plan...
          </section>
        ) : null}

        {error ? (
          <section className="mt-6 flex gap-3 rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-sm leading-7 text-red-200">
            <AlertTriangle className="mt-1 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </section>
        ) : null}

        {plan ? (
          <>
            <section className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-zinc-400">Router Mode</p>

                  <button
                    type="button"
                    onClick={() => void loadRouterPlan()}
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

                <div className="mt-6 inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-950">
                  {plan.mode.replace("_", " ")}
                </div>

                <h2 className="mt-5 text-xl font-semibold text-white">
                  {plan.title}
                </h2>

                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  {plan.summary}
                </p>

                <p className="mt-5 text-xs text-zinc-600">
                  Generated: {formatDate(plan.generatedAt)}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-zinc-500" />
                  <h2 className="text-xl font-semibold text-white">
                    Next Actions
                  </h2>
                </div>

                <div className="grid gap-3">
                  {plan.nextActions.map((action) => (
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
                <Bot className="h-4 w-4 text-zinc-500" />
                <h2 className="text-xl font-semibold text-white">
                  Provider Registry
                </h2>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {plan.providers.map((provider) => (
                  <article
                    key={provider.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">
                        {provider.name}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusClass(
                          provider.status,
                        )}`}
                      >
                        {provider.status.replace("_", " ")}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      {provider.role}
                    </p>

                    <div className="mt-4 grid gap-2">
                      {provider.strengths.map((strength) => (
                        <div
                          key={strength}
                          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs leading-5 text-zinc-400"
                        >
                          {strength}
                        </div>
                      ))}
                    </div>

                    {provider.requiredEnvKeys.length > 0 ? (
                      <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                        <div className="flex items-center gap-2 text-amber-200">
                          <KeyRound className="h-3.5 w-3.5" />
                          <p className="text-xs font-semibold">
                            Server-only env keys
                          </p>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {provider.requiredEnvKeys.map((key) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => void copyToClipboard(key, key)}
                              className="rounded-full bg-black/20 px-3 py-1 font-mono text-xs text-amber-100 ring-1 ring-amber-400/20"
                            >
                              {copied === key ? "Copied" : key}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Route className="h-4 w-4 text-zinc-500" />
                  <h2 className="text-xl font-semibold text-white">
                    Routing Rules
                  </h2>
                </div>

                <div className="grid gap-4">
                  {plan.rules.map((rule) => (
                    <article
                      key={rule.taskType}
                      className="rounded-2xl border border-white/10 bg-black/20 p-5"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-950">
                          {rule.label}
                        </span>

                        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-zinc-400 ring-1 ring-white/10">
                          primary: {rule.primaryProvider}
                        </span>

                        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-zinc-400 ring-1 ring-white/10">
                          fallback: {rule.fallbackProviders.join(" → ")}
                        </span>
                      </div>

                      <p className="mt-4 text-sm leading-7 text-zinc-400">
                        {rule.reason}
                      </p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="mb-5 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-zinc-500" />
                  <h2 className="text-xl font-semibold text-white">
                    Safety Policies
                  </h2>
                </div>

                <div className="grid gap-3">
                  {plan.safetyPolicies.map((policy) => (
                    <div
                      key={policy}
                      className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-zinc-300"
                    >
                      {policy}
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