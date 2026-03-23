// @ts-nocheck
'use client'

import { useState } from 'react'
import { cn, formatDate, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'
import { rcaRecords, rcaMetrics } from '@/lib/data/rca-data'
import type { RCA, FishboneData, FishboneCause } from '@/lib/types'

import WhyWhyFlowchart from '@/components/rca/WhyWhyFlowchart'

type TabKey = 'dashboard' | '5-why' | 'fishbone' | '8d-report' | 'capa-tracking' | 'why-why-flowchart'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'dashboard', label: 'RCA Dashboard' },
  { key: '5-why', label: '5-Why Analysis' },
  { key: 'fishbone', label: 'Fishbone / Ishikawa' },
  { key: 'why-why-flowchart', label: 'Why-Why Flowchart' },
  { key: '8d-report', label: '8D Reports' },
  { key: 'capa-tracking', label: 'CAPA Tracking' },
]

const rcaStatusColors: Record<string, string> = {
  initiated: 'bg-blue-100 text-blue-700',
  investigation: 'bg-yellow-100 text-yellow-700',
  root_cause_identified: 'bg-purple-100 text-purple-700',
  action_planning: 'bg-indigo-100 text-indigo-700',
  implementation: 'bg-amber-100 text-amber-700',
  verification: 'bg-cyan-100 text-cyan-700',
  closed: 'bg-green-100 text-green-700',
}

export default function RcaPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')
  const [selectedRca, setSelectedRca] = useState<string>(rcaRecords[0].id)

  const currentRca = rcaRecords.find((r) => r.id === selectedRca) || rcaRecords[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Root Cause Analysis</h1>
          <p className="text-sm text-gray-500">5-Why, Fishbone/Ishikawa, 8D Report & CAPA Tracking</p>
        </div>
        <button onClick={() => toast.info("New RCA initiation form coming soon")} className="px-4 py-2 text-sm bg-amber-600 text-white rounded hover:bg-amber-700">
          + New RCA
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-0 -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
                activeTab === tab.key
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* RCA Selector (for non-dashboard tabs) */}
      {activeTab !== 'dashboard' && (
        <div className="bg-white rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Select RCA:</label>
            <select
              value={selectedRca}
              onChange={(e) => setSelectedRca(e.target.value)}
              className="border rounded-md px-3 py-1.5 text-sm flex-1 max-w-lg"
            >
              {rcaRecords.map((rca) => (
                <option key={rca.id} value={rca.id}>
                  {rca.rcaNumber} - {rca.title}
                </option>
              ))}
            </select>
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded', rcaStatusColors[currentRca.status])}>
              {currentRca.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      )}

      {activeTab === 'dashboard' && <RcaDashboard />}
      {activeTab === '5-why' && <FiveWhyTab rca={currentRca} />}
      {activeTab === 'fishbone' && <FishboneTab fishbone={currentRca.fishboneDiagram} />}
      {activeTab === '8d-report' && <EightDTab rca={currentRca} />}
      {activeTab === 'capa-tracking' && <CAPATrackingTab />}
      {activeTab === 'why-why-flowchart' && <WhyWhyFlowchart />}
    </div>
  )
}

// ============================================================================
// RCA Dashboard
// ============================================================================
function RcaDashboard() {
  const m = rcaMetrics
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Total RCAs</div>
          <div className="text-3xl font-bold text-gray-800 mt-1">{m.total}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Open</div>
          <div className="text-3xl font-bold text-amber-600 mt-1">{m.open}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Closed</div>
          <div className="text-3xl font-bold text-green-600 mt-1">{m.closed}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Avg Resolution</div>
          <div className="text-3xl font-bold text-blue-600 mt-1">{m.avgResolutionDays}d</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Open Actions</div>
          <div className="text-3xl font-bold text-red-600 mt-1">{m.openActions}</div>
        </div>
      </div>

      {/* By Source + By Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-3">RCAs by Source</h3>
          <div className="space-y-2">
            {m.bySource.map((item) => (
              <div key={item.source} className="flex items-center justify-between">
                <span className="text-sm">{item.source}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(item.count / m.total) * 100}%` }} />
                  </div>
                  <span className="text-sm font-bold w-6 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-3">RCAs by Status</h3>
          <div className="space-y-2">
            {m.byStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="text-sm">{item.status}</span>
                <span className="text-sm font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RCA Records Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold">All RCA Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">RCA #</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rcaRecords.map((rca) => (
                <tr key={rca.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-amber-600 font-medium">{rca.rcaNumber}</td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate">{rca.title}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded capitalize">
                      {rca.source.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded', getStatusColor(rca.priority))}>
                      {rca.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded', rcaStatusColors[rca.status])}>
                      {rca.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{rca.assignedTo}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(rca.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Enhanced 5-Why Analysis Tab
// ============================================================================
function FiveWhyTab({ rca }: { rca: RCA }) {
  const [whys, setWhys] = useState(rca.fiveWhys)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newWhy, setNewWhy] = useState({ question: '', answer: '', evidence: '', isRootCause: false })

  // Reset whys when RCA changes
  const [prevRcaId, setPrevRcaId] = useState(rca.id)
  if (rca.id !== prevRcaId) {
    setPrevRcaId(rca.id)
    setWhys(rca.fiveWhys)
    setShowAddForm(false)
    setNewWhy({ question: '', answer: '', evidence: '', isRootCause: false })
  }

  const handleAddWhy = () => {
    if (!newWhy.question.trim() || !newWhy.answer.trim()) {
      toast.error('Question and Answer are required')
      return
    }
    const nextLevel = whys.length + 1
    if (nextLevel > 7) {
      toast.error('Maximum 7 Why levels reached')
      return
    }
    // If marking as root cause, unmark any existing root cause
    const updated = newWhy.isRootCause
      ? whys.map((w) => ({ ...w, isRootCause: false }))
      : [...whys]
    if (!newWhy.isRootCause) {
      updated.push({ level: nextLevel, ...newWhy })
    } else {
      updated.push({ level: nextLevel, ...newWhy })
    }
    setWhys(newWhy.isRootCause ? [...whys.map((w) => ({ ...w, isRootCause: false })), { level: nextLevel, ...newWhy }] : [...whys, { level: nextLevel, ...newWhy }])
    setNewWhy({ question: '', answer: '', evidence: '', isRootCause: false })
    setShowAddForm(false)
    toast.success(`Why ${nextLevel} added successfully`)
  }

  const handleRemoveWhy = (level: number) => {
    setWhys(whys.filter((w) => w.level !== level).map((w, i) => ({ ...w, level: i + 1 })))
    toast.success('Why level removed')
  }

  const rootCause = whys.find((w) => w.isRootCause)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-semibold mb-1">Problem Statement</h3>
        <p className="text-sm text-gray-700">{rca.description}</p>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">5-Why Analysis Chain</h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
          >
            {showAddForm ? 'Cancel' : '+ Add Why'}
          </button>
        </div>

        {/* Interactive Why Chain */}
        <div className="space-y-0">
          {whys.map((why, i) => (
            <div key={i} className="relative">
              {/* Connecting Arrow */}
              {i < whys.length - 1 && (
                <div className="absolute left-5 top-14 bottom-0 flex flex-col items-center z-0">
                  <div className="w-0.5 flex-1 bg-amber-300" />
                  <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-amber-400" />
                </div>
              )}

              <div className={cn(
                'relative flex gap-4 p-3 rounded-lg mb-2 group transition-all',
                why.isRootCause ? 'bg-red-50 border border-red-200 shadow-sm' : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'
              )}>
                {/* Why Number Circle */}
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm z-10 transition-transform group-hover:scale-110',
                  why.isRootCause ? 'bg-red-500 text-white ring-2 ring-red-300 ring-offset-1' : 'bg-amber-100 text-amber-700'
                )}>
                  W{why.level}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800">{why.question}</div>
                  <div className="text-sm text-gray-600 mt-1">{why.answer}</div>
                  {why.evidence && (
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded">Evidence:</span> {why.evidence}
                    </div>
                  )}
                  {why.isRootCause && (
                    <div className="text-xs font-bold text-red-600 mt-2 bg-red-100 px-2 py-1 rounded inline-block animate-pulse">
                      ROOT CAUSE IDENTIFIED
                    </div>
                  )}
                </div>

                {/* Remove button */}
                <button
                  onClick={() => handleRemoveWhy(why.level)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center text-xs self-start"
                  title="Remove this why"
                >
                  x
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Why Form */}
        {showAddForm && (
          <div className="mt-4 border border-amber-200 rounded-lg p-4 bg-amber-50/50">
            <h4 className="text-sm font-semibold text-amber-800 mb-3">Add Why Level {whys.length + 1}</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Question (Why?)</label>
                <input
                  type="text"
                  value={newWhy.question}
                  onChange={(e) => setNewWhy({ ...newWhy, question: e.target.value })}
                  placeholder="Why did this happen?"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Answer</label>
                <input
                  type="text"
                  value={newWhy.answer}
                  onChange={(e) => setNewWhy({ ...newWhy, answer: e.target.value })}
                  placeholder="Because..."
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Evidence (optional)</label>
                <input
                  type="text"
                  value={newWhy.evidence}
                  onChange={(e) => setNewWhy({ ...newWhy, evidence: e.target.value })}
                  placeholder="Supporting evidence, data, or reference"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newWhy.isRootCause}
                    onChange={(e) => setNewWhy({ ...newWhy, isRootCause: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500" />
                </label>
                <span className="text-xs font-medium text-gray-700">Mark as Root Cause</span>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleAddWhy}
                  className="px-4 py-2 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                >
                  Add to Chain
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setNewWhy({ question: '', answer: '', evidence: '', isRootCause: false }) }}
                  className="px-4 py-2 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Root Cause Summary */}
      {rootCause && (
        <div className="bg-white rounded-lg border border-red-200 p-4">
          <h3 className="text-sm font-semibold text-red-700 mb-2">Root Cause Summary</h3>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0 text-xs font-bold">
              RC
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">{rootCause.question}</div>
              <div className="text-sm text-red-700 mt-1 font-medium">{rootCause.answer}</div>
              {rootCause.evidence && (
                <div className="text-xs text-gray-500 mt-1">
                  <span className="font-medium">Evidence:</span> {rootCause.evidence}
                </div>
              )}
              <div className="mt-2 text-xs text-gray-500">
                Identified at Why Level {rootCause.level} of {whys.length} ({whys.length} levels analyzed)
              </div>
            </div>
          </div>
          {/* Path visualization */}
          <div className="mt-3 pt-3 border-t border-red-100">
            <div className="text-xs font-medium text-gray-500 mb-2">Root Cause Path</div>
            <div className="flex items-center gap-1 flex-wrap">
              {whys.map((w, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className={cn(
                    'text-[10px] px-2 py-0.5 rounded-full font-medium',
                    w.isRootCause ? 'bg-red-500 text-white' : 'bg-amber-100 text-amber-700'
                  )}>
                    W{w.level}
                  </span>
                  {i < whys.length - 1 && (
                    <span className="text-gray-300 text-xs">&rarr;</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Enhanced Fishbone / Ishikawa Diagram Tab
// ============================================================================
function FishboneTab({ fishbone }: { fishbone: FishboneData }) {
  const [selectedCause, setSelectedCause] = useState<FishboneCause | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Arrange categories: top 3 and bottom 3
  const allCats = fishbone.categories
  const topCats = allCats.filter((_, i) => i % 2 === 0)
  const bottomCats = allCats.filter((_, i) => i % 2 === 1)

  const categoryColors: Record<string, { bg: string; border: string; text: string; bone: string }> = {
    Man: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', bone: 'bg-blue-300' },
    Machine: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', bone: 'bg-purple-300' },
    Method: { bg: 'bg-teal-50', border: 'border-teal-300', text: 'text-teal-700', bone: 'bg-teal-300' },
    Methods: { bg: 'bg-teal-50', border: 'border-teal-300', text: 'text-teal-700', bone: 'bg-teal-300' },
    Materials: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', bone: 'bg-orange-300' },
    Material: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', bone: 'bg-orange-300' },
    Measurement: { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-700', bone: 'bg-indigo-300' },
    Environment: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', bone: 'bg-emerald-300' },
  }

  const getColors = (name: string) => categoryColors[name] || { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-700', bone: 'bg-gray-300' }

  return (
    <div className="space-y-4">
      {/* Fishbone Diagram - CSS-based visual */}
      <div className="bg-white rounded-lg border p-4 overflow-x-auto">
        <h3 className="text-sm font-semibold mb-4">Fishbone / Ishikawa Diagram</h3>

        <div className="min-w-[800px]">
          {/* Top categories */}
          <div className="grid grid-cols-3 gap-4 mb-2">
            {topCats.map((cat) => {
              const colors = getColors(cat.name)
              return (
                <div key={cat.name} className="flex flex-col items-center">
                  {/* Cause cards */}
                  <div className="space-y-1 mb-2 w-full">
                    {cat.causes.map((cause) => (
                      <button
                        key={cause.id}
                        onClick={() => { setSelectedCause(cause); setSelectedCategory(cat.name) }}
                        className={cn(
                          'w-full text-left text-xs p-1.5 rounded border transition-all hover:shadow-sm',
                          cause.isContributing
                            ? 'bg-amber-50 border-amber-300 hover:border-amber-400'
                            : `${colors.bg} ${colors.border} hover:opacity-80`
                        )}
                      >
                        <div className="flex items-center gap-1">
                          {cause.isContributing && (
                            <span className="relative flex h-2 w-2 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                            </span>
                          )}
                          <span className={cn('font-medium truncate', cause.isContributing ? 'text-amber-800' : colors.text)}>
                            {cause.text}
                          </span>
                        </div>
                      </button>
                    ))}
                    {cat.causes.length === 0 && (
                      <div className="text-[10px] text-gray-400 italic text-center py-1">No causes</div>
                    )}
                  </div>
                  {/* Category label */}
                  <div className={cn('text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full', colors.bg, colors.text, 'border', colors.border)}>
                    {cat.name}
                  </div>
                  {/* Angled bone (down toward spine) */}
                  <div className="relative h-8 w-full flex justify-center">
                    <div className={cn('w-0.5 h-full', colors.bone)} style={{ transform: 'rotate(0deg)' }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Horizontal spine */}
          <div className="relative flex items-center">
            <div className="flex-1 h-1 bg-gray-400 rounded-l" />
            {/* Arrow head */}
            <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[16px] border-l-gray-400" />
            {/* Problem box */}
            <div className="ml-1 bg-red-100 border-2 border-red-400 rounded-lg px-4 py-2.5 shrink-0 max-w-[240px]">
              <div className="text-[10px] text-red-500 uppercase font-bold tracking-wide">Effect / Problem</div>
              <div className="text-xs font-bold text-red-800 mt-0.5 leading-snug">{fishbone.problem}</div>
            </div>
          </div>

          {/* Bottom categories */}
          <div className="grid grid-cols-3 gap-4 mt-2">
            {bottomCats.map((cat) => {
              const colors = getColors(cat.name)
              return (
                <div key={cat.name} className="flex flex-col items-center">
                  {/* Angled bone (up toward spine) */}
                  <div className="relative h-8 w-full flex justify-center">
                    <div className={cn('w-0.5 h-full', colors.bone)} />
                  </div>
                  {/* Category label */}
                  <div className={cn('text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-2', colors.bg, colors.text, 'border', colors.border)}>
                    {cat.name}
                  </div>
                  {/* Cause cards */}
                  <div className="space-y-1 w-full">
                    {cat.causes.map((cause) => (
                      <button
                        key={cause.id}
                        onClick={() => { setSelectedCause(cause); setSelectedCategory(cat.name) }}
                        className={cn(
                          'w-full text-left text-xs p-1.5 rounded border transition-all hover:shadow-sm',
                          cause.isContributing
                            ? 'bg-amber-50 border-amber-300 hover:border-amber-400'
                            : `${colors.bg} ${colors.border} hover:opacity-80`
                        )}
                      >
                        <div className="flex items-center gap-1">
                          {cause.isContributing && (
                            <span className="relative flex h-2 w-2 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                            </span>
                          )}
                          <span className={cn('font-medium truncate', cause.isContributing ? 'text-amber-800' : colors.text)}>
                            {cause.text}
                          </span>
                        </div>
                      </button>
                    ))}
                    {cat.causes.length === 0 && (
                      <div className="text-[10px] text-gray-400 italic text-center py-1">No causes</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            Contributing factor
          </div>
          <div className="text-gray-400">Click on a cause to view details</div>
        </div>
      </div>

      {/* Cause Detail Popup/Panel */}
      {selectedCause && (
        <div className="bg-white rounded-lg border border-amber-200 shadow-md p-4 relative">
          <button
            onClick={() => { setSelectedCause(null); setSelectedCategory(null) }}
            className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xs"
          >
            x
          </button>
          <div className="flex items-center gap-2 mb-3">
            <div className={cn(
              'text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded',
              selectedCause.isContributing ? 'bg-amber-200 text-amber-800' : 'bg-gray-200 text-gray-700'
            )}>
              {selectedCategory}
            </div>
            {selectedCause.isContributing && (
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Contributing Factor</span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-gray-800 mb-2">{selectedCause.text}</h4>
          {selectedCause.subCauses.length > 0 ? (
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1.5">Sub-causes / Details:</div>
              <ul className="space-y-1">
                {selectedCause.subCauses.map((sc, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className={cn(
                      'w-1.5 h-1.5 rounded-full shrink-0',
                      selectedCause.isContributing ? 'bg-amber-400' : 'bg-gray-300'
                    )} />
                    {sc}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-xs text-gray-400 italic">No sub-causes documented</div>
          )}
          <div className="mt-3 pt-2 border-t text-xs text-gray-400">
            Cause ID: {selectedCause.id}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// 8D Report Tab
// ============================================================================
function EightDTab({ rca }: { rca: RCA }) {
  const report = rca.eightDReport
  const steps = [
    { label: 'D1: Team Formation', content: <D1Content report={report} /> },
    { label: 'D2: Problem Description', content: <p className="text-sm">{report.d2ProblemDescription}</p> },
    { label: 'D3: Interim Containment', content: <p className="text-sm">{report.d3InterimContainment}</p> },
    { label: 'D4: Root Cause Analysis', content: <p className="text-sm">{report.d4RootCauseAnalysis}</p> },
    { label: 'D5: Corrective Actions', content: <ActionsTable actions={report.d5CorrectiveActions} /> },
    { label: 'D6: Implementation', content: <p className="text-sm">{report.d6Implementation}</p> },
    { label: 'D7: Preventive Actions', content: <ActionsTable actions={report.d7PreventiveActions} /> },
    { label: 'D8: Team Recognition', content: <p className="text-sm">{report.d8TeamRecognition || 'Pending'}</p> },
  ]

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">8D Problem Solving Report</h3>
          <div className="text-xs text-gray-500">
            {report.status.filter(s => s === 'completed').length}/8 steps completed
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex gap-1 mb-6">
          {report.status.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={cn(
                'w-full h-2 rounded',
                s === 'completed' ? 'bg-green-500' :
                s === 'in_progress' ? 'bg-amber-500' :
                'bg-gray-200'
              )} />
              <span className="text-[10px] text-gray-500">D{i + 1}</span>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={i} className={cn(
              'rounded-lg border p-3',
              report.status[i] === 'completed' ? 'bg-green-50 border-green-200' :
              report.status[i] === 'in_progress' ? 'bg-amber-50 border-amber-200' :
              'bg-gray-50'
            )}>
              <div className="flex items-center gap-2 mb-2">
                <span className={cn(
                  'text-xs font-bold px-2 py-0.5 rounded',
                  report.status[i] === 'completed' ? 'bg-green-200 text-green-800' :
                  report.status[i] === 'in_progress' ? 'bg-amber-200 text-amber-800' :
                  'bg-gray-200 text-gray-600'
                )}>
                  {step.label}
                </span>
                <span className={cn(
                  'text-[10px] capitalize',
                  report.status[i] === 'completed' ? 'text-green-600' :
                  report.status[i] === 'in_progress' ? 'text-amber-600' :
                  'text-gray-400'
                )}>
                  {report.status[i]}
                </span>
              </div>
              {step.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function D1Content({ report }: { report: RCA['eightDReport'] }) {
  return (
    <div className="text-sm space-y-1">
      <div><span className="text-gray-500">Leader:</span> {report.d1TeamFormation.leader}</div>
      <div><span className="text-gray-500">Sponsor:</span> {report.d1TeamFormation.sponsor}</div>
      <div><span className="text-gray-500">Members:</span> {report.d1TeamFormation.members.join(', ')}</div>
    </div>
  )
}

function ActionsTable({ actions }: { actions: RCA['eightDReport']['d5CorrectiveActions'] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs">
        <thead>
          <tr className="border-b">
            <th className="text-left py-1.5 px-2">Action</th>
            <th className="text-left py-1.5 px-2">Assigned To</th>
            <th className="text-left py-1.5 px-2">Target</th>
            <th className="text-left py-1.5 px-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((action) => (
            <tr key={action.id} className="border-b last:border-0">
              <td className="py-2 px-2">{action.description}</td>
              <td className="py-2 px-2 text-gray-600">{action.assignedTo}</td>
              <td className="py-2 px-2 text-gray-600">{formatDate(action.targetDate)}</td>
              <td className="py-2 px-2">
                <span className={cn(
                  'px-1.5 py-0.5 rounded font-medium',
                  action.status === 'completed' || action.status === 'verified' ? 'bg-green-100 text-green-700' :
                  action.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-600'
                )}>
                  {action.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================================================
// Enhanced CAPA Tracking Tab
// ============================================================================
function CAPATrackingTab() {
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAction, setQuickAction] = useState({ description: '', assignedTo: '', targetDate: '', type: 'Corrective' as 'Corrective' | 'Preventive', rcaNumber: rcaRecords[0]?.rcaNumber || '' })

  // Collect all actions from all RCAs
  const allActions = rcaRecords.flatMap((rca) => [
    ...rca.eightDReport.d5CorrectiveActions.map((a) => ({ ...a, rcaNumber: rca.rcaNumber, rcaId: rca.id, type: 'Corrective' as const })),
    ...rca.eightDReport.d7PreventiveActions.map((a) => ({ ...a, rcaNumber: rca.rcaNumber, rcaId: rca.id, type: 'Preventive' as const })),
  ])

  const pending = allActions.filter(a => a.status === 'pending' || a.status === 'in_progress')
  const completed = allActions.filter(a => a.status === 'completed' || a.status === 'verified')

  // Compute timeline boundaries for Gantt chart
  const allDates = allActions.flatMap(a => [a.targetDate, a.completedDate].filter(Boolean) as string[])
  const minDate = allDates.length > 0 ? new Date(allDates.reduce((a, b) => a < b ? a : b)) : new Date()
  const maxDate = allDates.length > 0 ? new Date(allDates.reduce((a, b) => a > b ? a : b)) : new Date()
  // Add some padding
  const timelineStart = new Date(minDate)
  timelineStart.setDate(timelineStart.getDate() - 7)
  const timelineEnd = new Date(maxDate)
  timelineEnd.setDate(timelineEnd.getDate() + 14)
  const timelineRange = timelineEnd.getTime() - timelineStart.getTime()

  const getTimelinePosition = (dateStr: string) => {
    const d = new Date(dateStr).getTime()
    return Math.max(0, Math.min(100, ((d - timelineStart.getTime()) / timelineRange) * 100))
  }

  const today = new Date()
  const todayPos = getTimelinePosition(today.toISOString())

  const getActionTimelineStatus = (action: typeof allActions[0]) => {
    if (action.status === 'completed' || action.status === 'verified') return 'completed'
    const target = new Date(action.targetDate)
    const now = new Date()
    const daysUntil = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntil < 0) return 'overdue'
    if (daysUntil <= 7) return 'at_risk'
    return 'on_track'
  }

  const timelineBarColor: Record<string, string> = {
    completed: 'bg-green-500',
    on_track: 'bg-green-400',
    at_risk: 'bg-amber-400',
    overdue: 'bg-red-500',
  }

  const handleQuickAdd = () => {
    if (!quickAction.description.trim() || !quickAction.assignedTo.trim() || !quickAction.targetDate) {
      toast.error('Description, Assigned To, and Target Date are required')
      return
    }
    toast.success(`Action added: "${quickAction.description}" assigned to ${quickAction.assignedTo}`)
    setQuickAction({ description: '', assignedTo: '', targetDate: '', type: 'Corrective', rcaNumber: rcaRecords[0]?.rcaNumber || '' })
    setShowQuickAdd(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 uppercase">Total Actions</div>
          <div className="text-3xl font-bold mt-1">{allActions.length}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 uppercase">Open / In Progress</div>
          <div className="text-3xl font-bold text-amber-600 mt-1">{pending.length}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 uppercase">Completed / Verified</div>
          <div className="text-3xl font-bold text-green-600 mt-1">{completed.length}</div>
        </div>
      </div>

      {/* Gantt-like Timeline */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold">Action Timeline</h3>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-green-400 inline-block" /> On Track</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-amber-400 inline-block" /> At Risk</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-red-500 inline-block" /> Overdue</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-green-500 inline-block" /> Completed</span>
          </div>
        </div>
        <div className="p-4 overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Timeline header */}
            <div className="flex items-center mb-3">
              <div className="w-48 shrink-0 text-xs font-medium text-gray-500">Action</div>
              <div className="flex-1 relative h-5">
                {/* Month markers */}
                {(() => {
                  const months: { label: string; pos: number }[] = []
                  const cur = new Date(timelineStart)
                  cur.setDate(1)
                  cur.setMonth(cur.getMonth() + 1)
                  while (cur <= timelineEnd) {
                    const pos = getTimelinePosition(cur.toISOString())
                    months.push({ label: cur.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }), pos })
                    cur.setMonth(cur.getMonth() + 1)
                  }
                  return months.map((m, i) => (
                    <div key={i} className="absolute text-[9px] text-gray-400 -translate-x-1/2" style={{ left: `${m.pos}%` }}>
                      {m.label}
                    </div>
                  ))
                })()}
              </div>
            </div>

            {/* Timeline rows */}
            <div className="space-y-1.5">
              {allActions.map((action) => {
                const status = getActionTimelineStatus(action)
                const targetPos = getTimelinePosition(action.targetDate)
                const completedPos = action.completedDate ? getTimelinePosition(action.completedDate) : null
                // Bar starts from a reference point (e.g., 30 days before target)
                const barStart = Math.max(0, targetPos - 15)
                const barEnd = completedPos !== null ? completedPos : (status === 'overdue' ? todayPos : targetPos)
                const barWidth = Math.max(2, barEnd - barStart)

                return (
                  <div key={action.id} className="flex items-center group">
                    <div className="w-48 shrink-0 text-[10px] text-gray-600 truncate pr-2" title={action.description}>
                      <span className="font-mono text-amber-600">{action.rcaNumber.slice(-5)}</span>{' '}
                      {action.description.length > 30 ? action.description.slice(0, 30) + '...' : action.description}
                    </div>
                    <div className="flex-1 relative h-5 bg-gray-50 rounded">
                      {/* Today marker */}
                      <div className="absolute top-0 bottom-0 w-px bg-blue-300 z-10" style={{ left: `${todayPos}%` }} />
                      {/* Bar */}
                      <div
                        className={cn('absolute top-1 h-3 rounded-sm transition-all', timelineBarColor[status])}
                        style={{ left: `${barStart}%`, width: `${barWidth}%` }}
                        title={`Target: ${formatDate(action.targetDate)}${action.completedDate ? ` | Completed: ${formatDate(action.completedDate)}` : ''}`}
                      />
                      {/* Target marker */}
                      <div
                        className="absolute top-0 bottom-0 w-px border-l border-dashed border-gray-400"
                        style={{ left: `${targetPos}%` }}
                        title={`Target: ${formatDate(action.targetDate)}`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Today label */}
            <div className="flex items-center mt-2">
              <div className="w-48 shrink-0" />
              <div className="flex-1 relative h-4">
                <div className="absolute text-[9px] text-blue-500 font-medium -translate-x-1/2" style={{ left: `${todayPos}%` }}>
                  Today
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Action Form */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold">Quick Add Action</h3>
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
          >
            {showQuickAdd ? 'Cancel' : '+ Quick Add'}
          </button>
        </div>
        {showQuickAdd && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-700 block mb-1">Action Description</label>
                <input
                  type="text"
                  value={quickAction.description}
                  onChange={(e) => setQuickAction({ ...quickAction, description: e.target.value })}
                  placeholder="Describe the corrective or preventive action..."
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Assigned To</label>
                <input
                  type="text"
                  value={quickAction.assignedTo}
                  onChange={(e) => setQuickAction({ ...quickAction, assignedTo: e.target.value })}
                  placeholder="Name"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Target Date</label>
                <input
                  type="date"
                  value={quickAction.targetDate}
                  onChange={(e) => setQuickAction({ ...quickAction, targetDate: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Type</label>
                <select
                  value={quickAction.type}
                  onChange={(e) => setQuickAction({ ...quickAction, type: e.target.value as 'Corrective' | 'Preventive' })}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
                >
                  <option value="Corrective">Corrective</option>
                  <option value="Preventive">Preventive</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Related RCA</label>
                <select
                  value={quickAction.rcaNumber}
                  onChange={(e) => setQuickAction({ ...quickAction, rcaNumber: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
                >
                  {rcaRecords.map((rca) => (
                    <option key={rca.id} value={rca.rcaNumber}>{rca.rcaNumber}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleQuickAdd}
                className="px-4 py-2 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
              >
                Add Action
              </button>
              <button
                onClick={() => { setShowQuickAdd(false); setQuickAction({ description: '', assignedTo: '', targetDate: '', type: 'Corrective', rcaNumber: rcaRecords[0]?.rcaNumber || '' }) }}
                className="px-4 py-2 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Open Actions with status indicators */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold">Open Corrective & Preventive Actions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">RCA</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pending.map((action) => {
                const tlStatus = getActionTimelineStatus(action)
                const daysUntil = Math.ceil((new Date(action.targetDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                return (
                  <tr key={action.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-amber-600">{action.rcaNumber}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-xs px-1.5 py-0.5 rounded',
                        action.type === 'Corrective' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                      )}>
                        {action.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">{action.description}</td>
                    <td className="px-4 py-3 text-gray-600">{action.assignedTo}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(action.targetDate)}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded',
                        action.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                      )}>
                        {action.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded',
                        tlStatus === 'overdue' ? 'bg-red-100 text-red-700' :
                        tlStatus === 'at_risk' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      )}>
                        {tlStatus === 'overdue' ? `${Math.abs(daysUntil)}d overdue` :
                         tlStatus === 'at_risk' ? `${daysUntil}d left` :
                         `${daysUntil}d left`}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completed Actions with Effectiveness Verification */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold">Completed Actions & Effectiveness Verification</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">RCA</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">On Time?</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Verification</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Effectiveness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {completed.map((action) => {
                const completedOnTime = action.completedDate ? new Date(action.completedDate) <= new Date(action.targetDate) : false
                const isVerified = action.status === 'verified'
                return (
                  <tr key={action.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-amber-600">{action.rcaNumber}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-xs px-1.5 py-0.5 rounded',
                        action.type === 'Corrective' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                      )}>
                        {action.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">{action.description}</td>
                    <td className="px-4 py-3 text-gray-600">{action.completedDate ? formatDate(action.completedDate) : '-'}</td>
                    <td className="px-4 py-3">
                      {action.completedDate ? (
                        <span className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded',
                          completedOnTime ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        )}>
                          {completedOnTime ? 'On Time' : 'Late'}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-[200px] truncate" title={action.verificationNotes || undefined}>
                      {action.verificationNotes || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" /></svg>
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Linked Reports */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-semibold mb-3">Linked RCA & 8D Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {rcaRecords.map((rca) => {
            const rcaActions = allActions.filter(a => a.rcaNumber === rca.rcaNumber)
            const rcaCompleted = rcaActions.filter(a => a.status === 'completed' || a.status === 'verified').length
            const rcaTotal = rcaActions.length
            const progress = rcaTotal > 0 ? Math.round((rcaCompleted / rcaTotal) * 100) : 0
            return (
              <div key={rca.id} className="border rounded-lg p-3 hover:border-amber-300 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-amber-600 font-medium">{rca.rcaNumber}</span>
                  <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', rcaStatusColors[rca.status])}>
                    {rca.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-xs text-gray-700 font-medium truncate mb-2" title={rca.title}>{rca.title}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className={cn('h-1.5 rounded-full transition-all', progress === 100 ? 'bg-green-500' : 'bg-amber-400')} style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-500 shrink-0">{rcaCompleted}/{rcaTotal} actions</span>
                </div>
                <div className="mt-2 flex gap-1 flex-wrap">
                  {rca.linkedNCRs.map(ncr => (
                    <span key={ncr} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{ncr}</span>
                  ))}
                  {rca.capaIds.map(capa => (
                    <span key={capa} className="text-[9px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">{capa}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
