// @ts-nocheck
"use client"

import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ReferenceArea
} from "recharts"

export interface HumidityFreezeChartProps {
  cycles?: number
  tempMin?: number
  tempMax?: number
  humidity?: number
  title?: string
  height?: number
}

interface HFDataPoint {
  time: number
  temperature: number
  humidity: number
  phase: string
}

function generateHFCycleData(
  cyclesToShow: number,
  tempMin: number,
  tempMax: number,
  humidity: number,
): HFDataPoint[] {
  const data: HFDataPoint[] = []

  // IEC 61215 HF10 cycle profile (per cycle ~24h, we show representative 3 cycles)
  // Phases per cycle:
  //   1. Ramp from 25°C to 85°C (1h) — humidity ramp up
  //   2. Dwell at 85°C/85%RH (20h compressed to show shape)
  //   3. Ramp from 85°C to -40°C (3h) — humidity drops
  //   4. Dwell at -40°C (4h) — humidity near 0
  //   5. Ramp from -40°C to 25°C (2h) — recovery

  const cycleHours = 24
  const dt = 0.25 // time step in hours

  for (let c = 0; c < cyclesToShow; c++) {
    const baseTime = c * cycleHours

    // Phase 1: Ramp up 25°C → 85°C (0-1h), humidity ramps 40→85
    for (let t = 0; t < 1; t += dt) {
      const frac = t / 1
      const temp = 25 + frac * (tempMax - 25)
      const rh = 40 + frac * (humidity - 40)
      data.push({
        time: parseFloat((baseTime + t).toFixed(2)),
        temperature: parseFloat(temp.toFixed(1)),
        humidity: parseFloat(rh.toFixed(1)),
        phase: "Ramp Up",
      })
    }

    // Phase 2: Dwell at 85°C / 85%RH (1-11h, compressed from 20h)
    for (let t = 1; t < 11; t += dt) {
      const noise = (Math.random() - 0.5) * 0.4
      data.push({
        time: parseFloat((baseTime + t).toFixed(2)),
        temperature: parseFloat((tempMax + noise).toFixed(1)),
        humidity: parseFloat((humidity + (Math.random() - 0.5) * 0.8).toFixed(1)),
        phase: "Hot Dwell",
      })
    }

    // Phase 3: Ramp down 85°C → -40°C (11-16h), humidity drops rapidly below 0°C dew point
    for (let t = 11; t < 16; t += dt) {
      const frac = (t - 11) / 5
      const temp = tempMax - frac * (tempMax - tempMin)
      // Humidity drops as temp goes below dew point
      let rh = humidity
      if (temp < 20) {
        rh = Math.max(2, humidity * Math.exp(-0.08 * (20 - temp)))
      }
      data.push({
        time: parseFloat((baseTime + t).toFixed(2)),
        temperature: parseFloat(temp.toFixed(1)),
        humidity: parseFloat(rh.toFixed(1)),
        phase: "Ramp Down",
      })
    }

    // Phase 4: Dwell at -40°C (16-20h), humidity near 0
    for (let t = 16; t < 20; t += dt) {
      const noise = (Math.random() - 0.5) * 0.3
      data.push({
        time: parseFloat((baseTime + t).toFixed(2)),
        temperature: parseFloat((tempMin + noise).toFixed(1)),
        humidity: parseFloat((2 + Math.random() * 1.5).toFixed(1)),
        phase: "Cold Dwell",
      })
    }

    // Phase 5: Ramp back to 25°C (20-24h), humidity recovers partially
    for (let t = 20; t < 24; t += dt) {
      const frac = (t - 20) / 4
      const temp = tempMin + frac * (25 - tempMin)
      let rh = 3
      if (temp > 0) {
        rh = 3 + (temp / 25) * 37
      }
      data.push({
        time: parseFloat((baseTime + t).toFixed(2)),
        temperature: parseFloat(temp.toFixed(1)),
        humidity: parseFloat(rh.toFixed(1)),
        phase: "Recovery",
      })
    }
  }

  // Final room temperature point
  const finalTime = cyclesToShow * cycleHours
  data.push({
    time: finalTime,
    temperature: 25,
    humidity: 40,
    phase: "Complete",
  })

  return data
}

export function HumidityFreezeChart({
  cycles = 10,
  tempMin = -40,
  tempMax = 85,
  humidity = 85,
  title = "Humidity Freeze (HF10) — IEC 61215 Cycle Profile",
  height = 400,
}: HumidityFreezeChartProps) {
  // Show 3 representative cycles for clarity
  const cyclesToShow = Math.min(cycles, 3)
  const data = generateHFCycleData(cyclesToShow, tempMin, tempMax, humidity)

  const totalHours = cyclesToShow * 24

  return (
    <div className="bg-white rounded-lg border p-4 humidity-freeze-chart">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{title}</h3>
        <div className="flex gap-3 text-xs">
          <span className="px-2 py-1 rounded bg-red-50 text-red-800 font-medium">
            {tempMax}°C / {humidity}%RH
          </span>
          <span className="px-2 py-1 rounded bg-blue-50 text-blue-800 font-medium">
            {tempMin}°C
          </span>
          <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 font-medium">
            {cycles} cycles ({cyclesToShow} shown)
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 10, right: 50, left: 10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

          {/* Cycle background shading */}
          {Array.from({ length: cyclesToShow }, (_, i) => (
            <ReferenceArea
              key={`cycle-${i}`}
              x1={i * 24}
              x2={(i + 1) * 24}
              yAxisId="temp"
              fill={i % 2 === 0 ? "#f8fafc" : "#f1f5f9"}
              fillOpacity={0.7}
              strokeOpacity={0}
            />
          ))}

          <XAxis
            dataKey="time"
            tick={{ fontSize: 10 }}
            label={{ value: "Time (hours)", position: "insideBottom", offset: -15, fontSize: 11 }}
            type="number"
            domain={[0, totalHours]}
            tickCount={totalHours / 4 + 1}
            tickFormatter={(v) => `${v}`}
          />
          <YAxis
            yAxisId="temp"
            domain={[tempMin - 10, tempMax + 10]}
            tick={{ fontSize: 10 }}
            label={{ value: "Temperature (°C)", angle: -90, position: "insideLeft", fontSize: 11, offset: 5 }}
          />
          <YAxis
            yAxisId="humidity"
            orientation="right"
            domain={[0, 100]}
            tick={{ fontSize: 10 }}
            label={{ value: "Humidity (%RH)", angle: 90, position: "insideRight", fontSize: 11, offset: 5 }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const point = payload[0]?.payload
              return (
                <div className="bg-white border rounded-lg shadow-sm p-2.5 text-xs">
                  <div className="font-semibold mb-1">Time: {parseFloat(label).toFixed(1)} h</div>
                  <div className="text-gray-500 mb-1.5">Phase: {point?.phase}</div>
                  {payload.map((p, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      <span>
                        {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
                        {p.name === "Temperature" ? " °C" : " %RH"}
                      </span>
                    </div>
                  ))}
                </div>
              )
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />

          {/* Temperature limits */}
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
          <ReferenceLine
            yAxisId="temp"
            y={0}
            stroke="#94a3b8"
            strokeDasharray="3 3"
            strokeWidth={0.8}
          />

          {/* Humidity reference */}
          <ReferenceLine
            yAxisId="humidity"
            y={humidity}
            stroke="#16a34a"
            strokeDasharray="6 3"
            strokeWidth={1}
            label={{ value: `${humidity}%RH`, fill: "#16a34a", fontSize: 9, position: "left" }}
          />

          {/* Temperature line — color gradient effect via two segments */}
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="temperature"
            stroke="#dc2626"
            strokeWidth={2}
            dot={false}
            name="Temperature"
          />

          {/* Humidity line */}
          <Line
            yAxisId="humidity"
            type="monotone"
            dataKey="humidity"
            stroke="#16a34a"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            dot={false}
            name="Humidity"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Cycle annotations */}
      <div className="flex gap-2 mt-3 pt-3 border-t">
        <div className="grid grid-cols-5 gap-2 flex-1 text-xs">
          {[
            ["Test Standard", "IEC 61215 Cl. 10.12"],
            ["Total Cycles", `${cycles}`],
            ["Hot Dwell", `${tempMax}°C / ${humidity}%RH / 20h`],
            ["Cold Dwell", `${tempMin}°C / ~0%RH / 4h`],
            ["Cycle Duration", "~24h per cycle"],
          ].map(([label, value]) => (
            <div key={label} className="text-center bg-gray-50 rounded px-2 py-1.5">
              <div className="text-gray-500">{label}</div>
              <div className="font-semibold text-gray-800">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Default Demo Data ───────────────────────────────────────────────────────

export const DEFAULT_HF_PROPS: HumidityFreezeChartProps = {
  cycles: 10,
  tempMin: -40,
  tempMax: 85,
  humidity: 85,
}
