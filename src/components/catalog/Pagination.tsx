interface Props {
  currentPage: number
  lastPage: number
  onPageChange: (page: number) => void
}

/** Arrow icon — points left by default; pass `direction="right"` to flip. */
function ArrowIcon({ disabled, direction = 'left' }: { disabled?: boolean; direction?: 'left' | 'right' }) {
  return (
    <svg
      width="15"
      height="23"
      viewBox="0 0 15 23"
      fill="none"
      className={`shrink-0 ${direction === 'right' ? 'rotate-180' : ''}`}
    >
      <path
        d="M7.24077 4.78977L8.2635 5.80114L4.71236 9.35227L13.6328 9.35227L13.6328 10.8295L4.71236 10.8295L8.26349 14.375L7.24077 15.392L1.93963 10.0909L7.24077 4.78977Z"
        fill={disabled ? '#D1D1D1' : '#4F46E5'}
      />
    </svg>
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
