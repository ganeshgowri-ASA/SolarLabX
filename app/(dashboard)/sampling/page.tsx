// @ts-nocheck
"use client";

import { useState } from "react";
import {
  ClipboardList, Dice5, FileText, ShieldCheck, Table2, Calculator,
  Printer, Download, RefreshCw, ChevronDown, Star, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  SAMPLE DATA                                                       */
/* ------------------------------------------------------------------ */

const samplingTypes = [
  { type: "Simple Random", description: "Every unit in the lot has an equal probability of selection", whenToUse: "Homogeneous lots, routine incoming inspection", isoRef: "ISO 2859-1, ISO 3951-1", tests: "Visual inspection, power measurement" },
  { type: "Stratified", description: "Lot divided into sub-groups (strata); samples drawn from each", whenToUse: "Lots with known sub-group variation (e.g., multiple production lines)", isoRef: "ISO 3534-1", tests: "EL imaging, IR thermography, IV testing" },
  { type: "Systematic", description: "Every k-th unit selected from an ordered lot", whenToUse: "Continuous production sampling, inline inspection", isoRef: "ISO 2859-1 Annex", tests: "Dimensional checks, connector pull tests" },
  { type: "Cluster", description: "Randomly selected groups (clusters) are fully inspected", whenToUse: "Geographically dispersed lots, field installations", isoRef: "ISO 3534-1", tests: "Field performance, degradation assessment" },
  { type: "Acceptance (AQL)", description: "Statistical sampling based on Acceptable Quality Level", whenToUse: "Incoming inspection, lot acceptance/rejection decisions", isoRef: "ISO 2859-1, IEC 61215 Cl.5", tests: "IEC 61215 MQT, IEC 61730 MST" },
  { type: "Skip-lot", description: "Reduced inspection frequency for consistently conforming suppliers", whenToUse: "Proven suppliers with established quality history", isoRef: "ISO 2859-3", tests: "Routine visual, power binning verification" },
];

const samplingPlans = [
  { test: "MQT 10.1 - Visual Inspection", standard: "IEC 61215", sampleSize: 8, level: "II", aql: "1.0", lotSize: "91-150" },
  { test: "MQT 10.2 - STC Power", standard: "IEC 61215", sampleSize: 8, level: "II", aql: "1.0", lotSize: "91-150" },
  { test: "MQT 11 - Outdoor Exposure", standard: "IEC 61215", sampleSize: 2, level: "S-2", aql: "N/A", lotSize: "Any" },
  { test: "MQT 12 - Hot Spot", standard: "IEC 61215", sampleSize: 2, level: "S-2", aql: "N/A", lotSize: "Any" },
  { test: "MQT 13 - UV Preconditioning", standard: "IEC 61215", sampleSize: 4, level: "S-3", aql: "N/A", lotSize: "Any" },
  { test: "MQT 14 - Thermal Cycling", standard: "IEC 61215", sampleSize: 4, level: "S-3", aql: "N/A", lotSize: "Any" },
  { test: "MST 21 - Impulse Voltage", standard: "IEC 61730", sampleSize: 2, level: "S-2", aql: "N/A", lotSize: "Any" },
  { test: "MST 25 - Bypass Diode", standard: "IEC 61730", sampleSize: 4, level: "S-3", aql: "N/A", lotSize: "Any" },
  { test: "MST 34 - Fire Test", standard: "IEC 61730", sampleSize: 2, level: "S-2", aql: "N/A", lotSize: "Any" },
];

const criteriaMatrix = [
  { testType: "Design Qualification (IEC 61215)", powerClass: true, manufacturer: true, batch: true, date: true, criteria: "Same BOM, same production line" },
  { testType: "Safety Qualification (IEC 61730)", powerClass: false, manufacturer: true, batch: true, date: true, criteria: "Same construction, same factory" },
  { testType: "Energy Rating (IEC 61853)", powerClass: true, manufacturer: true, batch: false, date: false, criteria: "Representative of product type" },
  { testType: "Reliability (IEC 62804 PID)", powerClass: true, manufacturer: true, batch: true, date: true, criteria: "Same cell technology & encapsulant" },
  { testType: "Incoming Inspection", powerClass: true, manufacturer: true, batch: true, date: true, criteria: "AQL-based per ISO 2859-1" },
];

const reportTemplates = [
  { name: "Sample Receipt Log", fields: ["Date Received", "Client Name", "Sample ID", "Quantity", "Condition on Receipt", "Received By", "Storage Location"], icon: FileText },
  { name: "Sample Identification", fields: ["Sample ID", "Module Make/Model", "Serial Number", "Power Class (Wp)", "Dimensions", "Cell Type", "Test Program"], icon: Table2 },
  { name: "Chain of Custody", fields: ["Sample ID", "From", "To", "Date/Time", "Purpose", "Condition", "Signature"], icon: ClipboardList },
  { name: "Sample Condition Report", fields: ["Sample ID", "Inspection Date", "Visual Defects", "Physical Damage", "Photos Attached", "Inspector", "Disposition"], icon: ShieldCheck },
  { name: "Sample Disposal", fields: ["Sample ID", "Disposal Date", "Method", "Reason", "Client Approval Ref", "Disposed By", "Witness"], icon: FileText },
];

const complianceChecklist = [
  { clause: "7.3.1", requirement: "Sampling plan documentation", description: "Laboratory shall have a sampling plan and procedure when it carries out sampling", status: "Compliant" },
  { clause: "7.3.2", requirement: "Sampling method records", description: "Sampling method shall describe selection, sampling plan, withdrawal and preparation", status: "Compliant" },
  { clause: "7.3.3", requirement: "Sampling records", description: "Records shall include sampling procedure, identification, environmental conditions, diagrams", status: "In Progress" },
  { clause: "7.3.1 (a)", requirement: "Statistical basis", description: "Reference to appropriate statistical standard (ISO 2859-1, ISO 3951-1)", status: "Compliant" },
  { clause: "7.3.1 (b)", requirement: "Representativeness", description: "Samples shall be representative of the lot or population", status: "Compliant" },
  { clause: "7.3.3 (a)", requirement: "Date & identification", description: "Date and identification of sampling, location, environmental conditions", status: "In Progress" },
  { clause: "7.3.3 (b)", requirement: "Sampling plan reference", description: "Reference to the sampling method or plan used for selection", status: "Compliant" },
  { clause: "7.3.3 (c)", requirement: "Details of items sampled", description: "Details and/or description of the item sampled", status: "Not Started" },
  { clause: "7.3.3 (d)", requirement: "Deviations", description: "Record deviations, additions or exclusions from the sampling plan", status: "Not Started" },
];

/* ------------------------------------------------------------------ */
/*  ISO 2859-1 AQL TABLE (simplified)                                 */
/* ------------------------------------------------------------------ */

const aqlTable: Record<string, Record<string, Record<string, { accept: number; reject: number; size: number }>>> = {
  "I": {
    "2-8": { "1.0": { size: 2, accept: 0, reject: 1 }, "2.5": { size: 2, accept: 0, reject: 1 }, "4.0": { size: 2, accept: 0, reject: 1 } },
    "9-15": { "1.0": { size: 3, accept: 0, reject: 1 }, "2.5": { size: 3, accept: 0, reject: 1 }, "4.0": { size: 3, accept: 0, reject: 1 } },
    "16-25": { "1.0": { size: 5, accept: 0, reject: 1 }, "2.5": { size: 5, accept: 0, reject: 1 }, "4.0": { size: 5, accept: 1, reject: 2 } },
    "26-50": { "1.0": { size: 5, accept: 0, reject: 1 }, "2.5": { size: 5, accept: 0, reject: 1 }, "4.0": { size: 8, accept: 1, reject: 2 } },
    "51-90": { "1.0": { size: 5, accept: 0, reject: 1 }, "2.5": { size: 8, accept: 0, reject: 1 }, "4.0": { size: 8, accept: 1, reject: 2 } },
    "91-150": { "1.0": { size: 8, accept: 0, reject: 1 }, "2.5": { size: 8, accept: 1, reject: 2 }, "4.0": { size: 13, accept: 1, reject: 2 } },
    "151-280": { "1.0": { size: 8, accept: 0, reject: 1 }, "2.5": { size: 13, accept: 1, reject: 2 }, "4.0": { size: 20, accept: 2, reject: 3 } },
    "281-500": { "1.0": { size: 13, accept: 0, reject: 1 }, "2.5": { size: 13, accept: 1, reject: 2 }, "4.0": { size: 20, accept: 2, reject: 3 } },
  },
  "II": {
    "2-8": { "1.0": { size: 3, accept: 0, reject: 1 }, "2.5": { size: 3, accept: 0, reject: 1 }, "4.0": { size: 3, accept: 0, reject: 1 } },
    "9-15": { "1.0": { size: 5, accept: 0, reject: 1 }, "2.5": { size: 5, accept: 0, reject: 1 }, "4.0": { size: 5, accept: 1, reject: 2 } },
    "16-25": { "1.0": { size: 8, accept: 0, reject: 1 }, "2.5": { size: 8, accept: 0, reject: 1 }, "4.0": { size: 8, accept: 1, reject: 2 } },
    "26-50": { "1.0": { size: 8, accept: 0, reject: 1 }, "2.5": { size: 8, accept: 1, reject: 2 }, "4.0": { size: 13, accept: 1, reject: 2 } },
    "51-90": { "1.0": { size: 8, accept: 0, reject: 1 }, "2.5": { size: 13, accept: 1, reject: 2 }, "4.0": { size: 20, accept: 2, reject: 3 } },
    "91-150": { "1.0": { size: 13, accept: 0, reject: 1 }, "2.5": { size: 13, accept: 1, reject: 2 }, "4.0": { size: 20, accept: 2, reject: 3 } },
    "151-280": { "1.0": { size: 13, accept: 1, reject: 2 }, "2.5": { size: 20, accept: 2, reject: 3 }, "4.0": { size: 32, accept: 3, reject: 4 } },
    "281-500": { "1.0": { size: 20, accept: 1, reject: 2 }, "2.5": { size: 20, accept: 2, reject: 3 }, "4.0": { size: 32, accept: 3, reject: 4 } },
  },
  "III": {
    "2-8": { "1.0": { size: 5, accept: 0, reject: 1 }, "2.5": { size: 5, accept: 0, reject: 1 }, "4.0": { size: 5, accept: 1, reject: 2 } },
    "9-15": { "1.0": { size: 8, accept: 0, reject: 1 }, "2.5": { size: 8, accept: 0, reject: 1 }, "4.0": { size: 8, accept: 1, reject: 2 } },
    "16-25": { "1.0": { size: 13, accept: 0, reject: 1 }, "2.5": { size: 13, accept: 1, reject: 2 }, "4.0": { size: 13, accept: 1, reject: 2 } },
    "26-50": { "1.0": { size: 13, accept: 0, reject: 1 }, "2.5": { size: 13, accept: 1, reject: 2 }, "4.0": { size: 20, accept: 2, reject: 3 } },
    "51-90": { "1.0": { size: 13, accept: 1, reject: 2 }, "2.5": { size: 20, accept: 2, reject: 3 }, "4.0": { size: 32, accept: 3, reject: 4 } },
    "91-150": { "1.0": { size: 20, accept: 1, reject: 2 }, "2.5": { size: 20, accept: 2, reject: 3 }, "4.0": { size: 32, accept: 3, reject: 4 } },
    "151-280": { "1.0": { size: 20, accept: 1, reject: 2 }, "2.5": { size: 32, accept: 3, reject: 4 }, "4.0": { size: 50, accept: 5, reject: 6 } },
    "281-500": { "1.0": { size: 32, accept: 1, reject: 2 }, "2.5": { size: 32, accept: 3, reject: 4 }, "4.0": { size: 50, accept: 5, reject: 6 } },
  },
};

const lotSizeRanges = ["2-8", "9-15", "16-25", "26-50", "51-90", "91-150", "151-280", "281-500"];
const aqlValues = ["1.0", "2.5", "4.0"];
const inspectionLevels = ["I", "II", "III"];

/* ------------------------------------------------------------------ */
/*  TABS                                                              */
/* ------------------------------------------------------------------ */

const tabs = [
  { id: "types", label: "Sampling Types", icon: Table2 },
  { id: "plans", label: "Sampling Plans", icon: Calculator },
  { id: "random", label: "Random Sampling Criteria", icon: Dice5 },
  { id: "reports", label: "Sampling Reports", icon: FileText },
  { id: "compliance", label: "ISO 17025 Compliance", icon: ShieldCheck },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                         */
/* ------------------------------------------------------------------ */

export default function SamplingPage() {
  const [activeTab, setActiveTab] = useState("types");
  const [level, setLevel] = useState("II");
  const [aql, setAql] = useState("1.0");
  const [lotSize, setLotSize] = useState("91-150");
  const [randomCount, setRandomCount] = useState(8);
  const [randomMax, setRandomMax] = useState(150);
  const [randomNumbers, setRandomNumbers] = useState<number[]>([]);
  const [checklistStatus, setChecklistStatus] = useState<Record<string, string>>(
    () => Object.fromEntries(complianceChecklist.map((c) => [c.clause, c.status]))
  );

  const result = aqlTable[level]?.[lotSize]?.[aql];

  const generateRandom = () => {
    const nums = new Set<number>();
    while (nums.size < Math.min(randomCount, randomMax)) {
      nums.add(Math.floor(Math.random() * randomMax) + 1);
    }
    setRandomNumbers(Array.from(nums).sort((a, b) => a - b));
  };

  const statusColor = (s: string) => {
    if (s === "Compliant") return "bg-green-100 text-green-700";
    if (s === "In Progress") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sampling Procedures</h1>
        <p className="text-sm text-gray-500 mt-1">ISO 2859-1 / IEC 61215 / ISO 17025 Clause 7.3</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  activeTab === t.id ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}>
                <Icon className="h-4 w-4" />{t.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB: Sampling Types */}
      {activeTab === "types" && (
        <div className="card overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>{["Type", "Description", "When to Use", "ISO/IEC Reference", "Applicable Tests"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-700">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {samplingTypes.map((s) => (
                <tr key={s.type} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.type}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">{s.description}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">{s.whenToUse}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{s.isoRef}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{s.tests}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: Sampling Plans */}
      {activeTab === "plans" && (
        <div className="space-y-6">
          {/* Calculator */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">AQL Sample Size Calculator</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Inspection Level</label>
                <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  {inspectionLevels.map((l) => <option key={l} value={l}>Level {l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">AQL Value</label>
                <select value={aql} onChange={(e) => setAql(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  {aqlValues.map((a) => <option key={a} value={a}>{a}%</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Lot Size</label>
                <select value={lotSize} onChange={(e) => setLotSize(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  {lotSizeRanges.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                {result && (
                  <div className="w-full rounded-lg bg-orange-50 border border-orange-200 px-4 py-2 text-center">
                    <p className="text-xs text-orange-600 font-medium">Sample Size</p>
                    <p className="text-2xl font-bold text-orange-700">{result.size}</p>
                    <p className="text-xs text-orange-500">Ac={result.accept} Re={result.reject}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pre-built plans */}
          <div className="card overflow-x-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">IEC Test Sequence Sampling Plans</h2>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>{["Test", "Standard", "Level", "AQL", "Lot Size", "Sample Size"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-700">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {samplingPlans.map((p) => (
                  <tr key={p.test} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.test}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs">{p.standard}</span></td>
                    <td className="px-4 py-3 text-gray-600">{p.level}</td>
                    <td className="px-4 py-3 text-gray-600">{p.aql}</td>
                    <td className="px-4 py-3 text-gray-500">{p.lotSize}</td>
                    <td className="px-4 py-3 font-semibold text-orange-600">{p.sampleSize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Random Sampling Criteria */}
      {activeTab === "random" && (
        <div className="space-y-6">
          <div className="card overflow-x-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Module Selection Criteria Matrix</h2>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Test Type</th>
                  {["Power Class", "Manufacturer", "Batch", "Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-center font-semibold text-gray-700">{h}</th>
                  ))}
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Additional Criteria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {criteriaMatrix.map((c) => (
                  <tr key={c.testType} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.testType}</td>
                    {[c.powerClass, c.manufacturer, c.batch, c.date].map((v, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        {v ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-gray-500 text-xs">{c.criteria}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Random Number Generator */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Random Number Generator</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sample Count</label>
                <input type="number" min={1} max={500} value={randomCount} onChange={(e) => setRandomCount(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Lot Size (max number)</label>
                <input type="number" min={1} max={10000} value={randomMax} onChange={(e) => setRandomMax(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div className="flex items-end">
                <button onClick={generateRandom} className="btn-primary text-sm flex items-center gap-2">
                  <Dice5 className="h-4 w-4" /> Generate
                </button>
              </div>
            </div>
            {randomNumbers.length > 0 && (
              <div className="rounded-lg bg-gray-50 border p-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Selected Units ({randomNumbers.length})</p>
                <div className="flex flex-wrap gap-2">
                  {randomNumbers.map((n) => (
                    <span key={n} className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">{n}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Sampling Reports */}
      {activeTab === "reports" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTemplates.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.name} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold text-gray-900">{r.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400"><Printer className="h-4 w-4" /></button>
                    <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400"><Download className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="space-y-2">
                  {r.fields.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <label className="text-xs text-gray-500 w-32 shrink-0">{f}</label>
                      <input type="text" placeholder={f} className="flex-1 rounded border border-gray-200 px-2 py-1.5 text-sm" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB: ISO 17025 Compliance */}
      {activeTab === "compliance" && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">ISO 17025 Clause 7.3 — Sampling Compliance</h2>
            <div className="flex gap-3 text-xs">
              {["Compliant", "In Progress", "Not Started"].map((s) => (
                <span key={s} className="flex items-center gap-1">
                  <span className={cn("w-2.5 h-2.5 rounded-full", s === "Compliant" ? "bg-green-500" : s === "In Progress" ? "bg-yellow-500" : "bg-red-500")} />
                  {s}
                </span>
              ))}
            </div>
          </div>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>{["Clause", "Requirement", "Description", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-700">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {complianceChecklist.map((c) => (
                <tr key={c.clause} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-600">{c.clause}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.requirement}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-md">{c.description}</td>
                  <td className="px-4 py-3">
                    <select value={checklistStatus[c.clause]} onChange={(e) => setChecklistStatus((p) => ({ ...p, [c.clause]: e.target.value }))}
                      className={cn("rounded-full px-3 py-1 text-xs font-medium border-0", statusColor(checklistStatus[c.clause]))}>
                      <option value="Compliant">Compliant</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Not Started">Not Started</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
