// @ts-nocheck
"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UNCERTAINTY_TEMPLATES } from "@/lib/uncertainty";

const MOCK_BUDGETS = [
  {
    id: "budget-001",
    name: "Module ABC-2024 Pmax",
    measurand: "Pmax (W)",
    expandedUncertainty: "±2.84%",
    date: "2026-03-05",
    status: "Complete",
  },
  {
    id: "budget-002",
    name: "Ref Cell RC-107 Isc",
    measurand: "Isc (A)",
    expandedUncertainty: "±1.92%",
    date: "2026-03-02",
    status: "Complete",
  },
  {
    id: "budget-003",
    name: "Chamber TC-01 Temperature",
    measurand: "Temperature (°C)",
    expandedUncertainty: "±0.45%",
    date: "2026-02-28",
    status: "Draft",
  },
  {
    id: "budget-004",
    name: "Spectral Mismatch M Factor",
    measurand: "M (mismatch factor)",
    expandedUncertainty: "±3.21%",
    date: "2026-02-20",
    status: "Complete",
  },
];

export default function UncertaintyDashboard() {
  const totalBudgets = MOCK_BUDGETS.length;
  const avgUncertainty =
    MOCK_BUDGETS.reduce((sum, b) => {
      const num = parseFloat(b.expandedUncertainty.replace(/[±%]/g, ""));
      return sum + num;
    }, 0) / totalBudgets;
  const templatesCount = UNCERTAINTY_TEMPLATES.length;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Uncertainty Calculator</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          ISO/IEC 17025 compliant measurement uncertainty evaluation using the GUM
          (Guide to the Expression of Uncertainty in Measurement, JCGM 100:2008) methodology.
          Calculate, document, and report uncertainty budgets for solar PV testing.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Budgets</CardDescription>
            <CardTitle className="text-3xl">{totalBudgets}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {MOCK_BUDGETS.filter((b) => b.status === "Complete").length} complete,{" "}
              {MOCK_BUDGETS.filter((b) => b.status === "Draft").length} draft
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Expanded Uncertainty</CardDescription>
            <CardTitle className="text-3xl">±{avgUncertainty.toFixed(2)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Across all saved budgets (k=2, 95%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Templates Available</CardDescription>
            <CardTitle className="text-3xl">{templatesCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Pre-built for I-V, Spectral, Temperature, Irradiance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link href="/uncertainty/calculator">
          <Button size="lg">New Uncertainty Budget</Button>
        </Link>
        <Link href="/uncertainty/templates">
          <Button variant="outline" size="lg">
            Browse Templates
          </Button>
        </Link>
      </div>

      {/* Saved Budgets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Saved Budgets</CardTitle>
          <CardDescription>Recently created uncertainty budgets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MOCK_BUDGETS.map((budget) => (
              <Link
                key={budget.id}
                href={`/uncertainty/budget/${budget.id}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium text-sm">{budget.name}</p>
                    <p className="text-xs text-muted-foreground">{budget.measurand}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-mono font-semibold text-sm">{budget.expandedUncertainty}</p>
                    <p className="text-xs text-muted-foreground">{budget.date}</p>
                  </div>
                  <Badge variant={budget.status === "Complete" ? "default" : "secondary"}>
                    {budget.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
