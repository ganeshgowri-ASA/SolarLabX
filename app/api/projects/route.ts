import { NextRequest, NextResponse } from "next/server";
import { projects, projectMetrics } from "@/lib/data/projects-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const status = searchParams.get("status");
  const type = searchParams.get("type");

  if (type === "metrics") {
    return NextResponse.json({ metrics: projectMetrics });
  }

  if (id) {
    const project = projects.find((p) => p.id === id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ project });
  }

  let filtered = [...projects];
  if (status) filtered = filtered.filter((p) => p.status === status);

  return NextResponse.json({
    projects: filtered,
    total: filtered.length,
    summary: {
      active: projects.filter((p) => p.status === "Active").length,
      planning: projects.filter((p) => p.status === "Planning").length,
      completed: projects.filter((p) => p.status === "Completed").length,
      totalBudget: projects.reduce((s, p) => s + p.budget, 0),
      totalSpent: projects.reduce((s, p) => s + p.spent, 0),
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  if (action === "create") {
    return NextResponse.json({
      success: true,
      message: "Project created successfully",
      id: `PRJ-${new Date().getFullYear()}-${String(projects.length + 1).padStart(3, "0")}`,
    });
  }

  if (action === "update-task") {
    const { projectId, taskId, updates } = body;
    return NextResponse.json({
      success: true,
      message: `Task ${taskId} in project ${projectId} updated`,
    });
  }

  if (action === "add-milestone") {
    const { projectId } = body;
    return NextResponse.json({
      success: true,
      message: `Milestone added to project ${projectId}`,
    });
  }

  if (action === "allocate-resource") {
    const { projectId, resourceType, resourceName } = body;
    return NextResponse.json({
      success: true,
      message: `${resourceType} "${resourceName}" allocated to project ${projectId}`,
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
