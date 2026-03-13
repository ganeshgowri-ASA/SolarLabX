// @ts-nocheck
'use client'

import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ReferenceArea,
} from 'recharts'

// ---- Types ----
type RefReading = { date: string; reading: number; deviation: number; status: 'Pass' | 'Warning' | 'Fail' }
type RefMaterial = {
  id: string
  label: string
  unit: string
  nominalValue: number
  tol2: number   // ±2% absolute
  tol3: number   // ±3% absolute
  readings: RefReading[]
}

// ---- Helper: generate mock time series ----
function genReadings(nominal: number, n: number, driftPerPeriod = 0.0005): RefReading[] {
  const now = new Date('2026-03-13')
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (n - 1 - i) * 7)
    const noise = (Math.random() - 0.5) * nominal * 0.01
    const drift = driftPerPeriod * i * nominal
    const reading = parseFloat((nominal + drift + noise).toFixed(4))
    const deviation = parseFloat((((reading - nominal) / nominal) * 100).toFixed(2))
    const status: RefReading['status'] = Math.abs(deviation) > 3 ? 'Fail' : Math.abs(deviation) > 2 ? 'Warning' : 'Pass'
    return { date: d.toISOString().slice(0, 10), reading, deviation, status }
  })
}

// ---- Mock Reference Materials ----
const REF_MATERIALS: RefMaterial[] = [
  {
    id: 'stc-ref',
    label: 'STC Reference Module (Solar Simulator)',
    unit: 'W',
    nominalValue: 100.0,
    tol2: 2.0,
    tol3: 3.0,
    readings: genReadings(100.0, 24, 0.0003),
  },
  {
    id: 'insulation-ref',
    label: 'Insulation Reference Standard (GΩ)',
    unit: 'GΩ',
    nominalValue: 2000.0,
    tol2: 40.0,
    tol3: 60.0,
    readings: genReadings(2000.0, 12, 0.0005),
  },
  {
    id: 'irradiance-cell',
    label: 'Irradiance Reference Cell',
    unit: 'mA',
    nominalValue: 104.5,
    tol2: 2.09,
    tol3: 3.135,
    readings: genReadings(104.5, 24, 0.0002),
  },
  {
    id: 'load-cell',
    label: 'Load Cell Reference Weight',
    unit: 'N',
    nominalValue: 2400.0,
    tol2: 48.0,
    tol3: 72.0,
    readings: genReadings(2400.0, 12, 0.0001),
  },
  {
    id: 'spectroradiometer',
    label: 'Spectroradiometer Reference Lamp',
    unit: 'W/m²/nm',
    nominalValue: 1.045,
    tol2: 0.0209,
    tol3: 0.03135,
    readings: genReadings(1.045, 12, 0.0004),
  },
]

// ---- Linear regression for trend line ----
function linReg(data: RefReading[]): (i: number) => number {
  const n = data.length
  const xs = data.map((_, i) => i)
  const ys = data.map(d => d.reading)
  const sumX = xs.reduce((a, b) => a + b, 0)
  const sumY = ys.reduce((a, b) => a + b, 0)
  const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0)
  const sumX2 = xs.reduce((s, x) => s + x * x, 0)
  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const b = (sumY - m * sumX) / n
  return (i: number) => parseFloat((m * i + b).toFixed(4))
}

const STATUS_COLORS: Record<string, string> = {
  Pass: 'bg-green-100 text-green-700',
  Warning: 'bg-yellow-100 text-yellow-700',
  Fail: 'bg-red-100 text-red-700',
}

function RefMaterialCard({ mat }: { mat: RefMaterial }) {
  const trend = linReg(mat.readings)
  const chartData = mat.readings.map((r, i) => ({
    date: r.date,
    reading: r.reading,
    trend: trend(i),
    upper2: parseFloat((mat.nominalValue + mat.tol2).toFixed(4)),
    lower2: parseFloat((mat.nominalValue - mat.tol2).toFixed(4)),
    upper3: parseFloat((mat.nominalValue + mat.tol3).toFixed(4)),
    lower3: parseFloat((mat.nominalValue - mat.tol3).toFixed(4)),
  }))

  const alertCount = mat.readings.filter(r => r.status !== 'Pass').length
  const latestStatus = mat.readings[mat.readings.length - 1]?.status

  return (
    <div className="bg-white rounded-lg border">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-gray-800 text-sm">{mat.label}</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Nominal: <span className="font-mono font-medium">{mat.nominalValue} {mat.unit}</span>
            &nbsp;|&nbsp; ±2% limit: {mat.tol2} | ±3% limit: {mat.tol3}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {alertCount > 0 && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
              ⚠ {alertCount} excursion{alertCount > 1 ? 's' : ''}
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[latestStatus]}`}>
            Latest: {latestStatus}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.floor(chartData.length / 6)} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v: number) => [`${v} ${mat.unit}`]} />
            <Legend verticalAlign="top" iconSize={10} wrapperStyle={{ fontSize: 11 }} />

            {/* Control limit bands */}
            <ReferenceArea y1={mat.nominalValue - mat.tol3} y2={mat.nominalValue - mat.tol2} fill="#FEF3C7" fillOpacity={0.5} />
            <ReferenceArea y1={mat.nominalValue + mat.tol2} y2={mat.nominalValue + mat.tol3} fill="#FEF3C7" fillOpacity={0.5} />
            <ReferenceArea y1={mat.nominalValue - mat.tol2} y2={mat.nominalValue + mat.tol2} fill="#D1FAE5" fillOpacity={0.3} />

            {/* Control limit lines */}
            <ReferenceLine y={mat.nominalValue}           stroke="#059669" strokeWidth={1.5} strokeDasharray="4 2" label={{ value: 'NOM', position: 'right', fontSize: 10 }} />
            <ReferenceLine y={mat.nominalValue + mat.tol2} stroke="#F59E0B" strokeWidth={1} strokeDasharray="3 3" label={{ value: '+2%', position: 'right', fontSize: 9 }} />
            <ReferenceLine y={mat.nominalValue - mat.tol2} stroke="#F59E0B" strokeWidth={1} strokeDasharray="3 3" label={{ value: '-2%', position: 'right', fontSize: 9 }} />
            <ReferenceLine y={mat.nominalValue + mat.tol3} stroke="#EF4444" strokeWidth={1} strokeDasharray="3 3" label={{ value: '+3%', position: 'right', fontSize: 9 }} />
            <ReferenceLine y={mat.nominalValue - mat.tol3} stroke="#EF4444" strokeWidth={1} strokeDasharray="3 3" label={{ value: '-3%', position: 'right', fontSize: 9 }} />

            <Line type="monotone" dataKey="reading" name="Reading" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="trend" name="Trend (LR)" stroke="#6B7280" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data Table */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-xs font-semibold text-gray-700">Reading Log</h5>
          <button className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-gray-600">
            ↑ Upload CSV
          </button>
        </div>
        <div className="overflow-x-auto max-h-44 overflow-y-auto">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="border px-2 py-1 text-left font-medium">Date</th>
                <th className="border px-2 py-1 text-right font-medium">Reading ({mat.unit})</th>
                <th className="border px-2 py-1 text-right font-medium">Deviation %</th>
                <th className="border px-2 py-1 text-center font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {[...mat.readings].reverse().map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border px-2 py-1 font-mono">{r.date}</td>
                  <td className="border px-2 py-1 text-right font-mono">{r.reading}</td>
                  <td className={`border px-2 py-1 text-right font-mono ${Math.abs(r.deviation) > 2 ? 'text-red-600 font-semibold' : ''}`}>
                    {r.deviation > 0 ? '+' : ''}{r.deviation}%
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function ReferenceMaterialsTab() {
  const [activeRef, setActiveRef] = useState(REF_MATERIALS[0].id)
  const mat = REF_MATERIALS.find(m => m.id === activeRef) ?? REF_MATERIALS[0]

  const alertCount = REF_MATERIALS.reduce(
    (acc, m) => acc + m.readings.filter(r => r.status !== 'Pass').length,
    0
  )

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="bg-white rounded-lg border p-4 flex items-center gap-4 flex-wrap">
        <div>
          <p className="text-xs text-gray-500">Reference Standards</p>
          <p className="text-2xl font-bold text-gray-800">{REF_MATERIALS.length}</p>
        </div>
        <div className="h-8 border-l" />
        <div>
          <p className="text-xs text-gray-500">Total Excursions</p>
          <p className={`text-2xl font-bold ${alertCount > 0 ? 'text-orange-600' : 'text-green-600'}`}>{alertCount}</p>
        </div>
        <div className="h-8 border-l" />
        <div className="text-xs text-gray-500 italic">
          Control limits: <span className="text-amber-600 font-medium">±2% Warning</span> / <span className="text-red-600 font-medium">±3% Fail</span> bands shown on charts.
          Trend line = linear regression showing drift direction.
        </div>
      </div>

      {/* Reference selector tabs */}
      <div className="bg-white rounded-lg border">
        <div className="flex gap-0 overflow-x-auto border-b">
          {REF_MATERIALS.map(m => {
            const fails = m.readings.filter(r => r.status !== 'Pass').length
            return (
              <button
                key={m.id}
                onClick={() => setActiveRef(m.id)}
                className={`px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1 ${activeRef === m.id ? 'border-amber-500 text-amber-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {m.label.split('(')[0].trim()}
                {fails > 0 && <span className="ml-1 bg-orange-500 text-white text-[10px] px-1 rounded-full">{fails}</span>}
              </button>
            )
          })}
        </div>
        <div className="p-0">
          <RefMaterialCard key={mat.id} mat={mat} />
        </div>
      </div>
    </div>
  )
}
