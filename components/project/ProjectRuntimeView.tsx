"use client";

import { useEffect, useMemo, useState } from "react";
import { Brain, FileText, Network, ListChecks, Download } from "lucide-react";

const tabs = [
  { key: "brain", label: "Brain", icon: Brain },
  { key: "prd", label: "PRD", icon: FileText },
  { key: "architecture", label: "Architecture", icon: Network },
  { key: "tasks", label: "Tasks", icon: ListChecks }
];

export function ProjectRuntimeView({ id }: { id: string }) {
  const [project, setProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("brain");

  useEffect(() => {
    const saved = localStorage.getItem(`devcommander-project-${id}`);
    if (saved) setProject(JSON.parse(saved));
  }, [id]);

  const content = useMemo(() => {
    if (!project) return "";

    if (activeTab === "brain") {
      return JSON.stringify(project.brain, null, 2);
    }

    if (activeTab === "prd") {
      return project.prd;
    }

    if (activeTab === "architecture") {
      return project.architecture;
    }

    if (activeTab === "tasks") {
      return project.tasks.join("\n");
    }

    return "";
  }, [project, activeTab]);

  function exportPack() {
    if (!project) return;

    const pack = `# DevCommander Export Pack

## Project ID
${project.projectId}

## Original Idea
${project.input}

---

## Project Brain
\`\`\`json
${JSON.stringify(project.brain, null, 2)}
\`\`\`

---

## PRD
${project.prd}

---

## Architecture
${project.architecture}

---

## Tasks
${project.tasks.map((task: string, index: number) => `${index + 1}. ${task}`).join("\n")}
`;

    const blob = new Blob([pack], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `devcommander-export-pack-${project.projectId}.md`;
    a.click();

    URL.revokeObjectURL(url);
  }

  if (!project) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-slate-400">
          No local project data found. Go back to Dashboard and generate a product.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">
            Generated Output
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Product Build Pack
          </h2>
        </div>

        <button
          onClick={exportPack}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950"
        >
          <Download size={18} />
          Export Pack
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                active
                  ? "border-cyan-400 bg-cyan-400 text-slate-950"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <pre className="mt-6 max-h-[560px] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-900 p-5 text-sm leading-7 text-slate-300">
        {content}
      </pre>
    </div>
  );
}