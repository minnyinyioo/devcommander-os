"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Code2,
  Copy,
  Download,
  Loader2,
  Sparkles,
} from "lucide-react";
import type {
  AiCodeGenerationProvider,
  AiCodeGenerationResponse,
  AiGeneratedCodeFile,
} from "@/lib/ai-codegen/codegen-api-types";

type AiCodegenV2PanelProps = {
  projectId: string;
};

type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; data: AiCodeGenerationResponse }
  | { status: "error"; message: string };

const DEFAULT_PROMPT =
  "Build a simple task management SaaS with dashboard, projects, tasks, login, and deployment checklist.";

function fileRiskClass(riskLevel: AiGeneratedCodeFile["riskLevel"]): string {
  if (riskLevel === "safe") {
    return "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/20";
  }

  if (riskLevel === "sensitive") {
    return "bg-red-500/10 text-red-300 ring-1 ring-red-400/20";
  }

  return "bg-amber-500/10 text-amber-300 ring-1 ring-amber-400/20";
}

function providerLabel(provider: AiCodeGenerationProvider): string {
  if (provider === "openai") {
    return "OpenAI";
  }

  return "Local fallback";
}

function downloadJson(data: AiCodeGenerationResponse) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `devcommander-codegen-${Date.now()}.json`;
  anchor.click();

  URL.revokeObjectURL(url);
}

async function copyFile(file: AiGeneratedCodeFile) {
  if (!navigator.clipboard) {
    return;
  }

  await navigator.clipboard.writeText(file.content);
}

function FileCard({ file }: { file: AiGeneratedCodeFile }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-black/20 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">
            {file.path}
          </h3>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {file.purpose}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${fileRiskClass(
            file.riskLevel,
          )}`}
        >
          {file.riskLevel}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-zinc-400">
          {file.language}
        </p>

        <button
          type="button"
          onClick={() => void copyFile(file)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </button>
      </div>

      <pre className="mt-4 max-h-72 overflow-auto rounded-2xl border border-white/10 bg-zinc-950 p-4 text-xs leading-6 text-zinc-300">
        <code>{file.content}</code>
      </pre>
    </article>
  );
}

export default function AiCodegenV2Panel({
  projectId,
}: AiCodegenV2PanelProps) {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [provider, setProvider] = useState<AiCodeGenerationProvider>("local");
  const [maxFiles, setMaxFiles] = useState(6);
  const [state, setState] = useState<LoadState>({ status: "idle" });

  const canGenerate = useMemo(() => prompt.trim().length >= 8, [prompt]);

  async function handleGenerate() {
    if (!canGenerate) {
      setState({
        status: "error",
        message: "Describe the product or problem with at least 8 characters.",
      });
      return;
    }

    setState({ status: "loading" });

    try {
      const response = await fetch("/api/ai/codegen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          prompt,
          projectId,
          provider,
          maxFiles,
        }),
      });

      const data = (await response.json()) as
        | AiCodeGenerationResponse
        | { message?: string };

      if (!response.ok || !("files" in data)) {
        throw new Error(
          "message" in data && data.message
            ? data.message
            : "Code generation failed.",
        );
      }

      setState({ status: "ready", data });
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to generate code package.",
      });
    }
  }

  return (
    <section className="border-b border-white/10 bg-zinc-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/30 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
                <Sparkles className="h-3.5 w-3.5" />
                Code Pack V2
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Generate a multi-file code package.
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
                This panel calls the server-side code generation API. It can use
                local fallback today, and OpenAI automatically when quota is
                available.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 lg:w-[340px]">
              <div className="flex items-center gap-2 text-amber-200">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm font-semibold">Human review required</p>
              </div>

              <p className="mt-2 text-sm leading-6 text-amber-100/80">
                Generated code must be reviewed and tested before deployment.
                Never treat generated files as production-ready without checks.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
            <label className="block">
              <span className="text-sm font-semibold text-zinc-300">
                Product request
              </span>

              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={7}
                className="mt-3 w-full rounded-3xl border border-white/10 bg-black/30 p-4 text-sm leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30"
                placeholder="Describe the product you want to generate..."
              />
            </label>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-zinc-300">
                  Provider
                </span>

                <select
                  value={provider}
                  onChange={(event) =>
                    setProvider(event.target.value as AiCodeGenerationProvider)
                  }
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                >
                  <option value="local">Local fallback</option>
                  <option value="openai">OpenAI server-side</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-zinc-300">
                  Max files
                </span>

                <input
                  type="number"
                  min={1}
                  max={12}
                  value={maxFiles}
                  onChange={(event) =>
                    setMaxFiles(Number(event.target.value))
                  }
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                />
              </label>

              <button
                type="button"
                onClick={() => void handleGenerate()}
                disabled={!canGenerate || state.status === "loading"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {state.status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Code2 className="h-4 w-4" />
                )}
                Generate Code Pack V2
              </button>
            </div>
          </div>

          {state.status === "error" ? (
            <div className="mt-6 rounded-3xl border border-red-500/20 bg-red-500/10 p-5 text-sm leading-7 text-red-200">
              {state.message}
            </div>
          ) : null}

          {state.status === "ready" ? (
            <div className="mt-6 space-y-5">
              <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-200">
                      <CheckCircle2 className="h-4 w-4" />
                      <p className="text-sm font-semibold">
                        Generated with {providerLabel(state.data.provider)}
                      </p>
                    </div>

                    <p className="mt-3 text-sm leading-7 text-emerald-100/80">
                      {state.data.summary}
                    </p>

                    {state.data.fallbackUsed ? (
                      <p className="mt-3 text-sm font-semibold text-amber-200">
                        OpenAI was requested, but local fallback was used.
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => downloadJson(state.data)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/20 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-400/10"
                  >
                    <Download className="h-4 w-4" />
                    Download JSON
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {state.data.runInstructions.map((instruction) => (
                    <code
                      key={instruction}
                      className="rounded-full border border-emerald-400/20 bg-black/20 px-3 py-1 text-xs text-emerald-100"
                    >
                      {instruction}
                    </code>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {state.data.files.map((file) => (
                  <FileCard key={file.path} file={file} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
