"use client";
import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Globe, 
  Sliders,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduledJob {
  id: number;
  name: string;
  cron: string;
  timezone: string;
  status: "Active" | "Paused";
  nextExecution: string;
  lastExecution: string;
  successRate: string;
}

export default function SchedulerPage() {
  const [jobs, setJobs] = useState<ScheduledJob[]>([
    { id: 1, name: "Database Backup Loop", cron: "0 0 * * * (Midnight)", timezone: "UTC", status: "Active", nextExecution: "in 8 hours", lastExecution: "16 hours ago (Success)", successRate: "100%" },
    { id: 2, name: "Daily Marketing SVG Compiler", cron: "0 9 * * * (9:00 AM)", timezone: "EST", status: "Active", nextExecution: "in 17 hours", lastExecution: "7 hours ago (Success)", successRate: "99.4%" },
    { id: 3, name: "GitHub Issues Slack Sync", cron: "*/30 * * * * (30m)", timezone: "PST", status: "Paused", nextExecution: "--", lastExecution: "2 days ago (Success)", successRate: "98.5%" },
  ]);

  const [activeView, setActiveView] = useState("table"); // calendar, timeline, table
  const [timezone, setTimezone] = useState("UTC (GMT +00:00)");

  const handleToggleJobStatus = (id: number) => {
    setJobs(prev => prev.map(job => {
      if (job.id === id) {
        return {
          ...job,
          status: job.status === "Active" ? "Paused" : "Active",
          nextExecution: job.status === "Active" ? "--" : "in 1 hour"
        };
      }
      return job;
    }));
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-color/60 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Cron Scheduler</h1>
          <p className="text-xs text-[#8D96A7] mt-1">Configure, monitor, and run recurring task pipelines at set intervals.</p>
        </div>

        {/* View Switcher */}
        <div className="flex bg-[#16181D] border border-border-color p-1 rounded-xl">
          {["calendar", "timeline", "table"].map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors",
                activeView === view ? "bg-primary text-white" : "text-[#8D96A7] hover:text-white"
              )}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Timezone banner controls */}
      <div className="p-4 bg-card-bg border border-border-color rounded-card flex items-center justify-between shadow-card text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2 text-[#B7BDC8]">
          <Globe className="h-4 w-4 text-[#8D96A7]" />
          <span>Active Scheduler Timezone:</span>
          <span className="font-bold text-white bg-[#16181D] border border-border-color px-2.5 py-1 rounded-lg">
            {timezone}
          </span>
        </div>
        <button className="text-[10px] text-primary hover:underline font-bold">
          Modify Timezone
        </button>
      </div>

      {/* Main viewport */}
      <div className="bg-card-bg border border-border-color rounded-card p-6 shadow-card min-h-[300px]">
        {activeView === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-color/60 text-[#8D96A7] font-bold uppercase tracking-wider text-[9px]">
                  <th className="pb-3 pl-2">Job Name</th>
                  <th className="pb-3">Cron Rule</th>
                  <th className="pb-3">Last Run Execution</th>
                  <th className="pb-3">Next Scheduled</th>
                  <th className="pb-3">Success Rate</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color/40">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-[#16181D]/30 transition-colors">
                    <td className="py-4 pl-2 font-bold text-white flex items-center gap-2">
                      <span className={cn(
                        "h-2 w-2 rounded-full",
                        job.status === "Active" ? "bg-[#22C55E]" : "bg-neutral-600"
                      )} />
                      {job.name}
                    </td>
                    <td className="py-4 font-mono text-[#B7BDC8]">{job.cron}</td>
                    <td className="py-4 text-[#B7BDC8]">{job.lastExecution}</td>
                    <td className="py-4 text-[#B7BDC8] font-semibold">{job.nextExecution}</td>
                    <td className="py-4 font-bold text-white">{job.successRate}</td>
                    <td className="py-4 text-right pr-2">
                      <button
                        onClick={() => handleToggleJobStatus(job.id)}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg border font-semibold text-[10px] inline-flex items-center gap-1 transition-colors",
                          job.status === "Active"
                            ? "border-border-color hover:bg-hover-bg text-[#B7BDC8] hover:text-[#8B5CF6]"
                            : "bg-primary border-transparent text-white hover:bg-primary-hover"
                        )}
                      >
                        {job.status === "Active" ? (
                          <>
                            <Pause className="h-3 w-3" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 fill-current" />
                            <span>Resume</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-[#8D96A7] text-xs">
            <CalendarIcon className="h-8 w-8 mb-4 text-[#2C313C]" />
            <span>Calendar and Timeline visualizations are available in Phase 2 pipeline integrations.</span>
          </div>
        )}
      </div>
    </div>
  );
}
