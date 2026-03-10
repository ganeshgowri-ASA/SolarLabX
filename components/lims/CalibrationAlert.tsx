// @ts-nocheck
'use client'

import type { Equipment } from '@/lib/types'
import { getDaysUntil, formatDate } from '@/lib/utils'

interface CalibrationAlertProps {
  equipment: Equipment[]
}

export default function CalibrationAlert({ equipment }: CalibrationAlertProps) {
  const alerts = equipment
    .filter(e => {
      if (!e.nextCalibrationDate) return false
      return getDaysUntil(e.nextCalibrationDate) <= 30
    })
    .sort((a, b) => {
      const da = getDaysUntil(a.nextCalibrationDate!)
      const db = getDaysUntil(b.nextCalibrationDate!)
      return da - db
    })

  if (alerts.length === 0) return null

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        Calibration Alerts ({alerts.length})
      </h3>
      <div className="space-y-2">
        {alerts.map(eq => {
          const daysLeft = getDaysUntil(eq.nextCalibrationDate!)
          const isOverdue = daysLeft <= 0
          return (
            <div key={eq.id} className={`flex items-center justify-between p-2 rounded text-xs ${isOverdue ? 'bg-red-50' : 'bg-orange-50'}`}>
              <div>
                <div className={`font-medium ${isOverdue ? 'text-red-800' : 'text-orange-800'}`}>
                  {eq.equipmentCode} - {eq.name}
                </div>
                <div className={isOverdue ? 'text-red-600' : 'text-orange-600'}>
                  {eq.location}
                </div>
              </div>
              <div className={`text-right font-medium ${isOverdue ? 'text-red-700' : 'text-orange-700'}`}>
                {isOverdue
                  ? `OVERDUE by ${Math.abs(daysLeft)} days`
                  : `Due: ${formatDate(eq.nextCalibrationDate!)} (${daysLeft}d)`
                }
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
