// @ts-nocheck
import TestProtocolsManager from '@/components/lims/TestProtocolsManager'

export default function TestsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Test Protocol Manager</h1>
        <p className="text-sm text-gray-500">IEC 61215 / 61730 / 61853 / 61701 – Protocol library, route cards, scheduling &amp; status tracking</p>
      </div>
      <TestProtocolsManager />
    </div>
  )
}
