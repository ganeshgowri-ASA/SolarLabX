// @ts-nocheck
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package, Search, Plus, ChevronRight, Clock, AlertTriangle, CheckCircle2,
  Truck, ClipboardCheck, FlaskConical, FileBarChart, Eye, X, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Sample data ---
type Stage = "Receipt & Inspection" | "Sample Login & ID" | "Storage/Conditioning" | "Test Assignment" | "Testing In-Progress" | "Review & Verification" | "Report Generation" | "Dispatch/Return";
type Priority = "Normal" | "Urgent" | "Rush";
type Status = "Active" | "On Hold" | "Completed" | "Rejected";

interface Sample {
  id: string; client: string; moduleType: string; quantity: number; dateReceived: string;
  stage: Stage; priority: Priority; testPlan: string; status: Status;
  serialNumbers: string[]; poNumber: string; receivedBy: string;
  inspectionResult: "Pass" | "Fail" | "Conditional"; packagingCondition: string;
  tests: { name: string; progress: number; startDate: string; endDate: string; equipment: string; technician: string; status: string }[];
  dispatchDate?: string; reportNumber?: string; courier?: string; trackingNumber?: string; certificateIssued?: boolean;
}

const STAGES: { name: Stage; icon: React.ElementType; estDays: number }[] = [
  { name: "Receipt & Inspection", icon: Package, estDays: 1 },
  { name: "Sample Login & ID", icon: ClipboardCheck, estDays: 0.5 },
  { name: "Storage/Conditioning", icon: Clock, estDays: 2 },
  { name: "Test Assignment", icon: FileBarChart, estDays: 0.5 },
  { name: "Testing In-Progress", icon: FlaskConical, estDays: 14 },
  { name: "Review & Verification", icon: Eye, estDays: 3 },
  { name: "Report Generation", icon: FileBarChart, estDays: 2 },
  { name: "Dispatch/Return", icon: Truck, estDays: 1 },
];

const SAMPLES: Sample[] = [
  { id: "SLX-2026-0001", client: "Adani Solar", moduleType: "Mono PERC 540W", quantity: 8, dateReceived: "2026-03-10", stage: "Testing In-Progress", priority: "Urgent", testPlan: "IEC 61215 Full", status: "Active", serialNumbers: ["AS-540-001","AS-540-002","AS-540-003","AS-540-004","AS-540-005","AS-540-006","AS-540-007","AS-540-008"], poNumber: "PO-ADN-2026-112", receivedBy: "R. Sharma", inspectionResult: "Pass", packagingCondition: "Good", tests: [{ name: "TC200", progress: 65, startDate: "2026-03-14", endDate: "2026-04-10", equipment: "TC Chamber A1", technician: "A. Kumar", status: "In Progress" }, { name: "HF10", progress: 0, startDate: "2026-04-11", endDate: "2026-04-18", equipment: "HF Chamber B2", technician: "P. Singh", status: "Pending" }, { name: "DH1000", progress: 0, startDate: "2026-04-19", endDate: "2026-05-20", equipment: "DH Chamber C1", technician: "A. Kumar", status: "Pending" }] },
  { id: "SLX-2026-0002", client: "Tata Power Solar", moduleType: "TOPCon 580W", quantity: 4, dateReceived: "2026-03-12", stage: "Test Assignment", priority: "Normal", testPlan: "IEC 61730 Safety", status: "Active", serialNumbers: ["TPS-580-001","TPS-580-002","TPS-580-003","TPS-580-004"], poNumber: "PO-TPS-2026-045", receivedBy: "M. Patel", inspectionResult: "Pass", packagingCondition: "Good", tests: [] },
  { id: "SLX-2026-0003", client: "Vikram Solar", moduleType: "HJT 700W", quantity: 6, dateReceived: "2026-03-08", stage: "Review & Verification", priority: "Rush", testPlan: "IEC 61215 + 61730", status: "Active", serialNumbers: ["VS-700-001","VS-700-002","VS-700-003","VS-700-004","VS-700-005","VS-700-006"], poNumber: "PO-VKS-2026-078", receivedBy: "R. Sharma", inspectionResult: "Pass", packagingCondition: "Minor dent on crate", tests: [{ name: "TC200", progress: 100, startDate: "2026-03-10", endDate: "2026-03-22", equipment: "TC Chamber A2", technician: "S. Reddy", status: "Completed" }, { name: "UV Test", progress: 100, startDate: "2026-03-10", endDate: "2026-03-18", equipment: "UV Chamber D1", technician: "P. Singh", status: "Completed" }] },
  { id: "SLX-2026-0004", client: "Waaree Energies", moduleType: "Bifacial 550W", quantity: 10, dateReceived: "2026-03-15", stage: "Storage/Conditioning", priority: "Normal", testPlan: "IEC 61853 Energy Rating", status: "Active", serialNumbers: ["WE-550-001","WE-550-002","WE-550-003","WE-550-004","WE-550-005","WE-550-006","WE-550-007","WE-550-008","WE-550-009","WE-550-010"], poNumber: "PO-WAR-2026-201", receivedBy: "M. Patel", inspectionResult: "Pass", packagingCondition: "Good", tests: [] },
  { id: "SLX-2026-0005", client: "Luminous", moduleType: "Poly 330W", quantity: 4, dateReceived: "2026-03-18", stage: "Receipt & Inspection", priority: "Normal", testPlan: "IEC 61215 Subset", status: "Active", serialNumbers: ["LUM-330-001","LUM-330-002","LUM-330-003","LUM-330-004"], poNumber: "PO-LUM-2026-033", receivedBy: "A. Kumar", inspectionResult: "Conditional", packagingCondition: "Moisture marks on box", tests: [] },
  { id: "SLX-2026-0006", client: "RenewSys", moduleType: "Mono PERC 440W", quantity: 6, dateReceived: "2026-02-20", stage: "Dispatch/Return", priority: "Normal", testPlan: "IEC 61730 Safety", status: "Completed", serialNumbers: ["RS-440-001","RS-440-002","RS-440-003","RS-440-004","RS-440-005","RS-440-006"], poNumber: "PO-RNS-2026-019", receivedBy: "R. Sharma", inspectionResult: "Pass", packagingCondition: "Good", tests: [{ name: "Insulation Test", progress: 100, startDate: "2026-02-22", endDate: "2026-03-05", equipment: "HV Tester E1", technician: "S. Reddy", status: "Completed" }], dispatchDate: "2026-03-20", reportNumber: "RPT-2026-0006", courier: "Blue Dart", trackingNumber: "BD9876543210", certificateIssued: true },
  { id: "SLX-2026-0007", client: "Goldi Solar", moduleType: "TOPCon 575W", quantity: 8, dateReceived: "2026-03-05", stage: "Testing In-Progress", priority: "Urgent", testPlan: "IEC 61215 Full", status: "On Hold", serialNumbers: ["GS-575-001","GS-575-002","GS-575-003","GS-575-004","GS-575-005","GS-575-006","GS-575-007","GS-575-008"], poNumber: "PO-GLD-2026-067", receivedBy: "M. Patel", inspectionResult: "Pass", packagingCondition: "Good", tests: [{ name: "TC200", progress: 40, startDate: "2026-03-08", endDate: "2026-04-05", equipment: "TC Chamber A1", technician: "A. Kumar", status: "On Hold" }, { name: "DH1000", progress: 0, startDate: "2026-04-06", endDate: "2026-05-10", equipment: "DH Chamber C1", technician: "A. Kumar", status: "Pending" }] },
  { id: "SLX-2026-0008", client: "Premier Energies", moduleType: "HJT 710W", quantity: 4, dateReceived: "2026-03-20", stage: "Sample Login & ID", priority: "Rush", testPlan: "IEC 61215 + 61853", status: "Active", serialNumbers: ["PE-710-001","PE-710-002","PE-710-003","PE-710-004"], poNumber: "PO-PMR-2026-088", receivedBy: "R. Sharma", inspectionResult: "Pass", packagingCondition: "Good", tests: [] },
];

const priorityColor = { Normal: "bg-gray-700 text-gray-300", Urgent: "bg-amber-900/60 text-amber-400", Rush: "bg-red-900/60 text-red-400" };
const statusColor: Record<Status, string> = { Active: "bg-emerald-900/60 text-emerald-400", "On Hold": "bg-amber-900/60 text-amber-400", Completed: "bg-blue-900/60 text-blue-400", Rejected: "bg-red-900/60 text-red-400" };

export default function SampleTrackingPage() {
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState<string>("All");
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("registry");

  const filtered = SAMPLES.filter((s) => {
    const matchSearch = !search || s.id.toLowerCase().includes(search.toLowerCase()) || s.client.toLowerCase().includes(search.toLowerCase()) || s.moduleType.toLowerCase().includes(search.toLowerCase());
    const matchStage = filterStage === "All" || s.stage === filterStage;
    return matchSearch && matchStage;
  });

  const stageCounts = STAGES.map((st) => ({ ...st, count: SAMPLES.filter((s) => s.stage === st.name).length }));
  const totalActive = SAMPLES.filter((s) => s.status === "Active").length;
  const totalOnHold = SAMPLES.filter((s) => s.status === "On Hold").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sample Tracking</h1>
          <p className="text-sm text-gray-400 mt-1">Track PV module samples from receipt to dispatch</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-emerald-900/40 text-emerald-400">{totalActive} Active</span>
            <span className="px-2 py-1 rounded bg-amber-900/40 text-amber-400">{totalOnHold} On Hold</span>
            <span className="px-2 py-1 rounded bg-blue-900/40 text-blue-400">{SAMPLES.filter((s) => s.status === "Completed").length} Completed</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger value="registry">Sample Registry</TabsTrigger>
          <TabsTrigger value="flow">Process Flow</TabsTrigger>
          <TabsTrigger value="receipt">Receipt & Inspection</TabsTrigger>
          <TabsTrigger value="testing">Testing Progress</TabsTrigger>
          <TabsTrigger value="dispatch">Dispatch & Return</TabsTrigger>
        </TabsList>

        {/* TAB 1: Sample Registry */}
        <TabsContent value="registry" className="space-y-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="Search samples..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none" value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
              <option value="All">All Stages</option>
              {STAGES.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="rounded-xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-900/80 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Sample ID</th><th className="px-4 py-3 text-left">Client</th><th className="px-4 py-3 text-left">Module Type</th><th className="px-4 py-3 text-center">Qty</th><th className="px-4 py-3 text-left">Received</th><th className="px-4 py-3 text-left">Stage</th><th className="px-4 py-3 text-center">Priority</th><th className="px-4 py-3 text-left">Test Plan</th><th className="px-4 py-3 text-center">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-800/50">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-900/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-orange-400 font-medium">{s.id}</td>
                      <td className="px-4 py-3 text-white">{s.client}</td>
                      <td className="px-4 py-3 text-gray-300">{s.moduleType}</td>
                      <td className="px-4 py-3 text-center text-gray-300">{s.quantity}</td>
                      <td className="px-4 py-3 text-gray-400">{s.dateReceived}</td>
                      <td className="px-4 py-3"><span className="text-xs text-gray-300">{s.stage}</span></td>
                      <td className="px-4 py-3 text-center"><span className={cn("px-2 py-0.5 rounded text-xs font-medium", priorityColor[s.priority])}>{s.priority}</span></td>
                      <td className="px-4 py-3 text-gray-300 text-xs">{s.testPlan}</td>
                      <td className="px-4 py-3 text-center"><span className={cn("px-2 py-0.5 rounded text-xs font-medium", statusColor[s.status])}>{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: Process Flow */}
        <TabsContent value="flow" className="space-y-4">
          <div className="overflow-x-auto pb-4">
            <div className="flex items-start gap-1 min-w-[900px]">
              {stageCounts.map((st, i) => {
                const Icon = st.icon;
                const isBottleneck = (st.name === "Testing In-Progress" && st.count >= 2) || (st.name === "Review & Verification" && st.count >= 2);
                const isExpanded = expandedStage === st.name;
                const samplesInStage = SAMPLES.filter((s) => s.stage === st.name);
                return (
                  <div key={st.name} className="flex items-start">
                    <button onClick={() => setExpandedStage(isExpanded ? null : st.name)} className={cn("flex flex-col items-center rounded-xl border p-4 min-w-[120px] transition-all hover:scale-[1.02]", isBottleneck ? "border-red-700 bg-red-950/30" : "border-gray-800 bg-gray-900/60", isExpanded && "ring-1 ring-orange-500")}>
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-2", isBottleneck ? "bg-red-900/50" : "bg-gray-800")}>
                        <Icon className={cn("h-5 w-5", isBottleneck ? "text-red-400" : "text-orange-400")} />
                      </div>
                      <span className="text-xs text-gray-400 text-center leading-tight mb-1">{st.name}</span>
                      <span className={cn("text-2xl font-bold", isBottleneck ? "text-red-400" : "text-white")}>{st.count}</span>
                      <span className="text-[10px] text-gray-500 mt-1">~{st.estDays}d est.</span>
                      {isBottleneck && <span className="text-[10px] text-red-400 mt-1 flex items-center gap-0.5"><AlertTriangle className="h-3 w-3" />Bottleneck</span>}
                    </button>
                    {i < stageCounts.length - 1 && <ArrowRight className="h-4 w-4 text-gray-600 mt-8 mx-1 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
          {expandedStage && (
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">{expandedStage}</h3>
                <button onClick={() => setExpandedStage(null)} className="text-gray-500 hover:text-white"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-2">
                {SAMPLES.filter((s) => s.stage === expandedStage).map((s) => (
                  <div key={s.id} className="flex items-center justify-between bg-gray-900 rounded-lg px-4 py-2 border border-gray-800">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-orange-400 text-sm">{s.id}</span>
                      <span className="text-gray-300 text-sm">{s.client}</span>
                      <span className="text-gray-500 text-xs">{s.moduleType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("px-2 py-0.5 rounded text-xs font-medium", priorityColor[s.priority])}>{s.priority}</span>
                      <span className={cn("px-2 py-0.5 rounded text-xs font-medium", statusColor[s.status])}>{s.status}</span>
                    </div>
                  </div>
                ))}
                {SAMPLES.filter((s) => s.stage === expandedStage).length === 0 && <p className="text-gray-500 text-sm">No samples in this stage</p>}
              </div>
            </div>
          )}
        </TabsContent>

        {/* TAB 3: Receipt & Inspection */}
        <TabsContent value="receipt" className="space-y-4">
          <div className="grid gap-4">
            {SAMPLES.map((s) => (
              <div key={s.id} className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-orange-400 font-medium">{s.id}</span>
                    <span className="text-white font-medium">{s.client}</span>
                    <span className={cn("px-2 py-0.5 rounded text-xs font-medium", s.inspectionResult === "Pass" ? "bg-emerald-900/60 text-emerald-400" : s.inspectionResult === "Fail" ? "bg-red-900/60 text-red-400" : "bg-amber-900/60 text-amber-400")}>{s.inspectionResult}</span>
                  </div>
                  <span className="text-xs text-gray-500">{s.dateReceived}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
                  <div><span className="text-gray-500 block">Received By</span><span className="text-gray-300">{s.receivedBy}</span></div>
                  <div><span className="text-gray-500 block">Client PO#</span><span className="text-gray-300">{s.poNumber}</span></div>
                  <div><span className="text-gray-500 block">Module Count</span><span className="text-gray-300">{s.quantity}</span></div>
                  <div><span className="text-gray-500 block">Packaging</span><span className="text-gray-300">{s.packagingCondition}</span></div>
                  <div><span className="text-gray-500 block">Module Type</span><span className="text-gray-300">{s.moduleType}</span></div>
                  <div><span className="text-gray-500 block">Serial #s</span><span className="text-gray-300">{s.serialNumbers.length} logged</span></div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* TAB 4: Testing Progress */}
        <TabsContent value="testing" className="space-y-4">
          {SAMPLES.filter((s) => s.tests.length > 0).map((s) => (
            <div key={s.id} className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-orange-400 font-medium">{s.id}</span>
                  <span className="text-white">{s.client}</span>
                  <span className="text-gray-500 text-xs">{s.testPlan}</span>
                </div>
                <span className={cn("px-2 py-0.5 rounded text-xs font-medium", statusColor[s.status])}>{s.status}</span>
              </div>
              <div className="space-y-3">
                {s.tests.map((t) => (
                  <div key={t.name} className="bg-gray-900 rounded-lg p-3 border border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-white">{t.name}</span>
                        <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", t.status === "Completed" ? "bg-emerald-900/60 text-emerald-400" : t.status === "In Progress" ? "bg-blue-900/60 text-blue-400" : t.status === "On Hold" ? "bg-amber-900/60 text-amber-400" : "bg-gray-700 text-gray-400")}>{t.status}</span>
                      </div>
                      <span className="text-xs text-gray-400">{t.startDate} → {t.endDate}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                      <div className={cn("h-2 rounded-full transition-all", t.progress === 100 ? "bg-emerald-500" : t.status === "On Hold" ? "bg-amber-500" : "bg-orange-500")} style={{ width: `${t.progress}%` }} />
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>Equipment: <span className="text-gray-300">{t.equipment}</span></span>
                      <span>Technician: <span className="text-gray-300">{t.technician}</span></span>
                      <span>Progress: <span className="text-gray-300">{t.progress}%</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* TAB 5: Dispatch & Return */}
        <TabsContent value="dispatch" className="space-y-4">
          <div className="rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-900/80 text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Sample ID</th><th className="px-4 py-3 text-left">Client</th><th className="px-4 py-3 text-left">Tests Done</th><th className="px-4 py-3 text-left">Report #</th><th className="px-4 py-3 text-left">Dispatch Date</th><th className="px-4 py-3 text-left">Courier</th><th className="px-4 py-3 text-left">Tracking #</th><th className="px-4 py-3 text-center">Certificate</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-800/50">
                {SAMPLES.filter((s) => s.stage === "Dispatch/Return" || s.dispatchDate).map((s) => (
                  <tr key={s.id} className="hover:bg-gray-900/50">
                    <td className="px-4 py-3 font-mono text-orange-400">{s.id}</td>
                    <td className="px-4 py-3 text-white">{s.client}</td>
                    <td className="px-4 py-3 text-gray-300 text-xs">{s.tests.filter((t) => t.status === "Completed").map((t) => t.name).join(", ") || "—"}</td>
                    <td className="px-4 py-3 text-gray-300">{s.reportNumber || "—"}</td>
                    <td className="px-4 py-3 text-gray-400">{s.dispatchDate || "Pending"}</td>
                    <td className="px-4 py-3 text-gray-300">{s.courier || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{s.trackingNumber || "—"}</td>
                    <td className="px-4 py-3 text-center">{s.certificateIssued ? <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" /> : <span className="text-gray-600">—</span>}</td>
                  </tr>
                ))}
                {SAMPLES.filter((s) => s.stage === "Dispatch/Return" || s.dispatchDate).length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No dispatched samples yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
