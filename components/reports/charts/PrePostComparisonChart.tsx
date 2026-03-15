// @ts-nocheck
"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Cell, LabelList
} from "recharts"

export interface PrePostDataPoint {
  sampleId: string
  preValue: number
  postValue: number
}

export interface PrePostComparisonChartProps {
  data?: PrePostDataPoint[]
  parameter?: string
  unit?: string
  threshold?: number
  thresholdType?: "max_degradation_pct" | "min_absolute"
  height?: number
  title?: string
}

const DEFAULT_DATA: PrePostDataPoint[] = [
  { sampleId: "MOD-001", preValue: 430.2, postValue: 421.8 },
  { sampleId: "MOD-002", preValue: 428.7, postValue: 425.1 },
  { sampleId: "MOD-003", preValue: 431.5, postValue: 410.3 },
]

function computeDegradation(pre: number, post: number): number {
  return ((pre - post) / pre) * 100
}

function checkPass(
  item: PrePostDataPoint,
  threshold: number | undefined,
  thresholdType: "max_degradation_pct" | "min_absolute" | undefined
): boolean {
  if (threshold === undefined || thresholdType === undefined) return true
  if (thresholdType === "max_degradation_pct") {
    const deg = computeDegradation(item.preValue, item.postValue)
    return deg <= threshold
  }
  if (thresholdType === "min_absolute") {
    return item.postValue >= threshold
  }
  return true
}

export function PrePostComparisonChart({
  data = DEFAULT_DATA,
  parameter = "Pmax",
  unit = "W",
  threshold = 5,
  thresholdType = "max_degradation_pct",
  height = 400,
  title,
}: PrePostComparisonChartProps) {
  const chartData = data.map((item) => {
    const degradation = computeDegradation(item.preValue, item.postValue)
    const pass = checkPass(item, threshold, thresholdType)
    return {
      ...item,
      degradation: parseFloat(degradation.toFixed(2)),
      pass,
    }
  })

  // For "max_degradation_pct" threshold, compute the reference value as
  // the average pre-value minus threshold%.  For "min_absolute", use threshold directly.
  const avgPre = data.reduce((s, d) => s + d.preValue, 0) / data.length
  const referenceValue =
    thresholdType === "max_degradation_pct"
      ? avgPre * (1 - (threshold ?? 5) / 100)
      : threshold

  const allValues = data.flatMap((d) => [d.preValue, d.postValue])
  const minVal = Math.min(...allValues)
  const maxVal = Math.max(...allValues)
  const yMin = Math.floor(minVal * 0.95)
  const yMax = Math.ceil(maxVal * 1.05)

  const displayTitle =
    title ?? `Pre/Post ${parameter} Comparison`

  const thresholdLabel =
    thresholdType === "max_degradation_pct"
      ? `Max ${threshold}% degradation`
      : `Min ${threshold} ${unit}`

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{displayTitle}</h3>
        {threshold !== undefined && (
          <span className="text-xs text-gray-500">
            Threshold: {thresholdLabel}
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 30, right: 30, left: 10, bottom: 25 }}
          barGap={2}
          barCategoryGap="25%"
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="sampleId"
            tick={{ fontSize: 11 }}
            label={{
              value: "Sample ID",
              position: "insideBottom",
              offset: -15,
              fontSize: 11,
            }}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 10 }}
            label={{
              value: `${parameter} (${unit})`,
              angle: -90,
              position: "insideLeft",
              fontSize: 11,
              offset: 5,
            }}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value.toFixed(2)} ${unit}`,
              name,
            ]}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />

          {/* Threshold reference line */}
          {referenceValue !== undefined && (
            <ReferenceLine
              y={referenceValue}
              stroke="#dc2626"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{
                value: thresholdLabel,
                position: "right",
                fontSize: 10,
                fill: "#dc2626",
              }}
            />
          )}

          <Bar dataKey="preValue" name={`Pre-Test ${parameter}`} fill="#3b82f6" radius={[3, 3, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`pre-${index}`} fill="#3b82f6" />
            ))}
          </Bar>
          <Bar dataKey="postValue" name={`Post-Test ${parameter}`} fill="#f97316" radius={[3, 3, 0, 0]}>
            <LabelList
              content={({ x, y, width, index }) => {
                const item = chartData[index]
                if (!item) return null
                const pass = item.pass
                return (
                  <text
                    x={x + width / 2}
                    y={y - 8}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight="bold"
                    fill={pass ? "#16a34a" : "#dc2626"}
                  >
                    {pass ? "PASS" : "FAIL"} ({item.degradation}%)
                  </text>
                )
              }}
            />
            {chartData.map((entry, index) => (
              <Cell key={`post-${index}`} fill="#f97316" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary table */}
      <div className="mt-3 pt-3 border-t">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500">
              <th className="text-left py-1">Sample</th>
              <th className="text-right py-1">Pre ({unit})</th>
              <th className="text-right py-1">Post ({unit})</th>
              <th className="text-right py-1">Degradation (%)</th>
              <th className="text-center py-1">Result</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((item) => (
              <tr key={item.sampleId} className="border-t border-gray-100">
                <td className="py-1 font-medium">{item.sampleId}</td>
                <td className="text-right py-1">{item.preValue.toFixed(2)}</td>
                <td className="text-right py-1">{item.postValue.toFixed(2)}</td>
                <td className="text-right py-1">{item.degradation.toFixed(2)}%</td>
                <td className="text-center py-1">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      item.pass
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.pass ? "PASS" : "FAIL"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
