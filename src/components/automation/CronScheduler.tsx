"use client";
import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Play, 
  Pause, 
  Trash2, 
  Globe, 
  Layers, 
  AlertCircle,
  Plus,
  Sliders,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SchedulerProps {
  schedules: any[];
  onToggleStatus: (id: number) => void;
  onTriggerImmediate: (id: number) => void;
  onDeleteSchedule: (id: number) => void;
}

export function CronScheduler({
  schedules,
  onToggleStatus,
  onTriggerImmediate,
  onDeleteSchedule
}: SchedulerProps) {
  const [activeView, setActiveView] = useState("table"); // calendar, timeline, table
  const [timezone, setTimezone] = useState("UTC (GMT +00:00)");
  const [timezoneOpen, setTimezoneOpen] = useState(false);

  const timezones = [
    "UTC (GMT +00:00)",
    "EST (GMT -05:00) New York",
    "PST (GMT -08:00) Los Angeles",
    "CET (GMT +01:00) Paris",
    "IST (GMT +05:30) Mumbai",
    "JST (GMT +09:00) Tokyo"
  ];

  return (
    <div className="flex flex-col gap-6 animate-fadeIn text-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-color/60 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-[#8B5CF6]" />
            <span>Automation Scheduler</span>
          </h1>
          <p className="text-xs text-[#8D96A7] mt-1">Configure and manage recurring execution cycles and calendar crons.</p>
        </div>

        {/* View Switcher */}
        <div className="flex bg-[#16181D]/30 border border-border-color p-1 rounded-xl">
          {["calendar", "timeline", "table"].map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={cn(
                "px-3.5 py-1.5 text-[10px] font-bold rounded-lg capitalize transition-colors cursor-pointer",
                activeView === view ? "bg-primary text-white" : "text-[#8D96A7] hover:text-white"
              )}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Timezone banner controls */}
      <div className="p-4 bg-card-bg border border-border-color rounded-card flex items-center justify-between shadow-card text-xs flex-wrap gap-3 relative">
        <div className="flex items-center gap-2 text-[#B7BDC8]">
          <Globe className="h-4.5 w-4.5 text-[#8D96A7]" />
          <span>Active Scheduler Timezone:</span>
          <span className="font-bold text-white bg-[#16181D] border border-border-color px-2.5 py-1 rounded-lg">
            {timezone}
          </span>
        </div>
        
        <button 
          onClick={() => setTimezoneOpen(!timezoneOpen)}
          className="text-[10px] text-primary hover:underline font-bold cursor-pointer"
        >
          Modify Timezone
        </button>

        {timezoneOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setTimezoneOpen(false)} />
            <div className="absolute right-4 top-14 w-52 bg-[#15171C] border border-border-color rounded-xl shadow-xl z-20 py-1 text-left animate-fadeIn">
              {timezones.map((tz) => (
                <button
                  key={tz}
                  onClick={() => {
                    setTimezone(tz);
                    setTimezoneOpen(false);
                  }}
                  className={cn(
                    "w-full px-3.5 py-2 text-[10px] text-[#B7BDC8] hover:bg-hover-bg hover:text-white transition-colors text-left font-bold cursor-pointer",
                    timezone === tz && "text-primary hover:text-primary"
                  )}
                >
                  {tz}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Main Viewport */}
      <div className="bg-card-bg border border-border-color rounded-card p-5 shadow-card min-h-[300px]">
        {activeView === "table" && (
          <div className="overflow-x-auto">
            {schedules.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-color/60 text-[#8D96A7] font-bold uppercase tracking-wider text-[9px]">
                    <th className="pb-3 pl-2">Job Workflow</th>
                    <th className="pb-3">Cron Rule</th>
                    <th className="pb-3">Last Run Status</th>
                    <th className="pb-3">Next Scheduled</th>
                    <th className="pb-3 text-center">Success Rate</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color/40">
                  {schedules.map((job) => (
                    <tr key={job.id} className="hover:bg-[#16181D]/30 transition-colors">
                      <td className="py-4 pl-2 font-bold text-white text-left">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "h-2 w-2 rounded-full",
                            job.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-neutral-600"
                          )} />
                          <span>{job.workflowName}</span>
                        </div>
                      </td>
                      <td className="py-4 font-mono text-[#B7BDC8]">{job.cron}</td>
                      <td className="py-4 text-[#B7BDC8]">
                        <span className="text-[10px] font-semibold">{job.lastRun}</span>
                      </td>
                      <td className="py-4 text-white font-semibold">{job.nextRun}</td>
                      <td className="py-4 text-center font-bold font-mono text-emerald-500">
                        {job.successRate}
                      </td>
                      <td className="py-4 text-right pr-2">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onTriggerImmediate(job.id)}
                            className="p-1.5 rounded-lg border border-border-color/80 bg-[#16181D] hover:bg-hover-bg text-[#8D96A7] hover:text-white transition-colors cursor-pointer"
                            title="Execute Immediately"
                          >
                            <Play className="h-3.5 w-3.5 fill-current text-emerald-500" />
                          </button>
                          <button
                            onClick={() => onToggleStatus(job.id)}
                            className={cn(
                              "px-2.5 py-1.5 rounded-lg border font-semibold text-[10px] inline-flex items-center gap-1 transition-colors cursor-pointer",
                              job.status === "Active"
                                ? "border-border-color hover:bg-hover-bg text-[#B7BDC8] hover:text-amber-500"
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
                                <Play className="h-3 w-3 fill-current text-white-force" />
                                <span className="text-white-force">Resume</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => onDeleteSchedule(job.id)}
                            className="p-1.5 rounded-lg border border-border-color/80 bg-[#16181D] hover:bg-rose-500/10 text-[#8D96A7] hover:text-rose-500 transition-colors cursor-pointer"
                            title="Delete Schedule"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-[#8D96A7]">
                <Clock className="h-8 w-8 mb-4 text-[#2C313C]" />
                <span>No scheduled automations found. Create workflows with schedule triggers to see them here.</span>
              </div>
            )}
          </div>
        )}

        {activeView === "calendar" && (
          <div className="flex flex-col gap-4 text-left">
            <div className="flex items-center justify-between border-b border-border-color/60 pb-3 mb-2">
              <span className="font-bold text-white text-xs">Calendar Execution Forecast</span>
              <div className="flex items-center gap-2">
                <button className="p-1 rounded hover:bg-hover-bg text-[#8D96A7]"><ChevronLeft className="h-4 w-4" /></button>
                <span className="font-bold text-white">July 2026</span>
                <button className="p-1 rounded hover:bg-hover-bg text-[#8D96A7]"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
            {/* Grid Calendar representation */}
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-semibold text-[#8D96A7]">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <span key={d} className="pb-1">{d}</span>)}
              {Array.from({ length: 31 }, (_, i) => {
                const day = i + 1;
                const hasEvent = day === 12 || day === 13 || day === 18 || day === 24;
                return (
                  <div key={day} className={cn(
                    "h-14 rounded-xl border border-border-color/50 bg-[#16181D]/10 p-1 flex flex-col justify-between hover:border-primary/40 cursor-pointer transition-all",
                    day === 12 && "border-primary bg-primary/5"
                  )}>
                    <span className={cn("text-left font-mono font-bold", day === 12 ? "text-primary" : "text-white")}>{day}</span>
                    {hasEvent && (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[7px] py-0.5 px-1 rounded block truncate w-full text-center font-extrabold uppercase">
                        {day === 12 ? "4 Runs Scheduled" : "Sync CRM"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeView === "timeline" && (
          <div className="flex flex-col gap-4 text-left">
            <span className="font-bold text-white text-xs border-b border-border-color/60 pb-3">Cron Cycle Timeline Gantt Chart</span>
            <div className="flex flex-col gap-3 mt-2">
              {schedules.map((job) => (
                <div key={job.id} className="flex items-center gap-4">
                  <span className="w-40 font-bold text-white truncate">{job.workflowName}</span>
                  <div className="flex-1 h-5 bg-[#16181D] border border-border-color rounded-lg relative overflow-hidden flex items-center">
                    <span className="absolute inset-y-0 left-0 bg-primary/10 border-r border-primary/20 w-1/4" />
                    <span className="absolute inset-y-0 left-[45%] bg-[#8B5CF6]/10 border-x border-[#8B5CF6]/20 w-[10%]" />
                    <span className="absolute inset-y-0 left-[75%] bg-cyan-500/10 border-x border-cyan-500/20 w-[15%]" />
                    <span className="text-[7px] font-mono text-[#8D96A7] ml-2 font-bold uppercase">{job.cron} (Time scale forecast)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
