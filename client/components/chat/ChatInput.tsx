"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { SendHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isLoading?: boolean
}

export function ChatInput({ value, onChange, onSubmit, isLoading }: ChatInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [textareaRef]) // Updated dependency

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        rows={1}
        className={cn(
          "min-h-[56px] w-full resize-none rounded-xl bg-zinc-800 border-zinc-700 p-4 pr-12 text-sm text-zinc-100",
          "placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-0",
          "scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-700",
        )}
        style={{
          maxHeight: "200px",
          overflowY: "auto",
        }}
        disabled={isLoading}
      />
      <Button
        size="icon"
        className="absolute bottom-2 right-2 h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-700"
        onClick={onSubmit}
        disabled={isLoading || !value.trim()}
      >
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </div>
  )
}
