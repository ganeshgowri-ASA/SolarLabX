// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getStatusColor, formatDate } from '@/lib/utils'
import CAPAForm from '@/components/qms/CAPAForm'
import type { CAPA } from '@/lib/types'

export default function CAPAPage() {
  const [capas, setCAPAs] = useState<CAPA[]>([])
  const [stats, setStats] = useState({ total: 0, open: 0, corrective: 0, preventive: 0, overdue: 0 })
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)

  const fetchCAPAs = () => {
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    fetch(`/api/qms/capa?${params}`).then(r => r.json()).then(d => { setCAPAs(d.capas); setStats(d.stats) })
  }

  useEffect(() => { fetchCAPAs() }, [statusFilter])

  const handleCreateCAPA = async (data: Record<string, unknown>) => {
    await fetch('/api/qms/capa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setShowForm(false)
    fetchCAPAs()
  }

  if (showForm) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New CAPA</h1>
        <CAPAForm onSubmit={handleCreateCAPA} onCancel={() => setShowForm(false)} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CAPA Management</h1>
          <p className="text-sm text-gray-500">Corrective and Preventive Actions with 8D methodology</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-amber-500 text-white rounded-md text-sm font-medium hover:bg-amber-600">
          + New CAPA
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        <div className="bg-white rounded-lg border p-3 text-center">
          <div className="text-xl font-bold">{stats.total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center">
          <div className="text-xl font-bold text-amber-600">{stats.open}</div>
          <div className="text-xs text-gray-500">Open</div>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center">
          <div className="text-xl font-bold text-red-600">{stats.corrective}</div>
          <div className="text-xs text-gray-500">Corrective</div>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center">
          <div className="text-xl font-bold text-blue-600">{stats.preventive}</div>
          <div className="text-xs text-gray-500">Preventive</div>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center">
          <div className="text-xl font-bold text-red-700">{stats.overdue}</div>
          <div className="text-xs text-gray-500">Overdue</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex gap-2">
          {['all', 'open', 'investigation', 'root_cause_identified', 'corrective_action_implemented', 'closed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-md text-xs font-medium ${statusFilter === s ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s === 'all' ? 'All' : s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="divide-y">
          {capas.map(capa => {
            const completedSteps = capa.eightDSteps.filter(s => s.status === 'completed').length
            return (
              <Link key={capa.id} href={`/qms/capa/${capa.id}`}>
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-amber-600">{capa.capaNumber}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${capa.type === 'corrective' ? 'bg-red-100 text-red-700' : capa.type === 'preventive' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {capa.type}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(capa.priority)}`}>
                        {capa.priority}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 mt-1">{capa.title}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Source: {capa.source} | Assigned: {capa.assignedTo} | Target: {formatDate(capa.targetCompletionDate)}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="text-xs text-gray-500">8D Progress:</div>
                      <div className="flex gap-0.5">
                        {capa.eightDSteps.map((step, idx) => (
                          <div key={idx} className={`w-4 h-2 rounded-sm ${step.status === 'completed' ? 'bg-green-500' : step.status === 'in_progress' ? 'bg-amber-500' : 'bg-gray-200'}`} title={step.title} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">{completedSteps}/8</span>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(capa.status.includes('closed') || capa.status.includes('verified') ? 'completed' : 'in_progress')}`}>
                    {capa.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </Link>
            )
          })}
          {capas.length === 0 && <div className="p-8 text-center text-gray-500 text-sm">No CAPAs found</div>}
        </div>
      </div>
    </div>
  )
}
