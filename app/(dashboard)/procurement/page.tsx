// @ts-nocheck
"use client";

import Link from "next/link";
import { rfqs, purchaseOrders, vendors, procurementMetrics } from "@/lib/data/procurement-data";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

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

const PIE_COLORS = ["#9ca3af", "#f59e0b", "#3b82f6", "#8b5cf6", "#22c55e", "#ef4444", "#6b7280", "#14b8a6"];

export default function ProcurementDashboard() {
  const openPOs = purchaseOrders.filter((po) => !["Closed", "Delivered"].includes(po.status));
  const pendingRFQs = rfqs.filter((r) => ["Draft", "Issued"].includes(r.status));
  const totalBudget = procurementMetrics.budgetUtilization.reduce((s, b) => s + b.budget, 0);
  const totalSpent = procurementMetrics.budgetUtilization.reduce((s, b) => s + b.spent, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Procurement Management</h1>
        <div className="flex gap-2">
          <Link href="/procurement/rfq" className="btn-secondary text-sm">RFQs</Link>
          <Link href="/procurement/vendors" className="btn-secondary text-sm">Vendors</Link>
          <Link href="/procurement/po" className="btn-primary text-sm">Purchase Orders</Link>
        </div>
      </div>

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

      {/* Recent POs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Recent Purchase Orders</h2>
          <Link href="/procurement/po" className="text-xs text-primary-600 hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">PO#</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">FAT/SAT</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expected</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">
                    <Link href={`/procurement/po/${po.id}`} className="text-primary-600 hover:underline">{po.poNumber}</Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{po.vendorName}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(po.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("badge", poStatusStyles[po.status])}>{po.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge bg-gray-100 text-gray-600">{po.fatSatStatus}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(po.expectedDelivery)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent RFQs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Active RFQs</h2>
          <Link href="/procurement/rfq" className="text-xs text-primary-600 hover:underline">View All</Link>
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
  );
}
