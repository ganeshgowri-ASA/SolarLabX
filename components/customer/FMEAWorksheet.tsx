// @ts-nocheck
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { fmeaEntries, type FMEAEntry } from '@/lib/data/customer-data'

function getRPNColor(rpn: number): string {
  if (rpn >= 200) return 'bg-red-600 text-white'
  if (rpn >= 120) return 'bg-red-100 text-red-700'
  if (rpn >= 80) return 'bg-orange-100 text-orange-700'
  if (rpn >= 40) return 'bg-yellow-100 text-yellow-700'
  return 'bg-green-100 text-green-700'
}

function getRPNLabel(rpn: number): string {
  if (rpn >= 200) return 'Critical'
  if (rpn >= 120) return 'High'
  if (rpn >= 80) return 'Medium'
  if (rpn >= 40) return 'Low'
  return 'Acceptable'
}

export default function FMEAWorksheet() {
  const [entries, setEntries] = useState<FMEAEntry[]>(fmeaEntries)
  const [showForm, setShowForm] = useState(false)
  const [selectedView, setSelectedView] = useState<'table' | 'matrix' | 'comparison'>('table')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['table', 'matrix', 'comparison'] as const).map(v => (
            <button
              key={v}
              onClick={() => setSelectedView(v)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium',
                selectedView === v ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {v === 'table' ? 'FMEA Worksheet' : v === 'matrix' ? 'RPN Matrix' : 'Before/After'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 bg-amber-600 text-white rounded-md text-xs font-medium hover:bg-amber-700"
        >
          + Add Entry
        </button>
      </div>

      {showForm && <FMEAForm onClose={() => setShowForm(false)} onAdd={(entry) => { setEntries([...entries, entry]); setShowForm(false) }} />}

      {selectedView === 'table' && <FMEATable entries={entries} />}
      {selectedView === 'matrix' && <RPNMatrix entries={entries} />}
      {selectedView === 'comparison' && <BeforeAfterComparison entries={entries} />}
    </div>
  )
}

function FMEATable({ entries }: { entries: FMEAEntry[] }) {
  return (
    <div className="bg-white rounded-lg border overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-xs">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Process Step</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Failure Mode</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Effect</th>
            <th className="px-3 py-2 text-center font-medium text-gray-500 uppercase">S</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Cause</th>
            <th className="px-3 py-2 text-center font-medium text-gray-500 uppercase">O</th>
            <th className="px-3 py-2 text-center font-medium text-gray-500 uppercase">D</th>
            <th className="px-3 py-2 text-center font-medium text-gray-500 uppercase">RPN</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Action</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Resp.</th>
            <th className="px-3 py-2 text-center font-medium text-gray-500 uppercase">Rev. RPN</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {entries.map((e) => (
            <tr key={e.id} className="hover:bg-gray-50">
              <td className="px-3 py-2 font-medium">{e.processStep}</td>
              <td className="px-3 py-2">{e.failureMode}</td>
              <td className="px-3 py-2 max-w-[150px] truncate">{e.effect}</td>
              <td className="px-3 py-2 text-center font-bold">{e.severity}</td>
              <td className="px-3 py-2 max-w-[120px] truncate">{e.cause}</td>
              <td className="px-3 py-2 text-center font-bold">{e.occurrence}</td>
              <td className="px-3 py-2 text-center font-bold">{e.detection}</td>
              <td className="px-3 py-2 text-center">
                <span className={cn('px-2 py-0.5 rounded font-bold', getRPNColor(e.rpn))}>
                  {e.rpn}
                </span>
              </td>
              <td className="px-3 py-2 max-w-[150px] truncate">{e.recommendedAction}</td>
              <td className="px-3 py-2 whitespace-nowrap">{e.responsibility.split(' ').pop()}</td>
              <td className="px-3 py-2 text-center">
                {e.revisedRpn !== null ? (
                  <span className={cn('px-2 py-0.5 rounded font-bold', getRPNColor(e.revisedRpn))}>
                    {e.revisedRpn}
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RPNMatrix({ entries }: { entries: FMEAEntry[] }) {
  // Severity x Occurrence matrix with entry counts
  const matrix: Record<string, FMEAEntry[]> = {}
  entries.forEach(e => {
    const key = `${e.severity}-${e.occurrence}`
    if (!matrix[key]) matrix[key] = []
    matrix[key].push(e)
  })

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="text-sm font-semibold mb-3">RPN Priority Matrix (Severity x Occurrence)</h3>
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse">
          <thead>
            <tr>
              <th className="px-2 py-1 border bg-gray-50 text-gray-500">S \ O</th>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(o => (
                <th key={o} className="px-2 py-1 border bg-gray-50 text-gray-500 text-center w-10">{o}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(s => (
              <tr key={s}>
                <td className="px-2 py-1 border bg-gray-50 text-gray-500 font-medium text-center">{s}</td>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(o => {
                  const key = `${s}-${o}`
                  const count = matrix[key]?.length || 0
                  const maxRpn = s * o * 10 // theoretical max with detection=10
                  const bgColor = maxRpn >= 200 ? 'bg-red-50' : maxRpn >= 100 ? 'bg-orange-50' : maxRpn >= 50 ? 'bg-yellow-50' : 'bg-green-50'

                  return (
                    <td key={o} className={cn('px-2 py-1 border text-center', bgColor)}>
                      {count > 0 ? (
                        <span className="bg-amber-500 text-white rounded-full w-5 h-5 inline-flex items-center justify-center font-bold">
                          {count}
                        </span>
                      ) : null}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        <span className="text-xs text-gray-500">Risk Level:</span>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-200" /><span className="text-xs text-gray-600">Low</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-200" /><span className="text-xs text-gray-600">Medium</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-200" /><span className="text-xs text-gray-600">High</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-200" /><span className="text-xs text-gray-600">Critical</span></div>
      </div>
    </div>
  )
}

function BeforeAfterComparison({ entries }: { entries: FMEAEntry[] }) {
  const withRevised = entries.filter(e => e.revisedRpn !== null)
  const maxRpn = Math.max(...entries.map(e => Math.max(e.rpn, e.revisedRpn ?? 0)), 1)

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="text-sm font-semibold mb-4">Before / After RPN Comparison</h3>

      {withRevised.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">No revised RPN data available yet</div>
      ) : (
        <div className="space-y-4">
          {withRevised.map(e => {
            const reduction = e.rpn - (e.revisedRpn ?? e.rpn)
            const reductionPct = Math.round((reduction / e.rpn) * 100)

            return (
              <div key={e.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium">{e.processStep}</div>
                    <div className="text-xs text-gray-500">{e.failureMode}</div>
                  </div>
                  <div className="text-right">
                    <span className={cn('text-xs font-bold px-2 py-0.5 rounded', reduction > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                      {reduction > 0 ? `↓ ${reductionPct}% reduction` : 'No change'}
                    </span>
                  </div>
                </div>

                {/* Bars */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-12">Before</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4">
                      <div
                        className={cn('h-4 rounded-full flex items-center justify-end pr-2', getRPNColor(e.rpn))}
                        style={{ width: `${(e.rpn / maxRpn) * 100}%` }}
                      >
                        <span className="text-[10px] font-bold">{e.rpn}</span>
                      </div>
                    </div>
                    <span className="text-xs w-12 text-right">S{e.severity} O{e.occurrence} D{e.detection}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-12">After</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4">
                      <div
                        className={cn('h-4 rounded-full flex items-center justify-end pr-2', getRPNColor(e.revisedRpn ?? 0))}
                        style={{ width: `${((e.revisedRpn ?? 0) / maxRpn) * 100}%` }}
                      >
                        <span className="text-[10px] font-bold">{e.revisedRpn}</span>
                      </div>
                    </div>
                    <span className="text-xs w-12 text-right">S{e.revisedSeverity} O{e.revisedOccurrence} D{e.revisedDetection}</span>
                  </div>
                </div>

                {e.actionTaken && (
                  <div className="mt-2 text-xs text-green-700 bg-green-50 rounded p-2">
                    <span className="font-medium">Action Taken:</span> {e.actionTaken}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function FMEAForm({ onClose, onAdd }: { onClose: () => void; onAdd: (entry: FMEAEntry) => void }) {
  const [form, setForm] = useState({
    processStep: '', failureMode: '', effect: '', severity: 5, cause: '',
    occurrence: 5, detection: 5, recommendedAction: '', responsibility: '', targetDate: '',
  })

  const rpn = form.severity * form.occurrence * form.detection

  const handleSubmit = () => {
    const entry: FMEAEntry = {
      id: `FMEA-${String(Date.now()).slice(-3)}`,
      complaintId: '',
      ...form,
      rpn,
      actionTaken: '',
      revisedSeverity: null,
      revisedOccurrence: null,
      revisedDetection: null,
      revisedRpn: null,
    }
    onAdd(entry)
  }

  return (
    <div className="bg-white rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">New FMEA Entry</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">Close</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Process Step</label>
          <input type="text" value={form.processStep} onChange={e => setForm({ ...form, processStep: e.target.value })} className="w-full border rounded px-3 py-1.5 text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Failure Mode</label>
          <input type="text" value={form.failureMode} onChange={e => setForm({ ...form, failureMode: e.target.value })} className="w-full border rounded px-3 py-1.5 text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Effect</label>
          <input type="text" value={form.effect} onChange={e => setForm({ ...form, effect: e.target.value })} className="w-full border rounded px-3 py-1.5 text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Cause</label>
          <input type="text" value={form.cause} onChange={e => setForm({ ...form, cause: e.target.value })} className="w-full border rounded px-3 py-1.5 text-xs" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Severity (1-10)</label>
          <input type="number" min={1} max={10} value={form.severity} onChange={e => setForm({ ...form, severity: Number(e.target.value) })} className="w-full border rounded px-3 py-1.5 text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Occurrence (1-10)</label>
          <input type="number" min={1} max={10} value={form.occurrence} onChange={e => setForm({ ...form, occurrence: Number(e.target.value) })} className="w-full border rounded px-3 py-1.5 text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Detection (1-10)</label>
          <input type="number" min={1} max={10} value={form.detection} onChange={e => setForm({ ...form, detection: Number(e.target.value) })} className="w-full border rounded px-3 py-1.5 text-xs" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-500">Calculated RPN:</span>
        <span className={cn('px-3 py-1 rounded font-bold text-sm', getRPNColor(rpn))}>{rpn}</span>
        <span className="text-xs text-gray-500">({getRPNLabel(rpn)})</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Recommended Action</label>
          <input type="text" value={form.recommendedAction} onChange={e => setForm({ ...form, recommendedAction: e.target.value })} className="w-full border rounded px-3 py-1.5 text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Responsibility</label>
          <input type="text" value={form.responsibility} onChange={e => setForm({ ...form, responsibility: e.target.value })} className="w-full border rounded px-3 py-1.5 text-xs" />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t">
        <button onClick={onClose} className="px-3 py-1.5 text-xs border rounded-md text-gray-600 hover:bg-gray-50">Cancel</button>
        <button onClick={handleSubmit} className="px-4 py-1.5 text-xs bg-amber-600 text-white rounded-md hover:bg-amber-700 font-medium">Add Entry</button>
      </div>
    </div>
  )
}
