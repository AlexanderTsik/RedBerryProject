import { Link } from 'react-router-dom'
import type { Enrollment } from '../../types'
import { secondaryButtonClass } from '../ui/buttonStyles'
import ProgressBar from '../ui/ProgressBar'
import RatingBadge from '../ui/RatingBadge'
import InstructorMeta from '../ui/InstructorMeta'

interface Props {
  enrollment: Enrollment
}

export default function ProgressCourseCard({ enrollment }: Props) {
  const { course, progress } = enrollment

  return (
    <Link
      to={`/courses/${course.id}`}
      className="flex flex-col gap-[8px] items-start bg-white border-[0.5px] border-grey-100 rounded-[12px] p-[20px] shadow-[0px_0px_11.7px_0px_rgba(0,0,0,0.04)] w-full no-underline transition-all duration-200 hover:border-primary-200 hover:shadow-[0px_0px_25px_rgba(138,130,212,0.1)] active:border-primary-300 active:border-[1px] active:shadow-[0px_0px_35px_rgba(138,130,212,0.25)]"
    >
      {/* Top: thumbnail + meta */}
      <div className="flex h-[123px] items-stretch w-full gap-0">
        <div className="flex flex-1 items-center justify-between self-stretch min-w-0">
          {/* Thumbnail */}
          <div className="h-[123px] w-full max-w-[140px] shrink-0 relative rounded-[12px] overflow-hidden">
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
          <div className="flex flex-1 flex-col gap-[9px] h-full items-start min-w-0 pl-[16px] pr-[4px]">
            {/* Lecturer + rating */}
            <div className="flex flex-wrap items-center justify-between w-full gap-y-[8px]">
              <InstructorMeta
                name={course.instructor.name}
                prefix="Lecturer"
                avatarSrc={course.instructor.avatar ?? null}
              />
              <RatingBadge rating={course.avgRating} />
            </div>

            {/* Title */}
            <p className="text-[20px] font-semibold leading-[24px] text-grey-900 w-full">
              {course.title}
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
