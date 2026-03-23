// @ts-nocheck
"use client";

import { useTheme } from "next-themes";
import { Bell, Moon, Sun, LogOut, User, Settings, Search, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const { theme, setTheme } = useTheme();

  const openCommandPalette = () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm px-6">
      {/* Left: Logo text */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium text-gray-400">Solar PV Lab Operations Suite</h2>
      </div>

      {/* Center: Search bar */}
      <button
        onClick={openCommandPalette}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-900/50 text-sm text-gray-500 hover:border-gray-600 hover:text-gray-400 transition-colors min-w-[280px]"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search pages, modules...</span>
        <kbd className="inline-flex items-center gap-0.5 rounded border border-gray-700 bg-gray-800 px-1.5 py-0.5 text-[10px] text-gray-500">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-8 w-8 text-gray-400 hover:text-gray-200 hover:bg-gray-800"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <Button variant="ghost" size="icon" className="relative h-8 w-8 text-gray-400 hover:text-gray-200 hover:bg-gray-800">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] text-white font-bold">
            3
          </span>
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
              <Avatar className="h-8 w-8 border border-gray-700">
                <AvatarFallback className="bg-orange-500/10 text-orange-400 text-xs font-bold">
                  AD
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-gray-200">Admin User</p>
                <p className="text-xs leading-none text-gray-500">admin@solarlabx.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem className="text-gray-300 focus:bg-gray-800 focus:text-gray-200">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-300 focus:bg-gray-800 focus:text-gray-200">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem className="text-red-400 focus:bg-gray-800 focus:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
