import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Message, MessageActions } from "@/types/chat"
import { ChatActions } from "./ChatActions"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { Loader2 } from "lucide-react"

interface ChatMessageProps {
  message: Message
  actions?: MessageActions
  onActionClick?: (action: string) => void
  isParsing?: boolean
  isLoading?: boolean
  error?: string
}

export function ChatMessage({ 
  message, 
  actions, 
  onActionClick, 
  isParsing,
  isLoading,
  error 
}: ChatMessageProps) {
  // Add temporary debug output
  console.log('Rendering message:', message.id, 'with actions:', actions?.actions);

  return (
    <div className={cn("flex gap-4", message.role === "user" && "flex-row-reverse")}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            "text-sm",
            message.role === "user" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-300"
          )}
        >
          {message.role === "user" ? "U" : "AI"}
        </AvatarFallback>
      </Avatar>
      <div className={cn(
        "flex max-w-[80%] flex-col gap-2",
        message.role === "user" && "items-end"
      )}>
        <div className={cn(
          "rounded-2xl px-4 py-2 text-sm",
          message.role === "user" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-300",
        )}>
          {message.role === "user" ? (
            message.content
          ) : (
            <>
              <ReactMarkdown
                className="prose prose-invert max-w-none"
                components={{
                  code({ inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "")
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg"
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code {...props} className={cn("rounded-sm bg-zinc-700/50 px-1 py-0.5", className)}>
                        {children}
                      </code>
                    )
                  },
                  // Customize other markdown elements
                  p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="mb-4 list-disc pl-4 last:mb-0">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-4 list-decimal pl-4 last:mb-0">{children}</ol>,
                  li: ({ children }) => <li className="mb-2 last:mb-0">{children}</li>,
                  a: ({ children, href }) => (
                    <a href={href} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
              {isLoading && (
                <div className="flex items-center gap-2 mt-2 text-zinc-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs">AI is thinking...</span>
                </div>
              )}
              {error && (
                <div className="mt-2 text-xs text-red-400">
                  Error: {error}
                </div>
              )}
            </>
          )}
        </div>
        {actions && actions.actions.length > 0 && onActionClick && (
          <ChatActions actions={actions} onActionClick={onActionClick} />
        )}
        {isParsing && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 mt-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Analyzing response...</span>
          </div>
        )}
      </div>
    </div>
  )
}
