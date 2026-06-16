import ProjectRuntimeActionHub from "@/components/project/ProjectRuntimeActionHub";
import ProjectRuntimeClient from "@/components/project/ProjectRuntimeClient";
import ProjectRuntimeQuickActions from "@/components/project/ProjectRuntimeQuickActions";

type ProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const projectId = decodeURIComponent(id);

  return (
    <>
      <ProjectRuntimeQuickActions projectId={projectId} />
      <ProjectRuntimeActionHub projectId={projectId} />
      <ProjectRuntimeClient projectId={projectId} />
    </>
  );
}