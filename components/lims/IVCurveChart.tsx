// @ts-nocheck
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts'

interface IVDataPoint {
  voltage: number
  current: number
}

interface IVCurveChartProps {
  data: IVDataPoint[]
  title?: string
  voc?: number
  isc?: number
  pmax?: number
  vmp?: number
  imp?: number
}

export default function IVCurveChart({ data, title, voc, isc, pmax, vmp, imp }: IVCurveChartProps) {
  const chartData = data.map(point => ({
    voltage: point.voltage,
    current: point.current,
    power: point.voltage * point.current,
  }))

  const maxPower = Math.max(...chartData.map(d => d.power))

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">{title || 'I-V Curve'}</h3>
        {pmax !== undefined && (
          <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-1 rounded">
            Pmax = {pmax.toFixed(1)} W
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="voltage"
            label={{ value: 'Voltage (V)', position: 'insideBottom', offset: -5 }}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            yAxisId="current"
            label={{ value: 'Current (A)', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            yAxisId="power"
            orientation="right"
            label={{ value: 'Power (W)', angle: 90, position: 'insideRight' }}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              value.toFixed(2),
              name === 'current' ? 'Current (A)' : 'Power (W)',
            ]}
            labelFormatter={(v) => `Voltage: ${v} V`}
          />
          <Legend />
          <Line
            yAxisId="current"
            type="monotone"
            dataKey="current"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            name="Current (A)"
          />
          <Area
            yAxisId="power"
            type="monotone"
            dataKey="power"
            fill="#fbbf2440"
            stroke="#d97706"
            strokeWidth={2}
            name="Power (W)"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {(voc !== undefined || isc !== undefined) && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 pt-3 border-t">
          {voc !== undefined && (
            <div className="text-center">
              <div className="text-xs text-gray-500">Voc</div>
              <div className="text-sm font-semibold">{voc.toFixed(1)} V</div>
            </div>
          )}
          {isc !== undefined && (
            <div className="text-center">
              <div className="text-xs text-gray-500">Isc</div>
              <div className="text-sm font-semibold">{isc.toFixed(2)} A</div>
            </div>
          )}
          {pmax !== undefined && (
            <div className="text-center">
              <div className="text-xs text-gray-500">Pmax</div>
              <div className="text-sm font-semibold">{pmax.toFixed(1)} W</div>
            </div>
          )}
          {vmp !== undefined && (
            <div className="text-center">
              <div className="text-xs text-gray-500">Vmp</div>
              <div className="text-sm font-semibold">{vmp.toFixed(1)} V</div>
            </div>
          )}
          {imp !== undefined && (
            <div className="text-center">
              <div className="text-xs text-gray-500">Imp</div>
              <div className="text-sm font-semibold">{imp.toFixed(2)} A</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
