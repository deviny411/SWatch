const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api'

interface ApiOptions extends RequestInit {
  token?: string
}

async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || 'Request failed')
  }

  return response.json()
}

export const apiClient = {
  get: <T>(endpoint: string, options?: ApiOptions) =>
    api<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: any, options?: ApiOptions) =>
    api<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }),

  put: <T>(endpoint: string, data?: any, options?: ApiOptions) =>
    api<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) }),

  delete: <T>(endpoint: string, options?: ApiOptions) =>
    api<T>(endpoint, { ...options, method: 'DELETE' }),
}
