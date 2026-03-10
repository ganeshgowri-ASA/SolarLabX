// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getStatusColor } from '@/lib/utils'
import { ALL_TEST_TEMPLATES } from '@/lib/test-templates'
import type { TestExecution } from '@/lib/types'

const STANDARD_GROUPS = [
  { label: 'All Standards', value: '' },
  { label: 'IEC 61215', value: 'IEC 61215' },
  { label: 'IEC 61730', value: 'IEC 61730' },
  { label: 'IEC 61853', value: 'IEC 61853' },
  { label: 'IEC 60904', value: 'IEC 60904' },
]

export default function TestsPage() {
  const [tests, setTests] = useState<TestExecution[]>([])
  const [stats, setStats] = useState({ total: 0, inProgress: 0, pendingReview: 0, completed: 0, failed: 0 })
  const [statusFilter, setStatusFilter] = useState('all')
  const [standardFilter, setStandardFilter] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (standardFilter) params.set('standard', standardFilter)
    fetch(`/api/lims/tests?${params}`).then(r => r.json()).then(d => { setTests(d.tests); setStats(d.stats) })
  }, [statusFilter, standardFilter])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Execution</h1>
          <p className="text-sm text-gray-500">Dynamic IEC test templates and data entry</p>
        </div>
        <button onClick={() => setShowTemplates(!showTemplates)} className="px-4 py-2 bg-amber-500 text-white rounded-md text-sm font-medium hover:bg-amber-600">
          {showTemplates ? 'View Tests' : 'Browse Templates'}
        </button>
      </div>

      {showTemplates ? (
        <div>
          <div className="flex gap-2 mb-4">
            {STANDARD_GROUPS.map(g => (
              <button key={g.value} onClick={() => setStandardFilter(g.value)} className={`px-3 py-1.5 rounded-md text-xs font-medium ${standardFilter === g.value ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {g.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ALL_TEST_TEMPLATES
              .filter(t => !standardFilter || t.standard.includes(standardFilter))
              .map(template => (
                <div key={template.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{template.name}</h3>
                      <p className="text-xs text-gray-500">{template.standard} - Clause {template.clause}</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{template.category}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">{template.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {template.requiredEquipment.slice(0, 3).map(eq => (
                        <span key={eq} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{eq}</span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">~{template.estimatedDurationHours}h</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {template.inputParameters.length} parameters | {template.acceptanceCriteria.length} criteria | {template.testSequence.length} steps
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="bg-white rounded-lg border p-3 text-center">
              <div className="text-xl font-bold">{stats.total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="bg-white rounded-lg border p-3 text-center">
              <div className="text-xl font-bold text-yellow-600">{stats.inProgress}</div>
              <div className="text-xs text-gray-500">In Progress</div>
            </div>
            <div className="bg-white rounded-lg border p-3 text-center">
              <div className="text-xl font-bold text-amber-600">{stats.pendingReview}</div>
              <div className="text-xs text-gray-500">Pending Review</div>
            </div>
            <div className="bg-white rounded-lg border p-3 text-center">
              <div className="text-xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div className="bg-white rounded-lg border p-3 text-center">
              <div className="text-xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-xs text-gray-500">Failed</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b flex gap-2">
              {['all', 'in_progress', 'pending_review', 'completed', 'not_started'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-md text-xs font-medium ${statusFilter === s ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {s === 'all' ? 'All' : s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            <div className="divide-y">
              {tests.map(test => (
                <Link key={test.id} href={`/lims/tests/${test.id}`}>
                  <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer">
                    <div>
                      <div className="text-sm font-medium">{test.executionNumber}</div>
                      <div className="text-xs text-gray-500">{test.protocolName}</div>
                      <div className="text-xs text-gray-400">{test.standardReference} | Technician: {test.technicianName}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {test.testPassed !== null && (
                        <span className={`text-xs font-bold ${test.testPassed ? 'text-green-600' : 'text-red-600'}`}>
                          {test.testPassed ? 'PASS' : 'FAIL'}
                        </span>
                      )}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(test.status)}`}>
                        {test.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              {tests.length === 0 && <div className="p-8 text-center text-gray-500 text-sm">No tests found</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
