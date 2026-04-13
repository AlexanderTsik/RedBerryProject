import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'
import { useModal } from '../../hooks/useModal'
import logo from '../../assets/icons/logo.svg'
import avatarDefault from '../../assets/icons/nav-icons/avatar-default.svg'
import NavSparkleIcon from '../../assets/icons/nav-icons/nav-sparkle.svg?react'
import NavBookIcon from '../../assets/icons/nav-icons/nav-book.svg?react'
import IncompleteIndicator from '../../assets/icons/nav-icons/incomplete-indicator.svg?react'
import CompleteIndicator from '../../assets/icons/nav-icons/complete-indicator.svg?react'

const navItemClass =
  'flex items-center gap-2 rounded-lg p-[15px] text-[20px] font-medium leading-[20px] text-grey-600 no-underline transition-colors duration-200 hover:text-primary'

const navIconClass = 'h-[26px] w-[26px] shrink-0'

export default function Navbar() {
  const { isAuthenticated, user } = useAuth()
  const { openModal, openSidebar } = useModal()
  const location = useLocation()
  const isBrowsePage = location.pathname === '/courses'

  return (
    <header className="w-full shrink-0 border-b border-grey-200 bg-grey-100 py-[24px] shadow-[0_0_11.7px_rgba(0,0,0,0.04)]">
      <div className="layout-frame flex h-[60px] items-center justify-between">
        <Link to="/" className="block shrink-0">
          <img src={logo} alt="RedClass" className="block h-[60px] w-[60px] rounded-[14px]" />
        </Link>

        {isAuthenticated ? (
          <div className="flex h-[56px] items-center gap-9">
            <nav className="flex items-center gap-0">
              <Link to="/courses" className={`${navItemClass} cursor-pointer border-0 bg-transparent ${isBrowsePage ? '!text-primary' : ''}`}>
                <NavSparkleIcon className={navIconClass} aria-hidden />
                Browse Courses
              </Link>
              <button
                type="button"
                onClick={openSidebar}
                className={`${navItemClass} cursor-pointer border-0 bg-transparent font-inherit`}
              >
                <NavBookIcon className={navIconClass} aria-hidden />
                Enrolled Courses
              </button>
            </nav>

            <button
              type="button"
              onClick={() => openModal('profile')}
              className="relative flex h-[56px] w-[56px] shrink-0 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-transparent bg-primary-50 p-0 transition-colors hover:border-primary-200 hover:bg-primary-50"
              aria-label="Profile"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                <img src={avatarDefault} alt="" className="h-[38px] w-[38px] rounded-full object-cover" />
              )}
              {/* Status indicator positioned at bottom-right */}
              <div className="absolute bottom-0 right-0 z-10">
                {user?.profileComplete ? (
                  <CompleteIndicator aria-hidden />
                ) : (
                  <IncompleteIndicator aria-hidden />
                )}
              </div>
            </button>
          </div>
        ) : (
          <div className="flex h-[56px] items-center gap-[43px]">
            <nav className="flex items-center gap-0">
              <Link to="/courses" className={`${navItemClass} border-0 bg-transparent ${isBrowsePage ? '!text-primary' : ''}`}>
                <NavSparkleIcon className={navIconClass} aria-hidden />
                Browse Courses
              </Link>
            </nav>

            <div className="flex items-center gap-[15px]">
              <button
                type="button"
                onClick={() => openModal('login')}
                className="box-border flex h-[60px] w-[114px] cursor-pointer items-center justify-center rounded-lg border-2 border-primary-300 bg-transparent text-[20px] font-medium leading-[20px] text-primary transition-colors hover:bg-primary-50"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => openModal('register')}
                className="box-border flex h-[60px] cursor-pointer items-center justify-center rounded-lg border-0 bg-primary px-[25px] py-[17px] text-[20px] font-medium leading-[20px] text-white transition-colors hover:bg-primary-600"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
