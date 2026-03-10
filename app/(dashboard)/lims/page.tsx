// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getStatusColor } from '@/lib/utils'
import type { Sample, TestExecution, Equipment } from '@/lib/types'
import CalibrationAlert from '@/components/lims/CalibrationAlert'

export default function LIMSDashboard() {
  const [sampleStats, setSampleStats] = useState({ total: 0, received: 0, inTest: 0, completed: 0, pendingReview: 0 })
  const [testStats, setTestStats] = useState({ total: 0, inProgress: 0, pendingReview: 0, completed: 0, failed: 0 })
  const [equipmentStats, setEquipmentStats] = useState({ total: 0, available: 0, inUse: 0, maintenance: 0, calibrationDueSoon: 0 })
  const [recentSamples, setRecentSamples] = useState<Sample[]>([])
  const [activeTests, setActiveTests] = useState<TestExecution[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])

  useEffect(() => {
    fetch('/api/lims/samples').then(r => r.json()).then(d => { setSampleStats(d.stats); setRecentSamples(d.samples.slice(0, 5)) })
    fetch('/api/lims/tests').then(r => r.json()).then(d => { setTestStats(d.stats); setActiveTests(d.tests.filter((t: TestExecution) => ['in_progress', 'pending_review'].includes(t.status))) })
    fetch('/api/lims/equipment').then(r => r.json()).then(d => { setEquipmentStats(d.stats); setEquipment(d.equipment) })
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">LIMS Dashboard</h1>
          <p className="text-sm text-gray-500">Laboratory Information Management System</p>
        </div>
        <Link href="/lims/samples" className="px-4 py-2 bg-amber-500 text-white rounded-md text-sm font-medium hover:bg-amber-600">
          Register New Sample
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500">Total Samples</div>
          <div className="text-2xl font-bold">{sampleStats.total}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500">Received</div>
          <div className="text-2xl font-bold text-blue-600">{sampleStats.received}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500">In Test</div>
          <div className="text-2xl font-bold text-yellow-600">{sampleStats.inTest}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500">Pending Review</div>
          <div className="text-2xl font-bold text-amber-600">{sampleStats.pendingReview}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500">Completed</div>
          <div className="text-2xl font-bold text-green-600">{sampleStats.completed}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Recent Samples</h2>
            <Link href="/lims/samples" className="text-xs text-amber-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-2">
            {recentSamples.map(sample => (
              <Link key={sample.id} href={`/lims/samples/${sample.id}`}>
                <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer">
                  <div>
                    <div className="text-sm font-medium">{sample.sampleId}</div>
                    <div className="text-xs text-gray-500">{sample.clientName} - {sample.modelNumber}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(sample.status)}`}>
                      {sample.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Active Tests</h2>
            <Link href="/lims/tests" className="text-xs text-amber-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-2">
            {activeTests.map(test => (
              <Link key={test.id} href={`/lims/tests/${test.id}`}>
                <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer">
                  <div>
                    <div className="text-sm font-medium">{test.executionNumber}</div>
                    <div className="text-xs text-gray-500">{test.protocolName}</div>
                    <div className="text-xs text-gray-400">{test.standardReference}</div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(test.status)}`}>
                    {test.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </Link>
            ))}
            {activeTests.length === 0 && <p className="text-sm text-gray-500">No active tests</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Equipment Status</h2>
            <Link href="/lims/equipment" className="text-xs text-amber-600 hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 bg-green-50 rounded text-center">
              <div className="text-lg font-bold text-green-700">{equipmentStats.available}</div>
              <div className="text-xs text-green-600">Available</div>
            </div>
            <div className="p-2 bg-blue-50 rounded text-center">
              <div className="text-lg font-bold text-blue-700">{equipmentStats.inUse}</div>
              <div className="text-xs text-blue-600">In Use</div>
            </div>
            <div className="p-2 bg-orange-50 rounded text-center">
              <div className="text-lg font-bold text-orange-700">{equipmentStats.maintenance}</div>
              <div className="text-xs text-orange-600">Maintenance</div>
            </div>
            <div className="p-2 bg-red-50 rounded text-center">
              <div className="text-lg font-bold text-red-700">{equipmentStats.calibrationDueSoon}</div>
              <div className="text-xs text-red-600">Cal. Due Soon</div>
            </div>
          </div>
        </div>

        <CalibrationAlert equipment={equipment} />
      </div>
    </div>
  )
}
