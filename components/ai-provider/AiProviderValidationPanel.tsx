"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import type { AiProviderValidationResponse } from "@/lib/ai-provider/provider-validation";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; data: AiProviderValidationResponse }
  | { status: "error"; message: string };

function levelClass(level: "pass" | "warning" | "blocked"): string {
  if (level === "pass") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-200";
  }

  if (level === "warning") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-200";
  }

  return "border-red-500/20 bg-red-500/10 text-red-200";
}

function LevelIcon({ level }: { level: "pass" | "warning" | "blocked" }) {
  if (level === "pass") {
    return <CheckCircle2 className="h-5 w-5 text-emerald-300" />;
  }

  if (level === "warning") {
    return <AlertTriangle className="h-5 w-5 text-amber-300" />;
  }

  return <XCircle className="h-5 w-5 text-red-300" />;
}

export default function AiProviderValidationPanel() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let alive = true;

    async function loadValidation() {
      try {
        const response = await fetch("/api/ai/providers/validate", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Provider validation API failed.");
        }

        const data = (await response.json()) as AiProviderValidationResponse;

        if (alive) {
          setState({ status: "ready", data });
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to validate provider keys.";

        if (alive) {
          setState({ status: "error", message });
        }
      }
    }

    void loadValidation();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="border-b border-white/10 bg-zinc-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/30 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white/[0.06] p-3 text-zinc-200">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-zinc-500">
                Provider Key Validation
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                Validate AI keys before real provider calls.
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
                This check blocks unsafe public provider keys and validates basic
                server-side key hygiene without returning any secret value.
              </p>
            </div>
          </div>

          {state.status === "loading" ? (
            <p className="mt-6 text-sm text-zinc-400">
              Validating provider keys...
            </p>
          ) : null}

          {state.status === "error" ? (
            <p className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              {state.message}
            </p>
          ) : null}

          {state.status === "ready" ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {state.data.results.map((result) => (
                <div
                  key={result.id}
                  className={`rounded-3xl border p-5 ${levelClass(result.level)}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold">
                      {result.label}
                    </h3>
                    <LevelIcon level={result.level} />
                  </div>

                  <p className="mt-3 text-sm font-semibold">
                    {result.level.toUpperCase()}
                  </p>

                  <p className="mt-3 text-sm leading-7">
                    {result.message}
                  </p>

                  <ul className="mt-4 space-y-2 text-xs leading-6 opacity-80">
                    {result.recommendations.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
