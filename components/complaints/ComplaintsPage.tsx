'use client'

import { useState } from 'react'
import { cn, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { customerComplaints, complaintAnalytics } from '@/lib/data/complaints-data'
import type { CustomerComplaint } from '@/lib/types'

type TabKey = 'dashboard' | 'complaints' | 'analytics'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'dashboard', label: 'Overview' },
  { key: 'complaints', label: 'All Complaints' },
  { key: 'analytics', label: 'Analytics' },
]

const severityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
}

const statusColors: Record<string, string> = {
  registered: 'bg-blue-100 text-blue-700',
  acknowledged: 'bg-indigo-100 text-indigo-700',
  under_investigation: 'bg-yellow-100 text-yellow-700',
  resolution_proposed: 'bg-purple-100 text-purple-700',
  resolution_accepted: 'bg-cyan-100 text-cyan-700',
  closed: 'bg-green-100 text-green-700',
  reopened: 'bg-red-100 text-red-700',
}

export default function ComplaintsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Complaints</h1>
          <p className="text-sm text-gray-500">Complaint Registration, Investigation, Resolution & SLA Tracking</p>
        </div>
        <button onClick={() => toast.info("New complaint registration form coming soon")} className="px-4 py-2 text-sm bg-amber-600 text-white rounded hover:bg-amber-700">
          + New Complaint
        </button>
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

      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'complaints' && <ComplaintsListTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
    </div>
  )
}

// ============================================================================
// Dashboard Tab
// ============================================================================
function DashboardTab() {
  const a = complaintAnalytics
  const openComplaints = customerComplaints.filter(c => c.status !== 'closed')
  const slaAtRisk = customerComplaints.filter(c => {
    if (c.status === 'closed') return false
    const deadline = new Date(c.slaDeadline)
    const now = new Date('2026-03-09')
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysLeft <= 3
  })

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Total Complaints</div>
          <div className="text-3xl font-bold text-gray-800 mt-1">{a.totalComplaints}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Open</div>
          <div className="text-3xl font-bold text-amber-600 mt-1">{a.openComplaints}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Avg Resolution</div>
          <div className="text-3xl font-bold text-blue-600 mt-1">{a.avgResolutionDays}d</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">SLA Compliance</div>
          <div className="text-3xl font-bold text-green-600 mt-1">{a.slaComplianceRate}%</div>
        </div>
      </div>

      {/* SLA At Risk */}
      {slaAtRisk.length > 0 && (
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <h3 className="text-sm font-semibold text-red-800 mb-2">SLA At Risk ({slaAtRisk.length})</h3>
          <div className="space-y-2">
            {slaAtRisk.map((c) => {
              const deadline = new Date(c.slaDeadline)
              const now = new Date('2026-03-09')
              const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
              return (
                <div key={c.id} className="flex items-center justify-between bg-white rounded p-2">
                  <div>
                    <div className="text-sm font-medium">{c.complaintNumber} - {c.title}</div>
                    <div className="text-xs text-gray-500">{c.customerOrganization}</div>
                  </div>
                  <div className="text-right">
                    <div className={cn('text-sm font-bold', daysLeft <= 1 ? 'text-red-600' : 'text-orange-600')}>
                      {daysLeft <= 0 ? 'BREACHED' : `${daysLeft}d left`}
                    </div>
                    <div className="text-[10px] text-gray-500">SLA: {formatDate(c.slaDeadline)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Open Complaints */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold">Open Complaints</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {openComplaints.map((c) => (
            <ComplaintRow key={c.id} complaint={c} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ComplaintRow({ complaint }: { complaint: CustomerComplaint }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <div
        className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-amber-600 font-medium">{complaint.complaintNumber}</span>
            <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded', severityColors[complaint.severity])}>
              {complaint.severity}
            </span>
          </div>
          <div className="text-sm font-medium mt-0.5">{complaint.title}</div>
          <div className="text-xs text-gray-500">{complaint.customerOrganization} - {complaint.customerName}</div>
        </div>
        <div className="text-right shrink-0">
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded', statusColors[complaint.status])}>
            {complaint.status.replace(/_/g, ' ')}
          </span>
          <div className="text-xs text-gray-500 mt-1">{complaint.assignedTo}</div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 bg-gray-50">
          <ComplaintDetail complaint={complaint} />
        </div>
      )}
    </div>
  )
}

function ComplaintDetail({ complaint }: { complaint: CustomerComplaint }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Details */}
      <div className="bg-white rounded border p-3 space-y-2">
        <h4 className="text-xs font-semibold uppercase text-gray-500">Details</h4>
        <p className="text-sm text-gray-700">{complaint.description}</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><span className="text-gray-500">Category:</span> {complaint.category}</div>
          <div><span className="text-gray-500">Subcategory:</span> {complaint.subcategory}</div>
          <div><span className="text-gray-500">SLA Deadline:</span> {formatDate(complaint.slaDeadline)}</div>
          <div><span className="text-gray-500">SLA Breached:</span> {complaint.slaBreached ? 'Yes' : 'No'}</div>
          {complaint.rcaId && <div><span className="text-gray-500">RCA:</span> {complaint.rcaId}</div>}
          {complaint.escalatedTo && <div><span className="text-gray-500">Escalated To:</span> {complaint.escalatedTo}</div>}
        </div>
        {complaint.investigationNotes && (
          <div>
            <span className="text-xs text-gray-500">Investigation Notes:</span>
            <p className="text-xs text-gray-700 mt-0.5">{complaint.investigationNotes}</p>
          </div>
        )}
        {complaint.resolution && (
          <div className="bg-green-50 p-2 rounded">
            <span className="text-xs text-green-600 font-medium">Resolution:</span>
            <p className="text-xs text-green-800 mt-0.5">{complaint.resolution}</p>
          </div>
        )}
      </div>

      {/* Timeline & Communication */}
      <div className="space-y-3">
        <div className="bg-white rounded border p-3">
          <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Timeline</h4>
          <div className="space-y-2">
            {complaint.timeline.map((entry, i) => (
              <div key={i} className="flex gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0" />
                <div>
                  <div className="font-medium">{entry.action}</div>
                  <div className="text-gray-500">{entry.performedBy} - {formatDate(entry.timestamp)}</div>
                  <div className="text-gray-600">{entry.details}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded border p-3">
          <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Communication Log</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {complaint.communicationLog.map((entry) => (
              <div key={entry.id} className="text-xs border-l-2 border-amber-300 pl-2">
                <div className="flex items-center gap-1">
                  <span className="font-medium">{entry.from}</span>
                  <span className="text-gray-400">→</span>
                  <span>{entry.to}</span>
                  <span className={cn(
                    'px-1 rounded',
                    entry.channel === 'email' ? 'bg-blue-50 text-blue-600' :
                    entry.channel === 'phone' ? 'bg-green-50 text-green-600' :
                    'bg-gray-50 text-gray-600'
                  )}>
                    {entry.channel}
                  </span>
                </div>
                <div className="text-gray-500">{formatDate(entry.timestamp)} - {entry.subject}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Complaints List Tab
// ============================================================================
function ComplaintsListTab() {
  const [filter, setFilter] = useState<string>('all')
  const filtered = filter === 'all'
    ? customerComplaints
    : customerComplaints.filter(c => c.status === filter)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm"
        >
          <option value="all">All Status</option>
          <option value="registered">Registered</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="under_investigation">Under Investigation</option>
          <option value="resolution_proposed">Resolution Proposed</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Complaint #</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SLA</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((c) => {
                const deadline = new Date(c.slaDeadline)
                const now = new Date('2026-03-09')
                const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-amber-600 font-medium">{c.complaintNumber}</td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate">{c.title}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{c.customerName}</div>
                      <div className="text-xs text-gray-500">{c.customerOrganization}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded', severityColors[c.severity])}>
                        {c.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{c.category}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded', statusColors[c.status])}>
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {c.status === 'closed' ? (
                        <span className="text-xs text-green-600">Resolved</span>
                      ) : (
                        <span className={cn('text-xs font-medium', daysLeft <= 2 ? 'text-red-600' : 'text-gray-600')}>
                          {daysLeft <= 0 ? 'BREACHED' : `${daysLeft}d left`}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.assignedTo}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Analytics Tab
// ============================================================================
function AnalyticsTab() {
  const a = complaintAnalytics

  return (
    <div className="space-y-6">
      {/* By Category + By Severity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-3">Complaints by Category</h3>
          <div className="space-y-2">
            {a.byCategory.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <span className="text-sm">{item.category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(item.count / a.totalComplaints) * 100}%` }} />
                  </div>
                  <span className="text-sm font-bold w-6 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-3">Complaints by Severity</h3>
          <div className="space-y-2">
            {a.bySeverity.map((item) => (
              <div key={item.severity} className="flex items-center justify-between">
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded', severityColors[item.severity.toLowerCase()])}>
                  {item.severity}
                </span>
                <span className="text-sm font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-semibold mb-3">Monthly Complaint Trend</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 text-xs text-gray-500 uppercase">Month</th>
                <th className="text-right py-2 px-3 text-xs text-gray-500 uppercase">Opened</th>
                <th className="text-right py-2 px-3 text-xs text-gray-500 uppercase">Closed</th>
                <th className="text-left py-2 px-3 text-xs text-gray-500 uppercase">Trend</th>
              </tr>
            </thead>
            <tbody>
              {a.byMonth.map((row) => (
                <tr key={row.month} className="border-b last:border-0">
                  <td className="py-2 px-3 font-medium">{row.month}</td>
                  <td className="py-2 px-3 text-right text-red-600">{row.opened}</td>
                  <td className="py-2 px-3 text-right text-green-600">{row.closed}</td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1">
                      <div className="bg-red-200 rounded" style={{ width: `${row.opened * 20}px`, height: 8 }} />
                      <div className="bg-green-200 rounded" style={{ width: `${row.closed * 20}px`, height: 8 }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Issues */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-semibold mb-3">Top Complaint Issues</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 text-xs text-gray-500 uppercase">Issue</th>
                <th className="text-right py-2 px-3 text-xs text-gray-500 uppercase">Count</th>
                <th className="text-right py-2 px-3 text-xs text-gray-500 uppercase">Avg Resolution (days)</th>
              </tr>
            </thead>
            <tbody>
              {a.topIssues.map((issue) => (
                <tr key={issue.issue} className="border-b last:border-0">
                  <td className="py-2 px-3 font-medium">{issue.issue}</td>
                  <td className="py-2 px-3 text-right">{issue.count}</td>
                  <td className="py-2 px-3 text-right">{issue.avgDays}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
