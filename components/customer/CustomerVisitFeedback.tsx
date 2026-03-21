// @ts-nocheck
'use client'

import { useState } from 'react'
import { cn, formatDate } from '@/lib/utils'
import { customerVisits, type CustomerVisit } from '@/lib/data/customer-data'

const statusColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  scheduled: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function CustomerVisitFeedback() {
  const [showForm, setShowForm] = useState(false)
  const [visits, setVisits] = useState<CustomerVisit[]>(customerVisits)
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all' ? visits : visits.filter(v => v.status === filter)

  const avgRating = visits.filter(v => v.rating > 0).reduce((s, v) => s + v.rating, 0) / visits.filter(v => v.rating > 0).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['all', 'completed', 'scheduled', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium capitalize',
                filter === f ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 bg-amber-600 text-white rounded-md text-xs font-medium hover:bg-amber-700"
        >
          + Log Visit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-3 text-center">
          <div className="text-2xl font-bold text-gray-800">{visits.length}</div>
          <div className="text-xs text-gray-500">Total Visits</div>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{visits.filter(v => v.status === 'completed').length}</div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{visits.filter(v => v.status === 'scheduled').length}</div>
          <div className="text-xs text-gray-500">Scheduled</div>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center">
          <div className="text-2xl font-bold text-amber-600">{avgRating.toFixed(1)}</div>
          <div className="text-xs text-gray-500">Avg Rating</div>
        </div>
      </div>

      {showForm && (
        <VisitForm onClose={() => setShowForm(false)} onAdd={(v) => { setVisits([v, ...visits]); setShowForm(false) }} />
      )}

      {/* Visit Cards */}
      <div className="space-y-3">
        {filtered.map(v => (
          <VisitCard key={v.id} visit={v} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">No visits found</div>
        )}
      </div>
    </div>
  )
}

function VisitCard({ visit }: { visit: CustomerVisit }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-lg border">
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-600">{visit.id}</span>
            <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded', statusColors[visit.status])}>
              {visit.status}
            </span>
          </div>
          <div className="text-sm font-medium mt-1">{visit.customerName} — {visit.company}</div>
          <div className="text-xs text-gray-500">{visit.purpose}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-gray-500">{formatDate(visit.date)}</div>
          {visit.rating > 0 && (
            <div className="flex items-center gap-0.5 justify-end mt-1">
              {[1, 2, 3, 4, 5].map(s => (
                <span key={s} className={cn('text-sm', s <= visit.rating ? 'text-amber-400' : 'text-gray-300')}>
                  ★
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t bg-gray-50 space-y-3">
          <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Accompanied By</div>
              <div className="text-xs text-gray-700">{visit.accompaniedBy}</div>
            </div>
            {visit.feedbackSummary && (
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Feedback Summary</div>
                <div className="text-xs text-gray-700">{visit.feedbackSummary}</div>
              </div>
            )}
          </div>

          {visit.actionItems.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Action Items</div>
              <ul className="space-y-1">
                {visit.actionItems.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                    <span className="w-4 h-4 rounded border border-gray-300 shrink-0 mt-0.5" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Photo gallery placeholder */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Photo Gallery</div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-xs text-gray-400">Upload</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function VisitForm({ onClose, onAdd }: { onClose: () => void; onAdd: (v: CustomerVisit) => void }) {
  const [form, setForm] = useState({
    customerName: '', company: '', purpose: '', accompaniedBy: '',
    feedbackSummary: '', rating: 0, date: '',
  })

  return (
    <div className="bg-white rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Log Customer Visit</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">Close</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full border rounded px-3 py-1.5 text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Customer Name *</label>
          <input type="text" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} className="w-full border rounded px-3 py-1.5 text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Company *</label>
          <input type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="w-full border rounded px-3 py-1.5 text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Accompanied By</label>
          <input type="text" value={form.accompaniedBy} onChange={e => setForm({ ...form, accompaniedBy: e.target.value })} className="w-full border rounded px-3 py-1.5 text-xs" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Purpose</label>
          <input type="text" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} className="w-full border rounded px-3 py-1.5 text-xs" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Feedback Summary</label>
          <textarea value={form.feedbackSummary} onChange={e => setForm({ ...form, feedbackSummary: e.target.value })} rows={2} className="w-full border rounded px-3 py-1.5 text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Rating (1-5)</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setForm({ ...form, rating: s })}
                className={cn('text-2xl', s <= form.rating ? 'text-amber-400' : 'text-gray-300')}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t">
        <button onClick={onClose} className="px-3 py-1.5 text-xs border rounded-md text-gray-600 hover:bg-gray-50">Cancel</button>
        <button
          onClick={() => {
            onAdd({
              id: `VISIT-${String(Date.now()).slice(-3)}`,
              ...form,
              date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
              actionItems: [],
              photos: [],
              status: form.date && new Date(form.date) > new Date() ? 'scheduled' : 'completed',
            })
          }}
          className="px-4 py-1.5 text-xs bg-amber-600 text-white rounded-md hover:bg-amber-700 font-medium"
        >
          Save Visit
        </button>
      </div>
    </div>
  )
}
