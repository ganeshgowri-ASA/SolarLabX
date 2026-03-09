'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getStatusColor, formatDateTime } from '@/lib/utils'
import { getTemplateById } from '@/lib/test-templates'
import TestTemplateRenderer from '@/components/lims/TestTemplateRenderer'
import IVCurveChart from '@/components/lims/IVCurveChart'
import type { TestExecution } from '@/lib/types'

export default function TestDetailPage() {
  const params = useParams()
  const [test, setTest] = useState<TestExecution | null>(null)

  useEffect(() => {
    fetch('/api/lims/tests').then(r => r.json()).then(d => {
      const found = d.tests.find((t: TestExecution) => t.id === params.id)
      setTest(found || null)
    })
  }, [params.id])

  if (!test) {
    return <div className="text-center py-12 text-gray-500">Loading test...</div>
  }

  const template = getTemplateById(test.protocolId)
  const ivCurveData = test.rawData?.ivCurve as Array<{ voltage: number; current: number }> | undefined
  const processedData = test.processedData as Record<string, number> | undefined

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/lims" className="hover:text-amber-600">LIMS</Link>
        <span>/</span>
        <Link href="/lims/tests" className="hover:text-amber-600">Tests</Link>
        <span>/</span>
        <span className="text-gray-900">{test.executionNumber}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{test.executionNumber}</h1>
          <p className="text-sm text-gray-500">{test.protocolName} | {test.standardReference}</p>
        </div>
        <div className="flex items-center gap-2">
          {test.testPassed !== null && (
            <span className={`text-sm font-bold px-3 py-1 rounded ${test.testPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {test.testPassed ? 'PASS' : 'FAIL'}
            </span>
          )}
          <span className={`text-sm font-medium px-3 py-1 rounded ${getStatusColor(test.status)}`}>
            {test.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-xs font-semibold text-gray-500 mb-2">EXECUTION DETAILS</h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Sample:</dt><dd><Link href={`/lims/samples/${test.sampleId}`} className="text-amber-600 hover:underline">Sample #{test.sampleId}</Link></dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Protocol:</dt><dd>{test.protocolId}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Technician:</dt><dd>{test.technicianName}</dd></div>
            {test.reviewerId && <div className="flex justify-between"><dt className="text-gray-500">Reviewer:</dt><dd>{test.reviewerId}</dd></div>}
          </dl>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-xs font-semibold text-gray-500 mb-2">TIMELINE</h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Created:</dt><dd>{formatDateTime(test.createdAt)}</dd></div>
            {test.startedAt && <div className="flex justify-between"><dt className="text-gray-500">Started:</dt><dd>{formatDateTime(test.startedAt)}</dd></div>}
            {test.completedAt && <div className="flex justify-between"><dt className="text-gray-500">Completed:</dt><dd>{formatDateTime(test.completedAt)}</dd></div>}
          </dl>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-xs font-semibold text-gray-500 mb-2">RESULTS SUMMARY</h3>
          {processedData && Object.keys(processedData).length > 0 ? (
            <dl className="space-y-1 text-sm">
              {Object.entries(processedData).map(([key, val]) => (
                <div key={key} className="flex justify-between">
                  <dt className="text-gray-500">{key}:</dt>
                  <dd className="font-medium">{typeof val === 'number' ? val.toFixed(2) : String(val)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-gray-500">No processed results yet</p>
          )}
        </div>
      </div>

      {ivCurveData && ivCurveData.length > 0 && (
        <div className="mb-6">
          <IVCurveChart
            data={ivCurveData}
            title={`I-V Curve - ${test.protocolName}`}
            voc={processedData?.voc}
            isc={processedData?.isc}
            pmax={processedData?.pmax}
            vmp={processedData?.vmp}
            imp={processedData?.imp}
          />
        </div>
      )}

      {template && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Test Template & Data Entry</h2>
          <TestTemplateRenderer
            template={template}
            initialData={test.inputData}
            onSubmit={(data) => console.log('Test data submitted:', data)}
            readOnly={test.status === 'completed'}
          />
        </div>
      )}

      {test.remarks && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Remarks</h3>
          <p className="text-sm text-gray-600">{test.remarks}</p>
        </div>
      )}
    </div>
  )
}
