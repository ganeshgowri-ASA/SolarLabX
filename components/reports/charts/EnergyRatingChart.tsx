// @ts-nocheck
"use client"

import React from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Line, ComposedChart, Cell, ReferenceLine
} from "recharts"

export interface EnergyRatingChartProps {
  powerMatrix?: number[][]  // 7 irradiance rows x 4 temperature columns
  climateYields?: { zone: string; yield: number }[]
  spectralFactors?: { wavelength: number; factor: number }[]
  height?: number
  title?: string
}

// Default power matrix for a typical 430W module
// Rows: Irradiance [100, 200, 400, 600, 800, 1000, 1100] W/m²
// Cols: Temperature [15, 25, 45, 60] °C
const DEFAULT_POWER_MATRIX: number[][] = [
  [44.8,  43.2,  40.1,  37.8],   // 100 W/m²
  [89.2,  86.1,  80.0,  75.4],   // 200 W/m²
  [177.5, 171.8, 159.6, 150.4],  // 400 W/m²
  [264.8, 256.5, 238.5, 224.8],  // 600 W/m²
  [351.2, 340.2, 316.8, 298.6],  // 800 W/m²
  [444.5, 430.0, 400.1, 377.2],  // 1000 W/m² (STC row)
  [486.2, 470.8, 438.0, 413.0],  // 1100 W/m²
]

const DEFAULT_CLIMATE_YIELDS: { zone: string; yield: number }[] = [
  { zone: "Tropical", yield: 1620 },
  { zone: "Subtropical", yield: 1780 },
  { zone: "Temperate", yield: 1520 },
  { zone: "Arid", yield: 1850 },
]

const DEFAULT_SPECTRAL_FACTORS: { wavelength: number; factor: number }[] = [
  { wavelength: 300, factor: 0.92 },
  { wavelength: 400, factor: 0.96 },
  { wavelength: 500, factor: 0.99 },
  { wavelength: 600, factor: 1.01 },
  { wavelength: 700, factor: 1.02 },
  { wavelength: 800, factor: 1.01 },
  { wavelength: 900, factor: 0.98 },
  { wavelength: 1000, factor: 0.95 },
  { wavelength: 1100, factor: 0.88 },
]

const IRRADIANCE_LEVELS = [100, 200, 400, 600, 800, 1000, 1100]
const TEMPERATURE_LEVELS = [15, 25, 45, 60]

function getHeatmapColor(value: number, min: number, max: number): string {
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min || 1)))

  // Blue -> Cyan -> Green -> Yellow -> Red
  if (ratio < 0.25) {
    const t = ratio / 0.25
    const r = Math.round(30 + t * 0)
    const g = Math.round(100 + t * 155)
    const b = Math.round(220 - t * 50)
    return `rgb(${r},${g},${b})`
  } else if (ratio < 0.5) {
    const t = (ratio - 0.25) / 0.25
    const r = Math.round(30 + t * 80)
    const g = Math.round(255 - t * 55)
    const b = Math.round(170 - t * 120)
    return `rgb(${r},${g},${b})`
  } else if (ratio < 0.75) {
    const t = (ratio - 0.5) / 0.25
    const r = Math.round(110 + t * 145)
    const g = Math.round(200 - t * 20)
    const b = Math.round(50 - t * 20)
    return `rgb(${r},${g},${b})`
  } else {
    const t = (ratio - 0.75) / 0.25
    const r = Math.round(255)
    const g = Math.round(180 - t * 130)
    const b = Math.round(30 - t * 20)
    return `rgb(${r},${g},${b})`
  }
}

interface HeatmapProps {
  matrix: number[][]
}

function PowerMatrixHeatmap({ matrix }: HeatmapProps) {
  const allValues = matrix.flat()
  const minVal = Math.min(...allValues)
  const maxVal = Math.max(...allValues)

  const cellWidth = 72
  const cellHeight = 36
  const labelColWidth = 80
  const labelRowHeight = 36
  const totalWidth = labelColWidth + TEMPERATURE_LEVELS.length * cellWidth
  const totalHeight = labelRowHeight + IRRADIANCE_LEVELS.length * cellHeight + 30

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <h4 className="text-xs font-semibold text-gray-700 mb-2">
        Power Matrix (W) - IEC 61853-1
      </h4>
      <div className="overflow-x-auto">
        <svg width={totalWidth} height={totalHeight} className="mx-auto">
          {/* Temperature header */}
          {TEMPERATURE_LEVELS.map((temp, j) => (
            <text
              key={`header-${j}`}
              x={labelColWidth + j * cellWidth + cellWidth / 2}
              y={20}
              textAnchor="middle"
              fontSize={10}
              fontWeight="bold"
              fill="#374151"
            >
              {temp}°C
            </text>
          ))}

          {/* Irradiance labels and cells */}
          {IRRADIANCE_LEVELS.map((irr, i) => (
            <g key={`row-${i}`}>
              <text
                x={labelColWidth - 8}
                y={labelRowHeight + i * cellHeight + cellHeight / 2 + 4}
                textAnchor="end"
                fontSize={10}
                fontWeight="bold"
                fill="#374151"
              >
                {irr} W/m²
              </text>
              {TEMPERATURE_LEVELS.map((_, j) => {
                const value = matrix[i]?.[j] ?? 0
                const color = getHeatmapColor(value, minVal, maxVal)
                // Determine text color for readability
                const brightness = value > (maxVal + minVal) / 2 ? 0 : 255
                return (
                  <g key={`cell-${i}-${j}`}>
                    <rect
                      x={labelColWidth + j * cellWidth}
                      y={labelRowHeight + i * cellHeight}
                      width={cellWidth - 2}
                      height={cellHeight - 2}
                      fill={color}
                      rx={3}
                    />
                    <text
                      x={labelColWidth + j * cellWidth + (cellWidth - 2) / 2}
                      y={labelRowHeight + i * cellHeight + (cellHeight - 2) / 2 + 4}
                      textAnchor="middle"
                      fontSize={9}
                      fontWeight="600"
                      fill={brightness === 255 ? "#ffffff" : "#1f2937"}
                    >
                      {value.toFixed(1)}
                    </text>
                  </g>
                )
              })}
            </g>
          ))}

          {/* Color scale legend */}
          {(() => {
            const legendY = labelRowHeight + IRRADIANCE_LEVELS.length * cellHeight + 10
            const legendWidth = totalWidth - labelColWidth - 20
            const steps = 20
            return (
              <g>
                <text x={labelColWidth} y={legendY + 12} fontSize={8} fill="#6b7280">
                  {minVal.toFixed(0)}W
                </text>
                {Array.from({ length: steps }, (_, i) => {
                  const val = minVal + (i / (steps - 1)) * (maxVal - minVal)
                  return (
                    <rect
                      key={`legend-${i}`}
                      x={labelColWidth + 35 + i * ((legendWidth - 70) / steps)}
                      y={legendY + 2}
                      width={(legendWidth - 70) / steps + 1}
                      height={12}
                      fill={getHeatmapColor(val, minVal, maxVal)}
                    />
                  )
                })}
                <text
                  x={labelColWidth + legendWidth - 30}
                  y={legendY + 12}
                  fontSize={8}
                  fill="#6b7280"
                  textAnchor="end"
                >
                  {maxVal.toFixed(0)}W
                </text>
              </g>
            )
          })()}
        </svg>
      </div>
    </div>
  )
}

const CLIMATE_COLORS = ["#16a34a", "#f59e0b", "#3b82f6", "#ef4444"]

export function EnergyRatingChart({
  powerMatrix,
  climateYields,
  spectralFactors,
  height = 280,
  title = "IEC 61853 Energy Rating Analysis",
}: EnergyRatingChartProps) {
  const matrix = powerMatrix ?? DEFAULT_POWER_MATRIX
  const yields = climateYields ?? DEFAULT_CLIMATE_YIELDS
  const spectral = spectralFactors ?? DEFAULT_SPECTRAL_FACTORS

  const maxYield = Math.max(...yields.map((y) => y.yield))

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold text-sm mb-4">{title}</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 1. Power Matrix Heatmap */}
        <PowerMatrixHeatmap matrix={matrix} />

        {/* 2. Climate-Specific Energy Yield Bar Chart */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">
            Climate-Specific Energy Yield (kWh/kWp)
          </h4>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={yields}
              margin={{ top: 15, right: 10, left: 5, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="zone"
                tick={{ fontSize: 10 }}
                label={{
                  value: "Climate Zone",
                  position: "insideBottom",
                  offset: -15,
                  fontSize: 10,
                }}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                domain={[0, Math.ceil(maxYield * 1.15 / 100) * 100]}
                label={{
                  value: "Yield (kWh/kWp)",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 10,
                  offset: 5,
                }}
              />
              <Tooltip
                formatter={(value: number) => [`${value} kWh/kWp`, "Energy Yield"]}
              />
              <Bar dataKey="yield" name="Energy Yield" radius={[4, 4, 0, 0]}>
                {yields.map((_, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={CLIMATE_COLORS[index % CLIMATE_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 3. Spectral Correction Factor Line Chart */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">
            Spectral Correction Factor
          </h4>
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart
              data={spectral}
              margin={{ top: 10, right: 10, left: 5, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="wavelength"
                type="number"
                tick={{ fontSize: 10 }}
                domain={[250, 1150]}
                label={{
                  value: "Wavelength (nm)",
                  position: "insideBottom",
                  offset: -15,
                  fontSize: 10,
                }}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                domain={[0.8, 1.1]}
                label={{
                  value: "Correction Factor",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 10,
                  offset: 5,
                }}
              />
              <Tooltip
                formatter={(value: number) => [value.toFixed(3), "Spectral Factor"]}
                labelFormatter={(v) => `${v} nm`}
              />
              {/* Reference line at factor = 1.0 */}
              <ReferenceLine
                y={1.0}
                stroke="#9ca3af"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <Line
                type="monotone"
                dataKey="factor"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={{ fill: "#7c3aed", r: 4, strokeWidth: 2, stroke: "#fff" }}
                name="Spectral Factor"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary statistics */}
      <div className="grid grid-cols-4 gap-3 mt-4 pt-3 border-t text-xs text-center">
        <div className="bg-blue-50 rounded px-2 py-1.5">
          <div className="text-gray-500">STC Power</div>
          <div className="font-semibold text-blue-800">
            {(matrix[5]?.[1] ?? 430).toFixed(1)} W
          </div>
        </div>
        <div className="bg-green-50 rounded px-2 py-1.5">
          <div className="text-gray-500">Best Yield</div>
          <div className="font-semibold text-green-800">
            {Math.max(...yields.map((y) => y.yield))} kWh/kWp
          </div>
        </div>
        <div className="bg-purple-50 rounded px-2 py-1.5">
          <div className="text-gray-500">Avg Spectral Factor</div>
          <div className="font-semibold text-purple-800">
            {(spectral.reduce((s, p) => s + p.factor, 0) / spectral.length).toFixed(3)}
          </div>
        </div>
        <div className="bg-orange-50 rounded px-2 py-1.5">
          <div className="text-gray-500">NMOT Power</div>
          <div className="font-semibold text-orange-800">
            {(matrix[4]?.[2] ?? 316.8).toFixed(1)} W
          </div>
        </div>
      </div>
    </div>
  )
}
