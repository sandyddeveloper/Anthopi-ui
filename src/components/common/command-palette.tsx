// src/components/common/command-palette.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Bot, 
  Folder, 
  Zap, 
  BookOpen, 
  Settings, 
  Users, 
  Plus, 
  X, 
  Layers, 
  Sliders, 
  ShieldCheck,
  FileText,
  Server,
  Building,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette = ({ isOpen, onClose }: CommandPaletteProps) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  
  // Search state
  const [searchResults, setSearchResults] = useState<any>({
    employees: [],
    projects: [],
    departments: [],
    teams: [],
    files: []
  });
  const [isSearching, setIsSearching] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Debounced API Search fetcher
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults({
        employees: [],
        projects: [],
        departments: [],
        teams: [],
        files: []
      });
      return;
    }

    setIsSearching(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await apiClient.dashboard.search(search);
        if (res.data) {
          setSearchResults(res.data);
        }
      } catch (e) {
        console.error("Global search failed:", e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  if (!isOpen) return null;

  const COMMANDS = [
    // Navigation
    { label: "Go to Dashboard", category: "Navigation", icon: <Folder className="h-4 w-4" />, action: () => { router.push("/dashboard"); onClose(); } },
    { label: "Open Projects Overview", category: "Navigation", icon: <Folder className="h-4 w-4" />, action: () => { router.push("/projects"); onClose(); } },
    { label: "Manage AI Agents", category: "Navigation", icon: <Bot className="h-4 w-4" />, action: () => { router.push("/agents"); onClose(); } },
    { label: "View Automations Page", category: "Navigation", icon: <Zap className="h-4 w-4" />, action: () => { router.push("/automations"); onClose(); } },
    { label: "Open Knowledge Base / Files", category: "Navigation", icon: <BookOpen className="h-4 w-4" />, action: () => { router.push("/files"); onClose(); } },
    { label: "Open System Settings", category: "Navigation", icon: <Settings className="h-4 w-4" />, action: () => { router.push("/settings"); onClose(); } },
    { label: "Open Organization Hub", category: "Navigation", icon: <Layers className="h-4 w-4" />, action: () => { router.push("/organization"); onClose(); } },

    // Setup Actions (Occasional commands)
    { label: "Invite Employee / User", category: "Setup Actions", icon: <Plus className="h-4 w-4" />, action: () => { router.push("/team?invite=true"); onClose(); } },
    { label: "Create Business Department", category: "Setup Actions", icon: <Plus className="h-4 w-4" />, action: () => { router.push("/organization?createDept=true"); onClose(); } },
    { label: "Create Functional Team", category: "Setup Actions", icon: <Plus className="h-4 w-4" />, action: () => { router.push("/organization?createTeam=true"); onClose(); } },
    { label: "Create Clearance Access Role", category: "Setup Actions", icon: <Plus className="h-4 w-4" />, action: () => { router.push("/settings?tab=roles&createRole=true"); onClose(); } },
    { label: "Search Employee Seat Registry", category: "Setup Actions", icon: <Users className="h-4 w-4" />, action: () => { router.push("/team?focusSearch=true"); onClose(); } },
  ];

  const filteredCommands = COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const hasSearchResults = 
    (searchResults.employees?.length || 0) + 
    (searchResults.projects?.length || 0) + 
    (searchResults.departments?.length || 0) + 
    (searchResults.teams?.length || 0) + 
    (searchResults.files?.length || 0) > 0;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-start justify-center pt-[15vh] px-4"
    >
      <div className="bg-[#20242C] w-full max-w-xl rounded-2xl border border-[#2C313C] shadow-2xl overflow-hidden flex flex-col max-h-[480px] text-left">
        
        {/* Search bar */}
        <div className="flex items-center px-4 border-b border-[#2C313C] h-12 flex-shrink-0">
          <Search className="h-4 w-4 text-[#8D96A7] mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search employees, projects, files, departments or commands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-[#8D96A7] text-sm focus:outline-none"
          />
          {isSearching && (
            <span className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3" />
          )}
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#2A2F39] text-[#8D96A7] hover:text-white cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Command list */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {search.trim() ? (
            // Render Dynamic Search Results
            hasSearchResults ? (
              <div className="flex flex-col gap-3">
                
                {searchResults.employees?.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-[9px] uppercase font-extrabold tracking-widest text-[#8D96A7]">Employees</div>
                    {searchResults.employees.map((emp: any) => (
                      <button
                        key={emp.id}
                        onClick={() => { router.push(`/team?view=${emp.id}`); onClose(); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[#B7BDC8] hover:text-white rounded-xl hover:bg-[#2A2F39] text-left transition-colors cursor-pointer group"
                      >
                        <Users className="h-4 w-4 text-emerald-400" />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold truncate text-white">{emp.full_name || emp.email}</div>
                          <div className="text-[9px] text-[#8D96A7] truncate mt-0.5">{emp.email} • {emp.role_details?.name || "Member"}</div>
                        </div>
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.projects?.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-[9px] uppercase font-extrabold tracking-widest text-[#8D96A7]">Projects</div>
                    {searchResults.projects.map((proj: any) => (
                      <button
                        key={proj.id}
                        onClick={() => { router.push(`/projects?view=${proj.id}`); onClose(); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[#B7BDC8] hover:text-white rounded-xl hover:bg-[#2A2F39] text-left transition-colors cursor-pointer group"
                      >
                        <Folder className="h-4 w-4 text-primary" />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold truncate text-white">{proj.name}</div>
                          <div className="text-[9px] text-[#8D96A7] truncate mt-0.5">Code: {proj.code} • Status: {proj.status}</div>
                        </div>
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.files?.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-[9px] uppercase font-extrabold tracking-widest text-[#8D96A7]">Files</div>
                    {searchResults.files.map((file: any) => (
                      <button
                        key={file.id}
                        onClick={() => { router.push(`/files?view=${file.id}`); onClose(); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[#B7BDC8] hover:text-white rounded-xl hover:bg-[#2A2F39] text-left transition-colors cursor-pointer group"
                      >
                        <FileText className="h-4 w-4 text-cyan-400" />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold truncate text-white">{file.name}</div>
                          <div className="text-[9px] text-[#8D96A7] truncate mt-0.5">Size: {parseFloat((file.file_size / 1024).toFixed(1))} KB • visibility: {file.visibility}</div>
                        </div>
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.departments?.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-[9px] uppercase font-extrabold tracking-widest text-[#8D96A7]">Departments</div>
                    {searchResults.departments.map((dept: any) => (
                      <button
                        key={dept.id}
                        onClick={() => { router.push("/organization?tab=departments"); onClose(); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[#B7BDC8] hover:text-white rounded-xl hover:bg-[#2A2F39] text-left transition-colors cursor-pointer group"
                      >
                        <Building className="h-4 w-4 text-purple-400" />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold truncate text-white">{dept.name}</div>
                          <div className="text-[9px] text-[#8D96A7] truncate mt-0.5">Dept Code: {dept.code || "DEPT"}</div>
                        </div>
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.teams?.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-[9px] uppercase font-extrabold tracking-widest text-[#8D96A7]">Teams</div>
                    {searchResults.teams.map((t: any) => (
                      <button
                        key={t.id}
                        onClick={() => { router.push("/organization?tab=teams"); onClose(); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[#B7BDC8] hover:text-white rounded-xl hover:bg-[#2A2F39] text-left transition-colors cursor-pointer group"
                      >
                        <Server className="h-4 w-4 text-yellow-500" />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold truncate text-white">{t.name}</div>
                          <div className="text-[9px] text-[#8D96A7] truncate mt-0.5">Department: {t.department_details?.name || "Operations"}</div>
                        </div>
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                      </button>
                    ))}
                  </div>
                )}

              </div>
            ) : (
              !isSearching && (
                <div className="flex flex-col items-center justify-center py-12 text-[#8D96A7] text-xs">
                  No organization records matched your search query.
                </div>
              )
            )
          ) : (
            // Render Static Commands (Navigation & Quick Actions)
            <div className="flex flex-col gap-1">
              {Array.from(new Set(filteredCommands.map((c) => c.category))).map((category) => (
                <div key={category} className="mb-2">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest text-[#8D96A7] text-left">
                    {category}
                  </div>
                  {filteredCommands
                    .filter((c) => c.category === category)
                    .map((cmd) => (
                      <button
                        key={cmd.label}
                        onClick={cmd.action}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[#B7BDC8] hover:text-white rounded-xl hover:bg-[#2A2F39] text-left transition-colors cursor-pointer group"
                      >
                        <span className="text-[#8D96A7]">{cmd.icon}</span>
                        <span className="flex-1 font-semibold">{cmd.label}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#16181D] text-[#8D96A7] border border-[#2C313C]">
                          Run
                        </span>
                      </button>
                    ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#2C313C] bg-[#16181D] flex items-center justify-between text-[10px] text-[#8D96A7]">
          <span>Use <kbd className="font-sans px-1 rounded bg-[#2A2F39] text-white">Esc</kbd> to exit</span>
          <span>Press <kbd className="font-sans px-1 rounded bg-[#2A2F39] text-white">Enter</kbd> to select</span>
        </div>
      </div>
    </div>
  );
};
