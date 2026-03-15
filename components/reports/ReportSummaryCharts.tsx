// @ts-nocheck
"use client"

import {
  ComposedChart, Line, Bar, BarChart, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell
} from "recharts"

// ─── 1. Pmax Stabilization Graph ─────────────────────────────────────────────

export interface StabilizationDataPoint {
  stage: string
  [sampleId: string]: number | string
}

export interface PmaxStabilizationChartProps {
  data: StabilizationDataPoint[]
  sampleIds: string[]
  ratedPmax: number
  title?: string
  height?: number
}

const SAMPLE_COLORS = ["#2563eb", "#dc2626", "#059669", "#d97706", "#7c3aed", "#0891b2"]

export function PmaxStabilizationChart({
  data,
  sampleIds,
  ratedPmax,
  title = "Pmax Stabilization Through Test Sequence",
  height = 300,
}: PmaxStabilizationChartProps) {
  const limitValue = ratedPmax * 0.95

  return (
    <div className="bg-white rounded-lg border p-4 pmax-stabilization-chart">
      <h3 className="font-semibold text-sm mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="stage"
            tick={{ fontSize: 9 }}
            label={{ value: "Test Stage", position: "insideBottom", offset: -15, fontSize: 11 }}
          />
          <YAxis
            domain={[(dataMin: number) => Math.floor(dataMin * 0.97), (dataMax: number) => Math.ceil(dataMax * 1.01)]}
            tick={{ fontSize: 10 }}
            label={{ value: "Pmax (W)", angle: -90, position: "insideLeft", fontSize: 11 }}
          />
          <Tooltip formatter={(value: number) => [`${value.toFixed(1)} W`]} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <ReferenceLine
            y={limitValue}
            stroke="#ef4444"
            strokeDasharray="8 4"
            strokeWidth={2}
            label={{ value: `-5% limit (${limitValue.toFixed(0)} W)`, fill: "#ef4444", fontSize: 10, position: "right" }}
          />
          {sampleIds.map((id, idx) => (
            <Line
              key={id}
              type="monotone"
              dataKey={id}
              stroke={SAMPLE_COLORS[idx % SAMPLE_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4, fill: SAMPLE_COLORS[idx % SAMPLE_COLORS.length] }}
              name={id}
              connectNulls
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── 2. Insulation Resistance Summary ────────────────────────────────────────

export interface InsulationDataPoint {
  stage: string
  [sampleId: string]: number | string
}

export interface InsulationResistanceChartProps {
  data: InsulationDataPoint[]
  sampleIds: string[]
  threshold?: number
  title?: string
  height?: number
}

export function InsulationResistanceChart({
  data,
  sampleIds,
  threshold = 40,
  title = "Insulation Resistance Summary (RISO)",
  height = 300,
}: InsulationResistanceChartProps) {
  return (
    <div className="bg-white rounded-lg border p-4 insulation-chart">
      <h3 className="font-semibold text-sm mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="stage"
            tick={{ fontSize: 9 }}
            label={{ value: "Test Stage", position: "insideBottom", offset: -15, fontSize: 11 }}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            label={{ value: "RISO (MΩ·m²)", angle: -90, position: "insideLeft", fontSize: 11 }}
          />
          <Tooltip formatter={(value: number) => [`${value.toFixed(1)} MΩ·m²`]} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <ReferenceLine
            y={threshold}
            stroke="#ef4444"
            strokeDasharray="8 4"
            strokeWidth={2}
            label={{ value: `Pass threshold (${threshold} MΩ·m²)`, fill: "#ef4444", fontSize: 10, position: "right" }}
          />
          {sampleIds.map((id, idx) => (
            <Bar
              key={id}
              dataKey={id}
              fill={SAMPLE_COLORS[idx % SAMPLE_COLORS.length]}
              name={id}
              radius={[3, 3, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── 3. Power Degradation Summary ────────────────────────────────────────────

export interface DegradationDataPoint {
  sequence: string
  [sampleId: string]: number | string
}

export interface PowerDegradationChartProps {
  data: DegradationDataPoint[]
  sampleIds: string[]
  limit?: number
  title?: string
  height?: number
}

export function PowerDegradationChart({
  data,
  sampleIds,
  limit = 5,
  title = "Power Degradation Summary by Test Sequence",
  height = 300,
}: PowerDegradationChartProps) {
  return (
    <div className="bg-white rounded-lg border p-4 degradation-chart">
      <h3 className="font-semibold text-sm mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="sequence"
            tick={{ fontSize: 9 }}
            label={{ value: "Test Sequence", position: "insideBottom", offset: -15, fontSize: 11 }}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            label={{ value: "Degradation (%)", angle: -90, position: "insideLeft", fontSize: 11 }}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              const pass = Math.abs(value) < limit
              return [
                `${value.toFixed(2)}% ${pass ? "(PASS)" : "(FAIL)"}`,
                name,
              ]
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <ReferenceLine
            y={limit}
            stroke="#ef4444"
            strokeDasharray="8 4"
            strokeWidth={2}
            label={{ value: `${limit}% limit`, fill: "#ef4444", fontSize: 10, position: "right" }}
          />
          {sampleIds.map((id, idx) => (
            <Bar
              key={id}
              dataKey={id}
              name={id}
              radius={[3, 3, 0, 0]}
            >
              {data.map((entry, i) => {
                const val = typeof entry[id] === "number" ? entry[id] : 0
                return (
                  <Cell
                    key={`cell-${i}`}
                    fill={Math.abs(val) < limit ? SAMPLE_COLORS[idx % SAMPLE_COLORS.length] : "#ef4444"}
                  />
                )
              })}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Default Demo Data ───────────────────────────────────────────────────────

export const DEFAULT_STABILIZATION_DATA: StabilizationDataPoint[] = [
  { stage: "Initial", "SLX-M301": 432.1, "SLX-M302": 431.8, "SLX-M303": 431.9 },
  { stage: "Light Soak", "SLX-M301": 431.5, "SLX-M302": 431.2, "SLX-M303": 431.4 },
  { stage: "TC50", "SLX-M301": 431.2, "SLX-M302": 431.0, "SLX-M303": 431.1 },
  { stage: "TC100", "SLX-M301": 431.0, "SLX-M302": 430.8, "SLX-M303": 430.9 },
  { stage: "TC200", "SLX-M301": 430.4, "SLX-M302": 430.2, "SLX-M303": 430.1 },
  { stage: "Final", "SLX-M301": 430.2, "SLX-M302": 430.0, "SLX-M303": 429.8 },
]

export const DEFAULT_INSULATION_DATA: InsulationDataPoint[] = [
  { stage: "Initial", "SLX-M301": 6500, "SLX-M302": 6480, "SLX-M303": 6450 },
  { stage: "Post-TC200", "SLX-M301": 6180, "SLX-M302": 6210, "SLX-M303": 6150 },
  { stage: "Post-HF10", "SLX-M301": 5950, "SLX-M302": 5980, "SLX-M303": 5920 },
  { stage: "Post-DH1000", "SLX-M301": 5200, "SLX-M302": 5280, "SLX-M303": 5150 },
]

export const DEFAULT_DEGRADATION_DATA: DegradationDataPoint[] = [
  { sequence: "Seq A (TC+HF)", "SLX-M301": 0.44, "SLX-M302": 0.42, "SLX-M303": 0.49 },
  { sequence: "Seq B (DH1000)", "SLX-M301": 1.82, "SLX-M302": 1.75, "SLX-M303": 1.91 },
  { sequence: "Seq C (Mech)", "SLX-M301": 0.28, "SLX-M302": 0.31, "SLX-M303": 0.25 },
  { sequence: "Seq D (UV+TC+HF)", "SLX-M301": 0.92, "SLX-M302": 0.88, "SLX-M303": 0.95 },
]

export const DEFAULT_SAMPLE_IDS = ["SLX-M301", "SLX-M302", "SLX-M303"]

// ─── Default IV Params for template reports ──────────────────────────────────

export const DEFAULT_PRE_IV_PARAMS = {
  voc: 49.28,
  isc: 11.42,
  vmp: 41.50,
  imp: 10.41,
  pmax: 432.0,
  ff: 0.768,
}

export const DEFAULT_POST_IV_PARAMS = {
  voc: 49.15,
  isc: 11.38,
  vmp: 41.35,
  imp: 10.38,
  pmax: 430.2,
  ff: 0.769,
}
