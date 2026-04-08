import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getCourses } from '../api/courses'
import type { CoursesParams } from '../api/courses'
import FilterSidebar from '../components/catalog/FilterSidebar'
import CatalogCourseCard from '../components/catalog/CatalogCourseCard'
import Pagination from '../components/catalog/Pagination'
/** Sort dropdown chevron arrow */
function SortChevron({ className }: { className?: string }) {
  return (
    <svg width="13" height="8" viewBox="196 19 16 11" fill="none" className={className}>
      <path
        d="M210.445 22.0012L205.151 27.2952C205.029 27.4171 204.884 27.5138 204.725 27.5798C204.566 27.6457 204.395 27.6797 204.222 27.6797C204.05 27.6797 203.879 27.6457 203.72 27.5798C203.561 27.5138 203.416 27.4171 203.294 27.2952L198 22.001"
        stroke="#666666"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Sort options
const SORT_OPTIONS: { value: CoursesParams['sort']; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Popular' },
  { value: 'title_asc', label: 'Title: A-Z' },
]

/** Breadcrumb arrow separator (chevron right) */
function BreadcrumbArrow() {
  return (
    <svg width="12" height="24" viewBox="61 0 12 28" fill="none" className="shrink-0">
      <path
        d="M61.452 8.58023L62.513 7.52024L68.292 13.2972C68.3851 13.3898 68.4591 13.4999 68.5095 13.6211C68.56 13.7424 68.5859 13.8724 68.5859 14.0037C68.5859 14.1351 68.56 14.2651 68.5095 14.3863C68.4591 14.5076 68.3851 14.6177 68.292 14.7102L62.513 20.4902L61.453 19.4302L66.877 14.0052L61.452 8.58023Z"
        fill="#666666"
      />
    </svg>
  )
}

export default function CatalogPage() {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [selectedTopics, setSelectedTopics] = useState<number[]>([])
  const [selectedInstructors, setSelectedInstructors] = useState<number[]>([])
  const [sort, setSort] = useState<CoursesParams['sort']>('newest')
  const [page, setPage] = useState(1)
  const [sortOpen, setSortOpen] = useState(false)

  // Reset page when filters or sort change
  useEffect(() => {
    setPage(1)
  }, [selectedCategories, selectedTopics, selectedInstructors, sort])

  // ── Toggle helpers ────────────────────────────────────────────────────────
  const toggleCategory = useCallback((id: number) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id],
    )
    // Clear topics when categories change (topics are category-dependent)
    setSelectedTopics([])
  }, [])

  const toggleTopic = useCallback((id: number) => {
    setSelectedTopics(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id],
    )
  }, [])

  const toggleInstructor = useCallback((id: number) => {
    setSelectedInstructors(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    )
  }, [])

  const clearAll = useCallback(() => {
    setSelectedCategories([])
    setSelectedTopics([])
    setSelectedInstructors([])
  }, [])

  // ── Query params ──────────────────────────────────────────────────────────
  const params: CoursesParams = {
    page,
    sort,
    ...(selectedCategories.length && { 'categories[]': selectedCategories }),
    ...(selectedTopics.length && { 'topics[]': selectedTopics }),
    ...(selectedInstructors.length && { 'instructors[]': selectedInstructors }),
  }

  const { data, isLoading } = useQuery({
    queryKey: ['courses', params],
    queryFn: () => getCourses(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  })

  const courses = data?.data ?? []
  const meta = data?.meta

  // ── Sort label ────────────────────────────────────────────────────────────
  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label ?? 'Sort'

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="layout-frame flex flex-col gap-[32px] py-[40px]">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-[2px]">
        <div className="flex items-center gap-[4px] px-[4px] py-[2px]">
          <Link to="/" className="text-[18px] font-medium leading-normal text-grey-500 no-underline hover:text-primary transition-colors whitespace-nowrap">
            Home
          </Link>
          <BreadcrumbArrow />
        </div>
        <div className="flex items-center gap-[4px] px-[4px] py-[2px]">
          <span className="text-[18px] font-medium leading-normal text-primary-400 whitespace-nowrap">
            Browse
          </span>
        </div>
      </nav>

      {/* Main layout */}
      <div className="flex gap-[48px] items-start">
        {/* Sidebar */}
        <div className="w-[270px] shrink-0 self-start sticky top-[24px]">
          <FilterSidebar
            selectedCategories={selectedCategories}
            selectedTopics={selectedTopics}
            selectedInstructors={selectedInstructors}
            onToggleCategory={toggleCategory}
            onToggleTopic={toggleTopic}
            onToggleInstructor={toggleInstructor}
            onClearAll={clearAll}
          />
        </div>

        {/* Course grid area */}
        <div className="flex-1 flex flex-col gap-[24px] min-w-0">
          {/* Top bar: results count + sort */}
          <div className="flex items-center justify-between w-full">
            <p className="text-[16px] font-medium leading-[24px] text-grey-500">
              {meta
                ? `Showing ${courses.length} out of ${meta.total}`
                : 'Loading...'}
            </p>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSortOpen(prev => !prev)}
                className="flex items-center gap-[8px] h-[49px] px-[20px] py-[7px] rounded-[10px] border border-grey-100 bg-white text-[16px] font-medium leading-[24px] cursor-pointer hover:border-grey-200 transition-colors"
              >
                <span className="flex items-center gap-[8px] whitespace-nowrap">
                  <span className="text-grey-500">Sort By:</span>
                  <span className="text-primary">{currentSortLabel}</span>
                </span>
                <SortChevron
                  className={`shrink-0 transition-transform ${sortOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {sortOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setSortOpen(false)}
                  />
                  {/* Dropdown menu */}
                  <div className="absolute right-0 top-[calc(100%+4px)] z-20 w-[220px] rounded-[10px] border border-grey-100 bg-white py-[4px] shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
                    {SORT_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSort(option.value)
                          setSortOpen(false)
                        }}
                        className={`flex w-full items-center px-[20px] py-[10px] text-[16px] font-medium leading-[24px] border-0 cursor-pointer transition-colors ${
                          sort === option.value
                            ? 'bg-primary-50 text-primary'
                            : 'bg-white text-grey-500 hover:bg-grey-100'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Course grid */}
          {isLoading ? (
            <div className="grid grid-cols-3 gap-[24px]">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col bg-white rounded-[12px] overflow-hidden animate-pulse"
                >
                  <div className="w-full h-[200px] bg-grey-200" />
                  <div className="flex flex-col gap-[12px] p-[16px]">
                    <div className="h-[12px] w-2/3 bg-grey-200 rounded" />
                    <div className="h-[20px] w-full bg-grey-200 rounded" />
                    <div className="h-[14px] w-1/3 bg-grey-200 rounded" />
                    <div className="h-[24px] w-1/2 bg-grey-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[80px] gap-[16px]">
              <p className="text-[20px] font-semibold text-grey-900">No courses found</p>
              <p className="text-[16px] font-medium text-grey-400">
                Try adjusting your filters or browse all courses
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-[24px]">
              {courses.map(course => (
                <CatalogCourseCard key={course.id} course={course} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta && meta.lastPage > 1 && (
            <div className="pt-[16px]">
              <Pagination
                currentPage={meta.currentPage}
                lastPage={meta.lastPage}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
