// @ts-nocheck
'use client'

import { useState } from 'react'
import { PROTOCOLS_BY_STANDARD } from '@/lib/protocols'
import type { ProtocolDefinition } from '@/lib/protocol-types'
import { ChevronDown, ChevronRight, FileText, Zap, Thermometer, Eye, Shield, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORY_ICONS = {
  electrical: <Zap className="h-3 w-3" />,
  environmental: <Thermometer className="h-3 w-3" />,
  visual: <Eye className="h-3 w-3" />,
  safety: <Shield className="h-3 w-3" />,
  mechanical: <Wrench className="h-3 w-3" />,
}

const CATEGORY_COLORS = {
  electrical: 'text-blue-600 bg-blue-50',
  environmental: 'text-orange-600 bg-orange-50',
  visual: 'text-purple-600 bg-purple-50',
  safety: 'text-red-600 bg-red-50',
  mechanical: 'text-gray-600 bg-gray-100',
}

const STANDARD_COLORS: Record<string, string> = {
  'IEC 61215': 'bg-amber-500',
  'IEC 61730': 'bg-red-500',
  'IEC 61853': 'bg-blue-500',
  'IEC 61701': 'bg-teal-500',
}

interface ProtocolSelectorProps {
  selectedId: string | null
  onSelect: (protocol: ProtocolDefinition) => void
}

export default function ProtocolSelector({ selectedId, onSelect }: ProtocolSelectorProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'IEC 61215': true,
    'IEC 61730': false,
    'IEC 61853': false,
    'IEC 61701': false,
  })

  const toggle = (std: string) => setExpanded(prev => ({ ...prev, [std]: !prev[std] }))

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-3 border-b">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Protocol Library</h3>
        <p className="text-xs text-gray-400 mt-0.5">{Object.values(PROTOCOLS_BY_STANDARD).flat().length} protocols</p>
      </div>

      <div className="p-2 space-y-1">
        {Object.entries(PROTOCOLS_BY_STANDARD).map(([standard, protocols]) => (
          <div key={standard}>
            {/* Standard Group Header */}
            <button
              onClick={() => toggle(standard)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 text-left"
            >
              <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', STANDARD_COLORS[standard] || 'bg-gray-400')} />
              <span className="text-xs font-semibold text-gray-700 flex-1">{standard}</span>
              <span className="text-[10px] text-gray-400">{protocols.length}</span>
              {expanded[standard]
                ? <ChevronDown className="h-3 w-3 text-gray-400" />
                : <ChevronRight className="h-3 w-3 text-gray-400" />
              }
            </button>

            {/* Protocol List */}
            {expanded[standard] && (
              <div className="ml-3 space-y-0.5 mt-0.5">
                {protocols.map(protocol => {
                  const isSelected = selectedId === protocol.id
                  return (
                    <button
                      key={protocol.id}
                      onClick={() => onSelect(protocol)}
                      className={cn(
                        'w-full text-left px-2 py-1.5 rounded text-xs transition-colors group',
                        isSelected
                          ? 'bg-amber-50 border border-amber-200 text-amber-900'
                          : 'hover:bg-gray-50 text-gray-700'
                      )}
                    >
                      <div className="flex items-start gap-1.5">
                        <div className={cn(
                          'flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-medium flex-shrink-0 mt-0.5',
                          CATEGORY_COLORS[protocol.category]
                        )}>
                          {CATEGORY_ICONS[protocol.category]}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="font-medium text-[10px] text-gray-500">{protocol.code}</span>
                            {protocol.critical && (
                              <span className="text-[9px] bg-red-100 text-red-600 px-1 rounded">Critical</span>
                            )}
                          </div>
                          <div className="text-[11px] leading-tight text-gray-700 line-clamp-2">{protocol.name}</div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="p-3 border-t mt-2">
        <div className="text-[10px] text-gray-400 font-medium mb-1.5">Category</div>
        <div className="space-y-1">
          {Object.entries(CATEGORY_COLORS).map(([cat, cls]) => (
            <div key={cat} className="flex items-center gap-1.5">
              <div className={cn('flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px]', cls)}>
                {CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS]}
              </div>
              <span className="text-[10px] text-gray-500 capitalize">{cat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
