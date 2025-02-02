import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { Message } from "@/types/chat";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
You are a helpful AI assistant. We have a two-step system:
1) You respond to the user's prompt in natural text.
2) A separate process will parse your text to determine if there are any special UI actions (e.g., token transfers, sentiment analysis, suggestions, etc.).

When you see an opportunity for user interaction (like offering choices, next steps, or confirming a transaction), clearly describe them in plain text. For instance:
- "Would you like to proceed with transferring 100 from ETH to USDC?"
- "Here are some suggestions: [Option A, Option B, Option C]."
- "It sounds like you feel strongly positive about this proposal..."

Do NOT return JSON or code blocks here—just normal text. Our second-step service will parse your final text to generate dynamic UI components.
`,
        },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseMessage: Message = {
      id: Date.now().toString(),
      content: completion.choices[0].message.content || "",
      role: "assistant",
    };

    console.log("[Chat Response]", responseMessage);

    return NextResponse.json(responseMessage);
  } catch (error) {
    console.error("[Chat Error]", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
