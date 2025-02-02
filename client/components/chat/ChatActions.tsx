import { Button } from "@/components/ui/button";
import { MessageActions, ActionType } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ChatActionsProps {
  actions: MessageActions;
  onActionClick: (action: string) => void;
}

export function ChatActions({ actions, onActionClick }: ChatActionsProps) {
  const renderAction = (action: ActionType) => {
    switch (action.type) {
      case "button":
        return (
          <Button
            key={action.label}
            variant={action.variant as "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | undefined}
            onClick={() => onActionClick(action.action)}
            className="mr-2"
          >
            {action.label}
          </Button>
        );
      case "suggestions":
        return (
          <div key="suggestions" className="flex flex-wrap gap-2 mt-2">
            {action.items.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                onClick={() => onActionClick(`suggest:${suggestion}`)}
                className="text-sm"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        );
      case "confirm":
        return (
          <div key="confirm" className="flex gap-2 mt-2">
            <Button
              variant="default"
              onClick={() => onActionClick(`confirm:${action.title}`)}
            >
              {action.confirmLabel}
            </Button>
            <Button
              variant="outline"
              onClick={() => onActionClick(`cancel:${action.title}`)}
            >
              {action.cancelLabel}
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="mt-2 space-y-2">
      {actions.actions.map((action) => renderAction(action))}
    </div>
  );
} 