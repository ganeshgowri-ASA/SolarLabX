// @ts-nocheck
"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createComponent, calculateBudget } from "@/lib/uncertainty";
import type { UncertaintyBudget } from "@/lib/uncertainty";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import UncertaintyBudgetTable from "@/components/uncertainty/UncertaintyBudgetTable";
import NormalDistributionChart from "@/components/uncertainty/NormalDistributionChart";
import SensitivityAnalysis from "@/components/uncertainty/SensitivityAnalysis";
import CoverageFactor from "@/components/uncertainty/CoverageFactor";

function createSampleBudget(): UncertaintyBudget {
  const components = [
    createComponent("c1", "Reference cell calibration", 1.5, 1.5, "normal", "typeB", 1.0, Infinity),
    createComponent("c2", "Reference cell long-term drift", 0.5, 0.5, "uniform", "typeB", 1.0, Infinity),
    createComponent("c3", "Simulator spatial non-uniformity", 2.0, 2.0, "uniform", "typeB", 1.0, Infinity),
    createComponent("c4", "Simulator temporal instability", 0.5, 0.5, "uniform", "typeB", 1.0, Infinity),
    createComponent("c5", "Spectral mismatch", 1.0, 1.0, "normal", "typeB", 1.0, Infinity),
    createComponent("c6", "Temperature measurement", 1.0, 1.0, "normal", "typeB", 0.4, Infinity),
    createComponent("c7", "Temperature correction", 0.05, 0.05, "normal", "typeB", 1.0, Infinity),
    createComponent("c8", "Voltage measurement", 0.1, 0.1, "normal", "typeB", 1.0, Infinity),
    createComponent("c9", "Current measurement", 0.1, 0.1, "normal", "typeB", 1.0, Infinity),
    createComponent("c10", "I-V curve fitting", 0.2, 0.2, "normal", "typeB", 1.0, Infinity),
    createComponent("c11", "Repeatability", 0.3, 0.3, "normal", "typeA", 1.0, 9),
  ];

  return calculateBudget("Module ABC-2024 Pmax", "Pmax (W)", 350.5, components, 0.95);
}

export default function BudgetDetailPage() {
  const params = useParams();
  const budgetId = params.id as string;

  const budget = useMemo(() => {
    const b = createSampleBudget();
    b.id = budgetId;
    return b;
  }, [budgetId]);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-gray-900">{budget.name}</h1>
            <Badge variant="default">Complete</Badge>
          </div>
          <p className="text-muted-foreground">
            Measurand: {budget.measurand} | Budget ID: {budgetId}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.print()}>
            Print / Export
          </Button>
          <Link href="/uncertainty">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      {/* ISO 17025 Budget Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Uncertainty Budget - ISO 17025 Format</CardTitle>
          <CardDescription>
            Measurement uncertainty evaluation per JCGM 100:2008 (GUM)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UncertaintyBudgetTable budget={budget} />
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Measured Value</span>
                <span className="font-mono font-semibold">{budget.measuredValue} W</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Combined Standard Uncertainty uc</span>
                <span className="font-mono font-semibold">
                  {budget.combinedStandardUncertainty.toFixed(6)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Effective Degrees of Freedom v_eff</span>
                <span className="font-mono font-semibold">
                  {budget.effectiveDegreesOfFreedom === Infinity
                    ? "\u221E"
                    : budget.effectiveDegreesOfFreedom}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Coverage Factor k (p = 95%)</span>
                <span className="font-mono font-semibold">{budget.coverageFactor.toFixed(3)}</span>
              </div>
              <div className="flex justify-between py-2 border-b bg-blue-50 px-3 rounded">
                <span className="font-semibold text-blue-900">Expanded Uncertainty U</span>
                <span className="font-mono font-bold text-blue-700">
                  ±{budget.expandedUncertainty.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Relative Uncertainty</span>
                <span className="font-mono font-semibold">
                  ±{budget.relativeUncertaintyPercent.toFixed(2)}%
                </span>
              </div>
            </div>
            <div>
              <CoverageFactor
                dof={budget.effectiveDegreesOfFreedom}
                probability={budget.coverageProbability}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Normal Distribution</CardTitle>
            <CardDescription>
              Result: {budget.measuredValue} ± {budget.expandedUncertainty.toFixed(4)} {budget.measurand} (95% confidence)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NormalDistributionChart
              mean={budget.measuredValue}
              uncertainty={budget.expandedUncertainty}
              coverageFactor={budget.coverageFactor}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sensitivity Analysis</CardTitle>
            <CardDescription>Component contribution to combined variance</CardDescription>
          </CardHeader>
          <CardContent>
            <SensitivityAnalysis components={budget.components} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
