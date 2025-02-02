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
