import IconStarFill from '../../assets/icons/icon-set/icon-star.svg?react'

type Props = {
  rating: number | null | undefined
  className?: string
  iconClassName?: string
  textClassName?: string
}

export default function RatingBadge({
  rating,
  className,
  iconClassName = 'size-[18px] shrink-0',
  textClassName = 'text-[14px] font-medium text-grey-600 leading-normal whitespace-nowrap',
}: Props) {
  if (rating == null) return null

  return (
    <div className={`flex items-center gap-[4px]${className ? ` ${className}` : ''}`}>
      <IconStarFill className={iconClassName} aria-hidden />
      <span className={textClassName}>{rating.toFixed(1)}</span>
    </div>
  )
}
