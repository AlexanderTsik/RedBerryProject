import PaginationArrowRight from '../../assets/icons/icon-set/pagination-arrow-right.svg?react'

interface Props {
  currentPage: number
  lastPage: number
  onPageChange: (page: number) => void
}

/** Arrow icon — right arrow by default; pass `direction="left"` to flip. */
function ArrowIcon({ disabled, direction = 'right' }: { disabled?: boolean; direction?: 'left' | 'right' }) {
  return (
    <PaginationArrowRight
      className={`shrink-0 ${direction === 'left' ? 'rotate-180' : ''} ${
        disabled ? '[&_path]:fill-[#D1D1D1]' : '[&_path]:fill-[#4F46E5]'
      }`}
    />
  )
}

export default function Pagination({ currentPage, lastPage, onPageChange }: Props) {
  if (lastPage <= 1) return null

  // Build visible page numbers: 1 2 3 … last
  const pages: (number | '...')[] = []
  const addPage = (p: number) => {
    if (!pages.includes(p)) pages.push(p)
  }

  addPage(1)
  if (currentPage > 3) pages.push('...')
  for (let p = Math.max(2, currentPage - 1); p <= Math.min(lastPage - 1, currentPage + 1); p++) {
    addPage(p)
  }
  if (currentPage < lastPage - 2) pages.push('...')
  if (lastPage > 1) addPage(lastPage)

  const btnBase =
    'flex items-center justify-center size-[40px] rounded-[4px] text-[16px] font-medium leading-[24px] border border-solid border-grey-200 cursor-pointer transition-colors'

  return (
    <nav aria-label="Pagination" className="flex items-center gap-[8px] justify-center w-full">
      {/* Prev */}
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={`${btnBase} bg-white disabled:cursor-not-allowed`}
        aria-label="Previous page"
      >
        <ArrowIcon direction="left" disabled={currentPage <= 1} />
      </button>

      {/* Pages */}
      {pages.map((p, i) =>
        p === '...' ? (
          <span
            key={`dots-${i}`}
            className={`${btnBase} bg-white text-primary cursor-default`}
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`${btnBase} ${
              p === currentPage
                ? 'bg-primary-600 border-primary text-white'
                : 'bg-white text-primary'
            }`}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p}
          </button>
        ),
      )}

      {/* Next */}
      <button
        type="button"
        disabled={currentPage >= lastPage}
        onClick={() => onPageChange(currentPage + 1)}
        className={`${btnBase} bg-white disabled:cursor-not-allowed`}
        aria-label="Next page"
      >
        <ArrowIcon direction="right" disabled={currentPage >= lastPage} />
      </button>
    </nav>
  )
}
