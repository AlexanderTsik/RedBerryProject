import { apiClient } from './client'
import type { User } from '../types'

export interface UpdateProfilePayload {
  full_name: string
  mobile_number: string
  age: number
  avatar?: File
}

export const updateProfile = async (payload: UpdateProfilePayload): Promise<User> => {
  const form = new FormData()
  form.append('full_name', payload.full_name)
  form.append('mobile_number', payload.mobile_number)
  form.append('age', String(payload.age))
  form.append('_method', 'PUT')
  if (payload.avatar) form.append('avatar', payload.avatar)

  const { data } = await apiClient.post<{ data: User }>('/profile', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}
