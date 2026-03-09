"use client";

import Link from "next/link";
import { vendors } from "@/lib/data/procurement-data";
import VendorScorecard from "@/components/procurement/VendorScorecard";
import { formatCurrency, formatDate, cn } from "@/lib/utils";


export default function VendorDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const vendor = vendors.find((v) => v.id === id);

  if (!vendor) {
    return (
      <div className="card text-center py-12">
        <h2 className="text-lg font-semibold text-gray-900">Vendor not found</h2>
        <Link href="/procurement/vendors" className="text-primary-600 hover:underline mt-2 inline-block">Back to Vendors</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/procurement/vendors" className="text-sm text-primary-600 hover:underline">&larr; Back to Vendors</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">{vendor.name}</h1>
        <p className="text-sm text-gray-500">{vendor.category} | {vendor.address}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Contact Person</dt>
                <dd className="font-medium">{vendor.contactPerson}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Email</dt>
                <dd className="font-medium">{vendor.email}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Phone</dt>
                <dd className="font-medium">{vendor.phone}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Address</dt>
                <dd className="font-medium">{vendor.address}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Approved Since</dt>
                <dd className="font-medium">{vendor.approvedDate ? formatDate(vendor.approvedDate) : "N/A"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Last Evaluation</dt>
                <dd className="font-medium">{formatDate(vendor.evaluationDate)}</dd>
              </div>
            </dl>
          </div>

          {/* Purchase History */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Purchase History</h2>
            {vendor.purchaseHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">PO#</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vendor.purchaseHistory.map((ph) => (
                      <tr key={ph.poNumber} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm font-mono text-gray-600">{ph.poNumber}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{formatDate(ph.date)}</td>
                        <td className="px-3 py-2 text-sm text-gray-700">{ph.item}</td>
                        <td className="px-3 py-2 text-sm font-medium">{formatCurrency(ph.amount)}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg
                                key={i}
                                className={cn("h-4 w-4", i < Math.floor(ph.rating) ? "text-yellow-400" : "text-gray-200")}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="text-xs text-gray-500 ml-1">{ph.rating}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No purchase history</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <VendorScorecard vendor={vendor} />

          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Certifications</h2>
            <div className="space-y-2">
              {vendor.certifications.map((cert) => (
                <div key={cert} className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-700">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
