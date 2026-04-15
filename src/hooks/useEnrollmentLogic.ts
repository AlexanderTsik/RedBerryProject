import { useModal } from './useModal'
import type { User, SessionType } from '../types'
import type { EnrollPayload } from '../api/enrollments'

type EnrollmentUser = User & {
  profile_complete?: boolean
}

export interface EnrollmentLogicResult {
  isProfileComplete: boolean
  canEnroll: boolean
  buttonClickable: boolean
  handleEnroll: (force?: boolean) => void
}

export interface EnrollmentLogicParams {
  isAuthenticated: boolean
  user: EnrollmentUser | null
  selectedSessionType: SessionType | null
  enrollmentPending: boolean
  onProfileIncomplete: () => void
  onEnroll: (payload: EnrollPayload) => void
  courseId: number
}

export function useEnrollmentLogic({
  isAuthenticated,
  user,
  selectedSessionType,
  enrollmentPending,
  onProfileIncomplete,
  onEnroll,
  courseId,
}: EnrollmentLogicParams): EnrollmentLogicResult {
  const { openModal } = useModal()

  const isProfileComplete =
    user?.profileComplete ??
    user?.profile_complete ??
    (!!user?.fullName && !!user?.mobileNumber && user?.age != null)

  const canEnroll =
    isAuthenticated &&
    isProfileComplete &&
    !!selectedSessionType &&
    !enrollmentPending

  const buttonClickable = !enrollmentPending

  const handleEnroll = (force = false) => {
    if (!isAuthenticated) {
      openModal('login')
      return
    }

    if (user && !isProfileComplete) {
      onProfileIncomplete()
      return
    }

    if (!selectedSessionType) return

    onEnroll({
      courseId,
      courseScheduleId: selectedSessionType.courseScheduleId,
      sessionTypeId: selectedSessionType.id,
      ...(force && { force: true }),
    })
  }

  return {
    isProfileComplete,
    canEnroll,
    buttonClickable,
    handleEnroll,
  }
}
