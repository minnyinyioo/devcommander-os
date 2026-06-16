import ProjectOpsRunbookClient from "@/components/ops/ProjectOpsRunbookClient";
import ProjectRuntimeQuickActions from "@/components/project/ProjectRuntimeQuickActions";

type ProjectOpsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectOpsPage({ params }: ProjectOpsPageProps) {
  const { id } = await params;
  const projectId = decodeURIComponent(id);

  return (
    <>
      <ProjectRuntimeQuickActions projectId={projectId} activeModule="ops" />
      <ProjectOpsRunbookClient />
    </>
  );
}
