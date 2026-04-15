import { primaryButtonClass } from '../../ui/buttonStyles'
import CourseModalBase from './CourseModalBase'
import ModalSuccessIcon from '../../../assets/icons/modal/success-icon.svg?react'
import RatingStarBase from '../../../assets/icons/icon-set/rating-star-base.svg?react'
import RatingStarColored from '../../../assets/icons/icon-set/rating-star-colored.svg?react'

type CourseCompletedModalProps = {
  courseTitle: string
  isRated: boolean | undefined
  modalRating: number
  modalRatingHover: number
  isRatingPending: boolean
  onClose: () => void
  onRate: (rating: number) => void
  onHoverChange: (rating: number) => void
}

export default function CourseCompletedModal({
  courseTitle,
  isRated,
  modalRating,
  modalRatingHover,
  isRatingPending,
  onClose,
  onRate,
  onHoverChange,
}: CourseCompletedModalProps) {
  return (
    <CourseModalBase onClose={onClose}>
      <div className="flex w-full flex-col items-center justify-center gap-[24px]">
        <ModalSuccessIcon className="size-[94px] shrink-0" />
        <div className="flex w-full flex-col items-center gap-[24px] text-center">
          <h2 className="w-full text-[32px] font-semibold leading-[32px] text-grey-700">
            Congratulations!
          </h2>
          <p className="w-full text-[20px] font-medium leading-[20px] text-grey-700">
            You've completed{' '}
            <span className="font-semibold">"{courseTitle}"</span>{' '}
            Course!
          </p>
        </div>
        {!isRated && (
          <div className="flex w-full flex-col items-center gap-[18px]">
            <span className="text-center text-[16px] font-medium leading-[24px] text-primary-400">
              Rate your experience
            </span>
            <div className="flex items-center justify-center gap-[18px]">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={isRatingPending}
                  onClick={() => onRate(star)}
                  onMouseEnter={() => onHoverChange(star)}
                  onMouseLeave={() => onHoverChange(0)}
                  className="cursor-pointer border-0 bg-transparent p-0"
                >
                  {(modalRatingHover || modalRating) >= star ? (
                    <RatingStarColored className="size-[46px] shrink-0" aria-hidden />
                  ) : (
                    <RatingStarBase className="size-[46px] shrink-0" aria-hidden />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <button type="button" onClick={onClose} className={`${primaryButtonClass} w-full`}>
        Done
      </button>
    </CourseModalBase>
  )
}