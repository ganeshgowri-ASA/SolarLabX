// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine, Cell
} from "recharts"
import { CheckCircle, XCircle, AlertTriangle, Target, Shield } from "lucide-react"

// ─── Types & Constants ──────────────────────────────────────────────────────

interface VisualCheckItem {
  item: string
  pass: boolean
  notes: string
}

interface UncertaintyComponent {
  source: string
  type: "A" | "B"
  value: number
  divisor: number
  ui: number
  dof: number
}

// Sample data
const PMAX_RATED = 550     // W
const PMAX_MEASURED = 548.2 // W
const UNCERTAINTY_PCT = 1.8 // %
const TOLERANCE_PCT = 3     // %

// Gate 1: Visual inspection checklist
const VISUAL_CHECKS: VisualCheckItem[] = [
  { item: "No visible cracks or chips", pass: true, notes: "OK" },
  { item: "No delamination or bubbling", pass: true, notes: "OK" },
  { item: "Labels/markings legible", pass: true, notes: "OK" },
  { item: "Frame intact, no bending", pass: true, notes: "OK" },
  { item: "Junction box sealed", pass: true, notes: "OK" },
  { item: "No discoloration/yellowing", pass: true, notes: "Minor edge yellowing" },
  { item: "Glass surface clean/undamaged", pass: true, notes: "OK" },
  { item: "Connectors undamaged", pass: true, notes: "OK" },
]

// Uncertainty budget (Type A & B)
const UNCERTAINTY_BUDGET: UncertaintyComponent[] = [
  { source: "Repeatability (IV tracer)", type: "A", value: 0.30, divisor: 1, ui: 0.30, dof: 9 },
  { source: "Reference cell calibration", type: "B", value: 0.50, divisor: 1.732, ui: 0.29, dof: 50 },
  { source: "Temperature measurement", type: "B", value: 0.40, divisor: 1.732, ui: 0.23, dof: 50 },
  { source: "Spectral mismatch", type: "B", value: 0.80, divisor: 1.732, ui: 0.46, dof: 50 },
  { source: "Spatial non-uniformity", type: "B", value: 0.50, divisor: 1.732, ui: 0.29, dof: 50 },
  { source: "DAQ resolution", type: "B", value: 0.10, divisor: 1.732, ui: 0.06, dof: 50 },
  { source: "Temperature correction", type: "B", value: 0.60, divisor: 1.732, ui: 0.35, dof: 50 },
]

// Gate 3: Pre vs Post test data
const GATE3_DATA = [
  { test: "TC200", prePmax: 548.2, postPmax: 543.1, limit: 5 },
  { test: "DH1000", prePmax: 548.2, postPmax: 537.5, limit: 5 },
  { test: "HF10", prePmax: 548.2, postPmax: 541.8, limit: 5 },
  { test: "UV15", prePmax: 548.2, postPmax: 544.6, limit: 5 },
  { test: "MechLoad", prePmax: 548.2, postPmax: 545.3, limit: 5 },
  { test: "Hail", prePmax: 548.2, postPmax: 546.9, limit: 5 },
]

// Gate status helper
function getGateStatus(pass: boolean, marginal: boolean): { label: string; color: string; bgColor: string; icon: any } {
  if (!pass) return { label: "FAIL", color: "text-white", bgColor: "bg-red-500", icon: XCircle }
  if (marginal) return { label: "MARGINAL", color: "text-white", bgColor: "bg-amber-500", icon: AlertTriangle }
  return { label: "PASS", color: "text-white", bgColor: "bg-green-500", icon: CheckCircle }
}

export function GatesAnalysis() {
  // Gate 1: Visual
  const visualAllPass = VISUAL_CHECKS.every(c => c.pass)
  const visualPassCount = VISUAL_CHECKS.filter(c => c.pass).length

  // Gate 2: Performance with uncertainty
  const combinedU = Math.sqrt(UNCERTAINTY_BUDGET.reduce((s, u) => s + u.ui ** 2, 0))
  const expandedU = combinedU * 2 // k=2 for ~95% confidence
  const expandedUPct = parseFloat((expandedU).toFixed(2))
  const pmaxWithU = PMAX_MEASURED + (expandedUPct / 100 * PMAX_MEASURED)
  const pmaxThreshold = PMAX_RATED * (1 - TOLERANCE_PCT / 100)
  const gate2Pass = pmaxWithU >= pmaxThreshold
  // Marginal if pass but within 1% of threshold
  const gate2Marginal = gate2Pass && (pmaxWithU - pmaxThreshold) / pmaxThreshold * 100 < 1.5

  // Gate 3: Post-test degradation
  const gate3Data = GATE3_DATA.map(d => {
    const degradation = parseFloat(((d.postPmax - d.prePmax) / d.prePmax * 100).toFixed(2))
    const pass = Math.abs(degradation) <= d.limit
    const marginal = pass && Math.abs(degradation) > d.limit * 0.8
    return { ...d, degradation, pass, marginal }
  })
  const gate3AllPass = gate3Data.every(d => d.pass)
  const gate3AnyMarginal = gate3Data.some(d => d.marginal)

  // Overall gate summary with marginal
  const gates = [
    { gate: "Gate 1", label: "Visual Inspection", pass: visualAllPass, marginal: false },
    { gate: "Gate 2", label: "Performance + Uncertainty", pass: gate2Pass, marginal: gate2Marginal },
    { gate: "Gate 3", label: "Post-test Degradation", pass: gate3AllPass, marginal: gate3AnyMarginal },
  ]

  // Gate 3 bar chart data
  const gate3ChartData = gate3Data.map(d => ({
    test: d.test,
    degradation: Math.abs(d.degradation),
    actual: d.degradation,
    pass: d.pass,
    marginal: d.marginal,
  }))

  // Effective DoF (Welch-Satterthwaite)
  const effectiveDof = useMemo(() => {
    const uc4 = combinedU ** 4
    const denom = UNCERTAINTY_BUDGET.reduce((s, u) => s + (u.ui ** 4) / u.dof, 0)
    return denom > 0 ? Math.floor(uc4 / denom) : 50
  }, [combinedU])

  return (
    <div className="space-y-4">
      {/* Visual Gate Summary - Color-coded horizontal bars with MARGINAL support */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-500" />
            Gate Summary
          </CardTitle>
          <CardDescription className="text-xs">IEC 61215 qualification gates – Green=PASS, Amber=MARGINAL, Red=FAIL</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {gates.map(({ gate, label, pass, marginal }) => {
              const status = getGateStatus(pass, marginal)
              const Icon = status.icon
              return (
                <div key={gate} className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold w-16 text-muted-foreground">{gate}</span>
                  <div className={`flex-1 h-8 rounded-lg overflow-hidden relative ${status.bgColor}`}>
                    <div className="absolute inset-0 flex items-center justify-between px-3">
                      <span className={`text-xs font-semibold ${status.color}`}>{label}</span>
                      <span className={`text-xs font-bold ${status.color} flex items-center gap-1`}>
                        <Icon className="h-3.5 w-3.5" />
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {/* Overall Status */}
          <div className="mt-3 p-2 rounded-lg border-2 text-center text-xs font-semibold"
               style={{
                 borderColor: gates.every(g => g.pass) ? (gates.some(g => g.marginal) ? "#f59e0b" : "#22c55e") : "#ef4444",
                 backgroundColor: gates.every(g => g.pass) ? (gates.some(g => g.marginal) ? "#fef3c7" : "#f0fdf4") : "#fef2f2",
                 color: gates.every(g => g.pass) ? (gates.some(g => g.marginal) ? "#92400e" : "#166534") : "#991b1b",
               }}>
            Overall: {gates.every(g => g.pass) ? (gates.some(g => g.marginal) ? "QUALIFIED (WITH MARGINAL ITEMS)" : "QUALIFIED") : "NOT QUALIFIED"}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gate 1: Visual Inspection Checklist */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Gate 1 – Visual Inspection</CardTitle>
            <CardDescription className="text-xs">{visualPassCount}/{VISUAL_CHECKS.length} checks passed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {VISUAL_CHECKS.map(({ item, pass, notes }) => (
                <div key={item} className="flex items-center justify-between text-xs py-1 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    {pass
                      ? <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                      : <XCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                    }
                    <span>{item}</span>
                  </div>
                  <span className="text-gray-400 text-xs">{notes}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gate 2: Performance with Uncertainty */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Gate 2 – Performance with Uncertainty</CardTitle>
            <CardDescription className="text-xs">Pmax_meas + U ≥ Pmax_rated × (1 - tol%)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Key values */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Pmax Rated", value: `${PMAX_RATED} W`, color: "text-gray-700" },
                  { label: "Pmax Measured", value: `${PMAX_MEASURED} W`, color: "text-blue-600" },
                  { label: "Expanded U (k=2)", value: `±${expandedUPct}%`, color: "text-amber-600" },
                  { label: "Tolerance", value: `${TOLERANCE_PCT}%`, color: "text-gray-600" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-2 bg-gray-50 rounded text-xs">
                    <div className="text-gray-500">{label}</div>
                    <div className={`font-mono font-bold ${color}`}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Formula result with marginal warning */}
              <div className={`p-3 rounded-lg border-2 ${
                gate2Pass
                  ? gate2Marginal ? "border-amber-300 bg-amber-50" : "border-green-300 bg-green-50"
                  : "border-red-300 bg-red-50"
              }`}>
                <div className="text-xs font-semibold mb-1">Pass Criterion:</div>
                <div className="text-xs font-mono">
                  Pmax_meas + U = {PMAX_MEASURED} + {(expandedUPct / 100 * PMAX_MEASURED).toFixed(1)} = <span className="font-bold">{pmaxWithU.toFixed(1)} W</span>
                </div>
                <div className="text-xs font-mono mt-1">
                  Pmax_rated × (1 - tol) = {PMAX_RATED} × {(1 - TOLERANCE_PCT / 100).toFixed(2)} = <span className="font-bold">{pmaxThreshold.toFixed(1)} W</span>
                </div>
                <div className={`text-xs font-bold mt-2 ${
                  gate2Pass
                    ? gate2Marginal ? "text-amber-700" : "text-green-700"
                    : "text-red-700"
                }`}>
                  {pmaxWithU.toFixed(1)} {gate2Pass ? "≥" : "<"} {pmaxThreshold.toFixed(1)} → {
                    gate2Pass ? (gate2Marginal ? "PASS (MARGINAL)" : "PASS") : "FAIL"
                  }
                </div>
                {gate2Marginal && (
                  <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Margin is {((pmaxWithU - pmaxThreshold) / pmaxThreshold * 100).toFixed(2)}% – close to threshold
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uncertainty Budget Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Uncertainty Budget</CardTitle>
            <CardDescription className="text-xs">GUM methodology · Type A (statistical) & Type B (non-statistical) · ν_eff = {effectiveDof}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-3 font-semibold">Source</th>
                    <th className="text-center py-2 pr-3 font-semibold">Type</th>
                    <th className="text-right py-2 pr-3 font-semibold">Value (%)</th>
                    <th className="text-right py-2 pr-3 font-semibold">Divisor</th>
                    <th className="text-right py-2 pr-3 font-semibold">u_i (%)</th>
                    <th className="text-right py-2 font-semibold">DoF</th>
                  </tr>
                </thead>
                <tbody>
                  {UNCERTAINTY_BUDGET.map(({ source, type, value, divisor, ui, dof }) => (
                    <tr key={source} className="border-b hover:bg-gray-50">
                      <td className="py-1.5 pr-3 text-muted-foreground">{source}</td>
                      <td className="py-1.5 pr-3 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${type === "A" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                          {type}
                        </span>
                      </td>
                      <td className="py-1.5 pr-3 text-right font-mono">{value.toFixed(2)}</td>
                      <td className="py-1.5 pr-3 text-right font-mono">{divisor.toFixed(3)}</td>
                      <td className="py-1.5 pr-3 text-right font-mono font-semibold">{ui.toFixed(2)}</td>
                      <td className="py-1.5 text-right font-mono">{dof}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 font-semibold">
                    <td className="py-2 pr-3" colSpan={4}>Combined Standard Uncertainty u_c</td>
                    <td className="py-2 pr-3 text-right font-mono text-amber-600">{combinedU.toFixed(2)}%</td>
                    <td />
                  </tr>
                  <tr className="font-semibold bg-amber-50">
                    <td className="py-2 pr-3" colSpan={4}>Expanded Uncertainty U (k=2, ~95%)</td>
                    <td className="py-2 pr-3 text-right font-mono text-amber-700 text-sm">{expandedUPct}%</td>
                    <td className="py-2 text-right font-mono text-xs">ν={effectiveDof}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Gate 3: Post-test Degradation with marginal */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Gate 3 – Post-test Degradation</CardTitle>
            <CardDescription className="text-xs">Pre vs Post Pmax · ≤5% degradation limit · Amber if &gt;80% of limit</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={gate3ChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="test" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 6]}
                       label={{ value: "|ΔPmax| (%)", angle: -90, position: "insideLeft", fontSize: 9 }} />
                <Tooltip formatter={(v: any) => [`${v}%`, "|ΔPmax|"]} />
                <ReferenceLine y={5} stroke="#ef4444" strokeDasharray="5 3" strokeWidth={2}
                               label={{ value: "5% Limit", position: "right", fill: "#ef4444", fontSize: 9 }} />
                <ReferenceLine y={4} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1}
                               label={{ value: "80% warn", position: "right", fill: "#f59e0b", fontSize: 8 }} />
                <Bar dataKey="degradation" name="|ΔPmax| (%)" maxBarSize={40} radius={[4, 4, 0, 0]}>
                  {gate3ChartData.map((d, i) => (
                    <Cell key={i} fill={!d.pass ? "#ef4444" : d.marginal ? "#f59e0b" : "#22c55e"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-1.5 pr-3 font-semibold">Test</th>
                    <th className="text-right py-1.5 pr-3 font-semibold">Pre (W)</th>
                    <th className="text-right py-1.5 pr-3 font-semibold">Post (W)</th>
                    <th className="text-right py-1.5 pr-3 font-semibold">ΔPmax (%)</th>
                    <th className="text-right py-1.5 pr-3 font-semibold">Limit (%)</th>
                    <th className="text-center py-1.5 font-semibold">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {gate3Data.map(d => (
                    <tr key={d.test} className={`border-b ${!d.pass ? "bg-red-50" : d.marginal ? "bg-amber-50" : ""}`}>
                      <td className="py-1.5 pr-3 font-mono text-muted-foreground">{d.test}</td>
                      <td className="py-1.5 pr-3 text-right font-mono">{d.prePmax}</td>
                      <td className="py-1.5 pr-3 text-right font-mono">{d.postPmax}</td>
                      <td className={`py-1.5 pr-3 text-right font-mono font-bold ${
                        !d.pass ? "text-red-600" : d.marginal ? "text-amber-600" : "text-green-600"
                      }`}>
                        {d.degradation.toFixed(2)}%
                      </td>
                      <td className="py-1.5 pr-3 text-right text-muted-foreground">≤ {d.limit}%</td>
                      <td className="py-1.5 text-center">
                        <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                          !d.pass ? "bg-red-100 text-red-700" : d.marginal ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                        }`}>
                          {!d.pass ? "FAIL" : d.marginal ? "MARGINAL" : "PASS"}
                        </span>
                      </td>
                    </tr>
                  ))}
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
            <span className="font-semibold">IEC 61215 Qualification Gates:</span>{" "}
            Gate 1 (Visual): MQT 01 visual inspection per IEC 61215-1 Cl.7.
            Gate 2 (Performance): Pmax must satisfy Pmax_meas + U ≥ Pmax_rated × (1 - tolerance), where U is the expanded measurement
            uncertainty at k=2 per GUM (ISO/IEC Guide 98-3). Effective DoF calculated via Welch-Satterthwaite equation.
            Gate 3 (Post-test): Maximum power degradation ≤5% from initial measurement after each environmental stress test.
            Items degrading &gt;80% of limit are flagged as MARGINAL for closer monitoring.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
