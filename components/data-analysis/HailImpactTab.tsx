// @ts-nocheck
"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine,
} from "recharts"
import { Target, Wind, Grid3x3, ShieldCheck, ShieldAlert, CheckCircle, XCircle } from "lucide-react"
import { IECStandardCard } from "./IECStandardCard"
import { ExportDropdown } from "./ExportDropdown"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImpactPoint {
  id: number
  label: string
  locationDescription: string
  zone: "center" | "edge" | "corner"
  crackDetected: boolean
  visualDamage: string
  impactEnergy: number   // Joules
  pass: boolean
  gridRow: number
  gridCol: number
}

// ─── Demo Data: 11 IEC 61215 MQT 17 impact locations ─────────────────────────
// Grid positions map to a 4-row × 3-col representation of a PV module face
// Impact energy for 25 mm ice ball at 23 m/s: KE = 0.5 × m × v²
// Mass of 25 mm ice ball ≈ 8.2 g → KE ≈ 2.17 J (reference value)
// Slight variation per point simulates measurement dispersion.

const ICE_BALL_MASS_KG = 0.0082     // 25 mm diameter ice ball ~8.2 g
const NOMINAL_VELOCITY = 23         // m/s per IEC 61215 MQT 17
const NOMINAL_KE = 0.5 * ICE_BALL_MASS_KG * NOMINAL_VELOCITY ** 2  // ≈ 2.167 J

function generateImpactPoints(): ImpactPoint[] {
  const rawPoints = [
    { id: 1,  label: "P1",  locationDescription: "Module center",              zone: "center", row: 1, col: 1, crackDetected: false, visualDamage: "None",                     velVariance: 0.00 },
    { id: 2,  label: "P2",  locationDescription: "Top edge – center",          zone: "edge",   row: 0, col: 1, crackDetected: false, visualDamage: "None",                     velVariance: -0.02 },
    { id: 3,  label: "P3",  locationDescription: "Bottom edge – center",       zone: "edge",   row: 3, col: 1, crackDetected: false, visualDamage: "None",                     velVariance: 0.01 },
    { id: 4,  label: "P4",  locationDescription: "Left edge – center",         zone: "edge",   row: 1, col: 0, crackDetected: false, visualDamage: "None",                     velVariance: 0.02 },
    { id: 5,  label: "P5",  locationDescription: "Right edge – center",        zone: "edge",   row: 1, col: 2, crackDetected: false, visualDamage: "None",                     velVariance: -0.01 },
    { id: 6,  label: "P6",  locationDescription: "Top-left corner",            zone: "corner", row: 0, col: 0, crackDetected: true,  visualDamage: "Micro-crack, cell edge",   velVariance: 0.03 },
    { id: 7,  label: "P7",  locationDescription: "Top-right corner",           zone: "corner", row: 0, col: 2, crackDetected: false, visualDamage: "None",                     velVariance: 0.00 },
    { id: 8,  label: "P8",  locationDescription: "Bottom-left corner",         zone: "corner", row: 3, col: 0, crackDetected: false, visualDamage: "None",                     velVariance: -0.02 },
    { id: 9,  label: "P9",  locationDescription: "Bottom-right corner",        zone: "corner", row: 3, col: 2, crackDetected: false, visualDamage: "Hairline scratch (frame)", velVariance: 0.01 },
    { id: 10, label: "P10", locationDescription: "Top quarter – left of center", zone: "edge",   row: 0, col: 1, crackDetected: false, visualDamage: "None",                   velVariance: -0.03 },
    { id: 11, label: "P11", locationDescription: "Bottom quarter – right of center", zone: "edge", row: 3, col: 1, crackDetected: false, visualDamage: "None",                velVariance: 0.02 },
  ]

  return rawPoints.map(p => {
    const velocity = NOMINAL_VELOCITY * (1 + p.velVariance)
    const ke = parseFloat((0.5 * ICE_BALL_MASS_KG * velocity ** 2).toFixed(3))
    return {
      id: p.id,
      label: p.label,
      locationDescription: p.locationDescription,
      zone: p.zone as ImpactPoint["zone"],
      crackDetected: p.crackDetected,
      visualDamage: p.visualDamage,
      impactEnergy: ke,
      pass: !p.crackDetected,
      gridRow: p.row,
      gridCol: p.col,
    }
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HailImpactTab() {
  const impactPoints = useMemo(() => generateImpactPoints(), [])

  const totalPoints      = impactPoints.length
  const cracksDetected   = impactPoints.filter(p => p.crackDetected).length
  const passCount        = impactPoints.filter(p => p.pass).length
  const overallPass      = cracksDetected === 0
  const avgEnergy        = parseFloat((impactPoints.reduce((s, p) => s + p.impactEnergy, 0) / totalPoints).toFixed(3))

  // Bar chart data
  const barData = impactPoints.map(p => ({
    name: p.label,
    "Impact Energy (J)": p.impactEnergy,
    pass: p.pass,
  }))

  // Grid layout – 4 rows × 3 cols
  // Slots may contain multiple points; pick the worst (crack takes priority)
  const grid: Record<string, ImpactPoint[]> = {}
  impactPoints.forEach(p => {
    const key = `${p.gridRow}-${p.gridCol}`
    if (!grid[key]) grid[key] = []
    grid[key].push(p)
  })

  const getGridCell = (row: number, col: number): ImpactPoint[] =>
    grid[`${row}-${col}`] ?? []

  const GRID_ROWS = 4
  const GRID_COLS = 3

  return (
    <div className="space-y-4">

      {/* ── IEC Standard Card ─────────────────────────────────────────────── */}
      <IECStandardCard
        standard="IEC 61215 MQT 17"
        title="Terrestrial photovoltaic (PV) modules — Design qualification and type approval — MQT 17: Hail test"
        testConditions={[
          "Ice ball diameter: 25 mm (nominal)",
          "Impact velocity: 23 m/s (derived from 1 m drop height equivalent)",
          "11 designated impact locations per module face",
          "Test temperature: −10°C ± 5°C (module at operating temperature)",
          "Ice ball hardness: Shore D ≥ 55 at test temperature",
        ]}
        dosageLevels={[
          "Ice ball mass: ~8.2 g (25 mm sphere, ice density ~917 kg/m³)",
          "Kinetic energy per impact: ~2.17 J at 23 m/s",
          "11 impact points: center, edge midpoints, corners, and quarter-points",
          "Minimum 3 ice balls per location if any crack is observed",
        ]}
        passCriteria={[
          { parameter: "Cell cracking",      requirement: "No cell cracking after visual and EL inspection",         note: "All 11 points" },
          { parameter: "Electrical output",  requirement: "Pmax degradation ≤ 5% vs. pre-test measurement",          note: "Post-hail IV curve" },
          { parameter: "Visual inspection",  requirement: "No delamination, broken glass, or water ingress",          note: "IEC 61215-2 §4.2" },
          { parameter: "Insulation",         requirement: "Dielectric isolation ≥ 100 MΩ at 1000 V DC post-test",   note: "Safety check" },
        ]}
        failCriteria={[
          { parameter: "Cell crack detected",   requirement: "Any crack visible under EL or visual inspection" },
          { parameter: "Pmax loss",             requirement: ">5% degradation post-test" },
          { parameter: "Structural damage",     requirement: "Glass breakage, frame detachment, or delamination" },
          { parameter: "Insulation failure",    requirement: "<100 MΩ post-test isolation resistance" },
        ]}
        notes={[
          "IEC 61215-2:2021 MQT 17 references ISO 9490 ice ball specification",
          "Optional larger hail sizes (35 mm, 45 mm) per IEC TS 63126 for extended qualification",
          "EL imaging recommended post-test to detect micro-cracks invisible under white-light inspection",
          "Some certification bodies require post-test wet leakage current test (IEC 61215-2 MQT 15)",
        ]}
      />

      {/* ── Export ─────────────────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <ExportDropdown
          config={{
            data: impactPoints.map(p => ({
              "Impact Point":           p.label,
              "Location Description":   p.locationDescription,
              "Zone":                   p.zone,
              "Impact Energy (J)":      p.impactEnergy,
              "Crack Detected":         p.crackDetected ? "Yes" : "No",
              "Visual Damage":          p.visualDamage,
              "Result":                 p.pass ? "PASS" : "FAIL",
            })),
            filename: "hail-impact-mqt17",
            title: "Hail Impact Test – IEC 61215 MQT 17",
            subtitle: `Ice Ball: 25 mm | Velocity: 23 m/s | Points: ${totalPoints}`,
          }}
        />
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="flex justify-center mb-1">
              <Target className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">25 mm</div>
            <div className="text-xs text-gray-500 mt-0.5">Ice Ball Diameter</div>
          </CardContent>
        </Card>

        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="flex justify-center mb-1">
              <Wind className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-indigo-600">23 m/s</div>
            <div className="text-xs text-gray-500 mt-0.5">Impact Velocity</div>
          </CardContent>
        </Card>

        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="flex justify-center mb-1">
              <Grid3x3 className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total Impact Points</div>
          </CardContent>
        </Card>

        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="flex justify-center mb-1">
              {overallPass
                ? <ShieldCheck className="h-5 w-5 text-green-500" />
                : <ShieldAlert className="h-5 w-5 text-red-500" />
              }
            </div>
            <div className={`text-2xl font-bold ${overallPass ? "text-green-600" : "text-red-600"}`}>
              {overallPass ? "PASS" : "FAIL"}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Overall Result
              {!overallPass && (
                <span className="text-red-500 font-semibold ml-1">({cracksDetected} crack{cracksDetected > 1 ? "s" : ""})</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Impact Location Grid + Bar Chart ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Module face grid visualization */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Impact Location Map – Module Face
            </CardTitle>
            <CardDescription className="text-xs">
              11 impact points per IEC 61215 MQT 17 · Green = Pass · Red = Crack detected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              {/* Module outline */}
              <div
                className="relative border-4 border-gray-400 rounded bg-gray-50"
                style={{ width: 300, height: 380 }}
              >
                {/* Cell grid background lines */}
                <div className="absolute inset-2 grid"
                  style={{ gridTemplateColumns: "repeat(6, 1fr)", gridTemplateRows: "repeat(8, 1fr)", opacity: 0.15 }}>
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div key={i} className="border border-gray-500" />
                  ))}
                </div>

                {/* Impact point markers */}
                {impactPoints.map(p => {
                  // Map gridRow (0-3) to Y% and gridCol (0-2) to X%
                  // Row 0 → near top, Row 3 → near bottom
                  // Col 0 → left, Col 1 → center, Col 2 → right
                  const colPositions = [12, 50, 88]
                  const rowPositions = [10, 36, 63, 90]
                  const xPct = colPositions[p.gridCol]
                  const yPct = rowPositions[p.gridRow]

                  return (
                    <div
                      key={p.id}
                      className={`absolute flex items-center justify-center rounded-full border-2 font-bold text-white text-xs shadow-md
                        ${p.pass
                          ? "bg-green-500 border-green-700"
                          : "bg-red-500 border-red-700"
                        }`}
                      style={{
                        width: 32,
                        height: 32,
                        left: `calc(${xPct}% - 16px)`,
                        top: `calc(${yPct}% - 16px)`,
                        zIndex: 10,
                      }}
                      title={`${p.label}: ${p.locationDescription} | ${p.crackDetected ? "CRACK DETECTED" : "No crack"}`}
                    >
                      {p.label.replace("P", "")}
                    </div>
                  )
                })}

                {/* Legend */}
                <div className="absolute bottom-1 right-1 flex flex-col gap-1">
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-gray-600">Pass</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-gray-600">Crack</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Zone summary */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              {(["center", "edge", "corner"] as const).map(zone => {
                const zonePoints = impactPoints.filter(p => p.zone === zone)
                const zonePassed = zonePoints.filter(p => p.pass).length
                return (
                  <div key={zone} className="border rounded p-1.5 text-center">
                    <div className="font-semibold capitalize text-gray-700">{zone}</div>
                    <div className="font-mono">
                      <span className="text-green-600">{zonePassed}</span>
                      <span className="text-gray-400">/{zonePoints.length}</span>
                    </div>
                    <div className="text-gray-500">pass</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Bar chart: impact energy per point */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wind className="h-4 w-4 text-indigo-500" />
              Impact Energy per Point
            </CardTitle>
            <CardDescription className="text-xs">
              Kinetic energy (J) · Nominal: {NOMINAL_KE.toFixed(3)} J · Avg measured: {avgEnergy} J
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  label={{ value: "Impact Point", position: "insideBottom", offset: -2, fontSize: 10 }}
                />
                <YAxis
                  domain={[1.8, 2.5]}
                  tick={{ fontSize: 10 }}
                  label={{ value: "Energy (J)", angle: -90, position: "insideLeft", fontSize: 10 }}
                />
                <Tooltip
                  formatter={(v: number, name: string) => [`${v.toFixed(3)} J`, name]}
                  labelFormatter={label => `Point: ${label}`}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine
                  y={NOMINAL_KE}
                  stroke="#6366f1"
                  strokeDasharray="5 3"
                  strokeWidth={2}
                  label={{ value: `Nominal ${NOMINAL_KE.toFixed(2)} J`, fill: "#6366f1", fontSize: 9, position: "right" }}
                />
                <Bar dataKey="Impact Energy (J)" maxBarSize={28} radius={[3, 3, 0, 0]}>
                  {barData.map((entry, i) => (
                    <rect
                      key={i}
                      fill={entry.pass ? "#22c55e" : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-1 flex justify-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded bg-green-500" /> No crack
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded bg-red-500" /> Crack detected
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Data Table ─────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Grid3x3 className="h-4 w-4 text-gray-500" />
            Impact Point Detail – IEC 61215 MQT 17
          </CardTitle>
          <CardDescription className="text-xs">
            All 11 designated impact locations · Ice ball 25 mm · Velocity 23 m/s
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="border p-1.5 bg-gray-50 text-left font-semibold">Point</th>
                  <th className="border p-1.5 bg-gray-50 text-left font-semibold">Location Description</th>
                  <th className="border p-1.5 bg-gray-50 text-center font-semibold">Zone</th>
                  <th className="border p-1.5 bg-gray-50 text-center font-semibold">Energy (J)</th>
                  <th className="border p-1.5 bg-gray-50 text-center font-semibold">Crack Detected</th>
                  <th className="border p-1.5 bg-gray-50 text-left font-semibold">Visual Inspection</th>
                  <th className="border p-1.5 bg-gray-50 text-center font-semibold">Result</th>
                </tr>
              </thead>
              <tbody>
                {impactPoints.map((p, i) => (
                  <tr key={p.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="border p-1.5 font-mono font-semibold text-gray-700">{p.label}</td>
                    <td className="border p-1.5 text-gray-600">{p.locationDescription}</td>
                    <td className="border p-1.5 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium capitalize
                        ${p.zone === "center" ? "bg-blue-100 text-blue-700"
                          : p.zone === "edge" ? "bg-purple-100 text-purple-700"
                          : "bg-orange-100 text-orange-700"}`}>
                        {p.zone}
                      </span>
                    </td>
                    <td className="border p-1.5 text-center font-mono">{p.impactEnergy.toFixed(3)}</td>
                    <td className="border p-1.5 text-center">
                      {p.crackDetected
                        ? <span className="inline-flex items-center gap-1 font-semibold text-red-600"><XCircle className="h-3.5 w-3.5" />Yes</span>
                        : <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle className="h-3.5 w-3.5" />No</span>
                      }
                    </td>
                    <td className="border p-1.5 text-gray-600 italic">{p.visualDamage || "None"}</td>
                    <td className="border p-1.5 text-center">
                      <Badge className={p.pass
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : "bg-red-100 text-red-700 hover:bg-red-100"}>
                        {p.pass ? "PASS" : "FAIL"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <td className="border p-1.5" colSpan={3}>Summary</td>
                  <td className="border p-1.5 text-center font-mono">{avgEnergy.toFixed(3)} avg</td>
                  <td className="border p-1.5 text-center">
                    {cracksDetected > 0
                      ? <span className="text-red-600">{cracksDetected} crack{cracksDetected > 1 ? "s" : ""}</span>
                      : <span className="text-green-600">0 cracks</span>
                    }
                  </td>
                  <td className="border p-1.5" />
                  <td className="border p-1.5 text-center">
                    <Badge className={overallPass
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-red-100 text-red-700 hover:bg-red-100"}>
                      {overallPass ? "PASS" : "FAIL"}
                    </Badge>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── IEC Reference Note ─────────────────────────────────────────────── */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-3 pb-3">
          <div className="text-xs text-amber-800">
            <span className="font-semibold">IEC 61215 MQT 17 – Hail Test Reference:</span>{" "}
            A 25 mm diameter ice ball is propelled at 23 m/s (kinetic energy ≈ 2.17 J) onto 11 designated
            locations on the module face. Locations cover the center, edge midpoints (top, bottom, left, right),
            corners, and intermediate quarter-points per IEC 61215-2:2021 Annex C. The module must show no
            cracking of encapsulated cells (verified by EL imaging), no delamination or water ingress after 96 h
            damp heat, and Pmax degradation must remain within ±5% of the pre-test value. Post-test isolation
            resistance must be ≥ 100 MΩ at 1000 V DC. Extended qualification for large hail (&gt;25 mm) is
            addressed in IEC TS 63126.
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
