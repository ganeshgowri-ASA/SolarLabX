// @ts-nocheck
"use client"

import {
  ComposedChart, Line, Bar, BarChart, LineChart, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell
} from "recharts"

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface InsulationWetLeakageSample {
  id: string
  preRiso: number    // MΩ·m²
  postRiso: number   // MΩ·m²
  preIL: number      // µA (wet leakage current)
  postIL: number     // µA
  groundContinuity: number  // Ω
}

export interface InsulationWetLeakageChartProps {
  samples?: InsulationWetLeakageSample[]
  risoLimit?: number       // MΩ·m² (default 40)
  leakageLimit?: number    // µA (default 50)
  gcLimit?: number         // Ω (default 0.1)
  title?: string
  height?: number
}

// ─── Default Demo Data ──────────────────────────────────────────────────────────

export const DEFAULT_SAMPLES: InsulationWetLeakageSample[] = [
  { id: "SLX-M301", preRiso: 6500, postRiso: 5200, preIL: 12.5, postIL: 18.2, groundContinuity: 0.042 },
  { id: "SLX-M302", preRiso: 6480, postRiso: 5280, preIL: 11.8, postIL: 16.9, groundContinuity: 0.038 },
  { id: "SLX-M303", preRiso: 6450, postRiso: 5150, preIL: 13.1, postIL: 19.5, groundContinuity: 0.051 },
]

// ─── Helper ─────────────────────────────────────────────────────────────────────

function getBarColor(value: number, limit: number, isAbovePass: boolean): string {
  if (isAbovePass) {
    return value >= limit ? "#22c55e" : "#ef4444"
  }
  return value <= limit ? "#22c55e" : "#ef4444"
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function InsulationWetLeakageChart({
  samples,
  risoLimit = 40,
  leakageLimit = 50,
  gcLimit = 0.1,
  title = "Insulation Resistance, Wet Leakage & Ground Continuity",
  height = 280,
}: InsulationWetLeakageChartProps) {
  const data = samples ?? DEFAULT_SAMPLES

  // ── 1. Insulation Resistance data ──
  const risoData = data.map((s) => ({
    id: s.id,
    "Pre-test": s.preRiso,
    "Post-test": s.postRiso,
  }))

  // ── 2. Wet Leakage Current data ──
  const leakageData = data.map((s) => ({
    id: s.id,
    "Pre-test": s.preIL,
    "Post-test": s.postIL,
  }))

  // ── 3. Ground Continuity data ──
  const gcData = data.map((s) => ({
    id: s.id,
    "Ground Continuity": s.groundContinuity,
  }))

  const maxRiso = Math.max(...data.flatMap((s) => [s.preRiso, s.postRiso]))
  const maxLeakage = Math.max(...data.flatMap((s) => [s.preIL, s.postIL]))
  const maxGC = Math.max(...data.map((s) => s.groundContinuity))

  return (
    <div className="bg-white rounded-lg border p-4 insulation-wet-leakage-chart">
      <h3 className="font-semibold text-sm mb-4">{title}</h3>

      {/* Sub-chart 1: Insulation Resistance */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">1. Insulation Resistance (RISO) — Pass limit: ≥ {risoLimit} MΩ·m²</h4>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={risoData} margin={{ top: 10, right: 30, left: 10, bottom: 15 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="id" tick={{ fontSize: 10 }} />
            <YAxis
              domain={[0, Math.ceil(maxRiso * 1.1)]}
              tick={{ fontSize: 10 }}
              label={{ value: "RISO (MΩ·m²)", angle: -90, position: "insideLeft", fontSize: 11 }}
            />
            <Tooltip formatter={(value: number) => [`${value.toFixed(0)} MΩ·m²`]} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
            <ReferenceLine
              y={risoLimit}
              stroke="#ef4444"
              strokeDasharray="8 4"
              strokeWidth={2}
              label={{ value: `Pass: ${risoLimit} MΩ·m²`, fill: "#ef4444", fontSize: 10, position: "right" }}
            />
            <Bar dataKey="Pre-test" radius={[3, 3, 0, 0]}>
              {risoData.map((entry, i) => (
                <Cell key={`pre-riso-${i}`} fill={getBarColor(entry["Pre-test"], risoLimit, true)} opacity={0.8} />
              ))}
            </Bar>
            <Bar dataKey="Post-test" radius={[3, 3, 0, 0]}>
              {risoData.map((entry, i) => (
                <Cell key={`post-riso-${i}`} fill={getBarColor(entry["Post-test"], risoLimit, true)} opacity={0.6} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sub-chart 2: Wet Leakage Current */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">2. Wet Leakage Current (IL) — Pass limit: ≤ {leakageLimit} µA</h4>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={leakageData} margin={{ top: 10, right: 30, left: 10, bottom: 15 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="id" tick={{ fontSize: 10 }} />
            <YAxis
              domain={[0, Math.max(Math.ceil(maxLeakage * 1.3), leakageLimit * 1.2)]}
              tick={{ fontSize: 10 }}
              label={{ value: "Leakage Current (µA)", angle: -90, position: "insideLeft", fontSize: 11 }}
            />
            <Tooltip formatter={(value: number) => [`${value.toFixed(1)} µA`]} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
            <ReferenceLine
              y={leakageLimit}
              stroke="#ef4444"
              strokeDasharray="8 4"
              strokeWidth={2}
              label={{ value: `Limit: ${leakageLimit} µA`, fill: "#ef4444", fontSize: 10, position: "right" }}
            />
            <Bar dataKey="Pre-test" radius={[3, 3, 0, 0]}>
              {leakageData.map((entry, i) => (
                <Cell key={`pre-il-${i}`} fill={getBarColor(entry["Pre-test"], leakageLimit, false)} opacity={0.8} />
              ))}
            </Bar>
            <Bar dataKey="Post-test" radius={[3, 3, 0, 0]}>
              {leakageData.map((entry, i) => (
                <Cell key={`post-il-${i}`} fill={getBarColor(entry["Post-test"], leakageLimit, false)} opacity={0.6} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sub-chart 3: Ground Continuity */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">3. Ground Continuity — Pass limit: ≤ {gcLimit} Ω</h4>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={gcData} margin={{ top: 10, right: 30, left: 10, bottom: 15 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="id" tick={{ fontSize: 10 }} />
            <YAxis
              domain={[0, Math.max(maxGC * 1.5, gcLimit * 2)]}
              tick={{ fontSize: 10 }}
              label={{ value: "Resistance (Ω)", angle: -90, position: "insideLeft", fontSize: 11 }}
            />
            <Tooltip formatter={(value: number) => [`${value.toFixed(4)} Ω`]} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
            <ReferenceLine
              y={gcLimit}
              stroke="#ef4444"
              strokeDasharray="8 4"
              strokeWidth={2}
              label={{ value: `Limit: ${gcLimit} Ω`, fill: "#ef4444", fontSize: 10, position: "right" }}
            />
            <Bar dataKey="Ground Continuity" radius={[3, 3, 0, 0]}>
              {gcData.map((entry, i) => (
                <Cell key={`gc-${i}`} fill={getBarColor(entry["Ground Continuity"], gcLimit, false)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary table */}
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border px-2 py-1.5 text-left font-semibold">Sample</th>
              <th className="border px-2 py-1.5 text-center font-semibold">Pre RISO (MΩ·m²)</th>
              <th className="border px-2 py-1.5 text-center font-semibold">Post RISO (MΩ·m²)</th>
              <th className="border px-2 py-1.5 text-center font-semibold">Pre IL (µA)</th>
              <th className="border px-2 py-1.5 text-center font-semibold">Post IL (µA)</th>
              <th className="border px-2 py-1.5 text-center font-semibold">GC (Ω)</th>
              <th className="border px-2 py-1.5 text-center font-semibold">Verdict</th>
            </tr>
          </thead>
          <tbody>
            {data.map((sample) => {
              const risoPass = sample.preRiso >= risoLimit && sample.postRiso >= risoLimit
              const ilPass = sample.preIL <= leakageLimit && sample.postIL <= leakageLimit
              const gcPass = sample.groundContinuity <= gcLimit
              const allPass = risoPass && ilPass && gcPass
              return (
                <tr key={sample.id} className="hover:bg-gray-50">
                  <td className="border px-2 py-1 font-medium">{sample.id}</td>
                  <td className={`border px-2 py-1 text-center ${sample.preRiso >= risoLimit ? "" : "text-red-600 font-semibold"}`}>
                    {sample.preRiso.toFixed(0)}
                  </td>
                  <td className={`border px-2 py-1 text-center ${sample.postRiso >= risoLimit ? "" : "text-red-600 font-semibold"}`}>
                    {sample.postRiso.toFixed(0)}
                  </td>
                  <td className={`border px-2 py-1 text-center ${sample.preIL <= leakageLimit ? "" : "text-red-600 font-semibold"}`}>
                    {sample.preIL.toFixed(1)}
                  </td>
                  <td className={`border px-2 py-1 text-center ${sample.postIL <= leakageLimit ? "" : "text-red-600 font-semibold"}`}>
                    {sample.postIL.toFixed(1)}
                  </td>
                  <td className={`border px-2 py-1 text-center ${sample.groundContinuity <= gcLimit ? "" : "text-red-600 font-semibold"}`}>
                    {sample.groundContinuity.toFixed(4)}
                  </td>
                  <td className={`border px-2 py-1 text-center font-semibold ${allPass ? "text-green-600" : "text-red-600"}`}>
                    {allPass ? "PASS" : "FAIL"}
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
