// @ts-nocheck
'use client'

import { useState } from 'react'
import { cn, formatDate } from '@/lib/utils'
import { ndaRecords, type NDARecord } from '@/lib/data/customer-data'

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
  terminated: 'bg-gray-100 text-gray-700',
}

function daysUntilExpiry(expiryDate: string): number | null {
  if (!expiryDate) return null
  const now = new Date('2026-03-21')
  const expiry = new Date(expiryDate)
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export default function NDATracking() {
  const [filter, setFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)

  const filtered = filter === 'all' ? ndaRecords : ndaRecords.filter(n => n.status === filter)

  const activeCount = ndaRecords.filter(n => n.status === 'active').length
  const expiringCount = ndaRecords.filter(n => {
    const days = daysUntilExpiry(n.expiryDate)
    return n.status === 'active' && days !== null && days <= 90
  }).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['all', 'active', 'expired', 'pending'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium capitalize',
                filter === f ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 bg-amber-600 text-white rounded-md text-xs font-medium hover:bg-amber-700"
        >
          + New NDA
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-3 text-center">
          <div className="text-2xl font-bold text-gray-800">{ndaRecords.length}</div>
          <div className="text-xs text-gray-500">Total NDAs</div>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          <div className="text-xs text-gray-500">Active</div>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center">
          <div className="text-2xl font-bold text-amber-600">{expiringCount}</div>
          <div className="text-xs text-gray-500">Expiring Soon (&lt;90d)</div>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center">
          <div className="text-2xl font-bold text-red-600">{ndaRecords.filter(n => n.status === 'expired').length}</div>
          <div className="text-xs text-gray-500">Expired</div>
        </div>
      </div>

      {/* Renewal Alerts */}
      {expiringCount > 0 && (
        <div className="bg-amber-50 rounded-lg border border-amber-200 p-3">
          <h3 className="text-xs font-semibold text-amber-800 mb-2">Renewal Alerts</h3>
          <div className="space-y-1">
            {ndaRecords.filter(n => {
              const days = daysUntilExpiry(n.expiryDate)
              return n.status === 'active' && days !== null && days <= 90
            }).map(n => {
              const days = daysUntilExpiry(n.expiryDate)!
              return (
                <div key={n.id} className="flex items-center justify-between bg-white rounded p-2 text-xs">
                  <div>
                    <span className="font-medium">{n.ndaId}</span> — {n.company}
                  </div>
                  <span className={cn('font-bold', days <= 30 ? 'text-red-600' : 'text-amber-600')}>
                    {days}d until expiry
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {showForm && <NDAForm onClose={() => setShowForm(false)} />}

      {/* NDA Table */}
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">NDA ID</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Customer / Company</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Effective</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Expiry</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Scope</th>
              <th className="px-4 py-2 text-center font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Document</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map(n => {
              const days = daysUntilExpiry(n.expiryDate)
              return (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-amber-600 font-medium">{n.ndaId}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{n.customerName}</div>
                    <div className="text-gray-500">{n.company}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{n.effectiveDate || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-600">{n.expiryDate || '-'}</div>
                    {days !== null && n.status === 'active' && (
                      <div className={cn('text-[10px] font-medium', days <= 30 ? 'text-red-600' : days <= 90 ? 'text-amber-600' : 'text-gray-500')}>
                        {days}d remaining
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{n.scope}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('px-2 py-0.5 rounded font-medium', statusColors[n.status])}>
                      {n.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {n.documentRef ? (
                      <span className="text-blue-600 hover:underline cursor-pointer">{n.documentRef}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function NDAForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="bg-white rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Register New NDA</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">Close</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Customer Name</label>
          <input type="text" className="w-full border rounded px-3 py-1.5 text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Company</label>
          <input type="text" className="w-full border rounded px-3 py-1.5 text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Effective Date</label>
          <input type="date" className="w-full border rounded px-3 py-1.5 text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Expiry Date</label>
          <input type="date" className="w-full border rounded px-3 py-1.5 text-xs" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Scope</label>
          <textarea rows={2} className="w-full border rounded px-3 py-1.5 text-xs" placeholder="Describe the NDA scope..." />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t">
        <button onClick={onClose} className="px-3 py-1.5 text-xs border rounded-md text-gray-600 hover:bg-gray-50">Cancel</button>
        <button onClick={onClose} className="px-4 py-1.5 text-xs bg-amber-600 text-white rounded-md hover:bg-amber-700 font-medium">Save NDA</button>
      </div>
    </div>
  )
}
