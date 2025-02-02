"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { SendHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value?: string) => void
  isLoading?: boolean
}

export function ChatInput({ value, onChange, onSubmit, isLoading }: ChatInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Automatically adjust the textarea height based on content
  React.useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      // Reset height to auto to properly measure scrollHeight
      textarea.style.height = "auto"
      // Then set it to scrollHeight
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [value]) // Re-run when 'value' changes

  // Submit on Enter (no shift)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div 
      className="
        relative 
        flex items-start 
        rounded-xl border border-zinc-700 
        bg-zinc-800 
        p-3 pt-3.5
        focus-within:border-zinc-600 
        focus-within:shadow-md 
        focus-within:shadow-zinc-600/20
        transition-all
      "
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message. Press Enter to send. Shift+Enter for new line."
        rows={1}
        className={cn(
          "w-full resize-none border-0 bg-transparent p-0 text-sm text-zinc-100",
          "placeholder:text-zinc-400 focus:outline-none focus:ring-0",
          "scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-700"
        )}
        style={{
          maxHeight: "180px",
          overflowY: "auto",
          paddingRight: "2.5rem", // ensures text doesn't run under the button
        }}
        disabled={isLoading}
      />

      <Button
        size="icon"
        variant="default"
        className="
          absolute right-2 bottom-2 
          h-8 w-8 rounded-md 
          bg-blue-600 hover:bg-blue-700 
          text-white 
          flex items-center justify-center
          disabled:opacity-50 
          disabled:cursor-not-allowed
        "
        onClick={() => onSubmit()}
        disabled={isLoading || !value.trim()}
      >
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </div>
  )
}