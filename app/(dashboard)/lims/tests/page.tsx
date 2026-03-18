// @ts-nocheck
'use client'

import { useState } from 'react'
import ProtocolFormSystem from '@/components/protocol-form/ProtocolFormSystem'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  GitCompare,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  Wrench,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Shield,
  Beaker,
} from 'lucide-react'

// ── Mock Data ──────────────────────────────────────────────────────────────────

const PROTOCOL_VERSIONS = [
  {
    id: 'v3.1',
    label: 'v3.1 (Current)',
    date: '2026-03-10',
    author: 'Dr. Priya Sharma',
    status: 'Published',
  },
  {
    id: 'v3.0',
    label: 'v3.0',
    date: '2026-01-15',
    author: 'Rajesh Kumar',
    status: 'Archived',
  },
  {
    id: 'v2.4',
    label: 'v2.4',
    date: '2025-09-22',
    author: 'Dr. Priya Sharma',
    status: 'Archived',
  },
]

const VERSION_DIFFS = [
  {
    section: 'Section 4.2 – Thermal Cycling Parameters',
    type: 'modified' as const,
    oldText: 'Temperature range: -40°C to +85°C, 200 cycles, ramp rate 100°C/h ± 10°C/h',
    newText: 'Temperature range: -40°C to +85°C, 200 cycles, ramp rate 100°C/h ± 5°C/h (tighter tolerance per IEC 61215:2021 Amendment 1)',
  },
  {
    section: 'Section 5.1 – IV Curve Measurement',
    type: 'added' as const,
    oldText: '',
    newText: 'Added bifacial irradiance measurement requirement: rear-side irradiance sensor at 3 positions minimum, per IEC TS 60904-1-2',
  },
  {
    section: 'Section 6.3 – Humidity Freeze Test',
    type: 'modified' as const,
    oldText: 'Dwell time at -40°C: minimum 30 minutes',
    newText: 'Dwell time at -40°C: minimum 60 minutes (aligned with updated NABL guidance note GL-040)',
  },
  {
    section: 'Section 7.0 – Visual Inspection Criteria',
    type: 'removed' as const,
    oldText: 'Subjective grading scale A/B/C for cell discoloration',
    newText: '',
  },
  {
    section: 'Section 7.1 – AI-Assisted Visual Inspection',
    type: 'added' as const,
    oldText: '',
    newText: 'EL/IR image analysis via SolarVisionAI defect classifier (confidence threshold ≥ 85%) replaces manual grading for cell-level defects',
  },
  {
    section: 'Section 8.2 – Uncertainty Budget',
    type: 'modified' as const,
    oldText: 'Coverage factor k=2 (95% confidence level)',
    newText: 'Coverage factor k=2 (95.45% confidence level). Added Monte Carlo validation requirement for non-Gaussian distributions per JCGM 101:2008',
  },
]

const APPROVAL_STAGES = [
  {
    id: 1,
    name: 'Draft',
    status: 'completed' as const,
    completedBy: 'Dr. Priya Sharma',
    completedAt: '2026-02-28',
    notes: 'Initial draft incorporating IEC 61215:2021 Amendment 1 changes',
  },
  {
    id: 2,
    name: 'Technical Review',
    status: 'completed' as const,
    completedBy: 'Rajesh Kumar',
    completedAt: '2026-03-04',
    notes: '3 comments resolved, tightened ramp rate tolerance accepted',
  },
  {
    id: 3,
    name: 'Quality Review',
    status: 'completed' as const,
    completedBy: 'Anita Desai (QA Head)',
    completedAt: '2026-03-07',
    notes: 'ISO 17025 clause 7.2.2 compliance verified, uncertainty section updated',
  },
  {
    id: 4,
    name: 'Lab Manager Approval',
    status: 'current' as const,
    completedBy: null,
    completedAt: null,
    notes: 'Pending final sign-off – estimated 2026-03-19',
  },
  {
    id: 5,
    name: 'Published',
    status: 'pending' as const,
    completedBy: null,
    completedAt: null,
    notes: 'Auto-publishes after Lab Manager approval',
  },
]

const EQUIPMENT_REQUIREMENTS = [
  {
    protocol: 'IEC 61215 – Thermal Cycling (MQT 11)',
    equipment: [
      { name: 'Environmental Chamber (TC)', id: 'EQ-ENV-001', calibrationDue: '2026-06-15', status: 'calibrated' as const },
      { name: 'T-Type Thermocouple Array (×12)', id: 'EQ-TC-014', calibrationDue: '2026-04-01', status: 'calibrated' as const },
      { name: 'Data Logger – Agilent 34970A', id: 'EQ-DL-003', calibrationDue: '2026-03-25', status: 'due-soon' as const },
      { name: 'IV Curve Tracer – Sinton FCT-450', id: 'EQ-IV-002', calibrationDue: '2026-08-10', status: 'calibrated' as const },
    ],
  },
  {
    protocol: 'IEC 61215 – Damp Heat (MQT 13)',
    equipment: [
      { name: 'DH Chamber – Espec PL-4KPH', id: 'EQ-DH-001', calibrationDue: '2026-05-20', status: 'calibrated' as const },
      { name: 'Humidity Sensor – Vaisala HMT330', id: 'EQ-HU-005', calibrationDue: '2026-04-10', status: 'calibrated' as const },
      { name: 'Insulation Resistance Tester – Megger MIT520', id: 'EQ-IR-002', calibrationDue: '2026-03-20', status: 'due-soon' as const },
    ],
  },
  {
    protocol: 'IEC 61730 – Impulse Voltage (MST 14)',
    equipment: [
      { name: 'Impulse Generator – Haefely PSURGE 30', id: 'EQ-IG-001', calibrationDue: '2026-07-01', status: 'calibrated' as const },
      { name: 'HV Divider – 100 kV', id: 'EQ-HV-003', calibrationDue: '2025-12-15', status: 'overdue' as const },
      { name: 'Digital Oscilloscope – Tektronix MSO58', id: 'EQ-OS-002', calibrationDue: '2026-09-30', status: 'calibrated' as const },
    ],
  },
  {
    protocol: 'IEC 60904-9 – Sun Simulator Classification',
    equipment: [
      { name: 'Class A+ Sun Simulator – Pasan 3b', id: 'EQ-SS-001', calibrationDue: '2026-05-05', status: 'calibrated' as const },
      { name: 'Reference Cell – WPVS (Fraunhofer ISE)', id: 'EQ-RC-001', calibrationDue: '2026-04-18', status: 'calibrated' as const },
      { name: 'Spectroradiometer – EKO MS-711', id: 'EQ-SP-002', calibrationDue: '2026-06-22', status: 'calibrated' as const },
    ],
  },
]

// ── Sub-Components ─────────────────────────────────────────────────────────────

function VersionComparisonPanel() {
  const [leftVersion, setLeftVersion] = useState('v3.0')
  const [rightVersion, setRightVersion] = useState('v3.1')
  const [expandedDiffs, setExpandedDiffs] = useState<Record<number, boolean>>(
    Object.fromEntries(VERSION_DIFFS.map((_, i) => [i, true]))
  )

  const toggleDiff = (index: number) => {
    setExpandedDiffs((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const diffTypeConfig = {
    added: { icon: Plus, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'Added' },
    removed: { icon: Minus, color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Removed' },
    modified: { icon: GitCompare, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'Modified' },
  }

  return (
    <div className="space-y-4">
      {/* Version Selectors */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Base:</label>
          <select
            value={leftVersion}
            onChange={(e) => setLeftVersion(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {PROTOCOL_VERSIONS.map((v) => (
              <option key={v.id} value={v.id}>{v.label} – {v.date}</option>
            ))}
          </select>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400 shrink-0" />
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Compare:</label>
          <select
            value={rightVersion}
            onChange={(e) => setRightVersion(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {PROTOCOL_VERSIONS.map((v) => (
              <option key={v.id} value={v.id}>{v.label} – {v.date}</option>
            ))}
          </select>
        </div>
        <Badge variant="outline" className="ml-auto border-amber-300 bg-amber-50 text-amber-700">
          {VERSION_DIFFS.length} changes
        </Badge>
      </div>

      {/* Summary Badges */}
      <div className="flex gap-2 flex-wrap">
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          <Plus className="mr-1 h-3 w-3" />
          {VERSION_DIFFS.filter((d) => d.type === 'added').length} Added
        </Badge>
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
          <GitCompare className="mr-1 h-3 w-3" />
          {VERSION_DIFFS.filter((d) => d.type === 'modified').length} Modified
        </Badge>
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
          <Minus className="mr-1 h-3 w-3" />
          {VERSION_DIFFS.filter((d) => d.type === 'removed').length} Removed
        </Badge>
      </div>

      {/* Diff List */}
      <div className="space-y-3">
        {VERSION_DIFFS.map((diff, index) => {
          const config = diffTypeConfig[diff.type]
          const Icon = config.icon
          const isExpanded = expandedDiffs[index]

          return (
            <div key={index} className={`rounded-lg border ${config.bg} overflow-hidden`}>
              <button
                onClick={() => toggleDiff(index)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left"
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${config.color} shrink-0`} />
                  <span className="text-sm font-medium text-gray-800">{diff.section}</span>
                  <Badge variant="outline" className={`text-xs ${config.color} border-current`}>
                    {config.label}
                  </Badge>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-500 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-current/10 px-4 py-3 space-y-2">
                  {diff.oldText && (
                    <div className="flex gap-2">
                      <Minus className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-800 bg-red-100/60 rounded px-2 py-1 flex-1 font-mono leading-relaxed">
                        {diff.oldText}
                      </p>
                    </div>
                  )}
                  {diff.newText && (
                    <div className="flex gap-2">
                      <Plus className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-emerald-800 bg-emerald-100/60 rounded px-2 py-1 flex-1 font-mono leading-relaxed">
                        {diff.newText}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ApprovalWorkflowPanel() {
  return (
    <div className="space-y-6">
      {/* Pipeline Visual */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {APPROVAL_STAGES.map((stage, index) => {
          const isCompleted = stage.status === 'completed'
          const isCurrent = stage.status === 'current'
          const isPending = stage.status === 'pending'

          return (
            <div key={stage.id} className="flex items-center shrink-0">
              <div
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 transition-all ${
                  isCompleted
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : isCurrent
                    ? 'border-amber-400 bg-amber-50 text-amber-800 ring-2 ring-amber-300 ring-offset-1'
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                }`}
              >
                {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                {isCurrent && <Clock className="h-4 w-4 text-amber-600 shrink-0 animate-pulse" />}
                {isPending && <Circle className="h-4 w-4 text-gray-400 shrink-0" />}
                <span className="text-sm font-medium whitespace-nowrap">{stage.name}</span>
              </div>
              {index < APPROVAL_STAGES.length - 1 && (
                <ArrowRight
                  className={`mx-1 h-4 w-4 shrink-0 ${
                    isCompleted ? 'text-emerald-400' : 'text-gray-300'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Stage Details */}
      <div className="space-y-3">
        {APPROVAL_STAGES.map((stage) => {
          const isCompleted = stage.status === 'completed'
          const isCurrent = stage.status === 'current'

          return (
            <div
              key={stage.id}
              className={`flex items-start gap-4 rounded-lg border p-4 ${
                isCurrent
                  ? 'border-amber-300 bg-amber-50/50'
                  : isCompleted
                  ? 'border-emerald-200 bg-white'
                  : 'border-gray-200 bg-gray-50/50'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shrink-0 ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-700'
                    : isCurrent
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {stage.id}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">{stage.name}</span>
                  {isCompleted && (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs">
                      Completed
                    </Badge>
                  )}
                  {isCurrent && (
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs animate-pulse">
                      In Progress
                    </Badge>
                  )}
                  {stage.status === 'pending' && (
                    <Badge variant="outline" className="text-gray-500 text-xs">
                      Pending
                    </Badge>
                  )}
                </div>
                {stage.completedBy && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">{stage.completedBy}</span>
                    {stage.completedAt && (
                      <span className="text-gray-400"> &middot; {stage.completedAt}</span>
                    )}
                  </p>
                )}
                {stage.notes && (
                  <p className="text-sm text-gray-500 mt-1">{stage.notes}</p>
                )}
              </div>
              {isCurrent && (
                <Button
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
                  onClick={() => toast.success('Reminder sent to Lab Manager for approval.')}
                >
                  Send Reminder
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EquipmentRequirementsPanel() {
  const [expandedProtocol, setExpandedProtocol] = useState<number | null>(0)

  const statusConfig = {
    calibrated: { label: 'Calibrated', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    'due-soon': { label: 'Cal. Due Soon', color: 'bg-amber-100 text-amber-700', icon: Clock },
    overdue: { label: 'Cal. Overdue', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  }

  return (
    <div className="space-y-3">
      {EQUIPMENT_REQUIREMENTS.map((proto, pIndex) => {
        const isExpanded = expandedProtocol === pIndex
        const hasIssues = proto.equipment.some((e) => e.status !== 'calibrated')

        return (
          <div key={pIndex} className="rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setExpandedProtocol(isExpanded ? null : pIndex)}
              className="flex w-full items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Beaker className="h-4 w-4 text-amber-600 shrink-0" />
                <span className="text-sm font-semibold text-gray-800">{proto.protocol}</span>
                {hasIssues && (
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs text-gray-500">
                  {proto.equipment.length} items
                </Badge>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600">
                      <th className="px-4 py-2 text-left font-medium">Equipment</th>
                      <th className="px-4 py-2 text-left font-medium">ID</th>
                      <th className="px-4 py-2 text-left font-medium">Cal. Due</th>
                      <th className="px-4 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proto.equipment.map((eq, eIndex) => {
                      const sc = statusConfig[eq.status]
                      const StatusIcon = sc.icon
                      return (
                        <tr
                          key={eIndex}
                          className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <Wrench className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                              <span className="text-gray-800">{eq.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{eq.id}</td>
                          <td className="px-4 py-2.5 text-gray-600">{eq.calibrationDue}</td>
                          <td className="px-4 py-2.5">
                            <Badge className={`${sc.color} hover:${sc.color} text-xs`}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {sc.label}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}

      {/* Summary Footer */}
      <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-amber-800">
          <Shield className="h-4 w-4" />
          <span>
            <strong>
              {EQUIPMENT_REQUIREMENTS.flatMap((p) => p.equipment).filter((e) => e.status === 'overdue').length}
            </strong>{' '}
            overdue &middot;{' '}
            <strong>
              {EQUIPMENT_REQUIREMENTS.flatMap((p) => p.equipment).filter((e) => e.status === 'due-soon').length}
            </strong>{' '}
            due soon &middot;{' '}
            <strong>
              {EQUIPMENT_REQUIREMENTS.flatMap((p) => p.equipment).filter((e) => e.status === 'calibrated').length}
            </strong>{' '}
            calibrated
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-amber-400 text-amber-700 hover:bg-amber-100"
          onClick={() => toast.info('Redirecting to Equipment Calibration Dashboard...')}
        >
          View Full Cal. Schedule
        </Button>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function TestsPage() {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Test Protocol Manager</h1>
        <p className="text-sm text-gray-500">
          IEC 61215 / 61730 / 61853 / 61701 – ISO 17025 compliant protocol checksheet system
          with raw data integration, auto-fill, IV curve analysis, and document control
        </p>
      </div>

      {/* Enhanced Protocol Management Tabs */}
      <Card className="mb-6 border-amber-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
            <FileText className="h-5 w-5 text-amber-600" />
            Protocol Governance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="approval" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-amber-50">
              <TabsTrigger
                value="approval"
                className="data-[state=active]:bg-amber-600 data-[state=active]:text-white"
              >
                <Clock className="mr-1.5 h-4 w-4" />
                Approval Workflow
              </TabsTrigger>
              <TabsTrigger
                value="versions"
                className="data-[state=active]:bg-amber-600 data-[state=active]:text-white"
              >
                <GitCompare className="mr-1.5 h-4 w-4" />
                Version Comparison
              </TabsTrigger>
              <TabsTrigger
                value="equipment"
                className="data-[state=active]:bg-amber-600 data-[state=active]:text-white"
              >
                <Wrench className="mr-1.5 h-4 w-4" />
                Equipment Requirements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="approval" className="mt-4">
              <ApprovalWorkflowPanel />
            </TabsContent>

            <TabsContent value="versions" className="mt-4">
              <VersionComparisonPanel />
            </TabsContent>

            <TabsContent value="equipment" className="mt-4">
              <EquipmentRequirementsPanel />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ProtocolFormSystem />
    </div>
  )
}
