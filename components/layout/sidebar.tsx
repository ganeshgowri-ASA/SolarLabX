// @ts-nocheck
"use client";

import React, { useState } from "react";
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
  ChevronDown,
  BarChart3,
  Search,
  MessageSquareWarning,
  MessageCircle,
  GitBranch,
  ClipboardList,
  Package,
  Users,
  Boxes,
  Shield,
  LineChart,
  Cpu,
  UserCheck,
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

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Core Operations",
    icon: Boxes,
    items: [
      { title: "Dashboard", href: "/", icon: LayoutDashboard },
      { title: "LIMS", href: "/lims", icon: FlaskConical },
      { title: "Test Protocols", href: "/lims/tests", icon: ClipboardList },
      { title: "Test Flow", href: "/test-flow", icon: GitBranch },
    ],
  },
  {
    label: "Quality & Compliance",
    icon: Shield,
    items: [
      { title: "QMS", href: "/qms", icon: FileCheck },
      { title: "Audit", href: "/audit", icon: ClipboardCheck },
      { title: "Traceability", href: "/traceability", icon: GitBranch },
      { title: "RCA", href: "/rca", icon: SearchCheck },
      { title: "Complaints", href: "/complaints", icon: MessageSquareWarning },
    ],
  },
  {
    label: "Resources",
    icon: Wrench,
    items: [
      { title: "Equipment", href: "/equipment", icon: Wrench },
      { title: "Manpower", href: "/manpower", icon: Users },
      { title: "Procurement", href: "/procurement", icon: ShoppingCart },
    ],
  },
  {
    label: "Analysis & Reporting",
    icon: LineChart,
    items: [
      { title: "Data Analysis", href: "/data-analysis", icon: BarChart3 },
      { title: "Statistics", href: "/statistics", icon: BarChart3 },
      { title: "Reports", href: "/reports", icon: FileBarChart },
      { title: "Uncertainty", href: "/uncertainty", icon: Calculator },
    ],
  },
  {
    label: "Standards & Design",
    icon: Package,
    items: [
      { title: "IEC 62915 BoM", href: "/iec62915", icon: Package },
      { title: "Sun Simulator", href: "/sun-simulator", icon: Sun },
      { title: "Chamber Config", href: "/chamber-config", icon: Thermometer },
    ],
  },
  {
    label: "AI & Tools",
    icon: Cpu,
    items: [
      { title: "Vision AI", href: "/vision-ai", icon: ScanEye },
      { title: "SOP Gen", href: "/sop-gen", icon: BookOpen },
      { title: "Chatbot", href: "/chatbot", icon: MessageCircle },
    ],
  },
  {
    label: "Clients",
    icon: UserCheck,
    items: [
      { title: "Customer Mgmt", href: "/customer", icon: Users },
      { title: "Projects", href: "/projects", icon: FolderKanban },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    // All groups expanded by default
    const initial: Record<string, boolean> = {};
    navGroups.forEach((g) => {
      initial[g.label] = true;
    });
    return initial;
  });

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

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

      <ScrollArea className="flex-1 py-2">
        <TooltipProvider delayDuration={0}>
          <nav className="flex flex-col gap-0.5 px-2">
            {navGroups.map((group) => {
              const isExpanded = expandedGroups[group.label];
              const GroupIcon = group.icon;
              const hasActiveChild = group.items.some(
                (item) =>
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href))
              );

              if (collapsed) {
                // When collapsed, show only icons with tooltips
                return (
                  <React.Fragment key={group.label}>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href));

                      return (
                        <Tooltip key={item.href}>
                          <TooltipTrigger asChild>
                            <Link
                              href={item.href}
                              className={cn(
                                "flex items-center justify-center rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                                isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              <Icon className="h-4 w-4 shrink-0" />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{item.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </React.Fragment>
                );
              }

              // Expanded sidebar with collapsible groups
              return (
                <div key={group.label} className="mb-1">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors",
                      hasActiveChild
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <GroupIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="flex-1 text-left">{group.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 shrink-0 transition-transform duration-200",
                        !isExpanded && "-rotate-90"
                      )}
                    />
                  </button>

                  {/* Group Items */}
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200",
                      isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="ml-2 flex flex-col gap-0.5 border-l border-border/50 pl-2 pt-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                          pathname === item.href ||
                          (item.href !== "/" && pathname.startsWith(item.href));

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>{item.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
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
