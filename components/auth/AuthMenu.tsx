"use client";

import Link from "next/link";
import { useState } from "react";
import { LogIn, LogOut, UserCircle, UserPlus } from "lucide-react";
import { useAuthSession } from "@/lib/auth/use-auth-session";

function shortenEmail(email: string): string {
  if (email.length <= 28) return email;

  const [name, domain] = email.split("@");

  if (!domain) return `${email.slice(0, 24)}...`;

  return `${name.slice(0, 12)}...@${domain}`;
}

export default function AuthMenu() {
  const { user, loading, configured, signOut } = useAuthSession();
  const [busy, setBusy] = useState(false);

  async function handleSignOut() {
    if (busy) return;

    setBusy(true);

    try {
      await signOut();
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <div className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200">
        Local Mode
      </div>
    );
  }

  if (loading) {
    return (
      <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-400">
        Checking session...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
        >
          <LogIn className="h-4 w-4" />
          Login
        </Link>

        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
        >
          <UserPlus className="h-4 w-4" />
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href="/me"
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
      >
        <UserCircle className="h-4 w-4" />
        {shortenEmail(user.email ?? "Account")}
      </Link>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-400 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <LogOut className="h-4 w-4" />
        {busy ? "Signing out" : "Sign out"}
      </button>
    </div>
  );
}