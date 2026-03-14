// @ts-nocheck
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  FileText,
  FileSpreadsheet,
  FileDown,
  Printer,
  CheckCircle2,
  XCircle,
  Sun,
  Zap,
  Thermometer,
  TrendingDown,
  ShieldCheck,
  Camera,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Sample Data – SolarTech ST-500M passing IEC 61215 + 61730 + 61853
// ---------------------------------------------------------------------------

const moduleInfo = {
  manufacturer: "SolarTech Industries Pvt. Ltd.",
  model: "ST-500M",
  serialNumber: "ST500M-2026-001457",
  ratedPower: "500 Wp",
  dimensions: "2278 × 1134 × 35 mm",
  weight: "26.8 kg",
  cellType: "Mono-crystalline PERC (M10)",
  cellCount: 144,
  voc: "49.8 V",
  isc: "13.25 A",
  vmp: "41.7 V",
  imp: "12.00 A",
  moduleEfficiency: "19.42 %",
  connectorType: "MC4 Compatible",
  junctionBox: "IP68, 3 bypass diodes",
  frameType: "Anodized aluminium alloy",
  glass: "3.2 mm tempered, AR coated",
  encapsulant: "EVA / POE",
  backsheet: "White composite film",
}

const standardsTested = [
  {
    standard: "IEC 61215:2021",
    title: "Terrestrial PV Modules – Design Qualification",
    result: "PASS" as const,
  },
  {
    standard: "IEC 61730-1:2023",
    title: "PV Module Safety – Construction Requirements",
    result: "PASS" as const,
  },
  {
    standard: "IEC 61730-2:2023",
    title: "PV Module Safety – Testing Requirements",
    result: "PASS" as const,
  },
  {
    standard: "IEC 61853-1:2020",
    title: "PV Module Performance – Irradiance & Temperature",
    result: "PASS" as const,
  },
  {
    standard: "IEC 61853-2:2020",
    title: "PV Module Performance – Spectral Response & AOI",
    result: "PASS" as const,
  },
]

const performanceMetrics = [
  {
    label: "Pmax (STC)",
    value: "502.3",
    unit: "W",
    icon: Zap,
    note: "Rated: 500 Wp (+0.46 %)",
  },
  {
    label: "Module Efficiency",
    value: "19.42",
    unit: "%",
    icon: Sun,
    note: "Aperture area basis",
  },
  {
    label: "Power Degradation",
    value: "1.8",
    unit: "%",
    icon: TrendingDown,
    note: "After 200 TC + 10 HF cycles",
  },
  {
    label: "Temp. Coeff. (Pmax)",
    value: "−0.34",
    unit: "%/°C",
    icon: Thermometer,
    note: "IEC 61853-1 method",
  },
]

const testResultsSummary = [
  {
    standard: "IEC 61215:2021",
    testCount: 19,
    passCount: 19,
    result: "PASS" as const,
  },
  {
    standard: "IEC 61730-1:2023",
    testCount: 12,
    passCount: 12,
    result: "PASS" as const,
  },
  {
    standard: "IEC 61730-2:2023",
    testCount: 14,
    passCount: 14,
    result: "PASS" as const,
  },
  {
    standard: "IEC 61853-1:2020",
    testCount: 6,
    passCount: 6,
    result: "PASS" as const,
  },
  {
    standard: "IEC 61853-2:2020",
    testCount: 5,
    passCount: 5,
    result: "PASS" as const,
  },
]

const traceability = {
  docFormatNo: "SLX/REP/CSR/01",
  recordNo: "SLX-2026-CSR-001457",
  revision: "Rev 2.0",
  issueDate: "2026-03-14",
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CustomerSummaryReportPage() {
  const overallVerdict = testResultsSummary.every((t) => t.result === "PASS")
    ? "PASS"
    : "FAIL"

  const handleExport = (format: string) => {
    if (format === "pdf") {
      window.print()
      return
    }
    toast.success(`${format.toUpperCase()} export initiated`, {
      description: `Your ${format.toUpperCase()} file will be ready for download shortly.`,
    })
  }

  return (
    <>
      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          /* Hide non-printable elements */
          nav,
          aside,
          header,
          .no-print,
          [data-no-print] {
            display: none !important;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-break-before {
            page-break-before: always;
          }
          @page {
            margin: 18mm 14mm;
            size: A4;
          }
        }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-8 pb-16">
        {/* ---- Export Toolbar ---- */}
        <div className="flex items-center justify-between no-print" data-no-print>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Customer Summary Report
            </h1>
            <p className="text-sm text-gray-500">
              Test report for customer distribution &mdash; SolarTech ST-500M
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("pdf")}
            >
              <FileText className="h-4 w-4 mr-1" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("word")}
            >
              <FileDown className="h-4 w-4 mr-1" />
              Word
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("excel")}
            >
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("pdf")}
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
          </div>
        </div>

        {/* ---- Report Header / Letterhead ---- */}
        <div className="border-b-4 border-blue-600 pb-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            SolarLabX Testing & Certification
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            NABL Accredited Laboratory &bull; ISO/IEC 17025:2017 Compliant
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Report Date: {traceability.issueDate}
          </p>
        </div>

        {/* ---- 1. Executive Summary ---- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <p className="text-gray-700 leading-relaxed">
                  The PV module <strong>{moduleInfo.model}</strong> (S/N:{" "}
                  {moduleInfo.serialNumber}) manufactured by{" "}
                  <strong>{moduleInfo.manufacturer}</strong> has been evaluated
                  in accordance with{" "}
                  <strong>IEC 61215:2021, IEC 61730:2023,</strong> and{" "}
                  <strong>IEC 61853:2020</strong> standards. All qualification
                  and safety tests have been completed successfully.
                </p>
                <p className="text-gray-600 text-sm">
                  Based on the test results, the module is recommended for
                  design qualification and type approval certification.
                </p>
              </div>
              <div className="shrink-0">
                {overallVerdict === "PASS" ? (
                  <div className="flex flex-col items-center gap-1 rounded-xl border-2 border-green-500 bg-green-50 px-8 py-4">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                    <span className="text-2xl font-extrabold text-green-700">
                      PASS
                    </span>
                    <span className="text-xs text-green-600">
                      All Standards Met
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 rounded-xl border-2 border-red-500 bg-red-50 px-8 py-4">
                    <XCircle className="h-10 w-10 text-red-600" />
                    <span className="text-2xl font-extrabold text-red-700">
                      FAIL
                    </span>
                    <span className="text-xs text-red-600">
                      See Details Below
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ---- 2. Module Information ---- */}
        <Card>
          <CardHeader>
            <CardTitle>Module Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Photo Placeholder */}
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 h-56">
                <div className="text-center text-gray-400">
                  <Camera className="h-10 w-10 mx-auto mb-2" />
                  <p className="text-sm font-medium">Module Photo</p>
                  <p className="text-xs">Front &amp; rear view</p>
                </div>
              </div>

              {/* Nameplate Data */}
              <div className="md:col-span-2">
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  {[
                    ["Manufacturer", moduleInfo.manufacturer],
                    ["Model", moduleInfo.model],
                    ["Serial No.", moduleInfo.serialNumber],
                    ["Rated Power", moduleInfo.ratedPower],
                    ["Dimensions", moduleInfo.dimensions],
                    ["Weight", moduleInfo.weight],
                    ["Cell Type", moduleInfo.cellType],
                    ["Cell Count", moduleInfo.cellCount],
                    ["Voc", moduleInfo.voc],
                    ["Isc", moduleInfo.isc],
                    ["Vmp", moduleInfo.vmp],
                    ["Imp", moduleInfo.imp],
                    ["Connector", moduleInfo.connectorType],
                    ["Junction Box", moduleInfo.junctionBox],
                    ["Glass", moduleInfo.glass],
                    ["Encapsulant", moduleInfo.encapsulant],
                    ["Backsheet", moduleInfo.backsheet],
                    ["Frame", moduleInfo.frameType],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between py-1.5 border-b border-gray-100"
                    >
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium text-gray-900 text-right">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ---- 3. Standards Tested ---- */}
        <Card>
          <CardHeader>
            <CardTitle>Standards Tested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {standardsTested.map((s) => (
                <div
                  key={s.standard}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{s.standard}</p>
                    <p className="text-sm text-gray-500">{s.title}</p>
                  </div>
                  <Badge
                    variant={s.result === "PASS" ? "default" : "destructive"}
                    className={
                      s.result === "PASS"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : ""
                    }
                  >
                    {s.result === "PASS" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                    )}
                    {s.result}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ---- 4. Key Performance Metrics ---- */}
        <div className="print-break-before">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Key Performance Metrics
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceMetrics.map((m) => {
              const Icon = m.icon
              return (
                <Card key={m.label}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-blue-50 p-2">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          {m.label}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {m.value}
                          <span className="text-sm font-normal text-gray-500 ml-1">
                            {m.unit}
                          </span>
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{m.note}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* ---- 5. Test Results Summary ---- */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-semibold text-gray-600">
                      Standard
                    </th>
                    <th className="pb-3 font-semibold text-gray-600 text-center">
                      Tests Performed
                    </th>
                    <th className="pb-3 font-semibold text-gray-600 text-center">
                      Tests Passed
                    </th>
                    <th className="pb-3 font-semibold text-gray-600 text-right">
                      Overall Result
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {testResultsSummary.map((row) => (
                    <tr key={row.standard} className="border-b last:border-0">
                      <td className="py-3 font-medium text-gray-900">
                        {row.standard}
                      </td>
                      <td className="py-3 text-center text-gray-700">
                        {row.testCount}
                      </td>
                      <td className="py-3 text-center text-gray-700">
                        {row.passCount}
                      </td>
                      <td className="py-3 text-right">
                        <Badge
                          variant={
                            row.result === "PASS" ? "default" : "destructive"
                          }
                          className={
                            row.result === "PASS"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : ""
                          }
                        >
                          {row.result}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2">
                    <td className="pt-3 font-bold text-gray-900">Total</td>
                    <td className="pt-3 text-center font-bold text-gray-900">
                      {testResultsSummary.reduce(
                        (sum, r) => sum + r.testCount,
                        0
                      )}
                    </td>
                    <td className="pt-3 text-center font-bold text-gray-900">
                      {testResultsSummary.reduce(
                        (sum, r) => sum + r.passCount,
                        0
                      )}
                    </td>
                    <td className="pt-3 text-right">
                      <Badge
                        variant={
                          overallVerdict === "PASS" ? "default" : "destructive"
                        }
                        className={
                          overallVerdict === "PASS"
                            ? "bg-green-600 text-white hover:bg-green-600"
                            : ""
                        }
                      >
                        {overallVerdict}
                      </Badge>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ---- 6. Certification Recommendation ---- */}
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <ShieldCheck className="h-5 w-5" />
              Certification Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              Based on the comprehensive evaluation conducted in accordance with
              the applicable IEC standards, the photovoltaic module{" "}
              <strong>{moduleInfo.model}</strong> (Serial No.:{" "}
              {moduleInfo.serialNumber}) manufactured by{" "}
              <strong>{moduleInfo.manufacturer}</strong> has{" "}
              <strong>successfully passed</strong> all design qualification
              (IEC 61215:2021), safety qualification (IEC 61730:2023), and
              energy performance (IEC 61853:2020) test sequences.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              The laboratory hereby recommends this module type for{" "}
              <strong>design qualification and type approval certification</strong>.
              This recommendation is valid for modules manufactured under the
              same design, materials, and production processes as the tested
              specimen.
            </p>
            <div className="mt-6 grid sm:grid-cols-3 gap-4 text-center text-sm">
              <div className="rounded-lg border border-blue-200 bg-white p-3">
                <p className="text-gray-500">Tested By</p>
                <p className="font-semibold text-gray-900 mt-1">
                  SolarLabX Testing Centre
                </p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-white p-3">
                <p className="text-gray-500">Authorized Signatory</p>
                <div className="h-8 flex items-end justify-center">
                  <p className="font-semibold text-gray-900 italic">
                    [Digital Signature]
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-blue-200 bg-white p-3">
                <p className="text-gray-500">Date of Issue</p>
                <p className="font-semibold text-gray-900 mt-1">
                  {traceability.issueDate}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ---- 8. ISO 17025 Traceability Footer ---- */}
        <div className="border-t pt-4 text-xs text-gray-400 flex flex-wrap items-center justify-between gap-2">
          <span>
            Doc Format No: {traceability.docFormatNo} &nbsp;|&nbsp; Record No:{" "}
            {traceability.recordNo} &nbsp;|&nbsp; {traceability.revision}
          </span>
          <span>
            This report shall not be reproduced except in full without written
            approval of the laboratory.
          </span>
        </div>
      </div>
    </>
  )
}
