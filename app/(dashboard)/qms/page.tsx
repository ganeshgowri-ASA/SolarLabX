'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getStatusColor } from '@/lib/utils'
import type { QMSDocument, CAPA } from '@/lib/types'
import { mockComplianceRequirements } from '@/lib/mock-data'

export default function QMSDashboard() {
  const [docStats, setDocStats] = useState({ total: 0, approved: 0, inReview: 0, draft: 0, procedures: 0, workInstructions: 0, forms: 0 })
  const [capaStats, setCapaStats] = useState({ total: 0, open: 0, corrective: 0, preventive: 0, overdue: 0 })
  const [recentDocs, setRecentDocs] = useState<QMSDocument[]>([])
  const [openCAPAs, setOpenCAPAs] = useState<CAPA[]>([])

  const complianceScore = Math.round(
    (mockComplianceRequirements.filter(r => r.status === 'compliant').length / mockComplianceRequirements.length) * 100
  )

  useEffect(() => {
    fetch('/api/qms/documents').then(r => r.json()).then(d => { setDocStats(d.stats); setRecentDocs(d.documents.slice(0, 5)) })
    fetch('/api/qms/capa').then(r => r.json()).then(d => { setCapaStats(d.stats); setOpenCAPAs(d.capas.filter((c: CAPA) => !['closed', 'verified'].includes(c.status))) })
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">QMS Dashboard</h1>
        <p className="text-sm text-gray-500">Quality Management System - ISO 17025 / NABL</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500">Compliance Score</div>
          <div className={`text-3xl font-bold ${complianceScore >= 90 ? 'text-green-600' : complianceScore >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
            {complianceScore}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div className={`h-1.5 rounded-full ${complianceScore >= 90 ? 'bg-green-500' : complianceScore >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${complianceScore}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500">Documents</div>
          <div className="text-2xl font-bold">{docStats.total}</div>
          <div className="text-xs text-green-600">{docStats.approved} approved</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500">Open CAPAs</div>
          <div className="text-2xl font-bold text-amber-600">{capaStats.open}</div>
          {capaStats.overdue > 0 && <div className="text-xs text-red-600">{capaStats.overdue} overdue</div>}
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500">Pending Reviews</div>
          <div className="text-2xl font-bold text-blue-600">{docStats.inReview}</div>
          <div className="text-xs text-gray-400">documents in review</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Recent Documents</h2>
            <Link href="/qms/documents" className="text-xs text-amber-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-2">
            {recentDocs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                <div>
                  <div className="text-sm font-medium">{doc.documentNumber}</div>
                  <div className="text-xs text-gray-500">{doc.title}</div>
                  <div className="text-xs text-gray-400">v{doc.version} | {doc.author}</div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(doc.status)}`}>
                  {doc.status.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Open CAPAs</h2>
            <Link href="/qms/capa" className="text-xs text-amber-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-2">
            {openCAPAs.map(capa => (
              <Link key={capa.id} href={`/qms/capa/${capa.id}`}>
                <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer">
                  <div>
                    <div className="text-sm font-medium">{capa.capaNumber}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">{capa.title}</div>
                    <div className="text-xs text-gray-400">Assigned: {capa.assignedTo}</div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(capa.type === 'corrective' ? 'destructive' : 'pending')}`}>
                      {capa.type}
                    </span>
                    <div className={`text-xs mt-1 ${getStatusColor(capa.priority)}`}>{capa.priority}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Quick Navigation</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link href="/qms/documents" className="p-3 border rounded hover:bg-gray-50 text-center">
            <div className="text-sm font-medium">Document Control</div>
            <div className="text-xs text-gray-500">SOPs, Work Instructions, Forms</div>
          </Link>
          <Link href="/qms/capa" className="p-3 border rounded hover:bg-gray-50 text-center">
            <div className="text-sm font-medium">CAPA Management</div>
            <div className="text-xs text-gray-500">Corrective & Preventive Actions</div>
          </Link>
          <Link href="/qms/compliance" className="p-3 border rounded hover:bg-gray-50 text-center">
            <div className="text-sm font-medium">Compliance Matrix</div>
            <div className="text-xs text-gray-500">ISO 17025 / NABL Gap Analysis</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
