import { apiClient } from './client'
import type { User } from '../types'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  password_confirmation: string
  avatar?: File
}

export interface AuthResponse {
  data: {
    user: User
    token: string
  }
}

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/login', payload)
  return data
}

export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const form = new FormData()
  form.append('username', payload.username)
  form.append('email', payload.email)
  form.append('password', payload.password)
  form.append('password_confirmation', payload.password_confirmation)
  if (payload.avatar) form.append('avatar', payload.avatar)

  const { data } = await apiClient.post<AuthResponse>('/register', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const logout = async (): Promise<void> => {
  await apiClient.post('/logout')
}

export const getMe = async (): Promise<User> => {
  const { data } = await apiClient.get<{ data: User }>('/me')
  return data.data
}
