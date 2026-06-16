"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Code2,
  Gauge,
  Loader2,
  RefreshCw,
  Rocket,
} from "lucide-react";
import { generateCodePack } from "@/lib/codegen/codegen-engine";
import type { CodePack } from "@/lib/codegen/codegen-types";
import { generateDeploymentPack } from "@/lib/deploy/deploy-engine";
import type { DeploymentPack } from "@/lib/deploy/deploy-types";
import { loadProjectRuntimeHybrid } from "@/lib/project/storage-adapter";
import type { ProjectRuntimeArtifact } from "@/lib/project/project-runtime";
import { generateReadinessReport } from "@/lib/readiness/readiness-engine";
import type { ReadinessReport } from "@/lib/readiness/readiness-types";

type LoadState = "idle" | "loading" | "loaded" | "failed";
type RuntimeStage = "planning" | "build" | "deploy" | "monitor";

type ProjectRuntimeActionHubProps = {
  projectId: string;
};

function getProjectHref(projectId: string, suffix = ""): string {
  return `/project/${encodeURIComponent(projectId)}${suffix}`;
}

function getStageLabel(stage: RuntimeStage): string {
  if (stage === "planning") return "Planning";
  if (stage === "build") return "Build";
  if (stage === "deploy") return "Deploy";
  return "Monitor";
}

function getStageDescription(stage: RuntimeStage): string {
  if (stage === "planning") {
    return "The project still needs stronger product, architecture, or security clarity before serious implementation.";
  }

  if (stage === "build") {
    return "The project is ready to move from planning into implementation and code package review.";
  }

  if (stage === "deploy") {
    return "The project has enough readiness signals to prepare deployment checks and launch workflow.";
  }

  return "The project should now focus on activity logs, monitoring, audit trail, and operational review.";
}

function resolveRuntimeStage(report: ReadinessReport): RuntimeStage {
  if (report.status === "ready_for_deployment") return "deploy";

  if (
    report.status === "ready_for_development" ||
    report.overallScore >= 75
  ) {
    return "build";
  }

  if (report.overallScore >= 90) return "monitor";

  return "planning";
}

function getRiskClass(riskLevel: DeploymentPack["riskLevel"]): string {
  if (riskLevel === "low") {
    return "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20";
  }

  if (riskLevel === "medium") {
    return "bg-amber-500/10 text-amber-300 ring-amber-400/20";
  }

  return "bg-red-500/10 text-red-300 ring-red-400/20";
}

function getScoreClass(score: number): string {
  if (score >= 80) return "text-emerald-300";
  if (score >= 60) return "text-amber-300";
  return "text-red-300";
}

function ActionCard({
  href,
  title,
  description,
  meta,
  icon,
  primary = false,
}: {
  href: string;
  title: string;
  description: string;
  meta: string;
  icon: ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-3xl border p-5 transition ${
        primary
          ? "border-white/20 bg-white text-zinc-950 hover:bg-zinc-200"
          : "border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.06]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`rounded-2xl p-3 ${
            primary ? "bg-zinc-950 text-white" : "bg-white/[0.06] text-zinc-300"
          }`}
        >
          {icon}
        </div>

        <ArrowRight
          className={`h-4 w-4 transition group-hover:translate-x-1 ${
            primary ? "text-zinc-700" : "text-zinc-500"
          }`}
        />
      </div>

      <p
        className={`mt-5 text-sm font-semibold ${
          primary ? "text-zinc-950" : "text-white"
        }`}
      >
        {title}
      </p>

      <p
        className={`mt-2 text-sm leading-6 ${
          primary ? "text-zinc-700" : "text-zinc-400"
        }`}
      >
        {description}
      </p>

      <p
        className={`mt-4 text-xs font-semibold ${
          primary ? "text-zinc-600" : "text-zinc-500"
        }`}
      >
        {meta}
      </p>
    </Link>
  );
}

export default function ProjectRuntimeActionHub({
  projectId,
}: ProjectRuntimeActionHubProps) {
  const [project, setProject] = useState<ProjectRuntimeArtifact | null>(null);
  const [readinessReport, setReadinessReport] =
    useState<ReadinessReport | null>(null);
  const [deploymentPack, setDeploymentPack] =
    useState<DeploymentPack | null>(null);
  const [codePack, setCodePack] = useState<CodePack | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [error, setError] = useState("");

  const loadActionHub = useCallback(async () => {
    setLoadState("loading");
    setError("");

    try {
      const runtimeProject = await loadProjectRuntimeHybrid(projectId);
      const nextReadinessReport = generateReadinessReport(runtimeProject);
      const nextDeploymentPack = generateDeploymentPack(runtimeProject);
      const nextCodePack = generateCodePack(runtimeProject);

      setProject(runtimeProject);
      setReadinessReport(nextReadinessReport);
      setDeploymentPack(nextDeploymentPack);
      setCodePack(nextCodePack);
      setLoadState("loaded");
    } catch (currentError) {
      setProject(null);
      setReadinessReport(null);
      setDeploymentPack(null);
      setCodePack(null);
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Failed to load project action hub.",
      );
      setLoadState("failed");
    }
  }, [projectId]);

  useEffect(() => {
    void loadActionHub();
  }, [loadActionHub]);

  const runtimeStage = useMemo(() => {
    if (!readinessReport) return "planning";

    return resolveRuntimeStage(readinessReport);
  }, [readinessReport]);

  const nextAction = useMemo(() => {
    if (readinessReport?.nextActions[0]) {
      return readinessReport.nextActions[0];
    }

    if (deploymentPack?.nextActions[0]) {
      return deploymentPack.nextActions[0];
    }

    return "Review Code Pack, Deployment Pack, Readiness Gate, and Activity logs before production use.";
  }, [deploymentPack, readinessReport]);

  return (
    <section className="border-b border-white/10 bg-zinc-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/30 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-zinc-500">
                Project Runtime Action Hub
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                What should happen next?
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
                This hub connects Project Brain, Code Pack, Deployment Pack,
                Readiness Gate, and Activity Audit into one operating flow.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadActionHub()}
              disabled={loadState === "loading"}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-white/10 px-4 text-xs font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadState === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Refresh Hub
                </>
              )}
            </button>
          </div>

          {error ? (
            <div className="mt-5 flex gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-6 text-red-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {project && readinessReport && deploymentPack && codePack ? (
            <>
              <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-950">
                      {getStageLabel(runtimeStage)}
                    </span>

                    <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-zinc-400 ring-1 ring-white/10">
                      {readinessReport.statusLabel}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getRiskClass(
                        deploymentPack.riskLevel,
                      )}`}
                    >
                      {deploymentPack.riskLevel} deploy risk
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-white">
                    {project.input}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    {getStageDescription(runtimeStage)}
                  </p>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Recommended Next Action
                    </p>

                    <p className="mt-3 text-sm leading-6 text-zinc-300">
                      {nextAction}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-zinc-400">Readiness</p>
                      <Gauge className="h-4 w-4 text-zinc-500" />
                    </div>

                    <p
                      className={`mt-4 text-4xl font-semibold ${getScoreClass(
                        readinessReport.overallScore,
                      )}`}
                    >
                      {readinessReport.overallScore}
                    </p>

                    <p className="mt-1 text-sm text-zinc-600">/100</p>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-zinc-400">Code Pack</p>
                      <Code2 className="h-4 w-4 text-zinc-500" />
                    </div>

                    <p className="mt-4 text-4xl font-semibold text-white">
                      {codePack.fileCount}
                    </p>

                    <p className="mt-1 text-sm text-zinc-600">files</p>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-zinc-400">Runtime</p>
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    </div>

                    <p className="mt-4 text-2xl font-semibold text-emerald-300">
                      Active
                    </p>

                    <p className="mt-1 text-sm text-zinc-600">
                      Project OS ready
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <ActionCard
                  href={getProjectHref(projectId, "/code")}
                  title="Code Pack"
                  description="Preview generated files and download the ZIP package."
                  meta={`${codePack.fileCount} generated files`}
                  icon={<Code2 className="h-5 w-5" />}
                  primary
                />

                <ActionCard
                  href={getProjectHref(projectId, "/deploy")}
                  title="Deploy Pack"
                  description="Review build commands, env vars, production checklist, and rollback plan."
                  meta={`${deploymentPack.riskLevel} deployment risk`}
                  icon={<Rocket className="h-5 w-5" />}
                />

                <ActionCard
                  href={getProjectHref(projectId, "/readiness")}
                  title="Readiness Gate"
                  description="Check product, architecture, security, delivery, and operations score."
                  meta={`${readinessReport.overallScore}/100 readiness`}
                  icon={<Gauge className="h-5 w-5" />}
                />

                <ActionCard
                  href="/activity"
                  title="Activity Audit"
                  description="View project events, exports, workspace activity, and runtime audit trail."
                  meta="Runtime monitoring"
                  icon={<Activity className="h-5 w-5" />}
                />
              </div>
            </>
          ) : null}

          {loadState === "loading" ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {["Code Pack", "Deploy Pack", "Readiness", "Activity"].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-3xl border border-white/10 bg-black/20 p-5"
                  >
                    <Brain className="h-5 w-5 text-zinc-600" />
                    <p className="mt-4 text-sm font-semibold text-zinc-400">
                      Loading {item}
                    </p>
                  </div>
                ),
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}