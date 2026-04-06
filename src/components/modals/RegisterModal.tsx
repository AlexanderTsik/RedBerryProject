import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useModal } from '../../hooks/useModal'
import { useAuth } from '../../store/AuthContext'
import { register as registerApi } from '../../api/auth'
import {
  AuthModalChrome,
  AuthModalDivider,
  authFieldLabelClass,
  authPrimaryButtonClass,
  authTextInputClass,
} from './AuthModalChrome'
import IconEyeOpen from '../../assets/icons/icon-set/icon-eye-open.svg?react'
import IconEyeClosed from '../../assets/icons/icon-set/icon-eye-closed.svg?react'
import IconUpload from '../../assets/icons/icon-set/icon-upload.svg?react'

const formSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  password_confirmation: z.string().min(1, 'Please confirm your password'),
  username: z.string().min(1, 'Username is required'),
})

type FormData = z.infer<typeof formSchema>

const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
  1: ['email'],
  2: ['password', 'password_confirmation'],
  3: ['username'],
}

function ProgressSegments({ step }: { step: number }) {
  return (
    <div className="flex w-full gap-2">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={`h-2 flex-1 rounded-full transition-colors ${
            i < step - 1 ? 'bg-primary' : i === step - 1 ? 'bg-primary-200' : 'bg-primary-50'
          }`}
        />
      ))}
    </div>
  )
}

export default function RegisterModal() {
  const { activeModal, closeModal, openModal } = useModal()
  const { login } = useAuth()
  const [step, setStep] = useState(1)
  const [avatar, setAvatar] = useState<File | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setError,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      password_confirmation: '',
      username: '',
    },
  })

  if (activeModal !== 'register') return null

  const handleNext = async () => {
    const fields = STEP_FIELDS[step]
    const valid = await trigger(fields)

    if (step === 2 && valid) {
      const { password, password_confirmation } = getValues()
      if (password !== password_confirmation) {
        setError('password_confirmation', { message: 'Passwords do not match' })
        return
      }
    }

    if (valid) setStep(prev => prev + 1)
  }

  const onSubmit = async (data: FormData) => {
    setApiError(null)
    setIsSubmitting(true)
    try {
      const response = await registerApi({
        username: data.username,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        avatar: avatar || undefined,
      })
      login(response.data.token, response.data.user)
      handleClose()
    } catch (err: unknown) {
      const error = err as {
        response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } }
      }
      if (error.response?.status === 422) {
        const fieldErrors = error.response.data?.errors
        if (fieldErrors) {
          const firstField = Object.keys(fieldErrors)[0]
          setApiError(fieldErrors[firstField][0])
        } else {
          setApiError(error.response.data?.message || 'Validation failed.')
        }
      } else {
        setApiError('Registration failed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setAvatar(null)
    setApiError(null)
    setShowPassword(false)
    setShowPasswordConfirm(false)
    reset()
    closeModal()
  }

  const goBack = () => {
    setApiError(null)
    setStep(s => Math.max(1, s - 1))
  }

  const switchToLogin = () => {
    setStep(1)
    setAvatar(null)
    setApiError(null)
    setShowPassword(false)
    setShowPasswordConfirm(false)
    reset()
    openModal('login')
  }

  const avatarTooLarge = avatar !== null && avatar.size > 2 * 1024 * 1024

  return (
    <AuthModalChrome onClose={handleClose} showBack={step > 1} onBack={goBack}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-6 self-stretch">
            <div className="flex flex-col items-center gap-1.5 self-stretch">
              <h2 className="text-center text-[32px] font-semibold leading-[1.21] text-grey-900">Create Account</h2>
              <p className="text-center text-[14px] font-medium leading-[1.21] text-grey-500">
                Join and start learning today
              </p>
            </div>

            <ProgressSegments step={step} />

            {apiError && (
              <div className="w-full rounded-lg bg-error/10 p-3 text-center text-sm text-error">{apiError}</div>
            )}

            <form
              onSubmit={
                step < 3
                  ? e => {
                      e.preventDefault()
                      void handleNext()
                    }
                  : handleSubmit(onSubmit)
              }
              className="flex flex-col gap-4 self-stretch"
            >
              <div className="flex flex-col gap-6 self-stretch">
                {step === 1 && (
                  <div className="flex flex-col gap-2">
                    <label htmlFor="reg-email" className={authFieldLabelClass}>
                      Email*
                    </label>
                    <input
                      id="reg-email"
                      {...register('email')}
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={authTextInputClass}
                    />
                    {errors.email && (
                      <p className="text-[12px] leading-[1.21] text-error">{errors.email.message}</p>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="reg-password" className={authFieldLabelClass}>
                        Password*
                      </label>
                      <div className="flex h-12 items-center rounded-lg border-[1.5px] border-grey-200 px-[13px] pr-3 focus-within:border-primary">
                        <input
                          id="reg-password"
                          {...register('password')}
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder="Password"
                          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] font-medium leading-[1.21] text-grey-900 placeholder:text-grey-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(v => !v)}
                          className="ml-1 flex h-[22px] w-[22px] shrink-0 items-center justify-center text-grey-300 hover:text-grey-500"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <IconEyeClosed className="h-[22px] w-[22px]" />
                          ) : (
                            <IconEyeOpen className="h-[22px] w-[22px]" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-[12px] leading-[1.21] text-error">{errors.password.message}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="reg-password-confirm" className={authFieldLabelClass}>
                        Confirm Password*
                      </label>
                      <div className="flex h-12 items-center rounded-lg border-[1.5px] border-grey-200 px-[13px] pr-3 focus-within:border-primary">
                        <input
                          id="reg-password-confirm"
                          {...register('password_confirmation')}
                          type={showPasswordConfirm ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder="••••••••"
                          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] font-medium leading-[1.21] text-grey-900 placeholder:text-grey-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswordConfirm(v => !v)}
                          className="ml-1 flex h-[22px] w-[22px] shrink-0 items-center justify-center text-grey-300 hover:text-grey-500"
                          aria-label={showPasswordConfirm ? 'Hide password' : 'Show password'}
                        >
                          {showPasswordConfirm ? (
                            <IconEyeClosed className="h-[22px] w-[22px]" />
                          ) : (
                            <IconEyeOpen className="h-[22px] w-[22px]" />
                          )}
                        </button>
                      </div>
                      {errors.password_confirmation && (
                        <p className="text-[12px] leading-[1.21] text-error">
                          {errors.password_confirmation.message}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="reg-username" className={authFieldLabelClass}>
                        Username*
                      </label>
                      <input
                        id="reg-username"
                        {...register('username')}
                        type="text"
                        autoComplete="username"
                        placeholder="Username"
                        className={authTextInputClass}
                      />
                      {errors.username && (
                        <p className="text-[12px] leading-[1.21] text-error">{errors.username.message}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-[12px]">
                      <span className={authFieldLabelClass}>Upload Avatar</span>
                      <label className="flex cursor-pointer flex-col items-center justify-center gap-[8px] rounded-[8px] border-[1.5px] border-grey-200 py-[30px] transition-colors hover:border-grey-300">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          className="sr-only"
                          onChange={e => setAvatar(e.target.files?.[0] || null)}
                        />
                        <IconUpload className="h-[34px] w-[34px]" aria-hidden />
                        <div className="flex flex-col items-center gap-[6px]">
                          <span className="text-center text-[14px] font-medium leading-[1.21] text-grey-500">
                            Drag and drop or{' '}
                            <span className="text-primary-600 underline decoration-solid">Upload file</span>
                          </span>
                          <span className="text-center text-[12px] font-normal leading-[1.21] text-grey-300">JPG, PNG or WebP</span>
                        </div>
                      </label>
                      {avatar && (
                        <p className="text-center text-[12px] text-grey-500">{avatar.name}</p>
                      )}
                      {avatarTooLarge && (
                        <p className="text-[12px] leading-[1.21] text-error">File must be under 2MB</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className={`${authPrimaryButtonClass} py-2.5`}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || avatarTooLarge}
                  className={`${authPrimaryButtonClass} py-2.5`}
                >
                  {isSubmitting ? 'Signing up…' : 'Sign Up'}
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 self-stretch">
          <AuthModalDivider />
          <div className="flex flex-row flex-wrap items-end justify-center gap-2 self-stretch px-[60px]">
            <span className="text-center text-[12px] font-normal leading-[1.21] text-grey-500">
              Already have an account?
            </span>
            <button
              type="button"
              onClick={switchToLogin}
              className="text-[14px] font-medium leading-[1.21] text-grey-900 underline decoration-solid transition-colors hover:text-primary"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    </AuthModalChrome>
  )
}
