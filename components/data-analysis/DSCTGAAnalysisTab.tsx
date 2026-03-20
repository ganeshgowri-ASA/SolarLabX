// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine,
} from "recharts"
import { Thermometer, FlaskConical, Layers, Activity } from "lucide-react"
import { IECStandardCard } from "./IECStandardCard"
import { ExportDropdown } from "./ExportDropdown"

// ─── Sample Data ─────────────────────────────────────────────────────────────

const SAMPLES = [
  // Encapsulant samples
  { id: "ENC-001", material: "EVA",       tg: -28.4, enthalpy: 42.1, crosslinkDensity: 82.3, cureDegree: 91.2, decompOnset: 312, massLoss400: 8.4, residue: 91.6 },
  { id: "ENC-002", material: "EVA",       tg: -27.9, enthalpy: 41.6, crosslinkDensity: 80.1, cureDegree: 88.7, decompOnset: 308, massLoss400: 9.1, residue: 90.9 },
  { id: "ENC-003", material: "POE",       tg: -52.6, enthalpy: 38.4, crosslinkDensity: 74.8, cureDegree: 85.3, decompOnset: 356, massLoss400: 5.2, residue: 94.8 },
  { id: "ENC-004", material: "POE",       tg: -51.8, enthalpy: 37.9, crosslinkDensity: 73.4, cureDegree: 84.1, decompOnset: 352, massLoss400: 5.8, residue: 94.2 },
  { id: "ENC-005", material: "EVA",       tg: -30.2, enthalpy: 39.8, crosslinkDensity: 68.5, cureDegree: 76.3, decompOnset: 298, massLoss400: 12.7, residue: 87.3 },
  // Backsheet samples
  { id: "BS-001",  material: "PVF/PET",   tg:  78.6, enthalpy: 22.3, crosslinkDensity: null, cureDegree: null, decompOnset: 381, massLoss400: 3.1, residue: 96.9 },
  { id: "BS-002",  material: "PVDF/PET",  tg:  76.2, enthalpy: 21.8, crosslinkDensity: null, cureDegree: null, decompOnset: 392, massLoss400: 2.7, residue: 97.3 },
  { id: "BS-003",  material: "PA/PET",    tg:  80.1, enthalpy: 23.5, crosslinkDensity: null, cureDegree: null, decompOnset: 368, massLoss400: 4.3, residue: 95.7 },
]

// Pass/fail thresholds
const PASS_THRESHOLDS = {
  crosslinkDensity: 70,   // % - minimum
  cureDegree: 80,         // % - minimum
  decompOnset: 300,       // °C - minimum
  massLoss400: 10,        // % - maximum
}

function samplePass(s: typeof SAMPLES[0]) {
  if (s.crosslinkDensity !== null && s.crosslinkDensity < PASS_THRESHOLDS.crosslinkDensity) return false
  if (s.cureDegree !== null && s.cureDegree < PASS_THRESHOLDS.cureDegree) return false
  if (s.decompOnset < PASS_THRESHOLDS.decompOnset) return false
  if (s.massLoss400 > PASS_THRESHOLDS.massLoss400) return false
  return true
}

// ─── DSC Thermogram Data (realistic EVA glass transition + cure exotherm) ────
// Simulates a DSC heat-flow curve (mW/mg) vs Temperature (°C)
// Negative = exothermic convention (ASTM/ISO DSC)
const DSC_THERMOGRAM = (() => {
  const pts: { temperature: number; heatFlow: number }[] = []
  for (let t = -80; t <= 250; t += 2) {
    let hf = 0.0

    // Baseline drift
    hf += 0.002 * t - 0.15

    // Glass transition step near -28°C (EVA) - sigmoid-like step up
    const tg = -28
    hf += 0.18 / (1 + Math.exp((tg - t) / 3))

    // Melting endotherm near 68°C (EVA crystalline fraction)
    const tm = 68
    const meltWidth = 6
    hf += 1.4 * Math.exp(-0.5 * ((t - tm) / meltWidth) ** 2)

    // Crosslinking cure exotherm peak near 145°C (broad)
    const tcure = 145
    const cureWidth = 18
    hf -= 2.1 * Math.exp(-0.5 * ((t - tcure) / cureWidth) ** 2)

    // Small noise
    hf += (Math.random() - 0.5) * 0.05

    pts.push({ temperature: t, heatFlow: parseFloat(hf.toFixed(3)) })
  }
  return pts
})()

// ─── TGA Curve Data (EVA decomposition) ──────────────────────────────────────
// Mass (%) vs Temperature (°C) — multi-step decomposition
const TGA_CURVE = (() => {
  const pts: { temperature: number; mass: number }[] = []
  for (let t = 30; t <= 700; t += 5) {
    let mass = 100

    // Minor moisture/additive loss 100–200°C (~1%)
    if (t > 100) {
      mass -= 1.0 * Math.min(1, (t - 100) / 80)
    }

    // Main decomposition step 300–450°C: EVA loses ~8% (acetic acid)
    if (t > 300) {
      const step1 = 8.5 / (1 + Math.exp(-(t - 360) / 18))
      mass -= step1
    }

    // Second decomposition 450–600°C: polymer backbone breakdown (~75%)
    if (t > 440) {
      const step2 = 74 / (1 + Math.exp(-(t - 490) / 20))
      mass -= step2
    }

    // Residue ~16% (carbon black, inorganic filler)
    mass = Math.max(16.2, mass)

    // Small noise
    mass += (Math.random() - 0.5) * 0.15

    pts.push({ temperature: t, mass: parseFloat(mass.toFixed(2)) })
  }
  return pts
})()

// ─── KPI Aggregates ───────────────────────────────────────────────────────────

function kpiValues() {
  const encSamples = SAMPLES.filter((s) => s.crosslinkDensity !== null)
  const avgTg = parseFloat(
    (SAMPLES.reduce((a, s) => a + s.tg, 0) / SAMPLES.length).toFixed(1)
  )
  const avgXLD = parseFloat(
    (encSamples.reduce((a, s) => a + s.crosslinkDensity!, 0) / encSamples.length).toFixed(1)
  )
  const avgDecomp = parseFloat(
    (SAMPLES.reduce((a, s) => a + s.decompOnset, 0) / SAMPLES.length).toFixed(1)
  )
  const avgCure = parseFloat(
    (encSamples.reduce((a, s) => a + s.cureDegree!, 0) / encSamples.length).toFixed(1)
  )
  return { avgTg, avgXLD, avgDecomp, avgCure }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DSCTGAAnalysisTab() {
  const kpi = useMemo(() => kpiValues(), [])

  const tableData = useMemo(() =>
    SAMPLES.map((s) => ({ ...s, pass: samplePass(s) })), []
  )

  const exportData = tableData.map((s) => ({
    "Sample ID": s.id,
    "Material": s.material,
    "Tg (°C)": s.tg,
    "Enthalpy (J/g)": s.enthalpy,
    "Crosslink Density (%)": s.crosslinkDensity ?? "N/A",
    "Cure Degree (%)": s.cureDegree ?? "N/A",
    "Decomp. Onset (°C)": s.decompOnset,
    "Mass Loss @ 400°C (%)": s.massLoss400,
    "Residue (%)": s.residue,
    "Result": s.pass ? "PASS" : "FAIL",
  }))

  return (
    <div className="space-y-4">
      {/* IEC Standard Card */}
      <IECStandardCard
        standard="IEC 62788"
        title="Measurement procedures for materials used in photovoltaic modules — DSC/TGA material characterization"
        testConditions={[
          "DSC (Differential Scanning Calorimetry): Glass transition temperature (Tg), melting/crystallization enthalpy, cure exotherm",
          "TGA (Thermogravimetric Analysis): Onset decomposition temperature, stepwise mass loss, inorganic residue",
          "Encapsulant characterization: EVA and POE crosslink density, cure degree via gel content correlation",
          "Backsheet characterization: PVF, PVDF, PA layer thermal stability per IEC 62788-2-1",
          "Heating rate: 10°C/min (DSC), 10–20°C/min (TGA), inert or oxidative atmosphere",
        ]}
        dosageLevels={[
          "DSC range: −100°C to +300°C (encapsulants), −50°C to +350°C (backsheets)",
          "TGA range: 30°C to 700°C, nitrogen atmosphere (pyrolysis mode)",
          "Sample mass: 5–15 mg (DSC), 10–20 mg (TGA), crimped Al pans",
          "Crosslink density: ASTM D2765 xylene extraction or DSC ΔH correlation",
        ]}
        passCriteria={[
          { parameter: "Crosslink density (EVA)", requirement: "≥ 70% (ASTM D2765)", note: "Typ. 75–90% for quality EVA" },
          { parameter: "Cure degree", requirement: "≥ 80%", note: "Confirmed by residual exotherm <20%" },
          { parameter: "Decomposition onset", requirement: "≥ 300°C", note: "No premature degradation" },
          { parameter: "Mass loss @ 400°C", requirement: "≤ 10%", note: "Acetic acid + additives only" },
          { parameter: "Tg (EVA)", requirement: "< −20°C", note: "Flexibility at low temp maintained" },
          { parameter: "Tg (Backsheet PET)", requirement: "70–85°C", note: "Structural layer integrity" },
        ]}
        failCriteria={[
          { parameter: "Under-cured EVA", requirement: "Crosslink density < 70% → delamination risk under damp-heat" },
          { parameter: "Low decomp. onset", requirement: "< 300°C indicates additive migration / early degradation" },
          { parameter: "Excessive mass loss", requirement: "> 10% at 400°C → outgassing risk in module lamination" },
        ]}
        notes={[
          "IEC 62788-1-6 specifies encapsulant material properties; crosslink density directly correlates with long-term adhesion retention",
          "POE encapsulants have lower Tg (≈ −55°C) and higher thermal stability vs EVA — superior for humid climates",
          "TGA residue content identifies inorganic filler loading and validates material composition conformance",
        ]}
      />

      {/* Export */}
      <div className="flex justify-end">
        <ExportDropdown
          config={{
            data: exportData,
            filename: "IEC62788_DSC_TGA_Analysis",
            title: "IEC 62788 DSC/TGA Material Analysis",
            standard: "IEC 62788",
            description: "DSC thermogram, TGA decomposition and material characterization data for encapsulants and backsheets",
            sheetName: "DSC TGA Data",
            orientation: "landscape",
          }}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription className="flex items-center gap-1">
              <Thermometer className="h-3.5 w-3.5 text-blue-500" />
              Glass Transition Temp
            </CardDescription>
            <div className="text-2xl font-bold text-blue-600">{kpi.avgTg}°C</div>
            <p className="text-xs text-muted-foreground">Average Tg across all samples</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription className="flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-purple-500" />
              Crosslink Density
            </CardDescription>
            <div className="text-2xl font-bold text-purple-600">{kpi.avgXLD}%</div>
            <p className="text-xs text-muted-foreground">Encapsulant avg (EVA + POE)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription className="flex items-center gap-1">
              <FlaskConical className="h-3.5 w-3.5 text-red-500" />
              Decomposition Temp
            </CardDescription>
            <div className="text-2xl font-bold text-red-600">{kpi.avgDecomp}°C</div>
            <p className="text-xs text-muted-foreground">TGA onset avg, all samples</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-green-500" />
              Cure Degree
            </CardDescription>
            <div className="text-2xl font-bold text-green-600">{kpi.avgCure}%</div>
            <p className="text-xs text-muted-foreground">Encapsulant cure avg</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* DSC Thermogram */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">DSC Thermogram — EVA Encapsulant (ENC-001)</CardTitle>
            <CardDescription className="text-xs">
              Heat flow (mW/mg) vs Temperature (°C) · Heating rate: 10°C/min · N₂ atmosphere
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={DSC_THERMOGRAM} margin={{ top: 4, right: 16, bottom: 20, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="temperature"
                  type="number"
                  domain={[-80, 250]}
                  tickCount={9}
                  label={{ value: "Temperature (°C)", position: "insideBottom", offset: -10, fontSize: 9 }}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  label={{ value: "Heat Flow (mW/mg)", angle: -90, position: "insideLeft", offset: 10, fontSize: 9 }}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  formatter={(v: number) => [`${v.toFixed(3)} mW/mg`, "Heat Flow"]}
                  labelFormatter={(l) => `Temp: ${l}°C`}
                />
                {/* Tg reference */}
                <ReferenceLine
                  x={-28}
                  stroke="#8b5cf6"
                  strokeDasharray="4 2"
                  label={{ value: "Tg (−28°C)", fill: "#8b5cf6", fontSize: 8, position: "top" }}
                />
                {/* Melting endotherm reference */}
                <ReferenceLine
                  x={68}
                  stroke="#3b82f6"
                  strokeDasharray="4 2"
                  label={{ value: "Tm (68°C)", fill: "#3b82f6", fontSize: 8, position: "top" }}
                />
                {/* Cure exotherm reference */}
                <ReferenceLine
                  x={145}
                  stroke="#ef4444"
                  strokeDasharray="4 2"
                  label={{ value: "Cure (145°C)", fill: "#ef4444", fontSize: 8, position: "top" }}
                />
                <Line
                  type="monotone"
                  dataKey="heatFlow"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Heat Flow"
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="mt-1 text-xs text-muted-foreground">
              Endothermic up · Tg step at −28°C · Melting endotherm at 68°C · Cure exotherm at 145°C
            </p>
          </CardContent>
        </Card>

        {/* TGA Curve */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">TGA Curve — EVA Encapsulant (ENC-001)</CardTitle>
            <CardDescription className="text-xs">
              Mass (%) vs Temperature (°C) · 10°C/min · N₂ atmosphere · Multi-step decomposition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={TGA_CURVE} margin={{ top: 4, right: 16, bottom: 20, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="temperature"
                  type="number"
                  domain={[30, 700]}
                  tickCount={8}
                  label={{ value: "Temperature (°C)", position: "insideBottom", offset: -10, fontSize: 9 }}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  domain={[0, 105]}
                  label={{ value: "Mass (%)", angle: -90, position: "insideLeft", offset: 10, fontSize: 9 }}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  formatter={(v: number) => [`${v.toFixed(2)}%`, "Mass"]}
                  labelFormatter={(l) => `Temp: ${l}°C`}
                />
                {/* Decomposition onset */}
                <ReferenceLine
                  x={312}
                  stroke="#f59e0b"
                  strokeDasharray="4 2"
                  label={{ value: "Onset (312°C)", fill: "#f59e0b", fontSize: 8, position: "insideTopRight" }}
                />
                {/* 400°C mass loss marker */}
                <ReferenceLine
                  x={400}
                  stroke="#ef4444"
                  strokeDasharray="4 2"
                  label={{ value: "400°C", fill: "#ef4444", fontSize: 8, position: "top" }}
                />
                <Line
                  type="monotone"
                  dataKey="mass"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="Mass"
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="mt-1 text-xs text-muted-foreground">
              Step 1 (~312°C): acetic acid release · Step 2 (~490°C): backbone pyrolysis · Residue ~16%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sample Data Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-blue-500" />
            DSC / TGA Sample Results — Encapsulants &amp; Backsheets
          </CardTitle>
          <CardDescription className="text-xs">
            5 encapsulant samples (EVA/POE) and 3 backsheet samples · Pass thresholds: crosslink ≥70%, cure ≥80%, decomp onset ≥300°C, mass loss ≤10%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-3 text-left font-semibold">Sample ID</th>
                  <th className="py-2 px-2 text-left font-semibold">Material</th>
                  <th className="py-2 px-2 text-right font-semibold">Tg (°C)</th>
                  <th className="py-2 px-2 text-right font-semibold">Crosslink (%)</th>
                  <th className="py-2 px-2 text-right font-semibold">Cure (%)</th>
                  <th className="py-2 px-2 text-right font-semibold">Decomp Onset (°C)</th>
                  <th className="py-2 px-2 text-right font-semibold">Mass Loss @ 400°C (%)</th>
                  <th className="py-2 px-2 text-center font-semibold">Result</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((s) => (
                  <tr key={s.id} className={`border-b hover:bg-muted/50 ${!s.pass ? "bg-red-50/40" : ""}`}>
                    <td className="py-1.5 pr-3 font-mono font-semibold">{s.id}</td>
                    <td className="py-1.5 px-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          s.material.startsWith("EVA") ? "border-amber-400 text-amber-700" :
                          s.material.startsWith("POE") ? "border-blue-400 text-blue-700" :
                          "border-slate-400 text-slate-700"
                        }`}
                      >
                        {s.material}
                      </Badge>
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono">{s.tg}</td>
                    <td className={`py-1.5 px-2 text-right font-mono ${
                      s.crosslinkDensity !== null && s.crosslinkDensity < PASS_THRESHOLDS.crosslinkDensity
                        ? "text-red-600 font-bold" : ""
                    }`}>
                      {s.crosslinkDensity !== null ? s.crosslinkDensity : "—"}
                    </td>
                    <td className={`py-1.5 px-2 text-right font-mono ${
                      s.cureDegree !== null && s.cureDegree < PASS_THRESHOLDS.cureDegree
                        ? "text-red-600 font-bold" : ""
                    }`}>
                      {s.cureDegree !== null ? s.cureDegree : "—"}
                    </td>
                    <td className={`py-1.5 px-2 text-right font-mono ${
                      s.decompOnset < PASS_THRESHOLDS.decompOnset ? "text-red-600 font-bold" : ""
                    }`}>
                      {s.decompOnset}
                    </td>
                    <td className={`py-1.5 px-2 text-right font-mono ${
                      s.massLoss400 > PASS_THRESHOLDS.massLoss400 ? "text-red-600 font-bold" : ""
                    }`}>
                      {s.massLoss400}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <Badge
                        variant={s.pass ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {s.pass ? "PASS" : "FAIL"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Crosslink density and cure degree not applicable (—) for backsheet samples. Red values indicate criterion failure.
          </p>
        </CardContent>
      </Card>

      {/* Amber Reference Note */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-3 pb-3">
          <div className="text-xs text-amber-800">
            <span className="font-semibold">IEC 62788 Material Characterization:</span>{" "}
            DSC and TGA are foundational techniques for qualifying encapsulant and backsheet materials used in PV modules.
            Insufficient EVA crosslink density (&lt;70%) is a primary cause of delamination after damp-heat stress (IEC 61215 MQT 13),
            leading to catastrophic power loss. POE encapsulants exhibit superior thermal stability (decomp onset ~350°C) and
            moisture resistance compared to EVA, making them preferred for humid climate deployments.
            TGA mass-loss profiling at 400°C identifies excessive acetic acid outgassing risk during module lamination,
            which can cause adhesion failure and cell corrosion. Regular incoming material characterization per IEC 62788
            is essential for maintaining ISO 17025 accreditation and ensuring long-term PV reliability.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
