import type { User } from '../types'

const BASE_URL = 'https://api.redclass.redberryinternship.ge/api'

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

  // Use native fetch so the browser sets Content-Type: multipart/form-data with
  // the correct boundary automatically — Axios's default application/json header
  // would otherwise override it and break multipart parsing on the server.
  const token = localStorage.getItem('auth_token')
  const response = await fetch(`${BASE_URL}/profile`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token ?? ''}`,
      Accept: 'application/json',
      // No Content-Type — browser sets multipart/form-data; boundary=... automatically
    },
    body: form,
  })

  const json = await response.json()

  if (!response.ok) {
    // Mimic the Axios error shape the ProfileModal catch block expects
    const err = new Error(json?.message ?? 'Failed to update profile.') as Error & {
      response: { data: typeof json }
    }
    err.response = { data: json }
    throw err
  }

  return json.data
}
