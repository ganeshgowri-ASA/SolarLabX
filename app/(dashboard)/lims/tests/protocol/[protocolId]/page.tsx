// @ts-nocheck
'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getProtocolById } from '@/lib/protocols'
import ProtocolForm from '@/components/protocol-form/ProtocolForm'
import TraceabilityPanel from '@/components/protocol-form/TraceabilityPanel'
import { useState } from 'react'
import type { FormRecord } from '@/lib/protocol-types'
import { ArrowLeft, ExternalLink, ClipboardList } from 'lucide-react'

export default function ProtocolFullPage() {
  const params = useParams()
  const protocolId = params?.protocolId as string
  const protocol = getProtocolById(protocolId)

  const [record, setRecord] = useState<Partial<FormRecord>>({})
  const [rawFiles, setRawFiles] = useState<{ name: string; size: number; uploadedAt: string }[]>([])

  const handleSave = (rec: Partial<FormRecord>) => {
    setRecord(rec)
    setRawFiles(rec.rawDataFiles || [])
  }

  const handleSubmit = (rec: FormRecord) => {
    setRecord(rec)
    setRawFiles(rec.rawDataFiles || [])
  }

  if (!protocol) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-8">
        <ClipboardList className="h-12 w-12 text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700">Protocol Not Found</h2>
        <p className="text-sm text-gray-400 mt-1 mb-4">
          No protocol found with ID: <code className="font-mono bg-gray-100 px-1 rounded">{protocolId}</code>
        </p>
        <Link href="/lims/tests" className="text-amber-600 hover:underline text-sm flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Back to Protocol Library
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0 -m-4 md:-m-6">
      {/* ── Breadcrumb + Header ── */}
      <div className="px-6 py-3 bg-white border-b flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/lims" className="hover:text-amber-600">LIMS</Link>
          <span>/</span>
          <Link href="/lims/tests" className="hover:text-amber-600">Tests</Link>
          <span>/</span>
          <Link href="/lims/tests" className="hover:text-amber-600">{protocol.standard}</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">{protocol.code}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="hidden sm:inline">Format: <span className="font-mono text-amber-700">{protocol.documentFormatNumber}</span></span>
          <Link
            href="/lims/tests"
            className="flex items-center gap-1 px-3 py-1.5 border rounded text-gray-600 hover:bg-gray-50 text-xs"
          >
            <ExternalLink className="h-3 w-3" />
            Protocol Library
          </Link>
        </div>
      </div>

      {/* ── Main: Form + Traceability Panel ── */}
      <div className="flex flex-1 min-h-[calc(100vh-130px)]">
        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <ProtocolForm
            key={protocol.id}
            protocol={protocol}
            onSave={handleSave}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Traceability Sidebar */}
        <div className="w-56 flex-shrink-0 border-l bg-gray-50 overflow-y-auto hidden lg:block">
          <div className="px-3 py-2 border-b bg-white">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Traceability</h3>
          </div>
          <TraceabilityPanel
            protocol={protocol}
            record={record}
            rawFiles={rawFiles}
          />
        </div>
      </div>
    </div>
  )
}
