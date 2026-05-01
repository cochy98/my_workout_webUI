export interface AuthUser {
  idUtente: number
  username: string
  email: string
  tipoUtente: number
  tipoUtenteLabel: string
  nome: string
  cognome: string
  cellulare: string | null
  data_nascita: string | null
  sesso: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
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
  status: string
  message: string
  data: {
    access_token: string
    user: AuthUser
  }
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
