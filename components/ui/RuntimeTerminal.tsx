export function RuntimeTerminal() {
  const lines = [
    "> initializing project brain...",
    "✓ context memory loaded",
    "✓ PRD engine ready",
    "✓ architecture engine ready",
    "✓ change protection active",
    "✓ scope guardian locked",
    "✓ verification engine passed",
    "✓ export pack ready",
    "> status: buildable product plan generated"
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 font-mono shadow-2xl">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
        <span className="h-3 w-3 rounded-full bg-green-400" />
        <span className="ml-3 text-xs text-slate-500">
          devcommander-runtime
        </span>
      </div>

      <div className="space-y-2 text-xs leading-6 text-slate-300 md:text-sm">
        {lines.map((line) => (
          <p
            key={line}
            className={line.startsWith("✓") ? "text-brandCyan" : "text-slate-300"}
          >
            {line}
          </p>
        ))}
        <span className="inline-block h-4 w-2 animate-blink bg-brandCyan align-middle" />
      </div>
    </div>
  );
}