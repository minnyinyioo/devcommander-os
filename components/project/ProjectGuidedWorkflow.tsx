import type { ReactNode } from "react";
import Link from "next/link";
import { Code2, Gauge, Rocket, Sparkles, Wrench } from "lucide-react";

type ProjectGuidedWorkflowProps = {
  projectId: string;
};

function getProjectHref(projectId: string, suffix = ""): string {
  return `/project/${encodeURIComponent(projectId)}${suffix}`;
}

type StageCardProps = {
  title: string;
  description: string;
  href: string;
  label: string;
  icon: ReactNode;
  primary?: boolean;
};

function StageCard({
  title,
  description,
  href,
  label,
  icon,
  primary = false,
}: StageCardProps) {
  return (
    <Link
      href={href}
      className={
        primary
          ? "rounded-3xl border border-white/20 bg-white p-5 text-zinc-950 transition hover:bg-zinc-200"
          : "rounded-3xl border border-white/10 bg-white/[0.035] p-5 text-white transition hover:border-white/20 hover:bg-white/[0.06]"
      }
    >
      <div
        className={
          primary
            ? "inline-flex rounded-2xl bg-zinc-950 p-3 text-white"
            : "inline-flex rounded-2xl bg-white/[0.06] p-3 text-zinc-300"
        }
      >
        {icon}
      </div>

      <p className={primary ? "mt-5 text-sm font-semibold text-zinc-950" : "mt-5 text-sm font-semibold text-white"}>
        {label}
      </p>

      <h3 className={primary ? "mt-2 text-xl font-semibold text-zinc-950" : "mt-2 text-xl font-semibold text-white"}>
        {title}
      </h3>

      <p className={primary ? "mt-3 text-sm leading-7 text-zinc-700" : "mt-3 text-sm leading-7 text-zinc-400"}>
        {description}
      </p>

      <p className={primary ? "mt-5 text-sm font-semibold text-zinc-800" : "mt-5 text-sm font-semibold text-zinc-200"}>
        Open →
      </p>
    </Link>
  );
}

export default function ProjectGuidedWorkflow({
  projectId,
}: ProjectGuidedWorkflowProps) {
  return (
    <section className="border-b border-white/10 bg-zinc-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/30 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-zinc-500">
                Guided Workflow
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Build a runnable product without getting lost
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
                DevCommander OS groups complex engineering tools into a simple flow:
                build code, fix risks, prepare launch, and operate the project.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 lg:w-[320px]">
              <div className="flex items-center gap-2 text-emerald-200">
                <Sparkles className="h-4 w-4" />
                <p className="text-sm font-semibold">Simple Mode First</p>
              </div>

              <p className="mt-2 text-sm leading-6 text-emerald-100/80">
                Users should always know the next step. Advanced tools stay grouped inside each stage.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StageCard
              href={getProjectHref(projectId, "/build")}
              label="Step 1"
              title="Build"
              description="Use AI Router and Code Pack to generate and export starter code."
              icon={<Code2 className="h-5 w-5" />}
              primary
            />

            <StageCard
              href={getProjectHref(projectId, "/fix")}
              label="Step 2"
              title="Fix"
              description="Run Tests and Readiness checks before treating the project as usable."
              icon={<Gauge className="h-5 w-5" />}
            />

            <StageCard
              href={getProjectHref(projectId, "/launch")}
              label="Step 3"
              title="Launch"
              description="Prepare deployment, environment variables, rollback, and launch events."
              icon={<Rocket className="h-5 w-5" />}
            />

            <StageCard
              href={getProjectHref(projectId, "/operate")}
              label="Step 4"
              title="Operate"
              description="Monitor health, use Ops Runbook, prepare handover, and review Activity."
              icon={<Wrench className="h-5 w-5" />}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
