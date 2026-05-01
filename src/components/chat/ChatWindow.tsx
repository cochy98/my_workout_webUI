import { useEffect, useRef, useState, useCallback } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChatStore } from '@/store/chatStore'
import { MessageItem } from './MessageItem'
import { InputArea } from './InputArea'

const SCROLL_THRESHOLD = 100

export function ChatWindow() {
  const { currentConversationId, messages } = useChatStore()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [userScrolledUp, setUserScrolledUp] = useState(false)

  const currentMessages = currentConversationId
    ? (messages.get(currentConversationId) ?? [])
    : []

  const handleScroll = useCallback(() => {
    const el = scrollAreaRef.current
    if (!el) return
    const viewport = el.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement | null
    if (!viewport) return
    const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight
    setUserScrolledUp(distanceFromBottom > SCROLL_THRESHOLD)
  }, [])

  useEffect(() => {
    if (userScrolledUp) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages, userScrolledUp])

  useEffect(() => {
    setUserScrolledUp(false)
    bottomRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [currentConversationId])

  useEffect(() => {
    const root = scrollAreaRef.current
    if (!root) return
    const viewport = root.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null
    if (!viewport) return
    viewport.addEventListener('scroll', handleScroll)
    return () => viewport.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  if (!currentConversationId) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center gap-3 px-8">
        <p className="text-muted-foreground text-sm">
          Select a conversation or start a new one.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1 min-h-0"
      >
        <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
          {currentMessages.length === 0 ? (
            <div className="flex h-full items-center justify-center pt-24 text-center">
              <p className="text-muted-foreground text-sm">
                Invia un messaggio per iniziare la conversazione.
              </p>
            </div>
          ) : (
            currentMessages.map((msg) => <MessageItem key={msg.id} message={msg} />)
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <InputArea conversationId={currentConversationId} />
    </div>
  )
}
