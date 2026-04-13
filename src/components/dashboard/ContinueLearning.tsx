import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../store/AuthContext'
import { useModal } from '../../hooks/useModal'
import { getCoursesInProgress } from '../../api/courses'
import ProgressCourseCard from './ProgressCourseCard'
import IconLock from '../../assets/icons/icon-set/icon-lock.svg?react'
import IconStarFill from '../../assets/icons/icon-set/icon-star.svg?react'
import mockThumbnail from '../../assets/images/mock-progress-thumbnail.jpg'

// ─── Mock data for blurred placeholder cards ──────────────────────────────────

const MOCK_CARDS = [
  { id: 1, lecturer: 'Marilyn Mango', rating: 4.9, title: 'Advanced React & TypeScript Development', progress: 65, fill: 60 },
  { id: 2, lecturer: 'Marilyn Mango', rating: 4.9, title: 'Advanced React & TypeScript Development', progress: 65, fill: 60 },
  { id: 3, lecturer: 'Marilyn Mango', rating: 4.9, title: 'Advanced React & TypeScript Development', progress: 65, fill: 60 },
]

function MockBlurCard({ lecturer, rating, title, progress, fill }: typeof MOCK_CARDS[0]) {
  return (
    <div
      className="flex-1 min-w-0 bg-white border-[0.5px] border-grey-100 rounded-[12px] p-[20px] shadow-[0px_0px_11.7px_0px_rgba(0,0,0,0.04)] flex flex-col gap-[8px] items-start blur-[10px] pointer-events-none select-none"
      aria-hidden
    >
      {/* Top: thumbnail + meta */}
      <div className="flex h-[123px] items-stretch w-full">
        <div className="flex flex-1 items-center justify-between self-stretch min-w-0">
          {/* Thumbnail */}
          <div className="h-[123px] w-full max-w-[140px] shrink-0 relative rounded-[12px] overflow-hidden">
            <img
              src={mockThumbnail}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
          </div>

          {/* Right meta */}
          <div className="flex flex-1 flex-col gap-[9px] h-full items-start min-w-0 pl-[16px] pr-[4px]">
            {/* Lecturer + rating */}
            <div className="flex flex-wrap items-center justify-between w-full gap-y-[8px]">
              <p className="text-[14px] font-medium text-grey-400 whitespace-nowrap leading-normal">
                Lecturer{' '}
                <span className="text-grey-500">{lecturer}</span>
              </p>
              <div className="flex items-center gap-[4px]">
                <IconStarFill className="size-[18px] shrink-0" aria-hidden />
                <span className="text-[14px] font-medium text-grey-600 leading-normal whitespace-nowrap">
                  {rating.toFixed(1)}
                </span>
              </div>
            </div>
            {/* Title */}
            <p className="text-[20px] font-semibold leading-[24px] text-grey-900 w-full">
              {title}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom: progress bar + View button */}
      <div className="flex items-end justify-between w-full">
        {/* Progress */}
        <div className="flex flex-col gap-[4px] items-start justify-center pb-[4px] w-[336px] shrink-0">
          <p className="text-[12px] font-medium text-grey-900 leading-normal">
            {progress}% Complete
          </p>
          {/* Track */}
          <div className="relative w-full h-[15px] rounded-[30px] bg-primary-100">
            <div
              className="absolute inset-y-0 left-0 rounded-[30px] bg-primary"
              style={{ width: `${fill}%` }}
            />
          </div>
        </div>

        {/* View button */}
        <div className="flex items-center justify-center gap-[2px] border-2 border-primary-300 rounded-[8px] px-[16px] py-[12px] w-[90px] shrink-0">
          <span className="text-[16px] font-medium leading-[24px] text-primary text-center whitespace-nowrap">
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
    queryKey: ['courses', 'in-progress'],
    queryFn: getCoursesInProgress,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
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
              <div className="flex items-center justify-center bg-primary rounded-[8px] px-[25px] py-[17px] h-[42px]">
                <span className="text-[16px] font-medium leading-[24px] text-grey-100 whitespace-nowrap">
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

  const cards = enrollments.slice(0, 4)

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
          className="text-[20px] font-medium leading-normal text-primary underline decoration-solid whitespace-nowrap shrink-0 bg-transparent border-0 cursor-pointer hover:text-primary-600 transition-colors"
        >
          See All
        </button>
      </div>

      {/* Real enrollment cards */}
      <div className="flex items-center justify-between w-full gap-[24px]">
        {cards.map(enrollment => (
          <ProgressCourseCard key={enrollment.id} enrollment={enrollment} />
        ))}
      </div>
    </div>
  )
}
