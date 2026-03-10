// @ts-nocheck
'use client'

import type { ComplianceRequirement } from '@/lib/types'
import { getStatusColor, formatDate } from '@/lib/utils'

interface ComplianceMatrixProps {
  requirements: ComplianceRequirement[]
}

export default function ComplianceMatrix({ requirements }: ComplianceMatrixProps) {
  const categories = Array.from(new Set(requirements.map(r => r.category)))

  const overallScore = Math.round(
    (requirements.filter(r => r.status === 'compliant').length / requirements.length) * 100
  )

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border p-4 text-center md:col-span-1">
          <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}%</div>
          <div className="text-xs text-gray-500 mt-1">Compliance Score</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{requirements.filter(r => r.status === 'compliant').length}</div>
          <div className="text-xs text-gray-500 mt-1">Compliant</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{requirements.filter(r => r.status === 'partial').length}</div>
          <div className="text-xs text-gray-500 mt-1">Partial</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{requirements.filter(r => r.status === 'non_compliant').length}</div>
          <div className="text-xs text-gray-500 mt-1">Non-Compliant</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-gray-400">{requirements.filter(r => r.status === 'not_applicable').length}</div>
          <div className="text-xs text-gray-500 mt-1">N/A</div>
        </div>
      </div>

      {categories.map(category => {
        const catReqs = requirements.filter(r => r.category === category)
        const catScore = Math.round((catReqs.filter(r => r.status === 'compliant').length / catReqs.length) * 100)

        return (
          <div key={category} className="bg-white rounded-lg border">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">{category}</h3>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${catScore >= 90 ? 'bg-green-500' : catScore >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${catScore}%` }}
                  />
                </div>
                <span className={`text-sm font-medium ${getScoreColor(catScore)}`}>{catScore}%</span>
              </div>
            </div>
            <div className="divide-y">
              {catReqs.map(req => (
                <div key={req.id} className="p-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400">{req.standard} {req.clause}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(req.status)}`}>
                          {req.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{req.requirement}</p>
                      {req.evidence && (
                        <p className="text-xs text-gray-500 mt-1">Evidence: {req.evidence}</p>
                      )}
                      {req.notes && (
                        <p className="text-xs text-amber-600 mt-1">Note: {req.notes}</p>
                      )}
                    </div>
                    {req.lastAssessedDate && (
                      <div className="text-xs text-gray-400 whitespace-nowrap">
                        Assessed: {formatDate(req.lastAssessedDate)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
