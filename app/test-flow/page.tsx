// @ts-nocheck
'use client'

import { useState, useCallback } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, AreaChart, Area
} from 'recharts'
import {
  mockServiceRequests, mockSamples, mockIncomingInspection,
  mockIVMeasurements, mockEquipment, mockIEC61215Sequence,
  mockApprovals, mockKPIData, prePostComparisonData, pmaxSequenceData,
  type ServiceRequest, type IVMeasurement, type IEC61215SequenceStep
} from '@/lib/test-flow-data'

// ---------- Utilities ----------
const statusColor: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  active: 'bg-blue-100 text-blue-700',
  complete: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  draft: 'bg-gray-100 text-gray-600',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  report_generated: 'bg-purple-100 text-purple-700',
  valid: 'bg-green-100 text-green-700',
  due_soon: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700',
}
const badge = (status: string, label?: string) => (
  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[status] ?? 'bg-gray-100 text-gray-600'}`}>
    {label ?? status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
  </span>
)

// ---------- TAB IDs ----------
const TABS = [
  { id: 'service', label: 'Service Request' },
  { id: 'flow', label: 'Data Flow Map' },
  { id: 'ivdb', label: 'IV Database' },
  { id: 'prepost', label: 'Pre/Post Compare' },
  { id: 'sequence', label: 'IEC 61215 Sequence' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'kpi', label: 'KPI Dashboard' },
  { id: 'approval', label: 'Approval Workflow' },
]

// ==============================
// SECTION 1 - Service Request & Sample Intake
// ==============================
function ServiceRequestTab() {
  const [activeRequest, setActiveRequest] = useState<ServiceRequest>(mockServiceRequests[0])
  const [inspectionItems, setInspectionItems] = useState(mockIncomingInspection)
  const [newRequest, setNewRequest] = useState({ customerName: '', moduleModel: '', modulePower: '', testStandard: '', receivedDate: '' })
  const [showForm, setShowForm] = useState(false)

  const toggleInspection = (id: string, result: 'pass' | 'fail' | 'na') => {
    setInspectionItems(prev => prev.map(i => i.id === id ? { ...i, result } : i))
  }

  const passCount = inspectionItems.filter(i => i.result === 'pass').length
  const failCount = inspectionItems.filter(i => i.result === 'fail').length

  return (
    <div className="space-y-6">
      {/* Service Request List */}
      <div className="bg-white rounded-lg border">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">Active Service Requests</h2>
          <button onClick={() => setShowForm(!showForm)} className="text-xs px-3 py-1.5 bg-amber-500 text-white rounded-md hover:bg-amber-600">
            + New Request
          </button>
        </div>
        {showForm && (
          <div className="p-4 bg-amber-50 border-b grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><label className="text-xs text-gray-500 block mb-1">Customer Name</label><input className="w-full border rounded px-2 py-1 text-sm" value={newRequest.customerName} onChange={e => setNewRequest(p => ({ ...p, customerName: e.target.value }))} /></div>
            <div><label className="text-xs text-gray-500 block mb-1">Module Model</label><input className="w-full border rounded px-2 py-1 text-sm" value={newRequest.moduleModel} onChange={e => setNewRequest(p => ({ ...p, moduleModel: e.target.value }))} /></div>
            <div><label className="text-xs text-gray-500 block mb-1">Module Power (W)</label><input type="number" className="w-full border rounded px-2 py-1 text-sm" value={newRequest.modulePower} onChange={e => setNewRequest(p => ({ ...p, modulePower: e.target.value }))} /></div>
            <div><label className="text-xs text-gray-500 block mb-1">Test Standard</label>
              <select className="w-full border rounded px-2 py-1 text-sm" value={newRequest.testStandard} onChange={e => setNewRequest(p => ({ ...p, testStandard: e.target.value }))}>
                <option value="">Select...</option>
                <option>IEC 61215-1:2021</option>
                <option>IEC 61730-1:2023</option>
                <option>IEC 61853-1</option>
              </select>
            </div>
            <div><label className="text-xs text-gray-500 block mb-1">Received Date</label><input type="date" className="w-full border rounded px-2 py-1 text-sm" value={newRequest.receivedDate} onChange={e => setNewRequest(p => ({ ...p, receivedDate: e.target.value }))} /></div>
            <div className="flex items-end"><button className="w-full text-xs px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700">Register</button></div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr><th className="px-3 py-2 text-left">Request No</th><th className="px-3 py-2 text-left">Customer</th><th className="px-3 py-2 text-left">Module</th><th className="px-3 py-2 text-left">Power</th><th className="px-3 py-2 text-left">Standards</th><th className="px-3 py-2 text-left">Received</th><th className="px-3 py-2 text-left">Stage</th><th className="px-3 py-2 text-left">Status</th></tr>
            </thead>
            <tbody>
              {mockServiceRequests.map(sr => (
                <tr key={sr.id} onClick={() => setActiveRequest(sr)} className={`border-b cursor-pointer hover:bg-amber-50 ${activeRequest.id === sr.id ? 'bg-amber-50' : ''}`}>
                  <td className="px-3 py-2 font-mono text-xs text-amber-700 font-medium">{sr.requestNo}</td>
                  <td className="px-3 py-2">{sr.customerName}</td>
                  <td className="px-3 py-2 text-gray-600">{sr.moduleModel}</td>
                  <td className="px-3 py-2">{sr.modulePower}W</td>
                  <td className="px-3 py-2 text-xs">{sr.testStandard.join(', ')}</td>
                  <td className="px-3 py-2 text-xs">{sr.receivedDate}</td>
                  <td className="px-3 py-2 text-xs capitalize">{sr.currentStage.replace(/_/g, ' ')}</td>
                  <td className="px-3 py-2">{badge(sr.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sample Registration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b"><h2 className="font-semibold text-sm">Registered Samples — {activeRequest.requestNo}</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-500">
                <tr><th className="px-3 py-2 text-left">Module ID</th><th className="px-3 py-2 text-left">Barcode</th><th className="px-3 py-2 text-left">Location</th><th className="px-3 py-2 text-left">Status</th></tr>
              </thead>
              <tbody>
                {mockSamples.filter(s => s.serviceRequestId === activeRequest.id).map(s => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-amber-700">{s.moduleId}</td>
                    <td className="px-3 py-2 font-mono">{s.barcode}</td>
                    <td className="px-3 py-2 text-gray-600">{s.location}</td>
                    <td className="px-3 py-2"><span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs">{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Incoming Inspection */}
        <div className="bg-white rounded-lg border">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-sm">Incoming Inspection Checklist</h2>
            <div className="flex gap-2 text-xs">
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">{passCount} Pass</span>
              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded">{failCount} Fail</span>
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {['Visual', 'Dimensional', 'Labeling', 'Electrical', 'Documentation'].map(cat => (
              <div key={cat}>
                <div className="px-3 py-1 bg-gray-50 text-xs font-semibold text-gray-500 sticky top-0">{cat}</div>
                {inspectionItems.filter(i => i.category === cat).map(item => (
                  <div key={item.id} className="flex items-center justify-between px-3 py-1.5 border-b hover:bg-gray-50">
                    <span className="text-xs text-gray-700 flex-1">{item.checkItem}</span>
                    <div className="flex gap-1 ml-2">
                      {(['pass', 'fail', 'na'] as const).map(r => (
                        <button key={r} onClick={() => toggleInspection(item.id, r)}
                          className={`text-xs px-2 py-0.5 rounded border ${item.result === r ? (r === 'pass' ? 'bg-green-500 text-white border-green-500' : r === 'fail' ? 'bg-red-500 text-white border-red-500' : 'bg-gray-400 text-white border-gray-400') : 'bg-white text-gray-500 border-gray-200'}`}>
                          {r.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==============================
// SECTION 2 - Data Flow Map
// ==============================
const FLOW_STAGES = [
  { id: 'service_request', label: 'Service Request', desc: 'Customer request registered', color: '#3B82F6' },
  { id: 'incoming_inspection', label: 'Incoming Inspection', desc: 'Visual + dimensional check', color: '#8B5CF6' },
  { id: 'equipment_assignment', label: 'Equipment Assignment', desc: 'Assign chambers & simulators', color: '#F59E0B' },
  { id: 'test_execution', label: 'Test Execution', desc: 'TC / DH / HF / UV / EL', color: '#EF4444' },
  { id: 'raw_data', label: 'Raw Data Capture', desc: 'IV curves, EL images, logs', color: '#10B981' },
  { id: 'master_db', label: 'Master IV Database', desc: 'Central data repository', color: '#F59E0B' },
  { id: 'protocol_form', label: 'Protocol Form', desc: 'Test protocol with selected data', color: '#6366F1' },
  { id: 'review_approval', label: 'Review & Approval', desc: 'Engineer + TM + QM sign-off', color: '#EC4899' },
  { id: 'test_report', label: 'Test Report', desc: 'ISO 17025 compliant report', color: '#059669' },
]

function DataFlowTab({ activeRequest }: { activeRequest: ServiceRequest }) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const getNodeStatus = (stageId: string): string => {
    const stageOrder = FLOW_STAGES.map(s => s.id)
    const currentIdx = stageOrder.indexOf(activeRequest.currentStage)
    const nodeIdx = stageOrder.indexOf(stageId)
    if (nodeIdx < currentIdx) return 'complete'
    if (nodeIdx === currentIdx) return 'active'
    return 'pending'
  }

  const nodeStatusStyle: Record<string, string> = {
    complete: 'border-green-400 bg-green-50',
    active: 'border-amber-400 bg-amber-50 ring-2 ring-amber-300',
    pending: 'border-gray-200 bg-gray-50',
    failed: 'border-red-400 bg-red-50',
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Test Data Flow — {activeRequest.requestNo}</h2>
          <div className="flex gap-3 text-xs">
            {[['complete', 'bg-green-400', 'Complete'], ['active', 'bg-amber-400', 'Active'], ['pending', 'bg-gray-300', 'Pending']].map(([k, c, l]) => (
              <span key={k} className="flex items-center gap-1"><span className={`w-2.5 h-2.5 rounded-full ${c}`} />{l}</span>
            ))}
          </div>
        </div>

        {/* Flow diagram - responsive flex wrap */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-0 min-w-max">
            {FLOW_STAGES.map((stage, idx) => {
              const status = getNodeStatus(stage.id)
              return (
                <div key={stage.id} className="flex items-center">
                  <div
                    onClick={() => setSelectedNode(selectedNode === stage.id ? null : stage.id)}
                    className={`cursor-pointer border-2 rounded-lg p-3 w-28 text-center transition-all hover:shadow-md ${nodeStatusStyle[status]}`}
                  >
                    <div className="w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: stage.color }}>
                      {status === 'complete' ? '✓' : idx + 1}
                    </div>
                    <div className="text-xs font-medium text-gray-800 leading-tight">{stage.label}</div>
                    {status === 'active' && <div className="mt-1 text-xs text-amber-600 font-semibold">Active</div>}
                  </div>
                  {idx < FLOW_STAGES.length - 1 && (
                    <div className="flex items-center mx-1">
                      <div className={`h-0.5 w-6 ${status === 'complete' ? 'bg-green-400' : 'bg-gray-200'}`} />
                      <div className={`w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent ${status === 'complete' ? 'border-l-green-400' : 'border-l-gray-300'}`} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Node detail panel */}
        {selectedNode && (() => {
          const stage = FLOW_STAGES.find(s => s.id === selectedNode)!
          const status = getNodeStatus(selectedNode)
          const sampleAtStage = mockSamples.filter(s => s.serviceRequestId === activeRequest.id).slice(0, 2)
          return (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="font-semibold text-sm">{stage.label}</span>
                {badge(status)}
              </div>
              <p className="text-xs text-gray-600 mb-2">{stage.desc}</p>
              {sampleAtStage.length > 0 && (
                <div className="text-xs text-gray-700">
                  <strong>Samples at this stage:</strong>
                  <div className="mt-1 flex gap-2 flex-wrap">
                    {sampleAtStage.map(s => <span key={s.id} className="bg-white border px-2 py-0.5 rounded font-mono">{s.moduleId}</span>)}
                  </div>
                </div>
              )}
            </div>
          )
        })()}
      </div>

      {/* Characterization test set summary */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-sm mb-3">Characterization Test Set (per stress test)</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['Visual Inspection', 'EL Imaging', 'IV Measurement', 'Insulation Test', 'Wet Leakage'].map((test, i) => (
            <div key={i} className="border rounded-lg p-3 text-center">
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xs ${['bg-purple-500', 'bg-blue-500', 'bg-amber-500', 'bg-green-500', 'bg-red-400'][i]}`}>{i + 1}</div>
              <div className="text-xs font-medium">{test}</div>
              <div className="text-xs text-gray-500 mt-1">Pre + Post</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ==============================
// SECTION 3 - Master IV Database
// ==============================
function IVDatabaseTab() {
  const [measurements, setMeasurements] = useState(mockIVMeasurements)
  const [filterModule, setFilterModule] = useState('all')
  const [filterStage, setFilterStage] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [uploadMsg, setUploadMsg] = useState('')

  const modules = [...new Set(measurements.map(m => m.moduleId))]
  const testTypes = [...new Set(measurements.map(m => m.testType))]

  const filtered = measurements.filter(m =>
    (filterModule === 'all' || m.moduleId === filterModule) &&
    (filterStage === 'all' || m.testStage === filterStage) &&
    (filterType === 'all' || m.testType === filterType)
  )

  const toggleSelect = (id: string) => {
    setMeasurements(prev => prev.map(m => m.id === id ? { ...m, isSelected: !m.isSelected } : m))
  }

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadMsg(`Parsing ${file.name}...`)
    setTimeout(() => {
      setUploadMsg(`Extracted 12 IV parameters from ${file.name}. Review and confirm to add to Master DB.`)
    }, 800)
  }

  return (
    <div className="space-y-4">
      {/* CSV Upload */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold text-sm mb-3">Upload IV Raw Data CSV</h2>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer flex items-center gap-2 text-sm border-2 border-dashed border-amber-300 rounded-lg px-4 py-2 hover:border-amber-400 hover:bg-amber-50">
            <span className="text-amber-600">Choose CSV file</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
          </label>
          {uploadMsg && <span className="text-xs text-green-600">{uploadMsg}</span>}
          <div className="ml-auto text-xs text-gray-500">Expected columns: Module ID, Test Type, Pmax, Isc, Voc, FF, Imp, Vmp, Irradiance, Temp</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Master IV Database ({filtered.length} records)</h2>
          <div className="flex gap-2">
            <select className="text-xs border rounded px-2 py-1" value={filterModule} onChange={e => setFilterModule(e.target.value)}>
              <option value="all">All Modules</option>
              {modules.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select className="text-xs border rounded px-2 py-1" value={filterStage} onChange={e => setFilterStage(e.target.value)}>
              <option value="all">Pre + Post</option>
              <option value="Pre">Pre</option>
              <option value="Post">Post</option>
            </select>
            <select className="text-xs border rounded px-2 py-1" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">All Test Types</option>
              {testTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500 sticky top-0">
              <tr>
                <th className="px-2 py-2 text-left">Select</th>
                <th className="px-2 py-2 text-left">Module ID</th>
                <th className="px-2 py-2 text-left">Stage</th>
                <th className="px-2 py-2 text-left">Test Type</th>
                <th className="px-2 py-2 text-left">Date</th>
                <th className="px-2 py-2 text-left">Equipment</th>
                <th className="px-2 py-2 text-left">Operator</th>
                <th className="px-2 py-2 text-right">Pmax (W)</th>
                <th className="px-2 py-2 text-right">Isc (A)</th>
                <th className="px-2 py-2 text-right">Voc (V)</th>
                <th className="px-2 py-2 text-right">FF (%)</th>
                <th className="px-2 py-2 text-right">Imp (A)</th>
                <th className="px-2 py-2 text-right">Vmp (V)</th>
                <th className="px-2 py-2 text-right">Irr (W/m²)</th>
                <th className="px-2 py-2 text-right">Temp (°C)</th>
                <th className="px-2 py-2 text-left">Raw File</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className={`border-b hover:bg-gray-50 ${m.isSelected ? 'bg-green-50' : ''}`}>
                  <td className="px-2 py-1.5">
                    <input type="checkbox" checked={m.isSelected} onChange={() => toggleSelect(m.id)} className="rounded" />
                  </td>
                  <td className="px-2 py-1.5 font-mono text-amber-700 font-medium">{m.moduleId}</td>
                  <td className="px-2 py-1.5">{badge(m.testStage === 'Pre' ? 'active' : 'complete', m.testStage)}</td>
                  <td className="px-2 py-1.5">{m.testType}</td>
                  <td className="px-2 py-1.5">{m.measurementDate}</td>
                  <td className="px-2 py-1.5">{m.equipmentId}</td>
                  <td className="px-2 py-1.5">{m.operator}</td>
                  <td className="px-2 py-1.5 text-right font-mono font-semibold">{m.pmax.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{m.isc.toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{m.voc.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{m.ff.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{m.imp.toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{m.vmp.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right">{m.irradiance}</td>
                  <td className="px-2 py-1.5 text-right">{m.temperature}</td>
                  <td className="px-2 py-1.5 text-blue-600 hover:underline cursor-pointer text-xs">{m.rawFileRef.split('/').pop()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {filtered.filter(m => m.isSelected).length} of {filtered.length} records selected for protocol generation
        </div>
      </div>
    </div>
  )
}

// ==============================
// SECTION 4 - Pre/Post Comparison
// ==============================
function PrePostCompareTab() {
  const [selectedModule, setSelectedModule] = useState('MOD-2026-001-A')
  const [preELImg, setPreELImg] = useState<string | null>(null)
  const [postELImg, setPostELImg] = useState<string | null>(null)

  const handleImgUpload = (type: 'pre' | 'post', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    if (type === 'pre') setPreELImg(url)
    else setPostELImg(url)
  }

  const chartData = prePostComparisonData.map(d => ({
    ...d,
    refPmax: 421.5,
  }))

  return (
    <div className="space-y-6">
      {/* IV Pre/Post Bar Chart */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Pmax Pre vs Post — Stress Tests</h2>
          <select className="text-xs border rounded px-2 py-1" value={selectedModule} onChange={e => setSelectedModule(e.target.value)}>
            <option value="MOD-2026-001-A">MOD-2026-001-A</option>
            <option value="MOD-2026-001-B">MOD-2026-001-B</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={prePostComparisonData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="testType" tick={{ fontSize: 11 }} />
            <YAxis domain={[410, 425]} tick={{ fontSize: 11 }} label={{ value: 'Pmax (W)', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }} />
            <Tooltip formatter={(v: number) => [`${v?.toFixed(1)} W`, '']} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="preAvg" name="Pre Stress" fill="#3B82F6" radius={[3, 3, 0, 0]} />
            <Bar dataKey="postAvg" name="Post Stress" fill="#F59E0B" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Delta Pmax Table */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold text-sm mb-3">Delta Pmax Analysis (IEC Pass/Fail)</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="px-3 py-2 text-left">Test Type</th>
              <th className="px-3 py-2 text-right">Pre Pmax (W)</th>
              <th className="px-3 py-2 text-right">Post Pmax (W)</th>
              <th className="px-3 py-2 text-right">Delta (%)</th>
              <th className="px-3 py-2 text-right">IEC Limit (%)</th>
              <th className="px-3 py-2 text-center">Result</th>
            </tr>
          </thead>
          <tbody>
            {prePostComparisonData.map(d => (
              <tr key={d.testType} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2 font-medium">{d.testType}</td>
                <td className="px-3 py-2 text-right font-mono">{d.preAvg.toFixed(1)}</td>
                <td className="px-3 py-2 text-right font-mono">{d.postAvg?.toFixed(1) ?? '—'}</td>
                <td className={`px-3 py-2 text-right font-mono font-semibold ${d.delta !== null ? (d.delta < d.limit ? 'text-red-600' : d.delta < 0 ? 'text-amber-600' : 'text-green-600') : 'text-gray-400'}`}>
                  {d.delta !== null ? `${d.delta > 0 ? '+' : ''}${d.delta.toFixed(2)}%` : 'Pending'}
                </td>
                <td className="px-3 py-2 text-right text-gray-500">{d.limit.toFixed(1)}%</td>
                <td className="px-3 py-2 text-center">
                  {d.pass === null ? badge('pending', 'Pending') : d.pass ? badge('complete', 'PASS') : badge('failed', 'FAIL')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EL Image Comparison */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold text-sm mb-3">EL Image Comparison — Pre / Post Stress</h2>
        <div className="grid grid-cols-2 gap-4">
          {(['pre', 'post'] as const).map(type => (
            <div key={type} className="border-2 border-dashed border-gray-200 rounded-lg p-3 text-center">
              <div className="text-xs font-semibold text-gray-500 mb-2 uppercase">{type} Stress EL Image</div>
              {(type === 'pre' ? preELImg : postELImg) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={type === 'pre' ? preELImg! : postELImg!} alt={`${type} EL`} className="w-full h-40 object-contain rounded" />
              ) : (
                <div className="h-40 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">No image uploaded</div>
              )}
              <label className="mt-2 inline-block cursor-pointer text-xs text-blue-600 hover:underline">
                Upload EL Image
                <input type="file" accept="image/*" className="hidden" onChange={e => handleImgUpload(type, e)} />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Insulation / Wet Leakage */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold text-sm mb-3">Insulation &amp; Wet Leakage — Pre/Post Values</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr><th className="px-3 py-2 text-left">Test</th><th className="px-3 py-2 text-left">Module ID</th><th className="px-3 py-2 text-right">Pre Value</th><th className="px-3 py-2 text-right">Post Value</th><th className="px-3 py-2 text-right">Limit</th><th className="px-3 py-2 text-center">Result</th></tr>
          </thead>
          <tbody>
            {[
              { test: 'Insulation Resistance', module: 'MOD-2026-001-A', pre: '> 50 GΩ', post: '> 50 GΩ', limit: '≥ 40 MΩ·m²', pass: true },
              { test: 'Wet Leakage Current', module: 'MOD-2026-001-A', pre: '0.8 mA', post: '1.1 mA', limit: '≤ 10 mA', pass: true },
              { test: 'Insulation Resistance', module: 'MOD-2026-001-B', pre: '> 50 GΩ', post: '> 50 GΩ', limit: '≥ 40 MΩ·m²', pass: true },
              { test: 'Wet Leakage Current', module: 'MOD-2026-001-B', pre: '0.7 mA', post: '0.9 mA', limit: '≤ 10 mA', pass: true },
            ].map((r, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{r.test}</td>
                <td className="px-3 py-2 text-amber-700 font-medium font-mono text-xs">{r.module}</td>
                <td className="px-3 py-2 text-right font-mono text-xs">{r.pre}</td>
                <td className="px-3 py-2 text-right font-mono text-xs">{r.post}</td>
                <td className="px-3 py-2 text-right text-gray-500 text-xs">{r.limit}</td>
                <td className="px-3 py-2 text-center">{badge('complete', 'PASS')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ==============================
// SECTION 5 - IEC 61215 Sequence Tracker
// ==============================
function SequenceTrackerTab() {
  const steps = mockIEC61215Sequence
  const completedSteps = steps.filter(s => s.status === 'complete')

  const statusBg: Record<string, string> = {
    complete: 'bg-green-500',
    active: 'bg-amber-500',
    pending: 'bg-gray-300',
    failed: 'bg-red-500',
  }

  return (
    <div className="space-y-6">
      {/* Sequence Visual */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold text-sm mb-4">IEC 61215 Test Sequence — AS-M672-BF-420W</h2>
        <div className="overflow-x-auto pb-2">
          <div className="flex items-start gap-1 min-w-max">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-start">
                <div className="flex flex-col items-center w-24">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${statusBg[step.status]}`}>
                    {step.status === 'complete' ? '✓' : step.status === 'active' ? '▶' : idx + 1}
                  </div>
                  <div className={`w-0.5 h-3 ${step.status !== 'pending' ? 'bg-gray-400' : 'bg-gray-200'}`} />
                  <div className={`text-xs text-center leading-tight px-1 rounded py-0.5 ${step.type === 'characterization' || step.type === 'initial' || step.type === 'final' ? 'bg-blue-50 text-blue-700 font-medium' : 'bg-gray-50 text-gray-700'}`}>
                    {step.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{step.duration}</div>
                  {step.deltaPercent !== null && (
                    <div className={`text-xs font-semibold mt-0.5 ${step.deltaPercent < step.iecLimit ? 'text-red-600' : 'text-green-600'}`}>
                      {step.deltaPercent > 0 ? '+' : ''}{step.deltaPercent.toFixed(2)}%
                    </div>
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div className="flex items-center mt-4">
                    <div className={`h-0.5 w-3 ${steps[idx].status === 'complete' ? 'bg-green-400' : 'bg-gray-200'}`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pmax through sequence bar + line charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-sm mb-3">Pmax Through Sequence (Bar)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pmaxSequenceData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="step" tick={{ fontSize: 9 }} />
              <YAxis domain={[410, 425]} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => [`${v?.toFixed(1)} W`]} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="pmax" name="Test Module" fill="#F59E0B" radius={[3, 3, 0, 0]} />
              <Bar dataKey="refPmax" name="Reference" fill="#94A3B8" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-sm mb-3">Pmax Degradation Trend (Line)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={pmaxSequenceData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="step" tick={{ fontSize: 9 }} />
              <YAxis domain={[408, 425]} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => [`${v?.toFixed(1)} W`]} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <ReferenceLine y={421.5 * 0.95} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'IEC -5% limit', fontSize: 9, fill: '#EF4444' }} />
              <Line type="monotone" dataKey="pmax" name="Test Module" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4, fill: '#F59E0B' }} />
              <Line type="monotone" dataKey="refPmax" name="Reference" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4 4" dot={{ r: 3, fill: '#94A3B8' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sequence step table */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-sm mb-3">Sequence Step Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500">
              <tr><th className="px-2 py-2 text-left">#</th><th className="px-2 py-2 text-left">Step</th><th className="px-2 py-2 text-left">Type</th><th className="px-2 py-2 text-left">Duration</th><th className="px-2 py-2 text-left">Status</th><th className="px-2 py-2 text-left">Start</th><th className="px-2 py-2 text-left">End</th><th className="px-2 py-2 text-right">Pre Pmax</th><th className="px-2 py-2 text-right">Post Pmax</th><th className="px-2 py-2 text-right">Delta %</th><th className="px-2 py-2 text-right">IEC Limit</th><th className="px-2 py-2 text-left">Equipment</th></tr>
            </thead>
            <tbody>
              {steps.map(s => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="px-2 py-1.5">{s.stepNo}</td>
                  <td className="px-2 py-1.5 font-medium">{s.name}</td>
                  <td className="px-2 py-1.5 capitalize text-gray-600">{s.type}</td>
                  <td className="px-2 py-1.5">{s.duration}</td>
                  <td className="px-2 py-1.5">{badge(s.status)}</td>
                  <td className="px-2 py-1.5">{s.startDate ?? '—'}</td>
                  <td className="px-2 py-1.5">{s.endDate ?? '—'}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{s.pmaxBefore?.toFixed(1) ?? '—'}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{s.pmaxAfter?.toFixed(1) ?? '—'}</td>
                  <td className={`px-2 py-1.5 text-right font-mono font-semibold ${s.deltaPercent !== null ? (s.deltaPercent < s.iecLimit ? 'text-red-600' : 'text-green-600') : 'text-gray-400'}`}>
                    {s.deltaPercent !== null ? `${s.deltaPercent > 0 ? '+' : ''}${s.deltaPercent.toFixed(2)}%` : '—'}
                  </td>
                  <td className="px-2 py-1.5 text-right text-gray-500">{s.iecLimit.toFixed(1)}%</td>
                  <td className="px-2 py-1.5">{s.equipmentId ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ==============================
// SECTION 6 - Equipment & Environmental Linkage
// ==============================
function EquipmentTab() {
  const [selectedEq, setSelectedEq] = useState(mockEquipment[0])

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-sm">Equipment Registry & Calibration Status</h2>
          <div className="flex gap-2 text-xs">
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">{mockEquipment.filter(e => e.calibrationStatus === 'valid').length} Valid</span>
            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">{mockEquipment.filter(e => e.calibrationStatus === 'due_soon').length} Due Soon</span>
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded">{mockEquipment.filter(e => e.calibrationStatus === 'overdue').length} Overdue</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500">
              <tr><th className="px-3 py-2 text-left">Equipment ID</th><th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left">Type</th><th className="px-3 py-2 text-left">Location</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-left">Cal Status</th><th className="px-3 py-2 text-left">Last Cal</th><th className="px-3 py-2 text-left">Next Cal</th><th className="px-3 py-2 text-left">Current Test</th><th className="px-3 py-2 text-right">Total Tests</th></tr>
            </thead>
            <tbody>
              {mockEquipment.map(eq => (
                <tr key={eq.id} onClick={() => setSelectedEq(eq)} className={`border-b cursor-pointer hover:bg-amber-50 ${selectedEq.id === eq.id ? 'bg-amber-50' : ''}`}>
                  <td className="px-3 py-2 font-mono text-amber-700 font-medium">{eq.id}</td>
                  <td className="px-3 py-2 font-medium">{eq.name}</td>
                  <td className="px-3 py-2 text-gray-600">{eq.type}</td>
                  <td className="px-3 py-2 text-gray-600">{eq.location}</td>
                  <td className="px-3 py-2">{badge(eq.status)}</td>
                  <td className="px-3 py-2">{badge(eq.calibrationStatus)}</td>
                  <td className="px-3 py-2">{eq.lastCalDate}</td>
                  <td className={`px-3 py-2 font-medium ${eq.calibrationStatus === 'overdue' ? 'text-red-600' : eq.calibrationStatus === 'due_soon' ? 'text-yellow-600' : ''}`}>{eq.nextCalDate}</td>
                  <td className="px-3 py-2 text-gray-600 max-w-xs truncate">{eq.currentTest ?? '—'}</td>
                  <td className="px-3 py-2 text-right font-mono">{eq.totalTests}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Equipment detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-sm mb-3">Equipment Detail — {selectedEq.id}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Name:</span><span className="font-medium">{selectedEq.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Type:</span><span>{selectedEq.type}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Location:</span><span>{selectedEq.location}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Status:</span>{badge(selectedEq.status)}</div>
            <div className="flex justify-between"><span className="text-gray-500">Calibration:</span>{badge(selectedEq.calibrationStatus)}</div>
            <div className="flex justify-between"><span className="text-gray-500">Last Calibrated:</span><span>{selectedEq.lastCalDate}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Next Calibration:</span><span className={selectedEq.calibrationStatus === 'overdue' ? 'text-red-600 font-semibold' : selectedEq.calibrationStatus === 'due_soon' ? 'text-yellow-600 font-semibold' : ''}>{selectedEq.nextCalDate}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Current Test:</span><span className="text-right text-xs">{selectedEq.currentTest ?? 'Idle'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Operator:</span><span>{selectedEq.operator ?? '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Total Tests Run:</span><span className="font-semibold">{selectedEq.totalTests}</span></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-sm mb-3">Environmental Conditions at Last Test</h3>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Room Temperature', value: '23.4°C', range: '23 ± 2°C', ok: true },
              { label: 'Room Humidity', value: '48%RH', range: '45-65% RH', ok: true },
              { label: 'Irradiance (Sim)', value: '1000 W/m²', range: '1000 ± 2%', ok: true },
              { label: 'Module Temperature', value: '25.1°C', range: '25 ± 2°C', ok: true },
              { label: 'Air Pressure', value: '1012 hPa', range: 'Ambient', ok: true },
            ].map((env, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b last:border-0">
                <span className="text-gray-600">{env.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{env.value}</span>
                  <span className="text-xs text-gray-400">({env.range})</span>
                  <span className={`text-xs ${env.ok ? 'text-green-600' : 'text-red-600'}`}>{env.ok ? '✓' : '✗'}</span>
                </div>
              </div>
            ))}
          </div>
          <h3 className="font-semibold text-sm mt-4 mb-2">Maintenance History</h3>
          <div className="space-y-1 text-xs text-gray-600">
            {[
              { date: '2026-01-10', action: 'Annual calibration completed. Certificate issued.' },
              { date: '2025-09-15', action: 'Lamp replacement - Xenon arc lamp #2' },
              { date: '2025-06-20', action: 'Preventive maintenance - filter cleaning' },
            ].map((h, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-gray-400 shrink-0">{h.date}</span>
                <span>{h.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==============================
// SECTION 7 - KPI Dashboard
// ==============================
function KPIDashboardTab() {
  const kpi = mockKPIData

  return (
    <div className="space-y-6">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Modules in Progress', value: '8', sub: 'across 3 projects', color: 'text-blue-600' },
          { label: 'Avg TAT (days)', value: '41', sub: 'Target: 45 days', color: 'text-green-600' },
          { label: 'Equipment Utilization', value: '72%', sub: 'Of total capacity', color: 'text-amber-600' },
          { label: 'Env. Compliance', value: '100%', sub: 'This month', color: 'text-green-600' },
          { label: 'Sample Throughput', value: '14', sub: 'Modules this week', color: 'text-purple-600' },
        ].map((kpiItem, i) => (
          <div key={i} className="bg-white rounded-lg border p-4">
            <div className="text-xs text-gray-500">{kpiItem.label}</div>
            <div className={`text-2xl font-bold mt-1 ${kpiItem.color}`}>{kpiItem.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{kpiItem.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-sm mb-3">Equipment Utilization (Tests/Month vs Capacity)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={kpi.equipmentUtilization} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="testsThisMonth" name="Tests This Month" fill="#F59E0B" radius={[3, 3, 0, 0]} />
              <Bar dataKey="totalCapacity" name="Capacity" fill="#E2E8F0" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-sm mb-3">TAT Trend (Avg Days Service Request to Report)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={kpi.tatData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} />
              <YAxis domain={[30, 60]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <ReferenceLine y={45} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Target', fontSize: 9, fill: '#EF4444' }} />
              <Line type="monotone" dataKey="avgDays" name="Avg TAT (days)" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-sm mb-3">Environmental Condition Compliance Rate (%)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={kpi.environmentalCompliance} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis domain={[90, 101]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <ReferenceLine y={98} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Target 98%', fontSize: 9, fill: '#EF4444' }} />
              <Area type="monotone" dataKey="compliance" name="Compliance %" stroke="#10B981" fill="#D1FAE5" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-sm mb-3">Sample Throughput (Modules In/Out per Week)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={kpi.sampleThroughput} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="modulesIn" name="Modules In" fill="#3B82F6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="modulesOut" name="Modules Out" fill="#10B981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Operator Performance */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-sm mb-3">Operator Performance</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr><th className="px-3 py-2 text-left">Operator</th><th className="px-3 py-2 text-right">Measurements (Month)</th><th className="px-3 py-2 text-right">Error Rate (%)</th><th className="px-3 py-2 text-center">Performance</th></tr>
          </thead>
          <tbody>
            {kpi.operatorPerformance.map((op, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2 font-medium">{op.name}</td>
                <td className="px-3 py-2 text-right">{op.measurements}</td>
                <td className={`px-3 py-2 text-right font-mono ${op.errorRate > 2 ? 'text-red-600' : op.errorRate > 1 ? 'text-amber-600' : 'text-green-600'}`}>{op.errorRate.toFixed(1)}%</td>
                <td className="px-3 py-2 text-center">{badge(op.errorRate > 2 ? 'failed' : op.errorRate > 1 ? 'active' : 'complete', op.errorRate > 2 ? 'Needs Review' : op.errorRate > 1 ? 'Monitor' : 'Excellent')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ==============================
// SECTION 8 - Approval Workflow
// ==============================
function ApprovalWorkflowTab() {
  const [approvals, setApprovals] = useState(mockApprovals)
  const [selected, setSelected] = useState(mockApprovals[0])
  const [comment, setComment] = useState('')

  const handleApprove = (level: 'techManager' | 'quality') => {
    setApprovals(prev => prev.map(a => {
      if (a.id !== selected.id) return a
      if (level === 'techManager') {
        const updated = { ...a, techManagerApproval: { name: 'Dr. Suresh Patel', date: new Date().toISOString().split('T')[0], status: 'approved', comments: comment }, status: 'approved' as const }
        setSelected(updated)
        return updated
      }
      const updated = { ...a, qualityApproval: { name: 'Meera Krishnan', date: new Date().toISOString().split('T')[0], status: 'approved', comments: comment }, status: 'report_generated' as const, reportGeneratedDate: new Date().toISOString().split('T')[0] }
      setSelected(updated)
      return updated
    }))
    setComment('')
  }

  const APPROVAL_STEPS = [
    { key: 'draft', label: 'Draft', icon: '📝' },
    { key: 'submitted', label: 'Submitted', icon: '📤' },
    { key: 'under_review', label: 'Under Review', icon: '🔍' },
    { key: 'approved', label: 'Approved', icon: '✅' },
    { key: 'report_generated', label: 'Report Generated', icon: '📄' },
  ]

  const statusOrder = ['draft', 'submitted', 'under_review', 'approved', 'report_generated']

  return (
    <div className="space-y-6">
      {/* Approval List */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b"><h2 className="font-semibold text-sm">Approval Records</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr><th className="px-3 py-2 text-left">Report Title</th><th className="px-3 py-2 text-left">Module</th><th className="px-3 py-2 text-left">Submitted By</th><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-left">Status</th></tr>
            </thead>
            <tbody>
              {approvals.map(a => (
                <tr key={a.id} onClick={() => setSelected(a)} className={`border-b cursor-pointer hover:bg-amber-50 ${selected.id === a.id ? 'bg-amber-50' : ''}`}>
                  <td className="px-3 py-2 font-medium text-xs">{a.reportTitle}</td>
                  <td className="px-3 py-2 font-mono text-amber-700 text-xs">{a.moduleId}</td>
                  <td className="px-3 py-2 text-xs">{a.submittedBy}</td>
                  <td className="px-3 py-2 text-xs">{a.submittedDate}</td>
                  <td className="px-3 py-2">{badge(a.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Flow for selected record */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-sm mb-4">Approval Flow — {selected.reportTitle}</h3>

        {/* Progress stepper */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
          {APPROVAL_STEPS.map((step, idx) => {
            const currentIdx = statusOrder.indexOf(selected.status)
            const stepIdx = statusOrder.indexOf(step.key)
            const isDone = stepIdx <= currentIdx
            const isCurrent = stepIdx === currentIdx
            return (
              <div key={step.key} className="flex items-center">
                <div className={`flex flex-col items-center min-w-[80px] ${isDone ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base border-2 ${isCurrent ? 'border-amber-400 bg-amber-50' : isDone ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    {step.icon}
                  </div>
                  <span className="text-xs mt-1 text-center">{step.label}</span>
                </div>
                {idx < APPROVAL_STEPS.length - 1 && (
                  <div className={`h-0.5 w-8 mx-1 mt-[-12px] ${statusOrder.indexOf(selected.status) > idx ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Approval sign-off cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Engineer Sign-off', data: selected.engineerApproval, level: 'engineer' as const },
            { title: 'Technical Manager Review', data: selected.techManagerApproval, level: 'techManager' as const },
            { title: 'Quality Manager / AI Review', data: selected.qualityApproval, level: 'quality' as const },
          ].map(({ title, data, level }) => (
            <div key={level} className={`border-2 rounded-lg p-4 ${data?.status === 'approved' ? 'border-green-300 bg-green-50' : data?.status === 'under_review' ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="font-semibold text-xs mb-2 text-gray-700">{title}</div>
              {data ? (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-gray-500">By:</span><span className="font-medium">{data.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Date:</span><span>{data.date}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Decision:</span>{badge(data.status)}</div>
                  {data.comments && <div className="mt-1 text-gray-600 italic text-xs">&quot;{data.comments}&quot;</div>}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-gray-400 mb-2">Awaiting action</div>
                  {(level === 'techManager' && selected.engineerApproval?.status === 'approved' && !selected.techManagerApproval) && (
                    <div>
                      <textarea className="w-full border rounded px-2 py-1 text-xs" rows={2} placeholder="Comments (optional)" value={comment} onChange={e => setComment(e.target.value)} />
                      <button onClick={() => handleApprove('techManager')} className="mt-1 w-full text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
                    </div>
                  )}
                  {(level === 'quality' && selected.techManagerApproval?.status === 'approved' && !selected.qualityApproval) && (
                    <div>
                      <textarea className="w-full border rounded px-2 py-1 text-xs" rows={2} placeholder="Comments (optional)" value={comment} onChange={e => setComment(e.target.value)} />
                      <button onClick={() => handleApprove('quality')} className="mt-1 w-full text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">Approve & Generate Report</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {selected.reportGeneratedDate && (
          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <div>
              <div className="font-semibold text-sm text-purple-800">Test Report Generated</div>
              <div className="text-xs text-purple-600">Report generated on {selected.reportGeneratedDate} — Ready for download</div>
            </div>
            <button className="ml-auto text-xs px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700">Download PDF</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ==============================
// MAIN PAGE
// ==============================
export default function TestFlowPage() {
  const [activeTab, setActiveTab] = useState('service')
  const [activeRequest] = useState(mockServiceRequests[0])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Integrated Test Data Flow</h1>
          <p className="text-xs text-gray-500 mt-0.5">Service Request → Incoming Inspection → Equipment → Test Execution → Master DB → Protocol → Approval → Report</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Active SR:</span>
          <span className="text-xs font-mono font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">{activeRequest.requestNo}</span>
          {badge(activeRequest.status)}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-6 shrink-0 overflow-x-auto">
        <nav className="flex gap-0 min-w-max">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.id ? 'border-amber-500 text-amber-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
        {activeTab === 'service' && <ServiceRequestTab />}
        {activeTab === 'flow' && <DataFlowTab activeRequest={activeRequest} />}
        {activeTab === 'ivdb' && <IVDatabaseTab />}
        {activeTab === 'prepost' && <PrePostCompareTab />}
        {activeTab === 'sequence' && <SequenceTrackerTab />}
        {activeTab === 'equipment' && <EquipmentTab />}
        {activeTab === 'kpi' && <KPIDashboardTab />}
        {activeTab === 'approval' && <ApprovalWorkflowTab />}
      </div>
    </div>
  )
}
