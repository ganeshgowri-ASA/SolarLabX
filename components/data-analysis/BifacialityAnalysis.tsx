// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine, ScatterChart, Scatter, Cell
} from "recharts"
import { Sun, Zap, TrendingUp, BarChart3 } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface BifacialSample {
  sampleId: string
  pmax_front: number
  pmax_rear: number
  voc_front: number
  voc_rear: number
  isc_front: number
  isc_rear: number
  ff_front: number
  ff_rear: number
}

interface IrradiancePoint {
  g_rear: number        // W/m²
  g_front: number       // W/m² (fixed at 1000)
  g_effective: number   // W/m²
  bifi_gain: number     // %
  p_bifacial: number    // W
  p_mono: number        // W
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

function generateSampleData(): BifacialSample[] {
  return [
    { sampleId: "BiFi-001", pmax_front: 418, pmax_rear: 302, voc_front: 48.5, voc_rear: 47.8, isc_front: 10.85, isc_rear: 7.95, ff_front: 79.5, ff_rear: 79.2 },
    { sampleId: "BiFi-002", pmax_front: 415, pmax_rear: 299, voc_front: 48.3, voc_rear: 47.6, isc_front: 10.80, isc_rear: 7.88, ff_front: 79.6, ff_rear: 79.0 },
    { sampleId: "BiFi-003", pmax_front: 412, pmax_rear: 295, voc_front: 48.1, voc_rear: 47.4, isc_front: 10.78, isc_rear: 7.82, ff_front: 79.4, ff_rear: 78.8 },
    { sampleId: "BiFi-004", pmax_front: 419, pmax_rear: 305, voc_front: 48.6, voc_rear: 47.9, isc_front: 10.88, isc_rear: 8.00, ff_front: 79.3, ff_rear: 79.4 },
    { sampleId: "BiFi-005", pmax_front: 416, pmax_rear: 301, voc_front: 48.4, voc_rear: 47.7, isc_front: 10.82, isc_rear: 7.92, ff_front: 79.5, ff_rear: 79.1 },
  ]
}

function generateIrradianceData(phi_pmax: number, pmax_front: number): IrradiancePoint[] {
  const g_front = 1000
  const rearIrradiances = [0, 50, 100, 150, 200, 250, 300, 400, 500]
  return rearIrradiances.map(g_rear => {
    const g_effective = g_front + phi_pmax * g_rear
    const p_mono = pmax_front * (g_front / 1000) // monofacial power
    const p_bifacial = pmax_front * (g_effective / 1000) // bifacial power
    const bifi_gain = ((p_bifacial - p_mono) / p_mono) * 100
    return {
      g_rear,
      g_front,
      g_effective: parseFloat(g_effective.toFixed(0)),
      bifi_gain: parseFloat(bifi_gain.toFixed(2)),
      p_bifacial: parseFloat(p_bifacial.toFixed(1)),
      p_mono: parseFloat(p_mono.toFixed(1)),
    }
  })
}

// Albedo-based energy yield gain data
const ALBEDO_DATA = [
  { albedo: 5, surface: "Dark soil", gain: 0.8 },
  { albedo: 10, surface: "Asphalt", gain: 2.1 },
  { albedo: 15, surface: "Grass (dry)", gain: 3.8 },
  { albedo: 20, surface: "Grass (green)", gain: 5.2 },
  { albedo: 25, surface: "Concrete", gain: 6.9 },
  { albedo: 30, surface: "Sand", gain: 8.4 },
  { albedo: 40, surface: "Light gravel", gain: 10.8 },
  { albedo: 50, surface: "White roof", gain: 13.1 },
  { albedo: 60, surface: "Fresh snow", gain: 15.8 },
  { albedo: 80, surface: "Aged snow", gain: 20.5 },
]

// Temperature correction data for bifaciality at different irradiance
function genTempCorrectionData(phi: number) {
  const irradiances = [200, 400, 600, 800, 1000]
  return irradiances.map(G => {
    // At higher irradiance, BiFi gain is slightly lower due to temperature effects
    const stcGain = phi * 100
    const tempFactor = 1 - (G - 200) * 0.00005
    return {
      irradiance: G,
      bifi_stc: parseFloat((stcGain).toFixed(1)),
      bifi_actual: parseFloat((stcGain * tempFactor).toFixed(1)),
    }
  })
}

export function BifacialityAnalysis() {
  const [selectedSample, setSelectedSample] = useState("all")

  const samples = useMemo(() => generateSampleData(), [])

  // Compute bifaciality coefficients
  const bifiCoeffs = useMemo(() => {
    return samples.map(s => ({
      sampleId: s.sampleId,
      phi_Isc: parseFloat((s.isc_rear / s.isc_front).toFixed(4)),
      phi_Voc: parseFloat((s.voc_rear / s.voc_front).toFixed(4)),
      phi_Pmax: parseFloat((s.pmax_rear / s.pmax_front).toFixed(4)),
      phi_FF: parseFloat((s.ff_rear / s.ff_front).toFixed(4)),
    }))
  }, [samples])

  // Averages
  const avgCoeffs = useMemo(() => {
    const avg = (arr: number[]) => parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(4))
    return {
      phi_Isc: avg(bifiCoeffs.map(c => c.phi_Isc)),
      phi_Voc: avg(bifiCoeffs.map(c => c.phi_Voc)),
      phi_Pmax: avg(bifiCoeffs.map(c => c.phi_Pmax)),
      phi_FF: avg(bifiCoeffs.map(c => c.phi_FF)),
    }
  }, [bifiCoeffs])

  // Average front/rear electrical parameters
  const avgParams = useMemo(() => {
    const avg = (arr: number[]) => parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2))
    return {
      pmax_front: avg(samples.map(s => s.pmax_front)),
      pmax_rear: avg(samples.map(s => s.pmax_rear)),
      voc_front: avg(samples.map(s => s.voc_front)),
      voc_rear: avg(samples.map(s => s.voc_rear)),
      isc_front: avg(samples.map(s => s.isc_front)),
      isc_rear: avg(samples.map(s => s.isc_rear)),
      ff_front: avg(samples.map(s => s.ff_front)),
      ff_rear: avg(samples.map(s => s.ff_rear)),
    }
  }, [samples])

  // Bifaciality gain vs G_rear
  const irradianceData = useMemo(
    () => generateIrradianceData(avgCoeffs.phi_Pmax, avgParams.pmax_front),
    [avgCoeffs, avgParams]
  )

  // Temperature correction data
  const tempCorrData = useMemo(
    () => genTempCorrectionData(avgCoeffs.phi_Pmax),
    [avgCoeffs]
  )

  // Energy yield gain from bifaciality
  const estimatedAnnualGain = parseFloat((avgCoeffs.phi_Pmax * 20 * 0.85).toFixed(1)) // rough: φ × avg_albedo_factor × utilization

  // Per-sample bar chart data
  const frontRearBarData = useMemo(() =>
    samples.map(s => ({
      id: s.sampleId.replace("BiFi-", ""),
      front: s.pmax_front,
      rear: s.pmax_rear,
      phi: parseFloat((s.pmax_rear / s.pmax_front * 100).toFixed(1)),
    })), [samples])

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-blue-600">{(avgCoeffs.phi_Pmax * 100).toFixed(1)}%</div>
            <div className="text-xs text-gray-500">φ_Pmax</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-green-600">{avgParams.pmax_front} W</div>
            <div className="text-xs text-gray-500">Front Pmax</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-purple-600">{avgParams.pmax_rear} W</div>
            <div className="text-xs text-gray-500">Rear Pmax</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-amber-600">{(avgCoeffs.phi_Isc * 100).toFixed(1)}%</div>
            <div className="text-xs text-gray-500">φ_Isc</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-cyan-600">+{estimatedAnnualGain}%</div>
            <div className="text-xs text-gray-500">Est. Annual Gain</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Front & Rear Electrical Parameters Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" />
              Front & Rear Electrical Parameters
            </CardTitle>
            <CardDescription className="text-xs">Average across {samples.length} modules at STC (1000 W/m²)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-3 font-semibold">Parameter</th>
                    <th className="text-right py-2 pr-3 font-semibold">Front</th>
                    <th className="text-right py-2 pr-3 font-semibold">Rear</th>
                    <th className="text-right py-2 font-semibold">φ (ratio)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { param: "Pmax (W)", front: avgParams.pmax_front, rear: avgParams.pmax_rear, phi: avgCoeffs.phi_Pmax },
                    { param: "Voc (V)", front: avgParams.voc_front, rear: avgParams.voc_rear, phi: avgCoeffs.phi_Voc },
                    { param: "Isc (A)", front: avgParams.isc_front, rear: avgParams.isc_rear, phi: avgCoeffs.phi_Isc },
                    { param: "FF (%)", front: avgParams.ff_front, rear: avgParams.ff_rear, phi: avgCoeffs.phi_FF },
                  ].map(({ param, front, rear, phi }) => (
                    <tr key={param} className="border-b hover:bg-gray-50">
                      <td className="py-2 pr-3 font-medium text-muted-foreground">{param}</td>
                      <td className="py-2 pr-3 text-right font-mono font-semibold text-blue-600">{front}</td>
                      <td className="py-2 pr-3 text-right font-mono font-semibold text-purple-600">{rear}</td>
                      <td className="py-2 text-right font-mono font-bold text-amber-600">{(phi * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Bifaciality Coefficients per Sample */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Bifaciality Coefficients per Sample
            </CardTitle>
            <CardDescription className="text-xs">φ = Parameter_rear / Parameter_front</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-3 font-semibold">Sample</th>
                    <th className="text-right py-2 pr-3 font-semibold">φ_Isc</th>
                    <th className="text-right py-2 pr-3 font-semibold">φ_Voc</th>
                    <th className="text-right py-2 pr-3 font-semibold">φ_Pmax</th>
                    <th className="text-right py-2 font-semibold">φ_FF</th>
                  </tr>
                </thead>
                <tbody>
                  {bifiCoeffs.map(c => (
                    <tr key={c.sampleId} className="border-b hover:bg-gray-50">
                      <td className="py-1.5 pr-3 font-mono text-muted-foreground">{c.sampleId}</td>
                      <td className="py-1.5 pr-3 text-right font-mono">{(c.phi_Isc * 100).toFixed(1)}%</td>
                      <td className="py-1.5 pr-3 text-right font-mono">{(c.phi_Voc * 100).toFixed(1)}%</td>
                      <td className="py-1.5 pr-3 text-right font-mono font-bold text-amber-600">{(c.phi_Pmax * 100).toFixed(1)}%</td>
                      <td className="py-1.5 text-right font-mono">{(c.phi_FF * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 font-semibold bg-amber-50">
                    <td className="py-2 pr-3">Average</td>
                    <td className="py-2 pr-3 text-right font-mono">{(avgCoeffs.phi_Isc * 100).toFixed(1)}%</td>
                    <td className="py-2 pr-3 text-right font-mono">{(avgCoeffs.phi_Voc * 100).toFixed(1)}%</td>
                    <td className="py-2 pr-3 text-right font-mono font-bold text-amber-700">{(avgCoeffs.phi_Pmax * 100).toFixed(1)}%</td>
                    <td className="py-2 text-right font-mono">{(avgCoeffs.phi_FF * 100).toFixed(1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Bifaciality Gain vs G_rear */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Bifaciality Gain vs Rear Irradiance
            </CardTitle>
            <CardDescription className="text-xs">
              G_eff = G_front + φ × G_rear | φ_Pmax = {(avgCoeffs.phi_Pmax * 100).toFixed(1)}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={irradianceData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="g_rear" type="number"
                       label={{ value: "Rear Irradiance G_rear (W/m²)", position: "insideBottom", offset: -5, fontSize: 9 }}
                       tick={{ fontSize: 10 }} />
                <YAxis yAxisId="gain" label={{ value: "BiFi Gain (%)", angle: -90, position: "insideLeft", fontSize: 9 }}
                       tick={{ fontSize: 10 }} />
                <YAxis yAxisId="power" orientation="right"
                       label={{ value: "Power (W)", angle: 90, position: "insideRight", fontSize: 9 }}
                       tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number, name: string) => [
                  name === "BiFi Gain" ? `${v.toFixed(2)}%` : `${v.toFixed(1)} W`,
                  name
                ]} labelFormatter={l => `G_rear = ${l} W/m²`} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line yAxisId="gain" type="monotone" dataKey="bifi_gain" stroke="#22c55e" strokeWidth={2.5}
                      dot={{ r: 3 }} name="BiFi Gain" />
                <Line yAxisId="power" type="monotone" dataKey="p_bifacial" stroke="#3b82f6" strokeWidth={2}
                      dot={{ r: 2 }} name="P_bifacial" strokeDasharray="5 3" />
                <Line yAxisId="power" type="monotone" dataKey="p_mono" stroke="#94a3b8" strokeWidth={1.5}
                      dot={false} name="P_mono (ref)" strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Front vs Rear Power per Sample */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              Front vs Rear Pmax per Sample
            </CardTitle>
            <CardDescription className="text-xs">Per-module comparison with φ_Pmax labels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={frontRearBarData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="id" tick={{ fontSize: 10 }}
                       label={{ value: "Sample", position: "insideBottom", offset: -5, fontSize: 9 }} />
                <YAxis domain={[0, 450]} tick={{ fontSize: 10 }}
                       label={{ value: "Pmax (W)", angle: -90, position: "insideLeft", fontSize: 9 }} />
                <Tooltip formatter={(v: number, name: string) => [`${v} ${name.includes("φ") ? "%" : "W"}`, name]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="front" name="Front Pmax (W)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rear" name="Rear Pmax (W)" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* BiFi at different irradiance (Temperature Correction) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Bifaciality at Different Irradiance Levels</CardTitle>
            <CardDescription className="text-xs">STC vs temperature-corrected φ_Pmax at varying front irradiance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tempCorrData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="irradiance" tick={{ fontSize: 10 }}
                       label={{ value: "Front Irradiance (W/m²)", position: "insideBottom", offset: -5, fontSize: 9 }} />
                <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 10 }}
                       label={{ value: "φ_Pmax (%)", angle: -90, position: "insideLeft", fontSize: 9 }} />
                <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="bifi_stc" name="φ at STC" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bifi_actual" name="φ Temp-Corrected" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Energy Yield Gain vs Albedo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Energy Yield Gain vs Ground Albedo</CardTitle>
            <CardDescription className="text-xs">Estimated annual energy gain from rear-side irradiance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={ALBEDO_DATA}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="albedo" tick={{ fontSize: 10 }}
                       label={{ value: "Ground Albedo (%)", position: "insideBottom", offset: -5, fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }}
                       label={{ value: "Energy Gain (%)", angle: -90, position: "insideLeft", fontSize: 9 }} />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload
                    return (
                      <div className="bg-white border rounded shadow-sm p-2 text-xs">
                        <div className="font-semibold">{d.surface}</div>
                        <div>Albedo: {d.albedo}%</div>
                        <div className="text-green-600 font-bold">+{d.gain}% energy gain</div>
                      </div>
                    )
                  }
                  return null
                }} />
                <Line type="monotone" dataKey="gain" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} name="Energy Gain (%)" />
                <ReferenceLine x={20} stroke="#f59e0b" strokeDasharray="4 2"
                               label={{ value: "Grass", fill: "#f59e0b", fontSize: 9, position: "top" }} />
                <ReferenceLine x={50} stroke="#3b82f6" strokeDasharray="4 2"
                               label={{ value: "White Roof", fill: "#3b82f6", fontSize: 9, position: "top" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* IEC Reference */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-3 pb-3">
          <div className="text-xs text-amber-800">
            <span className="font-semibold">IEC TS 60904-1-2 (Bifacial Measurement):</span>{" "}
            Bifaciality coefficient φ = Parameter_rear / Parameter_front measured at STC with one side masked.
            G_effective = G_front + φ × G_rear. Energy yield gain depends on ground albedo, mounting height, and row spacing.
            Typical bifaciality factors: PERC 70-75%, HJT 85-95%, TOPCon 80-85%.
            Temperature correction applies as higher irradiance increases cell temperature, slightly reducing φ.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
