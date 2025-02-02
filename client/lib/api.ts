import { Message, MessageActions } from "@/types/chat";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendMessage(content: string): Promise<Message> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: content }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
}

export async function parseMessage(
  content: string,
  messageId: string
): Promise<MessageActions | null> {
  try {
    console.log('Sending for parsing:', { content, messageId });
    
    const response = await fetch("/api/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, messageId }),
    });

    if (!response.ok) {
      console.error('Parse API error:', await response.text());
      return null;
    }

    const result = await response.json();
    console.log('Received parse result:', result);
    
    return result;
  } catch (error) {
    console.error("Failed to parse message:", error);
    return { 
      messageId,
      actions: []
    };
  }
}