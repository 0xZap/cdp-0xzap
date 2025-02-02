"use client";

import { Button } from "@/components/ui/button";
import { Wallet, Menu } from "lucide-react";

interface TopBarProps {
  onToggleSidebar: () => void;
}

export function TopBar({ onToggleSidebar }: TopBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-4 h-14">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        className="hover:bg-zinc-800/50"
      >
        <Menu className="h-5 w-5 text-zinc-400" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800/50 hover:text-white"
      >
        <Wallet className="h-4 w-4 mr-2" />
        Connect Wallet
      </Button>
    </div>
  );
}
