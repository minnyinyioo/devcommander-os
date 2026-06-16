import ProjectRuntimeQuickActions from "@/components/project/ProjectRuntimeQuickActions";
import ProjectReadinessClient from "@/components/readiness/ProjectReadinessClient";

type ProjectReadinessPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectReadinessPage({
  params,
}: ProjectReadinessPageProps) {
  const { id } = await params;
  const projectId = decodeURIComponent(id);

  return (
    <>
      <ProjectRuntimeQuickActions
        projectId={projectId}
        activeModule="readiness"
      />
      <ProjectReadinessClient />
    </>
  );
}