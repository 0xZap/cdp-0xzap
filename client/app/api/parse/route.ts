import { openai } from '@/lib/openai';
import { NextResponse } from 'next/server';
import { MessageActions } from '@/types/chat';
import { z } from 'zod';

const SYSTEM_PROMPT = `You are an AI that analyzes messages to determine:
1. If they contain special UI elements (transfer or sentiment analysis)
2. What actions (if any) should be presented to the user

Analyze the message and return a JSON object with this structure:
{
  "type": "standard" | "transfer" | "sentiment",
  
  // For standard messages:
  "content": "original message text",
  
  // For transfer messages:
  "fromToken": "token symbol",
  "toToken": "token symbol",
  "amount": "transfer amount",
  
  // For sentiment messages:
  "topic": "what is being analyzed",
  "sentimentLevel": number between 0 and 1,
  
  // Optional actions array for any message type:
  "actions": [
    {
      "type": "suggestions",
      "items": ["suggestion 1", "suggestion 2"]
    }
    // ... other action types
  ]
}

Rules:
1. If the message discusses transferring tokens/currency, use type: "transfer". Also, you must always ask the user to confirm the transfer.
2. If the message analyzes sentiment/opinion about a topic, use type: "sentiment"
3. For all other messages, use type: "standard"
4. Include actions array only if user interaction is needed
5. Return valid JSON only, no additional text or code blocks

Example responses:
1. Transfer message:
{
  "type": "transfer",
  "fromToken": "ETH",
  "toToken": "USDC",
  "amount": "100",
  "actions": [
    {
      "type": "button",
      "label": "Confirm Transfer",
      "action": "confirm_transfer",
      "variant": "primary"
    }
  ]
}

2. Sentiment message:
{
  "type": "sentiment",
  "topic": "Project Proposal",
  "sentimentLevel": 0.8,
  "actions": [
    {
      "type": "suggestions",
      "items": ["Tell me more about the positive aspects", "What are the risks?"]
    }
  ]
}

3. Standard message:
{
  "type": "standard",
  "content": "Original message text",
  "actions": []
}`;

const messageSchema = z.object({
  type: z.enum(["standard", "transfer", "sentiment"]),
  // Standard message
  content: z.string().optional(),
  // Transfer message
  fromToken: z.string().optional(),
  toToken: z.string().optional(),
  amount: z.string().optional(),
  // Sentiment message
  topic: z.string().optional(),
  sentimentLevel: z.number().optional(),
  // Actions
  actions: z.array(
    z.union([
      z.object({
        type: z.literal("button"),
        label: z.string(),
        action: z.string(),
        variant: z.enum(["default", "primary", "destructive", "ghost"]).optional()
      }),
      z.object({
        type: z.literal("suggestions"),
        items: z.array(z.string())
      }),
      z.object({
        type: z.literal("confirm"),
        title: z.string(),
        description: z.string(),
        confirmLabel: z.string(),
        cancelLabel: z.string()
      })
    ])
  ).default([])
});

export async function POST(request: Request) {
  try {
    const { content, messageId } = await request.json();
    console.log('Parsing message:', { content, messageId });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    console.log('OpenAI Response:', completion.choices[0].message.content);
    
    const rawResponse = JSON.parse(completion.choices[0].message.content || '');
    console.log('Parsed Raw Response:', rawResponse);
    
    const parsed = messageSchema.safeParse(rawResponse);
    if (!parsed.success) {
      console.error('Invalid message format:', parsed.error);
      return NextResponse.json({
        messageId,
        type: "standard",
        content: content,
        actions: []
      });
    }

    // Return the full parsed data including type and specialized fields
    return NextResponse.json({
      messageId,
      ...parsed.data
    });
  } catch (error) {
    console.error('[Parse API Error]:', error);
    return NextResponse.json({
      // messageId,
      type: "standard",
      content: "Error understanding message",
      actions: []
    });
  }
} 