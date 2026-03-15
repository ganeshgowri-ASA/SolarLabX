// @ts-nocheck
"use client"

import {
  ComposedChart, Line, Bar, BarChart, LineChart, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell
} from "recharts"

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface ChamberCycleChartProps {
  cycleCount?: number
  tempMin?: number
  tempMax?: number
  rampRate?: number
  dwellTime?: number
  showPIDOverlay?: boolean
  pidVoltage?: number
  title?: string
  height?: number
}

interface CycleDataPoint {
  time: number
  chamberTemp: number
  moduleTemp: number
  pidVoltage?: number
  label?: string
}

// ─── Data Generation ────────────────────────────────────────────────────────────

function generateCycleData(
  cycleCount: number,
  tempMin: number,
  tempMax: number,
  rampRate: number,
  dwellTime: number,
  showPID: boolean,
  pidVoltage: number
): CycleDataPoint[] {
  const data: CycleDataPoint[] = []
  const tempRange = tempMax - tempMin
  // rampRate in °C/min, ramp time = range / rampRate in minutes
  const rampTime = tempRange / rampRate
  // Full cycle: ramp up + dwell + ramp down + dwell (in minutes)
  const cycleDuration = 2 * rampTime + 2 * dwellTime
  const totalCycles = Math.min(cycleCount, 5) // show at most 5 representative cycles
  const timeStep = 1 // 1-minute resolution

  let prevModuleTemp = tempMin
  const moduleLag = 0.85 // module lags behind chamber by this factor per step

  for (let cycle = 0; cycle < totalCycles; cycle++) {
    const cycleStart = cycle * cycleDuration

    for (let t = 0; t <= cycleDuration; t += timeStep) {
      const absoluteTime = cycleStart + t
      let chamberTemp: number
      let label: string | undefined

      if (t <= rampTime) {
        // Ramp up
        chamberTemp = tempMin + (tempRange * t) / rampTime
        if (t === 0) label = `C${cycle + 1} Start`
      } else if (t <= rampTime + dwellTime) {
        // Dwell at max
        chamberTemp = tempMax
        if (t === Math.round(rampTime + 1)) label = `Dwell ${tempMax}°C`
      } else if (t <= 2 * rampTime + dwellTime) {
        // Ramp down
        const rampDownProgress = (t - rampTime - dwellTime) / rampTime
        chamberTemp = tempMax - tempRange * rampDownProgress
      } else {
        // Dwell at min
        chamberTemp = tempMin
        if (t === Math.round(2 * rampTime + dwellTime + 1)) label = `Dwell ${tempMin}°C`
      }

      // Module temp lags behind chamber temp
      prevModuleTemp = prevModuleTemp + moduleLag * (chamberTemp - prevModuleTemp) * (timeStep / (rampTime * 0.5))
      const moduleTemp = Math.max(tempMin - 2, Math.min(tempMax + 2, prevModuleTemp))

      const point: CycleDataPoint = {
        time: Math.round(absoluteTime * 10) / 10,
        chamberTemp: Math.round(chamberTemp * 10) / 10,
        moduleTemp: Math.round(moduleTemp * 10) / 10,
      }

      if (showPID) {
        // PID voltage alternates polarity each cycle
        const polarity = cycle % 2 === 0 ? 1 : -1
        point.pidVoltage = polarity * pidVoltage
      }

      if (label) point.label = label
      data.push(point)
    }
  }

  return data
}

// ─── Default Demo Data ──────────────────────────────────────────────────────────

export const DEFAULT_CYCLE_COUNT = 200
export const DEFAULT_TEMP_MIN = -40
export const DEFAULT_TEMP_MAX = 85
export const DEFAULT_RAMP_RATE = 100
export const DEFAULT_DWELL_TIME = 10

// ─── Component ──────────────────────────────────────────────────────────────────

export function ChamberCycleChart({
  cycleCount = DEFAULT_CYCLE_COUNT,
  tempMin = DEFAULT_TEMP_MIN,
  tempMax = DEFAULT_TEMP_MAX,
  rampRate = DEFAULT_RAMP_RATE,
  dwellTime = DEFAULT_DWELL_TIME,
  showPIDOverlay = false,
  pidVoltage = 1500,
  title = "Thermal Cycling Temperature Profile",
  height = 400,
}: ChamberCycleChartProps) {
  const data = generateCycleData(cycleCount, tempMin, tempMax, rampRate, dwellTime, showPIDOverlay, pidVoltage)

  const tempRange = tempMax - tempMin
  const rampTime = tempRange / rampRate
  const cycleDuration = 2 * rampTime + 2 * dwellTime
  const displayedCycles = Math.min(cycleCount, 5)

  return (
    <div className="bg-white rounded-lg border p-4 chamber-cycle-chart">
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className="text-xs text-gray-500 mb-3">
        Showing {displayedCycles} representative cycles of {cycleCount} total
        &nbsp;|&nbsp; Ramp rate: {rampRate} °C/min &nbsp;|&nbsp; Dwell: {dwellTime} min
        &nbsp;|&nbsp; Range: {tempMin}°C to {tempMax}°C
      </p>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 10, right: showPIDOverlay ? 60 : 30, left: 10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="time"
            type="number"
            tick={{ fontSize: 10 }}
            label={{ value: "Time (min)", position: "insideBottom", offset: -15, fontSize: 11 }}
          />
          <YAxis
            yAxisId="temp"
            domain={[tempMin - 10, tempMax + 10]}
            tick={{ fontSize: 10 }}
            label={{ value: "Temperature (°C)", angle: -90, position: "insideLeft", fontSize: 11 }}
          />
          {showPIDOverlay && (
            <YAxis
              yAxisId="voltage"
              orientation="right"
              domain={[-pidVoltage * 1.2, pidVoltage * 1.2]}
              tick={{ fontSize: 10 }}
              label={{ value: "PID Voltage (V)", angle: 90, position: "insideRight", fontSize: 11 }}
            />
          )}
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name.includes("Voltage")) return [`${value} V`, name]
              return [`${value.toFixed(1)} °C`, name]
            }}
            labelFormatter={(v: number) => `Time: ${v.toFixed(0)} min`}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />

          {/* Temperature reference lines */}
          <ReferenceLine
            yAxisId="temp"
            y={tempMax}
            stroke="#ef4444"
            strokeDasharray="6 3"
            strokeWidth={1}
            label={{ value: `${tempMax}°C`, fill: "#ef4444", fontSize: 9, position: "right" }}
          />
          <ReferenceLine
            yAxisId="temp"
            y={tempMin}
            stroke="#3b82f6"
            strokeDasharray="6 3"
            strokeWidth={1}
            label={{ value: `${tempMin}°C`, fill: "#3b82f6", fontSize: 9, position: "right" }}
          />

          {/* Dwell time annotations as reference lines at cycle boundaries */}
          {Array.from({ length: displayedCycles }).map((_, i) => (
            <ReferenceLine
              key={`cycle-${i}`}
              yAxisId="temp"
              x={i * cycleDuration}
              stroke="#94a3b8"
              strokeDasharray="2 4"
              strokeWidth={1}
              label={i === 0 ? undefined : { value: `C${i + 1}`, fill: "#94a3b8", fontSize: 8, position: "top" }}
            />
          ))}

          {/* Chamber temperature */}
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="chamberTemp"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            name="Chamber Temp"
          />

          {/* Module temperature (lagging) */}
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="moduleTemp"
            stroke="#f97316"
            strokeWidth={2}
            dot={false}
            name="Module Temp"
          />

          {/* PID voltage overlay */}
          {showPIDOverlay && (
            <Line
              yAxisId="voltage"
              type="stepAfter"
              dataKey="pidVoltage"
              stroke="#7c3aed"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={false}
              name="PID Voltage"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Cycle parameters summary */}
      <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
        {[
          { label: "Total Cycles", value: `${cycleCount}` },
          { label: "Temp Range", value: `${tempMin}°C to ${tempMax}°C` },
          { label: "Ramp Rate", value: `${rampRate} °C/min` },
          { label: "Dwell Time", value: `${dwellTime} min` },
          { label: "Cycle Duration", value: `${cycleDuration.toFixed(1)} min` },
        ].map((item) => (
          <div key={item.label} className="bg-gray-50 rounded px-2 py-1.5 text-center">
            <div className="text-gray-500">{item.label}</div>
            <div className="font-semibold">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
