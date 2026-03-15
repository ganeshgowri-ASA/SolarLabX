// @ts-nocheck
"use client"

import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceArea, ReferenceLine
} from "recharts"

export interface LeTIDDataPoint {
  time: number
  voltage: number
  pmax: number
  phase: string
}

export interface LeTIDAnalysisChartProps {
  data?: LeTIDDataPoint[]
  title?: string
  height?: number
}

function generateDefaultLeTIDData(): LeTIDDataPoint[] {
  const data: LeTIDDataPoint[] = []

  // Phase 1: B-O CID Preconditioning (0-50 hours)
  // Light-induced degradation from boron-oxygen complexes
  for (let t = 0; t <= 50; t += 2) {
    const frac = t / 50
    data.push({
      time: t,
      voltage: parseFloat((620 - frac * 8).toFixed(1)),
      pmax: parseFloat((100 - frac * 2.5).toFixed(2)),
      phase: "B-O CID",
    })
  }

  // Phase 2: LeTID Degradation (50-350 hours)
  // Slow degradation characteristic of LeTID
  for (let t = 52; t <= 350; t += 4) {
    const frac = (t - 50) / 300
    // Degradation follows a stretched exponential
    const degradation = 4.5 * (1 - Math.exp(-2.5 * frac))
    const noise = (Math.random() - 0.5) * 0.3
    data.push({
      time: t,
      voltage: parseFloat((612 - degradation * 2.2 + (Math.random() - 0.5) * 0.5).toFixed(1)),
      pmax: parseFloat((97.5 - degradation + noise).toFixed(2)),
      phase: "Degradation",
    })
  }

  // Phase 3: Recovery / Annealing (350-600 hours)
  // Partial recovery at continued elevated temperature
  const pmaxAtDegEnd = 93.2
  const voltageAtDegEnd = 602.5
  for (let t = 352; t <= 600; t += 4) {
    const frac = (t - 350) / 250
    // Recovery follows logarithmic curve
    const recovery = 3.8 * (1 - Math.exp(-1.8 * frac))
    const noise = (Math.random() - 0.5) * 0.25
    data.push({
      time: t,
      voltage: parseFloat((voltageAtDegEnd + recovery * 1.8 + (Math.random() - 0.5) * 0.4).toFixed(1)),
      pmax: parseFloat((pmaxAtDegEnd + recovery + noise).toFixed(2)),
      phase: "Recovery",
    })
  }

  return data
}

const PHASE_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  "B-O CID": { bg: "#dbeafe", border: "#93c5fd", label: "B-O CID Preconditioning" },
  "Degradation": { bg: "#fee2e2", border: "#fca5a5", label: "LeTID Degradation" },
  "Recovery": { bg: "#dcfce7", border: "#86efac", label: "Recovery / Annealing" },
}

export function LeTIDAnalysisChart({
  data,
  title = "LeTID Analysis — Light & Elevated Temperature Induced Degradation",
  height = 400,
}: LeTIDAnalysisChartProps) {
  const chartData = data ?? generateDefaultLeTIDData()

  // Determine phase boundaries
  const phases = {
    "B-O CID": { start: 0, end: 50 },
    "Degradation": { start: 50, end: 350 },
    "Recovery": { start: 350, end: 600 },
  }

  // Calculate key metrics
  const initialPmax = chartData[0]?.pmax ?? 100
  const minPmax = Math.min(...chartData.map(d => d.pmax))
  const finalPmax = chartData[chartData.length - 1]?.pmax ?? 97
  const maxDegradation = (initialPmax - minPmax).toFixed(2)
  const residualDegradation = (initialPmax - finalPmax).toFixed(2)

  return (
    <div className="bg-white rounded-lg border p-4 letid-analysis-chart">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{title}</h3>
        <div className="flex gap-3 text-xs">
          <span className="px-2 py-1 rounded bg-red-50 text-red-800 font-medium">
            Max Deg: {maxDegradation}%
          </span>
          <span className="px-2 py-1 rounded bg-amber-50 text-amber-800 font-medium">
            Residual: {residualDegradation}%
          </span>
        </div>
      </div>

      {/* Phase legend */}
      <div className="flex gap-4 mb-2 text-xs">
        {Object.entries(PHASE_COLORS).map(([phase, colors]) => (
          <div key={phase} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm border"
              style={{ backgroundColor: colors.bg, borderColor: colors.border }}
            />
            <span className="text-gray-600">{colors.label}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 50, left: 10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

          {/* Phase background regions */}
          {Object.entries(phases).map(([phase, bounds]) => (
            <ReferenceArea
              key={phase}
              x1={bounds.start}
              x2={bounds.end}
              yAxisId="pmax"
              fill={PHASE_COLORS[phase].bg}
              fillOpacity={0.5}
              strokeOpacity={0}
            />
          ))}

          <XAxis
            dataKey="time"
            tick={{ fontSize: 10 }}
            label={{ value: "Time (hours)", position: "insideBottom", offset: -15, fontSize: 11 }}
            type="number"
            domain={[0, 600]}
          />
          <YAxis
            yAxisId="voltage"
            domain={[590, 630]}
            tick={{ fontSize: 10 }}
            label={{ value: "Dark Voltage (mV)", angle: -90, position: "insideLeft", fontSize: 11, offset: 5 }}
          />
          <YAxis
            yAxisId="pmax"
            orientation="right"
            domain={[90, 102]}
            tick={{ fontSize: 10 }}
            label={{ value: "Pmax Normalized (%)", angle: 90, position: "insideRight", fontSize: 11, offset: 5 }}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === "Dark Voltage") return [`${value.toFixed(1)} mV`, name]
              return [`${value.toFixed(2)}%`, name]
            }}
            labelFormatter={(v) => `Time: ${v} h`}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const point = payload[0]?.payload
              return (
                <div className="bg-white border rounded-lg shadow-sm p-2.5 text-xs">
                  <div className="font-semibold mb-1">Time: {label} h</div>
                  <div className="text-gray-500 mb-1.5">Phase: {point?.phase}</div>
                  {payload.map((p, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      <span>{p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}</span>
                    </div>
                  ))}
                </div>
              )
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />

          {/* Phase transition lines */}
          <ReferenceLine
            x={50}
            yAxisId="pmax"
            stroke="#94a3b8"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{ value: "B-O CID End", fill: "#64748b", fontSize: 9, position: "top" }}
          />
          <ReferenceLine
            x={350}
            yAxisId="pmax"
            stroke="#94a3b8"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{ value: "Recovery Start", fill: "#64748b", fontSize: 9, position: "top" }}
          />

          {/* Dark voltage */}
          <Line
            yAxisId="voltage"
            type="monotone"
            dataKey="voltage"
            stroke="#7c3aed"
            strokeWidth={1.5}
            dot={false}
            name="Dark Voltage"
          />
          {/* Pmax normalized */}
          <Line
            yAxisId="pmax"
            type="monotone"
            dataKey="pmax"
            stroke="#dc2626"
            strokeWidth={2.5}
            dot={false}
            name="Pmax (%)"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Summary metrics */}
      <div className="grid grid-cols-5 gap-2 mt-3 pt-3 border-t text-xs">
        {[
          ["Initial Pmax", `${initialPmax.toFixed(1)}%`],
          ["Min Pmax", `${minPmax.toFixed(1)}%`],
          ["Final Pmax", `${finalPmax.toFixed(1)}%`],
          ["Max Degradation", `${maxDegradation}%`],
          ["Residual Deg.", `${residualDegradation}%`],
        ].map(([label, value]) => (
          <div key={label} className="text-center bg-gray-50 rounded px-2 py-1.5">
            <div className="text-gray-500">{label}</div>
            <div className="font-semibold text-gray-800">{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Default Demo Data ───────────────────────────────────────────────────────

export const DEFAULT_LETID_DATA: LeTIDDataPoint[] = generateDefaultLeTIDData()
