import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/api-auth'
import { mockTestExecutions } from '@/lib/mock-data'
import { generateId } from '@/lib/utils'
import { getTemplateById } from '@/lib/test-templates'
import type { TestExecution } from '@/lib/types'

const TestPostSchema = z.object({
  sampleId: z.string().min(1).max(100),
  protocolId: z.string().min(1).max(100),
  protocolName: z.string().max(200).optional(),
  standardReference: z.string().max(100).optional(),
  technicianId: z.string().max(100).optional(),
  technicianName: z.string().max(200).optional(),
  inputData: z.record(z.unknown()).optional(),
})

const testExecutions = [...mockTestExecutions]

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const sampleId = searchParams.get('sampleId')
  const protocolId = searchParams.get('protocolId')
  const standard = searchParams.get('standard')

  let filtered = [...testExecutions]

  if (status && status !== 'all') {
    filtered = filtered.filter(t => t.status === status)
  }
  if (sampleId) {
    filtered = filtered.filter(t => t.sampleId === sampleId)
  }
  if (protocolId) {
    filtered = filtered.filter(t => t.protocolId === protocolId)
  }
  if (standard) {
    filtered = filtered.filter(t => t.standardReference.includes(standard))
  }

  const stats = {
    total: testExecutions.length,
    inProgress: testExecutions.filter(t => t.status === 'in_progress').length,
    pendingReview: testExecutions.filter(t => t.status === 'pending_review').length,
    completed: testExecutions.filter(t => t.status === 'completed').length,
    failed: testExecutions.filter(t => t.status === 'failed').length,
  }

  return NextResponse.json({ tests: filtered, stats })
}

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const raw = await request.json()
  const parsed = TestPostSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', issues: parsed.error.issues }, { status: 400 })
  }
  const body = parsed.data

  const template = getTemplateById(body.protocolId)

  const newTest: TestExecution = {
    id: String(testExecutions.length + 1),
    executionNumber: generateId('TE'),
    sampleId: body.sampleId,
    protocolId: body.protocolId,
    protocolName: template?.name || body.protocolName || '',
    standardReference: template?.standard || body.standardReference || '',
    status: 'not_started',
    technicianId: body.technicianId || '',
    technicianName: body.technicianName || '',
    reviewerId: null,
    inputData: body.inputData || {},
    rawData: {},
    processedData: {},
    results: {},
    testPassed: null,
    failureMode: null,
    remarks: '',
    startedAt: null,
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  testExecutions.push(newTest)
  return NextResponse.json(newTest, { status: 201 })
}
