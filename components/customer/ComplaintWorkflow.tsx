// @ts-nocheck
'use client'

import { cn } from '@/lib/utils'

const workflowSteps = [
  { key: 'registered', label: 'New' },
  { key: 'acknowledged', label: 'Acknowledged' },
  { key: 'under_investigation', label: 'Under Investigation' },
  { key: 'rca_complete', label: 'RCA Complete' },
  { key: 'capa_initiated', label: 'CAPA Initiated' },
  { key: 'resolution_proposed', label: 'Resolution Proposed' },
  { key: 'resolution_accepted', label: 'Customer Approved' },
  { key: 'closed', label: 'Closed' },
]

const stepIndex: Record<string, number> = {}
workflowSteps.forEach((s, i) => { stepIndex[s.key] = i })

interface ComplaintWorkflowProps {
  currentStatus: string
}

export default function ComplaintWorkflow({ currentStatus }: ComplaintWorkflowProps) {
  const currentIdx = stepIndex[currentStatus] ?? 0
  const progress = Math.round(((currentIdx + 1) / workflowSteps.length) * 100)

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-200 rounded-full h-2.5">
          <div
            className={cn(
              'h-2.5 rounded-full transition-all duration-500',
              progress === 100 ? 'bg-green-500' : 'bg-amber-500'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={cn(
          'text-sm font-bold',
          progress === 100 ? 'text-green-600' : 'text-amber-600'
        )}>
          {progress}%
        </span>
      </div>

      {/* Step tracker */}
      <div className="flex items-center gap-0 overflow-x-auto pb-2">
        {workflowSteps.map((step, i) => {
          const isComplete = i < currentIdx
          const isCurrent = i === currentIdx
          const isNext = i === currentIdx + 1
          const isFuture = i > currentIdx + 1

          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center min-w-[80px]">
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                    isComplete && 'bg-green-500 border-green-500 text-white',
                    isCurrent && 'bg-amber-500 border-amber-500 text-white ring-2 ring-amber-200',
                    isNext && 'bg-blue-100 border-blue-400 text-blue-600',
                    isFuture && 'bg-gray-100 border-gray-300 text-gray-400',
                  )}
                >
                  {isComplete ? '✓' : i + 1}
                </div>
                <span
                  className={cn(
                    'text-[10px] mt-1 text-center leading-tight',
                    isComplete && 'text-green-600 font-medium',
                    isCurrent && 'text-amber-600 font-bold',
                    isNext && 'text-blue-600 font-medium',
                    isFuture && 'text-gray-400',
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < workflowSteps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-4 -mt-4',
                    i < currentIdx ? 'bg-green-400' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
