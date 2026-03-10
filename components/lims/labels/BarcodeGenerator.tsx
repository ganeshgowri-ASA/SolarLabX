'use client'

import { useEffect, useRef, useCallback } from 'react'
import JsBarcode from 'jsbarcode'
import { Download } from 'lucide-react'

interface BarcodeGeneratorProps {
  value: string
  label?: string
  format?: string
  width?: number
  height?: number
  showDownload?: boolean
}

export default function BarcodeGenerator({
  value,
  label,
  format = 'CODE128',
  width = 2,
  height = 50,
  showDownload = true,
}: BarcodeGeneratorProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format,
          width,
          height,
          displayValue: true,
          fontSize: 12,
          margin: 5,
          background: '#ffffff',
          lineColor: '#000000',
        })
      } catch {
        // Invalid barcode value - silently fail
      }
    }
  }, [value, format, width, height])

  const handleDownload = useCallback(() => {
    if (!svgRef.current) return
    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    const bbox = svgRef.current.getBBox()
    canvas.width = (bbox.width + 20) * 2
    canvas.height = (bbox.height + 20) * 2

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const a = document.createElement('a')
        a.download = `barcode-${value.replace(/[^a-zA-Z0-9]/g, '_')}.png`
        a.href = canvas.toDataURL('image/png')
        a.click()
      }
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }, [value])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-white p-2 rounded-lg">
        <svg ref={svgRef} />
      </div>
      {label && <div className="text-sm font-semibold">{label}</div>}
      {showDownload && (
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          <Download className="h-3 w-3" />
          Download Barcode
        </button>
      )}
    </div>
  )
}
