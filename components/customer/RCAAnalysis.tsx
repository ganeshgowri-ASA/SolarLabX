// @ts-nocheck
'use client'

import { useState } from 'react'
import { cn, formatDate } from '@/lib/utils'
import { rcaFiveWhys, rcaFishbones, type RCAFiveWhy, type RCAFishbone } from '@/lib/data/customer-data'

const fishboneColors: Record<string, string> = {
  Man: 'bg-blue-100 border-blue-400 text-blue-800',
  Method: 'bg-green-100 border-green-400 text-green-800',
  Machine: 'bg-purple-100 border-purple-400 text-purple-800',
  Material: 'bg-orange-100 border-orange-400 text-orange-800',
  Measurement: 'bg-red-100 border-red-400 text-red-800',
  Environment: 'bg-teal-100 border-teal-400 text-teal-800',
}

const rcaClassifications = [
  'Process', 'People', 'Equipment', 'Material', 'Design', 'Management', 'External',
]

export default function RCAAnalysis() {
  const [activeView, setActiveView] = useState<'five-why' | 'fishbone'>('five-why')
  const [showNewForm, setShowNewForm] = useState(false)
  const [newWhys, setNewWhys] = useState<{ level: number; question: string; answer: string }[]>([
    { level: 1, question: '', answer: '' },
  ])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('five-why')}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium',
              activeView === 'five-why' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            5-Why Analysis
          </button>
          <button
            onClick={() => setActiveView('fishbone')}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium',
              activeView === 'fishbone' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Fishbone / Ishikawa
          </button>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="px-3 py-1.5 bg-amber-600 text-white rounded-md text-xs font-medium hover:bg-amber-700"
        >
          + New RCA
        </button>
      </div>

      {showNewForm && (
        <NewFiveWhyForm
          whys={newWhys}
          setWhys={setNewWhys}
          onClose={() => setShowNewForm(false)}
        />
      )}

      {activeView === 'five-why' && (
        <div className="space-y-4">
          {rcaFiveWhys.map((rca) => (
            <FiveWhyCard key={rca.id} rca={rca} />
          ))}
          {rcaFiveWhys.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">No 5-Why analyses yet</div>
          )}
        </div>
      )}

      {activeView === 'fishbone' && (
        <div className="space-y-4">
          {rcaFishbones.map((fb) => (
            <FishboneCard key={fb.id} fishbone={fb} />
          ))}
          {rcaFishbones.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">No fishbone diagrams yet</div>
          )}
        </div>
      )}
    </div>
  )
}

function FiveWhyCard({ rca }: { rca: RCAFiveWhy }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="bg-white rounded-lg border">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-600">{rca.id}</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{rca.complaintId}</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{rca.classification}</span>
          </div>
          <div className="text-sm font-medium mt-1">{rca.problem}</div>
        </div>
        <span className="text-gray-400 text-xs">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Why chain */}
          <div className="space-y-2">
            {rca.whys.map((w) => (
              <div key={w.level} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">
                  W{w.level}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-700">{w.question}</div>
                  <div className="text-xs text-gray-600 bg-gray-50 rounded p-2 mt-1">{w.answer}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Root Cause */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-xs font-semibold text-red-700 uppercase">Root Cause</div>
            <div className="text-sm text-red-800 mt-1">{rca.rootCause}</div>
          </div>

          {/* Evidence */}
          {rca.evidence.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-1">Evidence</div>
              <div className="flex gap-2 flex-wrap">
                {rca.evidence.map((e, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{e}</span>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-400">
            By {rca.createdBy} on {formatDate(rca.createdAt)}
          </div>
        </div>
      )}
    </div>
  )
}

function FishboneCard({ fishbone }: { fishbone: RCAFishbone }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="bg-white rounded-lg border">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-600">{fishbone.id}</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{fishbone.complaintId}</span>
          </div>
          <div className="text-sm font-medium mt-1">{fishbone.problem}</div>
        </div>
        <span className="text-gray-400 text-xs">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="px-4 pb-4">
          {/* Fishbone diagram - simplified visual */}
          <div className="relative">
            {/* Central problem */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 border-2 border-red-400 rounded-lg px-4 py-2 text-sm font-medium text-red-800">
                {fishbone.problem}
              </div>
            </div>

            {/* Categories grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {fishbone.categories.map((cat) => (
                <div key={cat.name} className={cn('rounded-lg border p-3', fishboneColors[cat.name] || 'bg-gray-100 border-gray-300')}>
                  <div className="text-xs font-bold uppercase mb-2">{cat.name}</div>
                  <div className="space-y-1.5">
                    {cat.causes.map((c, i) => (
                      <div key={i}>
                        <div className="text-xs font-medium">{c.cause}</div>
                        {c.subCauses.length > 0 && (
                          <div className="ml-2 mt-0.5 space-y-0.5">
                            {c.subCauses.map((sc, j) => (
                              <div key={j} className="text-[10px] opacity-75">- {sc}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-400 mt-3">
            By {fishbone.createdBy} on {formatDate(fishbone.createdAt)}
          </div>
        </div>
      )}
    </div>
  )
}

function NewFiveWhyForm({
  whys,
  setWhys,
  onClose,
}: {
  whys: { level: number; question: string; answer: string }[]
  setWhys: (w: { level: number; question: string; answer: string }[]) => void
  onClose: () => void
}) {
  const [problem, setProblem] = useState('')
  const [rootCause, setRootCause] = useState('')
  const [classification, setClassification] = useState('')

  const addWhy = () => {
    if (whys.length < 5) {
      setWhys([...whys, { level: whys.length + 1, question: '', answer: '' }])
    }
  }

  const updateWhy = (idx: number, field: 'question' | 'answer', value: string) => {
    const updated = [...whys]
    updated[idx] = { ...updated[idx], [field]: value }
    setWhys(updated)
  }

  return (
    <div className="bg-white rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">New 5-Why Analysis</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">Close</button>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Problem Statement *</label>
        <input
          type="text"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm"
          placeholder="Describe the problem..."
        />
      </div>

      <div className="space-y-3">
        {whys.map((w, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0 mt-1">
              W{w.level}
            </div>
            <div className="flex-1 space-y-1">
              <input
                type="text"
                value={w.question}
                onChange={(e) => updateWhy(i, 'question', e.target.value)}
                className="w-full border rounded-md px-3 py-1.5 text-xs"
                placeholder={`Why #${w.level}? (Question)`}
              />
              <input
                type="text"
                value={w.answer}
                onChange={(e) => updateWhy(i, 'answer', e.target.value)}
                className="w-full border rounded-md px-3 py-1.5 text-xs bg-gray-50"
                placeholder="Because..."
              />
            </div>
          </div>
        ))}
        {whys.length < 5 && (
          <button onClick={addWhy} className="text-xs text-amber-600 hover:text-amber-700 font-medium">
            + Add Why
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Root Cause</label>
          <textarea
            value={rootCause}
            onChange={(e) => setRootCause(e.target.value)}
            rows={2}
            className="w-full border rounded-md px-3 py-2 text-xs"
            placeholder="Identified root cause..."
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Classification</label>
          <select
            value={classification}
            onChange={(e) => setClassification(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-xs"
          >
            <option value="">Select...</option>
            {rcaClassifications.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t">
        <button onClick={onClose} className="px-3 py-1.5 text-xs border rounded-md text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
        <button
          onClick={() => {
            onClose()
            // In production, this would save to backend
          }}
          className="px-4 py-1.5 text-xs bg-amber-600 text-white rounded-md hover:bg-amber-700 font-medium"
        >
          Save Analysis
        </button>
      </div>
    </div>
  )
}
