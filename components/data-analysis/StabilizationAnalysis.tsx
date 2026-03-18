// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine, Cell, ComposedChart, Area
} from "recharts"
import { CheckCircle, XCircle, Sun, TrendingUp, Thermometer } from "lucide-react"

// ─── Types & Constants ──────────────────────────────────────────────────────

type Technology = "c-Si" | "CdTe" | "CIGS" | "a-Si" | "HJT" | "TOPCon" | "Perovskite"

interface StabilizationCriteria {
  maxDelta: number // % between consecutive measurements
  description: string
  needsAnnealing: boolean
  annealingTemp: number // °C
  annealingHours: number
}

const TECH_CRITERIA: Record<Technology, StabilizationCriteria> = {
  "c-Si":       { maxDelta: 2,  description: "±2% Pmax between consecutive measurements", needsAnnealing: false, annealingTemp: 0, annealingHours: 0 },
  "CdTe":      { maxDelta: 3,  description: "±3% Pmax; requires extended light soaking", needsAnnealing: true, annealingTemp: 70, annealingHours: 48 },
  "CIGS":      { maxDelta: 3,  description: "±3% Pmax; metastable behavior expected", needsAnnealing: true, annealingTemp: 85, annealingHours: 24 },
  "a-Si":      { maxDelta: 5,  description: "±5% Pmax; Staebler-Wronski effect", needsAnnealing: true, annealingTemp: 70, annealingHours: 100 },
  "HJT":       { maxDelta: 2,  description: "±2% Pmax between consecutive measurements", needsAnnealing: false, annealingTemp: 0, annealingHours: 0 },
  "TOPCon":    { maxDelta: 2,  description: "±2% Pmax between consecutive measurements", needsAnnealing: false, annealingTemp: 0, annealingHours: 0 },
  "Perovskite": { maxDelta: 5, description: "±5% Pmax; significant LID/LeTID expected", needsAnnealing: true, annealingTemp: 85, annealingHours: 72 },
}

const TECH_COLORS: Record<Technology, string> = {
  "c-Si": "#f59e0b",
  "CdTe": "#3b82f6",
  "CIGS": "#8b5cf6",
  "a-Si": "#ef4444",
  "HJT": "#22c55e",
  "TOPCon": "#06b6d4",
  "Perovskite": "#ec4899",
}

// Sample data for each technology
const SAMPLE_POWER_STAGES: Record<Technology, { P0: number; P1: number; P2: number; P3: number }> = {
  "c-Si":       { P0: 550, P1: 547, P2: 543, P3: 545 },
  "CdTe":      { P0: 420, P1: 412, P2: 405, P3: 410 },
  "CIGS":      { P0: 380, P1: 374, P2: 368, P3: 372 },
  "a-Si":      { P0: 300, P1: 285, P2: 270, P3: 275 },
  "HJT":       { P0: 560, P1: 557, P2: 554, P3: 556 },
  "TOPCon":    { P0: 570, P1: 568, P2: 564, P3: 566 },
  "Perovskite": { P0: 350, P1: 330, P2: 315, P3: 320 },
}

// Light soaking exposure data (kWh/m²) vs Pmax
function genExposureData(tech: Technology) {
  const stages = SAMPLE_POWER_STAGES[tech]
  const points = []
  const exposures = [0, 5, 10, 15, 20, 30, 40, 50, 60, 80, 100, 120, 150]
  const P0 = stages.P0
  const P3 = stages.P3

  for (let i = 0; i < exposures.length; i++) {
    const kWh = exposures[i]
    const progress = Math.min(1, kWh / 120)
    const pmax = P0 + (P3 - P0) * (1 - Math.exp(-3 * progress)) + (Math.random() - 0.5) * 2
    points.push({
      kWh,
      pmax: parseFloat(pmax.toFixed(1)),
      pct: parseFloat((pmax / P0 * 100).toFixed(2)),
    })
  }
  return points
}

// Annealing cycle data for thin-film technologies
function genAnnealingData(tech: Technology) {
  const criteria = TECH_CRITERIA[tech]
  if (!criteria.needsAnnealing) return []

  const stages = SAMPLE_POWER_STAGES[tech]
  const P2 = stages.P2 // post-degradation
  const P3 = stages.P3 // recovered
  const totalHours = criteria.annealingHours
  const points = []

  // Temperature profile (ramp up, hold, cool down) and Pmax recovery
  const timeSteps = [0, 2, 4, 8, 12, 16, 20, 24, 36, 48, 60, 72, 96, 100]
    .filter(h => h <= totalHours + 4)

  for (const h of timeSteps) {
    // Temperature ramp: reach annealingTemp in first 2h, hold, cool in last 4h
    let temp = 25
    if (h <= 2) temp = 25 + (criteria.annealingTemp - 25) * (h / 2)
    else if (h >= totalHours - 2) temp = criteria.annealingTemp - (criteria.annealingTemp - 25) * Math.min(1, (h - totalHours + 2) / 4)
    else temp = criteria.annealingTemp

    // Pmax recovery follows exponential
    const progress = Math.min(1, h / (totalHours * 0.7))
    const pmax = P2 + (P3 - P2) * (1 - Math.exp(-3 * progress)) + (Math.random() - 0.5) * 1
    points.push({
      hours: h,
      temperature: parseFloat(temp.toFixed(0)),
      pmax: parseFloat(pmax.toFixed(1)),
      pct_recovery: parseFloat(((pmax - P2) / (P3 - P2) * 100).toFixed(1)),
    })
  }
  return points
}

// Consecutive measurement data for stabilization check
function genConsecutiveMeasurements(tech: Technology) {
  const stages = SAMPLE_POWER_STAGES[tech]
  const P3 = stages.P3
  const criteria = TECH_CRITERIA[tech]
  const measurements = []
  for (let i = 1; i <= 6; i++) {
    const pmax = P3 + (Math.random() - 0.5) * P3 * criteria.maxDelta / 100 * 0.8
    measurements.push({
      measurement: `M${i}`,
      pmax: parseFloat(pmax.toFixed(1)),
    })
  }
  return measurements
}

const STAGE_COLORS = ["#f59e0b", "#3b82f6", "#ef4444", "#22c55e"]

export function StabilizationAnalysis() {
  const [selectedTech, setSelectedTech] = useState<Technology>("c-Si")

  const stages = SAMPLE_POWER_STAGES[selectedTech]
  const criteria = TECH_CRITERIA[selectedTech]

  const barData = useMemo(() => [
    { stage: "P0 (Initial)", power: stages.P0, label: "P0" },
    { stage: "P1 (Conditioned)", power: stages.P1, label: "P1" },
    { stage: "P2 (Exposed)", power: stages.P2, label: "P2" },
    { stage: "P3 (Stabilized)", power: stages.P3, label: "P3" },
  ], [stages])

  // Check stabilization criteria
  const stabilizationChecks = useMemo(() => {
    const vals = [stages.P0, stages.P1, stages.P2, stages.P3]
    const checks = []
    for (let i = 1; i < vals.length; i++) {
      const delta = Math.abs((vals[i] - vals[i - 1]) / vals[i - 1] * 100)
      checks.push({
        from: `P${i - 1}`,
        to: `P${i}`,
        delta: parseFloat(delta.toFixed(2)),
        pass: delta <= criteria.maxDelta,
      })
    }
    return checks
  }, [stages, criteria])

  const allPass = stabilizationChecks.every(c => c.pass)
  const overallDegradation = parseFloat(((stages.P3 - stages.P0) / stages.P0 * 100).toFixed(2))

  const exposureData = useMemo(() => genExposureData(selectedTech), [selectedTech])
  const annealingData = useMemo(() => genAnnealingData(selectedTech), [selectedTech])
  const consecutiveData = useMemo(() => genConsecutiveMeasurements(selectedTech), [selectedTech])

  // Check consecutive measurements pass
  const consecutiveChecks = useMemo(() => {
    const checks = []
    for (let i = 1; i < consecutiveData.length; i++) {
      const delta = Math.abs((consecutiveData[i].pmax - consecutiveData[i - 1].pmax) / consecutiveData[i - 1].pmax * 100)
      checks.push({
        from: consecutiveData[i - 1].measurement,
        to: consecutiveData[i].measurement,
        delta: parseFloat(delta.toFixed(3)),
        pass: delta <= criteria.maxDelta,
      })
    }
    return checks
  }, [consecutiveData, criteria])

  const consecutiveAllPass = consecutiveChecks.every(c => c.pass)

  return (
    <div className="space-y-4">
      {/* Technology Selector + Summary */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-xs text-gray-500 self-center mr-1">Technology:</span>
        {(Object.keys(TECH_CRITERIA) as Technology[]).map(tech => (
          <button key={tech} onClick={() => setSelectedTech(tech)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${selectedTech === tech ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {tech}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <Badge className={allPass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
            {allPass ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
            {allPass ? "STABILIZED" : "NOT STABILIZED"}
          </Badge>
          {criteria.needsAnnealing && (
            <Badge className="bg-purple-100 text-purple-700">
              <Thermometer className="mr-1 h-3 w-3" />
              Annealing Required
            </Badge>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-amber-600">{stages.P0} W</div>
            <div className="text-xs text-gray-500">P0 (Initial)</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-green-600">{stages.P3} W</div>
            <div className="text-xs text-gray-500">P3 (Stabilized)</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className={`text-2xl font-bold ${Math.abs(overallDegradation) <= 5 ? "text-green-600" : "text-red-600"}`}>
              {overallDegradation}%
            </div>
            <div className="text-xs text-gray-500">Overall Change</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold" style={{ color: TECH_COLORS[selectedTech] }}>
              {selectedTech}
            </div>
            <div className="text-xs text-gray-500">Technology</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <Badge className={consecutiveAllPass ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
              {consecutiveAllPass ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
              {consecutiveAllPass ? "±" + criteria.maxDelta + "% MET" : "CHECK"}
            </Badge>
            <div className="text-xs text-gray-500 mt-1">Consecutive Check</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* P0/P1/P2/P3 Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" />
              Power at Each Stabilization Stage
            </CardTitle>
            <CardDescription className="text-xs">IEC 61215-2 MQT 19 · {selectedTech} module</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="stage" tick={{ fontSize: 9 }} />
                <YAxis domain={["dataMin - 20", "dataMax + 10"]} tick={{ fontSize: 10 }}
                       label={{ value: "Pmax (W)", angle: -90, position: "insideLeft", fontSize: 9 }} />
                <Tooltip formatter={(v: any) => [`${v} W`, "Pmax"]} />
                <Bar dataKey="power" name="Pmax (W)" maxBarSize={50} radius={[4, 4, 0, 0]}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={STAGE_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pmax vs kWh/m² Exposure */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Pmax vs Cumulative Light Soaking
            </CardTitle>
            <CardDescription className="text-xs">Power tracking during light soaking exposure (kWh/m²)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={exposureData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="kWh" tick={{ fontSize: 10 }}
                       label={{ value: "Cumulative Exposure (kWh/m²)", position: "insideBottom", offset: -5, fontSize: 9 }} />
                <YAxis domain={["dataMin - 5", "dataMax + 5"]} tick={{ fontSize: 10 }}
                       label={{ value: "Pmax (W)", angle: -90, position: "insideLeft", fontSize: 9 }} />
                <Tooltip formatter={(v: any, name: string) => [name === "pmax" ? `${v} W` : `${v}%`, name === "pmax" ? "Pmax" : "% of P0"]} />
                <ReferenceLine y={stages.P3} stroke="#22c55e" strokeDasharray="4 2"
                               label={{ value: `P3=${stages.P3}W`, fill: "#22c55e", fontSize: 9 }} />
                <Line type="monotone" dataKey="pmax" stroke={TECH_COLORS[selectedTech]} strokeWidth={2} dot={{ r: 3 }} name="Pmax" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Consecutive Measurement Stabilization Check */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Consecutive Measurement Check</CardTitle>
            <CardDescription className="text-xs">
              {selectedTech}: {criteria.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={consecutiveData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="measurement" tick={{ fontSize: 10 }} />
                <YAxis domain={["dataMin - 3", "dataMax + 3"]} tick={{ fontSize: 10 }}
                       label={{ value: "Pmax (W)", angle: -90, position: "insideLeft", fontSize: 9 }} />
                <Tooltip formatter={(v: any) => [`${v} W`, "Pmax"]} />
                <ReferenceLine y={stages.P3 * (1 + criteria.maxDelta / 100)} stroke="#ef4444" strokeDasharray="4 2" />
                <ReferenceLine y={stages.P3 * (1 - criteria.maxDelta / 100)} stroke="#ef4444" strokeDasharray="4 2"
                               label={{ value: `±${criteria.maxDelta}% band`, fill: "#ef4444", fontSize: 9 }} />
                <Area type="monotone" dataKey="pmax" fill={TECH_COLORS[selectedTech]} fillOpacity={0.1} stroke="none" />
                <Line type="monotone" dataKey="pmax" stroke={TECH_COLORS[selectedTech]} strokeWidth={2} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1">
              {consecutiveChecks.map(c => (
                <div key={`${c.from}-${c.to}`} className="flex items-center justify-between text-xs px-2 py-1 border-b last:border-0">
                  <span className="font-mono text-muted-foreground">{c.from} → {c.to}</span>
                  <span className="font-mono">ΔPmax = {c.delta.toFixed(3)}%</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${c.pass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {c.pass ? "PASS" : "FAIL"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Annealing Cycle (only for thin-film) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-purple-500" />
              {criteria.needsAnnealing ? "Annealing Cycle – Pmax Recovery" : "No Annealing Required"}
            </CardTitle>
            <CardDescription className="text-xs">
              {criteria.needsAnnealing
                ? `${criteria.annealingTemp}°C for ${criteria.annealingHours}h – temperature profile & power recovery`
                : `${selectedTech} (crystalline) does not require thermal annealing`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {criteria.needsAnnealing && annealingData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={annealingData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="hours" tick={{ fontSize: 10 }}
                         label={{ value: "Time (hours)", position: "insideBottom", offset: -5, fontSize: 9 }} />
                  <YAxis yAxisId="pmax" tick={{ fontSize: 10 }}
                         label={{ value: "Pmax (W)", angle: -90, position: "insideLeft", fontSize: 9 }} />
                  <YAxis yAxisId="temp" orientation="right" domain={[0, 100]} tick={{ fontSize: 10 }}
                         label={{ value: "Temp (°C)", angle: 90, position: "insideRight", fontSize: 9 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area yAxisId="temp" type="monotone" dataKey="temperature" fill="#fde68a" fillOpacity={0.3}
                        stroke="#f59e0b" strokeWidth={1.5} name="Temperature (°C)" />
                  <Line yAxisId="pmax" type="monotone" dataKey="pmax" stroke="#8b5cf6" strokeWidth={2.5}
                        dot={{ r: 3 }} name="Pmax (W)" />
                  <ReferenceLine yAxisId="pmax" y={stages.P3} stroke="#22c55e" strokeDasharray="4 2"
                                 label={{ value: `P3=${stages.P3}W`, fill: "#22c55e", fontSize: 9 }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-2" />
                  <p>Crystalline silicon ({selectedTech}) stabilizes through light soaking only.</p>
                  <p className="text-xs mt-1">No thermal annealing cycle required per IEC 61215.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stabilization Criteria Check */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Stabilization Stage Criteria Check</CardTitle>
            <CardDescription className="text-xs">{selectedTech}: {criteria.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-semibold">Transition</th>
                    <th className="text-right py-2 pr-4 font-semibold">From (W)</th>
                    <th className="text-right py-2 pr-4 font-semibold">To (W)</th>
                    <th className="text-right py-2 pr-4 font-semibold">|ΔPmax| (%)</th>
                    <th className="text-right py-2 pr-4 font-semibold">Limit (%)</th>
                    <th className="text-center py-2 font-semibold">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {stabilizationChecks.map(({ from, to, delta, pass }) => {
                    const fromVal = stages[from as keyof typeof stages]
                    const toVal = stages[to as keyof typeof stages]
                    return (
                      <tr key={`${from}-${to}`} className={`border-b ${!pass ? "bg-red-50" : ""}`}>
                        <td className="py-2 pr-4 font-mono font-bold text-muted-foreground">{from} → {to}</td>
                        <td className="py-2 pr-4 text-right font-mono">{fromVal} W</td>
                        <td className="py-2 pr-4 text-right font-mono">{toVal} W</td>
                        <td className={`py-2 pr-4 text-right font-mono font-bold ${delta > criteria.maxDelta ? "text-red-600" : "text-green-600"}`}>
                          {delta.toFixed(2)}%
                        </td>
                        <td className="py-2 pr-4 text-right text-muted-foreground">≤ {criteria.maxDelta}%</td>
                        <td className="py-2 text-center">
                          <span className={`px-2 py-0.5 rounded font-bold text-xs ${pass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {pass ? "PASS" : "FAIL"}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IEC Reference */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-3 pb-3">
          <div className="text-xs text-amber-800">
            <span className="font-semibold">IEC 61215-2 MQT 19 (Stabilization):</span>{" "}
            Module power is measured at each stage: P0 (initial flash), P1 (after thermal conditioning at 85°C for 48h),
            P2 (after light soaking exposure), P3 (stabilized value used for subsequent tests).
            Stabilization criterion for crystalline Si: consecutive Pmax measurements within ±2% under standard test conditions.
            Thin-film technologies (a-Si, CdTe, CIGS, Perovskite) may require extended exposure and thermal annealing cycles
            due to metastable effects (Staebler-Wronski for a-Si, light-induced recovery for CdTe/CIGS).
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
