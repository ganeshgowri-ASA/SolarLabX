'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn, formatDate, formatCurrency, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'
import SampleTrackingPage from '@/components/sample-tracking/SampleTrackingPage'
import {
  serviceRequests,
  approvalWorkflows,
  bomEntries,
  projectSchedules,
  auditTrailEntries,
  labCertificates,
  limsDashboardMetrics,
} from '@/lib/data/lims-extended-data'
import type {
  ServiceRequest,
  ApprovalWorkflowEntry,
  ProjectSchedule,
  AuditTrailEntry,
  BOMEntry,
} from '@/lib/types'

type TabKey = 'overview' | 'service-requests' | 'samples' | 'approvals' | 'schedule' | 'certificates' | 'audit-trail' | 'sample-tracking'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'service-requests', label: 'Service Requests' },
  { key: 'samples', label: 'Samples & BOM' },
  { key: 'sample-tracking', label: 'Sample Tracking' },
  { key: 'approvals', label: 'Approvals' },
  { key: 'schedule', label: 'Project Schedule' },
  { key: 'certificates', label: 'Certificates' },
  { key: 'audit-trail', label: 'Audit Trail' },
]

const srStatusColors: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  quote_sent: 'bg-purple-100 text-purple-700',
  quote_approved: 'bg-indigo-100 text-indigo-700',
  sample_received: 'bg-cyan-100 text-cyan-700',
  testing: 'bg-amber-100 text-amber-700',
  report_generation: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-700',
}

const approvalLevelColors: Record<string, string> = {
  technician: 'bg-blue-100 text-blue-700',
  reviewer: 'bg-purple-100 text-purple-700',
  approver: 'bg-amber-100 text-amber-700',
  lab_manager: 'bg-green-100 text-green-700',
}

export default function LimsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">LIMS Dashboard</h1>
          <p className="text-sm text-gray-500">Laboratory Information Management System - Professional Lab Workflow</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toast.info("New service request form coming soon")} className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700">
            + New Service Request
          </button>
          <Link href="/lims/samples" className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50">
            Sample Registry
          </Link>
          <Link href="/lims/tests" className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50">
            Test Execution
          </Link>
          <Link href="/lims/equipment" className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50">
            Equipment
          </Link>
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

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'service-requests' && <ServiceRequestsTab />}
      {activeTab === 'samples' && <SamplesBOMTab />}
      {activeTab === 'approvals' && <ApprovalsTab />}
      {activeTab === 'schedule' && <ScheduleTab />}
      {activeTab === 'certificates' && <CertificatesTab />}
      {activeTab === 'audit-trail' && <AuditTrailTab />}
      {activeTab === 'sample-tracking' && <SampleTrackingPage />}
    </div>
  )
}

// ============================================================================
// Overview Tab
// ============================================================================
function OverviewTab() {
  const m = limsDashboardMetrics
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Active Projects</div>
          <div className="text-3xl font-bold text-amber-600 mt-1">{m.activeProjects}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Samples In Lab</div>
          <div className="text-3xl font-bold text-blue-600 mt-1">{m.samplesInLab}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Pending Approvals</div>
          <div className="text-3xl font-bold text-purple-600 mt-1">{m.pendingApprovals}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Calibration Due</div>
          <div className="text-3xl font-bold text-red-600 mt-1">{m.calibrationDueSoon}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Monthly Tests</div>
          <div className="text-3xl font-bold text-green-600 mt-1">{m.monthlyThroughput[m.monthlyThroughput.length - 1].tests}</div>
        </div>
      </div>

      {/* Service Request Pipeline */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="text-sm font-semibold mb-4">Service Request Pipeline</h2>
        <div className="flex items-end gap-2 h-32">
          {m.serviceRequestsByStatus.map((item) => (
            <div key={item.status} className="flex-1 flex flex-col items-center gap-1">
              <div className="text-sm font-bold">{item.count}</div>
              <div
                className="w-full rounded-t"
                style={{ height: `${(item.count / 12) * 100}%`, backgroundColor: item.color, minHeight: 8 }}
              />
              <div className="text-[10px] text-gray-500 text-center leading-tight mt-1">{item.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column: Recent SRs + Test Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-4">
          <h2 className="text-sm font-semibold mb-3">Recent Service Requests</h2>
          <div className="space-y-2">
            {serviceRequests.slice(0, 4).map((sr) => (
              <div key={sr.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                <div>
                  <div className="text-sm font-medium">{sr.requestNumber}</div>
                  <div className="text-xs text-gray-500">{sr.clientName} - {sr.testStandards.join(', ')}</div>
                </div>
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded', srStatusColors[sr.status])}>
                  {sr.status.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <h2 className="text-sm font-semibold mb-3">Test Progress by Project</h2>
          <div className="space-y-4">
            {m.testProgressByProject.map((proj) => {
              const pct = proj.total > 0 ? Math.round((proj.completed / proj.total) * 100) : 0
              return (
                <div key={proj.project}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{proj.project}</span>
                    <span className="text-gray-500">{proj.completed}/{proj.total} tests</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full flex">
                      <div className="bg-green-500 rounded-l" style={{ width: `${pct}%` }} />
                      <div className="bg-amber-400" style={{ width: `${(proj.inProgress / proj.total) * 100}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Monthly Throughput */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="text-sm font-semibold mb-3">Monthly Throughput</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 text-xs text-gray-500 uppercase">Month</th>
                <th className="text-right py-2 px-3 text-xs text-gray-500 uppercase">Samples</th>
                <th className="text-right py-2 px-3 text-xs text-gray-500 uppercase">Tests</th>
                <th className="text-right py-2 px-3 text-xs text-gray-500 uppercase">Reports</th>
              </tr>
            </thead>
            <tbody>
              {m.monthlyThroughput.map((row) => (
                <tr key={row.month} className="border-b last:border-0">
                  <td className="py-2 px-3 font-medium">{row.month}</td>
                  <td className="py-2 px-3 text-right">{row.samples}</td>
                  <td className="py-2 px-3 text-right">{row.tests}</td>
                  <td className="py-2 px-3 text-right">{row.reports}</td>
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
// Service Requests Tab
// ============================================================================
function ServiceRequestsTab() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Service Request Flow</h2>
        <div className="text-xs text-gray-500">
          Customer Request → Lab Review → Quote → Approval → Sample Receipt → Testing → Report → Delivery
        </div>
      </div>

      {/* Flow Visualization */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between gap-1 text-[10px] font-medium">
          {['Submitted', 'Under Review', 'Quote Sent', 'Approved', 'Sample Received', 'Testing', 'Report Gen', 'Delivered'].map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold',
                  i < 5 ? 'bg-amber-500' : 'bg-gray-300'
                )}>
                  {i + 1}
                </div>
                <span className="mt-1 text-center leading-tight">{step}</span>
              </div>
              {i < 7 && <div className="w-4 h-0.5 bg-gray-300 -mt-3" />}
            </div>
          ))}
        </div>
      </div>

      {/* Service Requests Table */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SR Number</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Standards</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quote</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lab Manager</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {serviceRequests.map((sr) => (
                <>
                  <tr
                    key={sr.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === sr.id ? null : sr.id)}
                  >
                    <td className="px-4 py-3 text-sm font-mono text-amber-600 font-medium">{sr.requestNumber}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{sr.clientName}</div>
                      <div className="text-xs text-gray-500">{sr.clientOrganization}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {sr.testStandards.map((std) => (
                          <span key={std} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{std}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded', getStatusColor(sr.priority))}>
                        {sr.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{sr.quoteAmount ? formatCurrency(sr.quoteAmount) : '-'}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded', srStatusColors[sr.status])}>
                        {sr.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{sr.assignedLabManager}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(sr.createdAt)}</td>
                  </tr>
                  {expandedId === sr.id && (
                    <tr key={`${sr.id}-detail`}>
                      <td colSpan={8} className="px-4 py-4 bg-gray-50">
                        <ServiceRequestDetail sr={sr} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ServiceRequestDetail({ sr }: { sr: ServiceRequest }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Module Details */}
      <div className="bg-white rounded border p-3">
        <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Module Details</h4>
        {sr.moduleDetails.map((mod, i) => (
          <div key={i} className="text-sm space-y-1">
            <div><span className="text-gray-500">Model:</span> {mod.manufacturer} {mod.modelNumber}</div>
            <div><span className="text-gray-500">Type:</span> {mod.moduleType} ({mod.cellTechnology})</div>
            <div><span className="text-gray-500">Power:</span> {mod.ratedPower}W | <span className="text-gray-500">Qty:</span> {mod.quantity}</div>
            <div><span className="text-gray-500">Dimensions:</span> {mod.dimensions.length} x {mod.dimensions.width} x {mod.dimensions.thickness} mm</div>
          </div>
        ))}
        {sr.specialRequirements && (
          <div className="mt-2 text-xs text-gray-600 bg-amber-50 p-2 rounded">{sr.specialRequirements}</div>
        )}
      </div>

      {/* Communication Log */}
      <div className="bg-white rounded border p-3">
        <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Communication Log</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {sr.communicationLog.map((entry, i) => (
            <div key={i} className="text-xs border-l-2 border-amber-300 pl-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{entry.from}</span>
                <span className="text-gray-400">→</span>
                <span>{entry.to}</span>
                <span className={cn('px-1 rounded', entry.type === 'email' ? 'bg-blue-50 text-blue-600' : entry.type === 'phone' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600')}>
                  {entry.type}
                </span>
              </div>
              <div className="text-gray-500 mt-0.5">{formatDate(entry.timestamp)} - {entry.subject}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Samples & BOM Tab
// ============================================================================
function SamplesBOMTab() {
  const [selectedSample, setSelectedSample] = useState<string>('SAMPLE-2026-00001')
  const sampleBom = bomEntries.filter((b) => b.sampleId === selectedSample)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sample Acceptance & Bill of Materials</h2>
        <Link href="/lims/samples" className="text-sm text-amber-600 hover:underline">View Full Sample Registry</Link>
      </div>

      {/* Sample Selection */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-semibold mb-3">Select Sample for BOM Review</h3>
        <select
          value={selectedSample}
          onChange={(e) => setSelectedSample(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm w-full max-w-md"
        >
          <option value="SAMPLE-2026-00001">SAMPLE-2026-00001 - SunPower SPR-MAX6-450</option>
          <option value="SAMPLE-2026-00002">SAMPLE-2026-00002 - SunPower SPR-MAX6-450</option>
        </select>
      </div>

      {/* BOM Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold">Bill of Materials - {selectedSample}</h3>
          <p className="text-xs text-gray-500 mt-1">Manufacturer certificates, UL test reports, datasheet specifications</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Component</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Specification</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Manufacturer</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part No.</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Certification</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sampleBom.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{item.component}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.specification}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.manufacturer}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-500">{item.partNumber}</td>
                  <td className="px-4 py-3 text-sm">{item.quantity} {item.unit}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{item.certificationRef}</td>
                  <td className="px-4 py-3">
                    {item.verified ? (
                      <div>
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Verified</span>
                        <div className="text-[10px] text-gray-400 mt-0.5">{item.verifiedBy} - {item.verifiedAt ? formatDate(item.verifiedAt) : ''}</div>
                      </div>
                    ) : (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Pending</span>
                    )}
                  </td>
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
// Approvals Tab
// ============================================================================
function ApprovalsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Approval Workflow</h2>
        <div className="text-xs text-gray-500">Technician → Reviewer → Approver → Lab Manager</div>
      </div>

      {/* Approval Workflow Cards */}
      {approvalWorkflows.map((aw) => (
        <ApprovalWorkflowCard key={aw.id} workflow={aw} />
      ))}
    </div>
  )
}

function ApprovalWorkflowCard({ workflow }: { workflow: ApprovalWorkflowEntry }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold">{workflow.recordId}</div>
          <div className="text-xs text-gray-500 capitalize">{workflow.recordType.replace(/_/g, ' ')}</div>
        </div>
        <span className={cn(
          'text-xs font-medium px-2 py-0.5 rounded',
          workflow.status === 'approved' ? 'bg-green-100 text-green-700' :
          workflow.status === 'rejected' ? 'bg-red-100 text-red-700' :
          'bg-amber-100 text-amber-700'
        )}>
          {workflow.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* 4-Step Approval Flow */}
      <div className="flex items-center gap-2">
        {workflow.approvals.map((step, i) => (
          <div key={step.level} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2',
                step.status === 'approved' ? 'bg-green-100 border-green-500 text-green-700' :
                step.status === 'rejected' ? 'bg-red-100 border-red-500 text-red-700' :
                step.status === 'pending' && step.level === workflow.currentLevel ? 'bg-amber-100 border-amber-500 text-amber-700 animate-pulse' :
                'bg-gray-50 border-gray-200 text-gray-400'
              )}>
                {step.status === 'approved' ? '✓' : step.status === 'rejected' ? '✗' : i + 1}
              </div>
              <div className="text-[10px] text-gray-500 mt-1 capitalize text-center">{step.level.replace(/_/g, ' ')}</div>
              <div className="text-[10px] font-medium text-center">{step.approverName.split(' ').slice(-1)[0]}</div>
              {step.digitalSignature && (
                <div className="text-[9px] text-green-600 font-mono mt-0.5">DS: {step.digitalSignature.slice(-6)}</div>
              )}
              {step.timestamp && (
                <div className="text-[9px] text-gray-400">{formatDate(step.timestamp)}</div>
              )}
            </div>
            {i < workflow.approvals.length - 1 && (
              <div className={cn('w-8 h-0.5 -mt-8', step.status === 'approved' ? 'bg-green-400' : 'bg-gray-200')} />
            )}
          </div>
        ))}
      </div>

      {/* Comments from approved steps */}
      {workflow.approvals.filter(s => s.status === 'approved' && s.comments).length > 0 && (
        <div className="mt-3 pt-3 border-t space-y-1">
          {workflow.approvals.filter(s => s.status === 'approved' && s.comments).map((step) => (
            <div key={step.level} className="text-xs text-gray-600">
              <span className={cn('font-medium px-1 py-0.5 rounded mr-1', approvalLevelColors[step.level])}>
                {step.approverName}
              </span>
              {step.comments}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Schedule Tab
// ============================================================================
function ScheduleTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Project Test Schedule</h2>
      {projectSchedules.map((schedule) => (
        <ProjectScheduleCard key={schedule.id} schedule={schedule} />
      ))}
    </div>
  )
}

function ProjectScheduleCard({ schedule }: { schedule: ProjectSchedule }) {
  const startDate = new Date(schedule.startDate)
  const endDate = new Date(schedule.targetEndDate)
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold">{schedule.projectName}</div>
          <div className="text-xs text-gray-500">{schedule.clientName} | {schedule.projectId}</div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded',
            schedule.status === 'completed' ? 'bg-green-100 text-green-700' :
            schedule.status === 'delayed' ? 'bg-red-100 text-red-700' :
            schedule.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-700'
          )}>
            {schedule.status.replace(/_/g, ' ')}
          </span>
          <div className="text-right">
            <div className="text-lg font-bold text-amber-600">{schedule.overallProgress}%</div>
            <div className="text-[10px] text-gray-500">Overall Progress</div>
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
        <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${schedule.overallProgress}%` }} />
      </div>

      {/* Gantt-like Milestone View */}
      <div className="space-y-1">
        <div className="flex items-center text-[10px] text-gray-400 mb-2">
          <div className="w-48" />
          <div className="flex-1 flex justify-between">
            <span>{formatDate(schedule.startDate)}</span>
            <span>{formatDate(schedule.targetEndDate)}</span>
          </div>
        </div>
        {schedule.milestones.map((ms) => {
          const msStart = new Date(ms.startDate)
          const msEnd = new Date(ms.endDate)
          const leftPct = Math.max(0, ((msStart.getTime() - startDate.getTime()) / (totalDays * 86400000)) * 100)
          const widthPct = Math.max(3, ((msEnd.getTime() - msStart.getTime()) / (totalDays * 86400000)) * 100)

          return (
            <div key={ms.id} className="flex items-center gap-2">
              <div className="w-48 text-xs text-gray-700 truncate pr-2">{ms.name}</div>
              <div className="flex-1 relative h-6 bg-gray-50 rounded">
                <div
                  className={cn(
                    'absolute h-full rounded flex items-center justify-center text-[9px] font-medium text-white',
                    ms.status === 'completed' ? 'bg-green-500' :
                    ms.status === 'in_progress' ? 'bg-amber-500' :
                    ms.status === 'delayed' ? 'bg-red-500' :
                    'bg-gray-300'
                  )}
                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                >
                  {ms.progress > 0 && `${ms.progress}%`}
                </div>
              </div>
              <div className="w-20 text-[10px] text-gray-500 text-right">{ms.assignedTo.split(' ').slice(-1)[0]}</div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 pt-3 border-t flex items-center gap-4 text-[10px]">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded" /> Completed</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-500 rounded" /> In Progress</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-300 rounded" /> Pending</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded" /> Delayed</span>
      </div>
    </div>
  )
}

// ============================================================================
// Certificates Tab
// ============================================================================
function CertificatesTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Lab Certificates</h2>

      {labCertificates.map((cert) => (
        <div key={cert.id} className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold font-mono">{cert.certificateNumber}</div>
              <div className="text-xs text-gray-500">{cert.clientName} | {cert.testStandard}</div>
            </div>
            <span className={cn(
              'text-xs font-medium px-2 py-0.5 rounded',
              cert.status === 'issued' ? 'bg-green-100 text-green-700' :
              cert.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            )}>
              {cert.status} (v{cert.version})
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
            <div><span className="text-xs text-gray-500">Issue Date:</span><br />{formatDate(cert.issueDate)}</div>
            <div><span className="text-xs text-gray-500">Valid Until:</span><br />{formatDate(cert.validUntil)}</div>
            <div><span className="text-xs text-gray-500">Accreditation:</span><br />{cert.accreditationBody} ({cert.accreditationNumber})</div>
            <div><span className="text-xs text-gray-500">Lab:</span><br />{cert.labName}</div>
          </div>

          {/* Test Results Summary */}
          <div className="mb-3">
            <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Test Results</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-1 px-2">Test</th>
                    <th className="text-left py-1 px-2">Clause</th>
                    <th className="text-left py-1 px-2">Value</th>
                    <th className="text-left py-1 px-2">Criteria</th>
                    <th className="text-left py-1 px-2">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {cert.testResults.map((tr, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-1.5 px-2 font-medium">{tr.testName}</td>
                      <td className="py-1.5 px-2 text-gray-500">{tr.clause}</td>
                      <td className="py-1.5 px-2">{tr.value}</td>
                      <td className="py-1.5 px-2 text-gray-500">{tr.acceptanceCriteria}</td>
                      <td className="py-1.5 px-2">
                        <span className={cn(
                          'px-1.5 py-0.5 rounded font-medium',
                          tr.result === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        )}>
                          {tr.result.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatories */}
          <div>
            <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Digital Signatures</h4>
            <div className="flex gap-4">
              {cert.signatories.map((sig, i) => (
                <div key={i} className="flex items-center gap-2 bg-green-50 rounded px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-green-700 text-xs font-bold">
                    {sig.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-xs font-medium">{sig.name}</div>
                    <div className="text-[10px] text-gray-500">{sig.title}</div>
                    {sig.digitalSignature && (
                      <div className="text-[9px] text-green-600 font-mono">DS: {sig.digitalSignature.slice(-8)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// Audit Trail Tab
// ============================================================================
function AuditTrailTab() {
  const [filterRecord, setFilterRecord] = useState<string>('all')
  const filteredEntries = filterRecord === 'all'
    ? auditTrailEntries
    : auditTrailEntries.filter((e) => e.recordId === filterRecord)

  const uniqueRecords = Array.from(new Set(auditTrailEntries.map((e) => e.recordId)))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Audit Trail</h2>
        <select
          value={filterRecord}
          onChange={(e) => setFilterRecord(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm"
        >
          <option value="all">All Records</option>
          {uniqueRecords.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <p className="text-xs text-gray-500 mb-3">Every field change is tracked with version, user, timestamp, and reason. Rollback available.</p>
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <AuditTrailRow key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  )
}

function AuditTrailRow({ entry }: { entry: AuditTrailEntry }) {
  return (
    <div className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 border-l-2 border-amber-300">
      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-[10px] font-bold shrink-0">
        v{entry.version}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{entry.recordId}</span>
          <span className="text-xs text-gray-400">{entry.recordType}</span>
          <span className="text-xs text-gray-400 ml-auto">{new Date(entry.changedAt).toLocaleString('en-IN')}</span>
        </div>
        <div className="text-sm mt-1">
          <span className="font-medium">{entry.fieldName}</span>:{' '}
          <span className="text-red-500 line-through">{entry.oldValue}</span>
          {' → '}
          <span className="text-green-600 font-medium">{entry.newValue}</span>
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          by {entry.changedBy} — {entry.reason}
        </div>
      </div>
    </div>
  )
}
