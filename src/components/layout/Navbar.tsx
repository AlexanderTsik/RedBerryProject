import { Link } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'
import { useModal } from '../../hooks/useModal'

// Placeholder — full implementation in Phase 2
export default function Navbar() {
  const { isAuthenticated } = useAuth()
  const { openModal, openSidebar } = useModal()

  return (
    <header className="w-full bg-white border-b border-neutral-200">
      <div className="max-w-content mx-auto px-8 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl text-primary">
          RedClass
        </Link>

        <nav className="flex items-center gap-6">
          <Link to="/courses" className="text-neutral-700 hover:text-primary transition-colors">
            Browse Courses
          </Link>

          {isAuthenticated ? (
            <>
              <button
                onClick={openSidebar}
                className="text-neutral-700 hover:text-primary transition-colors"
              >
                Enrolled Courses
              </button>
              <button
                onClick={() => openModal('profile')}
                className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center hover:bg-primary-light transition-colors"
                aria-label="Profile"
              >
                <span className="text-sm font-medium text-neutral-700">P</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => openModal('login')}
                className="text-neutral-700 hover:text-primary transition-colors font-medium"
              >
                Log In
              </button>
              <button
                onClick={() => openModal('register')}
                className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-hover transition-colors font-medium"
              >
                Sign Up
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
