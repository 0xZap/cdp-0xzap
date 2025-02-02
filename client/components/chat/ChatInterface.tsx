"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { models } from "@/lib/mock-data"
import { ChatMessage } from "@/components/chat/ChatMessage"
import { ChatInput } from "@/components/chat/ChatInput"
import { sendMessage } from "@/lib/api"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Message } from "@/types/chat"
export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! How can I assist you today?\n\nI can help you with:\n- Writing code\n- Explaining concepts\n- Answering questions",
      role: "assistant",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await sendMessage(inputValue)
      setMessages((prev) => [...prev, response])
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-zinc-900">
      <ScrollArea className="flex-1 px-4">
        <div className="mx-auto max-w-3xl space-y-8 py-8">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-zinc-800 bg-zinc-950 p-4">
        <div className="mx-auto max-w-3xl space-y-4">
          <ChatInput value={inputValue} onChange={setInputValue} onSubmit={handleSubmit} isLoading={isLoading} />
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <Select defaultValue="gpt-3.5">
              <SelectTrigger className="h-8 w-[180px] border-zinc-800 bg-zinc-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-zinc-800 bg-zinc-900">
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id} className="text-zinc-100">
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p>AI can make mistakes. Consider checking important information.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

