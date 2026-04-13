import { Link } from 'react-router-dom'
import type { Enrollment } from '../../types'
import IconStarFill from '../../assets/icons/icon-set/icon-star.svg?react'
import { secondaryActionBaseClass, secondaryActionPurpleInteractiveClass } from '../ui/buttonStyles'

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
              {/* Instructor avatar + name */}
              <div className="flex items-center gap-[6px] min-w-0">
                {course.instructor.avatar ? (
                  <img
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    className="h-[24px] w-[24px] rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="h-[24px] w-[24px] rounded-full bg-primary-100 shrink-0" />
                )}
                <p className="text-[14px] font-medium text-grey-400 whitespace-nowrap leading-normal">
                  Lecturer{' '}
                  <span className="text-grey-500">{course.instructor.name}</span>
                </p>
              </div>
              {/* Rating — only shown when available */}
              {course.avgRating != null && (
                <div className="flex items-center gap-[4px]">
                  <IconStarFill className="size-[18px] shrink-0" aria-hidden />
                  <span className="text-[14px] font-medium text-grey-600 leading-normal whitespace-nowrap">
                    {course.avgRating.toFixed(1)}
                  </span>
                </div>
              )}
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
          <div className="relative w-full h-[15px] rounded-[30px] bg-primary-100">
            <div
              className="absolute inset-y-0 left-0 rounded-[30px] bg-primary"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>

        {/* View button */}
        <div className={`${secondaryActionBaseClass} ${secondaryActionPurpleInteractiveClass} w-[90px] shrink-0 gap-[2px]`}>
          <span className="text-[16px] font-medium leading-[24px] text-current">
            View
          </span>
        </div>
      </div>
    </Link>
  )
}
