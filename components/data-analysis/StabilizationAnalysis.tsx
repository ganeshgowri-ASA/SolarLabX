// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine, Cell
} from "recharts"
import { CheckCircle, XCircle, Sun, TrendingUp } from "lucide-react"

// ─── Types & Constants ──────────────────────────────────────────────────────

type Technology = "c-Si" | "CdTe" | "CIGS" | "a-Si" | "HJT" | "TOPCon" | "Perovskite"

interface StabilizationCriteria {
  maxDelta: number // % between consecutive measurements
  description: string
}

const TECH_CRITERIA: Record<Technology, StabilizationCriteria> = {
  "c-Si":       { maxDelta: 2,  description: "±2% Pmax between consecutive measurements" },
  "CdTe":      { maxDelta: 3,  description: "±3% Pmax; requires extended light soaking" },
  "CIGS":      { maxDelta: 3,  description: "±3% Pmax; metastable behavior expected" },
  "a-Si":      { maxDelta: 5,  description: "±5% Pmax; Staebler-Wronski effect" },
  "HJT":       { maxDelta: 2,  description: "±2% Pmax between consecutive measurements" },
  "TOPCon":    { maxDelta: 2,  description: "±2% Pmax between consecutive measurements" },
  "Perovskite": { maxDelta: 5, description: "±5% Pmax; significant LID/LeTID expected" },
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

// Sample data for PERC module (c-Si default)
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
    // Exponential approach to stabilized value with some noise
    const pmax = P0 + (P3 - P0) * (1 - Math.exp(-3 * progress)) + (Math.random() - 0.5) * 2
    points.push({
      kWh,
      pmax: parseFloat(pmax.toFixed(1)),
      pct: parseFloat((pmax / P0 * 100).toFixed(2)),
    })
  }
  return points
}

const STAGE_LABELS = {
  P0: "Initial",
  P1: "After Conditioning",
  P2: "After Exposure",
  P3: "Stabilized",
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
        <div className="ml-auto">
          <Badge className={allPass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
            {allPass ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
            {allPass ? "STABILIZED" : "NOT STABILIZED"}
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

        {/* Stabilization Criteria Check */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Stabilization Criteria Check</CardTitle>
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
            Thin-film technologies (a-Si, CdTe, CIGS, Perovskite) may require extended exposure due to metastable effects.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
