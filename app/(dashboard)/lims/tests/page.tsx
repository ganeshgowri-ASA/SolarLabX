// @ts-nocheck
import ProtocolFormSystem from '@/components/protocol-form/ProtocolFormSystem'

export default function TestsPage() {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Test Protocol Manager</h1>
        <p className="text-sm text-gray-500">
          IEC 61215 / 61730 / 61853 / 61701 – ISO 17025 compliant protocol checksheet system
          with raw data integration, auto-fill, IV curve analysis, and document control
        </p>
      </div>
      <ProtocolFormSystem />
    </div>
  )
}
