import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCourseById } from '../api/courses'
import { getWeeklySchedules, getTimeSlots, getSessionTypes } from '../api/schedule'
import { createEnrollment, completeEnrollment, deleteEnrollment } from '../api/enrollments'
import { submitReview } from '../api/reviews'
import { useAuth } from '../store/AuthContext'
import { useModal } from '../hooks/useModal'
import type { WeeklySchedule, TimeSlot, SessionType, ScheduleConflict } from '../types'

// ─── Icons (SVG as React components) ────────────────────────────────────────
import IconCalendar from '../assets/icons/icon-set/icon-calendar.svg?react'
import IconClock from '../assets/icons/icon-set/icon-clock.svg?react'
import IconStarFill from '../assets/icons/icon-set/icon-star.svg?react'
import IconOne from '../assets/icons/icon-set/icon-one.svg?react'
import IconOneFill from '../assets/icons/icon-set/icon-one-fill.svg?react'
import IconTwo from '../assets/icons/icon-set/icon-two.svg?react'
import IconTwoFill from '../assets/icons/icon-set/icon-two-fill.svg?react'
import IconThree from '../assets/icons/icon-set/icon-three.svg?react'
import IconThreeFill from '../assets/icons/icon-set/icon-three-fill.svg?react'
import IconDesktop from '../assets/icons/icon-set/icon-desktop.svg?react'
import IconUsers from '../assets/icons/icon-set/icon-users.svg?react'
import IconIntersect from '../assets/icons/icon-set/icon-intersect.svg?react'
import IconMapPin from '../assets/icons/icon-set/icon-map-pin.svg?react'
import IconSun from '../assets/icons/icon-set/icon-sun.svg?react'
import IconCloudSun from '../assets/icons/icon-set/icon-cloud-sun.svg?react'
import IconMoon from '../assets/icons/icon-set/icon-moon.svg?react'
import IconDevelopment from '../assets/icons/icon-set/icon-development.svg?react'
import IconDesign from '../assets/icons/icon-set/icon-design.svg?react'
import IconBusiness from '../assets/icons/icon-set/icon-business.svg?react'
import IconDataScience from '../assets/icons/icon-set/icon-data-science.svg?react'
import IconMarketing from '../assets/icons/icon-set/icon-marketing.svg?react'
import IconRetake from '../assets/icons/icon-set/icon-retake.svg?react'
import IconCheck2 from '../assets/icons/icon-set/icon-check-2.svg?react'

// ─── Modal icons ─────────────────────────────────────────────────────────────
import ModalSuccessIcon from '../assets/icons/modal/success-icon.svg?react'
import ModalCompleteIcon from '../assets/icons/modal/complete-icon.svg?react'
import ModalWarningIcon from '../assets/icons/modal/warning-icon.svg?react'
import ModalUserIcon from '../assets/icons/modal/user-icon.svg?react'
import ModalCloseIcon from '../assets/icons/modal/icon-close.svg?react'

// ─── Category icon map ──────────────────────────────────────────────────────
const CATEGORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Development: IconDevelopment,
  Design: IconDesign,
  Business: IconBusiness,
  'Data Science': IconDataScience,
  Marketing: IconMarketing,
}

// ─── Session type icon map ──────────────────────────────────────────────────
const SESSION_TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  online: IconDesktop,
  Online: IconDesktop,
  in_person: IconUsers,
  'In-Person': IconUsers,
  hybrid: IconIntersect,
  Hybrid: IconIntersect,
}

// ─── Time slot icon map ─────────────────────────────────────────────────────
function getTimeSlotIcon(label: string) {
  const l = label.toLowerCase()
  if (l.includes('morning')) return IconCloudSun
  if (l.includes('afternoon')) return IconSun
  if (l.includes('evening') || l.includes('night')) return IconMoon
  return IconClock
}

// ─── Breadcrumb arrow SVG ───────────────────────────────────────────────────
function BreadcrumbArrow() {
  return (
    <svg width="12" height="24" viewBox="61 0 12 28" fill="none" className="shrink-0">
      <path
        d="M61.452 8.58023L62.513 7.52024L68.292 13.2972C68.3851 13.3898 68.4591 13.4999 68.5095 13.6211C68.56 13.7424 68.5859 13.8724 68.5859 14.0037C68.5859 14.1351 68.56 14.2651 68.5095 14.3863C68.4591 14.5076 68.3851 14.6177 68.292 14.7102L62.513 20.4902L61.453 19.4302L66.877 14.0052L61.452 8.58023Z"
        fill="#666666"
      />
    </svg>
  )
}

// ─── Chevron for collapsible sections ───────────────────────────────────────
function ChevronIcon({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      className={`shrink-0 transition-transform ${open ? '' : 'rotate-180'} ${className ?? ''}`}
    >
      <path
        d="M20.445 18.0012L15.151 12.7072C15.029 12.5853 14.884 12.4886 14.725 12.4226C14.566 12.3567 14.395 12.3227 14.222 12.3227C14.05 12.3227 13.879 12.3567 13.72 12.4226C13.561 12.4886 13.416 12.5853 13.294 12.7072L8 18.001"
        stroke="#525252"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Warning icon ───────────────────────────────────────────────────────────
function WarningIcon({ className }: { className?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className={className}>
      <path
        d="M11 1.375C9.09636 1.375 7.23495 1.93949 5.6524 3.00104C4.06984 4.06259 2.83536 5.57359 2.10736 7.34949C1.37936 9.1254 1.19063 11.0857 1.56398 12.977C1.93733 14.8683 2.85573 16.6065 4.20213 17.9529C5.54853 19.2993 7.28669 20.2177 9.17802 20.591C11.0693 20.9644 13.0296 20.7756 14.8055 20.0477C16.5814 19.3197 18.0924 18.0852 19.154 16.5026C20.2155 14.92 20.78 13.0586 20.78 11.155C20.78 8.56106 19.7493 6.07335 17.8979 4.22208C16.0466 2.37082 13.559 1.34 10.965 1.34L11 1.375ZM11 18.5625C11.0001 18.3636 10.9212 18.1729 10.7806 18.0322C10.64 17.8916 10.4493 17.8126 10.2504 17.8125H10.3129C10.5118 17.8125 10.7026 17.8915 10.8432 18.0322C10.9839 18.1728 11.0629 18.3636 11.0629 18.5625C11.0629 18.7614 10.9839 18.9522 10.8432 19.0928C10.7026 19.2335 10.5118 19.3125 10.3129 19.3125C10.514 19.3125 10.7069 19.233 10.8489 19.0908C10.9908 18.9486 11.07 18.7556 11.0696 18.5544L11 18.5625ZM11.6875 14.4375C11.6875 14.6199 11.6151 14.7948 11.486 14.924C11.3568 15.0531 11.1819 15.1255 10.9996 15.1255C10.8172 15.1254 10.6424 15.053 10.5133 14.9238C10.3842 14.7946 10.3119 14.6197 10.312 14.4373V6.1875C10.312 6.00516 10.3844 5.83028 10.5135 5.70116C10.6427 5.57204 10.8176 5.49959 10.9999 5.4996C11.1823 5.49961 11.3571 5.57208 11.4863 5.70122C11.6154 5.83035 11.6878 6.00524 11.6878 6.18758L11.6875 14.4375Z"
        fill="#F4A316"
      />
    </svg>
  )
}

// ─── Arrow right icon ───────────────────────────────────────────────────────
function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="#281ED2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Star rating component ──────────────────────────────────────────────────
function StarRating({
  rating,
  onChange,
  readonly = false,
}: {
  rating: number
  onChange?: (r: number) => void
  readonly?: boolean
}) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex items-center gap-[4px]">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} border-0 bg-transparent p-0`}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M16 2L20.09 10.26L29 11.57L22.5 17.88L24.18 26.77L16 22.49L7.82 26.77L9.5 17.88L3 11.57L11.91 10.26L16 2Z"
              fill={(hover || rating) >= star ? '#DFB300' : '#D1D1D1'}
            />
          </svg>
        </button>
      ))}
    </div>
  )
}

// ─── Format price ───────────────────────────────────────────────────────────
function formatPrice(price: string | number): string {
  const n = typeof price === 'string' ? parseFloat(price) : price
  return `$${Math.floor(n).toLocaleString('en-US')}`
}

// ─── Format 24h time to 12h (e.g. "09:00:00" → "9:00 AM") ─────────────
function formatTime(time: string): string {
  const [hh, mm] = time.split(':').map(Number)
  const suffix = hh >= 12 ? 'PM' : 'AM'
  const h12 = hh % 12 || 12
  return `${h12}:${String(mm).padStart(2, '0')} ${suffix}`
}

// ─── Modal base overlay ──────────────────────────────────────────────────────
function ModalBase({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-[16px] p-[60px] w-[560px] max-w-[90vw] flex flex-col gap-[40px] items-center">
        {children}
      </div>
    </div>
  )
}

// ─── Rating card (Figma: white card, close button, 50px stars) ──────────
function RatingCard({
  pendingRating,
  onRate,
  onSubmit,
  isPending,
}: {
  pendingRating: number
  onRate: (r: number) => void
  onSubmit: () => void
  isPending: boolean
}) {
  const [visible, setVisible] = useState(true)
  const [hover, setHover] = useState(0)

  if (!visible) return null

  return (
    <div className="relative flex flex-col gap-[18px] items-center justify-center bg-white rounded-[8px] px-[50px] py-[40px] w-full">
      {/* Close button */}
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute top-[10px] right-[10px] size-[22px] cursor-pointer border-0 bg-transparent p-0 flex items-center justify-center"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="#525252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <span className="text-[16px] font-medium leading-[24px] text-grey-600 text-center w-full">
        Rate your experience
      </span>

      {/* 50px stars with 18px gap */}
      <div className="flex items-center justify-center gap-[18px] w-full">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => {
              onRate(star)
              onSubmit()
            }}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="cursor-pointer border-0 bg-transparent p-0"
          >
            <svg width="50" height="50" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 2L20.09 10.26L29 11.57L22.5 17.88L24.18 26.77L16 22.49L7.82 26.77L9.5 17.88L3 11.57L11.91 10.26L16 2Z"
                fill={(hover || pendingRating) >= star ? '#DFB300' : '#D1D1D1'}
              />
            </svg>
          </button>
        ))}
      </div>

      {isPending && (
        <span className="text-[14px] font-medium text-grey-400">Submitting...</span>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function CoursePage() {
  const { id } = useParams<{ id: string }>()
  const courseId = Number(id)
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuth()
  const { openModal } = useModal()

  // ── Course data ─────────────────────────────────────────────────────────
  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId),
    enabled: !!courseId,
  })

  // ── Schedule selection state ────────────────────────────────────────────
  const [selectedSchedule, setSelectedSchedule] = useState<WeeklySchedule | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [selectedSessionType, setSelectedSessionType] = useState<SessionType | null>(null)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [timeSlotsOpen, setTimeSlotsOpen] = useState(false)
  const [sessionTypesOpen, setSessionTypesOpen] = useState(false)

  // ── Conflict state ──────────────────────────────────────────────────────
  const [conflicts, setConflicts] = useState<ScheduleConflict[] | null>(null)

  // ── Rating state ────────────────────────────────────────────────────────
  const [pendingRating, setPendingRating] = useState(0)

  // ── Enrollment error state ─────────────────────────────────────────────
  const [enrollError, setEnrollError] = useState<string | null>(null)

  // ── Modal visibility state ─────────────────────────────────────────────
  const [showCompletedModal, setShowCompletedModal] = useState(false)
  const [showEnrolledModal, setShowEnrolledModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [modalRating, setModalRating] = useState(0)
  const [modalRatingHover, setModalRatingHover] = useState(0)

  // ── Weekly schedules query ──────────────────────────────────────────────
  const { data: weeklySchedules } = useQuery({
    queryKey: ['weeklySchedules', courseId],
    queryFn: () => getWeeklySchedules(courseId),
    enabled: !!courseId && !course?.enrollment,
  })

  // ── Fetch ALL time slots for ALL weekly schedules ─────────────────────
  const { data: allTimeSlotsMap } = useQuery({
    queryKey: ['allTimeSlots', courseId],
    queryFn: async () => {
      const map: Record<number, TimeSlot[]> = {}
      await Promise.all(
        weeklySchedules!.map(async ws => {
          map[ws.id] = await getTimeSlots(courseId, ws.id)
        }),
      )
      return map
    },
    enabled: !!courseId && !!weeklySchedules?.length && !course?.enrollment,
  })

  // ── Fetch physical location (always — find the in-person/hybrid address) ─
  const { data: physicalLocationData } = useQuery({
    queryKey: ['physicalLocation', courseId],
    queryFn: async () => {
      const schedules = await getWeeklySchedules(courseId)
      if (!schedules.length) return null
      const timeSlots = await getTimeSlots(courseId, schedules[0].id)
      if (!timeSlots.length) return null
      const sessionTypes = await getSessionTypes(courseId, schedules[0].id, timeSlots[0].id)
      return sessionTypes.find(st => st.location)?.location ?? null
    },
    enabled: !!courseId,
  })

  // ── Fetch ALL session types for ALL schedule + timeslot combos ────────
  const { data: allSessionTypesMap } = useQuery({
    queryKey: ['allSessionTypes', courseId],
    queryFn: async () => {
      const map: Record<string, SessionType[]> = {}
      const combos: { wsId: number; tsId: number }[] = []
      for (const ws of weeklySchedules!) {
        for (const ts of allTimeSlotsMap![ws.id] || []) {
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

  // ── Derive unique time slots (deduplicated by id) ─────────────────────
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

  // ── Derive which time slot IDs are available for the selected schedule ─
  const availableTimeSlotIds = useMemo<Set<number>>(() => {
    if (!selectedSchedule || !allTimeSlotsMap) return new Set()
    return new Set((allTimeSlotsMap[selectedSchedule.id] || []).map(ts => ts.id))
  }, [selectedSchedule, allTimeSlotsMap])

  // ── Derive unique session types (deduplicated by name) ────────────────
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

  // ── Derive the actual session type data for the current ws+ts combo ───
  const currentSessionTypes = useMemo<SessionType[]>(() => {
    if (!selectedSchedule || !selectedTimeSlot || !allSessionTypesMap) return []
    return allSessionTypesMap[`${selectedSchedule.id}-${selectedTimeSlot.id}`] || []
  }, [selectedSchedule, selectedTimeSlot, allSessionTypesMap])

  const availableSessionTypeNames = useMemo<Set<string>>(() => {
    return new Set(currentSessionTypes.map(st => st.name))
  }, [currentSessionTypes])

  // ── Reset downstream selections when upstream changes ─────────────────
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

  // ── Enroll mutation ─────────────────────────────────────────────────────
  const enrollMutation = useMutation({
    mutationFn: (payload: { courseId: number; courseScheduleId: number; sessionTypeId: number; force?: boolean }) =>
      createEnrollment(payload),
    onSuccess: () => {
      setConflicts(null)
      setEnrollError(null)
      setShowEnrolledModal(true)
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['inProgress'] })
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        const data = error.response.data
        setConflicts(data.conflicts || [data.conflict].filter(Boolean))
      } else {
        const msg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Enrollment failed. Please try again.'
        setEnrollError(msg)
        console.error('Enrollment error:', error.response?.data || error)
      }
    },
  })

  // ── Complete mutation ───────────────────────────────────────────────────
  const completeMutation = useMutation({
    mutationFn: (enrollmentId: number) => completeEnrollment(enrollmentId),
    onSuccess: () => {
      setModalRating(0)
      setShowCompletedModal(true)
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
    },
  })

  // ── Rating mutation ─────────────────────────────────────────────────────
  const ratingMutation = useMutation({
    mutationFn: (rating: number) => submitReview(courseId, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
    },
  })

  // ── Retake (delete enrollment) mutation ────────────────────────────────
  const retakeMutation = useMutation({
    mutationFn: (enrollmentId: number) => deleteEnrollment(enrollmentId),
    onSuccess: () => {
      // Reset selections and refresh course data to go back to schedule selection
      setSelectedSchedule(null)
      setSelectedTimeSlot(null)
      setSelectedSessionType(null)
      setScheduleOpen(false)
      setTimeSlotsOpen(false)
      setSessionTypesOpen(false)
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['inProgress'] })
      queryClient.invalidateQueries({ queryKey: ['allTimeSlots', courseId] })
      queryClient.invalidateQueries({ queryKey: ['allSessionTypes', courseId] })
    },
  })

  // ── Enroll handler ──────────────────────────────────────────────────────
  const handleEnroll = (force = false) => {
    if (!isAuthenticated) {
      openModal('login')
      return
    }
    // Determine profile completeness — check field directly, fallback to computing from fields
    const isProfileComplete =
      user?.profileComplete ??
      (user as any)?.profile_complete ??
      (!!user?.fullName && !!user?.mobileNumber && user?.age != null)

    if (user && !isProfileComplete) {
      setShowProfileModal(true)
      return
    }
    if (!selectedSessionType) return

    setEnrollError(null)
    enrollMutation.mutate({
      courseId,
      courseScheduleId: selectedSessionType.courseScheduleId,
      sessionTypeId: selectedSessionType.id,
      ...(force && { force: true }),
    })
  }

  // ── Loading state ───────────────────────────────────────────────────────
  if (isLoading || !course) {
    return (
      <div className="layout-frame flex flex-col gap-[32px] py-[40px]">
        <div className="animate-pulse flex flex-col gap-[24px]">
          <div className="h-[20px] w-[200px] bg-grey-200 rounded" />
          <div className="h-[48px] w-[500px] bg-grey-200 rounded" />
          <div className="flex gap-[48px]">
            <div className="flex-1">
              <div className="h-[400px] bg-grey-200 rounded-[10px]" />
            </div>
            <div className="w-[530px] shrink-0">
              <div className="h-[600px] bg-grey-100 rounded-[12px]" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const enrollment = course.enrollment
  const isEnrolled = !!enrollment
  const isCompleted = enrollment?.progress === 100
  // Physical location: always the in-person/hybrid address, regardless of session type chosen
  const physicalLocation = physicalLocationData ?? null
  const CatIcon = CATEGORY_ICON[course.category.name]

  // Compute avg rating from reviews if not provided directly
  const avgRating =
    course.avgRating ??
    (course.reviews.length > 0
      ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
      : null)

  // Use hours from API if available, otherwise estimate
  const hours = (course as any).hours ?? course.durationWeeks * 10

  // Profile completeness — handle both camelCase and snake_case API responses
  const isProfileComplete =
    user?.profileComplete ??
    (user as any)?.profile_complete ??
    (!!user?.fullName && !!user?.mobileNumber && user?.age != null)

  // canEnroll = button is fully actionable (shows active style)
  const canEnroll =
    isAuthenticated &&
    isProfileComplete &&
    !!selectedSessionType &&
    !enrollMutation.isPending

  // buttonClickable = button should be clickable (shows pointer, triggers handleEnroll)
  const buttonClickable = !enrollMutation.isPending

  const totalPrice =
    Number(course.basePrice) + Number(selectedSessionType?.priceModifier ?? 0)

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="layout-frame flex flex-col gap-[24px] py-[40px]">
      {/* Breadcrumbs + Title */}
      <div className="flex flex-col gap-[32px] items-start w-full">
        <nav className="flex items-center gap-[2px]">
          <div className="flex items-center gap-[4px] px-[4px] py-[2px]">
            <Link to="/" className="text-[18px] font-medium leading-normal text-grey-500 no-underline hover:text-primary transition-colors whitespace-nowrap">
              Home
            </Link>
            <BreadcrumbArrow />
          </div>
          <div className="flex items-center gap-[4px] px-[4px] py-[2px]">
            <Link to="/courses" className="text-[18px] font-medium leading-normal text-grey-500 no-underline hover:text-primary transition-colors whitespace-nowrap">
              Browse
            </Link>
            <BreadcrumbArrow />
          </div>
          <div className="flex items-center gap-[4px] px-[4px] py-[2px]">
            <span className="text-[18px] font-medium leading-normal text-primary whitespace-nowrap">
              {course.category.name}
            </span>
          </div>
        </nav>

        <h1 className="text-[40px] font-semibold leading-normal text-grey-900 w-full">
          {course.title}
        </h1>
      </div>

      {/* Main layout: left (course info) + right (schedule/enrolled) */}
      <div className="flex gap-[48px] items-start">
        {/* ═══ LEFT COLUMN ═══ */}
        <div className="flex-1 flex flex-col gap-[18px] items-start min-w-0">
          {/* Image + meta */}
          <div className="flex flex-col gap-[16px] items-start w-full">
            {/* Course image */}
            <div className="w-full rounded-[10px] overflow-hidden shrink-0" style={{ aspectRatio: '897 / 471' }}>
              {course.image ? (
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover rounded-[10px]"
                />
              ) : (
                <div className="w-full h-full bg-primary-50 rounded-[10px]" />
              )}
            </div>

            {/* Meta row: weeks, hours | rating | category */}
            <div className="flex gap-[16px] items-center w-full">
              <div className="flex flex-1 items-center justify-between min-w-0">
                <div className="flex gap-[12px] items-center">
                  <div className="flex gap-[4px] items-center">
                    <IconCalendar className="size-[24px] shrink-0" />
                    <span className="text-[14px] font-medium leading-normal text-grey-600 whitespace-nowrap">
                      {course.durationWeeks} Weeks
                    </span>
                  </div>
                  <div className="flex gap-[4px] items-center">
                    <IconClock className="size-[24px] shrink-0" />
                    <span className="text-[14px] font-medium leading-normal text-grey-600 whitespace-nowrap">
                      {hours} Hours
                    </span>
                  </div>
                </div>
                <div className="flex gap-[4px] items-center">
                  {avgRating != null && (
                    <div className="flex items-center gap-[4px]">
                      <IconStarFill className="size-[26px] shrink-0" />
                      <span className="text-[14px] font-medium leading-[1.5] text-grey-600 whitespace-nowrap">
                        {avgRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {/* Category chip */}
              <div className="flex items-center justify-center gap-[10px] bg-white rounded-[12px] px-[12px] py-[8px] shrink-0 h-[39px]">
                {CatIcon && <CatIcon className="size-[24px] shrink-0" />}
                <span className="text-[16px] font-medium leading-[24px] text-grey-500 whitespace-nowrap text-center">
                  {course.category.name}
                </span>
              </div>
            </div>
          </div>

          {/* Instructor chip + description */}
          <div className="flex flex-col gap-[18px] items-start w-full">
            {/* Instructor */}
            <div className="flex items-center gap-[12px] bg-white rounded-[12px] px-[12px] py-[8px]">
              {course.instructor.avatar ? (
                <img
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  className="size-[30px] rounded-[4px] object-cover shrink-0"
                />
              ) : (
                <div className="size-[30px] rounded-[4px] bg-primary-100 shrink-0" />
              )}
              <span className="text-[16px] font-medium leading-[24px] text-grey-500 whitespace-nowrap">
                {course.instructor.name}
              </span>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-[24px] items-start w-full">
              <h3 className="text-[20px] font-semibold leading-[24px] text-grey-400">
                Course Description
              </h3>
              <div className="text-[16px] font-medium leading-[24px] text-grey-600 w-full whitespace-pre-line">
                {course.description}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT COLUMN (530px) ═══ */}
        <div className="w-[530px] shrink-0 flex flex-col gap-[12px] items-start self-start sticky top-[24px]">
          {/* ── Not enrolled: schedule selection ─────────────────────────── */}
          {!isEnrolled && (
            <>
              <div className="flex flex-col gap-[32px] items-start w-full">
                {/* ─ Weekly Schedule ─ */}
                <div className="flex flex-col gap-[18px] items-start w-full">
                  <button
                    type="button"
                    onClick={() => setScheduleOpen(prev => !prev)}
                    className="flex items-center justify-between w-full cursor-pointer border-0 bg-transparent p-0"
                  >
                    <div className="flex gap-[8px] items-center">
                      {selectedSchedule ? (
                        <IconOneFill className="size-[28px] shrink-0" />
                      ) : (
                        <IconOne className="size-[28px] shrink-0" />
                      )}
                      <span className={`text-[24px] font-semibold leading-normal whitespace-nowrap ${selectedSchedule ? 'text-primary-800' : 'text-grey-400'}`}>
                        Weekly Schedule
                      </span>
                    </div>
                    <ChevronIcon open={scheduleOpen} />
                  </button>

                  {scheduleOpen && weeklySchedules && (
                    <div className="flex gap-[12px] items-center w-full">
                      {weeklySchedules.map(ws => {
                        const isSelected = selectedSchedule?.id === ws.id
                        return (
                          <button
                            key={ws.id}
                            type="button"
                            onClick={() => setSelectedSchedule(isSelected ? null : ws)}
                            className={`flex flex-1 items-center justify-center h-[91px] rounded-[12px] border border-solid p-[10px] cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-primary-50 border-primary text-primary'
                                : 'bg-white border-grey-200 text-grey-800 hover:border-grey-300'
                            }`}
                          >
                            <span className="text-[16px] font-semibold leading-normal text-center">
                              {ws.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* ─ Time Slot ─ */}
                <div className="flex flex-col gap-[18px] items-start w-full">
                  <button
                    type="button"
                    onClick={() => setTimeSlotsOpen(prev => !prev)}
                    className="flex items-center justify-between w-full cursor-pointer border-0 bg-transparent p-0"
                  >
                    <div className="flex gap-[8px] items-center">
                      {selectedTimeSlot ? (
                        <IconTwoFill className="size-[28px] shrink-0" />
                      ) : (
                        <IconTwo className="size-[28px] shrink-0" />
                      )}
                      <span className={`text-[24px] font-semibold leading-normal whitespace-nowrap ${selectedTimeSlot ? 'text-primary-800' : 'text-grey-400'}`}>
                        Time Slot
                      </span>
                    </div>
                    <ChevronIcon open={timeSlotsOpen} />
                  </button>

                  {timeSlotsOpen && uniqueTimeSlots.length > 0 && (
                    <div className="flex gap-[12px] items-center w-full">
                      {uniqueTimeSlots.map(ts => {
                        const isAvailable = availableTimeSlotIds.has(ts.id)
                        const isDisabled = !selectedSchedule || !isAvailable
                        const isSelected = selectedTimeSlot?.id === ts.id
                        const SlotIcon = getTimeSlotIcon(ts.label)
                        // Extract short label (e.g. "Morning" from "Morning (9:00 AM - 11:00 AM)")
                        const shortLabel = ts.label.replace(/\s*\(.*\)/, '')
                        return (
                          <button
                            key={ts.id}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => setSelectedTimeSlot(isSelected ? null : ts)}
                            className={`flex flex-1 flex-col items-center justify-center gap-[4px] rounded-[12px] border border-solid p-[16px] transition-colors ${
                              isDisabled
                                ? 'bg-grey-100 border-grey-200 cursor-not-allowed'
                                : isSelected
                                  ? 'bg-primary-50 border-primary cursor-pointer'
                                  : 'bg-white border-grey-200 cursor-pointer hover:border-grey-300'
                            }`}
                          >
                            <SlotIcon className={`size-[24px] shrink-0 ${isDisabled ? 'opacity-40' : ''}`} />
                            <span className={`text-[16px] font-semibold leading-normal ${isDisabled ? 'text-grey-300' : isSelected ? 'text-primary' : 'text-grey-800'}`}>
                              {shortLabel}
                            </span>
                            <span className={`text-[12px] font-medium leading-normal ${isDisabled ? 'text-grey-300' : isSelected ? 'text-primary-600' : 'text-grey-400'}`}>
                              {formatTime(ts.startTime)} – {formatTime(ts.endTime)}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* ─ Session Type ─ */}
                <div className="flex flex-col gap-[18px] items-start w-full">
                  <button
                    type="button"
                    onClick={() => setSessionTypesOpen(prev => !prev)}
                    className="flex items-center justify-between w-full cursor-pointer border-0 bg-transparent p-0"
                  >
                    <div className="flex gap-[8px] items-center">
                      {selectedSessionType ? (
                        <IconThreeFill className="size-[28px] shrink-0" />
                      ) : (
                        <IconThree className="size-[28px] shrink-0" />
                      )}
                      <span className={`text-[24px] font-semibold leading-normal whitespace-nowrap ${selectedSessionType ? 'text-primary-800' : 'text-grey-400'}`}>
                        Session Type
                      </span>
                    </div>
                    <ChevronIcon open={sessionTypesOpen} />
                  </button>

                  {sessionTypesOpen && uniqueSessionTypes.length > 0 && (
                    <div className="flex flex-col gap-[12px] w-full">
                      <div className="flex gap-[12px] items-start w-full">
                        {uniqueSessionTypes.map(st => {
                          // Find the actual live data for this session type in the current combo
                          const liveData = currentSessionTypes.find(c => c.name === st.name)
                          const isAvailable = availableSessionTypeNames.has(st.name)
                          const isFullyBooked = liveData ? liveData.availableSeats === 0 : false
                          const isDisabled = !selectedTimeSlot || !isAvailable || isFullyBooked
                          const isSelected = selectedSessionType?.name === st.name
                          const isLowSeats = liveData ? liveData.availableSeats > 0 && liveData.availableSeats < 5 : false
                          // Use the live data for dynamic values when available, otherwise fallback to generic
                          const displayData = liveData || st
                          const TypeIcon = SESSION_TYPE_ICON[st.name] || IconDesktop
                          // Capitalize name: "online" → "Online", "in_person" → "In-Person"
                          const displayName = st.name
                            .replace(/_/g, '-')
                            .replace(/\b\w/g, c => c.toUpperCase())
                            .replace('In-person', 'In-Person')

                          return (
                            <div key={st.name} className="flex flex-col items-center gap-[8px] flex-1 min-w-0">
                              <button
                                type="button"
                                disabled={isDisabled}
                                onClick={() => {
                                  if (liveData) {
                                    setSelectedSessionType(isSelected ? null : liveData)
                                  }
                                }}
                                className={`flex flex-col items-center justify-center gap-[8px] w-full rounded-[12px] border border-solid p-[20px] transition-colors ${
                                  isDisabled
                                    ? 'bg-grey-100 border-grey-200 cursor-not-allowed opacity-60'
                                    : isSelected
                                      ? 'bg-primary-50 border-primary cursor-pointer'
                                      : 'bg-white border-grey-200 cursor-pointer hover:border-grey-300'
                                }`}
                              >
                                <TypeIcon className="size-[24px] shrink-0" />
                                <span className={`text-[16px] font-semibold leading-normal ${isDisabled ? 'text-grey-400' : isSelected ? 'text-primary' : 'text-grey-800'}`}>
                                  {displayName}
                                </span>
                                {st.name === 'online' ? (
                                  <div className="flex items-center justify-center gap-[2px] w-full">
                                    <span className={`text-[12px] font-normal leading-normal ${isDisabled ? 'text-grey-300' : 'text-grey-600'}`}>
                                      Google Meet
                                    </span>
                                  </div>
                                ) : (displayData.location || physicalLocation) ? (
                                  <div className="flex items-center gap-[2px]">
                                    <IconMapPin className="size-[14px] shrink-0" />
                                    <span className={`text-[12px] font-normal leading-normal ${isDisabled ? 'text-grey-300' : 'text-grey-600'}`}>
                                      {displayData.location || physicalLocation}
                                    </span>
                                  </div>
                                ) : null}
                                <span className={`text-[14px] font-medium leading-normal ${
                                  isDisabled ? 'text-grey-400' : isSelected ? 'text-primary' : 'text-primary-400'
                                }`}>
                                  {Number(displayData.priceModifier) === 0
                                    ? 'Included'
                                    : `+ $${Math.floor(Number(displayData.priceModifier))}`}
                                </span>
                              </button>
                              {/* Seats info */}
                              {liveData && isAvailable && (
                                <span className={`text-[12px] font-medium leading-normal whitespace-nowrap ${
                                  isFullyBooked
                                    ? 'text-grey-400'
                                    : isLowSeats
                                      ? 'text-warning'
                                      : 'text-grey-500'
                                }`}>
                                  {isFullyBooked ? (
                                    'No Seats Available'
                                  ) : isLowSeats ? (
                                    <span className="flex items-center gap-[4px]">
                                      <WarningIcon className="size-[16px]" />
                                      Only {liveData.availableSeats} Seats Remaining
                                    </span>
                                  ) : (
                                    `${liveData.availableSeats} Seats Available`
                                  )}
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

              {/* ─ Price Card ─ */}
              <div className="bg-white border border-grey-100 rounded-[12px] p-[40px] w-full">
                <div className="flex flex-col gap-[32px] items-start w-full">
                  <div className="flex flex-col gap-[32px] items-center justify-center w-full">
                    {/* Total price row */}
                    <div className="flex gap-[24px] items-center w-full">
                      <span className="flex-1 text-[20px] font-semibold leading-[24px] text-grey-400">
                        Total Price
                      </span>
                      <span className="flex-1 text-[32px] font-semibold leading-normal text-grey-800 text-right">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                    {/* Breakdown */}
                    <div className="flex flex-col gap-[12px] items-start pr-[4px] w-full">
                      <div className="flex gap-[24px] items-center w-full">
                        <span className="flex-1 text-[16px] font-medium leading-[24px] text-grey-400">
                          Base Price
                        </span>
                        <span className="flex-1 text-[16px] font-medium leading-[24px] text-grey-800 text-right">
                          + {formatPrice(course.basePrice)}
                        </span>
                      </div>
                      <div className="flex gap-[24px] items-center w-full">
                        <span className="flex-1 text-[16px] font-medium leading-[24px] text-grey-400">
                          Session Type
                        </span>
                        <span className="flex-1 text-[16px] font-medium leading-[24px] text-grey-800 text-right">
                          + ${Math.floor(Number(selectedSessionType?.priceModifier ?? 0))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Enroll button — always clickable so modals can fire */}
                  <button
                    type="button"
                    disabled={!buttonClickable}
                    onClick={() => handleEnroll()}
                    className={`flex items-center justify-center h-[63px] rounded-[12px] w-full p-[10px] border-0 transition-colors ${
                      canEnroll
                        ? 'bg-primary cursor-pointer hover:bg-primary-600'
                        : buttonClickable
                          ? 'bg-primary-50 cursor-pointer hover:bg-primary-100'
                          : 'bg-primary-50 cursor-not-allowed'
                    }`}
                  >
                    <span className={`text-[20px] font-semibold leading-[24px] ${canEnroll ? 'text-white' : 'text-primary-200'}`}>
                      {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
                    </span>
                  </button>
                </div>
              </div>
              </div>

              {/* ─ Enrollment error message ─ */}
              {enrollError && (
                <div className="flex items-center gap-[8px] p-[16px] bg-error/5 border border-error/20 rounded-[12px] w-full">
                  <WarningIcon className="size-[22px] shrink-0" />
                  <span className="text-[14px] font-medium text-error">{enrollError}</span>
                </div>
              )}

              {/* ─ Unauthenticated warning banner ─ */}
              {!isAuthenticated && (
                <div className="flex items-center justify-between p-[20px] bg-[#F8FAFC] border border-[#E5E7EB] rounded-[12px] w-full">
                  <div className="flex flex-col gap-[8px] items-start w-[351px] shrink-0">
                    <div className="flex items-center gap-[6px]">
                      <ModalWarningIcon className="size-[22px] shrink-0" />
                      <span className="text-[16px] font-medium leading-[24px] text-grey-800">
                        Authentication Required
                      </span>
                    </div>
                    <p className="text-[12px] font-normal leading-normal text-grey-400 w-[283px]">
                      You need sign in to your profile before enrolling in this course.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openModal('login')}
                    className="flex items-center justify-center gap-[6px] bg-primary-50 border border-primary-200 rounded-[8px] px-[12px] py-[10px] cursor-pointer shrink-0"
                  >
                    <span className="text-[14px] font-normal leading-[26px] text-primary-800 whitespace-nowrap">
                      Sign In
                    </span>
                    <ArrowRightIcon />
                  </button>
                </div>
              )}

              {/* ─ Profile incomplete warning ─ */}
              {isAuthenticated && user && !isProfileComplete && (
                <div className="flex items-center justify-between p-[20px] bg-[#F8FAFC] border border-[#E5E7EB] rounded-[12px] w-full">
                  <div className="flex flex-col gap-[8px] items-start w-[351px]">
                    <div className="flex items-center gap-[6px]">
                      <WarningIcon className="size-[22px] shrink-0" />
                      <span className="text-[16px] font-medium leading-[24px] text-grey-800">
                        Complete Your Profile
                      </span>
                    </div>
                    <p className="text-[12px] font-normal leading-normal text-grey-400">
                      You need to fill in your profile details before enrolling in this course.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openModal('profile')}
                    className="flex items-center justify-center gap-[6px] bg-primary-50 border border-primary-200 rounded-[8px] px-[12px] py-[10px] cursor-pointer shrink-0"
                  >
                    <span className="text-[14px] font-normal leading-[26px] text-primary-600 whitespace-nowrap">
                      Complete
                    </span>
                    <ArrowRightIcon />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── Enrolled state ───────────────────────────────────────────── */}
          {isEnrolled && enrollment && (
            <div className="flex flex-col items-start w-full">
              <div className="flex flex-col gap-[22px] items-start w-full">
                {/* Status badge — Enrolled (purple) or Completed (green) */}
                {isCompleted ? (
                  <div className="inline-flex items-center justify-center bg-success-light rounded-[100px] p-[16px]">
                    <span className="text-[20px] font-semibold leading-[24px] text-success whitespace-nowrap">
                      Completed
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center justify-center bg-[rgba(115,107,234,0.1)] rounded-[100px] p-[16px]">
                    <span className="text-[20px] font-semibold leading-[24px] text-primary-400 whitespace-nowrap">
                      Enrolled
                    </span>
                  </div>
                )}

                {/* Schedule info with icons */}
                {enrollment.schedule && (
                  <>
                    {enrollment.schedule.weeklySchedule && (
                      <div className="flex items-center gap-[12px]">
                        <IconCalendar className="size-[24px] shrink-0" />
                        <span className="text-[20px] font-medium leading-normal text-grey-600">
                          {enrollment.schedule.weeklySchedule.label}
                        </span>
                      </div>
                    )}
                    {enrollment.schedule.timeSlot && (
                      <div className="flex items-center gap-[12px]">
                        <IconClock className="size-[24px] shrink-0" />
                        <span className="text-[20px] font-medium leading-normal text-grey-600">
                          {enrollment.schedule.timeSlot.label}
                        </span>
                      </div>
                    )}
                    {(() => {
                      const stName = enrollment.schedule.sessionType.name
                      const StIcon = SESSION_TYPE_ICON[stName] || IconDesktop
                      const displayName = stName
                        .replace(/_/g, '-')
                        .replace(/\b\w/g, c => c.toUpperCase())
                        .replace('In-person', 'In-Person')
                      return (
                        <div className="flex items-center gap-[12px]">
                          <StIcon className="size-[24px] shrink-0" />
                          <span className="text-[20px] font-medium leading-normal text-grey-600">
                            {displayName}
                          </span>
                        </div>
                      )
                    })()}
                    {/* Location — physical address or "Google Meet" for online */}
                    <div className="flex items-center gap-[12px]">
                      <IconMapPin className="size-[24px] shrink-0" />
                      <span className="text-[20px] font-medium leading-normal text-grey-600">
                        {physicalLocation ?? 'Google Meet'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Progress + Buttons section (gap-[40px] from schedule info) */}
              <div className="flex flex-col gap-[40px] items-start w-full mt-[48px]">
                {/* Progress section */}
                <div className="flex flex-col gap-[12px] items-center justify-center w-full">
                  <div className="flex flex-col justify-center w-full">
                    <span className="text-[20px] font-semibold leading-[24px] text-grey-500">
                      {enrollment.progress}% Complete
                    </span>
                  </div>
                  <div className="relative w-full h-[24px] rounded-[30px] bg-primary-100">
                    <div
                      className="absolute inset-y-0 left-0 rounded-[30px] bg-primary transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, enrollment.progress))}%` }}
                    />
                  </div>
                </div>

                {/* Not completed: Complete Course button */}
                {!isCompleted && (
                  <button
                    type="button"
                    onClick={() => completeMutation.mutate(enrollment.id)}
                    disabled={completeMutation.isPending}
                    className="flex items-center justify-center gap-[10px] w-full rounded-[8px] px-[25px] py-[17px] border-0 bg-primary cursor-pointer hover:bg-primary-600 transition-colors"
                  >
                    <span className="text-[20px] font-medium leading-normal text-white">
                      {completeMutation.isPending ? 'Completing...' : 'Complete Course'}
                    </span>
                    {!completeMutation.isPending && (
                      <IconCheck2
                        className="size-[24px] shrink-0"
                        style={{ '--fill-0': '#FFFFFF', '--stroke-0': '#FFFFFF' } as React.CSSProperties}
                        aria-hidden
                      />
                    )}
                  </button>
                )}

                {/* Completed: Retake button (above rating) */}
                {isCompleted && (
                  <button
                    type="button"
                    onClick={() => retakeMutation.mutate(enrollment.id)}
                    disabled={retakeMutation.isPending}
                    className="flex items-center justify-center gap-[10px] w-full rounded-[8px] px-[25px] py-[17px] border-0 bg-primary cursor-pointer hover:bg-primary-600 transition-colors"
                  >
                    <span className="text-[20px] font-medium leading-normal text-white">
                      {retakeMutation.isPending ? 'Retaking...' : 'Retake Course'}
                    </span>
                    <IconRetake className="size-[24px] shrink-0 [&_path]:fill-white" />
                  </button>
                )}
              </div>

              {/* Completed: Rating section (separate card below) */}
              {isCompleted && (
                <div className="mt-[39px] w-full">
                  {!course.isRated ? (
                    <RatingCard
                      pendingRating={pendingRating}
                      onRate={setPendingRating}
                      onSubmit={() => ratingMutation.mutate(pendingRating)}
                      isPending={ratingMutation.isPending}
                    />
                  ) : (
                    <div className="flex items-center justify-center gap-[8px] w-full bg-white rounded-[8px] px-[50px] py-[40px]">
                      <IconStarFill className="size-[24px]" />
                      <span className="text-[16px] font-medium text-grey-600">
                        You've already rated this course.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Congratulations Modal (after completing course) ─────────────── */}
      {showCompletedModal && (
        <ModalBase onClose={() => setShowCompletedModal(false)}>
          <div className="flex flex-col gap-[24px] items-center justify-center w-full">
            <ModalSuccessIcon className="size-[94px] shrink-0" />
            <div className="flex flex-col gap-[24px] items-center text-center w-full">
              <h2 className="text-[32px] font-semibold leading-normal text-grey-700 w-full">
                Congratulations!
              </h2>
              <p className="text-[20px] font-medium leading-normal text-grey-700 w-full">
                You've completed{' '}
                <span className="font-semibold">"{course.title}"</span>{' '}
                Course!
              </p>
            </div>
            {/* Star rating in modal */}
            {!course.isRated && (
              <div className="flex flex-col gap-[18px] items-center w-full">
                <span className="text-[16px] font-medium leading-[24px] text-primary-400 text-center">
                  Rate your experience
                </span>
                <div className="flex items-center justify-center gap-[18px]">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      disabled={ratingMutation.isPending}
                      onClick={() => {
                        setModalRating(star)
                        ratingMutation.mutate(star)
                      }}
                      onMouseEnter={() => setModalRatingHover(star)}
                      onMouseLeave={() => setModalRatingHover(0)}
                      className="cursor-pointer border-0 bg-transparent p-0"
                    >
                      <svg width="46" height="46" viewBox="0 0 32 32" fill="none">
                        <path
                          d="M16 2L20.09 10.26L29 11.57L22.5 17.88L24.18 26.77L16 22.49L7.82 26.77L9.5 17.88L3 11.57L11.91 10.26L16 2Z"
                          fill={(modalRatingHover || modalRating) >= star ? '#DFB300' : '#D1D1D1'}
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowCompletedModal(false)}
            className="flex items-center justify-center w-full bg-primary rounded-[8px] px-[25px] py-[17px] border-0 cursor-pointer hover:bg-primary-600 transition-colors"
          >
            <span className="text-[16px] font-medium leading-[24px] text-white">Done</span>
          </button>
        </ModalBase>
      )}

      {/* ── Enrollment Confirmed Modal ──────────────────────────────────── */}
      {showEnrolledModal && (
        <ModalBase onClose={() => setShowEnrolledModal(false)}>
          <div className="flex flex-col gap-[24px] items-center justify-center w-full">
            <ModalCompleteIcon className="size-[94px] shrink-0" />
            <div className="flex flex-col gap-[24px] items-center text-center w-full">
              <h2 className="text-[32px] font-semibold leading-normal text-grey-700 w-full">
                Enrollment Confirmed!
              </h2>
              <p className="text-[20px] font-medium leading-normal text-grey-700 w-full">
                You've successfully enrolled to the{' '}
                <span className="font-semibold">"{course.title}"</span>{' '}
                Course!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowEnrolledModal(false)}
            className="flex items-center justify-center w-full bg-primary rounded-[8px] px-[25px] py-[17px] border-0 cursor-pointer hover:bg-primary-600 transition-colors"
          >
            <span className="text-[16px] font-medium leading-[24px] text-white">Done</span>
          </button>
        </ModalBase>
      )}

      {/* ── Enrollment Conflict Modal ───────────────────────────────────── */}
      {conflicts && conflicts.length > 0 && (
        <ModalBase onClose={() => setConflicts(null)}>
          <div className="flex flex-col gap-[24px] items-center justify-center w-full">
            <ModalWarningIcon className="size-[94px] shrink-0" />
            <div className="flex flex-col gap-[24px] items-center text-center w-full">
              <h2 className="text-[32px] font-semibold leading-normal text-grey-700 w-full">
                Enrollment Conflict
              </h2>
              <div className="text-[20px] font-medium leading-normal text-grey-700 w-full">
                {conflicts.map((c, i) => (
                  <p key={i}>
                    You are already enrolled in{' '}
                    <span className="font-semibold">"{c.conflictingCourseName}"</span>{' '}
                    with the same schedule: {c.schedule}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-[8px] items-center w-full">
            <button
              type="button"
              onClick={() => { setConflicts(null); handleEnroll(true) }}
              className="flex flex-1 items-center justify-center rounded-[8px] border-2 border-primary-300 bg-white px-[16px] py-[12px] cursor-pointer hover:bg-primary-50 transition-colors"
            >
              <span className="text-[16px] font-medium leading-[24px] text-primary">Continue Anyway</span>
            </button>
            <button
              type="button"
              onClick={() => setConflicts(null)}
              className="flex flex-1 items-center justify-center rounded-[8px] bg-primary border-0 px-[25px] py-[17px] cursor-pointer hover:bg-primary-600 transition-colors"
            >
              <span className="text-[16px] font-medium leading-[24px] text-white">Cancel</span>
            </button>
          </div>
        </ModalBase>
      )}

      {/* ── Complete Profile Modal ──────────────────────────────────────── */}
      {showProfileModal && (
        <ModalBase onClose={() => setShowProfileModal(false)}>
          <div className="flex flex-col gap-[24px] items-center justify-center w-full">
            <ModalUserIcon className="size-[94px] shrink-0" />
            <div className="flex flex-col gap-[24px] items-center text-center w-full">
              <h2 className="text-[32px] font-semibold leading-normal text-grey-700 w-full">
                Complete your profile to continue
              </h2>
              <p className="text-[20px] font-medium leading-normal text-grey-700 w-full">
                You need to complete your profile before enrolling in this course.
              </p>
            </div>
          </div>
          <div className="flex gap-[8px] items-center w-full">
            <button
              type="button"
              onClick={() => { setShowProfileModal(false); openModal('profile') }}
              className="flex flex-1 items-center justify-center rounded-[8px] border-2 border-primary-300 bg-white px-[16px] py-[12px] cursor-pointer hover:bg-primary-50 transition-colors"
            >
              <span className="text-[16px] font-medium leading-[24px] text-primary">Complete Profile</span>
            </button>
            <button
              type="button"
              onClick={() => setShowProfileModal(false)}
              className="flex flex-1 items-center justify-center rounded-[8px] bg-primary border-0 px-[25px] py-[17px] cursor-pointer hover:bg-primary-600 transition-colors"
            >
              <span className="text-[16px] font-medium leading-[24px] text-white">Cancel</span>
            </button>
          </div>
        </ModalBase>
      )}
    </div>
  )
}
