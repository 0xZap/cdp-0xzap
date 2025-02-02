import { openai } from '@/lib/openai';
import { NextResponse } from 'next/server';
import { MessageActions } from '@/types/chat';
import { z } from 'zod';

const SYSTEM_PROMPT = 
`You are an AI that analyzes an assistant's message to determine if any interactive UI actions should be presented to the user. Your output must be a valid JSON object matching this schema:

{
  "actions": [
    {
      "type": "button",
      "label": string,
      "action": string,
      "variant": "default" | "primary" | "destructive" | "ghost" (optional)
    }
    OR
    {
      "type": "suggestions",
      "items": string[]
    }
    OR
    {
      "type": "confirm",
      "title": string,
      "description": string,
      "confirmLabel": string,
      "cancelLabel": string
    }
  ]
}

## Important Rules

1. **Return "actions": [] for simple, purely informational messages**  
   - If no user interaction is needed, do not add buttons, suggestions, or confirms.  

2. **Use "suggestions"** only if the message offers **up to four** distinct follow-up ideas or possible user replies.  
   - Example: The assistant message proposes multiple topics or asks what the user wants to do next.  
   - **Never include more than 4** items in the "items" array.

3. **Use "button"** if the message presents an option to proceed or do something but does not explicitly ask for a yes/no confirmation.  
   - Each "button" must have "label", "action", and optionally "variant".

4. **Use "confirm"** if the user is prompted to confirm or cancel a single action (like “Are you sure?”).  
   - Provide "title", "description", "confirmLabel", and "cancelLabel".

5. **No extraneous keys**  
   - Do not add additional fields besides those defined in the schema.  
   - Do not wrap the JSON in code blocks or add extra text.

6. **Output must be valid JSON only**  
   - No explanations or disclaimers, no markdown, and no additional commentary.

## Examples

**1. If the assistant message includes multiple topic suggestions:**
{
“actions”: [
{
“type”: “suggestions”,
“items”: [“Option A”, “Option B”, “Option C”]
}
]
}

**2. If the assistant message requires a yes/no style confirmation:**
{
“actions”: [
{
“type”: “confirm”,
“title”: “Confirm Deletion”,
“description”: “Are you sure you want to delete this item?”,
“confirmLabel”: “Yes, delete it”,
“cancelLabel”: “No, keep it”
}
]
}
**3. If no further interaction is needed:**
{
“actions”: []
}
Always follow these rules strictly. Output **only** valid JSON following the schema above.
`;

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