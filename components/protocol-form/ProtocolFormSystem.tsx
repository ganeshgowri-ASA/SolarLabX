// @ts-nocheck
'use client'

import { useState } from 'react'
import type { ProtocolDefinition, FormRecord } from '@/lib/protocol-types'
import ProtocolSelector from './ProtocolSelector'
import ProtocolForm from './ProtocolForm'
import TraceabilityPanel from './TraceabilityPanel'
import { ClipboardList, FileText, ArrowLeft, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ProtocolFormSystem() {
  const [selected, setSelected] = useState<ProtocolDefinition | null>(null)
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

  return (
    <div className="flex h-[calc(100vh-130px)] bg-white border rounded-lg overflow-hidden">
      {/* ── LEFT: Protocol Selector ────────────────────────── */}
      <div className="w-64 flex-shrink-0 border-r bg-gray-50 overflow-hidden flex flex-col">
        <ProtocolSelector
          selectedId={selected?.id || null}
          onSelect={(p) => {
            setSelected(p)
            setRecord({})
            setRawFiles([])
          }}
        />
      </div>

      {/* ── CENTER: Form ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {!selected ? (
          <EmptyState />
        ) : (
          <div className="p-4">
            <ProtocolForm
              key={selected.id}
              protocol={selected}
              onSave={handleSave}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </div>

      {/* ── RIGHT: Traceability Panel ─────────────────────── */}
      {selected && (
        <div className="w-56 flex-shrink-0 border-l bg-gray-50 overflow-hidden">
          <div className="p-2 border-b bg-white">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Traceability</h3>
          </div>
          <TraceabilityPanel
            protocol={selected}
            record={record}
            rawFiles={rawFiles}
          />
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8">
      <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
        <ClipboardList className="h-8 w-8 text-amber-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-700">Select a Test Protocol</h3>
      <p className="text-sm text-gray-400 mt-2 max-w-xs">
        Choose a protocol from the library on the left to open the checksheet form.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 text-left max-w-sm">
        {[
          { std: 'IEC 61215', desc: '20 MQTs – Design Qualification', color: 'amber' },
          { std: 'IEC 61730', desc: '10 MSTs – Safety Qualification', color: 'red' },
          { std: 'IEC 61853', desc: '3 protocols – Energy Rating', color: 'blue' },
          { std: 'IEC 61701', desc: 'Salt Mist Corrosion', color: 'teal' },
        ].map(s => {
          const colors: Record<string, string> = {
            amber: 'border-amber-200 bg-amber-50', red: 'border-red-200 bg-red-50',
            blue: 'border-blue-200 bg-blue-50', teal: 'border-teal-200 bg-teal-50',
          }
          const textColors: Record<string, string> = {
            amber: 'text-amber-700', red: 'text-red-700', blue: 'text-blue-700', teal: 'text-teal-700',
          }
          return (
            <div key={s.std} className={cn('border rounded p-3', colors[s.color])}>
              <div className={cn('text-xs font-bold', textColors[s.color])}>{s.std}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{s.desc}</div>
            </div>
          )
        })}
      </div>
      <div className="mt-6 p-3 bg-gray-50 border rounded text-xs text-gray-500 max-w-sm">
        <BookOpen className="h-3 w-3 inline mr-1" />
        Each protocol form includes pre-filled IEC test conditions, raw data upload
        (CSV/Excel), auto-fill from flasher data, IV curve visualization, pass/fail
        evaluation, and ISO 17025 document control numbering.
      </div>
    </div>
  )
}
