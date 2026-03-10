// @ts-nocheck
'use client'

import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { flowcharts, type FlowchartNode } from '@/lib/data/flowchart-data'
import FlowchartCanvas from './FlowchartCanvas'
import {
  Workflow,
  Download,
  Info,
  X,
  ChevronRight,
  FileText,
  Shield,
  Zap,
  GitBranch,
  Building2,
} from 'lucide-react'

const flowchartIcons: Record<string, React.ElementType> = {
  'iec-61215': FileText,
  'iec-61730': Shield,
  'iec-61853': Zap,
  'iec-62915-bom': GitBranch,
  'lab-workflow': Building2,
}

export default function FlowchartsPage() {
  const [selectedFlowchart, setSelectedFlowchart] = useState(flowcharts[0].id)
  const [selectedNode, setSelectedNode] = useState<FlowchartNode | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const currentFlowchart = flowcharts.find(f => f.id === selectedFlowchart) || flowcharts[0]

  const handleNodeClick = useCallback((node: FlowchartNode) => {
    setSelectedNode(node)
  }, [])

  const handleExportPdf = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Test Workflow Flowcharts</h1>
          <p className="text-sm text-muted-foreground">
            Interactive IEC/ISO test sequence flowcharts for PV module qualification
          </p>
        </div>
        <button
          onClick={handleExportPdf}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export PDF
        </button>
      </div>

      {/* Flowchart Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {flowcharts.map(fc => {
          const Icon = flowchartIcons[fc.id] || Workflow
          const isActive = selectedFlowchart === fc.id
          return (
            <button
              key={fc.id}
              onClick={() => {
                setSelectedFlowchart(fc.id)
                setSelectedNode(null)
              }}
              className={cn(
                'flex flex-col items-start gap-2 p-4 rounded-lg border text-left transition-all',
                isActive
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-card border-border hover:border-primary/50 text-card-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-muted-foreground')} />
              <div>
                <div className="text-sm font-semibold">{fc.standard}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">{fc.description}</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Flowchart */}
        <div className="lg:col-span-3" ref={printRef}>
          <div className="rounded-lg border bg-card">
            <div className="flex items-center gap-2 px-4 py-3 border-b">
              <Workflow className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">{currentFlowchart.title}</h2>
            </div>
            <FlowchartCanvas
              flowchart={currentFlowchart}
              onNodeClick={handleNodeClick}
            />
          </div>
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Legend */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Legend</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 rounded-full bg-green-800 border border-green-500" />
                <span className="text-muted-foreground">Start / End</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 rounded bg-[#1e3a5f] border border-blue-500" />
                <span className="text-muted-foreground">Process Step</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 bg-[#92400e] border border-orange-500 rotate-45 scale-75" />
                <span className="text-muted-foreground">Decision Point</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-6 h-4 rounded bg-purple-900 border border-purple-500">
                  <div className="absolute inset-0.5 rounded border border-purple-500/50" />
                </div>
                <span className="text-muted-foreground">Sub-process</span>
              </div>
            </div>
          </div>

          {/* Node Details */}
          {selectedNode ? (
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Node Details</h3>
                <button onClick={() => setSelectedNode(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Name</div>
                  <div className="font-medium">{selectedNode.label.replace(/\n/g, ' ')}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Type</div>
                  <span className={cn(
                    'inline-block px-2 py-0.5 rounded text-xs font-medium capitalize',
                    selectedNode.type === 'start' && 'bg-green-100 text-green-800',
                    selectedNode.type === 'end' && 'bg-red-100 text-red-800',
                    selectedNode.type === 'process' && 'bg-blue-100 text-blue-800',
                    selectedNode.type === 'decision' && 'bg-orange-100 text-orange-800',
                    selectedNode.type === 'subprocess' && 'bg-purple-100 text-purple-800',
                  )}>
                    {selectedNode.type}
                  </span>
                </div>
                {selectedNode.standard && (
                  <div>
                    <div className="text-xs text-muted-foreground">Standard Reference</div>
                    <div className="font-medium text-primary">{selectedNode.standard}</div>
                  </div>
                )}
                {selectedNode.description && (
                  <div>
                    <div className="text-xs text-muted-foreground">Description</div>
                    <div>{selectedNode.description}</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Info className="h-4 w-4" />
                <p className="text-sm">Click any node in the flowchart to view its details</p>
              </div>
            </div>
          )}

          {/* Node List */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">
              Steps ({currentFlowchart.nodes.length})
            </h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {currentFlowchart.nodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition-colors',
                    selectedNode?.id === node.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent'
                  )}
                >
                  <ChevronRight className="h-3 w-3 shrink-0" />
                  <span className="truncate">{node.label.replace(/\n/g, ' ')}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
