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
  Tooltip, Legend, AreaChart, Area, ComposedChart, Bar,
} from "recharts"
import { Waves, Calculator, AlertTriangle } from "lucide-react"
import { IECStandardCard } from "./IECStandardCard"

// ─── Spectral Data per IEC 60904-7 ─────────────────────────────────────────

// Wavelength range (nm) — 300 to 1200 nm for c-Si
const WAVELENGTHS = Array.from({ length: 19 }, (_, i) => 300 + i * 50)

// AM1.5G Reference Spectrum (simplified — relative spectral irradiance)
// Values normalized: actual W/m²/nm would be larger; these represent relative shape
function am15gSpectrum(): { wl: number; irr: number }[] {
  // Approximate AM1.5G shape
  const shape = [0.15, 0.45, 0.70, 0.90, 1.00, 0.98, 0.92, 0.85, 0.78, 0.70, 0.62, 0.55, 0.48, 0.42, 0.35, 0.28, 0.22, 0.16, 0.10]
  return WAVELENGTHS.map((wl, i) => ({ wl, irr: parseFloat(shape[i].toFixed(3)) }))
}

// Measured spectrum (can vary with atmospheric conditions)
interface SpectrumProfile {
  id: string
  name: string
  description: string
  shape: number[]
}

const SPECTRUM_PROFILES: SpectrumProfile[] = [
  {
    id: "clear-sky",
    name: "Clear Sky (AM1.5G-like)",
    description: "Near-standard outdoor spectrum",
    shape: [0.14, 0.44, 0.69, 0.89, 0.99, 0.97, 0.91, 0.84, 0.77, 0.69, 0.61, 0.54, 0.47, 0.41, 0.34, 0.27, 0.21, 0.15, 0.09],
  },
  {
    id: "overcast",
    name: "Overcast / Diffuse",
    description: "Blue-shifted, more UV/visible, less IR",
    shape: [0.22, 0.55, 0.80, 0.95, 1.00, 0.92, 0.82, 0.72, 0.62, 0.52, 0.43, 0.35, 0.28, 0.22, 0.17, 0.12, 0.08, 0.05, 0.03],
  },
  {
    id: "high-am",
    name: "High Air Mass (AM > 3)",
    description: "Red-shifted, sunrise/sunset or high latitude",
    shape: [0.05, 0.20, 0.45, 0.70, 0.88, 0.95, 1.00, 0.98, 0.92, 0.85, 0.78, 0.70, 0.62, 0.55, 0.47, 0.38, 0.30, 0.22, 0.15],
  },
  {
    id: "indoor-xenon",
    name: "Indoor Xenon Simulator (Class A+)",
    description: "Close to AM1.5G — high-quality simulator",
    shape: [0.16, 0.46, 0.71, 0.91, 1.00, 0.97, 0.93, 0.86, 0.79, 0.71, 0.63, 0.56, 0.49, 0.43, 0.36, 0.29, 0.23, 0.17, 0.11],
  },
  {
    id: "indoor-led",
    name: "Indoor LED Simulator",
    description: "Discrete peaks, poor UV coverage",
    shape: [0.02, 0.08, 0.35, 0.85, 1.00, 0.90, 0.95, 0.88, 0.80, 0.72, 0.60, 0.50, 0.35, 0.20, 0.10, 0.05, 0.02, 0.01, 0.00],
  },
]

// Spectral Responsivity (SR) of different cell technologies
interface CellTechnology {
  id: string
  name: string
  sr: number[] // relative SR at each wavelength
}

const CELL_TECHNOLOGIES: CellTechnology[] = [
  {
    id: "mono-si",
    name: "Mono c-Si (PERC)",
    sr: [0.05, 0.20, 0.40, 0.58, 0.72, 0.82, 0.88, 0.92, 0.95, 0.97, 1.00, 0.98, 0.92, 0.82, 0.65, 0.42, 0.20, 0.05, 0.00],
  },
  {
    id: "hjt",
    name: "HJT (Heterojunction)",
    sr: [0.08, 0.25, 0.45, 0.62, 0.75, 0.84, 0.90, 0.94, 0.96, 0.98, 1.00, 0.97, 0.90, 0.78, 0.60, 0.38, 0.18, 0.04, 0.00],
  },
  {
    id: "cdte",
    name: "CdTe (Thin Film)",
    sr: [0.10, 0.30, 0.55, 0.75, 0.90, 0.95, 1.00, 0.92, 0.75, 0.50, 0.25, 0.08, 0.02, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
  },
]

// Reference cell SR (typically pyranometer-like or c-Si reference cell)
const REF_CELL_SR = [0.05, 0.18, 0.38, 0.55, 0.70, 0.80, 0.87, 0.91, 0.94, 0.96, 1.00, 0.97, 0.90, 0.80, 0.62, 0.40, 0.18, 0.04, 0.00]

// Compute spectral mismatch factor M per IEC 60904-7
function computeM(
  refSpectrum: { wl: number; irr: number }[],
  measSpectrum: { wl: number; irr: number }[],
  testDeviceSR: number[],
  refDeviceSR: number[]
): number {
  // M = [∫ E_ref × SR_test dλ × ∫ E_meas × SR_ref dλ] / [∫ E_meas × SR_test dλ × ∫ E_ref × SR_ref dλ]
  let num1 = 0, num2 = 0, den1 = 0, den2 = 0
  for (let i = 0; i < WAVELENGTHS.length; i++) {
    const Eref = refSpectrum[i]?.irr || 0
    const Emeas = measSpectrum[i]?.irr || 0
    const SRtest = testDeviceSR[i] || 0
    const SRref = refDeviceSR[i] || 0
    const dLambda = 50 // nm step

    num1 += Eref * SRtest * dLambda
    num2 += Emeas * SRref * dLambda
    den1 += Emeas * SRtest * dLambda
    den2 += Eref * SRref * dLambda
  }
  if (den1 === 0 || den2 === 0) return 1.0
  return (num1 * num2) / (den1 * den2)
}

export function SpectralMismatchTab() {
  const [spectrumId, setSpectrumId] = useState("overcast")
  const [cellTechId, setCellTechId] = useState("mono-si")

  const refSpectrum = useMemo(() => am15gSpectrum(), [])
  const specProfile = SPECTRUM_PROFILES.find((s) => s.id === spectrumId)!
  const cellTech = CELL_TECHNOLOGIES.find((c) => c.id === cellTechId)!

  const measSpectrum = useMemo(() => {
    return WAVELENGTHS.map((wl, i) => ({ wl, irr: specProfile.shape[i] }))
  }, [specProfile])

  // Compute M factor
  const M = useMemo(() => {
    return computeM(refSpectrum, measSpectrum, cellTech.sr, REF_CELL_SR)
  }, [refSpectrum, measSpectrum, cellTech])

  const mFormatted = parseFloat(M.toFixed(4))
  const mDeviation = parseFloat(((M - 1) * 100).toFixed(2))

  // Compute M for all spectrum × technology combinations
  const mMatrix = useMemo(() => {
    return SPECTRUM_PROFILES.map((sp) => {
      const measSpec = WAVELENGTHS.map((wl, i) => ({ wl, irr: sp.shape[i] }))
      const row: Record<string, number | string> = { spectrum: sp.name.split("(")[0].trim() }
      CELL_TECHNOLOGIES.forEach((ct) => {
        const m = computeM(refSpectrum, measSpec, ct.sr, REF_CELL_SR)
        row[ct.id] = parseFloat(m.toFixed(4))
      })
      return row
    })
  }, [refSpectrum])

  // Chart data: spectra overlay
  const spectraChartData = useMemo(() => {
    return WAVELENGTHS.map((wl, i) => ({
      wl,
      am15g: refSpectrum[i].irr,
      measured: measSpectrum[i].irr,
      sr_test: cellTech.sr[i],
      sr_ref: REF_CELL_SR[i],
    }))
  }, [refSpectrum, measSpectrum, cellTech])

  // Corrected Isc calculation
  const Isc_measured = 10.50 // A (from flash test)
  const Isc_corrected = parseFloat((Isc_measured / M).toFixed(4))

  return (
    <div className="space-y-4">
      <IECStandardCard
        standard="IEC 60904-7:2019"
        title="Computation of the spectral mismatch correction for measurements of photovoltaic devices"
        testConditions={[
          "Input: Reference spectrum (AM1.5G per IEC 60904-3), measured light source spectrum",
          "Spectral responsivity (SR) of test device and reference device",
          "Spectral irradiance measured with spectroradiometer",
          "Wavelength range: 300–1200 nm for c-Si, 300–900 nm for CdTe/a-Si",
        ]}
        dosageLevels={[
          "M = [∫E_ref·SR_test dλ · ∫E_meas·SR_ref dλ] / [∫E_meas·SR_test dλ · ∫E_ref·SR_ref dλ]",
          "Corrected Isc = Isc_measured / M",
          "M = 1.000 means perfect spectral match (no correction needed)",
        ]}
        passCriteria={[
          { parameter: "M factor", requirement: "0.98 ≤ M ≤ 1.02", note: "±2% is typical acceptable range" },
          { parameter: "Simulator class A+", requirement: "Spectral match 0.875–1.125 per band", note: "IEC 60904-9" },
          { parameter: "Isc correction", requirement: "Apply M factor to measured Isc", note: "Mandatory for certification" },
        ]}
        failCriteria={[
          { parameter: "M outside 0.95–1.05", requirement: "Large mismatch — verify spectroradiometer calibration" },
          { parameter: "Missing SR data", requirement: "Cannot compute M without spectral responsivity" },
        ]}
        notes={[
          "Spectral mismatch correction is mandatory for IEC 60904-1 I-V measurements",
          "M depends on both light source and device technology — different for each combination",
        ]}
      />

      {/* Controls */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Waves className="h-4 w-4 text-purple-500" />
            Spectral Mismatch Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Light Source / Spectrum</Label>
              <Select value={spectrumId} onValueChange={setSpectrumId}>
                <SelectTrigger className="w-[260px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPECTRUM_PROFILES.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Test Device Technology</Label>
              <Select value={cellTechId} onValueChange={setCellTechId}>
                <SelectTrigger className="w-[200px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CELL_TECHNOLOGIES.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded">
              Reference cell: c-Si standard | Reference spectrum: AM1.5G (IEC 60904-3)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="border-l-4 border-l-purple-400">
          <CardContent className="pt-4 pb-3">
            <CardDescription>Spectral Mismatch Factor (M)</CardDescription>
            <div className={`text-3xl font-bold font-mono ${Math.abs(mDeviation) <= 2 ? "text-green-600" : Math.abs(mDeviation) <= 5 ? "text-amber-600" : "text-red-600"}`}>
              {mFormatted}
            </div>
            <p className="text-xs text-muted-foreground">
              Deviation: {mDeviation > 0 ? "+" : ""}{mDeviation}%
              <Badge variant="outline" className="ml-2 text-xs">
                {Math.abs(mDeviation) <= 2 ? "Good" : Math.abs(mDeviation) <= 5 ? "Acceptable" : "High mismatch"}
              </Badge>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>Measured Isc</CardDescription>
            <div className="text-2xl font-bold font-mono text-gray-600">{Isc_measured} A</div>
            <p className="text-xs text-muted-foreground">Before spectral correction</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>Corrected Isc</CardDescription>
            <div className="text-2xl font-bold font-mono text-blue-600">{Isc_corrected} A</div>
            <p className="text-xs text-muted-foreground">Isc_corrected = Isc_meas / M</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>ΔIsc</CardDescription>
            <div className={`text-2xl font-bold font-mono ${Math.abs(mDeviation) <= 2 ? "text-green-600" : "text-amber-600"}`}>
              {(Isc_corrected - Isc_measured) > 0 ? "+" : ""}{(Isc_corrected - Isc_measured).toFixed(4)} A
            </div>
            <p className="text-xs text-muted-foreground">{((Isc_corrected - Isc_measured) / Isc_measured * 100).toFixed(2)}% correction</p>
          </CardContent>
        </Card>
      </div>

      {/* Spectra Overlay Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Spectral Irradiance & Responsivity Overlay</CardTitle>
          <CardDescription className="text-xs">
            Left axis: Relative irradiance | Right axis: Relative spectral responsivity (SR)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={spectraChartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="wl" label={{ value: "Wavelength (nm)", position: "insideBottom", offset: -5, fontSize: 9 }} tick={{ fontSize: 10 }} />
              <YAxis yAxisId="irr" domain={[0, 1.1]} label={{ value: "Rel. Irradiance", angle: -90, position: "insideLeft", fontSize: 9 }} tick={{ fontSize: 10 }} />
              <YAxis yAxisId="sr" orientation="right" domain={[0, 1.1]} label={{ value: "Rel. SR", angle: 90, position: "insideRight", fontSize: 9 }} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Area yAxisId="irr" type="monotone" dataKey="am15g" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} name="AM1.5G Reference" />
              <Area yAxisId="irr" type="monotone" dataKey="measured" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} strokeDasharray="6 3" name={`Measured (${specProfile.name.split("(")[0].trim()})`} />
              <Line yAxisId="sr" type="monotone" dataKey="sr_test" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} name={`SR: ${cellTech.name}`} />
              <Line yAxisId="sr" type="monotone" dataKey="sr_ref" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="SR: Ref Cell" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* M Factor Matrix */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calculator className="h-4 w-4 text-amber-500" />
            Spectral Mismatch Factor Matrix (M) — All Combinations
          </CardTitle>
          <CardDescription className="text-xs">
            M factor for each light source × cell technology combination (reference cell: c-Si standard)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-3 text-left font-semibold">Light Source</th>
                  {CELL_TECHNOLOGIES.map((ct) => (
                    <th key={ct.id} className="py-2 px-3 text-right font-semibold">{ct.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mMatrix.map((row) => (
                  <tr key={row.spectrum as string} className="border-b hover:bg-muted/50">
                    <td className="py-1.5 pr-3 font-medium">{row.spectrum as string}</td>
                    {CELL_TECHNOLOGIES.map((ct) => {
                      const val = row[ct.id] as number
                      const dev = Math.abs((val - 1) * 100)
                      return (
                        <td key={ct.id} className="py-1.5 px-3 text-right">
                          <span className={`font-mono font-bold ${dev <= 2 ? "text-green-600" : dev <= 5 ? "text-amber-600" : "text-red-600"}`}>
                            {val.toFixed(4)}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 border border-green-400" /> |M−1| ≤ 2%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-400" /> 2% &lt; |M−1| ≤ 5%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 border border-red-400" /> |M−1| &gt; 5%</span>
          </div>
        </CardContent>
      </Card>

      {/* IEC Reference */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-3 pb-3">
          <div className="text-xs text-amber-800">
            <span className="font-semibold">IEC 60904-7:2019:</span>{" "}
            The spectral mismatch factor M corrects for differences between the test light source spectrum
            and the AM1.5G reference spectrum (IEC 60904-3), as well as differences between the spectral
            responsivity of the test device and the reference device. M = 1.0000 means zero mismatch.
            The corrected short-circuit current is Isc_corrected = Isc_measured / M.
            For high-quality Class A+ solar simulators with well-matched reference cells, M is typically
            0.98–1.02. Larger deviations indicate significant spectral mismatch requiring correction.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
