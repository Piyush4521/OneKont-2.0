"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/custom/Sidebar";
import AIChatBot from "@/components/custom/AIChatBot";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const showSidebar = pathname !== "/";

  return (
    <div className="min-h-screen">
      {showSidebar && <Sidebar />}
      <main className="min-h-screen transition-all duration-300 pl-0 md:pl-(--sidebar-width)">
        {children}
      </main>
      <AIChatBot />
    </div>
  );
}
