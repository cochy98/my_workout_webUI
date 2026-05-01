import { useEffect } from 'react'
import { ResizableLayout } from '@/components/layout/ResizableLayout'
import { useChatStore } from '@/store/chatStore'

export function Dashboard() {
  const { createNewChat, conversations } = useChatStore()

  useEffect(() => {
    if (conversations.length === 0) {
      createNewChat()
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <ResizableLayout />
}
