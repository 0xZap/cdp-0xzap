import { ArrowRight, Coins } from "lucide-react"
import { SwipeToConfirm } from "@/components/ui/swipe-to-confirm"

interface SwapMessageProps {
  fromToken: string
  toToken: string
  amount: string
  onConfirm?: () => void
}

export function SwapMessage({ fromToken, toToken, amount, onConfirm }: SwapMessageProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Swap Details */}
      <div className="flex items-center gap-4 p-3 rounded-xl bg-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 font-medium border border-blue-500/20">
            {fromToken}
          </div>
          <ArrowRight className="h-5 w-5 text-zinc-500" />
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/10 text-green-400 font-medium border border-green-500/20">
            {toToken}
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50">
          <Coins className="h-4 w-4 text-zinc-400" />
          <span className="font-medium text-white">{amount}</span>
        </div>
      </div>

      {/* Swipe to Confirm */}
      <SwipeToConfirm 
        label="Swipe to confirm swap" 
        onComplete={onConfirm}
      />
    </div>
  )
} 