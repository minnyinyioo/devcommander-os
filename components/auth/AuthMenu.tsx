"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Building2,
  LogIn,
  LogOut,
  UserCircle,
  UserPlus,
} from "lucide-react";
import { useAuthSession } from "@/lib/auth/use-auth-session";

function shortenEmail(email: string): string {
  if (email.length <= 24) return email;

  const [name, domain] = email.split("@");

  if (!domain) return `${email.slice(0, 21)}...`;

  return `${name.slice(0, 10)}...@${domain}`;
}

function NavPill({
  href,
  children,
  variant = "ghost",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "ghost" | "solid";
}) {
  return (
    <Link
      href={href}
      className={
        variant === "solid"
          ? "inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full bg-white px-4 text-xs font-semibold text-zinc-950 shadow-sm transition hover:bg-zinc-200"
          : "inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
      }
    >
      {children}
    </Link>
  );
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

  if (loading && configured) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto">
        <NavPill href="/workspace">
          <Building2 className="h-3.5 w-3.5" />
          Workspace
        </NavPill>

        <span className="inline-flex h-9 items-center whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs text-zinc-400">
          Checking session...
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto">
        <NavPill href="/workspace">
          <Building2 className="h-3.5 w-3.5" />
          Workspace
        </NavPill>

        <NavPill href="/login">
          <LogIn className="h-3.5 w-3.5" />
          Login
        </NavPill>

        <NavPill href="/register" variant="solid">
          <UserPlus className="h-3.5 w-3.5" />
          Register
        </NavPill>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      <NavPill href="/workspace">
        <Building2 className="h-3.5 w-3.5" />
        Workspace
      </NavPill>

      <NavPill href="/me">
        <UserCircle className="h-3.5 w-3.5" />
        {shortenEmail(user.email ?? "Account")}
      </NavPill>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={busy}
        className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 px-4 text-xs font-medium text-zinc-400 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <LogOut className="h-3.5 w-3.5" />
        {busy ? "Signing out" : "Sign out"}
      </button>
    </div>
  );
}