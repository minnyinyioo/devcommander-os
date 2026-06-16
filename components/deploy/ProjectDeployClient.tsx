"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ClipboardCheck,
  Cloud,
  Copy,
  Loader2,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { generateDeploymentPack } from "@/lib/deploy/deploy-engine";
import type { DeploymentPack, DeployRiskLevel } from "@/lib/deploy/deploy-types";
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

function getRiskClass(riskLevel: DeployRiskLevel): string {
  if (riskLevel === "low") {
    return "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20";
  }

  if (riskLevel === "medium") {
    return "bg-amber-500/10 text-amber-300 ring-amber-400/20";
  }

  return "bg-red-500/10 text-red-300 ring-red-400/20";
}

export default function ProjectDeployClient() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [deploymentPack, setDeploymentPack] = useState<DeploymentPack | null>(
    null,
  );
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const loadDeploymentPack = useCallback(async () => {
    setLoadState("loading");
    setError("");
    setCopied("");

    try {
      const project = await loadProjectRuntimeHybrid(projectId);
      const nextDeploymentPack = generateDeploymentPack(project);

      setDeploymentPack(nextDeploymentPack);
      setLoadState("loaded");
    } catch (currentError) {
      setDeploymentPack(null);
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Failed to generate deployment pack.",
      );
      setLoadState("failed");
    }
  }, [projectId]);

  useEffect(() => {
    void loadDeploymentPack();
  }, [loadDeploymentPack]);

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
                Deployment Pack
              </p>

              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Deploy Readiness & Launch Plan
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">
                Prepare this generated project for Vercel deployment with
                environment variables, build commands, production checklist, and
                rollback planning.
              </p>
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-5 lg:w-[340px]">
              <div className="flex items-center gap-2 text-sky-200">
                <Cloud className="h-4 w-4" />
                <p className="text-sm font-semibold">Vercel Target</p>
              </div>

              <p className="mt-3 text-sm leading-6 text-sky-100/80">
                This deployment pack assumes GitHub + Vercel + Supabase as the
                default free-first production stack.
              </p>
            </div>
          </div>
        </header>

        {loadState === "loading" ? (
          <section className="mt-6 flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating deployment pack...
          </section>
        ) : null}

        {error ? (
          <section className="mt-6 rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-sm leading-7 text-red-200">
            {error}
          </section>
        ) : null}

        {deploymentPack ? (
          <>
            <section className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-zinc-400">Deploy Pack</p>

                  <button
                    type="button"
                    onClick={() => void loadDeploymentPack()}
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

                <div className="mt-6">
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ring-1 ${getRiskClass(
                      deploymentPack.riskLevel,
                    )}`}
                  >
                    {deploymentPack.riskLevel} risk
                  </span>
                </div>

                <h2 className="mt-5 text-xl font-semibold text-white">
                  {deploymentPack.title}
                </h2>

                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  {deploymentPack.riskSummary}
                </p>

                <p className="mt-5 text-xs text-zinc-600">
                  Generated: {formatDate(deploymentPack.generatedAt)}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-zinc-500" />
                  <h2 className="text-xl font-semibold text-white">
                    Next Actions
                  </h2>
                </div>

                <div className="grid gap-3">
                  {deploymentPack.nextActions.map((action) => (
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

            <section className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-zinc-500" />
                  <h2 className="text-xl font-semibold text-white">
                    Commands
                  </h2>
                </div>

                <div className="grid gap-4">
                  {deploymentPack.commands.map((command) => (
                    <article
                      key={command.label}
                      className="rounded-2xl border border-white/10 bg-black/20 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-semibold text-white">
                            {command.label}
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-zinc-500">
                            {command.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            void copyToClipboard(command.command, command.label)
                          }
                          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06]"
                        >
                          {copied === command.label ? (
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

                      <pre className="mt-4 overflow-auto rounded-xl border border-white/10 bg-zinc-950 p-4 text-sm text-zinc-200">
                        <code>{command.command}</code>
                      </pre>
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="mb-5 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-zinc-500" />
                  <h2 className="text-xl font-semibold text-white">
                    Environment Variables
                  </h2>
                </div>

                <div className="grid gap-4">
                  {deploymentPack.environmentVariables.map((variable) => (
                    <article
                      key={variable.key}
                      className="rounded-2xl border border-white/10 bg-black/20 p-5"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-white">
                          {variable.key}
                        </span>

                        <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-zinc-400 ring-1 ring-white/10">
                          {variable.visibility}
                        </span>

                        {variable.required ? (
                          <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-300 ring-1 ring-red-400/20">
                            required
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-3 text-sm leading-6 text-zinc-400">
                        {variable.description}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="mb-5 flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-zinc-500" />
                  <h2 className="text-xl font-semibold text-white">
                    Production Checklist
                  </h2>
                </div>

                <div className="grid gap-4">
                  {deploymentPack.checklist.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-black/20 p-5"
                    >
                      <div className="flex items-center gap-2">
                        {item.required ? (
                          <AlertTriangle className="h-4 w-4 text-amber-300" />
                        ) : (
                          <Check className="h-4 w-4 text-emerald-300" />
                        )}

                        <h3 className="text-sm font-semibold text-white">
                          {item.title}
                        </h3>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-zinc-400">
                        {item.detail}
                      </p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="mb-5 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-zinc-500" />
                  <h2 className="text-xl font-semibold text-white">
                    Rollback Plan
                  </h2>
                </div>

                <div className="grid gap-3">
                  {deploymentPack.rollbackPlan.map((item) => (
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