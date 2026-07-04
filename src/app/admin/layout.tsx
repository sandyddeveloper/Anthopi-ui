"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Activity, 
  Database, 
  ShieldAlert, 
  Server, 
  Users, 
  Terminal, 
  Sun, 
  Moon,
  ArrowLeft,
  ChevronRight,
  Menu,
  Sparkles,
  LogOut,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SynapseLogo } from "@/components/common/logo";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Load and apply theme on mount
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

  const ADMIN_SIDEBAR_ITEMS: SidebarItem[] = [
    { label: "System Telemetry", href: "/admin", icon: <Cpu className="h-4.5 w-4.5" /> },
    { label: "Tenant Clusters", href: "/admin/tenants", icon: <Server className="h-4.5 w-4.5" /> }
  ];

  return (
    <div className="flex min-h-screen bg-app-bg text-text-primary relative transition-colors duration-200">
      
      {/* 1. Desktop Left Sidebar (System Operator Styling) */}
      <aside 
        className={cn(
          "hidden md:flex flex-col bg-sidebar-bg border-r border-border-color transition-all duration-300 relative z-30 h-screen sticky top-0 flex-shrink-0",
          sidebarOpen ? "w-[280px]" : "w-[88px]"
        )}
      >
        {/* Admin Branding Header */}
        <div 
          onClick={!sidebarOpen ? () => setSidebarOpen(true) : undefined}
          className={cn(
            "h-16 flex items-center border-b border-border-color flex-shrink-0 transition-all duration-300",
            sidebarOpen ? "px-6 justify-between gap-3" : "justify-center px-0 cursor-pointer"
          )}
        >
          <div className="flex items-center gap-3">
            <SynapseLogo size="md" />
            {sidebarOpen && (
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-xs uppercase tracking-widest text-text-primary">
                  Synapse OS
                </span>
                <span className="text-[8px] font-bold text-primary tracking-wider uppercase">System Console</span>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(false);
              }}
              className="p-1 rounded-lg hover:bg-hover-bg text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              title="Collapse Menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation Items (Operator scope) */}
        <div className={cn("flex-1 p-4 flex flex-col gap-1", sidebarOpen ? "overflow-y-auto scrollbar-hide" : "overflow-visible")}>
          {ADMIN_SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative border border-transparent",
                  isActive
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "text-text-secondary hover:text-text-primary hover:bg-hover-bg"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r bg-primary" />
                )}
                <span className={cn(isActive ? "text-primary" : "text-text-muted group-hover:text-text-primary")}>
                  {item.icon}
                </span>
                {sidebarOpen && <span>{item.label}</span>}
                {!sidebarOpen && (
                  <span className="absolute left-20 bg-[#252932] border border-border-color text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-border-color flex flex-col gap-3 flex-shrink-0 bg-[#111113]">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-text-primary">System Operator</span>
                <span className="text-[8px] text-primary font-bold uppercase tracking-wider">Super Admin</span>
              </div>
            )}
            <button
              onClick={() => router.push("/dashboard")}
              className={cn(
                "p-2 rounded-lg hover:bg-hover-bg text-text-muted hover:text-primary transition-colors flex items-center justify-center gap-1",
                !sidebarOpen && "mx-auto"
              )}
              title="Return to Workspace Hub"
            >
              <ArrowLeft className="h-4 w-4" />
              {sidebarOpen && <span className="text-[10px] font-bold">Workspace</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Header */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-sidebar-bg border-b border-border-color z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-border-color text-text-secondary"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1.5">
            <SynapseLogo size="sm" />
            <span className="font-bold text-xs uppercase tracking-wider text-text-primary">System Console</span>
          </div>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="p-1.5 rounded-lg border border-border-color text-text-secondary flex items-center gap-1 text-[10px] font-bold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Exit</span>
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 bg-sidebar-bg h-full flex flex-col p-4 border-r border-border-color">
            <div className="flex items-center justify-between pb-4 border-b border-border-color mb-4">
              <span className="font-bold text-xs uppercase tracking-wider text-text-primary">Admin Console</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-xs text-text-muted">Close</button>
            </div>
            <nav className="flex-1 overflow-y-auto flex flex-col gap-1 scrollbar-hide">
              {ADMIN_SIDEBAR_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent",
                      isActive
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "text-text-secondary hover:text-text-primary hover:bg-hover-bg"
                    )}
                  >
                    <span className={cn(isActive ? "text-primary" : "text-text-muted")}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-border-color flex items-center justify-between">
              <span className="text-[10px] text-text-muted">Super Admin</span>
              <button onClick={() => router.push("/dashboard")} className="text-xs text-primary font-semibold">
                Exit Console
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main content area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-0 pt-14 md:pt-0 min-h-screen">
        {/* Header toolbar */}
        <header className="h-16 border-b border-border-color bg-sidebar-bg flex items-center justify-between px-6 flex-shrink-0 z-20">
          <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
            <span>Synapse System Console</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-text-primary font-semibold">
              {pathname === "/admin" ? "Telemetry Overview" : "Tenant Directory"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme switcher */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-hover-bg text-text-muted hover:text-text-primary transition-colors"
            >
              {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Exit trigger */}
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border-color hover:bg-hover-bg text-text-secondary transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Exit Admin Mode</span>
            </button>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-6 md:p-8 bg-app-bg">
          <div className="w-full max-w-[1920px] mx-auto flex flex-col gap-6">
            {children}
            
            {/* System operator footer */}
            <footer className="mt-12 pt-6 border-t border-border-color/40 text-[10px] text-text-muted flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <SynapseLogo size="sm" />
                <span className="font-bold text-text-primary">Synapse Console</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-bold">v1.2</span>
              </div>
              <p className="text-center sm:text-left">© 2026 Synapse Technologies. Host Server Node Cluster: ONLINE.</p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-text-primary transition-colors">Server Logs</a>
                <a href="#" className="hover:text-text-primary transition-colors">Security Audit</a>
              </div>
            </footer>
          </div>
        </main>
      </div>

    </div>
  );
}
