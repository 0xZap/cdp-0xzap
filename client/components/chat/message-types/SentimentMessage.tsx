interface SentimentMessageProps {
  topic: string
  sentimentLevel: number
}

export function SentimentMessage({ topic, sentimentLevel }: SentimentMessageProps) {
  const getColor = (level: number) => {
    if (level < 0.3) return "bg-red-500"
    if (level < 0.7) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm text-zinc-300">{topic}</div>
      <div className="flex flex-col gap-1.5">
        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getColor(sentimentLevel)} transition-all duration-500`}
            style={{ width: `${sentimentLevel * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Very Pessimistic</span>
          <span>Very Optimistic</span>
        </div>
      </div>
    </div>
  )
} 