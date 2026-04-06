import { Link } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'
import { useModal } from '../../hooks/useModal'
import logo from '../../assets/icons/logo.svg'
import avatarDefault from '../../assets/icons/nav-icons/avatar-default.svg'
import NavSparkleIcon from '../../assets/icons/nav-icons/nav-sparkle.svg?react'
import NavBookIcon from '../../assets/icons/nav-icons/nav-book.svg?react'

const navItemClass =
  'flex items-center gap-2 rounded-lg p-[15px] text-[20px] font-medium leading-[1.21] text-grey-600 no-underline transition-colors duration-200 hover:text-primary'

const navIconClass = 'h-[26px] w-[26px] shrink-0'

export default function Navbar() {
  const { isAuthenticated, user } = useAuth()
  const { openModal, openSidebar } = useModal()

  return (
    <header className="w-full shrink-0 border-b border-grey-200 bg-grey-100 shadow-[0_0_11.7px_rgba(0,0,0,0.04)]">
      <div className="layout-frame flex h-[104px] items-center justify-between">
        <Link to="/" className="block shrink-0">
          <img src={logo} alt="RedClass" className="block h-[60px] w-[60px] rounded-[14px]" />
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-9">
            <nav className="flex h-14 items-center">
              <Link to="/courses" className={`${navItemClass} cursor-pointer border-0 bg-transparent`}>
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
              className="box-border flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-transparent bg-transparent p-0 transition-colors hover:border-primary-200"
              aria-label="Profile"
            >
              {/* Always show a relative wrapper so the status dot is always visible */}
              <span className="relative flex h-full w-full items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <img src={avatarDefault} alt="" className="h-full w-full rounded-full object-cover" />
                )}
                {/* Status dot: orange = incomplete, green = complete (Figma node 457-2936, 18×18 px) */}
                <span
                  aria-hidden
                  className={[
                    'absolute bottom-0 right-0 box-border h-[18px] w-[18px] rounded-full border-2 border-white',
                    user?.profileComplete ? 'bg-success' : 'bg-warning',
                  ].join(' ')}
                />
              </span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-[43px]">
            <nav className="flex h-14 items-center">
              <Link to="/courses" className={`${navItemClass} border-0 bg-transparent`}>
                <NavSparkleIcon className={navIconClass} aria-hidden />
                Browse Courses
              </Link>
            </nav>

            <div className="flex items-center gap-[15px]">
              <button
                type="button"
                onClick={() => openModal('login')}
                className="box-border flex h-[60px] w-[114px] cursor-pointer items-center justify-center rounded-lg border-2 border-primary-300 bg-transparent text-[20px] font-medium leading-[1.21] text-primary transition-colors hover:bg-primary-50"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => openModal('register')}
                className="box-border flex h-[60px] cursor-pointer items-center justify-center rounded-lg border-0 bg-primary px-[25px] py-[17px] text-[20px] font-medium leading-[1.21] text-white transition-colors hover:bg-primary-600"
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
