// @ts-nocheck
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const categories = [
  'Test Result Dispute',
  'Delay',
  'Equipment Issue',
  'Report Error',
  'Safety',
  'Sample Handling',
  'Communication',
  'Calibration',
  'Other',
]

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-700' },
  { value: 'normal', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: 'Critical', color: 'bg-red-100 text-red-700' },
]

function generateComplaintId() {
  const year = new Date().getFullYear()
  const num = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')
  return `COMP-${year}-${num}`
}

interface ComplaintRegistrationFormProps {
  onSubmit: (data: Record<string, unknown>) => void
  onCancel: () => void
}

export default function ComplaintRegistrationForm({ onSubmit, onCancel }: ComplaintRegistrationFormProps) {
  const [complaintId] = useState(generateComplaintId)
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerOrganization: '',
    projectId: '',
    sampleId: '',
    category: '',
    priority: 'normal',
    description: '',
    assignedTo: '',
    dueDate: '',
  })

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customerName || !form.category || !form.description) {
      toast.error('Please fill in required fields')
      return
    }
    onSubmit({ ...form, complaintNumber: complaintId })
    toast.success(`Complaint ${complaintId} registered successfully`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">New Complaint Registration</h2>
            <p className="text-sm text-gray-500">Fill in the details to register a new customer complaint</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Complaint ID</div>
            <div className="text-lg font-mono font-bold text-amber-600">{complaintId}</div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Customer Name *</label>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => handleChange('customerName', e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="e.g., Mr. Arun Mehta"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Organization</label>
              <input
                type="text"
                value={form.customerOrganization}
                onChange={(e) => handleChange('customerOrganization', e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="e.g., SolarEdge Technologies"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={form.customerEmail}
                onChange={(e) => handleChange('customerEmail', e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="email@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input
                type="tel"
                value={form.customerPhone}
                onChange={(e) => handleChange('customerPhone', e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="+91-XX-XXXX-XXXX"
              />
            </div>
          </div>
        </div>

        {/* Complaint Details */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">Complaint Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Project ID</label>
              <input
                type="text"
                value={form.projectId}
                onChange={(e) => handleChange('projectId', e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="PROJECT-YYYY-NNNNN"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Module / Sample ID</label>
              <input
                type="text"
                value={form.sampleId}
                onChange={(e) => handleChange('sampleId', e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="SAMPLE-YYYY-NNNNN"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              >
                <option value="">Select category...</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Priority *</label>
              <div className="flex gap-2">
                {priorities.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => handleChange('priority', p.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-xs font-medium border transition-all',
                      form.priority === p.value ? p.color + ' ring-2 ring-offset-1 ring-gray-300' : 'bg-gray-50 text-gray-500'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Describe the complaint in detail..."
              required
            />
          </div>
        </div>

        {/* Assignment */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">Assignment & SLA</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Assigned To</label>
              <select
                value={form.assignedTo}
                onChange={(e) => handleChange('assignedTo', e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">Select assignee...</option>
                <option value="Dr. Rajesh Kumar">Dr. Rajesh Kumar</option>
                <option value="Dr. Meena Singh">Dr. Meena Singh</option>
                <option value="Dr. Suresh Nair">Dr. Suresh Nair</option>
                <option value="Dr. Priya Sharma">Dr. Priya Sharma</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Due Date / SLA Deadline</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Attachments placeholder */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">Attachments</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <div className="text-gray-400 text-sm">Drag & drop files here, or click to browse</div>
            <div className="text-xs text-gray-400 mt-1">Supports: PDF, JPG, PNG, XLSX (Max 10MB each)</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm border rounded-md text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 font-medium"
          >
            Register Complaint
          </button>
        </div>
      </div>
    </form>
  )
}
