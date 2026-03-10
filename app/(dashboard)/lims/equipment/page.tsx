// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { EQUIPMENT_CATEGORIES } from '@/lib/constants'
import EquipmentCard from '@/components/lims/EquipmentCard'
import CalibrationAlert from '@/components/lims/CalibrationAlert'
import type { Equipment } from '@/lib/types'

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [stats, setStats] = useState({ total: 0, available: 0, inUse: 0, maintenance: 0, calibrationDueSoon: 0 })
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (categoryFilter) params.set('category', categoryFilter)
    if (searchQuery) params.set('search', searchQuery)
    fetch(`/api/lims/equipment?${params}`).then(r => r.json()).then(d => { setEquipment(d.equipment); setStats(d.stats) })
  }, [statusFilter, categoryFilter, searchQuery])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Equipment Registry</h1>
        <p className="text-sm text-gray-500">Instrument management and calibration tracking</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-3 text-center cursor-pointer hover:shadow-sm" onClick={() => setStatusFilter('all')}>
          <div className="text-xl font-bold">{stats.total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center cursor-pointer hover:shadow-sm" onClick={() => setStatusFilter('available')}>
          <div className="text-xl font-bold text-green-600">{stats.available}</div>
          <div className="text-xs text-gray-500">Available</div>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center cursor-pointer hover:shadow-sm" onClick={() => setStatusFilter('in_use')}>
          <div className="text-xl font-bold text-blue-600">{stats.inUse}</div>
          <div className="text-xs text-gray-500">In Use</div>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center cursor-pointer hover:shadow-sm" onClick={() => setStatusFilter('maintenance')}>
          <div className="text-xl font-bold text-orange-600">{stats.maintenance}</div>
          <div className="text-xs text-gray-500">Maintenance</div>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center cursor-pointer hover:shadow-sm">
          <div className="text-xl font-bold text-red-600">{stats.calibrationDueSoon}</div>
          <div className="text-xs text-gray-500">Cal. Due Soon</div>
        </div>
      </div>

      <CalibrationAlert equipment={equipment} />

      <div className="flex flex-wrap items-center gap-3 my-4">
        <input
          type="text"
          placeholder="Search equipment..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">All Categories</option>
          {EQUIPMENT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipment.map(eq => (
          <EquipmentCard key={eq.id} equipment={eq} />
        ))}
      </div>
    </div>
  )
}
