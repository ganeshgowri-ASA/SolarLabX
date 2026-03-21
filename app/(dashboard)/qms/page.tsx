// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getStatusColor } from '@/lib/utils'
import type { QMSDocument, CAPA } from '@/lib/types'
import { mockComplianceRequirements } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  ChevronRight, ChevronDown, FileText, BookOpen, ClipboardList, Layers,
  CheckCircle2, AlertTriangle, Clock, Search, Plus, Download, Eye,
  BarChart3, Shield, Settings, Users, Microscope, FileCheck, Activity,
  GitBranch, Briefcase
} from 'lucide-react'
import { CAPATrackingDashboard, DocumentRevisionHistory, ManagementReviewDashboard } from '@/components/qms/QMSEnhancements'
import ExternalDocumentsTab from '@/components/qms/ExternalDocumentsTab'

// ─── ISO 17025 Document Hierarchy ─────────────────────────────────────────────

interface DocLevel {
  level: 1 | 2 | 3 | 4
  code: string
  title: string
  revision: string
  status: 'approved' | 'draft' | 'under_review' | 'obsolete'
  owner: string
  nextReview: string
  clause: string
}

const LEVEL_LABELS = {
  1: { label: 'Level 1 – Quality Manual (QM)', short: 'QM', color: 'bg-blue-600', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  2: { label: 'Level 2 – Quality Procedures (QP)', short: 'QP', color: 'bg-purple-600', light: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  3: { label: 'Level 3 – Quality System Forms (QSF)', short: 'QSF', color: 'bg-green-600', light: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  4: { label: 'Level 4 – Annexures / Work Instructions / Templates', short: 'WI/AX', color: 'bg-amber-600', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
}

// ISO 17025:2017 Clause tree with documents at each level
interface ClauseNode {
  clause: string
  title: string
  icon?: any
  documents: DocLevel[]
  children?: ClauseNode[]
}

const ISO17025_TREE: ClauseNode[] = [
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

// Flatten all documents
function flattenDocs(tree: ClauseNode[]): DocLevel[] {
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
const ALL_DOCS = flattenDocs(ISO17025_TREE)

const docStatusColors = {
  approved: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
  under_review: 'bg-blue-100 text-blue-700',
  obsolete: 'bg-red-100 text-red-500',
}

// ─── Tree Node Component ──────────────────────────────────────────────────────

function ClauseTreeNode({ node, depth = 0, selectedDoc, onSelectDoc }: {
  node: ClauseNode
  depth?: number
  selectedDoc: DocLevel | null
  onSelectDoc: (doc: DocLevel) => void
}) {
  const [open, setOpen] = useState(depth < 1)
  const allDocs = node.documents
  const hasChildren = node.children && node.children.length > 0

  return (
    <div className={`${depth > 0 ? 'ml-4 border-l border-border' : ''}`}>
      <button
        className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/50 rounded transition-colors ${depth === 0 ? 'font-semibold text-sm' : 'text-xs'}`}
        onClick={() => setOpen(!open)}
      >
        {(hasChildren || allDocs.length > 0) ? (
          open ? <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
        ) : <span className="w-3" />}
        <span className="font-mono text-muted-foreground w-10 shrink-0">{node.clause}</span>
        <span className="flex-1">{node.title}</span>
        {allDocs.length > 0 && (
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{allDocs.length}</span>
        )}
      </button>

      {open && (
        <div className={depth === 0 ? 'ml-2' : ''}>
          {/* Documents at this node */}
          {allDocs.map(doc => {
            const lvl = LEVEL_LABELS[doc.level]
            return (
              <button
                key={doc.code}
                className={`w-full flex items-center gap-2 px-3 py-1.5 ml-4 text-left hover:bg-muted/50 rounded text-xs transition-colors ${selectedDoc?.code === doc.code ? 'bg-primary/10 ring-1 ring-primary/30' : ''}`}
                onClick={() => onSelectDoc(doc)}
              >
                <FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
                <span className={`shrink-0 text-xs font-bold px-1 rounded ${lvl.light} ${lvl.text}`}>{lvl.short}</span>
                <span className="font-mono text-muted-foreground">{doc.code}</span>
                <span className="flex-1 truncate">{doc.title}</span>
                <span className={`text-xs px-1 rounded ${docStatusColors[doc.status]}`}>{doc.status.replace(/_/g, ' ')}</span>
              </button>
            )
          })}
          {/* Children */}
          {hasChildren && node.children!.map(child => (
            <ClauseTreeNode key={child.clause} node={child} depth={depth + 1} selectedDoc={selectedDoc} onSelectDoc={onSelectDoc} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QMSDashboard() {
  const [docStats, setDocStats] = useState({ total: 0, approved: 0, inReview: 0, draft: 0, procedures: 0, workInstructions: 0, forms: 0 })
  const [capaStats, setCapaStats] = useState({ total: 0, open: 0, corrective: 0, preventive: 0, overdue: 0 })
  const [recentDocs, setRecentDocs] = useState<QMSDocument[]>([])
  const [openCAPAs, setOpenCAPAs] = useState<CAPA[]>([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedDoc, setSelectedDoc] = useState<DocLevel | null>(null)
  const [docSearch, setDocSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all')

  const complianceScore = Math.round(
    (mockComplianceRequirements.filter(r => r.status === 'compliant').length / mockComplianceRequirements.length) * 100
  )

  useEffect(() => {
    fetch('/api/qms/documents').then(r => r.json()).then(d => { setDocStats(d.stats); setRecentDocs(d.documents.slice(0, 5)) })
    fetch('/api/qms/capa').then(r => r.json()).then(d => { setCapaStats(d.stats); setOpenCAPAs(d.capas.filter((c: CAPA) => !['closed', 'verified'].includes(c.status))) })
  }, [])

  const filteredDocs = ALL_DOCS.filter(d => {
    if (levelFilter !== 'all' && d.level !== levelFilter) return false
    if (docSearch && !d.title.toLowerCase().includes(docSearch.toLowerCase()) &&
        !d.code.toLowerCase().includes(docSearch.toLowerCase())) return false
    return true
  })

  const docCountsByLevel = {
    1: ALL_DOCS.filter(d => d.level === 1).length,
    2: ALL_DOCS.filter(d => d.level === 2).length,
    3: ALL_DOCS.filter(d => d.level === 3).length,
    4: ALL_DOCS.filter(d => d.level === 4).length,
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">QMS Dashboard</h1>
          <p className="text-sm text-muted-foreground">Quality Management System – ISO 17025:2017 / NABL Compliance</p>
        </div>
        <div className="flex gap-2">
          <Link href="/qms/documents">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              All Documents
            </Button>
          </Link>
          <Link href="/qms/capa">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New CAPA
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">ISO 17025 Compliance</div>
            <div className={`text-3xl font-bold ${complianceScore >= 90 ? 'text-green-600' : complianceScore >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
              {complianceScore}%
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
              <div className={`h-1.5 rounded-full ${complianceScore >= 90 ? 'bg-green-500' : complianceScore >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${complianceScore}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">QMS Documents</div>
            <div className="text-2xl font-bold">{ALL_DOCS.length}</div>
            <div className="text-xs text-green-600">{ALL_DOCS.filter(d => d.status === 'approved').length} approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Open CAPAs</div>
            <div className="text-2xl font-bold text-amber-600">{capaStats.open}</div>
            {capaStats.overdue > 0 && <div className="text-xs text-red-600">{capaStats.overdue} overdue</div>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Under Review</div>
            <div className="text-2xl font-bold text-blue-600">{ALL_DOCS.filter(d => d.status === 'under_review').length}</div>
            <div className="text-xs text-muted-foreground">documents pending</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto flex-wrap bg-muted">
          <TabsTrigger value="dashboard" className="text-xs">
            <BarChart3 className="h-3 w-3 mr-1" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="hierarchy" className="text-xs">
            <Layers className="h-3 w-3 mr-1" /> Document Hierarchy
          </TabsTrigger>
          <TabsTrigger value="clauses" className="text-xs">
            <Shield className="h-3 w-3 mr-1" /> ISO 17025 Clauses
          </TabsTrigger>
          <TabsTrigger value="capa" className="text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" /> CAPA
          </TabsTrigger>
          <TabsTrigger value="capa-tracking" className="text-xs">
            <Activity className="h-3 w-3 mr-1" /> CAPA Tracking
          </TabsTrigger>
          <TabsTrigger value="doc-revisions" className="text-xs">
            <GitBranch className="h-3 w-3 mr-1" /> Revision History
          </TabsTrigger>
          <TabsTrigger value="mgmt-review" className="text-xs">
            <Briefcase className="h-3 w-3 mr-1" /> Management Review
          </TabsTrigger>
          <TabsTrigger value="external-docs" className="text-xs">
            <BookOpen className="h-3 w-3 mr-1" /> External Documents
          </TabsTrigger>
        </TabsList>

        {/* ── DASHBOARD TAB ──────────────────────────────────────── */}
        <TabsContent value="dashboard" className="space-y-4 mt-4">
          {/* Document Level Distribution */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {([1, 2, 3, 4] as const).map(level => {
              const lvl = LEVEL_LABELS[level]
              return (
                <Card key={level} className={`border-l-4 border-l-${level === 1 ? 'blue' : level === 2 ? 'purple' : level === 3 ? 'green' : 'amber'}-500`}>
                  <CardContent className="pt-4 pb-3">
                    <div className={`text-xs font-bold mb-1 ${lvl.text}`}>{lvl.short}</div>
                    <div className="text-2xl font-bold">{docCountsByLevel[level]}</div>
                    <div className="text-xs text-muted-foreground leading-tight">{lvl.label.split(' – ')[1]}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  Recent Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentDocs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                      <div>
                        <div className="text-sm font-medium">{doc.documentNumber}</div>
                        <div className="text-xs text-muted-foreground">{doc.title}</div>
                        <div className="text-xs text-muted-foreground">v{doc.version} · {doc.author}</div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(doc.status)}`}>
                        {doc.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
                <Link href="/qms/documents" className="text-xs text-primary hover:underline block mt-3">View all documents →</Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Open CAPAs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {openCAPAs.map(capa => (
                    <Link key={capa.id} href={`/qms/capa/${capa.id}`}>
                      <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer">
                        <div>
                          <div className="text-sm font-medium">{capa.capaNumber}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{capa.title}</div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(capa.type === 'corrective' ? 'destructive' : 'pending')}`}>
                          {capa.type}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/qms/capa" className="text-xs text-primary hover:underline block mt-3">View all CAPAs →</Link>
              </CardContent>
            </Card>
          </div>

          {/* Quick Nav */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { href: '/qms/documents', title: 'Document Control', desc: 'SOPs, Procedures, Forms', icon: FileText },
                  { href: '/qms/capa', title: 'CAPA Management', desc: 'Corrective & Preventive Actions', icon: AlertTriangle },
                  { href: '/qms/compliance', title: 'Compliance Matrix', desc: 'ISO 17025 / NABL Gap Analysis', icon: CheckCircle2 },
                ].map(({ href, title, desc, icon: Icon }) => (
                  <Link key={href} href={href} className="p-3 border rounded hover:bg-muted/50 flex gap-3 items-start transition-colors">
                    <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-medium">{title}</div>
                      <div className="text-xs text-muted-foreground">{desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── DOCUMENT HIERARCHY TAB ───────────────────────────────── */}
        <TabsContent value="hierarchy" className="space-y-4 mt-4">
          {/* Level Legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {([1, 2, 3, 4] as const).map(level => {
              const lvl = LEVEL_LABELS[level]
              return (
                <button key={level}
                  onClick={() => setLevelFilter(levelFilter === level ? 'all' : level)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${levelFilter === level ? `${lvl.light} ${lvl.border}` : 'border-border hover:bg-muted/50'}`}>
                  <div className={`text-xs font-bold ${lvl.text}`}>{lvl.short}</div>
                  <div className={`text-lg font-bold ${levelFilter === level ? lvl.text : 'text-foreground'}`}>{docCountsByLevel[level]}</div>
                  <div className="text-xs text-muted-foreground leading-tight">{lvl.label.split(' – ')[1]}</div>
                </button>
              )
            })}
          </div>

          {/* Search */}
          <div className="flex gap-2 items-center">
            <div className="relative flex-1 max-w-xs">
              <Search className="h-3 w-3 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input placeholder="Search documents..." className="pl-8 h-8 text-xs"
                     value={docSearch} onChange={e => setDocSearch(e.target.value)} />
            </div>
            {levelFilter !== 'all' && (
              <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setLevelFilter('all')}>
                Clear filter
              </Button>
            )}
            <span className="text-xs text-muted-foreground ml-auto">{filteredDocs.length} documents</span>
          </div>

          {/* Document Table */}
          <Card>
            <div className="divide-y">
              <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/50">
                <div className="col-span-1">Level</div>
                <div className="col-span-2">Code</div>
                <div className="col-span-4">Title</div>
                <div className="col-span-1">Rev</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2">Owner</div>
                <div className="col-span-1">Next Review</div>
              </div>
              {filteredDocs.map(doc => {
                const lvl = LEVEL_LABELS[doc.level]
                return (
                  <button
                    key={doc.code}
                    className={`w-full grid grid-cols-12 gap-2 px-4 py-2 text-xs text-left hover:bg-muted/50 transition-colors ${selectedDoc?.code === doc.code ? 'bg-primary/5' : ''}`}
                    onClick={() => setSelectedDoc(selectedDoc?.code === doc.code ? null : doc)}
                  >
                    <div className="col-span-1">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${lvl.light} ${lvl.text}`}>{lvl.short}</span>
                    </div>
                    <div className="col-span-2 font-mono text-muted-foreground">{doc.code}</div>
                    <div className="col-span-4 font-medium truncate">{doc.title}</div>
                    <div className="col-span-1 font-mono text-center">{doc.revision}</div>
                    <div className="col-span-1">
                      <span className={`text-xs px-1 rounded ${docStatusColors[doc.status]}`}>{doc.status.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="col-span-2 text-muted-foreground truncate">{doc.owner}</div>
                    <div className="col-span-1 text-muted-foreground">{doc.nextReview}</div>
                  </button>
                )
              })}
            </div>
          </Card>

          {/* Document Viewer */}
          {selectedDoc && (
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${LEVEL_LABELS[selectedDoc.level].light} ${LEVEL_LABELS[selectedDoc.level].text}`}>
                        {LEVEL_LABELS[selectedDoc.level].short}
                      </span>
                      <span className="text-sm font-mono text-muted-foreground">{selectedDoc.code}</span>
                      <span className="text-xs text-muted-foreground">Rev {selectedDoc.revision}</span>
                    </div>
                    <CardTitle className="text-base">{selectedDoc.title}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 text-xs">
                      <Eye className="h-3 w-3 mr-1" /> View
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs">
                      <Download className="h-3 w-3 mr-1" /> Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Document Level</div>
                    <div className="font-medium">{LEVEL_LABELS[selectedDoc.level].label}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Status</div>
                    <Badge className={docStatusColors[selectedDoc.status]}>{selectedDoc.status.replace(/_/g, ' ')}</Badge>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Owner</div>
                    <div className="font-medium">{selectedDoc.owner}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">ISO 17025 Clause</div>
                    <div className="font-medium font-mono">{selectedDoc.clause}</div>
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  <p className="italic">Document content preview would appear here. Click &ldquo;View&rdquo; to open the full document in the document editor.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── ISO 17025 CLAUSES TAB ────────────────────────────────── */}
        <TabsContent value="clauses" className="space-y-4 mt-4">
          <div className="text-sm text-muted-foreground mb-3">
            ISO 17025:2017 clause tree — click any clause to expand and view linked documents
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Tree */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-2">
                  {ISO17025_TREE.map(node => (
                    <ClauseTreeNode key={node.clause} node={node} depth={0} selectedDoc={selectedDoc} onSelectDoc={setSelectedDoc} />
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Document Detail Panel */}
            <div className="lg:col-span-1">
              {selectedDoc ? (
                <Card className="sticky top-4">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${LEVEL_LABELS[selectedDoc.level].light} ${LEVEL_LABELS[selectedDoc.level].text}`}>
                        {LEVEL_LABELS[selectedDoc.level].short}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">{selectedDoc.code}</span>
                    </div>
                    <CardTitle className="text-sm leading-tight">{selectedDoc.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground">Revision</div>
                        <div className="font-mono font-bold">{selectedDoc.revision}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Status</div>
                        <Badge className={`text-xs ${docStatusColors[selectedDoc.status]}`}>{selectedDoc.status.replace(/_/g, ' ')}</Badge>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Owner</div>
                        <div className="font-medium">{selectedDoc.owner}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Next Review</div>
                        <div className="font-medium">{selectedDoc.nextReview}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">Clause: <span className="font-mono font-bold text-foreground">{selectedDoc.clause}</span></div>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" className="flex-1 h-8 text-xs">
                        <Eye className="h-3 w-3 mr-1" /> View / Edit
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs">
                        <Download className="h-3 w-3 mr-1" /> PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="flex items-center justify-center p-8 text-center min-h-48">
                  <div>
                    <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Select a document from the tree to view details</p>
                  </div>
                </Card>
              )}

              {/* Clause Coverage Summary */}
              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Clause Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  {ISO17025_TREE.map(section => {
                    const sectionDocs = flattenDocs([section])
                    const approved = sectionDocs.filter(d => d.status === 'approved').length
                    const pct = sectionDocs.length > 0 ? Math.round((approved / sectionDocs.length) * 100) : 0
                    return (
                      <div key={section.clause} className="mb-2">
                        <div className="flex items-center justify-between text-xs mb-0.5">
                          <span className="font-mono text-muted-foreground w-6">{section.clause}</span>
                          <span className="flex-1 truncate">{section.title}</span>
                          <span className={`font-bold ${pct === 100 ? 'text-green-600' : pct >= 80 ? 'text-amber-600' : 'text-red-600'}`}>{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full">
                          <div className={`h-1.5 rounded-full ${pct === 100 ? 'bg-green-500' : pct >= 80 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── CAPA TAB ─────────────────────────────────────────────── */}
        <TabsContent value="capa" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total CAPAs', value: capaStats.total, color: 'text-gray-700' },
              { label: 'Open', value: capaStats.open, color: 'text-amber-600' },
              { label: 'Corrective', value: capaStats.corrective, color: 'text-red-600' },
              { label: 'Overdue', value: capaStats.overdue, color: 'text-red-700' },
            ].map(({ label, value, color }) => (
              <Card key={label}>
                <CardContent className="pt-4 pb-3 text-center">
                  <div className={`text-2xl font-bold ${color}`}>{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-2">
            {openCAPAs.map(capa => (
              <Link key={capa.id} href={`/qms/capa/${capa.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold">{capa.capaNumber}</div>
                        <div className="text-xs text-muted-foreground">{capa.title}</div>
                        <div className="text-xs text-muted-foreground">Assigned: {capa.assignedTo}</div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(capa.type === 'corrective' ? 'destructive' : 'pending')}`}>{capa.type}</span>
                        <span className={`text-xs ${getStatusColor(capa.priority)}`}>{capa.priority}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <Link href="/qms/capa">
            <Button variant="outline" className="w-full text-xs">View All CAPAs</Button>
          </Link>
        </TabsContent>

        {/* ── CAPA TRACKING DASHBOARD TAB ─────────────────────────── */}
        <TabsContent value="capa-tracking" className="space-y-4 mt-4">
          <CAPATrackingDashboard />
        </TabsContent>

        {/* ── DOCUMENT REVISION HISTORY TAB ───────────────────────── */}
        <TabsContent value="doc-revisions" className="space-y-4 mt-4">
          <DocumentRevisionHistory />
        </TabsContent>

        {/* ── MANAGEMENT REVIEW DASHBOARD TAB ─────────────────────── */}
        <TabsContent value="mgmt-review" className="space-y-4 mt-4">
          <ManagementReviewDashboard />
        </TabsContent>

        {/* ── EXTERNAL DOCUMENTS TAB (ISO 17025 Clause 8.3) ────────── */}
        <TabsContent value="external-docs" className="space-y-4 mt-4">
          <ExternalDocumentsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
