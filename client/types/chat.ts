export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  parsedData?: ParsedMessageData;
}

export type MessageType = "standard" | "transfer" | "sentiment" | "faucet" | "swap";

export interface ParsedMessageData {
  type: MessageType;
  // Standard message
  content?: string;
  // Transfer message (updated)
  recipientAddress?: string;
  token?: string;
  amount?: string;
  // Swap message (previously transfer)
  fromToken?: string;
  toToken?: string;
  swapAmount?: string;
  // Sentiment message
  topic?: string;
  sentimentLevel?: number;
  // Faucet message
  tokenSymbol?: string;
  faucetAmount?: string;
  txHash?: string;
  // Actions (existing)
  actions: ActionType[];
}

export interface ActionButton {
  type: "button";
  label: string;
  action: string;
  variant?: "default" | "primary" | "destructive";
}

export interface ActionConfirm {
  type: "confirm";
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
}

export interface ActionSuggestions {
  type: "suggestions";
  items: string[];
}

export type ActionType = ActionButton | ActionConfirm | ActionSuggestions;

export interface MessageActions {
  messageId: string;
  actions: ActionType[];
} 