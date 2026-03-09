'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getStatusColor, formatDate, getDaysUntil } from '@/lib/utils'
import { EQUIPMENT_CATEGORIES } from '@/lib/constants'
import type { Equipment } from '@/lib/types'

export default function EquipmentDetailPage() {
  const params = useParams()
  const [equipment, setEquipment] = useState<Equipment | null>(null)

  useEffect(() => {
    fetch('/api/lims/equipment').then(r => r.json()).then(d => {
      const found = d.equipment.find((e: Equipment) => e.id === params.id)
      setEquipment(found || null)
    })
  }, [params.id])

  if (!equipment) {
    return <div className="text-center py-12 text-gray-500">Loading equipment...</div>
  }

  const categoryLabel = EQUIPMENT_CATEGORIES.find(c => c.value === equipment.category)?.label || equipment.category
  const calDaysLeft = equipment.nextCalibrationDate ? getDaysUntil(equipment.nextCalibrationDate) : null

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/lims" className="hover:text-amber-600">LIMS</Link>
        <span>/</span>
        <Link href="/lims/equipment" className="hover:text-amber-600">Equipment</Link>
        <span>/</span>
        <span className="text-gray-900">{equipment.equipmentCode}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{equipment.name}</h1>
          <p className="text-sm text-gray-500">{equipment.equipmentCode} | {categoryLabel}</p>
        </div>
        <span className={`text-sm font-medium px-3 py-1 rounded ${getStatusColor(equipment.status)}`}>
          {equipment.status.replace(/_/g, ' ').toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-xs font-semibold text-gray-500 mb-3">IDENTIFICATION</h3>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-gray-400 text-xs">Manufacturer</dt><dd className="font-medium">{equipment.manufacturer}</dd></div>
            <div><dt className="text-gray-400 text-xs">Model</dt><dd>{equipment.model}</dd></div>
            <div><dt className="text-gray-400 text-xs">Serial Number</dt><dd className="font-mono text-xs">{equipment.serialNumber}</dd></div>
            <div><dt className="text-gray-400 text-xs">Location</dt><dd>{equipment.location}</dd></div>
          </dl>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-xs font-semibold text-gray-500 mb-3">CALIBRATION</h3>
          <dl className="space-y-2 text-sm">
            {equipment.lastCalibrationDate && <div><dt className="text-gray-400 text-xs">Last Calibration</dt><dd>{formatDate(equipment.lastCalibrationDate)}</dd></div>}
            {equipment.nextCalibrationDate && (
              <div>
                <dt className="text-gray-400 text-xs">Next Calibration</dt>
                <dd className={`font-medium ${calDaysLeft !== null && calDaysLeft <= 0 ? 'text-red-600' : calDaysLeft !== null && calDaysLeft <= 30 ? 'text-orange-600' : 'text-green-600'}`}>
                  {formatDate(equipment.nextCalibrationDate)}
                  {calDaysLeft !== null && ` (${calDaysLeft <= 0 ? `${Math.abs(calDaysLeft)}d overdue` : `${calDaysLeft}d remaining`})`}
                </dd>
              </div>
            )}
            {equipment.calibrationCertificate && <div><dt className="text-gray-400 text-xs">Certificate</dt><dd className="font-mono text-xs">{equipment.calibrationCertificate}</dd></div>}
          </dl>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-xs font-semibold text-gray-500 mb-3">MAINTENANCE</h3>
          <dl className="space-y-2 text-sm">
            {equipment.lastMaintenanceDate && <div><dt className="text-gray-400 text-xs">Last Maintenance</dt><dd>{formatDate(equipment.lastMaintenanceDate)}</dd></div>}
            {equipment.nextMaintenanceDate && <div><dt className="text-gray-400 text-xs">Next Maintenance</dt><dd>{formatDate(equipment.nextMaintenanceDate)}</dd></div>}
            {equipment.maintenanceNotes && <div><dt className="text-gray-400 text-xs">Notes</dt><dd className="text-xs">{equipment.maintenanceNotes}</dd></div>}
          </dl>
        </div>
      </div>

      {equipment.specifications && Object.keys(equipment.specifications).length > 0 && (
        <div className="bg-white rounded-lg border p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Technical Specifications</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(equipment.specifications).map(([key, val]) => (
              <div key={key} className="p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-400">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</div>
                <div className="text-sm font-medium">{String(val)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Supported Protocols</h3>
        <div className="flex flex-wrap gap-2">
          {equipment.protocolsSupported.map(p => (
            <span key={p} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">{p}</span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Calibration History</h3>
        {equipment.calibrationHistory.length === 0 ? (
          <p className="text-sm text-gray-500">No calibration records</p>
        ) : (
          <div className="space-y-3">
            {equipment.calibrationHistory.map(record => (
              <div key={record.id} className="flex items-start justify-between p-3 border rounded">
                <div>
                  <div className="text-sm font-medium">{record.certificateNumber}</div>
                  <div className="text-xs text-gray-500">By: {record.performedBy} | Date: {formatDate(record.date)}</div>
                  {record.notes && <div className="text-xs text-gray-400 mt-1">{record.notes}</div>}
                  {record.parameters && Object.keys(record.parameters).length > 0 && (
                    <div className="flex gap-2 mt-1">
                      {Object.entries(record.parameters).map(([k, v]) => (
                        <span key={k} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{k}: {String(v)}</span>
                      ))}
                    </div>
                  )}
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${record.result === 'pass' ? 'bg-green-100 text-green-800' : record.result === 'fail' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {record.result.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
