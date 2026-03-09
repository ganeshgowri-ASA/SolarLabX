import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function generateId(prefix: string): string {
  const year = new Date().getFullYear()
  const seq = Math.floor(Math.random() * 99999).toString().padStart(5, '0')
  return `${prefix}-${year}-${seq}`
}

export function getDaysUntil(date: Date | string): number {
  const target = new Date(date)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    received: 'bg-blue-100 text-blue-800',
    inspected: 'bg-cyan-100 text-cyan-800',
    allocated: 'bg-indigo-100 text-indigo-800',
    assigned: 'bg-purple-100 text-purple-800',
    in_test: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    analyzed: 'bg-emerald-100 text-emerald-800',
    reported: 'bg-teal-100 text-teal-800',
    rejected: 'bg-red-100 text-red-800',
    on_hold: 'bg-gray-100 text-gray-800',
    pending: 'bg-orange-100 text-orange-800',
    pending_review: 'bg-amber-100 text-amber-800',
    not_started: 'bg-gray-100 text-gray-600',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-200 text-gray-500',
    draft: 'bg-slate-100 text-slate-700',
    approved: 'bg-green-100 text-green-800',
    in_review: 'bg-amber-100 text-amber-800',
    superseded: 'bg-gray-200 text-gray-600',
    obsolete: 'bg-red-50 text-red-600',
    available: 'bg-green-100 text-green-800',
    in_use: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-orange-100 text-orange-800',
    calibration_due: 'bg-red-100 text-red-800',
    out_of_service: 'bg-red-200 text-red-900',
    open: 'bg-red-100 text-red-800',
    closed: 'bg-green-100 text-green-800',
    verified: 'bg-emerald-100 text-emerald-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}
