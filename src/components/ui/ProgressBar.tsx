interface Props {
  progress: number    // 0–100, clamped internally
  height?: string     // Tailwind height class, default 'h-[15px]'
  animated?: boolean  // adds transition-all duration-300 to fill
  className?: string  // extra classes on the wrapper track div
}

export default function ProgressBar({ progress, height = 'h-[15px]', animated = false, className }: Props) {
  const clamped = Math.min(100, Math.max(0, progress))

  return (
    <div className={`relative w-full ${height} rounded-[30px] bg-primary-100${className ? ` ${className}` : ''}`}>
      <div
        className={`absolute inset-y-0 left-0 rounded-[30px] bg-primary${animated ? ' transition-all duration-300' : ''}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
