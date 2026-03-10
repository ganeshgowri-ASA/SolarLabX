// @ts-nocheck
import Link from "next/link";

const modules = [
  { name: "LIMS", href: "/lims", description: "Sample registration, test execution, equipment management", color: "bg-blue-500" },
  { name: "QMS", href: "/qms", description: "Document control, CAPA, ISO 17025 compliance", color: "bg-green-500" },
  { name: "Audit", href: "/audit", description: "Audit planning, findings, CAR/8D workflows", color: "bg-purple-500" },
  { name: "Projects", href: "/projects", description: "Test project tracking, Gantt charts, resources", color: "bg-orange-500" },
  { name: "Procurement", href: "/procurement", description: "RFQ, vendor management, PO tracking", color: "bg-red-500" },
  { name: "Uncertainty", href: "/uncertainty", description: "ISO 17025 measurement uncertainty calculator", color: "bg-teal-500" },
  { name: "Vision AI", href: "/vision-ai", description: "AI-powered defect detection for PV modules", color: "bg-indigo-500" },
  { name: "SOP Generator", href: "/sop-gen", description: "AI-powered SOP generation from standards", color: "bg-pink-500" },
  { name: "Reports", href: "/reports", description: "Automated IEC test report generation", color: "bg-cyan-500" },
  { name: "Sun Simulator", href: "/sun-simulator", description: "IEC 60904-9 classification tool", color: "bg-amber-500" },
  { name: "Chamber Config", href: "/chamber-config", description: "Environmental test chamber configurator", color: "bg-emerald-500" },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">SolarLabX Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {modules.map((mod) => (
          <Link key={mod.name} href={mod.href} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className={`h-10 w-10 rounded-lg ${mod.color} flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">{mod.name.charAt(0)}</span>
              </div>
              <h3 className="font-semibold text-gray-900">{mod.name}</h3>
            </div>
            <p className="text-sm text-gray-500">{mod.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
