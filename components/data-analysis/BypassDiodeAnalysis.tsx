// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer, ScatterChart, Scatter, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, BarChart, Bar, Cell
} from "recharts"
import { Zap, Thermometer, CheckCircle, AlertTriangle, XCircle, TrendingUp } from "lucide-react"
import { IECStandardCard } from "./IECStandardCard"

// ─── Types ────────────────────────────────────────────────────────────────────

interface DiodeVfData {
  moduleId: string
  diodeIdx: number
  temp: number
  vf: number
}

interface StressTestPoint {
  time: number // minutes
  moduleId: string
  tj: number   // junction temp °C
}

interface DiodeSpec {
  moduleId: string
  diodeIdx: number
  vf_rated: number    // V at rated current
  vf_max: number      // datasheet max Vf
  isc: number         // A
  tj_max: number      // °C rated max
}

// ─── Sample Data: 3 modules × 3 diodes, Vf decreasing ~2mV/°C ──────────────

function generateVfData(): DiodeVfData[] {
  const modules = ["MOD-A01", "MOD-A02", "MOD-A03"]
  const temps = [25, 40, 55, 70]
  const data: DiodeVfData[] = []

  modules.forEach((moduleId, mi) => {
    for (let di = 0; di < 3; di++) {
      const baseVf = 0.58 - mi * 0.01 - di * 0.005 // slight per-diode variation
      temps.forEach(temp => {
        const vf = baseVf - 0.002 * (temp - 25) + (Math.random() - 0.5) * 0.003
        data.push({ moduleId, diodeIdx: di + 1, temp, vf: parseFloat(vf.toFixed(4)) })
      })
    }
  })
  return data
}

function generateStressTestData(): StressTestPoint[] {
  const modules = ["MOD-A01", "MOD-A02", "MOD-A03"]
  const points: StressTestPoint[] = []

  modules.forEach((moduleId, mi) => {
    const baseTj = 72 + mi * 2 // different thermal behaviour per module
    for (let t = 0; t <= 60; t += 5) {
      // exponential rise to steady state
      const tj = baseTj + (80 - baseTj) * (1 - Math.exp(-t / 20)) * 0.85 + (Math.random() - 0.5) * 1.5
      points.push({ time: t, moduleId, tj: parseFloat(tj.toFixed(1)) })
    }
  })
  return points
}

// Diode specifications for junction voltage analysis
function generateDiodeSpecs(): DiodeSpec[] {
  const modules = ["MOD-A01", "MOD-A02", "MOD-A03"]
  const specs: DiodeSpec[] = []
  modules.forEach((moduleId, mi) => {
    for (let di = 0; di < 3; di++) {
      specs.push({
        moduleId,
        diodeIdx: di + 1,
        vf_rated: parseFloat((0.50 - mi * 0.008 - di * 0.004 + (Math.random() - 0.5) * 0.01).toFixed(4)),
        vf_max: 0.65, // datasheet max
        isc: parseFloat((10.5 + (Math.random() - 0.5) * 0.3).toFixed(2)),
        tj_max: 80,
      })
    }
  })
  return specs
}

// Thermal runaway data: temperature rise rate during stress test
function generateThermalRunawayData(): { time: number; MOD_A01_rate: number; MOD_A02_rate: number; MOD_A03_rate: number }[] {
  const data = []
  for (let t = 5; t <= 60; t += 5) {
    // dT/dt should decrease as system approaches steady state
    const rate1 = 3.5 * Math.exp(-t / 15) + (Math.random() - 0.5) * 0.3
    const rate2 = 4.0 * Math.exp(-t / 18) + (Math.random() - 0.5) * 0.3
    const rate3 = 4.5 * Math.exp(-t / 12) + (Math.random() - 0.5) * 0.3
    data.push({
      time: t,
      MOD_A01_rate: parseFloat(rate1.toFixed(2)),
      MOD_A02_rate: parseFloat(rate2.toFixed(2)),
      MOD_A03_rate: parseFloat(rate3.toFixed(2)),
    })
  }
  return data
}

// ─── Linear regression helper ────────────────────────────────────────────────

function linearRegression(points: { x: number; y: number }[]) {
  const n = points.length
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 }
  const sumX = points.reduce((s, p) => s + p.x, 0)
  const sumY = points.reduce((s, p) => s + p.y, 0)
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0)
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0)
  const sumY2 = points.reduce((s, p) => s + p.y * p.y, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const ssTot = sumY2 - (sumY * sumY) / n
  const ssRes = points.reduce((s, p) => s + Math.pow(p.y - (slope * p.x + intercept), 2), 0)
  const r2 = ssTot !== 0 ? 1 - ssRes / ssTot : 1

  return { slope, intercept, r2 }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function BypassDiodeAnalysis() {
  const vfData = useMemo(() => generateVfData(), [])
  const stressData = useMemo(() => generateStressTestData(), [])
  const diodeSpecs = useMemo(() => generateDiodeSpecs(), [])
  const thermalRateData = useMemo(() => generateThermalRunawayData(), [])

  // Aggregate Vf by temperature for scatter + regression
  const vfByTemp = useMemo(() => {
    const temps = [25, 40, 55, 70]
    return temps.map(temp => {
      const values = vfData.filter(d => d.temp === temp).map(d => d.vf)
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      return { temp, meanVf: parseFloat(mean.toFixed(4)), values }
    })
  }, [vfData])

  // Linear regression on mean Vf vs Temperature
  const regression = useMemo(() => {
    const points = vfByTemp.map(d => ({ x: d.temp, y: d.meanVf }))
    return linearRegression(points)
  }, [vfByTemp])

  // Extrapolated Vf at 75°C
  const vfAt75 = parseFloat((regression.slope * 75 + regression.intercept).toFixed(4))

  // Scatter chart data: individual diode points + regression line
  const scatterPoints = useMemo(() =>
    vfData.map(d => ({ temp: d.temp, vf: d.vf, label: `${d.moduleId} D${d.diodeIdx}` })),
    [vfData]
  )

  const regressionLine = useMemo(() => {
    return [20, 25, 40, 55, 70, 75, 80].map(t => ({
      temp: t,
      vfFit: parseFloat((regression.slope * t + regression.intercept).toFixed(4))
    }))
  }, [regression])

  // Stress test chart data pivoted
  const stressChartData = useMemo(() => {
    const times = Array.from(new Set(stressData.map(d => d.time))).sort((a, b) => a - b)
    return times.map(time => {
      const row: Record<string, number> = { time }
      stressData.filter(d => d.time === time).forEach(d => {
        row[d.moduleId] = d.tj
      })
      return row
    })
  }, [stressData])

  // Junction voltage analysis: measured Vf vs datasheet max
  const junctionVoltageData = useMemo(() => {
    return diodeSpecs.map(spec => ({
      label: `${spec.moduleId.replace("MOD-", "")} D${spec.diodeIdx}`,
      vf_rated: spec.vf_rated,
      vf_max: spec.vf_max,
      margin: parseFloat((spec.vf_max - spec.vf_rated).toFixed(4)),
      margin_pct: parseFloat(((spec.vf_max - spec.vf_rated) / spec.vf_max * 100).toFixed(1)),
      pass: spec.vf_rated < spec.vf_max,
    }))
  }, [diodeSpecs])

  // Summary stats
  const totalDiodes = vfData.length / 4 // 4 temps per diode
  const allVf = vfData.map(d => d.vf)
  const avgVf = parseFloat((allVf.reduce((a, b) => a + b, 0) / allVf.length).toFixed(3))
  const maxTj = Math.max(...stressData.map(d => d.tj))
  const tjMax = 80
  const passCount = stressData.filter(d => d.time === 60).filter(d => d.tj <= tjMax).length
  const totalModules = 3
  const passRate = parseFloat(((passCount / totalModules) * 100).toFixed(1))

  // All junction voltage pass?
  const allJunctionPass = junctionVoltageData.every(d => d.pass)

  // Check thermal runaway: all rates should be decreasing (approaching steady state)
  const thermalRunawayOk = thermalRateData.length > 1 &&
    thermalRateData[thermalRateData.length - 1].MOD_A01_rate < thermalRateData[0].MOD_A01_rate

  const MODULE_COLORS: Record<string, string> = {
    "MOD-A01": "#3b82f6",
    "MOD-A02": "#22c55e",
    "MOD-A03": "#f59e0b",
  }

  return (
    <div className="space-y-4">
      <IECStandardCard
        standard="IEC 61215-2 MQT 18"
        title="Terrestrial PV modules — Part 2: Test procedures — MQT 18 Bypass diode thermal test"
        testConditions={[
          "Diode stressed at 1.25 × Isc for 1 hour",
          "Ambient temperature: 75°C ± 5°C",
          "Module mounted in open-rack configuration",
          "Thermocouple on diode junction or package",
        ]}
        dosageLevels={[
          "Stress current: 1.25 × Isc (module short-circuit current)",
          "Duration: 1 hour continuous at 75°C ambient",
          "Thermal cycling: additional 200 cycles if required per MQT 11",
        ]}
        passCriteria={[
          { parameter: "Max temp rise", requirement: "≤15°C above ambient (75°C)", note: "Tj ≤ 90°C" },
          { parameter: "Diode function", requirement: "No open/short circuit after test", note: "Functional check" },
          { parameter: "Vf linearity", requirement: "Linear Vf vs. T relationship", note: "~−2 mV/°C typical" },
        ]}
        failCriteria={[
          { parameter: "Temp rise", requirement: ">15°C above ambient" },
          { parameter: "Diode failure", requirement: "Open or short circuit after stress" },
        ]}
        notes={[
          "IEC 61730 MST 22 has additional safety requirements for diode testing",
          "Reverse current test at 1.25 × Isc worst-case string current",
        ]}
      />
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-blue-600">{totalDiodes}</div>
            <div className="text-xs text-gray-500">Diodes Tested</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className={`text-2xl font-bold ${passRate >= 90 ? "text-green-600" : "text-amber-600"}`}>
              {passRate}%
            </div>
            <div className="text-xs text-gray-500">Stress Pass Rate</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-purple-600">{avgVf} V</div>
            <div className="text-xs text-gray-500">Avg Vf</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className={`text-2xl font-bold ${maxTj <= tjMax ? "text-green-600" : "text-red-600"}`}>
              {maxTj}°C
            </div>
            <div className="text-xs text-gray-500">Max Tj</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-amber-600">{vfAt75} V</div>
            <div className="text-xs text-gray-500">Vf@75°C (extrap.)</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <Badge className={allJunctionPass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
              {allJunctionPass ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
              {allJunctionPass ? "Vf OK" : "Vf EXCEED"}
            </Badge>
            <div className="text-xs text-gray-500 mt-1">vs Datasheet Max</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Vf vs Temperature Linear Fit */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Vf vs Temperature – Linear Regression
            </CardTitle>
            <CardDescription className="text-xs">
              Vf = {regression.slope.toFixed(5)}×T + {regression.intercept.toFixed(4)} | R² = {regression.r2.toFixed(4)} | Slope ≈ {(regression.slope * 1000).toFixed(1)} mV/°C
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="temp" type="number" domain={[20, 80]} name="Temperature"
                  label={{ value: "Temperature (°C)", position: "insideBottom", offset: -5, fontSize: 10 }}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  dataKey="vf" type="number" domain={["auto", "auto"]} name="Vf"
                  label={{ value: "Vf (V)", angle: -90, position: "insideLeft", fontSize: 10 }}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  formatter={(v: number, name: string) => [
                    name === "vfFit" ? `${v.toFixed(4)} V (fit)` : `${v.toFixed(4)} V`,
                    name === "vfFit" ? "Regression" : "Measured"
                  ]}
                  labelFormatter={(l) => `${l}°C`}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Scatter name="Measured Vf" data={scatterPoints} dataKey="vf" fill="#f59e0b" />
                <Scatter
                  name="Linear Fit"
                  data={regressionLine}
                  dataKey="vfFit"
                  fill="none"
                  line={{ stroke: "#ef4444", strokeWidth: 2, strokeDasharray: "6 3" }}
                  legendType="line"
                  shape={() => null}
                />
                <ReferenceLine
                  x={75} stroke="#8b5cf6" strokeDasharray="4 2"
                  label={{ value: "75°C extrap.", fill: "#8b5cf6", fontSize: 9, position: "top" }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stress Test 75°C / 1hr */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-red-500" />
              Stress Test – Junction Temp during Isc Loading at 75°C Ambient
            </CardTitle>
            <CardDescription className="text-xs">
              1-hour test | Pass: Tj ≤ Tj,max ({tjMax}°C)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stressChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="time" type="number"
                  label={{ value: "Time (min)", position: "insideBottom", offset: -5, fontSize: 10 }}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  domain={[60, 85]}
                  label={{ value: "Tj (°C)", angle: -90, position: "insideLeft", fontSize: 10 }}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip formatter={(v: number) => [`${v}°C`, ""]} labelFormatter={l => `${l} min`} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine
                  y={tjMax} stroke="#ef4444" strokeDasharray="5 3" strokeWidth={2}
                  label={{ value: `Tj,max = ${tjMax}°C`, position: "right", fill: "#ef4444", fontSize: 9 }}
                />
                {Object.keys(MODULE_COLORS).map(mod => (
                  <Line
                    key={mod} type="monotone" dataKey={mod} name={mod}
                    stroke={MODULE_COLORS[mod]} strokeWidth={2} dot={{ r: 2 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Junction Voltage Analysis */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              Junction Voltage – Measured vs Datasheet Max
            </CardTitle>
            <CardDescription className="text-xs">
              Vf at rated Isc current · Max allowed: 0.65 V
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={junctionVoltageData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="label" tick={{ fontSize: 9 }} />
                <YAxis domain={[0, 0.75]} tick={{ fontSize: 10 }}
                       label={{ value: "Vf (V)", angle: -90, position: "insideLeft", fontSize: 9 }} />
                <Tooltip formatter={(v: number, name: string) => [
                  name === "Margin" ? `${v.toFixed(4)} V` : `${v.toFixed(4)} V`, name
                ]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine y={0.65} stroke="#ef4444" strokeDasharray="5 3" strokeWidth={2}
                               label={{ value: "Max 0.65V", position: "right", fill: "#ef4444", fontSize: 9 }} />
                <Bar dataKey="vf_rated" name="Measured Vf" maxBarSize={20}>
                  {junctionVoltageData.map((d, i) => (
                    <Cell key={i} fill={d.pass ? "#3b82f6" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {junctionVoltageData.slice(0, 6).map(d => (
                <div key={d.label} className="text-xs p-1.5 border rounded flex justify-between">
                  <span className="font-mono text-muted-foreground">{d.label}</span>
                  <span className={`font-bold ${d.pass ? "text-green-600" : "text-red-600"}`}>
                    Margin: {d.margin_pct}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Thermal Runaway Check */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-500" />
              Thermal Runaway Check – Temperature Rise Rate
            </CardTitle>
            <CardDescription className="text-xs">
              dTj/dt must decrease over time (approaching steady state). Constant/increasing rate = runaway risk.
              <Badge className={`ml-2 ${thermalRunawayOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {thermalRunawayOk ? "NO RUNAWAY" : "RUNAWAY RISK"}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={thermalRateData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="time" type="number"
                       label={{ value: "Time (min)", position: "insideBottom", offset: -5, fontSize: 10 }}
                       tick={{ fontSize: 10 }} />
                <YAxis label={{ value: "dTj/dt (°C/min)", angle: -90, position: "insideLeft", fontSize: 9 }}
                       tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [`${v.toFixed(2)} °C/min`]} labelFormatter={l => `${l} min`} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine y={0.5} stroke="#ef4444" strokeDasharray="4 2"
                               label={{ value: "Steady-state threshold", fill: "#ef4444", fontSize: 9 }} />
                <Line type="monotone" dataKey="MOD_A01_rate" name="MOD-A01" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="MOD_A02_rate" name="MOD-A02" stroke="#22c55e" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="MOD_A03_rate" name="MOD-A03" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Regression Statistics Card */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-4 pb-3">
          <div className="text-xs text-amber-800 space-y-1">
            <span className="font-semibold">Linear Regression Summary (Vf = a×T + b):</span>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
              <div>
                <div className="text-gray-500">Slope (a)</div>
                <div className="font-mono font-bold">{regression.slope.toFixed(5)} V/°C</div>
              </div>
              <div>
                <div className="text-gray-500">Intercept (b)</div>
                <div className="font-mono font-bold">{regression.intercept.toFixed(4)} V</div>
              </div>
              <div>
                <div className="text-gray-500">R²</div>
                <div className="font-mono font-bold">{regression.r2.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-gray-500">Temp Coefficient</div>
                <div className="font-mono font-bold">{(regression.slope * 1000).toFixed(1)} mV/°C</div>
              </div>
              <div>
                <div className="text-gray-500">Vf @ 75°C (extrap.)</div>
                <div className="font-mono font-bold">{vfAt75} V</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-diode detail table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Per-Diode Vf Measurements (V)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="border p-1.5 bg-gray-50 text-left">Module</th>
                  <th className="border p-1.5 bg-gray-50 text-left">Diode</th>
                  <th className="border p-1.5 bg-gray-50 text-center">25°C</th>
                  <th className="border p-1.5 bg-gray-50 text-center">40°C</th>
                  <th className="border p-1.5 bg-gray-50 text-center">55°C</th>
                  <th className="border p-1.5 bg-gray-50 text-center">70°C</th>
                  <th className="border p-1.5 bg-gray-50 text-center">ΔVf/°C (mV)</th>
                  <th className="border p-1.5 bg-gray-50 text-center">Vf@Isc</th>
                  <th className="border p-1.5 bg-gray-50 text-center">Max</th>
                  <th className="border p-1.5 bg-gray-50 text-center">Margin</th>
                </tr>
              </thead>
              <tbody>
                {["MOD-A01", "MOD-A02", "MOD-A03"].map(mod =>
                  [1, 2, 3].map(di => {
                    const diodeData = vfData.filter(d => d.moduleId === mod && d.diodeIdx === di)
                    const vf25 = diodeData.find(d => d.temp === 25)?.vf ?? 0
                    const vf70 = diodeData.find(d => d.temp === 70)?.vf ?? 0
                    const slope = ((vf70 - vf25) / 45 * 1000).toFixed(1)
                    const spec = diodeSpecs.find(s => s.moduleId === mod && s.diodeIdx === di)
                    const margin = spec ? ((spec.vf_max - spec.vf_rated) / spec.vf_max * 100).toFixed(1) : "—"
                    return (
                      <tr key={`${mod}-${di}`}>
                        <td className="border p-1.5 font-mono">{mod}</td>
                        <td className="border p-1.5 text-center">D{di}</td>
                        {[25, 40, 55, 70].map(t => {
                          const v = diodeData.find(d => d.temp === t)?.vf
                          return (
                            <td key={t} className="border p-1.5 text-center font-mono">
                              {v?.toFixed(4) ?? "—"}
                            </td>
                          )
                        })}
                        <td className="border p-1.5 text-center font-mono font-bold">{slope}</td>
                        <td className="border p-1.5 text-center font-mono">{spec?.vf_rated.toFixed(4) ?? "—"}</td>
                        <td className="border p-1.5 text-center font-mono text-muted-foreground">{spec?.vf_max ?? "—"}</td>
                        <td className={`border p-1.5 text-center font-mono font-bold ${parseFloat(margin) > 15 ? "text-green-600" : "text-amber-600"}`}>
                          {margin}%
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* IEC Reference */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-3 pb-3">
          <div className="text-xs text-amber-800">
            <span className="font-semibold">IEC 61215 MQT 18 / IEC 61730 MST 22 (Bypass Diode):</span>{" "}
            Forward voltage Vf measured at 25°C, 40°C, 55°C, 70°C under rated Isc. Linear extrapolation to 75°C.
            Stress test: 1 hour at 75°C ambient with Isc loading. Pass criteria: Tj ≤ Tj,max (rated junction temperature).
            Junction voltage must remain below datasheet maximum at rated current. Thermal runaway check: dTj/dt must
            decrease monotonically, indicating approach to thermal steady state.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
