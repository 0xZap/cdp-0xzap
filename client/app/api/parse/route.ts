import { openai } from '@/lib/openai';
import { NextResponse } from 'next/server';
import { MessageActions } from '@/types/chat';
import { z } from 'zod';

const SYSTEM_PROMPT = `You are an AI that analyzes chat messages and generates UI actions.
Your task is to return ONLY a JSON object containing appropriate UI actions based on the message content.
The JSON must follow this TypeScript type:

type ActionType = {
  type: "button" | "suggestions" | "confirm";
  label?: string;
  action?: string;
  variant?: "default" | "primary" | "destructive" | "ghost";
  items?: string[];
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

type Response = {
  actions: ActionType[];
}

Example response:
{
  "actions": [
    {
      "type": "button",
      "label": "Show Code",
      "action": "show_code",
      "variant": "primary"
    },
    {
      "type": "suggestions",
      "items": ["Option 1", "Option 2"]
    }
  ]
}`;

const actionSchema = z.object({
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
  )
});

export async function POST(request: Request) {
  try {
    const { content, messageId } = await request.json();

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const parsedActions = JSON.parse(completion.choices[0].message.content || '') as {
      actions: MessageActions['actions'];
    };

    const parsed = actionSchema.safeParse(parsedActions);
    if (!parsed.success) {
      console.error('Invalid actions format:', parsed.error);
      return NextResponse.json({ error: "Invalid actions format" }, { status: 400 });
    }

    return NextResponse.json({
      messageId,
      actions: parsedActions.actions,
    });
  } catch (error) {
    console.error('[Parse API Error]:', error);
    return NextResponse.json(
      { error: 'Failed to parse message' },
      { status: 500 }
    );
  }
} 