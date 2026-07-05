// src/app/(workspace)/dashboard/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Folder, 
  Activity, 
  Users,
  Layers,
  Server,
  Bell,
  Clock,
  Laptop,
  Smartphone,
  Plus,
  ArrowRight,
  TrendingUp,
  FileText,
  User as UserIcon,
  ChevronRight,
  Sparkles,
  Zap,
  HardDrive,
  CalendarDays,
  ExternalLink,
  Search,
  Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  // Dashboard stats
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
  const [isLoading, setIsLoading] = useState(true);

  // File upload input ref for quick action
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch dashboard stats
      const statsRes = await apiClient.dashboard.getStats();
      if (statsRes.data) {
        setStats(statsRes.data.cards || {});
        setRecentActivity(statsRes.data.recent_activity || []);
        setActiveSessions(statsRes.data.statistics?.active_sessions || 1);
      }

      // 2. Fetch widgets (recent projects, files, etc)
      const widgetsRes = await apiClient.dashboard.getWidgets();
      if (widgetsRes.data) {
        setRecentProjects(widgetsRes.data.my_projects || []);
        setRecentFiles(widgetsRes.data.recent_files || []);
        
        // Transform recent_notifications format if necessary
        const rawNotifs = widgetsRes.data.recent_notifications || [];
        setRecentNotifs(rawNotifs.map((n: any) => ({
          id: n.id,
          title: n.title,
          body: n.message,
          type: n.notification_type || "system",
          time: n.created_at
        })));
      }

      // 3. Fetch all files to sum total storage size
      const filesRes = await apiClient.knowledge.getFiles();
      if (filesRes.data && filesRes.data.length > 0) {
        const totalBytes = filesRes.data.reduce((acc: number, f: any) => acc + (f.file_size || 0), 0);
        setTotalStorage(formatSize(totalBytes));
      }
    } catch (e) {
      console.error("Dashboard fetch failed, using fallback mocks:", e);
      // Mocks
      setRecentActivity([
        { id: "1", actor_details: { full_name: "Admin Operator" }, action: "synchronized", module: "dashboard", object_repr: "workspace telemetry", created_at: new Date().toISOString() },
        { id: "2", actor_details: { full_name: "Admin Operator" }, action: "created", module: "department", object_repr: "Engineering Node", created_at: new Date(Date.now() - 3600000).toISOString() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
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

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full animate-fadeIn text-left">
      
      {/* Hidden file uploader */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
      />

      {/* Header Context Banner */}
      <div className="bg-card-bg border border-border-color rounded-card p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-card">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] text-primary font-bold uppercase tracking-wider self-start">
            <Sparkles className="h-3 w-3" />
            <span>{user?.organization_details?.name || "Workspace Cluster"} Daily Center</span>
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

      {/* Quick Actions Panel */}
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

      {/* Grid 1: Top KPI cards */}
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

      {/* Row 2: Attendance, Recent Projects, Recent Files, Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Attendance (Future) */}
        <div className="lg:col-span-3 bg-card-bg border border-border-color rounded-card p-5 shadow-card flex flex-col justify-between h-72">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-[#8D96A7] font-bold uppercase tracking-wider">Attendance Node</span>
            <h3 className="font-extrabold text-white text-sm">Today's Attendance</h3>
            <p className="text-[11px] text-[#8D96A7] leading-relaxed mt-2">
              Attendance tracking module is undergoing cluster scheduling updates. Realtime sign-in and biometric keys integration coming soon.
            </p>
          </div>
          <div className="border-t border-border-color/60 pt-4 flex items-center gap-2 text-[10px] text-[#8D96A7] font-bold">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span>State: Under Construction</span>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="lg:col-span-5 bg-card-bg border border-border-color rounded-card p-5 shadow-card flex flex-col justify-between h-72">
          <div className="flex flex-col gap-3 min-h-0">
            <div className="flex justify-between items-center border-b border-border-color pb-2">
              <span className="text-[10px] text-[#8D96A7] font-bold uppercase tracking-wider">Recent Active Projects</span>
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

        {/* Notifications & Recent Files */}
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

      {/* Row 3: Recent Activity, Project Timeline, Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Recent Operational Activity feed */}
        <div className="lg:col-span-5 bg-card-bg border border-border-color rounded-card p-6 shadow-card flex flex-col justify-between min-h-[300px]">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-border-color pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Operational Activities</h3>
              <button 
                onClick={() => router.push("/activity")}
                className="text-[10px] text-primary hover:underline font-bold"
              >
                Full Feed
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {recentActivity.length === 0 ? (
                <span className="text-xs text-[#8D96A7] py-6 text-center block">No organizational actions log found.</span>
              ) : (
                recentActivity.slice(0, 4).map((log) => (
                  <div key={log.id} className="flex gap-3 text-xs items-start text-left">
                    <div className="p-1.5 bg-[#16181D] rounded-lg text-primary flex-shrink-0 mt-0.5 border border-border-color">
                      <Terminal className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-bold text-white truncate block">{log.actor_details?.full_name || "System"} {log.action} {log.module}</span>
                      <span className="text-[10px] text-[#8D96A7] truncate block mt-0.5 font-semibold">
                        Object: {log.object_repr}
                      </span>
                      <span className="text-[9px] font-mono text-text-muted mt-0.5">
                        {formatTimeAgo(log.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Files browser list */}
        <div className="lg:col-span-7 bg-card-bg border border-border-color rounded-card p-6 shadow-card flex flex-col justify-between min-h-[300px]">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-border-color pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recent Asset Uploads</h3>
              <button 
                onClick={() => router.push("/files")}
                className="text-[10px] text-primary hover:underline font-bold"
              >
                Files Node
              </button>
            </div>

            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-[#8D96A7] font-bold uppercase tracking-wider text-[9px] border-b border-border-color pb-2">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Size</th>
                    <th className="pb-2">Owner</th>
                    <th className="pb-2 text-right">Uploaded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color/30">
                  {recentFiles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-text-muted">No files synced.</td>
                    </tr>
                  ) : (
                    recentFiles.slice(0, 4).map((f) => (
                      <tr key={f.id} className="hover:bg-hover-bg/25 transition-colors">
                        <td className="py-3 font-bold text-white">
                          <span className="flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-primary" />
                            {f.name}
                          </span>
                        </td>
                        <td className="py-3 text-[#B7BDC8] font-mono">{formatSize(f.file_size)}</td>
                        <td className="py-3 text-[#B7BDC8]">{f.created_by_details?.full_name || "Operator"}</td>
                        <td className="py-3 text-right text-text-muted font-mono">
                          {formatTimeAgo(f.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
