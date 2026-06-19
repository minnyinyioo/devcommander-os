import Link from "next/link";
import {
  Code2,
  Gauge,
  LayoutDashboard,
  Layers3,
  Rocket,
  Wrench,
} from "lucide-react";

export type ProjectRuntimeModule =
  | "project"
  | "build"
  | "fix"
  | "launch"
  | "operate"
  | "router"
  | "code"
  | "tests"
  | "readiness"
  | "deploy"
  | "monitor"
  | "ops"
  | "handover"
  | "activity";

type ProjectRuntimeQuickActionsProps = {
  projectId: string;
  activeModule?: ProjectRuntimeModule;
};

function getProjectHref(projectId: string, suffix = ""): string {
  return `/project/${encodeURIComponent(projectId)}${suffix}`;
}

function linkClass(active: boolean): string {
  return active
    ? "inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-white px-4 text-xs font-semibold text-zinc-950 shadow-lg shadow-black/20 transition hover:bg-zinc-200"
    : "inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white";
}

function isBuild(activeModule: ProjectRuntimeModule): boolean {
  return activeModule === "build" || activeModule === "router" || activeModule === "code";
}

function isFix(activeModule: ProjectRuntimeModule): boolean {
  return activeModule === "fix" || activeModule === "tests" || activeModule === "readiness";
}

function isLaunch(activeModule: ProjectRuntimeModule): boolean {
  return activeModule === "launch" || activeModule === "deploy";
}

function isOperate(activeModule: ProjectRuntimeModule): boolean {
  return (
    activeModule === "operate" ||
    activeModule === "monitor" ||
    activeModule === "ops" ||
    activeModule === "handover" ||
    activeModule === "activity"
  );
}

export default function ProjectRuntimeQuickActions({
  projectId,
  activeModule = "project",
}: ProjectRuntimeQuickActionsProps) {
  return (
    <div className="sticky top-0 z-[90] border-b border-white/10 bg-zinc-950/90 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:px-6 lg:px-8">
      <nav
        aria-label="DevCommander project workflow navigation"
        className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto whitespace-nowrap"
      >
        <Link href="/dashboard" className={linkClass(false)}>
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>

        <Link
          href={getProjectHref(projectId)}
          className={linkClass(activeModule === "project")}
        >
          <Layers3 className="h-4 w-4" />
          Project
        </Link>

        <Link
          href={getProjectHref(projectId, "/build")}
          className={linkClass(isBuild(activeModule))}
        >
          <Code2 className="h-4 w-4" />
          Build
        </Link>

        <Link
          href={getProjectHref(projectId, "/fix")}
          className={linkClass(isFix(activeModule))}
        >
          <Gauge className="h-4 w-4" />
          Fix
        </Link>

        <Link
          href={getProjectHref(projectId, "/launch")}
          className={linkClass(isLaunch(activeModule))}
        >
          <Rocket className="h-4 w-4" />
          Launch
        </Link>

        <Link
          href={getProjectHref(projectId, "/operate")}
          className={linkClass(isOperate(activeModule))}
        >
          <Wrench className="h-4 w-4" />
          Operate
        </Link>
      </nav>
    </div>
  );
}
