type Props = {
  name: string
  prefix?: string
  secondaryText?: string
  avatarSrc?: string | null
  avatarClassName?: string
  avatarFallbackClassName?: string
  className?: string
  nameClassName?: string
  prefixClassName?: string
  secondaryClassName?: string
  dividerClassName?: string
}

export default function InstructorMeta({
  name,
  prefix,
  secondaryText,
  avatarSrc,
  avatarClassName = 'h-[24px] w-[24px] rounded-full object-cover shrink-0',
  avatarFallbackClassName = 'h-[24px] w-[24px] rounded-full bg-primary-100 shrink-0',
  className,
  nameClassName = 'text-grey-500',
  prefixClassName = 'text-[14px] font-medium text-grey-400 whitespace-nowrap leading-normal',
  secondaryClassName = 'text-[14px] font-medium leading-[14px] text-grey-300 whitespace-nowrap',
  dividerClassName = 'w-[2px] h-[14px] bg-grey-200 rounded-[100px] shrink-0',
}: Props) {
  return (
    <div className={`flex items-center gap-[6px] min-w-0${className ? ` ${className}` : ''}`}>
      {avatarSrc !== undefined && (
        avatarSrc ? (
          <img src={avatarSrc} alt={name} className={avatarClassName} />
        ) : (
          <div className={avatarFallbackClassName} />
        )
      )}

      {prefix ? (
        <p className={prefixClassName}>
          {prefix}{' '}
          <span className={nameClassName}>{name}</span>
        </p>
      ) : (
        <p className={secondaryClassName}>{name}</p>
      )}

      {secondaryText && (
        <>
          <div className={dividerClassName} />
          <p className={secondaryClassName}>{secondaryText}</p>
        </>
      )}
    </div>
  )
}
