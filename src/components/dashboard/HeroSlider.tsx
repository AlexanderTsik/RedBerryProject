import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import bg1 from '../../assets/images/CarrouselBackgroundImages/BackgroundImage1.png'
import bg2 from '../../assets/images/CarrouselBackgroundImages/BackgroundImage2.png'
import bg3 from '../../assets/images/CarrouselBackgroundImages/BackgroundImage3.png'
import ArrowLeftIcon from '../../assets/Icons/hero-slider/arrow-left.svg?react'
import ArrowRightIcon from '../../assets/Icons/hero-slider/arrow-right.svg?react'
import { primaryButtonClass } from '../ui/buttonStyles'

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
      '',
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

// ─── Component ───────────────────────────────────────────────────────────────

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const isFirstSlide = current === 0
  const isLastSlide = current === SLIDES.length - 1

  const prev = useCallback(
    () => setCurrent((c) => Math.max(0, c - 1)),
    [],
  )
  const next = useCallback(
    () => setCurrent((c) => Math.min(SLIDES.length - 1, c + 1)),
    [],
  )

  // Auto-advance every 5 s; restarts whenever `current` changes so manual
  // navigation always gives a fresh 5 s window before the next auto-advance.
  useEffect(() => {
    if (isLastSlide) return
    const timer = setTimeout(next, 5000)
    return () => clearTimeout(timer)
  }, [current, isLastSlide, next])

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
                className={`${primaryButtonClass} h-[64px] text-[20px] font-medium`}
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom navigation: dots + arrows ────────────────────────────────── */}
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
            disabled={isFirstSlide}
            className={`border-0 bg-transparent p-0 transition-opacity ${
              isFirstSlide
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer opacity-100 hover:opacity-90'
            }`}
            aria-label="Previous slide"
          >
            <ArrowLeftIcon className="h-[54px] w-[54px]" aria-hidden />
          </button>
          <button
            type="button"
            onClick={next}
            disabled={isLastSlide}
            className={`border-0 bg-transparent p-0 transition-opacity ${
              isLastSlide
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer opacity-100 hover:opacity-80'
            }`}
            aria-label="Next slide"
          >
            <ArrowRightIcon className="h-[54px] w-[54px]" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}
