import { Link } from 'react-router-dom'
import type { Course } from '../../types'
import IconStarFill from '../../assets/icons/icon-set/icon-star.svg?react'

interface Props {
  course: Course
}

function formatPrice(price: string | number): string {
  const n = typeof price === 'string' ? parseFloat(price) : price
  return `$${Math.floor(n).toLocaleString('en-US')}`
}

export default function FeaturedCourseCard({ course }: Props) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="flex h-full flex-col gap-[24px] items-start bg-white border-[0.5px] border-grey-100 rounded-[12px] p-[20px] flex-1 min-w-0 no-underline transition-all duration-200 hover:border-primary-200 hover:shadow-[0px_0px_25px_rgba(138,130,212,0.1)] active:border-primary-300 active:border-[1px] active:shadow-[0px_0px_35px_rgba(138,130,212,0.25)]"
    >
      {/* Image */}
      <div className="flex flex-col gap-[16px] items-start w-full">
        <div className="h-[262px] w-full rounded-[10px] overflow-hidden shrink-0">
          {course.image ? (
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary-50" />
          )}
        </div>

        {/* Meta below image */}
        <div className="flex flex-col gap-[12px] items-start w-full">
          {/* Lecturer + rating */}
          <div className="flex flex-wrap items-center justify-between w-full gap-y-[8px]">
            <p className="text-[14px] font-medium leading-normal text-grey-400 whitespace-nowrap">
              Lecturer{' '}
              <span className="text-grey-500">{course.instructor.name}</span>
            </p>
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
          <p className="min-h-[58px] w-full text-[24px] font-semibold leading-normal text-grey-900">
            {course.title}
          </p>
        </div>

        {/* Description */}
        <p className="h-[96px] w-full overflow-hidden text-[16px] font-medium leading-[24px] text-grey-500">
          {course.description}
        </p>
      </div>

      {/* Bottom: price + button (always pinned to card bottom) */}
      <div className="mt-auto flex w-full items-center justify-between">
        <div className="flex gap-[8px] items-center whitespace-nowrap">
          <span className="text-[12px] font-medium text-grey-400 leading-normal">
            Starting from
          </span>
          <span className="text-[32px] font-semibold text-grey-900 leading-normal">
            {formatPrice(course.basePrice)}
          </span>
        </div>

        <div className="flex items-center justify-center gap-[10px] bg-primary rounded-[8px] px-[25px] py-[17px] shrink-0">
          <span className="text-[20px] font-medium text-white leading-normal whitespace-nowrap">
            Details
          </span>
        </div>
      </div>
    </Link>
  )
}
