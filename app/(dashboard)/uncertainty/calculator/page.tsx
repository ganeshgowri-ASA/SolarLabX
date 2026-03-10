// @ts-nocheck
"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { UncertaintyBudget, UncertaintyComponent } from "@/lib/uncertainty";
import { calculateBudget } from "@/lib/uncertainty";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import GUMCalculator from "@/components/uncertainty/GUMCalculator";
import UncertaintyBudgetTable from "@/components/uncertainty/UncertaintyBudgetTable";
import SensitivityAnalysis from "@/components/uncertainty/SensitivityAnalysis";
import CoverageFactor from "@/components/uncertainty/CoverageFactor";
import NormalDistributionChart from "@/components/uncertainty/NormalDistributionChart";

export default function CalculatorPage() {
  const [budget, setBudget] = useState<UncertaintyBudget | null>(null);

  function handleCalculate(
    measurand: string,
    measuredValue: number,
    components: UncertaintyComponent[]
  ) {
    const result = calculateBudget(
      `Budget - ${measurand}`,
      measurand,
      measuredValue,
      components,
      0.95
    );
    setBudget(result);
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GUM Uncertainty Calculator</h1>
          <p className="text-muted-foreground mt-1">
            Add uncertainty components and calculate the combined and expanded uncertainty
          </p>
        </div>
        <Link href="/uncertainty">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      {/* Calculator Form */}
      <GUMCalculator onCalculate={handleCalculate} />

      {/* Results */}
      {budget && (
        <div className="space-y-6">
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Uncertainty Budget Results</h2>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Combined uc</CardDescription>
                <CardTitle className="text-xl font-mono">
                  {budget.combinedStandardUncertainty.toFixed(6)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Eff. DOF (v_eff)</CardDescription>
                <CardTitle className="text-xl font-mono">
                  {budget.effectiveDegreesOfFreedom === Infinity
                    ? "\u221E"
                    : budget.effectiveDegreesOfFreedom}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Coverage Factor k</CardDescription>
                <CardTitle className="text-xl font-mono">
                  {budget.coverageFactor.toFixed(3)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardDescription>Expanded U (k={budget.coverageFactor.toFixed(2)}, 95%)</CardDescription>
                <CardTitle className="text-xl font-mono text-blue-700">
                  ±{budget.expandedUncertainty.toFixed(6)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Relative Uncertainty</CardDescription>
                <CardTitle className="text-xl font-mono">
                  ±{budget.relativeUncertaintyPercent.toFixed(2)}%
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Budget Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Uncertainty Budget Table</CardTitle>
              <CardDescription>ISO 17025 compliant tabular format</CardDescription>
            </CardHeader>
            <CardContent>
              <UncertaintyBudgetTable budget={budget} />
            </CardContent>
          </Card>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Sensitivity / Pareto Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contribution Analysis (Pareto)</CardTitle>
                <CardDescription>
                  Percentage contribution of each component to combined variance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SensitivityAnalysis components={budget.components} />
              </CardContent>
            </Card>

            {/* Coverage Factor + Distribution */}
            <div className="space-y-6">
              <CoverageFactor
                dof={budget.effectiveDegreesOfFreedom}
                probability={budget.coverageProbability}
              />
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Normal Distribution</CardTitle>
                  <CardDescription>
                    Measurement result: {budget.measuredValue} ± {budget.expandedUncertainty.toFixed(4)} (95%)
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
