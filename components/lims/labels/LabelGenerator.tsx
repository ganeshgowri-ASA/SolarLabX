// @ts-nocheck
'use client'

import { useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import QRCodeGenerator from './QRCodeGenerator'
import BarcodeGenerator from './BarcodeGenerator'
import {
  QrCode,
  Barcode,
  Printer,
  Download,
  Plus,
  Trash2,
  FlaskConical,
  Wrench,
  Package,
} from 'lucide-react'
import { cn, generateId, formatDate } from '@/lib/utils'

interface LabelItem {
  id: string
  sampleId: string
  sampleName: string
  clientName: string
  testStandard: string
  type: 'sample' | 'equipment'
}

const sampleLabelData: LabelItem[] = [
  { id: '1', sampleId: 'SMP-2603-XK4R', sampleName: 'Trina Solar TSM-DE19 550W', clientName: 'SunPower Corp', testStandard: 'IEC 61215', type: 'sample' },
  { id: '2', sampleId: 'SMP-2603-YL5S', sampleName: 'JinkoSolar Tiger Neo 580W', clientName: 'ReNew Power', testStandard: 'IEC 61730', type: 'sample' },
  { id: '3', sampleId: 'SMP-2603-ZM6T', sampleName: 'Canadian Solar HiKu7 665W', clientName: 'Adani Solar', testStandard: 'IEC 61215', type: 'sample' },
  { id: '4', sampleId: 'SMP-2603-AB7U', sampleName: 'LONGi Hi-MO 7 590W', clientName: 'Tata Power Solar', testStandard: 'IEC 61853', type: 'sample' },
  { id: '5', sampleId: 'SMP-2603-CD8V', sampleName: 'Waaree Energies 545W', clientName: 'NTPC', testStandard: 'IEC 61215', type: 'sample' },
]

const equipmentLabelData: LabelItem[] = [
  { id: 'e1', sampleId: 'EQ-PASAN-001', sampleName: 'Pasan HighLIGHT 3b Sun Simulator', clientName: 'Lab - Bay A', testStandard: 'Cal Due: 2026-06-15', type: 'equipment' },
  { id: 'e2', sampleId: 'EQ-WEISS-002', sampleName: 'Weiss WK3-340/70 Climatic Chamber', clientName: 'Lab - Bay B', testStandard: 'Cal Due: 2026-04-20', type: 'equipment' },
  { id: 'e3', sampleId: 'EQ-GREAT-003', sampleName: 'Greateyes EL Camera System', clientName: 'Lab - EL Room', testStandard: 'Cal Due: 2026-05-10', type: 'equipment' },
]

type TabKey = 'samples' | 'equipment' | 'batch'

export default function LabelGenerator() {
  const [activeTab, setActiveTab] = useState<TabKey>('samples')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [labelType, setLabelType] = useState<'qr' | 'barcode' | 'both'>('both')
  const printRef = useRef<HTMLDivElement>(null)

  const currentItems = activeTab === 'equipment' ? equipmentLabelData : sampleLabelData

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedItems.size === currentItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(currentItems.map(i => i.id)))
    }
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">QR Code & Barcode Labels</h2>
          <p className="text-sm text-muted-foreground">
            Generate printable QR codes and barcodes for samples and equipment
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={labelType}
            onChange={e => setLabelType(e.target.value as 'qr' | 'barcode' | 'both')}
            className="px-3 py-1.5 text-sm border rounded-md bg-card"
          >
            <option value="both">QR + Barcode</option>
            <option value="qr">QR Code Only</option>
            <option value="barcode">Barcode Only</option>
          </select>
          <button
            onClick={handlePrint}
            disabled={selectedItems.size === 0}
            className="flex items-center gap-2 px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print Labels ({selectedItems.size})
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {([
          { key: 'samples' as TabKey, label: 'Sample Labels', icon: FlaskConical },
          { key: 'equipment' as TabKey, label: 'Equipment Labels', icon: Wrench },
          { key: 'batch' as TabKey, label: 'Batch Generation', icon: Package },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key)
              setSelectedItems(new Set())
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'batch' ? (
        <BatchGenerator labelType={labelType} baseUrl={baseUrl} />
      ) : (
        <>
          {/* Selection Table */}
          <div className="rounded-lg border bg-card">
            <div className="flex items-center gap-3 px-4 py-3 border-b">
              <input
                type="checkbox"
                checked={selectedItems.size === currentItems.length && currentItems.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-border"
              />
              <span className="text-sm font-medium">Select All</span>
              <span className="text-xs text-muted-foreground">({currentItems.length} items)</span>
            </div>
            <div className="divide-y">
              {currentItems.map(item => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 transition-colors',
                    selectedItems.has(item.id) ? 'bg-primary/5' : 'hover:bg-accent/50'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="rounded border-border"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium font-mono">{item.sampleId}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {item.testStandard}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">{item.sampleName}</div>
                    <div className="text-xs text-muted-foreground">{item.clientName}</div>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    {(labelType === 'qr' || labelType === 'both') && (
                      <div className="bg-white p-1 rounded">
                        <QRCodeSVG value={`${baseUrl}/lims/samples/${item.sampleId}`} size={40} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Label Preview */}
          {selectedItems.size > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">
                Label Preview ({selectedItems.size} labels)
              </h3>
              <div ref={printRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-3">
                {currentItems
                  .filter(item => selectedItems.has(item.id))
                  .map(item => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 bg-card print:border-black print:bg-white"
                    >
                      <div className="text-center space-y-3">
                        <div className="text-xs font-bold text-primary print:text-black">
                          SOLARLABX
                        </div>
                        <div className="flex justify-center gap-4">
                          {(labelType === 'qr' || labelType === 'both') && (
                            <QRCodeGenerator
                              value={`${baseUrl}/lims/samples/${item.sampleId}`}
                              size={80}
                              showDownload={false}
                            />
                          )}
                          {(labelType === 'barcode' || labelType === 'both') && (
                            <BarcodeGenerator
                              value={item.sampleId}
                              height={40}
                              width={1.5}
                              showDownload={false}
                            />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold font-mono">{item.sampleId}</div>
                          <div className="text-xs text-muted-foreground print:text-gray-600 truncate">
                            {item.sampleName}
                          </div>
                          <div className="text-xs text-muted-foreground print:text-gray-600">
                            {item.clientName} | {item.testStandard}
                          </div>
                          <div className="text-xs text-muted-foreground print:text-gray-600 mt-1">
                            {formatDate(new Date())}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function BatchGenerator({ labelType, baseUrl }: { labelType: string; baseUrl: string }) {
  const [prefix, setPrefix] = useState('SMP')
  const [count, setCount] = useState(5)
  const [generated, setGenerated] = useState<string[]>([])

  const handleGenerate = () => {
    const ids = Array.from({ length: count }, () => generateId(prefix))
    setGenerated(ids)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold mb-4">Batch QR/Barcode Generation</h3>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">ID Prefix</label>
            <input
              type="text"
              value={prefix}
              onChange={e => setPrefix(e.target.value.toUpperCase())}
              className="px-3 py-1.5 text-sm border rounded-md bg-background w-28"
              maxLength={5}
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Count</label>
            <input
              type="number"
              value={count}
              onChange={e => setCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
              className="px-3 py-1.5 text-sm border rounded-md bg-background w-20"
              min={1}
              max={20}
            />
          </div>
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Generate Batch
          </button>
        </div>
      </div>

      {generated.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Generated Labels ({generated.length})</h3>
            <button
              onClick={() => { if (typeof window !== 'undefined') window.print() }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print All
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 print:grid-cols-4">
            {generated.map(id => (
              <div key={id} className="border rounded-lg p-3 bg-card text-center space-y-2 print:border-black">
                <div className="text-xs font-bold text-primary print:text-black">SOLARLABX</div>
                <div className="flex justify-center gap-3">
                  {(labelType === 'qr' || labelType === 'both') && (
                    <QRCodeGenerator value={`${baseUrl}/lims/samples/${id}`} size={64} showDownload={false} />
                  )}
                  {(labelType === 'barcode' || labelType === 'both') && (
                    <BarcodeGenerator value={id} height={35} width={1.2} showDownload={false} />
                  )}
                </div>
                <div className="text-sm font-bold font-mono">{id}</div>
                <div className="text-xs text-muted-foreground">{formatDate(new Date())}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
