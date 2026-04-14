import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../store/AuthContext'
import { useModal } from '../../hooks/useModal'
import { getCourseById } from '../../api/courses'
import { getEnrollments } from '../../api/enrollments'
import { extractCourseRating } from '../../utils/extractCourseRating'
import ProgressCourseCard from './ProgressCourseCard'
import IconLock from '../../assets/icons/icon-set/icon-lock.svg?react'
import mockThumbnail from '../../assets/images/mock-progress-thumbnail.jpg'
import { ghostButtonClass, primaryButtonClass, secondaryButtonClass } from '../ui/buttonStyles'
import ProgressBar from '../ui/ProgressBar'
import RatingBadge from '../ui/RatingBadge'
import InstructorMeta from '../ui/InstructorMeta'

// ─── Mock data for blurred placeholder cards ──────────────────────────────────

const MOCK_CARDS = [
  { id: 1, lecturer: 'Marilyn Mango', rating: 4.9, title: 'Advanced React & TypeScript Development', progress: 65, fill: 60 },
  { id: 2, lecturer: 'Marilyn Mango', rating: 4.9, title: 'Advanced React & TypeScript Development', progress: 65, fill: 60 },
  { id: 3, lecturer: 'Marilyn Mango', rating: 4.9, title: 'Advanced React & TypeScript Development', progress: 65, fill: 60 },
]

function MockBlurCard({ lecturer, rating, title, progress, fill }: typeof MOCK_CARDS[0]) {
  return (
    <div
      className="flex h-full min-w-0 flex-col gap-[12px] items-start rounded-[12px] border-[0.5px] border-grey-100 bg-white p-[20px] shadow-[0px_0px_11.7px_0px_rgba(0,0,0,0.04)] blur-[10px] pointer-events-none select-none"
      aria-hidden
    >
      {/* Top: thumbnail + meta */}
      <div className="flex w-full min-w-0 items-stretch gap-[16px]">
        <div className="flex min-w-0 flex-1 items-start self-stretch">
          {/* Thumbnail */}
          <div className="relative h-[123px] w-[118px] shrink-0 overflow-hidden rounded-[12px] 2xl:w-[132px]">
            <img
              src={mockThumbnail}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
          </div>

          {/* Right meta */}
          <div className="flex min-w-0 flex-1 flex-col gap-[10px] items-start pl-[16px]">
            {/* Lecturer + rating */}
            <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-x-[12px] gap-y-[8px]">
              <InstructorMeta name={lecturer} prefix="Lecturer" />
              <RatingBadge rating={rating} className="shrink-0" />
            </div>
            {/* Title */}
            <p className="line-clamp-2 w-full text-[20px] font-semibold leading-[24px] text-grey-900">
              {title}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom: progress bar + View button */}
      <div className="mt-auto flex w-full min-w-0 items-end gap-[16px]">
        {/* Progress */}
        <div className="flex min-w-0 flex-1 flex-col gap-[4px] items-start justify-center pb-[4px]">
          <p className="text-[12px] font-medium text-grey-900 leading-normal">
            {progress}% Complete
          </p>
          {/* Track */}
          <ProgressBar progress={fill} />
        </div>

        {/* View button */}
        <div className={`${secondaryButtonClass} w-[90px] shrink-0 gap-[2px]`}>
          <span className="text-[16px] font-medium leading-[24px] text-current text-center whitespace-nowrap">
            View
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ContinueLearning() {
  const { isAuthenticated } = useAuth()
  const { openSidebar, openModal } = useModal()

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['enrollments'],
    queryFn: getEnrollments,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  })

  const inProgress = (enrollments ?? []).filter((enrollment) => enrollment.progress < 100)
  const cards = inProgress.slice(0, 4)

  const { data: ratingsByCourseId = {} } = useQuery({
    queryKey: ['continue-learning-ratings', cards.map((enrollment) => enrollment.course.id).sort((a, b) => a - b)],
    enabled: isAuthenticated && cards.length > 0,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const ids = Array.from(new Set(cards.map((enrollment) => enrollment.course.id)))
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

  // ── Unauthenticated: blurred placeholder state ────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-[32px] items-center w-full">
        {/* Header */}
        <div className="flex items-end justify-between w-full">
          <div className="flex flex-1 flex-col gap-[6px] items-start min-w-0">
            <h2 className="text-[40px] font-semibold leading-normal text-grey-950 w-full">
              Continue Learning
            </h2>
            <p className="text-[18px] font-medium leading-normal text-grey-700 pl-[2px]">
              Pick up where you left
            </p>
          </div>
          <span className="text-[20px] font-medium leading-normal text-primary underline decoration-solid whitespace-nowrap shrink-0">
            See All
          </span>
        </div>

        {/* Blurred cards + lock overlay */}
        <div className="relative flex items-stretch gap-[24px] w-full">
          {/* 3 blurred mock cards */}
          {MOCK_CARDS.map(card => (
            <MockBlurCard key={card.id} {...card} />
          ))}

          {/* Lock overlay — centered absolutely over the cards */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              type="button"
              onClick={() => openModal('login')}
              className="pointer-events-auto bg-white border border-grey-300 rounded-[12px] px-[56px] py-[32px] flex flex-col items-center justify-center gap-[24px] w-[418px] cursor-pointer"
            >
              {/* Icon + text */}
              <div className="flex flex-col gap-[12px] items-center w-full">
                <div className="flex items-center justify-center bg-primary-100 p-[20px] rounded-[50px]">
                  <IconLock className="h-[37px] w-[34px] shrink-0" aria-hidden />
                </div>
                <p className="text-[16px] font-medium leading-[24px] text-[#0a0836] text-center">
                  Sign in to track your learning progress
                </p>
              </div>
              {/* Log In CTA */}
              <div className={`${primaryButtonClass} h-[42px] text-[16px] font-medium leading-[24px]`}>
                <span className="whitespace-nowrap">
                  Log In
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Authenticated but loading or no enrollments: render nothing ───────────
  if (isLoading || !enrollments || enrollments.length === 0) {
    return null
  }

  if (cards.length === 0) {
    return null
  }

  const cardsGridClass =
    cards.length === 1
      ? 'grid-cols-1'
      : cards.length === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : cards.length === 3
          ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
          : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'

  // ── Authenticated with enrollments: real cards ────────────────────────────
  return (
    <div className="flex flex-col gap-[32px] items-center w-full">
      {/* Header */}
      <div className="flex items-end justify-between w-full">
        <div className="flex flex-1 flex-col gap-[6px] items-start min-w-0">
          <h2 className="text-[40px] font-semibold leading-normal text-grey-950 w-full">
            Continue Learning
          </h2>
          <p className="text-[18px] font-medium leading-normal text-grey-700 pl-[2px]">
            Pick up where you left
          </p>
        </div>
        <button
          type="button"
          onClick={openSidebar}
          className={`${ghostButtonClass} text-[20px] font-medium leading-normal whitespace-nowrap shrink-0`}
        >
          See All
        </button>
      </div>

      {/* Real enrollment cards */}
      <div className={`grid w-full gap-[24px] ${cardsGridClass}`}>
        {cards.map(enrollment => (
          <ProgressCourseCard
            key={enrollment.id}
            enrollment={enrollment}
            rating={ratingsByCourseId[enrollment.course.id] ?? extractCourseRating(enrollment.course)}
          />
        ))}
      </div>
    </div>
  )
}
