'use client'

import { mockComplianceRequirements } from '@/lib/mock-data'
import ComplianceMatrix from '@/components/qms/ComplianceMatrix'

export default function CompliancePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ISO 17025 / NABL Compliance</h1>
        <p className="text-sm text-gray-500">Gap analysis and compliance status tracking</p>
      </div>

      <ComplianceMatrix requirements={mockComplianceRequirements} />
    </div>
  )
}
