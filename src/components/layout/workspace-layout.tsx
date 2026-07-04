"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutGrid,
  Folder,
  Bot,
  Zap,
  BookOpen,
  Link2,
  Calendar,
  FolderClosed,
  MessageSquare,
  Bell,
  BarChart3,
  Users,
  Settings,
  Search,
  Sparkles,
  HelpCircle,
  Menu,
  ChevronRight,
  LogOut,
  Sun,
  Moon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CommandPalette } from "../common/command-palette";
import { FloatingAssistant } from "../common/floating-assistant";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export const WorkspaceLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Command palette state
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Copilot panel state
  const [copilotOpen, setCopilotOpen] = useState(false);

  // Theme mode toggle state
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemDark ? "dark" : "light");

    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Ctrl+K keylistener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const SIDEBAR_ITEMS: SidebarItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutGrid className="h-4.5 w-4.5" /> },
    { label: "Projects", href: "/projects", icon: <Folder className="h-4.5 w-4.5" /> },
    { label: "AI Agents", href: "/agents", icon: <Bot className="h-4.5 w-4.5" /> },
    { label: "Automations", href: "/automations", icon: <Zap className="h-4.5 w-4.5" /> },
    { label: "Knowledge", href: "/knowledge", icon: <BookOpen className="h-4.5 w-4.5" /> },
    { label: "Integrations", href: "/integrations", icon: <Link2 className="h-4.5 w-4.5" /> },
    { label: "Scheduler", href: "/scheduler", icon: <Calendar className="h-4.5 w-4.5" /> },
    { label: "Files", href: "/files", icon: <FolderClosed className="h-4.5 w-4.5" /> },
    { label: "AI Chat", href: "/chat", icon: <MessageSquare className="h-4.5 w-4.5" /> },
    { label: "Notifications", href: "/notifications", icon: <Bell className="h-4.5 w-4.5" /> },
    { label: "Analytics", href: "/analytics", icon: <BarChart3 className="h-4.5 w-4.5" /> },
    { label: "Team", href: "/team", icon: <Users className="h-4.5 w-4.5" /> },
    { label: "Settings", href: "/settings", icon: <Settings className="h-4.5 w-4.5" /> },
  ];

  // Helper to determine breadcrumb title based on pathname
  const getBreadcrumb = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "Home";
    return segments.map(seg => seg.charAt(0).toUpperCase() + seg.slice(1)).join(" / ");
  };

  const activeItem = SIDEBAR_ITEMS.find((item) => pathname === item.href) || SIDEBAR_ITEMS[0];

  return (
    <div className="flex min-h-screen bg-app-bg text-white relative">
      {/* Desktop Left Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-sidebar-bg border-r border-border-color transition-all duration-300 relative z-30 h-screen sticky top-0 flex-shrink-0",
          sidebarOpen ? "w-[280px]" : "w-[88px]"
        )}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-border-color flex-shrink-0">
          <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-primary to-secondary shadow-md shadow-primary/20 flex items-center justify-center flex-shrink-0">
            <Bot className="h-4 w-4 text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-xs uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white to-[#B7BDC8]">
              Anthopi OS
            </span>
          )}
        </div>

        {/* Navigation items */}
        <div className={cn("flex-1 p-4 flex flex-col gap-1", sidebarOpen ? "overflow-y-auto scrollbar-hide" : "overflow-visible")}>
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative border border-transparent",
                  isActive
                    ? "bg-[#2F81F7]/15 text-primary"
                    : "text-[#B7BDC8] hover:text-white hover:bg-hover-bg"
                )}
              >
                {/* Active left border indicator line */}
                {isActive && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r bg-primary" />
                )}
                <span className={cn(isActive ? "text-primary" : "text-[#8D96A7] group-hover:text-white")}>
                  {item.icon}
                </span>
                {sidebarOpen && <span>{item.label}</span>}

                {/* Collapsed label tooltip */}
                {!sidebarOpen && (
                  <span className="absolute left-20 bg-[#252932] border border-border-color text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Collapse Sidebar Button & User Panel */}
        <div className="p-4 border-t border-border-color flex flex-col gap-3 flex-shrink-0 bg-[#111113]">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-xs">
                  JD
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-white">John Doe</span>
                  <span className="text-[9px] text-[#8D96A7]">Admin Seat</span>
                </div>
              </div>
            )}
            <button
              onClick={() => router.push("/")}
              className="p-2 rounded-lg hover:bg-hover-bg text-[#8D96A7] hover:text-[#EF4444] transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full py-1.5 rounded-lg border border-border-color hover:bg-hover-bg text-[#8D96A7] hover:text-white text-[10px] font-bold tracking-wider uppercase transition-colors"
          >
            {sidebarOpen ? "Collapse Menu" : "Expand"}
          </button>
        </div>
      </aside>

      {/* Mobile Top Navigation & Drawer */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-sidebar-bg border-b border-border-color z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-border-color text-[#B7BDC8]"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-bold text-xs uppercase tracking-wider text-white">Anthopi OS</span>
        </div>
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="p-1.5 rounded-lg border border-border-color text-[#B7BDC8]"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 bg-sidebar-bg h-full flex flex-col p-4 border-r border-border-color">
            <div className="flex items-center justify-between pb-4 border-b border-border-color mb-4">
              <span className="font-bold text-xs uppercase tracking-wider text-white">Navigation</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs text-[#8D96A7] hover:text-white"
              >
                Close
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto flex flex-col gap-1 scrollbar-hide">
              {SIDEBAR_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent",
                      isActive
                        ? "bg-[#2F81F7]/15 text-primary border-[#2F81F7]/10"
                        : "text-[#B7BDC8] hover:text-white hover:bg-hover-bg"
                    )}
                  >
                    <span className={cn(isActive ? "text-primary" : "text-[#8D96A7]")}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-border-color flex items-center justify-between">
              <span className="text-xs text-[#8D96A7]">Admin Seat</span>
              <button onClick={() => router.push("/")} className="text-xs text-[#EF4444] font-semibold">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Right Side Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-0 pt-14 md:pt-0 min-h-screen">
        {/* Desktop Topbar Header */}
        <header className="h-16 border-b border-border-color bg-sidebar-bg flex items-center justify-between px-6 flex-shrink-0 z-20">
          {/* Breadcrumb section */}
          <div className="flex items-center gap-2 text-xs font-medium text-[#8D96A7]">
            <span>Anthopi</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white font-semibold">{getBreadcrumb()}</span>
          </div>

          {/* Right Header actions */}
          <div className="flex items-center gap-4">
            {/* Search Box Trigger */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#8D96A7] hover:text-white border border-border-color bg-[#16181D] hover:bg-hover-bg rounded-lg transition-colors cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search workspace...</span>
              <kbd className="font-mono text-[9px] px-1 rounded bg-[#2A2F39] text-[#B7BDC8]">⌘K</kbd>
            </button>

            {/* Help Button */}
            <button
              onClick={() => router.push("/settings")}
              className="p-1.5 rounded-lg hover:bg-hover-bg text-[#8D96A7] hover:text-white transition-colors"
              title="Help Center"
            >
              <HelpCircle className="h-4.5 w-4.5" />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-hover-bg text-[#8D96A7] hover:text-white transition-colors"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Platform AI Copilot Trigger */}
            <button
              onClick={() => setCopilotOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary transition-all duration-200"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="font-bold">Copilot</span>
            </button>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 p-6 md:p-8 bg-app-bg flex flex-col items-center">
          <div className="w-full max-w-[1920px] flex-1 flex flex-col mx-auto justify-between">
            <div className="flex-1 flex flex-col gap-6">
              {children}
            </div>

            {/* Common Footer */}
            <footer className="mt-1 pt-6 border-t border-border-color/40 text-[10px] text-text-muted flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text-primary">Anthopi OS</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-bold">v1.2</span>
              </div>
              <p className="text-center sm:text-left">© 2026 Anthopi Technologies. All systems operational.</p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-text-primary transition-colors">Docs</a>
                <a href="#" className="hover:text-text-primary transition-colors">Privacy</a>
                <a href="#" className="hover:text-text-primary transition-colors">Terms</a>
              </div>
            </footer>
          </div>
        </main>
      </div>

      {/* Global Overlays */}
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      <FloatingAssistant isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </div>
  );
};
