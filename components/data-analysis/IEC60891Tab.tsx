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
  Tooltip, Legend,
} from "recharts"
import { Zap, Calculator, Download, FileSpreadsheet, FileText, ChevronDown, ChevronRight } from "lucide-react"
import { exportToExcel, exportToCSV } from "@/lib/export-utils"

// ─── Types ──────────────────────────────────────────────────────────────────
type ProcedureId = "1" | "2" | "3" | "4"

interface CorrectionParams {
  Rs: number
  kappa: number
  alpha: number
  beta: number
  a1: number
  a2: number
  b1: number
  b2: number
}

interface IVPoint { v: number; i: number }

// ─── I-V Curve Generation (single-diode model, 20 points) ───────────────────
function generateIVCurve(G: number, T: number, nPts = 20): IVPoint[] {
  const gRatio = Math.max(G / 1000, 0.01)
  const dT = T - 25
  const Isc = 10.5 * gRatio * (1 + 0.00048 * dT)
  const Voc = 48.5 * (1 + -0.0029 * dT) + 72 * 0.0259 * ((T + 273.15) / 298.15) * Math.log(gRatio)
  const Vt = 1.2 * 0.0259 * ((T + 273.15) / 298.15) * 72
  const curve: IVPoint[] = []
  for (let j = 0; j <= nPts; j++) {
    const v = (Voc * j) / nPts
    const i = Math.max(0, Isc * (1 - (Math.exp(v / Vt) - 1) / (Math.exp(Voc / Vt) - 1)))
    curve.push({ v: +v.toFixed(3), i: +i.toFixed(4) })
  }
  return curve
}

// ─── IEC 60891 Correction Procedures ────────────────────────────────────────
function applyProcedure1(iv: IVPoint[], Gm: number, Tm: number, Gt: number, Tt: number, p: CorrectionParams): IVPoint[] {
  const dT = Tt - Tm
  const Isc1 = iv[0]?.i || 10.5
  return iv.map((pt) => {
    const dI = Isc1 * ((Gt - Gm) / Gm) + p.alpha * dT
    const dV = -p.beta * dT - p.Rs * dI - p.kappa * pt.i * dT
    return { v: +(pt.v + dV).toFixed(3), i: +(pt.i + dI).toFixed(4) }
  })
}

function applyProcedure2(iv: IVPoint[], Gm: number, Tm: number, Gt: number, Tt: number, p: CorrectionParams): IVPoint[] {
  const gRatio = Gt / Gm
  const dT = Tt - Tm
  const gCorr = iv.map((pt) => ({
    v: +(pt.v + p.Rs * pt.i * (1 - gRatio) + p.a1 * (Gt - Gm) + p.a2 * (Gt - Gm) ** 2).toFixed(3),
    i: +(pt.i * gRatio).toFixed(4),
  }))
  return gCorr.map((pt) => ({
    v: +(pt.v - p.beta * dT - p.kappa * pt.i * dT + p.b1 * dT + p.b2 * dT ** 2).toFixed(3),
    i: +(pt.i + p.alpha * dT).toFixed(4),
  }))
}

function applyProcedure3(iv: IVPoint[], Gm: number, Tm: number, Gt: number, Tt: number, p: CorrectionParams): IVPoint[] {
  const dT = Tt - Tm
  const gRatio = Gt / Gm
  const Isc1 = iv[0]?.i || 10.5
  return iv.map((pt) => {
    const dI = Isc1 * (gRatio - 1) + p.alpha * dT
    const dV = -p.beta * dT - (p.Rs + p.a1 * dT) * dI + p.b1 * dT * pt.v
      + p.a2 * (Gt - Gm) + p.b2 * dT ** 2
    return { v: +(pt.v + dV).toFixed(3), i: +(pt.i + dI).toFixed(4) }
  })
}

function applyProcedure4(iv: IVPoint[], Gm: number, Tm: number, Gt: number, Tt: number, p: CorrectionParams): IVPoint[] {
  // Procedure 4: Extended polynomial with full a1/a2/b1/b2 coupling
  const dT = Tt - Tm
  const dG = Gt - Gm
  const gRatio = Gt / Gm
  const Isc1 = iv[0]?.i || 10.5
  return iv.map((pt) => {
    const dI = Isc1 * (gRatio - 1) + p.alpha * dT + p.a1 * dG * dT
    const dV = -p.beta * dT - p.Rs * dI - p.kappa * pt.i * dT
      + p.b1 * dT * pt.v + p.a2 * dG ** 2 / Gm + p.b2 * dT ** 2
    return { v: +(pt.v + dV).toFixed(3), i: +(pt.i + dI).toFixed(4) }
  })
}

function correct(iv: IVPoint[], proc: ProcedureId, Gm: number, Tm: number, Gt: number, Tt: number, p: CorrectionParams): IVPoint[] {
  const fn = { "1": applyProcedure1, "2": applyProcedure2, "3": applyProcedure3, "4": applyProcedure4 }
  return fn[proc](iv, Gm, Tm, Gt, Tt, p)
}

function extractPmax(curve: IVPoint[]) {
  let pmax = 0, vmpp = 0, impp = 0
  curve.forEach((pt) => { const pw = pt.v * pt.i; if (pw > pmax) { pmax = pw; vmpp = pt.v; impp = pt.i } })
  return { pmax: +pmax.toFixed(2), vmpp: +vmpp.toFixed(2), impp: +impp.toFixed(3) }
}

// ─── Procedure metadata ─────────────────────────────────────────────────────
const PROC_INFO: Record<ProcedureId, { label: string; formula: string; extras: boolean }> = {
  "1": { label: "Procedure 1 — Linear interpolation", formula: "I₂ = I₁ + Isc₁·(G₂/G₁ − 1) + α·ΔT\nV₂ = V₁ − β·ΔT − Rs·ΔI − κ·I₁·ΔT", extras: false },
  "2": { label: "Procedure 2 — Bilinear (G then T)", formula: "Step 1 (G): I' = I₁·(G₂/G₁), V' = V₁ + Rs·I₁·(1−G₂/G₁) + a₁·ΔG + a₂·ΔG²\nStep 2 (T): I₂ = I' + α·ΔT, V₂ = V' − β·ΔT − κ·I'·ΔT + b₁·ΔT + b₂·ΔT²", extras: true },
  "3": { label: "Procedure 3 — Polynomial", formula: "I₂ = I₁ + Isc₁·(G₂/G₁ − 1) + α·ΔT\nV₂ = V₁ − β·ΔT − (Rs + a₁·ΔT)·ΔI + b₁·ΔT·V₁ + a₂·ΔG + b₂·ΔT²", extras: true },
  "4": { label: "Procedure 4 — Extended polynomial", formula: "I₂ = I₁ + Isc₁·(G₂/G₁ − 1) + α·ΔT + a₁·ΔG·ΔT\nV₂ = V₁ − β·ΔT − Rs·ΔI − κ·I₁·ΔT + b₁·ΔT·V₁ + a₂·ΔG²/G₁ + b₂·ΔT²", extras: true },
}

// ─── Component ──────────────────────────────────────────────────────────────
export function IEC60891Tab() {
  const [procedure, setProcedure] = useState<ProcedureId>("1")
  const [measG, setMeasG] = useState(800)
  const [measT, setMeasT] = useState(45)
  const [targG, setTargG] = useState(1000)
  const [targT, setTargT] = useState(25)
  const [params, setParams] = useState<CorrectionParams>({
    Rs: 0.35, kappa: 0.0008, alpha: 0.00504, beta: -0.14065,
    a1: 0.0005, a2: -0.00002, b1: -0.003, b2: 0.00001,
  })
  const [showSteps, setShowSteps] = useState(false)

  const setP = (key: keyof CorrectionParams, val: string) =>
    setParams((prev) => ({ ...prev, [key]: parseFloat(val) || 0 }))

  // Curves
  const measuredIV = useMemo(() => generateIVCurve(measG, measT), [measG, measT])
  const referenceIV = useMemo(() => generateIVCurve(targG, targT), [targG, targT])
  const correctedIV = useMemo(
    () => correct(measuredIV, procedure, measG, measT, targG, targT, params),
    [measuredIV, procedure, measG, measT, targG, targT, params]
  )

  const measP = extractPmax(measuredIV)
  const refP = extractPmax(referenceIV)
  const corrP = extractPmax(correctedIV)
  const deviation = +((corrP.pmax - refP.pmax) / refP.pmax * 100).toFixed(2)

  // Chart data — merge all 3 curves by index
  const chartData = useMemo(() =>
    Array.from({ length: 21 }, (_, i) => ({
      v_meas: measuredIV[i]?.v ?? 0,
      i_meas: measuredIV[i]?.i ?? 0,
      v_ref: referenceIV[i]?.v ?? 0,
      i_ref: referenceIV[i]?.i ?? 0,
      v_corr: correctedIV[i]?.v ?? 0,
      i_corr: correctedIV[i]?.i ?? 0,
    })), [measuredIV, referenceIV, correctedIV])

  // Step-by-step for first/mid/last point
  const sampleIndices = [0, 10, 20]
  const steps = sampleIndices.map((idx) => {
    const pt = measuredIV[idx]
    const cpt = correctedIV[idx]
    if (!pt || !cpt) return null
    const dI = +(cpt.i - pt.i).toFixed(4)
    const dV = +(cpt.v - pt.v).toFixed(3)
    return { idx, v1: pt.v, i1: pt.i, dI, dV, v2: cpt.v, i2: cpt.i }
  }).filter(Boolean)

  // Export helpers
  const handleExportExcel = () => {
    const data = measuredIV.map((m, i) => ({
      Point: i + 1,
      "V_meas (V)": m.v, "I_meas (A)": m.i,
      "V_ref (V)": referenceIV[i]?.v, "I_ref (A)": referenceIV[i]?.i,
      "V_corr (V)": correctedIV[i]?.v, "I_corr (A)": correctedIV[i]?.i,
      "P_meas (W)": +(m.v * m.i).toFixed(2),
      "P_corr (W)": +((correctedIV[i]?.v ?? 0) * (correctedIV[i]?.i ?? 0)).toFixed(2),
    }))
    exportToExcel(data, `IEC60891_P${procedure}_G${measG}_T${measT}`, "IV Curves")
  }

  const handleExportCSV = () => {
    const data = measuredIV.map((m, i) => ({
      Point: i + 1,
      "V_meas (V)": m.v, "I_meas (A)": m.i,
      "V_corr (V)": correctedIV[i]?.v, "I_corr (A)": correctedIV[i]?.i,
    }))
    exportToCSV(data, `IEC60891_P${procedure}_G${measG}_T${measT}`)
  }

  const info = PROC_INFO[procedure]

  return (
    <div className="space-y-4">
      {/* ── Procedure selector ─────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            IEC 60891 — I-V Curve Translation
          </CardTitle>
          <CardDescription className="text-xs">
            Select a correction procedure and adjust parameters below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Procedure select */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Correction Procedure</Label>
            <Select value={procedure} onValueChange={(v) => setProcedure(v as ProcedureId)}>
              <SelectTrigger className="w-full max-w-sm h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1" className="text-xs">Procedure 1 — Linear interpolation</SelectItem>
                <SelectItem value="2" className="text-xs">Procedure 2 — Bilinear (G then T)</SelectItem>
                <SelectItem value="3" className="text-xs">Procedure 3 — Polynomial</SelectItem>
                <SelectItem value="4" className="text-xs">Procedure 4 — Extended polynomial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Measured & Target conditions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold mb-2 block">Measured Conditions</Label>
              <div className="flex gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">G (W/m²)</Label>
                  <Input type="number" min={100} max={1300} step={50} value={measG}
                    onChange={(e) => setMeasG(+e.target.value)} className="w-24 h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">T (°C)</Label>
                  <Input type="number" min={-10} max={85} step={1} value={measT}
                    onChange={(e) => setMeasT(+e.target.value)} className="w-20 h-8 text-xs" />
                </div>
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold mb-2 block">Target Conditions</Label>
              <div className="flex gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">G (W/m²)</Label>
                  <Input type="number" min={100} max={1300} step={50} value={targG}
                    onChange={(e) => setTargG(+e.target.value)} className="w-24 h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">T (°C)</Label>
                  <Input type="number" min={-10} max={85} step={1} value={targT}
                    onChange={(e) => setTargT(+e.target.value)} className="w-20 h-8 text-xs" />
                </div>
              </div>
            </div>
          </div>

          {/* Correction parameters */}
          <div>
            <Label className="text-xs font-semibold mb-2 block">Correction Parameters</Label>
            <div className="flex flex-wrap gap-3">
              {([
                { key: "Rs", label: "Rs (Ω)", step: 0.01 },
                { key: "kappa", label: "κ (Ω/°C)", step: 0.0001 },
                { key: "alpha", label: "α (A/°C)", step: 0.0001 },
                { key: "beta", label: "β (V/°C)", step: 0.001 },
              ] as const).map(({ key, label, step }) => (
                <div key={key} className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">{label}</Label>
                  <Input type="number" step={step} value={params[key]}
                    onChange={(e) => setP(key, e.target.value)} className="w-28 h-8 text-xs font-mono" />
                </div>
              ))}
            </div>
            {info.extras && (
              <div className="flex flex-wrap gap-3 mt-3">
                {([
                  { key: "a1", label: "a₁", step: 0.0001 },
                  { key: "a2", label: "a₂", step: 0.00001 },
                  { key: "b1", label: "b₁", step: 0.001 },
                  { key: "b2", label: "b₂", step: 0.00001 },
                ] as const).map(({ key, label, step }) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">{label}</Label>
                    <Input type="number" step={step} value={params[key]}
                      onChange={(e) => setP(key, e.target.value)} className="w-28 h-8 text-xs font-mono" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── KPI cards ──────────────────────────────────────────────────── */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="border-l-4 border-l-orange-400">
          <CardContent className="pt-4 pb-3">
            <CardDescription className="text-xs">Measured ({measG} W/m², {measT}°C)</CardDescription>
            <div className="text-2xl font-bold font-mono text-orange-600">{measP.pmax} W</div>
            <p className="text-xs text-muted-foreground">Vmpp={measP.vmpp}V Impp={measP.impp}A</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-400">
          <CardContent className="pt-4 pb-3">
            <CardDescription className="text-xs">Reference ({targG} W/m², {targT}°C)</CardDescription>
            <div className="text-2xl font-bold font-mono text-blue-600">{refP.pmax} W</div>
            <p className="text-xs text-muted-foreground">Vmpp={refP.vmpp}V Impp={refP.impp}A</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-400">
          <CardContent className="pt-4 pb-3">
            <CardDescription className="text-xs">Corrected (Proc. {procedure})</CardDescription>
            <div className="text-2xl font-bold font-mono text-green-600">{corrP.pmax} W</div>
            <p className="text-xs text-muted-foreground">Vmpp={corrP.vmpp}V Impp={corrP.impp}A</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-400">
          <CardContent className="pt-4 pb-3">
            <CardDescription className="text-xs">Deviation from Reference</CardDescription>
            <div className={`text-2xl font-bold font-mono ${Math.abs(deviation) <= 0.5 ? "text-green-600" : Math.abs(deviation) <= 1 ? "text-amber-600" : "text-red-600"}`}>
              {deviation > 0 ? "+" : ""}{deviation}%
            </div>
            <Badge variant="outline" className="text-xs mt-1">
              {Math.abs(deviation) <= 0.5 ? "Excellent" : Math.abs(deviation) <= 1 ? "Acceptable" : "Review params"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* ── I-V Curve Chart ────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            I-V Curve Overlay — {info.label}
          </CardTitle>
          <CardDescription className="text-xs">
            Orange dashed = Measured | Blue = Reference | Green = Corrected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="v" type="number" domain={[0, "auto"]}
                label={{ value: "Voltage (V)", position: "insideBottom", offset: -5, fontSize: 10 }} tick={{ fontSize: 10 }} />
              <YAxis domain={[0, "auto"]}
                label={{ value: "Current (A)", angle: -90, position: "insideLeft", fontSize: 10 }} tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(v: number, name: string) => [v.toFixed(4) + " A", name]}
                labelFormatter={(v: number) => `V = ${v} V`}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line data={measuredIV.map((p) => ({ v: p.v, value: p.i }))}
                dataKey="value" type="monotone" stroke="#f97316" strokeWidth={2}
                strokeDasharray="6 4" dot={{ r: 2, fill: "#f97316" }}
                name={`Measured (${measG} W/m², ${measT}°C)`} />
              <Line data={referenceIV.map((p) => ({ v: p.v, value: p.i }))}
                dataKey="value" type="monotone" stroke="#3b82f6" strokeWidth={2}
                dot={{ r: 2, fill: "#3b82f6" }}
                name={`Reference (${targG} W/m², ${targT}°C)`} />
              <Line data={correctedIV.map((p) => ({ v: p.v, value: p.i }))}
                dataKey="value" type="monotone" stroke="#22c55e" strokeWidth={2.5}
                dot={{ r: 2.5, fill: "#22c55e" }}
                name={`Corrected (Proc. ${procedure})`} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Step-by-step calculation ───────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 cursor-pointer select-none" onClick={() => setShowSteps(!showSteps)}>
          <CardTitle className="text-sm flex items-center gap-2">
            {showSteps ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <Calculator className="h-4 w-4 text-blue-500" />
            Step-by-Step Calculation ({info.label})
          </CardTitle>
        </CardHeader>
        {showSteps && (
          <CardContent className="space-y-3">
            {/* Formula */}
            <div className="bg-muted rounded p-3">
              <p className="text-xs font-semibold mb-1">Formula:</p>
              <pre className="text-xs font-mono whitespace-pre-wrap text-muted-foreground">{info.formula}</pre>
              <p className="text-xs mt-2 text-muted-foreground">
                Where ΔT = T₂ − T₁ = {targT} − {measT} = <strong>{targT - measT}°C</strong>,
                ΔG = G₂ − G₁ = {targG} − {measG} = <strong>{targG - measG} W/m²</strong>,
                G₂/G₁ = <strong>{(targG / measG).toFixed(4)}</strong>
              </p>
            </div>
            {/* Sample points */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="py-1.5 text-left">Point</th>
                    <th className="py-1.5 text-right">V₁ (V)</th>
                    <th className="py-1.5 text-right">I₁ (A)</th>
                    <th className="py-1.5 text-right">ΔV (V)</th>
                    <th className="py-1.5 text-right">ΔI (A)</th>
                    <th className="py-1.5 text-right font-semibold text-green-700">V₂ (V)</th>
                    <th className="py-1.5 text-right font-semibold text-green-700">I₂ (A)</th>
                  </tr>
                </thead>
                <tbody>
                  {steps.map((s) => (
                    <tr key={s.idx} className="border-b hover:bg-muted/50">
                      <td className="py-1.5">{s.idx === 0 ? "Isc" : s.idx === 10 ? "Mid" : "Voc"}</td>
                      <td className="py-1.5 text-right font-mono">{s.v1}</td>
                      <td className="py-1.5 text-right font-mono">{s.i1}</td>
                      <td className="py-1.5 text-right font-mono text-blue-600">{s.dV > 0 ? "+" : ""}{s.dV}</td>
                      <td className="py-1.5 text-right font-mono text-blue-600">{s.dI > 0 ? "+" : ""}{s.dI}</td>
                      <td className="py-1.5 text-right font-mono font-semibold text-green-700">{s.v2}</td>
                      <td className="py-1.5 text-right font-mono font-semibold text-green-700">{s.i2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              Corrected Pmax = <strong>{corrP.pmax} W</strong> at Vmpp={corrP.vmpp} V, Impp={corrP.impp} A
              &nbsp;|&nbsp; Deviation from reference: <strong>{deviation > 0 ? "+" : ""}{deviation}%</strong>
            </p>
          </CardContent>
        )}
      </Card>

      {/* ── Export buttons ─────────────────────────────────────────────── */}
      <Card>
        <CardContent className="pt-4 pb-4 flex flex-wrap gap-3">
          <Button variant="outline" size="sm" className="text-xs gap-2" onClick={handleExportExcel}>
            <FileSpreadsheet className="h-3.5 w-3.5" /> Export to Excel
          </Button>
          <Button variant="outline" size="sm" className="text-xs gap-2" onClick={handleExportCSV}>
            <FileText className="h-3.5 w-3.5" /> Export to CSV
          </Button>
          <div className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
            <Download className="h-3 w-3" /> Includes measured, reference & corrected I-V data
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
