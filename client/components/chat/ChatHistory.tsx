import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { MessageCircle } from "lucide-react"

interface ChatHistoryProps {
  chats: {
    id: string
    title: string
    timestamp: string
    isActive?: boolean
  }[]
  onSelectChat: (id: string) => void
}

export function ChatHistory({ chats, onSelectChat }: ChatHistoryProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="space-y-2 p-2">
        <h2 className="px-4 text-xs font-semibold text-zinc-400">Chat History</h2>
        {chats.map((chat) => (
          <Button
            key={chat.id}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 px-4",
              chat.isActive ? "bg-zinc-800 text-zinc-100" : "text-zinc-400",
            )}
            onClick={() => onSelectChat(chat.id)}
          >
            <MessageCircle className="h-4 w-4" />
            <div className="flex flex-col items-start gap-1 text-left">
              <span className="line-clamp-1 text-sm">{chat.title}</span>
              <span className="text-xs text-zinc-500">{chat.timestamp}</span>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}

