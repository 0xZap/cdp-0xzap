import { NextResponse } from "next/server";
import { Message } from "@/types/chat";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock AI response
    const response: Message = {
      id: Date.now().toString(),
      content: `This is a server response to: "${message}". Would you like to proceed with the suggested action?`,
      role: "assistant",
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}