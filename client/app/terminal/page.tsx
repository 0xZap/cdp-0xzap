"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { models } from "@/lib/mock-data";
import { SendHorizontal } from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
}

export default function TerminalPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How can I assist you today?",
      role: "assistant",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSend() {
    if (!inputValue.trim()) return;

    // 1. Add the user's message to the chat
    const userMsg: Message = {
      id: String(Date.now()),
      content: inputValue,
      role: "user",
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      // 2. Call our Next.js API route, which forwards the request to the Express server
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
      });

      if (!res.ok) {
        // If the Next.js route returns an error, handle it
        const errData = await res.json();
        throw new Error(errData.error || "Request failed");
      }

      const data = await res.json();
      // data should look like { answer: "some text from the agent" }
      const assistantMsg: Message = {
        id: String(Date.now()),
        content: data.answer,
        role: "assistant",
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Chat error:", err);
      const errorMsg: Message = {
        id: String(Date.now()),
        content: "Sorry, there was an error: " + err.message,
        role: "assistant",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-zinc-900">
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-4 space-y-8">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-4">
              <Avatar>
                <AvatarFallback className="bg-zinc-800 text-zinc-300">
                  {message.role === "user" ? "U" : "AI"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm text-zinc-100">{message.content}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="bg-zinc-950 p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Message..."
              className="w-full min-h-[56px] resize-none rounded bg-zinc-900 border-0 p-4 pr-12 text-sm text-zinc-100 placeholder:text-zinc-500 focus:ring-1 focus:ring-zinc-800"
              rows={1}
            />
            <Button
              size="icon"
              className="absolute right-2 bottom-2 h-8 w-8 bg-zinc-800 hover:bg-zinc-700"
              onClick={handleSend}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <SendHorizontal className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400">
            <Select defaultValue="gpt-3.5">
              <SelectTrigger className="w-[180px] h-8 bg-zinc-900 border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                {models.map((model) => (
                  <SelectItem
                    key={model.id}
                    value={model.id}
                    className="text-zinc-100"
                  >
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p>AI can make mistakes. Double check important info.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
