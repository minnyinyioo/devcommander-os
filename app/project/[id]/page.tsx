import ProjectRuntimeClient from "@/components/project/ProjectRuntimeClient";

type ProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;

  return <ProjectRuntimeClient projectId={decodeURIComponent(id)} />;
}