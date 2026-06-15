"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  buildProjectMarkdown,
  copyToClipboard,
  downloadTextFile,
  loadProjectRuntime,
  ProjectRuntimeArtifact,
  RuntimeSection,
  sectionToText,
} from "@/lib/project/project-runtime";
import TaskBoard from "@/components/project/TaskBoard";

type ProjectRuntimeClientProps = {
  projectId: string;
};

type RuntimeTab = "brain" | "prd" | "architecture" | "tasks" | "export";

const tabs: Array<{ id: RuntimeTab; label: string; description: string }> = [
  {
    id: "brain",
    label: "Project Brain",
    description: "Shared memory, product context, decisions, principles.",
  },
  {
    id: "prd",
    label: "PRD",
    description: "Product requirements, users, scope, acceptance criteria.",
  },
  {
    id: "architecture",
    label: "Architecture",
    description: "System design, data flow, modules, security boundaries.",
  },
  {
    id: "tasks",
    label: "Tasks",
    description: "Execution-ready engineering task board.",
  },
  {
    id: "export",
    label: "Export Pack",
    description: "Markdown handoff package for development, review, or archive.",
  },
];

function hasContent(section: RuntimeSection): boolean {
  return sectionToText(section).trim().length > 0;
}

function StatusBadge({ ready }: { ready: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        ready
          ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/20"
          : "bg-zinc-800 text-zinc-400 ring-1 ring-white/10"
      }`}
    >
      {ready ? "Ready" : "Pending"}
    </span>
  );
}

function RuntimeMetric({
  label,
  value,
  ready,
}: {
  label: string;
  value: string;
  ready: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-400">{label}</p>
        <StatusBadge ready={ready} />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</p>
    </div>
  );
}

function EmptySection({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-950/50 p-8 text-center">
      <p className="text-sm font-medium text-zinc-300">{title} is not generated yet.</p>
      <p className="mt-2 text-sm text-zinc-500">
        The runtime shell is ready. This section will connect to Generator V2 or Supabase storage in the next phase.
      </p>
    </div>
  );
}

function SectionRenderer({ title, section }: { title: string; section: RuntimeSection }) {
  const text = sectionToText(section);

  if (!text.trim()) {
    return <EmptySection title={title} />;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5 shadow-2xl shadow-black/20">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <StatusBadge ready />
      </div>

      <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap rounded-xl bg-black/40 p-4 text-sm leading-7 text-zinc-200 ring-1 ring-white/10">
        {text}
      </pre>
    </div>
  );
}

export default function ProjectRuntimeClient({ projectId }: ProjectRuntimeClientProps) {
  const [project, setProject] = useState<ProjectRuntimeArtifact | null>(null);
  const [activeTab, setActiveTab] = useState<RuntimeTab>("brain");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    setProject(loadProjectRuntime(projectId));
  }, [projectId]);

  const markdown = useMemo(() => {
    if (!project) return "";

    return buildProjectMarkdown(project);
  }, [project]);

  const readiness = useMemo(() => {
    if (!project) {
      return {
        brain: false,
        prd: false,
        architecture: false,
        tasks: false,
        export: false,
      };
    }

    return {
      brain: hasContent(project.brain),
      prd: hasContent(project.prd),
      architecture: hasContent(project.architecture),
      tasks: hasContent(project.tasks),
      export: true,
    };
  }, [project]);

  async function handleCopyExport() {
    const copied = await copyToClipboard(markdown);
    setCopyState(copied ? "copied" : "failed");

    window.setTimeout(() => {
      setCopyState("idle");
    }, 1800);
  }

  function handleDownloadExport() {
    downloadTextFile(`devcommander-${projectId}-runtime-export.md`, markdown);
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <p className="text-sm text-zinc-400">Loading Project Runtime...</p>
          </div>
        </div>
      </main>
    );
  }

  const activeTabConfig = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(63,63,70,0.35),_transparent_35%),#09090b] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
            >
              ← Back to Dashboard
            </Link>

            <div className="mt-8">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">
                DevCommander OS Runtime
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Project Brain Console
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">
                {project.input}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 lg:min-w-[320px]">
            <p className="text-sm text-zinc-400">Project ID</p>
            <p className="mt-2 break-all font-mono text-sm text-zinc-200">{project.projectId}</p>

            <div className="mt-5 grid gap-3 text-sm text-zinc-400">
              <div className="flex justify-between gap-4">
                <span>Status</span>
                <span className="font-medium text-zinc-200">{project.status ?? "generated"}</span>
              </div>
              {project.createdAt ? (
                <div className="flex justify-between gap-4">
                  <span>Created</span>
                  <span className="font-medium text-zinc-200">{project.createdAt}</span>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <section className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          <RuntimeMetric label="Shared Brain" value={readiness.brain ? "01" : "00"} ready={readiness.brain} />
          <RuntimeMetric label="PRD" value={readiness.prd ? "01" : "00"} ready={readiness.prd} />
          <RuntimeMetric
            label="Architecture"
            value={readiness.architecture ? "01" : "00"}
            ready={readiness.architecture}
          />
          <RuntimeMetric label="Tasks" value={readiness.tasks ? "01" : "00"} ready={readiness.tasks} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-3xl border border-white/10 bg-white/[0.03] p-3">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              const ready = readiness[tab.id];

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`mb-2 w-full rounded-2xl p-4 text-left transition ${
                    isActive
                      ? "bg-white text-zinc-950"
                      : "text-zinc-300 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">{tab.label}</span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        ready ? "bg-emerald-400" : isActive ? "bg-zinc-400" : "bg-zinc-700"
                      }`}
                    />
                  </div>
                  <p className={`mt-2 text-xs leading-5 ${isActive ? "text-zinc-600" : "text-zinc-500"}`}>
                    {tab.description}
                  </p>
                </button>
              );
            })}
          </aside>

          <div>
            <div className="mb-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm font-semibold text-white">{activeTabConfig.label}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{activeTabConfig.description}</p>
            </div>

            {activeTab === "brain" ? <SectionRenderer title="Project Brain" section={project.brain} /> : null}
            {activeTab === "prd" ? <SectionRenderer title="PRD" section={project.prd} /> : null}
            {activeTab === "architecture" ? (
              <SectionRenderer title="Architecture" section={project.architecture} />
            ) : null}
            {activeTab === "tasks" ? <TaskBoard section={project.tasks} /> : null}

            {activeTab === "export" ? (
              <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5 shadow-2xl shadow-black/20">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Export Pack</h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      Copy or download the current project runtime package as Markdown.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleCopyExport}
                      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                    >
                      {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy Failed" : "Copy Markdown"}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadExport}
                      className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.05]"
                    >
                      Download
                    </button>
                  </div>
                </div>

                <pre className="mt-5 max-h-[560px] overflow-auto whitespace-pre-wrap rounded-xl bg-black/40 p-4 text-sm leading-7 text-zinc-200 ring-1 ring-white/10">
                  {markdown}
                </pre>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}