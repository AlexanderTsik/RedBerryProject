import { apiClient } from './client'

export const submitReview = async (courseId: number, rating: number): Promise<void> => {
  await apiClient.post(`/courses/${courseId}/reviews`, { rating })
}
