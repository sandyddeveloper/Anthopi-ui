"use client";
import React, { useState } from "react";
import { 
  Link2, 
  Search, 
  Check, 
  RefreshCw, 
  Layers, 
  Info,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Integration {
  name: string;
  category: "Communication" | "Productivity" | "Development" | "AI Platforms";
  description: string;
  connected: boolean;
  lastSync?: string;
  permissions: string[];
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    { name: "Slack", category: "Communication", description: "Dispatch channel alert payloads and notify teams on status reports.", connected: true, lastSync: "15 min ago", permissions: ["channels:write", "chat:write"] },
    { name: "GitHub", category: "Development", description: "Monitor pull request updates and code diff changes.", connected: true, lastSync: "2 hours ago", permissions: ["repo:read", "write:discussion"] },
    { name: "Notion", category: "Productivity", description: "Sync tasks databases logs and format documents directly.", connected: false, permissions: ["documents:write", "read:workspace"] },
    { name: "OpenAI", category: "AI Platforms", description: "Leverage GPT models for reasoning nodes inside workflows.", connected: true, lastSync: "1 min ago", permissions: ["models:read", "completions:write"] },
    { name: "Gmail", category: "Communication", description: "Automate outgoing emails and scan lead messages.", connected: false, permissions: ["mail:send"] },
    { name: "ClickUp", category: "Productivity", description: "Provision and update client tickets dynamically.", connected: false, permissions: ["tasks:write"] },
  ]);

  const [search, setSearch] = useState("");
  const [syncingName, setSyncingName] = useState<string | null>(null);

  const handleToggleConnect = (name: string) => {
    setIntegrations(prev => prev.map(int => {
      if (int.name === name) {
        if (int.connected) {
          return { ...int, connected: false, lastSync: undefined };
        } else {
          return { ...int, connected: true, lastSync: "Just now" };
        }
      }
      return int;
    }));
  };

  const handleSync = (name: string) => {
    setSyncingName(name);
    setTimeout(() => {
      setIntegrations(prev => prev.map(int => 
        int.name === name ? { ...int, lastSync: "Just now" } : int
      ));
      setSyncingName(null);
    }, 1000);
  };

  const filteredIntegrations = integrations.filter(int =>
    int.name.toLowerCase().includes(search.toLowerCase()) ||
    int.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-color/60 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Platform Integrations</h1>
          <p className="text-xs text-[#8D96A7] mt-1">Connect your SaaS credentials and sync workspace database variables.</p>
        </div>
      </div>

      {/* Control Search */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8D96A7]">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="Filter integrations by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-11 pr-4 text-xs rounded-xl border border-border-color bg-card-bg text-white placeholder-[#8D96A7] focus:outline-none focus:border-primary"
        />
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((int) => (
          <div
            key={int.name}
            className="bg-card-bg border border-border-color rounded-card p-5 shadow-card hover:border-[#2C313C]/80 transition-all duration-200 flex flex-col justify-between h-[240px]"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-[#16181D] border border-border-color rounded-xl text-primary">
                  <Link2 className="h-5 w-5" />
                </div>
                <span className={cn(
                  "text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border",
                  int.connected 
                    ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" 
                    : "bg-neutral-800 text-[#8D96A7] border-neutral-700"
                )}>
                  {int.connected ? "Connected" : "Not Linked"}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-white">{int.name}</h3>
                <span className="text-[9px] text-primary/80 font-bold uppercase tracking-wider mt-0.5 inline-block">{int.category}</span>
                <p className="text-[11px] text-[#B7BDC8] mt-2 leading-relaxed line-clamp-2">
                  {int.description}
                </p>
              </div>
            </div>

            {/* In-card sync reports & buttons */}
            <div className="border-t border-border-color/40 pt-4 mt-2 flex items-center justify-between">
              <div className="flex flex-col text-[9px] text-[#8D96A7]">
                {int.connected ? (
                  <>
                    <span>Last Synced:</span>
                    <span className="font-mono text-white mt-0.5">{int.lastSync}</span>
                  </>
                ) : (
                  <span>Access Grant Required</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {int.connected && (
                  <button
                    onClick={() => handleSync(int.name)}
                    disabled={syncingName === int.name}
                    className="p-2 rounded-lg border border-border-color hover:bg-hover-bg text-[#B7BDC8] disabled:opacity-50"
                  >
                    <RefreshCw className={cn("h-3.5 w-3.5", syncingName === int.name && "animate-spin")} />
                  </button>
                )}
                <button
                  onClick={() => handleToggleConnect(int.name)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg font-semibold text-[10px] transition-all duration-150",
                    int.connected
                      ? "border border-border-color hover:bg-hover-bg text-[#B7BDC8] hover:text-[#EF4444]"
                      : "bg-primary hover:bg-primary-hover text-white"
                  )}
                >
                  {int.connected ? "Disconnect" : "Connect"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
