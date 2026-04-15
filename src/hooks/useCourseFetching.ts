import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCourseById } from '../api/courses'
import { getWeeklySchedules, getTimeSlots, getSessionTypes } from '../api/schedule'
import type { CourseDetail, SessionType, TimeSlot, WeeklySchedule } from '../types'

export interface CourseFetchingData {
  course: CourseDetail | null
  isLoading: boolean
  weeklySchedules: WeeklySchedule[] | undefined
  allTimeSlotsMap: Record<number, TimeSlot[]> | undefined
  allSessionTypesMap: Record<string, SessionType[]> | undefined
  physicalLocation: string | null | undefined
  uniqueTimeSlots: TimeSlot[]
  uniqueSessionTypes: SessionType[]
}

export function useCourseFetching(courseId: number): CourseFetchingData {
  const { data: course, isLoading } = useQuery<CourseDetail>({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId),
    enabled: !!courseId,
  })

  const { data: weeklySchedules } = useQuery<WeeklySchedule[]>({
    queryKey: ['weeklySchedules', courseId],
    queryFn: () => getWeeklySchedules(courseId),
    enabled: !!courseId && !course?.enrollment,
  })

  const { data: allTimeSlotsMap } = useQuery({
    queryKey: ['allTimeSlots', courseId],
    queryFn: async () => {
      if (!weeklySchedules || !weeklySchedules.length) return {}
      const map: Record<number, TimeSlot[]> = {}
      await Promise.all(
        weeklySchedules.map(async ws => {
          map[ws.id] = await getTimeSlots(courseId, ws.id)
        }),
      )
      return map
    },
    enabled: !!courseId && !!weeklySchedules?.length && !course?.enrollment,
  })

  const { data: physicalLocation } = useQuery({
    queryKey: ['physicalLocation', courseId],
    queryFn: async () => {
      try {
        const schedules = await getWeeklySchedules(courseId)
        if (!schedules.length) return null
        const timeSlots = await getTimeSlots(courseId, schedules[0].id)
        if (!timeSlots.length) return null
        const sessionTypes = await getSessionTypes(courseId, schedules[0].id, timeSlots[0].id)
        return sessionTypes.find(st => st.location)?.location ?? null
      } catch (error) {
        console.error('Error fetching physical location:', error)
        return null
      }
    },
    enabled: !!courseId,
  })

  const { data: allSessionTypesMap } = useQuery({
    queryKey: ['allSessionTypes', courseId],
    queryFn: async () => {
      if (!weeklySchedules?.length || !allTimeSlotsMap) return {}
      const map: Record<string, SessionType[]> = {}
      const combos: { wsId: number; tsId: number }[] = []
      for (const ws of weeklySchedules) {
        for (const ts of allTimeSlotsMap[ws.id] || []) {
          combos.push({ wsId: ws.id, tsId: ts.id })
        }
      }
      await Promise.all(
        combos.map(async ({ wsId, tsId }) => {
          map[`${wsId}-${tsId}`] = await getSessionTypes(courseId, wsId, tsId)
        }),
      )
      return map
    },
    enabled: !!courseId && !!weeklySchedules?.length && !!allTimeSlotsMap && !course?.enrollment,
  })

  const uniqueTimeSlots = useMemo<TimeSlot[]>(() => {
    if (!allTimeSlotsMap) return []
    const seen = new Map<number, TimeSlot>()
    for (const slots of Object.values(allTimeSlotsMap)) {
      for (const ts of slots) {
        if (!seen.has(ts.id)) seen.set(ts.id, ts)
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.id - b.id)
  }, [allTimeSlotsMap])

  const uniqueSessionTypes = useMemo<SessionType[]>(() => {
    if (!allSessionTypesMap) return []
    const seen = new Map<string, SessionType>()
    for (const types of Object.values(allSessionTypesMap)) {
      for (const st of types) {
        if (!seen.has(st.name)) seen.set(st.name, st)
      }
    }
    return Array.from(seen.values())
  }, [allSessionTypesMap])

  return {
    course: course || null,
    isLoading,
    weeklySchedules,
    allTimeSlotsMap: allTimeSlotsMap || undefined,
    allSessionTypesMap: allSessionTypesMap || undefined,
    physicalLocation,
    uniqueTimeSlots,
    uniqueSessionTypes,
  }
}
