// ─── User & Auth ────────────────────────────────────────────────────────────

export interface User {
  id: number
  username: string
  email: string
  avatar: string | null
  fullName: string | null
  mobileNumber: string | null
  age: number | null
  profileComplete: boolean
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface Category {
  id: number
  name: string
  icon: string
}

export interface Topic {
  id: number
  name: string
  categoryId: number
}

export interface Instructor {
  id: number
  name: string
  avatar: string | null
}

// ─── Schedule ────────────────────────────────────────────────────────────────

export interface WeeklySchedule {
  id: number
  label: string
  days: string[]
}

export interface TimeSlot {
  id: number
  label: string
  startTime: string
  endTime: string
}

export interface SessionType {
  id: number
  courseScheduleId: number
  name: string
  priceModifier: number
  availableSeats: number
  location: string | null
}

// ─── Courses ─────────────────────────────────────────────────────────────────

export interface Course {
  id: number
  title: string
  description: string
  image: string
  basePrice: number
  durationWeeks: number
  isFeatured: boolean
  avgRating?: number | null
  reviewCount?: number | null
  category: Category
  topic: Topic
  instructor: Instructor
}

export interface CourseDetail extends Course {
  reviews: Array<{ userId: number; rating: number }>
  isRated: boolean
  enrollment: EnrollmentDetail | null
}

// ─── Enrollments ─────────────────────────────────────────────────────────────

export interface EnrollmentSchedule {
  weeklySchedule: WeeklySchedule
  timeSlot: TimeSlot
  sessionType: SessionType
  location: string | null
}

export interface Enrollment {
  id: number
  quantity: number
  totalPrice: number
  progress: number
  completedAt: string | null
  course: Course
  schedule: EnrollmentSchedule
}

export interface EnrollmentDetail {
  id: number
  progress: number
  schedule: {
    location: string | null
    weeklySchedule?: WeeklySchedule
    timeSlot?: TimeSlot
    sessionType: Pick<SessionType, 'name' | 'priceModifier'>
  }
}

// ─── Conflict ────────────────────────────────────────────────────────────────

export interface ScheduleConflict {
  requestedCourseId: number
  conflictingEnrollmentId: number
  conflictingCourseName: string
  schedule: string
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginationMeta {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
