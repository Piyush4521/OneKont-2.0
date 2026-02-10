"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Users, Activity, Menu, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils"; // This is a helper from Shadcn

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Live Map", href: "/map", icon: Map },
  { name: "Command Center", href: "/admin/dashboard", icon: Shield },
  { name: "Volunteers", href: "/volunteers", icon: Users },
  { name: "Activity Log", href: "/activity", icon: Activity },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const width = isCollapsed ? "5rem" : "16rem";
    root.style.setProperty("--sidebar-width", width);

    return () => {
      root.style.setProperty("--sidebar-width", "0rem");
    };
  }, [isCollapsed]);

  return (
    <aside
      className={cn(
        "hidden md:flex h-screen fixed left-0 top-0 z-40 border-r border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-950/50 backdrop-blur-xl transition-all duration-300 ease-in-out flex-col",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Area */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
        {!isCollapsed && (
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
            OneKont
          </h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              )}
            >
              {/* Active Indicator Glow */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-white/10 to-blue-600/0 opacity-20 animate-pulse" />
              )}
              
              <item.icon size={22} className={cn(isActive && "text-white")} />
              
              {!isCollapsed && (
                <span className="font-medium tracking-wide">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* Footer / User Status */}
      <div className="p-4 border-t border-slate-200 dark:border-white/10">
        <div className={cn(
            "flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-white/5",
            isCollapsed && "justify-center"
        )}>
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                ON
            </div>
            {!isCollapsed && (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">System Online</span>
                    <span className="text-[10px] text-green-600 dark:text-green-400">Signal: Strong</span>
                </div>
            )}
        </div>
      </div>
    </aside>
  );
}
