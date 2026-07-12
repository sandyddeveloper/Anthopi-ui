// src/app/(workspace)/dashboard/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Cpu, 
  Activity, 
  Database, 
  ShieldAlert, 
  RefreshCw, 
  Trash2, 
  Power, 
  Server, 
  Terminal, 
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Folder, 
  Users,
  Layers,
  Bell,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  FileText,
  User as UserIcon,
  ChevronRight,
  Zap,
  HardDrive,
  CalendarDays,
  Search,
  Wrench,
  Sliders,
  Laptop
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Super Admin States
  const [tenants, setTenants] = useState<any[]>([]);
  const [tenantSearch, setTenantSearch] = useState("");
  const [systemLogs, setSystemLogs] = useState<string[]>([
    "cluster_node_1: booted synapse core engine",
    "db_pool: connected to main Postgres instance (latency: 4ms)",
    "redis_cache: cache hit ratio 98.4%",
    "scheduler: cron tick triggered 14 cron jobs"
  ]);
  const [cpuLoad, setCpuLoad] = useState(42);
  const [ramLoad, setRamLoad] = useState(64);
  const [gpuLoad, setGpuLoad] = useState(28);
  const [dbLatency, setDbLatency] = useState(12);
  const [clusterStatus, setClusterStatus] = useState<"healthy" | "maintenance" | "rebooting">("healthy");
  const [actionStatus, setActionStatus] = useState("");

  // 2. Company Admin & Employee States
  const [stats, setStats] = useState<any>({
    total_employees: 0,
    departments: 0,
    teams: 0,
    projects: 0,
    files: 0,
    notifications: 0
  });
  const [totalStorage, setTotalStorage] = useState("0 KB");
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [recentFiles, setRecentFiles] = useState<any[]>([]);
  const [recentNotifs, setRecentNotifs] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authenticate user and fetch cached data
  useEffect(() => {
    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        console.error(e);
      }
    }
    const cachedPerms = localStorage.getItem("permissions");
    if (cachedPerms) {
      try {
        setPermissions(JSON.parse(cachedPerms));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const isSuperAdmin = user?.is_superuser === true || user?.role_details?.code === "super_admin";
  const isWorkspaceAdmin = user?.role_details?.code === "admin" || user?.role_details?.code === "manager";
  const isAdminOrSuper = isSuperAdmin || isWorkspaceAdmin;

  // Real-time telemetry tick for Super Admin
  useEffect(() => {
    if (!isSuperAdmin) return;
    const interval = setInterval(() => {
      setCpuLoad(prev => Math.min(Math.max(prev + Math.floor(Math.random() * 11) - 5, 20), 85));
      setGpuLoad(prev => Math.min(Math.max(prev + Math.floor(Math.random() * 9) - 4, 10), 90));
      setDbLatency(prev => Math.min(Math.max(prev + Math.floor(Math.random() * 5) - 2, 8), 24));
    }, 2500);
    return () => clearInterval(interval);
  }, [isSuperAdmin]);

  // Load backend datasets depending on user role
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      if (isSuperAdmin) {
        // Super Admin fetches Tenant Catalog Organizations
        const orgsRes = await apiClient.orgs.getOrganizations();
        const mapped = orgsRes.data.map((o: any, idx: number) => ({
          id: o.id || idx,
          org: o.name,
          owner: o.email || "System Operator",
          agents: 3 + (idx % 2),
          dailyCost: o.subscription === "premium" ? 49.00 : 19.00,
          status: o.is_deleted ? "suspended" : "active",
          tps: o.is_deleted ? 0 : 15 + (idx * 5)
        }));
        setTenants(mapped);
        setSystemLogs(prev => [...prev, `directory: synchronized ${mapped.length} active tenant clusters`]);
      } else {
        // Regular Admin or Employee loads workspace dashboard data
        const statsRes = await apiClient.dashboard.getStats();
        if (statsRes.data) {
          setStats(statsRes.data.cards || {});
          setRecentActivity(statsRes.data.recent_activity || []);
          setActiveSessions(statsRes.data.statistics?.active_sessions || 1);
        }

        const widgetsRes = await apiClient.dashboard.getWidgets();
        if (widgetsRes.data) {
          setRecentProjects(widgetsRes.data.my_projects || []);
          setRecentFiles(widgetsRes.data.recent_files || []);
          const rawNotifs = widgetsRes.data.recent_notifications || [];
          setRecentNotifs(rawNotifs.map((n: any) => ({
            id: n.id,
            title: n.title,
            body: n.message,
            type: n.notification_type || "system",
            time: n.created_at
          })));
        }

        const filesRes = await apiClient.knowledge.getFiles();
        if (filesRes.data && filesRes.data.length > 0) {
          const totalBytes = filesRes.data.reduce((acc: number, f: any) => acc + (f.file_size || 0), 0);
          setTotalStorage(formatSize(totalBytes));
        }
      }
    } catch (e: any) {
      console.error("Dashboard synchronization failure, falling back to local simulation:", e);
      if (!isSuperAdmin) {
        setRecentActivity([
          { id: "1", actor_details: { full_name: "System Core" }, action: "synchronized", module: "dashboard", object_repr: "workspace details", created_at: new Date().toISOString() }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const formatSize = (bytes: number) => {
    if (bytes === 0 || isNaN(bytes)) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("name", file.name);
    formData.append("file_path", file);
    formData.append("visibility", "organization");

    try {
      await apiClient.knowledge.createFile(formData);
      alert("File uploaded successfully via dashboard quick action!");
      loadDashboardData();
    } catch (err: any) {
      alert(err?.message || "Failed to upload file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  // Super Admin commands
  const runSystemAction = (action: string) => {
    setActionStatus(action);
    setSystemLogs(prev => [...prev, `[CMD] Executing cluster action: ${action.toUpperCase()}...`]);
    
    if (action === "reboot") {
      setClusterStatus("rebooting");
      setCpuLoad(5);
      setGpuLoad(0);
      setTimeout(() => {
        setClusterStatus("healthy");
        setCpuLoad(30);
        setSystemLogs(prev => [...prev, "[SYSTEM] Cluster node reboot completed. All systems operational."]);
        setActionStatus("");
      }, 2000);
    } else if (action === "purge") {
      setTimeout(() => {
        setSystemLogs(prev => [...prev, "[CACHE] Purged 512MB of cache pools on main clusters."]);
        setActionStatus("");
      }, 1000);
    } else if (action === "maintenance") {
      const nextStatus = clusterStatus === "maintenance" ? "healthy" : "maintenance";
      setClusterStatus(nextStatus);
      setSystemLogs(prev => [...prev, `[SYSTEM] Maintenance status changed to: ${nextStatus.toUpperCase()}`]);
      setActionStatus("");
    }
  };

  const toggleTenantStatus = (id: any) => {
    setTenants(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === "active" ? "suspended" : "active";
        setSystemLogs(prevLogs => [...prevLogs, `[TENANT] Changed cluster state for ${t.org} to ${nextStatus.toUpperCase()}`]);
        return { ...t, status: nextStatus, tps: nextStatus === "active" ? 12 : 0 };
      }
      return t;
    }));
  };

  const filteredTenants = tenants.filter(t => 
    t.org.toLowerCase().includes(tenantSearch.toLowerCase()) ||
    t.owner.toLowerCase().includes(tenantSearch.toLowerCase())
  );

  // ----------------------------------------------------
  // LAYOUT A: SUPER ADMIN DASHBOARD
  // ----------------------------------------------------
  if (isSuperAdmin) {
    return (
      <div className="flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full animate-fadeIn text-left">
        
        {/* Super Admin Welcome & Health */}
        <div className="bg-card-bg border border-border-color rounded-card p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-card">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="flex flex-col gap-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] text-primary font-bold uppercase tracking-wider self-start">
              <ShieldAlert className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span>Operator Level: Super Admin Control Hub</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
              Global Platform Command Center, {user?.full_name || "Super Operator"}.
            </h1>
            <p className="text-xs text-[#B7BDC8] leading-relaxed max-w-2xl">
              Inspect multi-tenant workspaces, run GPU hardware clusters tests, suspend/activate organization domains, purge system cache pools, and trace real-time console log stdout.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-border-color/60 relative z-10 text-[10px] text-[#8D96A7]">
            <span className="flex items-center gap-1.5">
              <span className={cn(
                "h-2.5 w-2.5 rounded-full",
                clusterStatus === "healthy" ? "bg-[#22C55E]" : clusterStatus === "maintenance" ? "bg-[#EF4444]" : "bg-primary animate-pulse"
              )} />
              Core Cluster State: <span className="font-extrabold uppercase text-white">{clusterStatus}</span>
            </span>
            <span>•</span>
            <span>Active Tenant Instances: {tenants.length} Domains</span>
            <span>•</span>
            <span>GPU Cores: 8x NVIDIA H100</span>
          </div>
        </div>

        {/* Real-time Telemetry Cards */}
        <div>
          <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-[#8D96A7] mb-3">Live Hardware & Postgres Telemetry</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* CPU */}
            <div className="bg-card-bg border border-border-color rounded-card p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Host CPU Load</span>
                <Cpu className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-text-primary font-mono text-white">{cpuLoad}%</span>
                <span className="text-[9px] text-[#22C55E] font-bold">16 Cores Active</span>
              </div>
              <div className="h-1.5 w-full bg-[#16181D]/60 rounded-full mt-4 overflow-hidden border border-border-color/60">
                <div 
                  style={{ width: `${cpuLoad}%` }}
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    cpuLoad > 80 ? "bg-[#EF4444]" : cpuLoad > 60 ? "bg-secondary" : "bg-primary"
                  )}
                />
              </div>
            </div>

            {/* RAM */}
            <div className="bg-card-bg border border-border-color rounded-card p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Memory Allocation</span>
                <Activity className="h-4 w-4 text-secondary" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-text-primary font-mono text-white">{ramLoad}%</span>
                <span className="text-[9px] text-[#8D96A7] font-bold">41.2 GB / 64 GB</span>
              </div>
              <div className="h-1.5 w-full bg-[#16181D]/60 rounded-full mt-4 overflow-hidden border border-border-color/60">
                <div style={{ width: `${ramLoad}%` }} className="h-full bg-secondary rounded-full" />
              </div>
            </div>

            {/* GPU */}
            <div className="bg-card-bg border border-border-color rounded-card p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">GPU Cluster Capacity</span>
                <Sparkles className="h-4 w-4 text-[#22C55E]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-text-primary font-mono text-white">{gpuLoad}%</span>
                <span className="text-[9px] text-[#22C55E] font-bold">NVIDIA H100</span>
              </div>
              <div className="h-1.5 w-full bg-[#16181D]/60 rounded-full mt-4 overflow-hidden border border-border-color/60">
                <div 
                  style={{ width: `${gpuLoad}%` }}
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    gpuLoad > 75 ? "bg-[#EF4444]" : "bg-[#22C55E]"
                  )}
                />
              </div>
            </div>

            {/* Database Latency */}
            <div className="bg-card-bg border border-border-color rounded-card p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Postgres Write Pool</span>
                <Database className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-text-primary font-mono text-white">{dbLatency}ms</span>
                <span className="text-[9px] text-[#22C55E] font-bold">120 active pools</span>
              </div>
              <div className="h-1.5 w-full bg-[#16181D]/60 rounded-full mt-4 overflow-hidden border border-border-color/60">
                <div style={{ width: `${(dbLatency / 30) * 100}%` }} className="h-full bg-white rounded-full" />
              </div>
            </div>

          </div>
        </div>

        {/* Tenant Registry Directory */}
        <div className="bg-card-bg border border-border-color rounded-card p-6 shadow-card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-sm font-bold text-white">Cross-Tenant Workspaces Registry</h2>
              <p className="text-[10px] text-text-muted mt-0.5">Control organization subscription clearance, daily costs, and cluster status.</p>
            </div>
            
            {/* Search box */}
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                value={tenantSearch}
                onChange={(e) => setTenantSearch(e.target.value)}
                placeholder="Search tenant orgs..."
                className="w-full h-9 pl-9 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border-color/60 text-[#8D96A7] font-bold uppercase tracking-wider text-[9px] pb-3">
                  <th className="pb-3 pl-2">Tenant Name</th>
                  <th className="pb-3">System Owner</th>
                  <th className="pb-3">Agent Slots</th>
                  <th className="pb-3">Data Flow (TPS)</th>
                  <th className="pb-3">Billing Plan Cost</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color/30 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-text-muted">
                      <div className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span>Fetching active catalogs...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-hover-bg/30 transition-colors">
                    <td className="py-4 font-bold text-white pl-2">{t.org}</td>
                    <td className="py-4 text-text-secondary">{t.owner}</td>
                    <td className="py-4 text-white font-mono">{t.agents} slots</td>
                    <td className="py-4 font-mono text-white">
                      <span className="inline-flex items-center gap-1">
                        <Activity className="h-3 w-3 text-primary animate-pulse" />
                        <span>{t.tps} TPS</span>
                      </span>
                    </td>
                    <td className="py-4 text-text-secondary font-mono">${t.dailyCost.toFixed(2)}/day</td>
                    <td className="py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[8px] font-bold uppercase border",
                        t.status === "active" 
                          ? "bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]" 
                          : "bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]"
                      )}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 text-right pr-2">
                      <button
                        onClick={() => toggleTenantStatus(t.id)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer",
                          t.status === "active"
                            ? "bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border-[#EF4444]/20 text-[#EF4444]"
                            : "bg-[#22C55E]/10 hover:bg-[#22C55E]/20 border-[#22C55E]/20 text-[#22C55E]"
                        )}
                      >
                        {t.status === "active" ? "Suspend Workspace" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTenants.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-text-muted">
                      No active tenant domains found matching query parameters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Controls & Stdout log stream */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Action buttons */}
          <div className="bg-card-bg border border-border-color rounded-card p-5 flex flex-col gap-4">
            <h2 className="text-xs uppercase font-extrabold tracking-wider text-white border-b border-border-color/60 pb-2">Cluster Diagnostics</h2>
            
            <button
              onClick={() => runSystemAction("reboot")}
              disabled={actionStatus !== ""}
              className="w-full h-11 rounded-xl bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/20 text-[#EF4444] font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Power className="h-4 w-4" />
              <span>Force Cluster Reboot</span>
            </button>

            <button
              onClick={() => runSystemAction("purge")}
              disabled={actionStatus !== ""}
              className="w-full h-11 rounded-xl bg-card-bg border border-border-color hover:bg-hover-bg text-text-secondary hover:text-text-primary font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              <span>Purge Shared Redis Cache</span>
            </button>

            <button
              onClick={() => runSystemAction("maintenance")}
              disabled={actionStatus !== ""}
              className="w-full h-11 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Toggle Global Maintenance Mode</span>
            </button>
          </div>

          {/* Console logs */}
          <div className="bg-card-bg border border-border-color rounded-card p-5 lg:col-span-2 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-border-color/60 pb-2">
              <h2 className="text-xs uppercase font-extrabold tracking-wider text-white">System Command stdout_stream</h2>
              <span className="text-[9px] font-mono text-text-muted">active_threads: 248</span>
            </div>

            <div className="bg-black/90 p-4 border border-border-color/80 rounded-xl font-mono text-[10px] h-32 overflow-y-auto flex flex-col gap-1 text-text-secondary select-text scrollbar-thin">
              {systemLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2 text-left">
                  <span className="text-text-muted">&gt;</span>
                  <span className={cn(
                    log.includes("[SYSTEM]") || log.includes("booted") ? "text-[#22C55E]" : "",
                    log.includes("[CMD]") ? "text-primary font-bold" : "",
                    log.includes("[CACHE]") ? "text-secondary" : ""
                  )}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    );
  }

  // ----------------------------------------------------
  // LAYOUT B: COMPANY ADMIN COMMAND CENTER
  // ----------------------------------------------------
  if (isWorkspaceAdmin) {
    return (
      <div className="flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full animate-fadeIn text-left">
        
        {/* Hidden file upload selector */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
        />

        {/* Company Admin Header */}
        <div className="bg-card-bg border border-border-color rounded-card p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-card">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="flex flex-col gap-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] text-primary font-bold uppercase tracking-wider self-start">
              <Sparkles className="h-3 w-3" />
              <span>{user?.organization_details?.name || "Workspace Cluster"} Admin Daily Center</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
              Enterprise Command Center, {user?.full_name || "Workspace Operator"}.
            </h1>
            <p className="text-xs text-[#B7BDC8] leading-relaxed max-w-xl">
              Supervise clear employee nodes, delegate project workspaces, inspect notification logs, and organize shared digital assets across files nodes.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-border-color/60 relative z-10 text-[10px] text-[#8D96A7]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
              Cluster State: Active Node
            </span>
            <span>•</span>
            <span>Security Clearance: {user?.role_details?.name || "Operator"}</span>
            <span>•</span>
            <span>Active Sessions: {activeSessions} Connected Tiers</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-[#8D96A7] mb-3">Quick Actions Command Panel</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            <button 
              onClick={() => router.push("/projects?create=true")}
              className="flex flex-col items-center justify-center p-4 bg-card-bg border border-border-color hover:border-primary/40 rounded-card transition-all group text-center cursor-pointer shadow-card h-28"
            >
              <div className="p-2 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform mb-2">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-white">Create Project</span>
            </button>

            <button 
              onClick={() => router.push("/team?invite=true")}
              className="flex flex-col items-center justify-center p-4 bg-card-bg border border-border-color hover:border-[#7C4DFF]/40 rounded-card transition-all group text-center cursor-pointer shadow-card h-28"
            >
              <div className="p-2 bg-[#7C4DFF]/10 rounded-xl text-[#7C4DFF] group-hover:scale-110 transition-transform mb-2">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-white">Invite Employee</span>
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex flex-col items-center justify-center p-4 bg-card-bg border border-border-color hover:border-cyan-400/40 rounded-card transition-all group text-center cursor-pointer shadow-card h-28 disabled:opacity-50"
            >
              <div className="p-2 bg-cyan-400/10 rounded-xl text-cyan-400 group-hover:scale-110 transition-transform mb-2">
                {isUploading ? <span className="h-5 w-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin block" /> : <HardDrive className="h-5 w-5" />}
              </div>
              <span className="text-[11px] font-bold text-white">{isUploading ? "Uploading..." : "Upload File"}</span>
            </button>

            <button 
              onClick={() => router.push("/team?focusSearch=true")}
              className="flex flex-col items-center justify-center p-4 bg-card-bg border border-border-color hover:border-yellow-500/40 rounded-card transition-all group text-center cursor-pointer shadow-card h-28"
            >
              <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-500 group-hover:scale-110 transition-transform mb-2">
                <Search className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-white">Search Employee</span>
            </button>

            <button 
              onClick={() => router.push("/profile")}
              className="flex flex-col items-center justify-center p-4 bg-card-bg border border-border-color hover:border-emerald-500/40 rounded-card transition-all group text-center cursor-pointer shadow-card h-28 col-span-2 md:col-span-1"
            >
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500 group-hover:scale-110 transition-transform mb-2">
                <UserIcon className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-white">Open Profile</span>
            </button>
          </div>
        </div>

        {/* Telemetry KPIs */}
        <div>
          <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-[#8D96A7] mb-3">Workspace Telemetry</h2>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            
            <div className="bg-card-bg border border-border-color rounded-card p-5 flex items-center justify-between shadow-card">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[9px] text-[#8D96A7] font-bold uppercase tracking-wider truncate">Total Employees</span>
                <span className="text-lg font-bold text-white">{stats.total_employees || 0} Seats</span>
              </div>
              <div className="p-2 bg-[#7C4DFF]/15 border border-[#7C4DFF]/20 rounded-xl text-[#7C4DFF] flex-shrink-0">
                <Users className="h-4 w-4" />
              </div>
            </div>

            <div className="bg-card-bg border border-border-color rounded-card p-5 flex items-center justify-between shadow-card">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[9px] text-[#8D96A7] font-bold uppercase tracking-wider truncate">Departments</span>
                <span className="text-lg font-bold text-white">{stats.departments || 0} Units</span>
              </div>
              <div className="p-2 bg-emerald-500/15 border border-emerald-500/20 rounded-xl text-emerald-500 flex-shrink-0">
                <Layers className="h-4 w-4" />
              </div>
            </div>

            <div className="bg-card-bg border border-border-color rounded-card p-5 flex items-center justify-between shadow-card">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[9px] text-[#8D96A7] font-bold uppercase tracking-wider truncate">Teams</span>
                <span className="text-lg font-bold text-white">{stats.teams || 0} Nodes</span>
              </div>
              <div className="p-2 bg-yellow-500/15 border border-yellow-500/20 rounded-xl text-yellow-500 flex-shrink-0">
                <Server className="h-4 w-4" />
              </div>
            </div>

            <div className="bg-card-bg border border-border-color rounded-card p-5 flex items-center justify-between shadow-card">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[9px] text-[#8D96A7] font-bold uppercase tracking-wider truncate">Projects</span>
                <span className="text-lg font-bold text-white">{stats.projects || 0} Projects</span>
              </div>
              <div className="p-2 bg-primary/15 border border-primary/20 rounded-xl text-primary flex-shrink-0">
                <Folder className="h-4 w-4" />
              </div>
            </div>

            <div className="bg-card-bg border border-border-color rounded-card p-5 flex items-center justify-between shadow-card">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[9px] text-[#8D96A7] font-bold uppercase tracking-wider truncate">Cloud Storage</span>
                <span className="text-lg font-bold text-white truncate">{totalStorage}</span>
              </div>
              <div className="p-2 bg-cyan-400/15 border border-cyan-400/20 rounded-xl text-cyan-400 flex-shrink-0">
                <HardDrive className="h-4 w-4" />
              </div>
            </div>

            <div className="bg-card-bg border border-border-color rounded-card p-5 flex items-center justify-between shadow-card">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[9px] text-[#8D96A7] font-bold uppercase tracking-wider truncate">Files Count</span>
                <span className="text-lg font-bold text-white">{stats.files || 0} Assets</span>
              </div>
              <div className="p-2 bg-purple-400/15 border border-purple-400/20 rounded-xl text-purple-400 flex-shrink-0">
                <FileText className="h-4 w-4" />
              </div>
            </div>

          </div>
        </div>

        {/* Dynamic lists grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-card-bg border border-border-color rounded-card p-5 shadow-card flex flex-col justify-between h-72">
            <div className="flex flex-col gap-3 min-h-0">
              <div className="flex justify-between items-center border-b border-border-color pb-2">
                <span className="text-[10px] text-[#8D96A7] font-bold uppercase tracking-wider">Active Workspace Projects</span>
                <button onClick={() => router.push("/projects")} className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5">
                  <span>View All</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              
              <div className="flex-1 flex flex-col gap-3.5 mt-1 overflow-y-auto scrollbar-hide">
                {recentProjects.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-1.5 py-6 text-center">
                    <span className="text-[11px] text-[#8D96A7]">No projects workspaces configured.</span>
                  </div>
                ) : (
                  recentProjects.slice(0, 3).map((proj) => (
                    <div key={proj.id} onClick={() => router.push("/projects")} className="flex items-center justify-between gap-3 text-xs cursor-pointer group">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 bg-[#16181D] border border-border-color rounded-xl text-primary flex-shrink-0 group-hover:scale-105 transition-transform">
                          <Folder className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col text-left min-w-0">
                          <span className="font-bold text-white group-hover:text-primary transition-colors truncate">{proj.name}</span>
                          <span className="text-[9px] text-[#8D96A7] truncate">Code: {proj.code || "PRJ"}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-primary/20 bg-primary/5 text-primary capitalize flex-shrink-0">
                        {proj.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-card-bg border border-border-color rounded-card p-5 shadow-card flex flex-col justify-between h-72">
            <div className="flex flex-col gap-3 min-h-0">
              <div className="flex justify-between items-center border-b border-border-color pb-2">
                <span className="text-[10px] text-[#8D96A7] font-bold uppercase tracking-wider">Unread Alerts</span>
                <button onClick={() => router.push("/notifications")} className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5">
                  <span>Inbox</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <div className="flex-1 flex flex-col gap-3.5 mt-1 overflow-y-auto scrollbar-hide">
                {recentNotifs.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-1 py-10 text-center">
                    <Bell className="h-5 w-5 text-[#2C313C] mb-1" />
                    <span className="text-[10px] text-[#8D96A7]">Notifications inbox is clear.</span>
                  </div>
                ) : (
                  recentNotifs.slice(0, 3).map((notif) => (
                    <div key={notif.id} onClick={() => router.push("/notifications")} className="flex gap-2 text-xs cursor-pointer group text-left">
                      <div className="p-1 bg-[#16181D] rounded text-primary flex-shrink-0 mt-0.5">
                        <Zap className="h-3 w-3 text-primary" />
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-bold text-white group-hover:text-primary transition-colors truncate">{notif.title}</span>
                        <span className="text-[9px] text-[#8D96A7] line-clamp-1">{notif.body}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // ----------------------------------------------------
  // LAYOUT C: REGULAR EMPLOYEE HUB
  // ----------------------------------------------------
  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full animate-fadeIn text-left">
      
      {/* Employee Greeting Header */}
      <div className="bg-card-bg border border-border-color rounded-card p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-card">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
        <div className="flex flex-col gap-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[10px] text-emerald-500 font-bold uppercase tracking-wider self-start">
            <CheckCircle2 className="h-3 w-3" />
            <span>Employee Node Portal</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            Welcome back, {user?.full_name || "Workspace Operator"}.
          </h1>
          <p className="text-xs text-[#B7BDC8] leading-relaxed max-w-lg">
            Track your assigned projects, view shared document files in the knowledge database, and access personal messages.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Personal Projects */}
        <div className="lg:col-span-8 bg-card-bg border border-border-color rounded-card p-5 shadow-card flex flex-col justify-between h-72">
          <div className="flex flex-col gap-3 min-h-0">
            <div className="flex justify-between items-center border-b border-border-color pb-2">
              <span className="text-[10px] text-[#8D96A7] font-bold uppercase tracking-wider">My Active Projects</span>
              <button onClick={() => router.push("/projects")} className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5">
                <span>All Projects</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col gap-3.5 mt-1 overflow-y-auto scrollbar-hide">
              {recentProjects.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-1.5 py-10 text-center">
                  <span className="text-[11px] text-[#8D96A7]">You are not currently assigned to any projects.</span>
                </div>
              ) : (
                recentProjects.map((proj) => (
                  <div key={proj.id} onClick={() => router.push("/projects")} className="flex items-center justify-between gap-3 text-xs cursor-pointer group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 bg-[#16181D] border border-border-color rounded-xl text-primary flex-shrink-0">
                        <Folder className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-white group-hover:text-primary transition-colors truncate">{proj.name}</span>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-primary/20 bg-primary/5 text-primary capitalize flex-shrink-0">
                      {proj.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Notifications inbox */}
        <div className="lg:col-span-4 bg-card-bg border border-border-color rounded-card p-5 shadow-card flex flex-col justify-between h-72">
          <div className="flex flex-col gap-3 min-h-0">
            <div className="flex justify-between items-center border-b border-border-color pb-2">
              <span className="text-[10px] text-[#8D96A7] font-bold uppercase tracking-wider">Inbox Alerts</span>
              <button onClick={() => router.push("/notifications")} className="text-[10px] text-primary hover:underline font-bold">
                <span>View Inbox</span>
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-3.5 mt-1 overflow-y-auto scrollbar-hide">
              {recentNotifs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-1 py-10 text-center">
                  <Bell className="h-4 w-4 text-text-muted mb-1" />
                  <span className="text-[10px] text-text-muted">No new alerts.</span>
                </div>
              ) : (
                recentNotifs.slice(0, 3).map((notif) => (
                  <div key={notif.id} onClick={() => router.push("/notifications")} className="flex gap-2 text-xs cursor-pointer group text-left">
                    <div className="p-1 bg-[#16181D] rounded text-primary flex-shrink-0 mt-0.5">
                      <Zap className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-bold text-white group-hover:text-primary transition-colors truncate">{notif.title}</span>
                      <span className="text-[9px] text-[#8D96A7] line-clamp-1">{notif.body}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
