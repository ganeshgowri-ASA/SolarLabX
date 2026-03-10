// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  ResponsiveContainer, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
  ComposedChart
} from "recharts"
import { Sun, Thermometer, Wind, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"

// NMOT determination per IEC 61215-2 / IEC 61853-2
// NMOT = module temperature at: G=800 W/m², Ta=20°C, WS=1 m/s
// Measured as: T_module = T_ambient + G * (NMOT - 20) / 800

function calcNMOT(
  measurements: { G: number; Ta: number; WS: number; Tmod: number }[]
): { nmot: number; r2: number; slope: number; intercept: number; filteredCount: number } {
  // Filter per IEC: G>400, WS 0.5-1.5, Ta 15-35
  const filtered = measurements.filter(m => m.G > 400 && m.WS >= 0.5 && m.WS <= 1.5 && m.Ta >= 15 && m.Ta <= 35)
  if (filtered.length < 5) return { nmot: 45, r2: 0, slope: 0, intercept: 20, filteredCount: 0 }

  // Linear regression: T_mod - T_amb vs G
  const xs = filtered.map(m => m.G)
  const ys = filtered.map(m => m.Tmod - m.Ta)
  const n = xs.length
  const sumX = xs.reduce((a, b) => a + b, 0)
  const sumY = ys.reduce((a, b) => a + b, 0)
  const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0)
  const sumXX = xs.reduce((s, x) => s + x * x, 0)
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX ** 2)
  const intercept = (sumY - slope * sumX) / n

  // NMOT = 20 + 800 * slope (at G=800, Ta=20)
  const nmot = 20 + 800 * slope

  // R²
  const yMean = sumY / n
  const ssTot = ys.reduce((s, y) => s + (y - yMean) ** 2, 0)
  const ssRes = ys.reduce((s, y, i) => s + (y - (slope * xs[i] + intercept)) ** 2, 0)
  const r2 = 1 - ssRes / ssTot

  return {
    nmot: parseFloat(nmot.toFixed(1)),
    r2: parseFloat(r2.toFixed(4)),
    slope: parseFloat(slope.toFixed(6)),
    intercept: parseFloat(intercept.toFixed(3)),
    filteredCount: filtered.length
  }
}

// Generate mock outdoor measurement data
function genMockMeasurements() {
  const data = []
  for (let i = 0; i < 120; i++) {
    const hour = 7 + (i * 0.1) % 13
    const G = Math.max(50, 1000 * Math.sin(Math.PI * (hour - 6) / 14) + (Math.random() - 0.5) * 80)
    const Ta = 18 + 8 * Math.sin(Math.PI * (hour - 6) / 14) + (Math.random() - 0.5) * 3
    const WS = 0.3 + Math.random() * 2.5
    const Tmod = Ta + G * 0.025 + (Math.random() - 0.5) * 2
    data.push({ G: parseFloat(G.toFixed(1)), Ta: parseFloat(Ta.toFixed(1)), WS: parseFloat(WS.toFixed(2)), Tmod: parseFloat(Tmod.toFixed(1)), hour: parseFloat(hour.toFixed(2)) })
  }
  return data
}

function calcNOCT(
  Isc: number, Voc: number, pmax: number,
  nmot: number, G: number, Ta: number
): { Tcell: number; Pmax_corr: number; label: string } {
  // NOCT: T_cell = T_amb + (NMOT - 20) * G/800 * (1 - η/(α*τ))
  // Simplified: use η≈0.2, α*τ≈0.9 → factor ≈ 0.78
  const Tcell = Ta + (nmot - 20) * G / 800 * 0.78
  const gamma = -0.0035 // %/°C Pmax temperature coefficient
  const Pmax_corr = pmax * (1 + gamma * (Tcell - 25))
  return { Tcell: parseFloat(Tcell.toFixed(1)), Pmax_corr: parseFloat(Pmax_corr.toFixed(2)), label: `${Ta}°C amb, ${G}W/m²` }
}

export function NMOTCalculator() {
  const [nmotInput, setNmotInput] = useState(45.2)
  const [pmaxSTC, setPmaxSTC] = useState(400)
  const [gammaP, setGammaP] = useState(-0.35)

  const mockData = useMemo(() => genMockMeasurements(), [])
  const nmotResult = useMemo(() => calcNMOT(mockData), [mockData])

  const displayNMOT = nmotResult.nmot

  // NOCT operating conditions table
  const noctConditions = useMemo(() => {
    const scenarios = [
      { G: 200, Ta: 15 }, { G: 400, Ta: 20 }, { G: 600, Ta: 25 },
      { G: 800, Ta: 20 }, { G: 1000, Ta: 25 }, { G: 1000, Ta: 35 },
    ]
    return scenarios.map(s => calcNOCT(10.5, 48.5, pmaxSTC, displayNMOT, s.G, s.Ta))
  }, [displayNMOT, pmaxSTC])

  // Regression line data for chart
  const regressionLine = useMemo(() => {
    return [100, 300, 500, 700, 900, 1100].map(G => ({
      G, predicted: parseFloat((nmotResult.slope * G + nmotResult.intercept).toFixed(2))
    }))
  }, [nmotResult])

  // Scatter data
  const scatterData = useMemo(() =>
    mockData.filter(m => m.G > 400 && m.WS >= 0.5 && m.WS <= 1.5 && m.Ta >= 15 && m.Ta <= 35)
      .map(m => ({ G: m.G, dT: parseFloat((m.Tmod - m.Ta).toFixed(2)) })), [mockData])

  // NMOT vs time of day
  const diurnalData = useMemo(() =>
    mockData.map(m => ({ hour: m.hour, G: m.G, Ta: m.Ta, Tmod: m.Tmod, dT: parseFloat((m.Tmod - m.Ta).toFixed(2)) }))
      .sort((a, b) => a.hour - b.hour), [mockData])

  const nmotStatus = displayNMOT <= 45 ? "pass" : displayNMOT <= 47 ? "marginal" : "fail"

  return (
    <div className="space-y-4">
      {/* NMOT Result Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className={`border-l-4 ${nmotStatus === "pass" ? "border-l-green-500" : nmotStatus === "marginal" ? "border-l-amber-500" : "border-l-red-500"}`}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Thermometer className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-semibold text-gray-600">NMOT (Measured)</span>
            </div>
            <div className={`text-3xl font-bold ${nmotStatus === "pass" ? "text-green-600" : nmotStatus === "marginal" ? "text-amber-600" : "text-red-600"}`}>
              {displayNMOT}°C
            </div>
            <div className={`text-xs mt-1 ${nmotStatus === "pass" ? "text-green-600" : nmotStatus === "marginal" ? "text-amber-600" : "text-red-600"}`}>
              {nmotStatus === "pass" ? "✓ Typical range (≤45°C)" : nmotStatus === "marginal" ? "⚠ Slightly elevated" : "✗ Exceeds typical"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-semibold text-gray-600">Regression R²</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">{nmotResult.r2}</div>
            <div className="text-xs mt-1 text-gray-500">Linear fit quality</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Sun className="h-4 w-4 text-yellow-500" />
              <span className="text-xs font-semibold text-gray-600">Measurements Used</span>
            </div>
            <div className="text-3xl font-bold text-yellow-600">{nmotResult.filteredCount}</div>
            <div className="text-xs mt-1 text-gray-500">After IEC filtering (G&gt;400, WS 0.5–1.5 m/s)</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Wind className="h-4 w-4 text-cyan-500" />
              <span className="text-xs font-semibold text-gray-600">Slope (ΔT/G)</span>
            </div>
            <div className="text-3xl font-bold text-cyan-600">{(nmotResult.slope * 1000).toFixed(2)}</div>
            <div className="text-xs mt-1 text-gray-500">K·m²/W × 10³</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ΔT vs G scatter with regression */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">NMOT Determination – (T_mod - T_amb) vs Irradiance</CardTitle>
            <CardDescription className="text-xs">IEC 61215-2 Cl.4.5 · IEC 61853-2 Cl.5 · G&gt;400 W/m², WS 0.5–1.5 m/s</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="G" type="number" domain={[0, 1200]}
                       label={{ value: "Irradiance (W/m²)", position: "insideBottom", offset: -5, fontSize: 10 }} tick={{ fontSize: 10 }} />
                <YAxis label={{ value: "ΔT = T_mod - T_amb (°C)", angle: -90, position: "insideLeft", fontSize: 9 }} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Scatter data={scatterData} fill="#f97316" name="Measurements" opacity={0.6} />
                <Line data={regressionLine} type="linear" dataKey="predicted" stroke="#2563eb" name="Linear Regression" dot={false} strokeWidth={2} />
                <ReferenceLine x={800} stroke="#22c55e" strokeDasharray="4 2"
                               label={{ value: "G=800", fill: "#22c55e", fontSize: 9 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Diurnal pattern */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Diurnal Profile – Temperature & Irradiance</CardTitle>
            <CardDescription className="text-xs">Module temperature tracking throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={diurnalData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="hour" tickFormatter={h => `${Math.floor(h)}:00`} tick={{ fontSize: 10 }}
                       label={{ value: "Hour of Day", position: "insideBottom", offset: -5, fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} label={{ value: "Temp (°C)", angle: -90, position: "insideLeft", fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} label={{ value: "G (W/m²)", angle: 90, position: "insideRight", fontSize: 9 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line yAxisId="left" type="monotone" dataKey="Tmod" stroke="#ef4444" name="T_module (°C)" dot={false} strokeWidth={1.5} />
                <Line yAxisId="left" type="monotone" dataKey="Ta" stroke="#3b82f6" name="T_ambient (°C)" dot={false} strokeWidth={1.5} strokeDasharray="4 2" />
                <Line yAxisId="right" type="monotone" dataKey="G" stroke="#f59e0b" name="Irradiance (W/m²)" dot={false} strokeWidth={1} strokeDasharray="2 2" />
                <ReferenceLine yAxisId="left" y={displayNMOT} stroke="#22c55e" strokeDasharray="5 3"
                               label={{ value: `NMOT=${displayNMOT}°C`, fill: "#22c55e", fontSize: 9 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* NOCT Operating Conditions Calculator */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-red-500" />
            NOCT / NMOT Operating Conditions Calculator
          </CardTitle>
          <CardDescription className="text-xs">Cell temperature and corrected Pmax at various field conditions using NMOT={displayNMOT}°C</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="space-y-1">
              <Label className="text-xs">Pmax STC (W)</Label>
              <Input type="number" step="5" value={pmaxSTC} onChange={e => setPmaxSTC(+e.target.value)} className="h-7 text-xs w-24" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">γ(Pmax) (%/°C)</Label>
              <Input type="number" step="0.01" value={gammaP} onChange={e => setGammaP(+e.target.value)} className="h-7 text-xs w-24" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 text-gray-600">Condition</th>
                  <th className="text-right py-2 pr-4 text-gray-600">G (W/m²)</th>
                  <th className="text-right py-2 pr-4 text-gray-600">T_amb (°C)</th>
                  <th className="text-right py-2 pr-4 text-gray-600">T_cell (°C)</th>
                  <th className="text-right py-2 pr-4 text-gray-600">Pmax (W)</th>
                  <th className="text-right py-2 text-gray-600">vs STC</th>
                </tr>
              </thead>
              <tbody>
                {noctConditions.map((cond, i) => {
                  const dPct = parseFloat(((cond.Pmax_corr - pmaxSTC) / pmaxSTC * 100).toFixed(1))
                  return (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-2 pr-4 text-gray-500">{cond.label}</td>
                      <td className="py-2 pr-4 text-right font-mono">{[200, 400, 600, 800, 1000, 1000][i]}</td>
                      <td className="py-2 pr-4 text-right font-mono">{[15, 20, 25, 20, 25, 35][i]}</td>
                      <td className="py-2 pr-4 text-right font-mono font-semibold">{cond.Tcell}°C</td>
                      <td className="py-2 pr-4 text-right font-mono font-semibold">{cond.Pmax_corr}</td>
                      <td className={`py-2 text-right font-mono font-semibold ${dPct < 0 ? "text-red-600" : "text-green-600"}`}>{dPct > 0 ? "+" : ""}{dPct}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* IEC Reference */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-3 pb-3">
          <div className="text-xs text-amber-800">
            <span className="font-semibold">NMOT per IEC 61215-2 / IEC 61853-2:</span> Measured outdoors at steady-state conditions.
            Filtering: G &gt; 400 W/m², wind speed 0.5–1.5 m/s, ambient 15–35°C.
            Regression of (T_mod − T_amb) vs G gives slope k; NMOT = 20°C + 800 × k.
            Typical residential module NMOT: 42–47°C. Higher NMOT = greater temperature-induced power loss in the field.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
