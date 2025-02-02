import { ArrowRight } from "lucide-react"

interface TransferMessageProps {
  fromToken: string
  toToken: string
  amount: string
}

export function TransferMessage({ fromToken, toToken, amount }: TransferMessageProps) {
  return (
    <div className="flex flex-col gap-3 p-2">
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 font-medium">
          {fromToken}
        </div>
        <ArrowRight className="h-5 w-5 text-zinc-500" />
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/10 text-green-500 font-medium">
          {toToken}
        </div>
      </div>
      <div className="text-sm text-zinc-300">
        Transfer amount: <span className="font-medium text-white">{amount}</span>
      </div>
    </div>
  )
} 