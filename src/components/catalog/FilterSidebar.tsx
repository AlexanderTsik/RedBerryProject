import { useQuery } from '@tanstack/react-query'
import { getCategories, getTopics, getInstructors } from '../../api/filters'
import type { Category, Topic, Instructor } from '../../types'

// Category icons
import IconDevelopment from '../../assets/icons/icon-set/icon-development.svg?react'
import IconDesign from '../../assets/icons/icon-set/icon-design.svg?react'
import IconBusiness from '../../assets/icons/icon-set/icon-business.svg?react'
import IconDataScience from '../../assets/icons/icon-set/icon-data-science.svg?react'
import IconMarketing from '../../assets/icons/icon-set/icon-marketing.svg?react'
import ClearFiltersX from '../../assets/icons/icon-set/clear-filters-X.svg?react'

const CATEGORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Development: IconDevelopment,
  Design: IconDesign,
  Business: IconBusiness,
  'Data Science': IconDataScience,
  Marketing: IconMarketing,
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  selectedCategories: number[]
  selectedTopics: number[]
  selectedInstructors: number[]
  onToggleCategory: (id: number) => void
  onToggleTopic: (id: number) => void
  onToggleInstructor: (id: number) => void
  onClearAll: () => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function FilterSidebar({
  selectedCategories,
  selectedTopics,
  selectedInstructors,
  onToggleCategory,
  onToggleTopic,
  onToggleInstructor,
  onClearAll,
}: Props) {
  // ── Data ───────────────────────────────────────────────────────────────────

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 30,
  })

  const { data: topics = [] } = useQuery<Topic[]>({
    queryKey: ['topics', selectedCategories],
    queryFn: () => getTopics(selectedCategories.length ? selectedCategories : undefined),
    staleTime: 1000 * 60 * 10,
  })

  const { data: instructors = [] } = useQuery<Instructor[]>({
    queryKey: ['instructors'],
    queryFn: getInstructors,
    staleTime: 1000 * 60 * 30,
  })

  const activeCount =
    selectedCategories.length + selectedTopics.length + selectedInstructors.length

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <aside className="flex flex-col gap-[24px] items-start w-full">
      {/* Header */}
      <div className="flex flex-col gap-[32px] items-start w-full">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-[40px] font-semibold leading-[40px] text-grey-950 whitespace-nowrap">
            Filters
          </h2>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="flex items-center gap-[7px] bg-transparent border-0 cursor-pointer"
            >
              <span className="text-[16px] font-medium leading-[24px] text-grey-400 whitespace-nowrap">
                Clear All Filters
              </span>
              <ClearFiltersX className="w-[10px] h-[10px] shrink-0" />
            </button>
          )}
        </div>

        {/* Filter sections */}
        <div className="flex flex-col gap-[56px] items-start w-full">
          {/* Categories */}
          <section className="flex flex-col gap-[24px] items-start w-full">
            <h3 className="text-[18px] font-medium leading-[18px] text-grey-500 w-full">
              Categories
            </h3>
            <div className="flex flex-wrap gap-[8px] items-center w-full">
              {categories.map(cat => {
                const Icon = CATEGORY_ICON[cat.name]
                const active = selectedCategories.includes(cat.id)
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onToggleCategory(cat.id)}
                    className={`group flex items-center gap-[10px] h-[39px] px-[12px] py-[8px] rounded-[12px] border border-solid cursor-pointer transition-colors ${
                      active
                        ? 'bg-primary-50 border-primary-600 text-primary-600'
                        : 'bg-white border-transparent text-grey-500 hover:bg-primary-100 hover:border-transparent hover:text-primary-600'
                    }`}
                  >
                    {Icon && (
                      <Icon
                        className={`size-[24px] shrink-0 transition-colors ${
                          active
                            ? '[&_path]:fill-[#281ED2] [&_path]:stroke-[#281ED2]'
                            : '[&_path]:fill-[#666666] [&_path]:stroke-[#666666] group-hover:[&_path]:fill-[#281ED2] group-hover:[&_path]:stroke-[#281ED2]'
                        }`}
                      />
                    )}
                    <span className="text-[16px] font-medium leading-[24px] whitespace-nowrap">
                      {cat.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Topics */}
          <section className="flex flex-col gap-[24px] items-start w-full">
            <h3 className="text-[18px] font-medium leading-[18px] text-grey-500 w-full">
              Topics
            </h3>
            <div className="flex flex-wrap gap-[8px] items-center w-full">
              {topics.map(topic => {
                const active = selectedTopics.includes(topic.id)
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => onToggleTopic(topic.id)}
                    className={`flex items-center justify-center h-[39px] px-[12px] py-[8px] rounded-[12px] border border-solid cursor-pointer transition-colors ${
                      active
                        ? 'bg-primary-50 border-primary-600 text-primary-600'
                        : 'bg-white border-transparent text-grey-500 hover:bg-primary-100 hover:border-transparent hover:text-primary-600'
                    }`}
                  >
                    <span className="text-[16px] font-medium leading-[24px] whitespace-nowrap">
                      {topic.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Instructors */}
          <section className="flex flex-col gap-[24px] items-start">
            <h3 className="text-[18px] font-medium leading-[18px] text-grey-500">
              Instructor
            </h3>
            <div className="flex flex-col gap-[8px] items-start w-full">
              {instructors.map(inst => {
                const active = selectedInstructors.includes(inst.id)
                return (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => onToggleInstructor(inst.id)}
                    className={`flex items-center gap-[12px] w-full px-[12px] py-[8px] rounded-[12px] border border-solid cursor-pointer transition-colors ${
                      active
                        ? 'bg-primary-50 border-primary-600 text-primary-600'
                        : 'bg-white border-transparent text-grey-500 hover:bg-primary-100 hover:border-transparent hover:text-primary-600'
                    }`}
                  >
                    {inst.avatar ? (
                      <img
                        src={inst.avatar}
                        alt={inst.name}
                        className="size-[30px] rounded-[4px] object-cover shrink-0"
                      />
                    ) : (
                      <div className="size-[30px] rounded-[4px] bg-primary-50 shrink-0" />
                    )}
                    <span className="text-[16px] font-medium leading-[24px] whitespace-nowrap">
                      {inst.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Footer — filter counter */}
      <div className="border-t border-grey-300 pt-[16px] w-full">
        <p className="text-[14px] font-medium text-grey-400 leading-[14px]">
          {activeCount} Filter{activeCount !== 1 ? 's' : ''} Active
        </p>
      </div>
    </aside>
  )
}

