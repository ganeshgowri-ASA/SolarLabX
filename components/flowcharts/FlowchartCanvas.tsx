'use client'

import { useState, useRef, useCallback } from 'react'
import type { FlowchartDefinition, FlowchartNode } from '@/lib/data/flowchart-data'

const NODE_COLORS: Record<FlowchartNode['type'], { bg: string; border: string; text: string }> = {
  start: { bg: '#166534', border: '#22c55e', text: '#ffffff' },
  end: { bg: '#991b1b', border: '#ef4444', text: '#ffffff' },
  process: { bg: '#1e3a5f', border: '#3b82f6', text: '#e2e8f0' },
  decision: { bg: '#92400e', border: '#f97316', text: '#ffffff' },
  subprocess: { bg: '#4c1d95', border: '#8b5cf6', text: '#e2e8f0' },
}

const NODE_WIDTH = 180
const NODE_HEIGHT_BASE = 60

function getNodeHeight(label: string): number {
  const lines = label.split('\n').length
  return Math.max(NODE_HEIGHT_BASE, 24 + lines * 20)
}

interface FlowchartCanvasProps {
  flowchart: FlowchartDefinition
  onNodeClick: (node: FlowchartNode) => void
}

export default function FlowchartCanvas({ flowchart, onNodeClick }: FlowchartCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  const nodeMap = new Map(flowchart.nodes.map(n => [n.id, n]))

  const getNodeCenter = useCallback((nodeId: string) => {
    const node = nodeMap.get(nodeId)
    if (!node) return { x: 0, y: 0 }
    const h = getNodeHeight(node.label)
    return { x: node.x, y: node.y + h / 2 }
  }, [nodeMap])

  const getNodeBottom = useCallback((nodeId: string) => {
    const node = nodeMap.get(nodeId)
    if (!node) return { x: 0, y: 0 }
    const h = getNodeHeight(node.label)
    return { x: node.x, y: node.y + h }
  }, [nodeMap])

  const getNodeTop = useCallback((nodeId: string) => {
    const node = nodeMap.get(nodeId)
    if (!node) return { x: 0, y: 0 }
    return { x: node.x, y: node.y }
  }, [nodeMap])

  // Calculate SVG dimensions
  const maxX = Math.max(...flowchart.nodes.map(n => n.x)) + NODE_WIDTH / 2 + 40
  const maxY = Math.max(...flowchart.nodes.map(n => n.y + getNodeHeight(n.label))) + 40
  const minX = Math.min(...flowchart.nodes.map(n => n.x)) - NODE_WIDTH / 2 - 40

  const svgWidth = maxX - minX
  const svgHeight = maxY + 20

  return (
    <div className="w-full overflow-auto bg-card rounded-lg border">
      <svg
        ref={svgRef}
        viewBox={`${minX} 0 ${svgWidth} ${svgHeight}`}
        className="w-full"
        style={{ minHeight: Math.min(svgHeight, 800), maxHeight: 900 }}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
          </marker>
        </defs>

        {/* Edges */}
        {flowchart.edges.map((edge, i) => {
          const fromNode = nodeMap.get(edge.from)
          const toNode = nodeMap.get(edge.to)
          if (!fromNode || !toNode) return null

          const fromBottom = getNodeBottom(edge.from)
          const toTop = getNodeTop(edge.to)
          const fromCenter = getNodeCenter(edge.from)
          const toCenter = getNodeCenter(edge.to)

          // Determine if this is a side connection
          const isSideConnection = Math.abs(fromNode.x - toNode.x) > 100

          let path: string
          if (isSideConnection && Math.abs(fromNode.y - toNode.y) < 50) {
            // Horizontal connection
            const startX = fromNode.x + (toNode.x > fromNode.x ? NODE_WIDTH / 2 : -NODE_WIDTH / 2)
            const endX = toNode.x + (toNode.x > fromNode.x ? -NODE_WIDTH / 2 : NODE_WIDTH / 2)
            path = `M ${startX} ${fromCenter.y} L ${endX} ${toCenter.y}`
          } else if (isSideConnection) {
            // Curved connection for branching
            const midY = (fromBottom.y + toTop.y) / 2
            path = `M ${fromBottom.x} ${fromBottom.y} C ${fromBottom.x} ${midY}, ${toTop.x} ${midY}, ${toTop.x} ${toTop.y}`
          } else {
            // Straight vertical connection
            path = `M ${fromBottom.x} ${fromBottom.y} L ${toTop.x} ${toTop.y}`
          }

          return (
            <g key={`edge-${i}`}>
              <path
                d={path}
                fill="none"
                stroke="#475569"
                strokeWidth={2}
                markerEnd="url(#arrowhead)"
              />
              {edge.label && (
                <text
                  x={(fromCenter.x + toCenter.x) / 2 + (isSideConnection ? 0 : 14)}
                  y={(fromBottom.y + toTop.y) / 2}
                  fill="#94a3b8"
                  fontSize={11}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-medium"
                >
                  {edge.label}
                </text>
              )}
            </g>
          )
        })}

        {/* Nodes */}
        {flowchart.nodes.map((node) => {
          const colors = NODE_COLORS[node.type]
          const h = getNodeHeight(node.label)
          const w = NODE_WIDTH
          const isHovered = hoveredNode === node.id
          const lines = node.label.split('\n')

          if (node.type === 'decision') {
            // Diamond shape
            const cx = node.x
            const cy = node.y + h / 2
            const dw = w * 0.65
            const dh = h * 0.65
            return (
              <g
                key={node.id}
                onClick={() => onNodeClick(node)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                <polygon
                  points={`${cx},${cy - dh} ${cx + dw},${cy} ${cx},${cy + dh} ${cx - dw},${cy}`}
                  fill={isHovered ? colors.border : colors.bg}
                  stroke={colors.border}
                  strokeWidth={isHovered ? 3 : 2}
                  opacity={isHovered ? 1 : 0.9}
                />
                {lines.map((line, li) => (
                  <text
                    key={li}
                    x={cx}
                    y={cy + (li - (lines.length - 1) / 2) * 14}
                    fill={colors.text}
                    fontSize={11}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-medium pointer-events-none"
                  >
                    {line}
                  </text>
                ))}
              </g>
            )
          }

          // Rectangle shapes (process, subprocess, start, end)
          const rx = node.type === 'start' || node.type === 'end' ? h / 2 : 8
          return (
            <g
              key={node.id}
              onClick={() => onNodeClick(node)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer"
            >
              <rect
                x={node.x - w / 2}
                y={node.y}
                width={w}
                height={h}
                rx={rx}
                fill={isHovered ? colors.border : colors.bg}
                stroke={colors.border}
                strokeWidth={isHovered ? 3 : 2}
                opacity={isHovered ? 1 : 0.9}
              />
              {node.type === 'subprocess' && (
                <rect
                  x={node.x - w / 2 + 6}
                  y={node.y + 3}
                  width={w - 12}
                  height={h - 6}
                  rx={4}
                  fill="none"
                  stroke={colors.border}
                  strokeWidth={1}
                  opacity={0.5}
                  className="pointer-events-none"
                />
              )}
              {lines.map((line, li) => (
                <text
                  key={li}
                  x={node.x}
                  y={node.y + h / 2 + (li - (lines.length - 1) / 2) * 16}
                  fill={colors.text}
                  fontSize={12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-medium pointer-events-none"
                >
                  {line}
                </text>
              ))}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
