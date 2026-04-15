import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { createEnrollment, completeEnrollment, deleteEnrollment, type EnrollPayload } from '../api/enrollments'
import { submitReview } from '../api/reviews'
import type { Enrollment, ScheduleConflict } from '../types'

interface EnrollmentApiErrorData {
  message?: string
  error?: string
  conflicts?: ScheduleConflict[]
  conflict?: ScheduleConflict
}

export interface EnrollmentMutationsCallbacks {
  onEnrollSuccess: () => void
  onEnrollError: (conflicts: ScheduleConflict[] | null, error: string | null) => void
  onCompleteSuccess: () => void
  onRatingSuccess: () => void
  onRetakeSuccess: () => void
}

export interface EnrollmentMutationsResult {
  enrollMutation: UseMutationResult<Enrollment, unknown, EnrollPayload, unknown>
  completeMutation: UseMutationResult<Enrollment, unknown, number, unknown>
  ratingMutation: UseMutationResult<void, unknown, number, unknown>
  retakeMutation: UseMutationResult<void, unknown, number, unknown>
}

export function useEnrollmentMutations(
  courseId: number,
  callbacks: EnrollmentMutationsCallbacks,
): EnrollmentMutationsResult {
  const queryClient = useQueryClient()

  const enrollMutation = useMutation({
    mutationFn: (payload: EnrollPayload) => createEnrollment(payload),
    onSuccess: () => {
      callbacks.onEnrollSuccess()
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['inProgress'] })
    },
    onError: (error: unknown) => {
      const apiError = error as AxiosError<EnrollmentApiErrorData>

      if (apiError.response?.status === 409) {
        const data = apiError.response.data
        const conflicts =
          data.conflicts || [data.conflict].filter((item): item is ScheduleConflict => Boolean(item))
        callbacks.onEnrollError(conflicts, null)
      } else {
        const msg =
          apiError.response?.data?.message ||
          apiError.response?.data?.error ||
          'Enrollment failed. Please try again.'
        callbacks.onEnrollError(null, msg)
        console.error('Enrollment error:', apiError.response?.data || apiError)
      }
    },
  })

  const completeMutation = useMutation({
    mutationFn: (enrollmentId: number) => completeEnrollment(enrollmentId),
    onSuccess: () => {
      callbacks.onCompleteSuccess()
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
    },
  })

  const ratingMutation = useMutation({
    mutationFn: (rating: number) => submitReview(courseId, rating),
    onSuccess: () => {
      callbacks.onRatingSuccess()
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
    },
  })

  const retakeMutation = useMutation({
    mutationFn: (enrollmentId: number) => deleteEnrollment(enrollmentId),
    onSuccess: () => {
      callbacks.onRetakeSuccess()
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['inProgress'] })
      queryClient.invalidateQueries({ queryKey: ['allTimeSlots', courseId] })
      queryClient.invalidateQueries({ queryKey: ['allSessionTypes', courseId] })
    },
  })

  return {
    enrollMutation,
    completeMutation,
    ratingMutation,
    retakeMutation,
  }
}
