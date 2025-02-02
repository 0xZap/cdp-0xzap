// components/ClientLayout.tsx
"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/Topbar";
import { Footer } from "@/components/footer";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarVisible, setSidebarVisible] = React.useState(false);

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

  return (
    <div className="flex">
      <Sidebar isVisible={isSidebarVisible} onToggle={toggleSidebar} />
      <div className="flex-1">
        <TopBar onToggleSidebar={toggleSidebar} />
        <main className="pt-14">{children}</main>
        {/* <Footer /> */}
      </div>
    </div>
  );
}
