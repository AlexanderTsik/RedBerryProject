import { apiClient } from './client'
import type { Enrollment } from '../types'

export interface EnrollPayload {
  courseId: number
  courseScheduleId: number
  sessionTypeId: number
  force?: boolean
}

export const getEnrollments = async (): Promise<Enrollment[]> => {
  const { data } = await apiClient.get<{ data: Enrollment[] }>('/enrollments')
  return data.data
}

export const createEnrollment = async (payload: EnrollPayload): Promise<Enrollment> => {
  const { data } = await apiClient.post<{ data: Enrollment }>('/enrollments', payload)
  return data.data
}

export const completeEnrollment = async (enrollmentId: number): Promise<Enrollment> => {
  const { data } = await apiClient.patch<{ data: Enrollment }>(
    `/enrollments/${enrollmentId}/complete`,
  )
  return data.data
}

export const deleteEnrollment = async (enrollmentId: number): Promise<void> => {
  await apiClient.delete(`/enrollments/${enrollmentId}`)
}
