import { PlusCircle, MessageSquare, Trash2, Dumbbell } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/store/chatStore'
import { UserNav } from './UserNav'

export function Sidebar() {
  const {
    conversations,
    currentConversationId,
    selectConversation,
    createNewChat,
    deleteConversation,
  } = useChatStore()

  return (
    <div className="flex h-full flex-col bg-muted/20 border-r">
      <div className="px-3 py-4 space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Dumbbell className="h-5 w-5 text-primary shrink-0" />
          <span className="font-semibold text-base truncate">Workout Coach</span>
        </div>
        <Button
          onClick={() => createNewChat()}
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <Separator />

      <ScrollArea className="flex-1 min-h-0 px-2 py-2">
        {conversations.length === 0 ? null : (
          <div className="space-y-0.5">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  'group relative flex items-center rounded-md px-2 py-2 text-sm cursor-pointer',
                  'hover:bg-muted transition-colors',
                  currentConversationId === conv.id && 'bg-muted font-medium'
                )}
                onClick={() => selectConversation(conv.id)}
              >
                <MessageSquare className="h-4 w-4 mr-2.5 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate min-w-0">{conv.title}</span>
                <button
                  className={cn(
                    'ml-1 h-6 w-6 rounded-sm flex items-center justify-center shrink-0',
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                    'hover:bg-destructive/10 hover:text-destructive'
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteConversation(conv.id)
                  }}
                  title="Delete conversation"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <Separator />

      <div className="px-3 py-3">
        <UserNav />
      </div>
    </div>
  )
}
