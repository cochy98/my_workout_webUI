import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { Sidebar } from '@/components/chat/Sidebar'
import { ChatWindow } from '@/components/chat/ChatWindow'

export function ResizableLayout() {
  return (
    <div className="h-screen flex flex-col">
      <ResizablePanelGroup orientation="horizontal" className="flex-1">
        <ResizablePanel defaultSize="22%" minSize="15%" maxSize="35%">
          <Sidebar />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize="78%" minSize="50%">
          <ChatWindow />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
