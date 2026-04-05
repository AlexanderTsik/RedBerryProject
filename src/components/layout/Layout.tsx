import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import LoginModal from '../modals/LoginModal'
import RegisterModal from '../modals/RegisterModal'
import ProfileModal from '../modals/ProfileModal'

export default function Layout() {
  return (
    <div className="mx-auto flex min-h-screen min-h-[100dvh] w-full max-w-[1920px] flex-col bg-grey-100">
      <Navbar />
      <main className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>
      <Footer />
      <LoginModal />
      <RegisterModal />
      <ProfileModal />
    </div>
  )
}
