import ProjectRuntimeQuickActions from "@/components/project/ProjectRuntimeQuickActions";
import ProjectTestPackClient from "@/components/testpack/ProjectTestPackClient";

type ProjectTestsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectTestsPage({ params }: ProjectTestsPageProps) {
  const { id } = await params;
  const projectId = decodeURIComponent(id);

  return (
    <>
      <ProjectRuntimeQuickActions projectId={projectId} activeModule="tests" />
      <ProjectTestPackClient />
    </>
  );
}