import { NextRequest, NextResponse } from 'next/server'
import { mockCAPAs } from '@/lib/mock-data'
import { generateId } from '@/lib/utils'
import { EIGHT_D_STEPS } from '@/lib/constants'
import type { CAPA } from '@/lib/types'

const capas = [...mockCAPAs]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const type = searchParams.get('type')
  const priority = searchParams.get('priority')

  let filtered = [...capas]

  if (status && status !== 'all') {
    filtered = filtered.filter(c => c.status === status)
  }
  if (type) {
    filtered = filtered.filter(c => c.type === type)
  }
  if (priority) {
    filtered = filtered.filter(c => c.priority === priority)
  }

  const stats = {
    total: capas.length,
    open: capas.filter(c => !['closed', 'verified'].includes(c.status)).length,
    corrective: capas.filter(c => c.type === 'corrective').length,
    preventive: capas.filter(c => c.type === 'preventive').length,
    overdue: capas.filter(c => {
      if (c.status === 'closed' || c.status === 'verified') return false
      return new Date(c.targetCompletionDate) < new Date()
    }).length,
  }

  return NextResponse.json({ capas: filtered, stats })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const newCAPA: CAPA = {
    id: String(capas.length + 1),
    capaNumber: generateId('CAPA'),
    title: body.title,
    type: body.type || 'corrective',
    status: 'open',
    priority: body.priority || 'normal',
    source: body.source || '',
    description: body.description || '',
    rootCauseAnalysis: '',
    correctiveAction: '',
    preventiveAction: '',
    targetCompletionDate: body.targetCompletionDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    actualCompletionDate: null,
    assignedTo: body.assignedTo || '',
    verifiedBy: null,
    effectivenessReview: '',
    relatedDocuments: body.relatedDocuments || [],
    eightDSteps: EIGHT_D_STEPS.map(s => ({
      step: s.step,
      title: s.title,
      description: s.description,
      status: 'pending' as const,
      assignedTo: '',
      completedAt: null,
      notes: '',
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  capas.push(newCAPA)
  return NextResponse.json(newCAPA, { status: 201 })
}
