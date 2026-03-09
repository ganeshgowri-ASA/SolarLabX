import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const modules = [
  {
    title: "Vision AI",
    description: "AI-powered defect detection for EL, IR, and visual inspection images",
    href: "/vision-ai",
    stats: { scans: 1247, defectsFound: 89, accuracy: "96.3%" },
  },
  {
    title: "SOP Generator",
    description: "AI-generated Standard Operating Procedures from IEC/ISO standards",
    href: "/sop-gen",
    stats: { generated: 156, templates: 24, standards: 5 },
  },
  {
    title: "Test Reports",
    description: "Automated ISO 17025 compliant test report generation",
    href: "/reports",
    stats: { reports: 342, pending: 12, approved: 318 },
  },
];

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          AI-Powered Modules for Solar PV Lab Operations
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {modules.map((mod) => (
          <Link key={mod.href} href={mod.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-lg">{mod.title}</CardTitle>
                <CardDescription>{mod.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {Object.entries(mod.stats).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-2xl font-bold text-primary">{value}</p>
                      <p className="text-xs text-muted-foreground capitalize">{key}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
