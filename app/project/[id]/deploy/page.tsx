import DeploymentEventPanel from "@/components/deploy/DeploymentEventPanel";
import ProjectDeployClient from "@/components/deploy/ProjectDeployClient";
import ProjectRuntimeQuickActions from "@/components/project/ProjectRuntimeQuickActions";

type ProjectDeployPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectDeployPage({
  params,
}: ProjectDeployPageProps) {
  const { id } = await params;
  const projectId = decodeURIComponent(id);

  return (
    <>
      <ProjectRuntimeQuickActions
        projectId={projectId}
        activeModule="deploy"
      />
      <DeploymentEventPanel projectId={projectId} />
      <ProjectDeployClient />
    </>
  );
}