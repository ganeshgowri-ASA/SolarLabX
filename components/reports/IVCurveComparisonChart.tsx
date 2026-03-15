// @ts-nocheck
"use client"

import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceDot, ReferenceLine
} from "recharts"

export interface IVParams {
  voc: number   // Open-circuit voltage (V)
  isc: number   // Short-circuit current (A)
  vmp: number   // Voltage at max power (V)
  imp: number   // Current at max power (A)
  pmax: number  // Maximum power (W)
  ff: number    // Fill factor
}

export interface IVCurveComparisonChartProps {
  preParams: IVParams
  postParams: IVParams
  title?: string
  height?: number
}

function generateIVCurve(params: IVParams, points = 100) {
  const { voc, isc } = params
  return Array.from({ length: points }, (_, i) => {
    const v = (i / (points - 1)) * voc
    const current = Math.max(0, isc * (1 - Math.exp((v - voc) / (1.3 * 0.026 * 60))))
    const power = v * current
    return {
      voltage: parseFloat(v.toFixed(2)),
      current: parseFloat(current.toFixed(4)),
      power: parseFloat(power.toFixed(2)),
    }
  })
}

export function IVCurveComparisonChart({
  preParams,
  postParams,
  title = "I-V & P-V Curve Comparison (Pre-Test vs Post-Test)",
  height = 340,
}: IVCurveComparisonChartProps) {
  const preCurve = generateIVCurve(preParams)
  const postCurve = generateIVCurve(postParams)

  // Merge both curves on the same voltage axis
  const maxVoc = Math.max(preParams.voc, postParams.voc)
  const points = 100
  const chartData = Array.from({ length: points }, (_, i) => {
    const v = (i / (points - 1)) * maxVoc
    const preI = v <= preParams.voc
      ? Math.max(0, preParams.isc * (1 - Math.exp((v - preParams.voc) / (1.3 * 0.026 * 60))))
      : 0
    const postI = v <= postParams.voc
      ? Math.max(0, postParams.isc * (1 - Math.exp((v - postParams.voc) / (1.3 * 0.026 * 60))))
      : 0
    return {
      voltage: parseFloat(v.toFixed(2)),
      preI: parseFloat(preI.toFixed(4)),
      postI: parseFloat(postI.toFixed(4)),
      preP: parseFloat((v * preI).toFixed(2)),
      postP: parseFloat((v * postI).toFixed(2)),
    }
  })

  const degradation = ((preParams.pmax - postParams.pmax) / preParams.pmax * 100).toFixed(2)

  return (
    <div className="bg-white rounded-lg border p-4 iv-curve-chart">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded ${
          Math.abs(parseFloat(degradation)) < 5
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}>
          Pmax Degradation: {degradation}%
        </span>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 50, left: 10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="voltage"
            label={{ value: "Voltage (V)", position: "insideBottom", offset: -15, fontSize: 11 }}
            tick={{ fontSize: 10 }}
          />
          <YAxis
            yAxisId="current"
            label={{ value: "Current (A)", angle: -90, position: "insideLeft", fontSize: 11, offset: 5 }}
            tick={{ fontSize: 10 }}
          />
          <YAxis
            yAxisId="power"
            orientation="right"
            label={{ value: "Power (W)", angle: 90, position: "insideRight", fontSize: 11, offset: 5 }}
            tick={{ fontSize: 10 }}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = {
                preI: "Pre-Test Current (A)",
                postI: "Post-Test Current (A)",
                preP: "Pre-Test Power (W)",
                postP: "Post-Test Power (W)",
              }
              return [value.toFixed(3), labels[name] || name]
            }}
            labelFormatter={(v) => `Voltage: ${v} V`}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          {/* Pre-test I-V curve (blue solid) */}
          <Line
            yAxisId="current"
            type="monotone"
            dataKey="preI"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={false}
            name="Pre-Test I (A)"
          />
          {/* Post-test I-V curve (red solid) */}
          <Line
            yAxisId="current"
            type="monotone"
            dataKey="postI"
            stroke="#dc2626"
            strokeWidth={2.5}
            dot={false}
            name="Post-Test I (A)"
          />
          {/* Pre-test Power curve (blue dashed) */}
          <Line
            yAxisId="power"
            type="monotone"
            dataKey="preP"
            stroke="#2563eb"
            strokeWidth={1.5}
            strokeDasharray="6 3"
            dot={false}
            name="Pre-Test P (W)"
          />
          {/* Post-test Power curve (red dashed) */}
          <Line
            yAxisId="power"
            type="monotone"
            dataKey="postP"
            stroke="#dc2626"
            strokeWidth={1.5}
            strokeDasharray="6 3"
            dot={false}
            name="Post-Test P (W)"
          />
          {/* Voc reference lines */}
          <ReferenceLine yAxisId="current" x={preParams.voc} stroke="#2563eb" strokeDasharray="3 3" strokeWidth={0.8} />
          <ReferenceLine yAxisId="current" x={postParams.voc} stroke="#dc2626" strokeDasharray="3 3" strokeWidth={0.8} />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Parameter Annotations */}
      <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t text-xs">
        <div>
          <div className="font-semibold text-blue-700 mb-1.5">Pre-Test Parameters</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["Voc", `${preParams.voc.toFixed(2)} V`],
              ["Isc", `${preParams.isc.toFixed(2)} A`],
              ["Pmax", `${preParams.pmax.toFixed(1)} W`],
              ["Vmp", `${preParams.vmp.toFixed(2)} V`],
              ["Imp", `${preParams.imp.toFixed(2)} A`],
              ["FF", `${(preParams.ff * 100).toFixed(1)}%`],
            ].map(([label, value]) => (
              <div key={label} className="text-center bg-blue-50 rounded px-1 py-0.5">
                <div className="text-gray-500">{label}</div>
                <div className="font-semibold text-blue-800">{value}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="font-semibold text-red-700 mb-1.5">Post-Test Parameters</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["Voc", `${postParams.voc.toFixed(2)} V`],
              ["Isc", `${postParams.isc.toFixed(2)} A`],
              ["Pmax", `${postParams.pmax.toFixed(1)} W`],
              ["Vmp", `${postParams.vmp.toFixed(2)} V`],
              ["Imp", `${postParams.imp.toFixed(2)} A`],
              ["FF", `${(postParams.ff * 100).toFixed(1)}%`],
            ].map(([label, value]) => (
              <div key={label} className="text-center bg-red-50 rounded px-1 py-0.5">
                <div className="text-gray-500">{label}</div>
                <div className="font-semibold text-red-800">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
