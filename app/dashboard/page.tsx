"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  Clock3,
  FileText,
  LayoutDashboard,
  Loader2,
  Rocket
} from "lucide-react";

type RecentProject = {
  projectId: string;
  input: string;
  createdAt?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("devcommander-recent-projects");
    if (saved) {
      setRecentProjects(JSON.parse(saved));
    }
  }, []);

  async function handleGenerate() {
    if (!prompt.trim()) return;

    setLoading(true);

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    const project = {
      ...data,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(
      `devcommander-project-${data.projectId}`,
      JSON.stringify(project)
    );

    const nextRecent = [
      {
        projectId: data.projectId,
        input: prompt,
        createdAt: project.createdAt
      },
      ...recentProjects
    ].slice(0, 8);

    localStorage.setItem(
      "devcommander-recent-projects",
      JSON.stringify(nextRecent)
    );

    setRecentProjects(nextRecent);
    setLoading(false);
    router.push(`/project/${data.projectId}`);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
              Runtime Alpha 0.1
            </p>

            <h1 className="mt-3 text-4xl font-bold md:text-6xl">
              DevCommander Dashboard
            </h1>

            <p className="mt-4 max-w-2xl text-slate-400">
              Enter one idea. DevCommander generates Project Brain, PRD,
              Architecture, Tasks and an exportable handoff pack.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">Runtime Status</p>
            <p className="mt-1 font-semibold text-cyan-400">ONLINE</p>
          </div>
        </div>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <Rocket className="text-cyan-400" size={24} />
            <h2 className="text-2xl font-semibold">Create Product</h2>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-5 min-h-[160px] w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none placeholder:text-slate-500"
            placeholder="Example: I want to build a Burmese Worker AI assistant for migrant workers in Thailand..."
          />

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 disabled:opacity-60"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Generating..." : "Generate Product"}
          </button>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-6 md:grid-cols-3">
            <StatCard
              icon={Brain}
              title="Project Brain"
              value="Active"
              description="Single source of truth"
            />
            <StatCard
              icon={FileText}
              title="Build Pack"
              value="Ready"
              description="PRD, Architecture, Tasks"
            />
            <StatCard
              icon={LayoutDashboard}
              title="Runtime"
              value="Alpha"
              description="Local generation enabled"
            />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex items-center gap-3">
              <Clock3 size={20} className="text-cyan-400" />
              <h2 className="text-xl font-semibold">Recent Projects</h2>
            </div>

            {recentProjects.length === 0 ? (
              <p className="text-sm text-slate-400">
                No projects yet. Generate your first product.
              </p>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <button
                    key={project.projectId}
                    onClick={() => router.push(`/project/${project.projectId}`)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-left transition hover:border-cyan-400/60"
                  >
                    <p className="line-clamp-2 text-sm font-medium text-white">
                      {project.input}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {project.projectId.slice(0, 8)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  description
}: {
  icon: any;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <Icon size={24} className="text-cyan-400" />
      <p className="mt-4 text-sm text-slate-400">{title}</p>
      <h3 className="mt-2 text-2xl font-bold">{value}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}