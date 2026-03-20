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
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine, ComposedChart,
} from "recharts"
import { Globe, Sun, Thermometer, Zap, TrendingUp } from "lucide-react"
import { IECStandardCard } from "./IECStandardCard"
import { ExportDropdown } from "./ExportDropdown"

// ─── Location Presets ───────────────────────────────────────────────────────

interface LocationPreset {
  id: string
  name: string
  lat: number
  lon: number
  optimalTilt: number
  ghi: number[] // monthly GHI kWh/m²
  avgTemp: number[] // monthly avg ambient temp °C
}

const LOCATIONS: LocationPreset[] = [
  {
    id: "chennai", name: "Chennai, India (13.1°N)",
    lat: 13.08, lon: 80.27, optimalTilt: 13,
    ghi: [155, 168, 195, 198, 205, 172, 158, 160, 158, 148, 130, 138],
    avgTemp: [25, 27, 29, 32, 34, 33, 31, 30, 30, 28, 26, 25],
  },
  {
    id: "phoenix", name: "Phoenix, AZ (33.4°N)",
    lat: 33.45, lon: -112.07, optimalTilt: 33,
    ghi: [145, 168, 218, 255, 282, 288, 268, 252, 228, 195, 152, 135],
    avgTemp: [13, 15, 18, 23, 28, 33, 36, 35, 32, 25, 17, 12],
  },
  {
    id: "berlin", name: "Berlin, Germany (52.5°N)",
    lat: 52.52, lon: 13.40, optimalTilt: 35,
    ghi: [28, 48, 88, 125, 165, 168, 165, 142, 98, 58, 30, 22],
    avgTemp: [0, 1, 5, 9, 14, 17, 19, 19, 15, 10, 5, 2],
  },
  {
    id: "sydney", name: "Sydney, Australia (33.9°S)",
    lat: -33.87, lon: 151.21, optimalTilt: 30,
    ghi: [208, 175, 155, 118, 95, 82, 88, 108, 138, 172, 192, 208],
    avgTemp: [23, 23, 22, 19, 16, 13, 12, 13, 16, 18, 20, 22],
  },
  {
    id: "jodhpur", name: "Jodhpur, India (26.3°N)",
    lat: 26.29, lon: 73.02, optimalTilt: 26,
    ghi: [158, 175, 208, 225, 238, 195, 155, 158, 178, 185, 162, 148],
    avgTemp: [17, 20, 26, 32, 36, 35, 32, 30, 30, 28, 23, 18],
  },
]

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// Module parameters
const MODULE = {
  pmax: 400, // W at STC
  gamma: -0.38, // %/°C (Pmax temp coeff)
  nmot: 44, // °C
  iamB0: 0.05,
  area: 1.92, // m²
}

function computeMonthlyYield(loc: LocationPreset, tilt: number, azimuth: number) {
  return loc.ghi.map((ghi, i) => {
    const ambientTemp = loc.avgTemp[i]
    // Cell temperature estimate: T_cell ≈ T_amb + (NMOT - 20) × G/800
    const avgG = (ghi * 1000) / (30 * 5) // rough peak sun hours → avg irradiance during sun
    const cellTemp = ambientTemp + (MODULE.nmot - 20) * (avgG / 800)

    // Temperature loss
    const tempLoss = MODULE.gamma * (cellTemp - 25) // negative = loss
    const tempFactor = 1 + tempLoss / 100

    // IAM loss (simplified annual average)
    const iamFactor = 0.97

    // Spectral loss (simplified)
    const spectralFactor = 0.995

    // Tilt factor (simplified — optimal tilt gives best, deviation reduces)
    const tiltDev = Math.abs(tilt - loc.optimalTilt)
    const tiltFactor = 1 - (tiltDev / 90) * 0.15

    // Monthly energy yield
    const energyKwh = (MODULE.pmax / 1000) * ghi * tiltFactor * tempFactor * iamFactor * spectralFactor
    const peakSunHours = ghi / 1 // kWh/m²/month ÷ 1 kW/m²

    return {
      month: MONTHS[i],
      ghi,
      ambientTemp,
      cellTemp: parseFloat(cellTemp.toFixed(1)),
      tempLoss: parseFloat((tempLoss).toFixed(2)),
      iamLoss: parseFloat(((1 - iamFactor) * 100).toFixed(2)),
      spectralLoss: parseFloat(((1 - spectralFactor) * 100).toFixed(2)),
      energyKwh: parseFloat(energyKwh.toFixed(1)),
      specificYield: parseFloat((energyKwh / (MODULE.pmax / 1000)).toFixed(1)),
      pr: parseFloat(((energyKwh / ((MODULE.pmax / 1000) * ghi)) * 100).toFixed(1)),
    }
  })
}

export function EnergyYieldTab() {
  const [locationId, setLocationId] = useState("chennai")
  const [tilt, setTilt] = useState(13)
  const [azimuth, setAzimuth] = useState(180)

  const location = LOCATIONS.find((l) => l.id === locationId)!

  const monthlyData = useMemo(() => computeMonthlyYield(location, tilt, azimuth), [location, tilt, azimuth])

  const annualYield = useMemo(() => monthlyData.reduce((s, m) => s + m.energyKwh, 0), [monthlyData])
  const annualGHI = useMemo(() => location.ghi.reduce((s, g) => s + g, 0), [location])
  const annualSpecificYield = parseFloat((annualYield / (MODULE.pmax / 1000)).toFixed(0))
  const annualPR = parseFloat(((annualYield / ((MODULE.pmax / 1000) * annualGHI)) * 100).toFixed(1))
  const avgTempLoss = parseFloat((monthlyData.reduce((s, m) => s + m.tempLoss, 0) / 12).toFixed(2))

  // Multi-location comparison
  const locationComparison = useMemo(() => {
    return LOCATIONS.map((loc) => {
      const data = computeMonthlyYield(loc, loc.optimalTilt, 180)
      const totalYield = data.reduce((s, m) => s + m.energyKwh, 0)
      const totalGHI = loc.ghi.reduce((s, g) => s + g, 0)
      return {
        name: loc.name.split(",")[0],
        annualYield: parseFloat(totalYield.toFixed(0)),
        specificYield: parseFloat((totalYield / (MODULE.pmax / 1000)).toFixed(0)),
        pr: parseFloat(((totalYield / ((MODULE.pmax / 1000) * totalGHI)) * 100).toFixed(1)),
        ghi: totalGHI,
        optimalTilt: loc.optimalTilt,
      }
    })
  }, [])

  return (
    <div className="space-y-4">
      <IECStandardCard
        standard="IEC 61853 + IEC 61724-1"
        title="Energy Yield Simulation using IEC 61853 module data and climate profiles"
        testConditions={[
          "Input: IEC 61853-1 power matrix, NMOT, IAM, temperature coefficients",
          "Climate data: TMY (Typical Meteorological Year) hourly irradiance and temperature",
          "System parameters: tilt, azimuth, location (lat/long)",
          "Loss model: temperature, IAM, spectral, soiling, wiring, inverter",
        ]}
        dosageLevels={[
          "Simulation period: 12 months (TMY basis)",
          "Time resolution: hourly (8760 data points)",
          "Output: monthly and annual kWh/kWp, PR, loss breakdown",
        ]}
        passCriteria={[
          { parameter: "Performance Ratio", requirement: "Typically 75–85%", note: "Location dependent" },
          { parameter: "Specific Yield", requirement: ">1400 kWh/kWp (high-resource)", note: "Hot/sunny" },
          { parameter: "Temperature Loss", requirement: "Report in %", note: "Typically 3–12%" },
        ]}
        failCriteria={[
          { parameter: "PR < 70%", requirement: "Investigate excessive losses" },
          { parameter: "Yield deviation", requirement: ">10% from expected for the climate zone" },
        ]}
        notes={[
          "Energy yield prediction is more meaningful than STC power for project economics",
          "IEC 61724-1 defines performance ratio (PR) as a key system metric",
        ]}
      />

      {/* Export */}
      <div className="flex justify-end">
        <ExportDropdown
          config={{
            data: monthlyData.map((m) => ({
              Month: m.month,
              "GHI (kWh/m²)": m.ghi,
              "Ambient Temp (°C)": m.ambientTemp,
              "Cell Temp (°C)": m.cellTemp,
              "Temp Loss (%)": m.tempLoss,
              "IAM Loss (%)": m.iamLoss,
              "Spectral Loss (%)": m.spectralLoss,
              "Energy (kWh)": m.energyKwh,
              "Specific Yield (kWh/kWp)": m.specificYield,
              "PR (%)": m.pr,
            })),
            filename: `Energy_Yield_${location.name.split(",")[0]}_Tilt${tilt}`,
            title: "Energy Yield Simulation Report",
            standard: "IEC 61853 + IEC 61724-1",
            description: `Location: ${location.name} | Tilt: ${tilt}° | Azimuth: ${azimuth}° | Annual yield: ${annualYield.toFixed(0)} kWh`,
            sheetName: "Monthly Yield",
            orientation: "landscape",
          }}
        />
      </div>

      {/* Input Parameters */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-500" />
            Simulation Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Location</Label>
              <Select value={locationId} onValueChange={(v) => { setLocationId(v); const l = LOCATIONS.find(x => x.id === v); if (l) setTilt(l.optimalTilt) }}>
                <SelectTrigger className="w-[240px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((l) => (
                    <SelectItem key={l.id} value={l.id} className="text-xs">{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tilt (°)</Label>
              <Input type="number" min={0} max={90} value={tilt} onChange={(e) => setTilt(+e.target.value)} className="w-20 h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Azimuth (°)</Label>
              <Input type="number" min={0} max={360} value={azimuth} onChange={(e) => setAzimuth(+e.target.value)} className="w-20 h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Module</Label>
              <div className="text-xs font-mono bg-muted px-2 py-1.5 rounded">{MODULE.pmax}W | γ={MODULE.gamma}%/°C | NMOT={MODULE.nmot}°C</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-3 md:grid-cols-5">
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>Annual Yield</CardDescription>
            <div className="text-2xl font-bold text-green-600">{annualYield.toFixed(0)} kWh</div>
            <p className="text-xs text-muted-foreground">Per module ({MODULE.pmax}W)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>Specific Yield</CardDescription>
            <div className="text-2xl font-bold text-blue-600">{annualSpecificYield} kWh/kWp</div>
            <p className="text-xs text-muted-foreground">{location.name.split(",")[0]}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>Performance Ratio</CardDescription>
            <div className="text-2xl font-bold text-amber-600">{annualPR}%</div>
            <p className="text-xs text-muted-foreground">Annual average</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>GHI</CardDescription>
            <div className="text-2xl font-bold text-purple-600">{annualGHI} kWh/m²</div>
            <p className="text-xs text-muted-foreground">Annual irradiation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>Avg Temp Loss</CardDescription>
            <div className="text-2xl font-bold text-red-600">{avgTempLoss}%</div>
            <p className="text-xs text-muted-foreground">Annual average</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Energy Yield Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Monthly Energy Yield & Performance Ratio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="kwh" label={{ value: "Energy (kWh)", angle: -90, position: "insideLeft", fontSize: 9 }} tick={{ fontSize: 10 }} />
              <YAxis yAxisId="pr" orientation="right" domain={[60, 100]} label={{ value: "PR (%)", angle: 90, position: "insideRight", fontSize: 9 }} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar yAxisId="kwh" dataKey="energyKwh" name="Energy (kWh)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Line yAxisId="pr" type="monotone" dataKey="pr" name="PR (%)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Loss Breakdown Chart */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Monthly Temperature Loss</CardTitle>
            <CardDescription className="text-xs">Cell temperature impact on Pmax (%)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="tempLoss" name="Temp Loss (%)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="cellTemp" name="Cell Temp (°C)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Loss Breakdown Summary</CardTitle>
            <CardDescription className="text-xs">Annual average loss contributors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Temperature Loss", value: `${Math.abs(avgTempLoss).toFixed(1)}%`, color: "bg-red-500", pct: Math.abs(avgTempLoss) * 5 },
                { label: "IAM Loss", value: "3.0%", color: "bg-amber-500", pct: 15 },
                { label: "Spectral Mismatch", value: "0.5%", color: "bg-purple-500", pct: 2.5 },
                { label: "Soiling (est.)", value: "2.0%", color: "bg-gray-500", pct: 10 },
                { label: "Wiring/Mismatch", value: "1.5%", color: "bg-blue-500", pct: 7.5 },
              ].map((loss) => (
                <div key={loss.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{loss.label}</span>
                    <span className="font-mono font-bold">{loss.value}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${loss.color} rounded-full`} style={{ width: `${Math.min(100, loss.pct)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Comparison Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Multi-Location Comparison ({MODULE.pmax}W module at optimal tilt)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-3 text-left font-semibold">Location</th>
                  <th className="py-2 px-2 text-right font-semibold">Opt. Tilt (°)</th>
                  <th className="py-2 px-2 text-right font-semibold">GHI (kWh/m²/yr)</th>
                  <th className="py-2 px-2 text-right font-semibold">Yield (kWh/yr)</th>
                  <th className="py-2 px-2 text-right font-semibold">Sp. Yield (kWh/kWp)</th>
                  <th className="py-2 px-2 text-right font-semibold">PR (%)</th>
                  <th className="py-2 text-center font-semibold">Rank</th>
                </tr>
              </thead>
              <tbody>
                {[...locationComparison]
                  .sort((a, b) => b.specificYield - a.specificYield)
                  .map((loc, i) => (
                    <tr key={loc.name} className={`border-b hover:bg-muted/50 ${loc.name === location.name.split(",")[0] ? "bg-blue-50" : ""}`}>
                      <td className="py-1.5 pr-3 font-medium">{loc.name}</td>
                      <td className="py-1.5 px-2 text-right font-mono">{loc.optimalTilt}</td>
                      <td className="py-1.5 px-2 text-right font-mono">{loc.ghi}</td>
                      <td className="py-1.5 px-2 text-right font-mono font-semibold">{loc.annualYield}</td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold text-green-700">{loc.specificYield}</td>
                      <td className="py-1.5 px-2 text-right font-mono">{loc.pr}</td>
                      <td className="py-1.5 text-center">
                        <Badge variant={i === 0 ? "default" : "outline"} className="text-xs">{i + 1}</Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Detail Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Monthly Simulation Detail — {location.name}</CardTitle>
          <CardDescription className="text-xs">Tilt: {tilt}° | Azimuth: {azimuth}°</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-2 text-left font-semibold">Month</th>
                  <th className="py-2 px-1 text-right font-semibold">GHI</th>
                  <th className="py-2 px-1 text-right font-semibold">T_amb (°C)</th>
                  <th className="py-2 px-1 text-right font-semibold">T_cell (°C)</th>
                  <th className="py-2 px-1 text-right font-semibold">Temp Loss (%)</th>
                  <th className="py-2 px-1 text-right font-semibold">IAM Loss (%)</th>
                  <th className="py-2 px-1 text-right font-semibold">Spec. Loss (%)</th>
                  <th className="py-2 px-1 text-right font-semibold">Energy (kWh)</th>
                  <th className="py-2 px-1 text-right font-semibold">Sp. Yield</th>
                  <th className="py-2 text-right font-semibold">PR (%)</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((m) => (
                  <tr key={m.month} className="border-b hover:bg-muted/50">
                    <td className="py-1.5 pr-2 font-semibold">{m.month}</td>
                    <td className="py-1.5 px-1 text-right font-mono">{m.ghi}</td>
                    <td className="py-1.5 px-1 text-right font-mono">{m.ambientTemp}</td>
                    <td className="py-1.5 px-1 text-right font-mono">{m.cellTemp}</td>
                    <td className={`py-1.5 px-1 text-right font-mono ${m.tempLoss < -5 ? "text-red-600" : ""}`}>{m.tempLoss}</td>
                    <td className="py-1.5 px-1 text-right font-mono">{m.iamLoss}</td>
                    <td className="py-1.5 px-1 text-right font-mono">{m.spectralLoss}</td>
                    <td className="py-1.5 px-1 text-right font-mono font-bold">{m.energyKwh}</td>
                    <td className="py-1.5 px-1 text-right font-mono">{m.specificYield}</td>
                    <td className="py-1.5 text-right font-mono">{m.pr}</td>
                  </tr>
                ))}
                <tr className="border-t-2 font-bold">
                  <td className="py-2 pr-2">Annual</td>
                  <td className="py-2 px-1 text-right font-mono">{annualGHI}</td>
                  <td className="py-2 px-1 text-right font-mono">—</td>
                  <td className="py-2 px-1 text-right font-mono">—</td>
                  <td className="py-2 px-1 text-right font-mono">{avgTempLoss}</td>
                  <td className="py-2 px-1 text-right font-mono">3.0</td>
                  <td className="py-2 px-1 text-right font-mono">0.5</td>
                  <td className="py-2 px-1 text-right font-mono text-green-700">{annualYield.toFixed(0)}</td>
                  <td className="py-2 px-1 text-right font-mono">{annualSpecificYield}</td>
                  <td className="py-2 text-right font-mono">{annualPR}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
