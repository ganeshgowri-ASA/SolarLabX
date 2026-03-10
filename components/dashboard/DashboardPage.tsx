// @ts-nocheck
"use client";

import Link from "next/link";
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
  MessageSquareWarning,
  Plus,
  Calendar,
  FileBarChart,
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

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
    title: "Equipment Due Cal.",
    value: "5",
    change: "0",
    trend: "down" as const,
    icon: Wrench,
    description: "Within next 30 days",
  },
  {
    title: "Customer Complaints",
    value: "3",
    change: "-1",
    trend: "down" as const,
    icon: MessageSquareWarning,
    description: "Open complaints",
  },
];

const testVolumeTrend = [
  { month: "Oct", tests: 62 },
  { month: "Nov", tests: 78 },
  { month: "Dec", tests: 55 },
  { month: "Jan", tests: 91 },
  { month: "Feb", tests: 84 },
  { month: "Mar", tests: 97 },
];

const equipmentUtilization = [
  { name: "Solar Sim", utilization: 92 },
  { name: "TC Chamber", utilization: 85 },
  { name: "DH Chamber", utilization: 78 },
  { name: "UV Chamber", utilization: 65 },
  { name: "Mech Load", utilization: 52 },
  { name: "Hail Tester", utilization: 38 },
  { name: "EL Camera", utilization: 88 },
];

const defectPareto = [
  { defect: "Cracks", count: 34, color: "#ef4444" },
  { defect: "Hotspots", count: 22, color: "#f97316" },
  { defect: "Snail Trail", count: 15, color: "#eab308" },
  { defect: "Delam.", count: 11, color: "#0891b2" },
  { defect: "PID", count: 8, color: "#dc2626" },
  { defect: "Discolor", count: 6, color: "#65a30d" },
  { defect: "Busbar", count: 4, color: "#a855f7" },
];

const turnaroundData = [
  { range: "1-3d", count: 28 },
  { range: "4-7d", count: 42 },
  { range: "8-14d", count: 35 },
  { range: "15-21d", count: 18 },
  { range: "22-30d", count: 8 },
  { range: ">30d", count: 3 },
];

const recentActivity = [
  { id: 1, action: "Sample SMP-2603-A1B2 registered", module: "LIMS", user: "Ganesh K.", time: "2 hours ago", status: "completed" },
  { id: 2, action: "IEC 61215 test execution started", module: "LIMS", user: "Priya M.", time: "3 hours ago", status: "in_progress" },
  { id: 3, action: "NCR-2603-X7Y8 raised for thermal cycling failure", module: "Audit", user: "Ravi S.", time: "5 hours ago", status: "attention" },
  { id: 4, action: "SOP for UV preconditioning approved", module: "SOP Gen", user: "Admin", time: "6 hours ago", status: "completed" },
  { id: 5, action: "Sun simulator ABC-100 classified as A+AA", module: "Sun Sim", user: "Vikram P.", time: "1 day ago", status: "completed" },
  { id: 6, action: "PO-2603-M3N4 submitted for UV chamber parts", module: "Procurement", user: "Anita R.", time: "1 day ago", status: "in_progress" },
  { id: 7, action: "Defect analysis completed - 3 hotspots detected", module: "Vision AI", user: "Ganesh K.", time: "2 days ago", status: "attention" },
  { id: 8, action: "Project PRJ-2603-Q5R6 milestone achieved", module: "Projects", user: "Priya M.", time: "2 days ago", status: "completed" },
];

const moduleProgress = [
  { name: "IEC 61215 Testing", progress: 78, total: 45, completed: 35 },
  { name: "IEC 61730 Safety", progress: 62, total: 28, completed: 17 },
  { name: "IEC 61853 Rating", progress: 45, total: 20, completed: 9 },
  { name: "IEC 60904 Calibration", progress: 90, total: 10, completed: 9 },
];

const weatherMock = {
  temp: 32,
  condition: "Partly Cloudy",
  irradiance: 850,
  humidity: 45,
  wind: 12,
  uvIndex: 7,
};

function getStatusColor(status: string) {
  switch (status) {
    case "completed": return "bg-green-500/10 text-green-500";
    case "in_progress": return "bg-blue-500/10 text-blue-500";
    case "attention": return "bg-orange-500/10 text-orange-500";
    default: return "bg-muted text-muted-foreground";
  }
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Solar PV Lab Operations Overview</p>
        </div>
        <div className="flex gap-2">
          <Link href="/lims/samples">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Service Request
            </Button>
          </Link>
          <Link href="/lims/samples">
            <Button size="sm" variant="outline">
              <FlaskConical className="h-4 w-4 mr-1" />
              New Sample
            </Button>
          </Link>
          <Link href="/projects">
            <Button size="sm" variant="outline">
              <Calendar className="h-4 w-4 mr-1" />
              View Schedule
            </Button>
          </Link>
          <Link href="/reports/generate">
            <Button size="sm" variant="outline">
              <FileBarChart className="h-4 w-4 mr-1" />
              Generate Report
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
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
                <span className={kpi.trend === "up" ? "text-green-500" : "text-red-500"}>
                  {kpi.change}
                </span>
                <span className="ml-1">{kpi.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Test Volume Trend
            </CardTitle>
            <CardDescription>Monthly test count over 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={testVolumeTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="tests" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Equipment Utilization
            </CardTitle>
            <CardDescription>Current month utilization rate (%)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={equipmentUtilization} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="utilization" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Defect Pareto Analysis</CardTitle>
            <CardDescription>Most common defects detected (Vision AI)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={defectPareto}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="defect" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {defectPareto.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sample Turnaround Time</CardTitle>
            <CardDescription>Distribution of sample completion times</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={turnaroundData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity, Progress, Weather */}
      <div className="grid gap-6 md:grid-cols-3">
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
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-lg border p-2.5">
                  <div
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                      item.status === "completed"
                        ? "bg-green-500"
                        : item.status === "in_progress"
                        ? "bg-blue-500"
                        : "bg-orange-500"
                    }`}
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-xs">{item.action}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${getStatusColor(item.status)}`}>
                        {item.module}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
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
              Test Progress
            </CardTitle>
            <CardDescription>Current quarter testing completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {moduleProgress.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.completed}/{item.total}
                    </span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg border p-4">
              <h4 className="text-sm font-semibold mb-3">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-xl font-bold text-primary">98.5%</p>
                  <p className="text-[10px] text-muted-foreground">Test Pass Rate</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-primary">4.2</p>
                  <p className="text-[10px] text-muted-foreground">Avg Days/Test</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-primary">12</p>
                  <p className="text-[10px] text-muted-foreground">Active Clients</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-primary">3</p>
                  <p className="text-[10px] text-muted-foreground">Chambers Online</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weather Widget */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudSun className="h-5 w-5" />
              Outdoor Testing Weather
            </CardTitle>
            <CardDescription>Current conditions at test site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <CloudSun className="h-12 w-12 mx-auto text-yellow-500 mb-2" />
              <p className="text-3xl font-bold">{weatherMock.temp}°C</p>
              <p className="text-sm text-muted-foreground">{weatherMock.condition}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Thermometer className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Irradiance</p>
                  <p className="text-sm font-semibold">{weatherMock.irradiance} W/m²</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Droplets className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Humidity</p>
                  <p className="text-sm font-semibold">{weatherMock.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Wind className="h-4 w-4 text-sky-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Wind</p>
                  <p className="text-sm font-semibold">{weatherMock.wind} km/h</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <CloudSun className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-xs text-muted-foreground">UV Index</p>
                  <p className="text-sm font-semibold">{weatherMock.uvIndex} (High)</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
              <p className="text-xs font-medium text-green-700 dark:text-green-400">
                Conditions suitable for outdoor exposure testing (IEC 61215 MQT 08)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
