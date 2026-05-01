import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { toast } from 'sonner'
import type { AuthUser, LoginCredentials } from '@/types'

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
          const { data } = await laravelApi.post<{ token: string; user: AuthUser }>(
            '/login',
            credentials
          )
          set({ token: data.token, user: data.user, isAuthenticated: true })
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
        const { token } = get()
        if (!token) {
          set({ isAuthenticated: false })
          return
        }
        set({ isAuthenticating: true })
        try {
          const { laravelApi } = await import('@/lib/axios')
          const { data } = await laravelApi.get<AuthUser>('/me')
          set({ user: data, isAuthenticated: true })
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
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          state.isAuthenticated = true
        }
      },
    }
  )
)
