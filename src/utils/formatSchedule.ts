import type { EnrollmentSchedule } from '../types'

export type SessionTypeKey = 'online' | 'in_person' | 'hybrid'

export function formatScheduleLabel(schedule: EnrollmentSchedule): string {
  return `${schedule.weeklySchedule.label} · ${schedule.timeSlot.label}`
}

export function normalizeSessionTypeKey(name: string): SessionTypeKey | null {
  const normalized = name.toLowerCase().replace(/[-\s]/g, '_')

  if (normalized === 'online') return 'online'
  if (normalized === 'in_person' || normalized === 'offline') return 'in_person'
  if (normalized === 'hybrid') return 'hybrid'

  return null
}

export function formatSessionTypeLabel(name: string): string {
  const key = normalizeSessionTypeKey(name)

  if (key === 'online') return 'Online'
  if (key === 'in_person') return 'In-Person'
  if (key === 'hybrid') return 'Hybrid'

  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

export function formatSessionType(name: string): string {
  return formatSessionTypeLabel(name)
}
