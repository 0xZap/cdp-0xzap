import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Message, MessageActions } from "@/types/chat"
import { ChatActions } from "./ChatActions"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { Loader2 } from "lucide-react"
import { TransferMessage } from "./message-types/TransferMessage"
import { SentimentMessage } from "./message-types/SentimentMessage"
import { useState } from "react"
import { Button } from "../ui/button"
import { FileText, LayoutTemplate } from "lucide-react"
import { FaucetMessage } from "./message-types/FaucetMessage"
import { SwapMessage } from "./message-types/SwapMessage"

interface ChatMessageProps {
  message: Message
  actions?: MessageActions
  onActionClick?: (action: string) => void
  isParsing?: boolean
  isLoading?: boolean
  error?: string
}

export function ChatMessage({ message, actions, onActionClick, isParsing, isLoading, error }: ChatMessageProps) {
  const [showSpecialView, setShowSpecialView] = useState(true)
  
  const renderSpecializedContent = () => {
    if (!message.parsedData || message.parsedData.type === "standard") {
      return renderContent(message.content)
    }

    switch (message.parsedData.type) {
      case "transfer":
        return (
          <TransferMessage
            recipientAddress={message.parsedData.recipientAddress!}
            token={message.parsedData.token!}
            amount={message.parsedData.amount!}
            onConfirm={() => {
              onActionClick?.("confirm_transfer");
            }}
          />
        )
      case "swap":
        return (
          <SwapMessage
            fromToken={message.parsedData.fromToken!}
            toToken={message.parsedData.toToken!}
            amount={message.parsedData.swapAmount!}
            onConfirm={() => {
              onActionClick?.("confirm_swap");
            }}
          />
        )
      case "sentiment":
        return (
          <SentimentMessage
            topic={message.parsedData.topic!}
            sentimentLevel={message.parsedData.sentimentLevel!}
          />
        )
      case "faucet":
        return (
          <FaucetMessage
            tokenSymbol={message.parsedData.tokenSymbol!}
            faucetAmount={message.parsedData.faucetAmount!}
            txHash={message.parsedData.txHash}
          />
        )
      default:
        return renderContent(message.content)
    }
  }

  const renderContent = (content: string) => (
    <ReactMarkdown
      className="prose prose-invert max-w-none"
      components={{
        code({ inline, className, children, ...props } : any) {
          const match = /language-(\w+)/.exec(className || "")
          return !inline && match ? (
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              className="rounded-lg !bg-zinc-950/50 !mt-4 !mb-4 shadow-lg"
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code {...props} className={cn("rounded-md bg-zinc-900/50 px-1.5 py-0.5 shadow-sm", className)}>
              {children}
            </code>
          )
        },
        p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="mb-4 list-disc pl-4 last:mb-0 space-y-2">{children}</ul>,
        ol: ({ children }) => <ol className="mb-4 list-decimal pl-4 last:mb-0 space-y-2">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        a: ({ children, href }) => (
          <a
            href={href}
            className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <div
      className={cn(
        "group flex gap-3 transition-opacity",
        message.role === "user" && "flex-row-reverse",
        isLoading && "opacity-70",
      )}
    >
      <Avatar className="h-8 w-8 shrink-0 select-none ring-2 ring-zinc-800">
        <AvatarFallback
          className={cn(
            "text-sm font-medium",
            message.role === "user"
              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
              : "bg-gradient-to-br from-zinc-700 to-zinc-800 text-zinc-300",
          )}
        >
          {message.role === "user" ? "U" : "AI"}
        </AvatarFallback>
      </Avatar>
      <div className={cn("flex max-w-[80%] flex-col gap-2", message.role === "user" && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm shadow-md transition-all duration-200",
            message.role === "user"
              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-900/20"
              : "bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-100 shadow-zinc-950/50 group-hover:shadow-lg group-hover:from-zinc-700/90 group-hover:to-zinc-800/90",
            message.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm",
          )}
        >
          {message.parsedData && message.parsedData.type !== "standard" && (
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setShowSpecialView(!showSpecialView)}
              >
                {showSpecialView ? (
                  <>
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    View as text
                  </>
                ) : (
                  <>
                    <LayoutTemplate className="h-3.5 w-3.5 mr-1.5" />
                    View as template
                  </>
                )}
              </Button>
            </div>
          )}
          {showSpecialView ? renderSpecializedContent() : renderContent(message.content)}
          {message.role === "assistant" && (
            <>
              {isLoading && (
                <div className="flex items-center gap-2 mt-3 border-t border-zinc-700/50 pt-3 text-zinc-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs">AI is thinking...</span>
                </div>
              )}
              {error && (
                <div className="mt-3 text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                  {error}
                </div>
              )}
            </>
          )}
        </div>
        {actions && actions.actions.length > 0 && onActionClick && (
          <div className="animate-fade-in">
            <ChatActions actions={actions} onActionClick={onActionClick} />
          </div>
        )}
        {isParsing && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900/50 px-3 py-1.5 rounded-full shadow-sm">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Analyzing response...</span>
          </div>
        )}
      </div>
    </div>
  );
}

