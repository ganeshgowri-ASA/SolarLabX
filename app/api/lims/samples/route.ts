import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/api-auth'
import { mockSamples } from '@/lib/mock-data'
import { generateId } from '@/lib/utils'
import type { Sample } from '@/lib/types'

const SamplePostSchema = z.object({
  clientName: z.string().min(1).max(200),
  clientEmail: z.string().email().max(200).optional().or(z.literal('')),
  clientOrganization: z.string().max(200).optional(),
  sampleType: z.string().min(1).max(100),
  manufacturer: z.string().min(1).max(200),
  modelNumber: z.string().min(1).max(100),
  serialNumber: z.string().min(1).max(100),
  batchNumber: z.string().max(100).optional(),
  testStandard: z.string().min(1).max(100),
  priority: z.enum(['urgent', 'high', 'normal', 'low']).optional(),
  notes: z.string().max(2000).optional(),
  projectId: z.string().max(100).optional(),
  lengthMm: z.number().positive().optional().nullable(),
  widthMm: z.number().positive().optional().nullable(),
  thicknessMm: z.number().positive().optional().nullable(),
  weightKg: z.number().positive().optional().nullable(),
  assignedProtocolIds: z.array(z.string().max(100)).max(50).optional(),
})

const samples = [...mockSamples]

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const standard = searchParams.get('standard')
  const priority = searchParams.get('priority')
  const search = searchParams.get('search')

  let filtered = [...samples]

  if (status && status !== 'all') {
    filtered = filtered.filter(s => s.status === status)
  }
  if (standard) {
    filtered = filtered.filter(s => s.testStandard === standard)
  }
  if (priority) {
    filtered = filtered.filter(s => s.priority === priority)
  }
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(s =>
      s.sampleId.toLowerCase().includes(q) ||
      s.clientName.toLowerCase().includes(q) ||
      s.manufacturer.toLowerCase().includes(q) ||
      s.modelNumber.toLowerCase().includes(q) ||
      s.serialNumber.toLowerCase().includes(q)
    )
  }

  const stats = {
    total: samples.length,
    received: samples.filter(s => s.status === 'received').length,
    inTest: samples.filter(s => s.status === 'in_test').length,
    completed: samples.filter(s => s.status === 'completed').length,
    pendingReview: samples.filter(s => s.status === 'pending_review').length,
  }

  return NextResponse.json({ samples: filtered, stats })
}

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const raw = await request.json()
  const parsed = SamplePostSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', issues: parsed.error.issues }, { status: 400 })
  }
  const body = parsed.data

  const newSample: Sample = {
    id: String(samples.length + 1),
    sampleId: generateId('SAMPLE'),
    projectId: body.projectId || generateId('PROJECT'),
    clientName: body.clientName,
    clientEmail: body.clientEmail || '',
    clientOrganization: body.clientOrganization || '',
    sampleType: body.sampleType,
    manufacturer: body.manufacturer,
    modelNumber: body.modelNumber,
    serialNumber: body.serialNumber,
    batchNumber: body.batchNumber || '',
    lengthMm: body.lengthMm ?? null,
    widthMm: body.widthMm ?? null,
    thicknessMm: body.thicknessMm ?? null,
    weightKg: body.weightKg ?? null,
    status: 'received',
    currentLocation: 'Receiving Area',
    storageLocation: '',
    testStandard: body.testStandard,
    priority: body.priority || 'normal',
    assignedProtocolIds: body.assignedProtocolIds || [],
    testsCompleted: 0,
    testsTotal: body.assignedProtocolIds?.length || 0,
    overallResult: null,
    notes: body.notes || '',
    custodyHistory: [
      {
        timestamp: new Date().toISOString(),
        fromLocation: 'External',
        toLocation: 'Receiving Area',
        handledBy: 'System',
        action: 'received',
        notes: 'Sample registered via LIMS',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
  }

  samples.push(newSample)
  return NextResponse.json(newSample, { status: 201 })
}
