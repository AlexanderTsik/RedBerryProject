type TimeSlotLike = {
  label: string
  startTime?: string
  endTime?: string
}

// Format 24h time as 12h meridiem, e.g. 09:00:00 -> 9:00 AM.
export function formatTime(time: string): string {
  const [hh, mm] = time.split(':').map(Number)
  const suffix = hh >= 12 ? 'PM' : 'AM'
  const h12 = hh % 12 || 12
  return `${h12}:${String(mm).padStart(2, '0')} ${suffix}`
}

// Show a compact slot label: Morning 9:00 AM - 11:00 AM.
export function formatTimeSlotWithHours(slot: TimeSlotLike): string {
  const shortLabel = slot.label.replace(/\s*\(.*\)/, '')
  const rangeFromLabel = slot.label.match(/\(([^)]+)\)/)?.[1]?.trim()

  if (slot.startTime && slot.endTime) {
    return `${shortLabel} ${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`
  }

  if (rangeFromLabel) {
    return `${shortLabel} ${rangeFromLabel}`
  }

  return shortLabel
}
