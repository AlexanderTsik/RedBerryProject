import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useModal } from '../../hooks/useModal'
import { useAuth } from '../../store/AuthContext'
import { login as loginApi } from '../../api/auth'
import {
  AuthModalChrome,
  AuthModalDivider,
  authFieldLabelClass,
  authPrimaryButtonClass,
  authTextInputClass,
} from './AuthModalChrome'
import IconEyeOpen from '../../assets/icons/modal/icon-eye-open.svg?react'
import IconEyeClosed from '../../assets/icons/modal/icon-eye-closed.svg?react'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginModal() {
  const { activeModal, closeModal, openModal } = useModal()
  const { login } = useAuth()
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  if (activeModal !== 'login') return null

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null)
    setIsSubmitting(true)
    try {
      const response = await loginApi(data)
      login(response.data.token, response.data.user)
      handleClose()
    } catch (err: unknown) {
      const error = err as {
        response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } }
      }
      if (error.response?.status === 401) {
        setApiError('Invalid credentials.')
      } else if (error.response?.status === 422) {
        const fieldErrors = error.response.data?.errors
        if (fieldErrors) {
          const firstField = Object.keys(fieldErrors)[0]
          setApiError(fieldErrors[firstField][0])
        } else {
          setApiError(error.response.data?.message || 'Validation failed.')
        }
      } else {
        setApiError('Login failed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setApiError(null)
    setShowPassword(false)
    reset()
    closeModal()
  }

  const switchToRegister = () => {
    setApiError(null)
    setShowPassword(false)
    reset()
    openModal('register')
  }

  return (
    <AuthModalChrome onClose={handleClose}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-6 self-stretch">
          <div className="flex flex-col items-center gap-1.5 self-stretch">
            <h2 className="text-center text-[32px] font-semibold leading-[1.21] text-grey-900">Welcome Back</h2>
            <p className="text-center text-[14px] font-medium leading-[1.21] text-grey-500">
              Log in to continue your learning
            </p>
          </div>

          {apiError && (
            <div className="w-full rounded-lg bg-error/10 p-3 text-center text-sm text-error">{apiError}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-6">
            <div className="flex w-full flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="login-email" className={authFieldLabelClass}>
                  Email
                </label>
                <input
                  id="login-email"
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

              <div className="flex flex-col gap-2">
                <label htmlFor="login-password" className={authFieldLabelClass}>
                  Password
                </label>
                <div className="flex h-12 items-center rounded-lg border-[1.5px] border-grey-200 px-[13px] pr-3 focus-within:border-primary">
                  <input
                    id="login-password"
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] font-medium leading-[1.21] text-grey-900 placeholder:text-grey-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="ml-1 flex h-[22px] w-[22px] shrink-0 items-center justify-center text-grey-300 transition-colors hover:text-grey-500"
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
            </div>

            <button type="submit" disabled={isSubmitting} className={authPrimaryButtonClass}>
              {isSubmitting ? 'Logging in…' : 'Log In'}
            </button>
          </form>
        </div>

        <div className="flex flex-col items-center gap-2 self-stretch">
          <AuthModalDivider />
          <div className="flex flex-row flex-wrap items-end justify-center gap-2 self-stretch px-[60px]">
            <span className="text-center text-[12px] font-normal leading-[1.21] text-grey-500">
              Don&apos;t have an account?
            </span>
            <button
              type="button"
              onClick={switchToRegister}
              className="text-[14px] font-medium leading-[1.21] text-grey-900 transition-colors hover:text-primary"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </AuthModalChrome>
  )
}
