'use client'

import { useState } from 'react'
import type { TestTemplate, TestParameter, AcceptanceCriterion } from '@/lib/types'

interface TestTemplateRendererProps {
  template: TestTemplate
  initialData?: Record<string, unknown>
  onSubmit: (data: Record<string, unknown>) => void
  readOnly?: boolean
}

export default function TestTemplateRenderer({ template, initialData, onSubmit, readOnly = false }: TestTemplateRendererProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const defaults: Record<string, unknown> = {}
    template.inputParameters.forEach(p => {
      defaults[p.name] = initialData?.[p.name] ?? p.defaultValue
    })
    return defaults
  })

  const [validationResults, setValidationResults] = useState<Record<string, { passed: boolean; message: string }>>({})

  const handleChange = (name: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateAgainstCriteria = () => {
    const results: Record<string, { passed: boolean; message: string }> = {}
    template.acceptanceCriteria.forEach(criterion => {
      const value = formData[criterion.parameter]
      if (value === undefined || value === null) {
        results[criterion.parameter] = { passed: false, message: 'No data entered' }
        return
      }
      const numVal = Number(value)
      let passed = false
      switch (criterion.operator) {
        case 'lt': passed = numVal < (criterion.value as number); break
        case 'lte': passed = numVal <= (criterion.value as number); break
        case 'gt': passed = numVal > (criterion.value as number); break
        case 'gte': passed = numVal >= (criterion.value as number); break
        case 'eq': passed = numVal === (criterion.value as number); break
        case 'between': {
          const [min, max] = criterion.value as [number, number]
          passed = numVal >= min && numVal <= max
          break
        }
        case 'max_degradation': {
          const pBefore = Number(formData['pmaxBefore'] || 0)
          const pAfter = Number(formData['pmax'] || numVal)
          if (pBefore > 0) {
            const degradation = ((pBefore - pAfter) / pBefore) * 100
            passed = degradation <= (criterion.value as number)
          } else {
            passed = true
          }
          break
        }
      }
      results[criterion.parameter] = { passed, message: criterion.description }
    })
    setValidationResults(results)
    return Object.values(results).every(r => r.passed)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const allPassed = validateAgainstCriteria()
    onSubmit({ ...formData, _validationPassed: allPassed })
  }

  const renderParameterInput = (param: TestParameter) => {
    const value = formData[param.name]
    const validation = validationResults[param.name]

    return (
      <div key={param.name} className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          {param.label} {param.required && <span className="text-red-500">*</span>}
          {param.unit && <span className="text-gray-400 ml-1">({param.unit})</span>}
        </label>
        {param.type === 'number' && (
          <input
            type="number"
            value={String(value ?? '')}
            onChange={e => handleChange(param.name, e.target.value === '' ? '' : Number(e.target.value))}
            min={param.min}
            max={param.max}
            step={param.step || 'any'}
            required={param.required}
            readOnly={readOnly}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
          />
        )}
        {param.type === 'text' && (
          <input
            type="text"
            value={String(value ?? '')}
            onChange={e => handleChange(param.name, e.target.value)}
            required={param.required}
            readOnly={readOnly}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        )}
        {param.type === 'boolean' && (
          <select
            value={String(value)}
            onChange={e => handleChange(param.name, e.target.value === 'true')}
            disabled={readOnly}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        )}
        {param.type === 'select' && param.options && (
          <select
            value={String(value ?? '')}
            onChange={e => handleChange(param.name, e.target.value)}
            disabled={readOnly}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {param.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        )}
        <p className="text-xs text-gray-500">{param.description}</p>
        {validation && (
          <p className={`text-xs font-medium ${validation.passed ? 'text-green-600' : 'text-red-600'}`}>
            {validation.passed ? 'PASS' : 'FAIL'}: {validation.message}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-blue-900">{template.name}</h3>
            <p className="text-sm text-blue-700">{template.standard} - Clause {template.clause}</p>
          </div>
          <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">{template.category}</span>
        </div>
        <p className="text-sm text-blue-800 mt-2">{template.description}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {template.requiredEquipment.map(eq => (
            <span key={eq} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{eq}</span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-medium mb-3">Test Sequence</h4>
        <div className="space-y-2">
          {template.testSequence.map(step => (
            <div key={step.step} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
              <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold">{step.step}</span>
              <div>
                <div className="text-sm font-medium">{step.name}</div>
                <div className="text-xs text-gray-600">{step.description}</div>
                <div className="text-xs text-gray-400">Duration: {step.duration}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg border p-4">
          <h4 className="font-medium mb-3">Test Parameters</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {template.inputParameters.map(renderParameterInput)}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4 mt-4">
          <h4 className="font-medium mb-3">Acceptance Criteria</h4>
          <div className="space-y-2">
            {template.acceptanceCriteria.map((criterion: AcceptanceCriterion, idx: number) => {
              const validation = validationResults[criterion.parameter]
              return (
                <div key={idx} className={`flex items-center gap-3 p-2 rounded ${validation ? (validation.passed ? 'bg-green-50' : 'bg-red-50') : 'bg-gray-50'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${validation ? (validation.passed ? 'bg-green-500 text-white' : 'bg-red-500 text-white') : 'bg-gray-300 text-gray-600'}`}>
                    {validation ? (validation.passed ? '\u2713' : '\u2717') : '-'}
                  </span>
                  <div className="text-sm">{criterion.description}</div>
                </div>
              )
            })}
          </div>
        </div>

        {!readOnly && (
          <div className="flex gap-3 justify-end mt-4">
            <button type="button" onClick={() => validateAgainstCriteria()} className="px-4 py-2 border border-amber-500 text-amber-600 rounded-md text-sm font-medium hover:bg-amber-50">
              Validate Results
            </button>
            <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded-md text-sm font-medium hover:bg-amber-600">
              Submit Test Data
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
