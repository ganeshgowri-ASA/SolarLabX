// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine,
} from "recharts"
import { Sun, Thermometer, Globe, Zap } from "lucide-react"
import { IECStandardCard } from "./IECStandardCard"
import { ExportDropdown } from "./ExportDropdown"

// ─── IEC 61853 Power Matrix Data ────────────────────────────────────────────

const IRRADIANCE_LEVELS = [100, 200, 400, 600, 800, 1000, 1100]
const TEMPERATURE_LEVELS = [15, 25, 35, 50, 65, 75]

// Pmax(W) for a 400W module across irradiance & temperature
// Using γ=-0.38%/°C and approximate linear irradiance scaling with slight non-linearity
function generatePowerMatrix(): { irradiance: number; temperature: number; pmax: number; efficiency: number }[] {
  const Pmax_STC = 400
  const gamma = -0.0038
  const moduleArea = 1.92 // m²
  const rows: { irradiance: number; temperature: number; pmax: number; efficiency: number }[] = []

  IRRADIANCE_LEVELS.forEach((G) => {
    TEMPERATURE_LEVELS.forEach((T) => {
      const gRatio = G / 1000
      // Low-light non-linearity: slight efficiency drop at low irradiance
      const lowLightFactor = G < 200 ? 0.96 : G < 400 ? 0.985 : 1.0
      const tempFactor = 1 + gamma * (T - 25)
      const pmax = parseFloat((Pmax_STC * gRatio * lowLightFactor * tempFactor + (Math.random() - 0.5) * 0.3).toFixed(1))
      const efficiency = parseFloat(((pmax / (G * moduleArea)) * 100).toFixed(2))
      rows.push({ irradiance: G, temperature: T, pmax: Math.max(0, pmax), efficiency })
    })
  })
  return rows
}

// Climate-specific energy ratings per IEC 61853-3/4
const CLIMATE_PROFILES = [
  { id: "hot-dry", name: "Hot & Dry (Subtropical arid)", location: "Phoenix, AZ", annualGHI: 2480, avgTemp: 35, energyYield: 1820, rating: 692 },
  { id: "hot-humid", name: "Hot & Humid (Tropical)", location: "Chennai, India", annualGHI: 1950, avgTemp: 32, energyYield: 1410, rating: 538 },
  { id: "cold-sunny", name: "Cold & Sunny (Alpine)", location: "Denver, CO", annualGHI: 2050, avgTemp: 10, energyYield: 1680, rating: 648 },
  { id: "temperate", name: "Temperate (Maritime)", location: "Berlin, Germany", annualGHI: 1100, avgTemp: 10, energyYield: 890, rating: 342 },
  { id: "tropical-humid", name: "Tropical Humid (Equatorial)", location: "Singapore", annualGHI: 1630, avgTemp: 28, energyYield: 1150, rating: 440 },
  { id: "cold-cloudy", name: "Cold & Cloudy (Subarctic)", location: "Helsinki, Finland", annualGHI: 950, avgTemp: 5, energyYield: 810, rating: 312 },
]

// NMOT reference
const NMOT_VALUE = 44.2 // °C

export function EnergyRatingTab() {
  const [selectedClimate, setSelectedClimate] = useState("hot-dry")
  const matrix = useMemo(() => generatePowerMatrix(), [])

  // Relative efficiency vs irradiance at 25°C
  const relEffData = useMemo(() => {
    const stcRow = matrix.find((r) => r.irradiance === 1000 && r.temperature === 25)
    if (!stcRow) return []
    return IRRADIANCE_LEVELS.map((G) => {
      const row = matrix.find((r) => r.irradiance === G && r.temperature === 25)
      return {
        irradiance: G,
        relEff: row ? parseFloat(((row.efficiency / stcRow.efficiency) * 100).toFixed(1)) : 0,
        pmax: row?.pmax || 0,
      }
    })
  }, [matrix])

  // Temperature coefficient impact lines
  const tempImpactData = useMemo(() => {
    return TEMPERATURE_LEVELS.map((T) => {
      const at1000 = matrix.find((r) => r.irradiance === 1000 && r.temperature === T)
      const at600 = matrix.find((r) => r.irradiance === 600 && r.temperature === T)
      const at200 = matrix.find((r) => r.irradiance === 200 && r.temperature === T)
      return {
        temperature: T,
        "1000 W/m²": at1000?.pmax || 0,
        "600 W/m²": at600?.pmax || 0,
        "200 W/m²": at200?.pmax || 0,
      }
    })
  }, [matrix])

  const climate = CLIMATE_PROFILES.find((c) => c.id === selectedClimate)!

  return (
    <div className="space-y-4">
      <IECStandardCard
        standard="IEC 61853-1/2/3/4"
        title="Photovoltaic module performance testing and energy rating"
        testConditions={[
          "IEC 61853-1: Power matrix at multiple irradiance (100–1100 W/m²) and temperature (15–75°C)",
          "IEC 61853-2: NMOT, spectral response, IAM, temperature coefficients",
          "IEC 61853-3: Energy rating calculation methodology",
          "IEC 61853-4: Standard reference climatic profiles",
        ]}
        dosageLevels={[
          "Irradiance: 100, 200, 400, 600, 800, 1000, 1100 W/m²",
          "Temperature: 15, 25, 35, 50, 65, 75°C",
          "Total: 42 operating points (7 × 6 matrix)",
        ]}
        passCriteria={[
          { parameter: "Power matrix", requirement: "Complete 42-point measurement", note: "±2% uncertainty" },
          { parameter: "NMOT", requirement: "Report per IEC 61853-2 Annex A", note: `Typ. 42–48°C` },
          { parameter: "Energy rating", requirement: "kWh/kWp for each reference climate", note: "IEC 61853-4" },
        ]}
        failCriteria={[
          { parameter: "Incomplete matrix", requirement: "Missing operating points invalidate rating" },
          { parameter: "Non-linearity", requirement: ">5% deviation from expected low-light performance" },
        ]}
        notes={[
          "The power matrix replaces single-point STC rating with multi-condition characterization",
          "NMOT (Nominal Module Operating Temperature) replaces the older NOCT concept",
        ]}
      />

      {/* Export */}
      <div className="flex justify-end">
        <ExportDropdown
          config={{
            data: matrix.map((r) => ({
              "Irradiance (W/m²)": r.irradiance,
              "Temperature (°C)": r.temperature,
              "Pmax (W)": r.pmax,
              "Efficiency (%)": r.efficiency,
            })),
            filename: "IEC61853_Power_Matrix",
            title: "IEC 61853 Power Matrix & Energy Rating",
            standard: "IEC 61853-1/2/3/4",
            description: "42-point power matrix and climate-specific energy rating data",
            sheetName: "Power Matrix",
            orientation: "landscape",
          }}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>STC Power</CardDescription>
            <div className="text-2xl font-bold text-blue-600">
              {matrix.find((r) => r.irradiance === 1000 && r.temperature === 25)?.pmax} W
            </div>
            <p className="text-xs text-muted-foreground">1000 W/m², 25°C</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>NMOT</CardDescription>
            <div className="text-2xl font-bold text-amber-600">{NMOT_VALUE}°C</div>
            <p className="text-xs text-muted-foreground">IEC 61853-2 Annex A</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>Low-Light (200 W/m²)</CardDescription>
            <div className="text-2xl font-bold text-purple-600">
              {relEffData.find((d) => d.irradiance === 200)?.relEff}%
            </div>
            <p className="text-xs text-muted-foreground">Relative efficiency vs STC</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>Energy Rating ({climate.name.split("(")[0].trim()})</CardDescription>
            <div className="text-2xl font-bold text-green-600">{climate.rating} kWh/kWp</div>
            <p className="text-xs text-muted-foreground">{climate.location}</p>
          </CardContent>
        </Card>
      </div>

      {/* Power Matrix Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            IEC 61853-1 Power Matrix (Pmax in W)
          </CardTitle>
          <CardDescription className="text-xs">
            42-point measurement: 7 irradiance × 6 temperature combinations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-3 text-left font-semibold">G (W/m²)</th>
                  {TEMPERATURE_LEVELS.map((T) => (
                    <th key={T} className={`py-2 px-2 text-right font-semibold ${T === 25 ? "bg-green-50" : ""}`}>
                      {T}°C
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {IRRADIANCE_LEVELS.map((G) => (
                  <tr key={G} className={`border-b hover:bg-muted/50 ${G === 1000 ? "bg-blue-50/50" : ""}`}>
                    <td className="py-1.5 pr-3 font-mono font-semibold">{G}</td>
                    {TEMPERATURE_LEVELS.map((T) => {
                      const row = matrix.find((r) => r.irradiance === G && r.temperature === T)
                      const isStc = G === 1000 && T === 25
                      return (
                        <td
                          key={T}
                          className={`py-1.5 px-2 text-right font-mono ${isStc ? "bg-green-100 font-bold text-green-800" : ""}`}
                        >
                          {row?.pmax}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Highlighted: STC condition (1000 W/m², 25°C). Blue row = rated irradiance.
          </p>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Relative Efficiency vs Irradiance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Relative Efficiency vs Irradiance (25°C)</CardTitle>
            <CardDescription className="text-xs">Low-light performance characterization</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={relEffData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="irradiance"
                  label={{ value: "Irradiance (W/m²)", position: "insideBottom", offset: -5, fontSize: 9 }}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  domain={[90, 102]}
                  label={{ value: "Rel. Efficiency (%)", angle: -90, position: "insideLeft", fontSize: 9 }}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <ReferenceLine y={100} stroke="#22c55e" strokeDasharray="4 2" label={{ value: "STC ref", fill: "#22c55e", fontSize: 9 }} />
                <Line type="monotone" dataKey="relEff" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} name="Rel. Efficiency" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pmax vs Temperature at different irradiance levels */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pmax vs Temperature (Multi-Irradiance)</CardTitle>
            <CardDescription className="text-xs">Temperature coefficient integration at 200, 600, 1000 W/m²</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={tempImpactData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="temperature"
                  label={{ value: "Temperature (°C)", position: "insideBottom", offset: -5, fontSize: 9 }}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  label={{ value: "Pmax (W)", angle: -90, position: "insideLeft", fontSize: 9 }}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine x={25} stroke="#22c55e" strokeDasharray="4 2" />
                <Line type="monotone" dataKey="1000 W/m²" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="600 W/m²" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="200 W/m²" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Climate-Specific Energy Rating */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="h-4 w-4 text-green-500" />
            Climate-Specific Energy Rating (IEC 61853-4)
          </CardTitle>
          <CardDescription className="text-xs">
            <span className="mr-3">Select climate profile:</span>
            <Select value={selectedClimate} onValueChange={setSelectedClimate}>
              <SelectTrigger className="inline-flex w-[260px] h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLIMATE_PROFILES.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-3 text-left font-semibold">Climate Zone</th>
                  <th className="py-2 pr-3 text-left font-semibold">Reference Location</th>
                  <th className="py-2 px-2 text-right font-semibold">GHI (kWh/m²/yr)</th>
                  <th className="py-2 px-2 text-right font-semibold">Avg Temp (°C)</th>
                  <th className="py-2 px-2 text-right font-semibold">Energy Yield (kWh/yr)</th>
                  <th className="py-2 px-2 text-right font-semibold">Rating (kWh/kWp)</th>
                  <th className="py-2 text-center font-semibold">Rank</th>
                </tr>
              </thead>
              <tbody>
                {[...CLIMATE_PROFILES]
                  .sort((a, b) => b.rating - a.rating)
                  .map((c, i) => (
                    <tr key={c.id} className={`border-b hover:bg-muted/50 ${c.id === selectedClimate ? "bg-amber-50" : ""}`}>
                      <td className="py-1.5 pr-3 font-medium">{c.name}</td>
                      <td className="py-1.5 pr-3 text-muted-foreground">{c.location}</td>
                      <td className="py-1.5 px-2 text-right font-mono">{c.annualGHI}</td>
                      <td className="py-1.5 px-2 text-right font-mono">{c.avgTemp}</td>
                      <td className="py-1.5 px-2 text-right font-mono font-semibold">{c.energyYield}</td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold text-green-700">{c.rating}</td>
                      <td className="py-1.5 text-center">
                        <Badge variant="outline" className="text-xs">{i + 1}</Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* IEC Reference Note */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-3 pb-3">
          <div className="text-xs text-amber-800">
            <span className="font-semibold">IEC 61853 Series:</span>{" "}
            Part 1 defines the power matrix measurement at multiple irradiance and temperature conditions.
            Part 2 specifies NMOT, spectral response, and IAM measurements.
            Part 3 provides the energy rating calculation methodology combining the power matrix with climate data.
            Part 4 defines standard reference climatic profiles for 6 climate zones.
            The energy rating (kWh/kWp) replaces single-point STC power as a more realistic performance metric.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
