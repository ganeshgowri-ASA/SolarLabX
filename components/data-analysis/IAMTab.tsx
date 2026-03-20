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
  Tooltip, Legend, ReferenceLine, BarChart, Bar,
} from "recharts"
import { Aperture, Calculator, BarChart3 } from "lucide-react"
import { IECStandardCard } from "./IECStandardCard"
import { ExportDropdown } from "./ExportDropdown"

// ─── IAM Data & Models per IEC 61853-2 ─────────────────────────────────────

// Measured IAM data for a glass-glass module (typical)
function generateMeasuredIAM(): { angle: number; iam: number }[] {
  // Physical model: glass-air refraction + absorption
  const n = 1.526 // refractive index of glass
  const K = 4.0   // extinction coefficient × thickness (dimensionless)

  return Array.from({ length: 19 }, (_, i) => {
    const theta = i * 5
    const thetaRad = (theta * Math.PI) / 180
    if (theta === 0) return { angle: 0, iam: 1.0 }
    if (theta >= 90) return { angle: theta, iam: 0 }

    // Snell's law
    const sinRefracted = Math.sin(thetaRad) / n
    const thetaRefracted = Math.asin(Math.min(sinRefracted, 1))

    // Fresnel reflectance (average of s and p polarizations)
    const rs = Math.pow(Math.sin(thetaRefracted - thetaRad) / Math.sin(thetaRefracted + thetaRad), 2)
    const rp = Math.pow(Math.tan(thetaRefracted - thetaRad) / Math.tan(thetaRefracted + thetaRad), 2)
    const reflectance = (rs + rp) / 2

    // Transmittance through glass
    const tau = Math.exp(-K / Math.cos(thetaRefracted))

    // IAM = (1 - reflectance) * tau / ((1 - r0) * tau0)
    const thetaRef0 = 0
    const r0_rs = Math.pow((n - 1) / (n + 1), 2)
    const tau0 = Math.exp(-K)
    const iam = ((1 - reflectance) * tau) / ((1 - r0_rs) * tau0)

    // Add small measurement noise
    const noise = (Math.random() - 0.5) * 0.004
    return { angle: theta, iam: parseFloat(Math.max(0, Math.min(1.0, iam + noise)).toFixed(4)) }
  })
}

// ASHRAE model: IAM = 1 - b0 * (1/cos(θ) - 1)
function ashraeModel(angle: number, b0: number): number {
  if (angle >= 90) return 0
  if (angle === 0) return 1
  const thetaRad = (angle * Math.PI) / 180
  const iam = 1 - b0 * (1 / Math.cos(thetaRad) - 1)
  return parseFloat(Math.max(0, iam).toFixed(4))
}

// IAM losses at different tilt angles
const TILT_ANGLES = [0, 10, 20, 30, 45, 60, 75, 90]

function computeIAMLoss(tiltDeg: number, b0: number): number {
  // Simplified annual IAM loss estimation
  // Higher tilt = more low-angle light = more IAM loss
  const baseLoss = 2.5 // % at optimal tilt
  const tiltFactor = Math.abs(tiltDeg - 30) / 60 // deviation from optimal
  return parseFloat((baseLoss + tiltFactor * 3.5 + (Math.random() - 0.5) * 0.3).toFixed(2))
}

export function IAMTab() {
  const [b0, setB0] = useState(0.05)
  const [selectedTilt, setSelectedTilt] = useState(30)

  const measuredData = useMemo(() => generateMeasuredIAM(), [])

  // ASHRAE model fit
  const modelData = useMemo(() => {
    return Array.from({ length: 19 }, (_, i) => {
      const angle = i * 5
      return { angle, ashrae: ashraeModel(angle, b0) }
    })
  }, [b0])

  // Cosine model (ideal)
  const cosineData = useMemo(() => {
    return Array.from({ length: 19 }, (_, i) => {
      const angle = i * 5
      if (angle >= 90) return { angle, cosine: 0 }
      return { angle, cosine: parseFloat(Math.cos((angle * Math.PI) / 180).toFixed(4)) }
    })
  }, [])

  // Combined chart data
  const combinedData = useMemo(() => {
    return measuredData.map((m, i) => ({
      angle: m.angle,
      measured: m.iam,
      ashrae: modelData[i]?.ashrae || 0,
      cosine: cosineData[i]?.cosine || 0,
    }))
  }, [measuredData, modelData, cosineData])

  // Residuals
  const residualData = useMemo(() => {
    return measuredData.map((m, i) => ({
      angle: m.angle,
      residual: parseFloat(((m.iam - (modelData[i]?.ashrae || 0)) * 100).toFixed(2)),
    }))
  }, [measuredData, modelData])

  // R² for ASHRAE fit
  const r2 = useMemo(() => {
    const yMean = measuredData.reduce((s, d) => s + d.iam, 0) / measuredData.length
    const ssTot = measuredData.reduce((s, d) => s + (d.iam - yMean) ** 2, 0)
    const ssRes = measuredData.reduce((s, d, i) => {
      const pred = modelData[i]?.ashrae || 0
      return s + (d.iam - pred) ** 2
    }, 0)
    return ssTot > 0 ? parseFloat((1 - ssRes / ssTot).toFixed(6)) : 0
  }, [measuredData, modelData])

  // IAM loss at different tilts
  const tiltLossData = useMemo(() => {
    return TILT_ANGLES.map((tilt) => ({
      tilt: `${tilt}°`,
      loss: computeIAMLoss(tilt, b0),
    }))
  }, [b0])

  // Key angles
  const iam60 = measuredData.find((d) => d.angle === 60)?.iam || 0
  const iam75 = measuredData.find((d) => d.angle === 75)?.iam || 0

  return (
    <div className="space-y-4">
      <IECStandardCard
        standard="IEC 61853-2 Clause 7"
        title="Incidence Angle Modifier (IAM) — Angular response of PV modules"
        testConditions={[
          "Measure short-circuit current (Isc) at angles 0° to 90° in steps ≤ 10°",
          "Irradiance: collimated beam, 800–1100 W/m² equivalent",
          "Module temperature: 25°C ± 2°C or temperature-corrected",
          "Spectral correction per IEC 60904-7 if applicable",
        ]}
        dosageLevels={[
          "Angle range: 0° (normal) to 85°+ in ≤10° steps",
          "Minimum: 0°, 30°, 45°, 60°, 70°, 75°, 80°, 85°",
          "Repeat measurements for reproducibility",
        ]}
        passCriteria={[
          { parameter: "IAM at 0°", requirement: "Normalized to 1.000", note: "Reference" },
          { parameter: "IAM at 60°", requirement: "Typically 0.90–0.97 for glass", note: "Glass-glass" },
          { parameter: "ASHRAE b₀", requirement: "Report fitted coefficient", note: "Typ. 0.04–0.06" },
          { parameter: "R² (model fit)", requirement: "≥ 0.999 for ASHRAE model", note: "Quality check" },
        ]}
        failCriteria={[
          { parameter: "Asymmetry", requirement: "Left/right IAM differs >2% at same angle" },
          { parameter: "Anomalous", requirement: "IAM > 1.0 at any angle (measurement error)" },
        ]}
        notes={[
          "ASHRAE model: IAM = 1 − b₀ × (1/cos(θ) − 1)",
          "IAM is critical for energy yield prediction — accounts for 2–5% annual loss",
        ]}
      />

      {/* Export */}
      <div className="flex justify-end">
        <ExportDropdown
          config={{
            data: combinedData.map((d) => ({
              "Angle (°)": d.angle,
              "Measured IAM": d.measured,
              "ASHRAE Model": d.ashrae,
              "Cosine (ideal)": d.cosine,
              "Residual (%)": residualData.find((r) => r.angle === d.angle)?.residual ?? "",
            })),
            filename: `IAM_b0_${b0}`,
            title: "Incidence Angle Modifier (IAM) Analysis",
            standard: "IEC 61853-2 Clause 7",
            description: `ASHRAE b₀ = ${b0} | R² = ${r2}`,
            sheetName: "IAM Data",
          }}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>ASHRAE b₀</CardDescription>
            <div className="text-2xl font-bold font-mono text-blue-600">{b0}</div>
            <p className="text-xs text-muted-foreground">Fitted coefficient</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>IAM at 60°</CardDescription>
            <div className="text-2xl font-bold font-mono text-amber-600">{iam60}</div>
            <p className="text-xs text-muted-foreground">Key reporting angle</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>IAM at 75°</CardDescription>
            <div className="text-2xl font-bold font-mono text-red-600">{iam75}</div>
            <p className="text-xs text-muted-foreground">High-angle performance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>Model R²</CardDescription>
            <div className="text-2xl font-bold font-mono text-green-600">{r2}</div>
            <p className="text-xs text-muted-foreground">ASHRAE fit quality</p>
          </CardContent>
        </Card>
      </div>

      {/* IAM Curve Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Aperture className="h-4 w-4 text-blue-500" />
            IAM Curve — Measured vs Model (0–90°)
          </CardTitle>
          <CardDescription className="text-xs">
            ASHRAE b₀ = {b0} | Adjust:
            <Input
              type="number"
              step="0.005"
              min="0.01"
              max="0.15"
              value={b0}
              onChange={(e) => setB0(parseFloat(e.target.value) || 0.05)}
              className="inline-block w-20 h-6 text-xs ml-2 mr-1"
            />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="angle"
                label={{ value: "Angle of Incidence (°)", position: "insideBottom", offset: -5, fontSize: 9 }}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                domain={[0, 1.05]}
                label={{ value: "IAM", angle: -90, position: "insideLeft", fontSize: 9 }}
                tick={{ fontSize: 10 }}
              />
              <Tooltip formatter={(v: number) => v.toFixed(4)} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="measured" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Measured" />
              <Line type="monotone" dataKey="ashrae" stroke="#ef4444" strokeWidth={2} strokeDasharray="6 3" dot={false} name="ASHRAE Model" />
              <Line type="monotone" dataKey="cosine" stroke="#9ca3af" strokeWidth={1} strokeDasharray="3 3" dot={false} name="Cosine (ideal)" />
              <ReferenceLine x={60} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: "60°", fill: "#f59e0b", fontSize: 9 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Residuals */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Model Residuals (Measured − ASHRAE)</CardTitle>
            <CardDescription className="text-xs">Deviation in percentage points</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={residualData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="angle" tick={{ fontSize: 10 }} label={{ value: "Angle (°)", position: "insideBottom", offset: -5, fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} label={{ value: "Residual (%)", angle: -90, position: "insideLeft", fontSize: 9 }} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <ReferenceLine y={0} stroke="#666" />
                <Bar dataKey="residual" name="Residual" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* IAM Loss by Tilt */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Annual IAM Loss vs Module Tilt</CardTitle>
            <CardDescription className="text-xs">Estimated annual energy loss due to angular effects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={tiltLossData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="tilt" tick={{ fontSize: 10 }} label={{ value: "Tilt Angle", position: "insideBottom", offset: -5, fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} label={{ value: "IAM Loss (%)", angle: -90, position: "insideLeft", fontSize: 9 }} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="loss" name="IAM Loss" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Measurement Data Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">IAM Measurement Data</CardTitle>
          <CardDescription className="text-xs">IEC 61853-2 — Measured and modeled angular response</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-3 text-center font-semibold">Angle (°)</th>
                  <th className="py-2 px-2 text-right font-semibold">Measured IAM</th>
                  <th className="py-2 px-2 text-right font-semibold">ASHRAE Model</th>
                  <th className="py-2 px-2 text-right font-semibold">Cosine</th>
                  <th className="py-2 px-2 text-right font-semibold">Residual (%)</th>
                  <th className="py-2 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {combinedData.map((d, i) => {
                  const res = residualData[i]?.residual || 0
                  return (
                    <tr key={d.angle} className={`border-b hover:bg-muted/50 ${d.angle === 0 ? "bg-green-50" : ""}`}>
                      <td className="py-1.5 pr-3 text-center font-mono font-semibold">{d.angle}</td>
                      <td className="py-1.5 px-2 text-right font-mono text-blue-600">{d.measured}</td>
                      <td className="py-1.5 px-2 text-right font-mono text-red-600">{d.ashrae}</td>
                      <td className="py-1.5 px-2 text-right font-mono text-muted-foreground">{d.cosine}</td>
                      <td className={`py-1.5 px-2 text-right font-mono ${Math.abs(res) > 1 ? "text-red-600" : "text-green-600"}`}>
                        {res > 0 ? "+" : ""}{res}
                      </td>
                      <td className="py-1.5 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${Math.abs(res) <= 1 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {Math.abs(res) <= 1 ? "OK" : "CHECK"}
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

      {/* IEC Reference */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-3 pb-3">
          <div className="text-xs text-amber-800">
            <span className="font-semibold">IEC 61853-2 Clause 7:</span>{" "}
            The Incidence Angle Modifier (IAM) characterizes the angular response of a PV module.
            IAM = Isc(θ) / [Isc(0°) × cos(θ)] where θ is the angle of incidence. The ASHRAE single-parameter
            model IAM = 1 − b₀ × (1/cos(θ) − 1) is widely used for energy yield simulations.
            Typical b₀ values: glass-glass 0.04–0.06, glass-backsheet 0.04–0.05, anti-reflective coated 0.02–0.04.
            IAM losses account for 2–5% of annual energy depending on tilt, location, and module construction.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
