// @ts-nocheck
'use client'

import { Link2, FileText, Database, BarChart3, FileCheck, History, ExternalLink, Copy } from 'lucide-react'
import type { ProtocolDefinition, FormRecord } from '@/lib/protocol-types'
import { cn } from '@/lib/utils'

interface TraceabilityPanelProps {
  protocol: ProtocolDefinition
  record: Partial<FormRecord>
  rawFiles: { name: string; size: number; uploadedAt: string }[]
}

function copyToClipboard(text: string) {
  navigator.clipboard?.writeText(text).catch(() => {})
}

function TraceNode({
  icon: Icon,
  label,
  value,
  color = 'gray',
  copyable,
  bold,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  color?: string
  copyable?: boolean
  bold?: boolean
}) {
  const colorMap: Record<string, string> = {
    amber: 'text-amber-600 bg-amber-50 border-amber-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    gray: 'text-gray-600 bg-gray-50 border-gray-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
  }
  return (
    <div className={cn('border rounded p-2 flex items-start gap-2', colorMap[color] || colorMap.gray)}>
      <Icon className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-medium uppercase tracking-wide opacity-70">{label}</div>
        <div className={cn('text-[11px] break-all', bold ? 'font-bold' : 'font-medium')}>{value || '—'}</div>
      </div>
      {copyable && value && (
        <button onClick={() => copyToClipboard(value)} className="flex-shrink-0 opacity-60 hover:opacity-100">
          <Copy className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

export default function TraceabilityPanel({ protocol, record, rawFiles }: TraceabilityPanelProps) {
  const traceId = record.traceabilityId || `TRC-${Date.now().toString(36).toUpperCase()}`
  const today = new Date().toISOString().split('T')[0]

  const chain = [
    { step: '1', label: 'Raw Data File(s)', desc: rawFiles.length > 0 ? rawFiles.map(f => f.name).join(', ') : 'Not uploaded', color: 'gray' as const },
    { step: '2', label: 'Master Data Sheet', desc: `MDS-${record.sampleId || 'XXXX'}-${protocol.code.replace(/\s/g, '')}`, color: 'blue' as const },
    { step: '3', label: 'Protocol Form', desc: protocol.documentFormatNumber, color: 'amber' as const },
    { step: '4', label: 'Record', desc: record.recordNumber || 'SLX-REC-PENDING', color: 'purple' as const },
    { step: '5', label: 'Test Report', desc: `RPT-${record.sampleId || 'XXXX'}-${today}`, color: 'green' as const },
  ]

  return (
    <div className="h-full overflow-y-auto space-y-4 p-3">
      {/* Document Control */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <FileCheck className="h-3 w-3" /> Document Control
        </h4>
        <div className="space-y-1.5">
          <TraceNode icon={FileText} label="Format No." value={protocol.documentFormatNumber} color="amber" copyable bold />
          <TraceNode icon={History} label="Revision" value={`Rev. ${protocol.revision}`} color="gray" />
          <TraceNode icon={FileText} label="Record No." value={record.recordNumber || 'Assigned on submit'} color="purple" copyable bold />
          <TraceNode icon={Link2} label="Traceability ID" value={traceId} color="blue" copyable />
        </div>
      </div>

      {/* Standard Reference */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <FileCheck className="h-3 w-3" /> Standard Reference
        </h4>
        <div className="space-y-1.5">
          <TraceNode icon={FileText} label="Standard" value={`${protocol.standard}:${protocol.standardYear}`} color="gray" />
          <TraceNode icon={FileText} label="Clause" value={protocol.clause} color="gray" />
          <TraceNode icon={FileText} label="Protocol" value={`${protocol.code} – ${protocol.name}`} color="gray" />
        </div>
      </div>

      {/* Data Chain */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Database className="h-3 w-3" /> Data Traceability Chain
        </h4>
        <div className="space-y-1">
          {chain.map((item, i) => {
            const colors: Record<string, string> = {
              gray: 'border-gray-200 bg-gray-50 text-gray-700',
              blue: 'border-blue-200 bg-blue-50 text-blue-700',
              amber: 'border-amber-200 bg-amber-50 text-amber-700',
              purple: 'border-purple-200 bg-purple-50 text-purple-700',
              green: 'border-green-200 bg-green-50 text-green-700',
            }
            return (
              <div key={i}>
                <div className={cn('border rounded px-2 py-1.5', colors[item.color])}>
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-bold opacity-60 flex-shrink-0">{item.step}</span>
                    <div>
                      <div className="text-[10px] font-semibold">{item.label}</div>
                      <div className="text-[10px] opacity-75 break-all">{item.desc}</div>
                    </div>
                  </div>
                </div>
                {i < chain.length - 1 && (
                  <div className="flex justify-center my-0.5">
                    <div className="w-px h-3 bg-gray-300" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Raw Files */}
      {rawFiles.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Database className="h-3 w-3" /> Raw Data Files
          </h4>
          <div className="space-y-1">
            {rawFiles.map((f, i) => (
              <div key={i} className="border rounded px-2 py-1.5 bg-gray-50 text-gray-700">
                <div className="text-[11px] font-medium truncate">{f.name}</div>
                <div className="text-[10px] text-gray-400">{(f.size / 1024).toFixed(1)} KB · {f.uploadedAt}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ISO 17025 Notice */}
      <div className="border border-blue-100 rounded p-2 bg-blue-50">
        <p className="text-[10px] text-blue-600 font-medium">ISO/IEC 17025:2017 Compliant</p>
        <p className="text-[10px] text-blue-500 mt-0.5">
          All records maintain full traceability per Clause 7.5. Raw data preserved per Clause 7.8.
        </p>
      </div>
    </div>
  )
}
