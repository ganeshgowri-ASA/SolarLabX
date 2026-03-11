// @ts-nocheck
'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ProtocolDefinition, FormRecord, ParsedFlasherData, MeasurementField } from '@/lib/protocol-types'
import RawDataUploader from './RawDataUploader'
import {
  ChevronDown, ChevronUp, CheckCircle2, XCircle, AlertCircle,
  Save, Send, FileText, User, Calendar, Thermometer, Upload,
  BarChart3, ClipboardCheck, PenLine, Info, ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import dynamic from 'next/dynamic'

const ProtocolPdfExport = dynamic(() => import('./ProtocolPdfExport'), { ssr: false })

// ─── helpers ────────────────────────────────────────────────────────────────

function generateRecordNumber() {
  const year = new Date().getFullYear()
  const seq = String(Math.floor(Math.random() * 9000) + 1000)
  return `SLX-REC-${year}-${seq}`
}

function generateTraceId(protocolId: string, sampleId: string) {
  const ts = Date.now().toString(36).toUpperCase()
  return `TRC-${protocolId.toUpperCase().replace(/\./g, '')}-${sampleId || 'XX'}-${ts}`
}

function evalCriterion(
  criterion: ProtocolDefinition['acceptanceCriteria'][0],
  value: string | number | boolean | undefined
): 'pass' | 'fail' | 'na' {
  if (value === undefined || value === '') return 'na'
  const num = typeof value === 'number' ? value : parseFloat(String(value))
  if (criterion.operator === 'manual') return 'na'
  if (isNaN(num)) return 'na'
  switch (criterion.operator) {
    case 'gte': return criterion.limitValue !== undefined ? (num >= criterion.limitValue ? 'pass' : 'fail') : 'na'
    case 'lte': return criterion.limitValue !== undefined ? (num <= criterion.limitValue ? 'pass' : 'fail') : 'na'
    case 'gt':  return criterion.limitValue !== undefined ? (num > criterion.limitValue ? 'pass' : 'fail') : 'na'
    case 'lt':  return criterion.limitValue !== undefined ? (num < criterion.limitValue ? 'pass' : 'fail') : 'na'
    case 'max_degradation': return criterion.limitValue !== undefined ? (num <= criterion.limitValue ? 'pass' : 'fail') : 'na'
    case 'between': return 'na' // manual for ±% checks
    default: return 'na'
  }
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({
  title, icon: Icon, children, defaultOpen = true, badge
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left"
      >
        <Icon className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-semibold text-gray-700 flex-1">{title}</span>
        {badge && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">{badge}</span>}
        {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>
      {open && <div className="p-4 space-y-3">{children}</div>}
    </div>
  )
}

// ─── Form field ──────────────────────────────────────────────────────────────

function FormField({
  field,
  value,
  onChange,
  autoFilled,
  result,
}: {
  field: MeasurementField
  value: string | number | boolean
  onChange: (v: string | number | boolean) => void
  autoFilled?: boolean
  result?: 'pass' | 'fail' | 'na'
}) {
  const ResultIcon = result === 'pass' ? CheckCircle2 : result === 'fail' ? XCircle : null
  const resultColor = result === 'pass' ? 'text-green-500' : result === 'fail' ? 'text-red-500' : ''

  return (
    <div className="grid grid-cols-12 gap-2 items-start">
      <label className="col-span-4 text-xs text-gray-600 pt-2 flex items-start gap-1">
        {field.required && <span className="text-red-500 mt-0.5">*</span>}
        <span>{field.label}</span>
        {field.unit && field.unit !== '-' && (
          <span className="text-gray-400 ml-1">({field.unit})</span>
        )}
      </label>
      <div className="col-span-7 flex items-center gap-2">
        {field.type === 'boolean' ? (
          <div className="flex gap-3">
            {['Yes', 'No'].map(opt => (
              <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  checked={value === (opt === 'Yes')}
                  onChange={() => onChange(opt === 'Yes')}
                  className="accent-amber-500"
                />
                <span className="text-xs">{opt}</span>
              </label>
            ))}
          </div>
        ) : field.type === 'select' ? (
          <select
            value={String(value || '')}
            onChange={e => onChange(e.target.value)}
            className="w-full text-xs border rounded px-2 py-1.5 bg-white"
          >
            <option value="">Select…</option>
            {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : field.type === 'textarea' ? (
          <textarea
            value={String(value || '')}
            onChange={e => onChange(e.target.value)}
            rows={2}
            placeholder={field.placeholder}
            className="w-full text-xs border rounded px-2 py-1.5 resize-none"
          />
        ) : field.type === 'date' ? (
          <input
            type="date"
            value={String(value || '')}
            onChange={e => onChange(e.target.value)}
            className="text-xs border rounded px-2 py-1.5"
          />
        ) : (
          <input
            type="number"
            value={String(value ?? '')}
            onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder={field.placeholder || (field.min !== undefined ? `min ${field.min}` : '')}
            className={cn(
              'w-full text-xs border rounded px-2 py-1.5',
              autoFilled ? 'bg-amber-50 border-amber-200' : 'bg-white',
              result === 'fail' ? 'border-red-300' : ''
            )}
            step="any"
          />
        )}
        {autoFilled && (
          <span className="text-[10px] text-amber-600 whitespace-nowrap">auto-filled</span>
        )}
      </div>
      <div className="col-span-1 flex items-center pt-1.5">
        {ResultIcon && <ResultIcon className={cn('h-4 w-4', resultColor)} />}
      </div>
    </div>
  )
}

// ─── IV Curve Chart ───────────────────────────────────────────────────────────

function IVCurveSection({ data }: { data: ParsedFlasherData }) {
  if (!data.ivCurve || data.ivCurve.length === 0) return null
  const chartData = data.ivCurve.map(p => ({
    voltage: p.voltage,
    current: p.current,
    power: +(p.voltage * p.current).toFixed(2),
  }))

  return (
    <div className="bg-white rounded border p-3">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-gray-700">IV & Power Curve</h4>
        <div className="flex gap-3 text-xs text-gray-500">
          {data.voc && <span>Voc: <b>{data.voc.toFixed(1)} V</b></span>}
          {data.isc && <span>Isc: <b>{data.isc.toFixed(2)} A</b></span>}
          {data.pmax && <span>Pmax: <b className="text-amber-600">{data.pmax.toFixed(1)} W</b></span>}
          {data.ff && <span>FF: <b>{data.ff.toFixed(1)} %</b></span>}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 15 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="voltage" label={{ value: 'Voltage (V)', position: 'insideBottom', offset: -10, fontSize: 10 }} tick={{ fontSize: 10 }} />
          <YAxis yAxisId="I" label={{ value: 'Current (A)', angle: -90, position: 'insideLeft', fontSize: 10 }} tick={{ fontSize: 10 }} />
          <YAxis yAxisId="P" orientation="right" label={{ value: 'Power (W)', angle: 90, position: 'insideRight', fontSize: 10 }} tick={{ fontSize: 10 }} />
          <Tooltip formatter={(v: number, n: string) => [v.toFixed(2), n]} labelFormatter={v => `V = ${v} V`} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Line yAxisId="I" type="monotone" dataKey="current" stroke="#2563eb" strokeWidth={2} dot={false} name="Current (A)" />
          <Area yAxisId="P" type="monotone" dataKey="power" fill="#fef08a" stroke="#d97706" strokeWidth={2} name="Power (W)" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Main ProtocolForm ────────────────────────────────────────────────────────

interface ProtocolFormProps {
  protocol: ProtocolDefinition
  onSave?: (record: Partial<FormRecord>) => void
  onSubmit?: (record: FormRecord) => void
}

export default function ProtocolForm({ protocol, onSave, onSubmit }: ProtocolFormProps) {
  const DRAFT_KEY = `slx-draft-${protocol.id}`

  // Header fields
  const [sampleId, setSampleId] = useState('')
  const [sampleDesc, setSampleDesc] = useState('')
  const [clientName, setClientName] = useState('')
  const [operator, setOperator] = useState('')
  const [reviewedBy, setReviewedBy] = useState('')
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0])
  const [envTemp, setEnvTemp] = useState('')
  const [envHumidity, setEnvHumidity] = useState('')
  const [envPressure, setEnvPressure] = useState('')
  const [observations, setObservations] = useState('')
  const [operatorSig, setOperatorSig] = useState('')
  const [reviewerSig, setReviewerSig] = useState('')

  // Measurements
  const [measurements, setMeasurements] = useState<Record<string, string | number | boolean>>({})
  const [autoFilledKeys, setAutoFilledKeys] = useState<Set<string>>(new Set())

  // Raw data
  const [parsedData, setParsedData] = useState<ParsedFlasherData | null>(null)
  const [rawFiles, setRawFiles] = useState<{ name: string; size: number; uploadedAt: string }[]>([])

  // State
  const [recordNumber] = useState(generateRecordNumber())
  const [traceId] = useState(generateTraceId(protocol.id, ''))
  const [draftSaved, setDraftSaved] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Load draft on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY)
      if (draft) {
        const d = JSON.parse(draft)
        setSampleId(d.sampleId || '')
        setSampleDesc(d.sampleDesc || '')
        setClientName(d.clientName || '')
        setOperator(d.operator || '')
        setReviewedBy(d.reviewedBy || '')
        setTestDate(d.testDate || new Date().toISOString().split('T')[0])
        setEnvTemp(d.envTemp || '')
        setEnvHumidity(d.envHumidity || '')
        setEnvPressure(d.envPressure || '')
        setObservations(d.observations || '')
        setMeasurements(d.measurements || {})
      }
    } catch { /* ignore */ }
  }, [protocol.id])

  // Auto-fill measurements from parsed raw data
  useEffect(() => {
    if (!parsedData) return
    const autoMap: Record<string, string | number | boolean> = {}
    const keys = new Set<string>()
    const dataMap: Record<string, number | undefined> = {
      pmax: parsedData.pmax, voc: parsedData.voc, isc: parsedData.isc,
      vmp: parsedData.vmp, imp: parsedData.imp, ff: parsedData.ff,
      efficiency: parsedData.efficiency, irradiance: parsedData.irradiance,
      cellTemp: parsedData.cellTemp,
    }
    for (const field of protocol.measurements) {
      if (field.autoFillFrom && dataMap[field.autoFillFrom] !== undefined) {
        const v = dataMap[field.autoFillFrom]!
        autoMap[field.id] = Math.round(v * 1000) / 1000
        keys.add(field.id)
      }
    }
    setMeasurements(prev => ({ ...prev, ...autoMap }))
    setAutoFilledKeys(keys)
  }, [parsedData, protocol.measurements])

  // Evaluate criteria results
  const criteriaResults: Record<string, 'pass' | 'fail' | 'na'> = {}
  for (const crit of protocol.acceptanceCriteria) {
    const field = protocol.measurements.find(m => m.criterionId === crit.id)
    const val = field ? measurements[field.id] : undefined
    criteriaResults[crit.id] = evalCriterion(crit, val)
  }

  // For boolean-type "defect present" fields — reverse logic
  for (const field of protocol.measurements) {
    if (field.type === 'boolean' && field.criterionId) {
      const val = measurements[field.id]
      if (val === true) criteriaResults[field.criterionId] = 'fail'
      else if (val === false) criteriaResults[field.criterionId] = 'pass'
    }
  }

  const allResults = Object.values(criteriaResults)
  const overallResult = allResults.includes('fail') ? 'fail' : allResults.every(r => r === 'pass') ? 'pass' : 'pending'

  const buildRecord = (): Partial<FormRecord> => ({
    protocolId: protocol.id,
    documentFormatNumber: protocol.documentFormatNumber,
    revision: protocol.revision,
    recordNumber,
    sampleId, sampleDescription: sampleDesc, clientName, operator, reviewedBy, testDate,
    environmentConditions: { temperature: envTemp, humidity: envHumidity, pressure: envPressure },
    measurements,
    ivData: parsedData || undefined,
    rawDataFiles: rawFiles,
    traceabilityId: traceId,
    overallResult: overallResult as 'pass' | 'fail' | 'pending',
    criteriaResults,
    observations,
    status: 'draft',
    operatorSignature: operatorSig,
    reviewerSignature: reviewerSig,
  })

  const saveDraft = () => {
    const draft = { sampleId, sampleDesc, clientName, operator, reviewedBy, testDate, envTemp, envHumidity, envPressure, observations, measurements }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    setDraftSaved(true)
    setTimeout(() => setDraftSaved(false), 2000)
    onSave?.(buildRecord())
  }

  const handleSubmit = () => {
    localStorage.removeItem(DRAFT_KEY)
    setSubmitted(true)
    const record: FormRecord = { ...buildRecord(), id: recordNumber, status: 'submitted', submitDate: new Date().toISOString() } as FormRecord
    onSubmit?.(record)
  }

  const setMeasurement = (id: string, v: string | number | boolean) => {
    setMeasurements(prev => ({ ...prev, [id]: v }))
  }

  const handleRawData = useCallback((data: ParsedFlasherData | null, file: File | null) => {
    setParsedData(data)
    if (file) {
      setRawFiles(prev => {
        const exists = prev.some(f => f.name === file.name)
        if (exists) return prev
        return [...prev, { name: file.name, size: file.size, uploadedAt: new Date().toLocaleString() }]
      })
    }
  }, [])

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-800">Record Submitted</h3>
        <p className="text-sm text-gray-500 mt-1">Record No: <span className="font-mono font-semibold">{recordNumber}</span></p>
        <p className="text-xs text-gray-400 mt-1">Traceability ID: {traceId}</p>
        <button onClick={() => setSubmitted(false)} className="mt-4 px-4 py-2 bg-amber-500 text-white rounded text-sm hover:bg-amber-600">
          New Record
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-8">
      {/* ── Form Header Banner ── */}
      <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono bg-white border border-amber-300 text-amber-700 px-2 py-0.5 rounded font-bold">
                {protocol.documentFormatNumber}
              </span>
              <span className="text-xs text-amber-600">Rev. {protocol.revision}</span>
              {protocol.critical && (
                <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">⚠ Critical Test</span>
              )}
            </div>
            <h2 className="text-base font-bold text-gray-800 mt-1">
              {protocol.code} – {protocol.name}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {protocol.standard}:{protocol.standardYear} Cl. {protocol.clause} · {protocol.duration}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Record No.</div>
            <div className="text-sm font-mono font-bold text-gray-700">{recordNumber}</div>
            <div className={cn(
              'mt-1 text-xs font-semibold px-2 py-0.5 rounded',
              overallResult === 'pass' ? 'bg-green-100 text-green-700' :
              overallResult === 'fail' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-500'
            )}>
              {overallResult === 'pass' ? '✓ PASS' : overallResult === 'fail' ? '✗ FAIL' : '⧖ PENDING'}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">{protocol.description}</p>
      </div>

      {/* ── 1. Sample & Header Info ── */}
      <Section title="1. Sample & Record Header" icon={FileText}>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Sample ID *', value: sampleId, setter: setSampleId, placeholder: 'e.g. SLX-2026-0042' },
            { label: 'Client Name *', value: clientName, setter: setClientName, placeholder: 'Client / Company' },
            { label: 'Sample Description', value: sampleDesc, setter: setSampleDesc, placeholder: 'Model, serial, batch…', span: 2 },
          ].map(f => (
            <div key={f.label} className={cn(f.span === 2 ? 'col-span-2' : 'col-span-1')}>
              <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
              <input
                value={f.value}
                onChange={e => f.setter(e.target.value)}
                placeholder={f.placeholder}
                className="w-full text-xs border rounded px-2 py-1.5 bg-white"
              />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Test Date *</label>
            <input type="date" value={testDate} onChange={e => setTestDate(e.target.value)}
              className="w-full text-xs border rounded px-2 py-1.5" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Operator *</label>
            <input value={operator} onChange={e => setOperator(e.target.value)}
              placeholder="Technician name" className="w-full text-xs border rounded px-2 py-1.5" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Reviewed By</label>
            <input value={reviewedBy} onChange={e => setReviewedBy(e.target.value)}
              placeholder="Reviewer / Lab Manager" className="w-full text-xs border rounded px-2 py-1.5" />
          </div>
        </div>
      </Section>

      {/* ── 2. Environmental Conditions ── */}
      <Section title="2. Environmental Conditions at Test" icon={Thermometer} defaultOpen={false}>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Lab Temperature (°C)</label>
            <input type="number" value={envTemp} onChange={e => setEnvTemp(e.target.value)}
              placeholder="23.0" className="w-full text-xs border rounded px-2 py-1.5" step="0.1" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Relative Humidity (%RH)</label>
            <input type="number" value={envHumidity} onChange={e => setEnvHumidity(e.target.value)}
              placeholder="50" className="w-full text-xs border rounded px-2 py-1.5" step="0.1" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Pressure (hPa)</label>
            <input type="number" value={envPressure} onChange={e => setEnvPressure(e.target.value)}
              placeholder="1013" className="w-full text-xs border rounded px-2 py-1.5" />
          </div>
        </div>
      </Section>

      {/* ── 3. Pre-filled Test Conditions ── */}
      <Section title="3. Test Conditions (per Standard)" icon={Info} defaultOpen={true}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="text-left py-1.5 pr-4 font-medium">Condition</th>
                <th className="text-right py-1.5 pr-2 font-medium">Value</th>
                <th className="text-right py-1.5 pr-4 font-medium">Unit</th>
                <th className="text-left py-1.5 font-medium text-gray-400">Reference</th>
              </tr>
            </thead>
            <tbody>
              {protocol.testConditions.map((cond, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-1.5 pr-4 text-gray-700 font-medium">{cond.label}</td>
                  <td className="py-1.5 pr-2 text-right font-mono text-gray-800 font-semibold">{cond.value}</td>
                  <td className="py-1.5 pr-4 text-right text-gray-500">{cond.unit}</td>
                  <td className="py-1.5 text-gray-400 text-[10px]">{cond.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-600">
          <strong>Equipment required:</strong> {protocol.equipment.join(' · ')}
        </div>
      </Section>

      {/* ── 4. Raw Data Upload ── */}
      {protocol.rawDataConfig && (
        <Section title="4. Equipment Raw Data Upload" icon={Upload} badge={parsedData ? 'Data Loaded' : 'Upload Required'}>
          <RawDataUploader
            config={protocol.rawDataConfig}
            onParsed={handleRawData}
          />
          {parsedData && parsedData.ivCurve && parsedData.ivCurve.length > 0 && protocol.hasIVCurve && (
            <div className="mt-3">
              <IVCurveSection data={parsedData} />
            </div>
          )}
        </Section>
      )}

      {/* ── 5. Measurements ── */}
      <Section title="5. Measurements & Observations" icon={BarChart3} badge={`${protocol.measurements.length} fields`}>
        <div className="space-y-2">
          {protocol.measurements.map(field => {
            const crit = protocol.acceptanceCriteria.find(c => c.id === field.criterionId)
            const result = crit ? criteriaResults[crit.id] : undefined
            return (
              <FormField
                key={field.id}
                field={field}
                value={measurements[field.id] ?? ''}
                onChange={v => setMeasurement(field.id, v)}
                autoFilled={autoFilledKeys.has(field.id)}
                result={result}
              />
            )
          })}
        </div>
      </Section>

      {/* ── 6. Acceptance Criteria Evaluation ── */}
      <Section title="6. Acceptance Criteria Evaluation" icon={ClipboardCheck}>
        <div className="space-y-2">
          {protocol.acceptanceCriteria.map(crit => {
            const res = criteriaResults[crit.id]
            return (
              <div key={crit.id} className={cn(
                'flex items-start gap-3 p-2.5 rounded border text-xs',
                res === 'pass' ? 'bg-green-50 border-green-200' :
                res === 'fail' ? 'bg-red-50 border-red-200' :
                'bg-gray-50 border-gray-200'
              )}>
                <div className="flex-shrink-0 mt-0.5">
                  {res === 'pass' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> :
                   res === 'fail' ? <XCircle className="h-4 w-4 text-red-500" /> :
                   <AlertCircle className="h-4 w-4 text-gray-400" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-700">{crit.parameter}</div>
                  <div className="text-gray-500 mt-0.5">{crit.description}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="font-mono text-gray-600">Limit: {crit.limit} {crit.unit}</span>
                    {crit.critical && <span className="bg-red-100 text-red-600 px-1 rounded text-[10px]">Critical</span>}
                    {crit.operator === 'manual' && <span className="text-gray-400 text-[10px]">(Manual evaluation)</span>}
                  </div>
                </div>
                <div className={cn(
                  'text-xs font-bold px-2 py-0.5 rounded flex-shrink-0',
                  res === 'pass' ? 'bg-green-100 text-green-700' :
                  res === 'fail' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-500'
                )}>
                  {res === 'pass' ? 'PASS' : res === 'fail' ? 'FAIL' : 'N/A'}
                </div>
              </div>
            )
          })}
        </div>
        {/* Summary */}
        <div className={cn(
          'mt-3 p-3 rounded border text-center font-bold text-sm',
          overallResult === 'pass' ? 'bg-green-100 border-green-300 text-green-700' :
          overallResult === 'fail' ? 'bg-red-100 border-red-300 text-red-700' :
          'bg-gray-100 border-gray-300 text-gray-500'
        )}>
          Overall Result: {overallResult === 'pass' ? '✓ PASS' : overallResult === 'fail' ? '✗ FAIL' : '⧖ Pending Evaluation'}
        </div>
      </Section>

      {/* ── 7. Notes / Observations ── */}
      <Section title="7. Observations & Notes" icon={FileText} defaultOpen={false}>
        <textarea
          value={observations}
          onChange={e => setObservations(e.target.value)}
          rows={4}
          placeholder="Record any relevant observations, deviations from procedure, anomalies, or comments…"
          className="w-full text-xs border rounded px-3 py-2 resize-none"
        />
        {protocol.notes && (
          <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded p-2">
            <strong>Note:</strong> {protocol.notes}
          </div>
        )}
      </Section>

      {/* ── 8. Sign-off ── */}
      <Section title="8. Digital Sign-off" icon={PenLine} defaultOpen={false}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1 font-medium">Tested By</label>
            <div className="border rounded p-3 bg-gray-50">
              <div className="text-xs text-gray-500 mb-1">Name: {operator || '—'}</div>
              <input
                value={operatorSig}
                onChange={e => setOperatorSig(e.target.value)}
                placeholder="Type full name as signature…"
                className="w-full text-xs border rounded px-2 py-1.5 bg-white font-mono"
              />
              <div className="text-[10px] text-gray-400 mt-1">Date: {testDate}</div>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1 font-medium">Reviewed By</label>
            <div className="border rounded p-3 bg-gray-50">
              <div className="text-xs text-gray-500 mb-1">Name: {reviewedBy || '—'}</div>
              <input
                value={reviewerSig}
                onChange={e => setReviewerSig(e.target.value)}
                placeholder="Type full name as signature…"
                className="w-full text-xs border rounded px-2 py-1.5 bg-white font-mono"
              />
              <div className="text-[10px] text-gray-400 mt-1">Date: {new Date().toISOString().split('T')[0]}</div>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-400 bg-gray-50 border rounded p-2">
          Traceability ID: <span className="font-mono">{traceId}</span>
        </div>
      </Section>

      {/* ── Actions ── */}
      <div className="flex items-center gap-2 pt-2 sticky bottom-0 bg-white border-t py-3 px-1 flex-wrap">
        <button
          onClick={saveDraft}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          <Save className="h-4 w-4" />
          {draftSaved ? 'Saved!' : 'Save Draft'}
        </button>

        <ProtocolPdfExport
          protocol={protocol}
          record={buildRecord()}
          rawFiles={rawFiles}
        />

        <Link
          href={`/lims/tests/protocol/${protocol.id}`}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 text-gray-600"
        >
          <ExternalLink className="h-4 w-4" />
          Full Page
        </Link>

        <button
          onClick={handleSubmit}
          disabled={!sampleId || !operator}
          className="flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded text-sm hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
        >
          <Send className="h-4 w-4" />
          Submit Record
        </button>
        <div className={cn(
          'text-xs font-semibold px-3 py-1.5 rounded',
          overallResult === 'pass' ? 'bg-green-100 text-green-700' :
          overallResult === 'fail' ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-500'
        )}>
          {overallResult === 'pass' ? '✓ PASS' : overallResult === 'fail' ? '✗ FAIL' : 'Pending'}
        </div>
      </div>
    </div>
  )
}
