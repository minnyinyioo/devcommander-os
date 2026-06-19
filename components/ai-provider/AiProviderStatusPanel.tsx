"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, LockKeyhole, Server, XCircle } from "lucide-react";
import type { AiProviderStatusResponse } from "@/lib/ai-provider/provider-types";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; data: AiProviderStatusResponse }
  | { status: "error"; message: string };

export default function AiProviderStatusPanel() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let alive = true;

    async function loadProviderStatus() {
      try {
        const response = await fetch("/api/ai/providers/status", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Provider status API failed.");
        }

        const data = (await response.json()) as AiProviderStatusResponse;

        if (alive) {
          setState({ status: "ready", data });
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load provider status.";

        if (alive) {
          setState({ status: "error", message });
        }
      }
    }

    void loadProviderStatus();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="border-b border-white/10 bg-zinc-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/30 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-200">
                <Server className="h-3.5 w-3.5" />
                Server-side AI Foundation
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                AI providers are checked on the server only.
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
                DevCommander OS must never expose OpenAI, Anthropic, Gemini, or
                service role keys to the browser. This panel only shows whether
                a provider is configured, not the secret value.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 lg:w-[340px]">
              <div className="flex items-center gap-2 text-zinc-200">
                <LockKeyhole className="h-4 w-4" />
                <p className="text-sm font-semibold">Secret safety rule</p>
              </div>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Private provider keys must use server-only names such as
                OPENAI_API_KEY. Never use NEXT_PUBLIC_OPENAI_API_KEY.
              </p>
            </div>
          </div>

          {state.status === "loading" ? (
            <p className="mt-6 text-sm text-zinc-400">
              Loading provider status...
            </p>
          ) : null}

          {state.status === "error" ? (
            <p className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              {state.message}
            </p>
          ) : null}

          {state.status === "ready" ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {state.data.providers.map((provider) => (
                <div
                  key={provider.id}
                  className="rounded-3xl border border-white/10 bg-black/20 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-white">
                      {provider.label}
                    </h3>

                    {provider.configured ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    ) : (
                      <XCircle className="h-5 w-5 text-zinc-600" />
                    )}
                  </div>

                  <p
                    className={
                      provider.configured
                        ? "mt-3 text-sm font-semibold text-emerald-300"
                        : "mt-3 text-sm font-semibold text-zinc-500"
                    }
                  >
                    {provider.configured ? "Configured" : "Missing"}
                  </p>

                  <p className="mt-3 text-xs leading-6 text-zinc-500">
                    Env: {provider.envVarName}
                  </p>

                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    {provider.notes}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
