import { primaryButtonClass, secondaryButtonClass } from '../../ui/buttonStyles'
import type { ScheduleConflict } from '../../../types'
import CourseModalBase from './CourseModalBase'
import ModalWarningIcon from '../../../assets/icons/modal/warning-icon.svg?react'

function formatWeekLabel(label: string): string {
  if (/weekend/i.test(label) && /saturday/i.test(label) && /sunday/i.test(label)) {
    return 'Weekend'
  }

  const map: Record<string, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
    weekend: 'Weekend',
  }

  return label.replace(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Weekend/gi, (match) => {
    return map[match.toLowerCase()] ?? match
  })
}

function formatCompactMeridiemTime(time: string): string {
  return time.replace(/:00\s*/i, '').replace(/\s+/g, '')
}

function formatConflictScheduleLabel(schedule: string): string {
  const [daysPart, timePart] = schedule.split(/\s+at\s+/i)

  if (!timePart) {
    return formatWeekLabel(daysPart).replace(/\s-\s/g, '-')
  }

  const timeMatch = timePart.match(/\(([^)]+)\)/)
  const rawRange = timeMatch?.[1] ?? timePart
  const [startTime = '', endTime = ''] = rawRange.split(/\s*-\s*/)
  const compactDays = formatWeekLabel(daysPart).replace(/\s-\s/g, '-')
  const compactStart = formatCompactMeridiemTime(startTime)
  const compactEnd = formatCompactMeridiemTime(endTime)

  return `${compactDays} at ${compactStart} - ${compactEnd}`.trim()
}

type CourseEnrollmentConflictModalProps = {
  conflicts: ScheduleConflict[]
  onContinue: () => void
  onCancel: () => void
}

export default function CourseEnrollmentConflictModal({
  conflicts,
  onContinue,
  onCancel,
}: CourseEnrollmentConflictModalProps) {
  return (
    <CourseModalBase onClose={onCancel}>
      <div className="flex w-full flex-col items-center justify-center gap-[24px]">
        <ModalWarningIcon className="size-[94px] shrink-0" />
        <div className="flex w-full flex-col items-center gap-[24px] text-center">
          <h2 className="w-full text-[32px] font-semibold leading-[32px] text-grey-700">
            Enrollment Conflict
          </h2>
          <div className="w-full text-[20px] font-medium leading-[20px] text-grey-700">
            {conflicts.map((conflict, index) => (
              <p key={index}>
                You are already enrolled in{' '}
                <span className="font-semibold">"{conflict.conflictingCourseName}"</span>{' '}
                with the same schedule: {formatConflictScheduleLabel(conflict.schedule)}
              </p>
            ))}
          </div>
        </div>
      </div>
      <div className="flex w-full items-center gap-[8px]">
        <button type="button" onClick={onContinue} className={`${secondaryButtonClass} flex-1`}>
          <span className="text-[16px] font-medium leading-[24px] text-current">Continue Anyway</span>
        </button>
        <button type="button" onClick={onCancel} className={`${primaryButtonClass} flex-1`}>
          Cancel
        </button>
      </div>
    </CourseModalBase>
  )
}