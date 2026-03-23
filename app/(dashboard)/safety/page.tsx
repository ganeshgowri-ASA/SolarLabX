// @ts-nocheck
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShieldAlert, AlertTriangle, ClipboardCheck, Flame, HardHat,
  TriangleAlert, Eye, Calendar, User, CheckCircle2, XCircle,
  Plus, Search, Filter, Download, Bell,
} from "lucide-react";

// ── HIRA Data ──
const hiraData = [
  {
    id: 1, activity: "Flash Testing (STC)", hazard: "UV radiation exposure to eyes and skin",
    likelihood: 3, severity: 4, controlMeasures: "UV-blocking goggles, lab coat, restricted access zone, interlock on simulator door",
    residualL: 1, residualS: 4, owner: "Lab Manager", reviewDate: "2026-06-15", status: "Active",
  },
  {
    id: 2, activity: "Laminator Operation", hazard: "Burn hazard from heated platens (150°C+)",
    likelihood: 3, severity: 5, controlMeasures: "Heat-resistant gloves, warning signage, cool-down SOP, thermal guards",
    residualL: 1, residualS: 5, owner: "Production Lead", reviewDate: "2026-05-01", status: "Active",
  },
  {
    id: 3, activity: "Chemical Handling (Electrolyte)", hazard: "Chemical splash, inhalation of fumes",
    likelihood: 2, severity: 4, controlMeasures: "Chemical goggles, nitrile gloves, fume hood, SDS available, spill kit",
    residualL: 1, residualS: 3, owner: "Safety Officer", reviewDate: "2026-04-20", status: "Active",
  },
  {
    id: 4, activity: "EL Imaging", hazard: "Electrical shock from DC bias supply",
    likelihood: 2, severity: 5, controlMeasures: "Insulated gloves, lockout/tagout, rubber mats, trained operators only",
    residualL: 1, residualS: 5, owner: "Test Engineer", reviewDate: "2026-07-10", status: "Active",
  },
  {
    id: 5, activity: "Rooftop Outdoor Testing", hazard: "Fall from height, heat stroke",
    likelihood: 3, severity: 5, controlMeasures: "Safety harness, hard hat, buddy system, hydration breaks, fall arrest anchors",
    residualL: 1, residualS: 5, owner: "Field Supervisor", reviewDate: "2026-04-30", status: "Active",
  },
  {
    id: 6, activity: "High Voltage Insulation Testing", hazard: "Electrocution (up to 5kV DC)",
    likelihood: 2, severity: 5, controlMeasures: "HV-rated gloves, barriers, warning lights, interlock system, 2-person rule",
    residualL: 1, residualS: 5, owner: "HV Specialist", reviewDate: "2026-06-01", status: "Active",
  },
];

function getRiskLevel(rpn: number) {
  if (rpn >= 15) return { label: "Critical", color: "bg-red-100 text-red-700 border-red-200" };
  if (rpn >= 10) return { label: "High", color: "bg-orange-100 text-orange-700 border-orange-200" };
  if (rpn >= 5) return { label: "Medium", color: "bg-yellow-100 text-yellow-700 border-yellow-200" };
  return { label: "Low", color: "bg-green-100 text-green-700 border-green-200" };
}

function RiskBadge({ l, s }: { l: number; s: number }) {
  const rpn = l * s;
  const { label, color } = getRiskLevel(rpn);
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border", color)}>
      {l}×{s}={rpn} <span className="font-normal">({label})</span>
    </span>
  );
}

export default function SafetyEHSPage() {
  const [activeTab, setActiveTab] = useState("hira");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHira = hiraData.filter(
    (h) =>
      h.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.hazard.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const criticalCount = hiraData.filter((h) => h.likelihood * h.severity >= 15).length;
  const highCount = hiraData.filter((h) => { const r = h.likelihood * h.severity; return r >= 10 && r < 15; }).length;
  const mediumCount = hiraData.filter((h) => { const r = h.likelihood * h.severity; return r >= 5 && r < 10; }).length;
  const lowCount = hiraData.filter((h) => h.likelihood * h.severity < 5).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-red-600" />
            Safety & EHS
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Environment, Health & Safety management for Solar PV Laboratory
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm flex items-center gap-1">
            <Download className="h-4 w-4" /> Export
          </button>
          <button className="btn-primary text-sm flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add Record
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card border-l-4 border-l-red-500">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Critical Risks</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{criticalCount}</p>
          <p className="text-xs text-gray-400 mt-1">RPN ≥ 15</p>
        </div>
        <div className="card border-l-4 border-l-orange-500">
          <p className="text-xs text-gray-500 uppercase tracking-wide">High Risks</p>
          <p className="text-3xl font-bold text-orange-600 mt-1">{highCount}</p>
          <p className="text-xs text-gray-400 mt-1">RPN 10–14</p>
        </div>
        <div className="card border-l-4 border-l-yellow-500">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Medium Risks</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{mediumCount}</p>
          <p className="text-xs text-gray-400 mt-1">RPN 5–9</p>
        </div>
        <div className="card border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Low Risks</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{lowCount}</p>
          <p className="text-xs text-gray-400 mt-1">RPN &lt; 5</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="hira">HIRA Register</TabsTrigger>
          <TabsTrigger value="safety-audit">Safety Audit</TabsTrigger>
          <TabsTrigger value="mock-drills">Mock Drills</TabsTrigger>
          <TabsTrigger value="fire-safety">Fire Safety</TabsTrigger>
          <TabsTrigger value="ppe-zones">PPE & Zones</TabsTrigger>
          <TabsTrigger value="signage">Signage</TabsTrigger>
        </TabsList>

        {/* ═══════ Tab 1: HIRA ═══════ */}
        <TabsContent value="hira" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities or hazards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Activity</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Hazard</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Initial Risk</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Control Measures</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Residual Risk</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Owner</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Review Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHira.map((item, idx) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{item.activity}</td>
                      <td className="px-4 py-3 text-gray-700 max-w-[200px]">{item.hazard}</td>
                      <td className="px-4 py-3"><RiskBadge l={item.likelihood} s={item.severity} /></td>
                      <td className="px-4 py-3 text-gray-600 max-w-[250px] text-xs">{item.controlMeasures}</td>
                      <td className="px-4 py-3"><RiskBadge l={item.residualL} s={item.residualS} /></td>
                      <td className="px-4 py-3 text-gray-700">{item.owner}</td>
                      <td className="px-4 py-3 text-gray-500">{item.reviewDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk Matrix */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Risk Matrix (Likelihood × Severity)</h3>
            <div className="grid grid-cols-6 gap-1 max-w-lg">
              <div className="text-xs text-gray-500 flex items-end justify-center pb-1">L\S</div>
              {[1,2,3,4,5].map(s => (
                <div key={s} className="text-xs text-center font-semibold text-gray-600 pb-1">{s}</div>
              ))}
              {[5,4,3,2,1].map(l => (
                <>
                  <div key={`l-${l}`} className="text-xs font-semibold text-gray-600 flex items-center justify-center">{l}</div>
                  {[1,2,3,4,5].map(s => {
                    const rpn = l * s;
                    const { color } = getRiskLevel(rpn);
                    return (
                      <div key={`${l}-${s}`} className={cn("text-xs text-center py-2 rounded font-semibold border", color)}>
                        {rpn}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Placeholder tabs - to be filled */}
        <TabsContent value="safety-audit"><div className="card"><p className="text-gray-500">Safety Audit content coming soon...</p></div></TabsContent>
        <TabsContent value="mock-drills"><div className="card"><p className="text-gray-500">Mock Drills content coming soon...</p></div></TabsContent>
        <TabsContent value="fire-safety"><div className="card"><p className="text-gray-500">Fire Safety content coming soon...</p></div></TabsContent>
        <TabsContent value="ppe-zones"><div className="card"><p className="text-gray-500">PPE & Zones content coming soon...</p></div></TabsContent>
        <TabsContent value="signage"><div className="card"><p className="text-gray-500">Signage content coming soon...</p></div></TabsContent>
      </Tabs>
    </div>
  );
}
