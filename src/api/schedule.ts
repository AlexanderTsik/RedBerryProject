import { apiClient } from './client'
import type { WeeklySchedule, TimeSlot, SessionType } from '../types'

export const getWeeklySchedules = async (courseId: number): Promise<WeeklySchedule[]> => {
  const { data } = await apiClient.get<{ data: WeeklySchedule[] }>(
    `/courses/${courseId}/weekly-schedules`,
  )
  return data.data
}

export const getTimeSlots = async (
  courseId: number,
  weeklyScheduleId: number,
): Promise<TimeSlot[]> => {
  const { data } = await apiClient.get<{ data: TimeSlot[] }>(`/courses/${courseId}/time-slots`, {
    params: { weekly_schedule_id: weeklyScheduleId },
  })
  return data.data
}

export const getSessionTypes = async (
  courseId: number,
  weeklyScheduleId: number,
  timeSlotId: number,
): Promise<SessionType[]> => {
  const { data } = await apiClient.get<{ data: SessionType[] }>(
    `/courses/${courseId}/session-types`,
    { params: { weekly_schedule_id: weeklyScheduleId, time_slot_id: timeSlotId } },
  )
  return data.data
}
