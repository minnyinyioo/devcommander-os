import ProjectRuntimeQuickActions from "@/components/project/ProjectRuntimeQuickActions";
import ProjectWorkflowStagePage from "@/components/project/ProjectWorkflowStagePage";

type ProjectLaunchPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectLaunchPage({
  params,
}: ProjectLaunchPageProps) {
  const { id } = await params;
  const projectId = decodeURIComponent(id);

  return (
    <>
      <ProjectRuntimeQuickActions projectId={projectId} activeModule="launch" />
      <ProjectWorkflowStagePage
        eyebrow="Launch"
        title="Prepare deployment safely"
        description="This stage turns generated output into a launch plan: environment variables, build commands, rollback, deployment events, and production preflight."
        projectId={projectId}
        primaryActionLabel="Open Deploy Pack"
        primaryActionHref={`/project/${encodeURIComponent(projectId)}/deploy`}
        modules={[
          {
            title: "Deploy Pack",
            description: "Review build commands, environment variables, production checklist, and rollback plan.",
            href: `/project/${encodeURIComponent(projectId)}/deploy`,
            status: "core",
          },
          {
            title: "Deployment Events",
            description: "Record preflight passed, deployment started, completed, failed, or rollback requested.",
            href: `/project/${encodeURIComponent(projectId)}/deploy`,
            status: "recommended",
          },
        ]}
        nextStep={{
          label: "After launch, go to Operate",
          href: `/project/${encodeURIComponent(projectId)}/operate`,
        }}
      />
    </>
  );
}
