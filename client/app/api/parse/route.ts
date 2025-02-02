import { openai } from '@/lib/openai';
import { NextResponse } from 'next/server';
import { MessageActions } from '@/types/chat';
import { z } from 'zod';

const SYSTEM_PROMPT = `You are an AI that analyzes chat messages and determines if UI actions are needed.
Only return actions if the message clearly requires user interaction or choices.
For simple responses or statements, return an empty actions array.

Your response must be a valid JSON object.

Examples where actions are needed:
1. When offering multiple choices - use "suggestions" type
2. When asking for confirmation - use "button" type
3. When suggesting next steps - use "suggestions" type
4. When providing options for further exploration - use "suggestions" type

Example JSON responses:

For a message offering choices:
{
  "actions": [
    {
      "type": "suggestions",
      "items": ["First Option", "Second Option", "Third Option"]
    }
  ]
}

For a message requiring confirmation:
{
  "actions": [
    {
      "type": "button",
      "label": "Confirm",
      "action": "Yes, proceed with the changes",
      "variant": "primary"
    },
    {
      "type": "button",
      "label": "Cancel",
      "action": "No, let's try something else",
      "variant": "destructive"
    }
  ]
}

For a simple response with no actions needed:
{
  "actions": []
}

Analyze the message content and return appropriate JSON with actions if needed.`;

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
    
    const parsedActions = JSON.parse(completion.choices[0].message.content || '') as {
      actions: MessageActions['actions'];
    };

    console.log('Parsed Actions:', parsedActions);
    
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