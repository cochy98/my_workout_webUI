import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'

// Circular import (axios.ts ↔ authStore.ts) is safe here: useAuthStore is only
// accessed inside interceptor callbacks which run at request time, not module load time.

export const laravelApi = axios.create({
  baseURL: import.meta.env.VITE_LARAVEL_API_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

laravelApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

laravelApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      toast.error('Session expired. Please log in again.')
    } else if (error.response?.status && error.response.status >= 500) {
      toast.error('Server error. Please try again later.')
    }
    return Promise.reject(error)
  }
)

export const nodeApi = axios.create({
  baseURL: import.meta.env.VITE_NODE_ORCHESTRATOR_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

nodeApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
