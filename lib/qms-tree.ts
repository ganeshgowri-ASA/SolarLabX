import type { LucideIcon } from 'lucide-react'
import { Shield, Layers, Users, Microscope, Settings } from 'lucide-react'

// ISO 17025 Document Hierarchy types and data, extracted from qms/page.tsx
// so the page component is not cluttered with 290 lines of static data.

export interface DocLevel {
  level: 1 | 2 | 3 | 4
  code: string
  title: string
  revision: string
  status: 'approved' | 'draft' | 'under_review' | 'obsolete'
  owner: string
  nextReview: string
  clause: string
}

export interface ClauseNode {
  clause: string
  title: string
  icon?: LucideIcon
  documents: DocLevel[]
  children?: ClauseNode[]
}

export const LEVEL_LABELS: Record<1 | 2 | 3 | 4, {
  label: string; short: string; color: string; light: string; text: string; border: string
}> = {
  1: { label: 'Level 1 – Quality Manual (QM)', short: 'QM', color: 'bg-blue-600', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  2: { label: 'Level 2 – Quality Procedures (QP)', short: 'QP', color: 'bg-purple-600', light: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  3: { label: 'Level 3 – Quality System Forms (QSF)', short: 'QSF', color: 'bg-green-600', light: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  4: { label: 'Level 4 – Annexures / Work Instructions / Templates', short: 'WI/AX', color: 'bg-amber-600', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
}

export const docStatusColors: Record<DocLevel['status'], string> = {
  approved: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
  under_review: 'bg-blue-100 text-blue-700',
  obsolete: 'bg-red-100 text-red-500',
}

export const ISO17025_TREE: ClauseNode[] = [
  {
    clause: '4', title: 'General Requirements',
    icon: Shield,
    documents: [],
    children: [
      {
        clause: '4.1', title: 'Impartiality',
        documents: [
          { level: 1, code: 'QM-4.1', title: 'Impartiality & Independence Policy', revision: 'B', status: 'approved', owner: 'Director', nextReview: '2026-12', clause: '4.1' },
          { level: 2, code: 'QP-4.1-01', title: 'Procedure for Managing Conflicts of Interest', revision: 'A', status: 'approved', owner: 'Quality Manager', nextReview: '2026-12', clause: '4.1' },
          { level: 3, code: 'QSF-4.1-01', title: 'Staff Impartiality Declaration Form', revision: 'A', status: 'approved', owner: 'HR', nextReview: '2026-06', clause: '4.1' },
        ]
      },
      {
        clause: '4.2', title: 'Confidentiality',
        documents: [
          { level: 1, code: 'QM-4.2', title: 'Confidentiality Policy Statement', revision: 'B', status: 'approved', owner: 'Director', nextReview: '2026-12', clause: '4.2' },
          { level: 2, code: 'QP-4.2-01', title: 'Procedure for Information Security & Confidentiality', revision: 'A', status: 'approved', owner: 'Quality Manager', nextReview: '2026-12', clause: '4.2' },
          { level: 3, code: 'QSF-4.2-01', title: 'Client Confidentiality Agreement', revision: 'A', status: 'approved', owner: 'Quality Manager', nextReview: '2027-01', clause: '4.2' },
        ]
      },
    ]
  },
  {
    clause: '5', title: 'Structural Requirements',
    icon: Layers,
    documents: [
      { level: 1, code: 'QM-5.0', title: 'Laboratory Organizational Structure & Authority', revision: 'C', status: 'approved', owner: 'Director', nextReview: '2026-12', clause: '5' },
    ],
    children: [
      {
        clause: '5.1', title: 'Legal Entity & Responsibility',
        documents: [
          { level: 2, code: 'QP-5.1-01', title: 'Procedure for Legal Entity Compliance', revision: 'A', status: 'approved', owner: 'Director', nextReview: '2026-12', clause: '5.1' },
          { level: 3, code: 'QSF-5.1-01', title: 'Laboratory Registration Certificate (Annex)', revision: 'A', status: 'approved', owner: 'Director', nextReview: '2027-01', clause: '5.1' },
        ]
      },
      {
        clause: '5.2', title: 'Laboratory Activities & Scope',
        documents: [
          { level: 1, code: 'QM-5.2', title: 'Scope of Accreditation – Solar PV Testing', revision: 'D', status: 'approved', owner: 'Quality Manager', nextReview: '2026-06', clause: '5.2' },
          { level: 2, code: 'QP-5.2-01', title: 'Procedure for Defining & Controlling Test Scope', revision: 'B', status: 'approved', owner: 'Lab Manager', nextReview: '2026-12', clause: '5.2' },
          { level: 4, code: 'AX-5.2-01', title: 'Annex – NABL Scope Certificate', revision: 'C', status: 'approved', owner: 'Quality Manager', nextReview: '2026-06', clause: '5.2' },
        ]
      },
      {
        clause: '5.3', title: 'Laboratory Structure',
        documents: [
          { level: 1, code: 'QM-5.3', title: 'Organization Chart & Roles/Responsibilities', revision: 'B', status: 'approved', owner: 'Director', nextReview: '2026-12', clause: '5.3' },
          { level: 4, code: 'WI-5.3-01', title: 'Work Instruction – Job Descriptions (All Roles)', revision: 'A', status: 'approved', owner: 'HR', nextReview: '2027-01', clause: '5.3' },
        ]
      },
      {
        clause: '5.4', title: 'Roles & Responsibilities',
        documents: [
          { level: 2, code: 'QP-5.4-01', title: 'Procedure for Role Assignment & Delegation', revision: 'A', status: 'approved', owner: 'Lab Manager', nextReview: '2026-12', clause: '5.4' },
          { level: 3, code: 'QSF-5.4-01', title: 'Authority Delegation Record Form', revision: 'A', status: 'approved', owner: 'Lab Manager', nextReview: '2026-09', clause: '5.4' },
        ]
      },
    ]
  },
  {
    clause: '6', title: 'Resource Requirements',
    icon: Users,
    documents: [],
    children: [
      {
        clause: '6.1', title: 'General (Resources)',
        documents: [
          { level: 1, code: 'QM-6.1', title: 'Resource Management Policy', revision: 'B', status: 'approved', owner: 'Lab Manager', nextReview: '2026-12', clause: '6.1' },
        ]
      },
      {
        clause: '6.2', title: 'Personnel',
        documents: [
          { level: 2, code: 'QP-6.2-01', title: 'Procedure for Personnel Competence, Training & Qualification', revision: 'C', status: 'approved', owner: 'Lab Manager', nextReview: '2026-09', clause: '6.2' },
          { level: 3, code: 'QSF-6.2-01', title: 'Training Record Form', revision: 'B', status: 'approved', owner: 'Lab Manager', nextReview: '2026-06', clause: '6.2' },
          { level: 3, code: 'QSF-6.2-02', title: 'Technician Competency Assessment Form', revision: 'A', status: 'approved', owner: 'Lab Manager', nextReview: '2026-09', clause: '6.2' },
          { level: 4, code: 'AX-6.2-01', title: 'Annex – Competency Matrix (All Staff)', revision: 'B', status: 'approved', owner: 'Lab Manager', nextReview: '2026-12', clause: '6.2' },
        ]
      },
      {
        clause: '6.3', title: 'Facilities & Environmental Conditions',
        documents: [
          { level: 2, code: 'QP-6.3-01', title: 'Procedure for Environmental Control & Monitoring', revision: 'B', status: 'approved', owner: 'Facilities Manager', nextReview: '2026-12', clause: '6.3' },
          { level: 3, code: 'QSF-6.3-01', title: 'Daily Environmental Log (Temperature/Humidity)', revision: 'A', status: 'approved', owner: 'Technician', nextReview: '2026-06', clause: '6.3' },
          { level: 4, code: 'WI-6.3-01', title: 'Work Instruction – Lab Area Access Controls', revision: 'A', status: 'approved', owner: 'Facilities Manager', nextReview: '2027-01', clause: '6.3' },
        ]
      },
      {
        clause: '6.4', title: 'Equipment',
        documents: [
          { level: 2, code: 'QP-6.4-01', title: 'Procedure for Equipment Management & Calibration', revision: 'D', status: 'approved', owner: 'Equipment Manager', nextReview: '2026-09', clause: '6.4' },
          { level: 3, code: 'QSF-6.4-01', title: 'Equipment Registration & Identification Form', revision: 'B', status: 'approved', owner: 'Equipment Manager', nextReview: '2026-09', clause: '6.4' },
          { level: 3, code: 'QSF-6.4-02', title: 'Calibration Record Form', revision: 'C', status: 'approved', owner: 'Equipment Manager', nextReview: '2026-06', clause: '6.4' },
          { level: 3, code: 'QSF-6.4-03', title: 'Equipment Out-of-Service Tag', revision: 'A', status: 'approved', owner: 'Equipment Manager', nextReview: '2026-12', clause: '6.4' },
          { level: 4, code: 'AX-6.4-01', title: 'Annex – Master Equipment List with Calibration Due Dates', revision: 'E', status: 'approved', owner: 'Equipment Manager', nextReview: '2026-03', clause: '6.4' },
        ]
      },
      {
        clause: '6.5', title: 'Metrological Traceability',
        documents: [
          { level: 2, code: 'QP-6.5-01', title: 'Procedure for Metrological Traceability', revision: 'B', status: 'approved', owner: 'Quality Manager', nextReview: '2026-12', clause: '6.5' },
          { level: 4, code: 'AX-6.5-01', title: 'Annex – Traceability Chain Diagram (NABL/NPL)', revision: 'C', status: 'approved', owner: 'Quality Manager', nextReview: '2026-06', clause: '6.5' },
        ]
      },
      {
        clause: '6.6', title: 'Externally Provided Products & Services',
        documents: [
          { level: 2, code: 'QP-6.6-01', title: 'Procedure for Subcontracting & External Purchases', revision: 'B', status: 'approved', owner: 'Quality Manager', nextReview: '2026-12', clause: '6.6' },
          { level: 3, code: 'QSF-6.6-01', title: 'Approved Supplier/Subcontractor Evaluation Form', revision: 'A', status: 'under_review', owner: 'Quality Manager', nextReview: '2026-06', clause: '6.6' },
        ]
      },
    ]
  },
  {
    clause: '7', title: 'Process Requirements',
    icon: Microscope,
    documents: [],
    children: [
      {
        clause: '7.1', title: 'Review of Requests, Tenders & Contracts',
        documents: [
          { level: 2, code: 'QP-7.1-01', title: 'Procedure for Contract Review & Sample Acceptance', revision: 'C', status: 'approved', owner: 'Lab Manager', nextReview: '2026-09', clause: '7.1' },
          { level: 3, code: 'QSF-7.1-01', title: 'Test Request / Contract Review Form', revision: 'B', status: 'approved', owner: 'Lab Manager', nextReview: '2026-06', clause: '7.1' },
          { level: 3, code: 'QSF-7.1-02', title: 'Sample Receipt & Condition Log', revision: 'A', status: 'approved', owner: 'Technician', nextReview: '2026-06', clause: '7.1' },
        ]
      },
      {
        clause: '7.2', title: 'Selection, Verification & Validation of Methods',
        documents: [
          { level: 2, code: 'QP-7.2-01', title: 'Procedure for Test Method Selection & Validation', revision: 'B', status: 'approved', owner: 'Lab Manager', nextReview: '2026-12', clause: '7.2' },
          { level: 3, code: 'QSF-7.2-01', title: 'Method Validation Report Template', revision: 'A', status: 'approved', owner: 'Lab Manager', nextReview: '2026-12', clause: '7.2' },
          { level: 4, code: 'WI-7.2-01', title: 'Work Instruction – IEC 61215 MQT Execution', revision: 'D', status: 'approved', owner: 'Lab Manager', nextReview: '2026-09', clause: '7.2' },
          { level: 4, code: 'WI-7.2-02', title: 'Work Instruction – IEC 61730 Safety Test Execution', revision: 'C', status: 'approved', owner: 'Lab Manager', nextReview: '2026-09', clause: '7.2' },
          { level: 4, code: 'WI-7.2-03', title: 'Work Instruction – IEC 61853 Energy Rating', revision: 'B', status: 'under_review', owner: 'Lab Manager', nextReview: '2026-06', clause: '7.2' },
        ]
      },
      {
        clause: '7.3', title: 'Sampling',
        documents: [
          { level: 2, code: 'QP-7.3-01', title: 'Procedure for Sample Management & Sampling Plan', revision: 'B', status: 'approved', owner: 'Lab Manager', nextReview: '2026-12', clause: '7.3' },
          { level: 3, code: 'QSF-7.3-01', title: 'Sample Allocation & Labeling Form', revision: 'A', status: 'approved', owner: 'Technician', nextReview: '2026-06', clause: '7.3' },
        ]
      },
      {
        clause: '7.4', title: 'Handling of Test/Calibration Items',
        documents: [
          { level: 2, code: 'QP-7.4-01', title: 'Procedure for Sample Handling, Storage & Disposal', revision: 'C', status: 'approved', owner: 'Lab Manager', nextReview: '2026-12', clause: '7.4' },
          { level: 3, code: 'QSF-7.4-01', title: 'Chain of Custody Transfer Record', revision: 'B', status: 'approved', owner: 'Technician', nextReview: '2026-06', clause: '7.4' },
          { level: 4, code: 'WI-7.4-01', title: 'Work Instruction – Module Conditioning Procedure', revision: 'A', status: 'approved', owner: 'Technician', nextReview: '2026-12', clause: '7.4' },
        ]
      },
      {
        clause: '7.5', title: 'Technical Records',
        documents: [
          { level: 2, code: 'QP-7.5-01', title: 'Procedure for Technical Records Control', revision: 'B', status: 'approved', owner: 'Quality Manager', nextReview: '2026-12', clause: '7.5' },
          { level: 3, code: 'QSF-7.5-01', title: 'Raw Data Recording Sheet – IV Test', revision: 'C', status: 'approved', owner: 'Technician', nextReview: '2026-06', clause: '7.5' },
          { level: 3, code: 'QSF-7.5-02', title: 'Test Observation Log (General)', revision: 'B', status: 'approved', owner: 'Technician', nextReview: '2026-06', clause: '7.5' },
          { level: 4, code: 'AX-7.5-01', title: 'Annex – Record Retention Schedule', revision: 'A', status: 'approved', owner: 'Quality Manager', nextReview: '2027-01', clause: '7.5' },
        ]
      },
      {
        clause: '7.6', title: 'Evaluation of Measurement Uncertainty',
        documents: [
          { level: 2, code: 'QP-7.6-01', title: 'Procedure for Measurement Uncertainty Estimation (GUM)', revision: 'C', status: 'approved', owner: 'Quality Manager', nextReview: '2026-09', clause: '7.6' },
          { level: 3, code: 'QSF-7.6-01', title: 'Uncertainty Budget Template (Pmax at STC)', revision: 'B', status: 'approved', owner: 'Quality Manager', nextReview: '2026-09', clause: '7.6' },
          { level: 4, code: 'AX-7.6-01', title: 'Annex – Uncertainty Budgets (All Key Tests)', revision: 'D', status: 'approved', owner: 'Quality Manager', nextReview: '2026-06', clause: '7.6' },
        ]
      },
      {
        clause: '7.7', title: 'Ensuring Validity of Results (PT/ILC)',
        documents: [
          { level: 2, code: 'QP-7.7-01', title: 'Procedure for ILC/PT Program & In-house QC', revision: 'B', status: 'approved', owner: 'Quality Manager', nextReview: '2026-12', clause: '7.7' },
          { level: 3, code: 'QSF-7.7-01', title: 'PT/ILC Result Evaluation Form', revision: 'A', status: 'approved', owner: 'Quality Manager', nextReview: '2026-09', clause: '7.7' },
          { level: 3, code: 'QSF-7.7-02', title: 'Control Chart Template (Pmax Reference Cell)', revision: 'B', status: 'approved', owner: 'Quality Manager', nextReview: '2026-06', clause: '7.7' },
        ]
      },
      {
        clause: '7.8', title: 'Reporting of Results',
        documents: [
          { level: 2, code: 'QP-7.8-01', title: 'Procedure for Test Report Preparation & Review', revision: 'D', status: 'approved', owner: 'Lab Manager', nextReview: '2026-09', clause: '7.8' },
          { level: 3, code: 'QSF-7.8-01', title: 'Test Report Review Checklist', revision: 'C', status: 'approved', owner: 'Lab Manager', nextReview: '2026-06', clause: '7.8' },
          { level: 4, code: 'WI-7.8-01', title: 'Work Instruction – IEC 61215 Test Report Format', revision: 'B', status: 'approved', owner: 'Lab Manager', nextReview: '2026-09', clause: '7.8' },
          { level: 4, code: 'AX-7.8-01', title: 'Annex – Test Report Templates (All Standards)', revision: 'E', status: 'approved', owner: 'Lab Manager', nextReview: '2026-06', clause: '7.8' },
        ]
      },
      {
        clause: '7.9', title: 'Complaints',
        documents: [
          { level: 2, code: 'QP-7.9-01', title: 'Procedure for Handling Customer Complaints', revision: 'B', status: 'approved', owner: 'Quality Manager', nextReview: '2026-12', clause: '7.9' },
          { level: 3, code: 'QSF-7.9-01', title: 'Customer Complaint / Feedback Form', revision: 'A', status: 'approved', owner: 'Quality Manager', nextReview: '2026-06', clause: '7.9' },
        ]
      },
      {
        clause: '7.10', title: 'Nonconforming Work',
        documents: [
          { level: 2, code: 'QP-7.10-01', title: 'Procedure for Nonconforming Work Control', revision: 'C', status: 'approved', owner: 'Quality Manager', nextReview: '2026-12', clause: '7.10' },
          { level: 3, code: 'QSF-7.10-01', title: 'Nonconformance Report (NCR) Form', revision: 'B', status: 'approved', owner: 'Quality Manager', nextReview: '2026-06', clause: '7.10' },
          { level: 3, code: 'QSF-7.10-02', title: 'Work Suspension & Client Notification Record', revision: 'A', status: 'approved', owner: 'Lab Manager', nextReview: '2026-09', clause: '7.10' },
        ]
      },
      {
        clause: '7.11', title: 'Control of Data & Information Management',
        documents: [
          { level: 2, code: 'QP-7.11-01', title: 'Procedure for LIMS / Data Management System Control', revision: 'B', status: 'approved', owner: 'IT Manager', nextReview: '2026-12', clause: '7.11' },
          { level: 4, code: 'WI-7.11-01', title: 'Work Instruction – LIMS Data Entry Validation', revision: 'A', status: 'approved', owner: 'IT Manager', nextReview: '2027-01', clause: '7.11' },
        ]
      },
    ]
  },
  {
    clause: '8', title: 'Management System Requirements',
    icon: Settings,
    documents: [],
    children: [
      {
        clause: '8.1', title: 'Options (QMS Implementation)',
        documents: [
          { level: 1, code: 'QM-8.1', title: 'Quality Management System – Option A Statement', revision: 'B', status: 'approved', owner: 'Director', nextReview: '2026-12', clause: '8.1' },
        ]
      },
      {
        clause: '8.2', title: 'Management System Documentation',
        documents: [
          { level: 1, code: 'QM-8.2', title: 'Quality Manual (Master Document)', revision: 'F', status: 'approved', owner: 'Quality Manager', nextReview: '2026-12', clause: '8.2' },
          { level: 2, code: 'QP-8.2-01', title: 'Procedure for Document & Record Control', revision: 'D', status: 'approved', owner: 'Quality Manager', nextReview: '2026-06', clause: '8.2' },
          { level: 3, code: 'QSF-8.2-01', title: 'Master Document Register', revision: 'G', status: 'approved', owner: 'Quality Manager', nextReview: '2026-03', clause: '8.2' },
          { level: 3, code: 'QSF-8.2-02', title: 'Document Change Request Form', revision: 'B', status: 'approved', owner: 'Quality Manager', nextReview: '2026-06', clause: '8.2' },
        ]
      },
      {
        clause: '8.3', title: 'Control of Management System Documents',
        documents: [
          { level: 2, code: 'QP-8.3-01', title: 'Procedure for Controlled Document Distribution', revision: 'C', status: 'approved', owner: 'Quality Manager', nextReview: '2026-12', clause: '8.3' },
          { level: 3, code: 'QSF-8.3-01', title: 'Document Distribution Log', revision: 'A', status: 'approved', owner: 'Quality Manager', nextReview: '2026-09', clause: '8.3' },
        ]
      },
      {
        clause: '8.4', title: 'Control of Records',
        documents: [
          { level: 2, code: 'QP-8.4-01', title: 'Procedure for Record Management & Archiving', revision: 'B', status: 'approved', owner: 'Quality Manager', nextReview: '2026-12', clause: '8.4' },
          { level: 4, code: 'AX-8.4-01', title: 'Annex – Record Retention & Disposal Schedule', revision: 'B', status: 'approved', owner: 'Quality Manager', nextReview: '2027-01', clause: '8.4' },
        ]
      },
      {
        clause: '8.5', title: 'Actions to Address Risks & Opportunities',
        documents: [
          { level: 2, code: 'QP-8.5-01', title: 'Procedure for Risk Management & Opportunity Identification', revision: 'B', status: 'approved', owner: 'Quality Manager', nextReview: '2026-12', clause: '8.5' },
          { level: 3, code: 'QSF-8.5-01', title: 'Risk Register Template', revision: 'A', status: 'under_review', owner: 'Quality Manager', nextReview: '2026-06', clause: '8.5' },
        ]
      },
      {
        clause: '8.6', title: 'Improvement',
        documents: [
          { level: 2, code: 'QP-8.6-01', title: 'Procedure for Continual Improvement & QMS Review', revision: 'B', status: 'approved', owner: 'Quality Manager', nextReview: '2026-12', clause: '8.6' },
          { level: 3, code: 'QSF-8.6-01', title: 'Improvement Opportunity Log', revision: 'A', status: 'approved', owner: 'Quality Manager', nextReview: '2026-09', clause: '8.6' },
        ]
      },
      {
        clause: '8.7', title: 'Corrective Actions (CAPA)',
        documents: [
          { level: 2, code: 'QP-8.7-01', title: 'Procedure for Corrective & Preventive Actions (CAPA)', revision: 'C', status: 'approved', owner: 'Quality Manager', nextReview: '2026-09', clause: '8.7' },
          { level: 3, code: 'QSF-8.7-01', title: 'CAPA Form (Root Cause to Closure)', revision: 'C', status: 'approved', owner: 'Quality Manager', nextReview: '2026-06', clause: '8.7' },
          { level: 3, code: 'QSF-8.7-02', title: 'Root Cause Analysis (Ishikawa/5-Why) Template', revision: 'A', status: 'approved', owner: 'Quality Manager', nextReview: '2026-09', clause: '8.7' },
        ]
      },
      {
        clause: '8.8', title: 'Internal Audits',
        documents: [
          { level: 2, code: 'QP-8.8-01', title: 'Procedure for Internal Audit Planning & Execution', revision: 'C', status: 'approved', owner: 'Quality Manager', nextReview: '2026-09', clause: '8.8' },
          { level: 3, code: 'QSF-8.8-01', title: 'Annual Internal Audit Schedule', revision: 'B', status: 'approved', owner: 'Quality Manager', nextReview: '2026-01', clause: '8.8' },
          { level: 3, code: 'QSF-8.8-02', title: 'Internal Audit Checklist (ISO 17025 Clauses)', revision: 'C', status: 'approved', owner: 'Lead Auditor', nextReview: '2026-06', clause: '8.8' },
          { level: 3, code: 'QSF-8.8-03', title: 'Audit Findings & NC Report Form', revision: 'B', status: 'approved', owner: 'Lead Auditor', nextReview: '2026-06', clause: '8.8' },
          { level: 4, code: 'AX-8.8-01', title: 'Annex – Audit Finding Tracker', revision: 'A', status: 'approved', owner: 'Quality Manager', nextReview: '2026-06', clause: '8.8' },
        ]
      },
      {
        clause: '8.9', title: 'Management Reviews',
        documents: [
          { level: 2, code: 'QP-8.9-01', title: 'Procedure for Management Review', revision: 'B', status: 'approved', owner: 'Director', nextReview: '2026-12', clause: '8.9' },
          { level: 3, code: 'QSF-8.9-01', title: 'Management Review Meeting Agenda Template', revision: 'B', status: 'approved', owner: 'Quality Manager', nextReview: '2026-12', clause: '8.9' },
          { level: 3, code: 'QSF-8.9-02', title: 'Management Review Minutes & Action Items', revision: 'A', status: 'approved', owner: 'Quality Manager', nextReview: '2026-12', clause: '8.9' },
          { level: 4, code: 'AX-8.9-01', title: 'Annex – KPI Dashboard for Management Review', revision: 'B', status: 'approved', owner: 'Quality Manager', nextReview: '2026-06', clause: '8.9' },
        ]
      },
    ]
  },
]

export function flattenDocs(tree: ClauseNode[]): DocLevel[] {
  const docs: DocLevel[] = []
  function walk(nodes: ClauseNode[]) {
    nodes.forEach(n => {
      n.documents.forEach(d => docs.push(d))
      if (n.children) walk(n.children)
    })
  }
  walk(tree)
  return docs
}

export const ALL_DOCS = flattenDocs(ISO17025_TREE)
