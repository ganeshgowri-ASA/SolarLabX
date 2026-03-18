// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ComposedChart, Area
} from "recharts"
import { Sun, CloudRain, Thermometer, Wind, CheckCircle, XCircle, AlertTriangle, BarChart3 } from "lucide-react"
import { IECStandardCard } from "./IECStandardCard"

// ─── Types ────────────────────────────────────────────────────────────────────

interface WeatherRecord {
  timestamp: string
  hour: number
  day: number
  G_horizontal: number    // W/m² global horizontal
  G_direct: number        // W/m² direct normal
  G_diffuse: number       // W/m² diffuse
  G_measured: number      // W/m² measured by pyranometer
  T_ambient: number       // °C
  T_module: number        // °C
  T_dew: number           // °C dew point
  humidity: number        // %
  wind_speed: number      // m/s
  wind_direction: number  // degrees
  pressure: number        // hPa
  flag_irradiance: boolean
  flag_temperature: boolean
  flag_humidity: boolean
  qc_score: number        // 0-100
}

// QC checks per BSRN/IEA standards
function applyQCChecks(records: WeatherRecord[]): WeatherRecord[] {
  return records.map(r => {
    // Physically possible limits (BSRN Tier 1)
    const G_max = 1.5 * 1367 * Math.max(0, Math.sin((r.hour - 6) / 12 * Math.PI))
    const flag_irradiance = r.G_measured < -4 || r.G_measured > G_max * 1.05 || r.G_measured > 1500
    const flag_temperature = r.T_ambient < -10 || r.T_ambient > 50
    const flag_humidity = r.humidity < 0 || r.humidity > 100

    // QC score
    let score = 100
    if (flag_irradiance) score -= 40
    if (flag_temperature) score -= 20
    if (flag_humidity) score -= 10
    if (r.G_measured < r.G_direct * 0.9 && r.hour > 9 && r.hour < 15) score -= 15 // inconsistency
    if (r.T_ambient < r.T_dew) score -= 15 // dew point > ambient (impossible)

    return { ...r, flag_irradiance, flag_temperature, flag_humidity, qc_score: Math.max(0, score) }
  })
}

function generateWeatherData(): WeatherRecord[] {
  const data: WeatherRecord[] = []
  for (let day = 1; day <= 7; day++) {
    for (let h = 5; h <= 20; h++) {
      const clearSky = Math.max(0, 1000 * Math.sin(Math.PI * (h - 6) / 13))
      const cloud = Math.random() > 0.8 ? 0.3 + Math.random() * 0.5 : 1
      const G_direct = parseFloat((clearSky * cloud * (0.7 + Math.random() * 0.1)).toFixed(1))
      const G_diffuse = parseFloat((clearSky * 0.15 * (1 + Math.random() * 0.3)).toFixed(1))
      const G_horizontal = parseFloat((G_direct * 0.85 + G_diffuse + (Math.random() - 0.5) * 20).toFixed(1))
      // Introduce some QC failures
      const G_measured = Math.random() > 0.95
        ? G_horizontal * 1.6 // spike
        : Math.random() > 0.97
          ? -10 // negative reading
          : parseFloat((G_horizontal + (Math.random() - 0.5) * 15).toFixed(1))

      const T_ambient = parseFloat((15 + 12 * Math.sin(Math.PI * (h - 6) / 13) + (Math.random() - 0.5) * 3 + day * 0.5).toFixed(1))
      const T_dew = parseFloat((T_ambient - 8 - Math.random() * 5).toFixed(1))
      const humidity = parseFloat((50 + 30 * Math.cos(Math.PI * (h - 6) / 13) + (Math.random() - 0.5) * 15).toFixed(1))
      const T_module = parseFloat((T_ambient + G_measured * 0.025 + (Math.random() - 0.5) * 2).toFixed(1))

      data.push({
        timestamp: `D${day} ${String(h).padStart(2, "0")}:00`,
        hour: h, day,
        G_horizontal, G_direct, G_diffuse, G_measured,
        T_ambient: T_ambient > 50 && Math.random() > 0.98 ? 55 : T_ambient, // occasional spike
        T_module, T_dew,
        humidity: humidity < 0 ? -5 : humidity,
        wind_speed: parseFloat((0.5 + Math.random() * 4).toFixed(2)),
        wind_direction: Math.round(Math.random() * 360),
        pressure: parseFloat((1013 + (Math.random() - 0.5) * 20).toFixed(1)),
        flag_irradiance: false, flag_temperature: false, flag_humidity: false, qc_score: 100
      })
    }
  }
  return applyQCChecks(data)
}

// Daily summary stats
function dailySummary(records: WeatherRecord[]) {
  const days = [1, 2, 3, 4, 5, 6, 7]
  return days.map(day => {
    const dayRecs = records.filter(r => r.day === day && r.G_measured > 0)
    const gtotal = dayRecs.reduce((s, r) => s + r.G_measured / 1000, 0) // kWh/m²
    const avgG = dayRecs.reduce((s, r) => s + r.G_measured, 0) / (dayRecs.length || 1)
    const maxG = Math.max(...dayRecs.map(r => r.G_measured))
    const avgT = dayRecs.reduce((s, r) => s + r.T_ambient, 0) / (dayRecs.length || 1)
    const flagged = dayRecs.filter(r => r.flag_irradiance || r.flag_temperature || r.flag_humidity).length
    const qcAvg = dayRecs.reduce((s, r) => s + r.qc_score, 0) / (dayRecs.length || 1)
    return {
      day: `Day ${day}`,
      gtotal: parseFloat(gtotal.toFixed(2)),
      avgG: parseFloat(avgG.toFixed(1)),
      maxG: parseFloat(maxG.toFixed(1)),
      avgT: parseFloat(avgT.toFixed(1)),
      flagged,
      qcAvg: parseFloat(qcAvg.toFixed(1)),
      records: dayRecs.length,
    }
  })
}

export function WeatherQA() {
  const [selectedDay, setSelectedDay] = useState(0) // 0 = all

  const rawData = useMemo(() => generateWeatherData(), [])
  const displayData = useMemo(() =>
    selectedDay === 0 ? rawData : rawData.filter(r => r.day === selectedDay), [rawData, selectedDay])
  const daily = useMemo(() => dailySummary(rawData), [rawData])

  const totalRecords = rawData.length
  const flaggedRecords = rawData.filter(r => r.flag_irradiance || r.flag_temperature || r.flag_humidity).length
  const avgQC = parseFloat((rawData.reduce((s, r) => s + r.qc_score, 0) / rawData.length).toFixed(1))
  const dataQuality = avgQC >= 90 ? "Excellent" : avgQC >= 80 ? "Good" : avgQC >= 70 ? "Acceptable" : "Poor"
  const qualityColor = avgQC >= 90 ? "text-green-600" : avgQC >= 80 ? "text-blue-600" : avgQC >= 70 ? "text-amber-600" : "text-red-600"

  return (
    <div className="space-y-4">
      <IECStandardCard
        standard="IEC 61215-2 (DH/TC/HF/UV)"
        title="Environmental stress test sequence — Damp Heat, Thermal Cycling, Humidity Freeze, UV exposure"
        testConditions={[
          "DH: 85°C / 85% RH continuous exposure in climate chamber",
          "TC: −40°C to +85°C, ramp ≤100°C/hr, 10min dwell",
          "HF: −40°C to +85°C / 85% RH, 20 cycles",
          "UV: 280–385nm, module temperature 60°C ± 5°C",
        ]}
        dosageLevels={[
          "DH: 1000 hours (DH1000) standard, 2000h extended",
          "TC: 200 cycles (TC200) standard, 600 extended",
          "HF: 10 cycles (HF10)",
          "UV: 15 kWh/m² front-side (UV15), 5 kWh/m² rear",
        ]}
        passCriteria={[
          { parameter: "Pmax degradation", requirement: "≤5% from initial (after each stress)", note: "Per IEC 61215" },
          { parameter: "Insulation resistance", requirement: "≥40 MΩ·m² (wet leakage)", note: "IEC 61730 safety" },
          { parameter: "Visual inspection", requirement: "No major defects per MQT 01", note: "Post-stress" },
        ]}
        failCriteria={[
          { parameter: "Pmax", requirement: ">5% degradation after any stress test" },
          { parameter: "Safety", requirement: "Insulation resistance <40 MΩ·m²" },
          { parameter: "Visual", requirement: "Delamination, broken cells, corrosion" },
        ]}
        notes={[
          "Sequence A: UV15 → TC50 → HF10; Sequence B: TC200; Sequence C: DH1000",
          "Extended tests (TC600, DH2000) per IEC 63209 for differentiated testing",
        ]}
      />
      {/* Overall QC Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1"><BarChart3 className="h-4 w-4 text-blue-500" /><span className="text-xs font-semibold">Total Records</span></div>
            <div className="text-2xl font-bold text-blue-600">{totalRecords}</div>
            <div className="text-xs text-gray-400">7-day dataset</div>
          </CardContent>
        </Card>
        <Card className={`border-l-4 ${flaggedRecords === 0 ? "border-l-green-500" : flaggedRecords < 5 ? "border-l-amber-500" : "border-l-red-500"}`}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-amber-500" /><span className="text-xs font-semibold">Flagged Records</span></div>
            <div className={`text-2xl font-bold ${flaggedRecords === 0 ? "text-green-600" : "text-red-600"}`}>{flaggedRecords}</div>
            <div className="text-xs text-gray-400">{(flaggedRecords / totalRecords * 100).toFixed(1)}% of total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1"><CheckCircle className="h-4 w-4 text-green-500" /><span className="text-xs font-semibold">Mean QC Score</span></div>
            <div className={`text-2xl font-bold ${qualityColor}`}>{avgQC}</div>
            <div className={`text-xs ${qualityColor}`}>{dataQuality}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1"><Sun className="h-4 w-4 text-yellow-500" /><span className="text-xs font-semibold">Total Irradiation</span></div>
            <div className="text-2xl font-bold text-yellow-600">
              {(rawData.filter(r => r.G_measured > 0).reduce((s, r) => s + r.G_measured / 1000, 0)).toFixed(1)}
            </div>
            <div className="text-xs text-gray-400">kWh/m² (7 days)</div>
          </CardContent>
        </Card>
      </div>

      {/* Day filter */}
      <div className="flex gap-1">
        <span className="text-xs text-gray-500 self-center mr-1">View:</span>
        {[0, 1, 2, 3, 4, 5, 6, 7].map(d => (
          <button key={d} onClick={() => setSelectedDay(d)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${selectedDay === d ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {d === 0 ? "All Days" : `Day ${d}`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Irradiance time series with QC flags */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sun className="h-4 w-4 text-yellow-500" />
              Irradiance Quality Control
            </CardTitle>
            <CardDescription className="text-xs">Measured vs horizontal – BSRN Tier 1 checks applied</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="timestamp" tick={{ fontSize: 9 }} interval={Math.max(1, Math.floor(displayData.length / 10))} />
                <YAxis tick={{ fontSize: 10 }} label={{ value: "W/m²", angle: -90, position: "insideLeft", fontSize: 9 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Area type="monotone" dataKey="G_horizontal" stroke="#f59e0b" fill="#fef3c7" fillOpacity={0.5} name="G_horiz" dot={false} strokeWidth={1} />
                <Line type="monotone" dataKey="G_measured" stroke="#2563eb" name="G_measured" dot={false} strokeWidth={1.5} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Temperature & Humidity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-red-500" />
              Temperature & Humidity Monitoring
            </CardTitle>
            <CardDescription className="text-xs">Ambient, module, dew point temperatures with humidity overlay</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="timestamp" tick={{ fontSize: 9 }} interval={Math.max(1, Math.floor(displayData.length / 10))} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} label={{ value: "Temp (°C)", angle: -90, position: "insideLeft", fontSize: 9 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} label={{ value: "Humidity (%)", angle: 90, position: "insideRight", fontSize: 9 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line yAxisId="left" type="monotone" dataKey="T_ambient" stroke="#ef4444" name="T_ambient" dot={false} strokeWidth={1.5} />
                <Line yAxisId="left" type="monotone" dataKey="T_module" stroke="#f97316" name="T_module" dot={false} strokeWidth={1} strokeDasharray="4 2" />
                <Line yAxisId="left" type="monotone" dataKey="T_dew" stroke="#06b6d4" name="T_dew" dot={false} strokeWidth={1} strokeDasharray="2 2" />
                <Bar yAxisId="right" dataKey="humidity" name="Humidity (%)" fill="#93c5fd" opacity={0.3} maxBarSize={6} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Daily Irradiation & QC Score Summary</CardTitle>
            <CardDescription className="text-xs">Daily total irradiation (kWh/m²) with QC score</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} label={{ value: "kWh/m²", angle: -90, position: "insideLeft", fontSize: 9 }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10 }} label={{ value: "QC %", angle: 90, position: "insideRight", fontSize: 9 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar yAxisId="left" dataKey="gtotal" name="Irradiation (kWh/m²)" fill="#fbbf24" />
                <Line yAxisId="right" type="monotone" dataKey="qcAvg" stroke="#22c55e" strokeWidth={2} name="QC Score (%)" dot={{ r: 3 }} />
                <ReferenceLine yAxisId="right" y={80} stroke="#ef4444" strokeDasharray="4 2"
                               label={{ value: "80% min", fill: "#ef4444", fontSize: 9 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Wind speed distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wind className="h-4 w-4 text-cyan-500" />
              Wind Speed Distribution & NMOT Filtering
            </CardTitle>
            <CardDescription className="text-xs">Valid NMOT measurement window: 0.5–1.5 m/s</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={Array.from({ length: 16 }, (_, i) => {
                  const min = i * 0.3
                  const max = min + 0.3
                  const count = rawData.filter(r => r.wind_speed >= min && r.wind_speed < max).length
                  const validNMOT = rawData.filter(r => r.wind_speed >= 0.5 && r.wind_speed <= 1.5 && r.wind_speed >= min && r.wind_speed < max).length
                  return { range: `${min.toFixed(1)}–${max.toFixed(1)}`, count, validNMOT }
                })}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="range" tick={{ fontSize: 8 }} angle={-45} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 10 }} label={{ value: "Count", angle: -90, position: "insideLeft", fontSize: 9 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="count" name="All Records" fill="#93c5fd" />
                <Bar dataKey="validNMOT" name="Valid for NMOT" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* QC Flags Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Quality Control Flags – Flagged Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rawData.filter(r => r.flag_irradiance || r.flag_temperature || r.flag_humidity).length === 0 ? (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" /> No QC flags detected – dataset passes all BSRN Tier 1 checks
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    {["Timestamp", "G_measured", "T_ambient", "Humidity", "Flags", "QC Score"].map(h => (
                      <th key={h} className="text-left py-1.5 pr-3 text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rawData.filter(r => r.flag_irradiance || r.flag_temperature || r.flag_humidity).slice(0, 15).map((r, i) => (
                    <tr key={i} className="border-b hover:bg-red-50">
                      <td className="py-1.5 pr-3 font-mono">{r.timestamp}</td>
                      <td className={`py-1.5 pr-3 font-mono ${r.flag_irradiance ? "text-red-600 font-bold" : ""}`}>{r.G_measured}</td>
                      <td className={`py-1.5 pr-3 font-mono ${r.flag_temperature ? "text-red-600 font-bold" : ""}`}>{r.T_ambient}°C</td>
                      <td className={`py-1.5 pr-3 font-mono ${r.flag_humidity ? "text-red-600 font-bold" : ""}`}>{r.humidity}%</td>
                      <td className="py-1.5 pr-3">
                        <div className="flex gap-1 flex-wrap">
                          {r.flag_irradiance && <span className="text-xs bg-red-100 text-red-700 px-1 rounded">G-flag</span>}
                          {r.flag_temperature && <span className="text-xs bg-red-100 text-red-700 px-1 rounded">T-flag</span>}
                          {r.flag_humidity && <span className="text-xs bg-amber-100 text-amber-700 px-1 rounded">RH-flag</span>}
                        </div>
                      </td>
                      <td className={`py-1.5 font-mono font-bold ${r.qc_score < 60 ? "text-red-600" : r.qc_score < 80 ? "text-amber-600" : "text-green-600"}`}>{r.qc_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Standard Reference */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-3 pb-3 text-xs text-blue-800">
          <span className="font-semibold">QC Standards Applied:</span>{" "}
          BSRN Tier 1 (physically possible): G ≥ -4 W/m² and G ≤ 1.5×G_clearsky.
          IEA Task 16: Tilt irradiance closure check. T_amb &lt; T_dewpoint flagged as impossible.
          NMOT filtering: G &gt; 400 W/m², WS 0.5–1.5 m/s, T_amb 15–35°C per IEC 61853-2.
          Records with QC &lt; 70 are excluded from energy rating and NMOT calculations.
        </CardContent>
      </Card>
    </div>
  )
}
