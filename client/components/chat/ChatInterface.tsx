"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { models } from "@/lib/mock-data"
import { ChatMessage } from "@/components/chat/ChatMessage"
import { ChatInput } from "@/components/chat/ChatInput"
import { ScrollArea } from "@/components/ui/scroll-area"
import { parseMessage } from "@/lib/api"
import { Message, MessageActions } from "@/types/chat"

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How can I assist you today?",
      role: "assistant",
    },
  ])
  const [messageActions, setMessageActions] = useState<Record<string, MessageActions>>({})
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const aiMessage: Message = await response.json()
      setMessages(prev => [...prev, aiMessage])

      // Parse the AI message for actions
      const actions = await parseMessage(aiMessage.content, aiMessage.id)
      if (actions) {
        setMessageActions(prev => ({
          ...prev,
          [aiMessage.id]: actions,
        }))
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleActionClick = async (action: string) => {
    // Handle action clicks here
    console.log("Action clicked:", action)
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-zinc-900">
      <ScrollArea className="flex-1 px-4">
        <div className="mx-auto max-w-3xl space-y-8 py-8">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              actions={messageActions[message.id]}
              onActionClick={handleActionClick}
              isParsing={!messageActions[message.id] && message.role === 'assistant'}
            />
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-zinc-800 bg-zinc-950 p-4">
        <div className="mx-auto max-w-3xl space-y-4">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
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

