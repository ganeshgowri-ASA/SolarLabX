// @ts-nocheck
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { csiData, type CSIQuarter } from '@/lib/data/customer-data'

const TARGET_CSI = 85

function getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
  return trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'
}

function getTrendColor(trend: 'up' | 'down' | 'stable'): string {
  return trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
}

export default function CustomerSatisfaction() {
  const [selectedQuarter, setSelectedQuarter] = useState(csiData[csiData.length - 1])

  const latestCSI = csiData[csiData.length - 1].overall
  const prevCSI = csiData.length > 1 ? csiData[csiData.length - 2].overall : latestCSI
  const csiDelta = latestCSI - prevCSI

  return (
    <div className="space-y-6">
      {/* Overall CSI Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-6 md:col-span-1">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Overall CSI Score</div>
          <div className="flex items-end gap-3">
            <div className={cn(
              'text-5xl font-bold',
              latestCSI >= TARGET_CSI ? 'text-green-600' : latestCSI >= 75 ? 'text-amber-600' : 'text-red-600'
            )}>
              {latestCSI}
            </div>
            <div className="pb-1">
              <span className={cn('text-lg font-bold', csiDelta >= 0 ? 'text-green-600' : 'text-red-600')}>
                {csiDelta >= 0 ? '+' : ''}{csiDelta}
              </span>
              <div className="text-xs text-gray-500">vs prev quarter</div>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500">Target: {TARGET_CSI}</span>
              <span className={cn('font-medium', latestCSI >= TARGET_CSI ? 'text-green-600' : 'text-red-600')}>
                {latestCSI >= TARGET_CSI ? 'On Target' : `${TARGET_CSI - latestCSI} pts below target`}
              </span>
            </div>
            <div className="bg-gray-200 rounded-full h-3">
              <div
                className={cn('h-3 rounded-full transition-all', latestCSI >= TARGET_CSI ? 'bg-green-500' : 'bg-amber-500')}
                style={{ width: `${Math.min(latestCSI, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quarterly Trend */}
        <div className="bg-white rounded-lg border p-4 md:col-span-2">
          <h3 className="text-sm font-semibold mb-3">CSI Trend (Quarterly)</h3>
          <div className="flex items-end gap-4 h-40">
            {csiData.map((q) => {
              const height = (q.overall / 100) * 100
              const isSelected = q.quarter === selectedQuarter.quarter
              return (
                <div
                  key={q.quarter}
                  className="flex-1 flex flex-col items-center cursor-pointer"
                  onClick={() => setSelectedQuarter(q)}
                >
                  <div className="text-xs font-bold mb-1">{q.overall}</div>
                  <div className="w-full relative" style={{ height: '120px' }}>
                    <div
                      className={cn(
                        'absolute bottom-0 w-full rounded-t transition-all',
                        isSelected ? 'bg-amber-500' : q.overall >= TARGET_CSI ? 'bg-green-400' : 'bg-amber-300',
                        isSelected && 'ring-2 ring-amber-300'
                      )}
                      style={{ height: `${height}%` }}
                    />
                    {/* Target line */}
                    <div
                      className="absolute w-full border-t-2 border-dashed border-red-400"
                      style={{ bottom: `${TARGET_CSI}%` }}
                    />
                  </div>
                  <div className={cn('text-[10px] mt-1', isSelected ? 'font-bold text-amber-600' : 'text-gray-500')}>
                    {q.quarter}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1"><div className="w-8 border-t-2 border-dashed border-red-400" /><span className="text-[10px] text-gray-500">Target ({TARGET_CSI})</span></div>
          </div>
        </div>
      </div>

      {/* Category-wise Scores */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-semibold mb-4">Category-wise Scores — {selectedQuarter.quarter}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedQuarter.scores.map((s) => (
            <div key={s.category} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{s.category}</span>
                <div className="flex items-center gap-1">
                  <span className={cn('text-xs font-bold', getTrendColor(s.trend))}>
                    {getTrendIcon(s.trend)}
                  </span>
                  <span className={cn(
                    'text-lg font-bold',
                    s.score >= s.target ? 'text-green-600' : 'text-amber-600'
                  )}>
                    {s.score}
                  </span>
                </div>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className={cn('h-2 rounded-full', s.score >= s.target ? 'bg-green-500' : 'bg-amber-500')}
                  style={{ width: `${s.score}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-gray-500">Target: {s.target}</span>
                <span className={cn('text-[10px] font-medium', s.score >= s.target ? 'text-green-600' : 'text-red-600')}>
                  {s.score >= s.target ? `+${s.score - s.target}` : `${s.score - s.target}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
