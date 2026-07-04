"use client";
import React, { useState } from "react";
import { 
  Server, 
  Search, 
  Activity, 
  ShieldAlert, 
  Cpu, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock tenant datasets
const INITIAL_TENANTS = [
  { id: 1, org: "Acme Corporation", owner: "John Doe", agents: 3, dailyCost: 28.40, status: "active", tps: 18 },
  { id: 2, org: "CyberDyne Systems", owner: "Sarah Connor", agents: 12, dailyCost: 184.20, status: "active", tps: 145 },
  { id: 3, org: "Oscorp Industries", owner: "Norman Osborn", agents: 8, dailyCost: 92.50, status: "suspended", tps: 0 },
  { id: 4, org: "Wayne Enterprises", owner: "Bruce Wayne", agents: 24, dailyCost: 480.10, status: "active", tps: 312 },
  { id: 5, org: "Tyrell Replicants", owner: "Eldon Tyrell", agents: 15, dailyCost: 250.00, status: "active", tps: 88 }
];

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState(INITIAL_TENANTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [logs, setLogs] = useState<string[]>([
    "directory: mounted cross-tenant cluster maps",
    "auth: validated operator clearances (super_admin)"
  ]);

  // Filtered tenants list
  const filteredTenants = tenants.filter(tenant => 
    tenant.org.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTenantStatus = (id: number) => {
    setTenants(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === "active" ? "suspended" : "active";
        setLogs(prevLogs => [...prevLogs, `[TENANT] Toggled status of ${t.org} to ${nextStatus.toUpperCase()}`]);
        return { ...t, status: nextStatus, tps: nextStatus === "active" ? 10 : 0 };
      }
      return t;
    }));
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-color pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-text-primary tracking-tight">Tenant Cluster Directory</h1>
          <p className="text-xs text-text-muted mt-1">Monitor billing caps, CPU allocations, and active agent limits across registered workspaces.</p>
        </div>
      </div>

      {/* Directory Table Area */}
      <div className="bg-card-bg border border-border-color rounded-card p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-sm font-bold text-text-primary">Workspace Tenant Registry</h2>
            <p className="text-[10px] text-text-muted mt-0.5">Control daily spending caps, API query quotas, and workspace status metrics.</p>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <Search className="h-3.5 w-3.5" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tenants or owners..."
              className="w-full h-9 pl-9 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Tenants Table */}
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border-color/60 text-[#8D96A7] font-bold uppercase tracking-wider text-[9px] pb-3">
                <th className="pb-3 pl-2">Tenant Organization</th>
                <th className="pb-3">Admin Owner</th>
                <th className="pb-3">Agent Slots</th>
                <th className="pb-3">Data Throughput (TPS)</th>
                <th className="pb-3">Daily Cost</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color/40 text-xs">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-hover-bg/30 transition-colors">
                  <td className="py-4 font-bold text-text-primary pl-2">{tenant.org}</td>
                  <td className="py-4 text-text-secondary">{tenant.owner}</td>
                  <td className="py-4 text-text-primary font-mono">{tenant.agents} agents</td>
                  <td className="py-4 text-text-primary font-mono">
                    <span className="inline-flex items-center gap-1">
                      <Activity className="h-3 w-3 text-primary animate-pulse" />
                      <span>{tenant.tps} TPS</span>
                    </span>
                  </td>
                  <td className="py-4 text-text-secondary font-mono">${tenant.dailyCost.toFixed(2)}/day</td>
                  <td className="py-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-bold uppercase border",
                      tenant.status === "active" 
                        ? "bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]" 
                        : "bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]"
                    )}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="py-4 text-right pr-2">
                    <button
                      onClick={() => toggleTenantStatus(tenant.id)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer",
                        tenant.status === "active"
                          ? "bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border-[#EF4444]/20 text-[#EF4444]"
                          : "bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary"
                      )}
                    >
                      {tenant.status === "active" ? "Suspend Cluster" : "Re-activate"}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTenants.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted">
                    No active tenants found matching search parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Directory Audit logs */}
      <div className="bg-card-bg border border-border-color rounded-card p-5 flex flex-col gap-3">
        <h3 className="text-xs uppercase font-extrabold tracking-wider text-text-primary border-b border-border-color/60 pb-2">Tenant Directory Audit Trail</h3>
        <div className="bg-black/90 p-4 border border-border-color/80 rounded-xl font-mono text-[9px] h-20 overflow-y-auto flex flex-col gap-1 text-text-secondary scrollbar-thin">
          {logs.map((log, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-text-muted">&gt;</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
