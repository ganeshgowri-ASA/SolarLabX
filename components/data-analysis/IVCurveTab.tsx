// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ResponsiveContainer, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
  ComposedChart, Area
} from "recharts"
import { Zap, Thermometer, TrendingUp, CheckCircle, AlertTriangle, Download } from "lucide-react"
import { IECStandardCard } from "./IECStandardCard"

// ─── IV Curve generation ────────────────────────────────────────────────────

function generateIVCurvePoints(
  isc: number, voc: number, nPoints = 200,
  tempCoeffA = 0.0005, tempCoeffB = -0.0031, // /°C for Isc and Voc
  Tcell = 25
): { voltage: number; current: number; power: number }[] {
  // Adjust for temperature
  const Isc_t = isc * (1 + tempCoeffA * (Tcell - 25))
  const Voc_t = voc * (1 + tempCoeffB * (Tcell - 25))
  const idealityFactor = 1.3
  const Vt = 0.02585 * (Tcell + 273.15) / 298.15 * idealityFactor

  const points = []
  for (let i = 0; i <= nPoints; i++) {
    const v = (i / nPoints) * Voc_t
    // Single-diode simplified
    const I_diode = Isc_t * (1 - Math.exp((v - Voc_t) / (Vt * 60)))
    const current = Math.max(0, I_diode)
    const power = parseFloat((v * current).toFixed(3))
    points.push({
      voltage: parseFloat(v.toFixed(3)),
      current: parseFloat(current.toFixed(4)),
      power
    })
  }
  return points
}

// Extract key parameters from IV curve
function extractIVParameters(curve: { voltage: number; current: number; power: number }[]) {
  const maxPowerPoint = curve.reduce((m, p) => p.power > m.power ? p : m, curve[0])
  const voc = curve[curve.length - 1].voltage
  const isc = curve[0].current
  const ff = maxPowerPoint.power / (isc * voc)
  const pmax = maxPowerPoint.power
  const vmp = maxPowerPoint.voltage
  const imp = maxPowerPoint.current
  const efficiency = pmax / (1.65 * 1000) * 100 // rough 1.65m² module area

  // Rs estimate from dV/dI near Voc
  const nearVoc = curve.filter(p => p.voltage > voc * 0.95 && p.current > 0).slice(-5)
  let rs = 0
  if (nearVoc.length >= 2) {
    const dV = nearVoc[nearVoc.length - 1].voltage - nearVoc[0].voltage
    const dI = nearVoc[0].current - nearVoc[nearVoc.length - 1].current
    rs = dI !== 0 ? Math.abs(dV / dI) : 0
  }

  // Rsh estimate from dV/dI near Isc
  const nearIsc = curve.filter(p => p.current > isc * 0.95 && p.voltage < voc * 0.1).slice(0, 5)
  let rsh = 0
  if (nearIsc.length >= 2) {
    const dV2 = nearIsc[nearIsc.length - 1].voltage - nearIsc[0].voltage
    const dI2 = nearIsc[0].current - nearIsc[nearIsc.length - 1].current
    rsh = dI2 !== 0 ? Math.abs(dV2 / dI2) : 0
  }

  return { voc: parseFloat(voc.toFixed(3)), isc: parseFloat(isc.toFixed(4)), vmp: parseFloat(vmp.toFixed(3)),
           imp: parseFloat(imp.toFixed(4)), pmax: parseFloat(pmax.toFixed(2)),
           ff: parseFloat(ff.toFixed(4)), efficiency: parseFloat(efficiency.toFixed(2)),
           rs: parseFloat(rs.toFixed(3)), rsh: parseFloat(rsh.toFixed(1)) }
}

// IEC 60891 temperature correction (Procedure 1)
function correctToSTC(params: ReturnType<typeof extractIVParameters>, Tcell: number, G: number,
                      alphaIsc: number, betaVoc: number, gammaP: number, Gref = 1000) {
  const dT = 25 - Tcell
  const Pmax_corr = params.pmax * (Gref / G) * (1 + gammaP * dT / 100)
  const Voc_corr = params.voc + betaVoc * dT
  const Isc_corr = params.isc * (Gref / G) * (1 + alphaIsc * dT / 100)
  const FF_corr = Pmax_corr / (Isc_corr * Voc_corr)
  return {
    pmax: parseFloat(Pmax_corr.toFixed(2)),
    voc: parseFloat(Voc_corr.toFixed(3)),
    isc: parseFloat(Isc_corr.toFixed(4)),
    ff: parseFloat(FF_corr.toFixed(4)),
  }
}

const TEMPERATURES = [15, 25, 35, 45, 55, 65]
const IRRADIANCES = [200, 400, 600, 800, 1000, 1100]

export function IVCurveTab() {
  const [iscNom, setIscNom] = useState(10.5)
  const [vocNom, setVocNom] = useState(48.5)
  const [alphaIsc, setAlphaIsc] = useState(0.05)   // %/°C
  const [betaVoc, setBetaVoc] = useState(-0.31)    // %/°C as absolute
  const [gammaP, setGammaP] = useState(-0.35)      // %/°C
  const [measuredTemp, setMeasuredTemp] = useState(45)
  const [measuredG, setMeasuredG] = useState(800)
  const [showTempCorrection, setShowTempCorrection] = useState(false)

  const stcCurve = useMemo(() => generateIVCurvePoints(iscNom, vocNom, 200, alphaIsc / 100, betaVoc / vocNom, 25), [iscNom, vocNom, alphaIsc, betaVoc])
  const measuredCurve = useMemo(() => generateIVCurvePoints(iscNom * measuredG / 1000, vocNom + betaVoc / 100 * vocNom * (measuredTemp - 25), 200, alphaIsc / 100, betaVoc / vocNom, measuredTemp), [iscNom, vocNom, alphaIsc, betaVoc, gammaP, measuredTemp, measuredG])

  const stcParams = useMemo(() => extractIVParameters(stcCurve), [stcCurve])
  const measParams = useMemo(() => extractIVParameters(measuredCurve), [measuredCurve])
  const correctedParams = useMemo(() => correctToSTC(measParams, measuredTemp, measuredG, alphaIsc, betaVoc * vocNom / 100, gammaP), [measParams, measuredTemp, measuredG, alphaIsc, betaVoc, vocNom, gammaP])

  // Multi-temperature overlay curves
  const tempOverlayCurves = useMemo(() =>
    TEMPERATURES.map(T => ({
      temp: T,
      color: ["#1d4ed8", "#2563eb", "#3b82f6", "#f59e0b", "#f97316", "#ef4444"][TEMPERATURES.indexOf(T)],
      curve: generateIVCurvePoints(iscNom, vocNom, 100, alphaIsc / 100, betaVoc / vocNom, T)
    })), [iscNom, vocNom, alphaIsc, betaVoc])

  // Power matrix (Pmax at different G and T)
  const powerMatrix = useMemo(() =>
    IRRADIANCES.map(G => {
      const row: Record<string, number | string> = { G }
      TEMPERATURES.forEach(T => {
        const isc_adj = iscNom * G / 1000 * (1 + alphaIsc / 100 * (T - 25))
        const voc_adj = vocNom * (1 + betaVoc / 100 * (T - 25))
        const ff_adj = 0.78 * (1 - 0.0025 * (T - 25))
        row[`T${T}`] = parseFloat((isc_adj * voc_adj * ff_adj).toFixed(1))
      })
      return row
    }), [iscNom, vocNom, alphaIsc, betaVoc])

  const pctDiff = (a: number, b: number) => b !== 0 ? parseFloat(((a - b) / b * 100).toFixed(2)) : 0

  return (
    <div className="space-y-4">
      <IECStandardCard
        standard="IEC 60904-1"
        title="Photovoltaic devices — Part 1: Measurement of photovoltaic current-voltage characteristics"
        testConditions={[
          "Standard Test Conditions (STC): 1000 W/m² irradiance",
          "Cell temperature: 25°C ± 2°C",
          "Spectral distribution: AM 1.5G (IEC 60904-3)",
          "Four-wire Kelvin connection for I-V sweep",
        ]}
        dosageLevels={[
          "Irradiance: 1000 W/m² (STC), 200–1100 W/m² for linearity",
          "Temperature range: 25°C (STC), 15–75°C for temp correction (IEC 60891)",
          "Sweep rate: ≤100 ms for capacitance-insensitive modules",
        ]}
        passCriteria={[
          { parameter: "Pmax", requirement: "Within ±3% of nameplate rating", note: "At STC" },
          { parameter: "Isc", requirement: "Within ±3% of nameplate", note: "Short-circuit current" },
          { parameter: "Voc", requirement: "Within ±3% of nameplate", note: "Open-circuit voltage" },
          { parameter: "FF", requirement: ">70% for crystalline Si", note: "Fill factor" },
        ]}
        failCriteria={[
          { parameter: "Pmax deviation", requirement: ">±3% from nameplate at STC" },
          { parameter: "FF", requirement: "<65% indicates possible defect or mismatch" },
        ]}
        notes={[
          "Temperature correction per IEC 60891 required if Tcell ≠ 25°C",
          "Measurement uncertainty budget per ISO/IEC 17025 typically ±2% for Pmax",
        ]}
      />
      {/* Module Parameters Input */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Module Parameters & Measurement Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Isc (A) @ STC</Label>
              <Input type="number" step="0.1" value={iscNom} onChange={e => setIscNom(+e.target.value)} className="h-7 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Voc (V) @ STC</Label>
              <Input type="number" step="0.1" value={vocNom} onChange={e => setVocNom(+e.target.value)} className="h-7 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">α(Isc) %/°C</Label>
              <Input type="number" step="0.001" value={alphaIsc} onChange={e => setAlphaIsc(+e.target.value)} className="h-7 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">β(Voc) %/°C</Label>
              <Input type="number" step="0.001" value={betaVoc} onChange={e => setBetaVoc(+e.target.value)} className="h-7 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">γ(Pmax) %/°C</Label>
              <Input type="number" step="0.001" value={gammaP} onChange={e => setGammaP(+e.target.value)} className="h-7 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Measured T (°C)</Label>
              <Input type="number" step="1" value={measuredTemp} onChange={e => setMeasuredTemp(+e.target.value)} className="h-7 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Measured G (W/m²)</Label>
              <Input type="number" step="10" value={measuredG} onChange={e => setMeasuredG(+e.target.value)} className="h-7 text-xs" />
            </div>
            <div className="flex items-end">
              <Button size="sm" className="h-7 text-xs" onClick={() => setShowTempCorrection(true)}>
                Apply IEC 60891 Correction
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extracted Parameters Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "STC Reference", params: stcParams, color: "border-green-200", badge: "STC", badgeColor: "bg-green-100 text-green-700" },
          { label: `Measured (${measuredTemp}°C, ${measuredG} W/m²)`, params: measParams, color: "border-amber-200", badge: "MEAS", badgeColor: "bg-amber-100 text-amber-700" },
          { label: "Corrected to STC (IEC 60891)", params: correctedParams ? { ...stcParams, ...correctedParams } : stcParams, color: "border-blue-200", badge: "CORR", badgeColor: "bg-blue-100 text-blue-700" },
        ].map(({ label, params, color, badge, badgeColor }) => (
          <Card key={badge} className={`border-l-4 ${color}`}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${badgeColor}`}>{badge}</span>
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                {[
                  { key: "pmax", label: "Pmax (W)" }, { key: "voc", label: "Voc (V)" },
                  { key: "isc", label: "Isc (A)" }, { key: "vmp", label: "Vmp (V)" },
                  { key: "imp", label: "Imp (A)" }, { key: "ff", label: "FF" },
                  { key: "efficiency", label: "η (%)" }, { key: "rs", label: "Rs (Ω)" },
                ].map(({ key, label: lbl }) => {
                  const val = (params as any)[key]
                  return (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-gray-500">{lbl}</span>
                      <span className="font-mono font-semibold">{val !== undefined ? val.toFixed ? val.toFixed(key === "efficiency" || key === "pmax" ? 2 : key === "rs" || key === "rsh" ? 3 : 4) : val : "—"}</span>
                    </div>
                  )
                })}
              </div>
              {badge === "CORR" && correctedParams && (
                <div className="mt-2 pt-2 border-t">
                  <div className="text-xs font-semibold text-gray-600 mb-1">vs STC Reference</div>
                  <div className={`text-xs font-bold ${Math.abs(pctDiff(correctedParams.pmax, stcParams.pmax)) <= 3 ? "text-green-600" : "text-red-600"}`}>
                    ΔPmax = {pctDiff(correctedParams.pmax, stcParams.pmax).toFixed(2)}%
                    {Math.abs(pctDiff(correctedParams.pmax, stcParams.pmax)) <= 3 ? " ✓ Within ±3%" : " ✗ Exceeds ±3%"}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* IV Curve Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* STC vs Measured vs Corrected */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">I-V Curves: STC vs Measured vs Corrected (IEC 60891)</CardTitle>
            <CardDescription className="text-xs">Voltage (V) vs Current (A)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="voltage" type="number" domain={[0, vocNom * 1.05]}
                       label={{ value: "Voltage (V)", position: "insideBottom", offset: -5, fontSize: 10 }} tick={{ fontSize: 10 }} />
                <YAxis label={{ value: "Current (A)", angle: -90, position: "insideLeft", fontSize: 10 }} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: any) => [`${v} A`]} labelFormatter={l => `${l} V`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line data={stcCurve} type="monotone" dataKey="current" stroke="#22c55e" name="STC Reference" dot={false} strokeWidth={2} />
                <Line data={measuredCurve} type="monotone" dataKey="current" stroke="#f97316" name={`Measured (${measuredTemp}°C, ${measuredG}W/m²)`} dot={false} strokeWidth={2} strokeDasharray="6 3" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Power Curve */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">P-V Curve with MPP Tracking</CardTitle>
            <CardDescription className="text-xs">Power (W) vs Voltage (V) – Maximum Power Point</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={stcCurve}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="voltage" label={{ value: "Voltage (V)", position: "insideBottom", offset: -5, fontSize: 10 }} tick={{ fontSize: 10 }} />
                <YAxis label={{ value: "Power (W)", angle: -90, position: "insideLeft", fontSize: 10 }} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: any) => [`${v} W`]} labelFormatter={l => `${l} V`} />
                <ReferenceLine x={stcParams.vmp} stroke="#ef4444" strokeDasharray="4 2"
                               label={{ value: `Vmp=${stcParams.vmp}V`, fill: "#ef4444", fontSize: 9 }} />
                <Area type="monotone" dataKey="power" stroke="#2563eb" fill="#dbeafe" name="Power (W)" fillOpacity={0.5} dot={false} strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Multi-temperature IV curves */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Temperature-Dependent I-V Curves</CardTitle>
            <CardDescription className="text-xs">Effect of cell temperature on IV characteristics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="voltage" type="number" domain={[0, vocNom * 1.05]}
                       label={{ value: "Voltage (V)", position: "insideBottom", offset: -5, fontSize: 10 }} tick={{ fontSize: 10 }} />
                <YAxis label={{ value: "Current (A)", angle: -90, position: "insideLeft", fontSize: 10 }} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {tempOverlayCurves.map(({ temp, color, curve }) => (
                  <Line key={temp} data={curve} type="monotone" dataKey="current"
                        stroke={color} name={`${temp}°C`} dot={false} strokeWidth={1.5} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Power Matrix */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Power Matrix – Pmax (W)</CardTitle>
            <CardDescription className="text-xs">IEC 61853 Part 1 – Power at irradiance/temperature combinations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="border p-1.5 bg-gray-50 text-left font-semibold">G (W/m²)</th>
                    {TEMPERATURES.map(T => (
                      <th key={T} className="border p-1.5 bg-gray-50 text-center font-semibold">{T}°C</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {powerMatrix.map((row) => (
                    <tr key={row.G as number}>
                      <td className="border p-1.5 font-semibold bg-gray-50">{row.G}</td>
                      {TEMPERATURES.map(T => {
                        const pmax = row[`T${T}`] as number
                        const maxPmax = iscNom * vocNom * 0.78
                        const ratio = pmax / maxPmax
                        return (
                          <td key={T} className="border p-1.5 text-center font-mono"
                              style={{ backgroundColor: `rgba(37,99,235,${Math.min(ratio, 1).toFixed(2)})`,
                                       color: ratio > 0.5 ? "white" : "inherit" }}>
                            {(pmax as number).toFixed(1)}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 text-xs text-gray-400">Unit: Watts (W)</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IEC 60891 Procedures Reference */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4 pb-3">
          <div className="text-xs text-blue-800">
            <span className="font-semibold">IEC 60891:2021 Temperature Correction:</span>{" "}
            Procedure 1 uses measured temperature coefficients α, β, γ to translate I-V curve to STC.
            Corrected values: Isc(STC) = Isc × (G_STC/G) × [1 + α(T_STC - T_cell)];
            Voc(STC) = Voc + β × (T_STC - T_cell);
            Pmax(STC) = Pmax × (G_STC/G) × [1 + γ(T_STC - T_cell)].
            Pass criterion: |ΔPmax| ≤ 3% of nominal.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
