// @ts-nocheck
'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, X, CheckCircle2, AlertCircle, Table } from 'lucide-react'
import type { ParsedFlasherData, RawDataConfig } from '@/lib/protocol-types'
import { cn } from '@/lib/utils'

interface RawDataUploaderProps {
  config: RawDataConfig
  onParsed: (data: ParsedFlasherData | null, file: File | null) => void
  onColumnsDetected?: (columns: string[]) => void
}

interface ColumnMap {
  [standardParam: string]: string
}

async function parseCSV(text: string): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  // Try to dynamically import papaparse
  try {
    const Papa = (await import('papaparse')).default
    const result = Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: false })
    return {
      headers: result.meta.fields || [],
      rows: result.data as Record<string, string>[],
    }
  } catch {
    // Fallback: manual CSV parse
    const lines = text.trim().split('\n')
    if (lines.length < 2) return { headers: [], rows: [] }
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    const rows = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      const row: Record<string, string> = {}
      headers.forEach((h, i) => { row[h] = vals[i] || '' })
      return row
    })
    return { headers, rows }
  }
}

async function parseExcel(buffer: ArrayBuffer): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  const XLSX = await import('xlsx')
  const wb = XLSX.read(buffer, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })
  if (json.length === 0) return { headers: [], rows: [] }
  const headers = Object.keys(json[0])
  const rows = json.map(r => {
    const row: Record<string, string> = {}
    headers.forEach(h => { row[h] = String(r[h] || '') })
    return row
  })
  return { headers, rows }
}

function autoMapColumns(
  headers: string[],
  columnMapping: RawDataConfig['columnMapping']
): ColumnMap {
  const map: ColumnMap = {}
  for (const [param, possibleNames] of Object.entries(columnMapping)) {
    const found = headers.find(h =>
      possibleNames.some(n => h.toLowerCase() === n.toLowerCase() || h === n)
    )
    if (found) map[param] = found
  }
  return map
}

function extractFlasherParams(
  rows: Record<string, string>[],
  map: ColumnMap
): Partial<ParsedFlasherData> {
  // Try to find summary params from last rows or dedicated param rows
  const params: Partial<ParsedFlasherData> = {}

  // Try extracting from column data (some flashers put params as rows)
  for (const row of rows) {
    const key = (row['Parameter'] || row['parameter'] || row['Name'] || '').toLowerCase()
    const val = parseFloat(row['Value'] || row['value'] || row['Result'] || '')
    if (!isNaN(val)) {
      if (/voc/i.test(key)) params.voc = val
      if (/isc/i.test(key)) params.isc = val
      if (/pmax|pmpp/i.test(key)) params.pmax = val
      if (/vmp|vmpp/i.test(key)) params.vmp = val
      if (/imp|impp/i.test(key)) params.imp = val
      if (/fill|ff/i.test(key)) params.ff = val
      if (/eff/i.test(key)) params.efficiency = val
      if (/irr|irradiance|^g$/i.test(key)) params.irradiance = val
      if (/tc|tcell|cell.*temp/i.test(key)) params.cellTemp = val
    }
  }

  // Also try direct column extraction (flasher summary at top of file)
  if (map.voc && rows[0]?.[map.voc]) params.voc = params.voc ?? parseFloat(rows[0][map.voc])
  if (map.isc && rows[0]?.[map.isc]) params.isc = params.isc ?? parseFloat(rows[0][map.isc])
  if (map.pmax && rows[0]?.[map.pmax]) params.pmax = params.pmax ?? parseFloat(rows[0][map.pmax])
  if (map.vmp && rows[0]?.[map.vmp]) params.vmp = params.vmp ?? parseFloat(rows[0][map.vmp])
  if (map.imp && rows[0]?.[map.imp]) params.imp = params.imp ?? parseFloat(rows[0][map.imp])
  if (map.ff && rows[0]?.[map.ff]) params.ff = params.ff ?? parseFloat(rows[0][map.ff])
  if (map.efficiency && rows[0]?.[map.efficiency]) params.efficiency = params.efficiency ?? parseFloat(rows[0][map.efficiency])
  if (map.irradiance && rows[0]?.[map.irradiance]) params.irradiance = params.irradiance ?? parseFloat(rows[0][map.irradiance])
  if (map.cellTemp && rows[0]?.[map.cellTemp]) params.cellTemp = params.cellTemp ?? parseFloat(rows[0][map.cellTemp])

  return params
}

function buildIVCurve(rows: Record<string, string>[], map: ColumnMap) {
  if (!map.voltage || !map.current) return []
  return rows
    .map(row => ({
      voltage: parseFloat(row[map.voltage]),
      current: parseFloat(row[map.current]),
    }))
    .filter(p => !isNaN(p.voltage) && !isNaN(p.current) && p.current >= 0)
    .sort((a, b) => a.voltage - b.voltage)
}

export default function RawDataUploader({ config, onParsed, onColumnsDetected }: RawDataUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'parsing' | 'done' | 'error'>('idle')
  const [headers, setHeaders] = useState<string[]>([])
  const [columnMap, setColumnMap] = useState<ColumnMap>({})
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([])
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [showMapper, setShowMapper] = useState(false)
  const [previewData, setPreviewData] = useState<Partial<ParsedFlasherData> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const isImageType = config.type === 'el_image' || config.type === 'ir_image'

  const processFile = useCallback(async (f: File) => {
    setFile(f)
    setStatus('parsing')
    setErrorMsg('')

    try {
      if (isImageType) {
        // For image files, just record the file
        setStatus('done')
        onParsed(null, f)
        return
      }

      const ext = f.name.split('.').pop()?.toLowerCase()
      let parsed: { headers: string[]; rows: Record<string, string>[] }

      if (ext === 'csv' || ext === 'txt') {
        const text = await f.text()
        parsed = await parseCSV(text)
      } else if (ext === 'xlsx' || ext === 'xls') {
        const buf = await f.arrayBuffer()
        parsed = await parseExcel(buf)
      } else {
        throw new Error('Unsupported file type. Upload CSV, XLSX, or XLS.')
      }

      if (parsed.headers.length === 0) throw new Error('No headers found in file.')

      setHeaders(parsed.headers)
      setParsedRows(parsed.rows)
      onColumnsDetected?.(parsed.headers)

      const autoMap = autoMapColumns(parsed.headers, config.columnMapping)
      setColumnMap(autoMap)

      const params = extractFlasherParams(parsed.rows, autoMap)
      const ivCurve = buildIVCurve(parsed.rows, autoMap)

      const result: ParsedFlasherData = {
        ivCurve,
        voc: params.voc,
        isc: params.isc,
        pmax: params.pmax,
        vmp: params.vmp,
        imp: params.imp,
        ff: params.ff,
        efficiency: params.efficiency,
        irradiance: params.irradiance,
        cellTemp: params.cellTemp,
        timestamp: new Date().toISOString(),
      }

      setPreviewData(result)
      setStatus('done')
      onParsed(result, f)
    } catch (e: unknown) {
      setStatus('error')
      setErrorMsg(e instanceof Error ? e.message : 'Parse error')
      onParsed(null, null)
    }
  }, [config, isImageType, onParsed, onColumnsDetected])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) processFile(f)
  }, [processFile])

  const applyManualMap = useCallback(() => {
    if (!parsedRows.length) return
    const params = extractFlasherParams(parsedRows, columnMap)
    const ivCurve = buildIVCurve(parsedRows, columnMap)
    const result: ParsedFlasherData = {
      ivCurve,
      ...params as ParsedFlasherData,
      timestamp: new Date().toISOString(),
    }
    setPreviewData(result)
    setShowMapper(false)
    onParsed(result, file)
  }, [parsedRows, columnMap, file, onParsed])

  const clear = () => {
    setFile(null)
    setStatus('idle')
    setHeaders([])
    setColumnMap({})
    setParsedRows([])
    setPreviewData(null)
    setErrorMsg('')
    setShowMapper(false)
    onParsed(null, null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {status === 'idle' && (
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            isDragging ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
          )}
        >
          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 font-medium">Drop equipment data file here</p>
          <p className="text-xs text-gray-400 mt-1">{config.acceptedFormats.join(', ')} — {config.description}</p>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={config.acceptedFormats.join(',')}
            onChange={e => e.target.files?.[0] && processFile(e.target.files[0])}
          />
        </div>
      )}

      {/* Parsing */}
      {status === 'parsing' && (
        <div className="border rounded-lg p-4 flex items-center gap-3">
          <div className="h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-600">Parsing {file?.name}…</span>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">Parse error</p>
            <p className="text-xs text-red-600">{errorMsg}</p>
          </div>
          <button onClick={clear} className="text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Success */}
      {status === 'done' && file && (
        <div className="border border-green-200 bg-green-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Parsed: {file.name}</span>
            <span className="text-xs text-green-600 ml-auto">{(file.size / 1024).toFixed(1)} KB</span>
            <button onClick={clear} className="text-green-400 hover:text-red-500 ml-1"><X className="h-3 w-3" /></button>
          </div>

          {!isImageType && previewData && (
            <>
              {/* Extracted parameters */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                {previewData.pmax !== undefined && <Param label="Pmax" value={previewData.pmax?.toFixed(2)} unit="W" />}
                {previewData.voc !== undefined && <Param label="Voc" value={previewData.voc?.toFixed(2)} unit="V" />}
                {previewData.isc !== undefined && <Param label="Isc" value={previewData.isc?.toFixed(3)} unit="A" />}
                {previewData.vmp !== undefined && <Param label="Vmp" value={previewData.vmp?.toFixed(2)} unit="V" />}
                {previewData.imp !== undefined && <Param label="Imp" value={previewData.imp?.toFixed(3)} unit="A" />}
                {previewData.ff !== undefined && <Param label="FF" value={previewData.ff?.toFixed(2)} unit="%" />}
                {previewData.efficiency !== undefined && <Param label="η" value={previewData.efficiency?.toFixed(2)} unit="%" />}
                {previewData.irradiance !== undefined && <Param label="Irr." value={previewData.irradiance?.toFixed(0)} unit="W/m²" />}
                {previewData.cellTemp !== undefined && <Param label="T_cell" value={previewData.cellTemp?.toFixed(1)} unit="°C" />}
              </div>
              {previewData.ivCurve && previewData.ivCurve.length > 0 && (
                <p className="text-xs text-green-600 mt-2">
                  ✓ IV curve: {previewData.ivCurve.length} data points extracted
                </p>
              )}
              {headers.length > 0 && (
                <button
                  onClick={() => setShowMapper(true)}
                  className="text-xs text-amber-600 hover:underline mt-1 flex items-center gap-1"
                >
                  <Table className="h-3 w-3" /> Re-map columns manually
                </button>
              )}
            </>
          )}

          {isImageType && (
            <p className="text-xs text-green-600">Image file uploaded for EL/IR analysis.</p>
          )}
        </div>
      )}

      {/* Manual column mapper */}
      {showMapper && headers.length > 0 && (
        <div className="border rounded-lg p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-700">Map File Columns to Parameters</h4>
            <button onClick={() => setShowMapper(false)} className="text-gray-400 hover:text-gray-600"><X className="h-3 w-3" /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(config.columnMapping).map(param => (
              <div key={param} className="flex items-center gap-1.5">
                <span className="text-[11px] text-gray-500 w-16 flex-shrink-0">{param}</span>
                <select
                  value={columnMap[param] || ''}
                  onChange={e => setColumnMap(prev => ({ ...prev, [param]: e.target.value }))}
                  className="flex-1 text-[11px] border rounded px-1.5 py-1 bg-white"
                >
                  <option value="">— skip —</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button
            onClick={applyManualMap}
            className="mt-2 px-3 py-1 bg-amber-500 text-white text-xs rounded hover:bg-amber-600"
          >
            Apply Mapping & Re-parse
          </button>
        </div>
      )}
    </div>
  )
}

function Param({ label, value, unit }: { label: string; value?: string; unit: string }) {
  return (
    <div className="bg-white border rounded px-2 py-1.5 text-center">
      <div className="text-[10px] text-gray-400">{label}</div>
      <div className="text-xs font-semibold text-gray-800">{value ?? '—'} <span className="text-[10px] font-normal text-gray-400">{unit}</span></div>
    </div>
  )
}
