import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/api-auth'
import { mockCAPAs } from '@/lib/mock-data'
import { generateId } from '@/lib/utils'
import { EIGHT_D_STEPS } from '@/lib/constants'
import type { CAPA } from '@/lib/types'

const CAPAPostSchema = z.object({
  title: z.string().min(1).max(300),
  type: z.enum(['corrective', 'preventive']).optional(),
  priority: z.enum(['critical', 'high', 'normal', 'low']).optional(),
  source: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  assignedTo: z.string().max(200).optional(),
  targetCompletionDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}T/).optional()),
  relatedDocuments: z.array(z.string().max(100)).max(20).optional(),
})

const capas = [...mockCAPAs]

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

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
  const { error } = await requireAuth();
  if (error) return error;

  const raw = await request.json()
  const parsed = CAPAPostSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', issues: parsed.error.issues }, { status: 400 })
  }
  const body = parsed.data

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
