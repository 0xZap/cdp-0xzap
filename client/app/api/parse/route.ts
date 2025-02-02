import { openai } from '@/lib/openai';
import { NextResponse } from 'next/server';
import { MessageActions } from '@/types/chat';
import { z } from 'zod';

const SYSTEM_PROMPT = `You are an AI that analyzes chat messages and determines if UI actions are needed.
Only return actions if the message clearly requires user interaction or choices.
For simple responses or statements, return an empty actions array.

Your response must be a valid JSON object.

When the AI message contains multiple options or suggestions for the user to choose from,
return them as clickable suggestions that the user can select to continue the conversation.

Example JSON responses:

For a message with suggestions:
{
  "actions": [
    {
      "type": "suggestions",
      "items": ["Tell me more about option 1", "I want to learn about option 2"]
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

Important: Always return an array of actions, even if there's only one action type.
Each suggestion should be a complete, natural response that the user might say.`;

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
    
    const rawResponse = JSON.parse(completion.choices[0].message.content || '');
    
    // Transform the response to match our expected format
    const parsedActions = {
      actions: Array.isArray(rawResponse.actions) 
        ? rawResponse.actions 
        : [rawResponse.actions].filter(Boolean)
    };

    console.log('Transformed Actions:', parsedActions);
    
    const parsed = actionSchema.safeParse(parsedActions);
    if (!parsed.success) {
      console.error('Invalid actions format:', parsed.error);
      return NextResponse.json({
        messageId,
        actions: [] // Return empty actions on validation failure
      });
    }

    return NextResponse.json({
      messageId,
      actions: parsed.data.actions,
    });
  } catch (error) {
    console.error('[Parse API Error]:', error);
    return NextResponse.json({
      // messageId,
      actions: []
    });
  }
} 