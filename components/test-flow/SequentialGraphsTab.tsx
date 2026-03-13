// @ts-nocheck
'use client'

import { useState } from 'react'
import {
  ComposedChart, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'

// ---- Mock Data ----
const MODULES = [
  { id: 'MOD-001', label: 'MOD-001 – Suntech 400W Mono' },
  { id: 'MOD-002', label: 'MOD-002 – JA Solar 415W Bifacial' },
  { id: 'MOD-003', label: 'MOD-003 – Longi 430W PERC' },
]

const STAGES = ['Initial', 'Pre-TC200', 'Post-TC200', 'Pre-TC400', 'Post-TC400', 'Pre-HF10', 'Post-HF10', 'Pre-DH1000', 'Post-DH1000', 'Post-UV', 'Final']

// EL Image comparison data – defect count / severity score per stage
const elData = [
  { stage: 'Initial',      pre: 0,  post: 0,  crackTrend: 0 },
  { stage: 'Pre-TC200',    pre: 1,  post: 3,  crackTrend: 1 },
  { stage: 'Post-TC200',   pre: 1,  post: 4,  crackTrend: 2 },
  { stage: 'Pre-TC400',    pre: 2,  post: 5,  crackTrend: 3 },
  { stage: 'Post-TC400',   pre: 2,  post: 6,  crackTrend: 4 },
  { stage: 'Pre-HF10',     pre: 2,  post: 6,  crackTrend: 4 },
  { stage: 'Post-HF10',    pre: 3,  post: 8,  crackTrend: 5 },
  { stage: 'Pre-DH1000',   pre: 3,  post: 8,  crackTrend: 5 },
  { stage: 'Post-DH1000',  pre: 4,  post: 10, crackTrend: 7 },
  { stage: 'Post-UV',      pre: 4,  post: 11, crackTrend: 7 },
  { stage: 'Final',        pre: 4,  post: 12, crackTrend: 8 },
]

// IV Parameter data per stage
const ivData = [
  { stage: 'Initial',     pmaxPre: 400.0, pmaxPost: 400.0, iscPre: 9.80, iscPost: 9.80, vocPre: 48.2, vocPost: 48.2, ffPre: 84.8, ffPost: 84.8 },
  { stage: 'Post-TC200',  pmaxPre: 399.5, pmaxPost: 397.2, iscPre: 9.79, iscPost: 9.77, vocPre: 48.1, vocPost: 47.9, ffPre: 84.7, ffPost: 84.4 },
  { stage: 'Post-TC400',  pmaxPre: 399.0, pmaxPost: 395.6, iscPre: 9.78, iscPost: 9.75, vocPre: 48.0, vocPost: 47.8, ffPre: 84.6, ffPost: 84.2 },
  { stage: 'Post-HF10',   pmaxPre: 398.5, pmaxPost: 394.8, iscPre: 9.77, iscPost: 9.73, vocPre: 47.9, vocPost: 47.7, ffPre: 84.5, ffPost: 84.0 },
  { stage: 'Post-DH1000', pmaxPre: 398.0, pmaxPost: 392.4, iscPre: 9.76, iscPost: 9.70, vocPre: 47.8, vocPost: 47.5, ffPre: 84.4, ffPost: 83.6 },
  { stage: 'Post-UV',     pmaxPre: 397.8, pmaxPost: 391.8, iscPre: 9.75, iscPost: 9.69, vocPre: 47.7, vocPost: 47.4, ffPre: 84.3, ffPost: 83.5 },
  { stage: 'Final',       pmaxPre: 397.5, pmaxPost: 390.0, iscPre: 9.74, iscPost: 9.67, vocPre: 47.7, vocPost: 47.3, ffPre: 84.2, ffPost: 83.2 },
]

// Delta / degradation summary table
const degradationTable = ivData.map(d => ({
  stage: d.stage,
  pmaxDelta: (((d.pmaxPost - d.pmaxPre) / d.pmaxPre) * 100).toFixed(2),
  iscDelta:  (((d.iscPost  - d.iscPre)  / d.iscPre)  * 100).toFixed(2),
  vocDelta:  (((d.vocPost  - d.vocPre)  / d.vocPre)  * 100).toFixed(2),
  ffDelta:   (((d.ffPost   - d.ffPre)   / d.ffPre)   * 100).toFixed(2),
  status:    ((d.pmaxPost - d.pmaxPre) / d.pmaxPre * 100) < -5 ? 'Fail' : ((d.pmaxPost - d.pmaxPre) / d.pmaxPre * 100) < -2 ? 'Warning' : 'Pass',
}))

// Visual inspection data per stage – defect types count
const visData = [
  { stage: 'Initial',      scratches: 0, discolouration: 0, delamination: 0, bubble: 0 },
  { stage: 'Post-TC200',   scratches: 1, discolouration: 1, delamination: 0, bubble: 0 },
  { stage: 'Post-TC400',   scratches: 1, discolouration: 2, delamination: 1, bubble: 0 },
  { stage: 'Post-HF10',    scratches: 1, discolouration: 2, delamination: 1, bubble: 1 },
  { stage: 'Post-DH1000',  scratches: 2, discolouration: 3, delamination: 2, bubble: 1 },
  { stage: 'Post-UV',      scratches: 2, discolouration: 4, delamination: 2, bubble: 1 },
  { stage: 'Final',        scratches: 2, discolouration: 5, delamination: 3, bubble: 2 },
]

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Pass: 'bg-green-100 text-green-700',
    Warning: 'bg-yellow-100 text-yellow-700',
    Fail: 'bg-red-100 text-red-700',
  }
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>{status}</span>
}

const CHART_PARAMS = ['pmax', 'isc', 'voc', 'ff']
const PARAM_LABELS: Record<string, string> = { pmax: 'Pmax (W)', isc: 'Isc (A)', voc: 'Voc (V)', ff: 'FF (%)' }

export function SequentialGraphsTab() {
  const [selectedModule, setSelectedModule] = useState(MODULES[0].id)
  const [ivParam, setIvParam] = useState<'pmax' | 'isc' | 'voc' | 'ff'>('pmax')

  const preKey = `${ivParam}Pre` as keyof typeof ivData[0]
  const postKey = `${ivParam}Post` as keyof typeof ivData[0]

  return (
    <div className="space-y-6">
      {/* Module Selector */}
      <div className="bg-white rounded-lg border p-4 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Module:</label>
        <select
          value={selectedModule}
          onChange={e => setSelectedModule(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm text-gray-700 bg-white focus:ring-amber-500 focus:border-amber-500"
        >
          {MODULES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        <span className="ml-auto text-xs text-gray-400">IEC 61215 Full Sequence – Sequential Pre/Post Comparison</span>
      </div>

      {/* 1. EL Image Comparison */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-gray-800 mb-1">1. EL Image Comparison – Defect Count / Severity Across Sequence</h3>
        <p className="text-xs text-gray-500 mb-4">Pre (blue) vs Post (orange) defect score per test stage. Trend line = cell crack count.</p>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={elData} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" angle={-35} textAnchor="end" tick={{ fontSize: 11 }} interval={0} />
            <YAxis yAxisId="left" label={{ value: 'Defect Count', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Crack Count', angle: 90, position: 'insideRight', style: { fontSize: 11 } }} />
            <Tooltip />
            <Legend verticalAlign="top" />
            <Bar yAxisId="left" dataKey="pre"  name="Pre Defect Score"  fill="#3B82F6" barSize={16} />
            <Bar yAxisId="left" dataKey="post" name="Post Defect Score" fill="#F97316" barSize={16} />
            <Line yAxisId="right" type="monotone" dataKey="crackTrend" name="Cell Crack Count" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 2. IV Parameter Tracking */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-800">2. IV Parameter Tracking – Pre vs Post Across Sequence</h3>
            <p className="text-xs text-gray-500 mt-0.5">Pre values (solid) vs Post values (dashed). Select parameter below.</p>
          </div>
          <div className="flex gap-1">
            {CHART_PARAMS.map(p => (
              <button
                key={p}
                onClick={() => setIvParam(p as any)}
                className={`px-3 py-1 text-xs rounded border font-medium transition-colors ${ivParam === p ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-300 hover:border-amber-400'}`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={ivData} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" angle={-35} textAnchor="end" tick={{ fontSize: 11 }} interval={0} />
            <YAxis domain={['auto', 'auto']} label={{ value: PARAM_LABELS[ivParam], angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
            <Tooltip />
            <Legend verticalAlign="top" />
            <Bar dataKey={preKey}  name={`Pre ${ivParam.toUpperCase()}`}  fill="#3B82F6" barSize={14} opacity={0.8} />
            <Bar dataKey={postKey} name={`Post ${ivParam.toUpperCase()}`} fill="#F97316" barSize={14} opacity={0.8} />
            <Line type="monotone" dataKey={preKey}  name="" stroke="#1D4ED8" strokeWidth={2} dot={false} strokeDasharray="4 2" />
            <Line type="monotone" dataKey={postKey} name="" stroke="#C2410C" strokeWidth={2} dot={false} strokeDasharray="4 2" />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Degradation Summary Table */}
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Delta / Degradation Summary (Post − Pre / Pre × 100%)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-2 py-1 text-left font-medium">Stage</th>
                  <th className="border px-2 py-1 text-right font-medium">ΔPmax %</th>
                  <th className="border px-2 py-1 text-right font-medium">ΔIsc %</th>
                  <th className="border px-2 py-1 text-right font-medium">ΔVoc %</th>
                  <th className="border px-2 py-1 text-right font-medium">ΔFF %</th>
                  <th className="border px-2 py-1 text-center font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {degradationTable.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border px-2 py-1 font-medium">{row.stage}</td>
                    <td className={`border px-2 py-1 text-right ${parseFloat(row.pmaxDelta) < -2 ? 'text-red-600 font-semibold' : ''}`}>{row.pmaxDelta}%</td>
                    <td className={`border px-2 py-1 text-right ${parseFloat(row.iscDelta)  < -2 ? 'text-red-600 font-semibold' : ''}`}>{row.iscDelta}%</td>
                    <td className={`border px-2 py-1 text-right ${parseFloat(row.vocDelta)  < -2 ? 'text-red-600 font-semibold' : ''}`}>{row.vocDelta}%</td>
                    <td className={`border px-2 py-1 text-right ${parseFloat(row.ffDelta)   < -2 ? 'text-red-600 font-semibold' : ''}`}>{row.ffDelta}%</td>
                    <td className="border px-2 py-1 text-center">{statusBadge(row.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. Visual Inspection Timeline */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-gray-800 mb-1">3. Visual Inspection Timeline – Defect Type Tracking Across Sequence</h3>
        <p className="text-xs text-gray-500 mb-4">Stacked bars show cumulative visual defect counts per stage post-test.</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={visData} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" angle={-35} textAnchor="end" tick={{ fontSize: 11 }} interval={0} />
            <YAxis label={{ value: 'Defect Count', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
            <Tooltip />
            <Legend verticalAlign="top" />
            <Bar dataKey="scratches"      name="Scratches"      stackId="a" fill="#6366F1" />
            <Bar dataKey="discolouration" name="Discolouration" stackId="a" fill="#F59E0B" />
            <Bar dataKey="delamination"   name="Delamination"   stackId="a" fill="#EF4444" />
            <Bar dataKey="bubble"         name="Bubble"         stackId="a" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
