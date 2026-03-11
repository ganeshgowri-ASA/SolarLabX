// @ts-nocheck
'use client'

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import type { ProtocolDefinition, FormRecord } from '@/lib/protocol-types'
import {
  PDFDownloadLink,
  Document,
  Page,
  View,
  Text,
} from '@react-pdf/renderer'

// ─── PDF Document Component ───────────────────────────────────────────────────

function ProtocolPdfDocument({
  protocol,
  record,
  rawFiles,
}: {
  protocol: ProtocolDefinition
  record: Partial<FormRecord>
  rawFiles: { name: string; size: number; uploadedAt: string }[]
}) {
  const today = new Date().toLocaleDateString('en-GB')
  const overallResult = record.overallResult || 'pending'
  const criteriaResults = record.criteriaResults || {}

  const measurementRows = protocol.measurements.map(field => {
    const val = record.measurements?.[field.id]
    const displayVal = val === undefined || val === ''
      ? '—'
      : typeof val === 'boolean'
        ? (val ? 'Yes' : 'No')
        : String(val)
    const crit = protocol.acceptanceCriteria.find(c => c.id === field.criterionId)
    const result = crit ? criteriaResults[crit.id] : undefined
    return { label: field.label, unit: field.unit, value: displayVal, result }
  })

  const chain = [
    { label: 'Raw File(s)', value: rawFiles.length > 0 ? rawFiles.map(f => f.name).join(', ') : 'Not uploaded' },
    { label: 'Format No.', value: protocol.documentFormatNumber },
    { label: 'Record No.', value: record.recordNumber || 'Pending' },
    { label: 'Trace ID', value: record.traceabilityId || '—' },
  ]

  // Styles as plain objects (react-pdf uses them as inline styles)
  const S = {
    page: { padding: 30, fontFamily: 'Helvetica', fontSize: 9, color: '#1f2937' },
    hdrRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#f59e0b', paddingBottom: 8, marginBottom: 10 },
    title: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#92400e' },
    sub: { fontSize: 8, color: '#6b7280', marginTop: 2 },
    fmtBadge: { backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#fbbf24', borderRadius: 3, paddingLeft: 6, paddingRight: 6, paddingTop: 2, paddingBottom: 2, fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#92400e' },
    recNum: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#4b5563', textAlign: 'right' },
    section: { marginTop: 9 },
    secTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#374151', backgroundColor: '#f3f4f6', paddingLeft: 6, paddingRight: 6, paddingTop: 3, paddingBottom: 3, marginBottom: 5, borderRadius: 2 },
    row: { flexDirection: 'row', marginBottom: 3 },
    lbl: { width: '35%', color: '#6b7280' },
    val: { width: '65%', color: '#111827', fontFamily: 'Helvetica-Bold' },
    tHdr: { flexDirection: 'row', backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', paddingLeft: 4, paddingRight: 4, paddingTop: 3, paddingBottom: 3 },
    tRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingLeft: 4, paddingRight: 4, paddingTop: 3, paddingBottom: 3 },
    th: { fontFamily: 'Helvetica-Bold', color: '#374151', fontSize: 8 },
    td: { color: '#374151', fontSize: 8 },
    passTag: { backgroundColor: '#dcfce7', color: '#166534', borderRadius: 2, paddingLeft: 4, paddingRight: 4, paddingTop: 1, paddingBottom: 1, fontSize: 7, fontFamily: 'Helvetica-Bold' },
    failTag: { backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: 2, paddingLeft: 4, paddingRight: 4, paddingTop: 1, paddingBottom: 1, fontSize: 7, fontFamily: 'Helvetica-Bold' },
    naTag: { backgroundColor: '#f3f4f6', color: '#6b7280', borderRadius: 2, paddingLeft: 4, paddingRight: 4, paddingTop: 1, paddingBottom: 1, fontSize: 7 },
    overall: (res: string) => ({
      borderWidth: 1,
      borderRadius: 3,
      padding: 8,
      marginTop: 8,
      textAlign: 'center',
      fontSize: 11,
      fontFamily: 'Helvetica-Bold',
      ...(res === 'pass'
        ? { backgroundColor: '#dcfce7', borderColor: '#86efac', color: '#166534' }
        : res === 'fail'
          ? { backgroundColor: '#fee2e2', borderColor: '#fca5a5', color: '#991b1b' }
          : { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb', color: '#6b7280' }),
    }),
    sigBox: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 3, padding: 8, flex: 1, marginRight: 6 },
    sigLbl: { fontSize: 7, color: '#6b7280', marginBottom: 4, fontFamily: 'Helvetica-Bold' },
    sigLine: { borderTopWidth: 1, borderTopColor: '#d1d5db', marginTop: 16, marginBottom: 4 },
    footer: { position: 'absolute', bottom: 22, left: 30, right: 30, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 4, flexDirection: 'row', justifyContent: 'space-between' },
    footerTxt: { fontSize: 7, color: '#9ca3af' },
    traceBox: { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', borderRadius: 3, padding: 6, marginTop: 7 },
    isoBox: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 3, padding: 6, marginTop: 6 },
  }

  const ivData = record.ivData

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={S.hdrRow}>
          <View>
            <Text style={S.title}>{protocol.code} – {protocol.name}</Text>
            <Text style={S.sub}>{protocol.standard}:{protocol.standardYear} · Clause {protocol.clause} · {protocol.duration}</Text>
            <Text style={{ ...S.sub, marginTop: 3 }}>{protocol.description}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={S.fmtBadge}>{protocol.documentFormatNumber}</Text>
            <Text style={{ ...S.sub, marginTop: 3 }}>Rev. {protocol.revision}</Text>
            <Text style={{ ...S.recNum, marginTop: 3 }}>{record.recordNumber || 'DRAFT'}</Text>
            <Text style={S.sub}>{today}</Text>
          </View>
        </View>

        {/* 1. Sample Info */}
        <View style={S.section}>
          <Text style={S.secTitle}>1. Sample &amp; Record Information</Text>
          <View style={S.row}><Text style={S.lbl}>Sample ID:</Text><Text style={S.val}>{record.sampleId || '—'}</Text></View>
          <View style={S.row}><Text style={S.lbl}>Sample Description:</Text><Text style={S.val}>{record.sampleDescription || '—'}</Text></View>
          <View style={S.row}><Text style={S.lbl}>Client:</Text><Text style={S.val}>{record.clientName || '—'}</Text></View>
          <View style={S.row}><Text style={S.lbl}>Test Date:</Text><Text style={S.val}>{record.testDate || '—'}</Text></View>
          <View style={S.row}><Text style={S.lbl}>Operator:</Text><Text style={S.val}>{record.operator || '—'}</Text></View>
          <View style={S.row}><Text style={S.lbl}>Reviewed By:</Text><Text style={S.val}>{record.reviewedBy || '—'}</Text></View>
        </View>

        {/* 2. Environmental Conditions */}
        <View style={S.section}>
          <Text style={S.secTitle}>2. Environmental Conditions</Text>
          <View style={S.row}><Text style={S.lbl}>Lab Temperature:</Text><Text style={S.val}>{record.environmentConditions?.temperature || '—'} °C</Text></View>
          <View style={S.row}><Text style={S.lbl}>Relative Humidity:</Text><Text style={S.val}>{record.environmentConditions?.humidity || '—'} %RH</Text></View>
          <View style={S.row}><Text style={S.lbl}>Pressure:</Text><Text style={S.val}>{record.environmentConditions?.pressure || '—'} hPa</Text></View>
        </View>

        {/* 3. Test Conditions */}
        <View style={S.section}>
          <Text style={S.secTitle}>3. Test Conditions (per Standard)</Text>
          <View style={S.tHdr}>
            <Text style={{ ...S.th, width: '35%' }}>Condition</Text>
            <Text style={{ ...S.th, width: '20%' }}>Value</Text>
            <Text style={{ ...S.th, width: '15%' }}>Unit</Text>
            <Text style={{ ...S.th, width: '30%' }}>Reference</Text>
          </View>
          {protocol.testConditions.map((cond, i) => (
            <View key={i} style={S.tRow}>
              <Text style={{ ...S.td, width: '35%' }}>{cond.label}</Text>
              <Text style={{ ...S.td, width: '20%', fontFamily: 'Helvetica-Bold' }}>{cond.value}</Text>
              <Text style={{ ...S.td, width: '15%' }}>{cond.unit}</Text>
              <Text style={{ ...S.td, width: '30%', color: '#9ca3af' }}>{cond.source}</Text>
            </View>
          ))}
          <Text style={{ fontSize: 7, color: '#6b7280', marginTop: 4 }}>
            Equipment: {protocol.equipment.join(' · ')}
          </Text>
        </View>

        {/* 4. IV / Raw Data */}
        {ivData && (ivData.voc || ivData.isc || ivData.pmax) && (
          <View style={S.section}>
            <Text style={S.secTitle}>4. Raw Data – Extracted IV Parameters</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {[
                ivData.pmax !== undefined && { l: 'Pmax', v: ivData.pmax.toFixed(2), u: 'W', bg: '#fffbeb', bc: '#fde68a', tc: '#78350f' },
                ivData.voc !== undefined && { l: 'Voc', v: ivData.voc.toFixed(2), u: 'V', bg: '#eff6ff', bc: '#bfdbfe', tc: '#1e3a8a' },
                ivData.isc !== undefined && { l: 'Isc', v: ivData.isc.toFixed(3), u: 'A', bg: '#f0fdf4', bc: '#bbf7d0', tc: '#14532d' },
                ivData.vmp !== undefined && { l: 'Vmp', v: ivData.vmp.toFixed(2), u: 'V', bg: '#f5f3ff', bc: '#ddd6fe', tc: '#4c1d95' },
                ivData.imp !== undefined && { l: 'Imp', v: ivData.imp.toFixed(3), u: 'A', bg: '#fff7ed', bc: '#fed7aa', tc: '#7c2d12' },
                ivData.ff !== undefined && { l: 'FF', v: ivData.ff.toFixed(2), u: '%', bg: '#ecfeff', bc: '#a5f3fc', tc: '#164e63' },
                ivData.efficiency !== undefined && { l: 'η (Eff)', v: ivData.efficiency.toFixed(2), u: '%', bg: '#fdf4ff', bc: '#f0abfc', tc: '#701a75' },
              ].filter(Boolean).map((p: any, i) => (
                <View key={i} style={{ backgroundColor: p.bg, borderWidth: 1, borderColor: p.bc, borderRadius: 3, padding: 5, marginRight: 5, marginBottom: 4 }}>
                  <Text style={{ fontSize: 7, color: '#6b7280' }}>{p.l}</Text>
                  <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: p.tc }}>{p.v} {p.u}</Text>
                </View>
              ))}
            </View>
            {rawFiles.length > 0 && (
              <Text style={{ fontSize: 7, color: '#6b7280', marginTop: 3 }}>
                Source: {rawFiles.map(f => f.name).join(', ')}
              </Text>
            )}
          </View>
        )}

        {/* 5. Measurements */}
        <View style={S.section}>
          <Text style={S.secTitle}>5. Measurements &amp; Observations</Text>
          <View style={S.tHdr}>
            <Text style={{ ...S.th, width: '42%' }}>Parameter</Text>
            <Text style={{ ...S.th, width: '13%' }}>Unit</Text>
            <Text style={{ ...S.th, width: '30%' }}>Value</Text>
            <Text style={{ ...S.th, width: '15%' }}>Result</Text>
          </View>
          {measurementRows.map((row, i) => (
            <View key={i} style={S.tRow}>
              <Text style={{ ...S.td, width: '42%' }}>{row.label}</Text>
              <Text style={{ ...S.td, width: '13%', color: '#9ca3af' }}>{row.unit}</Text>
              <Text style={{ ...S.td, width: '30%', fontFamily: 'Helvetica-Bold' }}>{row.value}</Text>
              <View style={{ width: '15%' }}>
                {row.result === 'pass' && <Text style={S.passTag}>PASS</Text>}
                {row.result === 'fail' && <Text style={S.failTag}>FAIL</Text>}
                {(!row.result || row.result === 'na') && <Text style={S.naTag}>N/A</Text>}
              </View>
            </View>
          ))}
        </View>

        {/* 6. Acceptance Criteria */}
        <View style={S.section}>
          <Text style={S.secTitle}>6. Acceptance Criteria Evaluation</Text>
          <View style={S.tHdr}>
            <Text style={{ ...S.th, width: '28%' }}>Parameter</Text>
            <Text style={{ ...S.th, width: '40%' }}>Criterion</Text>
            <Text style={{ ...S.th, width: '12%' }}>Unit</Text>
            <Text style={{ ...S.th, width: '10%' }}>Critical</Text>
            <Text style={{ ...S.th, width: '10%' }}>Result</Text>
          </View>
          {protocol.acceptanceCriteria.map((crit, i) => {
            const res = criteriaResults[crit.id]
            return (
              <View key={i} style={S.tRow}>
                <Text style={{ ...S.td, width: '28%' }}>{crit.parameter}</Text>
                <Text style={{ ...S.td, width: '40%', color: '#6b7280' }}>{crit.limit}</Text>
                <Text style={{ ...S.td, width: '12%' }}>{crit.unit}</Text>
                <Text style={{ ...S.td, width: '10%', color: crit.critical ? '#dc2626' : '#9ca3af' }}>
                  {crit.critical ? 'Yes' : 'No'}
                </Text>
                <View style={{ width: '10%' }}>
                  {res === 'pass' && <Text style={S.passTag}>PASS</Text>}
                  {res === 'fail' && <Text style={S.failTag}>FAIL</Text>}
                  {(!res || res === 'na') && <Text style={S.naTag}>N/A</Text>}
                </View>
              </View>
            )
          })}
          <Text style={S.overall(overallResult)}>
            Overall: {overallResult === 'pass' ? 'PASS' : overallResult === 'fail' ? 'FAIL' : 'PENDING EVALUATION'}
          </Text>
        </View>

        {/* 7. Notes */}
        {record.observations ? (
          <View style={S.section}>
            <Text style={S.secTitle}>7. Observations &amp; Notes</Text>
            <Text style={{ fontSize: 8, color: '#374151', lineHeight: 1.4 }}>{record.observations}</Text>
          </View>
        ) : null}

        {/* 8. Signatures */}
        <View style={S.section}>
          <Text style={S.secTitle}>8. Digital Sign-off</Text>
          <View style={{ flexDirection: 'row', marginTop: 4 }}>
            {[
              { role: 'TESTED BY', name: record.operator, sig: record.operatorSignature, date: record.testDate },
              { role: 'REVIEWED BY', name: record.reviewedBy, sig: record.reviewerSignature, date: today },
              { role: 'APPROVED BY', name: '', sig: '', date: '___________' },
            ].map((s, i) => (
              <View key={i} style={{ ...S.sigBox, ...(i === 2 ? { marginRight: 0 } : {}) }}>
                <Text style={S.sigLbl}>{s.role}</Text>
                <Text style={{ fontSize: 8, color: '#374151', fontFamily: 'Helvetica-Bold' }}>{s.name || '—'}</Text>
                {s.sig ? <Text style={{ fontSize: 8, fontFamily: 'Courier', color: '#78350f', marginTop: 2 }}>{s.sig}</Text> : null}
                <View style={S.sigLine} />
                <Text style={{ fontSize: 7, color: '#9ca3af' }}>Date: {s.date || today}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Traceability Chain */}
        <View style={S.traceBox}>
          <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#92400e', marginBottom: 4 }}>
            DATA TRACEABILITY CHAIN (ISO/IEC 17025:2017 Cl. 7.5)
          </Text>
          {chain.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 2 }}>
              <Text style={{ width: '25%', fontSize: 7, color: '#92400e', fontFamily: 'Helvetica-Bold' }}>{item.label}:</Text>
              <Text style={{ width: '75%', fontSize: 7, color: '#78350f', fontFamily: 'Courier' }}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* ISO Notice */}
        <View style={S.isoBox}>
          <Text style={{ fontSize: 7, color: '#1d4ed8' }}>
            ISO/IEC 17025:2017 Compliant · Raw data, measurements, and evaluation criteria are fully traceable per Clause 7.5 and 7.8.
            {' '}Format: {protocol.documentFormatNumber} · Rev. {protocol.revision}
          </Text>
        </View>

        {/* Page Footer */}
        <View style={S.footer} fixed>
          <Text style={S.footerTxt}>SolarLabX · {protocol.documentFormatNumber} Rev.{protocol.revision}</Text>
          <Text style={S.footerTxt} render={({ pageNumber, totalPages }: any) => `Page ${pageNumber} of ${totalPages}`} />
          <Text style={S.footerTxt}>Generated: {today} · ISO/IEC 17025:2017</Text>
        </View>
      </Page>
    </Document>
  )
}

// ─── Export Button ─────────────────────────────────────────────────────────────

interface ProtocolPdfExportProps {
  protocol: ProtocolDefinition
  record: Partial<FormRecord>
  rawFiles: { name: string; size: number; uploadedAt: string }[]
}

export default function ProtocolPdfExport({ protocol, record, rawFiles }: ProtocolPdfExportProps) {
  const [ready, setReady] = useState(false)

  if (!ready) {
    return (
      <button
        onClick={() => setReady(true)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 text-gray-700"
      >
        <FileDown className="h-4 w-4" />
        Export PDF
      </button>
    )
  }

  const fileName = `${protocol.documentFormatNumber}-${record.recordNumber || 'DRAFT'}-${new Date().toISOString().split('T')[0]}.pdf`

  return (
    <PDFDownloadLink
      document={
        <ProtocolPdfDocument
          protocol={protocol}
          record={record}
          rawFiles={rawFiles}
        />
      }
      fileName={fileName}
    >
      {({ loading, error }: { loading: boolean; error: Error | null }) => (
        <button
          className="flex items-center gap-2 px-4 py-2 border border-amber-300 bg-amber-50 rounded text-sm hover:bg-amber-100 text-amber-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : error ? (
            <>
              <FileDown className="h-4 w-4" />
              Retry PDF
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4" />
              Download PDF
            </>
          )}
        </button>
      )}
    </PDFDownloadLink>
  )
}
