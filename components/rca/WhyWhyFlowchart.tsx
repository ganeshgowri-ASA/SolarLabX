// @ts-nocheck
'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'

interface WhyNode {
  id: string
  heading: string
  subheading?: string
  level: number
  children: WhyNode[]
  expanded: boolean
}

const LEVEL_COLORS = [
  {
    bg: 'bg-red-50',
    border: 'border-red-300',
    accent: 'bg-red-500',
    text: 'text-red-700',
    hoverBorder: 'hover:border-red-400',
    shadow: 'shadow-red-100',
    line: '#ef4444',
    label: 'PROBLEM',
  },
  {
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    accent: 'bg-orange-500',
    text: 'text-orange-700',
    hoverBorder: 'hover:border-orange-400',
    shadow: 'shadow-orange-100',
    line: '#f97316',
    label: 'WHY? L1',
  },
  {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    accent: 'bg-yellow-500',
    text: 'text-yellow-700',
    hoverBorder: 'hover:border-yellow-400',
    shadow: 'shadow-yellow-100',
    line: '#eab308',
    label: 'WHY? L2',
  },
  {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    accent: 'bg-blue-500',
    text: 'text-blue-700',
    hoverBorder: 'hover:border-blue-400',
    shadow: 'shadow-blue-100',
    line: '#3b82f6',
    label: 'WHY? L3',
  },
  {
    bg: 'bg-green-50',
    border: 'border-green-300',
    accent: 'bg-green-500',
    text: 'text-green-700',
    hoverBorder: 'hover:border-green-400',
    shadow: 'shadow-green-100',
    line: '#22c55e',
    label: 'WHY? L4',
  },
  {
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    accent: 'bg-purple-500',
    text: 'text-purple-700',
    hoverBorder: 'hover:border-purple-400',
    shadow: 'shadow-purple-100',
    line: '#a855f7',
    label: 'ROOT CAUSE',
  },
]

const NODE_WIDTH = 260
const NODE_HEIGHT_EST = 90
const H_GAP = 32
const V_GAP = 80

function generateId(): string {
  return 'n_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

function createSampleTree(): WhyNode {
  return {
    id: generateId(),
    heading: 'PV Module Failed Damp Heat Test',
    subheading: 'IEC 61215 – 1000h DH test failure',
    level: 0,
    expanded: true,
    children: [
      {
        id: generateId(),
        heading: 'Moisture ingress detected',
        subheading: 'Traces of moisture inside module laminate',
        level: 1,
        expanded: true,
        children: [
          {
            id: generateId(),
            heading: 'Edge seal degraded',
            subheading: 'Sealant lost adhesion at perimeter',
            level: 2,
            expanded: true,
            children: [
              {
                id: generateId(),
                heading: 'Incorrect sealant material used',
                subheading: 'Material spec mismatch from BOM',
                level: 3,
                expanded: true,
                children: [
                  {
                    id: generateId(),
                    heading: 'Supplier changed formulation',
                    subheading: 'Undisclosed raw material substitution',
                    level: 4,
                    expanded: true,
                    children: [
                      {
                        id: generateId(),
                        heading: 'No incoming material inspection SOP',
                        subheading: 'Root cause identified – missing quality gate',
                        level: 5,
                        expanded: false,
                        children: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: generateId(),
            heading: 'Junction box seal failure',
            subheading: 'J-box potting compound cracked',
            level: 2,
            expanded: true,
            children: [
              {
                id: generateId(),
                heading: 'Thermal cycling weakened potting',
                subheading: 'CTE mismatch between materials',
                level: 3,
                expanded: true,
                children: [
                  {
                    id: generateId(),
                    heading: 'Wrong potting compound selected',
                    subheading: 'Datasheet not reviewed for thermal range',
                    level: 4,
                    expanded: true,
                    children: [
                      {
                        id: generateId(),
                        heading: 'No material qualification process',
                        subheading: 'Root cause – material selection uncontrolled',
                        level: 5,
                        expanded: false,
                        children: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: generateId(),
        heading: 'Delamination observed',
        subheading: 'Encapsulant-glass separation in EL imaging',
        level: 1,
        expanded: true,
        children: [
          {
            id: generateId(),
            heading: 'Adhesion failure between layers',
            subheading: 'Peel strength below specification',
            level: 2,
            expanded: true,
            children: [
              {
                id: generateId(),
                heading: 'Lamination temperature too low',
                subheading: 'Process parameter out of spec',
                level: 3,
                expanded: true,
                children: [
                  {
                    id: generateId(),
                    heading: 'Oven calibration drift',
                    subheading: 'Actual temp 8°C below setpoint',
                    level: 4,
                    expanded: true,
                    children: [
                      {
                        id: generateId(),
                        heading: 'Equipment calibration overdue',
                        subheading: 'Root cause – calibration schedule not followed',
                        level: 5,
                        expanded: false,
                        children: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }
}

interface NodePosition {
  id: string
  x: number
  y: number
  width: number
  height: number
  parentId?: string
}

function computeLayout(
  node: WhyNode,
  parentId?: string
): { positions: NodePosition[]; width: number; height: number } {
  if (!node.expanded || node.children.length === 0) {
    const pos: NodePosition = {
      id: node.id,
      x: 0,
      y: 0,
      width: NODE_WIDTH,
      height: NODE_HEIGHT_EST,
      parentId,
    }
    return { positions: [pos], width: NODE_WIDTH, height: NODE_HEIGHT_EST }
  }

  const childLayouts = node.children.map((child) => computeLayout(child, node.id))
  const totalChildrenWidth = childLayouts.reduce((sum, cl) => sum + cl.width, 0) + H_GAP * (childLayouts.length - 1)
  const subtreeWidth = Math.max(NODE_WIDTH, totalChildrenWidth)

  const positions: NodePosition[] = []

  const rootPos: NodePosition = {
    id: node.id,
    x: subtreeWidth / 2 - NODE_WIDTH / 2,
    y: 0,
    width: NODE_WIDTH,
    height: NODE_HEIGHT_EST,
    parentId,
  }
  positions.push(rootPos)

  let offsetX = (subtreeWidth - totalChildrenWidth) / 2
  const childTopY = NODE_HEIGHT_EST + V_GAP

  childLayouts.forEach((cl) => {
    cl.positions.forEach((cp) => {
      positions.push({
        ...cp,
        x: cp.x + offsetX,
        y: cp.y + childTopY,
      })
    })
    offsetX += cl.width + H_GAP
  })

  const maxY = Math.max(...positions.map((p) => p.y + p.height))

  return { positions, width: subtreeWidth, height: maxY }
}

function findNode(root: WhyNode, id: string): WhyNode | null {
  if (root.id === id) return root
  for (const child of root.children) {
    const found = findNode(child, id)
    if (found) return found
  }
  return null
}

function cloneTree(node: WhyNode): WhyNode {
  return {
    ...node,
    children: node.children.map(cloneTree),
  }
}

function removeNodeById(root: WhyNode, id: string): WhyNode {
  const cloned = cloneTree(root)
  function removeFromChildren(parent: WhyNode): boolean {
    const idx = parent.children.findIndex((c) => c.id === id)
    if (idx !== -1) {
      parent.children.splice(idx, 1)
      return true
    }
    for (const child of parent.children) {
      if (removeFromChildren(child)) return true
    }
    return false
  }
  removeFromChildren(cloned)
  return cloned
}

export default function WhyWhyFlowchart() {
  const [tree, setTree] = useState<WhyNode>(createSampleTree)
  const [zoom, setZoom] = useState(0.7)
  const [pan, setPan] = useState({ x: 60, y: 40 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [editHeading, setEditHeading] = useState('')
  const [editSubheading, setEditSubheading] = useState('')
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [newHeading, setNewHeading] = useState('')
  const [newSubheading, setNewSubheading] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const updateNode = useCallback(
    (id: string, updater: (node: WhyNode) => void) => {
      setTree((prev) => {
        const cloned = cloneTree(prev)
        const node = findNode(cloned, id)
        if (node) updater(node)
        return cloned
      })
    },
    []
  )

  const toggleExpand = useCallback(
    (id: string) => {
      updateNode(id, (node) => {
        node.expanded = !node.expanded
      })
    },
    [updateNode]
  )

  const handleDelete = useCallback(
    (id: string) => {
      setTree((prev) => removeNodeById(prev, id))
    },
    []
  )

  const handleStartEdit = useCallback(
    (node: WhyNode) => {
      setEditingNode(node.id)
      setEditHeading(node.heading)
      setEditSubheading(node.subheading || '')
    },
    []
  )

  const handleSaveEdit = useCallback(
    (id: string) => {
      updateNode(id, (node) => {
        node.heading = editHeading.trim() || node.heading
        node.subheading = editSubheading.trim() || undefined
      })
      setEditingNode(null)
    },
    [editHeading, editSubheading, updateNode]
  )

  const handleCancelEdit = useCallback(() => {
    setEditingNode(null)
  }, [])

  const handleStartAdd = useCallback((parentId: string) => {
    setAddingTo(parentId)
    setNewHeading('')
    setNewSubheading('')
  }, [])

  const handleConfirmAdd = useCallback(
    (parentId: string) => {
      if (!newHeading.trim()) return
      updateNode(parentId, (parent) => {
        const childLevel = Math.min(parent.level + 1, 5)
        parent.children.push({
          id: generateId(),
          heading: newHeading.trim(),
          subheading: newSubheading.trim() || undefined,
          level: childLevel,
          children: [],
          expanded: false,
        })
        parent.expanded = true
      })
      setAddingTo(null)
      setNewHeading('')
      setNewSubheading('')
    },
    [newHeading, newSubheading, updateNode]
  )

  const handleCancelAdd = useCallback(() => {
    setAddingTo(null)
  }, [])

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.15, 2)), [])
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.15, 0.2)), [])
  const handleFitToView = useCallback(() => {
    setZoom(0.55)
    setPan({ x: 60, y: 40 })
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-node]') || (e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('button')) return
      setIsPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    },
    [pan]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
    },
    [isPanning, panStart]
  )

  const handleMouseUp = useCallback(() => setIsPanning(false), [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.08 : 0.08
    setZoom((z) => Math.min(Math.max(z + delta, 0.2), 2))
  }, [])

  const layout = computeLayout(tree)
  const { positions } = layout

  const posMap = new Map<string, NodePosition>()
  positions.forEach((p) => posMap.set(p.id, p))

  const lines: { x1: number; y1: number; x2: number; y2: number; color: string }[] = []
  positions.forEach((p) => {
    if (p.parentId) {
      const parent = posMap.get(p.parentId)
      if (parent) {
        const node = findNode(tree, p.parentId)
        const levelColor = LEVEL_COLORS[Math.min(node?.level ?? 0, 5)]
        lines.push({
          x1: parent.x + parent.width / 2,
          y1: parent.y + parent.height,
          x2: p.x + p.width / 2,
          y2: p.y,
          color: levelColor.line,
        })
      }
    }
  })

  function flattenVisible(node: WhyNode): WhyNode[] {
    const result = [node]
    if (node.expanded) {
      node.children.forEach((child) => {
        result.push(...flattenVisible(child))
      })
    }
    return result
  }
  const visibleNodes = flattenVisible(tree)

  const totalWidth = layout.width + 200
  const totalHeight = layout.height + 200

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-xl border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
            <AlertTriangle className="w-4 h-4" />
            5-Why Root Cause Analysis
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 ml-2">
            {LEVEL_COLORS.map((c, i) => (
              <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border}`}>
                {c.label}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500 min-w-[3rem] text-center font-mono">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <button
            onClick={handleFitToView}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            title="Fit to View"
          >
            <Maximize className="w-4 h-4" />
          </button>
          <button
            onClick={() => alert('Export to PNG – integrate with html2canvas or dom-to-image')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            title="Export to PNG"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: totalWidth,
            height: totalHeight,
            transition: isPanning ? 'none' : 'transform 0.15s ease-out',
          }}
          className="absolute top-0 left-0"
        >
          {/* SVG Lines */}
          <svg
            width={totalWidth}
            height={totalHeight}
            className="absolute top-0 left-0 pointer-events-none"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <filter id="lineShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.1" />
              </filter>
            </defs>
            {lines.map((line, i) => {
              const midY = (line.y1 + line.y2) / 2
              return (
                <path
                  key={i}
                  d={`M ${line.x1} ${line.y1} C ${line.x1} ${midY}, ${line.x2} ${midY}, ${line.x2} ${line.y2}`}
                  fill="none"
                  stroke={line.color}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  opacity={0.6}
                  filter="url(#lineShadow)"
                  className="transition-opacity duration-300"
                />
              )
            })}
          </svg>

          {/* Nodes */}
          {visibleNodes.map((node) => {
            const pos = posMap.get(node.id)
            if (!pos) return null
            const color = LEVEL_COLORS[Math.min(node.level, 5)]
            const isHovered = hoveredNode === node.id
            const isEditing = editingNode === node.id
            const isAdding = addingTo === node.id
            const hasChildren = node.children.length > 0
            const isRoot = node.level === 0
            const isRootCause = node.level === 5

            return (
              <div
                key={node.id}
                data-node
                className={`absolute select-none transition-all duration-300 ease-out`}
                style={{
                  left: pos.x,
                  top: pos.y,
                  width: NODE_WIDTH,
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Node Card */}
                <div
                  className={`
                    relative rounded-xl border-2 ${color.border} ${color.bg} ${color.hoverBorder}
                    transition-all duration-200 ease-out
                    ${isHovered ? `shadow-lg ${color.shadow} scale-[1.03]` : 'shadow-sm'}
                    ${isRoot ? 'ring-2 ring-red-200 ring-offset-1' : ''}
                    ${isRootCause ? 'ring-2 ring-purple-200 ring-offset-1' : ''}
                  `}
                >
                  {/* Level Badge */}
                  <div
                    className={`absolute -top-2.5 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${color.accent} shadow-sm`}
                  >
                    {color.label}
                  </div>

                  {/* Action Buttons (visible on hover) */}
                  <div
                    className={`absolute -top-2.5 right-2 flex items-center gap-0.5 transition-all duration-200 ${
                      isHovered && !isEditing ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'
                    }`}
                  >
                    {!isRoot && (
                      <button
                        onClick={() => handleDelete(node.id)}
                        className="p-1 rounded-full bg-white border border-gray-200 hover:bg-red-50 hover:border-red-300 text-gray-400 hover:text-red-500 transition-colors shadow-sm"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => handleStartEdit(node)}
                      className="p-1 rounded-full bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-400 hover:text-blue-500 transition-colors shadow-sm"
                      title="Edit"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="px-3.5 pt-4 pb-3">
                    {isEditing ? (
                      <div className="flex flex-col gap-1.5">
                        <input
                          autoFocus
                          value={editHeading}
                          onChange={(e) => setEditHeading(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(node.id)
                            if (e.key === 'Escape') handleCancelEdit()
                          }}
                          className="w-full px-2 py-1 text-xs font-semibold rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          placeholder="Heading"
                        />
                        <input
                          value={editSubheading}
                          onChange={(e) => setEditSubheading(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(node.id)
                            if (e.key === 'Escape') handleCancelEdit()
                          }}
                          className="w-full px-2 py-1 text-[11px] rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          placeholder="Subheading (optional)"
                        />
                        <div className="flex items-center gap-1 mt-0.5">
                          <button
                            onClick={() => handleSaveEdit(node.id)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded bg-green-500 text-white text-[10px] font-medium hover:bg-green-600 transition-colors"
                          >
                            <Check className="w-3 h-3" /> Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-200 text-gray-600 text-[10px] font-medium hover:bg-gray-300 transition-colors"
                          >
                            <X className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          className={`text-xs leading-snug ${isRootCause ? 'font-bold' : 'font-semibold'} ${color.text} cursor-pointer`}
                          onClick={() => hasChildren && toggleExpand(node.id)}
                        >
                          {node.heading}
                        </div>
                        {node.subheading && (
                          <div className="text-[11px] text-gray-500 leading-snug mt-1">
                            {node.subheading}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Bottom bar: expand toggle + add button */}
                  <div className="flex items-center justify-between px-2 pb-2">
                    <div>
                      {hasChildren && (
                        <button
                          onClick={() => toggleExpand(node.id)}
                          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] text-gray-500 hover:text-gray-700 hover:bg-white/60 transition-colors"
                        >
                          {node.expanded ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                          <span>{node.children.length}</span>
                        </button>
                      )}
                    </div>
                    {node.level < 5 && (
                      <button
                        onClick={() => handleStartAdd(node.id)}
                        className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium transition-all duration-200 ${
                          isHovered
                            ? `${color.text} bg-white/80 hover:bg-white shadow-sm`
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                        title="Add child cause"
                      >
                        <Plus className="w-3 h-3" /> Why?
                      </button>
                    )}
                  </div>

                  {/* Add form (inline below node) */}
                  {isAdding && (
                    <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm rounded-b-xl px-3 py-2.5">
                      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        Add Cause (Level {Math.min(node.level + 1, 5)})
                      </div>
                      <input
                        autoFocus
                        value={newHeading}
                        onChange={(e) => setNewHeading(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleConfirmAdd(node.id)
                          if (e.key === 'Escape') handleCancelAdd()
                        }}
                        className="w-full px-2 py-1 text-xs rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white mb-1"
                        placeholder="Why did this happen?"
                      />
                      <input
                        value={newSubheading}
                        onChange={(e) => setNewSubheading(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleConfirmAdd(node.id)
                          if (e.key === 'Escape') handleCancelAdd()
                        }}
                        className="w-full px-2 py-1 text-[11px] rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white mb-1.5"
                        placeholder="Details (optional)"
                      />
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleConfirmAdd(node.id)}
                          disabled={!newHeading.trim()}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500 text-white text-[10px] font-medium hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                        <button
                          onClick={handleCancelAdd}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-200 text-gray-600 text-[10px] font-medium hover:bg-gray-300 transition-colors"
                        >
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
