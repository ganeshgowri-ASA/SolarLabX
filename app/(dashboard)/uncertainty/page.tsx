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
  const [activeTab, setActiveTab] = useState<"overview" | "fishbone" | "simulators" | "cals" | "financial" | "gum">("overview");
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
          { key: "gum", label: "GUM Components" },
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

{activeTab === "gum" && (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">GUM-Based Uncertainty Components</CardTitle>
        <CardDescription>
          Measurement uncertainty sources per JCGM 100:2008 (GUM) for IEC 61215 / IEC 60904 test methods.
          Type A = statistical analysis of repeated measurements. Type B = other evaluation (certificates, specs, experience).
        </CardDescription>
      </CardHeader>
    </Card>

    {/* STC Flash Test Uncertainty */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">STC Flash Test (IEC 60904-1 / IEC 60891)</CardTitle>
        <CardDescription className="text-xs">Pmax, Isc, Voc, FF measurement at 1000 W/m², 25°C, AM1.5G</CardDescription>
      </CardHeader>
      <CardContent>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="text-left p-2 font-semibold">Uncertainty Source</th>
              <th className="text-center p-2 font-semibold">Type</th>
              <th className="text-center p-2 font-semibold">Distribution</th>
              <th className="text-center p-2 font-semibold">Typical Value</th>
              <th className="text-center p-2 font-semibold">Divisor</th>
              <th className="text-center p-2 font-semibold">u(xi) %</th>
              <th className="text-center p-2 font-semibold">% Contribution</th>
            </tr>
          </thead>
          <tbody>
            {[
              { source: "Reference cell calibration (Isc)", type: "B", dist: "Normal", value: "±0.8%", divisor: "2", uxi: "0.40", contrib: "~45%" },
              { source: "Spatial non-uniformity of irradiance", type: "B", dist: "Rectangular", value: "±0.5%", divisor: "√3", uxi: "0.29", contrib: "~12%" },
              { source: "Spectral mismatch correction (M)", type: "B", dist: "Rectangular", value: "±0.5%", divisor: "√3", uxi: "0.29", contrib: "~12%" },
              { source: "Temporal instability (STI + LTI)", type: "B", dist: "Rectangular", value: "±0.3%", divisor: "√3", uxi: "0.17", contrib: "~4%" },
              { source: "Module temperature (±2°C × γ)", type: "B", dist: "Normal", value: "±0.9%", divisor: "2", uxi: "0.45", contrib: "~14%" },
              { source: "DAQ / I-V tracer accuracy", type: "B", dist: "Rectangular", value: "±0.1%", divisor: "√3", uxi: "0.06", contrib: "~1%" },
              { source: "Repeatability (10 sweeps)", type: "A", dist: "Normal", value: "±0.3%", divisor: "√n", uxi: "0.10", contrib: "~3%" },
              { source: "I-V curve correction (IEC 60891)", type: "B", dist: "Normal", value: "±0.5%", divisor: "2", uxi: "0.25", contrib: "~9%" },
            ].map((row, i) => (
              <tr key={i} className={`border-b ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                <td className="p-2">{row.source}</td>
                <td className="p-2 text-center"><Badge variant={row.type === "A" ? "default" : "outline"} className="text-xs">{row.type}</Badge></td>
                <td className="p-2 text-center">{row.dist}</td>
                <td className="p-2 text-center font-mono">{row.value}</td>
                <td className="p-2 text-center font-mono">{row.divisor}</td>
                <td className="p-2 text-center font-mono font-semibold">{row.uxi}</td>
                <td className="p-2 text-center">{row.contrib}</td>
              </tr>
            ))}
            <tr className="bg-blue-50 font-semibold">
              <td className="p-2" colSpan={5}>Combined Standard Uncertainty u(Pmax)</td>
              <td className="p-2 text-center font-mono">0.75%</td>
              <td className="p-2 text-center"></td>
            </tr>
            <tr className="bg-blue-100 font-bold">
              <td className="p-2" colSpan={5}>Expanded Uncertainty U(Pmax) at k=2 (95.45%)</td>
              <td className="p-2 text-center font-mono text-primary">±1.50%</td>
              <td className="p-2 text-center"></td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>

    {/* Thermal Cycling Uncertainty */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Thermal Cycling / DH / HF (IEC 61215 MQT 11/12/13)</CardTitle>
        <CardDescription className="text-xs">Uncertainty in Pmax degradation measurement after environmental tests</CardDescription>
      </CardHeader>
      <CardContent>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="text-left p-2 font-semibold">Uncertainty Source</th>
              <th className="text-center p-2 font-semibold">Type</th>
              <th className="text-center p-2 font-semibold">Distribution</th>
              <th className="text-center p-2 font-semibold">Typical Value</th>
              <th className="text-center p-2 font-semibold">u(xi) %</th>
            </tr>
          </thead>
          <tbody>
            {[
              { source: "Pre-test Pmax measurement (flasher)", type: "B", dist: "Normal", value: "±1.50%", uxi: "0.75" },
              { source: "Post-test Pmax measurement (flasher)", type: "B", dist: "Normal", value: "±1.50%", uxi: "0.75" },
              { source: "Chamber temperature uniformity", type: "B", dist: "Rectangular", value: "±2°C", uxi: "0.15" },
              { source: "Chamber temperature accuracy", type: "B", dist: "Normal", value: "±1°C", uxi: "0.10" },
              { source: "Humidity accuracy (DH/HF only)", type: "B", dist: "Rectangular", value: "±3% RH", uxi: "0.20" },
              { source: "Cycle count / timer accuracy", type: "B", dist: "Rectangular", value: "negligible", uxi: "0.01" },
              { source: "Module stabilization (light soaking)", type: "B", dist: "Rectangular", value: "±0.5%", uxi: "0.29" },
              { source: "Sample-to-sample variation", type: "A", dist: "Normal", value: "±1.0%", uxi: "0.58" },
            ].map((row, i) => (
              <tr key={i} className={`border-b ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                <td className="p-2">{row.source}</td>
                <td className="p-2 text-center"><Badge variant={row.type === "A" ? "default" : "outline"} className="text-xs">{row.type}</Badge></td>
                <td className="p-2 text-center">{row.dist}</td>
                <td className="p-2 text-center font-mono">{row.value}</td>
                <td className="p-2 text-center font-mono font-semibold">{row.uxi}</td>
              </tr>
            ))}
            <tr className="bg-blue-50 font-semibold">
              <td className="p-2" colSpan={4}>Combined u(ΔPmax) = √(u²_pre + u²_post + u²_chamber + ...)</td>
              <td className="p-2 text-center font-mono">1.25%</td>
            </tr>
            <tr className="bg-blue-100 font-bold">
              <td className="p-2" colSpan={4}>Expanded U(ΔPmax) at k=2</td>
              <td className="p-2 text-center font-mono text-primary">±2.50%</td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>

    {/* Insulation / Wet Leakage */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Insulation / Wet Leakage (IEC 61215 MQT 15 / IEC 61730 MST 16)</CardTitle>
        <CardDescription className="text-xs">Uncertainty in leakage current and dielectric withstand testing</CardDescription>
      </CardHeader>
      <CardContent>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="text-left p-2 font-semibold">Uncertainty Source</th>
              <th className="text-center p-2 font-semibold">Type</th>
              <th className="text-center p-2 font-semibold">Typical Value</th>
              <th className="text-center p-2 font-semibold">u(xi)</th>
            </tr>
          </thead>
          <tbody>
            {[
              { source: "HV power supply voltage accuracy", type: "B", value: "±1% of applied voltage", uxi: "±10V at 1000V" },
              { source: "Leakage current meter accuracy", type: "B", value: "±2% of reading + 0.5 μA", uxi: "±0.5 μA" },
              { source: "Water resistivity variation", type: "B", value: "3500 Ω·cm ± 500", uxi: "±14% on resistance" },
              { source: "Water temperature", type: "B", value: "22°C ± 2°C", uxi: "affects resistivity" },
              { source: "Contact area consistency", type: "B", value: "± 2% area variation", uxi: "±2% on current" },
              { source: "Measurement repeatability", type: "A", value: "±5% of reading", uxi: "from 5 repeat measurements" },
            ].map((row, i) => (
              <tr key={i} className={`border-b ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                <td className="p-2">{row.source}</td>
                <td className="p-2 text-center"><Badge variant={row.type === "A" ? "default" : "outline"} className="text-xs">{row.type}</Badge></td>
                <td className="p-2 text-center font-mono">{row.value}</td>
                <td className="p-2 text-center font-mono font-semibold">{row.uxi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>

    {/* Temperature Coefficient */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Temperature Coefficients (IEC 60891 / IEC 61215 MQT 06)</CardTitle>
        <CardDescription className="text-xs">Uncertainty in α(Isc), β(Voc), γ(Pmax) determination</CardDescription>
      </CardHeader>
      <CardContent>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="text-left p-2 font-semibold">Uncertainty Source</th>
              <th className="text-center p-2 font-semibold">Type</th>
              <th className="text-center p-2 font-semibold">Typical Value</th>
              <th className="text-center p-2 font-semibold">u(xi)</th>
            </tr>
          </thead>
          <tbody>
            {[
              { source: "Temperature measurement (module surface)", type: "B", value: "±1°C across module", uxi: "0.58°C" },
              { source: "Irradiance stability during T sweep", type: "B", value: "±1%", uxi: "0.58%" },
              { source: "Linear regression fit (R²)", type: "A", value: "R² > 0.998 typically", uxi: "from residuals" },
              { source: "Temperature range (25-75°C minimum)", type: "B", value: "≥ 50°C range", uxi: "range dependent" },
              { source: "Isc, Voc, Pmax measurement at each T", type: "B", value: "per flasher budget", uxi: "~0.75% for Pmax" },
              { source: "Number of temperature points", type: "A", value: "≥ 4 points recommended", uxi: "√n dependent" },
            ].map((row, i) => (
              <tr key={i} className={`border-b ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                <td className="p-2">{row.source}</td>
                <td className="p-2 text-center"><Badge variant={row.type === "A" ? "default" : "outline"} className="text-xs">{row.type}</Badge></td>
                <td className="p-2 text-center font-mono">{row.value}</td>
                <td className="p-2 text-center font-mono font-semibold">{row.uxi}</td>
              </tr>
            ))}
            <tr className="bg-blue-50 font-semibold">
              <td className="p-2" colSpan={3}>Typical expanded uncertainty U(γ) at k=2</td>
              <td className="p-2 text-center font-mono text-primary">±5-10% of γ value</td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>

    {/* GUM Process Summary */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">GUM Evaluation Process (JCGM 100:2008)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { step: "1", title: "Define Measurand", desc: "Identify the quantity to be measured (Pmax, Isc, Voc, etc.)" },
            { step: "2", title: "Identify Sources", desc: "List all sources of uncertainty (equipment, environment, method, operator)" },
            { step: "3", title: "Quantify Components", desc: "Evaluate Type A (statistical) and Type B (other) uncertainties for each source" },
            { step: "4", title: "Combine (RSS)", desc: "Calculate combined standard uncertainty: uc = √Σ(ci·ui)² using sensitivity coefficients" },
            { step: "5", title: "Expand (k=2)", desc: "Apply coverage factor k=2 for ~95.45% confidence: U = k × uc" },
          ].map((s) => (
            <div key={s.step} className="p-3 rounded-lg border bg-muted/30 text-center">
              <div className="text-lg font-bold text-primary mb-1">Step {s.step}</div>
              <div className="text-xs font-semibold mb-1">{s.title}</div>
              <div className="text-xs text-muted-foreground">{s.desc}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
)}
    </div>
  );
}
