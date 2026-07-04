"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Bot, 
  Folder, 
  Zap, 
  BookOpen, 
  Link2, 
  MessageSquare, 
  Activity, 
  CheckSquare, 
  Calendar, 
  Clock, 
  HardDrive, 
  Cpu, 
  Sparkles, 
  ArrowUpRight, 
  Plus, 
  Play, 
  Users,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  
  // Local state for interactive checkboxes
  const [tasks, setTasks] = useState([
    { id: 1, text: "Verify GitHub webhook payload integration", done: true },
    { id: 2, text: "Attach medical literature folder to PubMed agent", done: false },
    { id: 3, text: "Authorize Slack notification token sandbox", done: false },
    { id: 4, text: "Inspect memory capacity usage statistics", done: true },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const QUICK_ACTIONS = [
    { label: "Create Project", href: "/projects", icon: <Folder className="h-4 w-4" /> },
    { label: "Create Agent", href: "/agents", icon: <Bot className="h-4 w-4" /> },
    { label: "New Automation", href: "/automations", icon: <Zap className="h-4 w-4" /> },
    { label: "Upload Knowledge", href: "/knowledge", icon: <BookOpen className="h-4 w-4" /> },
    { label: "Connect Integration", href: "/integrations", icon: <Link2 className="h-4 w-4" /> },
    { label: "Start Chat", href: "/chat", icon: <MessageSquare className="h-4 w-4" /> },
  ];

  const RECENT_RUNS = [
    { name: "Sync GitHub Issues to ClickUp", time: "2 min ago", status: "Running", color: "text-[#22C55E]" },
    { name: "Ingest CSV to Vector DB", time: "15 min ago", status: "Scheduled", color: "text-primary" },
    { name: "Compile Daily Analytics PDF", time: "1 hour ago", status: "Failed", color: "text-[#EF4444]" },
    { name: "Notify Slack on New Lead", time: "3 hours ago", status: "Paused", color: "text-[#8B5CF6]" },
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full animate-fadeIn">
      {/* Welcome Card & Org Overview */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        <div className="flex-1 bg-card-bg border border-border-color rounded-card p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-card">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
          <div className="flex flex-col gap-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] text-primary font-bold uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              <span>Acme Workspace Active</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
              Good afternoon, John Doe.
            </h1>
            <p className="text-xs text-[#B7BDC8] leading-relaxed max-w-xl">
              Synapse OS is orchestrating your automated workloads. You have 4 running pipelines, 3 active AI agent sessions, and 12 integrations synced.
            </p>
          </div>
          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border-color/60 relative z-10 text-[10px] text-[#8D96A7]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
              Workspace Status: Healthy
            </span>
            <span>•</span>
            <span>Billing Plan: Enterprise Pro</span>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="w-full lg:w-80 bg-card-bg border border-border-color rounded-card p-6 shadow-card flex flex-col gap-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                className="flex items-center gap-2 p-3 text-left rounded-xl border border-border-color hover:border-primary/20 bg-[#16181D]/60 hover:bg-hover-bg text-[#B7BDC8] hover:text-white transition-all duration-150 group"
              >
                <span className="text-[#8D96A7] group-hover:text-primary transition-colors">
                  {action.icon}
                </span>
                <span className="text-[10px] font-semibold">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Stats widgets grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card-bg border border-border-color rounded-card p-4 flex items-center justify-between shadow-card">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-[#8D96A7] font-bold uppercase tracking-wider">Workspace Projects</span>
            <span className="text-lg font-bold text-white">8</span>
          </div>
          <div className="p-2 bg-[#16181D] border border-border-color rounded-lg text-primary">
            <Folder className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="bg-card-bg border border-border-color rounded-card p-4 flex items-center justify-between shadow-card">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-[#8D96A7] font-bold uppercase tracking-wider">AI Employee Status</span>
            <span className="text-lg font-bold text-white">3 Active</span>
          </div>
          <div className="p-2 bg-[#16181D] border border-border-color rounded-lg text-secondary">
            <Bot className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="bg-card-bg border border-border-color rounded-card p-4 flex items-center justify-between shadow-card">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-[#8D96A7] font-bold uppercase tracking-wider">Completed Automations</span>
            <span className="text-lg font-bold text-white">2,842</span>
          </div>
          <div className="p-2 bg-[#16181D] border border-border-color rounded-lg text-[#22C55E]">
            <Zap className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="bg-card-bg border border-border-color rounded-card p-4 flex items-center justify-between shadow-card">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-[#8D96A7] font-bold uppercase tracking-wider">Success Rate</span>
            <span className="text-lg font-bold text-white">99.1%</span>
          </div>
          <div className="p-2 bg-[#16181D] border border-border-color rounded-lg text-cyan-400">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>

      {/* Main Widgets layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Runs Activity & Analytics */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Simulated chart card */}
          <div className="bg-card-bg border border-border-color rounded-card p-6 shadow-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Automation Success Curve</h3>
                <p className="text-[10px] text-[#8D96A7] mt-0.5">Calculated over past 24 hours of executions.</p>
              </div>
              <span className="text-[10px] font-mono text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full border border-[#22C55E]/20">
                +14.2% today
              </span>
            </div>
            
            {/* SVG Minimalist Area/Line Chart */}
            <div className="h-44 w-full mt-2 relative">
              <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2F81F7" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#2F81F7" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {/* Area under curve */}
                <path 
                  d="M0 130 C 50 110, 100 120, 150 90 C 200 60, 250 80, 300 40 C 350 10, 400 40, 450 20 C 480 10, 500 5, 500 5 L 500 150 L 0 150 Z" 
                  fill="url(#chartGradient)"
                />
                {/* Smooth stroke line */}
                <path 
                  d="M0 130 C 50 110, 100 120, 150 90 C 200 60, 250 80, 300 40 C 350 10, 400 40, 450 20 C 480 10, 500 5, 500 5" 
                  fill="none" 
                  stroke="#2F81F7" 
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Reference Grid lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#2C313C" strokeDasharray="3,3" opacity="0.3" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="#2C313C" strokeDasharray="3,3" opacity="0.3" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="#2C313C" strokeDasharray="3,3" opacity="0.3" />
              </svg>
            </div>
            
            {/* Chart legend / labels */}
            <div className="flex items-center justify-between text-[9px] text-[#8D96A7] font-mono border-t border-border-color/40 pt-3">
              <span>08:00 AM</span>
              <span>12:00 PM</span>
              <span>04:00 PM</span>
              <span>08:00 PM</span>
              <span>12:00 AM</span>
            </div>
          </div>

          {/* Running automations list */}
          <div className="bg-card-bg border border-border-color rounded-card p-6 shadow-card flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border-color/60 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Running Workloads</h3>
              <button 
                onClick={() => router.push("/automations")}
                className="text-[10px] text-primary hover:underline flex items-center gap-1 font-semibold"
              >
                <span>All Automations</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {RECENT_RUNS.map((run, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-border-color/50 bg-[#16181D]/30 hover:bg-[#16181D]/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#16181D] border border-border-color flex items-center justify-center text-primary">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-white">{run.name}</span>
                      <span className="text-[9px] text-[#8D96A7]">{run.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn("text-[9px] font-mono uppercase font-bold", run.color)}>
                      {run.status}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-[#8D96A7]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks, Resource Storage, and Scheduler */}
        <div className="flex flex-col gap-6">
          {/* Today's Tasks checklist */}
          <div className="bg-card-bg border border-border-color rounded-card p-6 shadow-card flex flex-col gap-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Today's Setup Tasks</h3>
            <div className="flex flex-col gap-3">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <div className={cn(
                    "mt-0.5 h-4 w-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors duration-150",
                    task.done 
                      ? "bg-primary border-primary text-white" 
                      : "border-[#2C313C] bg-[#16181D] group-hover:border-primary/40"
                  )}>
                    {task.done && <span className="text-[9px] font-bold">✓</span>}
                  </div>
                  <span className={cn(
                    "text-xs leading-tight transition-colors",
                    task.done ? "text-[#8D96A7] line-through" : "text-[#B7BDC8] group-hover:text-white"
                  )}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Storage Quota widget */}
          <div className="bg-card-bg border border-border-color rounded-card p-6 shadow-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Vector Storage</h3>
              <HardDrive className="h-4 w-4 text-[#8D96A7]" />
            </div>
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex justify-between text-[10px] text-[#B7BDC8]">
                <span>Chunk Cache Memory</span>
                <span className="font-mono text-white">1.2 GB / 2.0 GB</span>
              </div>
              {/* Progress bar */}
              <div className="h-2 w-full bg-[#16181D] border border-border-color rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary w-[60%] rounded-full" />
              </div>
            </div>
            <p className="text-[9px] text-[#8D96A7] leading-relaxed">
              Quota reset scheduled in 12 days. Check Vector indexing tools to clear cache manually.
            </p>
          </div>

          {/* Upcoming Scheduler jobs list */}
          <div className="bg-card-bg border border-border-color rounded-card p-6 shadow-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Scheduled Runs</h3>
              <Calendar className="h-4 w-4 text-[#8D96A7]" />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 text-xs">
                <Clock className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-white leading-tight">Database Backup</span>
                  <span className="text-[9px] text-[#8D96A7] font-mono">CRON: 0 0 * * * (Midnight)</span>
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                <Clock className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-white leading-tight">Marketing Lead Digest</span>
                  <span className="text-[9px] text-[#8D96A7] font-mono">CRON: */30 * * * * (30m)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
