"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Clock3,
  Database,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import { listMyAuditEvents } from "@/lib/audit/audit-adapter";
import type { AuditEventRecord } from "@/lib/audit/audit-types";

type LoadState = "idle" | "loading" | "loaded" | "failed";

function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getEventBadgeClass(eventType: string): string {
  if (eventType.includes("error")) {
    return "bg-red-500/10 text-red-300 ring-red-400/20";
  }

  if (eventType.includes("warning")) {
    return "bg-amber-500/10 text-amber-300 ring-amber-400/20";
  }

  if (eventType.includes("workspace")) {
    return "bg-sky-500/10 text-sky-300 ring-sky-400/20";
  }

  if (eventType.includes("project")) {
    return "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20";
  }

  return "bg-zinc-800 text-zinc-400 ring-white/10";
}

export default function ActivityPanel() {
  const { user, loading: authLoading, configured } = useAuthSession();

  const [events, setEvents] = useState<AuditEventRecord[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [error, setError] = useState("");

  async function loadEvents() {
    setLoadState("loading");
    setError("");

    const result = await listMyAuditEvents({
      limit: 50,
    });

    if (!result.ok) {
      setEvents([]);
      setError(result.error ?? "Failed to load activity.");
      setLoadState("failed");
      return;
    }

    setEvents(result.data ?? []);
    setLoadState("loaded");
  }

  useEffect(() => {
    if (!configured || !user) return;

    void loadEvents();
  }, [configured, user?.id]);

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
                Runtime Monitoring
              </p>

              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Activity & Audit Trail
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">
                Track project, workspace and runtime events for enterprise
                monitoring, compliance and recovery workflows.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 lg:w-[320px]">
              <div className="flex items-center gap-2 text-emerald-200">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-sm font-semibold">RLS Protected</p>
              </div>

              <p className="mt-3 text-sm leading-6 text-emerald-100/80">
                Users can only access personal audit events or events in
                workspaces where they are active members.
              </p>
            </div>
          </div>
        </header>

        {!configured ? (
          <section className="mt-6 rounded-3xl border border-amber-500/20 bg-amber-500/10 p-6 text-sm leading-7 text-amber-100">
            Supabase is not configured. Activity monitoring requires authenticated
            cloud storage. Local runtime remains unaffected.
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
              Login is required to view audit activity.
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
          <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Recent Activity
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  Latest audit events available to your account.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadEvents()}
                disabled={loadState === "loading"}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadState === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </>
                )}
              </button>
            </div>

            {error ? (
              <div className="mt-5 flex gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-6 text-red-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <div className="mt-6 grid gap-4">
              {events.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
                  <Activity className="mx-auto h-8 w-8 text-zinc-600" />

                  <p className="mt-4 text-sm font-medium text-zinc-300">
                    No audit events yet.
                  </p>

                  <p className="mt-2 text-sm text-zinc-500">
                    Future project and workspace operations will appear here.
                  </p>
                </div>
              ) : (
                events.map((event) => (
                  <article
                    key={event.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-white/20 hover:bg-white/[0.04]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getEventBadgeClass(
                              event.eventType,
                            )}`}
                          >
                            {event.eventType}
                          </span>

                          <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-zinc-400 ring-1 ring-white/10">
                            {event.entityType}
                          </span>

                          {event.projectId ? (
                            <span className="rounded-full bg-white/[0.06] px-3 py-1 font-mono text-xs text-zinc-500 ring-1 ring-white/10">
                              project:{event.projectId.slice(0, 8)}
                            </span>
                          ) : null}
                        </div>

                        <h3 className="mt-4 text-base font-semibold text-white">
                          {event.message}
                        </h3>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-3.5 w-3.5" />
                            {formatDate(event.createdAt)}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <Database className="h-3.5 w-3.5" />
                            {event.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}