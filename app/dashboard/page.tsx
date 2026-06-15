"use client";

import { useState } from "react";
import { Brain, FileText, Network, ListChecks, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleGenerate() {
    if (!prompt.trim()) return;

    setLoading(true);
    setResult(null);

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
            Runtime Alpha 0.1
          </p>
          <h1 className="mt-3 text-4xl font-bold">DevCommander Dashboard</h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Enter one product idea. DevCommander generates Project Brain, PRD,
            Architecture and Tasks.
          </p>
        </div>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold">Create Product</h2>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-5 min-h-[140px] w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none placeholder:text-slate-500"
            placeholder="Example: I want to build a Burmese Worker AI assistant for migrant workers in Thailand..."
          />

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 disabled:opacity-60"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Generating..." : "Generate Product Brain"}
          </button>
        </section>

        {result && (
          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <ResultCard
              icon={Brain}
              title="Project Brain"
              content={JSON.stringify(result.brain, null, 2)}
            />

            <ResultCard
              icon={FileText}
              title="PRD"
              content={result.prd}
            />

            <ResultCard
              icon={Network}
              title="Architecture"
              content={result.architecture}
            />

            <ResultCard
              icon={ListChecks}
              title="Tasks"
              content={result.tasks.join("\n")}
            />
          </section>
        )}
      </div>
    </main>
  );
}

function ResultCard({
  icon: Icon,
  title,
  content
}: {
  icon: any;
  title: string;
  content: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 flex items-center gap-3">
        <Icon size={22} className="text-cyan-400" />
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>

      <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-900 p-4 text-sm leading-6 text-slate-300">
        {content}
      </pre>
    </div>
  );
}