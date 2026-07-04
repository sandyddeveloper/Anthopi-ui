"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Bot, Folder, Zap, BookOpen, Settings, Users, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette = ({ isOpen, onClose }: CommandPaletteProps) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
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

  if (!isOpen) return null;

  const COMMANDS = [
    { label: "Go to Dashboard", category: "Navigation", icon: <Folder className="h-4 w-4" />, action: () => { router.push("/dashboard"); onClose(); } },
    { label: "Open Projects", category: "Navigation", icon: <Folder className="h-4 w-4" />, action: () => { router.push("/projects"); onClose(); } },
    { label: "Manage AI Agents", category: "Navigation", icon: <Bot className="h-4 w-4" />, action: () => { router.push("/agents"); onClose(); } },
    { label: "View Automations", category: "Navigation", icon: <Zap className="h-4 w-4" />, action: () => { router.push("/automations"); onClose(); } },
    { label: "Knowledge Base", category: "Navigation", icon: <BookOpen className="h-4 w-4" />, action: () => { router.push("/knowledge"); onClose(); } },
    { label: "System Settings", category: "Navigation", icon: <Settings className="h-4 w-4" />, action: () => { router.push("/settings"); onClose(); } },
    { label: "Create New Agent", category: "Actions", icon: <Plus className="h-4 w-4" />, action: () => { router.push("/agents?create=true"); onClose(); } },
    { label: "Create New Project", category: "Actions", icon: <Plus className="h-4 w-4" />, action: () => { router.push("/projects?create=true"); onClose(); } },
    { label: "Invite Team Member", category: "Actions", icon: <Users className="h-4 w-4" />, action: () => { router.push("/team?invite=true"); onClose(); } },
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

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-start justify-center pt-[15vh] px-4"
    >
      <div className="bg-[#20242C] w-full max-w-xl rounded-2xl border border-[#2C313C] shadow-2xl overflow-hidden flex flex-col max-h-[480px]">
        {/* Search bar */}
        <div className="flex items-center px-4 border-b border-[#2C313C] h-12 flex-shrink-0">
          <Search className="h-4 w-4 text-[#8D96A7] mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-[#8D96A7] text-sm focus:outline-none"
          />
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#2A2F39] text-[#8D96A7] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Command list */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {filteredCommands.length > 0 ? (
            <div className="flex flex-col gap-1">
              {/* Group commands by category */}
              {Array.from(new Set(filteredCommands.map((c) => c.category))).map((category) => (
                <div key={category} className="mb-2">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest text-[#8D96A7]">
                    {category}
                  </div>
                  {filteredCommands
                    .filter((c) => c.category === category)
                    .map((cmd) => (
                      <button
                        key={cmd.label}
                        onClick={cmd.action}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[#B7BDC8] hover:text-white rounded-xl hover:bg-[#2A2F39] text-left transition-colors duration-150"
                      >
                        <span className="text-[#8D96A7]">{cmd.icon}</span>
                        <span className="flex-1">{cmd.label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#16181D] text-[#8D96A7] border border-[#2C313C]">
                          Enter
                        </span>
                      </button>
                    ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-[#8D96A7] text-xs">
              No command matches found.
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
