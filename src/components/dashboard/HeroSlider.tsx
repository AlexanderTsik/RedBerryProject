import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import bg1 from '../../assets/images/CarrouselBackgroundImages/BackgroundImage1.png'
import bg2 from '../../assets/images/CarrouselBackgroundImages/BackgroundImage2.png'
import bg3 from '../../assets/images/CarrouselBackgroundImages/BackgroundImage3.png'

// ─── Slide data ──────────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: 0,
    title: 'Start learning something new today',
    subtitle:
      'Explore a wide range of expert-led courses in design, development, business, and more. Find the skills you need to grow your career and learn at your own pace.',
    cta: 'Browse Courses',
    ctaTo: '/courses',
    // Slide 1: image fills the slot with object-cover (matches Figma Component 5)
    bg: <img src={bg1} alt="" className="absolute inset-0 size-full max-w-none object-cover pointer-events-none rounded-[30px]" />,
  },
  {
    id: 1,
    title: 'Pick up where you left off',
    subtitle:
      'Your learning journey is already in progress. Continue your enrolled courses, track your progress, and stay on track toward completing your goals.',
    cta: 'Start Learning',
    ctaTo: '/courses',
    // Slide 2: tall image, positioned with a top offset to show the right crop (matches Figma Component 6)
    bg: (
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[30px]">
        <img
          src={bg2}
          alt=""
          className="absolute left-0 w-full max-w-none"
          style={{ height: '228.57%', top: '-40.39%' }}
        />
      </div>
    ),
  },
  {
    id: 2,
    title: 'Learn together, grow faster',
    subtitle:
      'Join a community of learners, connect with instructors, and stay motivated as you build new skills and advance your knowledge.',
    cta: 'Learn More',
    ctaTo: '/courses',
    // Slide 3: tall image, different vertical offset (matches Figma Component 8)
    bg: (
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[30px]">
        <img
          src={bg3}
          alt=""
          className="absolute max-w-none"
          style={{ height: '228.57%', left: '0.01%', top: '-14.36%', width: '100%' }}
        />
      </div>
    ),
  },
] as const

// ─── Arrow icons — exact Figma paths (node 560-4538 / 560-4543) ──────────────
// viewBox 0 0 43.875 43.875 rendered at 54×54 px
// Both arrows are 70% white in the Figma design:
//   • Left:  opacity-70 on the container (path is full white)
//   • Right: opacity="0.7" baked into the path itself

function ArrowLeft() {
  return (
    // container opacity matches Figma "opacity-70" wrapper
    <svg
      width="54"
      height="54"
      viewBox="0 0 43.875 43.875"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-70"
    >
      <path
        d="M21.9375 0C17.5987 0 13.3573 1.28661 9.74969 3.69714C6.14208 6.10766 3.3303 9.53383 1.6699 13.5424C0.00950517 17.5509 -0.42493 21.9618 0.421533 26.2173C1.268 30.4728 3.35734 34.3816 6.42535 37.4497C9.49337 40.5177 13.4023 42.607 17.6577 43.4535C21.9132 44.2999 26.3241 43.8655 30.3326 42.2051C34.3412 40.5447 37.7673 37.7329 40.1779 34.1253C42.5884 30.5177 43.875 26.2763 43.875 21.9375C43.8689 16.1212 41.5556 10.5449 37.4429 6.43213C33.3301 2.31938 27.7538 0.00614212 21.9375 0ZM21.9375 40.5C18.2662 40.5 14.6773 39.4113 11.6247 37.3717C8.57215 35.332 6.19295 32.4329 4.788 29.0411C3.38304 25.6492 3.01544 21.9169 3.73168 18.3161C4.44792 14.7154 6.21583 11.4078 8.81184 8.81183C11.4079 6.21582 14.7154 4.44791 18.3161 3.73167C21.9169 3.01543 25.6492 3.38303 29.0411 4.78799C32.4329 6.19294 35.332 8.57214 37.3717 11.6247C39.4113 14.6773 40.5 18.2662 40.5 21.9375C40.4944 26.8589 38.5369 31.5771 35.057 35.057C31.5771 38.5369 26.8589 40.4944 21.9375 40.5ZM26.5064 14.6939L19.2607 21.9375L26.5064 29.1811C26.6632 29.3379 26.7876 29.524 26.8724 29.7289C26.9573 29.9337 27.0009 30.1533 27.0009 30.375C27.0009 30.5967 26.9573 30.8163 26.8724 31.0211C26.7876 31.226 26.6632 31.4121 26.5064 31.5689C26.3496 31.7257 26.1635 31.8501 25.9586 31.9349C25.7538 32.0198 25.5342 32.0634 25.3125 32.0634C25.0908 32.0634 24.8712 32.0198 24.6664 31.9349C24.4615 31.8501 24.2754 31.7257 24.1186 31.5689L15.6811 23.1314C15.5242 22.9747 15.3997 22.7886 15.3148 22.5837C15.2299 22.3789 15.1862 22.1593 15.1862 21.9375C15.1862 21.7157 15.2299 21.4961 15.3148 21.2913C15.3997 21.0864 15.5242 20.9003 15.6811 20.7436L24.1186 12.3061C24.2754 12.1493 24.4615 12.0249 24.6664 11.9401C24.8712 11.8552 25.0908 11.8116 25.3125 11.8116C25.5342 11.8116 25.7538 11.8552 25.9586 11.9401C26.1635 12.0249 26.3496 12.1493 26.5064 12.3061C26.6632 12.4629 26.7876 12.649 26.8724 12.8539C26.9573 13.0587 27.0009 13.2783 27.0009 13.5C27.0009 13.7217 26.9573 13.9413 26.8724 14.1461C26.7876 14.351 26.6632 14.5371 26.5064 14.6939Z"
        fill="white"
      />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg
      width="54"
      height="54"
      viewBox="0 0 43.875 43.875"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* opacity="0.7" matches the Figma path-level opacity on the right arrow */}
      <path
        opacity="0.7"
        d="M21.9375 0C17.5987 0 13.3573 1.28661 9.74969 3.69714C6.14208 6.10766 3.3303 9.53383 1.6699 13.5424C0.00950517 17.5509 -0.42493 21.9618 0.421533 26.2173C1.268 30.4728 3.35734 34.3816 6.42535 37.4497C9.49337 40.5177 13.4023 42.607 17.6577 43.4535C21.9132 44.2999 26.3241 43.8655 30.3326 42.2051C34.3412 40.5447 37.7673 37.7329 40.1779 34.1253C42.5884 30.5177 43.875 26.2763 43.875 21.9375C43.8689 16.1212 41.5556 10.5449 37.4429 6.43213C33.3301 2.31938 27.7538 0.00614212 21.9375 0ZM21.9375 40.5C18.2662 40.5 14.6773 39.4113 11.6247 37.3717C8.57215 35.332 6.19295 32.4329 4.788 29.0411C3.38304 25.6492 3.01544 21.9169 3.73168 18.3161C4.44792 14.7154 6.21583 11.4078 8.81184 8.81183C11.4079 6.21582 14.7154 4.44791 18.3161 3.73167C21.9169 3.01543 25.6492 3.38303 29.0411 4.78799C32.4329 6.19294 35.332 8.57214 37.3717 11.6247C39.4113 14.6773 40.5 18.2662 40.5 21.9375C40.4944 26.8589 38.5369 31.5771 35.057 35.057C31.5771 38.5369 26.8589 40.4944 21.9375 40.5ZM28.1939 20.7436C28.3508 20.9003 28.4753 21.0864 28.5602 21.2913C28.6451 21.4961 28.6888 21.7157 28.6888 21.9375C28.6888 22.1593 28.6451 22.3789 28.5602 22.5837C28.4753 22.7886 28.3508 22.9747 28.1939 23.1314L19.7564 31.5689C19.5996 31.7257 19.4135 31.8501 19.2086 31.9349C19.0038 32.0198 18.7842 32.0634 18.5625 32.0634C18.3408 32.0634 18.1212 32.0198 17.9164 31.9349C17.7115 31.8501 17.5254 31.7257 17.3686 31.5689C17.2118 31.4121 17.0874 31.226 17.0026 31.0211C16.9177 30.8163 16.8741 30.5967 16.8741 30.375C16.8741 30.1533 16.9177 29.9337 17.0026 29.7289C17.0874 29.524 17.2118 29.3379 17.3686 29.1811L24.6143 21.9375L17.3686 14.6939C17.052 14.3773 16.8741 13.9478 16.8741 13.5C16.8741 13.0522 17.052 12.6227 17.3686 12.3061C17.6852 11.9894 18.1147 11.8116 18.5625 11.8116C19.0103 11.8116 19.4398 11.9894 19.7564 12.3061L28.1939 20.7436Z"
        fill="white"
      />
    </svg>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)

  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length),
    [],
  )
  const next = useCallback(
    () => setCurrent((c) => (c + 1) % SLIDES.length),
    [],
  )

  // Auto-advance every 5 s; restarts whenever `current` changes so manual
  // navigation always gives a fresh 5 s window before the next auto-advance.
  useEffect(() => {
    const timer = setTimeout(next, 5000)
    return () => clearTimeout(timer)
  }, [current, next])

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-[30px]">
      {/* ── Slide track ─────────────────────────────────────────────────────── */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{
          width: `${SLIDES.length * 100}%`,
          transform: `translateX(-${(current * 100) / SLIDES.length}%)`,
        }}
      >
        {SLIDES.map((slide) => (
          <div
            key={slide.id}
            className="relative h-full rounded-[30px] overflow-hidden"
            style={{ width: `${100 / SLIDES.length}%` }}
          >
            {/* Background */}
            {slide.bg}

            {/* Text + CTA */}
            <div className="relative flex h-full flex-col items-start p-[48px] gap-[40px]">
              <div className="flex flex-col gap-[12px] text-white">
                <h2 className="text-[48px] font-bold leading-[56px] tracking-[-0.24px]">
                  {slide.title}
                </h2>
                <p className="text-[24px] font-light leading-normal max-w-[1218px]">
                  {slide.subtitle}
                </p>
              </div>

              <Link
                to={slide.ctaTo}
                className="flex h-[64px] items-center justify-center rounded-[8px] bg-primary px-[25px] py-[17px] text-[20px] font-medium text-white transition-colors hover:bg-primary-600"
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom navigation: dots + arrows ────────────────────────────────── */}
      {/*
        Figma layout (within the 1566px container):
          left-[48px] right-[48px] top-[311px]
          [132px empty spacer] | [dots flex-1 centered] | [arrows 132px]
        Dots are vertically centred within the 54px arrow height → align-items:center
      */}
      <div
        className="absolute left-[48px] right-[48px] flex items-center"
        style={{ top: '311px' }}
      >
        {/* Left spacer (mirrors arrow block width for dot centering) */}
        <div className="w-[132px] shrink-0" />

        {/* Dot indicators */}
        <div className="flex flex-1 items-center justify-center gap-[12px]">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="h-[8px] w-[57px] rounded-[999px] transition-colors duration-300 cursor-pointer border-0 p-0"
              style={{
                background:
                  i === current ? '#f5f5f5' : 'rgba(193,188,188,0.5)',
              }}
            />
          ))}
        </div>

        {/* Prev / Next arrows */}
        <div className="flex shrink-0 items-center gap-[24px]">
          <button
            type="button"
            onClick={prev}
            className="cursor-pointer border-0 bg-transparent p-0 hover:opacity-90 transition-opacity"
            aria-label="Previous slide"
          >
            <ArrowLeft faded />
          </button>
          <button
            type="button"
            onClick={next}
            className="cursor-pointer border-0 bg-transparent p-0 hover:opacity-80 transition-opacity"
            aria-label="Next slide"
          >
            <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  )
}
