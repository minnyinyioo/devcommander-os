import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Code2,
  Compass,
  Rocket,
  ShieldCheck,
} from "lucide-react";

type ProjectBeginnerGuideProps = {
  projectId: string;
};

function projectHref(projectId: string, suffix = ""): string {
  return `/project/${encodeURIComponent(projectId)}${suffix}`;
}

type GuideCardProps = {
  title: string;
  description: string;
  href?: string;
  action?: string;
};

function GuideCard({
  title,
  description,
  href,
  action = "Open",
}: GuideCardProps) {
  const content = (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5 transition hover:border-white/20 hover:bg-white/[0.05]">
      <h3 className="text-base font-semibold text-white">{title}</h3>

      <p className="mt-3 text-sm leading-7 text-zinc-400">
        {description}
      </p>

      {href ? (
        <p className="mt-4 text-sm font-semibold text-zinc-200">
          {action} →
        </p>
      ) : null}
    </div>
  );

  if (!href) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
}

export default function ProjectBeginnerGuide({
  projectId,
}: ProjectBeginnerGuideProps) {
  return (
    <section className="border-b border-white/10 bg-zinc-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/30 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                <Compass className="h-3.5 w-3.5" />
                Beginner Mode
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                You do not need to understand every module.
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
                DevCommander OS is designed to help users move from idea to runnable product.
                Start with Build, check the result in Fix, prepare deployment in Launch,
                then use Operate when the project needs monitoring or handover.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 lg:w-[340px]">
              <p className="text-sm font-semibold text-white">
                Simple rule
              </p>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Do not open every tool. Follow the next recommended step until
                the project can build, run, deploy, and be maintained.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <GuideCard
              title="1. Build first"
              description="Generate or review the code package. This is where the idea starts becoming files users can download and run."
              href={projectHref(projectId, "/build")}
              action="Go to Build"
            />

            <GuideCard
              title="2. Fix before launch"
              description="Use tests and readiness checks before treating generated code as safe or usable. This prevents fake progress."
              href={projectHref(projectId, "/fix")}
              action="Go to Fix"
            />

            <GuideCard
              title="3. Launch only when ready"
              description="Deployment should happen after environment variables, build checks, rollback, and operational risks are clear."
              href={projectHref(projectId, "/launch")}
              action="Go to Launch"
            />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-2 text-zinc-200">
                <Code2 className="h-4 w-4" />
                <h3 className="text-sm font-semibold">For beginners</h3>
              </div>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                Follow the buttons in order. Do not worry about AI Router, PRD,
                architecture, or deployment terms at the beginning.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-2 text-zinc-200">
                <ShieldCheck className="h-4 w-4" />
                <h3 className="text-sm font-semibold">For professionals</h3>
              </div>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                Use the grouped advanced tools inside each stage when you need
                deeper control, validation, or handoff documentation.
              </p>
            </div>

            <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5">
              <div className="flex items-center gap-2 text-amber-200">
                <AlertTriangle className="h-4 w-4" />
                <h3 className="text-sm font-semibold">Common mistake</h3>
              </div>
              <p className="mt-3 text-sm leading-7 text-amber-100/80">
                Do not assume generated code is finished until it builds,
                passes readiness checks, and has a clear launch plan.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5">
            <div className="flex items-center gap-2 text-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              <h3 className="text-sm font-semibold">Success definition</h3>
            </div>

            <p className="mt-3 text-sm leading-7 text-emerald-100/80">
              A project is not successful because it has many pages. It is successful
              when the user can understand the next step, generate usable output,
              test it, deploy it, and recover from errors.
            </p>

            <Link
              href={projectHref(projectId, "/operate")}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-50"
            >
              Go to Operate
              <Rocket className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
