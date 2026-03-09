"use client";

import Link from "next/link";
import { rfqs, tbeMatrix } from "@/lib/data/procurement-data";
import TBEMatrixView from "@/components/procurement/TBEMatrix";
import RFQForm from "@/components/procurement/RFQForm";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { useState } from "react";

const rfqStatusStyles: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700",
  Issued: "bg-blue-100 text-blue-700",
  "Responses Received": "bg-yellow-100 text-yellow-700",
  Evaluated: "bg-purple-100 text-purple-700",
  Awarded: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function RFQPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState<string | null>(null);

  const selected = rfqs.find((r) => r.id === selectedRFQ);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Request for Quotation (RFQ)</h1>
        <div className="flex gap-2">
          <Link href="/procurement" className="btn-secondary text-sm">&larr; Back</Link>
          <button onClick={() => { setShowForm(!showForm); setSelectedRFQ(null); }} className="btn-primary text-sm">
            {showForm ? "Cancel" : "+ New RFQ"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New RFQ</h2>
          <RFQForm />
        </div>
      )}

      {/* RFQ List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">RFQ#</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Responses</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rfqs.map((rfq) => (
                <tr key={rfq.id} className={cn("hover:bg-gray-50", selectedRFQ === rfq.id && "bg-primary-50")}>
                  <td className="px-4 py-3 text-sm font-mono text-primary-600">{rfq.rfqNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{rfq.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{rfq.category}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatCurrency(rfq.budget)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {rfq.responseDeadline ? formatDate(rfq.responseDeadline) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("badge", rfqStatusStyles[rfq.status])}>{rfq.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{rfq.responses.length}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setSelectedRFQ(rfq.id === selectedRFQ ? null : rfq.id); setShowForm(false); }}
                      className="text-xs text-primary-600 hover:underline"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RFQ Detail */}
      {selected && (
        <div className="space-y-4">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{selected.title}</h2>
            <p className="text-sm text-gray-600 mb-4">{selected.description}</p>

            <h3 className="text-sm font-semibold text-gray-900 mb-2">Technical Specifications</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parameter</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Requirement</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mandatory</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selected.technicalSpecs.map((spec, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900">{spec.parameter}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{spec.requirement}</td>
                      <td className="px-3 py-2 text-sm text-gray-500">{spec.unit}</td>
                      <td className="px-3 py-2">
                        {spec.mandatory ? (
                          <span className="badge bg-red-100 text-red-700">Required</span>
                        ) : (
                          <span className="badge bg-gray-100 text-gray-600">Optional</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vendor Responses */}
          {selected.responses.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Vendor Responses</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Delivery</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tech Compliance</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selected.responses.map((resp) => (
                      <tr key={resp.vendorId} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">{resp.vendorName}</td>
                        <td className="px-3 py-2 text-sm text-gray-700">{formatCurrency(resp.quotedPrice)}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{resp.deliveryDays} days</td>
                        <td className="px-3 py-2">
                          <span className={cn("badge",
                            resp.technicalCompliance >= 95 ? "bg-green-100 text-green-700" :
                            resp.technicalCompliance >= 85 ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          )}>
                            {resp.technicalCompliance}%
                          </span>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500">{resp.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TBE Matrix for evaluated RFQ */}
          {selected.status === "Evaluated" && tbeMatrix.rfqId === selected.id && (
            <TBEMatrixView data={tbeMatrix} />
          )}
        </div>
      )}
    </div>
  );
}
