import { useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import type { Message } from '@/types'

interface StreamPayload {
  conversationId: string
  message: string
}

export function useSSE() {
  const abortControllerRef = useRef<AbortController | null>(null)
  const { addMessage, updateLastMessageChunk, finalizeStreamingMessage, setIsStreaming } =
    useChatStore()
  const token = useAuthStore((s) => s.token)

  const stopStream = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
  }, [])

  const sendMessage = useCallback(
    async ({ conversationId, message }: StreamPayload) => {
      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: message,
        createdAt: new Date().toISOString(),
      }
      addMessage(conversationId, userMsg)

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        isStreaming: true,
      }
      addMessage(conversationId, assistantMsg)
      setIsStreaming(true)

      abortControllerRef.current = new AbortController()
      const { signal } = abortControllerRef.current

      try {
        const response = await fetch(
          `${import.meta.env.VITE_NODE_ORCHESTRATOR_URL}/chat/stream`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'text/event-stream',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ conversationId, message }),
            signal,
          }
        )

        if (!response.ok) {
          throw new Error(`Stream failed: ${response.status} ${response.statusText}`)
        }

        if (!response.body) {
          throw new Error('Response body is null')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          // { stream: true } handles multi-byte UTF-8 chars split across chunks
          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()

            if (data === '[DONE]') {
              finalizeStreamingMessage(conversationId)
              return
            }

            try {
              const parsed = JSON.parse(data) as { chunk?: string; error?: string }
              if (parsed.error) {
                toast.error(parsed.error)
                finalizeStreamingMessage(conversationId)
                return
              }
              if (parsed.chunk) {
                updateLastMessageChunk(conversationId, parsed.chunk)
              }
            } catch {
              // Non-JSON SSE line — skip
            }
          }
        }

        finalizeStreamingMessage(conversationId)
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          finalizeStreamingMessage(conversationId)
          return
        }
        toast.error('Connection to the AI service failed. Please try again.')
        finalizeStreamingMessage(conversationId)
      }
    },
    [token, addMessage, updateLastMessageChunk, finalizeStreamingMessage, setIsStreaming]
  )

  return { sendMessage, stopStream }
}
