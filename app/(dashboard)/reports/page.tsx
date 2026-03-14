// @ts-nocheck
"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sampleReports } from "@/lib/mock-data";

const statusColors: Record<string, string> = {
  draft: "#6b7280",
  pending_review: "#eab308",
  approved: "#22c55e",
  issued: "#3b82f6",
};

export default function ReportsDashboard() {
  const approved = sampleReports.filter((r) => r.status === "approved").length;
  const pending = sampleReports.filter((r) => r.status === "pending_review").length;
  const drafts = sampleReports.filter((r) => r.status === "draft").length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Test Reports</h1>
          <p className="text-muted-foreground mt-1">
            Automated ISO 17025 compliant test report generation
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link href="/reports/generate">
            <Button>Generate Report</Button>
          </Link>
          <Link href="/reports/iec-full">
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700">IEC Full Report</Button>
          </Link>
          <Link href="/reports/certification-project">
            <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700">Certification Project</Button>
          </Link>
          <Link href="/reports/customer-summary">
            <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700">Customer Summary</Button>
          </Link>
          <Link href="/reports/templates">
            <Button variant="outline">Templates</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Reports</CardDescription>
            <CardTitle className="text-3xl">{sampleReports.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl text-green-600">{approved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Drafts</CardDescription>
            <CardTitle className="text-3xl text-gray-600">{drafts}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Reports */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>
        <div className="space-y-3">
          {sampleReports.map((report) => {
            const passCount = report.testResults.filter((t) => t.result === "pass").length;
            const totalCount = report.testResults.length;
            return (
              <Link key={report.id} href={`/reports/${report.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-muted-foreground">{report.reportNumber}</span>
                          <Badge style={{ backgroundColor: (statusColors[report.status] || "#6b7280") + "20", color: statusColors[report.status] }}>
                            {report.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          <Badge variant={report.testResults.every((t) => t.result !== "fail") ? "default" : "destructive"}>
                            {report.testResults.every((t) => t.result !== "fail") ? "PASS" : "FAIL"}
                          </Badge>
                        </div>
                        <h3 className="font-medium mt-1">{report.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>{report.standard}</span>
                          <span>Module: {report.moduleId}</span>
                          <span>{report.manufacturer}</span>
                          <span>{passCount}/{totalCount} passed</span>
                          <span>Updated: {report.updatedAt}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Report Templates Quick Access */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Report Templates</h2>
          <Link href="/reports/templates">
            <Button variant="outline" size="sm">View All Templates →</Button>
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/reports/templates/pid", icon: "⚡", label: "PID Test Report", std: "IEC TS 62804-1:2015", color: "#1e3a5f" },
            { href: "/reports/templates/letid", icon: "🌡", label: "LeTID Test Report", std: "IEC CD 61215:2020", color: "#0f4c81" },
            { href: "/reports/templates/cleaning", icon: "🤖", label: "Robotic Cleaning", std: "Custom Project Report", color: "#065f46" },
            { href: "/reports/templates/stc-flash", icon: "📊", label: "STC Flash Analysis", std: "IEC 60904-1 / MQT06", color: "#1e3a5f" },
            { href: "/reports/templates/iec-61215", icon: "🏆", label: "IEC 61215 Design Qual.", std: "IEC 61215:2021 · 19 MQTs", color: "#1e3a5f" },
            { href: "/reports/templates/iec-61730", icon: "🛡", label: "IEC 61730 Safety Qual.", std: "IEC 61730:2023 · 15 MSTs", color: "#7c2d12" },
            { href: "/reports/templates/iec-61853", icon: "☀", label: "IEC 61853 Energy Rating", std: "Power Matrix · 4 Climates", color: "#5b21b6" },
            { href: "/reports/templates/iec-61701", icon: "🌊", label: "IEC 61701 Salt Mist", std: "Severity S4 · 200h", color: "#0e7490" },
            { href: "/reports/templates/thermal-cycling", icon: "🔄", label: "Thermal Cycling", std: "MQT 11 · TC200", color: "#b45309" },
            { href: "/reports/templates/humidity-freeze", icon: "❄", label: "Humidity Freeze", std: "MQT 12 · HF10", color: "#1d4ed8" },
            { href: "/reports/templates/damp-heat", icon: "💧", label: "Damp Heat", std: "MQT 13 · DH1000", color: "#065f46" },
            { href: "/reports/templates/mechanical-load", icon: "🏗", label: "Mechanical Load", std: "MQT 16 · ±5400 Pa", color: "#7c3aed" },
            { href: "/reports/templates/hail", icon: "🧊", label: "Hail Impact Test", std: "MQT 17 · 25mm / 23 m/s", color: "#dc2626" },
            { href: "/reports/templates/uv-preconditioning", icon: "🔆", label: "UV Preconditioning", std: "MQT 10 · 15 kWh/m²", color: "#6d28d9" },
            { href: "/reports/templates/iec-62788-material", icon: "🧪", label: "Material Testing", std: "IEC 62788 · Backsheet/EVA", color: "#0d9488" },
            { href: "/reports/templates/iec-62938-snow", icon: "❄", label: "Non-Uniform Snow Load", std: "IEC 62938 · Light/Heavy", color: "#2563eb" },
            { href: "/reports/templates/iec-61345-uv-thinfilm", icon: "☀", label: "UV Test (Thin-Film)", std: "IEC 61345 · 50 kWh/m²", color: "#7c3aed" },
            { href: "/reports/templates/ul-61730", icon: "🛡", label: "UL Safety (North Am.)", std: "UL 61730 / UL 1703", color: "#dc2626" },
            { href: "/reports/templates/is-14286-bis", icon: "🇮🇳", label: "BIS Certification", std: "IS 14286 · ALMM", color: "#ea580c" },
            { href: "/reports/templates/iec-62915-bom", icon: "📋", label: "BoM & Type Test", std: "IEC 62915 · Change Matrix", color: "#4f46e5" },
            { href: "/reports/templates/calibration", icon: "🔧", label: "Calibration Certificate", std: "ISO 17025 · NABL", color: "#7e22ce" },
            { href: "/reports/templates/uncertainty", icon: "📐", label: "Uncertainty Budget", std: "GUM · k=2 Coverage", color: "#0891b2" },
            { href: "/reports/templates/incoming-inspection", icon: "📦", label: "Incoming Inspection", std: "SOP-RCV · Visual/EL", color: "#059669" },
            { href: "/reports/templates/iec-62782-sand", icon: "🏜", label: "Sand/Dust Abrasion", std: "IEC 62782 · DML+Sand", color: "#b45309" },
          ].map((tpl) => (
            <Link key={tpl.href} href={tpl.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 h-full" style={{ borderLeftColor: tpl.color }}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{tpl.icon}</span>
                    <span className="font-semibold text-sm leading-tight">{tpl.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{tpl.std}</p>
                  <span className="text-xs mt-1 inline-block" style={{ color: "#15803d", fontWeight: "600" }}>🖨 Print / PDF</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Pending Approvals */}
      {pending > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Pending Approvals</h2>
          <div className="space-y-3">
            {sampleReports
              .filter((r) => r.status === "pending_review")
              .map((report) => (
                <Link key={report.id} href={`/reports/${report.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-sm">{report.reportNumber}</span>
                          <h3 className="font-medium">{report.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Prepared by {report.preparedBy} on {report.createdAt}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
