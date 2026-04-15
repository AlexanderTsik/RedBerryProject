import { primaryButtonClass } from '../../ui/buttonStyles'
import CourseModalBase from './CourseModalBase'
import ModalCompleteIcon from '../../../assets/icons/modal/complete-icon.svg?react'

type CourseEnrollmentConfirmedModalProps = {
  courseTitle: string
  onClose: () => void
}

export default function CourseEnrollmentConfirmedModal({
  courseTitle,
  onClose,
}: CourseEnrollmentConfirmedModalProps) {
  return (
    <CourseModalBase onClose={onClose}>
      <div className="flex w-full flex-col items-center justify-center gap-[24px]">
        <ModalCompleteIcon className="size-[94px] shrink-0" />
        <div className="flex w-full flex-col items-center gap-[24px] text-center">
          <h2 className="w-full text-[32px] font-semibold leading-[32px] text-grey-700">
            Enrollment Confirmed!
          </h2>
          <p className="w-full text-[20px] font-medium leading-[20px] text-grey-700">
            You've successfully enrolled to the{' '}
            <span className="font-semibold">"{courseTitle}"</span>{' '}
            Course!
          </p>
        </div>
      </div>
      <button type="button" onClick={onClose} className={`${primaryButtonClass} w-full`}>
        Done
      </button>
    </CourseModalBase>
  )
}