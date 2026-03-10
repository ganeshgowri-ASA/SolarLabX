// @ts-nocheck
"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ComposedChart,
  Area,
  Bar,
} from "recharts"
import { Zap, Download, Plus, Eye, EyeOff, Thermometer, Activity, TrendingUp } from "lucide-react"
import {
  generateSampleCurves,
  correctPmaxToSTC,
  IVCurveData,
  IVDataPoint,
} from "@/lib/iv-curve"

export default function IVCurveAnalysis() {
  const curves = useMemo(() => generateSampleCurves(), [])
  const [visibleCurves, setVisibleCurves] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(curves.map((c) => [c.id, true]))
  )
  const [selectedCurve, setSelectedCurve] = useState<string>(curves[0]?.id ?? "")
  const [correctionTemp, setCorrectionTemp] = useState<number>(25)
  const [correctionIrr, setCorrectionIrr] = useState<number>(1000)

  const toggleCurve = (id: string) => {
    setVisibleCurves((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const selected = curves.find((c) => c.id === selectedCurve)

  // Build merged IV data for the chart: each point has voltage + current/power per curve
  const ivChartData = useMemo(() => {
    const allVoltages = new Set<number>()
    for (const curve of curves) {
      if (!visibleCurves[curve.id]) continue
      for (const pt of curve.dataPoints) {
        allVoltages.add(pt.voltage)
      }
    }
    const sortedV = Array.from(allVoltages).sort((a, b) => a - b)

    return sortedV.map((v) => {
      const row: Record<string, number> = { voltage: v }
      for (const curve of curves) {
        if (!visibleCurves[curve.id]) continue
        const pt = curve.dataPoints.find((p) => p.voltage === v)
        if (pt) {
          row[`current_${curve.id}`] = pt.current
          row[`power_${curve.id}`] = pt.power
        }
      }
      return row
    })
  }, [curves, visibleCurves])

  // Temperature-corrected values
  const correctedValues = useMemo(() => {
    return curves.map((c) => ({
      id: c.id,
      label: c.label,
      original: c.pmax,
      corrected: correctPmaxToSTC(c.pmax, c.irradiance, c.temperature, -0.35),
      targetCorrected: correctPmaxToSTC(
        c.pmax,
        correctionIrr,
        correctionTemp,
        -0.35
      ),
    }))
  }, [curves, correctionTemp, correctionIrr])

  const handleExport = () => {
    alert("IV Curve data export will be available in the next release.")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Zap className="h-6 w-6 text-orange-500" />
            IV Curve Analysis
          </h2>
          <p className="text-muted-foreground">
            Current-Voltage and Power-Voltage characterization per IEC 60904
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Curve visibility toggles */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Curve Selection</CardTitle>
          <CardDescription>Toggle curves on/off and select one for detailed reference lines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {curves.map((curve) => (
              <div key={curve.id} className="flex items-center gap-2">
                <button
                  onClick={() => toggleCurve(curve.id)}
                  className="flex items-center gap-1.5 text-sm"
                >
                  {visibleCurves[curve.id] ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                <button
                  onClick={() => setSelectedCurve(curve.id)}
                  className={`flex items-center gap-1.5 text-sm px-2 py-1 rounded transition-colors ${
                    selectedCurve === curve.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ backgroundColor: curve.color }}
                  />
                  {curve.label}
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Charts + Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* IV Curve Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              I-V Characteristic
            </CardTitle>
            <CardDescription>Current vs Voltage curves</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={ivChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="voltage"
                  label={{ value: "Voltage (V)", position: "insideBottomRight", offset: -5 }}
                  className="text-muted-foreground"
                />
                <YAxis
                  label={{ value: "Current (A)", angle: -90, position: "insideLeft" }}
                  className="text-muted-foreground"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Legend />
                {curves.map(
                  (curve) =>
                    visibleCurves[curve.id] && (
                      <Line
                        key={curve.id}
                        type="monotone"
                        dataKey={`current_${curve.id}`}
                        stroke={curve.color}
                        dot={false}
                        strokeWidth={2}
                        name={curve.label}
                        connectNulls={false}
                      />
                    )
                )}
                {selected && visibleCurves[selected.id] && (
                  <>
                    <ReferenceLine
                      x={selected.voc}
                      stroke={selected.color}
                      strokeDasharray="5 5"
                      label={{ value: `Voc=${selected.voc}V`, position: "top", fill: selected.color, fontSize: 11 }}
                    />
                    <ReferenceLine
                      y={selected.isc}
                      stroke={selected.color}
                      strokeDasharray="5 5"
                      label={{ value: `Isc=${selected.isc}A`, position: "right", fill: selected.color, fontSize: 11 }}
                    />
                    <ReferenceLine
                      x={selected.vmpp}
                      stroke={selected.color}
                      strokeDasharray="3 3"
                      strokeOpacity={0.5}
                      label={{ value: `Vmpp`, position: "bottom", fill: selected.color, fontSize: 10 }}
                    />
                    <ReferenceLine
                      y={selected.impp}
                      stroke={selected.color}
                      strokeDasharray="3 3"
                      strokeOpacity={0.5}
                      label={{ value: `Impp`, position: "left", fill: selected.color, fontSize: 10 }}
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Parameters Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Parameters
            </CardTitle>
            <CardDescription>
              {selected ? selected.label : "Select a curve"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selected ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="text-muted-foreground text-xs">Voc</div>
                    <div className="font-semibold">{selected.voc} V</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="text-muted-foreground text-xs">Isc</div>
                    <div className="font-semibold">{selected.isc} A</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="text-muted-foreground text-xs">Pmax</div>
                    <div className="font-semibold">{selected.pmax} W</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="text-muted-foreground text-xs">FF</div>
                    <div className="font-semibold">{(selected.ff * 100).toFixed(2)}%</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="text-muted-foreground text-xs">Vmpp</div>
                    <div className="font-semibold">{selected.vmpp} V</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="text-muted-foreground text-xs">Impp</div>
                    <div className="font-semibold">{selected.impp} A</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="text-muted-foreground text-xs">Efficiency</div>
                    <div className="font-semibold">{selected.efficiency}%</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="text-muted-foreground text-xs">Area</div>
                    <div className="font-semibold">{selected.area} m&sup2;</div>
                  </div>
                </div>
                <div className="border-t pt-3 mt-3">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">
                    Equivalent Circuit
                  </h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between bg-muted/50 rounded-lg p-2">
                      <span className="text-muted-foreground">Rs (Series)</span>
                      <span className="font-semibold">{selected.rSeries} &Omega;</span>
                    </div>
                    <div className="flex justify-between bg-muted/50 rounded-lg p-2">
                      <span className="text-muted-foreground">Rsh (Shunt)</span>
                      <span className="font-semibold">{selected.rShunt.toFixed(2)} &Omega;</span>
                    </div>
                    <div className="flex justify-between bg-muted/50 rounded-lg p-2">
                      <span className="text-muted-foreground">n (Ideality)</span>
                      <span className="font-semibold">{selected.ideality}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-3 mt-3">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">
                    Test Conditions
                  </h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between bg-muted/50 rounded-lg p-2">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Thermometer className="h-3 w-3" /> Temperature
                      </span>
                      <span className="font-semibold">{selected.temperature}&deg;C</span>
                    </div>
                    <div className="flex justify-between bg-muted/50 rounded-lg p-2">
                      <span className="text-muted-foreground">Irradiance</span>
                      <span className="font-semibold">{selected.irradiance} W/m&sup2;</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Select a curve to view parameters.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Power-Voltage Curve */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            P-V Characteristic
          </CardTitle>
          <CardDescription>Power vs Voltage curves with Pmax markers</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={ivChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="voltage"
                label={{ value: "Voltage (V)", position: "insideBottomRight", offset: -5 }}
                className="text-muted-foreground"
              />
              <YAxis
                label={{ value: "Power (W)", angle: -90, position: "insideLeft" }}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Legend />
              {curves.map(
                (curve) =>
                  visibleCurves[curve.id] && (
                    <Area
                      key={curve.id}
                      type="monotone"
                      dataKey={`power_${curve.id}`}
                      stroke={curve.color}
                      fill={curve.color}
                      fillOpacity={0.1}
                      strokeWidth={2}
                      dot={false}
                      name={`${curve.label} (P)`}
                      connectNulls={false}
                    />
                  )
              )}
              {selected && visibleCurves[selected.id] && (
                <ReferenceLine
                  x={selected.vmpp}
                  stroke={selected.color}
                  strokeDasharray="5 5"
                  label={{
                    value: `Pmax=${selected.pmax}W`,
                    position: "top",
                    fill: selected.color,
                    fontSize: 12,
                  }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* All Curves Parameters Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Curves Comparison</CardTitle>
          <CardDescription>Side-by-side parameters for all loaded IV curves</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2 px-2">Curve</th>
                <th className="text-right py-2 px-2">Voc (V)</th>
                <th className="text-right py-2 px-2">Isc (A)</th>
                <th className="text-right py-2 px-2">Pmax (W)</th>
                <th className="text-right py-2 px-2">Vmpp (V)</th>
                <th className="text-right py-2 px-2">Impp (A)</th>
                <th className="text-right py-2 px-2">FF (%)</th>
                <th className="text-right py-2 px-2">Eff (%)</th>
                <th className="text-right py-2 px-2">Rs (&Omega;)</th>
                <th className="text-right py-2 px-2">Rsh (&Omega;)</th>
                <th className="text-right py-2 px-2">n</th>
                <th className="text-right py-2 px-2">T (&deg;C)</th>
                <th className="text-right py-2 px-2">G (W/m&sup2;)</th>
              </tr>
            </thead>
            <tbody>
              {curves.map((c) => (
                <tr
                  key={c.id}
                  className={`border-b transition-colors ${
                    selectedCurve === c.id ? "bg-accent/50" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedCurve(c.id)}
                  style={{ cursor: "pointer" }}
                >
                  <td className="py-2 px-2 flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full inline-block flex-shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="truncate">{c.label}</span>
                  </td>
                  <td className="text-right py-2 px-2">{c.voc}</td>
                  <td className="text-right py-2 px-2">{c.isc}</td>
                  <td className="text-right py-2 px-2 font-semibold">{c.pmax}</td>
                  <td className="text-right py-2 px-2">{c.vmpp}</td>
                  <td className="text-right py-2 px-2">{c.impp}</td>
                  <td className="text-right py-2 px-2">{(c.ff * 100).toFixed(2)}</td>
                  <td className="text-right py-2 px-2">{c.efficiency}</td>
                  <td className="text-right py-2 px-2">{c.rSeries}</td>
                  <td className="text-right py-2 px-2">{c.rShunt.toFixed(1)}</td>
                  <td className="text-right py-2 px-2">{c.ideality}</td>
                  <td className="text-right py-2 px-2">{c.temperature}</td>
                  <td className="text-right py-2 px-2">{c.irradiance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Temperature Correction Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-red-500" />
            Temperature &amp; Irradiance Correction
          </CardTitle>
          <CardDescription>
            Correct measured Pmax to target conditions (default STC: 25&deg;C, 1000 W/m&sup2;)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Inputs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="corrTemp">Target Temperature (&deg;C)</Label>
                <Input
                  id="corrTemp"
                  type="number"
                  value={correctionTemp}
                  onChange={(e) => setCorrectionTemp(parseFloat(e.target.value) || 25)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="corrIrr">Target Irradiance (W/m&sup2;)</Label>
                <Input
                  id="corrIrr"
                  type="number"
                  value={correctionIrr}
                  onChange={(e) => setCorrectionIrr(parseFloat(e.target.value) || 1000)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Using temp coefficient: -0.35 %/&deg;C (typical for crystalline Si)
              </p>
            </div>
            {/* Results */}
            <div className="md:col-span-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 px-2">Curve</th>
                    <th className="text-right py-2 px-2">Measured Pmax (W)</th>
                    <th className="text-right py-2 px-2">Corrected to STC (W)</th>
                    <th className="text-right py-2 px-2">
                      Corrected to {correctionTemp}&deg;C / {correctionIrr} W/m&sup2; (W)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {correctedValues.map((cv) => (
                    <tr key={cv.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2">{cv.label}</td>
                      <td className="text-right py-2 px-2">{cv.original}</td>
                      <td className="text-right py-2 px-2 font-semibold">{cv.corrected}</td>
                      <td className="text-right py-2 px-2 font-semibold">{cv.targetCorrected}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
