import { NextResponse } from "next/server";

/**
 * This route proxies requests to your external server at `localhost:5002/executeFlow`.
 */
export async function POST(req: Request) {
  try {
    // 1) Parse body from the incoming request
    const body = await req.json();
    console.log(
      "[Proxy] Incoming request body:",
      JSON.stringify(body, null, 2)
    );

    // 2) Forward it to your external server
    console.log("[Proxy] Forwarding to http://localhost:5002/executeFlow ...");
    const externalRes = await fetch("http://localhost:5002/executeFlow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // 3) Check the status code
    console.log("[Proxy] External server response status:", externalRes.status);

    // If there's an error or 404, let's log the text content too
    if (!externalRes.ok) {
      // The server might be returning text/html with an error
      const errorText = await externalRes.text();
      console.error("[Proxy] External server returned non-OK", errorText);
      return NextResponse.json(
        { success: false, error: `Non-OK status: ${externalRes.status}` },
        { status: 500 }
      );
    }

    // 4) Attempt to parse the JSON
    let data: any = null;
    try {
      data = await externalRes.json();
    } catch (parseErr: any) {
      console.error(
        "[Proxy] Failed to parse JSON from external server",
        parseErr
      );
      return NextResponse.json(
        { success: false, error: "Failed to parse JSON from external server" },
        { status: 500 }
      );
    }

    // Debug: see the shape of data
    console.log(
      "[Proxy] External server JSON data:",
      JSON.stringify(data, null, 2)
    );

    // If the external server returns { success: false }, handle that
    if (!data.success) {
      console.error("[Proxy] External server indicated success=false");
      return NextResponse.json(data, { status: 500 });
    }

    // 5) Extract the final AI message or handle messages
    const messages = data.messages || [];
    let finalAiMessage = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];

      // 1) new-school approach: if (msg.role === 'assistant'), got it
      if (msg.role === "assistant") {
        finalAiMessage = msg;
        break;
      }

      // 2) old-school: AIMessage constructor
      if (
        msg.lc === 1 &&
        msg.type === "constructor" &&
        Array.isArray(msg.id) &&
        msg.id.includes("AIMessage")
      ) {
        finalAiMessage = msg;
        break;
      }
    }

    // Instead of finalAiMessage?.content, we check either top-level or kwargs
    let finalContent = "[No AI message found]";
    if (finalAiMessage) {
      if (finalAiMessage?.role === "assistant") {
        finalContent = finalAiMessage.content;
      } else {
        finalContent =
          finalAiMessage?.kwargs?.content ?? "[No AI message found]";
      }
    }

    return NextResponse.json({
      success: true,
      allMessages: data.messages,
      lastAiMessage: finalContent,
    });
  } catch (err: any) {
    console.error("[Proxy] Caught error in /api/executeFlow route:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message ?? "Unknown error in proxy route",
      },
      { status: 500 }
    );
  }
}
