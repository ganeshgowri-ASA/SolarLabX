// @ts-nocheck
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings, Users, ArrowRight, ArrowLeft, Target, Cpu, ClipboardList } from 'lucide-react'

interface TurtleData {
  id: string
  name: string
  description: string
  withWhat: string[]
  withWhom: string[]
  inputs: string[]
  outputs: string[]
  how: string[]
  kpis: string[]
}

const TURTLE_DATA: TurtleData[] = [
  {
    id: 'QP-4.1', name: 'Impartiality',
    description: 'Ensure laboratory activities are undertaken impartially and free from commercial, financial, or other pressures.',
    withWhat: ['Conflict of Interest Register', 'Impartiality Declaration Forms', 'Document Management System'],
    withWhom: ['Lab Director (Accountable)', 'Quality Manager (Responsible)', 'All Staff (Informed)'],
    inputs: ['New employee onboarding', 'Annual review cycle', 'Customer complaint regarding bias', 'New client engagement'],
    outputs: ['Signed Impartiality Declarations', 'Risk assessment records', 'Corrective actions if breach found', 'Annual impartiality review report'],
    how: ['QP-4.1-01 Managing Conflicts of Interest', 'QSF-4.1-01 Staff Impartiality Declaration', 'Annual staff training on impartiality', 'Risk-based assessment per ISO 17025 §4.1'],
    kpis: ['100% staff declarations signed annually', 'Zero impartiality complaints per year', 'Risk assessment completion rate > 95%', 'Training completion within 30 days of joining'],
  },
  {
    id: 'QP-4.2', name: 'Confidentiality',
    description: 'Protect confidential information obtained during laboratory activities including electronic storage and transmission.',
    withWhat: ['NDA templates', 'Encrypted file storage', 'Access control system', 'Secure network infrastructure'],
    withWhom: ['Quality Manager (Responsible)', 'IT Administrator (Support)', 'All Staff (Informed)', 'Lab Director (Accountable)'],
    inputs: ['Client test requests with proprietary data', 'New employee/vendor onboarding', 'Data breach incident', 'Regulatory audit'],
    outputs: ['Signed NDAs and confidentiality agreements', 'Access control logs', 'Data classification records', 'Breach incident reports'],
    how: ['QP-4.2-01 Information Security & Confidentiality', 'QSF-4.2-01 Client Confidentiality Agreement', 'IT Security Policy', 'Data classification procedure'],
    kpis: ['100% NDAs signed before data access', 'Zero data breaches per year', 'Quarterly access review completion', 'Encryption compliance > 99%'],
  },
  {
    id: 'QP-6.2', name: 'Facilities & Environmental Conditions',
    description: 'Ensure laboratory facilities and environmental conditions are suitable for testing activities and do not adversely affect results.',
    withWhat: ['Environmental monitoring system', 'Temperature/humidity loggers', 'Clean room equipment', 'HVAC systems', 'Lux meters'],
    withWhom: ['Facility Manager (Responsible)', 'Lab Director (Accountable)', 'Safety Officer (Consulted)', 'Calibration Officer (Support)'],
    inputs: ['New test method requiring specific conditions', 'Environmental excursion alarm', 'Facility modification request', 'Accreditation audit finding'],
    outputs: ['Environmental monitoring records', 'Facility qualification reports', 'Maintenance logs', 'Non-conformance reports for excursions'],
    how: ['QP-6.2-01 Facility Management Procedure', 'QSF-6.2-01 Environmental Monitoring Log', 'Preventive maintenance schedule', 'IEC 61215/61730 environmental requirements'],
    kpis: ['Environmental excursions < 2 per quarter', 'Monitoring uptime > 99.5%', 'PM completion rate > 95%', 'Facility audit NC closure within 30 days'],
  },
  {
    id: 'QP-7.2', name: 'Method Selection, Verification & Validation',
    description: 'Select appropriate test methods and ensure they are validated or verified before use for solar PV module testing.',
    withWhat: ['IEC 61215/61730/60904 standards', 'Solar simulators', 'Environmental chambers', 'EL imaging systems', 'DAQ systems'],
    withWhom: ['Technical Manager (Accountable)', 'Test Engineers (Responsible)', 'Quality Manager (Consulted)', 'Calibration Officer (Support)'],
    inputs: ['New standard edition published', 'Client request for non-standard test', 'New equipment commissioning', 'Scope extension application'],
    outputs: ['Method validation reports', 'Measurement uncertainty budgets', 'Verified test procedures (SOPs)', 'Scope of accreditation updates'],
    how: ['QP-7.2-01 Method Selection & Validation', 'ISO 17025 §7.2 requirements', 'GUM uncertainty methodology', 'Inter-laboratory comparison participation'],
    kpis: ['100% methods validated before use', 'Validation report approval < 15 days', 'ILC Z-scores within ±2', 'Scope extension audit success rate > 90%'],
  },
  {
    id: 'QP-7.8', name: 'Reporting of Results',
    description: 'Ensure test reports are accurate, unambiguous, and comply with ISO 17025 and client requirements.',
    withWhat: ['Report generation software (SolarLabX)', 'Report templates (IEC compliant)', 'Digital signature system', 'LIMS database'],
    withWhom: ['Test Engineers (Responsible)', 'Technical Manager (Reviewer)', 'Lab Director (Approver)', 'Document Controller (Support)'],
    inputs: ['Completed test data in LIMS', 'Client-specific reporting requirements', 'Measurement uncertainty calculations', 'Test photographs and EL images'],
    outputs: ['Accredited test reports (PDF)', 'Amended reports if corrections needed', 'Report dispatch records', 'Client acknowledgment'],
    how: ['QP-7.8-01 Test Report Procedure', 'QSF-7.8-01 Report Review Checklist', 'ISO 17025 §7.8 reporting requirements', 'IEC 61215/61730 report format guidelines'],
    kpis: ['Report turnaround < 5 working days', 'Report error rate < 1%', 'First-time approval rate > 90%', 'Client satisfaction score > 4.5/5'],
  },
  {
    id: 'QP-6.1', name: 'Personnel',
    description: 'Ensure all personnel are competent, trained, and authorized to perform laboratory activities.',
    withWhat: ['Training management system', 'Competency assessment forms', 'HR records database', 'Online learning platform'],
    withWhom: ['Quality Manager (Responsible)', 'Lab Director (Accountable)', 'Technical Manager (Consulted)', 'HR Manager (Support)'],
    inputs: ['New hire onboarding', 'Annual competency review', 'New test method introduction', 'Audit finding on personnel'],
    outputs: ['Training records', 'Competency matrices', 'Authorization letters', 'Personnel qualification files'],
    how: ['QP-6.1-01 Personnel Competence Procedure', 'QSF-6.1-01 Training Needs Assessment', 'Annual competency evaluation', 'Supervised testing for new staff'],
    kpis: ['Training plan completion > 95%', 'Competency assessment on-time > 90%', '100% staff authorized before independent work', 'Training effectiveness score > 80%'],
  },
  {
    id: 'QP-6.3', name: 'Equipment',
    description: 'Manage laboratory equipment to ensure it is fit for purpose, properly calibrated, and maintained.',
    withWhat: ['Equipment database (LIMS)', 'Calibration management system', 'Solar simulator', 'Environmental chambers', 'EL/IR cameras'],
    withWhom: ['Calibration Officer (Responsible)', 'Technical Manager (Accountable)', 'Test Engineers (Informed)', 'Equipment vendors (Support)'],
    inputs: ['New equipment procurement', 'Calibration due date', 'Equipment malfunction report', 'Accreditation audit requirement'],
    outputs: ['Calibration certificates', 'Equipment qualification reports', 'Maintenance logs', 'Out-of-tolerance investigation reports'],
    how: ['QP-6.3-01 Equipment Management Procedure', 'QSF-6.3-01 Equipment Calibration Log', 'Preventive maintenance schedule', 'IEC 60904-9 simulator classification'],
    kpis: ['Calibration on-time rate > 98%', 'Equipment downtime < 2%', 'PM completion rate > 95%', 'Zero expired calibrations during testing'],
  },
  {
    id: 'QP-8.7', name: 'Corrective Actions',
    description: 'Identify, investigate, and eliminate root causes of nonconformities to prevent recurrence.',
    withWhat: ['CAPA management module (SolarLabX)', 'Root cause analysis tools (5-Why, Fishbone)', 'NC tracking database'],
    withWhom: ['Quality Manager (Responsible)', 'Lab Director (Accountable)', 'Process Owner (Consulted)', 'All Staff (Informed)'],
    inputs: ['Nonconformity detected', 'Customer complaint', 'Audit finding (internal/external)', 'Proficiency testing failure'],
    outputs: ['CAPA records', 'Root cause analysis reports', 'Effectiveness verification records', 'Updated procedures/training'],
    how: ['QP-8.7-01 Corrective Action Procedure', 'QSF-8.7-01 CAPA Form', '5-Why / Fishbone analysis', 'Effectiveness verification after 90 days'],
    kpis: ['CAPA closure within 30 days', 'Root cause identified for 100% NCs', 'Recurrence rate < 5%', 'Effectiveness verification completion > 95%'],
  },
  {
    id: 'QP-8.8', name: 'Internal Audit',
    description: 'Plan and conduct internal audits to verify QMS conformity and identify improvement opportunities.',
    withWhat: ['Audit scheduling software', 'Audit checklists (ISO 17025)', 'NC tracking system', 'Audit report templates'],
    withWhom: ['Quality Manager (Lead Auditor)', 'Lab Director (Accountable)', 'Trained Internal Auditors', 'Process Owners (Auditees)'],
    inputs: ['Annual audit schedule', 'Previous audit findings', 'Management review action items', 'Process changes or new scope'],
    outputs: ['Audit reports', 'NC/OFI findings', 'Audit schedule compliance records', 'Auditor competency records'],
    how: ['QP-8.8-01 Internal Audit Procedure', 'QSF-8.8-01 Audit Checklist', 'ISO 19011 audit methodology', 'Risk-based audit planning'],
    kpis: ['100% scheduled audits completed', 'Audit findings closed within 60 days', 'Auditor qualification maintained', 'Repeat findings < 10%'],
  },
  {
    id: 'QP-8.9', name: 'Management Review',
    description: 'Top management reviews the QMS at planned intervals to ensure its continuing suitability, adequacy, and effectiveness.',
    withWhat: ['MRM presentation templates', 'KPI dashboards (SolarLabX)', 'Meeting room & AV equipment', 'Minutes template'],
    withWhom: ['Lab Director (Chair)', 'Quality Manager (Secretary)', 'Technical Manager (Presenter)', 'All Department Heads (Participants)'],
    inputs: ['Previous MRM action items', 'Internal/external audit results', 'Customer feedback & complaints', 'KPI trend data', 'Resource needs'],
    outputs: ['MRM minutes', 'Action items with owners & deadlines', 'Resource allocation decisions', 'QMS improvement plans'],
    how: ['QP-8.9-01 Management Review Procedure', 'QSF-8.9-01 MRM Agenda Template', 'ISO 17025 §8.9 input/output requirements', 'Bi-annual review schedule'],
    kpis: ['MRM conducted on schedule (2/year)', 'Action items closed within target dates > 90%', '100% agenda items covered', 'Improvement actions implemented > 85%'],
  },
]

const ALL_QP_IDS = [
  'QP-4.1', 'QP-4.2', 'QP-5.1', 'QP-5.2', 'QP-6.1', 'QP-6.2', 'QP-6.3',
  'QP-7.1', 'QP-7.2', 'QP-7.3', 'QP-7.4', 'QP-7.5', 'QP-7.6', 'QP-7.7', 'QP-7.8',
  'QP-8.1', 'QP-8.2', 'QP-8.5', 'QP-8.6', 'QP-8.7', 'QP-8.8', 'QP-8.9',
]

const QP_NAMES: Record<string, string> = {
  'QP-4.1': 'Impartiality', 'QP-4.2': 'Confidentiality',
  'QP-5.1': 'Organization', 'QP-5.2': 'Management System',
  'QP-6.1': 'Personnel', 'QP-6.2': 'Facilities', 'QP-6.3': 'Equipment',
  'QP-7.1': 'Request Review', 'QP-7.2': 'Method Selection', 'QP-7.3': 'Sampling',
  'QP-7.4': 'Test Handling', 'QP-7.5': 'Technical Records', 'QP-7.6': 'Measurement Uncertainty',
  'QP-7.7': 'Validity of Results', 'QP-7.8': 'Reporting',
  'QP-8.1': 'Management System Options', 'QP-8.2': 'Documentation',
  'QP-8.5': 'Actions for Risks', 'QP-8.6': 'Improvement',
  'QP-8.7': 'Corrective Actions', 'QP-8.8': 'Internal Audit', 'QP-8.9': 'Management Review',
}

function SectionBox({ title, icon: Icon, items, color, position }: {
  title: string; icon: any; items: string[]; color: string; position: string
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-300 dark:bg-blue-950/40 dark:border-blue-700',
    green: 'bg-green-50 border-green-300 dark:bg-green-950/40 dark:border-green-700',
    amber: 'bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:border-amber-700',
    purple: 'bg-purple-50 border-purple-300 dark:bg-purple-950/40 dark:border-purple-700',
    rose: 'bg-rose-50 border-rose-300 dark:bg-rose-950/40 dark:border-rose-700',
    cyan: 'bg-cyan-50 border-cyan-300 dark:bg-cyan-950/40 dark:border-cyan-700',
  }
  const badgeColor: Record<string, string> = {
    blue: 'bg-blue-600', green: 'bg-green-600', amber: 'bg-amber-600',
    purple: 'bg-purple-600', rose: 'bg-rose-600', cyan: 'bg-cyan-600',
  }
  return (
    <div className={`rounded-lg border-2 p-3 ${colorMap[color]} h-full`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`${badgeColor[color]} text-white p-1 rounded`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="text-xs font-bold uppercase tracking-wide">{title}</span>
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-current shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function TurtleDiagramsTab() {
  const [selectedQP, setSelectedQP] = useState('QP-4.1')
  const turtle = TURTLE_DATA.find(t => t.id === selectedQP)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold">Turtle Diagrams</h2>
          <p className="text-xs text-muted-foreground">ISO 17025:2017 Process Turtle Diagrams — visual process mapping for each Quality Procedure</p>
        </div>
        <select
          value={selectedQP}
          onChange={e => setSelectedQP(e.target.value)}
          className="text-sm border rounded-md px-3 py-1.5 bg-background"
        >
          {ALL_QP_IDS.map(id => (
            <option key={id} value={id}>{id} — {QP_NAMES[id]}</option>
          ))}
        </select>
      </div>

      {turtle ? (
        <div className="space-y-0">
          {/* Top row: With What + With Whom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <SectionBox title="With What (Equipment / Tools)" icon={Cpu} items={turtle.withWhat} color="blue" position="top-left" />
            <SectionBox title="With Whom (People / Competencies)" icon={Users} items={turtle.withWhom} color="green" position="top-right" />
          </div>

          {/* Middle row: Inputs → Process → Outputs with How and KPIs on sides */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_2fr_1fr_1fr] gap-3 items-stretch mb-4">
            {/* How */}
            <SectionBox title="How (Methods / SOPs)" icon={ClipboardList} items={turtle.how} color="purple" position="left" />
            {/* Inputs */}
            <SectionBox title="Inputs (Triggers)" icon={ArrowRight} items={turtle.inputs} color="amber" position="bottom-left" />
            {/* Center Process */}
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500/10 via-transparent to-orange-500/10 dark:from-orange-500/20 dark:to-orange-500/20" />
              {/* Turtle SVG shape */}
              <svg viewBox="0 0 400 200" className="w-full h-full min-h-[160px] absolute inset-0 opacity-[0.07] dark:opacity-[0.12]" preserveAspectRatio="xMidYMid meet">
                {/* Body */}
                <ellipse cx="200" cy="100" rx="140" ry="65" fill="currentColor" />
                {/* Head */}
                <ellipse cx="360" cy="80" rx="35" ry="25" fill="currentColor" />
                {/* Legs */}
                <ellipse cx="120" cy="40" rx="30" ry="15" fill="currentColor" transform="rotate(-30 120 40)" />
                <ellipse cx="280" cy="40" rx="30" ry="15" fill="currentColor" transform="rotate(30 280 40)" />
                <ellipse cx="120" cy="160" rx="30" ry="15" fill="currentColor" transform="rotate(30 120 160)" />
                <ellipse cx="280" cy="160" rx="30" ry="15" fill="currentColor" transform="rotate(-30 280 160)" />
                {/* Tail */}
                <ellipse cx="45" cy="105" rx="25" ry="10" fill="currentColor" />
                {/* Eye */}
                <circle cx="370" cy="75" r="4" fill="white" />
              </svg>
              <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 min-h-[160px]">
                <Badge className="bg-orange-600 text-white mb-2 text-sm px-3">{turtle.id}</Badge>
                <h3 className="text-lg font-bold">{turtle.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-md leading-relaxed">{turtle.description}</p>
              </div>
            </div>
            {/* Outputs */}
            <SectionBox title="Outputs (Deliverables)" icon={ArrowLeft} items={turtle.outputs} color="rose" position="bottom-right" />
            {/* KPIs */}
            <SectionBox title="KPIs (Metrics)" icon={Target} items={turtle.kpis} color="cyan" position="right" />
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Turtle diagram data for <strong>{selectedQP} — {QP_NAMES[selectedQP]}</strong> is not yet populated.
            </p>
            <p className="text-xs text-muted-foreground mt-1">Demo data is available for: {TURTLE_DATA.map(t => t.id).join(', ')}</p>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="text-xs font-bold mb-2">Turtle Diagram Legend</div>
          <div className="flex flex-wrap gap-3 text-xs">
            {[
              { label: 'With What', color: 'bg-blue-500' },
              { label: 'With Whom', color: 'bg-green-500' },
              { label: 'How (Methods)', color: 'bg-purple-500' },
              { label: 'Inputs', color: 'bg-amber-500' },
              { label: 'Process', color: 'bg-orange-500' },
              { label: 'Outputs', color: 'bg-rose-500' },
              { label: 'KPIs', color: 'bg-cyan-500' },
            ].map(({ label, color }) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />
                {label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
