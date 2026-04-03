import { apiClient } from './client'
import type { Course, CourseDetail, Enrollment, PaginatedResponse } from '../types'

export interface CoursesParams {
  search?: string
  'categories[]'?: number[]
  'topics[]'?: number[]
  'instructors[]'?: number[]
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'title_asc'
  page?: number
}

export const getCourses = async (params: CoursesParams): Promise<PaginatedResponse<Course>> => {
  const { data } = await apiClient.get<PaginatedResponse<Course>>('/courses', { params })
  return data
}

export const getFeaturedCourses = async (): Promise<Course[]> => {
  const { data } = await apiClient.get<{ data: Course[] }>('/courses/featured')
  return data.data
}

export const getCoursesInProgress = async (): Promise<Enrollment[]> => {
  const { data } = await apiClient.get<{ data: Enrollment[] }>('/courses/in-progress')
  return data.data
}

export const getCourseById = async (id: number): Promise<CourseDetail> => {
  const { data } = await apiClient.get<{ data: CourseDetail }>(`/courses/${id}`)
  return data.data
}
