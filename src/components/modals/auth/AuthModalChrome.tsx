import type { ReactNode } from 'react'
import IconClose from '../../../assets/icons/modal/icon-close.svg?react'
import IconArrowBack from '../../../assets/icons/modal/icon-arrow-back.svg?react'

type Props = {
  children: ReactNode
  onClose: () => void
  showBack?: boolean
  onBack?: () => void
}

export function AuthModalChrome({ children, onClose, showBack, onBack }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div
        className="relative w-full max-w-[460px] rounded-xl bg-white p-[50px] shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        {showBack && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="absolute left-[17px] top-[16px] flex h-8 w-8 items-center justify-center rounded-lg text-grey-400 transition-colors hover:bg-grey-100 hover:text-grey-600"
            aria-label="Back"
          >
            <IconArrowBack className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-[15px] top-[20px] flex h-6 w-6 items-center justify-center text-grey-400 transition-colors hover:text-grey-600"
          aria-label="Close"
        >
          <IconClose className="h-6 w-6" />
        </button>
        {children}
      </div>
    </div>
  )
}

export function AuthModalDivider() {
  return (
    <div className="relative flex h-[21px] w-full max-w-[320px] shrink-0 items-center justify-center self-center">
      <div className="absolute inset-x-0 top-[9px] h-px bg-grey-200" />
      <span className="relative bg-white px-2.5 text-[14px] font-medium leading-[1.21] text-grey-400">or</span>
    </div>
  )
}

export const authFieldLabelClass =
  'block text-[14px] font-medium leading-[1.21] text-grey-700'

export const authFieldLabelErrorClass =
  'block text-[14px] font-medium leading-[1.21] text-error'

export const authTextInputClass =
  'w-full rounded-lg border-[1.5px] border-grey-200 bg-white px-[13px] py-3 text-[14px] font-medium leading-[1.21] text-grey-700 placeholder:text-grey-400 transition-colors hover:border-grey-300 focus:border-grey-400 focus:outline-none'

export const authTextInputErrorClass =
  'border-error text-error placeholder:text-error hover:border-error focus:border-error'

export const authInputWrapClass =
  'flex h-12 items-center rounded-lg border-[1.5px] border-grey-200 bg-white px-[13px] pr-3 transition-colors hover:border-grey-300 focus-within:border-grey-400'

export const authInputWrapErrorClass =
  'border-error hover:border-error focus-within:border-error'

export const authInputFieldClass =
  'min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] font-medium leading-[1.21] text-grey-700 placeholder:text-grey-400 focus:outline-none'

export const authInputFieldErrorClass =
  'text-error placeholder:text-error'
