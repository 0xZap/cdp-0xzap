"use client";

import * as React from "react";
import { User, Coins, ArrowRight } from "lucide-react"
import { SwipeToConfirm } from "@/components/ui/swipe-to-confirm"

interface TransferMessageProps {
  recipientAddress: string
  token: string
  amount: string
  onConfirm?: () => void
}

export function TransferMessage({ recipientAddress, token, amount, onConfirm }: TransferMessageProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Transfer Details */}
      <div className="flex flex-col gap-3 p-4 rounded-xl bg-zinc-800/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">To Address</span>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-zinc-500" />
            <code className="text-sm font-medium text-zinc-300 bg-zinc-900/50 px-2 py-1 rounded">
              {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
            </code>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Amount</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50">
              <span className="font-medium text-blue-400">{token}</span>
              <ArrowRight className="h-4 w-4 text-zinc-500" />
              <span className="font-medium text-white">{amount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Swipe to Confirm */}
      <SwipeToConfirm 
        label="Swipe to confirm transfer" 
        onComplete={onConfirm}
      />
    </div>
  )
}