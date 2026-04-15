import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useModal } from '../../hooks/useModal'
import { useAuth } from '../../store/AuthContext'
import { updateProfile } from '../../api/profile'
import { parseValidationError } from '../../utils/parseAuthApiError'
import { primaryButtonClass } from '../ui/buttonStyles'
import IconEdit from '../../assets/Icons/icon-set/icon-edit-profile.svg?react'
import IconCheck from '../../assets/Icons/icon-set/icon-check-profile.svg?react'
import IconChevronDown from '../../assets/Icons/icon-set/icon-chevron-Down.svg?react'
import IconUserSilhouette from '../../assets/Icons/modal/user-icon.svg?react'
import IncompleteIndicator from '../../assets/Icons/nav-icons/incomplete-indicator.svg?react'
import CompleteIndicator from '../../assets/Icons/nav-icons/complete-indicator.svg?react'

import {
  AuthModalChrome,
  authFieldLabelClass,
  authFieldLabelErrorClass,
  authInputFieldClass,
  authInputFieldErrorClass,
  authInputWrapClass,
  authInputWrapErrorClass,
} from './AuthModalChrome'
import AvatarUploadField from './AvatarUploadField'



// ─── Zod schema ────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  mobile_number: z
    .string()
    .regex(/^\d{9}$/, 'Must be exactly 9 digits')
    .refine(v => v.startsWith('5'), { message: 'Must start with 5' }),
  age: z.preprocess(
    value => (value === '' || value == null ? undefined : value),
    z
      .number({
        required_error: 'Age is required',
        invalid_type_error: 'Age is required',
      })
    .int('Age must be a whole number')
    .min(16, 'You must be at least 16 years old to enroll')
    .max(120, 'Please enter a valid age'),
  ),
})

type ProfileFormData = z.infer<typeof profileSchema>

// ─── Helper ────────────────────────────────────────────────────────────────────

/** Strip +995 / 995 country-code prefix if stored that way */
function stripGeorgianPrefix(mobile: string | null | undefined): string {
  if (!mobile) return ''
  return mobile.replace(/^\+?995/, '')
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfileModal() {
  const { activeModal, closeModal } = useModal()
  const { user, updateUser } = useAuth()

  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ageOpen, setAgeOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  // Sync form values with user data each time the modal opens
  useEffect(() => {
    if (activeModal === 'profile') {
      reset({
        full_name: user?.fullName ?? '',
        mobile_number: stripGeorgianPrefix(user?.mobileNumber),
        age: user?.age && user.age >= 16 ? user.age : ('' as unknown as number),
      })
      setAvatar(null)
      setAvatarPreview(null)
      setApiError(null)
      setAgeOpen(false)
    }
  }, [activeModal]) // eslint-disable-line react-hooks/exhaustive-deps

  if (activeModal !== 'profile') return null

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleClose = () => {
    setApiError(null)
    setAvatar(null)
    setAvatarPreview(null)
    closeModal()
  }

  const handleFile = (file: File) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) return
    setAvatar(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const MAX_AVATAR_BYTES = 1 * 1024 * 1024 // 1 MB

  const onSubmit = async (data: ProfileFormData) => {
    if (avatar && avatar.size > MAX_AVATAR_BYTES) return
    setApiError(null)
    setIsSubmitting(true)
    try {
      const updated = await updateProfile({
        full_name: data.full_name,
        mobile_number: data.mobile_number,
        age: data.age,
        avatar: avatar || undefined,
      })
      updateUser(updated)
      handleClose()
    } catch (err: unknown) {
      setApiError(parseValidationError(err, 'Image is too large. Please use a file under 1 MB.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Derived state ───────────────────────────────────────────────────────────

  const isComplete = user?.profileComplete ?? false
  const displayAvatar = avatarPreview ?? user?.avatar ?? null
  const selectedAge = watch('age')

  // ── Read-only input wrapper style ───────────────────────────────────────────

  const readOnlyInputWrap =
    'flex h-12 items-center rounded-lg border-[1.5px] border-grey-200 bg-grey-100 px-[13px] pr-3'

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <AuthModalChrome onClose={handleClose}>
      <div className="flex flex-col gap-6">

        {/* Title */}
        <p className="text-center text-[32px] font-semibold leading-normal text-[#141414]">Profile</p>

        {/* User identity row */}
        <div className="flex items-center gap-3 w-full">
          {/* Avatar circle */}
          <div className="relative shrink-0 size-14 rounded-full">
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt=""
                className="size-full rounded-full object-cover"
              />
            ) : (
              <div className="size-full rounded-full bg-primary-50 flex items-center justify-center text-primary-400">
                <IconUserSilhouette />
              </div>
            )}
            {/* Completion indicator */}
            <div className="absolute bottom-0 right-0 z-10">
              {isComplete ? <CompleteIndicator aria-hidden /> : <IncompleteIndicator aria-hidden />}
            </div>
          </div>

          {/* Username + status */}
          <div className="flex flex-col gap-1">
            <p className="text-[20px] font-semibold leading-6 text-[#0a0a0a]">{user?.username}</p>
            <p
              className={`pl-0.5 text-[10px] font-normal leading-normal ${isComplete ? 'text-success' : 'text-warning'
                }`}
            >
              {isComplete ? 'Profile is Complete' : 'Incomplete Profile'}
            </p>
          </div>
        </div>

        {/* API error */}
        {apiError && (
          <div className="w-full rounded-lg bg-error/10 p-3 text-center text-sm text-error">
            {apiError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">

          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="profile-fullname" className={errors.full_name ? authFieldLabelErrorClass : authFieldLabelClass}>
              Full Name
            </label>
            <div className={`${authInputWrapClass} ${errors.full_name ? authInputWrapErrorClass : ''}`}>
              <input
                id="profile-fullname"
                {...register('full_name')}
                type="text"
                placeholder="Enter your full name"
                className={`${authInputFieldClass} ${errors.full_name ? authInputFieldErrorClass : ''}`}
              />
              <span className={`ml-1 ${errors.full_name ? 'text-error' : 'text-grey-300'}`}>
                <IconEdit />
              </span>
            </div>
            {errors.full_name && (
              <p className="text-[12px] leading-normal text-error">{errors.full_name.message}</p>
            )}
          </div>

          {/* Email — read-only */}
          <div className="flex flex-col gap-2">
            <span className={authFieldLabelClass}>Email</span>
            <div className={readOnlyInputWrap}>
              <span className="min-w-0 flex-1 truncate text-[14px] font-medium leading-normal text-grey-300">
                {user?.email}
              </span>
              <span className="text-grey-300 ml-1">
                <IconCheck />
              </span>
            </div>
          </div>

          {/* Mobile Number + Age */}
          <div className="flex items-end gap-2">
            {/* Mobile */}
            <div className="flex flex-col gap-2" style={{ width: '73%' }}>
              <label htmlFor="profile-mobile" className={errors.mobile_number ? authFieldLabelErrorClass : authFieldLabelClass}>
                Mobile Number
              </label>
              <div className={`${authInputWrapClass} ${errors.mobile_number ? authInputWrapErrorClass : ''}`}>
                <span className={`shrink-0 text-[14px] font-medium leading-normal ${errors.mobile_number ? 'text-error' : 'text-grey-300'}`}>
                  +995
                </span>
                <div className="mx-2 h-[18px] w-px shrink-0 bg-grey-200" />
                <input
                  id="profile-mobile"
                  {...register('mobile_number')}
                  type="text"
                  inputMode="numeric"
                  maxLength={9}
                  placeholder="5XXXXXXXX"
                  className={`${authInputFieldClass} ${errors.mobile_number ? authInputFieldErrorClass : ''}`}
                />
                <span className={`ml-1 ${errors.mobile_number ? 'text-error' : 'text-grey-300'}`}>
                  <IconCheck />
                </span>
              </div>
              {errors.mobile_number && (
                <p className="text-[12px] leading-normal text-error">
                  {errors.mobile_number.message}
                </p>
              )}
            </div>

            {/* Age */}
            <div className="flex flex-1 flex-col gap-2 min-w-0">
              <label htmlFor="profile-age" className={errors.age ? authFieldLabelErrorClass : authFieldLabelClass}>
                Age
              </label>
              <div className="relative">
                <input type="hidden" {...register('age')} />
                <button
                  id="profile-age"
                  type="button"
                  onClick={() => setAgeOpen(prev => !prev)}
                  className={`${authInputWrapClass} h-[49px] w-full cursor-pointer justify-between rounded-[10px] border-grey-100 px-[13px] py-[7px] hover:border-grey-200 ${errors.age ? authInputWrapErrorClass : ''}`}
                >
                  <span className={`${authInputFieldClass} ${errors.age ? authInputFieldErrorClass : ''}`}>
                    {typeof selectedAge === 'number' && selectedAge >= 16 ? selectedAge : '—'}
                  </span>
                  <span className={`ml-1 transition-transform ${ageOpen ? 'rotate-180' : ''} ${errors.age ? 'text-error' : 'text-grey-300'}`}>
                    <IconChevronDown />
                  </span>
                </button>

                {ageOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setAgeOpen(false)}
                      aria-hidden
                    />
                    <div className="absolute right-0 top-[calc(100%+4px)] z-20 max-h-[200px] w-full overflow-y-auto rounded-[10px] border border-grey-100 bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
                      {Array.from({ length: 105 }, (_, index) => {
                        const ageValue = index + 16
                        return (
                          <button
                            key={ageValue}
                            type="button"
                            onClick={() => {
                              setValue('age', ageValue, { shouldValidate: true, shouldDirty: true })
                              setAgeOpen(false)
                            }}
                            className="flex w-full items-center border-0 bg-white px-[13px] py-[10px] text-[14px] font-medium leading-[1.21] text-grey-500 transition-colors hover:bg-primary-100 hover:text-primary"
                          >
                            {ageValue}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
              {errors.age && (
                <p className="text-[12px] leading-normal text-error">{errors.age.message}</p>
              )}
            </div>
          </div>

          {/* Upload Avatar */}
          <div className="flex flex-col gap-3">
            <span className={authFieldLabelClass}>Upload Avatar</span>
            <AvatarUploadField file={avatar} onFileSelect={handleFile} previewSrc={avatarPreview} />
            {avatar && avatar.size > MAX_AVATAR_BYTES && (
              <p className="text-[12px] leading-normal text-error">File must be under 1 MB</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || (avatar !== null && avatar.size > MAX_AVATAR_BYTES)}
            className={`${primaryButtonClass} mt-1 h-[47px] w-full rounded-lg text-[16px] font-medium leading-6`}
          >
            {isSubmitting ? 'Updating…' : 'Update Profile'}
          </button>
        </form>
      </div>
    </AuthModalChrome>
  )
}
