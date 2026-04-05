import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useModal } from '../../hooks/useModal'
import { useAuth } from '../../store/AuthContext'
import { updateProfile } from '../../api/profile'
import { AuthModalChrome, authFieldLabelClass } from './AuthModalChrome'
import IconUpload from '../../assets/icons/modal/icon-upload.svg?react'

// ─── Inline icons ──────────────────────────────────────────────────────────────

function IconEdit() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="shrink-0">
      <path
        d="M15.5 2.5a2.121 2.121 0 0 1 3 3L6.5 17.5H3.5v-3L15.5 2.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="shrink-0">
      <path
        d="M4 11.5l5 5 9-9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconChevronDown() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="shrink-0">
      <path
        d="M5.5 8.5l5.5 5.5 5.5-5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconUserSilhouette() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="11" r="6" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M4 29c0-6.627 5.373-12 12-12s12 5.373 12 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── Zod schema ────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  mobile_number: z
    .string()
    .regex(/^\d{9}$/, 'Must be exactly 9 digits')
    .refine(v => v.startsWith('5'), { message: 'Must start with 5' }),
  age: z.coerce
    .number({ invalid_type_error: 'Age is required' })
    .int('Age must be a whole number')
    .min(1, 'Age must be at least 1')
    .max(120, 'Age seems too high'),
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
  const [isDragging, setIsDragging] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
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
        age: user?.age ?? ('' as unknown as number),
      })
      setAvatar(null)
      setAvatarPreview(null)
      setApiError(null)
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

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = () => setIsDragging(false)

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const onSubmit = async (data: ProfileFormData) => {
    if (avatar && avatar.size > 2 * 1024 * 1024) return
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
      const error = err as {
        response?: { data?: { message?: string; errors?: Record<string, string[]> } }
      }
      const fieldErrors = error.response?.data?.errors
      if (fieldErrors) {
        const firstField = Object.keys(fieldErrors)[0]
        setApiError(fieldErrors[firstField][0])
      } else {
        setApiError(error.response?.data?.message || 'Failed to update profile.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Derived state ───────────────────────────────────────────────────────────

  const isComplete = user?.profileComplete ?? false
  const displayAvatar = avatarPreview ?? user?.avatar ?? null

  // ── Shared input wrapper styles ─────────────────────────────────────────────

  const inputWrap =
    'flex h-12 items-center rounded-lg border-[1.5px] border-grey-200 bg-grey-100 px-[13px] pr-3 focus-within:border-primary'
  const inputBase =
    'min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] font-medium leading-normal text-grey-900 placeholder:text-grey-300 focus:outline-none'

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
            {/* Completion dot */}
            <span
              className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-white ${
                isComplete ? 'bg-success' : 'bg-warning'
              }`}
            />
          </div>

          {/* Username + status */}
          <div className="flex flex-col gap-1">
            <p className="text-[20px] font-semibold leading-6 text-[#0a0a0a]">{user?.username}</p>
            <p
              className={`pl-0.5 text-[10px] font-normal leading-normal ${
                isComplete ? 'text-success' : 'text-warning'
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
            <label htmlFor="profile-fullname" className={authFieldLabelClass}>
              Full Name
            </label>
            <div className={inputWrap}>
              <input
                id="profile-fullname"
                {...register('full_name')}
                type="text"
                placeholder="Enter your full name"
                className={inputBase}
              />
              <span className="text-grey-300 ml-1">
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
            <div className={inputWrap}>
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
              <label htmlFor="profile-mobile" className={authFieldLabelClass}>
                Mobile Number
              </label>
              <div className="flex h-12 items-center rounded-lg border-[1.5px] border-grey-200 px-[13px] pr-3 focus-within:border-primary">
                <span className="shrink-0 text-[14px] font-medium leading-normal text-grey-300">
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
                  className={inputBase + ' bg-transparent'}
                />
                <span className="text-grey-300 ml-1">
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
              <label htmlFor="profile-age" className={authFieldLabelClass}>
                Age
              </label>
              <div className="flex h-12 items-center rounded-lg border-[1.5px] border-grey-200 px-[13px] pr-3 focus-within:border-primary">
                <input
                  id="profile-age"
                  {...register('age')}
                  type="number"
                  min={1}
                  max={120}
                  placeholder="—"
                  className={
                    inputBase +
                    ' bg-transparent [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                  }
                />
                <span className="text-grey-300 ml-1">
                  <IconChevronDown />
                </span>
              </div>
              {errors.age && (
                <p className="text-[12px] leading-normal text-error">{errors.age.message}</p>
              )}
            </div>
          </div>

          {/* Upload Avatar */}
          <div className="flex flex-col gap-3">
            <span className={authFieldLabelClass}>Upload Avatar</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
                // reset so same file can be re-selected
                e.target.value = ''
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`flex w-full flex-col items-center gap-2 rounded-lg border-[1.5px] bg-white py-[30px] transition-colors ${
                isDragging
                  ? 'border-primary bg-primary-50'
                  : 'border-grey-200 hover:border-grey-300'
              }`}
            >
              {avatar ? (
                <p className="px-4 text-center text-[14px] font-medium text-grey-600 truncate max-w-full">
                  {avatar.name}
                </p>
              ) : (
                <>
                  <IconUpload className="size-[34px] text-grey-400" />
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-[14px] font-medium text-grey-500">
                      Drag and drop or{' '}
                      <span className="text-primary-600 underline decoration-solid">
                        Upload file
                      </span>
                    </p>
                    <p className="text-[12px] font-normal text-grey-300">JPG, PNG or WebP</p>
                  </div>
                </>
              )}
            </button>
            {avatar && avatar.size > 2 * 1024 * 1024 && (
              <p className="text-[12px] leading-normal text-error">File must be under 2MB</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || (avatar !== null && avatar.size > 2 * 1024 * 1024)}
            className="mt-1 flex h-[47px] w-full items-center justify-center rounded-lg bg-primary text-[16px] font-medium leading-6 text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Updating…' : 'Update Profile'}
          </button>
        </form>
      </div>
    </AuthModalChrome>
  )
}
