"use client";
import React, { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Clock, 
  Coins, 
  Layers, 
  Settings,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("Past 7 Days");

  const STATS = [
    { label: "Total Pipeline Executions", val: "14,842 runs", delta: "+12.4%", status: "up" },
    { label: "Avg Execution Latency", val: "0.85s", delta: "-8.3%", status: "up" }, // lower latency is up (good)
    { label: "AI Usage Vector Costs", val: "$12.45", delta: "+4.1%", status: "up" },
    { label: "Token Consumption", val: "8.4M tokens", delta: "+15.2%", status: "up" },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-color/60 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">System Analytics</h1>
          <p className="text-xs text-[#8D96A7] mt-1">Monitor workflow runs, computational latency metrics, and API credits cost.</p>
        </div>

        {/* Time Filter */}
        <div className="relative">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-border-color bg-card-bg text-white focus:outline-none cursor-pointer"
          >
            <option>Past 24 Hours</option>
            <option>Past 7 Days</option>
            <option>Past 30 Days</option>
          </select>
        </div>
      </div>

      {/* KPI Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, idx) => (
          <div key={idx} className="bg-card-bg border border-border-color rounded-card p-4 shadow-card flex flex-col gap-1.5 justify-between">
            <span className="text-[9px] text-[#8D96A7] font-bold uppercase tracking-wider">{stat.label}</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-lg font-bold text-white">{stat.val}</span>
              <span className={cn(
                "text-[10px] font-bold flex items-center gap-0.5",
                stat.status === "up" ? "text-[#22C55E]" : "text-[#EF4444]"
              )}>
                {stat.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Runs success bar chart */}
        <div className="bg-card-bg border border-border-color rounded-card p-6 shadow-card flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Weekly Daily Runs</h3>
            <p className="text-[10px] text-[#8D96A7] mt-0.5">Executions split by success (Blue) and failed (Red).</p>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-44 w-full mt-2 flex items-end justify-between px-2 pt-4">
            {[
              { day: "Mon", success: 60, fail: 4 },
              { day: "Tue", success: 85, fail: 2 },
              { day: "Wed", success: 75, fail: 8 },
              { day: "Thu", success: 120, fail: 1 },
              { day: "Fri", success: 95, fail: 5 },
              { day: "Sat", success: 40, fail: 0 },
              { day: "Sun", success: 55, fail: 2 },
            ].map((bar, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                <div className="w-6 flex flex-col justify-end gap-1 h-full">
                  {/* Fail bar (Red) */}
                  {bar.fail > 0 && (
                    <div 
                      style={{ height: `${(bar.fail / 130) * 100}%` }}
                      className="bg-[#EF4444] rounded-t w-full"
                    />
                  )}
                  {/* Success bar (Blue) */}
                  <div 
                    style={{ height: `${(bar.success / 130) * 100}%` }}
                    className="bg-primary rounded-t w-full"
                  />
                </div>
                <span className="text-[9px] font-mono text-[#8D96A7]">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* API Cost line area chart */}
        <div className="bg-card-bg border border-border-color rounded-card p-6 shadow-card flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Daily Billing Incurred</h3>
            <p className="text-[10px] text-[#8D96A7] mt-0.5">Vector database and reasoning model APIs total costs.</p>
          </div>

          {/* SVG Area Line Chart */}
          <div className="h-44 w-full mt-2 relative">
            <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C4DFF" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#7C4DFF" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path 
                d="M0 140 C 80 120, 150 110, 220 70 C 300 30, 380 90, 440 40 C 470 20, 500 10, 500 10 L 500 150 L 0 150 Z" 
                fill="url(#purpleGradient)"
              />
              <path 
                d="M0 140 C 80 120, 150 110, 220 70 C 300 30, 380 90, 440 40 C 470 20, 500 10, 500 10" 
                fill="none" 
                stroke="#7C4DFF" 
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line x1="0" y1="40" x2="500" y2="40" stroke="#2C313C" strokeDasharray="3,3" opacity="0.3" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#2C313C" strokeDasharray="3,3" opacity="0.3" />
            </svg>
            <div className="absolute top-2 left-2 text-[9px] font-mono text-[#8D96A7]">$2.50 max</div>
          </div>
          
          <div className="flex items-between justify-between text-[9px] text-[#8D96A7] font-mono border-t border-border-color/40 pt-3">
            <span>Monday</span>
            <span>Wednesday</span>
            <span>Friday</span>
            <span>Sunday</span>
          </div>
        </div>
      </div>
    </div>
  );
}
