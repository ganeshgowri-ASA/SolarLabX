'use client'

import type { ApprovalEntry } from '@/lib/types'

interface ApprovalWorkflowProps {
  steps: ApprovalEntry[]
  onApprove?: (stepIndex: number) => void
  onReject?: (stepIndex: number) => void
}

export default function ApprovalWorkflow({ steps, onApprove, onReject }: ApprovalWorkflowProps) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold text-sm mb-4">Approval Workflow</h3>
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${step.status === 'approved' ? 'bg-green-500 text-white' : step.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {step.status === 'approved' ? '\u2713' : step.status === 'rejected' ? '\u2717' : idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-0.5 h-8 ${step.status === 'approved' ? 'bg-green-300' : 'bg-gray-200'}`} />
              )}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{step.step}</div>
                  <div className="text-xs text-gray-500">
                    {step.approver || 'Not assigned'}
                    {step.date && ` - ${new Date(step.date).toLocaleDateString()}`}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded
                  ${step.status === 'approved' ? 'bg-green-100 text-green-800' : step.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                  {step.status}
                </span>
              </div>
              {step.comments && (
                <p className="text-xs text-gray-600 mt-1 italic">&quot;{step.comments}&quot;</p>
              )}
              {step.status === 'pending' && onApprove && onReject && (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => onApprove(idx)} className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Approve</button>
                  <button onClick={() => onReject(idx)} className="text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Reject</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
