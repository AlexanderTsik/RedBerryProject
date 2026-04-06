import { useQuery } from '@tanstack/react-query'
import { getFeaturedCourses } from '../../api/courses'
import FeaturedCourseCard from './FeaturedCourseCard'

export default function FeaturedCourses() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses', 'featured'],
    queryFn: getFeaturedCourses,
    staleTime: 1000 * 60 * 10,
  })

  if (isLoading || !courses || courses.length === 0) return null

  return (
    <div className="flex flex-col gap-[32px] items-start w-full">
      {/* Header */}
      <div className="flex flex-col gap-[6px] items-start w-full max-w-[532px]">
        <h2 className="text-[40px] font-semibold leading-[44px] tracking-[-0.2px] text-grey-950 w-full">
          Start Learning Today
        </h2>
        <p className="text-[18px] font-normal leading-[26px] text-grey-700 w-full">
          Choose from our most popular courses and begin your journey
        </p>
      </div>

      {/* Cards row */}
      <div className="flex gap-[24px] items-stretch w-full">
        {courses.map(course => (
          <FeaturedCourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  )
}
