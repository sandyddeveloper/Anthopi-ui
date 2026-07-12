"use client";
import React, { useState } from "react";
import { 
  Zap, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Clock,
  LayoutGrid,
  FileCode,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Wrench
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardProps {
  workflows: any[];
  executions: any[];
  templatesCount: number;
  onTabChange: (tab: string) => void;
  onOpenWizard: () => void;
}

export function AutomationDashboard({ workflows, executions, templatesCount, onTabChange, onOpenWizard }: DashboardProps) {
  const [filterType, setFilterType] = useState<"all" | "success" | "failed">("all");

  const runningCount = workflows.filter((w) => w.status === "Running").length;
  const pausedCount = workflows.filter((w) => w.status === "Paused").length;
  const scheduledCount = workflows.filter((w) => w.status === "Scheduled").length;
  const failedCount = executions.filter((e) => e.status === "Failed").length;
  const totalCount = workflows.length;

  // Compute success rate dynamically
  const successRatePercentage = executions.length > 0 
    ? ((executions.filter(e => e.status === "Success").length / executions.length) * 100).toFixed(1)
    : "100.0";

  // Compute average duration dynamically
  const durations = executions.map(e => parseFloat(e.duration) || 0).filter(d => d > 0);
  const avgDuration = durations.length > 0 
    ? `${Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)}ms`
    : "0ms";

  // Map executions to activity timeline dynamically
  const activities = executions.map((e) => ({
    id: e.id,
    type: e.status === "Success" ? "success" : e.status === "Failed" ? "failed" : "created",
    title: e.status === "Success" ? "Execution Success" : e.status === "Failed" ? "Execution Failed" : "Execution Running",
    details: `${e.workflowName} triggered by ${e.triggeredBy} (${e.duration})`,
    time: e.started,
    flow: e.workflowName
  }));

  const filteredActivities = activities.filter((act) => {
    if (filterType === "all") return true;
    if (filterType === "success") return act.type === "success" || act.type === "created";
    return act.type === "failed";
  });

  // Distribute execution success/fails dynamically across week for chart display
  const getDailyChartData = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const results = days.map((day) => ({
      day,
      success: 0,
      fail: 0,
      heightS: "0%",
      heightF: "0%"
    }));

    // Distribute runs sequentially or by weekday name if present
    executions.forEach((e, idx) => {
      let dayIdx = new Date().getDay();
      if (e.started) {
        const lower = e.started.toLowerCase();
        if (lower.includes("mon")) dayIdx = 1;
        else if (lower.includes("tue")) dayIdx = 2;
        else if (lower.includes("wed")) dayIdx = 3;
        else if (lower.includes("thu")) dayIdx = 4;
        else if (lower.includes("fri")) dayIdx = 5;
        else if (lower.includes("sat")) dayIdx = 6;
        else if (lower.includes("sun")) dayIdx = 0;
        else {
          // Sequentially fallback to distribute
          dayIdx = idx % 7;
        }
      }
      if (e.status === "Success") {
        results[dayIdx].success++;
      } else if (e.status === "Failed") {
        results[dayIdx].fail++;
      }
    });

    // Find max value to calibrate height scale
    let max = 1;
    results.forEach((r) => {
      const tot = r.success + r.fail;
      if (tot > max) max = tot;
    });

    results.forEach((r) => {
      r.heightS = `${Math.min(95, (r.success / max) * 95)}%`;
      r.heightF = `${Math.min(95, (r.fail / max) * 95)}%`;
    });

    return results;
  };

  const chartBars = getDailyChartData();

  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-color/60 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-500 fill-amber-500/20" />
            <span>Automation Hub</span>
          </h1>
          <p className="text-xs text-[#8D96A7] mt-1">Monitor, orchestrate, and audit your organization's autonomous workflow engines.</p>
        </div>

        {/* Quick Actions Header */}
        <div className="flex gap-2">
          <button 
            onClick={onOpenWizard}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/10 transition-all cursor-pointer text-white-force"
          >
            <Plus className="h-4 w-4" />
            <span>Create Workflow</span>
          </button>
          <button 
            onClick={() => onTabChange("builder")}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl border border-border-color bg-[#16181D] text-white hover:bg-hover-bg transition-all cursor-pointer"
          >
            <span>Open Canvas Builder</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Workflows", val: totalCount, icon: <LayoutGrid className="h-4 w-4 text-primary" />, desc: "Created assets" },
          { label: "Running", val: runningCount, icon: <Play className="h-4 w-4 text-emerald-500 fill-emerald-500/10" />, desc: "Active agents" },
          { label: "Paused", val: pausedCount, icon: <Pause className="h-4 w-4 text-[#8B5CF6]" />, desc: "Standby status" },
          { label: "Scheduled", val: scheduledCount, icon: <Calendar className="h-4 w-4 text-cyan-500" />, desc: "Cron rules active" },
          { label: "Failed Runs", val: failedCount, icon: <AlertCircle className="h-4 w-4 text-rose-500" />, desc: "Logs review needed" },
          { label: "Templates", val: templatesCount, icon: <FileCode className="h-4 w-4 text-amber-500" />, desc: "Pre-built shapes" },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-card-bg border border-border-color rounded-card p-4 flex flex-col justify-between shadow-sm relative group hover:border-primary/30 transition-all duration-200">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">{kpi.label}</span>
              <div className="p-1.5 rounded-lg bg-[#16181D]/80 border border-border-color/40">
                {kpi.icon}
              </div>
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight">{kpi.val}</span>
              <p className="text-[9px] text-[#8D96A7] mt-0.5">{kpi.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Quick Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Execution Success Rate Chart */}
        <div className="lg:col-span-2 bg-card-bg border border-border-color rounded-card p-5 shadow-card flex flex-col justify-between min-h-[340px]">
          <div className="flex items-center justify-between border-b border-border-color/60 pb-3 mb-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Daily Workflow Executions</h3>
              <p className="text-[10px] text-[#8D96A7] mt-0.5">Success and failed runs over the last 7 days</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[#8D96A7] font-semibold">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Success</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-rose-500" /> Failed</span>
            </div>
          </div>

          {/* SVG Custom High-Fidelity Chart */}
          <div className="flex-1 flex items-end justify-between h-44 px-2 relative border-b border-border-color/40 pb-2">
            {/* Grid Lines */}
            <div className="absolute inset-x-0 top-0 h-px bg-border-color/10" />
            <div className="absolute inset-x-0 top-1/3 h-px bg-border-color/10" />
            <div className="absolute inset-x-0 top-2/3 h-px bg-border-color/10" />

            {/* Bars */}
            {chartBars.map((bar, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 w-[11%] group cursor-pointer">
                {/* Visual Bar Container */}
                <div className="w-full flex justify-center gap-0.5 items-end h-32 relative">
                  <div 
                    style={{ height: bar.heightS }}
                    className="w-3 rounded-t-sm bg-primary group-hover:opacity-90 transition-all duration-300 relative"
                  >
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black border border-border-color text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                      {bar.success} Runs
                    </span>
                  </div>
                  <div 
                    style={{ height: bar.heightF }}
                    className="w-3 rounded-t-sm bg-rose-500 group-hover:opacity-90 transition-all duration-300 relative"
                  >
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black border border-border-color text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                      {bar.fail} Fails
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#8D96A7]">{bar.day}</span>
              </div>
            ))}
          </div>

          {/* Metric Bottom Row */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border-color/40 text-center">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#8D96A7]">Success Rate</span>
              <span className="text-sm font-extrabold text-emerald-500 flex items-center gap-1 justify-center mt-1">
                <ShieldCheck className="h-4 w-4" /> {successRatePercentage}%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-white flex items-center gap-1 justify-center mt-1">
                <Clock className="h-4 w-4 text-[#8D96A7]" /> {avgDuration}
              </span>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#8D96A7] mt-0.5">Avg Execution Time</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-primary flex items-center gap-1 justify-center mt-1">
                <TrendingUp className="h-4 w-4" /> {executions.length > 0 ? "+15.2%" : "0.0%"}
              </span>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#8D96A7] mt-0.5">Trend Direction</span>
            </div>
          </div>
        </div>

        {/* Quick Automation Actions Panel */}
        <div className="bg-card-bg border border-border-color rounded-card p-5 shadow-card flex flex-col justify-between min-h-[340px]">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-border-color/60 pb-3 mb-4">Quick Actions</h3>

          <div className="flex-1 flex flex-col gap-3">
            {[
              { title: "Create Custom Workflow", desc: "Build automated logic from scratch", action: onOpenWizard, icon: <Plus className="h-4.5 w-4.5 text-primary" /> },
              { title: "Browse Templates", desc: "Import pre-configured AI integrations", action: () => onTabChange("templates"), icon: <FileCode className="h-4.5 w-4.5 text-amber-500" /> },
              { title: "Manage Scheduled Jobs", desc: "Review calendar execution loops", action: () => onTabChange("scheduler"), icon: <Calendar className="h-4.5 w-4.5 text-cyan-500" /> },
              { title: "Configure Global Variables", desc: "Edit workflow environment credentials", action: () => onTabChange("variables"), icon: <Wrench className="h-4.5 w-4.5 text-[#8B5CF6]" /> }
            ].map((btn, idx) => (
              <button 
                key={idx}
                onClick={btn.action}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border-color/50 bg-[#16181D]/30 hover:bg-hover-bg text-left hover:border-primary/20 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#16181D] border border-border-color">
                    {btn.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-primary transition-colors">{btn.title}</h4>
                    <p className="text-[10px] text-[#8D96A7] mt-0.5">{btn.desc}</p>
                  </div>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-[#8D96A7] group-hover:text-white transition-colors" />
              </button>
            ))}
          </div>

          <div className="bg-[#16181D]/40 border border-border-color/60 rounded-xl p-3.5 flex items-center gap-2 mt-4 text-[10px] text-[#8D96A7]">
            <Zap className="h-4.5 w-4.5 text-amber-500 flex-shrink-0 animate-pulse" />
            <span>Currently running <strong>{runningCount} workflows</strong> with webhook events processing in real-time.</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline & Health */}
      <div className="bg-card-bg border border-border-color rounded-card p-5 shadow-card flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-color/60 pb-3">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live System Activity</h3>
            <p className="text-[10px] text-[#8D96A7] mt-0.5">Real-time actions, integrations, and logic evaluations</p>
          </div>

          {/* Activity Filters */}
          <div className="flex bg-[#16181D] border border-border-color p-0.5 rounded-lg text-[10px]">
            {[
              { type: "all", label: "All Events" },
              { type: "success", label: "Success" },
              { type: "failed", label: "Fails & Errors" }
            ].map((btn) => (
              <button
                key={btn.type}
                onClick={() => setFilterType(btn.type as any)}
                className={cn(
                  "px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer",
                  filterType === btn.type ? "bg-primary text-white" : "text-[#8D96A7] hover:text-white"
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Timeline List */}
        <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((act, idx) => (
              <div key={idx} className="flex items-start gap-4 p-3 rounded-xl hover:bg-[#16181D]/30 transition-all border border-transparent hover:border-border-color/30 group">
                {/* Timeline Icon */}
                <div className="mt-0.5 flex-shrink-0">
                  {act.type === "success" && (
                    <span className="h-6.5 w-6.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    </span>
                  )}
                  {act.type === "failed" && (
                    <span className="h-6.5 w-6.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center animate-pulse">
                      <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                    </span>
                  )}
                  {act.type === "created" && (
                    <span className="h-6.5 w-6.5 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                      <Play className="h-3.5 w-3.5 text-primary" />
                    </span>
                  )}
                </div>

                {/* Timeline Content */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 text-xs">
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-white flex items-center gap-2">
                      {act.title}
                      <span className="text-[9px] font-semibold text-[#8D96A7] bg-[#16181D] px-2 py-0.5 rounded border border-border-color/50">
                        {act.flow}
                      </span>
                    </span>
                    <span className="text-[10px] text-[#B7BDC8] mt-0.5">{act.details}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#8D96A7] font-semibold whitespace-nowrap">{act.time}</span>
                    <button 
                      onClick={() => onTabChange("executions")}
                      className="p-1 rounded bg-[#16181D] border border-border-color text-[#8D96A7] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-xs text-[#8D96A7] italic">
              No matching activity events found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
