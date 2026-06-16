"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Code2,
  Copy,
  FileCode2,
  FolderTree,
  Loader2,
  RefreshCw,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { generateCodePack } from "@/lib/codegen/codegen-engine";
import type { CodePack, CodePackFile } from "@/lib/codegen/codegen-types";
import { loadProjectRuntimeHybrid } from "@/lib/project/storage-adapter";
import type { ProjectRuntimeArtifact } from "@/lib/project/project-runtime";

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

function FileButton({
  file,
  active,
  onClick,
}: {
  file: CodePackFile;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
        active
          ? "border-sky-400/30 bg-sky-500/10"
          : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.04]"
      }`}
    >
      <div className="flex items-center gap-2">
        <FileCode2 className="h-4 w-4 text-zinc-500" />
        <span className="min-w-0 truncate font-mono text-xs text-zinc-200">
          {file.path}
        </span>
      </div>

      <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500">
        {file.description}
      </p>
    </button>
  );
}

export default function ProjectCodePackClient() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [project, setProject] = useState<ProjectRuntimeArtifact | null>(null);
  const [codePack, setCodePack] = useState<CodePack | null>(null);
  const [selectedPath, setSelectedPath] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const loadCodePack = useCallback(async () => {
    setLoadState("loading");
    setError("");
    setCopied("");

    try {
      const runtimeProject = await loadProjectRuntimeHybrid(projectId);
      const nextCodePack = generateCodePack(runtimeProject);

      setProject(runtimeProject);
      setCodePack(nextCodePack);
      setSelectedPath(nextCodePack.files[0]?.path ?? "");
      setLoadState("loaded");
    } catch (currentError) {
      setProject(null);
      setCodePack(null);
      setSelectedPath("");
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Failed to generate code pack.",
      );
      setLoadState("failed");
    }
  }, [projectId]);

  useEffect(() => {
    void loadCodePack();
  }, [loadCodePack]);

  const selectedFile = useMemo(() => {
    if (!codePack) return null;

    return (
      codePack.files.find((file) => file.path === selectedPath) ??
      codePack.files[0] ??
      null
    );
  }, [codePack, selectedPath]);

  async function copyToClipboard(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);

      window.setTimeout(() => {
        setCopied("");
      }, 1400);
    } catch {
      setCopied("Copy failed");
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(63,63,70,0.35),_transparent_35%),#09090b] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/project/${encodeURIComponent(projectId)}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Project
          </Link>

          <Link
            href={`/project/${encodeURIComponent(projectId)}/readiness`}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            Readiness
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            Dashboard
          </Link>
        </div>

        <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-zinc-500">
                Code Pack Generator
              </p>

              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Generated Project Code Pack
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">
                Convert the Project Runtime into a starter file tree with
                Next.js, TypeScript, Tailwind, Supabase schema, README, and
                smoke test instructions.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 lg:w-[340px]">
              <div className="flex items-center gap-2 text-emerald-200">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-sm font-semibold">Secret-Safe Output</p>
              </div>

              <p className="mt-3 text-sm leading-6 text-emerald-100/80">
                Generated `.env.example` contains placeholders only. Never
                commit real `.env`, API keys, tokens, or private keys.
              </p>
            </div>
          </div>
        </header>

        {loadState === "loading" ? (
          <section className="mt-6 flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating code pack...
          </section>
        ) : null}

        {error ? (
          <section className="mt-6 rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-sm leading-7 text-red-200">
            {error}
          </section>
        ) : null}

        {codePack && project ? (
          <>
            <section className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-zinc-400">Code Pack</p>

                  <button
                    type="button"
                    onClick={() => void loadCodePack()}
                    disabled={loadState === "loading"}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${
                        loadState === "loading" ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </button>
                </div>

                <div className="mt-6 flex items-end gap-3">
                  <span className="text-6xl font-semibold tracking-tight text-white">
                    {codePack.fileCount}
                  </span>
                  <span className="pb-2 text-lg text-zinc-500">files</span>
                </div>

                <p className="mt-5 text-lg font-semibold text-white">
                  {codePack.title}
                </p>

                <p className="mt-3 line-clamp-4 text-sm leading-7 text-zinc-400">
                  {codePack.summary}
                </p>

                <p className="mt-5 text-xs text-zinc-600">
                  Generated: {formatDate(codePack.generatedAt)}
                </p>

                <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Rocket className="h-4 w-4 text-zinc-500" />
                    <p className="text-sm font-semibold">Next Steps</p>
                  </div>

                  <div className="mt-4 grid gap-2">
                    {codePack.nextSteps.map((step) => (
                      <p
                        key={step}
                        className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs leading-5 text-zinc-400"
                      >
                        {step}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="mb-5 flex items-center gap-2">
                  <FolderTree className="h-4 w-4 text-zinc-500" />
                  <h2 className="text-xl font-semibold text-white">
                    File Tree
                  </h2>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {codePack.files.map((file) => (
                    <FileButton
                      key={file.path}
                      file={file}
                      active={selectedFile?.path === file.path}
                      onClick={() => setSelectedPath(file.path)}
                    />
                  ))}
                </div>
              </div>
            </section>

            {selectedFile ? (
              <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-zinc-500" />
                      <h2 className="font-mono text-lg font-semibold text-white">
                        {selectedFile.path}
                      </h2>
                    </div>

                    <p className="mt-2 text-sm text-zinc-500">
                      {selectedFile.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void copyToClipboard(selectedFile.content, selectedFile.path)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                  >
                    {copied === selectedFile.path ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy File
                      </>
                    )}
                  </button>
                </div>

                {copied === "Copy failed" ? (
                  <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                    Copy failed. Select and copy the code manually.
                  </div>
                ) : null}

                <pre className="max-h-[680px] overflow-auto rounded-2xl border border-white/10 bg-black/40 p-5 text-sm leading-7 text-zinc-200">
                  <code>{selectedFile.content}</code>
                </pre>
              </section>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}