// @ts-nocheck
"use client"

import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine
} from "recharts"

export interface PeelTestDataPoint {
  displacement: number
  force: number
}

export interface PeelTestChartProps {
  data?: PeelTestDataPoint[]
  avgForce?: number
  stdDev?: number
  minForceThreshold?: number
  height?: number
  title?: string
}

function generateDefaultPeelData(): {
  data: PeelTestDataPoint[]
  avgForce: number
  stdDev: number
} {
  const points: PeelTestDataPoint[] = []
  const steadyStateForce = 18 // N/mm typical
  const rampEnd = 8 // mm

  for (let i = 0; i <= 50; i++) {
    const displacement = i * 1.0 // 0 to 50 mm
    let force: number

    if (displacement <= rampEnd) {
      // Initial ramp phase: linear increase with slight noise
      force = (displacement / rampEnd) * steadyStateForce + (Math.random() - 0.5) * 1.5
      force = Math.max(0, force)
    } else {
      // Steady state with fluctuations
      const noise = (Math.random() - 0.5) * 4
      const drift = Math.sin(displacement * 0.3) * 1.5
      force = steadyStateForce + noise + drift
    }

    points.push({
      displacement: parseFloat(displacement.toFixed(1)),
      force: parseFloat(force.toFixed(2)),
    })
  }

  // Calculate average force in steady state region only
  const steadyStatePoints = points.filter((p) => p.displacement > rampEnd)
  const avg =
    steadyStatePoints.reduce((s, p) => s + p.force, 0) /
    steadyStatePoints.length
  const variance =
    steadyStatePoints.reduce((s, p) => s + (p.force - avg) ** 2, 0) /
    steadyStatePoints.length
  const std = Math.sqrt(variance)

  return {
    data: points,
    avgForce: parseFloat(avg.toFixed(2)),
    stdDev: parseFloat(std.toFixed(2)),
  }
}

const DEFAULT_GENERATED = generateDefaultPeelData()

export function PeelTestChart({
  data,
  avgForce,
  stdDev,
  minForceThreshold = 10,
  height = 400,
  title = "Peel Test - Force vs Displacement",
}: PeelTestChartProps) {
  const chartData = data ?? DEFAULT_GENERATED.data
  const avg = avgForce ?? DEFAULT_GENERATED.avgForce
  const std = stdDev ?? DEFAULT_GENERATED.stdDev
  const pass = avg >= minForceThreshold

  // Add band data (avg +/- stdDev) for the area shading
  const enrichedData = chartData.map((point) => ({
    ...point,
    avgLine: avg,
    bandUpper: avg + std,
    bandLower: avg - std,
  }))

  const maxForce = Math.max(...chartData.map((p) => p.force), avg + std * 2)
  const yMax = Math.ceil(maxForce * 1.15)

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{title}</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            Avg: {avg.toFixed(2)} N/mm | Std Dev: {std.toFixed(2)} N/mm
          </span>
          <span
            className={`text-xs font-bold px-2 py-1 rounded ${
              pass
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {pass ? "PASS" : "FAIL"}
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={enrichedData}
          margin={{ top: 10, right: 30, left: 10, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="displacement"
            type="number"
            tick={{ fontSize: 10 }}
            label={{
              value: "Displacement (mm)",
              position: "insideBottom",
              offset: -15,
              fontSize: 11,
            }}
          />
          <YAxis
            domain={[0, yMax]}
            tick={{ fontSize: 10 }}
            label={{
              value: "Force (N/mm)",
              angle: -90,
              position: "insideLeft",
              fontSize: 11,
              offset: 5,
            }}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = {
                force: "Peel Force",
                bandUpper: "Avg + 1\u03C3",
                bandLower: "Avg - 1\u03C3",
              }
              return [`${value.toFixed(2)} N/mm`, labels[name] || name]
            }}
            labelFormatter={(v) => `Displacement: ${v} mm`}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />

          {/* Std dev band (shaded area between upper and lower) */}
          <Area
            type="monotone"
            dataKey="bandUpper"
            stroke="none"
            fill="#86efac"
            fillOpacity={0.3}
            name="Avg \u00B1 1\u03C3 Band"
            connectNulls
          />
          <Area
            type="monotone"
            dataKey="bandLower"
            stroke="none"
            fill="#ffffff"
            fillOpacity={1}
            name=""
            legendType="none"
            connectNulls
          />

          {/* Average peel force line */}
          <ReferenceLine
            y={avg}
            stroke="#16a34a"
            strokeWidth={2}
            strokeDasharray="8 4"
            label={{
              value: `Avg: ${avg.toFixed(1)} N/mm`,
              position: "right",
              fontSize: 10,
              fill: "#16a34a",
            }}
          />

          {/* Minimum threshold line */}
          <ReferenceLine
            y={minForceThreshold}
            stroke="#dc2626"
            strokeWidth={1.5}
            strokeDasharray="6 3"
            label={{
              value: `Min: ${minForceThreshold} N/mm`,
              position: "right",
              fontSize: 10,
              fill: "#dc2626",
            }}
          />

          {/* Actual peel force data */}
          <Line
            type="monotone"
            dataKey="force"
            stroke="#2563eb"
            strokeWidth={1.8}
            dot={false}
            name="Peel Force"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Statistics summary */}
      <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t text-xs text-center">
        <div className="bg-blue-50 rounded px-2 py-1.5">
          <div className="text-gray-500">Average Force</div>
          <div className="font-semibold text-blue-800">{avg.toFixed(2)} N/mm</div>
        </div>
        <div className="bg-blue-50 rounded px-2 py-1.5">
          <div className="text-gray-500">Std Deviation</div>
          <div className="font-semibold text-blue-800">{std.toFixed(2)} N/mm</div>
        </div>
        <div className="bg-gray-50 rounded px-2 py-1.5">
          <div className="text-gray-500">Min Threshold</div>
          <div className="font-semibold text-gray-800">{minForceThreshold} N/mm</div>
        </div>
        <div className={`rounded px-2 py-1.5 ${pass ? "bg-green-50" : "bg-red-50"}`}>
          <div className="text-gray-500">Margin</div>
          <div className={`font-semibold ${pass ? "text-green-800" : "text-red-800"}`}>
            {(avg - minForceThreshold).toFixed(2)} N/mm
          </div>
        </div>
      </div>
    </div>
  )
}
