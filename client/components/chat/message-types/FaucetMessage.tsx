import { CheckCircle2, ExternalLink } from "lucide-react"

interface FaucetMessageProps {
  tokenSymbol: string
  faucetAmount: string
  txHash?: string
}

export function FaucetMessage({ tokenSymbol, faucetAmount, txHash }: FaucetMessageProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-emerald-400">
        <CheckCircle2 className="h-5 w-5" />
        <span className="font-medium">Faucet Request Successful!</span>
      </div>
      
      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Token</span>
            <span className="font-medium text-emerald-400">{tokenSymbol}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Amount</span>
            <span className="font-medium text-white">{faucetAmount}</span>
          </div>
          {txHash && (
            <div className="mt-2 pt-2 border-t border-emerald-500/20">
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                View Transaction
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 