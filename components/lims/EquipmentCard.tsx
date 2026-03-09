'use client'

import Link from 'next/link'
import type { Equipment } from '@/lib/types'
import { getStatusColor, getDaysUntil, formatDate } from '@/lib/utils'
import { EQUIPMENT_CATEGORIES } from '@/lib/constants'

interface EquipmentCardProps {
  equipment: Equipment
}

export default function EquipmentCard({ equipment }: EquipmentCardProps) {
  const categoryLabel = EQUIPMENT_CATEGORIES.find(c => c.value === equipment.category)?.label || equipment.category
  const calDaysLeft = equipment.nextCalibrationDate ? getDaysUntil(equipment.nextCalibrationDate) : null

  return (
    <Link href={`/equipment/${equipment.id}`}>
      <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-sm">{equipment.name}</h3>
            <p className="text-xs text-gray-500">{equipment.equipmentCode} | {categoryLabel}</p>
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(equipment.status)}`}>
            {equipment.status.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-3">
          <div>
            <span className="text-gray-400">Manufacturer:</span>
            <div className="font-medium">{equipment.manufacturer}</div>
          </div>
          <div>
            <span className="text-gray-400">Model:</span>
            <div className="font-medium">{equipment.model}</div>
          </div>
          <div>
            <span className="text-gray-400">Location:</span>
            <div className="font-medium">{equipment.location}</div>
          </div>
          <div>
            <span className="text-gray-400">Serial:</span>
            <div className="font-medium">{equipment.serialNumber}</div>
          </div>
        </div>

        {equipment.nextCalibrationDate && (
          <div className={`mt-3 p-2 rounded text-xs ${calDaysLeft !== null && calDaysLeft <= 0 ? 'bg-red-50 text-red-700' : calDaysLeft !== null && calDaysLeft <= 30 ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'}`}>
            <div className="font-medium">
              {calDaysLeft !== null && calDaysLeft <= 0
                ? 'CALIBRATION OVERDUE'
                : calDaysLeft !== null && calDaysLeft <= 30
                ? `Calibration due in ${calDaysLeft} days`
                : `Next calibration: ${formatDate(equipment.nextCalibrationDate)}`
              }
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-1">
          {equipment.protocolsSupported.slice(0, 3).map(p => (
            <span key={p} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{p}</span>
          ))}
          {equipment.protocolsSupported.length > 3 && (
            <span className="text-xs text-gray-400">+{equipment.protocolsSupported.length - 3} more</span>
          )}
        </div>
      </div>
    </Link>
  )
}
