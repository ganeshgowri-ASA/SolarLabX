// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  ResponsiveContainer, ScatterChart, Scatter, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine, ComposedChart
} from "recharts"
import { Thermometer, CheckCircle, AlertTriangle, Calculator } from "lucide-react"

// ─── Types & Constants ──────────────────────────────────────────────────────

interface TempDataPoint {
  temperature: number
  isc: number
  voc: number
  pmax: number
}

// Sample data: IEC 60904-10 temperature coefficient measurement
// alpha=+0.048%/°C, beta=-0.29%/°C, gamma=-0.38%/°C
const DATASHEET_COEFFS = {
  alpha: 0.048,  // %/°C (Isc)
  beta: -0.29,   // %/°C (Voc)
  gamma: -0.38,  // %/°C (Pmax)
}

function genTempData(): TempDataPoint[] {
  const temps = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75]
  const Isc_STC = 10.5    // A at 25°C
  const Voc_STC = 48.5    // V at 25°C
  const Pmax_STC = 400    // W at 25°C

  return temps.map(T => {
    const dT = T - 25
    const noise = () => (Math.random() - 0.5) * 0.3
    return {
      temperature: T,
      isc: parseFloat((Isc_STC * (1 + 0.00048 * dT) + noise() * 0.01).toFixed(4)),
      voc: parseFloat((Voc_STC * (1 + (-0.0029) * dT) + noise() * 0.05).toFixed(3)),
      pmax: parseFloat((Pmax_STC * (1 + (-0.0038) * dT) + noise() * 0.5).toFixed(2)),
    }
  })
}

// Linear regression
function linearFit(points: { x: number; y: number }[]): { slope: number; intercept: number; r2: number } {
  const n = points.length
  const sumX = points.reduce((s, p) => s + p.x, 0)
  const sumY = points.reduce((s, p) => s + p.y, 0)
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0)
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0)
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  const yMean = sumY / n
  const ssTot = points.reduce((s, p) => s + (p.y - yMean) ** 2, 0)
  const ssRes = points.reduce((s, p) => s + (p.y - (slope * p.x + intercept)) ** 2, 0)
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0
  return { slope: parseFloat(slope.toFixed(6)), intercept: parseFloat(intercept.toFixed(4)), r2: parseFloat(r2.toFixed(6)) }
}

export function TemperatureCoeffAnalysis() {
  const [measuredTemp, setMeasuredTemp] = useState(45)
  const [measuredIsc, setMeasuredIsc] = useState(10.60)
  const [measuredVoc, setMeasuredVoc] = useState(46.10)
  const [measuredPmax, setMeasuredPmax] = useState(385.5)

  const data = useMemo(() => genTempData(), [])

  // Compute linear fits
  const iscFit = useMemo(() => linearFit(data.map(d => ({ x: d.temperature, y: d.isc }))), [data])
  const vocFit = useMemo(() => linearFit(data.map(d => ({ x: d.temperature, y: d.voc }))), [data])
  const pmaxFit = useMemo(() => linearFit(data.map(d => ({ x: d.temperature, y: d.pmax }))), [data])

  // Derive temp coefficients in %/°C
  const iscAt25 = iscFit.intercept + iscFit.slope * 25
  const vocAt25 = vocFit.intercept + vocFit.slope * 25
  const pmaxAt25 = pmaxFit.intercept + pmaxFit.slope * 25

  const measuredCoeffs = {
    alpha: parseFloat((iscFit.slope / iscAt25 * 100).toFixed(4)),
    beta: parseFloat((vocFit.slope / vocAt25 * 100).toFixed(4)),
    gamma: parseFloat((pmaxFit.slope / pmaxAt25 * 100).toFixed(4)),
  }

  // Fit line data for charts
  const iscFitLine = useMemo(() => [15, 75].map(T => ({ temperature: T, fit: parseFloat((iscFit.slope * T + iscFit.intercept).toFixed(4)) })), [iscFit])
  const vocFitLine = useMemo(() => [15, 75].map(T => ({ temperature: T, fit: parseFloat((vocFit.slope * T + vocFit.intercept).toFixed(3)) })), [vocFit])
  const pmaxFitLine = useMemo(() => [15, 75].map(T => ({ temperature: T, fit: parseFloat((pmaxFit.slope * T + pmaxFit.intercept).toFixed(2)) })), [pmaxFit])

  // STC correction
  const correctedIsc = parseFloat((measuredIsc / (1 + measuredCoeffs.alpha / 100 * (measuredTemp - 25))).toFixed(4))
  const correctedVoc = parseFloat((measuredVoc - vocFit.slope * (measuredTemp - 25)).toFixed(3))
  const correctedPmax = parseFloat((measuredPmax / (1 + measuredCoeffs.gamma / 100 * (measuredTemp - 25))).toFixed(2))

  // Deviation from datasheet
  const deviations = {
    alpha: parseFloat(((measuredCoeffs.alpha - DATASHEET_COEFFS.alpha) / Math.abs(DATASHEET_COEFFS.alpha) * 100).toFixed(1)),
    beta: parseFloat(((measuredCoeffs.beta - DATASHEET_COEFFS.beta) / Math.abs(DATASHEET_COEFFS.beta) * 100).toFixed(1)),
    gamma: parseFloat(((measuredCoeffs.gamma - DATASHEET_COEFFS.gamma) / Math.abs(DATASHEET_COEFFS.gamma) * 100).toFixed(1)),
  }

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "α (Isc)", value: `${measuredCoeffs.alpha > 0 ? "+" : ""}${measuredCoeffs.alpha}%/°C`, datasheet: `${DATASHEET_COEFFS.alpha > 0 ? "+" : ""}${DATASHEET_COEFFS.alpha}%/°C`, dev: deviations.alpha, color: "text-blue-600" },
          { label: "β (Voc)", value: `${measuredCoeffs.beta}%/°C`, datasheet: `${DATASHEET_COEFFS.beta}%/°C`, dev: deviations.beta, color: "text-red-600" },
          { label: "γ (Pmax)", value: `${measuredCoeffs.gamma}%/°C`, datasheet: `${DATASHEET_COEFFS.gamma}%/°C`, dev: deviations.gamma, color: "text-amber-600" },
        ].map(({ label, value, datasheet, dev, color }) => (
          <Card key={label} className="border-l-4 border-l-amber-400">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Thermometer className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-semibold text-gray-600">{label}</span>
              </div>
              <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
              <div className="text-xs text-gray-500 mt-1">Datasheet: {datasheet}</div>
              <div className={`text-xs font-semibold mt-0.5 ${Math.abs(dev) <= 10 ? "text-green-600" : "text-red-600"}`}>
                Deviation: {dev > 0 ? "+" : ""}{dev}%
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Isc vs T */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Isc vs Temperature</CardTitle>
            <CardDescription className="text-xs">α = {measuredCoeffs.alpha > 0 ? "+" : ""}{measuredCoeffs.alpha}%/°C · R² = {iscFit.r2}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="temperature" type="number" domain={[10, 80]}
                       label={{ value: "Temperature (°C)", position: "insideBottom", offset: -5, fontSize: 9 }} tick={{ fontSize: 10 }} />
                <YAxis label={{ value: "Isc (A)", angle: -90, position: "insideLeft", fontSize: 9 }} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Scatter data={data} fill="#3b82f6" name="Measured Isc" />
                <Line data={iscFitLine} type="linear" dataKey="fit" stroke="#3b82f6" name="Linear Fit" dot={false} strokeWidth={2} strokeDasharray="6 3" />
                <ReferenceLine x={25} stroke="#22c55e" strokeDasharray="4 2"
                               label={{ value: "STC", fill: "#22c55e", fontSize: 9 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Voc vs T */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Voc vs Temperature</CardTitle>
            <CardDescription className="text-xs">β = {measuredCoeffs.beta}%/°C · R² = {vocFit.r2}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="temperature" type="number" domain={[10, 80]}
                       label={{ value: "Temperature (°C)", position: "insideBottom", offset: -5, fontSize: 9 }} tick={{ fontSize: 10 }} />
                <YAxis label={{ value: "Voc (V)", angle: -90, position: "insideLeft", fontSize: 9 }} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Scatter data={data} fill="#ef4444" name="Measured Voc" dataKey="voc" />
                <Line data={vocFitLine} type="linear" dataKey="fit" stroke="#ef4444" name="Linear Fit" dot={false} strokeWidth={2} strokeDasharray="6 3" />
                <ReferenceLine x={25} stroke="#22c55e" strokeDasharray="4 2"
                               label={{ value: "STC", fill: "#22c55e", fontSize: 9 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pmax vs T */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pmax vs Temperature</CardTitle>
            <CardDescription className="text-xs">γ = {measuredCoeffs.gamma}%/°C · R² = {pmaxFit.r2}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="temperature" type="number" domain={[10, 80]}
                       label={{ value: "Temperature (°C)", position: "insideBottom", offset: -5, fontSize: 9 }} tick={{ fontSize: 10 }} />
                <YAxis label={{ value: "Pmax (W)", angle: -90, position: "insideLeft", fontSize: 9 }} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Scatter data={data} fill="#f59e0b" name="Measured Pmax" dataKey="pmax" />
                <Line data={pmaxFitLine} type="linear" dataKey="fit" stroke="#f59e0b" name="Linear Fit" dot={false} strokeWidth={2} strokeDasharray="6 3" />
                <ReferenceLine x={25} stroke="#22c55e" strokeDasharray="4 2"
                               label={{ value: "STC", fill: "#22c55e", fontSize: 9 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Measured vs Datasheet Coefficients</CardTitle>
          <CardDescription className="text-xs">IEC 60904-10 temperature coefficient comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-semibold">Coefficient</th>
                  <th className="text-left py-2 pr-4 font-semibold">Parameter</th>
                  <th className="text-right py-2 pr-4 font-semibold">Measured (%/°C)</th>
                  <th className="text-right py-2 pr-4 font-semibold">Datasheet (%/°C)</th>
                  <th className="text-right py-2 pr-4 font-semibold">Deviation (%)</th>
                  <th className="text-right py-2 pr-4 font-semibold">R²</th>
                  <th className="text-center py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { coeff: "α", param: "Isc", measured: measuredCoeffs.alpha, datasheet: DATASHEET_COEFFS.alpha, dev: deviations.alpha, r2: iscFit.r2 },
                  { coeff: "β", param: "Voc", measured: measuredCoeffs.beta, datasheet: DATASHEET_COEFFS.beta, dev: deviations.beta, r2: vocFit.r2 },
                  { coeff: "γ", param: "Pmax", measured: measuredCoeffs.gamma, datasheet: DATASHEET_COEFFS.gamma, dev: deviations.gamma, r2: pmaxFit.r2 },
                ].map(({ coeff, param, measured, datasheet, dev, r2 }) => (
                  <tr key={coeff} className="border-b hover:bg-gray-50">
                    <td className="py-2 pr-4 font-mono font-bold text-amber-600">{coeff}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{param}</td>
                    <td className="py-2 pr-4 text-right font-mono font-semibold">{measured > 0 ? "+" : ""}{measured}</td>
                    <td className="py-2 pr-4 text-right font-mono text-muted-foreground">{datasheet > 0 ? "+" : ""}{datasheet}</td>
                    <td className={`py-2 pr-4 text-right font-mono font-semibold ${Math.abs(dev) <= 10 ? "text-green-600" : "text-red-600"}`}>
                      {dev > 0 ? "+" : ""}{dev}%
                    </td>
                    <td className="py-2 pr-4 text-right font-mono">{r2}</td>
                    <td className="py-2 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-xs ${Math.abs(dev) <= 10 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {Math.abs(dev) <= 10 ? "OK" : "CHECK"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* STC Correction Calculator */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calculator className="h-4 w-4 text-amber-500" />
            STC Correction Calculator
          </CardTitle>
          <CardDescription className="text-xs">Input measured values at any temperature, auto-correct to 25°C (STC)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-1">
              <Label className="text-xs">Measured Temp (°C)</Label>
              <Input type="number" step="1" value={measuredTemp} onChange={e => setMeasuredTemp(+e.target.value)} className="h-7 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Measured Isc (A)</Label>
              <Input type="number" step="0.01" value={measuredIsc} onChange={e => setMeasuredIsc(+e.target.value)} className="h-7 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Measured Voc (V)</Label>
              <Input type="number" step="0.01" value={measuredVoc} onChange={e => setMeasuredVoc(+e.target.value)} className="h-7 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Measured Pmax (W)</Label>
              <Input type="number" step="0.1" value={measuredPmax} onChange={e => setMeasuredPmax(+e.target.value)} className="h-7 text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "Isc @ 25°C", measured: `${measuredIsc} A`, corrected: `${correctedIsc} A`, color: "border-l-blue-400" },
              { label: "Voc @ 25°C", measured: `${measuredVoc} V`, corrected: `${correctedVoc} V`, color: "border-l-red-400" },
              { label: "Pmax @ 25°C", measured: `${measuredPmax} W`, corrected: `${correctedPmax} W`, color: "border-l-amber-400" },
            ].map(({ label, measured, corrected, color }) => (
              <div key={label} className={`p-3 border rounded border-l-4 ${color}`}>
                <div className="text-xs text-gray-500 mb-1">{label}</div>
                <div className="text-lg font-bold font-mono">{corrected}</div>
                <div className="text-xs text-gray-400">Measured: {measured} at {measuredTemp}°C</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* IEC Reference */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-3 pb-3">
          <div className="text-xs text-amber-800">
            <span className="font-semibold">IEC 60904-10:</span>{" "}
            Temperature coefficients determined by measuring I-V characteristics at multiple temperatures (15–75°C) under
            constant irradiance (1000 W/m²). Linear regression of Isc, Voc, Pmax vs temperature gives α, β, γ respectively.
            Correction to STC: Isc(25°C) = Isc_meas / [1 + α(T_meas - 25)/100]; Voc(25°C) = Voc_meas - β_abs × (T_meas - 25);
            Pmax(25°C) = Pmax_meas / [1 + γ(T_meas - 25)/100].
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
