"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Loader2,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import {
  createWorkspace,
  listMyWorkspaces,
} from "@/lib/workspace/workspace-adapter";
import type { WorkspaceRecord } from "@/lib/workspace/workspace-types";

type LoadState = "idle" | "loading" | "loaded" | "failed";
type CreateState = "idle" | "creating";

function formatDate(value?: string): string {
  if (!value) return "No date";

  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function roleBadgeClass(role: WorkspaceRecord["role"]): string {
  if (role === "owner") return "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20";
  if (role === "admin") return "bg-sky-500/10 text-sky-300 ring-sky-400/20";
  if (role === "editor") return "bg-amber-500/10 text-amber-300 ring-amber-400/20";

  return "bg-zinc-800 text-zinc-400 ring-white/10";
}

export default function WorkspacePanel() {
  const { user, loading: authLoading, configured } = useAuthSession();

  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [createState, setCreateState] = useState<CreateState>("idle");
  const [workspaceName, setWorkspaceName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadWorkspaces() {
    setLoadState("loading");
    setError("");

    const result = await listMyWorkspaces();

    if (!result.ok) {
      setWorkspaces([]);
      setError(result.error ?? "Failed to load workspaces.");
      setLoadState("failed");
      return;
    }

    setWorkspaces(result.data ?? []);
    setLoadState("loaded");
  }

  useEffect(() => {
    if (!configured || !user) return;

    void loadWorkspaces();
  }, [configured, user?.id]);

  async function handleCreateWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanName = workspaceName.trim();

    if (cleanName.length < 2 || cleanName.length > 80) {
      setError("Workspace name must be between 2 and 80 characters.");
      return;
    }

    setCreateState("creating");
    setError("");
    setNotice("");

    const result = await createWorkspace(cleanName);

    if (!result.ok) {
      setError(result.error ?? "Failed to create workspace.");
      setCreateState("idle");
      return;
    }

    setWorkspaceName("");
    setNotice("Workspace created successfully.");
    setCreateState("idle");

    await loadWorkspaces();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(63,63,70,0.35),_transparent_35%),#09090b] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            Home
          </Link>
        </div>

        <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-zinc-500">
                Team Workspace
              </p>

              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Workspace Foundation
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">
                Create authenticated workspaces for future team collaboration,
                role-based permissions, project ownership and enterprise audit trails.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 lg:w-[320px]">
              <div className="flex items-center gap-2 text-emerald-200">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-sm font-semibold">RLS Protected</p>
              </div>

              <p className="mt-3 text-sm leading-6 text-emerald-100/80">
                Workspace data is restricted to authenticated active members.
              </p>
            </div>
          </div>
        </header>

        {!configured ? (
          <section className="mt-6 rounded-3xl border border-amber-500/20 bg-amber-500/10 p-6 text-sm leading-7 text-amber-100">
            Supabase is not configured. Add .env.local values to enable workspace
            creation. Local project runtime remains unaffected.
          </section>
        ) : null}

        {authLoading ? (
          <section className="mt-6 flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking account session...
          </section>
        ) : null}

        {!authLoading && configured && !user ? (
          <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm leading-7 text-zinc-300">
              Login is required to create and manage workspaces.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                Register
              </Link>
            </div>
          </section>
        ) : null}

        {!authLoading && user ? (
          <section className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
            <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-zinc-300" />
                <h2 className="text-xl font-semibold text-white">
                  Create Workspace
                </h2>
              </div>

              <p className="mt-3 text-sm leading-7 text-zinc-400">
                Start with a personal or team workspace. Member invitation comes
                in the next milestone.
              </p>

              <form onSubmit={handleCreateWorkspace} className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-zinc-300">
                    Workspace name
                  </span>

                  <input
                    value={workspaceName}
                    onChange={(event) => setWorkspaceName(event.target.value)}
                    placeholder="Example: DevCommander Core Team"
                    maxLength={80}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/25"
                  />
                </label>

                {error ? (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-6 text-red-200">
                    {error}
                  </div>
                ) : null}

                {notice ? (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-200">
                    {notice}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={createState === "creating"}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {createState === "creating" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Workspace
                    </>
                  )}
                </button>
              </form>
            </aside>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    My Workspaces
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Workspaces where your account is an active member.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void loadWorkspaces()}
                  disabled={loadState === "loading"}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadState === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading
                    </>
                  ) : (
                    "Refresh"
                  )}
                </button>
              </div>

              <div className="mt-6 grid gap-4">
                {workspaces.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
                    <Users className="mx-auto h-8 w-8 text-zinc-600" />

                    <p className="mt-4 text-sm font-medium text-zinc-300">
                      No workspace yet.
                    </p>

                    <p className="mt-2 text-sm text-zinc-500">
                      Create your first workspace to prepare team collaboration.
                    </p>
                  </div>
                ) : (
                  workspaces.map((workspace) => (
                    <article
                      key={workspace.id}
                      className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-white/20 hover:bg-white/[0.04]"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ring-1 ${roleBadgeClass(
                                workspace.role,
                              )}`}
                            >
                              {workspace.role}
                            </span>

                            <span className="rounded-full bg-white/[0.06] px-3 py-1 font-mono text-xs text-zinc-500 ring-1 ring-white/10">
                              {workspace.slug}
                            </span>
                          </div>

                          <h3 className="mt-4 text-lg font-semibold text-white">
                            {workspace.name}
                          </h3>

                          <p className="mt-2 text-sm text-zinc-500">
                            Created {formatDate(workspace.createdAt)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          Active
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}