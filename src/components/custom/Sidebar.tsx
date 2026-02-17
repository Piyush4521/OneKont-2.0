"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Map, Users, Activity, Menu, Shield, X, LogIn, User } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils"; // This is a helper from Shadcn
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Login", href: "/login", icon: LogIn },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Live Map", href: "/map", icon: Map },
  { name: "Command Center", href: "/admin/dashboard", icon: Shield },
  { name: "Volunteers", href: "/volunteers", icon: Users },
  { name: "Activity Log", href: "/activity", icon: Activity },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileRole, setProfileRole] = useState<string | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(min-width: 768px)");
    const applyWidth = () => {
      if (!media.matches) {
        root.style.setProperty("--sidebar-width", "0rem");
        return;
      }
      const width = isCollapsed ? "5rem" : "16rem";
      root.style.setProperty("--sidebar-width", width);
    };

    applyWidth();
    media.addEventListener("change", applyWidth);

    return () => {
      media.removeEventListener("change", applyWidth);
      root.style.setProperty("--sidebar-width", "0rem");
    };
  }, [isCollapsed]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let active = true;

    const loadProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!active) return;

      if (!userData?.user) {
        setIsAuthed(false);
        setProfileName(null);
        setProfileRole(null);
        return;
      }

      setIsAuthed(true);
      const { data } = await supabase.from("profiles").select("full_name, role").eq("id", userData.user.id).single();
      if (!active) return;
      setProfileName(data?.full_name ?? userData.user.email ?? "User");
      setProfileRole(data?.role ?? "public");
    };

    loadProfile();
    const { data: listener } = supabase.auth.onAuthStateChange(() => loadProfile());

    return () => {
      active = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setIsMobileOpen(false);
    router.replace("/login");
  };

  const visibleNavItems = navItems.filter((item) => {
    if (item.href === "/login") return !isAuthed;
    if (item.href === "/profile") return isAuthed;
    return true;
  });

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-24 left-4 z-[60] h-10 w-10 rounded-full bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-200"
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>

      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/10 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10">
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                OneKont
              </h1>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {visibleNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                    )}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-white/10 to-blue-600/0 opacity-20 animate-pulse" />
                    )}
                    <item.icon size={20} className={cn(isActive && "text-white")} />
                    <span className="font-medium tracking-wide">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-white/10">
              {isAuthed ? (
                <div className="flex flex-col gap-3 p-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      {profileName?.charAt(0).toUpperCase() ?? "U"}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{profileName ?? "User"}</span>
                      <span className="text-[10px] text-slate-500 uppercase">{profileRole ?? "public"}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-xs font-bold py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-white/5">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                    ON
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">System Online</span>
                    <span className="text-[10px] text-green-600 dark:text-green-400">Signal: Strong</span>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

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
          {visibleNavItems.map((item) => {
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
          {isAuthed ? (
            <div className={cn(
                "flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-white/5",
                isCollapsed && "justify-center"
            )}>
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    {profileName?.charAt(0).toUpperCase() ?? "U"}
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{profileName ?? "User"}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{profileRole ?? "public"}</span>
                    </div>
                )}
            </div>
          ) : (
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
          )}
        </div>
      </aside>
    </>
  );
}
