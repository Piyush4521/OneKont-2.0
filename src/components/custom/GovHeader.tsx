"use client";

import Image from "next/image";
import Link from "next/link";
import { Sun, Moon, Globe, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function GovHeader() {
  const { setTheme } = useTheme();

  return (
    <header className="w-full font-sans">
      <div className="bg-zinc-100 dark:bg-zinc-900 text-[10px] md:text-xs py-1 px-4 flex flex-wrap gap-2 justify-between items-center border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="hover:underline cursor-pointer">Government of India</span>
          <span className="hidden md:inline">|</span>
          <span className="hover:underline cursor-pointer hidden md:inline">Ministry of Disaster Management</span>
        </div>
        <div className="flex gap-3 items-center">
          <span className="hover:underline cursor-pointer hidden sm:inline">Skip to Main Content</span>
          <span className="hidden sm:inline">|</span>
          <span className="flex items-center gap-1 cursor-pointer hover:underline">
            <Globe size={10} /> English / Hindi
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 px-4 py-3 md:px-8 border-b border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 md:gap-6">
            <div className="flex flex-col items-center justify-center">
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                alt="Gov Emblem"
                width={48}
                height={48}
                unoptimized
                className="h-8 md:h-12 w-auto opacity-90 dark:invert transition-all"
              />
            </div>

            <div className="flex items-center">
              <Image src="/logo.png" width={60} height={60} alt="OneKont Logo" className="h-10 md:h-16 w-auto object-contain" />
            </div>

            <div className="flex flex-col border-l-0 sm:border-l-2 border-zinc-300 dark:border-zinc-700 pl-0 sm:pl-4 h-auto sm:h-10 justify-center">
              <h1 className="font-bold text-sm md:text-lg text-slate-900 dark:text-white leading-tight">
                OneKont <span className="text-orange-500">2.0</span>
              </h1>
              <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider font-semibold">
                National Disaster Response Unit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9 border-slate-200 dark:border-slate-800">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-500" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/login">
              <Button variant="outline" className="text-[10px] md:text-xs font-bold h-8 px-3 border-slate-200 dark:border-slate-800">
                <LogIn size={14} className="mr-2" /> Login
              </Button>
            </Link>

            <Link href="/admin/dashboard">
              <Button className="bg-blue-700 hover:bg-blue-800 text-white text-[10px] md:text-xs font-bold shadow-md h-8 px-3">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full h-1 bg-linear-to-r from-orange-500 via-white to-green-500"></div>
    </header>
  );
}
