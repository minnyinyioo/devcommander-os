const brainFiles = [
  "PROJECT_BRAIN.md",
  "VISION.md",
  "PRODUCT_PRINCIPLES.md",
  "TECH_STACK.md",
  "UI_SYSTEM.md",
  "ROADMAP.md",
  "TEAM_STRUCTURE.md",
  "DECISION_LOG.md"
];

export default function BrainPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
        Single Source of Truth
      </p>
      <h1 className="mt-2 text-4xl font-bold">Project Brain</h1>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {brainFiles.map((file) => (
          <div key={file} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="font-mono text-lg text-cyan-400">{file}</h2>
            <p className="mt-3 text-slate-400">
              Shared context for ChatGPT, Claude, Gemini, Cursor and future AI tools.
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
