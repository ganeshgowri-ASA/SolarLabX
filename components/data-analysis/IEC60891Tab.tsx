// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ScatterChart, Scatter,
} from "recharts"
import { Zap, Calculator, GitCompare, ArrowRight } from "lucide-react"
import { IECStandardCard } from "./IECStandardCard"

// ─── IEC 60891 I-V Curve Translation ────────────────────────────────────────

// Module parameters (for a typical 400W module)
const MODULE = {
  isc_stc: 10.50,   // A
  voc_stc: 48.50,   // V
  impp_stc: 9.90,   // A
  vmpp_stc: 40.40,  // V
  pmax_stc: 400,    // W
  nCells: 72,
  alpha: 0.048,     // %/°C for Isc
  beta: -0.29,      // %/°C for Voc
}

// Correction parameters
const CORRECTION_PARAMS = {
  Rs: 0.35,       // Ω — Series resistance
  kappa: 0.0008,  // Ω/°C — Temperature coefficient of Rs
  alpha_abs: MODULE.isc_stc * MODULE.alpha / 100, // A/°C (absolute)
  beta_abs: MODULE.voc_stc * MODULE.beta / 100,    // V/°C (absolute)
  a: 0.0005,      // Polynomial coeff for Procedure 3
  b: -0.00002,    // Polynomial coeff for Procedure 3
}

// Generate a measured I-V curve at given G and T
function generateIVCurve(G: number, T: number, points: number = 50): { v: number; i: number }[] {
  const gRatio = G / 1000
  const dT = T - 25

  // Adjust parameters for conditions
  const Isc = MODULE.isc_stc * gRatio * (1 + MODULE.alpha / 100 * dT)
  const Voc = MODULE.voc_stc * (1 + MODULE.beta / 100 * dT) + MODULE.nCells * 0.0259 * (T + 273.15) / 298.15 * Math.log(gRatio > 0 ? gRatio : 0.01)
  const n = 1.2 // diode ideality factor
  const Vt = n * 0.0259 * (T + 273.15) / 298.15 * MODULE.nCells

  const curve: { v: number; i: number }[] = []
  for (let j = 0; j <= points; j++) {
    const v = (Voc * j) / points
    // Simplified single-diode model
    const I = Isc - Isc * (Math.exp((v - (Isc - Isc * j / points) * CORRECTION_PARAMS.Rs) / Vt) - 1) / (Math.exp(Voc / Vt) - 1)
    const current = Math.max(0, Isc * (1 - (Math.exp((v) / Vt) - 1) / (Math.exp(Voc / Vt) - 1)))
    curve.push({
      v: parseFloat(v.toFixed(3)),
      i: parseFloat(current.toFixed(4)),
    })
  }
  return curve
}

// IEC 60891 Procedure 1: Linear interpolation
function procedure1(
  measuredIV: { v: number; i: number }[],
  G_meas: number, T_meas: number,
  G_stc: number, T_stc: number
): { v: number; i: number }[] {
  const dG = G_stc - G_meas
  const dT = T_stc - T_meas
  const Isc_meas = measuredIV[0]?.i || MODULE.isc_stc

  return measuredIV.map((pt) => {
    const dI = Isc_meas * (dG / G_meas) + CORRECTION_PARAMS.alpha_abs * dT
    const dV = -CORRECTION_PARAMS.beta_abs * dT - CORRECTION_PARAMS.Rs * dI - CORRECTION_PARAMS.kappa * pt.i * dT
    return {
      v: parseFloat((pt.v + dV).toFixed(3)),
      i: parseFloat((pt.i + dI).toFixed(4)),
    }
  })
}

// IEC 60891 Procedure 2: Bilinear interpolation (simplified — correct G first, then T)
function procedure2(
  measuredIV: { v: number; i: number }[],
  G_meas: number, T_meas: number,
  G_stc: number, T_stc: number
): { v: number; i: number }[] {
  // Step 1: Correct for irradiance
  const gRatio = G_stc / G_meas
  const gCorrected = measuredIV.map((pt) => ({
    v: parseFloat((pt.v + CORRECTION_PARAMS.Rs * pt.i * (1 - gRatio)).toFixed(3)),
    i: parseFloat((pt.i * gRatio).toFixed(4)),
  }))

  // Step 2: Correct for temperature
  const dT = T_stc - T_meas
  return gCorrected.map((pt) => ({
    v: parseFloat((pt.v - CORRECTION_PARAMS.beta_abs * dT - CORRECTION_PARAMS.kappa * pt.i * dT).toFixed(3)),
    i: parseFloat((pt.i + CORRECTION_PARAMS.alpha_abs * dT).toFixed(4)),
  }))
}

// IEC 60891 Procedure 3: Polynomial (simplified)
function procedure3(
  measuredIV: { v: number; i: number }[],
  G_meas: number, T_meas: number,
  G_stc: number, T_stc: number
): { v: number; i: number }[] {
  const dT = T_stc - T_meas
  const gRatio = G_stc / G_meas
  const Isc_meas = measuredIV[0]?.i || MODULE.isc_stc

  return measuredIV.map((pt) => {
    const dI = Isc_meas * (gRatio - 1) + CORRECTION_PARAMS.alpha_abs * dT
    const dV = -CORRECTION_PARAMS.beta_abs * dT
      - (CORRECTION_PARAMS.Rs + CORRECTION_PARAMS.a * dT) * dI
      + CORRECTION_PARAMS.b * dT * pt.v
    return {
      v: parseFloat((pt.v + dV).toFixed(3)),
      i: parseFloat((pt.i + dI).toFixed(4)),
    }
  })
}

// Extract Pmax from I-V curve
function extractPmax(curve: { v: number; i: number }[]): { pmax: number; vmpp: number; impp: number } {
  let pmax = 0, vmpp = 0, impp = 0
  curve.forEach((pt) => {
    const p = pt.v * pt.i
    if (p > pmax) { pmax = p; vmpp = pt.v; impp = pt.i }
  })
  return { pmax: parseFloat(pmax.toFixed(2)), vmpp: parseFloat(vmpp.toFixed(2)), impp: parseFloat(impp.toFixed(3)) }
}

export function IEC60891Tab() {
  const [procedure, setProcedure] = useState<"1" | "2" | "3">("1")
  const [measG, setMeasG] = useState(800)
  const [measT, setMeasT] = useState(45)

  // Measured I-V curve at non-STC conditions
  const measuredIV = useMemo(() => generateIVCurve(measG, measT), [measG, measT])

  // Reference STC I-V curve
  const stcIV = useMemo(() => generateIVCurve(1000, 25), [])

  // Corrected I-V curves
  const corrected1 = useMemo(() => procedure1(measuredIV, measG, measT, 1000, 25), [measuredIV, measG, measT])
  const corrected2 = useMemo(() => procedure2(measuredIV, measG, measT, 1000, 25), [measuredIV, measG, measT])
  const corrected3 = useMemo(() => procedure3(measuredIV, measG, measT, 1000, 25), [measuredIV, measG, measT])

  const activeCorrected = procedure === "1" ? corrected1 : procedure === "2" ? corrected2 : corrected3

  // Extract key parameters
  const measParams = extractPmax(measuredIV)
  const stcParams = extractPmax(stcIV)
  const corrParams = extractPmax(activeCorrected)
  const corr1Params = extractPmax(corrected1)
  const corr2Params = extractPmax(corrected2)
  const corr3Params = extractPmax(corrected3)

  // Deviation of corrected from STC reference
  const deviation = parseFloat(((corrParams.pmax - stcParams.pmax) / stcParams.pmax * 100).toFixed(2))

  // Chart data: combine all curves
  const chartData = useMemo(() => {
    const maxLen = Math.max(measuredIV.length, stcIV.length, activeCorrected.length)
    return Array.from({ length: maxLen }, (_, i) => ({
      idx: i,
      v_meas: measuredIV[i]?.v,
      i_meas: measuredIV[i]?.i,
      v_stc: stcIV[i]?.v,
      i_stc: stcIV[i]?.i,
      v_corr: activeCorrected[i]?.v,
      i_corr: activeCorrected[i]?.i,
    }))
  }, [measuredIV, stcIV, activeCorrected])

  // Power curves
  const powerData = useMemo(() => {
    return Array.from({ length: measuredIV.length }, (_, i) => ({
      v: measuredIV[i]?.v || 0,
      p_meas: parseFloat(((measuredIV[i]?.v || 0) * (measuredIV[i]?.i || 0)).toFixed(2)),
      p_stc: parseFloat(((stcIV[i]?.v || 0) * (stcIV[i]?.i || 0)).toFixed(2)),
      p_corr: parseFloat(((activeCorrected[i]?.v || 0) * (activeCorrected[i]?.i || 0)).toFixed(2)),
    }))
  }, [measuredIV, stcIV, activeCorrected])

  return (
    <div className="space-y-4">
      <IECStandardCard
        standard="IEC 60891:2021"
        title="Photovoltaic devices — Procedures for temperature and irradiance corrections to measured I-V characteristics"
        testConditions={[
          "Input: I-V curve measured at non-STC conditions (G ≠ 1000 W/m², T ≠ 25°C)",
          "Required parameters: Rs, κ (kappa), α, β from characterization tests",
          "Output: Translated I-V curve at Standard Test Conditions (STC)",
          "Three procedures with increasing accuracy and complexity",
        ]}
        dosageLevels={[
          "Procedure 1: Linear interpolation — simplest, single-step correction",
          "Procedure 2: Bilinear — two-step (G correction then T correction)",
          "Procedure 3: Polynomial — highest accuracy, uses additional coefficients a, b",
        ]}
        passCriteria={[
          { parameter: "Pmax deviation", requirement: "Corrected Pmax within ±0.5% of reference STC", note: "Validation" },
          { parameter: "Rs determination", requirement: "Per IEC 60891 Annex A", note: "Ω" },
          { parameter: "κ (kappa)", requirement: "Temperature coefficient of Rs", note: "Ω/°C" },
        ]}
        failCriteria={[
          { parameter: "Deviation > 1%", requirement: "Re-evaluate correction parameters" },
          { parameter: "Negative current", requirement: "Non-physical result — check measurement or parameters" },
        ]}
        notes={[
          "Procedure 1 is most widely used; Procedure 3 is most accurate for large G/T deviations",
          "Rs and κ must be determined experimentally for the specific module type",
        ]}
      />

      {/* Input Parameters */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calculator className="h-4 w-4 text-blue-500" />
            Measurement & Correction Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Measured G (W/m²)</Label>
              <Input type="number" min={100} max={1200} step={50} value={measG} onChange={(e) => setMeasG(+e.target.value)} className="w-24 h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Measured T (°C)</Label>
              <Input type="number" min={10} max={80} step={5} value={measT} onChange={(e) => setMeasT(+e.target.value)} className="w-20 h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Procedure</Label>
              <Select value={procedure} onValueChange={(v) => setProcedure(v as "1" | "2" | "3")}>
                <SelectTrigger className="w-[200px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1" className="text-xs">Procedure 1 (Linear)</SelectItem>
                  <SelectItem value="2" className="text-xs">Procedure 2 (Bilinear)</SelectItem>
                  <SelectItem value="3" className="text-xs">Procedure 3 (Polynomial)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono bg-muted px-3 py-1.5 rounded">
              <span>Rs={CORRECTION_PARAMS.Rs}Ω</span>
              <span>κ={CORRECTION_PARAMS.kappa}Ω/°C</span>
              <span>α={CORRECTION_PARAMS.alpha_abs.toFixed(4)}A/°C</span>
              <span>β={CORRECTION_PARAMS.beta_abs.toFixed(3)}V/°C</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="border-l-4 border-l-gray-400">
          <CardContent className="pt-4 pb-3">
            <CardDescription>Measured Pmax ({measG} W/m², {measT}°C)</CardDescription>
            <div className="text-2xl font-bold font-mono text-gray-600">{measParams.pmax} W</div>
            <p className="text-xs text-muted-foreground">Vmpp={measParams.vmpp}V Impp={measParams.impp}A</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-400">
          <CardContent className="pt-4 pb-3">
            <CardDescription>STC Reference</CardDescription>
            <div className="text-2xl font-bold font-mono text-green-600">{stcParams.pmax} W</div>
            <p className="text-xs text-muted-foreground">Vmpp={stcParams.vmpp}V Impp={stcParams.impp}A</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-400">
          <CardContent className="pt-4 pb-3">
            <CardDescription>Corrected Pmax (Proc. {procedure})</CardDescription>
            <div className="text-2xl font-bold font-mono text-blue-600">{corrParams.pmax} W</div>
            <p className="text-xs text-muted-foreground">Vmpp={corrParams.vmpp}V Impp={corrParams.impp}A</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-400">
          <CardContent className="pt-4 pb-3">
            <CardDescription>Deviation from STC</CardDescription>
            <div className={`text-2xl font-bold font-mono ${Math.abs(deviation) <= 0.5 ? "text-green-600" : Math.abs(deviation) <= 1 ? "text-amber-600" : "text-red-600"}`}>
              {deviation > 0 ? "+" : ""}{deviation}%
            </div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                {Math.abs(deviation) <= 0.5 ? "Excellent" : Math.abs(deviation) <= 1 ? "Acceptable" : "Review"}
              </Badge>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* I-V Curve Comparison */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            I-V Curve: Measured → Corrected to STC (Procedure {procedure})
          </CardTitle>
          <CardDescription className="text-xs">
            Gray = Measured ({measG} W/m², {measT}°C) | Green = STC Reference | Blue = Corrected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="v" type="number" domain={[0, 55]}
                label={{ value: "Voltage (V)", position: "insideBottom", offset: -5, fontSize: 9 }} tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 12]}
                label={{ value: "Current (A)", angle: -90, position: "insideLeft", fontSize: 9 }} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => v.toFixed(4)} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line data={measuredIV.map((p) => ({ v: p.v, value: p.i }))} dataKey="value" type="monotone" stroke="#9ca3af" strokeWidth={2} dot={false} name={`Measured (${measG}W/m², ${measT}°C)`} />
              <Line data={stcIV.map((p) => ({ v: p.v, value: p.i }))} dataKey="value" type="monotone" stroke="#22c55e" strokeWidth={2} strokeDasharray="6 3" dot={false} name="STC Reference" />
              <Line data={activeCorrected.map((p) => ({ v: p.v, value: p.i }))} dataKey="value" type="monotone" stroke="#3b82f6" strokeWidth={2} dot={false} name={`Corrected (Proc. ${procedure})`} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Power Curve Comparison */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">P-V Curve Comparison</CardTitle>
          <CardDescription className="text-xs">Power vs voltage — before and after correction</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={powerData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="v" label={{ value: "Voltage (V)", position: "insideBottom", offset: -5, fontSize: 9 }} tick={{ fontSize: 10 }} />
              <YAxis label={{ value: "Power (W)", angle: -90, position: "insideLeft", fontSize: 9 }} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="p_meas" stroke="#9ca3af" strokeWidth={2} dot={false} name="Measured" />
              <Line type="monotone" dataKey="p_stc" stroke="#22c55e" strokeWidth={2} strokeDasharray="6 3" dot={false} name="STC Reference" />
              <Line type="monotone" dataKey="p_corr" stroke="#3b82f6" strokeWidth={2} dot={false} name={`Corrected (Proc. ${procedure})`} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Procedure Comparison Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-purple-500" />
            Procedure Comparison — All Three Methods
          </CardTitle>
          <CardDescription className="text-xs">
            Input: {measG} W/m², {measT}°C → Target: 1000 W/m², 25°C (STC)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-3 text-left font-semibold">Parameter</th>
                  <th className="py-2 px-2 text-right font-semibold">Measured</th>
                  <th className="py-2 px-2 text-right font-semibold">Proc. 1 (Linear)</th>
                  <th className="py-2 px-2 text-right font-semibold">Proc. 2 (Bilinear)</th>
                  <th className="py-2 px-2 text-right font-semibold">Proc. 3 (Polynomial)</th>
                  <th className="py-2 px-2 text-right font-semibold">STC Reference</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { param: "Pmax (W)", meas: measParams.pmax, p1: corr1Params.pmax, p2: corr2Params.pmax, p3: corr3Params.pmax, stc: stcParams.pmax },
                  { param: "Vmpp (V)", meas: measParams.vmpp, p1: corr1Params.vmpp, p2: corr2Params.vmpp, p3: corr3Params.vmpp, stc: stcParams.vmpp },
                  { param: "Impp (A)", meas: measParams.impp, p1: corr1Params.impp, p2: corr2Params.impp, p3: corr3Params.impp, stc: stcParams.impp },
                ].map((row) => (
                  <tr key={row.param} className="border-b hover:bg-muted/50">
                    <td className="py-1.5 pr-3 font-semibold">{row.param}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-gray-500">{row.meas}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-blue-600">{row.p1}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-purple-600">{row.p2}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-amber-600">{row.p3}</td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-green-700">{row.stc}</td>
                  </tr>
                ))}
                <tr className="border-t-2">
                  <td className="py-1.5 pr-3 font-semibold">ΔPmax vs STC</td>
                  <td className="py-1.5 px-2 text-right font-mono text-gray-400">—</td>
                  {[corr1Params, corr2Params, corr3Params].map((p, i) => {
                    const dev = ((p.pmax - stcParams.pmax) / stcParams.pmax * 100)
                    return (
                      <td key={i} className={`py-1.5 px-2 text-right font-mono font-bold ${Math.abs(dev) <= 0.5 ? "text-green-600" : Math.abs(dev) <= 1 ? "text-amber-600" : "text-red-600"}`}>
                        {dev > 0 ? "+" : ""}{dev.toFixed(2)}%
                      </td>
                    )
                  })}
                  <td className="py-1.5 px-2 text-right font-mono font-bold text-green-700">ref</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* IEC Reference */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-3 pb-3">
          <div className="text-xs text-amber-800">
            <span className="font-semibold">IEC 60891:2021:</span>{" "}
            Defines three procedures for translating I-V curves measured at arbitrary conditions to STC (1000 W/m², 25°C, AM1.5G).
            <strong> Procedure 1</strong> (linear): I₂ = I₁ + Isc₁(G₂/G₁ − 1) + α(T₂ − T₁); V₂ = V₁ − Rs(I₂ − I₁) − κI₁(T₂ − T₁) + β(T₂ − T₁).
            <strong> Procedure 2</strong> (bilinear): Two-step — first correct G, then T.
            <strong> Procedure 3</strong> (polynomial): Adds coefficients a, b for higher accuracy.
            Rs and κ are determined per Annex A using two I-V curves at same T, different G.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
