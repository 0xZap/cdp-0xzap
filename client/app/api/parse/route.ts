import { NextResponse } from "next/server";
import { MessageActions } from "@/types/chat";

export async function POST(request: Request) {
  try {
    const { content, messageId } = await request.json();

    // Simulate AI parsing of the message to generate actions
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock action generation
    const actions: MessageActions = {
      messageId,
      actions: [
        {
          type: "button",
          label: "Proceed",
          action: "proceed",
          variant: "primary",
        },
        {
          type: "button",
          label: "Cancel",
          action: "cancel",
          variant: "destructive",
        },
        {
          type: "suggestions",
          items: ["Try another approach", "Show me alternatives", "Explain more"],
        },
      ],
    };

    return NextResponse.json(actions);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to parse message" },
      { status: 500 }
    );
  }
} 