import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/api-auth'
import { mockDocuments } from '@/lib/mock-data'
import type { QMSDocument } from '@/lib/types'

const DocPostSchema = z.object({
  documentNumber: z.string().min(1).max(50),
  title: z.string().min(1).max(300),
  category: z.enum(['procedure', 'work_instruction', 'form', 'policy', 'manual', 'record']).optional(),
  author: z.string().max(200).optional(),
  department: z.string().max(100).optional(),
  standardReference: z.string().max(200).optional(),
  content: z.string().max(50000).optional(),
})

const documents = [...mockDocuments]

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  let filtered = [...documents]

  if (status && status !== 'all') {
    filtered = filtered.filter(d => d.status === status)
  }
  if (category) {
    filtered = filtered.filter(d => d.category === category)
  }
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(d =>
      d.documentNumber.toLowerCase().includes(q) ||
      d.title.toLowerCase().includes(q) ||
      d.author.toLowerCase().includes(q)
    )
  }

  const stats = {
    total: documents.length,
    approved: documents.filter(d => d.status === 'approved').length,
    inReview: documents.filter(d => d.status === 'in_review').length,
    draft: documents.filter(d => d.status === 'draft').length,
    procedures: documents.filter(d => d.category === 'procedure').length,
    workInstructions: documents.filter(d => d.category === 'work_instruction').length,
    forms: documents.filter(d => d.category === 'form').length,
  }

  return NextResponse.json({ documents: filtered, stats })
}

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const raw = await request.json()
  const parsed = DocPostSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', issues: parsed.error.issues }, { status: 400 })
  }
  const body = parsed.data

  const newDoc: QMSDocument = {
    id: String(documents.length + 1),
    documentNumber: body.documentNumber,
    title: body.title,
    category: body.category || 'procedure',
    status: 'draft',
    version: '1.0',
    revision: 1,
    author: body.author || 'System',
    reviewer: null,
    approver: null,
    effectiveDate: null,
    expiryDate: null,
    department: body.department || '',
    standardReference: body.standardReference || '',
    content: body.content || '',
    changeLog: [
      { version: '1.0', date: new Date().toISOString().split('T')[0], author: body.author || 'System', description: 'Initial draft' },
    ],
    approvalHistory: [
      { step: 'Author', approver: body.author || '', status: 'pending', date: null, comments: '' },
      { step: 'Technical Review', approver: '', status: 'pending', date: null, comments: '' },
      { step: 'Quality Manager', approver: '', status: 'pending', date: null, comments: '' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  documents.push(newDoc)
  return NextResponse.json(newDoc, { status: 201 })
}
