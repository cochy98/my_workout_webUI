import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { toast } from 'sonner'
import type { AuthUser, LoginCredentials, LoginResponse } from '@/types'

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isAuthenticating: boolean
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  setToken: (token: string | null) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAuthenticating: false,

      setToken: (token) => set({ token }),

      login: async (credentials: LoginCredentials) => {
        // Dynamic import breaks the circular dep: authStore ↔ axios
        const { laravelApi } = await import('@/lib/axios')
        set({ isAuthenticating: true })
        try {
          const { data } = await laravelApi.post<LoginResponse>('/login', credentials)
          set({ token: data.data.access_token, user: data.data.user, isAuthenticated: true })
        } catch {
          toast.error('Invalid email or password.')
          throw new Error('Login failed')
        } finally {
          set({ isAuthenticating: false })
        }
      },

      logout: async () => {
        try {
          const { laravelApi } = await import('@/lib/axios')
          await laravelApi.post('/logout')
        } catch {
          // Swallow — token may already be invalid
        } finally {
          set({ user: null, token: null, isAuthenticated: false })
        }
      },

      checkAuth: async () => {
        const { token, user } = get()
        if (!token) {
          set({ isAuthenticated: false })
          return
        }
        if (user) {
          set({ isAuthenticated: true })
          return
        }
        // Fallback: token exists but user missing (old localStorage state)
        set({ isAuthenticating: true })
        try {
          const { laravelApi } = await import('@/lib/axios')
          const { data } = await laravelApi.get<{ data: AuthUser }>('/me')
          set({ user: data.data, isAuthenticated: true })
        } catch {
          set({ user: null, token: null, isAuthenticated: false })
        } finally {
          set({ isAuthenticating: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          state.isAuthenticated = true
        }
      },
    }
  )
)
