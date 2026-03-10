// @ts-nocheck
'use client'

import { useRef, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download } from 'lucide-react'

interface QRCodeGeneratorProps {
  value: string
  label?: string
  sublabel?: string
  size?: number
  showDownload?: boolean
}

export default function QRCodeGenerator({
  value,
  label,
  sublabel,
  size = 128,
  showDownload = true,
}: QRCodeGeneratorProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleDownload = useCallback(() => {
    if (!containerRef.current) return
    const svg = containerRef.current.querySelector('svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    canvas.width = size * 2
    canvas.height = size * 2

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const a = document.createElement('a')
        a.download = `qr-${value.replace(/[^a-zA-Z0-9]/g, '_')}.png`
        a.href = canvas.toDataURL('image/png')
        a.click()
      }
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }, [value, size])

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={containerRef} className="bg-white p-3 rounded-lg">
        <QRCodeSVG
          value={value}
          size={size}
          level="M"
          includeMargin={false}
        />
      </div>
      {label && (
        <div className="text-center">
          <div className="text-sm font-semibold">{label}</div>
          {sublabel && <div className="text-xs text-muted-foreground">{sublabel}</div>}
        </div>
      )}
      {showDownload && (
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          <Download className="h-3 w-3" />
          Download QR
        </button>
      )}
    </div>
  )
}
