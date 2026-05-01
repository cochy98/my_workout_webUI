import { create } from 'zustand'
import type { Conversation, Message } from '@/types'

interface ChatState {
  conversations: Conversation[]
  currentConversationId: string | null
  messages: Map<string, Message[]>
  isStreaming: boolean
}

interface ChatActions {
  selectConversation: (id: string) => void
  createNewChat: () => string
  addMessage: (conversationId: string, message: Message) => void
  updateLastMessageChunk: (conversationId: string, chunk: string) => void
  finalizeStreamingMessage: (conversationId: string) => void
  setIsStreaming: (value: boolean) => void
  deleteConversation: (id: string) => void
}

type ChatStore = ChatState & ChatActions

export const useChatStore = create<ChatStore>()((set, get) => ({
  conversations: [],
  currentConversationId: null,
  messages: new Map(),
  isStreaming: false,

  selectConversation: (id) => set({ currentConversationId: id }),

  createNewChat: () => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const newConversation: Conversation = {
      id,
      title: 'New Chat',
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({
      conversations: [newConversation, ...state.conversations],
      currentConversationId: id,
      messages: new Map(state.messages).set(id, []),
    }))
    return id
  },

  addMessage: (conversationId, message) => {
    set((state) => {
      const existing = state.messages.get(conversationId) ?? []
      const updated = new Map(state.messages)
      updated.set(conversationId, [...existing, message])

      const conversations = state.conversations.map((c) => {
        if (c.id === conversationId && c.title === 'New Chat' && message.role === 'user') {
          return {
            ...c,
            title: message.content.slice(0, 50) + (message.content.length > 50 ? '…' : ''),
            updatedAt: new Date().toISOString(),
          }
        }
        if (c.id === conversationId) {
          return { ...c, updatedAt: new Date().toISOString() }
        }
        return c
      })

      return { messages: updated, conversations }
    })
  },

  updateLastMessageChunk: (conversationId, chunk) => {
    set((state) => {
      const existing = state.messages.get(conversationId) ?? []
      if (existing.length === 0) return state

      const last = existing[existing.length - 1]
      if (last.role !== 'assistant') return state

      const updated = new Map(state.messages)
      updated.set(conversationId, [
        ...existing.slice(0, -1),
        { ...last, content: last.content + chunk },
      ])
      return { messages: updated }
    })
  },

  finalizeStreamingMessage: (conversationId) => {
    set((state) => {
      const existing = state.messages.get(conversationId) ?? []
      if (existing.length === 0) return { ...state, isStreaming: false }

      const last = existing[existing.length - 1]
      const updated = new Map(state.messages)
      updated.set(conversationId, [
        ...existing.slice(0, -1),
        { ...last, isStreaming: false },
      ])
      return { messages: updated, isStreaming: false }
    })
  },

  setIsStreaming: (value) => set({ isStreaming: value }),

  deleteConversation: (id) => {
    set((state) => {
      const conversations = state.conversations.filter((c) => c.id !== id)
      const messages = new Map(state.messages)
      messages.delete(id)
      const currentConversationId =
        state.currentConversationId === id
          ? (conversations[0]?.id ?? null)
          : state.currentConversationId
      return { conversations, messages, currentConversationId }
    })
  },
}))
