// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine
} from "recharts"
import { AlertTriangle, CheckCircle, Zap, Thermometer, Activity } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface VdarkPoint {
  hours: number
  vdark: number
}

interface PmaxDegradationPoint {
  hours: number
  perc: number
  topcon: number
  hjt: number
}

// ─── Sample Data ─────────────────────────────────────────────────────────────

function generateVdarkData(): VdarkPoint[] {
  // PERC module: U-shaped curve – degradation then regeneration
  // Vdark drops from ~38.5V to minimum ~37.2V around 200h, then recovers to ~38.3V
  const data: VdarkPoint[] = []
  for (let h = 0; h <= 500; h += 10) {
    let vdark: number
    if (h <= 200) {
      // Degradation phase: exponential decay
      vdark = 38.5 - 1.3 * (1 - Math.exp(-h / 80))
    } else {
      // Regeneration phase: recovery
      vdark = 37.2 + 1.1 * (1 - Math.exp(-(h - 200) / 120))
    }
    vdark += (Math.random() - 0.5) * 0.05
    data.push({ hours: h, vdark: parseFloat(vdark.toFixed(3)) })
  }
  return data
}

function generatePmaxDegradation(): PmaxDegradationPoint[] {
  const data: PmaxDegradationPoint[] = []
  for (let h = 0; h <= 500; h += 10) {
    // PERC: drops to ~95% then recovers to ~97%
    let perc: number
    if (h <= 200) {
      perc = 100 - 5 * (1 - Math.exp(-h / 80))
    } else {
      perc = 95 + 2 * (1 - Math.exp(-(h - 200) / 120))
    }

    // TOPCon: drops to ~99% then recovers to ~99.5%
    let topcon: number
    if (h <= 150) {
      topcon = 100 - 1 * (1 - Math.exp(-h / 60))
    } else {
      topcon = 99 + 0.5 * (1 - Math.exp(-(h - 150) / 100))
    }

    // HJT: minimal degradation
    const hjt = 100 - 0.5 * (1 - Math.exp(-h / 100))

    data.push({
      hours: h,
      perc: parseFloat((perc + (Math.random() - 0.5) * 0.3).toFixed(2)),
      topcon: parseFloat((topcon + (Math.random() - 0.5) * 0.15).toFixed(2)),
      hjt: parseFloat((hjt + (Math.random() - 0.5) * 0.1).toFixed(2)),
    })
  }
  return data
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LeTIDAnalysis() {
  const [isc, setIsc] = useState(11.2)
  const [impp, setImpp] = useState(10.5)
  const [testTemp, setTestTemp] = useState(75)

  const vdarkData = useMemo(() => generateVdarkData(), [])
  const pmaxData = useMemo(() => generatePmaxDegradation(), [])

  // Find minimum Vdark point
  const minVdark = useMemo(() => {
    let min = vdarkData[0]
    vdarkData.forEach(d => { if (d.vdark < min.vdark) min = d })
    return min
  }, [vdarkData])

  // Check regeneration: minimum held for 10 consecutive hours (1 data point = 10h)
  const regenerationDetected = useMemo(() => {
    const minIdx = vdarkData.findIndex(d => d.hours === minVdark.hours)
    if (minIdx < 0 || minIdx >= vdarkData.length - 1) return false
    // Check if next point is higher (regeneration started)
    return vdarkData[minIdx + 1]?.vdark > minVdark.vdark
  }, [vdarkData, minVdark])

  // Power supply calculator
  const iInject = parseFloat((isc - impp).toFixed(2))
  const estVoltage = parseFloat((0.7 * 60).toFixed(1)) // ~60 cells × 0.7V forward bias
  const estPower = parseFloat((iInject * estVoltage).toFixed(1))
  const durationPerCycle = 162
  const totalDuration = durationPerCycle * 2

  // Gradient zones for Vdark chart
  const vdarkWithZone = useMemo(() =>
    vdarkData.map(d => ({
      ...d,
      degradation: d.hours <= minVdark.hours ? d.vdark : undefined,
      regeneration: d.hours >= minVdark.hours ? d.vdark : undefined,
    })), [vdarkData, minVdark])

  return (
    <div className="space-y-4">
      {/* Header badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="border-amber-300 text-amber-700">IEC TS 63342</Badge>
        <Badge variant="outline" className="border-blue-300 text-blue-700">LeTID / LID Testing</Badge>
        {regenerationDetected && (
          <Badge className="bg-green-100 text-green-700 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Regeneration Detected
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dark Voltage vs Time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-500" />
              Dark Voltage (Vdark) vs Time
            </CardTitle>
            <CardDescription className="text-xs">
              U-shaped curve: degradation → minimum → regeneration | Min at {minVdark.hours}h: {minVdark.vdark.toFixed(3)}V
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={vdarkWithZone}>
                <defs>
                  <linearGradient id="gradDegradation" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradRegeneration" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="hours" type="number"
                  label={{ value: "Time (hours)", position: "insideBottom", offset: -5, fontSize: 10 }}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  domain={[36.8, 38.8]}
                  label={{ value: "Vdark (V)", angle: -90, position: "insideLeft", fontSize: 10 }}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip formatter={(v: number) => [`${v?.toFixed(3) ?? "—"} V`, ""]} labelFormatter={l => `${l}h`} />
                <Area
                  type="monotone" dataKey="degradation" name="Degradation"
                  stroke="#ef4444" fill="url(#gradDegradation)" strokeWidth={2}
                  dot={false} connectNulls={false}
                />
                <Area
                  type="monotone" dataKey="regeneration" name="Regeneration"
                  stroke="#22c55e" fill="url(#gradRegeneration)" strokeWidth={2}
                  dot={false} connectNulls={false}
                />
                <ReferenceLine
                  x={minVdark.hours} stroke="#f59e0b" strokeDasharray="4 2"
                  label={{ value: `Min: ${minVdark.vdark.toFixed(3)}V`, fill: "#f59e0b", fontSize: 9, position: "top" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Power Supply Settings Calculator */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              Power Supply Settings Calculator
            </CardTitle>
            <CardDescription className="text-xs">
              Calculate injection current and estimated power for LeTID testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <Label className="text-xs">Isc (A)</Label>
                <Input type="number" step="0.1" value={isc} onChange={e => setIsc(+e.target.value)} className="h-7 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Impp (A)</Label>
                <Input type="number" step="0.1" value={impp} onChange={e => setImpp(+e.target.value)} className="h-7 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Test Temperature (°C)</Label>
                <Input type="number" step="5" value={testTemp} onChange={e => setTestTemp(+e.target.value)} className="h-7 text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "I_inject (Isc − Impp)", value: `${iInject} A`, color: "border-l-blue-500" },
                { label: "Estimated Voltage", value: `${estVoltage} V`, color: "border-l-green-500" },
                { label: "Estimated Power", value: `${estPower} W`, color: "border-l-purple-500" },
                { label: "Duration (162h × 2 cycles)", value: `${totalDuration} h`, color: "border-l-amber-500" },
              ].map(({ label, value, color }) => (
                <div key={label} className={`p-3 bg-gray-50 rounded border-l-4 ${color}`}>
                  <div className="text-xs text-gray-500">{label}</div>
                  <div className="text-lg font-bold font-mono">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 p-2 bg-amber-50 rounded text-xs text-amber-700">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              Test per IEC TS 63342: Forward bias current injection at {testTemp}°C for {durationPerCycle}h per cycle, 2 cycles total.
            </div>
          </CardContent>
        </Card>

        {/* Pmax Degradation Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-red-500" />
              Pmax Degradation by Cell Technology
            </CardTitle>
            <CardDescription className="text-xs">
              Pmax/Pmax_initial (%) vs hours | PERC: −5%, TOPCon: −1%, HJT: −0.5%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={pmaxData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="hours" type="number"
                  label={{ value: "Time (hours)", position: "insideBottom", offset: -5, fontSize: 10 }}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  domain={[93, 101]}
                  label={{ value: "Pmax/Pmax₀ (%)", angle: -90, position: "insideLeft", fontSize: 10 }}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  formatter={(v: number, name: string) => [`${v.toFixed(2)}%`, name]}
                  labelFormatter={l => `${l}h`}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine y={95} stroke="#ef4444" strokeDasharray="5 3"
                  label={{ value: "−5% limit", fill: "#ef4444", fontSize: 9 }} />
                <Line type="monotone" dataKey="perc" name="PERC" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="topcon" name="TOPCon" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="hjt" name="HJT" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* LeTID State Diagram */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">LeTID State Diagram</CardTitle>
            <CardDescription className="text-xs">
              Three-state model: State A (inactive) → State B (active/degraded) → State C (regenerated)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <svg viewBox="0 0 500 200" className="w-full max-w-md" style={{ height: 200 }}>
              {/* State A */}
              <rect x="20" y="60" width="120" height="80" rx="12" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />
              <text x="80" y="95" textAnchor="middle" className="text-sm" fill="#1e40af" fontWeight="bold" fontSize="14">State A</text>
              <text x="80" y="115" textAnchor="middle" fill="#3b82f6" fontSize="10">Inactive</text>
              <text x="80" y="130" textAnchor="middle" fill="#3b82f6" fontSize="9">(Pre-degradation)</text>

              {/* Arrow A→B */}
              <line x1="140" y1="100" x2="180" y2="100" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrowAmber)" />
              <text x="160" y="90" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold">Light/Heat</text>

              {/* State B */}
              <rect x="185" y="60" width="120" height="80" rx="12" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
              <text x="245" y="95" textAnchor="middle" fill="#92400e" fontWeight="bold" fontSize="14">State B</text>
              <text x="245" y="115" textAnchor="middle" fill="#f59e0b" fontSize="10">Active</text>
              <text x="245" y="130" textAnchor="middle" fill="#f59e0b" fontSize="9">(Degraded)</text>

              {/* Arrow B→C */}
              <line x1="305" y1="100" x2="345" y2="100" stroke="#22c55e" strokeWidth="2" markerEnd="url(#arrowGreen)" />
              <text x="325" y="90" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="bold">Regeneration</text>

              {/* State C */}
              <rect x="350" y="60" width="120" height="80" rx="12" fill="#dcfce7" stroke="#22c55e" strokeWidth="2" />
              <text x="410" y="95" textAnchor="middle" fill="#166534" fontWeight="bold" fontSize="14">State C</text>
              <text x="410" y="115" textAnchor="middle" fill="#22c55e" fontSize="10">Regenerated</text>
              <text x="410" y="130" textAnchor="middle" fill="#22c55e" fontSize="9">(Stable)</text>

              {/* Arrow markers */}
              <defs>
                <marker id="arrowAmber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                </marker>
                <marker id="arrowGreen" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" />
                </marker>
              </defs>
            </svg>
          </CardContent>
        </Card>
      </div>

      {/* Reference */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4 pb-3">
          <div className="text-xs text-blue-800">
            <span className="font-semibold">IEC TS 63342 – LeTID Testing:</span>{" "}
            Light and elevated Temperature Induced Degradation. Forward-bias current injection
            (I = Isc − Impp) at 75°C or 85°C. Two cycles of 162h each. Monitor Pmax and Vdark.
            Degradation limit: PERC ≤ 5%, TOPCon ≤ 2%, HJT ≤ 1%.
            Regeneration confirmed when minimum Vdark is sustained for ≥10 consecutive hours.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
