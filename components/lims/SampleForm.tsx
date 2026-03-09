'use client'

import { useState } from 'react'
import { SAMPLE_TYPES, TEST_STANDARDS, PRIORITY_OPTIONS } from '@/lib/constants'
import { ALL_TEST_TEMPLATES } from '@/lib/test-templates'

interface SampleFormProps {
  onSubmit: (data: Record<string, unknown>) => void
  onCancel: () => void
}

export default function SampleForm({ onSubmit, onCancel }: SampleFormProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientOrganization: '',
    sampleType: 'pv_module',
    manufacturer: '',
    modelNumber: '',
    serialNumber: '',
    batchNumber: '',
    lengthMm: '',
    widthMm: '',
    thicknessMm: '',
    weightKg: '',
    testStandard: 'IEC 61215',
    priority: 'normal',
    assignedProtocolIds: [] as string[],
    notes: '',
  })

  const availableProtocols = ALL_TEST_TEMPLATES.filter(t =>
    t.standard.includes(formData.testStandard)
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleProtocolToggle = (protocolId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedProtocolIds: prev.assignedProtocolIds.includes(protocolId)
        ? prev.assignedProtocolIds.filter(id => id !== protocolId)
        : [...prev.assignedProtocolIds, protocolId],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      lengthMm: formData.lengthMm ? Number(formData.lengthMm) : null,
      widthMm: formData.widthMm ? Number(formData.widthMm) : null,
      thicknessMm: formData.thicknessMm ? Number(formData.thicknessMm) : null,
      weightKg: formData.weightKg ? Number(formData.weightKg) : null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Client Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
            <input type="text" name="clientName" required value={formData.clientName} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Email</label>
            <input type="email" name="clientEmail" value={formData.clientEmail} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
            <input type="text" name="clientOrganization" value={formData.clientOrganization} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Module Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sample Type *</label>
            <select name="sampleType" value={formData.sampleType} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
              {SAMPLE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer *</label>
            <input type="text" name="manufacturer" required value={formData.manufacturer} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model Number *</label>
            <input type="text" name="modelNumber" required value={formData.modelNumber} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number *</label>
            <input type="text" name="serialNumber" required value={formData.serialNumber} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
            <input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
        </div>

        <h4 className="text-sm font-semibold mt-4 mb-2 text-gray-600">Physical Dimensions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Length (mm)</label>
            <input type="number" name="lengthMm" value={formData.lengthMm} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Width (mm)</label>
            <input type="number" name="widthMm" value={formData.widthMm} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thickness (mm)</label>
            <input type="number" name="thicknessMm" value={formData.thicknessMm} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
            <input type="number" name="weightKg" step="0.1" value={formData.weightKg} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Test Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Test Standard *</label>
            <select name="testStandard" value={formData.testStandard} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
              {TEST_STANDARDS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
            <select name="priority" value={formData.priority} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
              {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Test Protocols</label>
          <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
            {availableProtocols.length === 0 ? (
              <p className="text-sm text-gray-500">No protocols available for selected standard</p>
            ) : (
              availableProtocols.map(protocol => (
                <label key={protocol.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.assignedProtocolIds.includes(protocol.id)}
                    onChange={() => handleProtocolToggle(protocol.id)}
                    className="mt-1 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <div className="text-sm font-medium">{protocol.name}</div>
                    <div className="text-xs text-gray-500">{protocol.standard} {protocol.clause} | ~{protocol.estimatedDurationHours}h | {protocol.category}</div>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
        <textarea name="notes" rows={3} value={formData.notes} onChange={handleChange} placeholder="Enter any additional notes or instructions..." className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
      </div>

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded-md text-sm font-medium hover:bg-amber-600">Register Sample</button>
      </div>
    </form>
  )
}
