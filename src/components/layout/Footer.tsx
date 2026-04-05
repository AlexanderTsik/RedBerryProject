import { Link } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'
import { useModal } from '../../hooks/useModal'
import logo from '../../assets/icons/logo.svg'
import SocialFacebook from '../../assets/icons/footer/social-facebook.svg?react'
import SocialTwitter from '../../assets/icons/footer/social-twitter.svg?react'
import SocialInstagram from '../../assets/icons/footer/social-instagram.svg?react'
import SocialLinkedIn from '../../assets/icons/footer/social-linkedin.svg?react'
import SocialYouTube from '../../assets/icons/footer/social-youtube.svg?react'
import IconMail from '../../assets/icons/footer/icon-mail.svg?react'
import IconPhone from '../../assets/icons/footer/icon-phone.svg?react'
import IconMapPin from '../../assets/icons/footer/icon-map-pin.svg?react'

const linkClass =
  'text-left text-[18px] font-normal leading-[1.21] text-grey-500 transition-colors hover:text-primary'

export default function Footer() {
  const { isAuthenticated } = useAuth()
  const { openModal, openSidebar } = useModal()

  return (
    <footer className="w-full shrink-0 border-t border-grey-200 bg-grey-100">
      <div className="layout-frame pb-5 pt-20">
        <div className="flex w-full flex-col gap-[74px]">
          <div className="flex flex-col justify-between gap-14 lg:flex-row lg:gap-8 xl:gap-[219px]">
            <div className="flex max-w-[310px] flex-col gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <img src={logo} alt="" className="h-[45px] w-[45px] shrink-0 rounded-[10px]" />
                  <span className="text-[24px] font-medium leading-[1.21] text-primary-800">Bootcamp</span>
                </div>
                <p className="mt-4 max-w-[310px] text-[14px] font-medium leading-[1.21] text-primary-800">
                  Your learning journey starts here! Browse courses to get started.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-[22px] text-primary-400">
                <a
                  href="https://www.facebook.com"
                  className="transition-opacity hover:opacity-80"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <SocialFacebook className="h-[19px] w-[11px]" />
                </a>
                <a
                  href="https://twitter.com"
                  className="transition-opacity hover:opacity-80"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <SocialTwitter className="h-[15px] w-[19px]" />
                </a>
                <a
                  href="https://www.instagram.com"
                  className="transition-opacity hover:opacity-80"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <SocialInstagram className="h-[19px] w-[19px]" />
                </a>
                <a
                  href="https://www.linkedin.com"
                  className="transition-opacity hover:opacity-80"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <SocialLinkedIn className="h-[18px] w-[19px]" />
                </a>
                <a
                  href="https://www.youtube.com"
                  className="transition-opacity hover:opacity-80"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                >
                  <SocialYouTube className="h-[15px] w-[21px]" />
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-12 sm:flex-row sm:flex-wrap lg:gap-[120px]">
              <div className="flex flex-col gap-4">
                <h3 className="text-[20px] font-semibold leading-[1.2] text-primary-800">Explore</h3>
                <nav className="flex flex-col gap-2">
                  <button type="button" onClick={openSidebar} className={linkClass}>
                    Enrolled Courses
                  </button>
                  <Link to="/courses" className={linkClass}>
                    Browse Courses
                  </Link>
                </nav>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-[20px] font-semibold leading-[1.2] text-primary-800">Account</h3>
                <nav className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => (isAuthenticated ? openModal('profile') : openModal('login'))}
                    className={linkClass}
                  >
                    My Profile
                  </button>
                </nav>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-[20px] font-semibold leading-[1.2] text-primary-800">Contact</h3>
                <div className="flex flex-col gap-2.5">
                  <a href="mailto:contact@company.com" className={`${linkClass} flex items-center gap-1.5`}>
                    <IconMail className="h-6 w-6 shrink-0 text-grey-500" aria-hidden />
                    contact@company.com
                  </a>
                  <a href="tel:+995555111222" className={`${linkClass} flex items-center gap-1.5`}>
                    <IconPhone className="h-6 w-6 shrink-0 text-grey-500" aria-hidden />
                    (+995) 555 111 222
                  </a>
                  <p className={`${linkClass} flex items-start gap-1.5`}>
                    <IconMapPin className="mt-0.5 h-6 w-6 shrink-0 text-grey-600" aria-hidden />
                    Aghmashenebeli St.115
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            <p className="text-[18px] font-normal leading-[1.21] text-grey-500">
              Copyright © 2026 Redberry International
            </p>
            <p className="text-[18px] font-normal leading-[1.21] text-grey-500 sm:text-right">
              All Rights Reserved | Terms and Conditions | Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
