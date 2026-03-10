"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FlaskConical,
  FileCheck,
  ClipboardCheck,
  FolderKanban,
  Calculator,
  ScanEye,
  BookOpen,
  FileBarChart,
  Sun,
  Thermometer,
  ShoppingCart,
  Wrench,
  SearchCheck,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Search,
  MessageSquareWarning,
  MessageCircle,
  ShieldCheck,
  Workflow,
  ClipboardList,
  TrendingUp,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const iconMap = {
  LayoutDashboard,
  FlaskConical,
  FileCheck,
  ClipboardCheck,
  FolderKanban,
  Calculator,
  ScanEye,
  BookOpen,
  FileBarChart,
  Sun,
  Thermometer,
  ShoppingCart,
  Wrench,
  SearchCheck,
  BarChart3,
  Search,
  MessageSquareWarning,
  MessageCircle,
  ShieldCheck,
  Workflow,
  ClipboardList,
  TrendingUp,
  Zap,
} as const;

const navItems = [
  { title: "Dashboard", href: "/", icon: "LayoutDashboard" },
  { title: "LIMS", href: "/lims", icon: "FlaskConical" },
  { title: "QMS", href: "/qms", icon: "FileCheck" },
  { title: "Audit", href: "/audit", icon: "ClipboardCheck" },
  { title: "Projects", href: "/projects", icon: "FolderKanban" },
  { title: "Equipment", href: "/equipment", icon: "Wrench" },
  { title: "Uncertainty", href: "/uncertainty", icon: "Calculator" },
  { title: "Data Analysis", href: "/data-analysis", icon: "TrendingUp" },
  { title: "IV Curve", href: "/iv-curve", icon: "Zap" },
  { title: "NMOT/NOCT", href: "/nmot-noct", icon: "Thermometer" },
  { title: "Vision AI", href: "/vision-ai", icon: "ScanEye" },
  { title: "SOP Gen", href: "/sop-gen", icon: "BookOpen" },
  { title: "Reports", href: "/reports", icon: "FileBarChart" },
  { title: "Statistics", href: "/statistics", icon: "BarChart3" },
  { title: "RCA", href: "/rca", icon: "SearchCheck" },
  { title: "Complaints", href: "/complaints", icon: "MessageSquareWarning" },
  { title: "Chatbot", href: "/chatbot", icon: "MessageCircle" },
  { title: "Electrical Safety", href: "/electrical-safety", icon: "ShieldCheck" },
  { title: "Flowcharts", href: "/flowcharts", icon: "Workflow" },
  { title: "Route Cards", href: "/route-cards", icon: "ClipboardList" },
  { title: "Sun Simulator", href: "/sun-simulator", icon: "Sun" },
  { title: "Chamber Config", href: "/chamber-config", icon: "Thermometer" },
  { title: "Procurement", href: "/procurement", icon: "ShoppingCart" },
] as const;

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <Sun className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">SolarLabX</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto">
            <Sun className="h-6 w-6 text-primary" />
          </Link>
        )}
      </div>

      <ScrollArea className="flex-1 py-4">
        <TooltipProvider delayDuration={0}>
          <nav className="flex flex-col gap-1 px-2">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap];
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <React.Fragment key={item.href}>{linkContent}</React.Fragment>;
            })}
          </nav>
        </TooltipProvider>
      </ScrollArea>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="w-full"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
