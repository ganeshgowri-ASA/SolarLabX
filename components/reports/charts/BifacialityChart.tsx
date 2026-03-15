// @ts-nocheck
"use client"

import {
  BarChart, Bar, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Cell, LabelList
} from "recharts"

export interface BifacialityChartProps {
  frontIrradiance?: number
  rearIrradiances?: number[]
  frontPmax?: number
  rearPmax?: number
  bifacialityFactor?: number
  title?: string
  height?: number
}

interface BifacialGainPoint {
  rearIrr: string
  rearIrrNum: number
  frontPower: number
  rearPower: number
  totalPower: number
  gain: number
  bsi: number
}

interface BifacialityBarPoint {
  side: string
  pmax: number
  color: string
}

function generateBifacialGainData(
  frontIrradiance: number,
  rearIrradiances: number[],
  frontPmax: number,
  bifacialityFactor: number,
): BifacialGainPoint[] {
  return rearIrradiances.map(rearIrr => {
    const frontPower = frontPmax
    const rearPower = frontPmax * bifacialityFactor * (rearIrr / frontIrradiance)
    const totalPower = frontPower + rearPower
    const gain = (rearPower / frontPower) * 100
    // BSI = front irradiance + bifacialityFactor * rear irradiance
    const bsi = frontIrradiance + bifacialityFactor * rearIrr
    return {
      rearIrr: `${rearIrr} W/m²`,
      rearIrrNum: rearIrr,
      frontPower: parseFloat(frontPower.toFixed(1)),
      rearPower: parseFloat(rearPower.toFixed(1)),
      totalPower: parseFloat(totalPower.toFixed(1)),
      gain: parseFloat(gain.toFixed(1)),
      bsi: parseFloat(bsi.toFixed(0)),
    }
  })
}

export function BifacialityChart({
  frontIrradiance = 1000,
  rearIrradiances = [0, 100, 200, 300, 350],
  frontPmax = 430,
  rearPmax = 301,
  bifacialityFactor = 0.70,
  title = "Bifaciality Analysis — IEC TS 60904-1-2",
  height = 340,
}: BifacialityChartProps) {
  // Derive rearPmax from bifaciality factor if not explicitly given
  const effectiveRearPmax = rearPmax ?? frontPmax * bifacialityFactor
  const effectiveBifaciality = bifacialityFactor ?? (effectiveRearPmax / frontPmax)

  const gainData = generateBifacialGainData(frontIrradiance, rearIrradiances, frontPmax, effectiveBifaciality)

  // BNPI = Bifacial Net Power Increase at max rear irradiance
  const maxRearIrr = Math.max(...rearIrradiances)
  const bnpi = frontPmax * effectiveBifaciality * (maxRearIrr / frontIrradiance)
  // ABSI = Average Bifacial Stress Irradiance
  const absi = frontIrradiance + effectiveBifaciality * (maxRearIrr / 2)

  const bifacialityBarData: BifacialityBarPoint[] = [
    { side: "Front Pmax", pmax: parseFloat(frontPmax.toFixed(1)), color: "#2563eb" },
    { side: "Rear Pmax", pmax: parseFloat(effectiveRearPmax.toFixed(1)), color: "#d97706" },
  ]

  return (
    <div className="bg-white rounded-lg border p-4 bifaciality-chart">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="px-2 py-1 rounded bg-amber-50 text-amber-800 text-xs font-medium">
          Bifaciality Factor: {(effectiveBifaciality * 100).toFixed(1)}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Sub-chart 1: Bifacial Gain Stacked Bar */}
        <div>
          <h4 className="text-xs font-medium text-gray-600 mb-2">
            Bifacial Power Gain at Varying Rear Irradiance (Front: {frontIrradiance} W/m²)
          </h4>
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={gainData} margin={{ top: 10, right: 40, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="rearIrr"
                tick={{ fontSize: 9 }}
                label={{ value: "Rear Irradiance", position: "insideBottom", offset: -15, fontSize: 10 }}
              />
              <YAxis
                yAxisId="power"
                tick={{ fontSize: 10 }}
                label={{ value: "Power (W)", angle: -90, position: "insideLeft", fontSize: 10, offset: 5 }}
              />
              <YAxis
                yAxisId="bsi"
                orientation="right"
                tick={{ fontSize: 10 }}
                label={{ value: "BSI (W/m²)", angle: 90, position: "insideRight", fontSize: 10, offset: 5 }}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "BSI") return [`${value} W/m²`, name]
                  return [`${value.toFixed(1)} W`, name]
                }}
              />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />

              <ReferenceLine
                yAxisId="power"
                y={frontPmax}
                stroke="#94a3b8"
                strokeDasharray="4 4"
                strokeWidth={1}
              />

              <Bar
                yAxisId="power"
                dataKey="frontPower"
                stackId="power"
                fill="#2563eb"
                name="Front Power"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                yAxisId="power"
                dataKey="rearPower"
                stackId="power"
                fill="#d97706"
                name="Rear Power"
                radius={[3, 3, 0, 0]}
              >
                <LabelList
                  dataKey="gain"
                  position="top"
                  formatter={(v: number) => `+${v}%`}
                  style={{ fontSize: 9, fill: "#92400e" }}
                />
              </Bar>

              {/* BSI line overlay */}
              <Line
                yAxisId="bsi"
                type="monotone"
                dataKey="bsi"
                stroke="#059669"
                strokeWidth={2}
                dot={{ r: 3, fill: "#059669" }}
                name="BSI"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Sub-chart 2: Bifaciality Factor Visualization */}
        <div>
          <h4 className="text-xs font-medium text-gray-600 mb-2">
            Bifaciality Factor Comparison (Front vs Rear)
          </h4>
          <ResponsiveContainer width="100%" height={height * 0.6}>
            <BarChart
              data={bifacialityBarData}
              layout="vertical"
              margin={{ top: 10, right: 40, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                type="number"
                tick={{ fontSize: 10 }}
                label={{ value: "Pmax (W)", position: "insideBottom", offset: -5, fontSize: 10 }}
              />
              <YAxis
                type="category"
                dataKey="side"
                tick={{ fontSize: 11, fontWeight: 500 }}
                width={80}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)} W`]}
              />
              <Bar dataKey="pmax" radius={[0, 4, 4, 0]} barSize={30}>
                {bifacialityBarData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="pmax"
                  position="right"
                  formatter={(v: number) => `${v.toFixed(1)} W`}
                  style={{ fontSize: 11, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Annotations */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            <div className="bg-blue-50 rounded p-2.5 text-center">
              <div className="text-gray-500 mb-0.5">BNPI (Net Power Increase)</div>
              <div className="font-bold text-blue-800 text-base">+{bnpi.toFixed(1)} W</div>
              <div className="text-gray-400 text-[10px]">at {maxRearIrr} W/m² rear</div>
            </div>
            <div className="bg-amber-50 rounded p-2.5 text-center">
              <div className="text-gray-500 mb-0.5">ABSI (Avg Bifacial Stress Irr.)</div>
              <div className="font-bold text-amber-800 text-base">{absi.toFixed(0)} W/m²</div>
              <div className="text-gray-400 text-[10px]">effective irradiance</div>
            </div>
          </div>

          {/* Bifaciality factor breakdown */}
          <div className="mt-3 bg-gray-50 rounded p-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Bifaciality Factor (phi_bi)</span>
              <span className="font-bold text-gray-900">
                {(effectiveBifaciality * 100).toFixed(1)}%
              </span>
            </div>
            <div className="mt-1.5 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-amber-500 h-2 rounded-full"
                style={{ width: `${effectiveBifaciality * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-gray-400">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Default Demo Data ───────────────────────────────────────────────────────

export const DEFAULT_BIFACIALITY_PROPS: BifacialityChartProps = {
  frontIrradiance: 1000,
  rearIrradiances: [0, 100, 200, 300, 350],
  frontPmax: 430,
  rearPmax: 301,
  bifacialityFactor: 0.70,
}
