// @ts-nocheck
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { testimonials, type Testimonial } from '@/lib/data/customer-data'

const categoryColors: Record<string, string> = {
  'Lab Visit': 'bg-blue-100 text-blue-700',
  'Certification Ceremony': 'bg-purple-100 text-purple-700',
  'Training': 'bg-green-100 text-green-700',
  'General': 'bg-gray-100 text-gray-700',
  'Partnership': 'bg-amber-100 text-amber-700',
}

const galleryCategories = ['All', 'Lab Visit', 'Certification Ceremony', 'Training', 'General', 'Partnership']

export default function TestimonialsGallery() {
  const [activeView, setActiveView] = useState<'testimonials' | 'gallery'>('testimonials')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredTestimonials = selectedCategory === 'All'
    ? testimonials
    : testimonials.filter(t => t.category === selectedCategory)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('testimonials')}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium',
              activeView === 'testimonials' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Testimonials
          </button>
          <button
            onClick={() => setActiveView('gallery')}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium',
              activeView === 'gallery' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Photo Gallery
          </button>
        </div>
        <button className="px-3 py-1.5 bg-amber-600 text-white rounded-md text-xs font-medium hover:bg-amber-700">
          + Add Testimonial
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {galleryCategories.map(c => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={cn(
              'px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap',
              selectedCategory === c ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {activeView === 'testimonials' && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border p-3 text-center">
              <div className="text-2xl font-bold text-gray-800">{testimonials.length}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="bg-white rounded-lg border p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{testimonials.filter(t => t.approved).length}</div>
              <div className="text-xs text-gray-500">Approved</div>
            </div>
            <div className="bg-white rounded-lg border p-3 text-center">
              <div className="text-2xl font-bold text-amber-600">{testimonials.filter(t => !t.approved).length}</div>
              <div className="text-xs text-gray-500">Pending Approval</div>
            </div>
            <div className="bg-white rounded-lg border p-3 text-center">
              <div className="text-2xl font-bold text-amber-500">
                {(testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">Avg Rating</div>
            </div>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTestimonials.map(t => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
          {filteredTestimonials.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">No testimonials in this category</div>
          )}
        </div>
      )}

      {activeView === 'gallery' && <PhotoGallery selectedCategory={selectedCategory} />}
    </div>
  )
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-white rounded-lg border p-4 relative">
      {!testimonial.approved && (
        <div className="absolute top-2 right-2">
          <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">Pending Approval</span>
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', categoryColors[testimonial.category])}>
          {testimonial.category}
        </span>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map(s => (
            <span key={s} className={cn('text-xs', s <= testimonial.rating ? 'text-amber-400' : 'text-gray-300')}>
              ★
            </span>
          ))}
        </div>
      </div>

      <blockquote className="text-sm text-gray-700 italic leading-relaxed mb-3">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
          {testimonial.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div>
          <div className="text-xs font-medium">{testimonial.customerName}</div>
          <div className="text-[10px] text-gray-500">{testimonial.designation}, {testimonial.company}</div>
        </div>
        <div className="ml-auto text-[10px] text-gray-400">{testimonial.date}</div>
      </div>

      {!testimonial.approved && (
        <div className="flex gap-2 mt-3 pt-3 border-t">
          <button className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 font-medium">Approve</button>
          <button className="px-3 py-1 text-xs border text-gray-600 rounded hover:bg-gray-50">Reject</button>
        </div>
      )}
    </div>
  )
}

function PhotoGallery({ selectedCategory }: { selectedCategory: string }) {
  const placeholders = [
    { title: 'Lab Tour - Tata Power Solar', category: 'Lab Visit', date: '2026-01-20' },
    { title: 'IEC 61215 Certification Award', category: 'Certification Ceremony', date: '2025-12-15' },
    { title: 'Witness Testing Session', category: 'Lab Visit', date: '2026-02-10' },
    { title: 'Solar PV Testing Workshop', category: 'Training', date: '2025-11-22' },
    { title: 'NABL Accreditation Ceremony', category: 'Certification Ceremony', date: '2025-10-05' },
    { title: 'Bifacial Testing Discussion', category: 'Lab Visit', date: '2026-03-05' },
    { title: 'IEC Standards Training', category: 'Training', date: '2026-01-15' },
    { title: 'Partnership MOU Signing', category: 'Partnership', date: '2026-02-28' },
  ]

  const filtered = selectedCategory === 'All'
    ? placeholders
    : placeholders.filter(p => p.category === selectedCategory)

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filtered.map((p, i) => (
        <div key={i} className="bg-white rounded-lg border overflow-hidden group">
          <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center border-b">
            <div className="text-center">
              <div className="text-gray-300 text-3xl mb-1">📷</div>
              <div className="text-[10px] text-gray-400">Upload Photo</div>
            </div>
          </div>
          <div className="p-2">
            <div className="text-xs font-medium truncate">{p.title}</div>
            <div className="flex items-center justify-between mt-1">
              <span className={cn('text-[9px] px-1 py-0.5 rounded', categoryColors[p.category])}>
                {p.category}
              </span>
              <span className="text-[10px] text-gray-400">{p.date}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Upload new card */}
      <div className="bg-white rounded-lg border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 min-h-[180px]">
        <div className="text-center">
          <div className="text-gray-300 text-2xl mb-1">+</div>
          <div className="text-xs text-gray-400">Add Photo</div>
        </div>
      </div>
    </div>
  )
}
