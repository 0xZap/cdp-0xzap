import { Home, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  title: string;
  icon: LucideIcon;
  href: string;
}

export interface Conversation {
  id: string;
  title: string;
  timestamp: string;
}

export const navigation: NavItem[] = [
  {
    id: "1",
    title: "Home",
    icon: Home,
    href: "/",
  },
  {
    id: "2",
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export const conversations: Conversation[] = [
  {
    id: "1",
    title: "TypeScript Setup",
    timestamp: "2m ago",
  },
  {
    id: "2",
    title: "React Components",
    timestamp: "1h ago",
  },
  {
    id: "3",
    title: "API Integration",
    timestamp: "2d ago",
  },
];

export const models = [
  { id: "gpt-3.5", name: "GPT-3.5" },
  { id: "gpt-4", name: "GPT-4" },
];
