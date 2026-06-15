"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { syncLocalProjectsAfterAuth } from "@/lib/auth/sync-local-projects";

type AuthFormMode = "login" | "register";

type AuthFormProps = {
  mode: AuthFormMode;
};

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedDisplayName = displayName.trim();

    setError("");
    setNotice("");

    if (!validateEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("Supabase is not configured. Please check .env.local.");
      return;
    }

    setBusy(true);

    try {
      if (isRegister) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              display_name:
                normalizedDisplayName || normalizedEmail.split("@")[0] || "User",
            },
          },
        });

        if (signUpError) {
          throw new Error(signUpError.message);
        }

        if (data.session) {
          await syncLocalProjectsAfterAuth();
          router.push("/dashboard");
          return;
        }

        setNotice("Account created. Please check your email to confirm your account.");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      await syncLocalProjectsAfterAuth();

      router.push("/dashboard");
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Authentication failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(63,63,70,0.35),_transparent_35%),#09090b] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            Dashboard
          </Link>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-zinc-500">
            DevCommander OS
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            {isRegister ? "Create your account" : "Login to your workspace"}
          </h1>

          <p className="mt-3 text-sm leading-7 text-zinc-400">
            {isRegister
              ? "Create a secure account for cloud project persistence and future team workspace features."
              : "Login to enable authenticated cloud save for generated project runtimes."}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
            {isRegister ? (
              <label className="grid gap-2">
                <span className="text-sm font-medium text-zinc-300">
                  Display name
                </span>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 focus-within:border-white/25">
                  <UserRound className="h-4 w-4 text-zinc-500" />
                  <input
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Founder name"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                  />
                </div>
              </label>
            ) : null}

            <label className="grid gap-2">
              <span className="text-sm font-medium text-zinc-300">Email</span>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 focus-within:border-white/25">
                <Mail className="h-4 w-4 text-zinc-500" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                />
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-zinc-300">Password</span>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 focus-within:border-white/25">
                <LockKeyhole className="h-4 w-4 text-zinc-500" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  placeholder="At least 8 characters"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                />
              </div>
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
              disabled={busy}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : isRegister ? (
                "Create Account"
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="mt-6 text-sm text-zinc-400">
            {isRegister ? (
              <>
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-white hover:underline">
                  Login
                </Link>
              </>
            ) : (
              <>
                New to DevCommander OS?{" "}
                <Link
                  href="/register"
                  className="font-medium text-white hover:underline"
                >
                  Create an account
                </Link>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}