'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getStatusColor } from '@/lib/utils'
import type { QMSDocument, CAPA } from '@/lib/types'
import { mockComplianceRequirements } from '@/lib/mock-data'
import {
  type DocLevel, type ClauseNode,
  LEVEL_LABELS, ISO17025_TREE, flattenDocs, ALL_DOCS, docStatusColors,
} from '@/lib/qms-tree'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  ChevronRight, ChevronDown, FileText, BookOpen, Layers,
  CheckCircle2, AlertTriangle, Clock, Plus, Download, Eye,
  BarChart3, Shield, Activity,
  GitBranch, Briefcase, TrendingUp, MessageSquare, Turtle, UserCheck, Building2, Workflow,
  Microscope,
} from 'lucide-react'
import { CAPATrackingDashboard, DocumentRevisionHistory, ManagementReviewDashboard } from '@/components/qms/QMSEnhancements'
import ExternalDocumentsTab from '@/components/qms/ExternalDocumentsTab'
import InternalDocumentsTab from '@/components/qms/InternalDocumentsTab'
import QCQATab from '@/components/qms/QCQATab'
import KaizenTab from '@/components/qms/KaizenTab'
import RiskRegisterTab from '@/components/qms/RiskRegisterTab'
import SuggestionTrackerTab from '@/components/qms/SuggestionTrackerTab'
import DocumentPyramid from '@/components/qms/DocumentPyramid'
import TurtleDiagramsTab from '@/components/qms/TurtleDiagramsTab'
import RolesResponsibilitiesTab from '@/components/qms/RolesResponsibilitiesTab'
import OrganizationTab from '@/components/qms/OrganizationTab'
import BusinessWorkflowTab from '@/components/qms/BusinessWorkflowTab'

// ─── Tree Node Component ──────────────────────────────────────────────────────

function ClauseTreeNode({ node, depth = 0, selectedDoc, onSelectDoc }: {
  node: ClauseNode
  depth?: number
  selectedDoc: DocLevel | null
  onSelectDoc: (doc: DocLevel) => void
}) {
  const [open, setOpen] = useState(depth < 1)
  const allDocs = node.documents
  const hasChildren = node.children && node.children.length > 0

  return (
    <div className={`${depth > 0 ? 'ml-4 border-l border-border' : ''}`}>
      <button
        className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/50 rounded transition-colors ${depth === 0 ? 'font-semibold text-sm' : 'text-xs'}`}
        onClick={() => setOpen(!open)}
      >
        {(hasChildren || allDocs.length > 0) ? (
          open ? <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
        ) : <span className="w-3" />}
        <span className="font-mono text-muted-foreground w-10 shrink-0">{node.clause}</span>
        <span className="flex-1">{node.title}</span>
        {allDocs.length > 0 && (
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{allDocs.length}</span>
        )}
      </button>

      {open && (
        <div className={depth === 0 ? 'ml-2' : ''}>
          {/* Documents at this node */}
          {allDocs.map(doc => {
            const lvl = LEVEL_LABELS[doc.level]
            return (
              <button
                key={doc.code}
                className={`w-full flex items-center gap-2 px-3 py-1.5 ml-4 text-left hover:bg-muted/50 rounded text-xs transition-colors ${selectedDoc?.code === doc.code ? 'bg-primary/10 ring-1 ring-primary/30' : ''}`}
                onClick={() => onSelectDoc(doc)}
              >
                <FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
                <span className={`shrink-0 text-xs font-bold px-1 rounded ${lvl.light} ${lvl.text}`}>{lvl.short}</span>
                <span className="font-mono text-muted-foreground">{doc.code}</span>
                <span className="flex-1 truncate">{doc.title}</span>
                <span className={`text-xs px-1 rounded ${docStatusColors[doc.status]}`}>{doc.status.replace(/_/g, ' ')}</span>
              </button>
            )
          })}
          {/* Children */}
          {hasChildren && node.children!.map(child => (
            <ClauseTreeNode key={child.clause} node={child} depth={depth + 1} selectedDoc={selectedDoc} onSelectDoc={onSelectDoc} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QMSDashboard() {
  const [docStats, setDocStats] = useState({ total: 0, approved: 0, inReview: 0, draft: 0, procedures: 0, workInstructions: 0, forms: 0 })
  const [capaStats, setCapaStats] = useState({ total: 0, open: 0, corrective: 0, preventive: 0, overdue: 0 })
  const [recentDocs, setRecentDocs] = useState<QMSDocument[]>([])
  const [openCAPAs, setOpenCAPAs] = useState<CAPA[]>([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedDoc, setSelectedDoc] = useState<DocLevel | null>(null)
  const [docSearch, setDocSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all')

  const complianceScore = Math.round(
    (mockComplianceRequirements.filter(r => r.status === 'compliant').length / mockComplianceRequirements.length) * 100
  )

  useEffect(() => {
    fetch('/api/qms/documents').then(r => r.json()).then(d => { setDocStats(d.stats); setRecentDocs(d.documents.slice(0, 5)) })
    fetch('/api/qms/capa').then(r => r.json()).then(d => { setCapaStats(d.stats); setOpenCAPAs(d.capas.filter((c: CAPA) => !['closed', 'verified'].includes(c.status))) })
  }, [])

  const filteredDocs = ALL_DOCS.filter(d => {
    if (levelFilter !== 'all' && d.level !== levelFilter) return false
    if (docSearch && !d.title.toLowerCase().includes(docSearch.toLowerCase()) &&
        !d.code.toLowerCase().includes(docSearch.toLowerCase())) return false
    return true
  })

  const docCountsByLevel = {
    1: ALL_DOCS.filter(d => d.level === 1).length,
    2: ALL_DOCS.filter(d => d.level === 2).length,
    3: ALL_DOCS.filter(d => d.level === 3).length,
    4: ALL_DOCS.filter(d => d.level === 4).length,
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">QMS Dashboard</h1>
          <p className="text-sm text-muted-foreground">Quality Management System – ISO 17025:2017 / NABL Compliance</p>
        </div>
        <div className="flex gap-2">
          <Link href="/qms/documents">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              All Documents
            </Button>
          </Link>
          <Link href="/qms/capa">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New CAPA
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">ISO 17025 Compliance</div>
            <div className={`text-3xl font-bold ${complianceScore >= 90 ? 'text-green-600' : complianceScore >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
              {complianceScore}%
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
              <div className={`h-1.5 rounded-full ${complianceScore >= 90 ? 'bg-green-500' : complianceScore >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${complianceScore}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">QMS Documents</div>
            <div className="text-2xl font-bold">{ALL_DOCS.length}</div>
            <div className="text-xs text-green-600">{ALL_DOCS.filter(d => d.status === 'approved').length} approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Open CAPAs</div>
            <div className="text-2xl font-bold text-amber-600">{capaStats.open}</div>
            {capaStats.overdue > 0 && <div className="text-xs text-red-600">{capaStats.overdue} overdue</div>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Under Review</div>
            <div className="text-2xl font-bold text-blue-600">{ALL_DOCS.filter(d => d.status === 'under_review').length}</div>
            <div className="text-xs text-muted-foreground">documents pending</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto flex-wrap bg-muted">
          <TabsTrigger value="dashboard" className="text-xs">
            <BarChart3 className="h-3 w-3 mr-1" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="hierarchy" className="text-xs">
            <Layers className="h-3 w-3 mr-1" /> Document Hierarchy
          </TabsTrigger>
          <TabsTrigger value="clauses" className="text-xs">
            <Shield className="h-3 w-3 mr-1" /> ISO 17025 Clauses
          </TabsTrigger>
          <TabsTrigger value="capa" className="text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" /> CAPA
          </TabsTrigger>
          <TabsTrigger value="capa-tracking" className="text-xs">
            <Activity className="h-3 w-3 mr-1" /> CAPA Tracking
          </TabsTrigger>
          <TabsTrigger value="doc-revisions" className="text-xs">
            <GitBranch className="h-3 w-3 mr-1" /> Revision History
          </TabsTrigger>
          <TabsTrigger value="mgmt-review" className="text-xs">
            <Briefcase className="h-3 w-3 mr-1" /> Management Review
          </TabsTrigger>
          <TabsTrigger value="external-docs" className="text-xs">
            <BookOpen className="h-3 w-3 mr-1" /> External Documents
          </TabsTrigger>
          <TabsTrigger value="internal-docs" className="text-xs">
            <FileText className="h-3 w-3 mr-1" /> Internal Documents
          </TabsTrigger>
          <TabsTrigger value="qcqa" className="text-xs">
            <Microscope className="h-3 w-3 mr-1" /> QC / QA
          </TabsTrigger>
          <TabsTrigger value="kaizen" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" /> Kaizen
          </TabsTrigger>
          <TabsTrigger value="risk-register" className="text-xs">
            <Shield className="h-3 w-3 mr-1" /> Risk Register
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="text-xs">
            <MessageSquare className="h-3 w-3 mr-1" /> Suggestions
          </TabsTrigger>
          <TabsTrigger value="turtle-diagrams" className="text-xs">
            <Turtle className="h-3 w-3 mr-1" /> Turtle Diagrams
          </TabsTrigger>
          <TabsTrigger value="roles" className="text-xs">
            <UserCheck className="h-3 w-3 mr-1" /> Roles & Responsibilities
          </TabsTrigger>
          <TabsTrigger value="organization" className="text-xs">
            <Building2 className="h-3 w-3 mr-1" /> Organization
          </TabsTrigger>
          <TabsTrigger value="business-workflow" className="text-xs">
            <Workflow className="h-3 w-3 mr-1" /> Business Workflow
          </TabsTrigger>
        </TabsList>

        {/* ── DASHBOARD TAB ──────────────────────────────────────── */}
        <TabsContent value="dashboard" className="space-y-4 mt-4">
          {/* Document Level Distribution */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {([1, 2, 3, 4] as const).map(level => {
              const lvl = LEVEL_LABELS[level]
              return (
                <Card key={level} className={`border-l-4 border-l-${level === 1 ? 'blue' : level === 2 ? 'purple' : level === 3 ? 'green' : 'amber'}-500`}>
                  <CardContent className="pt-4 pb-3">
                    <div className={`text-xs font-bold mb-1 ${lvl.text}`}>{lvl.short}</div>
                    <div className="text-2xl font-bold">{docCountsByLevel[level]}</div>
                    <div className="text-xs text-muted-foreground leading-tight">{lvl.label.split(' – ')[1]}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  Recent Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentDocs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                      <div>
                        <div className="text-sm font-medium">{doc.documentNumber}</div>
                        <div className="text-xs text-muted-foreground">{doc.title}</div>
                        <div className="text-xs text-muted-foreground">v{doc.version} · {doc.author}</div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(doc.status)}`}>
                        {doc.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
                <Link href="/qms/documents" className="text-xs text-primary hover:underline block mt-3">View all documents →</Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Open CAPAs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {openCAPAs.map(capa => (
                    <Link key={capa.id} href={`/qms/capa/${capa.id}`}>
                      <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer">
                        <div>
                          <div className="text-sm font-medium">{capa.capaNumber}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{capa.title}</div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(capa.type === 'corrective' ? 'destructive' : 'pending')}`}>
                          {capa.type}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/qms/capa" className="text-xs text-primary hover:underline block mt-3">View all CAPAs →</Link>
              </CardContent>
            </Card>
          </div>

          {/* Quick Nav */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { href: '/qms/documents', title: 'Document Control', desc: 'SOPs, Procedures, Forms', icon: FileText },
                  { href: '/qms/capa', title: 'CAPA Management', desc: 'Corrective & Preventive Actions', icon: AlertTriangle },
                  { href: '/qms/compliance', title: 'Compliance Matrix', desc: 'ISO 17025 / NABL Gap Analysis', icon: CheckCircle2 },
                ].map(({ href, title, desc, icon: Icon }) => (
                  <Link key={href} href={href} className="p-3 border rounded hover:bg-muted/50 flex gap-3 items-start transition-colors">
                    <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-medium">{title}</div>
                      <div className="text-xs text-muted-foreground">{desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── DOCUMENT HIERARCHY TAB ───────────────────────────────── */}
        <TabsContent value="hierarchy" className="space-y-4 mt-4">
          <DocumentPyramid />
        </TabsContent>

        {/* ── ISO 17025 CLAUSES TAB ────────────────────────────────── */}
        <TabsContent value="clauses" className="space-y-4 mt-4">
          <div className="text-sm text-muted-foreground mb-3">
            ISO 17025:2017 clause tree — click any clause to expand and view linked documents
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Tree */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-2">
                  {ISO17025_TREE.map(node => (
                    <ClauseTreeNode key={node.clause} node={node} depth={0} selectedDoc={selectedDoc} onSelectDoc={setSelectedDoc} />
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Document Detail Panel */}
            <div className="lg:col-span-1">
              {selectedDoc ? (
                <Card className="sticky top-4">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${LEVEL_LABELS[selectedDoc.level].light} ${LEVEL_LABELS[selectedDoc.level].text}`}>
                        {LEVEL_LABELS[selectedDoc.level].short}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">{selectedDoc.code}</span>
                    </div>
                    <CardTitle className="text-sm leading-tight">{selectedDoc.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground">Revision</div>
                        <div className="font-mono font-bold">{selectedDoc.revision}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Status</div>
                        <Badge className={`text-xs ${docStatusColors[selectedDoc.status]}`}>{selectedDoc.status.replace(/_/g, ' ')}</Badge>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Owner</div>
                        <div className="font-medium">{selectedDoc.owner}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Next Review</div>
                        <div className="font-medium">{selectedDoc.nextReview}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">Clause: <span className="font-mono font-bold text-foreground">{selectedDoc.clause}</span></div>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" className="flex-1 h-8 text-xs">
                        <Eye className="h-3 w-3 mr-1" /> View / Edit
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs">
                        <Download className="h-3 w-3 mr-1" /> PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="flex items-center justify-center p-8 text-center min-h-48">
                  <div>
                    <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Select a document from the tree to view details</p>
                  </div>
                </Card>
              )}

              {/* Clause Coverage Summary */}
              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Clause Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  {ISO17025_TREE.map(section => {
                    const sectionDocs = flattenDocs([section])
                    const approved = sectionDocs.filter(d => d.status === 'approved').length
                    const pct = sectionDocs.length > 0 ? Math.round((approved / sectionDocs.length) * 100) : 0
                    return (
                      <div key={section.clause} className="mb-2">
                        <div className="flex items-center justify-between text-xs mb-0.5">
                          <span className="font-mono text-muted-foreground w-6">{section.clause}</span>
                          <span className="flex-1 truncate">{section.title}</span>
                          <span className={`font-bold ${pct === 100 ? 'text-green-600' : pct >= 80 ? 'text-amber-600' : 'text-red-600'}`}>{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full">
                          <div className={`h-1.5 rounded-full ${pct === 100 ? 'bg-green-500' : pct >= 80 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── CAPA TAB ─────────────────────────────────────────────── */}
        <TabsContent value="capa" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total CAPAs', value: capaStats.total, color: 'text-gray-700' },
              { label: 'Open', value: capaStats.open, color: 'text-amber-600' },
              { label: 'Corrective', value: capaStats.corrective, color: 'text-red-600' },
              { label: 'Overdue', value: capaStats.overdue, color: 'text-red-700' },
            ].map(({ label, value, color }) => (
              <Card key={label}>
                <CardContent className="pt-4 pb-3 text-center">
                  <div className={`text-2xl font-bold ${color}`}>{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-2">
            {openCAPAs.map(capa => (
              <Link key={capa.id} href={`/qms/capa/${capa.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold">{capa.capaNumber}</div>
                        <div className="text-xs text-muted-foreground">{capa.title}</div>
                        <div className="text-xs text-muted-foreground">Assigned: {capa.assignedTo}</div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(capa.type === 'corrective' ? 'destructive' : 'pending')}`}>{capa.type}</span>
                        <span className={`text-xs ${getStatusColor(capa.priority)}`}>{capa.priority}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <Link href="/qms/capa">
            <Button variant="outline" className="w-full text-xs">View All CAPAs</Button>
          </Link>
        </TabsContent>

        {/* ── CAPA TRACKING DASHBOARD TAB ─────────────────────────── */}
        <TabsContent value="capa-tracking" className="space-y-4 mt-4">
          <CAPATrackingDashboard />
        </TabsContent>

        {/* ── DOCUMENT REVISION HISTORY TAB ───────────────────────── */}
        <TabsContent value="doc-revisions" className="space-y-4 mt-4">
          <DocumentRevisionHistory />
        </TabsContent>

        {/* ── MANAGEMENT REVIEW DASHBOARD TAB ─────────────────────── */}
        <TabsContent value="mgmt-review" className="space-y-4 mt-4">
          <ManagementReviewDashboard />
        </TabsContent>

        {/* ── EXTERNAL DOCUMENTS TAB (ISO 17025 Clause 8.3) ────────── */}
        <TabsContent value="external-docs" className="space-y-4 mt-4">
          <ExternalDocumentsTab />
        </TabsContent>

        {/* ── INTERNAL DOCUMENTS TAB (ISO 17025 Clause 8.2) ────────── */}
        <TabsContent value="internal-docs" className="space-y-4 mt-4">
          <InternalDocumentsTab />
        </TabsContent>

        {/* ── QC / QA TAB ──────────────────────────────────────────── */}
        <TabsContent value="qcqa" className="space-y-4 mt-4">
          <QCQATab />
        </TabsContent>

        {/* ── KAIZEN TAB (ISO 17025 Clause 8.6) ────────────────────── */}
        <TabsContent value="kaizen" className="space-y-4 mt-4">
          <KaizenTab />
        </TabsContent>

        {/* ── RISK REGISTER TAB (ISO 17025 Clause 8.5) ─────────────── */}
        <TabsContent value="risk-register" className="space-y-4 mt-4">
          <RiskRegisterTab />
        </TabsContent>

        {/* ── SUGGESTION TRACKER TAB ───────────────────────────────── */}
        <TabsContent value="suggestions" className="space-y-4 mt-4">
          <SuggestionTrackerTab />
        </TabsContent>

        {/* ── TURTLE DIAGRAMS TAB ─────────────────────────────────── */}
        <TabsContent value="turtle-diagrams" className="space-y-4 mt-4">
          <TurtleDiagramsTab />
        </TabsContent>

        {/* ── ROLES & RESPONSIBILITIES TAB ────────────────────────── */}
        <TabsContent value="roles" className="space-y-4 mt-4">
          <RolesResponsibilitiesTab />
        </TabsContent>

        {/* ── ORGANIZATION TAB ────────────────────────────────────── */}
        <TabsContent value="organization" className="space-y-4 mt-4">
          <OrganizationTab />
        </TabsContent>

        {/* ── BUSINESS WORKFLOW TAB ───────────────────────────────── */}
        <TabsContent value="business-workflow" className="space-y-4 mt-4">
          <BusinessWorkflowTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
