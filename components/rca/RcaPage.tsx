'use client'

import { useState } from 'react'
import { cn, formatDate, getStatusColor } from '@/lib/utils'
import { rcaRecords, rcaMetrics } from '@/lib/data/rca-data'
import type { RCA, FishboneData } from '@/lib/types'

type TabKey = 'dashboard' | '5-why' | 'fishbone' | '8d-report' | 'capa-tracking'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'dashboard', label: 'RCA Dashboard' },
  { key: '5-why', label: '5-Why Analysis' },
  { key: 'fishbone', label: 'Fishbone / Ishikawa' },
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
// 5-Why Analysis Tab
// ============================================================================
function FiveWhyTab({ rca }: { rca: RCA }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-semibold mb-1">Problem Statement</h3>
        <p className="text-sm text-gray-700">{rca.description}</p>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-semibold mb-4">5-Why Analysis</h3>
        <div className="space-y-0">
          {rca.fiveWhys.map((why, i) => (
            <div key={i} className="relative">
              {/* Connecting Line */}
              {i < rca.fiveWhys.length - 1 && (
                <div className="absolute left-5 top-14 bottom-0 w-0.5 bg-amber-200" />
              )}

              <div className={cn(
                'relative flex gap-4 p-3 rounded-lg mb-2',
                why.isRootCause ? 'bg-red-50 border border-red-200' : 'hover:bg-gray-50'
              )}>
                {/* Why Number Circle */}
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm',
                  why.isRootCause ? 'bg-red-500 text-white' : 'bg-amber-100 text-amber-700'
                )}>
                  W{why.level}
                </div>

                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{why.question}</div>
                  <div className="text-sm text-gray-600 mt-1">{why.answer}</div>
                  {why.evidence && (
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded">Evidence:</span> {why.evidence}
                    </div>
                  )}
                  {why.isRootCause && (
                    <div className="text-xs font-bold text-red-600 mt-2 bg-red-100 px-2 py-1 rounded inline-block">
                      ROOT CAUSE IDENTIFIED
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Fishbone / Ishikawa Diagram Tab
// ============================================================================
function FishboneTab({ fishbone }: { fishbone: FishboneData }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-semibold mb-4">Fishbone / Ishikawa Diagram</h3>

        {/* Problem Statement - Center */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-red-100 border-2 border-red-300 rounded-lg px-6 py-3 text-center">
            <div className="text-xs text-red-500 uppercase font-medium">Effect / Problem</div>
            <div className="text-sm font-bold text-red-800 mt-1">{fishbone.problem}</div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fishbone.categories.map((cat) => (
            <div key={cat.name} className={cn(
              'rounded-lg border p-3',
              cat.causes.some(c => c.isContributing) ? 'bg-amber-50 border-amber-200' : 'bg-gray-50'
            )}>
              <div className={cn(
                'text-xs font-bold uppercase tracking-wide mb-2 px-2 py-1 rounded inline-block',
                cat.causes.some(c => c.isContributing) ? 'bg-amber-200 text-amber-800' : 'bg-gray-200 text-gray-700'
              )}>
                {cat.name}
              </div>

              {cat.causes.length === 0 ? (
                <div className="text-xs text-gray-400 italic">No causes identified</div>
              ) : (
                <div className="space-y-2">
                  {cat.causes.map((cause) => (
                    <div key={cause.id} className={cn(
                      'text-sm p-2 rounded',
                      cause.isContributing ? 'bg-amber-100 border border-amber-300' : 'bg-white border'
                    )}>
                      <div className="flex items-center gap-1">
                        {cause.isContributing && <span className="text-amber-600 text-xs">*</span>}
                        <span className={cn('font-medium', cause.isContributing ? 'text-amber-800' : 'text-gray-700')}>
                          {cause.text}
                        </span>
                      </div>
                      {cause.subCauses.length > 0 && (
                        <ul className="mt-1 ml-3 space-y-0.5">
                          {cause.subCauses.map((sc, i) => (
                            <li key={i} className="text-xs text-gray-500 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-gray-300" />
                              {sc}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t text-xs text-gray-500">
          <span className="text-amber-600">*</span> Contributing factors are highlighted
        </div>
      </div>
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
// CAPA Tracking Tab
// ============================================================================
function CAPATrackingTab() {
  // Collect all actions from all RCAs
  const allActions = rcaRecords.flatMap((rca) => [
    ...rca.eightDReport.d5CorrectiveActions.map((a) => ({ ...a, rcaNumber: rca.rcaNumber, type: 'Corrective' as const })),
    ...rca.eightDReport.d7PreventiveActions.map((a) => ({ ...a, rcaNumber: rca.rcaNumber, type: 'Preventive' as const })),
  ])

  const pending = allActions.filter(a => a.status === 'pending' || a.status === 'in_progress')
  const completed = allActions.filter(a => a.status === 'completed' || a.status === 'verified')

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

      {/* Open Actions */}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pending.map((action) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completed Actions */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold">Completed Actions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">RCA</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {completed.map((action) => (
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
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-700">
                      {action.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{action.verificationNotes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
