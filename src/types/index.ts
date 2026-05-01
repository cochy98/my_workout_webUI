export interface AuthUser {
  id: number
  name: string
  email: string
  avatar_url?: string | null
}

export type MessageRole = 'user' | 'assistant'

export interface Message {
  id: string
  role: MessageRole
  content: string
  createdAt: string
  isStreaming?: boolean
}

export interface Conversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
