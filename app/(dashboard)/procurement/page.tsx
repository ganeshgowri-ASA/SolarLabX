// @ts-nocheck
"use client";

import { useState } from "react";
import {
  ShoppingCart, Users, ClipboardCheck, Star, Wrench, FileText,
  Plus, Pencil, Trash2, Check, X, AlertTriangle, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  SAMPLE DATA                                                       */
/* ------------------------------------------------------------------ */

const initialSuppliers = [
  { id: 1, name: "MBJ Solutions GmbH", category: "Equipment", status: "Approved", rating: 5, lastAudit: "2025-11-15", nextReview: "2026-11-15", certifications: ["ISO 9001", "ISO 17025"], contact: "sales@mbj.de" },
  { id: 2, name: "Eternal Sun B.V.", category: "Equipment", status: "Approved", rating: 4, lastAudit: "2025-09-20", nextReview: "2026-09-20", certifications: ["ISO 9001"], contact: "info@eternalsun.com" },
  { id: 3, name: "Kipp & Zonen", category: "Calibration", status: "Approved", rating: 5, lastAudit: "2025-10-01", nextReview: "2026-10-01", certifications: ["ISO 9001", "ISO 17025"], contact: "support@kippzonen.com" },
  { id: 4, name: "Espec Corp", category: "Equipment", status: "Conditional", rating: 3, lastAudit: "2025-06-10", nextReview: "2026-06-10", certifications: ["ISO 9001", "ISO 14001"], contact: "global@espec.co.jp" },
  { id: 5, name: "National Instruments", category: "Equipment", status: "Approved", rating: 4, lastAudit: "2025-08-22", nextReview: "2026-08-22", certifications: ["ISO 9001"], contact: "ni.support@ni.com" },
  { id: 6, name: "Fluke Calibration", category: "Calibration", status: "Approved", rating: 5, lastAudit: "2025-12-05", nextReview: "2026-12-05", certifications: ["ISO 9001", "ISO 17025"], contact: "calibration@fluke.com" },
  { id: 7, name: "LabChem Supplies", category: "Materials", status: "Under Review", rating: 3, lastAudit: "2025-03-18", nextReview: "2026-03-18", certifications: ["ISO 9001"], contact: "orders@labchem.in" },
];

const subcontractors = [
  { id: 1, name: "TÜV Rheinland", scope: "IEC 61730 Safety Testing", status: "Qualified", agreementStart: "2024-01-01", agreementEnd: "2026-12-31", score: 95, competency: "IEC 61730, IEC 62109" },
  { id: 2, name: "UL Solutions", scope: "Fire Safety Classification", status: "Qualified", agreementStart: "2024-06-01", agreementEnd: "2026-05-31", score: 92, competency: "UL 61730, IEC 61730-2 MST" },
  { id: 3, name: "SGS India", scope: "Environmental Testing (Salt Mist, Ammonia)", status: "Provisional", agreementStart: "2025-01-01", agreementEnd: "2026-12-31", score: 78, competency: "IEC 61701, IEC 62716" },
  { id: 4, name: "NABL Calibration Lab", scope: "Reference Cell Calibration", status: "Qualified", agreementStart: "2024-04-01", agreementEnd: "2026-03-31", score: 98, competency: "IEC 60904-2, IEC 60904-4" },
];

const ppapElements = [
  "Design Records", "Engineering Change Documents", "Customer Engineering Approval", "Design FMEA",
  "Process Flow Diagram", "Process FMEA", "Control Plan", "MSA Studies",
  "Dimensional Results", "Material/Performance Test Results", "Initial Process Studies", "Qualified Lab Documentation",
  "Appearance Approval Report", "Sample Production Parts", "Master Sample", "Checking Aids",
  "Customer-Specific Requirements", "Part Submission Warrant",
];

const evaluationCriteria = [
  { criterion: "Quality", weight: 40, subCriteria: ["Defect rate < 0.5%", "ISO 17025 accredited", "CAPA response < 5 days", "Certificate validity"] },
  { criterion: "Delivery", weight: 25, subCriteria: ["On-time delivery > 95%", "Lead time adherence", "Packaging compliance", "Documentation accuracy"] },
  { criterion: "Cost", weight: 20, subCriteria: ["Price competitiveness", "Payment terms", "Total cost of ownership", "Value engineering"] },
  { criterion: "Service", weight: 15, subCriteria: ["Technical support response", "Training provided", "Warranty terms", "After-sales service"] },
];

const equipmentCatalog = [
  { id: 1, type: "Solar Simulator", make: "Eternal Sun", model: "SunSim 3C-A+A+A+", specs: "Class A+A+A+, 2m×2m, AM1.5G", leadTime: "16 weeks", warranty: "2 years", amc: "₹12L/year", calibProvider: "In-house" },
  { id: 2, type: "Environmental Chamber", make: "Espec", model: "PL-4KPH", specs: "-40°C to +85°C, 10-95% RH, 4000L", leadTime: "20 weeks", warranty: "2 years", amc: "₹8L/year", calibProvider: "Espec Service" },
  { id: 3, type: "EL Camera", make: "Greateyes", model: "GE 1024 1024 BI", specs: "1024×1024, InGaAs, 900-1700nm", leadTime: "8 weeks", warranty: "1 year", amc: "₹3L/year", calibProvider: "Greateyes" },
  { id: 4, type: "IV Curve Tracer", make: "Sinton", model: "FCT-450", specs: "0-20A, 0-100V, ±0.5%", leadTime: "6 weeks", warranty: "1 year", amc: "₹2L/year", calibProvider: "Sinton" },
  { id: 5, type: "Reference Cell", make: "Kipp & Zonen", model: "SP Lite2", specs: "Si reference, ±5% uncertainty", leadTime: "4 weeks", warranty: "2 years", amc: "Annual recal", calibProvider: "Kipp & Zonen" },
  { id: 6, type: "IR Camera", make: "FLIR", model: "T865", specs: "640×480, -20 to 650°C, ±1°C", leadTime: "4 weeks", warranty: "2 years", amc: "₹1.5L/year", calibProvider: "Fluke Calibration" },
];

const purchaseOrders = [
  { id: 1, po: "PO-2026-001", date: "2026-01-15", supplier: "Espec Corp", items: "PL-4KPH Environmental Chamber", amount: "₹85,00,000", status: "Ordered", approver: "Lab Director" },
  { id: 2, po: "PO-2026-002", date: "2026-01-28", supplier: "Fluke Calibration", items: "Annual Calibration Service (12 instruments)", amount: "₹4,50,000", status: "Approved", approver: "QA Manager" },
  { id: 3, po: "PO-2026-003", date: "2026-02-05", supplier: "Kipp & Zonen", items: "SP Lite2 Reference Cell (×3)", amount: "₹6,75,000", status: "Received", approver: "Lab Director" },
  { id: 4, po: "PO-2026-004", date: "2026-02-18", supplier: "LabChem Supplies", items: "IPA, DI Water, Flux (quarterly supply)", amount: "₹1,20,000", status: "Draft", approver: "—" },
  { id: 5, po: "PO-2026-005", date: "2026-03-01", supplier: "National Instruments", items: "cDAQ-9174 + modules (×2)", amount: "₹12,30,000", status: "Pending Approval", approver: "Lab Director" },
  { id: 6, po: "PO-2026-006", date: "2026-03-10", supplier: "Eternal Sun B.V.", items: "Lamp replacement kit for SunSim 3C", amount: "₹18,50,000", status: "Approved", approver: "Lab Director" },
];

/* ------------------------------------------------------------------ */
/*  TABS                                                              */
/* ------------------------------------------------------------------ */

const tabs = [
  { id: "suppliers", label: "Approved Suppliers", icon: Users },
  { id: "subcontractors", label: "Subcontractors", icon: ClipboardCheck },
  { id: "evaluation", label: "Supplier Evaluation", icon: Star },
  { id: "equipment", label: "Equipment & Services", icon: Wrench },
  { id: "orders", label: "Purchase Orders", icon: FileText },
];

const statusStyles: Record<string, string> = {
  Approved: "bg-green-100 text-green-700",
  Conditional: "bg-yellow-100 text-yellow-700",
  "Under Review": "bg-blue-100 text-blue-700",
  Qualified: "bg-green-100 text-green-700",
  Provisional: "bg-yellow-100 text-yellow-700",
  Draft: "bg-gray-100 text-gray-700",
  "Pending Approval": "bg-yellow-100 text-yellow-700",
  Ordered: "bg-purple-100 text-purple-700",
  Received: "bg-green-100 text-green-700",
  Closed: "bg-gray-100 text-gray-600",
};

const riskColor = (score: number) => {
  if (score >= 90) return "bg-green-100 text-green-700";
  if (score >= 75) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
};

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                         */
/* ------------------------------------------------------------------ */

export default function ProcurementPage() {
  const [activeTab, setActiveTab] = useState("suppliers");
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: "", category: "Equipment", contact: "" });
  const [ppapChecked, setPpapChecked] = useState<Record<number, boolean>>({});

  const addSupplier = () => {
    if (!newSupplier.name) return;
    setSuppliers((prev) => [...prev, {
      id: prev.length + 1, name: newSupplier.name, category: newSupplier.category,
      status: "Under Review", rating: 0, lastAudit: "—", nextReview: "—",
      certifications: [], contact: newSupplier.contact,
    }]);
    setNewSupplier({ name: "", category: "Equipment", contact: "" });
    setShowAddForm(false);
  };

  const deleteSupplier = (id: number) => setSuppliers((prev) => prev.filter((s) => s.id !== id));

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("h-3.5 w-3.5", i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200")} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Procurement & Supply Chain</h1>
        <p className="text-sm text-gray-500 mt-1">ISO 17025 Clause 6.6 — Externally provided products and services</p>
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

      {/* TAB: Approved Suppliers */}
      {activeTab === "suppliers" && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Approved Supplier List</h2>
            <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary text-sm flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add Supplier
            </button>
          </div>
          {showAddForm && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Supplier Name</label>
                <input value={newSupplier.name} onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Company name" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select value={newSupplier.category} onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })}
                  className="rounded border border-gray-300 px-3 py-2 text-sm">
                  {["Equipment", "Calibration", "Materials", "Services"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Contact</label>
                <input value={newSupplier.contact} onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="email@example.com" />
              </div>
              <button onClick={addSupplier} className="btn-primary text-sm"><Check className="h-4 w-4" /></button>
              <button onClick={() => setShowAddForm(false)} className="btn-secondary text-sm"><X className="h-4 w-4" /></button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>{["Supplier", "Category", "Status", "Rating", "Last Audit", "Next Review", "Certifications", "Contact", ""].map((h) => (
                  <th key={h} className="px-3 py-3 text-left font-semibold text-gray-700">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 font-medium text-gray-900">{s.name}</td>
                    <td className="px-3 py-3 text-gray-600">{s.category}</td>
                    <td className="px-3 py-3"><span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", statusStyles[s.status])}>{s.status}</span></td>
                    <td className="px-3 py-3">{renderStars(s.rating)}</td>
                    <td className="px-3 py-3 text-gray-500">{s.lastAudit}</td>
                    <td className="px-3 py-3 text-gray-500">{s.nextReview}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1 flex-wrap">{s.certifications.map((c) => (
                        <span key={c} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-xs">{c}</span>
                      ))}</div>
                    </td>
                    <td className="px-3 py-3 text-gray-500 text-xs">{s.contact}</td>
                    <td className="px-3 py-3">
                      <button onClick={() => deleteSupplier(s.id)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Subcontractors */}
      {activeTab === "subcontractors" && (
        <div className="card overflow-x-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subcontractor Register</h2>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>{["Name", "Scope of Work", "Status", "Agreement Period", "Performance", "Competency"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-700">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subcontractors.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.scope}</td>
                  <td className="px-4 py-3"><span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", statusStyles[s.status])}>{s.status}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{s.agreementStart} → {s.agreementEnd}</td>
                  <td className="px-4 py-3"><span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", riskColor(s.score))}>{s.score}%</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{s.competency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: Supplier Evaluation */}
      {activeTab === "evaluation" && (
        <div className="space-y-6">
          {/* Weighted Scorecard */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Supplier Scorecard — Weighted Criteria</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {evaluationCriteria.map((e) => (
                <div key={e.criterion} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{e.criterion}</h3>
                    <span className="text-lg font-bold text-orange-600">{e.weight}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${e.weight}%` }} />
                  </div>
                  <ul className="space-y-1">
                    {e.subCriteria.map((sc) => (
                      <li key={sc} className="text-xs text-gray-500 flex items-start gap-1.5">
                        <Check className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />{sc}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* PPAP Checklist */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">PPAP Checklist (18 Elements)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {ppapElements.map((el, i) => (
                <label key={i} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer text-sm">
                  <input type="checkbox" checked={!!ppapChecked[i]} onChange={() => setPpapChecked((p) => ({ ...p, [i]: !p[i] }))}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                  <span className="text-gray-700">{i + 1}. {el}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Completed: {Object.values(ppapChecked).filter(Boolean).length} / {ppapElements.length}
            </div>
          </div>

          {/* Risk Rating */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Supplier Risk Rating</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>{["Supplier", "Quality", "Delivery", "Cost", "Service", "Overall", "Risk"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-gray-700">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { name: "MBJ Solutions", q: 95, d: 92, c: 85, s: 90, overall: 92, risk: "Low" },
                    { name: "Espec Corp", q: 78, d: 70, c: 88, s: 75, overall: 77, risk: "Medium" },
                    { name: "LabChem Supplies", q: 65, d: 60, c: 92, s: 55, overall: 67, risk: "High" },
                    { name: "Fluke Calibration", q: 98, d: 95, c: 80, s: 96, overall: 94, risk: "Low" },
                  ].map((s) => (
                    <tr key={s.name} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                      <td className="px-4 py-3">{s.q}%</td>
                      <td className="px-4 py-3">{s.d}%</td>
                      <td className="px-4 py-3">{s.c}%</td>
                      <td className="px-4 py-3">{s.s}%</td>
                      <td className="px-4 py-3 font-semibold">{s.overall}%</td>
                      <td className="px-4 py-3">
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium",
                          s.risk === "Low" ? "bg-green-100 text-green-700" : s.risk === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                        )}>{s.risk}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Equipment & Services */}
      {activeTab === "equipment" && (
        <div className="card overflow-x-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Approved Equipment Catalog</h2>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>{["Type", "Make / Model", "Specifications", "Lead Time", "Warranty", "AMC", "Calib. Provider"].map((h) => (
                <th key={h} className="px-3 py-3 text-left font-semibold text-gray-700">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {equipmentCatalog.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 font-medium text-gray-900">{e.type}</td>
                  <td className="px-3 py-3 text-gray-700">{e.make} <span className="text-gray-400">{e.model}</span></td>
                  <td className="px-3 py-3 text-gray-500 text-xs max-w-xs">{e.specs}</td>
                  <td className="px-3 py-3 text-gray-600">{e.leadTime}</td>
                  <td className="px-3 py-3 text-gray-600">{e.warranty}</td>
                  <td className="px-3 py-3 text-gray-500 text-xs">{e.amc}</td>
                  <td className="px-3 py-3 text-gray-500 text-xs">{e.calibProvider}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: Purchase Orders */}
      {activeTab === "orders" && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Purchase Order Tracking</h2>
            <button className="btn-primary text-sm flex items-center gap-1"><Plus className="h-4 w-4" /> New PO</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>{["PO #", "Date", "Supplier", "Items", "Amount", "Status", "Approver"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-700">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-medium text-orange-600">{po.po}</td>
                    <td className="px-4 py-3 text-gray-500">{po.date}</td>
                    <td className="px-4 py-3 text-gray-700">{po.supplier}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{po.items}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{po.amount}</td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", statusStyles[po.status] || "bg-gray-100 text-gray-700")}>{po.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{po.approver}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
