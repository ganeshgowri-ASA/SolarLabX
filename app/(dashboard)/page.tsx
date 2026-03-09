'use client'

import Link from 'next/link'

const modules = [
  { name: 'LIMS', href: '/lims', description: 'Sample tracking, test execution, equipment management', stats: { samples: 5, activeTests: 2, equipment: 6 }, color: 'bg-blue-500' },
  { name: 'QMS', href: '/qms', description: 'Document control, CAPA management, compliance', stats: { documents: 5, openCAPAs: 2, compliance: '85%' }, color: 'bg-green-500' },
  { name: 'Audit', href: '/audit', description: 'Audit planning, NC tracking, CAR management', stats: {}, color: 'bg-purple-500' },
  { name: 'Projects', href: '/projects', description: 'Test project tracking, Gantt charts, resources', stats: {}, color: 'bg-indigo-500' },
  { name: 'Uncertainty', href: '/uncertainty', description: 'ISO 17025 measurement uncertainty calculations', stats: {}, color: 'bg-cyan-500' },
  { name: 'Vision AI', href: '/vision-ai', description: 'AI-powered defect detection and classification', stats: {}, color: 'bg-rose-500' },
  { name: 'SOP Gen', href: '/sop-gen', description: 'AI-powered SOP generation from IEC standards', stats: {}, color: 'bg-amber-500' },
  { name: 'Reports', href: '/reports', description: 'Automated test report generation', stats: {}, color: 'bg-teal-500' },
  { name: 'Sun Simulator', href: '/sun-simulator', description: 'IEC 60904-9 classifier for sun simulators', stats: {}, color: 'bg-yellow-500' },
  { name: 'Chamber Config', href: '/chamber-config', description: 'Environmental test chamber configurator', stats: {}, color: 'bg-orange-500' },
  { name: 'Procurement', href: '/procurement', description: 'ISO-compliant procurement lifecycle', stats: {}, color: 'bg-emerald-500' },
]

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">SolarLabX Dashboard</h1>
        <p className="text-sm text-gray-500">Unified Solar PV Lab Operations Suite</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Total Samples</div>
          <div className="text-2xl font-bold text-gray-900">5</div>
          <div className="text-xs text-green-600 mt-1">2 in active testing</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Active Tests</div>
          <div className="text-2xl font-bold text-gray-900">4</div>
          <div className="text-xs text-amber-600 mt-1">1 pending review</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Equipment</div>
          <div className="text-2xl font-bold text-gray-900">6</div>
          <div className="text-xs text-red-600 mt-1">2 calibration alerts</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Open CAPAs</div>
          <div className="text-2xl font-bold text-gray-900">3</div>
          <div className="text-xs text-orange-600 mt-1">1 high priority</div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">Modules</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(mod => (
          <Link key={mod.name} href={mod.href}>
            <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 ${mod.color} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                  {mod.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{mod.name}</h3>
                  <p className="text-xs text-gray-500">{mod.description}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
