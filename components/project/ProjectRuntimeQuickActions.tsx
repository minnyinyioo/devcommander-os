import type { ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  Bot,
  Code2,
  FlaskConical,
  Gauge,
  LayoutDashboard,
  Layers3,
  Rocket,
} from "lucide-react";

export type ProjectRuntimeModule =
  | "project"
  | "router"
  | "code"
  | "tests"
  | "readiness"
  | "deploy"
  | "activity";

type ProjectRuntimeQuickActionsProps = {
  projectId: string;
  activeModule?: ProjectRuntimeModule;
};

function getProjectHref(projectId: string, suffix = ""): string {
  return `/project/${encodeURIComponent(projectId)}${suffix}`;
}

function NavLink({
  href,
  children,
  active = false,
}: {
  href: string;
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-white px-4 text-xs font-semibold text-zinc-950 shadow-lg shadow-black/20 transition hover:bg-zinc-200"
          : "inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
      }
    >
      {children}
    </Link>
  );
}

export default function ProjectRuntimeQuickActions({
  projectId,
  activeModule = "project",
}: ProjectRuntimeQuickActionsProps) {
  return (
    <div className="sticky top-0 z-[90] border-b border-white/10 bg-zinc-950/90 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:px-6 lg:px-8">
      <nav
        aria-label="Project runtime module navigation"
        className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto whitespace-nowrap"
      >
        <NavLink href="/dashboard">
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </NavLink>

        <NavLink
          href={getProjectHref(projectId)}
          active={activeModule === "project"}
        >
          <Layers3 className="h-4 w-4" />
          Project
        </NavLink>

        <NavLink
          href={getProjectHref(projectId, "/router")}
          active={activeModule === "router"}
        >
          <Bot className="h-4 w-4" />
          AI Router
        </NavLink>

        <NavLink
          href={getProjectHref(projectId, "/code")}
          active={activeModule === "code"}
        >
          <Code2 className="h-4 w-4" />
          Code Pack
        </NavLink>

        <NavLink
          href={getProjectHref(projectId, "/tests")}
          active={activeModule === "tests"}
        >
          <FlaskConical className="h-4 w-4" />
          Tests
        </NavLink>

        <NavLink
          href={getProjectHref(projectId, "/readiness")}
          active={activeModule === "readiness"}
        >
          <Gauge className="h-4 w-4" />
          Readiness
        </NavLink>

        <NavLink
          href={getProjectHref(projectId, "/deploy")}
          active={activeModule === "deploy"}
        >
          <Rocket className="h-4 w-4" />
          Deploy
        </NavLink>

        <NavLink href="/activity" active={activeModule === "activity"}>
          <Activity className="h-4 w-4" />
          Activity
        </NavLink>
      </nav>
    </div>
  );
}