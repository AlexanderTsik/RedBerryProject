import { Link } from 'react-router-dom'
import type { Course } from '../../types'
import { formatPrice } from '../../utils/formatPrice'
import { primaryButtonClass } from '../ui/buttonStyles'
import RatingBadge from '../ui/RatingBadge'
import InstructorMeta from '../ui/InstructorMeta'

// Map category name → icon-set SVG (loaded eagerly so vite can tree-shake)
import IconDevelopment from '../../assets/icons/icon-set/icon-development.svg?react'
import IconDesign from '../../assets/icons/icon-set/icon-design.svg?react'
import IconBusiness from '../../assets/icons/icon-set/icon-business.svg?react'
import IconDataScience from '../../assets/icons/icon-set/icon-data-science.svg?react'
import IconMarketing from '../../assets/icons/icon-set/icon-marketing.svg?react'

const CATEGORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Development: IconDevelopment,
  Design: IconDesign,
  Business: IconBusiness,
  'Data Science': IconDataScience,
  Marketing: IconMarketing,
}

interface Props {
  course: Course
}

export default function CatalogCourseCard({ course }: Props) {
  const CatIcon = CATEGORY_ICON[course.category.name]

  return (
    <Link
      to={`/courses/${course.id}`}
      className="flex flex-col h-full bg-white border border-grey-100 rounded-[12px] overflow-clip p-[20px] no-underline transition-[filter] duration-200 hover:drop-shadow-[0px_0px_25px_rgba(138,130,212,0.1)] active:drop-shadow-[0px_0px_45px_rgba(138,130,212,0.15)]"
    >
      {/* Inner wrapper with gap-[18px] */}
      <div className="flex flex-col gap-[18px] items-start w-full flex-1">
        {/* Top section: image + meta + title + category */}
        <div className="flex flex-col gap-[18px] items-start w-full">
          {/* Image */}
          <div className="w-full h-[181px] relative rounded-[10px] overflow-hidden shrink-0">
            {course.image ? (
              <img
                src={course.image}
                alt={course.title}
                className="absolute inset-0 size-full object-cover rounded-[10px]"
              />
            ) : (
              <div className="absolute inset-0 bg-primary-50 rounded-[10px]" />
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col items-start w-full">
            <div className="flex flex-col gap-[12px] items-start w-full">
              {/* Meta: instructor | weeks | star rating */}
              <div className="flex flex-wrap gap-y-[8px] items-center justify-between w-full">
                <InstructorMeta
                  name={course.instructor.name}
                  secondaryText={`${course.durationWeeks} Weeks`}
                  className="gap-[8px]"
                />
                <RatingBadge
                  rating={course.avgRating}
                  className="shrink-0"
                  textClassName="text-[14px] font-medium text-grey-600 leading-[14px] whitespace-nowrap"
                />
              </div>

              {/* Title */}
              <p className="text-[24px] font-semibold leading-[24px] text-grey-950">
                {course.title}
              </p>
            </div>
          </div>

          {/* Category chip */}
          <div className="flex flex-wrap gap-y-[8px] items-start w-full">
            <div className="flex items-center justify-center gap-[6px] bg-grey-100 rounded-[12px] px-[12px] py-[8px]">
              {CatIcon && <CatIcon className="size-[18px] shrink-0" />}
              <span className="text-[16px] font-medium leading-[24px] text-grey-600 whitespace-nowrap text-center">
                {course.category.name}
              </span>
            </div>
          </div>
        </div>

        {/* Price + Details row */}
        <div className="mt-auto flex items-center justify-between w-full h-[48px]">
          <div className="flex flex-col items-start justify-center leading-normal whitespace-nowrap w-[144px]">
            <span className="text-[12px] font-medium leading-[12px] text-grey-300">
              Starting from
            </span>
            <span className="text-[24px] font-semibold leading-[24px] text-grey-700">
              {formatPrice(course.basePrice)}
            </span>
          </div>
          <div className={`${primaryButtonClass} h-full shrink-0 text-[16px] font-medium`}>
            Details
          </div>
        </div>
      </div>
    </Link>
  )
}

