// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getStatusColor } from '@/lib/utils'
import { TEST_STANDARDS, PRIORITY_OPTIONS } from '@/lib/constants'
import SampleForm from '@/components/lims/SampleForm'
import type { Sample } from '@/lib/types'

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'received', label: 'Received' },
  { value: 'inspected', label: 'Inspected' },
  { value: 'allocated', label: 'Allocated' },
  { value: 'in_test', label: 'In Test' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending_review', label: 'Pending Review' },
]

export default function SamplesPage() {
  const [samples, setSamples] = useState<Sample[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)

  const fetchSamples = () => {
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (searchQuery) params.set('search', searchQuery)
    fetch(`/api/lims/samples?${params}`).then(r => r.json()).then(d => setSamples(d.samples))
  }

  useEffect(() => { fetchSamples() }, [statusFilter, searchQuery])

  const handleCreateSample = async (data: Record<string, unknown>) => {
    await fetch('/api/lims/samples', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setShowForm(false)
    fetchSamples()
  }

  if (showForm) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Register New Sample</h1>
        <SampleForm onSubmit={handleCreateSample} onCancel={() => setShowForm(false)} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Samples</h1>
          <p className="text-sm text-gray-500">Sample registration and tracking</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-amber-500 text-white rounded-md text-sm font-medium hover:bg-amber-600">
          + Register Sample
        </button>
      </div>

      <div className="bg-white rounded-lg border mb-4">
        <div className="p-4 border-b flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search samples..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border rounded-md px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <div className="flex gap-1">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${statusFilter === f.value ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Sample ID</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Client</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Module</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Standard</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Priority</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Progress</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {samples.map(sample => (
                <tr key={sample.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/lims/samples/${sample.id}`} className="text-sm font-medium text-amber-600 hover:underline">
                      {sample.sampleId}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{sample.clientName}</div>
                    <div className="text-xs text-gray-500">{sample.clientOrganization}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{sample.manufacturer}</div>
                    <div className="text-xs text-gray-500">{sample.modelNumber}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{sample.testStandard}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${PRIORITY_OPTIONS.find(p => p.value === sample.priority)?.color || ''}`}>
                      {sample.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(sample.status)}`}>
                      {sample.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${sample.testsTotal > 0 ? (sample.testsCompleted / sample.testsTotal) * 100 : 0}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{sample.testsCompleted}/{sample.testsTotal}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{sample.currentLocation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
