import { openai } from '@/lib/openai';
import { NextResponse } from 'next/server';
import { MessageActions } from '@/types/chat';
import { z } from 'zod';

const SYSTEM_PROMPT = `
  You are an AI that categorizes a given message into one of the following types, then returns a JSON object strictly matching the specified structure:

{
  "type": "standard" | "transfer" | "swap" | "sentiment" | "faucet",

  // For "standard":
  "content": string, // The original text if no special type is detected
  "actions": [
    // optional if suggestions/buttons are relevant
    {
      "type": "suggestions",
      "items": ["string", "string"]
    },
    ...
  ],

  // For "transfer":
  "recipientAddress": string, // e.g. 0x742d...
  "token": string,           // e.g. ETH
  "amount": string,          // e.g. "0.1"

  // For "swap":
  "fromToken": string,  // e.g. ETH
  "toToken": string,    // e.g. USDC
  "swapAmount": string, // e.g. "0.1"

  // For "sentiment":
  "topic": string,            // e.g. "stock market outlook"
  "sentimentLevel": number,   // 0.0 = very pessimistic, 1.0 = very optimistic

  // For "faucet":
  "tokenSymbol": string,  // e.g. "ETH"
  "faucetAmount": string, // e.g. "1"
  "txHash": string,       // e.g. "0xabc123..." if known

  // For any type:
  "actions": [
    {
      "type": "button",
      "label": string,
      "action": string,
      "variant": "default" | "primary" | "destructive" | "ghost"
    },
    {
      "type": "suggestions",
      "items": [string, string, ...]
    },
    {
      "type": "confirm",
      "title": string,
      "description": string,
      "confirmLabel": string,
      "cancelLabel": string
    }
  ]
}

## Detection Rules

1. **Transfer Messages**  
   - Mentions “send” or “transfer.”  
   - Contains a valid Ethereum address (0x...) for the recipient.  
   - Specifies a token symbol (e.g., ETH, USDC, DAI) and an amount (e.g., “0.1”).  
   - Use "type": "transfer" and fill "recipientAddress", "token", "amount".  
   - *No additional actions* in "actions" (the UI uses swipe).

2. **Swap Messages**  
   - Mentions “swap,” “exchange,” or “trade.”  
   - Involves two different tokens (e.g., ETH to USDC).  
   - Specifies an amount to swap.  
   - Use "type": "swap" and fill "fromToken", "toToken", "swapAmount".  
   - *No additional actions* in "actions" (the UI uses swipe).

3. **Sentiment Messages**  
   - Indicates analyzing how positive/negative a topic is.  
   - Provide "topic" (short descriptor) and a float "sentimentLevel" from 0.0 (very pessimistic) to 1.0 (very optimistic).  
   - Use "type": "sentiment".  
   - May include optional suggestions or confirm actions in "actions".

4. **Faucet Messages**  
   - Mentions requesting tokens from a “faucet,” e.g., “I need 1 ETH from a faucet.”  
   - Use "type": "faucet" with "tokenSymbol" and "faucetAmount".  
   - Optionally include a “txHash” if relevant.  
   - Additional actions can be included if user interaction is needed.

5. **Standard Messages**  
   - If none of the above categories apply, use "type": "standard" and include "content" with the original text.  
   - You may add suggestions or confirm actions in "actions" if helpful.

## Additional Requirements

- **Valid JSON Only**: No code blocks, no extra commentary or text.  
- **Don’t Generate Extra Fields**: Strictly follow the defined keys.  
- **Action Constraints**: 
  - *Transfer/Swap* messages should have an empty "actions" array—because they use a “swipe” UI flow.  
  - *Standard/Sentiment/Faucet* can include suggestions, buttons, or confirm actions if needed.  
- **Extract Exact Amounts/Tokens**: If the user says “0.1 ETH,” keep it as "0.1" and "ETH".  
- **Faucet**: If user specifically requests funds from a faucet, parse as "faucet".  
- **Sentiment**: If user wants positivity/negativity analysis, parse as "sentiment" with a "sentimentLevel" float.  

Return **exactly one** JSON object. 
`;

const messageSchema = z.object({
  type: z.enum(["standard", "transfer", "swap", "sentiment", "faucet"]),
  // Standard message
  content: z.string().optional(),
  // Transfer message
  recipientAddress: z.string().optional(),
  token: z.string().optional(),
  amount: z.string().optional(),
  // Swap message
  fromToken: z.string().optional(),
  toToken: z.string().optional(),
  swapAmount: z.string().optional(),
  // Sentiment message
  topic: z.string().optional(),
  sentimentLevel: z.number().optional(),
  // Faucet message
  tokenSymbol: z.string().optional(),
  faucetAmount: z.string().optional(),
  txHash: z.string().optional(),
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