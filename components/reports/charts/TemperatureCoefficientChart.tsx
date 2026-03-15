// @ts-nocheck
"use client"

import {
  ComposedChart, Scatter, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from "recharts"

export interface TempDataPoint {
  temp: number
  value: number
}

export interface TemperatureCoefficientChartProps {
  iscData?: TempDataPoint[]
  vocData?: TempDataPoint[]
  pmaxData?: TempDataPoint[]
  alpha?: number  // %/°C for Isc
  beta?: number   // %/°C for Voc
  gamma?: number  // %/°C for Pmax
  height?: number
  title?: string
}

// Linear regression helper
function linearRegression(points: TempDataPoint[]): {
  slope: number
  intercept: number
  r2: number
  stdErr: number
} {
  const n = points.length
  if (n < 2) return { slope: 0, intercept: 0, r2: 0, stdErr: 0 }

  const sumX = points.reduce((s, p) => s + p.temp, 0)
  const sumY = points.reduce((s, p) => s + p.value, 0)
  const sumXY = points.reduce((s, p) => s + p.temp * p.value, 0)
  const sumX2 = points.reduce((s, p) => s + p.temp * p.temp, 0)
  const sumY2 = points.reduce((s, p) => s + p.value * p.value, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const ssRes = points.reduce((s, p) => s + (p.value - (slope * p.temp + intercept)) ** 2, 0)
  const ssTot = points.reduce((s, p) => s + (p.value - sumY / n) ** 2, 0)
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot

  const stdErr = n > 2 ? Math.sqrt(ssRes / (n - 2)) : 0

  return { slope, intercept, r2, stdErr }
}

// Default data for a typical 430W module
function generateDefaultIscData(): TempDataPoint[] {
  // Isc ~ 13.8A at STC, alpha ~ +0.04%/°C
  const isc25 = 13.8
  const alpha = 0.04 / 100 // per °C
  return [15, 25, 35, 45, 55].map((temp) => ({
    temp,
    value: parseFloat((isc25 * (1 + alpha * (temp - 25)) + (Math.random() - 0.5) * 0.02).toFixed(3)),
  }))
}

function generateDefaultVocData(): TempDataPoint[] {
  // Voc ~ 41.5V at STC, beta ~ -0.27%/°C
  const voc25 = 41.5
  const beta = -0.27 / 100 // per °C
  return [15, 25, 35, 45, 55].map((temp) => ({
    temp,
    value: parseFloat((voc25 * (1 + beta * (temp - 25)) + (Math.random() - 0.5) * 0.1).toFixed(2)),
  }))
}

function generateDefaultPmaxData(): TempDataPoint[] {
  // Pmax ~ 430W at STC, gamma ~ -0.34%/°C
  const pmax25 = 430
  const gamma = -0.34 / 100 // per °C
  return [15, 25, 35, 45, 55].map((temp) => ({
    temp,
    value: parseFloat((pmax25 * (1 + gamma * (temp - 25)) + (Math.random() - 0.5) * 1.5).toFixed(1)),
  }))
}

const DEFAULT_ISC = generateDefaultIscData()
const DEFAULT_VOC = generateDefaultVocData()
const DEFAULT_PMAX = generateDefaultPmaxData()

interface SubChartProps {
  data: TempDataPoint[]
  paramName: string
  unit: string
  coeffName: string
  coeffValue?: number
  color: string
  height: number
}

function SubChart({ data, paramName, unit, coeffName, coeffValue, color, height }: SubChartProps) {
  const reg = linearRegression(data)

  // Build regression line + uncertainty band data
  const temps = data.map((d) => d.temp)
  const minT = Math.min(...temps)
  const maxT = Math.max(...temps)
  const step = (maxT - minT) / 40

  const regressionData = Array.from({ length: 41 }, (_, i) => {
    const t = minT + i * step
    const predicted = reg.slope * t + reg.intercept
    return {
      temp: parseFloat(t.toFixed(1)),
      predicted: parseFloat(predicted.toFixed(4)),
      upper: parseFloat((predicted + 2 * reg.stdErr).toFixed(4)),
      lower: parseFloat((predicted - 2 * reg.stdErr).toFixed(4)),
    }
  })

  // Compute coefficient as %/°C relative to value at 25°C
  const valueAt25 = reg.slope * 25 + reg.intercept
  const coeffPctPerC = valueAt25 !== 0
    ? (reg.slope / valueAt25) * 100
    : 0
  const displayCoeff = coeffValue ?? coeffPctPerC

  const allValues = [
    ...data.map((d) => d.value),
    ...regressionData.map((d) => d.upper),
    ...regressionData.map((d) => d.lower),
  ]
  const yMin = Math.min(...allValues)
  const yMax = Math.max(...allValues)
  const yPadding = (yMax - yMin) * 0.15
  const domainMin = parseFloat((yMin - yPadding).toFixed(2))
  const domainMax = parseFloat((yMax + yPadding).toFixed(2))

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-gray-700">
          {paramName} vs Temperature
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white px-2 py-0.5 rounded border font-mono">
            {coeffName} = {displayCoeff >= 0 ? "+" : ""}{displayCoeff.toFixed(4)} %/°C
          </span>
          <span className="text-xs bg-white px-2 py-0.5 rounded border font-mono">
            R² = {reg.r2.toFixed(5)}
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="temp"
            type="number"
            domain={[minT - 2, maxT + 2]}
            tick={{ fontSize: 10 }}
            label={{
              value: "Temperature (°C)",
              position: "insideBottom",
              offset: -15,
              fontSize: 10,
            }}
          />
          <YAxis
            domain={[domainMin, domainMax]}
            tick={{ fontSize: 10 }}
            label={{
              value: `${paramName} (${unit})`,
              angle: -90,
              position: "insideLeft",
              fontSize: 10,
              offset: 5,
            }}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = {
                value: `${paramName} (measured)`,
                predicted: "Regression fit",
                upper: "+2\u03C3",
                lower: "-2\u03C3",
              }
              return [`${value.toFixed(3)} ${unit}`, labels[name] || name]
            }}
            labelFormatter={(v) => `Temperature: ${v} °C`}
          />

          {/* Uncertainty band */}
          <Area
            data={regressionData}
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill={color}
            fillOpacity={0.12}
            name=""
            legendType="none"
          />
          <Area
            data={regressionData}
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="#ffffff"
            fillOpacity={1}
            name=""
            legendType="none"
          />

          {/* Regression line */}
          <Line
            data={regressionData}
            type="monotone"
            dataKey="predicted"
            stroke={color}
            strokeWidth={2}
            dot={false}
            name="Regression"
          />

          {/* Reference at STC (25°C) */}
          <ReferenceLine
            x={25}
            stroke="#9ca3af"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{
              value: "STC",
              position: "top",
              fontSize: 9,
              fill: "#6b7280",
            }}
          />

          {/* Scatter points */}
          <Scatter
            data={data}
            dataKey="value"
            fill={color}
            stroke="#fff"
            strokeWidth={1.5}
            r={5}
            name={`${paramName} measured`}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TemperatureCoefficientChart({
  iscData,
  vocData,
  pmaxData,
  alpha,
  beta,
  gamma,
  height = 260,
  title = "Temperature Coefficient Analysis (IEC 60891)",
}: TemperatureCoefficientChartProps) {
  const isc = iscData ?? DEFAULT_ISC
  const voc = vocData ?? DEFAULT_VOC
  const pmax = pmaxData ?? DEFAULT_PMAX

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold text-sm mb-4">{title}</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SubChart
          data={isc}
          paramName="Isc"
          unit="A"
          coeffName="\u03B1"
          coeffValue={alpha}
          color="#2563eb"
          height={height}
        />
        <SubChart
          data={voc}
          paramName="Voc"
          unit="V"
          coeffName="\u03B2"
          coeffValue={beta}
          color="#dc2626"
          height={height}
        />
        <SubChart
          data={pmax}
          paramName="Pmax"
          unit="W"
          coeffName="\u03B3"
          coeffValue={gamma}
          color="#16a34a"
          height={height}
        />
      </div>

      {/* Coefficient summary */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-3 border-t text-xs text-center">
        {[
          {
            name: "\u03B1 (Isc)",
            value: alpha ?? ((linearRegression(isc).slope / (linearRegression(isc).slope * 25 + linearRegression(isc).intercept)) * 100),
            color: "blue",
            typical: "+0.03 to +0.06",
          },
          {
            name: "\u03B2 (Voc)",
            value: beta ?? ((linearRegression(voc).slope / (linearRegression(voc).slope * 25 + linearRegression(voc).intercept)) * 100),
            color: "red",
            typical: "-0.25 to -0.35",
          },
          {
            name: "\u03B3 (Pmax)",
            value: gamma ?? ((linearRegression(pmax).slope / (linearRegression(pmax).slope * 25 + linearRegression(pmax).intercept)) * 100),
            color: "green",
            typical: "-0.30 to -0.45",
          },
        ].map((coeff) => (
          <div
            key={coeff.name}
            className={`bg-${coeff.color === "blue" ? "blue" : coeff.color === "red" ? "red" : "green"}-50 rounded px-3 py-2`}
          >
            <div className="text-gray-500 mb-1">{coeff.name}</div>
            <div className={`font-bold text-${coeff.color === "blue" ? "blue" : coeff.color === "red" ? "red" : "green"}-800 text-base font-mono`}>
              {coeff.value >= 0 ? "+" : ""}{coeff.value.toFixed(4)} %/°C
            </div>
            <div className="text-gray-400 mt-0.5">Typical: {coeff.typical} %/°C</div>
          </div>
        ))}
      </div>
    </div>
  )
}
