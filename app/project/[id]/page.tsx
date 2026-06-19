import ProjectBeginnerGuide from "@/components/project/ProjectBeginnerGuide";
import ProjectGuidedWorkflow from "@/components/project/ProjectGuidedWorkflow";
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
      <ProjectRuntimeQuickActions
        projectId={projectId}
        activeModule="project"
      />
      <ProjectGuidedWorkflow projectId={projectId} />
      <ProjectBeginnerGuide projectId={projectId} />
      <ProjectRuntimeClient projectId={projectId} />
    </>
  );
}
