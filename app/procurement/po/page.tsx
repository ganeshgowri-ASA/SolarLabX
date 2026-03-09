"use client";

import Link from "next/link";
import { purchaseOrders } from "@/lib/data/procurement-data";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

const poStatusStyles: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700",
  "Pending Approval": "bg-yellow-100 text-yellow-700",
  Approved: "bg-blue-100 text-blue-700",
  Ordered: "bg-purple-100 text-purple-700",
  "Partial Delivery": "bg-orange-100 text-orange-700",
  Delivered: "bg-green-100 text-green-700",
  Closed: "bg-gray-100 text-gray-600",
};

export default function PurchaseOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
        <Link href="/procurement" className="btn-secondary text-sm">&larr; Back to Procurement</Link>
      </div>

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
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Delivery</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Approved By</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">
                    <Link href={`/procurement/po/${po.id}`} className="text-primary-600 hover:underline">
                      {po.poNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{po.vendorName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{po.items.length} item(s)</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(po.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("badge", poStatusStyles[po.status])}>{po.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge bg-gray-100 text-gray-600 text-[10px]">{po.fatSatStatus}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(po.orderDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {po.actualDelivery ? (
                      <span className="text-green-600">{formatDate(po.actualDelivery)}</span>
                    ) : (
                      formatDate(po.expectedDelivery)
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{po.approvedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
