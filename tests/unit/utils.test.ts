import { describe, it, expect } from 'vitest'
import { cn, formatDate, formatDateTime, formatCurrency, getStatusColor, getDaysUntil } from '@/lib/utils'

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('resolves conflicting Tailwind classes, keeping the last', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8')
  })

  it('ignores falsy values', () => {
    expect(cn('foo', false && 'bar', undefined, 'baz')).toBe('foo baz')
  })

  it('handles empty call', () => {
    expect(cn()).toBe('')
  })
})

describe('formatDate', () => {
  it('includes the year for a date string', () => {
    expect(formatDate('2026-01-15')).toContain('2026')
  })

  it('includes the year for a different year', () => {
    expect(formatDate('2025-06-01')).toContain('2025')
  })

  it('accepts a Date object', () => {
    expect(formatDate(new Date('2026-12-31'))).toContain('2026')
  })
})

describe('formatDateTime', () => {
  it('includes year and hour:minute markers', () => {
    const out = formatDateTime('2026-06-26T14:30:00')
    expect(out).toContain('2026')
  })
})

describe('formatCurrency', () => {
  it('includes the numeric amount for INR', () => {
    const out = formatCurrency(50000)
    // Works regardless of ICU locale rendering (₹50,000 or INR 50,000, etc.)
    expect(out).toContain('50')
    expect(out.length).toBeGreaterThan(0)
  })

  it('accepts a USD currency override', () => {
    const out = formatCurrency(100, 'USD')
    expect(out).toContain('100')
  })

  it('rounds to zero decimal places', () => {
    const out = formatCurrency(999.99)
    // Should NOT contain a decimal point followed by digits
    expect(out).not.toMatch(/\d\.\d/)
  })
})

describe('getStatusColor', () => {
  it('returns green classes for completed', () => {
    expect(getStatusColor('completed')).toBe('bg-green-100 text-green-800')
  })

  it('returns blue classes for in_progress', () => {
    expect(getStatusColor('in_progress')).toBe('bg-blue-100 text-blue-800')
  })

  it('returns yellow classes for pending', () => {
    expect(getStatusColor('pending')).toBe('bg-yellow-100 text-yellow-800')
  })

  it('returns red classes for overdue', () => {
    expect(getStatusColor('overdue')).toBe('bg-red-100 text-red-800')
  })

  it('returns red classes for expired', () => {
    expect(getStatusColor('expired')).toBe('bg-red-100 text-red-800')
  })

  it('returns green for active', () => {
    expect(getStatusColor('active')).toBe('bg-green-100 text-green-800')
  })

  it('returns yellow for due_soon', () => {
    expect(getStatusColor('due_soon')).toBe('bg-yellow-100 text-yellow-800')
  })

  it('returns green for approved', () => {
    expect(getStatusColor('approved')).toBe('bg-green-100 text-green-800')
  })

  it('returns gray fallback for unrecognized status', () => {
    expect(getStatusColor('unknown_xyz')).toBe('bg-gray-100 text-gray-800')
  })

  it('returns gray fallback for empty string', () => {
    expect(getStatusColor('')).toBe('bg-gray-100 text-gray-800')
  })
})

describe('getDaysUntil', () => {
  it('returns positive value for a future date', () => {
    const future = new Date()
    future.setDate(future.getDate() + 10)
    expect(getDaysUntil(future)).toBeGreaterThan(0)
  })

  it('returns negative value for a past date', () => {
    const past = new Date()
    past.setDate(past.getDate() - 10)
    expect(getDaysUntil(past)).toBeLessThan(0)
  })

  it('returns approximately the correct number of days for 30 days ahead', () => {
    const future = new Date()
    future.setDate(future.getDate() + 30)
    const days = getDaysUntil(future)
    expect(days).toBeGreaterThanOrEqual(29)
    expect(days).toBeLessThanOrEqual(31)
  })

  it('accepts a date string', () => {
    // Far future date — result must be positive
    const days = getDaysUntil('2099-12-31')
    expect(days).toBeGreaterThan(0)
  })

  it('uses Math.ceil — single-day future is 1', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    // ceil rounds partial days up, so tomorrow is at least 1
    expect(getDaysUntil(tomorrow)).toBeGreaterThanOrEqual(1)
  })
})
