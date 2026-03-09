'use client'

import { useState } from 'react'
import { CAPA_SOURCES, PRIORITY_OPTIONS } from '@/lib/constants'

interface CAPAFormProps {
  onSubmit: (data: Record<string, unknown>) => void
  onCancel: () => void
}

export default function CAPAForm({ onSubmit, onCancel }: CAPAFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'corrective' as 'corrective' | 'preventive' | 'improvement',
    priority: 'normal',
    source: '',
    description: '',
    assignedTo: '',
    targetCompletionDate: '',
    relatedDocuments: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      relatedDocuments: formData.relatedDocuments.split(',').map(d => d.trim()).filter(Boolean),
      targetCompletionDate: formData.targetCompletionDate ? new Date(formData.targetCompletionDate).toISOString() : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">New CAPA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select name="type" value={formData.type} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option value="corrective">Corrective Action</option>
              <option value="preventive">Preventive Action</option>
              <option value="improvement">Improvement</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
            <select name="priority" value={formData.priority} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
              {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source *</label>
            <select name="source" required value={formData.source} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option value="">Select source...</option>
              {CAPA_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To *</label>
            <input type="text" name="assignedTo" required value={formData.assignedTo} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Completion Date *</label>
            <input type="date" name="targetCompletionDate" required value={formData.targetCompletionDate} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Related Documents</label>
            <input type="text" name="relatedDocuments" value={formData.relatedDocuments} onChange={handleChange} placeholder="SOP-001, WI-002 (comma-separated)" className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea name="description" required rows={4} value={formData.description} onChange={handleChange} placeholder="Describe the nonconformity or improvement opportunity..." className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded-md text-sm font-medium hover:bg-amber-600">Create CAPA</button>
      </div>
    </form>
  )
}
