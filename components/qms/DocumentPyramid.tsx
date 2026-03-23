// @ts-nocheck
'use client'

import { useState } from 'react'
import {
  BookOpen,
  FileText,
  ClipboardList,
  FileSpreadsheet,
  Archive,
  ChevronDown,
  ChevronUp,
  Shield,
  CheckCircle2,
  X,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

interface PyramidDocument {
  id: string
  title: string
  description: string
  status: 'Active' | 'Under Review' | 'Draft' | 'Archived'
  lastRevised?: string
}

interface PyramidLevel {
  level: number
  label: string
  tag: string
  color: string          // tailwind bg class for the trapezoid
  hoverColor: string     // tailwind bg class on hover
  textColor: string      // text colour inside the trapezoid
  borderColor: string    // ring / accent
  gradient: string       // gradient for the expanded card header
  icon: React.ElementType
  documents: PyramidDocument[]
  widthPercent: number   // width of this tier (top = narrow, bottom = wide)
}

const LEVELS: PyramidLevel[] = [
  {
    level: 1,
    label: 'QUALITY MANUAL & ANNEXURES',
    tag: 'L1',
    color: 'bg-red-800',
    hoverColor: 'hover:bg-red-700',
    textColor: 'text-white',
    borderColor: 'border-red-600',
    gradient: 'from-red-800 to-red-600',
    icon: Shield,
    widthPercent: 30,
    documents: [
      {
        id: 'QM-001',
        title: 'QM-001: Quality Manual as per ISO/IEC 17025:2017',
        description:
          'Master quality manual covering the management system requirements, technical requirements, and structural requirements for laboratory competence.',
        status: 'Active',
        lastRevised: '2026-01-15',
      },
      {
        id: 'QM-AX-01',
        title: 'Annexure A: Scope of Accreditation',
        description:
          'Detailed scope covering IEC 61215, IEC 61730, IEC 61853, and IEC 60904 series testing for crystalline silicon PV modules.',
        status: 'Active',
        lastRevised: '2026-01-15',
      },
      {
        id: 'QM-AX-02',
        title: 'Annexure B: Organization Chart',
        description:
          'Organizational hierarchy showing Quality Manager, Lab Manager, Technical Manager, and key personnel with defined authorities.',
        status: 'Active',
        lastRevised: '2025-11-20',
      },
      {
        id: 'QM-AX-03',
        title: 'Annexure C: Quality Policy & Objectives',
        description:
          'Signed quality policy statement with measurable quality objectives aligned to ISO/IEC 17025:2017 requirements.',
        status: 'Active',
        lastRevised: '2025-12-01',
      },
      {
        id: 'QM-AX-04',
        title: 'Annexure D: Cross-Reference Matrix (ISO 17025 Clauses)',
        description:
          'Clause-by-clause mapping of ISO/IEC 17025:2017 requirements to corresponding quality procedures and SOPs.',
        status: 'Under Review',
        lastRevised: '2026-02-10',
      },
    ],
  },
  {
    level: 2,
    label: 'QUALITY PROCEDURES',
    tag: 'L2',
    color: 'bg-orange-600',
    hoverColor: 'hover:bg-orange-500',
    textColor: 'text-white',
    borderColor: 'border-orange-400',
    gradient: 'from-orange-600 to-orange-400',
    icon: BookOpen,
    widthPercent: 48,
    documents: [
      {
        id: 'QP-4.1',
        title: 'QP-4.1: Impartiality',
        description:
          'Procedure to identify, eliminate, or minimize risks to impartiality in laboratory activities including testing, calibration and sampling.',
        status: 'Active',
        lastRevised: '2025-09-12',
      },
      {
        id: 'QP-4.2',
        title: 'QP-4.2: Confidentiality',
        description:
          'Procedure for protection of confidential information including proprietary rights, client data, test results, and electronic records.',
        status: 'Active',
        lastRevised: '2025-10-01',
      },
      {
        id: 'QP-7.1',
        title: 'QP-7.1: Request, Tender and Contract Review',
        description:
          'Procedure for reviewing client requests for PV module testing, including method selection, capability assessment, and sub-contracting.',
        status: 'Active',
        lastRevised: '2025-11-05',
      },
      {
        id: 'QP-7.2',
        title: 'QP-7.2: Selection, Verification and Validation of Methods',
        description:
          'Procedure for selecting appropriate IEC/ISO test methods, verifying standard methods, and validating non-standard methods.',
        status: 'Active',
        lastRevised: '2026-01-20',
      },
      {
        id: 'QP-7.4',
        title: 'QP-7.4: Handling of Test Items',
        description:
          'Procedure for receipt, identification, transport, storage, protection, and disposal of PV modules and test specimens.',
        status: 'Active',
        lastRevised: '2025-08-18',
      },
      {
        id: 'QP-7.6',
        title: 'QP-7.6: Evaluation of Measurement Uncertainty',
        description:
          'Procedure for evaluating measurement uncertainty using GUM methodology for all PV testing parameters (Pmax, Isc, Voc, FF).',
        status: 'Under Review',
        lastRevised: '2026-02-28',
      },
      {
        id: 'QP-7.7',
        title: 'QP-7.7: Ensuring Validity of Results',
        description:
          'Procedure for QC monitoring including reference module checks, ILC/PT participation, and statistical trend analysis of control charts.',
        status: 'Active',
        lastRevised: '2025-12-10',
      },
      {
        id: 'QP-8.5',
        title: 'QP-8.5: Actions to Address Risks and Opportunities',
        description:
          'Procedure for risk-based thinking, risk assessment, and planning actions to address risks and opportunities in laboratory operations.',
        status: 'Active',
        lastRevised: '2025-07-22',
      },
      {
        id: 'QP-8.7',
        title: 'QP-8.7: Corrective Actions (CAPA)',
        description:
          'Procedure for root cause analysis, corrective action implementation, effectiveness verification, and preventive action for nonconformities.',
        status: 'Active',
        lastRevised: '2025-11-30',
      },
    ],
  },
  {
    level: 3,
    label: 'SOPs & WORK INSTRUCTIONS',
    tag: 'L3',
    color: 'bg-yellow-500',
    hoverColor: 'hover:bg-yellow-400',
    textColor: 'text-gray-900',
    borderColor: 'border-yellow-400',
    gradient: 'from-yellow-500 to-yellow-300',
    icon: ClipboardList,
    widthPercent: 66,
    documents: [
      {
        id: 'SOP-001',
        title: 'SOP-001: IV Curve Measurement (IEC 60904-1)',
        description:
          'Step-by-step procedure for measuring current-voltage characteristics of PV devices under STC using Class A+A+A+ solar simulator.',
        status: 'Active',
        lastRevised: '2026-01-10',
      },
      {
        id: 'SOP-002',
        title: 'SOP-002: Thermal Cycling Test (IEC 61215 MQT 11)',
        description:
          'Procedure for conducting 200/400 thermal cycles from -40\u00b0C to +85\u00b0C with current injection and intermediate visual inspections.',
        status: 'Active',
        lastRevised: '2025-12-05',
      },
      {
        id: 'SOP-003',
        title: 'SOP-003: Damp Heat Test (IEC 61215 MQT 13)',
        description:
          'Procedure for 1000-hour damp heat exposure at 85\u00b0C/85% RH with pre/post electrical characterization and visual inspection.',
        status: 'Active',
        lastRevised: '2025-11-18',
      },
      {
        id: 'SOP-004',
        title: 'SOP-004: Electroluminescence (EL) Imaging',
        description:
          'Procedure for forward-bias EL imaging of PV modules/cells for detection of microcracks, inactive areas, and cell defects.',
        status: 'Active',
        lastRevised: '2026-02-01',
      },
      {
        id: 'WI-001',
        title: 'WI-001: EL Imaging Camera Setup & Calibration',
        description:
          'Work instruction for InGaAs camera alignment, exposure settings, dark-frame correction, and image quality verification for EL imaging.',
        status: 'Active',
        lastRevised: '2025-10-25',
      },
      {
        id: 'WI-002',
        title: 'WI-002: Solar Simulator Lamp Replacement',
        description:
          'Work instruction for xenon lamp replacement, spectral filter alignment, warm-up protocol, and post-replacement classification verification.',
        status: 'Active',
        lastRevised: '2025-09-30',
      },
      {
        id: 'WI-003',
        title: 'WI-003: Insulation Resistance Test Setup',
        description:
          'Work instruction for high-voltage insulation resistance measurement per IEC 61730-2 including safety interlocks and leakage current limits.',
        status: 'Draft',
        lastRevised: '2026-03-05',
      },
    ],
  },
  {
    level: 4,
    label: 'FORMATS & TEMPLATES',
    tag: 'L4',
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-500',
    textColor: 'text-white',
    borderColor: 'border-blue-400',
    gradient: 'from-blue-600 to-blue-400',
    icon: FileSpreadsheet,
    widthPercent: 82,
    documents: [
      {
        id: 'QSF-7.2-01',
        title: 'QSF-7.2-01: Test Report Format (IEC 61215/61730)',
        description:
          'Standardized test report template with all required fields per ISO/IEC 17025 Clause 7.8 including uncertainty statements and compliance declarations.',
        status: 'Active',
        lastRevised: '2026-01-25',
      },
      {
        id: 'QSF-8.7-01',
        title: 'QSF-8.7-01: CAPA Form',
        description:
          'Corrective and Preventive Action form with sections for NC description, root cause analysis (5-Why/Fishbone), action plan, and effectiveness review.',
        status: 'Active',
        lastRevised: '2025-12-15',
      },
      {
        id: 'QSF-6.4-01',
        title: 'QSF-6.4-01: Equipment Calibration Record',
        description:
          'Equipment calibration record template with fields for instrument ID, calibration method, reference standards, results, and uncertainty.',
        status: 'Active',
        lastRevised: '2025-11-08',
      },
      {
        id: 'QSF-7.4-01',
        title: 'QSF-7.4-01: Sample Receipt & Chain of Custody',
        description:
          'Form for recording sample receipt, condition assessment, unique identification assignment, and chain of custody log.',
        status: 'Active',
        lastRevised: '2025-10-20',
      },
      {
        id: 'QSF-6.2-01',
        title: 'QSF-6.2-01: Training Record & Competency Matrix',
        description:
          'Personnel training record and competency assessment form covering authorization for specific test methods and equipment.',
        status: 'Under Review',
        lastRevised: '2026-02-20',
      },
      {
        id: 'QSF-7.7-01',
        title: 'QSF-7.7-01: QC Chart / Control Chart Template',
        description:
          'Statistical process control chart template for monitoring reference module measurements with UCL/LCL calculation.',
        status: 'Active',
        lastRevised: '2025-09-15',
      },
    ],
  },
  {
    level: 5,
    label: 'RECORDS & EVIDENCE',
    tag: 'L5',
    color: 'bg-emerald-600',
    hoverColor: 'hover:bg-emerald-500',
    textColor: 'text-white',
    borderColor: 'border-emerald-400',
    gradient: 'from-emerald-600 to-emerald-400',
    icon: Archive,
    widthPercent: 100,
    documents: [
      {
        id: 'REC-TR-2026',
        title: 'Completed Test Reports (IEC 61215 / 61730 / 61853)',
        description:
          'Archive of all issued test reports with unique report numbers, authorized signatures, and amendment history for the current accreditation cycle.',
        status: 'Active',
        lastRevised: '2026-03-20',
      },
      {
        id: 'REC-CAL-2026',
        title: 'Calibration Certificates & Traceability Records',
        description:
          'Calibration certificates from NABL-accredited labs for reference cells, DMMs, temperature sensors, pyranometers, and spectroradiometers.',
        status: 'Active',
        lastRevised: '2026-03-01',
      },
      {
        id: 'REC-TRN-2026',
        title: 'Training Records & Authorization Logs',
        description:
          'Personnel training attendance, competency assessment results, and method-specific authorization records for all laboratory staff.',
        status: 'Active',
        lastRevised: '2026-02-15',
      },
      {
        id: 'REC-PT-2026',
        title: 'Proficiency Testing & ILC Results',
        description:
          'Results and analysis from inter-laboratory comparison programs and proficiency testing schemes (e.g., IECEE PVTL PT rounds).',
        status: 'Active',
        lastRevised: '2025-12-20',
      },
      {
        id: 'REC-QC-2026',
        title: 'QC Monitoring Data & Control Charts',
        description:
          'Daily reference module measurement logs, Shewhart control charts, trend analysis, and out-of-control action records.',
        status: 'Active',
        lastRevised: '2026-03-22',
      },
      {
        id: 'REC-NC-2026',
        title: 'Nonconformity & CAPA Closure Records',
        description:
          'Closed CAPA records with root cause evidence, implemented corrections, and effectiveness verification documentation.',
        status: 'Active',
        lastRevised: '2026-01-30',
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  STATUS BADGE                                                       */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: 'bg-green-100 text-green-800 border-green-300',
    'Under Review': 'bg-amber-100 text-amber-800 border-amber-300',
    Draft: 'bg-gray-100 text-gray-600 border-gray-300',
    Archived: 'bg-slate-100 text-slate-500 border-slate-300',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[status] ?? map.Draft}`}
    >
      {status === 'Active' && <CheckCircle2 className="h-3 w-3" />}
      {status}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function DocumentPyramid() {
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null)

  const toggleLevel = (level: number) => {
    setExpandedLevel((prev) => (prev === level ? null : level))
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* ---- Header ---- */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          Document Hierarchy Pyramid
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          ISO/IEC 17025:2017 &mdash; 5-Level Quality Documentation Structure
        </p>
      </div>

      {/* ---- Pyramid ---- */}
      <div className="flex flex-col items-center gap-0 mb-2">
        {LEVELS.map((lvl) => {
          const isExpanded = expandedLevel === lvl.level
          const Icon = lvl.icon

          return (
            <button
              key={lvl.level}
              onClick={() => toggleLevel(lvl.level)}
              className={`
                group relative transition-all duration-300 ease-in-out
                focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                focus-visible:ring-blue-500
              `}
              style={{
                width: `${lvl.widthPercent}%`,
                /* Each tier is a trapezoid: wider bottom, narrower top */
                clipPath:
                  lvl.level === 1
                    ? 'polygon(25% 0%, 75% 0%, 85% 100%, 15% 100%)'
                    : lvl.level === LEVELS.length
                      ? 'polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)'
                      : 'polygon(8% 0%, 92% 0%, 96% 100%, 4% 100%)',
              }}
              aria-expanded={isExpanded}
              aria-label={`Level ${lvl.level}: ${lvl.label}. ${lvl.documents.length} documents. Click to ${isExpanded ? 'collapse' : 'expand'}.`}
            >
              {/* Trapezoid body */}
              <div
                className={`
                  ${lvl.color} ${lvl.hoverColor} ${lvl.textColor}
                  flex items-center justify-center gap-2
                  transition-colors duration-200
                  ${lvl.level === 1 ? 'py-5' : 'py-4'}
                  select-none cursor-pointer
                `}
              >
                {/* Tag */}
                <span className="text-[10px] sm:text-xs font-black tracking-wider opacity-70 hidden sm:inline">
                  {lvl.tag}
                </span>

                <Icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />

                <span className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wide truncate max-w-[60%]">
                  {lvl.label}
                </span>

                {/* Count pill */}
                <span className="hidden sm:inline-flex items-center justify-center rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
                  {lvl.documents.length}
                </span>

                {/* Expand indicator */}
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                )}
              </div>

              {/* Shimmer highlight on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </button>
          )
        })}
      </div>

      {/* ---- Expanded Detail Panel ---- */}
      <div
        className={`
          mt-4 transition-all duration-500 ease-in-out origin-top
          ${expandedLevel !== null ? 'max-h-[2000px] opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-95 overflow-hidden'}
        `}
      >
        {expandedLevel !== null && (() => {
          const lvl = LEVELS.find((l) => l.level === expandedLevel)!
          const Icon = lvl.icon

          return (
            <div className={`rounded-xl border ${lvl.borderColor} shadow-lg overflow-hidden bg-white dark:bg-gray-900`}>
              {/* Card header */}
              <div
                className={`bg-gradient-to-r ${lvl.gradient} px-6 py-4 flex items-center justify-between`}
              >
                <div className="flex items-center gap-3 text-white">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black tracking-widest opacity-80">
                        {lvl.tag}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold">
                        {lvl.label}
                      </h3>
                    </div>
                    <p className="text-xs opacity-80">
                      {lvl.documents.length} document{lvl.documents.length > 1 ? 's' : ''} in this tier
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpandedLevel(null)
                  }}
                  className="rounded-full p-1.5 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                  aria-label="Close panel"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Document cards */}
              <div className="p-4 sm:p-6 grid gap-3 sm:grid-cols-2">
                {lvl.documents.map((doc, idx) => (
                  <div
                    key={doc.id}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200 bg-gray-50 dark:bg-gray-800/50"
                    style={{
                      animationName: 'fadeSlideIn',
                      animationDuration: '400ms',
                      animationTimingFunction: 'ease-out',
                      animationFillMode: 'both',
                      animationDelay: `${idx * 60}ms`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                          {doc.title}
                        </h4>
                      </div>
                      <StatusBadge status={doc.status} />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed ml-6">
                      {doc.description}
                    </p>
                    {doc.lastRevised && (
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 ml-6">
                        Last revised: {doc.lastRevised}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
      </div>

      {/* ---- Legend ---- */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
        {LEVELS.map((lvl) => (
          <span key={lvl.level} className="flex items-center gap-1.5">
            <span className={`inline-block h-3 w-3 rounded-sm ${lvl.color}`} />
            {lvl.tag}: {lvl.label.split(' ').slice(0, 2).join(' ')}
          </span>
        ))}
      </div>

      {/* ---- Keyframe animation (scoped) ---- */}
      <style jsx>{`
        @keyframes fadeSlideIn {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
