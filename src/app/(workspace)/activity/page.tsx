// src/app/(workspace)/activity/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Search, 
  Filter, 
  Calendar, 
  User as UserIcon, 
  Database,
  Terminal,
  Clock,
  Layers,
  Server,
  Folder,
  FileText,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

export default function ActivityLogPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter states
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [actRes, usersRes] = await Promise.all([
        apiClient.activities.listActivities({
          module: selectedModule || undefined,
          action: selectedAction || undefined
        }),
        apiClient.users.listUsers()
      ]);

      const list = Array.isArray(actRes.data) ? actRes.data : (actRes.data as any).results || [];
      setActivities(list);
      setUsers(usersRes.data || []);
    } catch (e) {
      console.error("Failed to load activity logs:", e);
      // Fallback mocks
      setActivities([
        { id: "1", actor_details: { full_name: "John Doe", email: "john@acme.com" }, action: "created", module: "project", object_repr: "Project Alpha", created_at: new Date(Date.now() - 600000).toISOString() },
        { id: "2", actor_details: { full_name: "Sarah Connors", email: "sarah@acme.com" }, action: "uploaded", module: "file", object_repr: "q2_report.xlsx", created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: "3", actor_details: { full_name: "System Daemon", email: "system@acme.com" }, action: "updated", module: "employee", object_repr: "Alex Mercer profile", created_at: new Date(Date.now() - 7200000).toISOString() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedModule, selectedAction]);

  const getModuleIcon = (module: string) => {
    switch (module?.toLowerCase()) {
      case "project":
        return <Folder className="h-4 w-4 text-primary" />;
      case "file":
        return <FileText className="h-4 w-4 text-cyan-400" />;
      case "employee":
        return <UserIcon className="h-4 w-4 text-emerald-400" />;
      case "department":
        return <Layers className="h-4 w-4 text-purple-400" />;
      case "team":
        return <Server className="h-4 w-4 text-yellow-400" />;
      default:
        return <Terminal className="h-4 w-4 text-neutral-400" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action?.toLowerCase()) {
      case "created":
      case "create":
        return "bg-primary/10 border-primary/20 text-primary";
      case "uploaded":
      case "upload":
        return "bg-cyan-500/10 border-cyan-500/20 text-cyan-400";
      case "updated":
      case "update":
        return "bg-yellow-500/10 border-yellow-500/20 text-yellow-500";
      case "deleted":
      case "delete":
        return "bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]";
      default:
        return "bg-neutral-500/10 border-neutral-500/20 text-neutral-400";
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return "Some time ago";
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Client side filtering for query, user
  const filteredActivities = activities.filter((act) => {
    const matchesSearch = 
      act.object_repr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.module?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesUser = !selectedUser || act.actor === selectedUser || act.actor_details?.id === selectedUser || act.actor_details?.email === selectedUser;

    return matchesSearch && matchesUser;
  });

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn text-left">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-color pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">System Activity Feed</h1>
          <p className="text-xs text-[#8D96A7] mt-1">Audit log of all manual and automated actions performed across the workspace cluster.</p>
        </div>
        <button 
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-color bg-card-bg hover:bg-hover-bg text-xs font-semibold text-[#B7BDC8] hover:text-white transition-colors cursor-pointer"
        >
          <Clock className="h-4 w-4" />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-card-bg border border-border-color p-4 rounded-xl shadow-card">
        <div className="flex flex-wrap gap-2.5 flex-1 items-center">
          <div className="relative flex-1 max-w-xs min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8D96A7]" />
            <input
              type="text"
              placeholder="Search activity records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="h-9 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none max-w-[160px]"
          >
            <option value="">All Users</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
            ))}
          </select>

          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="h-9 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none max-w-[140px]"
          >
            <option value="">All Modules</option>
            <option value="project">Projects</option>
            <option value="file">Files</option>
            <option value="employee">Employees</option>
            <option value="department">Departments</option>
            <option value="team">Teams</option>
          </select>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="h-9 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none max-w-[140px]"
          >
            <option value="">All Actions</option>
            <option value="created">Created</option>
            <option value="updated">Updated</option>
            <option value="uploaded">Uploaded</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>
      </div>

      {/* Main Activity Timeline */}
      <div className="bg-card-bg border border-border-color rounded-card p-6 shadow-card flex-1 min-h-[400px] flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-xs text-[#8D96A7] py-24">
            <span className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Fetching operational timeline...</span>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-xs text-[#8D96A7] py-24">
            <AlertCircle className="h-8 w-8 text-[#2C313C]" />
            <span>No activity logs matched your active filter selections.</span>
          </div>
        ) : (
          <div className="relative pl-6 border-l border-border-color/60 flex flex-col gap-6 ml-2.5 py-2">
            {filteredActivities.map((act) => (
              <div key={act.id} className="relative flex gap-4 text-xs items-start">
                
                {/* Visual Timeline Marker Node */}
                <div className="absolute -left-[35px] top-1 bg-card-bg border-2 border-border-color rounded-full h-6.5 w-6.5 flex items-center justify-center text-primary shadow-sm">
                  {getModuleIcon(act.module)}
                </div>

                {/* Actor Avatar / Initials */}
                <div className="h-8 w-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-xs text-primary uppercase flex-shrink-0">
                  {act.actor_details?.full_name?.substring(0, 2) || act.actor_details?.email?.substring(0, 2) || "SY"}
                </div>

                {/* Log Meta Details */}
                <div className="flex-1 flex flex-col gap-1 text-left min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <span className="font-bold text-white">
                      {act.actor_details?.full_name || "System Operator"}
                    </span>
                    <span className="text-[10px] text-text-muted font-mono self-start sm:self-auto">
                      {formatTimeAgo(act.created_at)}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#B7BDC8] leading-relaxed">
                    Performed <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase border", getActionColor(act.action))}>
                      {act.action}
                    </span> on <span className="font-bold text-white">{act.module}</span>:{" "}
                    <span className="font-mono text-primary font-semibold">{act.object_repr}</span>
                  </p>

                  {act.metadata && Object.keys(act.metadata).length > 0 && (
                    <div className="bg-[#16181D] border border-border-color/40 rounded-xl p-2 mt-1 max-w-lg">
                      <pre className="font-mono text-[9px] text-[#8D96A7] overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(act.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
