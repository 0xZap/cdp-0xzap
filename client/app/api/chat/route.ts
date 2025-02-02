{/*
import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { Message } from '@/types/chat';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful AI assistant. When appropriate, offer clear choices or suggestions to users. For example, when explaining technical concepts, offer to show code examples or provide more detailed explanations.' 
        },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const responseMessage: Message = {
      id: Date.now().toString(),
      content: completion.choices[0].message.content || '',
      role: 'assistant'
    };

    return NextResponse.json(responseMessage);
  } catch (error) {
    console.error('[Chat Error]', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
*/}

// app/api/chat/route.ts
import { NextResponse } from "next/server";

// Adjust this to match the base URL where your Express server is running
const EXPRESS_SERVER_URL = "http://localhost:3001/api/chat";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Missing 'message' field" },
        { status: 400 }
      );
    }

    // Forward the message to your Express server
    const serverResponse = await fetch(EXPRESS_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await serverResponse.json();

    if (!serverResponse.ok) {
      // The Express server responded with an error
      return NextResponse.json(
        { error: data.error || "Unknown error from Express server" },
        { status: serverResponse.status }
      );
    }

    // Return the JSON response from your Express server
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in Next.js route POST /api/chat:", error);
    return NextResponse.json(
      { error: error.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
