"use client";

import JSZip from "jszip";
import type { CodePack } from "@/lib/codegen/codegen-types";

function sanitizeFileName(value: string): string {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return cleaned || "devcommander-code-pack";
}

export async function buildCodePackZipBlob(codePack: CodePack): Promise<Blob> {
  const zip = new JSZip();

  for (const file of codePack.files) {
    zip.file(file.path, file.content);
  }

  zip.file(
    "devcommander-code-pack.json",
    JSON.stringify(
      {
        projectId: codePack.projectId,
        title: codePack.title,
        summary: codePack.summary,
        fileCount: codePack.fileCount,
        generatedAt: codePack.generatedAt,
        files: codePack.files.map((file) => ({
          path: file.path,
          language: file.language,
          description: file.description,
        })),
        nextSteps: codePack.nextSteps,
      },
      null,
      2,
    ),
  );

  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: 6,
    },
  });
}

export async function downloadCodePackZip(codePack: CodePack): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("ZIP export is only available in the browser.");
  }

  const blob = await buildCodePackZipBlob(codePack);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${sanitizeFileName(codePack.title)}-code-pack.zip`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}