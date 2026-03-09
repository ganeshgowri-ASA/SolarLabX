"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Calculator,
  Sun,
  Thermometer,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/uncertainty", label: "Uncertainty", icon: Calculator, color: "text-blue-600" },
  { href: "/sun-simulator", label: "Sun Simulator", icon: Sun, color: "text-amber-600" },
  { href: "/chamber-config", label: "Chamber Config", icon: Thermometer, color: "text-green-600" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b">
          <Link href="/" className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">SolarLabX</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-blue-600" : item.color)} />
                {item.label}
                {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t text-xs text-gray-400">
          Session 4: Technical Calculators
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 overflow-auto">{children}</main>
    </div>
  );
}
