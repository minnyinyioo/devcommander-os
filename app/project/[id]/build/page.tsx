import ProjectRuntimeQuickActions from "@/components/project/ProjectRuntimeQuickActions";
import ProjectWorkflowStagePage from "@/components/project/ProjectWorkflowStagePage";

type ProjectBuildPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectBuildPage({ params }: ProjectBuildPageProps) {
  const { id } = await params;
  const projectId = decodeURIComponent(id);

  return (
    <>
      <ProjectRuntimeQuickActions projectId={projectId} activeModule="build" />
      <ProjectWorkflowStagePage
        eyebrow="Build"
        title="Generate the project package"
        description="This stage groups the technical generation tools. Users do not need to understand AI routing or file generation details; they only need to know this is where the product becomes code."
        projectId={projectId}
        primaryActionLabel="Open Code Pack"
        primaryActionHref={`/project/${encodeURIComponent(projectId)}/code`}
        modules={[
          {
            title: "AI Router",
            description: "Run AI routing tasks for product, architecture, code, deployment, and monitoring decisions.",
            href: `/project/${encodeURIComponent(projectId)}/router`,
            status: "advanced",
          },
          {
            title: "Code Pack",
            description: "Preview generated files, review starter code, and export the ZIP package.",
            href: `/project/${encodeURIComponent(projectId)}/code`,
            status: "core",
          },
        ]}
        nextStep={{
          label: "After building code, go to Fix",
          href: `/project/${encodeURIComponent(projectId)}/fix`,
        }}
      />
    </>
  );
}
