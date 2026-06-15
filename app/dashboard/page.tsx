"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  Clock3,
  FileText,
  LayoutDashboard,
  Loader2,
  Rocket,
  Trash2,
} from "lucide-react";

type RecentProject = {
  projectId: string;
  input: string;
  createdAt?: string;
};

type GeneratedProject = {
  projectId: string;
  input: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  brain?: unknown;
  prd?: unknown;
  architecture?: unknown;
  tasks?: unknown;
  exportPack?: unknown;
};

const RECENT_PROJECTS_KEY = "devcommander-recent-projects";

function formatDate(value?: string) {
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

function saveGeneratedProject(project: GeneratedProject) {
  window.localStorage.setItem(
    `devcommander-project-${project.projectId}`,
    JSON.stringify(project),
  );

  window.localStorage.setItem(
    `devcommander-os-project-${project.projectId}`,
    JSON.stringify(project),
  );
}

function readRecentProjects(): RecentProject[] {
  const saved = window.localStorage.getItem(RECENT_PROJECTS_KEY);

  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved) as unknown;

    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is RecentProject => {
      return (
        typeof item === "object" &&
        item !== null &&
        "projectId" in item &&
        "input" in item &&
        typeof item.projectId === "string" &&
        typeof item.input === "string"
      );
    });
  } catch {
    return [];
  }
}

function writeRecentProjects(projects: RecentProject[]) {
  window.localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(projects));
}

export default function DashboardPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setRecentProjects(readRecentProjects());
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

      if (!data.projectId) {
        throw new Error("Generation response did not include a project ID.");
      }

      saveGeneratedProject(data);

      const nextRecentProjects: RecentProject[] = [
        {
          projectId: data.projectId,
          input: data.input,
          createdAt: data.createdAt,
        },
        ...recentProjects.filter((project) => project.projectId !== data.projectId),
      ].slice(0, 10);

      setRecentProjects(nextRecentProjects);
      writeRecentProjects(nextRecentProjects);

      setPrompt("");
      router.push(`/project/${encodeURIComponent(data.projectId)}`);
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

  function handleDeleteProject(projectId: string) {
    const nextProjects = recentProjects.filter(
      (project) => project.projectId !== projectId,
    );

    window.localStorage.removeItem(`devcommander-project-${projectId}`);
    window.localStorage.removeItem(`devcommander-os-project-${projectId}`);

    setRecentProjects(nextProjects);
    writeRecentProjects(nextProjects);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(63,63,70,0.35),_transparent_35%),#09090b] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300">
              <LayoutDashboard className="h-4 w-4" />
              Runtime Alpha 0.4
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              DevCommander OS Dashboard
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">
              Transform one product idea into Project Brain, Enterprise PRD,
              Architecture, Tasks, and Export Pack.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 lg:w-[320px]">
            <p className="text-sm text-zinc-400">Runtime Flow</p>
            <div className="mt-4 grid gap-3 text-sm text-zinc-300">
              <div className="flex items-center gap-3">
                <Brain className="h-4 w-4 text-zinc-500" />
                Project Brain
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-zinc-500" />
                PRD V2
              </div>
              <div className="flex items-center gap-3">
                <Rocket className="h-4 w-4 text-zinc-500" />
                Architecture → Tasks → Export
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

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-zinc-500">
                Local runtime storage now saves the full project artifact.
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
                "Project Runtime MVP",
                "Project Brain UI",
                "PRD Generator V2",
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
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Recent Projects</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Stored locally for runtime-alpha. Supabase persistence comes next.
              </p>
            </div>
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
                        router.push(`/project/${encodeURIComponent(project.projectId)}`)
                      }
                      className="min-w-0 text-left"
                    >
                      <p className="line-clamp-2 text-base font-semibold leading-7 text-white">
                        {project.input}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatDate(project.createdAt)}
                        </span>
                        <span className="font-mono">{project.projectId}</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteProject(project.projectId)}
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