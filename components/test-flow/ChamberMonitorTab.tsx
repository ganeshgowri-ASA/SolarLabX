// @ts-nocheck
'use client'

import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, AreaChart, Area,
} from 'recharts'

// ---- Types ----
type ChamberStatus = 'Running' | 'Completed' | 'Error' | 'Out of Tolerance' | 'Standby'

// ---- Helpers ----
const STATUS_COLORS: Record<ChamberStatus, string> = {
  Running:           'bg-blue-100 text-blue-700 border-blue-300',
  Completed:         'bg-green-100 text-green-700 border-green-300',
  Error:             'bg-red-100 text-red-700 border-red-300',
  'Out of Tolerance':'bg-orange-100 text-orange-700 border-orange-300',
  Standby:           'bg-gray-100 text-gray-600 border-gray-300',
}

function StatusBadge({ status }: { status: ChamberStatus }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${STATUS_COLORS[status]}`}>
      {status}
    </span>
  )
}

function ProgressBar({ current, target, unit = '', color = 'bg-blue-500' }: { current: number; target: number; unit?: string; color?: string }) {
  const pct = Math.min(100, (current / target) * 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-600">
        <span>{current} / {target} {unit}</span>
        <span>{pct.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div className={`${color} h-3 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function Gauge({ value, min, max, label, unit, warn, danger }: {
  value: number; min: number; max: number; label: string; unit: string; warn: number; danger: number
}) {
  const pct = ((value - min) / (max - min)) * 100
  const color = value > danger || value < -danger + min
    ? 'text-red-600' : value > warn || value < -warn + min ? 'text-amber-600' : 'text-green-600'
  return (
    <div className="flex flex-col items-center p-3 border rounded-lg bg-white min-w-[110px]">
      <p className="text-xs text-gray-500 mb-1 text-center">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400">{unit}</p>
      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
      </div>
    </div>
  )
}

// ---- Mock data generators ----
function genTCProfile(cycles: number) {
  const data = []
  for (let i = 0; i <= 100; i++) {
    const t = (i / 100) * cycles * 2 // hours
    const phase = ((i % 20) / 20) * Math.PI * 2
    const setpoint = -40 + 125 * ((Math.sin(phase - Math.PI / 2) + 1) / 2)
    const actual = setpoint + (Math.random() - 0.5) * 2
    data.push({ time: parseFloat(t.toFixed(1)), setpoint: parseFloat(setpoint.toFixed(1)), actual: parseFloat(actual.toFixed(1)) })
  }
  return data
}

function genDHProfile(hours: number) {
  return Array.from({ length: 50 }, (_, i) => {
    const t = (i / 49) * hours
    const tempNoise = (Math.random() - 0.5) * 2.5
    const rhNoise = (Math.random() - 0.5) * 5
    return {
      time: parseFloat(t.toFixed(1)),
      temp: parseFloat((85 + tempNoise).toFixed(1)),
      rh: parseFloat((85 + rhNoise).toFixed(1)),
      tempSP: 85,
      rhSP: 85,
    }
  })
}

function genPIDPowerProfile(hours: number) {
  return Array.from({ length: 40 }, (_, i) => {
    const t = (i / 39) * hours
    const voltage = 1000 + (Math.random() - 0.5) * 5
    const current = 0.050 + Math.random() * 0.010
    return {
      time: parseFloat(t.toFixed(1)),
      voltage: parseFloat(voltage.toFixed(1)),
      leakage: parseFloat((current * 1000).toFixed(3)), // mA
    }
  })
}

function genLeTIDProfile(hours: number) {
  return Array.from({ length: 40 }, (_, i) => {
    const t = (i / 39) * hours
    return {
      time: parseFloat(t.toFixed(1)),
      temp: parseFloat((75 + (Math.random() - 0.5) * 2).toFixed(1)),
      current: parseFloat((8.5 + (Math.random() - 0.5) * 0.3).toFixed(2)),
    }
  })
}

// ---- Alert Log component ----
const mockAlerts = [
  { time: '2026-03-13 08:12', chamber: 'TC', message: 'Temp exceeded +85°C + 2°C tolerance briefly (+87.3°C)', level: 'Warning' },
  { time: '2026-03-13 06:55', chamber: 'DH', message: 'RH dropped to 79.5%RH (below 85-5% limit)', level: 'Warning' },
  { time: '2026-03-12 22:10', chamber: 'PID', message: 'Leakage current spike to 68mA (> 60mA threshold)', level: 'Error' },
  { time: '2026-03-12 14:30', chamber: 'TC', message: 'Ramp rate 108°C/hr on cycle 45 (> 100°C/hr limit)', level: 'Error' },
  { time: '2026-03-11 10:05', chamber: 'LeTID', message: 'Temp dip to 72.1°C (75°C - 3% tolerance)', level: 'Warning' },
]

function AlertLog({ alerts = mockAlerts }: { alerts?: typeof mockAlerts }) {
  return (
    <div>
      <h5 className="text-xs font-semibold text-gray-700 mb-2">Alert / Excursion Log</h5>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {alerts.map((a, i) => (
          <div key={i} className={`flex items-start gap-2 p-2 rounded text-xs ${a.level === 'Error' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <span className={`font-bold shrink-0 ${a.level === 'Error' ? 'text-red-600' : 'text-yellow-700'}`}>{a.level}</span>
            <span className="text-gray-500 shrink-0">[{a.chamber}]</span>
            <span className="text-gray-700">{a.message}</span>
            <span className="ml-auto text-gray-400 shrink-0">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Settings comparison table ----
function SettingsTable({ rows }: { rows: { param: string; current: string | number; standard: string | number; unit: string; ok: boolean }[] }) {
  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="bg-gray-50">
          <th className="border px-2 py-1 text-left font-medium">Parameter</th>
          <th className="border px-2 py-1 text-right font-medium">Current Setting</th>
          <th className="border px-2 py-1 text-right font-medium">IEC Requirement</th>
          <th className="border px-2 py-1 text-center font-medium">Unit</th>
          <th className="border px-2 py-1 text-center font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            <td className="border px-2 py-1">{r.param}</td>
            <td className="border px-2 py-1 text-right font-mono">{r.current}</td>
            <td className="border px-2 py-1 text-right font-mono text-gray-500">{r.standard}</td>
            <td className="border px-2 py-1 text-center text-gray-500">{r.unit}</td>
            <td className="border px-2 py-1 text-center">
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${r.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {r.ok ? '✓ OK' : '✗ OOT'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ===========================================================
// SECTION A: Thermal Cycling Chamber
// ===========================================================
const tcData = genTCProfile(200)
const tcSettings = [
  { param: 'High Temp', current: 85, standard: 85, unit: '°C', ok: true },
  { param: 'Low Temp', current: -40, standard: -40, unit: '°C', ok: true },
  { param: 'Max Ramp Rate', current: 98, standard: '≤ 100', unit: '°C/hr', ok: true },
  { param: 'Dwell at +85°C', current: 12, standard: '≥ 10', unit: 'min', ok: true },
  { param: 'Dwell at -40°C', current: 10, standard: '≥ 10', unit: 'min', ok: true },
  { param: 'Temp Tolerance (dwell)', current: '±1.8', standard: '±2', unit: '°C', ok: true },
]

function TCChamber() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Gauge value={82} min={-40} max={85} label="Chamber Temp" unit="°C" warn={83} danger={87} />
        <Gauge value={98} min={0} max={200} label="Ramp Rate" unit="°C/hr" warn={100} danger={110} />
        <div className="col-span-2 flex flex-col gap-2 p-3 border rounded-lg bg-white">
          <p className="text-xs text-gray-500 font-medium">Cycle Progress</p>
          <ProgressBar current={148} target={200} unit="cycles" color="bg-amber-500" />
          <p className="text-xs text-gray-400">Current: Heating ramp → +85°C dwell | Time remaining ~26hr</p>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-600 mb-2">Temperature Profile – Actual vs Setpoint (last 20 cycles shown)</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={tcData.slice(0, 50)} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} label={{ value: 'Time (hr)', position: 'insideBottom', offset: -2, fontSize: 10 }} />
            <YAxis domain={[-50, 95]} tick={{ fontSize: 10 }} label={{ value: '°C', angle: -90, position: 'insideLeft', fontSize: 10 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine y={85} stroke="#EF4444" strokeDasharray="3 3" label={{ value: '+85°C', fontSize: 9 }} />
            <ReferenceLine y={-40} stroke="#3B82F6" strokeDasharray="3 3" label={{ value: '-40°C', fontSize: 9 }} />
            <Line type="monotone" dataKey="setpoint" name="Setpoint" stroke="#6B7280" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            <Line type="monotone" dataKey="actual" name="Actual" stroke="#F59E0B" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <SettingsTable rows={tcSettings} />
      <AlertLog alerts={mockAlerts.filter(a => a.chamber === 'TC')} />
    </div>
  )
}

// ===========================================================
// SECTION B: Humidity Freeze Chamber
// ===========================================================
const hfSettings = [
  { param: 'High Temp', current: 85, standard: 85, unit: '°C', ok: true },
  { param: 'High RH', current: 85, standard: 85, unit: '%RH', ok: true },
  { param: 'Low Temp', current: -40, standard: -40, unit: '°C', ok: true },
  { param: 'Temp Tolerance', current: '±1.8', standard: '±2', unit: '°C', ok: true },
  { param: 'RH Tolerance', current: '±4.2', standard: '±5', unit: '%RH', ok: true },
]

function HFChamber() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Gauge value={85} min={-40} max={85} label="Temp" unit="°C" warn={83} danger={87} />
        <Gauge value={84} min={0} max={100} label="Rel. Humidity" unit="%RH" warn={90} danger={95} />
        <div className="col-span-2 flex flex-col gap-2 p-3 border rounded-lg bg-white">
          <p className="text-xs text-gray-500 font-medium">Cycle Progress</p>
          <ProgressBar current={8} target={10} unit="cycles" color="bg-purple-500" />
          <p className="text-xs text-gray-400">Current: +85°C/85%RH soak phase | ~6hr remain</p>
        </div>
      </div>
      <AlertLog alerts={[]} />
      <SettingsTable rows={hfSettings} />
    </div>
  )
}

// ===========================================================
// SECTION C: Damp Heat Chamber
// ===========================================================
const dhData = genDHProfile(1000)
const dhSettings = [
  { param: 'Temperature', current: 85, standard: '85 ±2', unit: '°C', ok: true },
  { param: 'Relative Humidity', current: 85, standard: '85 ±5', unit: '%RH', ok: true },
  { param: 'Duration', current: 1000, standard: 1000, unit: 'hr', ok: true },
]

function DHChamber() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Gauge value={85.4} min={80} max={92} label="Temp" unit="°C" warn={87} danger={90} />
        <Gauge value={84.1} min={75} max={95} label="Humidity" unit="%RH" warn={90} danger={93} />
        <div className="col-span-2 flex flex-col gap-2 p-3 border rounded-lg bg-white">
          <p className="text-xs text-gray-500 font-medium">DH Hours Progress</p>
          <ProgressBar current={872} target={1000} unit="hr" color="bg-teal-500" />
          <p className="text-xs text-gray-400">Remaining: 128 hr (~5.3 days) | ETA: 2026-03-18</p>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-600 mb-2">Continuous Log – Temp & Humidity vs Time (last 200hr)</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dhData.slice(0, 40)} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} label={{ value: 'Time (hr)', position: 'insideBottom', offset: -2, fontSize: 10 }} />
            <YAxis domain={[70, 100]} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine y={87} stroke="#EF4444" strokeDasharray="3 3" label={{ value: '+2°C limit', fontSize: 9 }} />
            <ReferenceLine y={83} stroke="#EF4444" strokeDasharray="3 3" label={{ value: '-2°C limit', fontSize: 9 }} />
            <ReferenceLine y={90} stroke="#F59E0B" strokeDasharray="2 4" label={{ value: '+5%RH', fontSize: 9 }} />
            <ReferenceLine y={80} stroke="#F59E0B" strokeDasharray="2 4" label={{ value: '-5%RH', fontSize: 9 }} />
            <Line type="monotone" dataKey="temp" name="Temp (°C)" stroke="#EF4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="rh" name="RH (%)" stroke="#3B82F6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <SettingsTable rows={dhSettings} />
      <AlertLog alerts={mockAlerts.filter(a => a.chamber === 'DH')} />
    </div>
  )
}

// ===========================================================
// SECTION D: PID Setup
// ===========================================================
const pidData = genPIDPowerProfile(96)
const pidSettings = [
  { param: 'Applied Voltage', current: 1000, standard: '1000 or 1500', unit: 'V', ok: true },
  { param: 'Temperature', current: 60, standard: '60±2 or 85±2', unit: '°C', ok: true },
  { param: 'Humidity', current: 85, standard: '85 ±5', unit: '%RH', ok: true },
  { param: 'Duration', current: 96, standard: '≥ 96', unit: 'hr', ok: true },
  { param: 'Leakage Current Avg', current: '42 mA', standard: '< 60 mA', unit: 'mA', ok: true },
]

function PIDSetup() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Gauge value={1002} min={950} max={1050} label="Applied Voltage" unit="V" warn={1020} danger={1050} />
        <Gauge value={42} min={0} max={100} label="Leakage Current" unit="mA" warn={50} danger={60} />
        <Gauge value={60.2} min={55} max={70} label="Temp" unit="°C" warn={62} danger={65} />
        <div className="flex flex-col gap-2 p-3 border rounded-lg bg-white">
          <p className="text-xs text-gray-500 font-medium">Duration Progress</p>
          <ProgressBar current={72} target={96} unit="hr" color="bg-indigo-500" />
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-600 mb-2">Power Supply – Voltage & Leakage Current vs Time</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={pidData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} label={{ value: 'Time (hr)', position: 'insideBottom', offset: -2, fontSize: 10 }} />
            <YAxis yAxisId="v" domain={[990, 1015]} tick={{ fontSize: 10 }} label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
            <YAxis yAxisId="i" orientation="right" domain={[30, 80]} tick={{ fontSize: 10 }} label={{ value: 'Leakage (mA)', angle: 90, position: 'insideRight', fontSize: 10 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine yAxisId="i" y={60} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'I limit', fontSize: 9 }} />
            <Line yAxisId="v" type="monotone" dataKey="voltage" name="Voltage (V)" stroke="#6366F1" strokeWidth={2} dot={false} />
            <Line yAxisId="i" type="monotone" dataKey="leakage" name="Leakage (mA)" stroke="#F97316" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <SettingsTable rows={pidSettings} />
      <AlertLog alerts={mockAlerts.filter(a => a.chamber === 'PID')} />
    </div>
  )
}

// ===========================================================
// SECTION E: LeTID Setup
// ===========================================================
const letidData = genLeTIDProfile(162)
const letidSettings = [
  { param: 'Temperature', current: 75, standard: '75 ±3 (IEC TS 63209)', unit: '°C', ok: true },
  { param: 'Forward Bias Current', current: 8.5, standard: 'Isc at STC', unit: 'A', ok: true },
  { param: 'Duration', current: 162, standard: '≥ 162', unit: 'hr', ok: true },
  { param: 'Power Supply Voltage', current: 0.62, standard: '< Voc', unit: 'V', ok: true },
]

function LeTIDSetup() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Gauge value={75.2} min={70} max={82} label="Temp" unit="°C" warn={78} danger={80} />
        <Gauge value={8.5} min={7} max={10} label="Forward Bias I" unit="A" warn={9.2} danger={9.8} />
        <div className="col-span-2 flex flex-col gap-2 p-3 border rounded-lg bg-white">
          <p className="text-xs text-gray-500 font-medium">Duration Progress</p>
          <ProgressBar current={118} target={162} unit="hr" color="bg-rose-500" />
          <p className="text-xs text-gray-400">Remaining: 44 hr | ETA: 2026-03-15 08:00</p>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-600 mb-2">Temperature & Forward Bias Current vs Time</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={letidData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} label={{ value: 'Time (hr)', position: 'insideBottom', offset: -2, fontSize: 10 }} />
            <YAxis yAxisId="t" domain={[70, 82]} tick={{ fontSize: 10 }} label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
            <YAxis yAxisId="i" orientation="right" domain={[8, 9.5]} tick={{ fontSize: 10 }} label={{ value: 'Current (A)', angle: 90, position: 'insideRight', fontSize: 10 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine yAxisId="t" y={75} stroke="#6B7280" strokeDasharray="3 3" label={{ value: 'SP 75°C', fontSize: 9 }} />
            <Line yAxisId="t" type="monotone" dataKey="temp" name="Temp (°C)" stroke="#EF4444" strokeWidth={2} dot={false} />
            <Line yAxisId="i" type="monotone" dataKey="current" name="Fwd Bias I (A)" stroke="#3B82F6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <SettingsTable rows={letidSettings} />
      <AlertLog alerts={mockAlerts.filter(a => a.chamber === 'LeTID')} />
    </div>
  )
}

// ===========================================================
// MAIN TAB COMPONENT
// ===========================================================
const CHAMBERS = [
  { id: 'tc',    label: 'TC Chamber',    status: 'Running' as ChamberStatus,   progress: '148 / 200 cycles' },
  { id: 'hf',    label: 'HF Chamber',    status: 'Running' as ChamberStatus,   progress: '8 / 10 cycles' },
  { id: 'dh',    label: 'DH Chamber',    status: 'Running' as ChamberStatus,   progress: '872 / 1000 hr' },
  { id: 'pid',   label: 'PID Setup',     status: 'Running' as ChamberStatus,   progress: '72 / 96 hr' },
  { id: 'letid', label: 'LeTID Setup',   status: 'Running' as ChamberStatus,   progress: '118 / 162 hr' },
]

export function ChamberMonitorTab() {
  const [activeChamberId, setActiveChamberId] = useState('tc')

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {CHAMBERS.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveChamberId(c.id)}
            className={`rounded-lg border p-3 text-left transition-all ${activeChamberId === c.id ? 'border-amber-500 bg-amber-50 shadow-sm' : 'bg-white hover:border-gray-400'}`}
          >
            <p className="text-xs font-semibold text-gray-700">{c.label}</p>
            <StatusBadge status={c.status} />
            <p className="text-xs text-gray-500 mt-1">{c.progress}</p>
          </button>
        ))}
      </div>

      {/* Chamber detail panel */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-800">
              {CHAMBERS.find(c => c.id === activeChamberId)?.label}
            </h3>
            <StatusBadge status={CHAMBERS.find(c => c.id === activeChamberId)?.status ?? 'Standby'} />
          </div>
          <span className="text-xs text-gray-400">
            Progress: {CHAMBERS.find(c => c.id === activeChamberId)?.progress}
          </span>
        </div>
        <div className="p-4">
          {activeChamberId === 'tc'    && <TCChamber />}
          {activeChamberId === 'hf'    && <HFChamber />}
          {activeChamberId === 'dh'    && <DHChamber />}
          {activeChamberId === 'pid'   && <PIDSetup />}
          {activeChamberId === 'letid' && <LeTIDSetup />}
        </div>
      </div>
    </div>
  )
}
