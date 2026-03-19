"use client"

import React, { useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import { Printer, Download, FileText } from "lucide-react"
import { ROUTINE_TESTS, ACCELERATED_TESTS } from "@/lib/data/omr-route-card-v2-data"
import type { OMRRouteCardV2 } from "@/lib/data/omr-route-card-v2-data"

// ============================================================================
// Printable A4 OMR Sheet with empty bubbles and alignment markers
// ============================================================================

interface OMRPrintableProps {
  card: OMRRouteCardV2
}

export function OMRPrintable({ card }: OMRPrintableProps) {
  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleDownloadPDF = useCallback(() => {
    // Trigger print dialog in PDF mode
    window.print()
  }, [])

  const qrValue = JSON.stringify({
    projectId: card.projectId,
    moduleId: card.moduleId,
    client: card.client,
    standard: card.standard,
    cardId: card.id,
  })

  return (
    <div className="space-y-4">
      {/* Controls (hidden in print) */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h3 className="font-semibold">Printable OMR Route Card</h3>
          <p className="text-sm text-muted-foreground">
            A4 format with empty bubbles and alignment markers for scanning
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print A4
          </Button>
          <Button onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Save as PDF
          </Button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="print:m-0 print:p-0">
        <div
          className="bg-white border-2 border-gray-800 p-6 print:p-4 print:border-0 mx-auto"
          style={{ maxWidth: "210mm", minHeight: "280mm" }}
        >
          {/* Alignment Markers - corners */}
          <div className="relative">
            {/* Top-left marker */}
            <div className="absolute -top-4 -left-4 print:-top-2 print:-left-2">
              <div className="h-6 w-6 border-t-4 border-l-4 border-black" />
            </div>
            {/* Top-right marker */}
            <div className="absolute -top-4 -right-4 print:-top-2 print:-right-2">
              <div className="h-6 w-6 border-t-4 border-r-4 border-black" />
            </div>
            {/* Bottom-left marker */}
            <div className="absolute -bottom-4 -left-4 print:-bottom-2 print:-left-2">
              <div className="h-6 w-6 border-b-4 border-l-4 border-black" />
            </div>
            {/* Bottom-right marker */}
            <div className="absolute -bottom-4 -right-4 print:-bottom-2 print:-right-2">
              <div className="h-6 w-6 border-b-4 border-r-4 border-black" />
            </div>

            {/* Registration marks (crosshairs) at midpoints */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className="flex flex-col items-center">
                <div className="h-4 w-[2px] bg-black" />
                <div className="h-[2px] w-4 bg-black -mt-2" />
              </div>
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
              <div className="flex flex-col items-center">
                <div className="h-4 w-[2px] bg-black" />
                <div className="h-[2px] w-4 bg-black -mt-2" />
              </div>
            </div>
          </div>

          {/* Header Section */}
          <div className="flex items-start justify-between mb-4 border-b-2 border-black pb-3">
            <div className="flex items-start gap-3">
              <QRCodeSVG value={qrValue} size={64} level="H" includeMargin={false} />
              <div>
                <h1 className="text-base font-black tracking-tight">
                  OMR ROUTE CARD &mdash; PV MODULE QUALIFICATION
                </h1>
                <p className="text-[10px] text-gray-600">
                  IEC 61215 / IEC 61730 &bull; ISO 17025 Compliant &bull; Fill bubbles completely
                  with dark pen
                </p>
              </div>
            </div>
            {/* Module ID barcode placeholder */}
            <div className="text-right shrink-0">
              <div className="border border-black px-1.5 py-0.5">
                <div className="flex gap-[1px] h-8 items-end">
                  {card.moduleId.split("").map((char, i) => (
                    <div
                      key={i}
                      className="bg-black"
                      style={{
                        width: i % 3 === 0 ? 2 : 1,
                        height: `${20 + (char.charCodeAt(0) % 12)}px`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-[7px] font-mono text-center">{card.moduleId}</p>
              </div>
            </div>
          </div>

          {/* Info Fields Grid */}
          <div className="grid grid-cols-4 gap-x-4 gap-y-1 mb-4 text-xs">
            <div className="border-b border-gray-400 pb-0.5">
              <span className="text-[9px] font-bold uppercase text-gray-500">Project ID</span>
              <p className="font-mono font-bold">{card.projectId}</p>
            </div>
            <div className="border-b border-gray-400 pb-0.5">
              <span className="text-[9px] font-bold uppercase text-gray-500">Module ID</span>
              <p className="font-mono font-bold">{card.moduleId}</p>
            </div>
            <div className="border-b border-gray-400 pb-0.5">
              <span className="text-[9px] font-bold uppercase text-gray-500">Client</span>
              <p className="font-semibold">{card.client}</p>
            </div>
            <div className="border-b border-gray-400 pb-0.5">
              <span className="text-[9px] font-bold uppercase text-gray-500">Module Type</span>
              <p className="font-semibold">{card.moduleType}</p>
            </div>
            <div className="border-b border-gray-400 pb-0.5">
              <span className="text-[9px] font-bold uppercase text-gray-500">Power Rating</span>
              <p className="font-mono">{card.powerRating}</p>
            </div>
            <div className="border-b border-gray-400 pb-0.5">
              <span className="text-[9px] font-bold uppercase text-gray-500">Standard</span>
              <p className="font-mono">{card.standard}</p>
            </div>
            <div className="border-b border-gray-400 pb-0.5">
              <span className="text-[9px] font-bold uppercase text-gray-500">Date</span>
              <p>{card.date}</p>
            </div>
            <div className="border-b border-gray-400 pb-0.5">
              <span className="text-[9px] font-bold uppercase text-gray-500">Card ID</span>
              <p className="font-mono">{card.id}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 border border-gray-300 rounded p-2 mb-3 text-[9px] print:bg-white">
            <p className="font-bold">INSTRUCTIONS:</p>
            <p>
              1. Fill bubble completely with dark pen (black/blue) for PASS.
              2. Mark &quot;X&quot; through bubble for FAIL.
              3. Half-fill for IN PROGRESS.
              4. Leave blank for NOT TESTED.
            </p>
          </div>

          {/* OMR Bubble Matrix - Print Optimized */}
          <table className="w-full border-collapse text-[8px]">
            <thead>
              <tr>
                <th className="border-2 border-black p-1 text-left font-black bg-gray-100 min-w-[60px]">
                  Test &#8595; / Stage &#8594;
                </th>
                {ACCELERATED_TESTS.map((at) => (
                  <th
                    key={at.code}
                    className="border-2 border-black p-0.5 text-center font-bold bg-gray-100"
                    style={{ writingMode: "vertical-lr", minWidth: "28px", height: "60px" }}
                  >
                    {at.code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROUTINE_TESTS.map((rt) => (
                <tr key={rt.code}>
                  <td className="border-2 border-black p-1 font-bold bg-gray-50">
                    <span className="font-mono">{rt.code}</span>
                    <br />
                    <span className="text-[7px] font-normal text-gray-600">{rt.name}</span>
                  </td>
                  {ACCELERATED_TESTS.map((at) => (
                    <td key={at.code} className="border border-gray-600 p-0 text-center">
                      <div className="flex items-center justify-center py-1.5">
                        <div className="h-5 w-5 rounded-full border-2 border-gray-800 bg-white" />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer Section */}
          <div className="mt-4 border-t-2 border-black pt-2">
            <div className="grid grid-cols-3 gap-4 text-[9px]">
              <div>
                <p className="font-bold uppercase text-gray-500 mb-1">Final Disposition</p>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 rounded-full border-2 border-black" />
                    <span>PASS</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 rounded-full border-2 border-black" />
                    <span>FAIL</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 rounded-full border-2 border-black" />
                    <span>COND</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-bold uppercase text-gray-500 mb-1">Lab Manager</p>
                <div className="border-b border-gray-400 h-6" />
                <p className="text-[8px] text-gray-400 mt-0.5">Signature / Date</p>
              </div>
              <div>
                <p className="font-bold uppercase text-gray-500 mb-1">Quality Assurance</p>
                <div className="border-b border-gray-400 h-6" />
                <p className="text-[8px] text-gray-400 mt-0.5">Signature / Date</p>
              </div>
            </div>

            {/* Bottom QR for verification */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-300">
              <div className="flex items-center gap-2">
                <QRCodeSVG
                  value={`verify:${card.id}:${card.projectId}`}
                  size={40}
                  level="L"
                />
                <span className="text-[8px] text-gray-500">
                  Verification QR &bull; {card.id}
                </span>
              </div>
              <div className="text-[8px] text-gray-400 text-right">
                <p>Generated by SolarLabX &bull; ISO 17025 Compliant</p>
                <p>Print Date: {new Date().toLocaleDateString("en-IN")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
