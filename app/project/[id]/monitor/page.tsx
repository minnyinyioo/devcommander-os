import ProjectMonitorClient from "@/components/monitor/ProjectMonitorClient";
import ProjectRuntimeQuickActions from "@/components/project/ProjectRuntimeQuickActions";

type ProjectMonitorPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectMonitorPage({
  params,
}: ProjectMonitorPageProps) {
  const { id } = await params;
  const projectId = decodeURIComponent(id);

  return (
    <>
      <ProjectRuntimeQuickActions
        projectId={projectId}
        activeModule="monitor"
      />
      <ProjectMonitorClient />
    </>
  );
}