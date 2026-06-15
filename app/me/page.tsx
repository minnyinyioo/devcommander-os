"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Cloud,
  Loader2,
  LogOut,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import { syncLocalProjectsAfterAuth } from "@/lib/auth/sync-local-projects";

type SyncState = "idle" | "syncing" | "done" | "failed";

export default function MePage() {
  const { user, loading, configured, signOut } = useAuthSession();
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [syncMessage, setSyncMessage] = useState("");

  async function handleSync() {
    setSyncState("syncing");
    setSyncMessage("");

    try {
      const result = await syncLocalProjectsAfterAuth();

      setSyncState("done");
      setSyncMessage(
        result.skipped
          ? "No local projects found to sync."
          : `Sync complete. Synced ${result.synced}/${result.attempted} project(s).`,
      );
    } catch {
      setSyncState("failed");
      setSyncMessage("Sync failed. LocalStorage fallback is still safe.");
    }
  }

  async function handleSignOut() {
    await signOut();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(63,63,70,0.35),_transparent_35%),#09090b] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
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

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="flex items-center gap-3">
            <UserCircle className="h-8 w-8 text-zinc-300" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Account
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
                DevCommander Workspace
              </h1>
            </div>
          </div>

          {!configured ? (
            <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-5 text-sm leading-7 text-amber-100">
              Supabase is not configured. You are currently in LocalStorage-only
              mode. Add values to .env.local to enable authentication.
            </div>
          ) : null}

          {loading ? (
            <div className="mt-8 flex items-center gap-3 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading account...
            </div>
          ) : null}

          {!loading && configured && !user ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm leading-7 text-zinc-300">
                You are not logged in. Login or register to enable authenticated
                cloud persistence.
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
            </div>
          ) : null}

          {!loading && user ? (
            <div className="mt-8 grid gap-5">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-zinc-500">Email</p>
                <p className="mt-2 break-all text-base font-medium text-white">
                  {user.email}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-zinc-500">User ID</p>
                <p className="mt-2 break-all font-mono text-xs leading-6 text-zinc-300">
                  {user.id}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                  <div className="flex items-center gap-2 text-emerald-200">
                    <ShieldCheck className="h-4 w-4" />
                    <p className="text-sm font-semibold">RLS Ready</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-emerald-100/80">
                    Cloud project access is protected by authenticated user ownership.
                  </p>
                </div>

                <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-5">
                  <div className="flex items-center gap-2 text-sky-200">
                    <Cloud className="h-4 w-4" />
                    <p className="text-sm font-semibold">Hybrid Storage</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-sky-100/80">
                    LocalStorage remains active while Supabase cloud save is enabled.
                  </p>
                </div>
              </div>

              {syncMessage ? (
                <div
                  className={`rounded-2xl border p-4 text-sm leading-6 ${
                    syncState === "failed"
                      ? "border-red-500/20 bg-red-500/10 text-red-200"
                      : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                  }`}
                >
                  {syncMessage}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSync}
                  disabled={syncState === "syncing"}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {syncState === "syncing" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Syncing
                    </>
                  ) : (
                    <>
                      <Cloud className="h-4 w-4" />
                      Sync Local Projects
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}