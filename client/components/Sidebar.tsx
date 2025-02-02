"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { navigation, conversations } from "@/lib/mock-data";
import { Plus, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isVisible: boolean;
  onToggle: () => void;
}

export function Sidebar({ isVisible, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-20 flex h-screen flex-col bg-zinc-950 transition-all duration-300",
        isVisible ? "w-[240px]" : "w-0"
      )}
    >
      {isVisible && (
        <>
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="hover:bg-zinc-800"
            >
              <ChevronLeft className="h-4 w-4 text-zinc-400" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-zinc-800">
              <Plus className="h-4 w-4 text-zinc-400" />
            </Button>
          </div>

          <nav className="flex-none p-2">
            {navigation.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                asChild
                className={cn(
                  "w-full justify-start gap-2 mb-1 hover:bg-zinc-800",
                  pathname === item.href
                    ? "bg-zinc-900 text-zinc-100"
                    : "text-zinc-400"
                )}
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </Button>
            ))}
          </nav>

          <ScrollArea className="flex-1 px-2">
            <div className="space-y-1">
              {conversations.map((chat) => (
                <Button
                  key={chat.id}
                  variant="ghost"
                  className="w-full justify-start px-2 py-2 h-auto hover:bg-zinc-800"
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-sm text-zinc-200">{chat.title}</span>
                    <span className="text-xs text-zinc-500">
                      {chat.timestamp}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}
