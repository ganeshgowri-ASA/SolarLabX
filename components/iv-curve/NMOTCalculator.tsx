// @ts-nocheck
"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
} from "recharts"
import { Thermometer, Sun, Wind, Zap, TrendingDown, Activity } from "lucide-react"
import { calculateNMOT, generateIrradianceTempModel, NMOTInputs } from "@/lib/iv-curve"

export default function NMOTCalculator() {
  const [tAmbient, setTAmbient] = useState(25)
  const [irradiance, setIrradiance] = useState(800)
  const [windSpeed, setWindSpeed] = useState(1)
  const [nmot, setNmot] = useState(45)
  const [tempCoeffPmax, setTempCoeffPmax] = useState(-0.35)
  const [pmaxStc, setPmaxStc] = useState(400)

  const inputs: NMOTInputs = useMemo(
    () => ({
      tAmbient,
      irradiance,
      windSpeed,
      nmot,
      tempCoeffPmax,
      pmax_stc: pmaxStc,
    }),
    [tAmbient, irradiance, windSpeed, nmot, tempCoeffPmax, pmaxStc]
  )

  const result = useMemo(() => calculateNMOT(inputs), [inputs])

  const irrTempData = useMemo(
    () => generateIrradianceTempModel(nmot, pmaxStc, tempCoeffPmax),
    [nmot, pmaxStc, tempCoeffPmax]
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Thermometer className="h-6 w-6 text-red-500" />
          NMOT / NOCT Calculator
        </h2>
        <p className="text-muted-foreground">
          Nominal Module Operating Temperature calculation per IEC 61215
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Input Parameters</CardTitle>
            <CardDescription>
              Adjust environmental and module parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Ambient Temperature */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  Ambient Temperature
                </Label>
                <Badge variant="secondary">{tAmbient}&deg;C</Badge>
              </div>
              <Slider
                value={[tAmbient]}
                onValueChange={([v]) => setTAmbient(v)}
                min={0}
                max={50}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0&deg;C</span>
                <span>50&deg;C</span>
              </div>
            </div>

            {/* Irradiance */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5">
                  <Sun className="h-4 w-4 text-yellow-500" />
                  Irradiance
                </Label>
                <Badge variant="secondary">{irradiance} W/m&sup2;</Badge>
              </div>
              <Slider
                value={[irradiance]}
                onValueChange={([v]) => setIrradiance(v)}
                min={200}
                max={1200}
                step={50}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>200 W/m&sup2;</span>
                <span>1200 W/m&sup2;</span>
              </div>
            </div>

            {/* Wind Speed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5">
                  <Wind className="h-4 w-4 text-blue-500" />
                  Wind Speed
                </Label>
                <Badge variant="secondary">{windSpeed} m/s</Badge>
              </div>
              <Slider
                value={[windSpeed]}
                onValueChange={([v]) => setWindSpeed(v)}
                min={0}
                max={10}
                step={0.5}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 m/s</span>
                <span>10 m/s</span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Module Specifications</h4>

              {/* NMOT */}
              <div className="space-y-1.5">
                <Label htmlFor="nmotVal">NMOT (&deg;C)</Label>
                <Input
                  id="nmotVal"
                  type="number"
                  value={nmot}
                  onChange={(e) => setNmot(parseFloat(e.target.value) || 45)}
                  step={0.5}
                />
                <p className="text-xs text-muted-foreground">Typically 43-48&deg;C</p>
              </div>

              {/* Temp Coefficient */}
              <div className="space-y-1.5">
                <Label htmlFor="tempCoeff">Temp Coeff Pmax (%/&deg;C)</Label>
                <Input
                  id="tempCoeff"
                  type="number"
                  value={tempCoeffPmax}
                  onChange={(e) => setTempCoeffPmax(parseFloat(e.target.value) || -0.35)}
                  step={0.01}
                />
                <p className="text-xs text-muted-foreground">Typically -0.3 to -0.5 for c-Si</p>
              </div>

              {/* Rated Power */}
              <div className="space-y-1.5">
                <Label htmlFor="pmaxStcVal">Rated Power at STC (W)</Label>
                <Input
                  id="pmaxStcVal"
                  type="number"
                  value={pmaxStc}
                  onChange={(e) => setPmaxStc(parseFloat(e.target.value) || 400)}
                  step={5}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Result Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <Thermometer className="h-5 w-5 mx-auto mb-1 text-red-500" />
                <p className="text-xs text-muted-foreground">Module Temp</p>
                <p className="text-xl font-bold">{result.moduleTemp}&deg;C</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <Zap className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                <p className="text-xs text-muted-foreground">Power at NMOT</p>
                <p className="text-xl font-bold">{result.pmaxAtNMOT} W</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <Activity className="h-5 w-5 mx-auto mb-1 text-green-500" />
                <p className="text-xs text-muted-foreground">Perf. Ratio</p>
                <p className="text-xl font-bold">{(result.performanceRatio * 100).toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <TrendingDown className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                <p className="text-xs text-muted-foreground">Thermal Loss</p>
                <p className="text-xl font-bold">{result.thermalLoss}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <Thermometer className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                <p className="text-xs text-muted-foreground">&Delta;T from STC</p>
                <p className="text-xl font-bold">
                  {result.tempDelta > 0 ? "+" : ""}
                  {result.tempDelta}&deg;C
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Irradiance vs Temperature & Power Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-yellow-500" />
                Irradiance vs Module Temperature &amp; Power
              </CardTitle>
              <CardDescription>
                Module temperature and power output across irradiance levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={irrTempData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="irradiance"
                    label={{ value: "Irradiance (W/m\u00B2)", position: "insideBottomRight", offset: -5 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    yAxisId="temp"
                    orientation="left"
                    label={{ value: "Module Temp (\u00B0C)", angle: -90, position: "insideLeft" }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    yAxisId="power"
                    orientation="right"
                    label={{ value: "Power (W)", angle: 90, position: "insideRight" }}
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
                  <Line
                    yAxisId="temp"
                    type="monotone"
                    dataKey="moduleTemp"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Module Temp (\u00B0C)"
                  />
                  <Bar
                    yAxisId="power"
                    dataKey="power"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Power (W)"
                    barSize={30}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Ratio Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Performance Ratio vs Irradiance
              </CardTitle>
              <CardDescription>
                PR accounts for thermal losses at each irradiance level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={irrTempData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="irradiance"
                    label={{ value: "Irradiance (W/m\u00B2)", position: "insideBottomRight", offset: -5 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    domain={[0.7, 1.05]}
                    tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                    label={{ value: "PR", angle: -90, position: "insideLeft" }}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, "PR"]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="pr"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.15}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Performance Ratio"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
