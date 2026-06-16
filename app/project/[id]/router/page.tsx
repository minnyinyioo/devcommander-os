import ProjectAiRouterClient from "@/components/ai-router/ProjectAiRouterClient";
import ProjectRuntimeQuickActions from "@/components/project/ProjectRuntimeQuickActions";

type ProjectAiRouterPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectAiRouterPage({
  params,
}: ProjectAiRouterPageProps) {
  const { id } = await params;
  const projectId = decodeURIComponent(id);

  return (
    <>
      <ProjectRuntimeQuickActions
        projectId={projectId}
        activeModule="router"
      />
      <ProjectAiRouterClient />
    </>
  );
}