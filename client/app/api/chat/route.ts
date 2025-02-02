import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { Message } from '@/types/chat';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful AI assistant.' },
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