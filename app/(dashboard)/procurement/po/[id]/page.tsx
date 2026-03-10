// @ts-nocheck
"use client";

import Link from "next/link";
import { purchaseOrders } from "@/lib/data/procurement-data";
import POTimeline from "@/components/procurement/POTimeline";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { use } from "react";

export default function PODetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const po = purchaseOrders.find((p) => p.id === id);

  if (!po) {
    return (
      <div className="card text-center py-12">
        <h2 className="text-lg font-semibold text-gray-900">Purchase order not found</h2>
        <Link href="/procurement/po" className="text-primary-600 hover:underline mt-2 inline-block">Back to POs</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/procurement/po" className="text-sm text-primary-600 hover:underline">&larr; Back to Purchase Orders</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Purchase Order: {po.poNumber}</h1>
          <p className="text-sm text-gray-500">Vendor: {po.vendorName}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(po.totalAmount)}</p>
          <p className="text-xs text-gray-500">{po.paymentTerms}</p>
        </div>
      </div>

      {/* Timeline */}
      <POTimeline po={po} />

      {/* PO Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Line Items */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Line Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Specification</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Delivered</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {po.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{item.description}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 max-w-xs">{item.specification}</td>
                      <td className="px-3 py-2 text-sm text-gray-700 text-right">{item.quantity}</td>
                      <td className="px-3 py-2 text-sm text-gray-700 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.totalPrice)}</td>
                      <td className="px-3 py-2 text-right">
                        <span className={cn(
                          "text-sm font-medium",
                          item.deliveredQty >= item.quantity ? "text-green-600" :
                          item.deliveredQty > 0 ? "text-orange-600" :
                          "text-gray-400"
                        )}>
                          {item.deliveredQty}/{item.quantity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="px-3 py-2 text-sm font-semibold text-gray-900 text-right">Total</td>
                    <td className="px-3 py-2 text-sm font-bold text-gray-900 text-right">{formatCurrency(po.totalAmount)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Order Details</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Vendor</dt>
                <dd className="font-medium">
                  <Link href={`/procurement/vendors/${po.vendorId}`} className="text-primary-600 hover:underline">
                    {po.vendorName}
                  </Link>
                </dd>
              </div>
              {po.rfqId && (
                <div>
                  <dt className="text-gray-500">RFQ Reference</dt>
                  <dd className="font-medium font-mono">{po.rfqId}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Approved By</dt>
                <dd className="font-medium">{po.approvedBy}</dd>
              </div>
              {po.approvalDate && (
                <div>
                  <dt className="text-gray-500">Approval Date</dt>
                  <dd className="font-medium">{formatDate(po.approvalDate)}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Payment Terms</dt>
                <dd className="font-medium">{po.paymentTerms}</dd>
              </div>
            </dl>
          </div>

          {po.notes && (
            <div className="card">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Notes</h2>
              <p className="text-sm text-gray-600">{po.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
