// @ts-nocheck
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const ROLES = [
  'Lab Director',
  'Quality Manager',
  'Technical Manager',
  'Test Engineers',
  'Calibration Officer',
  'Safety Officer',
  'Document Controller',
  'Sample Coordinator',
]

const FUNCTIONS = [
  'Sample Receipt',
  'Testing',
  'Calibration',
  'Reporting',
  'CAPA',
  'Internal Audit',
  'MRM',
  'Training',
  'Equipment Maintenance',
  'Procurement',
  'Customer Communication',
]

type RACIValue = 'R' | 'A' | 'C' | 'I' | ''

// RACI matrix: [function][role] = value
const RACI_MATRIX: Record<string, Record<string, RACIValue>> = {
  'Sample Receipt': {
    'Lab Director': 'I', 'Quality Manager': 'I', 'Technical Manager': 'C',
    'Test Engineers': 'I', 'Calibration Officer': '', 'Safety Officer': '',
    'Document Controller': 'I', 'Sample Coordinator': 'R',
  },
  'Testing': {
    'Lab Director': 'I', 'Quality Manager': 'C', 'Technical Manager': 'A',
    'Test Engineers': 'R', 'Calibration Officer': 'C', 'Safety Officer': 'C',
    'Document Controller': '', 'Sample Coordinator': 'I',
  },
  'Calibration': {
    'Lab Director': 'I', 'Quality Manager': 'C', 'Technical Manager': 'A',
    'Test Engineers': 'C', 'Calibration Officer': 'R', 'Safety Officer': '',
    'Document Controller': 'I', 'Sample Coordinator': '',
  },
  'Reporting': {
    'Lab Director': 'A', 'Quality Manager': 'C', 'Technical Manager': 'R',
    'Test Engineers': 'R', 'Calibration Officer': 'C', 'Safety Officer': '',
    'Document Controller': 'I', 'Sample Coordinator': 'I',
  },
  'CAPA': {
    'Lab Director': 'A', 'Quality Manager': 'R', 'Technical Manager': 'C',
    'Test Engineers': 'C', 'Calibration Officer': 'C', 'Safety Officer': 'C',
    'Document Controller': 'I', 'Sample Coordinator': 'I',
  },
  'Internal Audit': {
    'Lab Director': 'A', 'Quality Manager': 'R', 'Technical Manager': 'C',
    'Test Engineers': 'I', 'Calibration Officer': 'I', 'Safety Officer': 'I',
    'Document Controller': 'C', 'Sample Coordinator': 'I',
  },
  'MRM': {
    'Lab Director': 'A', 'Quality Manager': 'R', 'Technical Manager': 'C',
    'Test Engineers': 'I', 'Calibration Officer': 'I', 'Safety Officer': 'I',
    'Document Controller': 'I', 'Sample Coordinator': 'I',
  },
  'Training': {
    'Lab Director': 'A', 'Quality Manager': 'R', 'Technical Manager': 'C',
    'Test Engineers': 'I', 'Calibration Officer': 'I', 'Safety Officer': 'C',
    'Document Controller': 'I', 'Sample Coordinator': 'I',
  },
  'Equipment Maintenance': {
    'Lab Director': 'I', 'Quality Manager': 'I', 'Technical Manager': 'A',
    'Test Engineers': 'C', 'Calibration Officer': 'R', 'Safety Officer': 'C',
    'Document Controller': 'I', 'Sample Coordinator': '',
  },
  'Procurement': {
    'Lab Director': 'A', 'Quality Manager': 'C', 'Technical Manager': 'C',
    'Test Engineers': 'I', 'Calibration Officer': 'C', 'Safety Officer': '',
    'Document Controller': 'I', 'Sample Coordinator': 'R',
  },
  'Customer Communication': {
    'Lab Director': 'A', 'Quality Manager': 'C', 'Technical Manager': 'R',
    'Test Engineers': 'I', 'Calibration Officer': '', 'Safety Officer': '',
    'Document Controller': '', 'Sample Coordinator': 'R',
  },
}

const RACI_COLORS: Record<string, string> = {
  R: 'bg-blue-600 text-white',
  A: 'bg-green-600 text-white',
  C: 'bg-yellow-400 text-yellow-900',
  I: 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200',
}

interface DelegationRow {
  authority: string
  primary: string
  backup: string
  limit: string
}

const DELEGATION_MATRIX: DelegationRow[] = [
  { authority: 'Test Report Approval', primary: 'Lab Director', backup: 'Technical Manager', limit: 'All accredited reports' },
  { authority: 'Test Report Review', primary: 'Technical Manager', backup: 'Senior Test Engineer', limit: 'All test reports' },
  { authority: 'Quotation Approval', primary: 'Lab Director', backup: 'Quality Manager', limit: 'Up to ₹50L; >₹50L requires Director' },
  { authority: 'Purchase Order Approval', primary: 'Lab Director', backup: 'Technical Manager', limit: 'Up to ₹10L; >₹10L requires Director' },
  { authority: 'CAPA Approval & Closure', primary: 'Quality Manager', backup: 'Lab Director', limit: 'All CAPA records' },
  { authority: 'Document Change Approval', primary: 'Quality Manager', backup: 'Lab Director', limit: 'All QMS documents' },
  { authority: 'Method Validation Approval', primary: 'Technical Manager', backup: 'Lab Director', limit: 'New/modified test methods' },
  { authority: 'Personnel Authorization', primary: 'Lab Director', backup: 'Technical Manager', limit: 'Testing & calibration staff' },
  { authority: 'Subcontracting Approval', primary: 'Lab Director', backup: 'Quality Manager', limit: 'All subcontracted testing' },
  { authority: 'Complaint Resolution', primary: 'Quality Manager', backup: 'Lab Director', limit: 'All customer complaints' },
  { authority: 'Internal Audit Planning', primary: 'Quality Manager', backup: 'Lab Director', limit: 'Annual audit schedule' },
  { authority: 'Hiring Approval', primary: 'Lab Director', backup: 'N/A (Director only)', limit: 'All lab positions' },
]

export default function RolesResponsibilitiesTab() {
  const [subTab, setSubTab] = useState('raci')

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">Roles & Responsibilities</h2>
        <p className="text-xs text-muted-foreground">RACI Matrix and Delegation of Authority per ISO 17025:2017</p>
      </div>

      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList>
          <TabsTrigger value="raci" className="text-xs">RACI Matrix</TabsTrigger>
          <TabsTrigger value="delegation" className="text-xs">Delegation of Authority</TabsTrigger>
        </TabsList>

        <TabsContent value="raci" className="mt-4">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2 font-bold sticky left-0 bg-muted/50 min-w-[140px]">Function / Role</th>
                    {ROLES.map(role => (
                      <th key={role} className="p-2 text-center font-bold min-w-[90px]">
                        <div className="writing-mode-normal">{role}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FUNCTIONS.map((fn, idx) => (
                    <tr key={fn} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                      <td className="p-2 font-medium sticky left-0 bg-inherit">{fn}</td>
                      {ROLES.map(role => {
                        const val = RACI_MATRIX[fn]?.[role] || ''
                        return (
                          <td key={role} className="p-2 text-center">
                            {val && (
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded font-bold text-xs ${RACI_COLORS[val]}`}>
                                {val}
                              </span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-3">
            {[
              { key: 'R', label: 'Responsible — Does the work', color: RACI_COLORS.R },
              { key: 'A', label: 'Accountable — Owns the outcome', color: RACI_COLORS.A },
              { key: 'C', label: 'Consulted — Provides input', color: RACI_COLORS.C },
              { key: 'I', label: 'Informed — Kept in the loop', color: RACI_COLORS.I },
            ].map(({ key, label, color }) => (
              <span key={key} className="flex items-center gap-2 text-xs">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded font-bold ${color}`}>{key}</span>
                {label}
              </span>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="delegation" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Delegation of Authority Matrix</CardTitle>
              <p className="text-xs text-muted-foreground">Who can approve what — with primary authority and backup designees</p>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2 font-bold">Authority / Decision</th>
                    <th className="text-left p-2 font-bold">Primary Authority</th>
                    <th className="text-left p-2 font-bold">Backup Authority</th>
                    <th className="text-left p-2 font-bold">Scope / Limit</th>
                  </tr>
                </thead>
                <tbody>
                  {DELEGATION_MATRIX.map((row, idx) => (
                    <tr key={row.authority} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                      <td className="p-2 font-medium">{row.authority}</td>
                      <td className="p-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 dark:bg-green-950/40 dark:text-green-400">
                          {row.primary}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400">
                          {row.backup}
                        </Badge>
                      </td>
                      <td className="p-2 text-muted-foreground">{row.limit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
