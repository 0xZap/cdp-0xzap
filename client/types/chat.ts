export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
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