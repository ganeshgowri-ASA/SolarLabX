// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getStatusColor, formatDateTime, formatDate } from '@/lib/utils'
import type { Sample, TestExecution } from '@/lib/types'

export default function SampleDetailPage() {
  const params = useParams()
  const [sample, setSample] = useState<Sample | null>(null)
  const [tests, setTests] = useState<TestExecution[]>([])

  useEffect(() => {
    fetch('/api/lims/samples').then(r => r.json()).then(d => {
      const found = d.samples.find((s: Sample) => s.id === params.id)
      setSample(found || null)
    })
    fetch(`/api/lims/tests?sampleId=${params.id}`).then(r => r.json()).then(d => setTests(d.tests))
  }, [params.id])

  if (!sample) {
    return <div className="text-center py-12 text-gray-500">Loading sample...</div>
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/lims" className="hover:text-amber-600">LIMS</Link>
        <span>/</span>
        <Link href="/lims/samples" className="hover:text-amber-600">Samples</Link>
        <span>/</span>
        <span className="text-gray-900">{sample.sampleId}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{sample.sampleId}</h1>
          <p className="text-sm text-gray-500">{sample.manufacturer} {sample.modelNumber} | Serial: {sample.serialNumber}</p>
        </div>
        <span className={`text-sm font-medium px-3 py-1 rounded ${getStatusColor(sample.status)}`}>
          {sample.status.replace(/_/g, ' ').toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Client Information</h3>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-gray-400 text-xs">Client</dt><dd className="font-medium">{sample.clientName}</dd></div>
            <div><dt className="text-gray-400 text-xs">Organization</dt><dd>{sample.clientOrganization}</dd></div>
            <div><dt className="text-gray-400 text-xs">Email</dt><dd>{sample.clientEmail}</dd></div>
            <div><dt className="text-gray-400 text-xs">Project ID</dt><dd className="font-mono text-xs">{sample.projectId}</dd></div>
          </dl>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Module Details</h3>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-gray-400 text-xs">Type</dt><dd>{sample.sampleType}</dd></div>
            <div><dt className="text-gray-400 text-xs">Manufacturer</dt><dd>{sample.manufacturer}</dd></div>
            <div><dt className="text-gray-400 text-xs">Model</dt><dd>{sample.modelNumber}</dd></div>
            <div><dt className="text-gray-400 text-xs">Serial</dt><dd className="font-mono text-xs">{sample.serialNumber}</dd></div>
            {sample.batchNumber && <div><dt className="text-gray-400 text-xs">Batch</dt><dd>{sample.batchNumber}</dd></div>}
          </dl>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Test Information</h3>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-gray-400 text-xs">Standard</dt><dd className="font-medium">{sample.testStandard}</dd></div>
            <div><dt className="text-gray-400 text-xs">Priority</dt><dd className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(sample.priority)}`}>{sample.priority}</dd></div>
            <div><dt className="text-gray-400 text-xs">Progress</dt><dd>{sample.testsCompleted} / {sample.testsTotal} tests</dd></div>
            <div><dt className="text-gray-400 text-xs">Location</dt><dd>{sample.currentLocation}</dd></div>
            {sample.overallResult && <div><dt className="text-gray-400 text-xs">Result</dt><dd className={`font-bold ${sample.overallResult === 'pass' ? 'text-green-600' : 'text-red-600'}`}>{sample.overallResult.toUpperCase()}</dd></div>}
          </dl>
        </div>
      </div>

      {(sample.lengthMm || sample.widthMm) && (
        <div className="bg-white rounded-lg border p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Physical Dimensions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sample.lengthMm && <div className="text-center p-2 bg-gray-50 rounded"><div className="text-lg font-bold">{sample.lengthMm}</div><div className="text-xs text-gray-500">Length (mm)</div></div>}
            {sample.widthMm && <div className="text-center p-2 bg-gray-50 rounded"><div className="text-lg font-bold">{sample.widthMm}</div><div className="text-xs text-gray-500">Width (mm)</div></div>}
            {sample.thicknessMm && <div className="text-center p-2 bg-gray-50 rounded"><div className="text-lg font-bold">{sample.thicknessMm}</div><div className="text-xs text-gray-500">Thickness (mm)</div></div>}
            {sample.weightKg && <div className="text-center p-2 bg-gray-50 rounded"><div className="text-lg font-bold">{sample.weightKg}</div><div className="text-xs text-gray-500">Weight (kg)</div></div>}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Test History</h3>
        {tests.length === 0 ? (
          <p className="text-sm text-gray-500">No tests executed yet</p>
        ) : (
          <div className="space-y-2">
            {tests.map(test => (
              <Link key={test.id} href={`/lims/tests/${test.id}`}>
                <div className="flex items-center justify-between p-3 rounded border hover:bg-gray-50 cursor-pointer">
                  <div>
                    <div className="text-sm font-medium">{test.executionNumber}</div>
                    <div className="text-xs text-gray-500">{test.protocolName} | {test.standardReference}</div>
                    <div className="text-xs text-gray-400">Technician: {test.technicianName}</div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(test.status)}`}>
                      {test.status.replace(/_/g, ' ')}
                    </span>
                    {test.testPassed !== null && (
                      <div className={`text-xs font-bold mt-1 ${test.testPassed ? 'text-green-600' : 'text-red-600'}`}>
                        {test.testPassed ? 'PASS' : 'FAIL'}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Chain of Custody</h3>
        <div className="space-y-3">
          {sample.custodyHistory.map((entry, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-amber-500 rounded-full" />
                {idx < sample.custodyHistory.length - 1 && <div className="w-0.5 h-8 bg-gray-200" />}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{entry.action.replace(/_/g, ' ')}</div>
                  <div className="text-xs text-gray-400">{formatDateTime(entry.timestamp)}</div>
                </div>
                <div className="text-xs text-gray-600">
                  {entry.fromLocation} → {entry.toLocation}
                </div>
                <div className="text-xs text-gray-500">By: {entry.handledBy}</div>
                {entry.notes && <div className="text-xs text-gray-400 italic mt-1">{entry.notes}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
