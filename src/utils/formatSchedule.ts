import type { EnrollmentSchedule } from '../types'

export function formatScheduleLabel(schedule: EnrollmentSchedule): string {
  return `${schedule.weeklySchedule.label} · ${schedule.timeSlot.label}`
}

export function formatSessionType(name: string): string {
  const map: Record<string, string> = {
    online: 'Online',
    offline: 'In-person',
    hybrid: 'Hybrid',
  }
  return map[name] ?? name
}
