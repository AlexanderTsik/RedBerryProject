import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getCourses } from '../api/courses'
import type { CoursesParams } from '../api/courses'
import FilterSidebar from '../components/catalog/FilterSidebar'
import CatalogCourseCard from '../components/catalog/CatalogCourseCard'
import Pagination from '../components/catalog/Pagination'
import DropdownArrow from '../assets/Icons/icon-set/icon-arrow-dropdown.svg?react'
import BreadcrumbArrow from '../assets/Icons/icon-set/icon-arrow-breadcrumb.svg?react'
// Sort options
const SORT_OPTIONS: { value: CoursesParams['sort']; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Popular' },
  { value: 'title_asc', label: 'Title: A-Z' },
]


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
    <div className="min-h-screen bg-grey-100">
    <div className="layout-frame flex flex-col gap-[32px] pt-[72px] pb-[40px]">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-[2px]">
        <div className="flex shrink-0 items-center gap-[4px] px-[4px] py-[2px]">
          <Link to="/" className="text-[18px] font-medium leading-[18px] text-grey-500 no-underline whitespace-nowrap">
            Home
          </Link>
          <span className="flex h-[24px] w-[12px] shrink-0 items-center justify-center">
            <BreadcrumbArrow className="h-[13px] w-[8px] shrink-0" />
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-[4px] px-[4px] py-[2px]">
          <span className="text-[18px] font-medium leading-[18px] text-primary-400 whitespace-nowrap">
            Browse
          </span>
        </div>
      </nav>

      {/* Main layout */}
      <div className="flex gap-[48px] items-start">
        {/* Sidebar */}
        <div className="w-[351px] shrink-0 self-start sticky top-[24px]">
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
                <DropdownArrow
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
                  <div className="absolute right-0 top-[calc(100%+4px)] z-20 w-[234px] rounded-[10px] border border-grey-100 bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
                    {SORT_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSort(option.value)
                          setSortOpen(false)
                        }}
                        className="flex w-full items-center border-0 bg-white px-[20px] py-[10px] text-[16px] font-medium leading-[24px] text-grey-500 cursor-pointer transition-colors hover:bg-primary-100 hover:text-primary"
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
    </div>
  )
}
