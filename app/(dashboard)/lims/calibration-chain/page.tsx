// @ts-nocheck
'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  GitBranch,
  Download,
  Info,
  X,
} from 'lucide-react'
import {
  CALIBRATION_NODES,
  CalibrationNode,
  Measurand,
  nodeStatus,
  daysUntilExpiry,
} from '@/lib/calibration-chain'

// ─── constants ────────────────────────────────────────────────────────────────

const TIER_ORDER: Record<string, number> = { NMI: 0, Reference: 1, Working: 2, Instrument: 3 }
const TIER_LABEL: Record<string, string> = {
  NMI: 'National Measurement Institute',
  Reference: 'Reference Standard',
  Working: 'Working Standard',
  Instrument: 'Measuring Instrument',
}

const STATUS_COLOR = {
  valid: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-800', dot: 'bg-green-500' },
  amber: { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-800', dot: 'bg-amber-500' },
  expired: { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-800', dot: 'bg-red-500' },
}

const MEASURANDS: Measurand[] = ['Irradiance', 'Voltage', 'Current', 'Temperature', 'Resistance', 'Mass']

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ node }: { node: CalibrationNode }) {
  const status = nodeStatus(node)
  const days = daysUntilExpiry(node)
  if (status === 'expired') return (
    <span className="inline-flex items-center gap-1 text-xs text-red-700 font-medium">
      <XCircle className="w-3 h-3" /> Expired {Math.abs(days)}d ago
    </span>
  )
  if (status === 'amber') return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-medium">
      <AlertTriangle className="w-3 h-3" /> Expires in {days}d
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium">
      <CheckCircle2 className="w-3 h-3" /> Valid · {days}d
    </span>
  )
}

// ─── DetailPanel ──────────────────────────────────────────────────────────────

function DetailPanel({ node, onClose }: { node: CalibrationNode; onClose: () => void }) {
  const status = nodeStatus(node)
  const colors = STATUS_COLOR[status]
  const ancestors = useMemo(() => {
    const chain: CalibrationNode[] = []
    let cur = CALIBRATION_NODES.find((n) => n.id === node.calibratedBy)
    while (cur) {
      chain.unshift(cur)
      cur = CALIBRATION_NODES.find((n) => n.id === cur!.calibratedBy)
    }
    return chain
  }, [node])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`px-5 py-4 ${colors.bg} border-b ${colors.border}`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-0.5">
                {TIER_LABEL[node.type]}
              </p>
              <h2 className="text-base font-bold text-gray-900">{node.name}</h2>
              <p className="text-sm text-gray-600">{node.model}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 mt-0.5">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-0.5">Certificate No.</p>
              <p className="font-mono text-gray-800 text-xs">{node.certNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-0.5">Lab / Issuer</p>
              <p className="text-gray-800 text-xs">{node.lab}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-0.5">Calibration Date</p>
              <p className="text-gray-800">{node.certDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-0.5">Expiry Date</p>
              <p className={`font-semibold ${status === 'expired' ? 'text-red-700' : status === 'amber' ? 'text-amber-700' : 'text-gray-800'}`}>
                {node.expiryDate}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-0.5">Expanded Uncertainty (k=2)</p>
              <p className="text-gray-800">{node.uncertainty}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-0.5">Status</p>
              <StatusBadge node={node} />
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Measurands</p>
            <div className="flex flex-wrap gap-1.5">
              {node.measurands.map((m) => (
                <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
              ))}
            </div>
          </div>

          {ancestors.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1.5">Traceability Chain</p>
              <div className="flex flex-wrap items-center gap-1 text-xs text-gray-700">
                {ancestors.map((a, i) => (
                  <span key={a.id} className="flex items-center gap-1">
                    {i > 0 && <span className="text-gray-400">→</span>}
                    <span className={`px-2 py-0.5 rounded ${STATUS_COLOR[nodeStatus(a)].bg} ${STATUS_COLOR[nodeStatus(a)].text} font-medium`}>
                      {a.name}
                    </span>
                  </span>
                ))}
                <span className="text-gray-400">→</span>
                <span className={`px-2 py-0.5 rounded font-bold ${colors.bg} ${colors.text}`}>{node.name}</span>
              </div>
            </div>
          )}

          {(status === 'expired' || status === 'amber') && (
            <div className={`rounded-lg p-3 ${colors.bg} border ${colors.border}`}>
              <p className={`text-xs font-semibold ${colors.text} mb-0.5 flex items-center gap-1.5`}>
                {status === 'expired' ? <XCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {status === 'expired' ? 'Action Required: Recalibrate Immediately' : 'Action Required: Schedule Recalibration'}
              </p>
              <p className={`text-xs ${colors.text}`}>
                {status === 'expired'
                  ? 'This instrument/standard is out of calibration. Test results using this instrument are non-conforming per ISO 17025 cl. 6.4.6 until recalibrated.'
                  : `Calibration expires in ${daysUntilExpiry(node)} days. Initiate recalibration per SOP-QA-2026-003.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── GraphNode ────────────────────────────────────────────────────────────────

function GraphNode({
  node,
  onClick,
  highlighted,
}: {
  node: CalibrationNode
  onClick: (n: CalibrationNode) => void
  highlighted: boolean
}) {
  const status = nodeStatus(node)
  const colors = STATUS_COLOR[status]

  return (
    <button
      onClick={() => onClick(node)}
      className={`
        relative flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border-2 shadow-sm
        text-left transition-all duration-150 cursor-pointer w-44
        ${colors.bg} ${colors.border}
        ${highlighted ? 'ring-2 ring-offset-2 ring-blue-400 shadow-md scale-105' : 'hover:shadow-md hover:scale-105'}
      `}
    >
      <div className={`w-2 h-2 rounded-full ${colors.dot} mb-0.5`} />
      <p className={`text-xs font-bold text-center leading-tight ${colors.text}`}>{node.name}</p>
      <p className="text-xs text-gray-500 text-center leading-tight">{node.model}</p>
      <StatusBadge node={node} />
    </button>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CalibrationChainPage() {
  const [selectedNode, setSelectedNode] = useState<CalibrationNode | null>(null)
  const [measurandFilter, setMeasurandFilter] = useState<string>('all')
  const [highlightId, setHighlightId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (measurandFilter === 'all') return CALIBRATION_NODES
    return CALIBRATION_NODES.filter((n) => n.measurands.includes(measurandFilter as Measurand))
  }, [measurandFilter])

  const tiers = useMemo(() => {
    const groups: Record<string, CalibrationNode[]> = { NMI: [], Reference: [], Working: [], Instrument: [] }
    filtered.forEach((n) => groups[n.type]?.push(n))
    return groups
  }, [filtered])

  const stats = useMemo(() => ({
    valid: CALIBRATION_NODES.filter((n) => nodeStatus(n) === 'valid').length,
    amber: CALIBRATION_NODES.filter((n) => nodeStatus(n) === 'amber').length,
    expired: CALIBRATION_NODES.filter((n) => nodeStatus(n) === 'expired').length,
  }), [])

  function handleNodeClick(node: CalibrationNode) {
    setSelectedNode(node)
    setHighlightId(node.id)
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-blue-600" />
            Calibration Chain
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Measurement traceability to national standards — ISO 17025:2017 cl. 6.4.6
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={measurandFilter} onValueChange={setMeasurandFilter}>
            <SelectTrigger className="w-44 text-sm">
              <SelectValue placeholder="Filter measurand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All measurands</SelectItem>
              {MEASURANDS.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-1.5" /> Export
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-green-800">{stats.valid}</p>
              <p className="text-xs text-green-700">Valid & in-date</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-amber-800">{stats.amber}</p>
              <p className="text-xs text-amber-700">Expiring within 60 d</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-red-800">{stats.expired}</p>
              <p className="text-xs text-red-700">Expired — action needed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chain graph */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Info className="w-4 h-4 text-gray-400" />
            Click any node to view certificate details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {(['NMI', 'Reference', 'Working', 'Instrument'] as const).map((tier, tierIdx) => {
              const nodes = tiers[tier]
              if (nodes.length === 0) return null
              return (
                <div key={tier} className="relative">
                  {/* Tier label */}
                  <div className="flex items-center gap-3 mb-3 mt-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                      {tier === 'NMI' ? 'NMI' : tier}
                    </span>
                    <div className="flex-1 border-t border-dashed border-gray-200" />
                    <span className="text-xs text-gray-400 italic whitespace-nowrap">
                      {TIER_LABEL[tier]}
                    </span>
                  </div>

                  {/* Connector lines from this tier to previous (visual only) */}
                  {tierIdx > 0 && (
                    <div className="flex justify-center mb-2">
                      <div className="w-px h-5 bg-gray-300" />
                    </div>
                  )}

                  {/* Nodes */}
                  <div className="flex flex-wrap justify-center gap-4">
                    {nodes.map((node) => (
                      <GraphNode
                        key={node.id}
                        node={node}
                        onClick={handleNodeClick}
                        highlighted={highlightId === node.id}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">
            Calibration Register — {CALIBRATION_NODES.length} standards & instruments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Tier</th>
                  <th className="pb-2 pr-4">Cert No.</th>
                  <th className="pb-2 pr-4">Expiry</th>
                  <th className="pb-2 pr-4">Measurands</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((node) => (
                  <tr
                    key={node.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleNodeClick(node)}
                  >
                    <td className="py-2.5 pr-4 font-medium text-gray-800">{node.name}</td>
                    <td className="py-2.5 pr-4">
                      <Badge variant="outline" className="text-xs">{node.type}</Badge>
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-gray-500">{node.certNumber}</td>
                    <td className="py-2.5 pr-4 text-gray-600">{node.expiryDate}</td>
                    <td className="py-2.5 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {node.measurands.map((m) => (
                          <Badge key={m} variant="secondary" className="text-xs px-1.5 py-0">{m}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5">
                      <StatusBadge node={node} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500">
        <span className="font-semibold text-gray-600">Legend:</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500" /> Valid — within calibration interval</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /> Amber — expires within 60 days</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /> Expired — recalibration required (ISO 17025 cl. 6.4.6)</span>
      </div>

      {/* Detail panel */}
      {selectedNode && (
        <DetailPanel node={selectedNode} onClose={() => { setSelectedNode(null); setHighlightId(null) }} />
      )}
    </div>
  )
}
