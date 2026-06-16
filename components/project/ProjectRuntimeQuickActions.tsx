import type { ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  Code2,
  Gauge,
  LayoutDashboard,
  Layers3,
  Rocket,
} from "lucide-react";

type ProjectRuntimeQuickActionsProps = {
  projectId: string;
};

function getProjectHref(projectId: string, suffix = ""): string {
  return `/project/${encodeURIComponent(projectId)}${suffix}`;
}

function NavLink({
  href,
  children,
  variant = "ghost",
}: {
  href: string;
  children: ReactNode;
  variant?: "ghost" | "solid";
}) {
  return (
    <Link
      href={href}
      className={
        variant === "solid"
          ? "inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-white px-4 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
          : "inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
      }
    >
      {children}
    </Link>
  );
}

export default function ProjectRuntimeQuickActions({
  projectId,
}: ProjectRuntimeQuickActionsProps) {
  return (
    <div className="sticky top-0 z-[90] border-b border-white/10 bg-zinc-950/90 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:px-6 lg:px-8">
      <nav
        aria-label="Project runtime quick actions"
        className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto whitespace-nowrap"
      >
        <NavLink href="/dashboard">
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </NavLink>

        <NavLink href={getProjectHref(projectId)}>
          <Layers3 className="h-4 w-4" />
          Project
        </NavLink>

        <NavLink href={getProjectHref(projectId, "/code")} variant="solid">
          <Code2 className="h-4 w-4" />
          Code Pack
        </NavLink>

        <NavLink href={getProjectHref(projectId, "/deploy")}>
          <Rocket className="h-4 w-4" />
          Deploy
        </NavLink>

        <NavLink href={getProjectHref(projectId, "/readiness")}>
          <Gauge className="h-4 w-4" />
          Readiness
        </NavLink>

        <NavLink href="/activity">
          <Activity className="h-4 w-4" />
          Activity
        </NavLink>
      </nav>
    </div>
  );
}