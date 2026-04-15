import type { ReactNode } from 'react'

type CourseModalBaseProps = {
  onClose: () => void
  children: ReactNode
}

export default function CourseModalBase({ onClose, children }: CourseModalBaseProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 flex w-[560px] max-w-[90vw] flex-col items-center gap-[40px] rounded-[16px] bg-white p-[60px]">
        {children}
      </div>
    </div>
  )
}