import ProjectRuntimeQuickActions from "@/components/project/ProjectRuntimeQuickActions";
import ProjectWorkflowStagePage from "@/components/project/ProjectWorkflowStagePage";

type ProjectFixPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectFixPage({ params }: ProjectFixPageProps) {
  const { id } = await params;
  const projectId = decodeURIComponent(id);

  return (
    <>
      <ProjectRuntimeQuickActions projectId={projectId} activeModule="fix" />
      <ProjectWorkflowStagePage
        eyebrow="Fix"
        title="Check and reduce project risk"
        description="This stage helps users avoid the most common AI-code pain: generated output that looks good but fails to build, deploy, or operate safely."
        projectId={projectId}
        primaryActionLabel="Open Tests"
        primaryActionHref={`/project/${encodeURIComponent(projectId)}/tests`}
        modules={[
          {
            title: "Tests",
            description: "Review smoke, route, security, data, deployment, and acceptance checks.",
            href: `/project/${encodeURIComponent(projectId)}/tests`,
            status: "core",
          },
          {
            title: "Readiness",
            description: "Check whether product, architecture, security, delivery, and operations are ready.",
            href: `/project/${encodeURIComponent(projectId)}/readiness`,
            status: "recommended",
          },
        ]}
        nextStep={{
          label: "After checks pass, go to Launch",
          href: `/project/${encodeURIComponent(projectId)}/launch`,
        }}
      />
    </>
  );
}
