import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-white/10 p-6">
          <h1 className="text-xl font-bold">DevCommander OS</h1>
          <nav className="mt-8 space-y-3 text-slate-300">
            {["Projects", "Project Brain", "PRD", "Architecture", "Tasks", "Code", "Deploy", "Memory", "Settings"].map(
              (item) => (
                <div key={item} className="rounded-xl px-3 py-2 hover:bg-white/10">
                  {item}
                </div>
              )
            )}
          </nav>
        </aside>

        <section className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
                Runtime Alpha 0.1
              </p>
              <h2 className="mt-2 text-4xl font-bold">Dashboard</h2>
            </div>
            <Link href="/" className="rounded-xl border border-white/10 px-4 py-2">
              Home
            </Link>
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-semibold">Create Product</h3>
            <p className="mt-2 text-slate-400">
              Enter one sentence. DevCommander creates Project Brain, PRD,
              Architecture and Tasks.
            </p>

            <form className="mt-6 flex gap-3">
              <input
                className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
                placeholder="I want to build a Burmese Worker AI assistant..."
              />
              <button className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950">
                Generate
              </button>
            </form>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {["Project Brain", "AI Runtime", "Deploy Status"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm text-cyan-400">ONLINE</p>
                <h3 className="mt-2 text-xl font-semibold">{item}</h3>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
