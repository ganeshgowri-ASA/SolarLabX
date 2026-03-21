// @ts-nocheck
'use client'

import { useState } from 'react'
import { cn, formatDate } from '@/lib/utils'
import { surveyTemplates, surveyResponses, type SurveyTemplate } from '@/lib/data/customer-data'

const likertLabels = ['', 'Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied']

export default function CustomerSurveys() {
  const [activeView, setActiveView] = useState<'templates' | 'responses' | 'analytics'>('templates')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['templates', 'responses', 'analytics'] as const).map(v => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium capitalize',
                activeView === v ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <button className="px-3 py-1.5 bg-amber-600 text-white rounded-md text-xs font-medium hover:bg-amber-700">
          + New Survey
        </button>
      </div>

      {activeView === 'templates' && <TemplatesList />}
      {activeView === 'responses' && <ResponsesList />}
      {activeView === 'analytics' && <SurveyAnalytics />}
    </div>
  )
}

function TemplatesList() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      {surveyTemplates.map(t => (
        <div key={t.id} className="bg-white rounded-lg border">
          <div
            className="p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => setExpanded(expanded === t.id ? null : t.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-amber-600">{t.id}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">{t.questions.length} questions</span>
                </div>
                <div className="text-sm font-medium mt-1">{t.name}</div>
                <div className="text-xs text-gray-500">{t.description}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-amber-600">{t.responseCount}</div>
                <div className="text-[10px] text-gray-500">responses</div>
                <div className="text-xs text-gray-500 mt-1">{t.responseRate}% rate</div>
              </div>
            </div>
          </div>

          {expanded === t.id && (
            <div className="px-4 pb-4 border-t bg-gray-50">
              <div className="pt-3 space-y-2">
                {t.questions.map((q, i) => (
                  <div key={q.id} className="flex gap-2 items-start">
                    <span className="text-xs text-gray-400 w-6 shrink-0">{i + 1}.</span>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-700">{q.text}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded',
                          q.type === 'likert' ? 'bg-blue-100 text-blue-600' :
                          q.type === 'rating' ? 'bg-purple-100 text-purple-600' :
                          q.type === 'multiple_choice' ? 'bg-green-100 text-green-600' :
                          'bg-gray-100 text-gray-600'
                        )}>
                          {q.type}
                        </span>
                        {q.required && <span className="text-[10px] text-red-500">Required</span>}
                      </div>
                      {q.type === 'likert' && (
                        <div className="flex gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map(v => (
                            <div key={v} className="flex flex-col items-center">
                              <div className="w-4 h-4 rounded-full border border-gray-300 bg-white" />
                              <span className="text-[8px] text-gray-400 mt-0.5">{v}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {q.options && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {q.options.map(o => (
                            <span key={o} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">{o}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function ResponsesList() {
  return (
    <div className="bg-white rounded-lg border">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Respondent</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Organization</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Survey</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Submitted</th>
              <th className="px-4 py-2 text-center font-medium text-gray-500 uppercase">Avg Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {surveyResponses.map(r => {
              const numericAnswers = r.answers.filter(a => typeof a.value === 'number')
              const avg = numericAnswers.length > 0
                ? (numericAnswers.reduce((sum, a) => sum + Number(a.value), 0) / numericAnswers.length).toFixed(1)
                : '-'
              const surveyName = surveyTemplates.find(t => t.id === r.surveyId)?.name || r.surveyId

              return (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-amber-600">{r.id}</td>
                  <td className="px-4 py-3 font-medium">{r.respondentName}</td>
                  <td className="px-4 py-3 text-gray-600">{r.respondentOrg}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{surveyName}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(r.submittedAt)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      'px-2 py-0.5 rounded font-bold',
                      Number(avg) >= 4 ? 'bg-green-100 text-green-700' :
                      Number(avg) >= 3 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    )}>
                      {avg}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SurveyAnalytics() {
  // Calculate aggregated scores per question for the main survey
  const mainSurvey = surveyTemplates[0]
  const mainResponses = surveyResponses.filter(r => r.surveyId === mainSurvey.id)

  const questionScores = mainSurvey.questions
    .filter(q => q.type === 'likert' || q.type === 'rating')
    .map(q => {
      const answers = mainResponses
        .map(r => r.answers.find(a => a.questionId === q.id))
        .filter(a => a && typeof a.value === 'number')
        .map(a => Number(a!.value))
      const avg = answers.length > 0 ? answers.reduce((s, v) => s + v, 0) / answers.length : 0
      return { question: q.text, avg: Number(avg.toFixed(1)), count: answers.length, type: q.type }
    })

  return (
    <div className="space-y-4">
      {/* Response Rate */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {surveyTemplates.map(t => (
          <div key={t.id} className="bg-white rounded-lg border p-4">
            <div className="text-xs text-gray-500 mb-1">{t.name}</div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-amber-600">{t.responseRate}%</span>
              <span className="text-xs text-gray-500 pb-0.5">response rate</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">{t.responseCount} of ~{Math.round(t.responseCount / (t.responseRate / 100))} sent</div>
          </div>
        ))}
      </div>

      {/* Question-wise average */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-semibold mb-3">Average Scores by Question — {mainSurvey.name}</h3>
        <div className="space-y-3">
          {questionScores.map((qs, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-700 truncate">{qs.question}</div>
                <div className="mt-1 bg-gray-100 rounded-full h-2.5">
                  <div
                    className={cn(
                      'h-2.5 rounded-full',
                      qs.avg >= 4 ? 'bg-green-500' : qs.avg >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                    )}
                    style={{ width: `${(qs.avg / 5) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={cn(
                  'text-sm font-bold',
                  qs.avg >= 4 ? 'text-green-600' : qs.avg >= 3 ? 'text-yellow-600' : 'text-red-600'
                )}>
                  {qs.avg}
                </span>
                <span className="text-[10px] text-gray-400"> / {qs.type === 'rating' ? '10' : '5'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
