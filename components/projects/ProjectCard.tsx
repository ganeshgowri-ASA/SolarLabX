// @ts-nocheck
import Link from "next/link";
import { Project } from "@/lib/types/projects";
import { cn, formatCurrency } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Planning: "bg-gray-100 text-gray-700",
  Active: "bg-green-100 text-green-700",
  "On Hold": "bg-yellow-100 text-yellow-700",
  Completed: "bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`} className="card hover:shadow-md transition-shadow block">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{project.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{project.client}</p>
        </div>
        <span className={cn("badge", statusStyles[project.status])}>
          {project.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {project.testStandards.map((std) => (
          <span key={std} className="badge bg-primary-50 text-primary-700 text-[10px]">{std}</span>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-medium text-gray-700">{project.completionPercent}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full",
              project.completionPercent >= 75 ? "bg-green-500" :
              project.completionPercent >= 40 ? "bg-blue-500" :
              "bg-orange-500"
            )}
            style={{ width: `${project.completionPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>PM: {project.projectManager}</span>
        <span>Budget: {formatCurrency(project.budget)}</span>
      </div>
    </Link>
  );
}
