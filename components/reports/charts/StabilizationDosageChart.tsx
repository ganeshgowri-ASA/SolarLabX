// @ts-nocheck
"use client"

import {
  ComposedChart, Line, Bar, BarChart, LineChart, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell
} from "recharts"

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface DosageDataPoint {
  time: number
  dose: number
  pmax: number
  label?: string
}

export interface StabilizationDosageChartProps {
  dosageData?: DosageDataPoint[]
  targetDose?: number
  pmaxLimit?: number
  title?: string
  height?: number
}

// ─── Default Demo Data ──────────────────────────────────────────────────────────

export const DEFAULT_TARGET_DOSE = 15 // kWh/m²

function generateDefaultDosageData(ratedPmax = 432.0): DosageDataPoint[] {
  // UV pre-conditioning: ~15 kWh/m² over ~120 hours
  // Pmax measured at key points (P0, P1, P2, P3...)
  const totalHours = 120
  const points: DosageDataPoint[] = []
  const irradiance = 0.125 // kWh/m²/hr average

  const measurementPoints = [0, 15, 30, 45, 60, 75, 90, 105, 120]
  const pmaxDrift = [0, -0.3, -0.5, -0.7, -0.8, -0.9, -1.0, -1.05, -1.1] // % from rated

  for (let i = 0; i < measurementPoints.length; i++) {
    const t = measurementPoints[i]
    const dose = Math.round(t * irradiance * 100) / 100
    const pmax = Math.round(ratedPmax * (1 + pmaxDrift[i] / 100) * 10) / 10
    points.push({
      time: t,
      dose,
      pmax,
      label: `P${i}`,
    })
  }

  return points
}

export const DEFAULT_DOSAGE_DATA = generateDefaultDosageData()

// ─── Component ──────────────────────────────────────────────────────────────────

export function StabilizationDosageChart({
  dosageData,
  targetDose = DEFAULT_TARGET_DOSE,
  pmaxLimit,
  title = "UV Dose Accumulation & Power Stabilization",
  height = 400,
}: StabilizationDosageChartProps) {
  const data = dosageData ?? DEFAULT_DOSAGE_DATA

  // Compute -5% Pmax limit from initial Pmax
  const initialPmax = data.length > 0 ? data[0].pmax : 432.0
  const limit = pmaxLimit ?? Math.round(initialPmax * 0.95 * 10) / 10

  const maxDose = Math.max(...data.map((d) => d.dose), targetDose)
  const minPmax = Math.min(...data.map((d) => d.pmax))
  const maxPmax = Math.max(...data.map((d) => d.pmax))

  return (
    <div className="bg-white rounded-lg border p-4 stabilization-dosage-chart">
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className="text-xs text-gray-500 mb-3">
        Target UV dose: {targetDose} kWh/m² &nbsp;|&nbsp; Pmax limit: {limit} W (-5%)
        &nbsp;|&nbsp; Measurement points: {data.length}
      </p>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 10, right: 60, left: 10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="time"
            type="number"
            tick={{ fontSize: 10 }}
            label={{ value: "Time (hours)", position: "insideBottom", offset: -15, fontSize: 11 }}
          />
          {/* Left Y-axis: UV Dose */}
          <YAxis
            yAxisId="dose"
            domain={[0, Math.ceil(maxDose * 1.15)]}
            tick={{ fontSize: 10 }}
            label={{ value: "UV Dose (kWh/m²)", angle: -90, position: "insideLeft", fontSize: 11 }}
          />
          {/* Right Y-axis: Pmax */}
          <YAxis
            yAxisId="pmax"
            orientation="right"
            domain={[Math.floor(minPmax * 0.98), Math.ceil(maxPmax * 1.01)]}
            tick={{ fontSize: 10 }}
            label={{ value: "Pmax (W)", angle: 90, position: "insideRight", fontSize: 11 }}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name.includes("Dose")) return [`${value.toFixed(2)} kWh/m²`, name]
              return [`${value.toFixed(1)} W`, name]
            }}
            labelFormatter={(v: number) => `Time: ${v} hrs`}
            content={({ active, payload, label }) => {
              if (!active || !payload || payload.length === 0) return null
              const point = data.find((d) => d.time === label)
              return (
                <div className="bg-white border rounded shadow-sm p-2 text-xs">
                  <p className="font-semibold mb-1">
                    Time: {label} hrs {point?.label ? `(${point.label})` : ""}
                  </p>
                  {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color }}>
                      {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
                      {p.name?.includes("Dose") ? " kWh/m²" : " W"}
                    </p>
                  ))}
                </div>
              )
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />

          {/* Target dose reference line */}
          <ReferenceLine
            yAxisId="dose"
            y={targetDose}
            stroke="#059669"
            strokeDasharray="8 4"
            strokeWidth={2}
            label={{ value: `Target: ${targetDose} kWh/m²`, fill: "#059669", fontSize: 10, position: "right" }}
          />

          {/* -5% Pmax limit reference line */}
          <ReferenceLine
            yAxisId="pmax"
            y={limit}
            stroke="#ef4444"
            strokeDasharray="8 4"
            strokeWidth={2}
            label={{ value: `-5% Pmax (${limit} W)`, fill: "#ef4444", fontSize: 10, position: "left" }}
          />

          {/* UV dose area (light blue fill) */}
          <Area
            yAxisId="dose"
            type="monotone"
            dataKey="dose"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="#bfdbfe"
            fillOpacity={0.5}
            name="UV Dose"
            dot={{ r: 3, fill: "#3b82f6" }}
          />

          {/* Pmax stabilization line */}
          <Line
            yAxisId="pmax"
            type="monotone"
            dataKey="pmax"
            stroke="#dc2626"
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, index } = props
              const point = data[index]
              if (!point?.label) return null
              return (
                <g key={`dot-${index}`}>
                  <circle cx={cx} cy={cy} r={5} fill="#dc2626" stroke="#fff" strokeWidth={2} />
                  <text x={cx} y={cy - 10} textAnchor="middle" fontSize={9} fill="#dc2626" fontWeight="bold">
                    {point.label}
                  </text>
                </g>
              )
            }}
            activeDot={{ r: 6, fill: "#dc2626" }}
            name="Pmax"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Summary table */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border px-2 py-1 text-center font-semibold">Point</th>
              <th className="border px-2 py-1 text-center font-semibold">Time (hrs)</th>
              <th className="border px-2 py-1 text-center font-semibold">UV Dose (kWh/m²)</th>
              <th className="border px-2 py-1 text-center font-semibold">Pmax (W)</th>
              <th className="border px-2 py-1 text-center font-semibold">Change (%)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point, i) => {
              const change = ((point.pmax - initialPmax) / initialPmax * 100)
              return (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="border px-2 py-1 text-center font-medium">{point.label ?? `P${i}`}</td>
                  <td className="border px-2 py-1 text-center">{point.time}</td>
                  <td className="border px-2 py-1 text-center">{point.dose.toFixed(2)}</td>
                  <td className="border px-2 py-1 text-center">{point.pmax.toFixed(1)}</td>
                  <td className={`border px-2 py-1 text-center ${Math.abs(change) > 5 ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                    {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
