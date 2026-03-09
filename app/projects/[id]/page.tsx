import ProjectDetailClient from "@/components/projects/ProjectDetailClient";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <ProjectDetailClient params={params} />;
}
