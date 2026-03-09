"use client";

import {
  FlaskConical,
  TestTube2,
  ClipboardCheck,
  AlertTriangle,
  Wrench,
  Activity,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const kpiCards = [
  {
    title: "Total Samples",
    value: "1,247",
    change: "+12%",
    trend: "up" as const,
    icon: FlaskConical,
    description: "Registered this quarter",
  },
  {
    title: "Active Tests",
    value: "89",
    change: "+5%",
    trend: "up" as const,
    icon: TestTube2,
    description: "Currently in progress",
  },
  {
    title: "Pending Audits",
    value: "7",
    change: "-2",
    trend: "down" as const,
    icon: ClipboardCheck,
    description: "Scheduled this month",
  },
  {
    title: "Open NCRs",
    value: "14",
    change: "+3",
    trend: "up" as const,
    icon: AlertTriangle,
    description: "Requiring action",
  },
  {
    title: "Equipment Due Calibration",
    value: "5",
    change: "0",
    trend: "down" as const,
    icon: Wrench,
    description: "Within next 30 days",
  },
];

const recentActivity = [
  {
    id: 1,
    action: "Sample SMP-2603-A1B2 registered",
    module: "LIMS",
    user: "Ganesh K.",
    time: "2 hours ago",
    status: "completed",
  },
  {
    id: 2,
    action: "IEC 61215 test execution started",
    module: "LIMS",
    user: "Priya M.",
    time: "3 hours ago",
    status: "in_progress",
  },
  {
    id: 3,
    action: "NCR-2603-X7Y8 raised for thermal cycling failure",
    module: "Audit",
    user: "Ravi S.",
    time: "5 hours ago",
    status: "attention",
  },
  {
    id: 4,
    action: "SOP for UV preconditioning approved",
    module: "SOP Gen",
    user: "Admin",
    time: "6 hours ago",
    status: "completed",
  },
  {
    id: 5,
    action: "Sun simulator ABC-100 classified as A+AA",
    module: "Sun Sim",
    user: "Vikram P.",
    time: "1 day ago",
    status: "completed",
  },
  {
    id: 6,
    action: "PO-2603-M3N4 submitted for UV chamber parts",
    module: "Procurement",
    user: "Anita R.",
    time: "1 day ago",
    status: "in_progress",
  },
  {
    id: 7,
    action: "Defect analysis completed - 3 hotspots detected",
    module: "Vision AI",
    user: "Ganesh K.",
    time: "2 days ago",
    status: "attention",
  },
  {
    id: 8,
    action: "Project PRJ-2603-Q5R6 milestone achieved",
    module: "Projects",
    user: "Priya M.",
    time: "2 days ago",
    status: "completed",
  },
];

const moduleProgress = [
  { name: "IEC 61215 Testing", progress: 78, total: 45, completed: 35 },
  { name: "IEC 61730 Safety", progress: 62, total: 28, completed: 17 },
  { name: "IEC 61853 Rating", progress: 45, total: 20, completed: 9 },
  { name: "IEC 60904 Calibration", progress: 90, total: 10, completed: 9 },
];

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-500/10 text-green-500";
    case "in_progress":
      return "bg-blue-500/10 text-blue-500";
    case "attention":
      return "bg-orange-500/10 text-orange-500";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Solar PV Lab Operations Overview
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {kpi.trend === "up" ? (
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span
                  className={
                    kpi.trend === "up" ? "text-green-500" : "text-red-500"
                  }
                >
                  {kpi.change}
                </span>
                <span className="ml-1">{kpi.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest actions across all modules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div
                    className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                      item.status === "completed"
                        ? "bg-green-500"
                        : item.status === "in_progress"
                        ? "bg-blue-500"
                        : "bg-orange-500"
                    }`}
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{item.action}</p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={getStatusColor(item.status)}
                      >
                        {item.module}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {item.user} &middot; {item.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Progress */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Test Progress by Standard
            </CardTitle>
            <CardDescription>
              Current quarter testing completion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {moduleProgress.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.completed}/{item.total} tests
                    </span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {item.progress}% complete
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-lg border p-4">
              <h4 className="text-sm font-semibold mb-3">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">98.5%</p>
                  <p className="text-xs text-muted-foreground">
                    Test Pass Rate
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">4.2</p>
                  <p className="text-xs text-muted-foreground">
                    Avg Days/Test
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">12</p>
                  <p className="text-xs text-muted-foreground">
                    Active Clients
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">3</p>
                  <p className="text-xs text-muted-foreground">
                    Chambers Online
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
