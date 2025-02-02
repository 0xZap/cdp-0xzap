"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { Message, MessageActions } from "@/types/chat";

export function ChatInterface() {
  // ───────────────────────────────────────────────────────────
  // 1. Hardcoded flow ID
  // ───────────────────────────────────────────────────────────
  const HARDCODED_FLOW_ID = "cc8c7b1f-15d4-4ab3-90c4-6b84512f0cf6";

  // ───────────────────────────────────────────────────────────
  // 2. State for the flow data (fetched from /api/flows/:id)
  //    plus any error while fetching
  // ───────────────────────────────────────────────────────────
  const [flowData, setFlowData] = useState<any>(null);
  const [flowFetchError, setFlowFetchError] = useState<string>("");

  useEffect(() => {
    // Fetch the flow once on mount
    const fetchFlow = async () => {
      try {
        const res = await fetch(`/api/flows/${HARDCODED_FLOW_ID}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch flow data (status ${res.status})`);
        }
        const data = await res.json();
        // data might look like: { id: "123", graph: { nodes, edges } }
        setFlowData(data);
      } catch (err: any) {
        console.error("Error fetching flow:", err);
        setFlowFetchError(err.message || "Unknown error fetching flow");
      }
    };
    fetchFlow();
  }, []);

  // ───────────────────────────────────────────────────────────
  // Existing chat states
  // ───────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How can I assist you today?",
      role: "assistant",
    },
  ]);
  const [messageActions, setMessageActions] = useState<
    Record<string, MessageActions>
  >({
    "1": { messageId: "1", actions: [] },
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ───────────────────────────────────────────────────────────
  // 3. Handle sending messages (now using /api/execute-flow)
  // ───────────────────────────────────────────────────────────
  const handleSubmit = async (userInput?: string) => {
    const finalInput = userInput || input;
    if (!finalInput.trim() || isLoading) return;

    // If flow not yet loaded, handle gracefully
    if (!flowData?.graph) {
      setErrors((prev) => ({
        ...prev,
        general: "Flow data not loaded yet. Please wait or reload.",
      }));
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: finalInput,
      role: "user",
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setErrors({});

    try {
      // 3a) Build or retrieve the minimal flow from fetched data
      // Here we assume the flow is in flowData.graph
      // e.g. { nodes: [...], edges: [...] }
      const minimalFlow = flowData.graph;

      // 3b) Send the entire conversation + flow to /api/execute-flow
      const response = await fetch("/api/execute-flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flowDefinition: minimalFlow,
          userMessages: updatedMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Unknown server error");
      }

      // Create a new AI message from the server’s response
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: data.lastAiMessage ?? "[No AI message found]",
        role: "assistant",
      };
      setMessages((prev) => [...prev, aiMessage]);

      // ─────────────────────────────────────────────────────────
      // 4. Parse the AI message with /api/parse
      // ─────────────────────────────────────────────────────────
      try {
        const parseResponse = await fetch("/api/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: aiMessage.content,
            messageId: aiMessage.id,
          }),
        });

        if (!parseResponse.ok) {
          throw new Error("Failed to parse message");
        }

        const parsedData = await parseResponse.json();
        console.log("Parsed Data:", parsedData);

        // Update the AI message with parsed data
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessage.id ? { ...msg, parsedData } : msg
          )
        );

        // If the parsed response has actions, store them
        if (parsedData.actions?.length > 0) {
          setMessageActions((prev) => ({
            ...prev,
            [aiMessage.id]: {
              messageId: aiMessage.id,
              actions: parsedData.actions,
            },
          }));
        }
      } catch (parseError) {
        console.error("Parse error:", parseError);
        setErrors((prev) => ({
          ...prev,
          [aiMessage.id]: "Failed to analyze message for actions",
        }));
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setErrors((prev) => ({
        ...prev,
        general: "Failed to send message",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // ───────────────────────────────────────────────────────────
  // If the AI message includes actions, allow click -> re-submit
  // ───────────────────────────────────────────────────────────
  const handleActionClick = async (action: string) => {
    const message = action.startsWith("suggest:")
      ? action.replace("suggest:", "")
      : action;
    await handleSubmit(message);
  };

  // ───────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-zinc-900">
      {/* If flow fetch errored, show that up top (or handle differently) */}
      {flowFetchError && (
        <div className="bg-red-500 text-white p-2 text-center">
          Error loading flow: {flowFetchError}
        </div>
      )}

      {/* Scrollable container for messages */}
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
                message.role === "assistant" &&
                message.id !== "1"
              }
              // Adjust how you want to show loading or error states
              isLoading={false}
              error={errors[message.id]}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Input area */}
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
  );
}
