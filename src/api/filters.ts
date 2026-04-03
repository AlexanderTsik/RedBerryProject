import { apiClient } from './client'
import type { Category, Topic, Instructor } from '../types'

export const getCategories = async (): Promise<Category[]> => {
  const { data } = await apiClient.get<{ data: Category[] }>('/categories')
  return data.data
}

export const getTopics = async (categoryIds?: number[]): Promise<Topic[]> => {
  const { data } = await apiClient.get<{ data: Topic[] }>('/topics', {
    params: categoryIds?.length ? { 'categories[]': categoryIds } : undefined,
  })
  return data.data
}

export const getInstructors = async (): Promise<Instructor[]> => {
  const { data } = await apiClient.get<{ data: Instructor[] }>('/instructors')
  return data.data
}
