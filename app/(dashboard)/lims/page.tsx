// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getStatusColor } from '@/lib/utils'
import type { Sample, TestExecution, Equipment, CustodyEntry } from '@/lib/types'
import CalibrationAlert from '@/components/lims/CalibrationAlert'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ClipboardList,
  ArrowRightLeft,
  MapPin,
  User,
  Clock,
  QrCode,
  Barcode,
  Tag,
  SplitSquareVertical,
  GitBranch,
  ChevronDown,
  Plus,
  Minus,
  Shield,
  Thermometer,
  Lock,
  Unlock,
  Camera,
  FileText,
} from 'lucide-react'

export default function LIMSDashboard() {
  const [sampleStats, setSampleStats] = useState({ total: 0, received: 0, inTest: 0, completed: 0, pendingReview: 0 })
  const [testStats, setTestStats] = useState({ total: 0, inProgress: 0, pendingReview: 0, completed: 0, failed: 0 })
  const [equipmentStats, setEquipmentStats] = useState({ total: 0, available: 0, inUse: 0, maintenance: 0, calibrationDueSoon: 0 })
  const [recentSamples, setRecentSamples] = useState<Sample[]>([])
  const [activeTests, setActiveTests] = useState<TestExecution[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])

  // Chain of Custody state
  const [custodySampleId, setCustodySampleId] = useState<string>('')
  const [custodyHistory, setCustodyHistory] = useState<CustodyEntry[]>([])

  // Sample Splitting state
  const [splitParentId, setSplitParentId] = useState<string>('')
  const [aliquotCount, setAliquotCount] = useState<number>(2)
  const [isSplitting, setIsSplitting] = useState(false)
  const [childSamples, setChildSamples] = useState<{ id: string; label: string }[]>([])
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    fetch('/api/lims/samples').then(r => r.json()).then(d => { setSampleStats(d.stats); setRecentSamples(d.samples.slice(0, 5)) })
    fetch('/api/lims/tests').then(r => r.json()).then(d => { setTestStats(d.stats); setActiveTests(d.tests.filter((t: TestExecution) => ['in_progress', 'pending_review'].includes(t.status))) })
    fetch('/api/lims/equipment').then(r => r.json()).then(d => { setEquipmentStats(d.stats); setEquipment(d.equipment) })
  }, [])

  // When recentSamples load, auto-select the first sample for custody view
  useEffect(() => {
    if (recentSamples.length > 0 && !custodySampleId) {
      const firstWithHistory = recentSamples.find(s => s.custodyHistory && s.custodyHistory.length > 0)
      if (firstWithHistory) {
        setCustodySampleId(firstWithHistory.id)
        setCustodyHistory(firstWithHistory.custodyHistory)
      } else {
        setCustodySampleId(recentSamples[0].id)
        setCustodyHistory(recentSamples[0].custodyHistory || [])
      }
    }
  }, [recentSamples, custodySampleId])

  const handleCustodySampleChange = (sampleId: string) => {
    setCustodySampleId(sampleId)
    const sample = recentSamples.find(s => s.id === sampleId)
    setCustodyHistory(sample?.custodyHistory || [])
  }

  const handleSplit = () => {
    if (!splitParentId) {
      toast.error('Please select a parent sample to split')
      return
    }
    if (aliquotCount < 2 || aliquotCount > 20) {
      toast.error('Number of aliquots must be between 2 and 20')
      return
    }

    setIsSplitting(true)
    const parent = recentSamples.find(s => s.id === splitParentId)
    const parentLabel = parent?.sampleId || splitParentId

    // Simulate split operation
    setTimeout(() => {
      const children = Array.from({ length: aliquotCount }, (_, i) => ({
        id: `${splitParentId}-ALQ-${String(i + 1).padStart(2, '0')}`,
        label: `${parentLabel}-ALQ-${String(i + 1).padStart(2, '0')}`,
      }))
      setChildSamples(children)
      setIsSplitting(false)
      toast.success(`Successfully split ${parentLabel} into ${aliquotCount} aliquots`)
    }, 1200)
  }

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts)
      return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch {
      return ts
    }
  }

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="chain-of-custody">Sample Chain of Custody</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          {/* Chain of Custody Tracking (compact inline) */}
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-amber-600" />
                <h2 className="font-semibold text-sm">Chain of Custody</h2>
              </div>
              <div className="relative">
                <select
                  value={custodySampleId}
                  onChange={e => handleCustodySampleChange(e.target.value)}
                  className="text-xs border rounded-md px-2 py-1.5 pr-7 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">Select sample...</option>
                  {recentSamples.map(s => (
                    <option key={s.id} value={s.id}>{s.sampleId}</option>
                  ))}
                </select>
                <ChevronDown className="h-3 w-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {custodyHistory.length > 0 ? (
              <div className="relative ml-3">
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-amber-200" />
                <div className="space-y-4">
                  {custodyHistory.map((entry, idx) => (
                    <div key={idx} className="relative pl-7">
                      <div
                        className={`absolute left-0 top-1 h-[15px] w-[15px] rounded-full border-2 ${
                          idx === 0 ? 'bg-amber-500 border-amber-600' : 'bg-white border-amber-300'
                        }`}
                      />
                      <div className="bg-gray-50 rounded-md p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">{entry.action}</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(entry.timestamp)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            {entry.fromLocation}
                            <ArrowRightLeft className="h-3 w-3 text-gray-400 mx-0.5" />
                            {entry.toLocation}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3 text-gray-400" />
                            {entry.handledBy}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="text-xs text-gray-500 mt-1 italic">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-6">
                {custodySampleId
                  ? 'No custody history recorded for this sample.'
                  : 'Select a sample to view its chain of custody.'}
              </div>
            )}
          </div>

          {/* Quick Labels & Sample Splitting */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="h-4 w-4 text-amber-600" />
                <h2 className="font-semibold text-sm">Quick Labels</h2>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Generate barcode or QR code labels for sample identification and tracking.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/lims/labels?type=barcode"
                  className="flex items-center justify-center gap-2 px-3 py-3 bg-amber-50 text-amber-700 rounded-md text-sm font-medium hover:bg-amber-100 transition-colors border border-amber-200"
                >
                  <Barcode className="h-4 w-4" />
                  Generate Barcode
                </Link>
                <Link
                  href="/lims/labels?type=qr"
                  className="flex items-center justify-center gap-2 px-3 py-3 bg-amber-50 text-amber-700 rounded-md text-sm font-medium hover:bg-amber-100 transition-colors border border-amber-200"
                >
                  <QrCode className="h-4 w-4" />
                  Generate QR Code
                </Link>
              </div>
              <div className="mt-3">
                <Link
                  href="/lims/labels"
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-600 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <Tag className="h-3 w-3" />
                  Open Label Manager
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-4">
                <GitBranch className="h-4 w-4 text-amber-600" />
                <h2 className="font-semibold text-sm">Sample Splitting</h2>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Split a parent sample into child sub-samples (aliquots) for parallel testing.
              </p>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Parent Sample</label>
                <div className="relative">
                  <select
                    value={splitParentId}
                    onChange={e => { setSplitParentId(e.target.value); setChildSamples([]) }}
                    className="w-full text-sm border rounded-md px-3 py-2 pr-8 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="">Select parent sample...</option>
                    {recentSamples.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.sampleId} - {s.clientName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="h-4 w-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Number of Aliquots</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAliquotCount(prev => Math.max(2, prev - 1))}
                    className="p-1.5 border rounded-md hover:bg-gray-50 text-gray-600"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={aliquotCount}
                    onChange={e => setAliquotCount(Math.min(20, Math.max(2, parseInt(e.target.value) || 2)))}
                    className="w-16 text-center text-sm border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    onClick={() => setAliquotCount(prev => Math.min(20, prev + 1))}
                    className="p-1.5 border rounded-md hover:bg-gray-50 text-gray-600"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-xs text-gray-400 ml-1">sub-samples</span>
                </div>
              </div>
              <button
                onClick={handleSplit}
                disabled={isSplitting || !splitParentId}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-500 text-white rounded-md text-sm font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <SplitSquareVertical className="h-4 w-4" />
                {isSplitting ? 'Splitting...' : 'Split Sample'}
              </button>
              {childSamples.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-medium text-gray-700 mb-2">Generated Aliquots</h3>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {childSamples.map(child => (
                      <div key={child.id} className="flex items-center gap-2 text-xs bg-green-50 text-green-700 px-2 py-1.5 rounded">
                        <GitBranch className="h-3 w-3 flex-shrink-0" />
                        <span className="font-mono">{child.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Sample Chain of Custody Tab */}
        <TabsContent value="chain-of-custody" className="space-y-6">
          <SampleChainOfCustodyTab recentSamples={recentSamples} formatTimestamp={formatTimestamp} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Chain of Custody detailed tab
function SampleChainOfCustodyTab({ recentSamples, formatTimestamp }: { recentSamples: Sample[]; formatTimestamp: (ts: string) => string }) {
  const [selectedSample, setSelectedSample] = useState('')

  const custodyTransfers = [
    { id: 'CT-001', sampleId: 'SPL-2026-0001', action: 'Received', fromPerson: 'Client Rep (Mr. Raj)', toPerson: 'Lab Reception - Priya M.', timestamp: '2026-03-10T09:15:00', fromLocation: 'Client Site', toLocation: 'Lab Reception', temperature: '25°C', humidity: '45% RH', sealStatus: 'Sealed', notes: 'Package intact, no visible damage' },
    { id: 'CT-002', sampleId: 'SPL-2026-0001', action: 'Transferred to Storage', fromPerson: 'Priya M.', toPerson: 'Storage - Amit K.', timestamp: '2026-03-10T10:30:00', fromLocation: 'Lab Reception', toLocation: 'Sample Storage Room A', temperature: '23°C', humidity: '40% RH', sealStatus: 'Unsealed for inspection', notes: 'Visual inspection completed, re-sealed' },
    { id: 'CT-003', sampleId: 'SPL-2026-0001', action: 'Transferred to Test Lab', fromPerson: 'Amit K.', toPerson: 'Test Engineer - Rahul S.', timestamp: '2026-03-12T08:00:00', fromLocation: 'Sample Storage Room A', toLocation: 'Environmental Test Lab', temperature: '25°C', humidity: '50% RH', sealStatus: 'Unsealed', notes: 'Sample mounted for IEC 61215 DH test' },
    { id: 'CT-004', sampleId: 'SPL-2026-0001', action: 'Test Complete - Return', fromPerson: 'Rahul S.', toPerson: 'Storage - Amit K.', timestamp: '2026-03-18T16:30:00', fromLocation: 'Environmental Test Lab', toLocation: 'Sample Storage Room A', temperature: '24°C', humidity: '42% RH', sealStatus: 'Sealed', notes: 'DH1000 test completed, awaiting next test sequence' },
    { id: 'CT-005', sampleId: 'SPL-2026-0002', action: 'Received', fromPerson: 'Courier (DHL)', toPerson: 'Lab Reception - Priya M.', timestamp: '2026-03-14T11:00:00', fromLocation: 'International Client', toLocation: 'Lab Reception', temperature: '28°C', humidity: '55% RH', sealStatus: 'Sealed (customs seal)', notes: 'Customs documentation verified' },
    { id: 'CT-006', sampleId: 'SPL-2026-0002', action: 'Transferred to EL Lab', fromPerson: 'Priya M.', toPerson: 'Test Engineer - Deepa V.', timestamp: '2026-03-15T09:00:00', fromLocation: 'Lab Reception', toLocation: 'EL/IR Imaging Lab', temperature: '23°C', humidity: '38% RH', sealStatus: 'Unsealed', notes: 'Initial EL imaging before environmental tests' },
  ]

  const sealRecords = [
    { id: 'SR-001', sampleId: 'SPL-2026-0001', action: 'Sealed', sealNumber: 'SEAL-2026-0145', timestamp: '2026-03-10T09:20:00', person: 'Priya M.', type: 'Tamper-evident tape', reason: 'Initial receipt sealing' },
    { id: 'SR-002', sampleId: 'SPL-2026-0001', action: 'Unsealed', sealNumber: 'SEAL-2026-0145', timestamp: '2026-03-10T10:15:00', person: 'Amit K.', type: 'Tamper-evident tape', reason: 'Visual inspection' },
    { id: 'SR-003', sampleId: 'SPL-2026-0001', action: 'Sealed', sealNumber: 'SEAL-2026-0146', timestamp: '2026-03-10T10:45:00', person: 'Amit K.', type: 'Tamper-evident tape', reason: 'Post-inspection re-seal' },
    { id: 'SR-004', sampleId: 'SPL-2026-0001', action: 'Unsealed', sealNumber: 'SEAL-2026-0146', timestamp: '2026-03-12T08:05:00', person: 'Rahul S.', type: 'Tamper-evident tape', reason: 'Test preparation' },
    { id: 'SR-005', sampleId: 'SPL-2026-0001', action: 'Sealed', sealNumber: 'SEAL-2026-0189', timestamp: '2026-03-18T16:45:00', person: 'Rahul S.', type: 'Tamper-evident tape', reason: 'Post-test storage' },
  ]

  const filteredTransfers = selectedSample
    ? custodyTransfers.filter(t => t.sampleId === selectedSample)
    : custodyTransfers

  const filteredSeals = selectedSample
    ? sealRecords.filter(s => s.sampleId === selectedSample)
    : sealRecords

  const sampleIds = [...new Set(custodyTransfers.map(t => t.sampleId))]

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium text-gray-700">Filter by Sample:</label>
        <div className="relative">
          <select
            value={selectedSample}
            onChange={e => setSelectedSample(e.target.value)}
            className="text-sm border rounded-md px-3 py-1.5 pr-8 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">All Samples</option>
            {sampleIds.map(id => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
          <ChevronDown className="h-3 w-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Custody Transfer Log */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-2 mb-4">
          <ArrowRightLeft className="h-4 w-4 text-amber-600" />
          <h2 className="font-semibold text-sm">Custody Transfer Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">ID</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Sample</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Action</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">From</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">To</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransfers.map(transfer => (
                <tr key={transfer.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-gray-500">{transfer.id}</td>
                  <td className="px-3 py-2 font-medium text-amber-700">{transfer.sampleId}</td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold">{transfer.action}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-gray-900">{transfer.fromPerson}</div>
                    <div className="text-gray-400 flex items-center gap-1"><MapPin className="h-3 w-3" />{transfer.fromLocation}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-gray-900">{transfer.toPerson}</div>
                    <div className="text-gray-400 flex items-center gap-1"><MapPin className="h-3 w-3" />{transfer.toLocation}</div>
                  </td>
                  <td className="px-3 py-2 text-gray-500">{formatTimestamp(transfer.timestamp)}</td>
                  <td className="px-3 py-2 text-gray-500 max-w-[200px] truncate" title={transfer.notes}>{transfer.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Environmental Conditions During Transport */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Thermometer className="h-4 w-4 text-amber-600" />
          <h2 className="font-semibold text-sm">Environmental Conditions During Transport</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Transfer ID</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Sample</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Action</th>
                <th className="px-3 py-2 text-center font-medium text-gray-500 uppercase">Temperature</th>
                <th className="px-3 py-2 text-center font-medium text-gray-500 uppercase">Humidity</th>
                <th className="px-3 py-2 text-center font-medium text-gray-500 uppercase">Seal Status</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Timestamp</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransfers.map(transfer => (
                <tr key={transfer.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-gray-500">{transfer.id}</td>
                  <td className="px-3 py-2 font-medium text-amber-700">{transfer.sampleId}</td>
                  <td className="px-3 py-2">{transfer.action}</td>
                  <td className="px-3 py-2 text-center font-medium">{transfer.temperature}</td>
                  <td className="px-3 py-2 text-center font-medium">{transfer.humidity}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold ${
                      transfer.sealStatus.includes('Sealed') && !transfer.sealStatus.includes('Unsealed')
                        ? 'bg-green-50 text-green-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {transfer.sealStatus.includes('Sealed') && !transfer.sealStatus.includes('Unsealed')
                        ? <Lock className="h-3 w-3" />
                        : <Unlock className="h-3 w-3" />
                      }
                      {transfer.sealStatus}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-500">{formatTimestamp(transfer.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sealing/Unsealing Records */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-amber-600" />
          <h2 className="font-semibold text-sm">Sealing / Unsealing Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Record ID</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Sample</th>
                <th className="px-3 py-2 text-center font-medium text-gray-500 uppercase">Action</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Seal Number</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Type</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Person</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Timestamp</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSeals.map(record => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-gray-500">{record.id}</td>
                  <td className="px-3 py-2 font-medium text-amber-700">{record.sampleId}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold ${
                      record.action === 'Sealed' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {record.action === 'Sealed' ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                      {record.action}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono">{record.sealNumber}</td>
                  <td className="px-3 py-2 text-gray-600">{record.type}</td>
                  <td className="px-3 py-2 text-gray-900">{record.person}</td>
                  <td className="px-3 py-2 text-gray-500">{record.reason}</td>
                  <td className="px-3 py-2 text-gray-500">{formatTimestamp(record.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Photo Evidence Upload Placeholders */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="h-4 w-4 text-amber-600" />
          <h2 className="font-semibold text-sm">Photo Evidence</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Receipt Condition Photos', 'Seal Verification Photos', 'Damage/Anomaly Photos'].map((label) => (
            <div key={label} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-amber-400 transition-colors cursor-pointer">
              <Camera className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">{label}</p>
              <p className="text-xs text-gray-400 mt-1">Click or drag to upload</p>
              <p className="text-[10px] text-gray-300 mt-2">JPG, PNG up to 10MB</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
