// @ts-nocheck
"use client"

import {
  ComposedChart, Line, Bar, BarChart, LineChart, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell
} from "recharts"

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface IVParams {
  voc: number
  isc: number
  vmp: number
  imp: number
  pmax: number
  ff: number
}

export interface IVCurveChartProps {
  preParams: IVParams
  postParams: IVParams
  uncertaintyBand?: boolean
  title?: string
  height?: number
}

// ─── Default Demo Data ──────────────────────────────────────────────────────────

export const DEFAULT_PRE_PARAMS: IVParams = {
  voc: 49.28,
  isc: 11.42,
  vmp: 41.50,
  imp: 10.41,
  pmax: 432.0,
  ff: 0.768,
}

export const DEFAULT_POST_PARAMS: IVParams = {
  voc: 49.15,
  isc: 11.38,
  vmp: 41.35,
  imp: 10.38,
  pmax: 430.2,
  ff: 0.769,
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function generateIVData(params: IVParams, numPoints = 100) {
  const { voc, isc } = params
  const thermalVoltage = 1.3 * 0.026 * 60 // ~2.028 V
  const points: { voltage: number; current: number; power: number }[] = []

  for (let i = 0; i <= numPoints; i++) {
    const voltage = (voc * i) / numPoints
    let current = isc * (1 - Math.exp((voltage - voc) / thermalVoltage))
    if (current < 0) current = 0
    points.push({
      voltage: Math.round(voltage * 100) / 100,
      current: Math.round(current * 1000) / 1000,
      power: Math.round(voltage * current * 100) / 100,
    })
  }
  return points
}

function buildChartData(preParams: IVParams, postParams: IVParams, uncertaintyBand: boolean) {
  const preData = generateIVData(preParams)
  const postData = generateIVData(postParams)
  const maxLen = Math.max(preData.length, postData.length)
  const combined: Record<string, number | undefined>[] = []

  for (let i = 0; i < maxLen; i++) {
    const pre = preData[i]
    const post = postData[i]
    const entry: Record<string, number | undefined> = {
      voltage: pre?.voltage ?? post?.voltage,
      preCurrent: pre?.current,
      postCurrent: post?.current,
      prePower: pre?.power,
      postPower: post?.power,
    }
    if (uncertaintyBand && pre) {
      entry.preCurrentUpper = Math.round(pre.current * 1.02 * 1000) / 1000
      entry.preCurrentLower = Math.round(pre.current * 0.98 * 1000) / 1000
    }
    combined.push(entry)
  }
  return combined
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function IVCurveChart({
  preParams = DEFAULT_PRE_PARAMS,
  postParams = DEFAULT_POST_PARAMS,
  uncertaintyBand = false,
  title = "IV Curve & Power Curve Comparison",
  height = 400,
}: IVCurveChartProps) {
  const data = buildChartData(preParams, postParams, uncertaintyBand)
  const maxPower = Math.max(preParams.pmax, postParams.pmax)
  const maxCurrent = Math.max(preParams.isc, postParams.isc)

  const degradation = ((preParams.pmax - postParams.pmax) / preParams.pmax * 100).toFixed(2)

  return (
    <div className="bg-white rounded-lg border p-4 iv-curve-chart">
      <h3 className="font-semibold text-sm mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 10, right: 60, left: 10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="voltage"
            type="number"
            domain={[0, Math.ceil(Math.max(preParams.voc, postParams.voc) * 1.05)]}
            tick={{ fontSize: 10 }}
            label={{ value: "Voltage (V)", position: "insideBottom", offset: -15, fontSize: 11 }}
          />
          <YAxis
            yAxisId="current"
            domain={[0, Math.ceil(maxCurrent * 1.1)]}
            tick={{ fontSize: 10 }}
            label={{ value: "Current (A)", angle: -90, position: "insideLeft", fontSize: 11 }}
          />
          <YAxis
            yAxisId="power"
            orientation="right"
            domain={[0, Math.ceil(maxPower * 1.15)]}
            tick={{ fontSize: 10 }}
            label={{ value: "Power (W)", angle: 90, position: "insideRight", fontSize: 11 }}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              const unit = name.toLowerCase().includes("power") ? " W" : " A"
              return [`${value.toFixed(3)}${unit}`, name]
            }}
            labelFormatter={(v: number) => `Voltage: ${v} V`}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />

          {/* Uncertainty band */}
          {uncertaintyBand && (
            <Area
              yAxisId="current"
              type="monotone"
              dataKey="preCurrentUpper"
              stroke="none"
              fill="#2563eb"
              fillOpacity={0.1}
              name="±2% Uncertainty Band"
              legendType="none"
            />
          )}
          {uncertaintyBand && (
            <Area
              yAxisId="current"
              type="monotone"
              dataKey="preCurrentLower"
              stroke="none"
              fill="#ffffff"
              fillOpacity={1}
              legendType="none"
              name=""
            />
          )}

          {/* Pre-test IV curve */}
          <Line
            yAxisId="current"
            type="monotone"
            dataKey="preCurrent"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            name="Pre-test Current"
          />
          {/* Post-test IV curve */}
          <Line
            yAxisId="current"
            type="monotone"
            dataKey="postCurrent"
            stroke="#dc2626"
            strokeWidth={2}
            dot={false}
            name="Post-test Current"
          />

          {/* Power curves (dashed) */}
          <Line
            yAxisId="power"
            type="monotone"
            dataKey="prePower"
            stroke="#2563eb"
            strokeWidth={1.5}
            strokeDasharray="6 3"
            dot={false}
            name="Pre-test Power"
          />
          <Line
            yAxisId="power"
            type="monotone"
            dataKey="postPower"
            stroke="#dc2626"
            strokeWidth={1.5}
            strokeDasharray="6 3"
            dot={false}
            name="Post-test Power"
          />

          {/* Voc reference lines */}
          <ReferenceLine
            yAxisId="current"
            x={preParams.voc}
            stroke="#2563eb"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{ value: `Voc=${preParams.voc}V`, fill: "#2563eb", fontSize: 9, position: "top" }}
          />
          <ReferenceLine
            yAxisId="current"
            x={postParams.voc}
            stroke="#dc2626"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{ value: `Voc=${postParams.voc}V`, fill: "#dc2626", fontSize: 9, position: "insideTopRight" }}
          />

          {/* Isc reference lines */}
          <ReferenceLine
            yAxisId="current"
            y={preParams.isc}
            stroke="#2563eb"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{ value: `Isc=${preParams.isc}A`, fill: "#2563eb", fontSize: 9, position: "right" }}
          />

          {/* Vmpp reference line */}
          <ReferenceLine
            yAxisId="current"
            x={preParams.vmp}
            stroke="#059669"
            strokeDasharray="2 2"
            strokeWidth={1}
            label={{ value: `Vmpp`, fill: "#059669", fontSize: 8, position: "insideBottomRight" }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Parameter comparison table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border px-3 py-1.5 text-left font-semibold">Parameter</th>
              <th className="border px-3 py-1.5 text-center font-semibold text-blue-600">Pre-test</th>
              <th className="border px-3 py-1.5 text-center font-semibold text-red-600">Post-test</th>
              <th className="border px-3 py-1.5 text-center font-semibold">Change</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Voc (V)", pre: preParams.voc, post: postParams.voc },
              { label: "Isc (A)", pre: preParams.isc, post: postParams.isc },
              { label: "Vmp (V)", pre: preParams.vmp, post: postParams.vmp },
              { label: "Imp (A)", pre: preParams.imp, post: postParams.imp },
              { label: "Pmax (W)", pre: preParams.pmax, post: postParams.pmax },
              { label: "FF", pre: preParams.ff, post: postParams.ff },
            ].map((row) => {
              const change = ((row.post - row.pre) / row.pre * 100)
              return (
                <tr key={row.label} className="hover:bg-gray-50">
                  <td className="border px-3 py-1 font-medium">{row.label}</td>
                  <td className="border px-3 py-1 text-center">{row.pre.toFixed(row.label === "FF" ? 3 : 2)}</td>
                  <td className="border px-3 py-1 text-center">{row.post.toFixed(row.label === "FF" ? 3 : 2)}</td>
                  <td className={`border px-3 py-1 text-center ${change < -2 ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                    {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="text-xs text-gray-500 mt-2">
          Overall Pmax degradation: <span className={`font-semibold ${parseFloat(degradation) > 5 ? "text-red-600" : "text-green-600"}`}>
            {degradation}%
          </span>
          {parseFloat(degradation) <= 5 ? " (PASS: < 5%)" : " (FAIL: > 5%)"}
        </p>
      </div>
    </div>
  )
}
