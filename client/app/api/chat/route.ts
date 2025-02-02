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
`
        },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseMessage: Message = {
      id: Date.now().toString(),
      content: completion.choices[0].message.content || "",
      role: "assistant",
    };

    return NextResponse.json(responseMessage);
  } catch (error) {
    console.error("[Chat Error]", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 },
    );
  }
}


// app/api/chat/route.ts
// import { NextResponse } from "next/server";

// // Adjust this to match the base URL where your Express server is running
// const EXPRESS_SERVER_URL = "http://localhost:3001/api/chat";

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { message } = body;

//     if (!message) {
//       return NextResponse.json(
//         { error: "Missing 'message' field" },
//         { status: 400 }
//       );
//     }

//     // Forward the message to your Express server
//     const serverResponse = await fetch(EXPRESS_SERVER_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ message }),
//     });

//     const data = await serverResponse.json();

//     if (!serverResponse.ok) {
//       // The Express server responded with an error
//       return NextResponse.json(
//         { error: data.error || "Unknown error from Express server" },
//         { status: serverResponse.status }
//       );
//     }

//     // Return the JSON response from your Express server
//     return NextResponse.json(data);
//   } catch (error: any) {
//     console.error("Error in Next.js route POST /api/chat:", error);
//     return NextResponse.json(
//       { error: error.message || "Unknown server error" },
//       { status: 500 }
//     );
//   }
// }
