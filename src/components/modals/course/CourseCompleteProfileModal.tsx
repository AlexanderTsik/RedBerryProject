import { primaryButtonClass, secondaryButtonClass } from '../../ui/buttonStyles'
import CourseModalBase from './CourseModalBase'
import ModalUserIcon from '../../../assets/icons/modal/user-icon.svg?react'

type CourseCompleteProfileModalProps = {
  onCompleteProfile: () => void
  onCancel: () => void
}

export default function CourseCompleteProfileModal({
  onCompleteProfile,
  onCancel,
}: CourseCompleteProfileModalProps) {
  return (
    <CourseModalBase onClose={onCancel}>
      <div className="flex w-full flex-col items-center justify-center gap-[24px]">
        <ModalUserIcon className="size-[94px] shrink-0" />
        <div className="flex w-full flex-col items-center gap-[24px] text-center">
          <h2 className="w-full text-[32px] font-semibold leading-[32px] text-grey-700">
            Complete your profile to continue
          </h2>
          <p className="w-full text-[20px] font-medium leading-[20px] text-grey-700">
            You need to complete your profile before enrolling in this course.
          </p>
        </div>
      </div>
      <div className="flex w-full items-center gap-[8px]">
        <button
          type="button"
          onClick={onCompleteProfile}
          className={`${secondaryButtonClass} h-[58px] flex-1`}
        >
          <span className="text-[16px] font-medium leading-[24px] text-current">Complete Profile</span>
        </button>
        <button type="button" onClick={onCancel} className={`${primaryButtonClass} h-[58px] flex-1`}>
          Cancel
        </button>
      </div>
    </CourseModalBase>
  )
}