// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { getStatusColor, formatDate } from '@/lib/utils'
import { DOCUMENT_CATEGORIES } from '@/lib/constants'
import DocumentUpload from '@/components/qms/DocumentUpload'
import ApprovalWorkflow from '@/components/qms/ApprovalWorkflow'
import type { QMSDocument } from '@/lib/types'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<QMSDocument[]>([])
  const [stats, setStats] = useState({ total: 0, approved: 0, inReview: 0, draft: 0, procedures: 0, workInstructions: 0, forms: 0 })
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<QMSDocument | null>(null)

  const fetchDocuments = () => {
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (categoryFilter) params.set('category', categoryFilter)
    if (searchQuery) params.set('search', searchQuery)
    fetch(`/api/qms/documents?${params}`).then(r => r.json()).then(d => { setDocuments(d.documents); setStats(d.stats) })
  }

  useEffect(() => { fetchDocuments() }, [statusFilter, categoryFilter, searchQuery])

  const handleCreateDocument = async (data: Record<string, unknown>) => {
    await fetch('/api/qms/documents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setShowForm(false)
    fetchDocuments()
  }

  if (showForm) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Document</h1>
        <DocumentUpload onSubmit={handleCreateDocument} onCancel={() => setShowForm(false)} />
      </div>
    )
  }

  if (selectedDoc) {
    return (
      <div>
        <button onClick={() => setSelectedDoc(null)} className="text-sm text-amber-600 hover:underline mb-4">&larr; Back to Documents</button>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedDoc.documentNumber}</h1>
            <p className="text-sm text-gray-500">{selectedDoc.title}</p>
          </div>
          <span className={`text-sm font-medium px-3 py-1 rounded ${getStatusColor(selectedDoc.status)}`}>
            {selectedDoc.status.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-xs font-semibold text-gray-500 mb-3">DOCUMENT DETAILS</h3>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-gray-400 text-xs">Category</dt><dd>{DOCUMENT_CATEGORIES.find(c => c.value === selectedDoc.category)?.label}</dd></div>
              <div><dt className="text-gray-400 text-xs">Version</dt><dd>v{selectedDoc.version} (Rev. {selectedDoc.revision})</dd></div>
              <div><dt className="text-gray-400 text-xs">Author</dt><dd>{selectedDoc.author}</dd></div>
              <div><dt className="text-gray-400 text-xs">Department</dt><dd>{selectedDoc.department}</dd></div>
              <div><dt className="text-gray-400 text-xs">Standard Reference</dt><dd>{selectedDoc.standardReference}</dd></div>
              {selectedDoc.effectiveDate && <div><dt className="text-gray-400 text-xs">Effective Date</dt><dd>{formatDate(selectedDoc.effectiveDate)}</dd></div>}
              {selectedDoc.expiryDate && <div><dt className="text-gray-400 text-xs">Expiry Date</dt><dd>{formatDate(selectedDoc.expiryDate)}</dd></div>}
            </dl>
          </div>
          <ApprovalWorkflow steps={selectedDoc.approvalHistory} />
        </div>
        {selectedDoc.changeLog.length > 0 && (
          <div className="bg-white rounded-lg border p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Change Log</h3>
            <div className="space-y-2">
              {selectedDoc.changeLog.map((entry, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                  <span className="text-xs font-mono bg-gray-200 px-1.5 py-0.5 rounded">v{entry.version}</span>
                  <div>
                    <div className="text-sm">{entry.description}</div>
                    <div className="text-xs text-gray-500">{entry.author} | {entry.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {selectedDoc.content && (
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Content</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedDoc.content}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Control</h1>
          <p className="text-sm text-gray-500">SOPs, work instructions, forms, and records</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-amber-500 text-white rounded-md text-sm font-medium hover:bg-amber-600">
          + New Document
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg border p-3 text-center">
          <div className="text-xl font-bold">{stats.total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center">
          <div className="text-xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-xs text-gray-500">Approved</div>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center">
          <div className="text-xl font-bold text-amber-600">{stats.inReview}</div>
          <div className="text-xs text-gray-500">In Review</div>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center">
          <div className="text-xl font-bold text-gray-400">{stats.draft}</div>
          <div className="text-xs text-gray-500">Draft</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex flex-wrap items-center gap-3">
          <input type="text" placeholder="Search documents..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="border rounded-md px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-amber-500" />
          <div className="flex gap-1">
            {['all', 'approved', 'in_review', 'draft'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-md text-xs font-medium ${statusFilter === s ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s === 'all' ? 'All' : s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
            <option value="">All Categories</option>
            {DOCUMENT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div className="divide-y">
          {documents.map(doc => (
            <div key={doc.id} onClick={() => setSelectedDoc(doc)} className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-amber-600">{doc.documentNumber}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">v{doc.version}</span>
                </div>
                <div className="text-sm text-gray-700">{doc.title}</div>
                <div className="text-xs text-gray-400">{doc.department} | {doc.author} | {doc.standardReference}</div>
              </div>
              <div className="text-right">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(doc.status)}`}>
                  {doc.status.replace(/_/g, ' ')}
                </span>
                <div className="text-xs text-gray-400 mt-1">
                  {DOCUMENT_CATEGORIES.find(c => c.value === doc.category)?.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
