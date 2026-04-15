import { useState, useEffect, useMemo } from 'react'
import type { WeeklySchedule, TimeSlot, SessionType } from '../types'

const DEFAULT_WEEKLY_SCHEDULE_LABELS = [
  'Monday - Wednesday',
  'Tuesday - Thursday',
  'Friday - Saturday',
  'Weekend Only (Saturday - Sunday)',
] as const

function normalizeWeeklyScheduleLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/only/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export interface ScheduleSelectionState {
  selectedSchedule: WeeklySchedule | null
  selectedTimeSlot: TimeSlot | null
  selectedSessionType: SessionType | null
  scheduleOpen: boolean
  timeSlotsOpen: boolean
  sessionTypesOpen: boolean
}

export interface ScheduleSelectionActions {
  setSelectedSchedule: (schedule: WeeklySchedule | null) => void
  setSelectedTimeSlot: (slot: TimeSlot | null) => void
  setSelectedSessionType: (type: SessionType | null) => void
  setScheduleOpen: (open: boolean) => void
  setTimeSlotsOpen: (open: boolean) => void
  setSessionTypesOpen: (open: boolean) => void
}

export interface ScheduleSelectionData {
  availableTimeSlotIds: Set<number>
  currentSessionTypes: SessionType[]
  availableSessionTypeNames: Set<string>
  displayWeeklySchedules: Array<{
    label: string
    schedule: WeeklySchedule | null
    isAvailable: boolean
  }>
}

export function useScheduleSelection(
  weeklySchedules: WeeklySchedule[] | undefined,
  allTimeSlotsMap: Record<number, TimeSlot[]> | undefined,
  allSessionTypesMap: Record<string, SessionType[]> | undefined,
): {
  state: ScheduleSelectionState
  actions: ScheduleSelectionActions
  data: ScheduleSelectionData
} {
  const [selectedSchedule, setSelectedSchedule] = useState<WeeklySchedule | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [selectedSessionType, setSelectedSessionType] = useState<SessionType | null>(null)
  const [scheduleOpen, setScheduleOpenState] = useState(false)
  const [timeSlotsOpen, setTimeSlotsOpenState] = useState(false)
  const [sessionTypesOpen, setSessionTypesOpenState] = useState(false)

  // Wrapper setters that accept both boolean and function (like useState)
  const setScheduleOpen = (value: boolean | ((prev: boolean) => boolean)) => {
    setScheduleOpenState(prev => (typeof value === 'function' ? value(prev) : value))
  }
  const setTimeSlotsOpen = (value: boolean | ((prev: boolean) => boolean)) => {
    setTimeSlotsOpenState(prev => (typeof value === 'function' ? value(prev) : value))
  }
  const setSessionTypesOpen = (value: boolean | ((prev: boolean) => boolean)) => {
    setSessionTypesOpenState(prev => (typeof value === 'function' ? value(prev) : value))
  }

  // Reset downstream selections when upstream changes
  useEffect(() => {
    setSelectedTimeSlot(null)
    setSelectedSessionType(null)
    if (selectedSchedule) {
      setTimeSlotsOpen(true)
      setSessionTypesOpen(false)
    }
  }, [selectedSchedule])

  useEffect(() => {
    setSelectedSessionType(null)
    if (selectedTimeSlot) {
      setSessionTypesOpen(true)
    }
  }, [selectedTimeSlot])

  const availableTimeSlotIds = useMemo<Set<number>>(() => {
    if (!selectedSchedule || !allTimeSlotsMap) return new Set()
    return new Set((allTimeSlotsMap[selectedSchedule.id] || []).map(ts => ts.id))
  }, [selectedSchedule, allTimeSlotsMap])

  const currentSessionTypes = useMemo<SessionType[]>(() => {
    if (!selectedSchedule || !selectedTimeSlot || !allSessionTypesMap) return []
    return allSessionTypesMap[`${selectedSchedule.id}-${selectedTimeSlot.id}`] || []
  }, [selectedSchedule, selectedTimeSlot, allSessionTypesMap])

  const availableSessionTypeNames = useMemo<Set<string>>(() => {
    return new Set(currentSessionTypes.map(st => st.name))
  }, [currentSessionTypes])

  const displayWeeklySchedules = useMemo(() => {
    const availableSchedules = new Map(
      (weeklySchedules ?? []).map(schedule => [normalizeWeeklyScheduleLabel(schedule.label), schedule]),
    )

    return DEFAULT_WEEKLY_SCHEDULE_LABELS.map(label => {
      const matchedSchedule = availableSchedules.get(normalizeWeeklyScheduleLabel(label)) ?? null

      return {
        label,
        schedule: matchedSchedule,
        isAvailable: matchedSchedule !== null,
      }
    })
  }, [weeklySchedules])

  return {
    state: {
      selectedSchedule,
      selectedTimeSlot,
      selectedSessionType,
      scheduleOpen,
      timeSlotsOpen,
      sessionTypesOpen,
    },
    actions: {
      setSelectedSchedule,
      setSelectedTimeSlot,
      setSelectedSessionType,
      setScheduleOpen,
      setTimeSlotsOpen,
      setSessionTypesOpen,
    },
    data: {
      availableTimeSlotIds,
      currentSessionTypes,
      availableSessionTypeNames,
      displayWeeklySchedules,
    },
  }
}
