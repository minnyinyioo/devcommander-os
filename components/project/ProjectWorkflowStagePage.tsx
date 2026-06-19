import Link from "next/link";

export type WorkflowStageModule = {
  title: string;
  description: string;
  href: string;
  status: "core" | "recommended" | "advanced";
};

type ProjectWorkflowStagePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  projectId: string;
  primaryActionLabel: string;
  primaryActionHref: string;
  modules: WorkflowStageModule[];
  nextStep?: {
    label: string;
    href: string;
  };
};

function statusClass(status: WorkflowStageModule["status"]): string {
  if (status === "core") {
    return "bg-white text-zinc-950";
  }

  if (status === "recommended") {
    return "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/20";
  }

  return "bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/20";
}

export default function ProjectWorkflowStagePage({
  eyebrow,
  title,
  description,
  projectId,
  primaryActionLabel,
  primaryActionHref,
  modules,
  nextStep,
}: ProjectWorkflowStagePageProps) {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href={`/project/${encodeURIComponent(projectId)}`}
          className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/[0.06] hover:text-white"
        >
          Back to Project
        </Link>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
            {eyebrow}
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {title}
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">
            {description}
          </p>

          <Link
            href={primaryActionHref}
            className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-200"
          >
            {primaryActionLabel}
          </Link>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          {modules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">
                  {module.title}
                </h2>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                    module.status,
                  )}`}
                >
                  {module.status}
                </span>
              </div>

              <p className="mt-3 text-sm leading-7 text-zinc-400">
                {module.description}
              </p>

              <p className="mt-5 text-sm font-semibold text-zinc-200">
                Open →
              </p>
            </Link>
          ))}
        </section>

        {nextStep ? (
          <section className="mt-6 rounded-[2rem] border border-emerald-500/20 bg-emerald-500/10 p-5">
            <p className="text-sm font-semibold text-emerald-200">
              Recommended next step
            </p>

            <Link
              href={nextStep.href}
              className="mt-3 inline-flex text-lg font-semibold text-emerald-50"
            >
              {nextStep.label} →
            </Link>
          </section>
        ) : null}
      </div>
    </main>
  );
}
