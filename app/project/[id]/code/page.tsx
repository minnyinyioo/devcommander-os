import AiCodegenV2Panel from "@/components/ai-codegen/AiCodegenV2Panel";
import ProjectCodePackClient from "@/components/codegen/ProjectCodePackClient";
import ProjectRuntimeQuickActions from "@/components/project/ProjectRuntimeQuickActions";

type ProjectCodePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectCodePage({
  params,
}: ProjectCodePageProps) {
  const { id } = await params;
  const projectId = decodeURIComponent(id);

  return (
    <>
      <ProjectRuntimeQuickActions projectId={projectId} activeModule="code" />
      <AiCodegenV2Panel projectId={projectId} />
      <ProjectCodePackClient projectId={projectId} />
    </>
  );
}
