import ProjectRuntimeQuickActions from "@/components/project/ProjectRuntimeQuickActions";
import ProjectWorkflowStagePage from "@/components/project/ProjectWorkflowStagePage";

type ProjectOperatePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectOperatePage({
  params,
}: ProjectOperatePageProps) {
  const { id } = await params;
  const projectId = decodeURIComponent(id);

  return (
    <>
      <ProjectRuntimeQuickActions projectId={projectId} activeModule="operate" />
      <ProjectWorkflowStagePage
        eyebrow="Operate"
        title="Keep the project understandable and maintainable"
        description="This stage is for after the project is generated or launched: monitor health, handle incidents, prepare handover, and review activity events."
        projectId={projectId}
        primaryActionLabel="Open Monitor"
        primaryActionHref={`/project/${encodeURIComponent(projectId)}/monitor`}
        modules={[
          {
            title: "Monitor",
            description: "Review runtime health, warnings, incidents, and operational signals.",
            href: `/project/${encodeURIComponent(projectId)}/monitor`,
            status: "core",
          },
          {
            title: "Ops Runbook",
            description: "Use launch control, incident response, security operations, data operations, release rules, and AI operations.",
            href: `/project/${encodeURIComponent(projectId)}/ops`,
            status: "recommended",
          },
          {
            title: "Handover",
            description: "Prepare a developer/operator handoff with generated assets, risks, and next-owner actions.",
            href: `/project/${encodeURIComponent(projectId)}/handover`,
            status: "recommended",
          },
          {
            title: "Activity",
            description: "Review project, workspace, AI route, deployment, and runtime audit events.",
            href: "/activity",
            status: "advanced",
          },
        ]}
      />
    </>
  );
}
