import { useEffect, useState } from 'react'
import IconUpload from '../../../assets/icons/icon-set/icon-upload.svg?react'

type Props = {
  file: File | null
  onFileSelect: (file: File) => void
  accept?: string
  previewSrc?: string | null
}

function formatFileSize(size: number): string {
  if (size >= 1024 * 1024) {
    const value = size / (1024 * 1024)
    return `${Number.isInteger(value) ? value : value.toFixed(1)}MB`
  }

  if (size >= 1024) {
    const value = size / 1024
    return `${Number.isInteger(value) ? value : value.toFixed(1)}KB`
  }

  return `${size}B`
}

export default function AvatarUploadField({
  file,
  onFileSelect,
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  previewSrc = null,
}: Props) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [generatedPreviewSrc, setGeneratedPreviewSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!file || previewSrc) {
      setGeneratedPreviewSrc(null)
      return
    }

    const nextUrl = URL.createObjectURL(file)
    setGeneratedPreviewSrc(nextUrl)

    return () => {
      URL.revokeObjectURL(nextUrl)
    }
  }, [file, previewSrc])

  const handleFile = (nextFile: File | null | undefined) => {
    if (!nextFile) return
    onFileSelect(nextFile)
  }

  const imageSrc = previewSrc ?? generatedPreviewSrc

  const className = [
    'flex h-[142px] w-full shrink-0 self-stretch rounded-[8px] border-[1.5px] py-[30px] transition-colors',
    file
      ? 'border-primary-100 bg-primary-50'
      : isPressed || isDragging
        ? 'border-primary-200 bg-primary-100'
        : isHovered
          ? 'border-primary-100 bg-primary-50'
          : 'border-grey-200 bg-white',
  ].join(' ')

  return (
    <label
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setIsPressed(false)
        setIsDragging(false)
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onDragOver={event => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={event => {
        event.preventDefault()
        setIsDragging(false)
        handleFile(event.dataTransfer.files?.[0])
      }}
    >
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={event => {
          handleFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />

      {file ? (
        <div className="flex w-full items-center justify-center px-[40px]">
          <div className="flex w-full items-center justify-center gap-[10px]">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt=""
                className="h-[54px] w-[54px] shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="h-[54px] w-[54px] shrink-0 rounded-full bg-primary-100" />
            )}

            <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-[2px]">
              <div className="flex w-full flex-col items-start">
                <p className="w-full truncate text-[12px] font-normal leading-[normal] text-grey-600">
                  {file.name}
                </p>
                <p className="w-full text-[10px] font-normal leading-[normal] text-grey-300">
                  Size - {formatFileSize(file.size)}
                </p>
              </div>
              <p className="text-[10px] font-medium leading-[normal] text-primary underline decoration-solid">
                Change
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-[8px]">
          <IconUpload className="h-[34px] w-[34px] text-grey-400" aria-hidden />
          <div className="flex flex-col items-center gap-[8px]">
            <p className="text-center text-[14px] font-medium leading-[1.21] text-grey-500">
              Drag and drop or{' '}
              <span className="text-primary-600 underline decoration-solid">Upload file</span>
            </p>
            <p className="text-center text-[12px] font-normal leading-[1.21] text-grey-300">
              JPG, PNG or WebP
            </p>
          </div>
        </div>
      )}
    </label>
  )
}
