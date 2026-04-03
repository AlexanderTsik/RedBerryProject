import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type ModalType = 'login' | 'register' | 'profile' | 'sidebar' | null

interface ModalState {
  activeModal: ModalType
  openModal: (modal: ModalType) => void
  closeModal: () => void
  isSidebarOpen: boolean
  openSidebar: () => void
  closeSidebar: () => void
}

const ModalContext = createContext<ModalState | null>(null)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const openModal = useCallback((modal: ModalType) => setActiveModal(modal), [])
  const closeModal = useCallback(() => setActiveModal(null), [])
  const openSidebar = useCallback(() => setIsSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])

  return (
    <ModalContext.Provider value={{ activeModal, openModal, closeModal, isSidebarOpen, openSidebar, closeSidebar }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModal(): ModalState {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used inside ModalProvider')
  return ctx
}
