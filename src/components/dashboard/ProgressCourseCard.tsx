import { Link } from 'react-router-dom'
import type { Enrollment } from '../../types'
import { secondaryButtonClass } from '../ui/buttonStyles'
import { extractCourseRating } from '../../utils/extractCourseRating'
import ProgressBar from '../ui/ProgressBar'
import RatingBadge from '../ui/RatingBadge'
import InstructorMeta from '../ui/InstructorMeta'

interface Props {
  enrollment: Enrollment
  rating?: number | null
}

export default function ProgressCourseCard({ enrollment, rating }: Props) {
  const { course, progress } = enrollment
  const courseRating = rating ?? extractCourseRating(course)

  return (
    <Link
      to={`/courses/${course.id}`}
      className="flex h-full min-w-0 flex-col gap-[12px] items-start rounded-[12px] border-[0.5px] border-grey-100 bg-white p-[20px] shadow-[0px_0px_11.7px_0px_rgba(0,0,0,0.04)] no-underline transition-all duration-200 hover:border-primary-200 hover:shadow-[0px_0px_25px_rgba(138,130,212,0.1)] active:border-primary-300 active:border-[1px] active:shadow-[0px_0px_35px_rgba(138,130,212,0.25)]"
    >
      {/* Top: thumbnail + meta */}
      <div className="flex w-full min-w-0 items-stretch gap-[16px]">
        <div className="flex min-w-0 flex-1 items-start self-stretch">
          {/* Thumbnail */}
          <div className="relative h-[123px] w-[118px] shrink-0 overflow-hidden rounded-[12px] 2xl:w-[132px]">
            {course.image ? (
              <img
                src={course.image}
                alt={course.title}
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-primary-50" />
            )}
          </div>

          {/* Meta */}
          <div className="flex min-w-0 flex-1 flex-col gap-[10px] items-start pl-[16px]">
            {/* Lecturer + rating */}
            <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-x-[12px] gap-y-[8px]">
              <InstructorMeta
                name={course.instructor.name}
                prefix="Lecturer"
                avatarSrc={course.instructor.avatar ?? null}
              />
              <RatingBadge rating={courseRating} className="shrink-0" />
            </div>

            {/* Title */}
            <p className="line-clamp-2 w-full text-[20px] font-semibold leading-[24px] text-grey-900">
              {course.title}
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
          <ProgressBar progress={progress} />
        </div>

        {/* View button */}
        <div className={`${secondaryButtonClass} w-[90px] shrink-0 gap-[2px]`}>
          <span className="text-[16px] font-medium leading-[24px] text-current">
            View
          </span>
        </div>
      </div>
    </Link>
  )
}
