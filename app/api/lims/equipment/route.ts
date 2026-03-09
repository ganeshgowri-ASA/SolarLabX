import { NextRequest, NextResponse } from 'next/server'
import { mockEquipment } from '@/lib/mock-data'
import { getDaysUntil } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const calibrationDue = searchParams.get('calibrationDue')

  let filtered = [...mockEquipment]

  if (status && status !== 'all') {
    filtered = filtered.filter(e => e.status === status)
  }
  if (category) {
    filtered = filtered.filter(e => e.category === category)
  }
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.equipmentCode.toLowerCase().includes(q) ||
      e.manufacturer.toLowerCase().includes(q)
    )
  }
  if (calibrationDue === 'true') {
    filtered = filtered.filter(e => {
      if (!e.nextCalibrationDate) return false
      return getDaysUntil(e.nextCalibrationDate) <= 30
    })
  }

  const stats = {
    total: mockEquipment.length,
    available: mockEquipment.filter(e => e.status === 'available').length,
    inUse: mockEquipment.filter(e => e.status === 'in_use').length,
    maintenance: mockEquipment.filter(e => e.status === 'maintenance').length,
    calibrationDueSoon: mockEquipment.filter(e => {
      if (!e.nextCalibrationDate) return false
      return getDaysUntil(e.nextCalibrationDate) <= 30
    }).length,
  }

  return NextResponse.json({ equipment: filtered, stats })
}
