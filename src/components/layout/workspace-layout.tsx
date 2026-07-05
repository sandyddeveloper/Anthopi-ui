"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  Moon,
  ShieldAlert,
  Layers,
  Sliders,
  Terminal,
  Cpu,
  User,
  Activity,
  Server
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CommandPalette } from "../common/command-palette";
import { FloatingAssistant } from "../common/floating-assistant";
import { SynapseLogo } from "../common/logo";
import { apiClient } from "@/lib/api-client";

export const WorkspaceLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Authenticate and load profile
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/");
      return;
    }

    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        console.error(e);
      }
    }

    apiClient.users.getProfile()
      .then((res) => {
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      })
      .catch((err) => {
        console.error("Failed to fetch fresh user profile:", err);
      });
  }, [router]);

  // Listen for storage changes
  useEffect(() => {
    const handleSync = () => {
      const cached = localStorage.getItem("user");
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener("storage", handleSync);
    return () => window.removeEventListener("storage", handleSync);
  }, []);

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
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

  const isSuperAdmin = user?.is_superuser === true || user?.role_details?.code === "super_admin";
  const isWorkspaceAdmin = user?.role_details?.code === "admin" || user?.role_details?.code === "manager";
  const isAdminOrSuper = isSuperAdmin || isWorkspaceAdmin;

  const isLinkActive = (href: string) => {
    const [pathPart, queryPart] = href.split("?");
    if (pathname !== pathPart) return false;
    if (!queryPart) {
      // If base path matches, check if there's no tab parameter in active searchParams
      // or if it's the dashboard / index path.
      if (pathname === "/organization" || pathname === "/projects" || pathname === "/files") {
        return !searchParams.get("tab");
      }
      return true;
    }
    const [key, val] = queryPart.split("=");
    return searchParams.get(key) === val;
  };

  const SIDEBAR_SECTIONS = [
    {
      items: [
        { label: "Dashboard", href: "/dashboard", icon: <LayoutGrid className="h-4.5 w-4.5" /> }
      ]
    },
    {
      title: "Employee Management",
      items: [
        { label: "Employees", href: "/team", icon: <Users className="h-4.5 w-4.5" /> },
        { label: "Departments", href: "/organization?tab=departments", icon: <Layers className="h-4.5 w-4.5" />, indented: true },
        { label: "Teams", href: "/organization?tab=teams", icon: <Server className="h-4.5 w-4.5" />, indented: true },
        { label: "Designations", href: "/organization?tab=designations", icon: <Sliders className="h-4.5 w-4.5" />, indented: true }
      ]
    },
    {
      title: "Project Management",
      items: [
        { label: "Projects", href: "/projects", icon: <Folder className="h-4.5 w-4.5" /> },
        { label: "Project Members", href: "/projects?tab=members", icon: <Users className="h-4.5 w-4.5" />, indented: true }
      ]
    },
    {
      title: "File Management",
      items: [
        { label: "Files", href: "/files", icon: <FolderClosed className="h-4.5 w-4.5" /> },
        { label: "Shared Files", href: "/files?tab=shared", icon: <Link2 className="h-4.5 w-4.5" />, indented: true }
      ]
    },
    {
      items: [
        { label: "Notifications", href: "/notifications", icon: <Bell className="h-4.5 w-4.5" /> },
        { label: "Activity", href: "/activity", icon: <Activity className="h-4.5 w-4.5" /> }
      ]
    },
    {
      items: [
        { label: "My Profile", href: "/profile", icon: <User className="h-4.5 w-4.5" /> }
      ]
    },
    {
      items: [
        { label: "Settings", href: "/settings", icon: <Settings className="h-4.5 w-4.5" /> }
      ]
    }
  ];

  const getBreadcrumb = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "Home";
    return segments.map(seg => seg.charAt(0).toUpperCase() + seg.slice(1)).join(" / ");
  };

  const renderSidebarSections = () => {
    return SIDEBAR_SECTIONS.map((section, secIdx) => {
      // If section is specific admin telemetry and not admin, skip
      const filteredItems = section.items;
      if (filteredItems.length === 0) return null;

      return (
        <div key={secIdx} className="flex flex-col gap-1">
          {secIdx > 0 && <div className="h-px bg-border-color/20 my-2" />}
          {sidebarOpen && section.title && (
            <span className="px-3.5 py-1 text-[8px] uppercase tracking-widest text-[#8D96A7] font-extrabold text-left mb-1 block">
              {section.title}
            </span>
          )}
          {filteredItems.map((item) => {
            const isActive = isLinkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative border border-transparent",
                  isActive
                    ? "bg-primary/10 text-primary border-primary/5"
                    : "text-[#B7BDC8] hover:text-white hover:bg-hover-bg",
                  (item as any).indented && sidebarOpen && "ml-4"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r bg-primary" />
                )}
                <span className={cn(isActive ? "text-primary" : "text-[#8D96A7] group-hover:text-white")}>
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
      );
    });
  };


  return (
    <div className="flex min-h-screen bg-app-bg text-white relative">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-sidebar-bg border-r border-border-color transition-all duration-300 relative z-30 h-screen sticky top-0 flex-shrink-0",
          sidebarOpen ? "w-[280px]" : "w-[88px]"
        )}
      >
        <div 
          onClick={!sidebarOpen ? () => setSidebarOpen(true) : undefined}
          title={!sidebarOpen ? "Expand Menu" : undefined}
          className={cn(
            "h-16 flex items-center border-b border-border-color flex-shrink-0 transition-all duration-300",
            sidebarOpen ? "px-6 justify-between gap-3" : "justify-center px-0 cursor-pointer"
          )}
        >
          <div className="flex items-center gap-3">
            <SynapseLogo size="md" />
            {sidebarOpen && (
              <span className="font-bold text-xs uppercase tracking-widest text-text-primary">
                Synapse OS
              </span>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(false);
              }}
              className="p-1 rounded-lg hover:bg-hover-bg text-[#8D96A7] hover:text-white transition-colors cursor-pointer"
              title="Collapse Menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sidebar Items */}
        <div className={cn("flex-1 p-4 flex flex-col gap-1 overflow-y-auto scrollbar-thin")}>
          {renderSidebarSections()}
        </div>

        {/* Sidebar Footer / Profile */}
        <div className="p-4 border-t border-border-color flex flex-col gap-3 flex-shrink-0 bg-[#111113]">
          <div className="flex items-center justify-between">
            {sidebarOpen && user && (
              <div className="flex items-center gap-2.5 animate-fadeIn">
                <Link href="/settings" className="h-8 w-8 rounded-full bg-neutral-800 border border-neutral-700 hover:border-primary/40 flex items-center justify-center font-bold text-xs uppercase text-primary transition-colors cursor-pointer" title="Workspace Settings">
                  {user.full_name
                    ? user.full_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .substring(0, 2)
                    : user.email?.substring(0, 2) || "US"}
                </Link>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-bold text-white truncate max-w-[120px]">
                    {user.full_name || user.email}
                  </span>
                  <span className="text-[9px] text-[#8D96A7] font-bold uppercase tracking-wider">
                    {user.role_details?.name || user.role || "Member"}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={() => {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("user");
                router.push("/");
              }}
              className={cn(
                "p-2 rounded-lg hover:bg-hover-bg text-[#8D96A7] hover:text-[#EF4444] transition-colors cursor-pointer",
                (!sidebarOpen || !user) && "mx-auto"
              )}
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-sidebar-bg border-b border-border-color z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-border-color text-[#B7BDC8]"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1.5">
            <SynapseLogo size="sm" />
            <span className="font-bold text-xs uppercase tracking-wider text-text-primary">Synapse OS</span>
          </div>
        </div>
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="p-1.5 rounded-lg border border-border-color text-[#B7BDC8]"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 bg-sidebar-bg h-full flex flex-col p-4 border-r border-border-color text-left">
            <div className="flex items-center justify-between pb-4 border-b border-border-color mb-4">
              <span className="font-bold text-xs uppercase tracking-wider text-white">Navigation</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs text-[#8D96A7] hover:text-white"
              >
                Close
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto flex flex-col gap-1 scrollbar-hide text-left">
              {SIDEBAR_SECTIONS.map((section, secIdx) => (
                <div key={secIdx} className="flex flex-col gap-1">
                  {secIdx > 0 && <div className="h-px bg-border-color/20 my-2" />}
                  {section.title && (
                    <span className="text-[8px] uppercase tracking-widest text-[#8D96A7] font-extrabold mb-1 block">
                      {section.title}
                    </span>
                  )}
                  {section.items.map((item) => {
                    const isActive = isLinkActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium border border-transparent",
                          isActive
                            ? "bg-primary/10 text-primary border-primary/5"
                            : "text-[#B7BDC8] hover:text-white hover:bg-hover-bg",
                          (item as any).indented && "ml-4"
                        )}
                      >
                        <span className={cn(isActive ? "text-primary" : "text-[#8D96A7]")}>{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
            <div className="pt-4 border-t border-border-color flex items-center justify-between">
              <span className="text-xs text-[#8D96A7]">Admin Console</span>
              <button 
                onClick={() => {
                  localStorage.removeItem("access_token");
                  localStorage.removeItem("refresh_token");
                  localStorage.removeItem("user");
                  router.push("/");
                }} 
                className="text-xs text-[#EF4444] font-semibold"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Right Side Viewport */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-0 pt-14 md:pt-0 min-h-screen">
        <header className="h-16 border-b border-border-color bg-sidebar-bg flex items-center justify-between px-6 flex-shrink-0 z-20">
          <div className="flex items-center gap-2 text-xs font-medium text-[#8D96A7]">
            <span>Synapse</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white font-semibold">{getBreadcrumb()}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#8D96A7] hover:text-white border border-border-color bg-[#16181D] hover:bg-hover-bg rounded-lg transition-colors cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search workspace...</span>
              <kbd className="font-mono text-[9px] px-1 rounded bg-[#2A2F39] text-[#B7BDC8]">⌘K</kbd>
            </button>

            <button
              onClick={() => router.push("/settings")}
              className="p-1.5 rounded-lg hover:bg-hover-bg text-[#8D96A7] hover:text-white transition-colors"
              title="Help Center"
            >
              <HelpCircle className="h-4.5 w-4.5" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-hover-bg text-[#8D96A7] hover:text-white transition-colors"
              title={theme === "dark" ? "Light Mode" : "Dark Mode"}
            >
              {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            <button
              onClick={() => setCopilotOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary transition-all duration-200"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="font-bold">Copilot</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 bg-app-bg flex flex-col items-center">
          <div className="w-full max-w-[1920px] flex-1 flex flex-col mx-auto justify-between">
            <div className="flex-1 flex flex-col gap-6">
              {children}
            </div>

            <footer className="mt-12 pt-6 border-t border-border-color/40 text-[10px] text-text-muted flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <SynapseLogo size="sm" />
                <span className="font-bold text-text-primary">Synapse OS</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-bold">v1.2</span>
              </div>
              <p className="text-center sm:text-left">© 2026 Synapse Technologies. All systems operational.</p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-text-primary transition-colors">Docs</a>
                <a href="#" className="hover:text-text-primary transition-colors">Privacy</a>
                <a href="#" className="hover:text-text-primary transition-colors">Terms</a>
              </div>
            </footer>
          </div>
        </main>
      </div>

      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      <FloatingAssistant isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </div>
  );
};
