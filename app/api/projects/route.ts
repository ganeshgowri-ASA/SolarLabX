import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api-auth";
import { projects, projectMetrics } from "@/lib/data/projects-data";

const ProjectPostSchema = z.object({
  action: z.enum(["create", "update-task", "add-milestone", "allocate-resource"]),
  projectId: z.string().max(100).optional(),
  taskId: z.string().max(100).optional(),
  resourceType: z.string().max(100).optional(),
  resourceName: z.string().max(200).optional(),
  updates: z.record(z.unknown()).optional(),
  title: z.string().max(300).optional(),
  description: z.string().max(5000).optional(),
});

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

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
  const { error } = await requireAuth();
  if (error) return error;

  const raw = await request.json();
  const parsed = ProjectPostSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }
  const body = parsed.data;

  if (body.action === "create") {
    return NextResponse.json({
      success: true,
      message: "Project created successfully",
      id: `PRJ-${new Date().getFullYear()}-${String(projects.length + 1).padStart(3, "0")}`,
    });
  }

  if (body.action === "update-task") {
    return NextResponse.json({
      success: true,
      message: `Task updated`,
    });
  }

  if (body.action === "add-milestone") {
    return NextResponse.json({
      success: true,
      message: `Milestone added`,
    });
  }

  if (body.action === "allocate-resource") {
    return NextResponse.json({
      success: true,
      message: `Resource allocated`,
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
