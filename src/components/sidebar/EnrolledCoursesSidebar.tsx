import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useModal } from '../../hooks/useModal'
import { useAuth } from '../../store/AuthContext'
import { getEnrollments } from '../../api/enrollments'
import { getCourseById } from '../../api/courses'
import { extractCourseRating } from '../../utils/extractCourseRating'
import { formatSessionTypeLabel, normalizeSessionTypeKey, type SessionTypeKey } from '../../utils/formatSchedule'
import { formatTimeSlotWithHours } from '../../utils/formatTimeSlot'
import { secondaryButtonClass } from '../ui/buttonStyles'
import ProgressBar from '../ui/ProgressBar'
import type { Enrollment } from '../../types'
import IconMapPin from '../../assets/icons/icon-set/icon-map-pin.svg?react'
import IconCalendar from '../../assets/icons/icon-set/icon-calendar.svg?react'
import IconClock from '../../assets/icons/icon-set/icon-clock.svg?react'
import IconDesktop from '../../assets/icons/icon-set/icon-desktop.svg?react'
import IconUsers from '../../assets/icons/icon-set/icon-users.svg?react'
import IconIntersect from '../../assets/icons/icon-set/icon-intersect.svg?react'
import IconStarFill from '../../assets/icons/icon-set/icon-star.svg?react'
import packageOpenIcon from '../../assets/icons/icon-set/icon-package-open.svg'

const SESSION_TYPE_ICON: Record<SessionTypeKey, React.ComponentType<{ className?: string }>> = {
  online: IconDesktop,
  in_person: IconUsers,
  hybrid: IconIntersect,
}

function SidebarCourseCard({
  enrollment,
  rating,
}: {
  enrollment: Enrollment
  rating: number | null
}) {
  const { course, progress, schedule } = enrollment
  const navigate = useNavigate()
  const { closeSidebar } = useModal()
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const stName = schedule?.sessionType?.name ?? ''
  const sessionTypeKey = normalizeSessionTypeKey(stName)
  const StIcon = sessionTypeKey ? SESSION_TYPE_ICON[sessionTypeKey] : IconDesktop
  const displaySessionType = formatSessionTypeLabel(stName)
  const isOnline = sessionTypeKey === 'online'
  const location = schedule?.location ?? (isOnline ? 'Google Meet' : null)

  const handleCardClick = () => {
    closeSidebar()
    navigate(`/courses/${course.id}`)
  }

  const handleMouseDown = () => {
    setIsPressed(true)
  }

  const handleMouseUp = () => {
    setIsPressed(false)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setIsPressed(false)
  }

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={`w-full rounded-[12px] bg-white p-[20px] cursor-pointer transition-all ${
        isPressed
          ? 'border border-[#8A7ECC]'
          : isHovered
            ? 'border border-[#B7B3F4]'
            : 'border border-white'
      }`}
      style={
        isPressed
          ? { boxShadow: '0 0 40px 0 rgba(138, 130, 212, 0.35)' }
          : isHovered
            ? { boxShadow: '0 0 10px 0 rgba(138, 130, 212, 0.25)' }
            : {}
      }
    >
      <div className="flex w-full items-center gap-[18px]">
        <div className="h-[191px] w-[269px] shrink-0 overflow-hidden rounded-[10px] bg-primary-50">
          {course.image ? (
            <img src={course.image} alt={course.title} className="size-full object-cover" />
          ) : (
            <div className="size-full bg-primary-50" />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
          <div className="flex w-full flex-wrap items-center justify-between gap-y-[8px]">
            <p className="text-[14px] font-medium leading-normal text-grey-400 whitespace-nowrap">
              Instructor <span className="text-grey-500">{course.instructor?.name || 'Unknown'}</span>
            </p>
            {rating != null && (
              <div className="flex items-center gap-[4px]">
                <IconStarFill className="size-[18px] text-[#DFB300]" aria-hidden />
                <p className="whitespace-nowrap text-[14px] font-medium leading-normal text-grey-600">
                  {rating.toFixed(1)}
                </p>
              </div>
            )}
          </div>

          <p className="w-[257px] text-[20px] font-semibold leading-[24px] text-grey-900">
            {course.title}
          </p>

          <div className="w-[207px]">
            {schedule?.weeklySchedule && (
              <div className="flex items-center gap-[8px]">
                <IconCalendar className="size-[16px] shrink-0" />
                <p className="whitespace-nowrap text-[14px] font-normal leading-[26px] text-grey-500">
                  {schedule.weeklySchedule.label}
                </p>
              </div>
            )}

            {schedule?.timeSlot && (
              <div className="flex items-center gap-[8px]">
                <IconClock className="size-[16px] shrink-0" />
                <p className="whitespace-nowrap text-[14px] font-normal leading-[26px] text-grey-500">
                  {formatTimeSlotWithHours(schedule.timeSlot)}
                </p>
              </div>
            )}

            <div className="flex items-center gap-[8px]">
              <StIcon className="size-[16px] shrink-0" />
              <p className="whitespace-nowrap text-[14px] font-normal leading-[26px] text-grey-500">
                {displaySessionType}
              </p>
            </div>

            {location && (
              <div className="flex items-center gap-[8px]">
                <IconMapPin className="size-[16px] shrink-0" />
                <p className="whitespace-nowrap text-[14px] font-normal leading-[26px] text-grey-500">
                  {location}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-[16px] flex w-full items-center justify-center gap-[20px]">
        <div className="min-w-0 flex-1 pl-[4px]">
          <div className="h-[16px] text-[16px] font-medium leading-[24px] text-grey-900">
            {progress}% Complete
          </div>
          <ProgressBar progress={progress} className="mt-[8px]" />
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            closeSidebar()
            navigate(`/courses/${course.id}`)
          }}
          className={`${secondaryButtonClass} w-[117px] shrink-0 text-center text-[16px] font-medium leading-[24px]`}
        >
          View
        </button>
      </div>
    </div>
  )
}

function EmptyState() {
  const navigate = useNavigate()
  const { closeSidebar } = useModal()

  return (
    <div className="flex h-[876px] w-full items-center justify-center">
      <div className="flex w-[448px] flex-col items-center gap-[12px] text-center">
        <div className="flex h-[170px] items-center p-[30px]">
          <img
            src={packageOpenIcon}
            alt=""
            aria-hidden
            className="h-[132px] w-[130px] shrink-0"
          />
        </div>

        <div className="flex w-full flex-col items-center gap-[8px]">
          <p className="w-full text-center text-[24px] font-semibold leading-[24px] text-[#130E67]">
            No Enrolled Courses Yet
          </p>
          <p className="w-[274px] text-center text-[14px] font-medium leading-[normal] text-[#130E67]">
            Your learning journey starts here! Browse courses to get started.
          </p>
        </div>

      <button
        type="button"
        onClick={() => {
          closeSidebar()
          navigate('/courses')
        }}
        className="mt-[20px] rounded-[8px] bg-primary px-[25px] py-[17px] text-[16px] font-medium leading-[24px] text-white"
      >
        Browse Courses
      </button>
      </div>
    </div>
  )
}

export default function EnrolledCoursesSidebar() {
  const { isSidebarOpen, closeSidebar } = useModal()
  const { isAuthenticated } = useAuth()

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['enrollments'],
    queryFn: getEnrollments,
    enabled: isSidebarOpen && isAuthenticated,
    staleTime: 1000 * 60 * 2,
  })

  const { data: ratingsByCourseId = {} } = useQuery({
    queryKey: ['enrollment-course-ratings', enrollments.map((e) => e.course.id).sort((a, b) => a - b)],
    enabled: isSidebarOpen && isAuthenticated && enrollments.length > 0,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const ids = Array.from(new Set(enrollments.map((e) => e.course.id)))
      const results = await Promise.allSettled(ids.map((id) => getCourseById(id)))

      return results.reduce<Record<number, number | null>>((acc, result, index) => {
        const id = ids[index]
        if (result.status === 'fulfilled') {
          acc[id] = extractCourseRating(result.value)
        } else {
          acc[id] = null
        }
        return acc
      }, {})
    },
  })

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isSidebarOpen])

  if (!isSidebarOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={closeSidebar} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Enrolled Courses"
        className="fixed right-0 top-0 z-50 flex h-full w-[770px] max-w-[100vw] flex-col bg-grey-100 shadow-[-8px_0_40px_rgba(0,0,0,0.12)]"
      >
        <div className="flex h-[86px] w-[794px] shrink-0 items-end justify-center gap-[202px] bg-[#f5f5f5]">
          <h2 className="text-[40px] font-semibold leading-[44px] tracking-[-0.2px] text-grey-950">
            Enrolled Courses
          </h2>
          <p className="text-[16px] font-medium leading-[24px] text-grey-950">
            Total Enrollments{' '}
            <span className="font-semibold leading-[25px]">{enrollments.length}</span>
          </p>
        </div>

        <div className="inline-flex flex-col items-start gap-[12px] overflow-y-auto px-[74px] pb-[24px] pt-[37px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {isLoading ? (
            <div className="flex flex-col gap-[12px]">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[262px] w-full animate-pulse rounded-[12px] bg-white" />
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            <EmptyState />
          ) : (
            enrollments.map((enrollment) => (
              <SidebarCourseCard
                key={enrollment.id}
                enrollment={enrollment}
                rating={ratingsByCourseId[enrollment.course.id] ?? extractCourseRating(enrollment.course)}
              />
            ))
          )}
        </div>
      </div>
    </>
  )
}
