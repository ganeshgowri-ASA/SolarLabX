"use client";

import Link from "next/link";
import { rfqs, purchaseOrders, vendors, procurementMetrics } from "@/lib/data/procurement-data";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useState } from "react";

// ── Status Styles ──────────────────────────────────────────────────────────────

const rfqStatusStyles: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700",
  Issued: "bg-blue-100 text-blue-700",
  "Responses Received": "bg-yellow-100 text-yellow-700",
  Evaluated: "bg-purple-100 text-purple-700",
  Awarded: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const poStatusStyles: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700",
  "Pending Approval": "bg-yellow-100 text-yellow-700",
  Approved: "bg-blue-100 text-blue-700",
  Ordered: "bg-purple-100 text-purple-700",
  "Partial Delivery": "bg-orange-100 text-orange-700",
  Delivered: "bg-green-100 text-green-700",
  Closed: "bg-gray-100 text-gray-600",
};

const prStatusStyles: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700",
  "Pending Approval": "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Ordered: "bg-blue-100 text-blue-700",
  Rejected: "bg-red-100 text-red-700",
};

const grnStatusStyles: Record<string, string> = {
  Accepted: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Partial: "bg-orange-100 text-orange-700",
};

const urgencyStyles: Record<string, string> = {
  Low: "bg-blue-100 text-blue-700",
  Normal: "bg-green-100 text-green-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-100 text-red-700",
};

const PIE_COLORS = ["#9ca3af", "#f59e0b", "#3b82f6", "#8b5cf6", "#22c55e", "#ef4444", "#6b7280", "#14b8a6"];

// ── Mock Data ──────────────────────────────────────────────────────────────────

const purchaseRequisitions = [
  {
    id: "PR-2026-001",
    title: "Xenon Arc Lamp Replacement",
    requestor: "Anil Mehta",
    department: "UV Testing",
    urgency: "High" as const,
    status: "Approved" as const,
    estimatedCost: 45000,
    dateSubmitted: "2026-02-10",
    approvalChain: [
      { name: "Raj Krishnan", role: "Lab Manager", status: "Approved", date: "2026-02-11" },
      { name: "Vikram Singh", role: "Procurement Head", status: "Approved", date: "2026-02-12" },
      { name: "Dr. S. Raghavan", role: "Director", status: "Approved", date: "2026-02-13" },
    ],
    justification: "Current lamp has exceeded 1500hr rated life. UV preconditioning tests on hold.",
    linkedRfq: "RFQ-2026-001",
  },
  {
    id: "PR-2026-002",
    title: "Environmental Test Chamber - TC/HF Combined",
    requestor: "Vikram Singh",
    department: "Environmental Testing",
    urgency: "Critical" as const,
    status: "Pending Approval" as const,
    estimatedCost: 850000,
    dateSubmitted: "2026-02-20",
    approvalChain: [
      { name: "Raj Krishnan", role: "Lab Manager", status: "Approved", date: "2026-02-21" },
      { name: "Vikram Singh", role: "Procurement Head", status: "Approved", date: "2026-02-22" },
      { name: "Dr. S. Raghavan", role: "Director", status: "Pending", date: null },
    ],
    justification: "Existing chamber reaching end-of-life. Needed for IEC 61215 MQT 11/12 capacity expansion.",
    linkedRfq: "RFQ-2026-002",
  },
  {
    id: "PR-2026-003",
    title: "Reference Cell Annual Calibration",
    requestor: "Priya Nair",
    department: "Metrology",
    urgency: "Normal" as const,
    status: "Draft" as const,
    estimatedCost: 25000,
    dateSubmitted: "2026-03-05",
    approvalChain: [],
    justification: "Annual calibration due per ISO 17025 schedule. 6 reference cells require recalibration.",
    linkedRfq: null,
  },
  {
    id: "PR-2026-004",
    title: "EL Camera Cooling System Repair Parts",
    requestor: "Suresh Kumar",
    department: "EL/IR Imaging",
    urgency: "High" as const,
    status: "Ordered" as const,
    estimatedCost: 18500,
    dateSubmitted: "2026-01-28",
    approvalChain: [
      { name: "Raj Krishnan", role: "Lab Manager", status: "Approved", date: "2026-01-29" },
      { name: "Vikram Singh", role: "Procurement Head", status: "Approved", date: "2026-01-30" },
    ],
    justification: "CCD cooler malfunction causing noise in EL images. Urgent repair needed.",
    linkedRfq: null,
  },
  {
    id: "PR-2026-005",
    title: "Pt100 Temperature Sensors (Batch)",
    requestor: "Anil Mehta",
    department: "Thermal Testing",
    urgency: "Low" as const,
    status: "Approved" as const,
    estimatedCost: 17000,
    dateSubmitted: "2026-02-01",
    approvalChain: [
      { name: "Raj Krishnan", role: "Lab Manager", status: "Approved", date: "2026-02-02" },
      { name: "Vikram Singh", role: "Procurement Head", status: "Approved", date: "2026-02-03" },
    ],
    justification: "Replenishment stock for thermal cycling and humidity freeze tests.",
    linkedRfq: null,
  },
  {
    id: "PR-2026-006",
    title: "SCADA Software License Renewal",
    requestor: "Deepak Joshi",
    department: "IT/Automation",
    urgency: "Normal" as const,
    status: "Rejected" as const,
    estimatedCost: 35000,
    dateSubmitted: "2026-02-15",
    approvalChain: [
      { name: "Raj Krishnan", role: "Lab Manager", status: "Approved", date: "2026-02-16" },
      { name: "Vikram Singh", role: "Procurement Head", status: "Rejected", date: "2026-02-17" },
    ],
    justification: "Annual license renewal for chamber monitoring SCADA system.",
    linkedRfq: null,
  },
];

const goodsReceiptNotes = [
  {
    id: "GRN-2026-001",
    poNumber: "PO-2026-002",
    vendorName: "SolarTest Instruments",
    receivedDate: "2026-03-03",
    receivedBy: "Suresh Kumar",
    items: [
      { description: "Pt100 Temperature Sensors (Class A)", orderedQty: 20, receivedQty: 20, acceptedQty: 20 },
      { description: "Type T Thermocouple Wire (100m roll)", orderedQty: 5, receivedQty: 5, acceptedQty: 5 },
    ],
    inspectionResult: "Accepted" as const,
    inspectionNotes: "All items verified against IEC 60751 and IEC 60584 specifications. Calibration certificates received.",
    inspectedBy: "Priya Nair",
    storageLocation: "Store A - Rack 3",
  },
  {
    id: "GRN-2026-002",
    poNumber: "PO-2025-048",
    vendorName: "LabTech Global",
    receivedDate: "2025-12-10",
    receivedBy: "Anil Mehta",
    items: [
      { description: "Secondary Reference Cell Set (6 units)", orderedQty: 6, receivedQty: 6, acceptedQty: 6 },
    ],
    inspectionResult: "Accepted" as const,
    inspectionNotes: "All reference cells verified with PTB traceability certificates. Spectral response within calibration uncertainty.",
    inspectedBy: "Priya Nair",
    storageLocation: "Metrology Lab - Climate Cabinet",
  },
  {
    id: "GRN-2026-003",
    poNumber: "PO-2025-035",
    vendorName: "PV Equipment Solutions",
    receivedDate: "2025-09-20",
    receivedBy: "Suresh Kumar",
    items: [
      { description: "EL Camera System InGaAs 1280x1024", orderedQty: 1, receivedQty: 1, acceptedQty: 0 },
    ],
    inspectionResult: "Rejected" as const,
    inspectionNotes: "Camera sensor shows dead pixels exceeding acceptance criteria (>5 dead pixels in central 90% area). Returned to vendor for replacement.",
    inspectedBy: "Deepak Joshi",
    storageLocation: "N/A - Returned",
  },
  {
    id: "GRN-2026-004",
    poNumber: "PO-2026-001",
    vendorName: "LabTech Global",
    receivedDate: "2026-03-19",
    receivedBy: "Anil Mehta",
    items: [
      { description: "Xenon Arc Lamp XL-700 for UV Preconditioning", orderedQty: 2, receivedQty: 1, acceptedQty: 1 },
    ],
    inspectionResult: "Partial" as const,
    inspectionNotes: "1 of 2 lamps received and passed FAT. Second lamp shipment delayed, expected 2026-03-25.",
    inspectedBy: "Priya Nair",
    storageLocation: "UV Lab - Lamp Storage",
  },
  {
    id: "GRN-2025-089",
    poNumber: "PO-2024-078",
    vendorName: "ChamberTech Asia",
    receivedDate: "2025-02-15",
    receivedBy: "Vikram Singh",
    items: [
      { description: "Damp Heat Chamber 15m3", orderedQty: 1, receivedQty: 1, acceptedQty: 1 },
    ],
    inspectionResult: "Accepted" as const,
    inspectionNotes: "Chamber installed and commissioned. SAT completed - temperature uniformity ±1.8C, humidity ±2.5% RH. All within spec.",
    inspectedBy: "Raj Krishnan",
    storageLocation: "Environmental Test Bay 3",
  },
];

const inventoryItems = [
  { id: "INV-001", name: "Xenon Arc Lamp XL-700", category: "Consumables", location: "UV Lab - Lamp Storage", currentStock: 1, reorderPoint: 2, unit: "pcs", unitCost: 22250, lastRestocked: "2026-03-19", supplier: "LabTech Global" },
  { id: "INV-002", name: "Pt100 Temperature Sensor (Class A)", category: "Consumables", location: "Store A - Rack 3", currentStock: 24, reorderPoint: 10, unit: "pcs", unitCost: 850, lastRestocked: "2026-03-03", supplier: "SolarTest Instruments" },
  { id: "INV-003", name: "Type T Thermocouple Wire (100m)", category: "Consumables", location: "Store A - Rack 3", currentStock: 7, reorderPoint: 3, unit: "rolls", unitCost: 3200, lastRestocked: "2026-03-03", supplier: "SolarTest Instruments" },
  { id: "INV-004", name: "Reference Cell - Mono-Si", category: "Calibration Standards", location: "Metrology Lab", currentStock: 2, reorderPoint: 1, unit: "pcs", unitCost: 53333, lastRestocked: "2025-12-10", supplier: "LabTech Global" },
  { id: "INV-005", name: "EVA Encapsulant Film (30m roll)", category: "Consumables", location: "Store B - Rack 1", currentStock: 3, reorderPoint: 5, unit: "rolls", unitCost: 4500, lastRestocked: "2025-11-20", supplier: "PV Equipment Solutions" },
  { id: "INV-006", name: "Solar Simulator Flash Tube", category: "Spare Parts", location: "Sun Sim Lab - Spares", currentStock: 1, reorderPoint: 2, unit: "pcs", unitCost: 35000, lastRestocked: "2025-08-15", supplier: "SolarTest Instruments" },
  { id: "INV-007", name: "Insulation Resistance Test Leads", category: "Consumables", location: "Safety Test Area", currentStock: 8, reorderPoint: 4, unit: "sets", unitCost: 1200, lastRestocked: "2026-01-10", supplier: "SolarTest Instruments" },
  { id: "INV-008", name: "Desiccant Cartridge (Chamber)", category: "Spare Parts", location: "Environmental Lab - Spares", currentStock: 4, reorderPoint: 6, unit: "pcs", unitCost: 2800, lastRestocked: "2025-10-05", supplier: "ChamberTech Asia" },
  { id: "INV-009", name: "BNC-to-MC4 Adapter Cable Set", category: "Consumables", location: "Store A - Rack 5", currentStock: 12, reorderPoint: 5, unit: "sets", unitCost: 650, lastRestocked: "2026-02-18", supplier: "PV Equipment Solutions" },
  { id: "INV-010", name: "UV Sensor (280-400nm)", category: "Spare Parts", location: "UV Lab - Spares", currentStock: 0, reorderPoint: 2, unit: "pcs", unitCost: 8500, lastRestocked: "2025-06-12", supplier: "Atlas Environmental Systems" },
];

const projectBudgets = [
  { project: "IEC 61215 Qualification - TrinaSolar", allocated: 420000, spent: 312000, committed: 44500, poCount: 5 },
  { project: "IEC 61730 Safety - LONGi Green", allocated: 280000, spent: 195000, committed: 18500, poCount: 3 },
  { project: "IEC 61853 Energy Rating - Adani Solar", allocated: 350000, spent: 128000, committed: 25000, poCount: 2 },
  { project: "Lab Capacity Expansion 2026", allocated: 1500000, spent: 620000, committed: 850000, poCount: 4 },
];

// ── Tab definitions ────────────────────────────────────────────────────────────

const TABS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "requisitions", label: "Purchase Requisitions" },
  { key: "vendors", label: "Vendor Management" },
  { key: "orders", label: "Purchase Orders" },
  { key: "receiving", label: "Material Receiving" },
  { key: "inventory", label: "Inventory" },
  { key: "budget", label: "Budget Tracking" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// ── Component ──────────────────────────────────────────────────────────────────

export default function ProcurementDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");

  const openPOs = purchaseOrders.filter((po) => !["Closed", "Delivered"].includes(po.status));
  const pendingRFQs = rfqs.filter((r) => ["Draft", "Issued"].includes(r.status));
  const totalBudget = procurementMetrics.budgetUtilization.reduce((s, b) => s + b.budget, 0);
  const totalSpent = procurementMetrics.budgetUtilization.reduce((s, b) => s + b.spent, 0);

  const lowStockItems = inventoryItems.filter((i) => i.currentStock <= i.reorderPoint);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Procurement Management</h1>
        <div className="flex gap-2">
          <Link href="/procurement/rfq" className="btn-secondary text-sm">New RFQ</Link>
          <Link href="/procurement/po" className="btn-primary text-sm">New PO</Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-0 -mb-px overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ───────── Dashboard Tab ───────── */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Open POs</p>
              <p className="text-3xl font-bold text-primary-600 mt-1">{openPOs.length}</p>
              <p className="text-xs text-gray-400 mt-1">{purchaseOrders.length} total</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Pending RFQs</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{pendingRFQs.length}</p>
              <p className="text-xs text-gray-400 mt-1">{rfqs.length} total</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Active Vendors</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{vendors.filter((v) => v.status === "Active").length}</p>
              <p className="text-xs text-gray-400 mt-1">Approved suppliers</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Budget Utilization</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{Math.round((totalSpent / totalBudget) * 100)}%</p>
              <p className="text-xs text-gray-400 mt-1">{formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}</p>
            </div>
          </div>

          {/* Additional quick metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Pending Requisitions</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{purchaseRequisitions.filter((pr) => pr.status === "Pending Approval").length}</p>
              <p className="text-xs text-gray-400 mt-1">Awaiting approval</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Low Stock Items</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{lowStockItems.length}</p>
              <p className="text-xs text-gray-400 mt-1">At or below reorder point</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Pending GRNs</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{goodsReceiptNotes.filter((g) => g.inspectionResult === "Partial").length}</p>
              <p className="text-xs text-gray-400 mt-1">Partial deliveries</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Budget by Category</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={procurementMetrics.budgetUtilization} margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val: number) => formatCurrency(val)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="budget" name="Budget" fill="#93c5fd" />
                  <Bar dataKey="spent" name="Spent" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">PO Status Distribution</h2>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={procurementMetrics.poStatusSummary}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="count"
                    nameKey="status"
                    label={({ status, count }) => `${status}: ${count}`}
                    labelLine={false}
                  >
                    {procurementMetrics.poStatusSummary.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent RFQs */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Active RFQs</h2>
              <button onClick={() => setActiveTab("orders")} className="text-xs text-primary-600 hover:underline">View All Orders</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">RFQ#</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Responses</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rfqs.map((rfq) => (
                    <tr key={rfq.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-primary-600">{rfq.rfqNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{rfq.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{rfq.category}</td>
                      <td className="px-4 py-3 text-sm font-medium">{formatCurrency(rfq.budget)}</td>
                      <td className="px-4 py-3">
                        <span className={cn("badge", rfqStatusStyles[rfq.status])}>{rfq.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{rfq.responses.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────── Purchase Requisitions Tab ───────── */}
      {activeTab === "requisitions" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Purchase Requisitions</h2>
              <p className="text-sm text-gray-500">Manage procurement requests and approval workflows</p>
            </div>
            <button className="btn-primary text-sm">New Requisition</button>
          </div>

          {/* PR summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(["Draft", "Pending Approval", "Approved", "Ordered", "Rejected"] as const).map((status) => {
              const count = purchaseRequisitions.filter((pr) => pr.status === status).length;
              return (
                <div key={status} className="card text-center">
                  <p className="text-xs text-gray-500 uppercase">{status}</p>
                  <p className="text-2xl font-bold mt-1">{count}</p>
                </div>
              );
            })}
          </div>

          {/* PR Table */}
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">PR#</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Requestor</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Urgency</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Est. Cost</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchaseRequisitions.map((pr) => (
                    <tr key={pr.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-primary-600">{pr.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{pr.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{pr.requestor}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{pr.department}</td>
                      <td className="px-4 py-3">
                        <span className={cn("badge", urgencyStyles[pr.urgency])}>{pr.urgency}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">{formatCurrency(pr.estimatedCost)}</td>
                      <td className="px-4 py-3">
                        <span className={cn("badge", prStatusStyles[pr.status])}>{pr.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(pr.dateSubmitted)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Approval Chain Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {purchaseRequisitions
              .filter((pr) => pr.approvalChain.length > 0)
              .slice(0, 4)
              .map((pr) => (
                <div key={pr.id} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">{pr.id} - Approval Chain</h3>
                    <span className={cn("badge", prStatusStyles[pr.status])}>{pr.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{pr.title}</p>
                  <div className="space-y-2">
                    {pr.approvalChain.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
                          step.status === "Approved" ? "bg-green-500" : step.status === "Rejected" ? "bg-red-500" : "bg-yellow-400"
                        )}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{step.name}</p>
                          <p className="text-xs text-gray-500">{step.role}</p>
                        </div>
                        <div className="text-right">
                          <span className={cn(
                            "badge text-xs",
                            step.status === "Approved" ? "bg-green-100 text-green-700" : step.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                          )}>
                            {step.status}
                          </span>
                          {step.date && <p className="text-xs text-gray-400 mt-0.5">{formatDate(step.date)}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  {pr.linkedRfq && (
                    <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100">
                      Linked RFQ: <span className="font-mono text-primary-600">{pr.linkedRfq}</span>
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ───────── Vendor Management Tab ───────── */}
      {activeTab === "vendors" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Vendor Management</h2>
              <p className="text-sm text-gray-500">Approved vendor list, performance ratings, and audit schedule</p>
            </div>
            <button className="btn-primary text-sm">Add Vendor</button>
          </div>

          {/* Vendor Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{vendor.name}</h3>
                    <p className="text-xs text-gray-500">{vendor.category} | {vendor.address}</p>
                  </div>
                  <span className="badge bg-green-100 text-green-700">{vendor.status}</span>
                </div>

                {/* Performance Scores */}
                <div className="grid grid-cols-5 gap-1 mb-3">
                  {[
                    { label: "Overall", score: vendor.overallScore },
                    { label: "Quality", score: vendor.qualityScore },
                    { label: "Delivery", score: vendor.deliveryScore },
                    { label: "Price", score: vendor.priceScore },
                    { label: "Service", score: vendor.serviceScore },
                  ].map(({ label, score }) => (
                    <div key={label} className="text-center">
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className={cn(
                        "text-sm font-bold",
                        score >= 90 ? "text-green-600" : score >= 80 ? "text-blue-600" : score >= 70 ? "text-yellow-600" : "text-red-600"
                      )}>
                        {score}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Score bar */}
                <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                  <div
                    className={cn(
                      "h-2 rounded-full",
                      vendor.overallScore >= 90 ? "bg-green-500" : vendor.overallScore >= 80 ? "bg-blue-500" : "bg-yellow-500"
                    )}
                    style={{ width: `${vendor.overallScore}%` }}
                  />
                </div>

                {/* Certifications */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {vendor.certifications.map((cert) => (
                    <span key={cert} className="badge bg-gray-100 text-gray-600 text-xs">{cert}</span>
                  ))}
                </div>

                {/* Contact */}
                <div className="text-xs text-gray-500 space-y-0.5 border-t border-gray-100 pt-2">
                  <p><span className="font-medium text-gray-700">Contact:</span> {vendor.contactPerson}</p>
                  <p><span className="font-medium text-gray-700">Email:</span> {vendor.email}</p>
                  <p><span className="font-medium text-gray-700">Approved:</span> {vendor.approvedDate ? formatDate(vendor.approvedDate) : "Pending"}</p>
                  <p><span className="font-medium text-gray-700">Last Evaluation:</span> {formatDate(vendor.evaluationDate)}</p>
                </div>

                {/* Purchase History Summary */}
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    {vendor.purchaseHistory.length} orders |
                    Total: {formatCurrency(vendor.purchaseHistory.reduce((s, p) => s + p.amount, 0))} |
                    Avg Rating: {(vendor.purchaseHistory.reduce((s, p) => s + p.rating, 0) / vendor.purchaseHistory.length).toFixed(1)}/5.0
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Vendor Audit Schedule */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Vendor Audit / Evaluation Schedule</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Evaluation</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Next Due</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendors.map((vendor) => {
                    const lastEval = new Date(vendor.evaluationDate);
                    const nextDue = new Date(lastEval);
                    nextDue.setFullYear(nextDue.getFullYear() + 1);
                    const now = new Date();
                    const daysUntil = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    const auditStatus = daysUntil < 0 ? "Overdue" : daysUntil < 60 ? "Due Soon" : "On Track";
                    return (
                      <tr key={vendor.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{vendor.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{vendor.category}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(vendor.evaluationDate)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(nextDue.toISOString())}</td>
                        <td className="px-4 py-3 text-sm font-bold">
                          <span className={cn(
                            vendor.overallScore >= 90 ? "text-green-600" : vendor.overallScore >= 80 ? "text-blue-600" : "text-yellow-600"
                          )}>
                            {vendor.overallScore}/100
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "badge",
                            auditStatus === "Overdue" ? "bg-red-100 text-red-700" : auditStatus === "Due Soon" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                          )}>
                            {auditStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────── Purchase Orders Tab ───────── */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Purchase Orders</h2>
              <p className="text-sm text-gray-500">Track all purchase orders and delivery status</p>
            </div>
            <Link href="/procurement/po" className="btn-primary text-sm">Create PO</Link>
          </div>

          {/* PO Table */}
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">PO#</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">FAT/SAT</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Approved By</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expected</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actual</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono">
                        <Link href={`/procurement/po/${po.id}`} className="text-primary-600 hover:underline">{po.poNumber}</Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{po.vendorName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{po.items.length} item{po.items.length > 1 ? "s" : ""}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(po.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <span className={cn("badge", poStatusStyles[po.status])}>{po.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge bg-gray-100 text-gray-600">{po.fatSatStatus}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{po.approvedBy}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(po.expectedDelivery)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{po.actualDelivery ? formatDate(po.actualDelivery) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PO Line Item Details */}
          {purchaseOrders.map((po) => (
            <div key={po.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{po.poNumber} - Line Items</h3>
                  <p className="text-xs text-gray-500">{po.vendorName} | Payment: {po.paymentTerms}</p>
                </div>
                <span className={cn("badge", poStatusStyles[po.status])}>{po.status}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Specification</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Delivered</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {po.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm text-gray-900">{item.description}</td>
                        <td className="px-3 py-2 text-xs text-gray-500 max-w-xs truncate">{item.specification}</td>
                        <td className="px-3 py-2 text-sm text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-3 py-2 text-sm text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                        <td className="px-3 py-2 text-sm text-right">
                          <span className={cn(
                            item.deliveredQty === item.quantity ? "text-green-600" : item.deliveredQty > 0 ? "text-orange-600" : "text-gray-400"
                          )}>
                            {item.deliveredQty}/{item.quantity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {po.notes && (
                <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">Note: {po.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ───────── Material Receiving Tab ───────── */}
      {activeTab === "receiving" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Material Receiving &amp; Inspection</h2>
              <p className="text-sm text-gray-500">Goods Receipt Notes (GRN) and quality inspection records</p>
            </div>
            <button className="btn-primary text-sm">Create GRN</button>
          </div>

          {/* GRN summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card text-center">
              <p className="text-xs text-gray-500 uppercase">Accepted</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{goodsReceiptNotes.filter((g) => g.inspectionResult === "Accepted").length}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-gray-500 uppercase">Partial</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{goodsReceiptNotes.filter((g) => g.inspectionResult === "Partial").length}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-gray-500 uppercase">Rejected</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{goodsReceiptNotes.filter((g) => g.inspectionResult === "Rejected").length}</p>
            </div>
          </div>

          {/* GRN Table */}
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">GRN#</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">PO#</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Received Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Received By</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Inspection</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Inspector</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Storage</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {goodsReceiptNotes.map((grn) => (
                    <tr key={grn.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-primary-600">{grn.id}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-700">{grn.poNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{grn.vendorName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(grn.receivedDate)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{grn.receivedBy}</td>
                      <td className="px-4 py-3">
                        <span className={cn("badge", grnStatusStyles[grn.inspectionResult])}>{grn.inspectionResult}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{grn.inspectedBy}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{grn.storageLocation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* GRN Detail Cards */}
          {goodsReceiptNotes.map((grn) => (
            <div key={grn.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{grn.id} - Inspection Details</h3>
                  <p className="text-xs text-gray-500">{grn.vendorName} | PO: {grn.poNumber}</p>
                </div>
                <span className={cn("badge", grnStatusStyles[grn.inspectionResult])}>{grn.inspectionResult}</span>
              </div>
              <div className="overflow-x-auto mb-3">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Ordered</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Received</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Accepted</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {grn.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-sm text-gray-900">{item.description}</td>
                        <td className="px-3 py-2 text-sm text-right">{item.orderedQty}</td>
                        <td className="px-3 py-2 text-sm text-right">{item.receivedQty}</td>
                        <td className="px-3 py-2 text-sm text-right">
                          <span className={cn(
                            item.acceptedQty === item.orderedQty ? "text-green-600 font-medium" : item.acceptedQty > 0 ? "text-orange-600 font-medium" : "text-red-600 font-medium"
                          )}>
                            {item.acceptedQty}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                <span className="font-medium text-gray-700">Inspection Notes:</span> {grn.inspectionNotes}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ───────── Inventory Tab ───────── */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Inventory Management</h2>
              <p className="text-sm text-gray-500">Test consumables, spare parts, and calibration standards tracking</p>
            </div>
            <button className="btn-primary text-sm">Add Item</button>
          </div>

          {/* Inventory summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Items</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{inventoryItems.length}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Low Stock Alerts</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{lowStockItems.length}</p>
              <p className="text-xs text-gray-400 mt-1">At or below reorder point</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Out of Stock</p>
              <p className="text-3xl font-bold text-red-800 mt-1">{inventoryItems.filter((i) => i.currentStock === 0).length}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Inventory Value</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatCurrency(inventoryItems.reduce((s, i) => s + i.currentStock * i.unitCost, 0))}
              </p>
            </div>
          </div>

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <div className="card border-l-4 border-l-red-500">
              <h3 className="text-sm font-semibold text-red-700 mb-2">Low Stock / Reorder Required</h3>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.map((item) => (
                  <span key={item.id} className="badge bg-red-50 text-red-700">
                    {item.name}: {item.currentStock}/{item.reorderPoint} {item.unit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Inventory Table */}
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Reorder Pt</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Restocked</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryItems.map((item) => {
                    const stockStatus = item.currentStock === 0 ? "Out of Stock" : item.currentStock <= item.reorderPoint ? "Low Stock" : "In Stock";
                    const stockStyle = item.currentStock === 0 ? "bg-red-100 text-red-700" : item.currentStock <= item.reorderPoint ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700";
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs font-mono text-gray-500">{item.id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{item.location}</td>
                        <td className="px-4 py-3 text-sm text-right font-bold">
                          <span className={cn(item.currentStock <= item.reorderPoint ? "text-red-600" : "text-gray-900")}>
                            {item.currentStock} {item.unit}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-500">{item.reorderPoint} {item.unit}</td>
                        <td className="px-4 py-3 text-sm text-right">{formatCurrency(item.unitCost)}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(item.currentStock * item.unitCost)}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{item.supplier}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{formatDate(item.lastRestocked)}</td>
                        <td className="px-4 py-3">
                          <span className={cn("badge", stockStyle)}>{stockStatus}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────── Budget Tracking Tab ───────── */}
      {activeTab === "budget" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Budget Tracking</h2>
              <p className="text-sm text-gray-500">Per-project budget allocation and utilization</p>
            </div>
          </div>

          {/* Overall Budget Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Allocated</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(projectBudgets.reduce((s, p) => s + p.allocated, 0))}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Spent</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{formatCurrency(projectBudgets.reduce((s, p) => s + p.spent, 0))}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Committed (Open POs)</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{formatCurrency(projectBudgets.reduce((s, p) => s + p.committed, 0))}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Available</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {formatCurrency(projectBudgets.reduce((s, p) => s + p.allocated - p.spent - p.committed, 0))}
              </p>
            </div>
          </div>

          {/* Project Budget Chart */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Budget Allocation vs. Utilization by Project</h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={projectBudgets} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="project" tick={{ fontSize: 9 }} interval={0} angle={-10} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: number) => formatCurrency(val)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="allocated" name="Allocated" fill="#93c5fd" />
                <Bar dataKey="spent" name="Spent" fill="#3b82f6" />
                <Bar dataKey="committed" name="Committed" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Budget Chart */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Budget by Category</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={procurementMetrics.budgetUtilization} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: number) => formatCurrency(val)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="budget" name="Budget" fill="#93c5fd" />
                <Bar dataKey="spent" name="Spent" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Project Budget Table */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Project Budget Details</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Allocated</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Spent</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Committed</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Available</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Utilization</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">POs</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projectBudgets.map((proj) => {
                    const available = proj.allocated - proj.spent - proj.committed;
                    const utilization = Math.round(((proj.spent + proj.committed) / proj.allocated) * 100);
                    return (
                      <tr key={proj.project} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{proj.project}</td>
                        <td className="px-4 py-3 text-sm text-right">{formatCurrency(proj.allocated)}</td>
                        <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium">{formatCurrency(proj.spent)}</td>
                        <td className="px-4 py-3 text-sm text-right text-orange-600">{formatCurrency(proj.committed)}</td>
                        <td className="px-4 py-3 text-sm text-right">
                          <span className={cn(available < 0 ? "text-red-600 font-bold" : "text-green-600 font-medium")}>
                            {formatCurrency(available)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 justify-end">
                            <div className="w-20 bg-gray-100 rounded-full h-2">
                              <div
                                className={cn(
                                  "h-2 rounded-full",
                                  utilization > 90 ? "bg-red-500" : utilization > 70 ? "bg-yellow-500" : "bg-green-500"
                                )}
                                style={{ width: `${Math.min(utilization, 100)}%` }}
                              />
                            </div>
                            <span className={cn(
                              "text-sm font-bold",
                              utilization > 90 ? "text-red-600" : utilization > 70 ? "text-yellow-600" : "text-green-600"
                            )}>
                              {utilization}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">{proj.poCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
                    <td className="px-4 py-3 text-sm text-right font-bold">{formatCurrency(projectBudgets.reduce((s, p) => s + p.allocated, 0))}</td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-blue-600">{formatCurrency(projectBudgets.reduce((s, p) => s + p.spent, 0))}</td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-orange-600">{formatCurrency(projectBudgets.reduce((s, p) => s + p.committed, 0))}</td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-600">{formatCurrency(projectBudgets.reduce((s, p) => s + p.allocated - p.spent - p.committed, 0))}</td>
                    <td className="px-4 py-3 text-sm text-right font-bold">
                      {Math.round(((projectBudgets.reduce((s, p) => s + p.spent + p.committed, 0)) / projectBudgets.reduce((s, p) => s + p.allocated, 0)) * 100)}%
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold">{projectBudgets.reduce((s, p) => s + p.poCount, 0)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
