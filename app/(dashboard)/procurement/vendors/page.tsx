// @ts-nocheck
"use client";

import Link from "next/link";
import { vendors } from "@/lib/data/procurement-data";
import VendorScorecard from "@/components/procurement/VendorScorecard";
import { cn, formatDate } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-gray-100 text-gray-600",
  Blacklisted: "bg-red-100 text-red-700",
  "Under Evaluation": "bg-yellow-100 text-yellow-700",
};

export default function VendorsPage() {
  const sortedVendors = [...vendors].sort((a, b) => b.overallScore - a.overallScore);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Registry</h1>
        <Link href="/procurement" className="btn-secondary text-sm">&larr; Back to Procurement</Link>
      </div>

      {/* Vendor Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedVendors.map((vendor) => (
          <Link key={vendor.id} href={`/procurement/vendors/${vendor.id}`}>
            <VendorScorecard vendor={vendor} />
          </Link>
        ))}
      </div>

      {/* Vendor Table */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Approved Vendor List (AVL)</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Certifications</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Eval</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedVendors.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/procurement/vendors/${v.id}`} className="text-sm font-medium text-primary-600 hover:underline">
                      {v.name}
                    </Link>
                    <p className="text-xs text-gray-500">{v.address}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{v.category}</td>
                  <td className="px-4 py-3">
                    <span className={cn("badge", statusStyles[v.status])}>{v.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("font-bold text-sm",
                      v.overallScore >= 85 ? "text-green-600" :
                      v.overallScore >= 70 ? "text-yellow-600" :
                      "text-red-600"
                    )}>
                      {v.overallScore}/100
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <p>{v.contactPerson}</p>
                    <p className="text-xs text-gray-400">{v.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {v.certifications.map((c) => (
                        <span key={c} className="badge bg-primary-50 text-primary-700 text-[10px]">{c}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(v.evaluationDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
