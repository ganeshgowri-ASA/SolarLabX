// @ts-nocheck
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText, Users, Settings, Target, ClipboardList, Shield,
  Wrench, Gauge, FlaskConical, CheckCircle2, BarChart3, FileBarChart,
  ArrowDown, ArrowUp, ArrowLeft, ArrowRight, BookOpen, Activity
} from 'lucide-react'

interface TurtleProcedure {
  id: string
  name: string
  clause: string
  owner: string
  icon: React.ElementType
  inputs: string[]
  outputs: string[]
  withWhat: string[]
  withWhom: string[]
  methods: string[]
  kpis: string[]
}

const PROCEDURES: TurtleProcedure[] = [
  {
    id: 'doc-control', name: 'Document Control', clause: '8.3', owner: 'Quality Manager',
    icon: FileText,
    inputs: ['New document request', 'Revision request', 'External standard update', 'Audit finding requiring SOP change'],
    outputs: ['Approved controlled documents', 'Document master list', 'Obsolete document archive', 'Distribution records'],
    withWhat: ['Document Management System (DMS)', 'Version control software', 'Secure file server', 'PDF signing tool'],
    withWhom: ['Document Controller (Responsible)', 'Quality Manager (Approver)', 'Department Heads (Reviewers)', 'All Staff (Users)'],
    methods: ['QP-8.3-01 Document Control Procedure', 'QSF-8.3-01 Document Change Request Form', 'ISO 17025 §8.3 requirements', 'Annual document review schedule'],
    kpis: ['Document approval cycle < 10 days', 'Obsolete docs removed within 24h', '100% docs reviewed annually', 'Zero uncontrolled copies found in audits'],
  },
  {
    id: 'mgmt-review', name: 'Management Review', clause: '8.9', owner: 'Lab Director',
    icon: Users,
    inputs: ['Quarterly/annual review schedule', 'Internal audit results', 'Customer feedback', 'KPI dashboards', 'CAPA status reports'],
    outputs: ['Management review minutes', 'Action items with owners', 'Resource allocation decisions', 'Policy updates', 'Improvement plans'],
    withWhat: ['Meeting room & AV equipment', 'QMS dashboards (SolarLabX)', 'KPI reports', 'Financial reports'],
    withWhom: ['Lab Director (Chair)', 'Quality Manager (Secretary)', 'Technical Manager', 'Section Heads', 'Safety Officer'],
    methods: ['QP-8.9-01 Management Review Procedure', 'QSF-8.9-01 Review Agenda Template', 'ISO 17025 §8.9 input requirements', 'Balanced scorecard methodology'],
    kpis: ['Reviews conducted per schedule', 'Action items closed within 30 days > 90%', '100% agenda items per ISO 17025', 'Improvement initiatives tracked'],
  },
  {
    id: 'internal-audit', name: 'Internal Audit', clause: '8.8', owner: 'Quality Manager',
    icon: ClipboardList,
    inputs: ['Annual audit schedule', 'Previous audit findings', 'Process changes', 'Customer complaints', 'Risk assessment updates'],
    outputs: ['Audit reports with findings', 'NC/OFI logs', 'Corrective action requests', 'Audit summary for management review'],
    withWhat: ['Audit checklist templates', 'ISO 17025 standard', 'Previous audit records', 'Document management system'],
    withWhom: ['Lead Auditor (Responsible)', 'Quality Manager (Oversight)', 'Auditees (Participants)', 'Lab Director (Informed)'],
    methods: ['QP-8.8-01 Internal Audit Procedure', 'ISO 19011 Audit Guidelines', 'Risk-based audit planning', 'QSF-8.8-01 Audit Checklist'],
    kpis: ['100% planned audits completed', 'Findings closed within 60 days', 'Repeat findings < 10%', 'Auditor independence maintained'],
  },
  {
    id: 'corrective-action', name: 'Corrective Action', clause: '8.7', owner: 'Quality Manager',
    icon: Shield,
    inputs: ['Non-conformance reports', 'Audit findings', 'Customer complaints', 'Proficiency test failures', 'Process deviations'],
    outputs: ['Root cause analysis reports', 'Corrective action records', 'Effectiveness verification', 'Updated procedures/training'],
    withWhat: ['CAPA tracking system', 'Root cause analysis tools (5-Why, Fishbone)', 'NC database', 'Statistical analysis software'],
    withWhom: ['Quality Manager (Responsible)', 'Process Owner (Investigator)', 'Technical Manager (Reviewer)', 'Lab Director (Escalation)'],
    methods: ['QP-8.7-01 Corrective Action Procedure', 'QSF-8.7-01 CAPA Form', 'Root cause analysis methodology', '8D problem-solving framework'],
    kpis: ['CAPA closure within 30 days > 85%', 'Root cause identified for 100% CAPAs', 'Effectiveness verified within 90 days', 'Recurring NCs < 5%'],
  },
  {
    id: 'risk-mgmt', name: 'Risk & Opportunity Management', clause: '8.5', owner: 'Quality Manager',
    icon: Target,
    inputs: ['Strategic planning cycle', 'New test method introduction', 'Equipment failure events', 'Regulatory changes', 'Market opportunities'],
    outputs: ['Risk register (updated)', 'Risk treatment plans', 'Opportunity action plans', 'Risk monitoring reports'],
    withWhat: ['Risk register database', 'Risk assessment matrix', 'FMEA templates', 'SolarLabX risk module'],
    withWhom: ['Quality Manager (Facilitator)', 'Department Heads (Risk Owners)', 'Lab Director (Decision Maker)', 'All Staff (Risk Reporters)'],
    methods: ['QP-8.5-01 Risk Management Procedure', 'ISO 31000 Risk Framework', 'FMEA methodology', 'Quarterly risk review meetings'],
    kpis: ['100% high risks have treatment plans', 'Risk review completed quarterly', 'Opportunities converted > 50%', 'Zero unmitigated critical risks'],
  },
  {
    id: 'personnel', name: 'Personnel Competence', clause: '6.2', owner: 'Technical Manager',
    icon: Users,
    inputs: ['New hire onboarding', 'Annual competency review', 'New test method introduction', 'Audit finding on personnel gaps'],
    outputs: ['Training records', 'Competency matrix', 'Authorization letters', 'Personnel qualification files'],
    withWhat: ['Training management system', 'Competency assessment forms', 'Online learning platform', 'Proficiency testing program'],
    withWhom: ['Technical Manager (Accountable)', 'Quality Manager (Oversight)', 'Section Heads (Assessors)', 'HR Manager (Support)'],
    methods: ['QP-6.2-01 Personnel Competence Procedure', 'QSF-6.2-01 Training Needs Assessment', 'Supervised testing program', 'Annual competency evaluation'],
    kpis: ['Training plan completion > 95%', '100% staff authorized before independent work', 'Competency assessment on-time > 90%', 'PT participation 100%'],
  },
  {
    id: 'equipment', name: 'Equipment Management', clause: '6.4', owner: 'Equipment Manager',
    icon: Wrench,
    inputs: ['New equipment procurement', 'Equipment malfunction report', 'Preventive maintenance schedule', 'Calibration due alerts'],
    outputs: ['Equipment master list', 'Maintenance records', 'Equipment qualification reports', 'Out-of-service labels/records'],
    withWhat: ['CMMS software', 'Equipment logbooks', 'Spare parts inventory', 'Diagnostic tools', 'SolarLabX equipment module'],
    withWhom: ['Equipment Manager (Responsible)', 'Lab Technicians (Users)', 'Calibration Officer (Support)', 'Procurement Officer (Purchasing)'],
    methods: ['QP-6.4-01 Equipment Management Procedure', 'QSF-6.4-01 Equipment Logbook', 'Preventive maintenance SOPs', 'IQ/OQ/PQ qualification protocol'],
    kpis: ['Equipment uptime > 95%', 'PM completion on-time > 90%', 'Mean time to repair < 48h', 'Equipment qualification current 100%'],
  },
  {
    id: 'calibration', name: 'Calibration', clause: '6.5', owner: 'Calibration Officer',
    icon: Gauge,
    inputs: ['Calibration schedule alerts', 'Out-of-tolerance findings', 'New instrument commissioning', 'Customer/audit requirements'],
    outputs: ['Calibration certificates', 'Measurement traceability records', 'Adjustment/repair records', 'Impact assessment for OOT'],
    withWhat: ['Reference standards (traceable to SI)', 'Calibration equipment', 'Environmental monitoring', 'Calibration management software'],
    withWhom: ['Calibration Officer (Responsible)', 'Technical Manager (Oversight)', 'External calibration labs (NABL accredited)', 'Test Engineers (Users)'],
    methods: ['QP-6.5-01 Calibration Procedure', 'QSF-6.5-01 Calibration Schedule', 'Metrological traceability chain', 'IEC 60904-2 reference cell calibration'],
    kpis: ['Calibration on-time > 98%', 'Zero overdue calibrations', 'OOT impact assessments within 5 days', 'Traceability chain documented 100%'],
  },
  {
    id: 'sample-handling', name: 'Sample Handling', clause: '7.4', owner: 'Sample Custodian',
    icon: FlaskConical,
    inputs: ['Sample receipt from client', 'Internal sample transfer', 'Sample return/disposal request', 'Chain of custody requirement'],
    outputs: ['Sample receipt acknowledgment', 'Chain of custody records', 'Sample condition reports', 'Storage location records', 'Return/disposal records'],
    withWhat: ['Sample tracking system (LIMS)', 'Barcode/QR scanners', 'Climate-controlled storage', 'Sample handling equipment (cranes, jigs)'],
    withWhom: ['Sample Custodian (Responsible)', 'Receiving Inspector (Verification)', 'Test Engineers (Users)', 'Logistics Coordinator (Transport)'],
    methods: ['QP-7.4-01 Sample Handling Procedure', 'QSF-7.4-01 Sample Receipt Checklist', 'Chain of custody protocol', 'IEC 61215 sample conditioning requirements'],
    kpis: ['Sample logged within 4h of receipt', 'Zero sample mix-ups', 'Storage conditions maintained 100%', 'Chain of custody complete for all samples'],
  },
  {
    id: 'method-validation', name: 'Test Method Validation', clause: '7.2', owner: 'Technical Manager',
    icon: CheckCircle2,
    inputs: ['New standard published', 'Client request for non-standard test', 'New equipment commissioning', 'Scope extension application'],
    outputs: ['Method validation reports', 'Measurement uncertainty budgets', 'Verified test SOPs', 'Scope of accreditation updates'],
    withWhat: ['IEC 61215/61730/60904 standards', 'Solar simulators', 'Environmental chambers', 'EL/IR imaging', 'DAQ systems'],
    withWhom: ['Technical Manager (Accountable)', 'Test Engineers (Executors)', 'Quality Manager (Reviewer)', 'Calibration Officer (Support)'],
    methods: ['QP-7.2-01 Method Validation Procedure', 'ISO 17025 §7.2 requirements', 'GUM uncertainty methodology', 'Inter-laboratory comparison (ILC/PT)'],
    kpis: ['100% methods validated before use', 'Validation approval < 15 days', 'ILC Z-scores within ±2', 'Scope extension success > 90%'],
  },
  {
    id: 'uncertainty', name: 'Measurement Uncertainty', clause: '7.6', owner: 'Technical Manager',
    icon: BarChart3,
    inputs: ['New test method validation', 'Calibration results', 'Proficiency test outcomes', 'Client request for uncertainty statement'],
    outputs: ['Uncertainty budgets per test', 'Expanded uncertainty values', 'CMC entries for accreditation', 'Uncertainty statements in reports'],
    withWhat: ['GUM Workbench / SolarLabX uncertainty module', 'Statistical software', 'Calibration certificates', 'Reference data'],
    withWhom: ['Technical Manager (Accountable)', 'Metrologist (Calculator)', 'Test Engineers (Data Providers)', 'Quality Manager (Reviewer)'],
    methods: ['QP-7.6-01 Measurement Uncertainty Procedure', 'JCGM 100:2008 (GUM)', 'ISO 17025 §7.6 requirements', 'Monte Carlo simulation (where applicable)'],
    kpis: ['Uncertainty budgets for 100% accredited tests', 'Annual review of all budgets', 'Budgets updated after equipment changes', 'CMC values accepted by accreditation body'],
  },
  {
    id: 'reporting', name: 'Reporting Results', clause: '7.8', owner: 'Technical Manager',
    icon: FileBarChart,
    inputs: ['Completed test data in LIMS', 'Client reporting requirements', 'Uncertainty calculations', 'Test photographs & EL images'],
    outputs: ['Accredited test reports (PDF)', 'Amended reports if needed', 'Report dispatch records', 'Client acknowledgment'],
    withWhat: ['SolarLabX report generator', 'Report templates (IEC compliant)', 'Digital signature system', 'LIMS database'],
    withWhom: ['Test Engineers (Drafters)', 'Technical Manager (Reviewer)', 'Lab Director (Approver)', 'Document Controller (Dispatch)'],
    methods: ['QP-7.8-01 Test Report Procedure', 'QSF-7.8-01 Report Review Checklist', 'ISO 17025 §7.8 requirements', 'IEC 61215/61730 report format'],
    kpis: ['Report turnaround < 5 working days', 'Report error rate < 1%', 'First-time approval > 90%', 'Client satisfaction > 4.5/5'],
  },
]

const sectionColors = {
  center: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', accent: 'bg-orange-500' },
  inputs: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', accent: 'bg-blue-500' },
  outputs: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', accent: 'bg-green-500' },
  withWhat: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', accent: 'bg-purple-500' },
  withWhom: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', accent: 'bg-cyan-500' },
  methods: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', accent: 'bg-amber-500' },
  kpis: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', accent: 'bg-rose-500' },
}

function DiagramSection({ title, icon: Icon, items, color, className = '' }: {
  title: string; icon: React.ElementType; items: string[]; color: typeof sectionColors.inputs; className?: string
}) {
  return (
    <div className={`rounded-xl border ${color.border} ${color.bg} p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg ${color.accent}/20`}>
          <Icon className={`h-4 w-4 ${color.text}`} />
        </div>
        <h4 className={`text-sm font-semibold ${color.text}`}>{title}</h4>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
            <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${color.accent} shrink-0`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function TurtleDiagram({ procedure }: { procedure: TurtleProcedure }) {
  const ProcIcon = procedure.icon
  return (
    <div className="print:break-inside-avoid">
      {/* Methods (top-left) and Inputs (top-center) row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <DiagramSection title="Methods / How" icon={BookOpen} items={procedure.methods} color={sectionColors.methods} />
        <div className="relative">
          <DiagramSection title="Inputs (Triggers)" icon={ArrowDown} items={procedure.inputs} color={sectionColors.inputs} />
          <div className="hidden lg:block absolute -bottom-4 left-1/2 -translate-x-1/2">
            <ArrowDown className="h-4 w-4 text-blue-400" />
          </div>
        </div>
        <div /> {/* empty cell for grid alignment */}
      </div>

      {/* Center row: With What | Process Center | With Whom */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="relative">
          <DiagramSection title="Resources — With What" icon={Settings} items={procedure.withWhat} color={sectionColors.withWhat} />
          <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2">
            <ArrowRight className="h-4 w-4 text-purple-400" />
          </div>
        </div>

        {/* CENTER: Process Name & Owner */}
        <div className={`rounded-xl border-2 ${sectionColors.center.border} ${sectionColors.center.bg} p-6 flex flex-col items-center justify-center text-center`}>
          <div className={`p-3 rounded-xl ${sectionColors.center.accent}/20 mb-3`}>
            <ProcIcon className={`h-8 w-8 ${sectionColors.center.text}`} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">{procedure.name}</h3>
          <Badge variant="outline" className="text-orange-400 border-orange-500/40 mb-2">
            Clause {procedure.clause}
          </Badge>
          <p className="text-xs text-gray-400">Process Owner: <span className="text-orange-300 font-medium">{procedure.owner}</span></p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 -left-4 -translate-y-1/2">
            <ArrowRight className="h-4 w-4 text-cyan-400" />
          </div>
          <DiagramSection title="Human Resources — With Whom" icon={Users} items={procedure.withWhom} color={sectionColors.withWhom} />
        </div>
      </div>

      {/* Outputs (bottom-center) and KPIs (bottom-right) row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div /> {/* empty cell for grid alignment */}
        <div className="relative">
          <div className="hidden lg:block absolute -top-4 left-1/2 -translate-x-1/2">
            <ArrowDown className="h-4 w-4 text-green-400" />
          </div>
          <DiagramSection title="Outputs (Deliverables)" icon={ArrowUp} items={procedure.outputs} color={sectionColors.outputs} />
        </div>
        <DiagramSection title="KPIs / Metrics" icon={Activity} items={procedure.kpis} color={sectionColors.kpis} />
      </div>
    </div>
  )
}

export default function TurtleDiagramsPage() {
  const [selected, setSelected] = useState(PROCEDURES[0].id)
  const procedure = PROCEDURES.find(p => p.id === selected) ?? PROCEDURES[0]

  return (
    <div className="space-y-6 print:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Turtle Diagrams</h1>
          <p className="text-sm text-gray-400 mt-1">Interactive process turtle diagrams for all 12 key ISO 17025 quality procedures</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="w-[280px] bg-gray-900 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              {PROCEDURES.map(p => (
                <SelectItem key={p.id} value={p.id} className="text-gray-200 focus:bg-gray-800 focus:text-white">
                  {p.name} (§{p.clause})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm border border-gray-700"
          >
            Print
          </button>
        </div>
      </div>

      {/* Tabs for quick switching */}
      <div className="print:hidden">
        <Tabs value={selected} onValueChange={setSelected}>
          <TabsList className="flex flex-wrap h-auto gap-1 bg-gray-900/50 p-1.5 rounded-xl">
            {PROCEDURES.map(p => {
              const Icon = p.icon
              return (
                <TabsTrigger
                  key={p.id}
                  value={p.id}
                  className="text-xs px-3 py-1.5 data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400"
                >
                  <Icon className="h-3.5 w-3.5 mr-1.5" />
                  §{p.clause}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs print:hidden">
        {[
          { label: 'Process Center', color: 'bg-orange-500' },
          { label: 'Inputs', color: 'bg-blue-500' },
          { label: 'Outputs', color: 'bg-green-500' },
          { label: 'Resources', color: 'bg-purple-500' },
          { label: 'People', color: 'bg-cyan-500' },
          { label: 'Methods', color: 'bg-amber-500' },
          { label: 'KPIs', color: 'bg-rose-500' },
        ].map(l => (
          <span key={l.label} className="flex items-center gap-1.5 text-gray-400">
            <span className={`h-2.5 w-2.5 rounded-full ${l.color}`} />
            {l.label}
          </span>
        ))}
      </div>

      {/* Diagram */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-6">
          <TurtleDiagram procedure={procedure} />
        </CardContent>
      </Card>

      {/* Print: all diagrams */}
      <div className="hidden print:block space-y-12">
        {PROCEDURES.filter(p => p.id !== selected).map(p => (
          <Card key={p.id} className="bg-white border border-gray-300">
            <CardContent className="p-6">
              <TurtleDiagram procedure={p} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
