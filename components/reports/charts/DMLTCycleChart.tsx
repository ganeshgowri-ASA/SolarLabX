// @ts-nocheck
"use client"

import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Area
} from "recharts"

export interface DMLTCycleChartProps {
  positivePressure?: number
  negativePressure?: number
  cyclesPerMin?: number
  showSMLT?: boolean
  designLoad?: number
  title?: string
  height?: number
}

interface DMLTDataPoint {
  time: number
  pressure: number
  deflection: number
  label?: string
}

function generateDMLTData(
  positivePressure: number,
  negativePressure: number,
  cyclesPerMin: number,
  showSMLT: boolean,
  designLoad: number,
): DMLTDataPoint[] {
  const data: DMLTDataPoint[] = []
  const cyclePeriod = 60 / cyclesPerMin // seconds per cycle
  const dynamicDuration = 30 // ~30 seconds of dynamic cycling
  const dt = 0.1 // time step in seconds

  // Dynamic mechanical load cycles (sinusoidal waveform)
  for (let t = 0; t <= dynamicDuration; t += dt) {
    const phase = (2 * Math.PI * t) / cyclePeriod
    // Asymmetric sinusoidal to represent ±pressure
    const sinVal = Math.sin(phase)
    const pressure = sinVal >= 0
      ? sinVal * positivePressure
      : sinVal * negativePressure
    // Deflection correlates with pressure but with slight lag and damping
    const deflectionPhase = phase - 0.15 // slight phase lag
    const deflectionSin = Math.sin(deflectionPhase)
    const deflection = deflectionSin >= 0
      ? deflectionSin * 3.2 // max ~3.2mm positive deflection
      : deflectionSin * 2.8 // max ~2.8mm negative deflection
    data.push({
      time: parseFloat(t.toFixed(1)),
      pressure: parseFloat(pressure.toFixed(0)),
      deflection: parseFloat(deflection.toFixed(2)),
    })
  }

  if (showSMLT) {
    const smltStart = dynamicDuration + 2
    // Ramp up to design load
    for (let t = smltStart; t < smltStart + 3; t += 0.2) {
      const frac = (t - smltStart) / 3
      data.push({
        time: parseFloat(t.toFixed(1)),
        pressure: parseFloat((frac * designLoad).toFixed(0)),
        deflection: parseFloat((frac * 4.5).toFixed(2)),
      })
    }
    // Static hold at design load for 3 hours compressed to ~6 seconds on chart
    const holdStart = smltStart + 3
    for (let t = holdStart; t <= holdStart + 6; t += 0.5) {
      data.push({
        time: parseFloat(t.toFixed(1)),
        pressure: designLoad,
        deflection: parseFloat((4.5 + Math.random() * 0.1).toFixed(2)),
        label: t === holdStart ? "Static Hold (1h)" : undefined,
      })
    }
    // No-load recovery
    const recoveryStart = holdStart + 6.5
    for (let t = recoveryStart; t <= recoveryStart + 4; t += 0.3) {
      const frac = (t - recoveryStart) / 4
      data.push({
        time: parseFloat(t.toFixed(1)),
        pressure: 0,
        deflection: parseFloat((4.5 * (1 - frac) * 0.15).toFixed(2)),
        label: t === recoveryStart ? "Recovery" : undefined,
      })
    }
  }

  return data
}

export function DMLTCycleChart({
  positivePressure = 5400,
  negativePressure = 5400,
  cyclesPerMin = 6,
  showSMLT = false,
  designLoad = 5400,
  title = "Dynamic Mechanical Load Test (DMLT) — Cycle Profile",
  height = 380,
}: DMLTCycleChartProps) {
  const data = generateDMLTData(positivePressure, negativePressure, cyclesPerMin, showSMLT, designLoad)

  const maxPressure = Math.max(positivePressure, negativePressure, showSMLT ? designLoad : 0)
  const pressureDomain = [-(negativePressure * 1.15), maxPressure * 1.15]

  return (
    <div className="bg-white rounded-lg border p-4 dmlt-cycle-chart">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{title}</h3>
        <div className="flex gap-3 text-xs">
          <span className="px-2 py-1 rounded bg-blue-50 text-blue-800 font-medium">
            +{positivePressure} Pa / -{negativePressure} Pa
          </span>
          <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 font-medium">
            {cyclesPerMin} cycles/min
          </span>
          {showSMLT && (
            <span className="px-2 py-1 rounded bg-amber-50 text-amber-800 font-medium">
              SMLT: {designLoad} Pa
            </span>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 10, right: 50, left: 10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10 }}
            label={{ value: "Time (s)", position: "insideBottom", offset: -15, fontSize: 11 }}
            type="number"
            domain={["dataMin", "dataMax"]}
          />
          <YAxis
            yAxisId="pressure"
            domain={pressureDomain}
            tick={{ fontSize: 10 }}
            label={{ value: "Pressure (Pa)", angle: -90, position: "insideLeft", fontSize: 11, offset: 5 }}
          />
          <YAxis
            yAxisId="deflection"
            orientation="right"
            domain={[-6, 6]}
            tick={{ fontSize: 10 }}
            label={{ value: "Deflection (mm)", angle: 90, position: "insideRight", fontSize: 11, offset: 5 }}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === "Pressure") return [`${value} Pa`, name]
              return [`${value} mm`, name]
            }}
            labelFormatter={(v) => `Time: ${v} s`}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />

          {/* Positive pressure limit */}
          <ReferenceLine
            yAxisId="pressure"
            y={positivePressure}
            stroke="#3b82f6"
            strokeDasharray="6 3"
            strokeWidth={1.5}
            label={{ value: `+${positivePressure} Pa`, fill: "#3b82f6", fontSize: 9, position: "right" }}
          />
          {/* Negative pressure limit */}
          <ReferenceLine
            yAxisId="pressure"
            y={-negativePressure}
            stroke="#3b82f6"
            strokeDasharray="6 3"
            strokeWidth={1.5}
            label={{ value: `-${negativePressure} Pa`, fill: "#3b82f6", fontSize: 9, position: "right" }}
          />
          {/* Zero line */}
          <ReferenceLine yAxisId="pressure" y={0} stroke="#94a3b8" strokeWidth={1} />

          {/* Pressure waveform */}
          <Line
            yAxisId="pressure"
            type="monotone"
            dataKey="pressure"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            name="Pressure"
          />
          {/* Deflection overlay */}
          <Line
            yAxisId="deflection"
            type="monotone"
            dataKey="deflection"
            stroke="#16a34a"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            dot={false}
            name="Deflection"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Test parameters summary */}
      <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t text-xs">
        {[
          ["Positive Load", `${positivePressure} Pa`],
          ["Negative Load", `${negativePressure} Pa`],
          ["Cycle Rate", `${cyclesPerMin} cycles/min`],
          ["Total Cycles", showSMLT ? "1000 + SMLT" : "1000"],
        ].map(([label, value]) => (
          <div key={label} className="text-center bg-blue-50 rounded px-2 py-1.5">
            <div className="text-gray-500">{label}</div>
            <div className="font-semibold text-blue-800">{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Default Demo Data ───────────────────────────────────────────────────────

export const DEFAULT_DMLT_PROPS: DMLTCycleChartProps = {
  positivePressure: 5400,
  negativePressure: 5400,
  cyclesPerMin: 6,
  showSMLT: false,
  designLoad: 5400,
}

export const DEFAULT_DMLT_WITH_SMLT_PROPS: DMLTCycleChartProps = {
  positivePressure: 5400,
  negativePressure: 5400,
  cyclesPerMin: 6,
  showSMLT: true,
  designLoad: 5400,
}
