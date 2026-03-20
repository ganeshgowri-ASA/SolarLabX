// @ts-nocheck
"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  FileText,
  Search,
  Plus,
  Hash,
  GitBranch,
  Database,
  Shield,
  Download,
  Filter,
  Eye,
  Link2,
  Users,
  BookOpen,
  Building2,
  Truck,
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"
import { toast } from "sonner"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

import {
  mockDocumentRegistry,
  mockTraceabilityChains,
  mockEquipmentMaster,
  mockPersonnelMaster,
  mockStandardsMaster,
  mockCustomerMaster,
  mockSupplierMaster,
  mockAuditTrail,
  getDocumentTypeDistribution,
  getMonthlyDocumentTrend,
} from "@/lib/traceability-data"
import {
  generateNextDocumentNumber,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_COLORS,
} from "@/lib/document-numbering"
import type { DocumentType, DocumentRegistryEntry } from "@/lib/document-numbering"
import type { AuditTrailLogEntry } from "@/lib/traceability-data"
import { AuditTrailTimeline, LinkedDocumentReferences, ExportToPDF } from "@/components/traceability/TraceabilityEnhancements"
import { RouteCardOMRTab } from "@/components/traceability/RouteCardOMRV2"

const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316", "#ef4444", "#ec4899", "#14b8a6", "#eab308"]

// ============================================================================
// Document Numbering Tab
// ============================================================================

function DocumentNumberingTab() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [showGenerator, setShowGenerator] = useState(false)
  const [genType, setGenType] = useState<DocumentType>("test_report")
  const [genStandard, setGenStandard] = useState("IEC 61215")
  const [genTestCode, setGenTestCode] = useState("")
  const [genEquipCode, setGenEquipCode] = useState("")
  const [genDept, setGenDept] = useState("")

  const filteredDocs = useMemo(() => {
    return mockDocumentRegistry.filter((d) => {
      const matchesSearch =
        !search ||
        d.documentNumber.toLowerCase().includes(search.toLowerCase()) ||
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.createdBy.toLowerCase().includes(search.toLowerCase())
      const matchesType = typeFilter === "all" || d.documentType === typeFilter
      return matchesSearch && matchesType
    })
  }, [search, typeFilter])

  const docTypeDistribution = getDocumentTypeDistribution()
  const monthlyTrend = getMonthlyDocumentTrend()

  const handleGenerateNumber = () => {
    const num = generateNextDocumentNumber(genType, {
      standard: genStandard,
      testCode: genTestCode,
      equipmentCode: genEquipCode,
      department: genDept,
    })
    toast.success(`Generated: ${num}`)
    setShowGenerator(false)
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg"><Hash className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-2xl font-bold">{mockDocumentRegistry.length}</p>
                <p className="text-xs text-muted-foreground">Total Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-2xl font-bold">{mockDocumentRegistry.filter(d => d.status === 'active').length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg"><Clock className="h-5 w-5 text-orange-600" /></div>
              <div>
                <p className="text-2xl font-bold">{new Set(mockDocumentRegistry.map(d => d.documentType)).size}</p>
                <p className="text-xs text-muted-foreground">Document Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg"><Link2 className="h-5 w-5 text-purple-600" /></div>
              <div>
                <p className="text-2xl font-bold">{mockDocumentRegistry.reduce((s, d) => s + d.linkedDocuments.length, 0)}</p>
                <p className="text-xs text-muted-foreground">Cross-References</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Documents by Type</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={docTypeDistribution} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={90} label={({ type, count }) => `${type}: ${count}`}>
                  {docTypeDistribution.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Monthly Document Creation Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by document number, title, or author..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Filter by type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {(Object.entries(DOCUMENT_TYPE_LABELS) as [DocumentType, string][]).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={showGenerator} onOpenChange={setShowGenerator}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Generate Number</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Document Number</DialogTitle>
              <DialogDescription>Auto-generate a unique sequential document ID</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Document Type</Label>
                <Select value={genType} onValueChange={(v) => setGenType(v as DocumentType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(DOCUMENT_TYPE_LABELS) as [DocumentType, string][]).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {['test_report', 'test_protocol', 'analysis_report', 'raw_data'].includes(genType) && (
                <div>
                  <Label>Standard</Label>
                  <Select value={genStandard} onValueChange={setGenStandard}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['IEC 61215', 'IEC 61730', 'IEC 61853', 'IEC 60904', 'IEC 62716', 'IEC 61701', 'IEC 62804'].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {['test_protocol', 'raw_data'].includes(genType) && (
                <div><Label>Test Code</Label><Input value={genTestCode} onChange={e => setGenTestCode(e.target.value)} placeholder="e.g. TC, IV, DH" /></div>
              )}
              {genType === 'calibration_cert' && (
                <div><Label>Equipment Code</Label><Input value={genEquipCode} onChange={e => setGenEquipCode(e.target.value)} placeholder="e.g. SS001, TC001" /></div>
              )}
              {genType === 'sop' && (
                <div><Label>Department</Label><Input value={genDept} onChange={e => setGenDept(e.target.value)} placeholder="e.g. PERF, QA, SMPL" /></div>
              )}
              <Button onClick={handleGenerateNumber} className="w-full">Generate</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Document Registry Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Central Document Registry</CardTitle>
          <CardDescription>Sequential numbering with no gaps - {filteredDocs.length} documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Rev</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Links</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.map((doc) => {
                  const colors = DOCUMENT_TYPE_COLORS[doc.documentType]
                  return (
                    <TableRow key={doc.id}>
                      <TableCell className="font-mono text-sm font-semibold">{doc.documentNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${colors.bg} ${colors.text} ${colors.border}`}>
                          {DOCUMENT_TYPE_LABELS[doc.documentType]}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">{doc.title}</TableCell>
                      <TableCell>v{doc.revision}.0</TableCell>
                      <TableCell className="text-sm">{doc.createdBy}</TableCell>
                      <TableCell className="text-sm">{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={doc.status === 'active' ? 'default' : 'secondary'}>{doc.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {doc.linkedDocuments.length > 0 ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm"><Link2 className="h-3 w-3 mr-1" />{doc.linkedDocuments.length}</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Linked Documents</DialogTitle><DialogDescription>Cross-references for {doc.documentNumber}</DialogDescription></DialogHeader>
                              <div className="space-y-2 pt-2">
                                {doc.linkedDocuments.map((ld) => (
                                  <div key={ld} className="flex items-center gap-2 p-2 rounded bg-muted">
                                    <FileText className="h-4 w-4" />
                                    <span className="font-mono text-sm">{ld}</span>
                                  </div>
                                ))}
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// Traceability Matrix Tab
// ============================================================================

function TraceabilityMatrixTab() {
  const [selectedChain, setSelectedChain] = useState(mockTraceabilityChains[0])
  const [projectFilter, setProjectFilter] = useState("all")
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const nodeTypeColors: Record<string, string> = {
    sample: 'bg-blue-100 border-blue-400 text-blue-800',
    protocol: 'bg-indigo-100 border-indigo-400 text-indigo-800',
    equipment: 'bg-green-100 border-green-400 text-green-800',
    raw_data: 'bg-gray-100 border-gray-400 text-gray-800',
    analysis: 'bg-purple-100 border-purple-400 text-purple-800',
    report: 'bg-orange-100 border-orange-400 text-orange-800',
    calibration: 'bg-teal-100 border-teal-400 text-teal-800',
  }

  const nodeTypeIcons: Record<string, React.ReactNode> = {
    sample: <Database className="h-4 w-4" />,
    protocol: <FileText className="h-4 w-4" />,
    equipment: <Wrench className="h-4 w-4" />,
    raw_data: <Database className="h-4 w-4" />,
    analysis: <Search className="h-4 w-4" />,
    report: <FileText className="h-4 w-4" />,
    calibration: <Shield className="h-4 w-4" />,
  }

  const activeNode = selectedNode ? selectedChain.nodes.find(n => n.id === selectedNode) : null

  return (
    <div className="space-y-6">
      {/* Chain Selector */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={selectedChain.id} onValueChange={(v) => { setSelectedChain(mockTraceabilityChains.find(c => c.id === v)!); setSelectedNode(null) }}>
          <SelectTrigger className="flex-1"><SelectValue placeholder="Select traceability chain" /></SelectTrigger>
          <SelectContent>
            {mockTraceabilityChains.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.projectName} ({c.sampleId})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Chain Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            {selectedChain.projectName}
          </CardTitle>
          <CardDescription>
            Client: {selectedChain.clientName} | Sample: {selectedChain.sampleId} | Standard: {selectedChain.standard}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Interactive Flowchart */}
          <div className="mb-4">
            <p className="text-sm font-medium mb-3">Data Flow Chain (click any node for details)</p>
            <div className="flex flex-wrap gap-2 items-center">
              {selectedChain.nodes.map((node, idx) => (
                <React.Fragment key={node.id}>
                  <button
                    onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm transition-all cursor-pointer ${nodeTypeColors[node.type]} ${selectedNode === node.id ? 'ring-2 ring-primary ring-offset-2 scale-105' : 'hover:scale-105'}`}
                  >
                    {nodeTypeIcons[node.type]}
                    <div className="text-left">
                      <p className="font-medium text-xs">{node.label}</p>
                      {node.documentNumber && <p className="font-mono text-[10px] opacity-75">{node.documentNumber}</p>}
                    </div>
                  </button>
                  {idx < selectedChain.nodes.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Node Details */}
          {activeNode && (
            <Card className="border-primary">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {nodeTypeIcons[activeNode.type]}
                  {activeNode.label}
                  <Badge variant="outline" className="ml-auto">{activeNode.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {activeNode.documentNumber && (
                    <div><span className="text-muted-foreground">Document:</span> <span className="font-mono font-medium">{activeNode.documentNumber}</span></div>
                  )}
                  <div><span className="text-muted-foreground">Date:</span> {activeNode.date}</div>
                  {Object.entries(activeNode.details).map(([k, v]) => (
                    <div key={k}><span className="text-muted-foreground">{k}:</span> {v}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Traceability Table */}
          <div className="mt-6">
            <p className="text-sm font-medium mb-3">Full Traceability Chain</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Step</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Document #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedChain.nodes.map((node, idx) => (
                  <TableRow key={node.id} className={selectedNode === node.id ? 'bg-primary/5' : ''}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={nodeTypeColors[node.type]}>
                        {node.type.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{node.label}</TableCell>
                    <TableCell className="font-mono text-sm">{node.documentNumber || '-'}</TableCell>
                    <TableCell><Badge variant="secondary">{node.status}</Badge></TableCell>
                    <TableCell>{node.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Equipment used in this chain */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Equipment Used</CardTitle>
          <CardDescription>Equipment with calibration traceability for this test chain</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Make/Model</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Last Cal.</TableHead>
                <TableHead>Next Cal. Due</TableHead>
                <TableHead>Cal. Cert #</TableHead>
                <TableHead>Uncertainty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedChain.nodes
                .filter(n => n.type === 'equipment')
                .map(n => {
                  const eq = mockEquipmentMaster.find(e => e.equipmentId === n.documentNumber)
                  if (!eq) return null
                  const isOverdue = new Date(eq.nextCalDue) < new Date()
                  return (
                    <TableRow key={eq.id}>
                      <TableCell className="font-mono font-semibold">{eq.equipmentId}</TableCell>
                      <TableCell>{eq.name}</TableCell>
                      <TableCell className="text-sm">{eq.make} / {eq.model}</TableCell>
                      <TableCell className="text-sm">{eq.location}</TableCell>
                      <TableCell className="text-sm">{eq.lastCalDate}</TableCell>
                      <TableCell>
                        <span className={isOverdue ? 'text-red-600 font-bold' : ''}>{eq.nextCalDue}</span>
                        {isOverdue && <AlertTriangle className="inline ml-1 h-3 w-3 text-red-600" />}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{eq.calCertificateNo}</TableCell>
                      <TableCell className="text-sm">{eq.measurementUncertainty}</TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// Master Files Tab
// ============================================================================

function MasterFilesTab() {
  const [activeSubTab, setActiveSubTab] = useState("equipment")
  const [eqSearch, setEqSearch] = useState("")
  const [personnelSearch, setPersonnelSearch] = useState("")

  const filteredEquipment = mockEquipmentMaster.filter(e =>
    !eqSearch || e.name.toLowerCase().includes(eqSearch.toLowerCase()) || e.equipmentId.toLowerCase().includes(eqSearch.toLowerCase())
  )

  const filteredPersonnel = mockPersonnelMaster.filter(p =>
    !personnelSearch || p.name.toLowerCase().includes(personnelSearch.toLowerCase()) || p.department.toLowerCase().includes(personnelSearch.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'equipment', label: 'Equipment Master', icon: <Wrench className="h-4 w-4" />, count: mockEquipmentMaster.length },
          { id: 'personnel', label: 'Personnel Master', icon: <Users className="h-4 w-4" />, count: mockPersonnelMaster.length },
          { id: 'standards', label: 'Standards Master', icon: <BookOpen className="h-4 w-4" />, count: mockStandardsMaster.length },
          { id: 'customers', label: 'Customer Master', icon: <Building2 className="h-4 w-4" />, count: mockCustomerMaster.length },
          { id: 'suppliers', label: 'Supplier Master', icon: <Truck className="h-4 w-4" />, count: mockSupplierMaster.length },
        ].map(tab => (
          <Button key={tab.id} variant={activeSubTab === tab.id ? 'default' : 'outline'} size="sm" onClick={() => setActiveSubTab(tab.id)}>
            {tab.icon}<span className="ml-1">{tab.label}</span><Badge variant="secondary" className="ml-1">{tab.count}</Badge>
          </Button>
        ))}
      </div>

      {/* Equipment Master */}
      {activeSubTab === 'equipment' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Equipment Master File ({mockEquipmentMaster.length} items)</CardTitle>
            <CardDescription>Complete inventory with calibration history and measurement uncertainty</CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search equipment..." value={eqSearch} onChange={e => setEqSearch(e.target.value)} className="pl-9" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Make/Model</TableHead>
                    <TableHead>Serial No.</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Last Cal.</TableHead>
                    <TableHead>Next Cal. Due</TableHead>
                    <TableHead>Cal Cert #</TableHead>
                    <TableHead>Uncertainty</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEquipment.map(eq => {
                    const isOverdue = new Date(eq.nextCalDue) < new Date('2026-03-10')
                    return (
                      <TableRow key={eq.id}>
                        <TableCell className="font-mono font-semibold">{eq.equipmentId}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{eq.name}</TableCell>
                        <TableCell className="text-sm">{eq.make} / {eq.model}</TableCell>
                        <TableCell className="font-mono text-xs">{eq.serialNumber}</TableCell>
                        <TableCell className="text-sm">{eq.location}</TableCell>
                        <TableCell className="text-sm">{eq.lastCalDate}</TableCell>
                        <TableCell>
                          <span className={isOverdue ? 'text-red-600 font-bold' : 'text-sm'}>{eq.nextCalDue}</span>
                          {isOverdue && <AlertTriangle className="inline ml-1 h-3 w-3 text-red-600" />}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{eq.calCertificateNo}</TableCell>
                        <TableCell className="text-sm">{eq.measurementUncertainty}</TableCell>
                        <TableCell>
                          <Badge variant={eq.status === 'active' ? 'default' : eq.status === 'under_maintenance' ? 'secondary' : 'destructive'}>
                            {eq.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personnel Master */}
      {activeSubTab === 'personnel' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personnel Master File</CardTitle>
            <CardDescription>Qualifications, training records, and authorizations</CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search personnel..." value={personnelSearch} onChange={e => setPersonnelSearch(e.target.value)} className="pl-9" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPersonnel.map(p => (
                <Card key={p.id} className="border">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{p.name} <span className="text-muted-foreground font-normal text-sm">({p.employeeId})</span></p>
                        <p className="text-sm text-muted-foreground">{p.role} - {p.department}</p>
                      </div>
                      <Badge variant={p.status === 'active' ? 'default' : 'secondary'}>{p.status}</Badge>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium mb-1">Qualifications</p>
                        <ul className="space-y-1">
                          {p.qualifications.map((q, i) => (<li key={i} className="text-muted-foreground">- {q}</li>))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Training Records</p>
                        {p.trainingRecords.map((t, i) => (
                          <div key={i} className="mb-1 text-muted-foreground">
                            <p>- {t.course}</p>
                            <p className="text-xs ml-2">Cert: {t.certNo} | Valid: {t.validUntil}</p>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="font-medium mb-1">Authorizations</p>
                        <div className="flex flex-wrap gap-1">
                          {p.authorizations.map((a, i) => (<Badge key={i} variant="outline" className="text-xs">{a}</Badge>))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Standards Master */}
      {activeSubTab === 'standards' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Standards Master File</CardTitle>
            <CardDescription>IEC/ISO standards with clause references</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockStandardsMaster.map(s => (
                <Card key={s.id} className="border">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{s.standardNumber}</p>
                        <p className="text-sm text-muted-foreground">{s.title}</p>
                      </div>
                      <div className="text-right text-sm">
                        <Badge variant={s.status === 'current' ? 'default' : 'secondary'}>{s.status}</Badge>
                        <p className="text-muted-foreground mt-1">{s.edition}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-1">Key Clauses</p>
                      <div className="grid sm:grid-cols-2 gap-1">
                        {s.clauses.map((c, i) => (
                          <div key={i} className="text-sm text-muted-foreground">
                            <span className="font-mono font-medium">Cl. {c.clause}</span> - {c.title}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Purchased: {s.purchaseDate}</span>
                      <span>Review due: {s.nextReviewDate}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Master */}
      {activeSubTab === 'customers' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer Master File</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Since</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCustomerMaster.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono">{c.customerCode}</TableCell>
                    <TableCell className="font-semibold">{c.name}</TableCell>
                    <TableCell>{c.contactPerson}</TableCell>
                    <TableCell className="text-sm">{c.email}</TableCell>
                    <TableCell>{c.country}</TableCell>
                    <TableCell className="text-center">{c.projectCount}</TableCell>
                    <TableCell className="text-center">{c.activeProjects}</TableCell>
                    <TableCell className="text-sm">{c.since}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Supplier Master */}
      {activeSubTab === 'suppliers' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Supplier Master File</CardTitle>
            <CardDescription>Equipment suppliers and calibration laboratories</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Accreditation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Audit</TableHead>
                  <TableHead>Next Audit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSupplierMaster.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono">{s.supplierCode}</TableCell>
                    <TableCell className="font-semibold">{s.name}</TableCell>
                    <TableCell>{s.category}</TableCell>
                    <TableCell className="text-sm">{s.contactPerson}</TableCell>
                    <TableCell className="text-sm">{s.accreditation}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === 'approved' ? 'default' : 'secondary'}>{s.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{s.lastAuditDate}</TableCell>
                    <TableCell className="text-sm">{s.nextAuditDue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============================================================================
// Audit Trail Tab
// ============================================================================

function AuditTrailTab() {
  const [search, setSearch] = useState("")
  const [userFilter, setUserFilter] = useState("all")
  const [actionFilter, setActionFilter] = useState("all")
  const [moduleFilter, setModuleFilter] = useState("all")

  const uniqueUsers = useMemo(() => Array.from(new Set(mockAuditTrail.map(a => a.userName))), [])
  const uniqueActions = useMemo(() => Array.from(new Set(mockAuditTrail.map(a => a.action))), [])
  const uniqueModules = useMemo(() => Array.from(new Set(mockAuditTrail.map(a => a.module))), [])

  const filteredTrail = useMemo(() => {
    return mockAuditTrail.filter(entry => {
      const matchesSearch = !search ||
        entry.documentNumber.toLowerCase().includes(search.toLowerCase()) ||
        entry.details.toLowerCase().includes(search.toLowerCase()) ||
        entry.userName.toLowerCase().includes(search.toLowerCase())
      const matchesUser = userFilter === 'all' || entry.userName === userFilter
      const matchesAction = actionFilter === 'all' || entry.action === actionFilter
      const matchesModule = moduleFilter === 'all' || entry.module === moduleFilter
      return matchesSearch && matchesUser && matchesAction && matchesModule
    })
  }, [search, userFilter, actionFilter, moduleFilter])

  const actionColors: Record<string, string> = {
    create: 'bg-green-100 text-green-700',
    update: 'bg-blue-100 text-blue-700',
    delete: 'bg-red-100 text-red-700',
    approve: 'bg-emerald-100 text-emerald-700',
    reject: 'bg-red-100 text-red-700',
    export: 'bg-purple-100 text-purple-700',
    view: 'bg-gray-100 text-gray-700',
    login: 'bg-cyan-100 text-cyan-700',
    logout: 'bg-slate-100 text-slate-700',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-4 flex items-start gap-3">
          <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">Tamper-Proof Audit Trail</p>
            <p className="text-sm text-amber-700">Every action is logged chronologically. Records are immutable and cannot be modified or deleted. ISO 17025 Cl.7.5 & ISO 9001 Cl.7.5 compliant.</p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search audit trail..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="User" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {uniqueUsers.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {uniqueActions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Module" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {uniqueModules.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Trail Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chronological Log ({filteredTrail.length} entries)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrail.map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{entry.userName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={actionColors[entry.action] || ''}>
                        {entry.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{entry.module}</TableCell>
                    <TableCell className="font-mono text-xs">{entry.documentNumber || '-'}</TableCell>
                    <TableCell className="text-sm">{entry.fieldName || '-'}</TableCell>
                    <TableCell className="text-sm text-red-600">{entry.oldValue || '-'}</TableCell>
                    <TableCell className="text-sm text-green-600">{entry.newValue || '-'}</TableCell>
                    <TableCell className="text-xs max-w-[250px] truncate">{entry.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// Main Page
// ============================================================================

export default function TraceabilityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Traceability & Document Control</h1>
        <p className="text-muted-foreground">ISO 17025 & ISO 9001 compliant document numbering, traceability, and audit trail</p>
      </div>

      <Tabs defaultValue="numbering" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="numbering" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            <span className="hidden sm:inline">Document Numbering</span>
            <span className="sm:hidden">Numbering</span>
          </TabsTrigger>
          <TabsTrigger value="matrix" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            <span className="hidden sm:inline">Traceability Matrix</span>
            <span className="sm:hidden">Matrix</span>
          </TabsTrigger>
          <TabsTrigger value="master" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Master Files</span>
            <span className="sm:hidden">Masters</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Audit Trail</span>
            <span className="sm:hidden">Audit</span>
          </TabsTrigger>
          <TabsTrigger value="routecard" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Route Card</span>
            <span className="sm:hidden">Route</span>
          </TabsTrigger>
          <TabsTrigger value="enhanced" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Advanced Tools</span>
            <span className="sm:hidden">Advanced</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="numbering">
          <DocumentNumberingTab />
        </TabsContent>
        <TabsContent value="matrix">
          <TraceabilityMatrixTab />
        </TabsContent>
        <TabsContent value="master">
          <MasterFilesTab />
        </TabsContent>
        <TabsContent value="audit">
          <AuditTrailTab />
        </TabsContent>
        <TabsContent value="routecard">
          <RouteCardOMRTab />
        </TabsContent>
        <TabsContent value="enhanced">
          <div className="space-y-8">
            <AuditTrailTimeline />
            <LinkedDocumentReferences />
            <ExportToPDF />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
