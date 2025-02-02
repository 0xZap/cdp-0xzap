import { Button } from "@/components/ui/button"
import type { MessageActions, ActionType } from "@/types/chat"
import { Sparkles, Check, X } from "lucide-react"

interface ChatActionsProps {
  actions: MessageActions
  onActionClick: (action: string) => void
}

export function ChatActions({ actions, onActionClick }: ChatActionsProps) {
  const renderAction = (action: ActionType) => {
    switch (action.type) {
      case "button":
        return (
          <div key={action.label} className="flex gap-2">
            {action.variant === "primary" && (
              <Button
                onClick={() => onActionClick(action.action)}
                className="bg-blue-600/90 hover:bg-blue-600 text-white shadow-lg shadow-blue-600/20 
                transition-all hover:shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98]
                flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                {action.label}
              </Button>
            )}
            {action.variant === "destructive" && (
              <Button
                variant="destructive"
                onClick={() => onActionClick(action.action)}
                className="shadow-lg shadow-red-900/20 hover:shadow-red-900/30 
                transition-all hover:scale-[1.02] active:scale-[0.98]
                flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                {action.label}
              </Button>
            )}
          </div>
        )
        case "suggestions":
          return (
            <div key="suggestions" className="flex flex-wrap gap-2">
              {action.items.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  onClick={() => onActionClick(`suggest:${suggestion}`)}
                  className="
                    rounded-md border border-zinc-700 bg-zinc-800
                    px-3 py-1.5 text-sm text-zinc-200 
                    hover:bg-zinc-700 hover:border-zinc-600 hover:text-zinc-100
                    transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]
                    flex items-center gap-2
                  "
                >
                  <Sparkles className="h-4 w-4 text-blue-400 transition-colors group-hover:text-blue-300" />
                  {suggestion}
                </Button>
              ))}
            </div>
          )
      case "confirm":
        return (
          <div key="confirm" className="flex gap-2">
            <Button
              variant="default"
              onClick={() => onActionClick(`confirm:${action.title}`)}
              className="bg-green-600/90 hover:bg-green-600 text-white shadow-lg shadow-green-600/20 
              transition-all hover:shadow-green-600/30 hover:scale-[1.02] active:scale-[0.98]
              flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              {action.confirmLabel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => onActionClick(`cancel:${action.title}`)}
              className="border-zinc-800
              transition-all hover:scale-[1.02] active:scale-[0.98]
              shadow-lg shadow-zinc-950/50
              flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              {action.cancelLabel}
            </Button>
          </div>
        )
    }
  }

  return <div className="mt-3 space-y-3 animate-fade-in">{actions.actions.map((action) => renderAction(action))}</div>
}

