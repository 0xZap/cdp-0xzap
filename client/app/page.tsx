        {/*
"use client";

import { ChatInterface } from "@/components/chat/ChatInterface";

export default function Terminal() {
  return <ChatInterface />;
  */}


// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="h-screen flex flex-col items-center justify-center bg-zinc-900 text-zinc-200">
      <h1 className="text-2xl mb-4">Welcome to the Chatbot</h1>
      <Link
        href="/terminal"
        className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded"
      >
        Go to Chat
      </Link>
    </main>
  );
}
