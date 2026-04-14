type ApiErrorResponseData = {
  message?: string
  errors?: Record<string, string[]>
}

type ApiErrorShape = {
  response?: {
    status?: number
    data?: ApiErrorResponseData
  }
}

export function getFirstApiFieldError(error: unknown): string | null {
  const fieldErrors = (error as ApiErrorShape).response?.data?.errors
  if (!fieldErrors) return null

  const firstField = Object.keys(fieldErrors)[0]
  const firstMessage = firstField ? fieldErrors[firstField]?.[0] : null
  return firstMessage ?? null
}

export function getApiErrorMessage(error: unknown): string | null {
  return (error as ApiErrorShape).response?.data?.message ?? null
}

export function parseValidationError(
  error: unknown,
  fallback = 'Validation failed.',
): string {
  return getFirstApiFieldError(error) ?? getApiErrorMessage(error) ?? fallback
}
