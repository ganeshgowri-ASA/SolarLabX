// @ts-nocheck
"use client"
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, FolderTree, LayoutDashboard, KanbanSquare, Calendar, Users, CheckCircle2, Clock, AlertTriangle, XCircle, ArrowRight, ExternalLink, MessageSquare, Filter, ChevronRight, ChevronDown, Folder, FileText, Plus, Search, Send, Bot, Briefcase, Wrench, Shield, FlaskConical, Eye, Gauge } from "lucide-react"
import { TEAM_MEMBERS, NOTIFICATIONS, ENHANCED_TASKS, DEFAULT_FOLDER_STRUCTURE } from "@/lib/data/enhanced-projects-data"
import { EnhancedTask, ProjectType, FolderNode } from "@/lib/types/projects"

const PRIORITY_COLORS = { Critical: "bg-red-600 text-white", High: "bg-orange-500 text-white", Medium: "bg-yellow-500 text-black", Low: "bg-blue-400 text-white" }
const STATUS_COLORS = { "Not Started": "bg-gray-200 text-gray-700", "In Progress": "bg-blue-100 text-blue-800", Completed: "bg-green-100 text-green-800", Blocked: "bg-red-100 text-red-800", Overdue: "bg-red-200 text-red-900" }
const WORKFLOW_COLORS = { assigned: "bg-gray-100 text-gray-700", in_progress: "bg-blue-100 text-blue-700", submitted: "bg-purple-100 text-purple-700", in_review: "bg-yellow-100 text-yellow-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" }
const WORKFLOW_LABELS = { assigned: "Assigned", in_progress: "In Progress", submitted: "Submitted", in_review: "In Review", approved: "Approved", rejected: "Rejected" }
const PROJECT_TYPE_ICONS: Record<string, any> = { Testing: FlaskConical, Quality: Shield, Audit: Eye, Maintenance: Wrench, Calibration: Gauge, Research: FlaskConical }
const KANBAN_COLUMNS = ["Backlog", "To Do", "In Progress", "Review", "Done"] as const

// ── Folder Tree Sub-component ─────────────────────────────────────────────
function FolderTreeView({ node, depth = 0 }: { node: FolderNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2)
  const hasChildren = node.children && node.children.length > 0
  return (
    <div>
      <div className={`flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50 cursor-pointer`} style={{ paddingLeft: `${depth * 20 + 8}px` }} onClick={() => hasChildren && setExpanded(!expanded)}>
        {hasChildren ? (expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />) : <span className="w-4" />}
        {node.type === "folder" ? <Folder className="h-4 w-4 text-yellow-500" /> : <FileText className="h-4 w-4 text-blue-500" />}
        <span className="text-sm">{node.name}</span>
        <span className="text-xs text-muted-foreground ml-auto">{node.path}</span>
      </div>
      {expanded && hasChildren && node.children!.map((child) => <FolderTreeView key={child.id} node={child} depth={depth + 1} />)}
    </div>
  )
}

// ── Task Card Sub-component ───────────────────────────────────────────────
function TaskCard({ task, onClick }: { task: EnhancedTask; onClick: () => void }) {
  const Icon = PROJECT_TYPE_ICONS[task.projectType] || FlaskConical
  return (
    <Card className="mb-2 cursor-pointer hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: task.priority === "Critical" ? "#dc2626" : task.priority === "High" ? "#f97316" : task.priority === "Medium" ? "#eab308" : "#60a5fa" }} onClick={onClick}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs font-medium text-muted-foreground">{task.projectType}</span></div>
          <Badge className={`text-[10px] px-1.5 py-0 ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</Badge>
        </div>
        <p className="text-sm font-semibold mb-1 line-clamp-2">{task.name}</p>
        <div className="flex items-center gap-1 mb-2"><Badge variant="outline" className={`text-[10px] ${WORKFLOW_COLORS[task.workflowStage]}`}>{WORKFLOW_LABELS[task.workflowStage]}</Badge></div>
        <Progress value={task.completionPercent} className="h-1.5 mb-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{task.assignee?.split(" ").slice(-1)[0]}</span>
          <span>{task.endDate}</span>
        </div>
        {task.linkedModuleName && <div className="flex items-center gap-1 mt-1.5 text-xs text-blue-600"><ExternalLink className="h-3 w-3" /><span>{task.linkedModuleName}</span></div>}
      </CardContent>
    </Card>
  )
}

// ── Main Enhanced Dashboard Component ───────────────────────────────────
export function EnhancedProjectsDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedTask, setSelectedTask] = useState<EnhancedTask | null>(null)
  const [filterType, setFilterType] = useState<string>("all")
  const [filterAssignee, setFilterAssignee] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)
  const [aiQuery, setAiQuery] = useState("")
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string }[]>([{ role: "assistant", content: "Hello! I'm your SolarLabX Project AI assistant. Ask me about tasks, projects, team workload, or any project data." }])

  const unreadNotifs = NOTIFICATIONS.filter((n) => !n.read).length

  const filteredTasks = useMemo(() => {
    return ENHANCED_TASKS.filter((t) => {
      if (filterType !== "all" && t.projectType !== filterType) return false
      if (filterAssignee !== "all" && !t.assignee.includes(filterAssignee)) return false
      if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase()) && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [filterType, filterAssignee, searchQuery])

  const tasksByColumn = useMemo(() => {
    const map: Record<string, EnhancedTask[]> = {}
    KANBAN_COLUMNS.forEach((col) => { map[col] = filteredTasks.filter((t) => t.column === col) })
    return map
  }, [filteredTasks])

  const stats = useMemo(() => ({
    total: ENHANCED_TASKS.length,
    inProgress: ENHANCED_TASKS.filter((t) => t.status === "In Progress").length,
    completed: ENHANCED_TASKS.filter((t) => t.status === "Completed").length,
    overdue: ENHANCED_TASKS.filter((t) => t.status === "Overdue").length,
    testing: ENHANCED_TASKS.filter((t) => t.projectType === "Testing").length,
    quality: ENHANCED_TASKS.filter((t) => t.projectType === "Quality").length,
    audit: ENHANCED_TASKS.filter((t) => t.projectType === "Audit").length,
    maintenance: ENHANCED_TASKS.filter((t) => t.projectType === "Maintenance").length,
    calibration: ENHANCED_TASKS.filter((t) => t.projectType === "Calibration").length,
  }), [])

  const handleAiSend = () => {
    if (!aiQuery.trim()) return
    const userMsg = aiQuery.trim()
    setAiMessages((prev) => [...prev, { role: "user", content: userMsg }])
    setAiQuery("")
    setTimeout(() => {
      let response = "I'm analyzing the project data... "
      if (userMsg.toLowerCase().includes("overdue")) response = `There is ${stats.overdue} overdue task: "${ENHANCED_TASKS.find((t) => t.status === "Overdue")?.name}". It was due on ${ENHANCED_TASKS.find((t) => t.status === "Overdue")?.endDate}. Assigned to ${ENHANCED_TASKS.find((t) => t.status === "Overdue")?.assignee}.`
      else if (userMsg.toLowerCase().includes("workload") || userMsg.toLowerCase().includes("team")) response = `Team workload summary: ${TEAM_MEMBERS.map((m) => `${m.name.split(" ").slice(-1)[0]}: ${m.activeTasks} active`).join(", ")}.`
      else if (userMsg.toLowerCase().includes("testing")) response = `Testing projects: ${stats.testing} tasks. ${ENHANCED_TASKS.filter((t) => t.projectType === "Testing" && t.status === "In Progress").length} in progress, ${ENHANCED_TASKS.filter((t) => t.projectType === "Testing" && t.status === "Completed").length} completed.`
      else if (userMsg.toLowerCase().includes("calibration")) response = `Calibration: ${stats.calibration} task(s). Current: "${ENHANCED_TASKS.find((t) => t.projectType === "Calibration")?.name}" at ${ENHANCED_TASKS.find((t) => t.projectType === "Calibration")?.completionPercent}% completion.`
      else response = `Project overview: ${stats.total} total tasks, ${stats.inProgress} in progress, ${stats.completed} completed, ${stats.overdue} overdue. Types: Testing(${stats.testing}), Quality(${stats.quality}), Audit(${stats.audit}), Maintenance(${stats.maintenance}), Calibration(${stats.calibration}).`
      setAiMessages((prev) => [...prev, { role: "assistant", content: response }])
    }, 500)
  }

  return (
    <div className="space-y-4">
      {/* Header with search, filters, notifications */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Project Command Center</h1>
          <p className="text-sm text-muted-foreground">Smartsheet + Asana-style project management for Solar PV Lab</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search tasks..." className="pl-8 w-60" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
          <Select value={filterType} onValueChange={setFilterType}><SelectTrigger className="w-36"><Filter className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="Testing">Testing</SelectItem><SelectItem value="Quality">Quality</SelectItem><SelectItem value="Audit">Audit</SelectItem><SelectItem value="Maintenance">Maintenance</SelectItem><SelectItem value="Calibration">Calibration</SelectItem></SelectContent></Select>
          <Select value={filterAssignee} onValueChange={setFilterAssignee}><SelectTrigger className="w-40"><Users className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Members</SelectItem>{TEAM_MEMBERS.map((m) => <SelectItem key={m.id} value={m.name.split(" ").slice(-1)[0]}>{m.name}</SelectItem>)}</SelectContent></Select>
          <Button variant="outline" size="icon" className="relative" onClick={() => setShowNotifications(!showNotifications)}><Bell className="h-4 w-4" />{unreadNotifs > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{unreadNotifs}</span>}</Button>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <Card><CardHeader className="py-3"><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications ({unreadNotifs} unread)</CardTitle></CardHeader><CardContent className="p-0">
          <ScrollArea className="max-h-64">{NOTIFICATIONS.map((n) => (
            <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 ${!n.read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}`}>
              <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!n.read ? "bg-blue-500" : "bg-transparent"}`} />
              <div className="flex-1 min-w-0"><p className="text-sm font-medium">{n.title}</p><p className="text-xs text-muted-foreground mt-0.5">{n.message}</p><p className="text-[10px] text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p></div>
              {n.linkedUrl && <Button variant="ghost" size="sm" className="text-xs" onClick={() => window.open(n.linkedUrl, "_blank")}>Open <ExternalLink className="h-3 w-3 ml-1" /></Button>}
            </div>
          ))}</ScrollArea>
        </CardContent></Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-l-4 border-l-blue-500"><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Total Tasks</p><p className="text-2xl font-bold">{stats.total}</p></div><Briefcase className="h-8 w-8 text-blue-500/30" /></div></CardContent></Card>
        <Card className="border-l-4 border-l-yellow-500"><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">In Progress</p><p className="text-2xl font-bold">{stats.inProgress}</p></div><Clock className="h-8 w-8 text-yellow-500/30" /></div></CardContent></Card>
        <Card className="border-l-4 border-l-green-500"><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Completed</p><p className="text-2xl font-bold">{stats.completed}</p></div><CheckCircle2 className="h-8 w-8 text-green-500/30" /></div></CardContent></Card>
        <Card className="border-l-4 border-l-red-500"><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Overdue</p><p className="text-2xl font-bold text-red-600">{stats.overdue}</p></div><AlertTriangle className="h-8 w-8 text-red-500/30" /></div></CardContent></Card>
        <Card className="border-l-4 border-l-purple-500"><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Project Types</p><div className="flex gap-1 mt-1 flex-wrap">{["Testing", "Quality", "Audit", "Maint.", "Cal."].map((t, i) => <Badge key={t} variant="outline" className="text-[9px] px-1">{t}: {[stats.testing, stats.quality, stats.audit, stats.maintenance, stats.calibration][i]}</Badge>)}</div></div></div></CardContent></Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="gap-1"><LayoutDashboard className="h-4 w-4" /> Dashboard</TabsTrigger>
          <TabsTrigger value="kanban" className="gap-1"><KanbanSquare className="h-4 w-4" /> Kanban</TabsTrigger>
          <TabsTrigger value="team" className="gap-1"><Users className="h-4 w-4" /> Team</TabsTrigger>
          <TabsTrigger value="folders" className="gap-1"><FolderTree className="h-4 w-4" /> Folders</TabsTrigger>
          <TabsTrigger value="ai" className="gap-1"><Bot className="h-4 w-4" /> AI Chat</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab - Today{"'"}s Tasks as cards */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Today{"'"}s Tasks */}
            <Card className="lg:col-span-2"><CardHeader className="py-3"><CardTitle className="text-base">Today{"'"}s Tasks — {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}</CardTitle></CardHeader><CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{filteredTasks.filter((t) => t.status !== "Completed" && t.status !== "Not Started").map((task) => <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />)}</div>
              {filteredTasks.filter((t) => t.status !== "Completed" && t.status !== "Not Started").length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No active tasks match filters</p>}
            </CardContent></Card>
            {/* Team Workload Sidebar */}
            <Card><CardHeader className="py-3"><CardTitle className="text-base">Team Workload</CardTitle></CardHeader><CardContent className="space-y-3">
              {TEAM_MEMBERS.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">{m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</div>
                  <div className="flex-1"><div className="flex items-center justify-between"><span className="text-sm font-medium">{m.name.split(" ").slice(-1)[0]}</span><Badge variant="outline" className="text-[10px]">{m.role}</Badge></div><div className="flex items-center gap-2 mt-1"><Progress value={(m.activeTasks / 10) * 100} className="h-1.5 flex-1" /><span className="text-[10px] text-muted-foreground">{m.activeTasks} tasks</span></div></div>
                </div>
              ))}
            </CardContent></Card>
          </div>
          {/* Upcoming / Backlog */}
          <Card><CardHeader className="py-3"><CardTitle className="text-base">Backlog & Upcoming</CardTitle></CardHeader><CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">{filteredTasks.filter((t) => t.status === "Not Started").map((task) => <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />)}</div>
            {filteredTasks.filter((t) => t.status === "Not Started").length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No backlog tasks</p>}
          </CardContent></Card>
        </TabsContent>

        {/* Kanban Tab */}
        <TabsContent value="kanban">
          <div className="flex gap-3 overflow-x-auto pb-4">
            {KANBAN_COLUMNS.map((col) => (
              <div key={col} className="flex-shrink-0 w-64">
                <div className="flex items-center justify-between mb-2 px-1"><h3 className="text-sm font-semibold">{col}</h3><Badge variant="secondary" className="text-xs">{tasksByColumn[col]?.length || 0}</Badge></div>
                <div className="bg-muted/30 rounded-lg p-2 min-h-[400px]">{tasksByColumn[col]?.map((task) => <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />)}</div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEAM_MEMBERS.map((m) => {
              const memberTasks = ENHANCED_TASKS.filter((t) => t.assignee.includes(m.name.split(" ").slice(-1)[0]))
              return (
                <Card key={m.id}><CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold">{m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</div>
                    <div><p className="font-semibold text-sm">{m.name}</p><Badge variant="outline" className="text-[10px]">{m.role} — {m.department}</Badge></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Active Tasks</span><span className="font-bold">{memberTasks.filter((t) => t.status !== "Completed").length}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Completed</span><span className="font-bold text-green-600">{m.completedTasks}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">For Review</span><span className="font-bold text-yellow-600">{memberTasks.filter((t) => t.workflowStage === "submitted" || t.workflowStage === "in_review").length}</span></div>
                  </div>
                  {memberTasks.length > 0 && <div className="mt-3 space-y-1">{memberTasks.slice(0, 3).map((t) => <div key={t.id} className="text-xs flex items-center gap-1 py-0.5"><div className={`w-1.5 h-1.5 rounded-full ${t.status === "Overdue" ? "bg-red-500" : t.status === "Completed" ? "bg-green-500" : "bg-blue-500"}`} /><span className="truncate">{t.name}</span></div>)}</div>}
                </CardContent></Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Folders Tab */}
        <TabsContent value="folders">
          <Card><CardHeader className="py-3"><div className="flex items-center justify-between"><CardTitle className="text-base flex items-center gap-2"><FolderTree className="h-4 w-4" /> Project Folder Structure</CardTitle><Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> New Folder</Button></div><p className="text-xs text-muted-foreground mt-1">Pre-defined folder structure for test data, reports, protocols & equipment files. Files downloaded from SolarLabX will follow this path structure.</p></CardHeader>
            <CardContent><FolderTreeView node={DEFAULT_FOLDER_STRUCTURE} /></CardContent>
          </Card>
        </TabsContent>

        {/* AI Chat Tab */}
        <TabsContent value="ai">
          <Card className="h-[500px] flex flex-col"><CardHeader className="py-3 border-b"><CardTitle className="text-base flex items-center gap-2"><Bot className="h-4 w-4" /> SolarLabX Project AI</CardTitle></CardHeader>
            <CardContent className="flex-1 overflow-auto p-4 space-y-3">
              {aiMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{msg.content}</div>
                </div>
              ))}
            </CardContent>
            <div className="border-t p-3 flex gap-2"><Input placeholder="Ask about projects, tasks, team workload..." value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAiSend()} /><Button onClick={handleAiSend}><Send className="h-4 w-4" /></Button></div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Detail Modal */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedTask && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge className={PRIORITY_COLORS[selectedTask.priority]}>{selectedTask.priority}</Badge>
                  <Badge variant="outline" className={WORKFLOW_COLORS[selectedTask.workflowStage]}>{WORKFLOW_LABELS[selectedTask.workflowStage]}</Badge>
                  <Badge variant="outline">{selectedTask.projectType}</Badge>
                </div>
                <DialogTitle className="text-lg">{selectedTask.name}</DialogTitle>
                <DialogDescription>{selectedTask.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Assignee:</span> <strong>{selectedTask.assignee}</strong></div>
                  <div><span className="text-muted-foreground">Assigned By:</span> <strong>{TEAM_MEMBERS.find((m) => m.id === selectedTask.assignedBy)?.name || selectedTask.assignedBy}</strong></div>
                  <div><span className="text-muted-foreground">Reviewer:</span> <strong>{TEAM_MEMBERS.find((m) => m.id === selectedTask.reviewer)?.name || "N/A"}</strong></div>
                  <div><span className="text-muted-foreground">Approver:</span> <strong>{TEAM_MEMBERS.find((m) => m.id === selectedTask.approver)?.name || "N/A"}</strong></div>
                  <div><span className="text-muted-foreground">Start:</span> {selectedTask.startDate}</div>
                  <div><span className="text-muted-foreground">Due:</span> {selectedTask.endDate}</div>
                  <div><span className="text-muted-foreground">Hours:</span> {selectedTask.loggedHours || 0}/{selectedTask.estimatedHours || 0}h</div>
                  <div><span className="text-muted-foreground">Category:</span> {selectedTask.category}</div>
                </div>
                <div><p className="text-sm font-medium mb-1">Progress</p><Progress value={selectedTask.completionPercent} className="h-2" /><p className="text-xs text-muted-foreground mt-1">{selectedTask.completionPercent}% complete</p></div>
                {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                  <div><p className="text-sm font-medium mb-2">Subtasks</p>{selectedTask.subtasks.map((s) => (<div key={s.id} className="flex items-center gap-2 py-1"><div className={`w-4 h-4 rounded border flex items-center justify-center ${s.done ? "bg-green-500 border-green-500" : "border-gray-300"}`}>{s.done && <CheckCircle2 className="h-3 w-3 text-white" />}</div><span className={`text-sm ${s.done ? "line-through text-muted-foreground" : ""}`}>{s.name}</span></div>))}</div>
                )}
                {selectedTask.tags && <div className="flex gap-1 flex-wrap">{selectedTask.tags.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}</div>}
                {/* Workflow Actions */}
                <div className="border-t pt-3 flex gap-2 flex-wrap">
                  {selectedTask.workflowStage === "assigned" && <Button size="sm"><ArrowRight className="h-4 w-4 mr-1" /> Start Working</Button>}
                  {selectedTask.workflowStage === "in_progress" && <Button size="sm" variant="outline"><ArrowRight className="h-4 w-4 mr-1" /> Submit for Review</Button>}
                  {selectedTask.workflowStage === "submitted" && <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1" /> Begin Review</Button>}
                  {selectedTask.workflowStage === "in_review" && <><Button size="sm" className="bg-green-600 hover:bg-green-700"><CheckCircle2 className="h-4 w-4 mr-1" /> Approve</Button><Button size="sm" variant="destructive"><XCircle className="h-4 w-4 mr-1" /> Reject</Button></>}
                  {selectedTask.linkedModuleUrl && <Button size="sm" variant="link" onClick={() => window.open(selectedTask.linkedModuleUrl, "_blank")}><ExternalLink className="h-4 w-4 mr-1" /> Open {selectedTask.linkedModuleName}</Button>}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
