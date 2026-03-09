'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getStatusColor, formatDate } from '@/lib/utils'
import type { CAPA } from '@/lib/types'

export default function CAPADetailPage() {
  const params = useParams()
  const [capa, setCAPA] = useState<CAPA | null>(null)

  useEffect(() => {
    fetch('/api/qms/capa').then(r => r.json()).then(d => {
      const found = d.capas.find((c: CAPA) => c.id === params.id)
      setCAPA(found || null)
    })
  }, [params.id])

  if (!capa) {
    return <div className="text-center py-12 text-gray-500">Loading CAPA...</div>
  }

  const completedSteps = capa.eightDSteps.filter(s => s.status === 'completed').length

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/qms" className="hover:text-amber-600">QMS</Link>
        <span>/</span>
        <Link href="/qms/capa" className="hover:text-amber-600">CAPA</Link>
        <span>/</span>
        <span className="text-gray-900">{capa.capaNumber}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{capa.capaNumber}</h1>
          <p className="text-sm text-gray-500">{capa.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${capa.type === 'corrective' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{capa.type}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(capa.priority)}`}>{capa.priority}</span>
          <span className={`text-sm font-medium px-3 py-1 rounded ${getStatusColor(capa.status.includes('closed') ? 'completed' : 'in_progress')}`}>
            {capa.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-xs font-semibold text-gray-500 mb-2">DETAILS</h3>
          <dl className="space-y-1 text-sm">
            <div><dt className="text-gray-400 text-xs">Source</dt><dd>{capa.source}</dd></div>
            <div><dt className="text-gray-400 text-xs">Assigned To</dt><dd className="font-medium">{capa.assignedTo}</dd></div>
            <div><dt className="text-gray-400 text-xs">Target Date</dt><dd>{formatDate(capa.targetCompletionDate)}</dd></div>
            {capa.actualCompletionDate && <div><dt className="text-gray-400 text-xs">Completed</dt><dd>{formatDate(capa.actualCompletionDate)}</dd></div>}
          </dl>
        </div>
        <div className="bg-white rounded-lg border p-4 md:col-span-2">
          <h3 className="text-xs font-semibold text-gray-500 mb-2">DESCRIPTION</h3>
          <p className="text-sm text-gray-700">{capa.description}</p>
        </div>
      </div>

      {capa.rootCauseAnalysis && (
        <div className="bg-white rounded-lg border p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Root Cause Analysis</h3>
          <p className="text-sm text-gray-600">{capa.rootCauseAnalysis}</p>
        </div>
      )}

      {capa.correctiveAction && (
        <div className="bg-white rounded-lg border p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Corrective Action</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{capa.correctiveAction}</p>
        </div>
      )}

      {capa.preventiveAction && (
        <div className="bg-white rounded-lg border p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Preventive Action</h3>
          <p className="text-sm text-gray-600">{capa.preventiveAction}</p>
        </div>
      )}

      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">8D Methodology Progress</h3>
          <span className="text-sm font-medium text-gray-500">{completedSteps}/8 steps completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${(completedSteps / 8) * 100}%` }} />
        </div>
        <div className="space-y-3">
          {capa.eightDSteps.map((step) => (
            <div key={step.step} className={`border rounded-lg p-4 ${step.status === 'completed' ? 'bg-green-50 border-green-200' : step.status === 'in_progress' ? 'bg-amber-50 border-amber-200' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${step.status === 'completed' ? 'bg-green-500 text-white' : step.status === 'in_progress' ? 'bg-amber-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {step.status === 'completed' ? '\u2713' : step.step}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(step.status)}`}>
                    {step.status.replace(/_/g, ' ')}
                  </span>
                  {step.assignedTo && <div className="text-xs text-gray-400 mt-1">{step.assignedTo}</div>}
                </div>
              </div>
              {step.notes && (
                <div className="mt-2 ml-11 text-xs text-gray-600 bg-white p-2 rounded border">
                  {step.notes}
                </div>
              )}
              {step.completedAt && (
                <div className="mt-1 ml-11 text-xs text-gray-400">
                  Completed: {formatDate(step.completedAt)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {capa.relatedDocuments.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Related Documents</h3>
          <div className="flex flex-wrap gap-2">
            {capa.relatedDocuments.map(doc => (
              <span key={doc} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">{doc}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
