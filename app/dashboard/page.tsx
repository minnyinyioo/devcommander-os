"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  Clock3,
  Cloud,
  FileText,
  Home,
  LayoutDashboard,
  Loader2,
  RefreshCw,
  Rocket,
  Trash2,
} from "lucide-react";
import AuthMenu from "@/components/auth/AuthMenu";
import {
  deleteProjectRuntimeHybrid,
  saveProjectRuntimeHybrid,
} from "@/lib/project/storage-adapter";
import {
  mergeProjectLists,
  readCloudProjectList,
  readLocalProjectList,
  writeLocalRecentProjects,
} from "@/lib/project/project-list-adapter";
import type { ProjectListItem } from "@/lib/project/project-list-adapter";
import { isSupabaseConfigured } from "@/lib/supabase/browser-client";
import type { RuntimeSection } from "@/lib/project/project-runtime";

type GeneratedProject = {
  projectId: string;
  input: string;
  createdAt?: string;
  updatedAt?: string;
  status?: "generated" | "partial" | "missing";
  brain?: RuntimeSection;
  prd?: RuntimeSection;
  architecture?: RuntimeSection;
  tasks?: RuntimeSection;
  exportPack?: RuntimeSection;
};

type ProjectListLoadState = "idle" | "loading" | "loaded" | "failed";

const MAX_RECENT_PROJECTS = 10;

function formatDate(value?: string): string {
  if (!value) return "No date";

  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function normalizeGeneratedProject(data: GeneratedProject): GeneratedProject {
  return {
    projectId: data.projectId,
    input: data.input,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    status: data.status ?? "generated",
    brain: data.brain ?? null,
    prd: data.prd ?? null,
    architecture: data.architecture ?? null,
    tasks: data.tasks ?? null,
    exportPack: data.exportPack ?? null,
  };
}

function getSourceBadgeClass(source: ProjectListItem["source"]): string {
  if (source === "cloud") {
    return "bg-sky-500/10 text-sky-300 ring-sky-400/20";
  }

  if (source === "hybrid") {
    return "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20";
  }

  return "bg-zinc-800 text-zinc-400 ring-white/10";
}

function getSourceLabel(source: ProjectListItem["source"]): string {
  if (source === "cloud") return "Cloud";
  if (source === "hybrid") return "Hybrid";
  return "Local";
}

export default function DashboardPage() {
  const router = useRouter();
  const supabaseConfigured = isSupabaseConfigured();

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentProjects, setRecentProjects] = useState<ProjectListItem[]>([]);
  const [projectListState, setProjectListState] =
    useState<ProjectListLoadState>("idle");
  const [error, setError] = useState("");

  async function loadProjects() {
    setProjectListState("loading");

    try {
      const localProjects = readLocalProjectList();
      const cloudProjects = await readCloudProjectList();
      const mergedProjects = mergeProjectLists({
        localProjects,
        cloudProjects,
      });

      setRecentProjects(mergedProjects);
      writeLocalRecentProjects(mergedProjects);
      setProjectListState("loaded");
    } catch {
      const localProjects = readLocalProjectList();

      setRecentProjects(localProjects);
      setProjectListState("failed");
    }
  }

  useEffect(() => {
    void loadProjects();
  }, []);

  async function handleGenerate() {
    const input = prompt.trim();

    if (!input || loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      });

      const data = (await response.json()) as GeneratedProject & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Generation failed.");
      }

      if (!data.projectId || !data.input) {
        throw new Error("Generation response is missing required project data.");
      }

      const project = normalizeGeneratedProject(data);

      await saveProjectRuntimeHybrid(project);

      const newProjectItem: ProjectListItem = {
        projectId: project.projectId,
        input: project.input,
        createdAt: project.createdAt,
        source: "local",
      };

      const nextRecentProjects: ProjectListItem[] = [
        newProjectItem,
        ...recentProjects.filter(
          (recentProject) => recentProject.projectId !== project.projectId,
        ),
      ].slice(0, MAX_RECENT_PROJECTS);

      setRecentProjects(nextRecentProjects);
      writeLocalRecentProjects(nextRecentProjects);

      setPrompt("");
      router.push(`/project/${encodeURIComponent(project.projectId)}`);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Something went wrong while generating the project.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProject(projectId: string) {
    const nextProjects = recentProjects.filter(
      (project) => project.projectId !== projectId,
    );

    setRecentProjects(nextProjects);
    writeLocalRecentProjects(nextProjects);

    await deleteProjectRuntimeHybrid(projectId);
  }

  const localCount = recentProjects.filter(
    (project) => project.source === "local",
  ).length;

  const cloudCount = recentProjects.filter(
    (project) => project.source === "cloud",
  ).length;

  const hybridCount = recentProjects.filter(
    (project) => project.source === "hybrid",
  ).length;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(63,63,70,0.35),_transparent_35%),#09090b] px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-white/10 pb-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="flex w-full items-center justify-between gap-4 overflow-x-auto">
              <div className="flex min-w-max items-center gap-2">
                <Link
                  href="/"
                  className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-black/20 px-4 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
                >
                  <Home className="h-3.5 w-3.5" />
                  Back Home
                </Link>

                <span className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-black/20 px-4 text-xs font-medium text-zinc-300">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Runtime Alpha 0.9
                </span>

                <span
                  className={`inline-flex h-9 items-center whitespace-nowrap rounded-full px-4 text-xs font-semibold ring-1 ${
                    supabaseConfigured
                      ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20"
                      : "bg-amber-500/10 text-amber-200 ring-amber-400/20"
                  }`}
                >
                  {supabaseConfigured ? "Cloud Ready" : "Local Mode"}
                </span>
              </div>

              <div className="flex min-w-max items-center justify-end">
                <AuthMenu />
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
            <div>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                DevCommander OS Dashboard
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">
                Transform one product idea into Project Brain, Enterprise PRD,
                Architecture, Tasks, and Export Pack.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-zinc-400">Storage Mode</p>

                <button
                  type="button"
                  onClick={() => void loadProjects()}
                  disabled={projectListState === "loading"}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${
                      projectListState === "loading" ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </button>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-zinc-300">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <span className="flex items-center gap-3">
                    <Brain className="h-4 w-4 text-zinc-500" />
                    Local
                  </span>
                  <span className="text-zinc-400">{localCount}</span>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <span className="flex items-center gap-3">
                    <Cloud className="h-4 w-4 text-zinc-500" />
                    Cloud
                  </span>
                  <span className="text-zinc-400">{cloudCount}</span>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <span className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-zinc-500" />
                    Hybrid
                  </span>
                  <span className="text-zinc-400">{hybridCount}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 py-8 lg:grid-cols-[1fr_380px]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Generate Product
              </p>

              <h2 className="mt-3 text-2xl font-semibold text-white">
                What do you want to build?
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Enter one product idea. DevCommander OS will generate a complete
                runtime package.
              </p>
            </div>

            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Example: Build an AI operating system that turns one product idea into PRD, architecture, tasks, code, deployment and monitoring..."
              className="min-h-[220px] w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-white/25"
            />

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {projectListState === "failed" ? (
              <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                Cloud projects could not be loaded. LocalStorage fallback is
                still active.
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-zinc-500">
                Hybrid storage enabled: local-first, authenticated cloud-ready.
              </p>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={!prompt.trim() || loading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    Generate Product
                  </>
                )}
              </button>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm font-semibold text-white">Runtime Status</p>

            <div className="mt-5 grid gap-3">
              {[
                "Landing Page MVP",
                "Dashboard MVP",
                "Project Brain UI",
                "PRD Generator V2",
                "Architecture Generator V2",
                "Task Board UI",
                "Supabase Integration Base",
                "Authentication Base",
                "Cloud Project List",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                >
                  <span className="text-sm text-zinc-300">{item}</span>

                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                    Done
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="pb-10">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Recent Projects
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                Local and authenticated cloud projects are merged safely.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadProjects()}
              disabled={projectListState === "loading"}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  projectListState === "loading" ? "animate-spin" : ""
                }`}
              />
              Refresh Projects
            </button>
          </div>

          {recentProjects.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
              <p className="text-sm font-medium text-zinc-300">
                No generated projects yet.
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Generate your first product runtime from the input panel above.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {recentProjects.map((project) => (
                <div
                  key={project.projectId}
                  className="group rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/project/${encodeURIComponent(project.projectId)}`,
                        )
                      }
                      className="min-w-0 text-left"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getSourceBadgeClass(
                            project.source,
                          )}`}
                        >
                          {getSourceLabel(project.source)}
                        </span>

                        <span className="font-mono text-xs text-zinc-600">
                          {project.projectId}
                        </span>
                      </div>

                      <p className="mt-3 line-clamp-2 text-base font-semibold leading-7 text-white">
                        {project.input}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatDate(project.createdAt)}
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDeleteProject(project.projectId)}
                      className="inline-flex items-center justify-center rounded-full border border-white/10 p-2 text-zinc-500 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
                      aria-label="Delete project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}