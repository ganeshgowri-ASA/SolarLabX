// @ts-nocheck
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  SearchCheck, CheckCircle2, AlertTriangle, Clock, TrendingUp,
  FileText, X, ArrowRight, BarChart3,
} from "lucide-react";

// ── Types ──
type CAPAStatus = "Open" | "In Progress" | "Implemented" | "Verified - Effective" | "Verified - Not Effective" | "Overdue";
type QMSImpact = "Process Change" | "Document Update" | "Training" | "Equipment Cal" | "No Impact";
type VerificationMethod = "Audit" | "Data Review" | "Process Check" | "Customer Feedback" | "Repeat Test";

// ── CAPA Register Data ──
interface CAPARecord {
  capaNo: string; linkedNC: string; rootCause: string;
  correctiveAction: string; preventiveAction: string;
  implDate: string; responsible: string;
  verificationMethod: VerificationMethod; effectivenessCriteria: string;
  checkDate: string; qmsImpact: QMSImpact; impactDescription: string;
  status: CAPAStatus;
}

const CAPA_REGISTER: CAPARecord[] = [
  { capaNo: "CAPA-2026-001", linkedNC: "NC-2026-001", rootCause: "Training schedule not updated after IEC 61215 Ed.2 revision", correctiveAction: "Retrain 2 technicians on updated Ed.2 requirements, update competency matrix", preventiveAction: "Link standard revision alerts to training schedule system", implDate: "2026-04-10", responsible: "A. Kumar", verificationMethod: "Audit", effectivenessCriteria: "All technicians show updated competency records within 30 days", checkDate: "2026-05-10", qmsImpact: "Training", impactDescription: "Training SOP updated, competency matrix template revised", status: "In Progress" },
  { capaNo: "CAPA-2026-002", linkedNC: "NC-2026-002", rootCause: "Calibration reminder system failed to trigger for reference cell", correctiveAction: "Recalibrate reference cell, fix LIMS calibration reminder module", preventiveAction: "Add redundant email + SMS alerts 30 days before expiry", implDate: "2026-03-28", responsible: "S. Reddy", verificationMethod: "Data Review", effectivenessCriteria: "Zero missed calibrations for 3 months", checkDate: "2026-06-28", qmsImpact: "Process Change", impactDescription: "LIMS calibration module updated with dual notification", status: "Implemented" },
  { capaNo: "CAPA-2026-003", linkedNC: "NC-2026-003", rootCause: "Uncertainty budget template missing imaging-specific components (lens distortion)", correctiveAction: "Revise EL imaging uncertainty budget including lens distortion and pixel resolution", preventiveAction: "Create checklist for uncertainty budget reviews when new test methods are added", implDate: "2026-04-05", responsible: "Dr. P. Mehta", verificationMethod: "Process Check", effectivenessCriteria: "Revised budget passes technical review and covers all measurement components", checkDate: "2026-05-05", qmsImpact: "Document Update", impactDescription: "Uncertainty budget template v3 and review checklist created", status: "Open" },
  { capaNo: "CAPA-2026-004", linkedNC: "NC-2026-004", rootCause: "No systematic follow-up process after CAPA implementation", correctiveAction: "Implement CAPA effectiveness verification checklist with auto-reminders", preventiveAction: "Add effectiveness check as mandatory LIMS workflow step", implDate: "2026-04-15", responsible: "R. Singh", verificationMethod: "Audit", effectivenessCriteria: "100% of CAPAs have documented effectiveness verification", checkDate: "2026-07-15", qmsImpact: "Process Change", impactDescription: "CAPA workflow updated in LIMS with mandatory verification gate", status: "Open" },
  { capaNo: "CAPA-2025-012", linkedNC: "NC-2025-018", rootCause: "Manual calibration tracking missed datalogger renewal date", correctiveAction: "Recalibrate datalogger, implement 30-day automated reminder", preventiveAction: "Migrate all calibration tracking to LIMS automated system", implDate: "2025-11-20", responsible: "A. Sharma", verificationMethod: "Data Review", effectivenessCriteria: "No missed calibrations in 90 days after implementation", checkDate: "2026-02-20", qmsImpact: "Equipment Cal", impactDescription: "All equipment calibration now tracked via LIMS with automated alerts", status: "Verified - Effective" },
  { capaNo: "CAPA-2025-013", linkedNC: "NC-2025-019", rootCause: "Report template not updated for IEC 61853 uncertainty requirements", correctiveAction: "Update test report template v4 with uncertainty statement section", preventiveAction: "Add template review step to standard adoption workflow", implDate: "2026-01-12", responsible: "R. Singh", verificationMethod: "Process Check", effectivenessCriteria: "All IEC 61853 reports include uncertainty statement", checkDate: "2026-04-12", qmsImpact: "Document Update", impactDescription: "Report template v4 approved and deployed", status: "Verified - Effective" },
  { capaNo: "CAPA-2025-010", linkedNC: "NC-2025-012", rootCause: "Validation protocol not finalized before accepting bifacial test samples", correctiveAction: "Complete validation protocol, add acceptance gate in LIMS", preventiveAction: "Implement validation status check before sample acceptance", implDate: "2025-10-25", responsible: "Dr. P. Mehta", verificationMethod: "Audit", effectivenessCriteria: "No samples accepted without validated test method for 6 months", checkDate: "2026-04-25", qmsImpact: "Process Change", impactDescription: "LIMS now blocks sample acceptance for non-validated methods", status: "Verified - Effective" },
  { capaNo: "CAPA-2025-008", linkedNC: "NC-2025-010", rootCause: "Environmental excursion alerts not formally logged in LIMS", correctiveAction: "Implement auto-logging of environmental excursions into LIMS", preventiveAction: "Configure real-time env monitoring dashboard with auto-record", implDate: "2025-08-20", responsible: "M. Patel", verificationMethod: "Data Review", effectivenessCriteria: "All env excursions auto-logged with zero manual entries needed", checkDate: "2025-11-20", qmsImpact: "Process Change", impactDescription: "Environmental monitoring integrated with LIMS auto-logging", status: "Verified - Effective" },
  { capaNo: "CAPA-2025-005", linkedNC: "NC-2025-005", rootCause: "SOP for humidity measurement not covering low-RH conditions", correctiveAction: "Update SOP to include low-RH measurement protocol", preventiveAction: "Annual SOP gap analysis against test scope expansion", implDate: "2025-05-15", responsible: "A. Kumar", verificationMethod: "Repeat Test", effectivenessCriteria: "Low-RH measurements within ±2% target across 10 tests", checkDate: "2025-08-15", qmsImpact: "Document Update", impactDescription: "SOP-ENV-003 v2 updated and approved", status: "Verified - Not Effective" },
];

const capaStatusColors: Record<CAPAStatus, string> = {
  Open: "bg-red-900/60 text-red-400",
  "In Progress": "bg-amber-900/60 text-amber-400",
  Implemented: "bg-blue-900/60 text-blue-400",
  "Verified - Effective": "bg-emerald-900/60 text-emerald-400",
  "Verified - Not Effective": "bg-red-900/60 text-red-400",
  Overdue: "bg-red-900/80 text-red-300",
};

const qmsImpactColors: Record<QMSImpact, string> = {
  "Process Change": "bg-blue-900/60 text-blue-400",
  "Document Update": "bg-purple-900/60 text-purple-400",
  Training: "bg-amber-900/60 text-amber-400",
  "Equipment Cal": "bg-cyan-900/60 text-cyan-400",
  "No Impact": "bg-gray-700 text-gray-400",
};

// ── Monthly trend data ──
const MONTHLY_TRENDS = [
  { month: "Oct 25", opened: 2, closed: 1, effective: 1 },
  { month: "Nov 25", opened: 1, closed: 2, effective: 2 },
  { month: "Dec 25", opened: 0, closed: 1, effective: 1 },
  { month: "Jan 26", opened: 1, closed: 1, effective: 1 },
  { month: "Feb 26", opened: 1, closed: 0, effective: 0 },
  { month: "Mar 26", opened: 3, closed: 1, effective: 0 },
];

export default function RCAPage() {
  const [activeTab, setActiveTab] = useState("capa-register");
  const [expandedCapa, setExpandedCapa] = useState<string | null>(null);

  const totalCAPAs = CAPA_REGISTER.length;
  const openCAPAs = CAPA_REGISTER.filter((c) => c.status === "Open" || c.status === "In Progress").length;
  const effectiveCAPAs = CAPA_REGISTER.filter((c) => c.status === "Verified - Effective").length;
  const notEffective = CAPA_REGISTER.filter((c) => c.status === "Verified - Not Effective").length;
  const overdueCAPAs = CAPA_REGISTER.filter((c) => {
    if (c.status === "Open" || c.status === "In Progress") {
      return new Date(c.implDate) < new Date("2026-03-24");
    }
    return false;
  }).length;
  const closureRate = totalCAPAs > 0 ? Math.round(((effectiveCAPAs + notEffective) / totalCAPAs) * 100) : 0;
  const effectivenessRate = (effectiveCAPAs + notEffective) > 0 ? Math.round((effectiveCAPAs / (effectiveCAPAs + notEffective)) * 100) : 0;
  const maxTrend = Math.max(...MONTHLY_TRENDS.flatMap((t) => [t.opened, t.closed, t.effective]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Root Cause Analysis & CAPA</h1>
          <p className="text-sm text-gray-400 mt-1">Corrective & Preventive Action tracking with effectiveness monitoring</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-red-900/40 text-red-400">{openCAPAs} Open</span>
          <span className="px-2 py-1 rounded bg-emerald-900/40 text-emerald-400">{effectiveCAPAs} Effective</span>
          {overdueCAPAs > 0 && <span className="px-2 py-1 rounded bg-red-900/60 text-red-300">{overdueCAPAs} Overdue</span>}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger value="capa-register">CAPA Register</TabsTrigger>
          <TabsTrigger value="effectiveness">CAPA Effectiveness</TabsTrigger>
        </TabsList>

        {/* TAB 1: CAPA Register */}
        <TabsContent value="capa-register" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-3 text-center">
              <span className="text-[10px] text-gray-500 uppercase block">Total CAPAs</span>
              <span className="text-2xl font-bold text-white">{totalCAPAs}</span>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-3 text-center">
              <span className="text-[10px] text-gray-500 uppercase block">Open</span>
              <span className="text-2xl font-bold text-red-400">{openCAPAs}</span>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-3 text-center">
              <span className="text-[10px] text-gray-500 uppercase block">Implemented</span>
              <span className="text-2xl font-bold text-blue-400">{CAPA_REGISTER.filter((c) => c.status === "Implemented").length}</span>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-3 text-center">
              <span className="text-[10px] text-gray-500 uppercase block">Effective</span>
              <span className="text-2xl font-bold text-emerald-400">{effectiveCAPAs}</span>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-3 text-center">
              <span className="text-[10px] text-gray-500 uppercase block">Not Effective</span>
              <span className="text-2xl font-bold text-red-400">{notEffective}</span>
            </div>
          </div>

          <div className="space-y-3">
            {CAPA_REGISTER.map((c) => {
              const isExpanded = expandedCapa === c.capaNo;
              return (
                <div key={c.capaNo} className="rounded-xl border border-gray-800 bg-gray-900/40 overflow-hidden">
                  <button onClick={() => setExpandedCapa(isExpanded ? null : c.capaNo)} className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-900/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-orange-400 text-xs">{c.capaNo}</span>
                      <span className="text-gray-500 text-xs">NC: {c.linkedNC}</span>
                      <span className="text-gray-300 text-sm truncate max-w-[300px]">{c.correctiveAction}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium", qmsImpactColors[c.qmsImpact])}>{c.qmsImpact}</span>
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium", capaStatusColors[c.status])}>{c.status}</span>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-800 pt-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-2">
                          <div><span className="text-gray-500 block">Root Cause</span><span className="text-gray-300">{c.rootCause}</span></div>
                          <div><span className="text-gray-500 block">Corrective Action</span><span className="text-gray-300">{c.correctiveAction}</span></div>
                          <div><span className="text-gray-500 block">Preventive Action</span><span className="text-gray-300">{c.preventiveAction}</span></div>
                        </div>
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div><span className="text-gray-500 block">Implementation Date</span><span className="text-gray-300">{c.implDate}</span></div>
                            <div><span className="text-gray-500 block">Responsible</span><span className="text-gray-300">{c.responsible}</span></div>
                            <div><span className="text-gray-500 block">Verification Method</span><span className="text-gray-300">{c.verificationMethod}</span></div>
                            <div><span className="text-gray-500 block">Check Date</span><span className="text-gray-300">{c.checkDate}</span></div>
                          </div>
                          <div><span className="text-gray-500 block">Effectiveness Criteria</span><span className="text-gray-300">{c.effectivenessCriteria}</span></div>
                          <div><span className="text-gray-500 block">QMS Impact</span><span className="text-gray-300">{c.impactDescription}</span></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* TAB 2: CAPA Effectiveness */}
        <TabsContent value="effectiveness" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 text-center">
              <span className="text-[10px] text-gray-500 uppercase block">Closure Rate</span>
              <span className="text-3xl font-bold text-white">{closureRate}%</span>
              <span className="text-[10px] text-gray-500 block mt-1">{effectiveCAPAs + notEffective}/{totalCAPAs} verified</span>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 text-center">
              <span className="text-[10px] text-gray-500 uppercase block">Effectiveness Rate</span>
              <span className="text-3xl font-bold text-emerald-400">{effectivenessRate}%</span>
              <span className="text-[10px] text-gray-500 block mt-1">{effectiveCAPAs}/{effectiveCAPAs + notEffective} pass</span>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 text-center">
              <span className="text-[10px] text-gray-500 uppercase block">Overdue CAPAs</span>
              <span className={cn("text-3xl font-bold", overdueCAPAs > 0 ? "text-red-400" : "text-emerald-400")}>{overdueCAPAs}</span>
              <span className="text-[10px] text-gray-500 block mt-1">Past implementation date</span>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 text-center">
              <span className="text-[10px] text-gray-500 uppercase block">Avg. Closure Time</span>
              <span className="text-3xl font-bold text-blue-400">34d</span>
              <span className="text-[10px] text-gray-500 block mt-1">From open to verified</span>
            </div>
          </div>

          {/* Trend Chart (CSS bar chart) */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
            <h3 className="text-sm font-semibold text-white mb-4">CAPA Monthly Trend</h3>
            <div className="flex items-end gap-2 h-40">
              {MONTHLY_TRENDS.map((t) => (
                <div key={t.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex items-end gap-0.5 h-28 w-full justify-center">
                    <div className="w-3 rounded-t bg-red-500/70" style={{ height: `${maxTrend > 0 ? (t.opened / maxTrend) * 100 : 0}%` }} title={`Opened: ${t.opened}`} />
                    <div className="w-3 rounded-t bg-blue-500/70" style={{ height: `${maxTrend > 0 ? (t.closed / maxTrend) * 100 : 0}%` }} title={`Closed: ${t.closed}`} />
                    <div className="w-3 rounded-t bg-emerald-500/70" style={{ height: `${maxTrend > 0 ? (t.effective / maxTrend) * 100 : 0}%` }} title={`Effective: ${t.effective}`} />
                  </div>
                  <span className="text-[10px] text-gray-500">{t.month}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-500/70" />Opened</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-500/70" />Closed</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500/70" />Effective</span>
            </div>
          </div>

          {/* Effectiveness Pass/Fail Breakdown */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Effectiveness Verification Results</h3>
            <div className="space-y-2">
              {CAPA_REGISTER.filter((c) => c.status.startsWith("Verified")).map((c) => (
                <div key={c.capaNo} className="flex items-center justify-between bg-gray-900 rounded-lg px-4 py-2 border border-gray-800">
                  <div className="flex items-center gap-3">
                    {c.status === "Verified - Effective" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    )}
                    <span className="font-mono text-orange-400 text-xs">{c.capaNo}</span>
                    <span className="text-gray-400 text-xs">NC: {c.linkedNC}</span>
                    <span className="text-gray-300 text-xs truncate max-w-[250px]">{c.effectivenessCriteria}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium", qmsImpactColors[c.qmsImpact])}>{c.qmsImpact}</span>
                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium", capaStatusColors[c.status])}>
                      {c.status === "Verified - Effective" ? "PASS" : "FAIL"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QMS Impact Summary */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
            <h3 className="text-sm font-semibold text-white mb-3">QMS Impact Distribution</h3>
            <div className="grid grid-cols-5 gap-2">
              {(["Process Change", "Document Update", "Training", "Equipment Cal", "No Impact"] as QMSImpact[]).map((impact) => {
                const count = CAPA_REGISTER.filter((c) => c.qmsImpact === impact).length;
                return (
                  <div key={impact} className={cn("rounded-lg border p-3 text-center", qmsImpactColors[impact].replace("text-", "border-").replace("/60", "/40").split(" ")[0], "bg-gray-900/40")}>
                    <span className="text-2xl font-bold text-white block">{count}</span>
                    <span className="text-[10px] text-gray-400">{impact}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
