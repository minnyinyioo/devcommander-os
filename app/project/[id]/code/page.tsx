import ProjectCodePackClient from "@/components/codegen/ProjectCodePackClient";
import ProjectRuntimeQuickActions from "@/components/project/ProjectRuntimeQuickActions";

type ProjectCodePackPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectCodePackPage({
  params,
}: ProjectCodePackPageProps) {
  const { id } = await params;
  const projectId = decodeURIComponent(id);

  return (
    <>
      <ProjectRuntimeQuickActions projectId={projectId} activeModule="code" />
      <ProjectCodePackClient />
    </>
  );
}