// @ts-nocheck
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UNCERTAINTY_TEMPLATES } from "@/lib/uncertainty";
import { ReportUncertaintyBudgetTable } from "@/components/reports/uncertainty/ReportUncertaintyBudgetTable";
import { UncertaintyPieChart, DEFAULT_UNCERTAINTY_PIE_DATA } from "@/components/reports/uncertainty/UncertaintyPieChart";
import { ReportFishboneDiagram, DEFAULT_PV_FISHBONE_CATEGORIES } from "@/components/reports/uncertainty/ReportFishboneDiagram";
import {
  TEST_UNCERTAINTY_CONFIGS,
  SUN_SIMULATOR_MANUFACTURERS,
  CALIBRATION_LABORATORIES,
} from "@/components/reports/uncertainty/testUncertaintyConfigs";
import type { TestUncertaintyType } from "@/components/reports/uncertainty/testUncertaintyConfigs";

// ─── 8 Measurement Types ─────────────────────────────────────────────────────

const MEASUREMENT_TYPES: { key: TestUncertaintyType; label: string; icon: string; color: string }[] = [
  { key: "flasher_stc", label: "STC (Flasher)", icon: "⚡", color: "#2563eb" },
  { key: "insulation_test", label: "PLI (Insulation)", icon: "🔌", color: "#dc2626" },
  { key: "noct_nmot", label: "PNMOT", icon: "🌡️", color: "#ea580c" },
  { key: "temperature_coefficient", label: "Temp Coefficient", icon: "📈", color: "#059669" },
  { key: "iam", label: "Bifacial / IAM", icon: "🔆", color: "#7c3aed" },
  { key: "energy_rating", label: "Energy Rating", icon: "⚙️", color: "#0891b2" },
  { key: "spectral_response", label: "IAM", icon: "🌈", color: "#d97706" },
  { key: "wet_leakage", label: "Spectral Response", icon: "📊", color: "#e11d48" },
];

const MOCK_BUDGETS = [
  { id: "budget-001", name: "Module ABC-2024 Pmax", measurand: "Pmax (W)", expandedUncertainty: "±2.84%", date: "2026-03-05", status: "Complete" },
  { id: "budget-002", name: "Ref Cell RC-107 Isc", measurand: "Isc (A)", expandedUncertainty: "±1.92%", date: "2026-03-02", status: "Complete" },
  { id: "budget-003", name: "Chamber TC-01 Temperature", measurand: "Temperature (°C)", expandedUncertainty: "±0.45%", date: "2026-02-28", status: "Draft" },
  { id: "budget-004", name: "Spectral Mismatch M Factor", measurand: "M (mismatch factor)", expandedUncertainty: "±3.21%", date: "2026-02-20", status: "Complete" },
];

// ─── Financial Impact ────────────────────────────────────────────────────────

function FinancialImpactAnalysis({ uncertaintyPct }: { uncertaintyPct: number }) {
  const plantCapacity = 100; // MW
  const tariff = 0.05; // $/kWh
  const specificYield = 1600; // kWh/kWp/yr
  const lifetime = 25;
  const discountRate = 0.08;

  const annualGeneration = plantCapacity * 1000 * specificYield; // kWh
  const annualRevenue = annualGeneration * tariff;
  const energyAtRisk = annualGeneration * (uncertaintyPct / 100);
  const revenueAtRisk = energyAtRisk * tariff;

  // NPV of revenue at risk over lifetime
  let npv = 0;
  for (let y = 1; y <= lifetime; y++) {
    npv += revenueAtRisk / Math.pow(1 + discountRate, y);
  }

  // Payback of investing in lower uncertainty (e.g., better calibration)
  const investmentCost = 50000; // $ for better calibration
  const annualSaving = revenueAtRisk * 0.5; // 50% reduction
  const payback = investmentCost / annualSaving;
  const roi = ((annualSaving * lifetime - investmentCost) / investmentCost) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Financial Impact Analysis</CardTitle>
        <CardDescription>How measurement uncertainty affects project economics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-xs text-blue-600">Annual Energy at Risk</div>
            <div className="text-lg font-bold text-blue-800">{(energyAtRisk / 1e6).toFixed(1)} GWh</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-xs text-red-600">NPV Revenue at Risk</div>
            <div className="text-lg font-bold text-red-800">${(npv / 1e6).toFixed(2)}M</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-xs text-green-600">Payback Period</div>
            <div className="text-lg font-bold text-green-800">{payback.toFixed(1)} years</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-xs text-purple-600">ROI (25yr)</div>
            <div className="text-lg font-bold text-purple-800">{roi.toFixed(0)}%</div>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Based on {plantCapacity} MW plant · {specificYield} kWh/kWp/yr · ${tariff}/kWh · {discountRate * 100}% discount rate · {lifetime} year lifetime
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function UncertaintyDashboard() {
  const [selectedType, setSelectedType] = useState<TestUncertaintyType>("flasher_stc");
  const [activeTab, setActiveTab] = useState<"overview" | "fishbone" | "simulators" | "cals" | "financial">("overview");
  const [adminMode, setAdminMode] = useState(false);

  const config = TEST_UNCERTAINTY_CONFIGS[selectedType];
  const totalBudgets = MOCK_BUDGETS.length;
  const avgUncertainty = MOCK_BUDGETS.reduce((sum, b) => sum + parseFloat(b.expandedUncertainty.replace(/[±%]/g, "")), 0) / totalBudgets;
  const templatesCount = UNCERTAINTY_TEMPLATES.length;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Uncertainty Calculator</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            ISO/IEC 17025 compliant measurement uncertainty evaluation using GUM (JCGM 100:2008).
            8 measurement types, 14 sun simulator manufacturers, 8 calibration laboratories.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={adminMode ? "default" : "outline"}
            size="sm"
            onClick={() => setAdminMode(!adminMode)}
          >
            {adminMode ? "Exit Admin" : "Admin Mode"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Budgets</CardDescription>
            <CardTitle className="text-3xl">{totalBudgets}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {MOCK_BUDGETS.filter((b) => b.status === "Complete").length} complete, {MOCK_BUDGETS.filter((b) => b.status === "Draft").length} draft
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg. Expanded Uncertainty</CardDescription>
            <CardTitle className="text-3xl">±{avgUncertainty.toFixed(2)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">k=2, 95.45% confidence</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Measurement Types</CardDescription>
            <CardTitle className="text-3xl">8</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">STC, PLI, PNMOT, TC, Bifacial, ER, IAM, SR</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Templates Available</CardDescription>
            <CardTitle className="text-3xl">{templatesCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Pre-built for all IEC standards</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link href="/uncertainty/calculator">
          <Button size="lg">New Uncertainty Budget</Button>
        </Link>
        <Link href="/uncertainty/templates">
          <Button variant="outline" size="lg">Browse Templates</Button>
        </Link>
      </div>

      {/* 8 Measurement Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Measurement Type</CardTitle>
          <CardDescription>Select a test type to view its uncertainty budget configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {MEASUREMENT_TYPES.map((mt) => (
              <button
                key={mt.key}
                onClick={() => setSelectedType(mt.key)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedType === mt.key
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{mt.icon}</span>
                  <div>
                    <div className="font-semibold text-sm">{mt.label}</div>
                    <div className="text-xs text-gray-500">{TEST_UNCERTAINTY_CONFIGS[mt.key].standard}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Selected Type Budget */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-semibold">{config.label}</h3>
              <Badge variant="outline">{config.standard}</Badge>
              <Badge className="bg-blue-100 text-blue-800">U = ±{((config.expandedUncertainty / 432) * 100).toFixed(2)}%</Badge>
            </div>
            <ReportUncertaintyBudgetTable
              rows={config.rows}
              measurand={config.measurand}
              measuredValue={432.0}
              unit={config.unit}
              combinedUncertainty={config.combinedUncertainty}
              coverageFactor={config.coverageFactor}
              expandedUncertainty={config.expandedUncertainty}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {[
          { key: "overview", label: "Contribution Analysis" },
          { key: "fishbone", label: "Fishbone Diagram" },
          { key: "simulators", label: "Sun Simulators (14)" },
          { key: "cals", label: "Cal. Laboratories (8)" },
          { key: "financial", label: "Financial Impact" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.key
                ? "bg-white border border-b-white -mb-px text-blue-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-2 gap-6">
          <UncertaintyPieChart data={DEFAULT_UNCERTAINTY_PIE_DATA} />
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
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{budget.name}</p>
                      <p className="text-xs text-muted-foreground">{budget.measurand}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-mono font-semibold text-sm">{budget.expandedUncertainty}</p>
                        <p className="text-xs text-muted-foreground">{budget.date}</p>
                      </div>
                      <Badge variant={budget.status === "Complete" ? "default" : "secondary"}>{budget.status}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "fishbone" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ishikawa (Fishbone) Diagram</CardTitle>
            <CardDescription>
              6-category uncertainty source visualization {adminMode && "— Click sources to edit values"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReportFishboneDiagram
              categories={DEFAULT_PV_FISHBONE_CATEGORIES}
              measurand="Pmax (W)"
              editable={adminMode}
            />
          </CardContent>
        </Card>
      )}

      {activeTab === "simulators" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sun Simulator Manufacturers ({SUN_SIMULATOR_MANUFACTURERS.length})</CardTitle>
            <CardDescription>Manufacturer-specific uncertainty parameters for IV testing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="text-left p-3 font-semibold">Manufacturer</th>
                    <th className="text-left p-3 font-semibold">Models</th>
                    <th className="text-center p-3 font-semibold">Classification</th>
                    <th className="text-center p-3 font-semibold">Spatial Non-Unif. (%)</th>
                    <th className="text-center p-3 font-semibold">Temporal Instab. (%)</th>
                    <th className="text-center p-3 font-semibold">Spectral Match (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {SUN_SIMULATOR_MANUFACTURERS.map((sim, i) => (
                    <tr key={sim.manufacturer} className={`border-b ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}>
                      <td className="p-3 font-medium">{sim.manufacturer}</td>
                      <td className="p-3 text-xs text-gray-600">{sim.models.join(", ")}</td>
                      <td className="p-3 text-center">
                        <Badge variant="outline" className={sim.classification.includes("+") || sim.classification === "AAAA" ? "border-green-500 text-green-700" : ""}>
                          {sim.classification}
                        </Badge>
                      </td>
                      <td className="p-3 text-center font-mono">{sim.spatialNonUniformity.toFixed(2)}</td>
                      <td className="p-3 text-center font-mono">{sim.temporalInstability.toFixed(2)}</td>
                      <td className="p-3 text-center font-mono">{sim.spectralMismatch.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "cals" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Calibration Laboratories ({CALIBRATION_LABORATORIES.length})</CardTitle>
            <CardDescription>International reference cell calibration laboratory uncertainties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="text-left p-3 font-semibold">Laboratory</th>
                    <th className="text-center p-3 font-semibold">Abbrev.</th>
                    <th className="text-left p-3 font-semibold">Country</th>
                    <th className="text-center p-3 font-semibold">Accreditation</th>
                    <th className="text-center p-3 font-semibold">Pmax U (%)</th>
                    <th className="text-center p-3 font-semibold">Isc U (%)</th>
                    <th className="text-center p-3 font-semibold">Voc U (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {CALIBRATION_LABORATORIES.map((lab, i) => (
                    <tr key={lab.abbreviation} className={`border-b ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}>
                      <td className="p-3 font-medium text-xs">{lab.name}</td>
                      <td className="p-3 text-center font-bold text-blue-700">{lab.abbreviation}</td>
                      <td className="p-3">{lab.country}</td>
                      <td className="p-3 text-center"><Badge variant="outline">{lab.accreditation}</Badge></td>
                      <td className="p-3 text-center font-mono">±{lab.pmaxUncertainty.toFixed(2)}</td>
                      <td className="p-3 text-center font-mono">±{lab.iscUncertainty.toFixed(2)}</td>
                      <td className="p-3 text-center font-mono">±{lab.vocUncertainty.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "financial" && (
        <FinancialImpactAnalysis uncertaintyPct={avgUncertainty} />
      )}
    </div>
  );
}
