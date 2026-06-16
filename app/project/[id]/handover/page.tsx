import ProjectHandoverClient from "@/components/handover/ProjectHandoverClient";
import ProjectRuntimeQuickActions from "@/components/project/ProjectRuntimeQuickActions";

type ProjectHandoverPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectHandoverPage({
  params,
}: ProjectHandoverPageProps) {
  const { id } = await params;
  const projectId = decodeURIComponent(id);

  return (
    <>
      <ProjectRuntimeQuickActions
        projectId={projectId}
        activeModule="handover"
      />
      <ProjectHandoverClient />
    </>
  );
}
