import Link from "next/link";
import { ProjectRuntimeView } from "@/components/project/ProjectRuntimeView";

type ProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link href="/dashboard" className="text-sm text-cyan-400">
          ← Back to Dashboard
        </Link>

        <p className="mt-8 text-sm uppercase tracking-[0.3em] text-cyan-400">
          Project Runtime
        </p>

        <h1 className="mt-3 text-4xl font-bold">Project Brain</h1>

        <p className="mt-3 max-w-2xl text-slate-400">
          Project ID: {id}
        </p>

        <div className="mt-10">
          <ProjectRuntimeView id={id} />
        </div>
      </div>
    </main>
  );
}