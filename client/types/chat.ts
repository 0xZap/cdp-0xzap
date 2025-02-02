export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  parsedData?: ParsedMessageData;
}

export type MessageType = "standard" | "transfer" | "sentiment";

export interface ParsedMessageData {
  type: MessageType;
  // Standard message
  content?: string;
  // Transfer message
  fromToken?: string;
  toToken?: string;
  amount?: string;
  // Sentiment message
  topic?: string;
  sentimentLevel?: number;
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