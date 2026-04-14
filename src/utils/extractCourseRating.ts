function toNumberOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

export function extractCourseRating(course: unknown): number | null {
  if (!course || typeof course !== 'object') return null

  const raw = course as {
    avgRating?: unknown
    avg_rating?: unknown
    rating?: unknown
    reviews?: Array<{ rating?: unknown }>
  }

  const direct =
    toNumberOrNull(raw.avgRating) ??
    toNumberOrNull(raw.avg_rating) ??
    toNumberOrNull(raw.rating)

  if (direct != null) return direct

  if (Array.isArray(raw.reviews) && raw.reviews.length > 0) {
    const nums = raw.reviews
      .map((review) => toNumberOrNull(review.rating))
      .filter((value): value is number => value != null)

    if (nums.length > 0) {
      const avg = nums.reduce((sum, value) => sum + value, 0) / nums.length
      return Number(avg.toFixed(1))
    }
  }

  return null
}