// @ts-nocheck
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit3, Save, X, Target, Eye, Flag, Users, ChevronDown } from 'lucide-react'

interface QualityObjective {
  id: string
  objective: string
  target: string
  current: number
  max: number
  unit: string
  status: 'on-track' | 'at-risk' | 'behind'
}

const INITIAL_VISION = 'To be the most trusted and technologically advanced Solar PV testing laboratory in India, recognized globally for excellence in quality, innovation, and customer satisfaction.'
const INITIAL_MISSION = 'To provide accurate, reliable, and timely testing and certification services for solar PV modules and components, enabling manufacturers to deliver safe, efficient, and durable products to the world. We are committed to upholding the highest standards of impartiality, competence, and continuous improvement in accordance with ISO/IEC 17025:2017.'
const INITIAL_POLICY = `Our Solar PV Testing Laboratory is committed to:

• Maintaining impartiality and confidentiality in all testing activities
• Complying with ISO/IEC 17025:2017 and NABL requirements at all times
• Providing accurate, reliable, and legally defensible test results
• Continually improving the effectiveness of the Quality Management System
• Ensuring all personnel are competent, trained, and aware of their responsibilities
• Meeting customer requirements and applicable statutory/regulatory requirements
• Participating in proficiency testing and inter-laboratory comparisons
• Using validated methods and properly calibrated equipment for all measurements

This policy is communicated to all personnel and reviewed annually during Management Review.`

const QUALITY_OBJECTIVES: QualityObjective[] = [
  { id: '1', objective: 'Test Report Turnaround Time', target: '≤ 5 working days', current: 4.2, max: 5, unit: 'days', status: 'on-track' },
  { id: '2', objective: 'Customer Satisfaction Score', target: '≥ 4.5 / 5.0', current: 4.6, max: 5, unit: '/ 5.0', status: 'on-track' },
  { id: '3', objective: 'Calibration On-Time Rate', target: '≥ 98%', current: 97.2, max: 100, unit: '%', status: 'at-risk' },
  { id: '4', objective: 'CAPA Closure within 30 Days', target: '≥ 90%', current: 85, max: 100, unit: '%', status: 'behind' },
  { id: '5', objective: 'Internal Audit Schedule Compliance', target: '100%', current: 100, max: 100, unit: '%', status: 'on-track' },
  { id: '6', objective: 'Proficiency Testing Z-Score', target: '|Z| ≤ 2.0', current: 1.3, max: 2, unit: '', status: 'on-track' },
  { id: '7', objective: 'Training Plan Completion', target: '≥ 95%', current: 92, max: 100, unit: '%', status: 'at-risk' },
  { id: '8', objective: 'Report Error Rate', target: '< 1%', current: 0.8, max: 1, unit: '%', status: 'on-track' },
]

const STATUS_COLORS = {
  'on-track': 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950/40',
  'at-risk': 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40',
  'behind': 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/40',
}

interface OrgNode {
  title: string
  name: string
  children?: OrgNode[]
}

const ORG_CHART: OrgNode = {
  title: 'Lab Director',
  name: 'Dr. Rajesh Kumar',
  children: [
    {
      title: 'Quality Manager',
      name: 'Priya Sharma',
      children: [
        { title: 'Document Controller', name: 'Anita Desai' },
        { title: 'Safety Officer', name: 'Vikram Singh' },
      ],
    },
    {
      title: 'Technical Manager',
      name: 'Dr. Suresh Patel',
      children: [
        { title: 'Senior Test Engineer', name: 'Amit Verma' },
        { title: 'Test Engineer (IEC 61215)', name: 'Neha Gupta' },
        { title: 'Test Engineer (IEC 61730)', name: 'Rahul Joshi' },
        { title: 'Calibration Officer', name: 'Deepak Menon' },
      ],
    },
  ],
}

function OrgNodeCard({ node, isRoot }: { node: OrgNode; isRoot?: boolean }) {
  const bgColor = isRoot
    ? 'bg-orange-600 text-white border-orange-700'
    : node.children
    ? 'bg-blue-600 text-white border-blue-700'
    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'

  return (
    <div className="flex flex-col items-center">
      <div className={`rounded-lg border-2 px-4 py-2 text-center shadow-sm ${bgColor}`}>
        <div className="text-xs font-bold">{node.title}</div>
        <div className={`text-xs ${isRoot || node.children ? 'text-white/80' : 'text-muted-foreground'}`}>{node.name}</div>
      </div>
      {node.children && node.children.length > 0 && (
        <>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
          <div className="relative flex gap-4">
            {node.children.length > 1 && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-gray-300 dark:bg-gray-600"
                style={{ width: `calc(100% - ${node.children.length > 1 ? '80px' : '0px'})` }} />
            )}
            {node.children.map((child, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
                <OrgNodeCard node={child} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function EditableCard({ title, icon: Icon, initialValue, color }: {
  title: string; icon: any; initialValue: string; color: string
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initialValue)
  const [draft, setDraft] = useState(initialValue)

  return (
    <Card className={`border-l-4 ${color}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {title}
          </CardTitle>
          {editing ? (
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => { setValue(draft); setEditing(false) }}>
                <Save className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => { setDraft(value); setEditing(false) }}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setEditing(true)}>
              <Edit3 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <textarea
            className="w-full min-h-[100px] text-sm border rounded-md p-2 bg-background"
            value={draft}
            onChange={e => setDraft(e.target.value)}
          />
        ) : (
          <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{value}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function OrganizationTab() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">Organization</h2>
        <p className="text-xs text-muted-foreground">Vision, Mission, Quality Policy & Organization Structure</p>
      </div>

      {/* Vision & Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EditableCard title="Vision Statement" icon={Eye} initialValue={INITIAL_VISION} color="border-l-blue-500" />
        <EditableCard title="Mission Statement" icon={Flag} initialValue={INITIAL_MISSION} color="border-l-green-500" />
      </div>

      {/* Quality Policy */}
      <EditableCard title="Quality Policy (ISO 17025:2017)" icon={Target} initialValue={INITIAL_POLICY} color="border-l-purple-500" />

      {/* Quality Objectives */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-orange-500" />
            Quality Objectives & Targets
          </CardTitle>
          <CardDescription className="text-xs">Monitored quarterly — as per ISO 17025:2017 Clause 8.2</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {QUALITY_OBJECTIVES.map(obj => {
              const pct = Math.min(100, (obj.current / obj.max) * 100)
              const barColor = obj.status === 'on-track' ? 'bg-green-500' : obj.status === 'at-risk' ? 'bg-amber-500' : 'bg-red-500'
              return (
                <div key={obj.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{obj.objective}</span>
                    <Badge variant="outline" className={`text-xs ${STATUS_COLORS[obj.status]}`}>
                      {obj.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-muted rounded-full">
                      <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-bold w-16 text-right">
                      {obj.current}{obj.unit}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">Target: {obj.target}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Organization Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            Organization Chart
          </CardTitle>
          <CardDescription className="text-xs">Solar PV Testing Laboratory — Organizational Hierarchy</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="flex justify-center py-4 min-w-[600px]">
            <OrgNodeCard node={ORG_CHART} isRoot />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
