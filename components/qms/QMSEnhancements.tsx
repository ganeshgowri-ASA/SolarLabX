// @ts-nocheck
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  AlertTriangle, CheckCircle2, Clock, ArrowRight, AlertOctagon,
  FileText, User, Users, Calendar, TrendingUp, TrendingDown, Minus,
  ClipboardList, Wrench, MessageSquare, Target, BarChart3, Activity,
  ChevronRight, ChevronDown, Eye, GitCommit, XCircle, PenLine
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════
// 1. CAPA TRACKING DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

interface CAPAItem {
  id: string
  title: string
  type: 'corrective' | 'preventive'
  source: string
  priority: 'critical' | 'major' | 'minor'
  stage: string
  assignee: string
  dueDate: string
  overdue: boolean
  daysInStage: number
}

const CAPA_STAGES = [
  { key: 'open', label: 'Open', color: 'bg-red-500', lightBg: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' },
  { key: 'investigation', label: 'Investigation', color: 'bg-orange-500', lightBg: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200' },
  { key: 'root_cause', label: 'Root Cause', color: 'bg-amber-500', lightBg: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
  { key: 'action_planned', label: 'Action Planned', color: 'bg-yellow-500', lightBg: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' },
  { key: 'implemented', label: 'Implemented', color: 'bg-blue-500', lightBg: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
  { key: 'verified', label: 'Verified', color: 'bg-emerald-500', lightBg: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
  { key: 'closed', label: 'Closed', color: 'bg-gray-400', lightBg: 'bg-gray-50', textColor: 'text-gray-600', borderColor: 'border-gray-200' },
]

const MOCK_CAPAS: CAPAItem[] = [
  { id: 'CAPA-2026-001', title: 'Temperature deviation in climatic chamber TC-03', type: 'corrective', source: 'Internal Audit', priority: 'critical', stage: 'root_cause', assignee: 'Dr. Priya Sharma', dueDate: '2026-03-10', overdue: true, daysInStage: 12 },
  { id: 'CAPA-2026-002', title: 'Calibration certificate traceability gap for pyranometer', type: 'corrective', source: 'NABL Assessment', priority: 'major', stage: 'investigation', assignee: 'Rajesh Patel', dueDate: '2026-03-25', overdue: false, daysInStage: 5 },
  { id: 'CAPA-2026-003', title: 'Recurring EL imaging misalignment on Module Line B', type: 'corrective', source: 'Customer Complaint', priority: 'major', stage: 'action_planned', assignee: 'Anita Verma', dueDate: '2026-04-01', overdue: false, daysInStage: 3 },
  { id: 'CAPA-2026-004', title: 'Preventive maintenance schedule not followed for sun simulator', type: 'preventive', source: 'Management Review', priority: 'minor', stage: 'implemented', assignee: 'Vikram Singh', dueDate: '2026-03-20', overdue: false, daysInStage: 7 },
  { id: 'CAPA-2026-005', title: 'Risk of cross-contamination in humidity chamber', type: 'preventive', source: 'Risk Assessment', priority: 'major', stage: 'open', assignee: 'Meena Kumari', dueDate: '2026-03-28', overdue: false, daysInStage: 2 },
  { id: 'CAPA-2026-006', title: 'SOP deviation in IEC 61215 MQT 15 (Wet Leakage)', type: 'corrective', source: 'Internal Audit', priority: 'critical', stage: 'open', assignee: 'Suresh Nair', dueDate: '2026-03-08', overdue: true, daysInStage: 15 },
  { id: 'CAPA-2026-007', title: 'Improved labeling for test specimens after IEC 61730 MST', type: 'preventive', source: 'Near Miss', priority: 'minor', stage: 'verified', assignee: 'Deepak Joshi', dueDate: '2026-02-28', overdue: false, daysInStage: 4 },
  { id: 'CAPA-2026-008', title: 'Data integrity issue in IV curve measurement records', type: 'corrective', source: 'NABL Assessment', priority: 'critical', stage: 'investigation', assignee: 'Dr. Priya Sharma', dueDate: '2026-03-15', overdue: true, daysInStage: 9 },
  { id: 'CAPA-2026-009', title: 'UV exposure chamber lamp replacement protocol update', type: 'preventive', source: 'Equipment Review', priority: 'minor', stage: 'closed', assignee: 'Rajesh Patel', dueDate: '2026-02-15', overdue: false, daysInStage: 0 },
  { id: 'CAPA-2026-010', title: 'Training gap for new IEC 61853 energy rating procedure', type: 'preventive', source: 'Competency Review', priority: 'major', stage: 'action_planned', assignee: 'Vikram Singh', dueDate: '2026-04-10', overdue: false, daysInStage: 6 },
]

const priorityConfig = {
  critical: { color: 'bg-red-100 text-red-800 border-red-300', dot: 'bg-red-500' },
  major: { color: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-500' },
  minor: { color: 'bg-blue-100 text-blue-800 border-blue-300', dot: 'bg-blue-500' },
}

export function CAPATrackingDashboard() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null)

  const stageCounts = CAPA_STAGES.map(stage => ({
    ...stage,
    count: MOCK_CAPAS.filter(c => c.stage === stage.key).length,
    overdueCount: MOCK_CAPAS.filter(c => c.stage === stage.key && c.overdue).length,
  }))

  const totalOverdue = MOCK_CAPAS.filter(c => c.overdue).length
  const totalOpen = MOCK_CAPAS.filter(c => c.stage !== 'closed').length
  const avgDaysInStage = Math.round(MOCK_CAPAS.filter(c => c.stage !== 'closed').reduce((acc, c) => acc + c.daysInStage, 0) / totalOpen)

  const filteredCAPAs = selectedStage
    ? MOCK_CAPAS.filter(c => c.stage === selectedStage)
    : MOCK_CAPAS.filter(c => c.stage !== 'closed')

  return (
    <div className="space-y-4">
      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Active CAPAs</div>
            <div className="text-2xl font-bold text-amber-600">{totalOpen}</div>
            <div className="text-xs text-muted-foreground">{MOCK_CAPAS.filter(c => c.type === 'corrective' && c.stage !== 'closed').length} corrective, {MOCK_CAPAS.filter(c => c.type === 'preventive' && c.stage !== 'closed').length} preventive</div>
          </CardContent>
        </Card>
        <Card className={`border-l-4 ${totalOverdue > 0 ? 'border-l-red-500' : 'border-l-green-500'}`}>
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Overdue</div>
            <div className={`text-2xl font-bold ${totalOverdue > 0 ? 'text-red-600' : 'text-green-600'}`}>{totalOverdue}</div>
            {totalOverdue > 0 && <div className="text-xs text-red-600 flex items-center gap-1"><AlertOctagon className="h-3 w-3" /> Immediate attention required</div>}
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Avg. Days in Stage</div>
            <div className="text-2xl font-bold text-blue-600">{avgDaysInStage}</div>
            <div className="text-xs text-muted-foreground">Target: &le; 7 days</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Closed (This Quarter)</div>
            <div className="text-2xl font-bold text-emerald-600">{MOCK_CAPAS.filter(c => c.stage === 'closed').length}</div>
            <div className="text-xs text-muted-foreground">Effectiveness verified</div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Pipeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-600" />
            CAPA Pipeline
          </CardTitle>
          <CardDescription className="text-xs">Click a stage to filter. Showing {selectedStage ? stageCounts.find(s => s.key === selectedStage)?.label : 'all active'} CAPAs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {stageCounts.map((stage, idx) => (
              <div key={stage.key} className="flex items-center">
                <button
                  onClick={() => setSelectedStage(selectedStage === stage.key ? null : stage.key)}
                  className={`flex flex-col items-center min-w-[90px] p-2 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedStage === stage.key
                      ? `${stage.lightBg} ${stage.borderColor} ring-2 ring-offset-1 ring-amber-300`
                      : 'border-transparent hover:bg-muted'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full ${stage.color} text-white flex items-center justify-center text-sm font-bold`}>
                    {stage.count}
                  </div>
                  <span className="text-[10px] font-medium mt-1 text-center leading-tight">{stage.label}</span>
                  {stage.overdueCount > 0 && (
                    <Badge variant="destructive" className="text-[9px] px-1 py-0 mt-1 h-4">
                      {stage.overdueCount} overdue
                    </Badge>
                  )}
                </button>
                {idx < stageCounts.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0 mx-0.5" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CAPA List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            {selectedStage ? `${stageCounts.find(s => s.key === selectedStage)?.label} CAPAs` : 'All Active CAPAs'}
            <Badge variant="outline" className="ml-2 text-[10px]">{filteredCAPAs.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredCAPAs.map(capa => {
            const stageInfo = CAPA_STAGES.find(s => s.key === capa.stage)
            return (
              <div
                key={capa.id}
                className={`p-3 rounded-lg border ${capa.overdue ? 'border-red-300 bg-red-50/50' : 'border-border'} hover:shadow-sm transition-shadow`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-amber-700">{capa.id}</span>
                      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${priorityConfig[capa.priority].color}`}>
                        {capa.priority}
                      </Badge>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                        {capa.type === 'corrective' ? 'CA' : 'PA'}
                      </Badge>
                      {capa.overdue && (
                        <Badge variant="destructive" className="text-[9px] px-1.5 py-0 animate-pulse">
                          OVERDUE
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs mt-1 font-medium leading-tight">{capa.title}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" />{capa.assignee}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" />Due: {capa.dueDate}</span>
                      <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{capa.daysInStage}d in stage</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={`text-[9px] ${stageInfo?.color} text-white border-0`}>
                      {stageInfo?.label}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground">Source: {capa.source}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Aging Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            Aging Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { range: '0-7 days', count: MOCK_CAPAS.filter(c => c.stage !== 'closed' && c.daysInStage <= 7).length, color: 'bg-emerald-500', maxWidth: 100 },
              { range: '8-14 days', count: MOCK_CAPAS.filter(c => c.stage !== 'closed' && c.daysInStage > 7 && c.daysInStage <= 14).length, color: 'bg-amber-500', maxWidth: 100 },
              { range: '15+ days', count: MOCK_CAPAS.filter(c => c.stage !== 'closed' && c.daysInStage > 14).length, color: 'bg-red-500', maxWidth: 100 },
            ].map(bucket => (
              <div key={bucket.range} className="flex items-center gap-3">
                <span className="text-xs w-20 text-muted-foreground">{bucket.range}</span>
                <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                  <div
                    className={`h-full ${bucket.color} rounded-full flex items-center justify-end pr-2 transition-all`}
                    style={{ width: `${Math.max((bucket.count / totalOpen) * 100, 8)}%` }}
                  >
                    <span className="text-[10px] text-white font-bold">{bucket.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. DOCUMENT REVISION HISTORY
// ═══════════════════════════════════════════════════════════════════════════════

interface Revision {
  version: string
  date: string
  author: string
  role: string
  changeDescription: string
  sections: string[]
  approvalStatus: 'approved' | 'pending' | 'rejected' | 'draft'
  approvedBy?: string
  approvalDate?: string
  changeType: 'major' | 'minor' | 'editorial'
}

interface DocumentHistory {
  docCode: string
  docTitle: string
  currentVersion: string
  docLevel: 1 | 2 | 3 | 4
  revisions: Revision[]
}

const MOCK_DOC_HISTORIES: DocumentHistory[] = [
  {
    docCode: 'QM-5.2',
    docTitle: 'Scope of Accreditation - Solar PV Testing',
    currentVersion: 'D',
    docLevel: 1,
    revisions: [
      { version: 'D', date: '2026-01-15', author: 'Dr. Priya Sharma', role: 'Quality Manager', changeDescription: 'Added IEC 61853-1 energy rating tests to scope. Updated traceability references for new pyranometer calibration chain.', sections: ['Section 3.2', 'Annex B'], approvalStatus: 'approved', approvedBy: 'Director - R. Krishnan', approvalDate: '2026-01-20', changeType: 'major' },
      { version: 'C', date: '2025-07-10', author: 'Dr. Priya Sharma', role: 'Quality Manager', changeDescription: 'Incorporated NABL renewal scope extension for IEC 62716 (Ammonia) and IEC 61701 (Salt Mist) testing.', sections: ['Section 3.1', 'Section 4.3'], approvalStatus: 'approved', approvedBy: 'Director - R. Krishnan', approvalDate: '2025-07-15', changeType: 'major' },
      { version: 'B', date: '2025-01-05', author: 'Rajesh Patel', role: 'Lab Manager', changeDescription: 'Updated equipment list with new 3-zone climatic chamber. Added PID test capability reference.', sections: ['Section 5.1', 'Annex A'], approvalStatus: 'approved', approvedBy: 'Director - R. Krishnan', approvalDate: '2025-01-12', changeType: 'minor' },
      { version: 'A', date: '2024-06-01', author: 'Dr. Priya Sharma', role: 'Quality Manager', changeDescription: 'Initial release. Scope covers IEC 61215 design qualification and IEC 61730 safety qualification for crystalline silicon PV modules.', sections: ['All'], approvalStatus: 'approved', approvedBy: 'Director - R. Krishnan', approvalDate: '2024-06-05', changeType: 'major' },
    ]
  },
  {
    docCode: 'QP-7.7-01',
    docTitle: 'Procedure for Measurement Traceability & Calibration',
    currentVersion: 'C',
    docLevel: 2,
    revisions: [
      { version: 'C', date: '2026-02-20', author: 'Vikram Singh', role: 'Calibration Officer', changeDescription: 'Added calibration interval decision tree based on historical drift data analysis. Updated reference standard list.', sections: ['Section 6', 'Section 8', 'Annex C'], approvalStatus: 'pending', changeType: 'major' },
      { version: 'B', date: '2025-09-01', author: 'Vikram Singh', role: 'Calibration Officer', changeDescription: 'Incorporated ISO 17025:2017 clause 6.5 requirements for metrological traceability. Added DAkkS and NABL lab cross-reference table.', sections: ['Section 4', 'Section 6'], approvalStatus: 'approved', approvedBy: 'Quality Manager - Dr. Priya Sharma', approvalDate: '2025-09-08', changeType: 'major' },
      { version: 'A', date: '2024-08-15', author: 'Rajesh Patel', role: 'Lab Manager', changeDescription: 'Initial release covering calibration procedures for reference cells, thermocouples, pyranometers, and data acquisition systems.', sections: ['All'], approvalStatus: 'approved', approvedBy: 'Quality Manager - Dr. Priya Sharma', approvalDate: '2024-08-20', changeType: 'major' },
    ]
  },
  {
    docCode: 'QSF-7.2-01',
    docTitle: 'Test Sample Receipt & Condition Assessment Form',
    currentVersion: 'B',
    docLevel: 3,
    revisions: [
      { version: 'B', date: '2026-03-01', author: 'Anita Verma', role: 'Senior Technician', changeDescription: 'Added photo documentation fields and barcode/QR code scan fields for digital chain of custody. New checkbox for junction box inspection.', sections: ['Section 2', 'Section 5'], approvalStatus: 'draft', changeType: 'minor' },
      { version: 'A', date: '2024-10-01', author: 'Meena Kumari', role: 'Sample Coordinator', changeDescription: 'Initial release. Form captures sample ID, client details, visual condition, dimensional checks, and acceptance criteria.', sections: ['All'], approvalStatus: 'approved', approvedBy: 'Lab Manager - Rajesh Patel', approvalDate: '2024-10-05', changeType: 'major' },
    ]
  },
  {
    docCode: 'WI-7.2-01',
    docTitle: 'Work Instruction - IEC 61215 MQT 12 (Thermal Cycling)',
    currentVersion: 'B',
    docLevel: 4,
    revisions: [
      { version: 'B', date: '2025-11-20', author: 'Deepak Joshi', role: 'Test Engineer', changeDescription: 'Updated temperature ramp rates per IEC 61215-2:2021 amendment. Added thermocouple placement diagram for bifacial modules.', sections: ['Section 3.4', 'Annex A'], approvalStatus: 'approved', approvedBy: 'Lab Manager - Rajesh Patel', approvalDate: '2025-11-28', changeType: 'minor' },
      { version: 'A', date: '2024-07-15', author: 'Suresh Nair', role: 'Test Engineer', changeDescription: 'Initial release covering TC200 and TC50 test sequences, chamber setup, monitoring requirements, and pass/fail criteria per IEC 61215-2.', sections: ['All'], approvalStatus: 'approved', approvedBy: 'Lab Manager - Rajesh Patel', approvalDate: '2024-07-20', changeType: 'major' },
    ]
  },
]

const approvalStatusConfig = {
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  pending: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-800', icon: Clock },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText },
}

const changeTypeConfig = {
  major: { label: 'Major', color: 'bg-red-50 text-red-700 border-red-200' },
  minor: { label: 'Minor', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  editorial: { label: 'Editorial', color: 'bg-blue-50 text-blue-700 border-blue-200' },
}

const docLevelColors = {
  1: 'border-l-blue-500',
  2: 'border-l-purple-500',
  3: 'border-l-green-500',
  4: 'border-l-amber-500',
}

export function DocumentRevisionHistory() {
  const [expandedDoc, setExpandedDoc] = useState<string | null>(MOCK_DOC_HISTORIES[0].docCode)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Documents Tracked</div>
            <div className="text-2xl font-bold text-amber-600">{MOCK_DOC_HISTORIES.length}</div>
            <div className="text-xs text-muted-foreground">{MOCK_DOC_HISTORIES.reduce((acc, d) => acc + d.revisions.length, 0)} total revisions</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Approved (Current)</div>
            <div className="text-2xl font-bold text-emerald-600">{MOCK_DOC_HISTORIES.filter(d => d.revisions[0].approvalStatus === 'approved').length}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Pending Approval</div>
            <div className="text-2xl font-bold text-yellow-600">{MOCK_DOC_HISTORIES.filter(d => d.revisions[0].approvalStatus === 'pending').length}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-gray-400">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">In Draft</div>
            <div className="text-2xl font-bold text-gray-600">{MOCK_DOC_HISTORIES.filter(d => d.revisions[0].approvalStatus === 'draft').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Document Timeline Cards */}
      <div className="space-y-3">
        {MOCK_DOC_HISTORIES.map(doc => {
          const isExpanded = expandedDoc === doc.docCode
          return (
            <Card key={doc.docCode} className={`border-l-4 ${docLevelColors[doc.docLevel]}`}>
              <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpandedDoc(isExpanded ? null : doc.docCode)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    <div>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <span className="font-mono text-amber-700">{doc.docCode}</span>
                        <span className="text-muted-foreground font-normal">Rev. {doc.currentVersion}</span>
                      </CardTitle>
                      <CardDescription className="text-xs">{doc.docTitle}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const status = approvalStatusConfig[doc.revisions[0].approvalStatus]
                      const Icon = status.icon
                      return (
                        <Badge className={`text-[9px] ${status.color} border-0`}>
                          <Icon className="h-2.5 w-2.5 mr-1" />
                          {status.label}
                        </Badge>
                      )
                    })()}
                    <Badge variant="outline" className="text-[9px]">{doc.revisions.length} revisions</Badge>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="relative ml-4 pl-6 border-l-2 border-amber-200 space-y-4">
                    {doc.revisions.map((rev, idx) => {
                      const status = approvalStatusConfig[rev.approvalStatus]
                      const StatusIcon = status.icon
                      const changeInfo = changeTypeConfig[rev.changeType]
                      return (
                        <div key={rev.version} className="relative">
                          {/* Timeline dot */}
                          <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 border-white ${idx === 0 ? 'bg-amber-500' : 'bg-gray-300'} flex items-center justify-center`}>
                            {idx === 0 && <GitCommit className="h-2.5 w-2.5 text-white" />}
                          </div>

                          <div className={`p-3 rounded-lg border ${idx === 0 ? 'bg-amber-50/50 border-amber-200' : 'bg-muted/30'}`}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold">Version {rev.version}</span>
                                  <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${changeInfo.color}`}>
                                    {changeInfo.label}
                                  </Badge>
                                  <Badge className={`text-[9px] ${status.color} border-0`}>
                                    <StatusIcon className="h-2.5 w-2.5 mr-1" />
                                    {status.label}
                                  </Badge>
                                </div>
                                <p className="text-xs mt-1.5 leading-relaxed">{rev.changeDescription}</p>
                                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground flex-wrap">
                                  <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" />{rev.author} ({rev.role})</span>
                                  <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" />{rev.date}</span>
                                  <span className="flex items-center gap-1"><FileText className="h-2.5 w-2.5" />{rev.sections.join(', ')}</span>
                                </div>
                                {rev.approvedBy && (
                                  <div className="mt-1.5 text-[10px] text-emerald-700 flex items-center gap-1">
                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                    Approved by {rev.approvedBy} on {rev.approvalDate}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. MANAGEMENT REVIEW DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

interface KPICard {
  title: string
  value: number | string
  subtitle: string
  trend: 'up' | 'down' | 'stable'
  trendValue: string
  trendGood: boolean
  icon: any
  color: string
}

interface ActionItem {
  id: string
  action: string
  owner: string
  dueDate: string
  status: 'completed' | 'in_progress' | 'overdue' | 'not_started'
  priority: 'high' | 'medium' | 'low'
  meetingRef: string
}

const KPI_DATA: KPICard[] = [
  { title: 'Total Active CAPAs', value: 9, subtitle: '3 critical, 4 major, 2 minor', trend: 'up', trendValue: '+2 from last quarter', trendGood: false, icon: AlertTriangle, color: 'amber' },
  { title: 'Open Audit Findings', value: 5, subtitle: '2 major NCs, 3 OFIs', trend: 'down', trendValue: '-3 from last quarter', trendGood: true, icon: ClipboardList, color: 'blue' },
  { title: 'Customer Complaints', value: 2, subtitle: '1 report delay, 1 calibration query', trend: 'down', trendValue: '-1 from last quarter', trendGood: true, icon: MessageSquare, color: 'purple' },
  { title: 'Calibration Due (30d)', value: 7, subtitle: '3 reference cells, 2 thermocouples, 2 DAQ', trend: 'stable', trendValue: 'Same as last quarter', trendGood: true, icon: Wrench, color: 'emerald' },
  { title: 'NC Rate (per 100 tests)', value: '1.8%', subtitle: 'Target: < 2.0%', trend: 'down', trendValue: 'From 2.3% last quarter', trendGood: true, icon: Target, color: 'green' },
  { title: 'Training Compliance', value: '94%', subtitle: '47/50 staff current', trend: 'up', trendValue: 'From 89% last quarter', trendGood: true, icon: Users, color: 'indigo' },
]

const MOCK_ACTION_ITEMS: ActionItem[] = [
  { id: 'MR-AI-001', action: 'Complete validation of new IEC 61853-1 test procedure and submit for NABL scope extension', owner: 'Dr. Priya Sharma', dueDate: '2026-03-31', status: 'in_progress', priority: 'high', meetingRef: 'MR-2026-Q1' },
  { id: 'MR-AI-002', action: 'Procure replacement UV lamps for aging chamber and validate spectral output', owner: 'Vikram Singh', dueDate: '2026-03-15', status: 'overdue', priority: 'high', meetingRef: 'MR-2026-Q1' },
  { id: 'MR-AI-003', action: 'Conduct internal audit of clause 7.7 (Measurement Traceability) before NABL assessment', owner: 'Suresh Nair', dueDate: '2026-04-15', status: 'not_started', priority: 'high', meetingRef: 'MR-2026-Q1' },
  { id: 'MR-AI-004', action: 'Update risk register with findings from Q4 2025 management review', owner: 'Anita Verma', dueDate: '2026-02-28', status: 'completed', priority: 'medium', meetingRef: 'MR-2026-Q1' },
  { id: 'MR-AI-005', action: 'Arrange proficiency testing participation for IEC 60904-3 spectral response measurement', owner: 'Rajesh Patel', dueDate: '2026-04-30', status: 'in_progress', priority: 'medium', meetingRef: 'MR-2026-Q1' },
  { id: 'MR-AI-006', action: 'Review and update competency matrix for all test engineers on new IEC 61215:2021 amendments', owner: 'Deepak Joshi', dueDate: '2026-03-20', status: 'in_progress', priority: 'medium', meetingRef: 'MR-2026-Q1' },
  { id: 'MR-AI-007', action: 'Implement electronic signature system for test reports to replace wet signatures', owner: 'Meena Kumari', dueDate: '2026-05-30', status: 'not_started', priority: 'low', meetingRef: 'MR-2026-Q1' },
  { id: 'MR-AI-008', action: 'Complete trend analysis report for PT/ILC results from 2024-2025 cycle', owner: 'Dr. Priya Sharma', dueDate: '2026-02-15', status: 'completed', priority: 'medium', meetingRef: 'MR-2025-Q4' },
]

const statusConfig = {
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: Activity },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-700', icon: Clock },
}

const priorityColors = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-blue-50 text-blue-700 border-blue-200',
}

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
}

// ─── MRM Minutes Data ────────────────────────────────────────────────────────

interface AgendaItem {
  id: string
  topic: string
  discussion: string
  decision: string
  responsible: string
}

const MRM_AGENDA_ITEMS: AgendaItem[] = [
  { id: 'AG-01', topic: 'Review of Proficiency Testing Results (2025 Cycle)', discussion: 'PT results for IEC 60904-1 parameters (Isc, Voc, Pmax) reviewed. z-scores within ±2 for all except spectral irradiance (z=3.2). Root cause investigation initiated.', decision: 'Initiate CAPA for spectral irradiance deviation. Re-calibrate spectroradiometer and participate in next EPTIS round.', responsible: 'Dr. Priya Sharma' },
  { id: 'AG-02', topic: 'CAPA Status Update', discussion: '10 active CAPAs reviewed. 3 overdue items flagged – TC-03 temperature deviation, data integrity issue, UV lamp replacement. Aging analysis shows 2 items >14 days in current stage.', decision: 'Escalate overdue CAPAs to Director. Weekly status calls until resolved. UV lamp procurement to be fast-tracked.', responsible: 'Suresh Nair' },
  { id: 'AG-03', topic: 'Resource Adequacy & Training', discussion: 'Current headcount: 50 staff, 47 with current competency records. 3 new hires pending IEC 61215:2021 amendment training. Equipment utilization at 78% avg.', decision: 'Schedule training batch for new hires by Feb 2026. Approve hiring of 1 additional test engineer for EL imaging.', responsible: 'Vikram Singh' },
  { id: 'AG-04', topic: 'Customer Feedback Analysis', discussion: '2 complaints received in Q4: 1 report delay (resolved, root cause: ERP downtime), 1 calibration uncertainty query (clarified). Customer satisfaction survey score: 4.2/5.0.', decision: 'Implement automated report progress notifications to clients. Add uncertainty budget summary to all reports.', responsible: 'Anita Verma' },
  { id: 'AG-05', topic: 'Risk Register Review', discussion: 'Risk register has 10 entries; 5 open, 3 mitigated, 2 closed. Top risk: UV lamp aging causing spectral mismatch (RSK-003, score 16). New risk identified: delayed vendor delivery impacting schedules.', decision: 'Add vendor delivery risk to register. Review RSK-003 mitigation quarterly. Update risk matrix in QMS.', responsible: 'Meena Kumari' },
  { id: 'AG-06', topic: 'Next Cycle Planning & NABL Assessment Prep', discussion: 'NABL surveillance assessment scheduled for June 2026. Scope extension for IEC 61853-1 energy rating in progress. Internal audit of Clause 7.7 needed before assessment.', decision: 'Complete IEC 61853-1 validation by March. Schedule internal audit for April. Prepare assessment readiness checklist.', responsible: 'Rajesh Patel' },
]

// ─── Previous Topics Data ────────────────────────────────────────────────────

interface PreviousTopic {
  topic: string
  sourceMRM: string
  status: 'Open' | 'Closed' | 'Carry-Forward'
  linkedDecision: string
  followUpAction: string
  targetDate: string
}

const PREVIOUS_TOPICS: PreviousTopic[] = [
  { topic: 'Upgrade EL imaging system firmware', sourceMRM: 'MR-2025-Q3', status: 'Closed', linkedDecision: 'Approved firmware v3.2 upgrade', followUpAction: 'Firmware installed, IQ/OQ completed', targetDate: '2025-11-30' },
  { topic: 'Implement barcode-based sample tracking', sourceMRM: 'MR-2025-Q3', status: 'Closed', linkedDecision: 'Approved procurement of barcode scanners', followUpAction: 'System live since Dec 2025, error rate reduced 97%', targetDate: '2025-12-15' },
  { topic: 'Address PT failure in thermal cycling ΔPmax', sourceMRM: 'MR-2025-Q3', status: 'Carry-Forward', linkedDecision: 'Root cause: thermocouple placement inconsistency', followUpAction: 'New placement SOP drafted, awaiting validation', targetDate: '2026-02-28' },
  { topic: 'Annual management review of quality policy', sourceMRM: 'MR-2025-Q4', status: 'Closed', linkedDecision: 'Policy reaffirmed with minor wording updates', followUpAction: 'QM-4.1 Rev B published', targetDate: '2026-01-15' },
  { topic: 'Budget approval for new climate chamber', sourceMRM: 'MR-2025-Q4', status: 'Open', linkedDecision: 'Approved ₹45L budget, RFQ to be floated', followUpAction: 'RFQ sent to 3 vendors, TBE pending', targetDate: '2026-03-31' },
  { topic: 'Cross-training program for sun simulator operators', sourceMRM: 'MR-2025-Q4', status: 'Carry-Forward', linkedDecision: 'Train 3 additional operators by Q1 2026', followUpAction: '1 of 3 completed, 2 in progress', targetDate: '2026-03-15' },
  { topic: 'Review external calibration lab performance', sourceMRM: 'MR-2025-Q4', status: 'Closed', linkedDecision: 'Retain current NABL-accredited lab; negotiate bulk pricing', followUpAction: 'Contract renewed with 20% discount', targetDate: '2026-01-01' },
  { topic: 'Digital signature implementation for reports', sourceMRM: 'MR-2025-Q4', status: 'Open', linkedDecision: 'Evaluate e-signature solutions; pilot by Q2 2026', followUpAction: 'Vendor shortlisted, pilot setup pending', targetDate: '2026-05-30' },
]

const topicStatusColors: Record<string, string> = {
  Open: 'bg-blue-50 text-blue-700 border-blue-200',
  Closed: 'bg-green-50 text-green-700 border-green-200',
  'Carry-Forward': 'bg-amber-50 text-amber-700 border-amber-200',
}

// ─── Attendance Data ─────────────────────────────────────────────────────────

interface Attendee {
  name: string
  designation: string
  department: string
  present: boolean
  signatureStatus: 'Signed' | 'Pending'
}

const MRM_ATTENDEES: Attendee[] = [
  { name: 'R. Krishnan', designation: 'Director', department: 'Management', present: true, signatureStatus: 'Signed' },
  { name: 'Dr. Priya Sharma', designation: 'Quality Manager', department: 'Quality Assurance', present: true, signatureStatus: 'Signed' },
  { name: 'Rajesh Patel', designation: 'Lab Manager', department: 'Testing Operations', present: true, signatureStatus: 'Signed' },
  { name: 'Vikram Singh', designation: 'Calibration Officer', department: 'Metrology', present: true, signatureStatus: 'Signed' },
  { name: 'Anita Verma', designation: 'Senior Test Engineer', department: 'Testing Operations', present: true, signatureStatus: 'Signed' },
  { name: 'Suresh Nair', designation: 'Test Engineer', department: 'Testing Operations', present: true, signatureStatus: 'Signed' },
  { name: 'Meena Kumari', designation: 'Sample Coordinator', department: 'Sample Management', present: false, signatureStatus: 'Pending' },
  { name: 'Deepak Joshi', designation: 'Test Engineer', department: 'Testing Operations', present: true, signatureStatus: 'Signed' },
  { name: 'Kavya Reddy', designation: 'Procurement Officer', department: 'Procurement', present: true, signatureStatus: 'Pending' },
  { name: 'Arvind Nair', designation: 'Safety Officer', department: 'HSE', present: false, signatureStatus: 'Pending' },
]

export function ManagementReviewDashboard() {
  const completedCount = MOCK_ACTION_ITEMS.filter(a => a.status === 'completed').length
  const overdueCount = MOCK_ACTION_ITEMS.filter(a => a.status === 'overdue').length
  const totalItems = MOCK_ACTION_ITEMS.length
  const completionPercent = Math.round((completedCount / totalItems) * 100)
  const [minutesExpanded, setMinutesExpanded] = useState(true)
  const [expandedAgenda, setExpandedAgenda] = useState<string | null>('AG-01')
  const [attendanceExpanded, setAttendanceExpanded] = useState(false)
  const [prevTopicsExpanded, setPrevTopicsExpanded] = useState(false)

  return (
    <div className="space-y-4">
      {/* Last Meeting Info */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="text-xs font-bold text-amber-800">Last Management Review: MR-2026-Q1</div>
              <div className="text-[10px] text-amber-700 mt-0.5">Held on 15 January 2026 | Chaired by Director R. Krishnan | 8 attendees</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700">
                Next review: 15 April 2026
              </Badge>
              <Button variant="outline" size="sm" className="h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-100">
                <Eye className="h-3 w-3 mr-1" /> View Minutes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {KPI_DATA.map(kpi => {
          const TrendIcon = trendIcons[kpi.trend]
          const Icon = kpi.icon
          return (
            <Card key={kpi.title} className={`border-l-4 border-l-${kpi.color}-500`}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.title}</div>
                    <div className={`text-2xl font-bold text-${kpi.color}-600 mt-0.5`}>{kpi.value}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{kpi.subtitle}</div>
                  </div>
                  <div className={`p-1.5 rounded-lg bg-${kpi.color}-100`}>
                    <Icon className={`h-4 w-4 text-${kpi.color}-600`} />
                  </div>
                </div>
                <div className={`flex items-center gap-1 mt-2 text-[10px] ${kpi.trendGood ? 'text-emerald-600' : 'text-red-600'}`}>
                  <TrendIcon className="h-3 w-3" />
                  {kpi.trendValue}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Action Items Progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-amber-600" />
              Action Items Progress
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{completedCount}/{totalItems} complete</span>
              {overdueCount > 0 && (
                <Badge variant="destructive" className="text-[9px]">{overdueCount} overdue</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <Progress value={completionPercent} className="h-2 mb-1" />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{completionPercent}% complete</span>
            <span>{totalItems - completedCount} remaining</span>
          </div>
        </CardContent>
      </Card>

      {/* Action Items Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Management Review Action Items</CardTitle>
          <CardDescription className="text-xs">From MR-2026-Q1 and carry-forward items</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {MOCK_ACTION_ITEMS.map(item => {
            const stConfig = statusConfig[item.status]
            const StIcon = stConfig.icon
            return (
              <div
                key={item.id}
                className={`p-3 rounded-lg border ${item.status === 'overdue' ? 'border-red-300 bg-red-50/50' : 'border-border'} hover:shadow-sm transition-shadow`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-amber-700">{item.id}</span>
                      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${priorityColors[item.priority]}`}>
                        {item.priority}
                      </Badge>
                      <Badge className={`text-[9px] ${stConfig.color} border-0`}>
                        <StIcon className="h-2.5 w-2.5 mr-1" />
                        {stConfig.label}
                      </Badge>
                    </div>
                    <p className="text-xs mt-1 leading-relaxed">{item.action}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" />{item.owner}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" />Due: {item.dueDate}</span>
                      <span className="flex items-center gap-1"><FileText className="h-2.5 w-2.5" />{item.meetingRef}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* ═══ MRM Minutes & Decisions ═══ */}
      <Card>
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setMinutesExpanded(!minutesExpanded)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              {minutesExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <FileText className="h-4 w-4 text-amber-600" />
              MRM Minutes & Decisions — MR-2026-Q1
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">{MRM_AGENDA_ITEMS.length} agenda items</Badge>
          </div>
          <CardDescription className="text-xs">15 January 2026 | Conference Room A | Duration: 2h 15m</CardDescription>
        </CardHeader>
        {minutesExpanded && (
          <CardContent className="space-y-2 pt-0">
            {MRM_AGENDA_ITEMS.map(item => {
              const isOpen = expandedAgenda === item.id
              return (
                <div key={item.id} className="border rounded-lg">
                  <button
                    onClick={() => setExpandedAgenda(isOpen ? null : item.id)}
                    className="w-full flex items-center gap-2 p-3 text-left hover:bg-muted/30 transition-colors"
                  >
                    {isOpen ? <ChevronDown className="h-3 w-3 flex-shrink-0" /> : <ChevronRight className="h-3 w-3 flex-shrink-0" />}
                    <span className="text-xs font-mono text-amber-700 font-bold">{item.id}</span>
                    <span className="text-xs font-medium flex-1">{item.topic}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1"><User className="h-2.5 w-2.5" />{item.responsible}</span>
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3 space-y-2 border-t bg-muted/10">
                      <div className="pt-2">
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Discussion</div>
                        <p className="text-xs leading-relaxed">{item.discussion}</p>
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">Decision</div>
                        <p className="text-xs leading-relaxed text-emerald-800 bg-emerald-50 rounded p-2 border border-emerald-200">{item.decision}</p>
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <User className="h-2.5 w-2.5" /> Responsible: <strong>{item.responsible}</strong>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        )}
      </Card>

      {/* ═══ Previous Topics Tracking ═══ */}
      <Card>
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setPrevTopicsExpanded(!prevTopicsExpanded)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              {prevTopicsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <ClipboardList className="h-4 w-4 text-blue-600" />
              Previous MRM Topics Tracking
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-700">{PREVIOUS_TOPICS.filter(t => t.status === 'Open').length} Open</Badge>
              <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-700">{PREVIOUS_TOPICS.filter(t => t.status === 'Carry-Forward').length} Carry-Forward</Badge>
              <Badge variant="outline" className="text-[10px] border-green-200 text-green-700">{PREVIOUS_TOPICS.filter(t => t.status === 'Closed').length} Closed</Badge>
            </div>
          </div>
        </CardHeader>
        {prevTopicsExpanded && (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {['Topic', 'Source MRM', 'Status', 'Linked Decision', 'Follow-up Action', 'Target Date'].map(h => (
                      <th key={h} className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PREVIOUS_TOPICS.map((t, i) => (
                    <tr key={i} className={`border-b hover:bg-muted/30 ${i % 2 !== 0 ? 'bg-muted/10' : ''}`}>
                      <td className="px-3 py-2 font-medium max-w-[200px]"><p className="truncate" title={t.topic}>{t.topic}</p></td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">{t.sourceMRM}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${topicStatusColors[t.status]}`}>{t.status}</span>
                      </td>
                      <td className="px-3 py-2 max-w-[180px]"><p className="truncate text-muted-foreground" title={t.linkedDecision}>{t.linkedDecision}</p></td>
                      <td className="px-3 py-2 max-w-[200px]"><p className="truncate" title={t.followUpAction}>{t.followUpAction}</p></td>
                      <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{t.targetDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>

      {/* ═══ Meeting Attendance Register ═══ */}
      <Card>
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setAttendanceExpanded(!attendanceExpanded)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              {attendanceExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <Users className="h-4 w-4 text-purple-600" />
              Meeting Attendance Register
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-[10px] border-green-200 text-green-700">{MRM_ATTENDEES.filter(a => a.present).length} Present</Badge>
              <Badge variant="outline" className="text-[10px] border-red-200 text-red-700">{MRM_ATTENDEES.filter(a => !a.present).length} Absent</Badge>
            </div>
          </div>
          <CardDescription className="text-xs">MR-2026-Q1 | 15 January 2026</CardDescription>
        </CardHeader>
        {attendanceExpanded && (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {['Name', 'Designation', 'Department', 'Present', 'Signature'].map(h => (
                      <th key={h} className="text-left px-3 py-2 font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MRM_ATTENDEES.map((a, i) => (
                    <tr key={i} className={`border-b hover:bg-muted/30 ${i % 2 !== 0 ? 'bg-muted/10' : ''}`}>
                      <td className="px-3 py-2 font-medium">{a.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{a.designation}</td>
                      <td className="px-3 py-2 text-muted-foreground">{a.department}</td>
                      <td className="px-3 py-2">
                        {a.present
                          ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                          : <XCircle className="h-4 w-4 text-red-500" />
                        }
                      </td>
                      <td className="px-3 py-2">
                        {a.signatureStatus === 'Signed'
                          ? <span className="flex items-center gap-1 text-green-700"><PenLine className="h-3 w-3" /> Signed</span>
                          : <span className="flex items-center gap-1 text-amber-600"><Clock className="h-3 w-3" /> Pending</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
