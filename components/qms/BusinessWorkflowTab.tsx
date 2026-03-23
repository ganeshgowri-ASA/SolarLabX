// @ts-nocheck
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ChevronRight, X, ArrowRight } from 'lucide-react'

interface WorkflowStep {
  step: number
  title: string
  department: 'Sales' | 'Lab' | 'Quality' | 'Admin'
  responsible: string
  sopRef: string
  duration: string
  inputDocs: string[]
  outputDocs: string[]
  description: string
}

const DEPT_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Sales: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-300 dark:border-blue-700', dot: 'bg-blue-500' },
  Lab: { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-300 dark:border-orange-700', dot: 'bg-orange-500' },
  Quality: { bg: 'bg-green-50 dark:bg-green-950/40', text: 'text-green-700 dark:text-green-400', border: 'border-green-300 dark:border-green-700', dot: 'bg-green-500' },
  Admin: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-300 dark:border-purple-700', dot: 'bg-purple-500' },
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: 1, title: 'Customer Inquiry', department: 'Sales',
    responsible: 'Sample Coordinator / Technical Manager',
    sopRef: 'QP-7.1-01 Request Review',
    duration: '1 day',
    inputDocs: ['Customer email/phone inquiry', 'Test requirement specification'],
    outputDocs: ['Inquiry log entry', 'Feasibility assessment'],
    description: 'Receive customer inquiry for solar PV module testing. Assess test requirements against lab scope of accreditation and capability.',
  },
  {
    step: 2, title: 'Quotation', department: 'Sales',
    responsible: 'Technical Manager / Lab Director',
    sopRef: 'QP-7.1-02 Quotation Procedure',
    duration: '1-2 days',
    inputDocs: ['Inquiry log', 'Test standards (IEC 61215/61730)', 'Price list'],
    outputDocs: ['Quotation document', 'Terms & conditions', 'Test plan outline'],
    description: 'Prepare detailed quotation including test scope, timeline, pricing, and terms. Review against standard price list and client-specific requirements.',
  },
  {
    step: 3, title: 'Sample Receipt & Registration', department: 'Lab',
    responsible: 'Sample Coordinator',
    sopRef: 'QP-7.4-01 Sample Handling',
    duration: '0.5 day',
    inputDocs: ['Approved quotation/PO', 'Sample delivery note', 'Module datasheet'],
    outputDocs: ['Sample receipt acknowledgment', 'LIMS registration entry', 'Chain of custody form'],
    description: 'Receive solar PV modules, verify against delivery note, assign unique sample IDs, and register in LIMS with full traceability.',
  },
  {
    step: 4, title: 'Sample Inspection', department: 'Lab',
    responsible: 'Test Engineer / Sample Coordinator',
    sopRef: 'QP-7.4-02 Sample Inspection',
    duration: '0.5 day',
    inputDocs: ['Module datasheet', 'Visual inspection checklist', 'EL imaging SOP'],
    outputDocs: ['Incoming inspection report', 'EL images (baseline)', 'Defect log (if any)'],
    description: 'Perform visual inspection and baseline EL imaging. Document any pre-existing defects. Confirm sample condition is suitable for testing.',
  },
  {
    step: 5, title: 'Test Planning', department: 'Lab',
    responsible: 'Technical Manager',
    sopRef: 'QP-7.1-03 Test Planning',
    duration: '1 day',
    inputDocs: ['Test standards', 'Client requirements', 'Equipment availability', 'Staff schedule'],
    outputDocs: ['Test plan', 'Equipment allocation', 'Staff assignment', 'Chamber schedule'],
    description: 'Create detailed test plan assigning specific tests to equipment and personnel. Schedule environmental chambers, solar simulators, and other resources.',
  },
  {
    step: 6, title: 'Testing (IEC 61215/61730)', department: 'Lab',
    responsible: 'Test Engineers',
    sopRef: 'QP-7.2-01 Method Selection / IEC 61215 / IEC 61730 SOPs',
    duration: '4-12 weeks',
    inputDocs: ['Test plan', 'Calibrated equipment', 'Test SOPs', 'Environmental condition logs'],
    outputDocs: ['Raw test data', 'Environmental logs', 'Intermediate EL/IR images', 'Equipment usage logs'],
    description: 'Execute the full test sequence per IEC standards — thermal cycling, damp heat, humidity freeze, mechanical load, UV exposure, I-V characterization, insulation tests, etc.',
  },
  {
    step: 7, title: 'Data Analysis', department: 'Lab',
    responsible: 'Test Engineers / Technical Manager',
    sopRef: 'QP-7.7-01 Validity of Results',
    duration: '2-3 days',
    inputDocs: ['Raw test data', 'Measurement uncertainty budgets', 'Pass/fail criteria'],
    outputDocs: ['Analyzed data sheets', 'Statistical summaries', 'Uncertainty calculations', 'Validity check records'],
    description: 'Analyze test data, calculate measurement uncertainty, verify results validity, and compare against IEC pass/fail criteria.',
  },
  {
    step: 8, title: 'Report Generation', department: 'Quality',
    responsible: 'Test Engineer / Document Controller',
    sopRef: 'QP-7.8-01 Test Report Procedure',
    duration: '1-2 days',
    inputDocs: ['Analyzed data', 'Report template', 'Module photos', 'EL/IR images'],
    outputDocs: ['Draft test report', 'Supporting annexures'],
    description: 'Generate comprehensive test report using SolarLabX report automation. Include all required data, graphs, images, and uncertainty statements per ISO 17025.',
  },
  {
    step: 9, title: 'Report Review & Approval', department: 'Quality',
    responsible: 'Technical Manager (Review) / Lab Director (Approve)',
    sopRef: 'QP-7.8-02 Report Review Checklist',
    duration: '1-2 days',
    inputDocs: ['Draft test report', 'Review checklist', 'Raw data for verification'],
    outputDocs: ['Approved test report (signed)', 'Review checklist (completed)'],
    description: 'Two-stage review: Technical Manager verifies data accuracy, then Lab Director provides final approval with digital signature.',
  },
  {
    step: 10, title: 'Report Dispatch', department: 'Admin',
    responsible: 'Document Controller',
    sopRef: 'QP-7.8-03 Report Dispatch',
    duration: '0.5 day',
    inputDocs: ['Approved test report', 'Client contact details', 'Dispatch log'],
    outputDocs: ['Dispatch record', 'Client acknowledgment', 'Archived report copy'],
    description: 'Dispatch approved report to client via secure channel. Archive original in document control system. Update LIMS status.',
  },
  {
    step: 11, title: 'Invoicing', department: 'Admin',
    responsible: 'Admin / Accounts',
    sopRef: 'QP-ADM-01 Invoicing Procedure',
    duration: '1 day',
    inputDocs: ['Quotation', 'Completed test records', 'Report dispatch confirmation'],
    outputDocs: ['Invoice', 'Payment receipt', 'Revenue entry'],
    description: 'Generate invoice based on quotation and completed tests. Track payment and update financial records.',
  },
  {
    step: 12, title: 'Customer Feedback', department: 'Quality',
    responsible: 'Quality Manager',
    sopRef: 'QP-8.6-01 Customer Feedback',
    duration: 'Ongoing',
    inputDocs: ['Feedback form', 'Customer satisfaction survey'],
    outputDocs: ['Feedback analysis report', 'Improvement actions (if any)', 'CAPA (if complaint)'],
    description: 'Collect customer feedback, analyze satisfaction trends, identify improvement opportunities, and initiate CAPA for complaints.',
  },
]

const ORIENTATION_CHECKLIST = [
  { item: 'Lab safety induction and PPE training', day: 'Day 1' },
  { item: 'QMS overview and Quality Policy briefing', day: 'Day 1' },
  { item: 'Impartiality & Confidentiality declaration signing', day: 'Day 1' },
  { item: 'LIMS system walkthrough and account setup', day: 'Day 1-2' },
  { item: 'SolarLabX platform training', day: 'Day 2' },
  { item: 'Solar PV basics and IEC standards overview', day: 'Day 2-3' },
  { item: 'Equipment familiarization (simulators, chambers, EL)', day: 'Day 3-5' },
  { item: 'SOP reading and competency pre-assessment', day: 'Week 1' },
  { item: 'Supervised testing observation (shadow senior engineer)', day: 'Week 1-2' },
  { item: 'Hands-on practice under supervision', day: 'Week 2-4' },
  { item: 'Measurement uncertainty training', day: 'Week 3' },
  { item: 'Report review process and quality checks', day: 'Week 3-4' },
  { item: 'Competency assessment and authorization', day: 'Week 4-6' },
  { item: 'Emergency procedures and evacuation drill', day: 'Month 1' },
  { item: 'Internal audit process awareness', day: 'Month 2' },
]

export default function BusinessWorkflowTab() {
  const [selectedStep, setSelectedStep] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">Business Workflow</h2>
        <p className="text-xs text-muted-foreground">Complete lab operations workflow — click any step for details</p>
      </div>

      {/* Department Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(DEPT_COLORS).map(([dept, colors]) => (
          <span key={dept} className="flex items-center gap-1.5 text-xs">
            <span className={`h-3 w-3 rounded-full ${colors.dot}`} />
            <span className="font-medium">{dept}</span>
          </span>
        ))}
      </div>

      {/* Workflow Flow */}
      <Card>
        <CardContent className="pt-4 pb-4 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-[1200px] px-2">
            {WORKFLOW_STEPS.map((step, idx) => {
              const colors = DEPT_COLORS[step.department]
              const isSelected = selectedStep === step.step
              return (
                <div key={step.step} className="flex items-center">
                  <button
                    onClick={() => setSelectedStep(isSelected ? null : step.step)}
                    className={`flex flex-col items-center justify-center rounded-lg border-2 px-3 py-2 min-w-[100px] transition-all cursor-pointer hover:shadow-md ${
                      isSelected ? `${colors.bg} ${colors.border} ring-2 ring-offset-1 ring-current ${colors.text}` : `${colors.bg} ${colors.border}`
                    }`}
                  >
                    <span className={`text-lg font-bold ${colors.text}`}>{step.step}</span>
                    <span className={`text-xs font-medium text-center leading-tight ${colors.text}`}>{step.title}</span>
                    <Badge variant="outline" className={`text-xs mt-1 ${colors.text} ${colors.border}`}>
                      {step.department}
                    </Badge>
                  </button>
                  {idx < WORKFLOW_STEPS.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mx-0.5" />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Details */}
      {selectedStep && (() => {
        const step = WORKFLOW_STEPS.find(s => s.step === selectedStep)!
        const colors = DEPT_COLORS[step.department]
        return (
          <Card className={`border-l-4 ${colors.border}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-full ${colors.dot} text-white flex items-center justify-center text-xs font-bold`}>
                      {step.step}
                    </span>
                    {step.title}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">{step.description}</CardDescription>
                </div>
                <Button size="sm" variant="ghost" className="h-7" onClick={() => setSelectedStep(null)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="border rounded-lg p-2">
                  <div className="text-xs font-bold mb-1">Responsible</div>
                  <div className="text-xs text-muted-foreground">{step.responsible}</div>
                </div>
                <div className="border rounded-lg p-2">
                  <div className="text-xs font-bold mb-1">SOP Reference</div>
                  <div className="text-xs text-muted-foreground">{step.sopRef}</div>
                </div>
                <div className="border rounded-lg p-2">
                  <div className="text-xs font-bold mb-1">Typical Duration</div>
                  <div className="text-xs text-muted-foreground">{step.duration}</div>
                </div>
                <div className="border rounded-lg p-2">
                  <div className="text-xs font-bold mb-1">Department</div>
                  <Badge variant="outline" className={`text-xs ${colors.text} ${colors.border}`}>{step.department}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="border rounded-lg p-2">
                  <div className="text-xs font-bold mb-1">Input Documents</div>
                  <ul className="space-y-0.5">
                    {step.inputDocs.map((doc, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                        <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-green-500" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border rounded-lg p-2">
                  <div className="text-xs font-bold mb-1">Output Documents</div>
                  <ul className="space-y-0.5">
                    {step.outputDocs.map((doc, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                        <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-blue-500" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })()}

      {/* New Employee Guide */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            New Employee Orientation Checklist
          </CardTitle>
          <CardDescription className="text-xs">Onboarding guide for new lab personnel — Solar PV Testing Laboratory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {ORIENTATION_CHECKLIST.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50">
                <div className="w-4 h-4 border-2 border-gray-300 rounded shrink-0" />
                <span className="text-xs flex-1">{item.item}</span>
                <Badge variant="outline" className="text-xs shrink-0">{item.day}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
