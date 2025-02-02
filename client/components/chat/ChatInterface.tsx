"use client"

import { useState } from "react"
import { ChatMessage } from "@/components/chat/ChatMessage"
import { ChatInput } from "@/components/chat/ChatInput"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Message, MessageActions } from "@/types/chat"

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `**Hello!** I'm your specialized assistant, here to help with a variety of tasks:

- **General Questions**  
  Ask me anything! From coding tips to trivia, I can offer insights and explanations.

- **Token Transfers**  
  Need to move tokens or currencies? I can handle the details—just let me know your source token, destination token, and amount.

- **Sentiment Analysis**  
  Curious about how optimistic or pessimistic your idea might sound? I can gauge the sentiment and present it on a scale from very negative to very positive.

- **Suggestions & Confirmations**  
  I can also suggest next steps, confirm actions, or present clickable options to guide the conversation.

Just let me know what you'd like to do, and I'll take care of the rest!`
    },
  ]);
  
  const [messageActions, setMessageActions] = useState<Record<string, MessageActions>>({
    "1": { messageId: "1", actions: [] }
  })
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (userInput?: string) => {
    const finalInput = userInput || input;
    if (!finalInput.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: finalInput,
      role: "user",
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: finalInput }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const aiMessage: Message = await response.json()
      setMessages(prev => [...prev, aiMessage])

      // Parse the AI message for actions and special message types
      try {
        const parseResponse = await fetch("/api/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: aiMessage.content, messageId: aiMessage.id }),
        });

        if (!parseResponse.ok) {
          throw new Error("Failed to parse message");
        }

        const parsedData = await parseResponse.json();
        console.log('Parsed Data:', parsedData);

        // Update the message with parsed data
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessage.id 
              ? { ...msg, parsedData } 
              : msg
          )
        );

        // Also update message actions if present
        if (parsedData.actions?.length > 0) {
          setMessageActions(prev => ({
            ...prev,
            [aiMessage.id]: {
              messageId: aiMessage.id,
              actions: parsedData.actions
            }
          }));
        }
      } catch (parseError) {
        console.error("Parse error:", parseError);
        setErrors(prev => ({
          ...prev,
          [aiMessage.id]: "Failed to analyze message for actions"
        }));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        general: "Failed to send message"
      }));
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = async (action: string) => {
    // Extract the suggestion text without the prefix
    const message = action.startsWith('suggest:') 
      ? action.replace('suggest:', '') 
      : action;

    // Submit the message directly instead of setting input
    await handleSubmit(message);
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
              isParsing={
                !message.parsedData &&
                message.role === 'assistant' && 
                message.id !== "1"
              }
              isLoading={isLoading && message.id === messages[messages.length - 1]?.id}
              error={errors[message.id]}
            />
          ))}
        </div>
      </ScrollArea>

      <div className="p-4">
        <div className="mx-auto max-w-3xl space-y-4">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}

