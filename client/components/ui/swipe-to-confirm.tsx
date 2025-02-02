"use client";

import * as React from "react";

interface SwipeToConfirmProps {
  label: string;
  onComplete?: () => void;
}

export function SwipeToConfirm({ label, onComplete }: SwipeToConfirmProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [offset, setOffset] = React.useState(0);
  const [maxWidth, setMaxWidth] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(false);

  // Measure track width on mount
  React.useEffect(() => {
    if (trackRef.current) {
      setMaxWidth(trackRef.current.clientWidth - 40); // Subtract handle width
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isComplete) {
      setIsDragging(true);
      (e.target as HTMLDivElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = e.movementX;
    setOffset((prev) => {
      const newOffset = prev + deltaX;
      return Math.max(0, Math.min(newOffset, maxWidth));
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    (e.target as HTMLDivElement).releasePointerCapture(e.pointerId);

    const threshold = maxWidth * 0.9;
    if (offset >= threshold) {
      setOffset(maxWidth);
      setIsComplete(true);
      onComplete?.();
    } else {
      // Snap back with animation
      setOffset(0);
    }
  };

  const fillPercent = maxWidth ? (offset / maxWidth) * 100 : 0;

  return (
    <div className="select-none text-sm text-zinc-400">
      <div className="mb-2">{label}</div>
      <div
        ref={trackRef}
        className="relative h-10 w-full rounded-full bg-zinc-800 shadow-inner"
      >
        {/* Progress bar */}
        <div
          className={`
            absolute left-0 top-0 h-10 rounded-full
            transition-all duration-300 ease-out
            ${isComplete 
              ? "bg-green-500/20" 
              : isDragging 
                ? "bg-blue-500/20" 
                : "bg-blue-500/10"
            }
          `}
          style={{ width: `${fillPercent}%` }}
        />

        {/* Handle */}
        <div
          className={`
            absolute left-0 top-0 
            flex h-10 w-10 
            cursor-grab active:cursor-grabbing
            items-center justify-center
            rounded-full 
            ${isComplete 
              ? "bg-green-500 text-white" 
              : "bg-blue-500 text-white"
            }
            shadow-lg
            transition-all duration-300 ease-out
            hover:scale-105 active:scale-95
          `}
          style={{ 
            transform: `translateX(${offset}px)`,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {isComplete ? "✓" : "→"}
        </div>
      </div>
    </div>
  );
} 