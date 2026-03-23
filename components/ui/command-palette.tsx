// @ts-nocheck
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, FlaskConical, FileCheck, ClipboardCheck,
  FolderKanban, Calculator, ScanEye, BookOpen, FileBarChart,
  Sun, Thermometer, ShoppingCart, Wrench, BarChart3, Users,
  Search, MessageCircle, GitBranch, Package, SearchCheck,
  MessageSquareWarning, Shield, Cpu, UserCheck,
} from "lucide-react";

const allPages = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard, section: "Core" },
  { title: "LIMS", href: "/lims", icon: FlaskConical, section: "Core" },
  { title: "Test Protocols", href: "/lims/tests", icon: ClipboardCheck, section: "Core" },
  { title: "Test Flow", href: "/test-flow", icon: GitBranch, section: "Core" },
  { title: "Samples", href: "/lims/samples", icon: FlaskConical, section: "Core" },
  { title: "Equipment (LIMS)", href: "/lims/equipment", icon: Wrench, section: "Core" },
  { title: "Labels", href: "/lims/labels", icon: FlaskConical, section: "Core" },
  { title: "QMS", href: "/qms", icon: FileCheck, section: "Quality" },
  { title: "CAPA", href: "/qms/capa", icon: Shield, section: "Quality" },
  { title: "Documents", href: "/qms/documents", icon: FileCheck, section: "Quality" },
  { title: "Compliance", href: "/qms/compliance", icon: Shield, section: "Quality" },
  { title: "Audit", href: "/audit", icon: ClipboardCheck, section: "Quality" },
  { title: "Audit Plans", href: "/audit/plans", icon: ClipboardCheck, section: "Quality" },
  { title: "Audit Findings", href: "/audit/findings", icon: SearchCheck, section: "Quality" },
  { title: "CAR / 8D", href: "/audit/car", icon: Shield, section: "Quality" },
  { title: "Traceability", href: "/traceability", icon: GitBranch, section: "Quality" },
  { title: "RCA", href: "/rca", icon: SearchCheck, section: "Quality" },
  { title: "Complaints", href: "/complaints", icon: MessageSquareWarning, section: "Quality" },
  { title: "Equipment", href: "/equipment", icon: Wrench, section: "Resources" },
  { title: "Manpower", href: "/manpower", icon: Users, section: "Resources" },
  { title: "Procurement", href: "/procurement", icon: ShoppingCart, section: "Resources" },
  { title: "Data Analysis", href: "/data-analysis", icon: BarChart3, section: "Analysis" },
  { title: "Statistics", href: "/statistics", icon: BarChart3, section: "Analysis" },
  { title: "Reports", href: "/reports", icon: FileBarChart, section: "Analysis" },
  { title: "Uncertainty", href: "/uncertainty", icon: Calculator, section: "Analysis" },
  { title: "IEC 62915 BoM", href: "/iec62915", icon: Package, section: "Standards" },
  { title: "Sun Simulator", href: "/sun-simulator", icon: Sun, section: "Standards" },
  { title: "Chamber Config", href: "/chamber-config", icon: Thermometer, section: "Standards" },
  { title: "Vision AI", href: "/vision-ai", icon: ScanEye, section: "AI & Tools" },
  { title: "SOP Generator", href: "/sop-gen", icon: BookOpen, section: "AI & Tools" },
  { title: "Chatbot", href: "/chatbot", icon: MessageCircle, section: "AI & Tools" },
  { title: "Customer Management", href: "/customer", icon: Users, section: "Clients" },
  { title: "Projects", href: "/projects", icon: FolderKanban, section: "Clients" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!query.trim()) return allPages;
    const q = query.toLowerCase();
    return allPages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.section.toLowerCase().includes(q) ||
        p.href.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        handleSelect(filtered[selectedIndex].href);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, filtered, selectedIndex, handleSelect]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={() => { setOpen(false); setQuery(""); }}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 border-b border-gray-700">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, modules, tools..."
            className="flex-1 bg-transparent py-3 text-sm text-white placeholder:text-gray-500 outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-gray-600 bg-gray-800 px-1.5 py-0.5 text-[10px] text-gray-400">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((page, idx) => {
              const Icon = page.icon;
              return (
                <button
                  key={page.href}
                  onClick={() => handleSelect(page.href)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    idx === selectedIndex
                      ? "bg-orange-500/20 text-orange-300"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{page.title}</div>
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider shrink-0">
                    {page.section}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t border-gray-700 px-4 py-2 text-[10px] text-gray-500">
          <span><kbd className="rounded border border-gray-600 bg-gray-800 px-1 py-0.5">↑↓</kbd> Navigate</span>
          <span><kbd className="rounded border border-gray-600 bg-gray-800 px-1 py-0.5">↵</kbd> Open</span>
          <span><kbd className="rounded border border-gray-600 bg-gray-800 px-1 py-0.5">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
