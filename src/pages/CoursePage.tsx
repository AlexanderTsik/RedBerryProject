import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import { useModal } from '../hooks/useModal'
import { useCourseFetching } from '../hooks/useCourseFetching'
import { useScheduleSelection } from '../hooks/useScheduleSelection'
import { useEnrollmentMutations, type EnrollmentMutationsCallbacks } from '../hooks/useEnrollmentMutations'
import { useEnrollmentLogic } from '../hooks/useEnrollmentLogic'
import { primaryButtonClass, secondaryButtonClass } from '../components/ui/buttonStyles'
import ProgressBar from '../components/ui/ProgressBar'
import RatingBadge from '../components/ui/RatingBadge'
import { formatTime, formatTimeSlotWithHours } from '../utils/formatTimeSlot'
import { formatPrice } from '../utils/formatPrice'
import { formatSessionTypeLabel, normalizeSessionTypeKey, type SessionTypeKey } from '../utils/formatSchedule'
import type { ScheduleConflict } from '../types'

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
import BreadcrumbArrow from '../assets/icons/icon-set/icon-arrow-breadcrumb.svg?react'
import DropdownArrow from '../assets/icons/icon-set/icon-course-arrow-dropdown.svg?react'
import CourseArrowRight from '../assets/icons/icon-set/icon-course-arrow-right.svg?react'
import RatingStarBase from '../assets/icons/icon-set/rating-star-base.svg?react'
import RatingStarColored from '../assets/icons/icon-set/rating-star-colored.svg?react'
// ─── Modal icons ─────────────────────────────────────────────────────────────
import ModalSuccessIcon from '../assets/icons/modal/success-icon.svg?react'
import ModalCompleteIcon from '../assets/icons/modal/complete-icon.svg?react'
import ModalWarningIcon from '../assets/icons/modal/warning-icon.svg?react'
import ModalUserIcon from '../assets/icons/modal/user-icon.svg?react'

// ─── Category icon map ──────────────────────────────────────────────────────
const CATEGORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Development: IconDevelopment,
  Design: IconDesign,
  Business: IconBusiness,
  'Data Science': IconDataScience,
  Marketing: IconMarketing,
}

// ─── Session type icon map ──────────────────────────────────────────────────
const SESSION_TYPE_ICON: Record<SessionTypeKey, React.ComponentType<{ className?: string }>> = {
  online: IconDesktop,
  in_person: IconUsers,
  hybrid: IconIntersect,
}

// ─── Time slot icon map ─────────────────────────────────────────────────────
function getTimeSlotIcon(label: string) {
  const l = label.toLowerCase()
  if (l.includes('morning')) return IconCloudSun
  if (l.includes('afternoon')) return IconSun
  if (l.includes('evening') || l.includes('night')) return IconMoon
  return IconClock
}


// ─── Chevron for collapsible sections ───────────────────────────────────────
function ChevronIcon({
  open,
  active = false,
  className,
}: {
  open: boolean
  active?: boolean
  className?: string
}) {
  return (
    <DropdownArrow
      className={`size-[18px] shrink-0 transition-transform ${open ? '' : 'rotate-180'} ${{
        true: '[&_path]:stroke-[#130E67] [&_path]:fill-[#130E67]',
        false: '[&_path]:stroke-[#8A8A8A] [&_path]:fill-[#8A8A8A]',
      }[String(active) as 'true' | 'false']} ${className ?? ''}`}
      aria-hidden
    />
  )
}

function StepIcon({
  active,
  selected,
  InactiveIcon,
  SelectedIcon,
}: {
  active: boolean
  selected: boolean
  InactiveIcon: React.ComponentType<{ className?: string }>
  SelectedIcon: React.ComponentType<{ className?: string }>
}) {
  if (selected) {
    return <SelectedIcon className="size-[28px] shrink-0 [&_path]:fill-[#130E67]" aria-hidden />
  }

  return (
    <InactiveIcon
      className={`size-[28px] shrink-0 ${active ? '[&_path]:stroke-[#130E67]' : '[&_path]:stroke-[#8A8A8A]'}`}
      aria-hidden
    />
  )
}

function formatWeekLabel(label: string): string {
  if (/weekend/i.test(label) && /saturday/i.test(label) && /sunday/i.test(label)) {
    return 'Weekend'
  }

  const map: Record<string, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
    weekend: 'Weekend',
  }

  return label.replace(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Weekend/gi, m => {
    return map[m.toLowerCase()] ?? m
  })
}

function formatCompactMeridiemTime(time: string): string {
  return time.replace(/:00\s*/i, '').replace(/\s+/g, '')
}

function formatConflictScheduleLabel(schedule: string): string {
  const [daysPart, timePart] = schedule.split(/\s+at\s+/i)

  if (!timePart) {
    return formatWeekLabel(daysPart).replace(/\s-\s/g, '-')
  }

  const timeMatch = timePart.match(/\(([^)]+)\)/)
  const rawRange = timeMatch?.[1] ?? timePart
  const [startTime = '', endTime = ''] = rawRange.split(/\s*-\s*/)
  const compactDays = formatWeekLabel(daysPart).replace(/\s-\s/g, '-')
  const compactStart = formatCompactMeridiemTime(startTime)
  const compactEnd = formatCompactMeridiemTime(endTime)

  return `${compactDays} at ${compactStart} - ${compactEnd}`.trim()
}

// ─── Warning icon ───────────────────────────────────────────────────────────
function WarningIcon({ className }: { className?: string }) {
  return <ModalWarningIcon className={className} aria-hidden />
}

// ─── Arrow right icon ───────────────────────────────────────────────────────
function ArrowRightIcon() {
  return <CourseArrowRight className="size-[16px] shrink-0" aria-hidden />
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
            {(hover || pendingRating) >= star ? (
              <RatingStarColored className="size-[50px] shrink-0" aria-hidden />
            ) : (
              <RatingStarBase className="size-[50px] shrink-0" aria-hidden />
            )}
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
  const { isAuthenticated, user } = useAuth()
  const { openModal } = useModal()

  // ── Local state ────────────────────────────────────────────────────────
  const [showCompletedModal, setShowCompletedModal] = useState(false)
  const [showEnrolledModal, setShowEnrolledModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [modalRating, setModalRating] = useState(0)
  const [modalRatingHover, setModalRatingHover] = useState(0)
  const [conflicts, setConflicts] = useState<ScheduleConflict[] | null>(null)
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [pendingRating, setPendingRating] = useState(0)

  // ── Data fetching ──────────────────────────────────────────────────────
  const { course, isLoading: courseLoading, weeklySchedules, allTimeSlotsMap, allSessionTypesMap, physicalLocation, uniqueTimeSlots, uniqueSessionTypes } =
    useCourseFetching(courseId)

  // ── Schedule selection ─────────────────────────────────────────────────
  const { state: scheduleState, actions: scheduleActions, data: scheduleData } = useScheduleSelection(
    weeklySchedules,
    allTimeSlotsMap,
    allSessionTypesMap,
  )

  // ── Toggle handlers for schedule sections ──────────────────────────────
  const toggleScheduleOpen = () => scheduleActions.setScheduleOpen(!scheduleState.scheduleOpen)
  const toggleTimeSlotsOpen = () => scheduleActions.setTimeSlotsOpen(!scheduleState.timeSlotsOpen)
  const toggleSessionTypesOpen = () => scheduleActions.setSessionTypesOpen(!scheduleState.sessionTypesOpen)

  // ── Enrollment mutations ───────────────────────────────────────────────
  const mutationCallbacks: EnrollmentMutationsCallbacks = {
    onEnrollSuccess: () => {
      setConflicts(null)
      setEnrollError(null)
      setShowEnrolledModal(true)
    },
    onEnrollError: (conflicts, error) => {
      setConflicts(conflicts)
      setEnrollError(error)
    },
    onCompleteSuccess: () => {
      setModalRating(0)
      setShowCompletedModal(true)
    },
    onRatingSuccess: () => {
      // Rating submitted successfully
    },
    onRetakeSuccess: () => {
      // Reset selections for retake
      scheduleActions.setSelectedSchedule(null)
      scheduleActions.setSelectedTimeSlot(null)
      scheduleActions.setSelectedSessionType(null)
      scheduleActions.setScheduleOpen(false)
      scheduleActions.setTimeSlotsOpen(false)
      scheduleActions.setSessionTypesOpen(false)
    },
  }

  const { enrollMutation, completeMutation, ratingMutation, retakeMutation } = useEnrollmentMutations(
    courseId,
    mutationCallbacks,
  )

  // ── Enrollment logic ───────────────────────────────────────────────────
  const { canEnroll, buttonClickable, handleEnroll: enrollHandler, isProfileComplete } = useEnrollmentLogic({
    isAuthenticated,
    user,
    selectedSessionType: scheduleState.selectedSessionType,
    enrollmentPending: enrollMutation.isPending,
    onProfileIncomplete: () => setShowProfileModal(true),
    onEnroll: (payload) => {
      setEnrollError(null)
      enrollMutation.mutate(payload)
    },
    courseId,
  })

  // ── Loading state ──────────────────────────────────────────────────────
  if (courseLoading || !course) {
    return (
      <div className="min-h-screen bg-grey-100">
        <div className="layout-frame flex flex-col gap-[32px] pt-[72px] pb-[40px]">
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
      </div>
    )
  }

  // ── Derived variables  ──────────────────────────────────────────────────────
  const enrollment = course.enrollment
  const isEnrolled = !!enrollment
  const isCompleted = enrollment?.progress === 100
  const CatIcon = CATEGORY_ICON[course.category?.name]
  const avgRating =
    course.avgRating ??
    (course.reviews?.length > 0
      ? course.reviews.reduce((sum, review) => sum + review.rating, 0) / course.reviews.length
      : null)
  const hours = course.hours ?? course.durationWeeks * 10
  const totalPrice = Number(course.basePrice) + Number(scheduleState.selectedSessionType?.priceModifier ?? 0)

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-grey-100">
      <div className="layout-frame flex flex-col gap-[24px] pt-[72px] pb-[40px]">
      {/* Breadcrumbs + Title */}
      <div className="flex w-[903px] flex-col gap-[32px] items-start">
        <nav className="flex items-center gap-[2px]">
          <div className="flex shrink-0 items-center gap-[4px] px-[4px] py-[2px]">
            <Link to="/" className="text-[18px] font-medium leading-[18px] text-grey-500 no-underline whitespace-nowrap">
              Home
            </Link>
            <span className="flex h-[24px] w-[12px] shrink-0 items-center justify-center">
              <BreadcrumbArrow className="h-[13px] w-[8px] shrink-0" />
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-[4px] px-[4px] py-[2px]">
            <Link to="/courses" className="text-[18px] font-medium leading-[18px] text-grey-500 no-underline whitespace-nowrap">
              Browse
            </Link>
            <span className="flex h-[24px] w-[12px] shrink-0 items-center justify-center">
              <BreadcrumbArrow className="h-[13px] w-[8px] shrink-0" />
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-[4px] px-[4px] py-[2px]">
            <span className="text-[18px] font-medium leading-[18px] text-primary whitespace-nowrap">
              {course.category.name}
            </span>
          </div>
        </nav>

        <h1 className="w-full text-[40px] font-semibold leading-[44px] text-grey-900">
          {course.title}
        </h1>
      </div>

      {/* Main layout: left (course info) + right (schedule/enrolled) */}
      <div className="flex w-full items-start justify-between">
        {/* ═══ LEFT COLUMN ═══ */}
        <div className="flex w-[903px] shrink-0 flex-col gap-[18px] items-start">
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
                    <span className="text-[14px] font-medium leading-[14px] text-grey-600 whitespace-nowrap">
                      {course.durationWeeks} Weeks
                    </span>
                  </div>
                  <div className="flex gap-[4px] items-center">
                    <IconClock className="size-[24px] shrink-0" />
                    <span className="text-[14px] font-medium leading-[14px] text-grey-600 whitespace-nowrap">
                      {hours} Hours
                    </span>
                  </div>
                </div>
                <div className="flex gap-[4px] items-center">
                  <RatingBadge
                    rating={avgRating}
                    iconClassName="size-[26px] shrink-0"
                    textClassName="text-[14px] font-medium leading-[1.5] text-grey-600 whitespace-nowrap"
                  />
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
        <div className="w-[530px] shrink-0 flex flex-col gap-[12px] items-start self-start">
          {/* ── Not enrolled: schedule selection ─────────────────────────── */}
          {!isEnrolled && (
            <>
              <div className="flex flex-col gap-[32px] items-start w-full">
                {/* ─ Weekly Schedule ─ */}
                <div className="flex flex-col gap-[18px] items-start w-full">
                  <button
                    type="button"
                    onClick={toggleScheduleOpen}
                    className="flex items-center justify-between w-full cursor-pointer border-0 bg-transparent p-0"
                  >
                    <div className="flex gap-[8px] items-center">
                      <StepIcon
                        active={scheduleState.scheduleOpen}
                        selected={!!scheduleState.selectedSchedule}
                        InactiveIcon={IconOne}
                        SelectedIcon={IconOneFill}
                      />
                      <span className={`text-[24px] font-semibold leading-[24px] whitespace-nowrap ${scheduleState.scheduleOpen || scheduleState.selectedSchedule ? 'text-primary-800' : 'text-grey-400'}`}>
                        Weekly Schedule
                      </span>
                    </div>
                    <ChevronIcon open={scheduleState.scheduleOpen} active={scheduleState.scheduleOpen || !!scheduleState.selectedSchedule} />
                  </button>

                  {scheduleState.scheduleOpen && scheduleData.displayWeeklySchedules.length > 0 && (
                    <div className="flex gap-[12px] items-center w-full">
                      {scheduleData.displayWeeklySchedules.map(({ label, schedule, isAvailable }) => {
                        const isSelected = !!schedule && scheduleState.selectedSchedule?.id === schedule.id
                        const isDisabled = !isAvailable
                        return (
                          <button
                            key={label}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              if (schedule) {
                                scheduleActions.setSelectedSchedule(isSelected ? null : schedule)
                              }
                            }}
                            className={`flex flex-1 items-center justify-center h-[91px] rounded-[12px] border border-solid p-[10px] transition-colors ${
                              isDisabled
                                ? 'bg-grey-100 border-grey-200 text-grey-300 cursor-not-allowed'
                                : isSelected
                                  ? 'bg-primary-50 border-primary text-primary cursor-pointer'
                                  : 'bg-white border-grey-200 text-grey-800 cursor-pointer hover:bg-primary-50 hover:border-primary hover:text-primary'
                            }`}
                          >
                            <span className="text-[16px] font-semibold leading-[16px] text-center">
                              {formatWeekLabel(label)}
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
                    onClick={toggleTimeSlotsOpen}
                    className="flex items-center justify-between w-full cursor-pointer border-0 bg-transparent p-0"
                  >
                    <div className="flex gap-[8px] items-center">
                      <StepIcon
                        active={scheduleState.timeSlotsOpen}
                        selected={!!scheduleState.selectedTimeSlot}
                        InactiveIcon={IconTwo}
                        SelectedIcon={IconTwoFill}
                      />
                      <span className={`text-[24px] font-semibold leading-[24px] whitespace-nowrap ${scheduleState.timeSlotsOpen || scheduleState.selectedTimeSlot ? 'text-primary-800' : 'text-grey-400'}`}>
                        Time Slot
                      </span>
                    </div>
                    <ChevronIcon open={scheduleState.timeSlotsOpen} active={scheduleState.timeSlotsOpen || !!scheduleState.selectedTimeSlot} />
                  </button>

                  {scheduleState.timeSlotsOpen && uniqueTimeSlots.length > 0 && (
                    <div className="flex gap-[12px] items-center w-full">
                      {uniqueTimeSlots.map(ts => {
                        const isAvailable = scheduleData.availableTimeSlotIds.has(ts.id)
                        const isDisabled = !scheduleState.selectedSchedule || !isAvailable
                        const isSelected = scheduleState.selectedTimeSlot?.id === ts.id
                        const SlotIcon = getTimeSlotIcon(ts.label)
                        // Extract short label (e.g. "Morning" from "Morning (9:00 AM - 11:00 AM)")
                        const shortLabel = ts.label.replace(/\s*\(.*\)/, '')
                        return (
                          <button
                            key={ts.id}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => scheduleActions.setSelectedTimeSlot(isSelected ? null : ts)}
                            className={`group flex flex-1 flex-col items-center justify-center gap-[4px] rounded-[12px] border border-solid p-[16px] transition-colors ${
                              isDisabled
                                ? 'bg-grey-100 border-grey-200 cursor-not-allowed'
                                : isSelected
                                  ? 'bg-primary-50 border-primary cursor-pointer'
                                  : 'bg-white border-grey-200 cursor-pointer hover:bg-primary-50 hover:border-primary'
                            }`}
                          >
                            <SlotIcon className={`size-[24px] shrink-0 ${isDisabled ? 'opacity-40' : ''}`} />
                            <span className={`text-[16px] font-semibold leading-[16px] ${
                              isDisabled
                                ? 'text-grey-300'
                                : isSelected
                                  ? 'text-primary'
                                  : 'text-grey-800 group-hover:text-primary'
                            }`}>
                              {shortLabel}
                            </span>
                            <span className={`text-[12px] font-medium leading-[12px] ${
                              isDisabled
                                ? 'text-grey-300'
                                : isSelected
                                  ? 'text-primary-600'
                                  : 'text-grey-400 group-hover:text-primary-600'
                            }`}>
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
                    onClick={toggleSessionTypesOpen}
                    className="flex items-center justify-between w-full cursor-pointer border-0 bg-transparent p-0"
                  >
                    <div className="flex gap-[8px] items-center">
                      <StepIcon
                        active={scheduleState.sessionTypesOpen}
                        selected={!!scheduleState.selectedSessionType}
                        InactiveIcon={IconThree}
                        SelectedIcon={IconThreeFill}
                      />
                      <span className={`text-[24px] font-semibold leading-[24px] whitespace-nowrap ${scheduleState.sessionTypesOpen || scheduleState.selectedSessionType ? 'text-primary-800' : 'text-grey-400'}`}>
                        Session Type
                      </span>
                    </div>
                    <ChevronIcon open={scheduleState.sessionTypesOpen} active={scheduleState.sessionTypesOpen || !!scheduleState.selectedSessionType} />
                  </button>

                  {scheduleState.sessionTypesOpen && uniqueSessionTypes.length > 0 && (
                    <div className="flex flex-col gap-[12px] w-full">
                      <div className="flex gap-[12px] items-start w-full">
                        {uniqueSessionTypes.map(st => {
                          // Find the actual live data for this session type in the CURRENT schedule+timeslot combo only
                          const liveData = scheduleData.currentSessionTypes.find(c => c.name === st.name)
                          const isAvailable = scheduleData.availableSessionTypeNames.has(st.name)
                          // When a timeslot is selected and this type is absent from the combo, treat as fully booked
                          const isFullyBooked = scheduleState.selectedTimeSlot
                            ? liveData ? liveData.availableSeats === 0 : !isAvailable
                            : false
                          const isDisabled = !scheduleState.selectedTimeSlot || !isAvailable || isFullyBooked
                          const isSelected = scheduleState.selectedSessionType?.name === st.name
                          const isLowSeats = liveData ? liveData.availableSeats > 0 && liveData.availableSeats < 5 : false
                          // Use the live data for dynamic values when available, otherwise fallback to generic
                          const displayData = liveData || st
                          const sessionTypeKey = normalizeSessionTypeKey(st.name)
                          const TypeIcon = sessionTypeKey ? SESSION_TYPE_ICON[sessionTypeKey] : IconDesktop
                          const displayName = formatSessionTypeLabel(st.name)
                          const sessionHoursLabel = scheduleState.selectedTimeSlot
                            ? `${formatTime(scheduleState.selectedTimeSlot.startTime)} – ${formatTime(scheduleState.selectedTimeSlot.endTime)}`
                            : null

                          return (
                            <div key={st.name} className="flex flex-col items-center gap-[8px] flex-1 min-w-0">
                              <button
                                type="button"
                                disabled={isDisabled}
                                onClick={() => {
                                  if (liveData) {
                                    scheduleActions.setSelectedSessionType(isSelected ? null : liveData)
                                  }
                                }}
                                className={`group flex flex-col items-center justify-center gap-[8px] w-full rounded-[12px] border border-solid p-[20px] transition-colors ${
                                  isDisabled
                                    ? 'bg-grey-100 border-grey-200 cursor-not-allowed opacity-60'
                                    : isSelected
                                      ? 'bg-primary-50 border-primary cursor-pointer'
                                      : 'bg-white border-grey-200 cursor-pointer hover:bg-primary-50 hover:border-primary'
                                }`}
                              >
                                <TypeIcon className="size-[24px] shrink-0" />
                                <span className={`text-[16px] font-semibold leading-[16px] ${
                                  isDisabled
                                    ? 'text-grey-400'
                                    : isSelected
                                      ? 'text-primary'
                                      : 'text-grey-800 group-hover:text-primary'
                                }`}>
                                  {displayName}
                                </span>
                                {sessionHoursLabel && (
                                  <span className={`text-[12px] font-medium leading-[12px] ${
                                    isDisabled
                                      ? 'text-grey-300'
                                      : isSelected
                                        ? 'text-primary-600'
                                        : 'text-grey-400 group-hover:text-primary-600'
                                  }`}>
                                    {sessionHoursLabel}
                                  </span>
                                )}
                                {normalizeSessionTypeKey(st.name) === 'online' ? (
                                  <div className="flex items-center justify-center gap-[2px] w-full">
                                    <span className={`text-[12px] font-normal leading-[12px] ${isDisabled ? 'text-grey-300' : 'text-grey-600'}`}>
                                      Google Meet
                                    </span>
                                  </div>
                                ) : liveData?.location ? (
                                  <div className="flex items-center gap-[2px]">
                                    <IconMapPin className="size-[14px] shrink-0" />
                                    <span className={`text-[12px] font-normal leading-[12px] ${isDisabled ? 'text-grey-300' : 'text-grey-600'}`}>
                                      {liveData.location}
                                    </span>
                                  </div>
                                ) : null}
                                <span className={`text-[14px] font-medium leading-[14px] ${
                                  isDisabled
                                    ? 'text-grey-400'
                                    : isSelected
                                      ? 'text-primary'
                                      : 'text-primary-400 group-hover:text-primary'
                                }`}>
                                  {Number(displayData.priceModifier) === 0
                                    ? 'Included'
                                    : `+ $${Math.floor(Number(displayData.priceModifier))}`}
                                </span>
                              </button>
                              {/* Seats info — show when timeslot is selected */}
                              {scheduleState.selectedTimeSlot && (liveData || isFullyBooked) && (
                                <span className={`text-[12px] font-medium leading-[12px] whitespace-nowrap ${
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
                                      Only {liveData!.availableSeats} Seats Remaining
                                    </span>
                                  ) : (
                                    `${liveData!.availableSeats} Seats Available`
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
                          + ${Math.floor(Number(scheduleState.selectedSessionType?.priceModifier ?? 0))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Enroll button — always clickable so modals can fire */}
                  <button
                    type="button"
                    disabled={!buttonClickable}
                    onClick={() => enrollHandler()}
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
                        <span className="text-[20px] font-medium leading-[20px] text-grey-600">
                          {enrollment.schedule.weeklySchedule.label}
                        </span>
                      </div>
                    )}
                    {enrollment.schedule.timeSlot && (
                      <div className="flex items-center gap-[12px]">
                        <IconClock className="size-[24px] shrink-0" />
                        <span className="text-[20px] font-medium leading-[20px] text-grey-600">
                          {formatTimeSlotWithHours(enrollment.schedule.timeSlot)}
                        </span>
                      </div>
                    )}
                    {(() => {
                      const stName = enrollment.schedule.sessionType.name
                      const sessionTypeKey = normalizeSessionTypeKey(stName)
                      const StIcon = sessionTypeKey ? SESSION_TYPE_ICON[sessionTypeKey] : IconDesktop
                      const displayName = formatSessionTypeLabel(stName)
                      return (
                        <div className="flex items-center gap-[12px]">
                          <StIcon className="size-[24px] shrink-0" />
                          <span className="text-[20px] font-medium leading-[20px] text-grey-600">
                            {displayName}
                          </span>
                        </div>
                      )
                    })()}
                    {/* Location — enrollment-specific location, with online fallback */}
                    <div className="flex items-center gap-[12px]">
                      <IconMapPin className="size-[24px] shrink-0" />
                      <span className="text-[20px] font-medium leading-[20px] text-grey-600">
                        {(() => {
                          const enrolledSessionTypeKey = normalizeSessionTypeKey(
                            enrollment.schedule.sessionType.name,
                          )

                          if (enrollment.schedule.location) {
                            return enrollment.schedule.location
                          }

                          if (enrolledSessionTypeKey === 'online') {
                            return 'Google Meet'
                          }

                          return physicalLocation ?? 'Location unavailable'
                        })()}
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
                  <ProgressBar progress={enrollment.progress} height="h-[24px]" animated />
                </div>

                {/* Not completed: Complete Course button */}
                {!isCompleted && (
                  <button
                    type="button"
                    onClick={() => completeMutation.mutate(enrollment.id)}
                    disabled={completeMutation.isPending}
                    className={`${primaryButtonClass} w-full`}
                  >
                    <span className="text-[20px] font-medium leading-[20px]">
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
                    className={`${primaryButtonClass} w-full`}
                  >
                    <span className="text-[20px] font-medium leading-[20px]">
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
              <h2 className="text-[32px] font-semibold leading-[32px] text-grey-700 w-full">
                Congratulations!
              </h2>
              <p className="text-[20px] font-medium leading-[20px] text-grey-700 w-full">
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
                      {(modalRatingHover || modalRating) >= star ? (
                        <RatingStarColored className="size-[46px] shrink-0" aria-hidden />
                      ) : (
                        <RatingStarBase className="size-[46px] shrink-0" aria-hidden />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowCompletedModal(false)}
            className={`${primaryButtonClass} w-full`}
          >
            Done
          </button>
        </ModalBase>
      )}

      {/* ── Enrollment Confirmed Modal ──────────────────────────────────── */}
      {showEnrolledModal && (
        <ModalBase onClose={() => setShowEnrolledModal(false)}>
          <div className="flex flex-col gap-[24px] items-center justify-center w-full">
            <ModalCompleteIcon className="size-[94px] shrink-0" />
            <div className="flex flex-col gap-[24px] items-center text-center w-full">
              <h2 className="text-[32px] font-semibold leading-[32px] text-grey-700 w-full">
                Enrollment Confirmed!
              </h2>
              <p className="text-[20px] font-medium leading-[20px] text-grey-700 w-full">
                You've successfully enrolled to the{' '}
                <span className="font-semibold">"{course.title}"</span>{' '}
                Course!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowEnrolledModal(false)}
            className={`${primaryButtonClass} w-full`}
          >
            Done
          </button>
        </ModalBase>
      )}

      {/* ── Enrollment Conflict Modal ───────────────────────────────────── */}
      {conflicts && conflicts.length > 0 && (
        <ModalBase onClose={() => setConflicts(null)}>
          <div className="flex flex-col gap-[24px] items-center justify-center w-full">
            <ModalWarningIcon className="size-[94px] shrink-0" />
            <div className="flex flex-col gap-[24px] items-center text-center w-full">
              <h2 className="text-[32px] font-semibold leading-[32px] text-grey-700 w-full">
                Enrollment Conflict
              </h2>
              <div className="text-[20px] font-medium leading-[20px] text-grey-700 w-full">
                {conflicts.map((c, i) => (
                  <p key={i}>
                    You are already enrolled in{' '}
                    <span className="font-semibold">"{c.conflictingCourseName}"</span>{' '}
                    with the same schedule: {formatConflictScheduleLabel(c.schedule)}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-[8px] items-center w-full">
            <button
              type="button"
              onClick={() => { setConflicts(null); enrollHandler(true) }}
              className={`${secondaryButtonClass} flex-1`}
            >
              <span className="text-[16px] font-medium leading-[24px] text-primary">Continue Anyway</span>
            </button>
            <button
              type="button"
              onClick={() => setConflicts(null)}
              className={`${primaryButtonClass} flex-1`}
            >
              Cancel
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
              <h2 className="text-[32px] font-semibold leading-[32px] text-grey-700 w-full">
                Complete your profile to continue
              </h2>
              <p className="text-[20px] font-medium leading-[20px] text-grey-700 w-full">
                You need to complete your profile before enrolling in this course.
              </p>
            </div>
          </div>
          <div className="flex gap-[8px] items-center w-full">
            <button
              type="button"
              onClick={() => { setShowProfileModal(false); openModal('profile') }}
              className={`${secondaryButtonClass} flex-1`}
            >
              <span className="text-[16px] font-medium leading-[24px] text-primary">Complete Profile</span>
            </button>
            <button
              type="button"
              onClick={() => setShowProfileModal(false)}
              className={`${primaryButtonClass} flex-1`}
            >
              Cancel
            </button>
          </div>
        </ModalBase>
      )}
      </div>
    </div>
  )
}

