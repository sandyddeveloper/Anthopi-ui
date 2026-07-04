"use client";
import React, { useState, useEffect } from "react";
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
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminTelemetryPage() {
  const [systemLogs, setSystemLogs] = useState<string[]>([
    "cluster_node_1: booted synapse core engine",
    "db_pool: connected to main Postgres instance (latency: 4ms)",
    "redis_cache: cache hit ratio 98.4%",
    "scheduler: cron tick triggered 14 cron jobs"
  ]);

  // Live telemetry metrics states
  const [cpuLoad, setCpuLoad] = useState(42);
  const [ramLoad, setRamLoad] = useState(64);
  const [gpuLoad, setGpuLoad] = useState(28);
  const [dbLatency, setDbLatency] = useState(12);
  const [clusterStatus, setClusterStatus] = useState<"healthy" | "maintenance" | "rebooting">("healthy");
  const [actionStatus, setActionStatus] = useState("");

  // Live update CPU/RAM loads dynamically
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuLoad(prev => Math.min(Math.max(prev + Math.floor(Math.random() * 11) - 5, 20), 85));
      setGpuLoad(prev => Math.min(Math.max(prev + Math.floor(Math.random() * 9) - 4, 10), 90));
      setDbLatency(prev => Math.min(Math.max(prev + Math.floor(Math.random() * 5) - 2, 8), 24));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Trigger system actions
  const runSystemAction = (action: string) => {
    setActionStatus(action);
    setSystemLogs(prev => [...prev, `[CMD] Executing action: ${action.toUpperCase()}...`]);
    
    if (action === "reboot") {
      setClusterStatus("rebooting");
      setCpuLoad(5);
      setGpuLoad(0);
      setTimeout(() => {
        setClusterStatus("healthy");
        setCpuLoad(30);
        setSystemLogs(prev => [...prev, "[SYSTEM] Cluster reboot complete. All nodes active."]);
        setActionStatus("");
      }, 2000);
    } else if (action === "purge") {
      setTimeout(() => {
        setSystemLogs(prev => [...prev, "[CACHE] Successfully cleared 248 MB of cached prompt templates."]);
        setActionStatus("");
      }, 1000);
    } else if (action === "maintenance") {
      const nextStatus = clusterStatus === "maintenance" ? "healthy" : "maintenance";
      setClusterStatus(nextStatus);
      setSystemLogs(prev => [...prev, `[SYSTEM] Maintenance Mode set to: ${nextStatus.toUpperCase()}`]);
      setActionStatus("");
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Overview Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-color pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-text-primary tracking-tight">System Telemetry & Health</h1>
          <p className="text-xs text-text-muted mt-1">Real-time GPU clusters, virtual threads load, and container resource telemetry.</p>
        </div>

        {/* Global Cluster State Indicator Badge */}
        <div className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wide",
          clusterStatus === "healthy" && "bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]",
          clusterStatus === "maintenance" && "bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]",
          clusterStatus === "rebooting" && "bg-primary/10 border-primary/20 text-primary animate-pulse"
        )}>
          <Server className="h-4 w-4" />
          <span>Cluster State: {clusterStatus}</span>
        </div>
      </div>

      {/* 1. Live Telemetry Panels (The Theme is Power) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* CPU Panel */}
        <div className="bg-card-bg border border-border-color rounded-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Host CPU Load</span>
            <Cpu className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-text-primary font-mono">{cpuLoad}%</span>
            <span className="text-[9px] text-[#22C55E] font-bold">16 Cores Active</span>
          </div>
          {/* Progress bar */}
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

        {/* RAM Panel */}
        <div className="bg-card-bg border border-border-color rounded-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Host Memory Usage</span>
            <Activity className="h-4 w-4 text-secondary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-text-primary font-mono">{ramLoad}%</span>
            <span className="text-[9px] text-text-muted">41.2 GB / 64 GB</span>
          </div>
          <div className="h-1.5 w-full bg-[#16181D]/60 rounded-full mt-4 overflow-hidden border border-border-color/60">
            <div style={{ width: `${ramLoad}%` }} className="h-full bg-secondary rounded-full" />
          </div>
        </div>

        {/* GPU Cluster Load */}
        <div className="bg-card-bg border border-border-color rounded-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">GPU Cluster Load</span>
            <Sparkles className="h-4 w-4 text-[#22C55E]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-text-primary font-mono">{gpuLoad}%</span>
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

        {/* DB Pool Latency */}
        <div className="bg-card-bg border border-border-color rounded-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Postgres IO Pool</span>
            <Database className="h-4 w-4 text-text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-text-primary font-mono">{dbLatency}ms</span>
            <span className="text-[9px] text-[#22C55E] font-bold">120 active pools</span>
          </div>
          <div className="h-1.5 w-full bg-[#16181D]/60 rounded-full mt-4 overflow-hidden border border-border-color/60">
            <div style={{ width: `${(dbLatency / 30) * 100}%` }} className="h-full bg-text-primary rounded-full" />
          </div>
        </div>

      </div>

      {/* 2. Operations & Actions Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Controls */}
        <div className="bg-card-bg border border-border-color rounded-card p-5 lg:col-span-1 flex flex-col gap-4">
          <h2 className="text-xs uppercase font-extrabold tracking-wider text-text-primary mb-1">Node Power Controls</h2>
          
          <button
            onClick={() => runSystemAction("reboot")}
            disabled={actionStatus !== ""}
            className="w-full h-11 rounded-xl bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/20 text-[#EF4444] font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Power className="h-4 w-4" />
            <span>Force Reboot Cluster</span>
          </button>

          <button
            onClick={() => runSystemAction("purge")}
            disabled={actionStatus !== ""}
            className="w-full h-11 rounded-xl bg-card-bg border border-border-color hover:bg-hover-bg text-text-secondary hover:text-text-primary font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>Purge Redis Cache</span>
          </button>

          <button
            onClick={() => runSystemAction("maintenance")}
            disabled={actionStatus !== ""}
            className="w-full h-11 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Toggle Maintenance Lock</span>
          </button>
        </div>

        {/* Real-time System Console Logs (Telemetry stdout) */}
        <div className="bg-card-bg border border-border-color rounded-card p-5 lg:col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border-color/60 pb-2">
            <h2 className="text-xs uppercase font-extrabold tracking-wider text-text-primary">System Telemetry Log Stream</h2>
            <span className="text-[9px] font-mono text-text-muted">stdout_stream</span>
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
