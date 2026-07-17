"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Bot, 
  Activity, 
  CheckSquare, 
  ShieldCheck, 
  MessageSquare, 
  Search, 
  Wrench, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Layers, 
  ArrowUpRight, 
  FileText, 
  Sparkles,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

export default function AIOperationsDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [realStats, setRealStats] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [approvalsCount, setApprovalsCount] = useState(0);
  const [tasksCount, setTasksCount] = useState(0);

  // Mock data fallbacks for full dashboard richness
  const mockStats = {
    totalAgents: 8,
    runningAgents: 5,
    pendingTasks: 12,
    approvalsWaiting: 4,
    todayConversations: 142,
    knowledgeSearches: 850,
    toolCalls: 1240,
    avgResponseTime: "1.24s",
    dailyCost: "$12.45",
    successRate: "98.4%",
    activities: [
      { id: 1, agent: "Developer AI", action: "answered query", time: "2 mins ago", desc: "Generated Django integration codes for core API." },
      { id: 2, agent: "Marketing AI", action: "generated campaign", time: "15 mins ago", desc: "Drafted summer sale copy across Twitter and email templates." },
      { id: 3, agent: "Approval System", action: "requested review", time: "30 mins ago", desc: "SQL Tool write query request requires human check." },
      { id: 4, agent: "Knowledge Crawler", action: "updated collections", time: "1 hour ago", desc: "Ingested 14 new policy documents into vector storage." },
      { id: 5, agent: "Support AI", action: "saved memory", time: "2 hours ago", desc: "Logged preference: Customer 'Enterprise Client' prefers REST over GraphQL." },
      { id: 6, agent: "HR Recruiter AI", action: "executed workflow", time: "3 hours ago", desc: "Triggered resume scanning job for backend engineer candidates." }
    ]
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [agentsRes, approvalsRes, tasksRes, analyticsRes] = await Promise.all([
        apiClient.aiAgents.listAgents().catch(() => ({ data: [] })),
        apiClient.operations.listApprovals({ status: "pending" }).catch(() => ({ data: [] })),
        apiClient.operations.listTasks({ status: "pending" }).catch(() => ({ data: [] })),
        apiClient.operations.getAnalyticsOverview().catch(() => ({ data: null }))
      ]);

      setAgents(agentsRes.data || []);
      setApprovalsCount(approvalsRes.data?.length || 0);
      setTasksCount(tasksRes.data?.length || 0);

      if (analyticsRes.data) {
        setRealStats(analyticsRes.data);
      }
    } catch (err) {
      console.error("Failed to load operations dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalAgents = loading ? "..." : (agents.length || mockStats.totalAgents);
  const runningAgents = loading ? "..." : (Math.max(1, Math.floor(agents.length * 0.7)) || mockStats.runningAgents);
  const pendingTasks = loading ? "..." : (tasksCount || mockStats.pendingTasks);
  const approvalsWaiting = loading ? "..." : (approvalsCount || mockStats.approvalsWaiting);
  const todayConversations = loading ? "..." : (realStats?.token_usage?.total_tokens ? Math.floor(realStats.token_usage.total_tokens / 8000) || mockStats.todayConversations : mockStats.todayConversations);
  const toolCalls = loading ? "..." : (realStats?.tool_metrics?.total_executions || mockStats.toolCalls);
  const avgResponseTime = loading ? "..." : (realStats?.performance?.avg_latency_ms ? `${(realStats.performance.avg_latency_ms / 1000).toFixed(2)}s` : mockStats.avgResponseTime);
  const dailyCost = loading ? "..." : (realStats?.cost_metrics?.total_cost ? `$${realStats.cost_metrics.total_cost.toFixed(2)}` : mockStats.dailyCost);
  const successRate = loading ? "..." : (realStats?.tool_metrics?.success_rate ? `${realStats.tool_metrics.success_rate}%` : mockStats.successRate);

  const kpis = [
    { label: "Total AI Agents", value: totalAgents, icon: <Bot className="text-purple-400 h-5 w-5" />, desc: "Registered AI workers" },
    { label: "Running Agents", value: runningAgents, icon: <Activity className="text-emerald-400 h-5 w-5" />, desc: "Active event-loops" },
    { label: "Pending Tasks", value: pendingTasks, icon: <CheckSquare className="text-amber-400 h-5 w-5" />, desc: "AI-delegated backlog" },
    { label: "Approvals Waiting", value: approvalsWaiting, icon: <ShieldCheck className="text-red-400 h-5 w-5" />, desc: "Human confirmation gate" },
    { label: "Today's Conversations", value: todayConversations, icon: <MessageSquare className="text-pink-400 h-5 w-5" />, desc: "Active threads" },
    { label: "Knowledge Searches", value: mockStats.knowledgeSearches, icon: <Search className="text-blue-400 h-5 w-5" />, desc: "Vector indexing lookups" },
    { label: "Tool Calls", value: toolCalls, icon: <Wrench className="text-cyan-400 h-5 w-5" />, desc: "API & database actions" },
    { label: "Avg Response Time", value: avgResponseTime, icon: <Clock className="text-teal-400 h-5 w-5" />, desc: "Inference response latency" },
    { label: "Daily Cost", value: dailyCost, icon: <DollarSign className="text-yellow-400 h-5 w-5" />, desc: "Aggregated provider burn" },
    { label: "Success Rate", value: successRate, icon: <TrendingUp className="text-indigo-400 h-5 w-5" />, desc: "Successful tool/agent executions" }
  ];

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 animate-fadeIn text-left text-white">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-primary/15 via-[#1a1b24] to-[#121318] border border-primary/20 rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-[radial-gradient(circle_at_top_right,var(--color-primary),transparent_65%)] opacity-20 pointer-events-none" />
        <div className="flex-1 flex flex-col gap-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider self-start animate-pulse">
            <Sparkles className="h-3 w-3" />
            AI Intelligence & Operations
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-1">AI Operations Center</h1>
          <p className="text-sm text-[#8D96A7] max-w-2xl">
            Govern, audit, monitor, and optimize your enterprise AI agents. Inspect memory retention layers, track automated Celery tasks, review approvals, and analyze operational costs.
          </p>
        </div>
        <div className="flex items-center gap-2.5 relative z-10 self-start lg:self-center">
          <button 
            onClick={loadData}
            className="p-2.5 rounded-xl bg-[#1d1f27] border border-border-color text-[#8D96A7] hover:text-white hover:bg-[#252833] transition-colors cursor-pointer"
            title="Refresh Operations"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-primary' : ''}`} />
          </button>
          <Link href="/operations/governance" className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 cursor-pointer whitespace-nowrap text-white-force">
            Configure Policies
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => (
          <div 
            key={idx} 
            className="bg-[#16181D] border border-border-color/60 hover:border-border-color rounded-xl p-4.5 transition-all duration-200 flex flex-col gap-2 relative overflow-hidden group shadow-sm hover:shadow"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider truncate max-w-[80%]">{kpi.label}</span>
              <div className="p-1.5 rounded-lg bg-[#111216] border border-border-color group-hover:scale-105 transition-transform duration-200">
                {kpi.icon}
              </div>
            </div>
            <div className="flex flex-col mt-1">
              <span className="text-xl md:text-2xl font-black text-white tracking-tight">{kpi.value}</span>
              <span className="text-[9px] text-[#5b6375] font-semibold truncate mt-0.5">{kpi.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts & Live Feed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Visual Operational Performance Charts */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Main Visual SVG Chart Panel */}
          <div className="bg-[#16181D] border border-border-color rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#1c1e24] pb-4">
              <div>
                <h3 className="text-xs font-black text-white tracking-wider uppercase">AI Agent Usage & Cost Trends</h3>
                <p className="text-[10px] text-[#8D96A7] mt-0.5">Execution volume vs dollar cost over last 6 days.</p>
              </div>
              <div className="flex items-center gap-3 text-[9px] font-bold">
                <span className="flex items-center gap-1.5 text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Calls (x100)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Cost ($)
                </span>
              </div>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="h-56 w-full relative mt-2 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="primary-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="emerald-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="50" y1="20" x2="550" y2="20" stroke="#1d202a" strokeWidth="1" strokeDasharray="3" />
                <line x1="50" y1="70" x2="550" y2="70" stroke="#1d202a" strokeWidth="1" strokeDasharray="3" />
                <line x1="50" y1="120" x2="550" y2="120" stroke="#1d202a" strokeWidth="1" strokeDasharray="3" />
                <line x1="50" y1="170" x2="550" y2="170" stroke="#1d202a" strokeWidth="1" strokeDasharray="3" />
                <line x1="50" y1="210" x2="550" y2="210" stroke="#1d202a" strokeWidth="1.5" />

                {/* X Axis Labels */}
                <text x="50" y="218" fill="#5b6375" fontSize="8" textAnchor="middle">Mon</text>
                <text x="150" y="218" fill="#5b6375" fontSize="8" textAnchor="middle">Tue</text>
                <text x="250" y="218" fill="#5b6375" fontSize="8" textAnchor="middle">Wed</text>
                <text x="350" y="218" fill="#5b6375" fontSize="8" textAnchor="middle">Thu</text>
                <text x="450" y="218" fill="#5b6375" fontSize="8" textAnchor="middle">Fri</text>
                <text x="550" y="218" fill="#5b6375" fontSize="8" textAnchor="middle">Today</text>

                {/* Y Axis Labels */}
                <text x="40" y="23" fill="#5b6375" fontSize="8" textAnchor="end">1,500 / $15</text>
                <text x="40" y="73" fill="#5b6375" fontSize="8" textAnchor="end">1,000 / $10</text>
                <text x="40" y="123" fill="#5b6375" fontSize="8" textAnchor="end">500 / $5</text>
                <text x="40" y="173" fill="#5b6375" fontSize="8" textAnchor="end">100 / $1</text>

                {/* Calls Area Path */}
                <path d="M 50 170 Q 150 110 250 80 T 450 60 L 550 50 L 550 210 L 50 210 Z" fill="url(#primary-grad)" />
                {/* Calls Line */}
                <path d="M 50 170 Q 150 110 250 80 T 450 60 L 550 50" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
                
                {/* Cost Area Path */}
                <path d="M 50 190 Q 150 150 250 120 T 450 100 L 550 85 L 550 210 L 50 210 Z" fill="url(#emerald-grad)" />
                {/* Cost Line */}
                <path d="M 50 190 Q 150 150 250 120 T 450 100 L 550 85" fill="none" stroke="#10b981" strokeWidth="2" />

                {/* Data Points */}
                <circle cx="550" cy="50" r="4.5" fill="var(--color-primary)" stroke="#111" strokeWidth="2" />
                <circle cx="550" cy="85" r="4.5" fill="#10b981" stroke="#111" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Quick Metrics Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tool Execution Stats */}
            <div className="bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-3">
              <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider text-left">Top Tools Injected</span>
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] font-semibold text-white">
                    <span>SQL Query Executor</span>
                    <span>542 runs</span>
                  </div>
                  <div className="h-1.5 bg-[#111216] rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: "75%" }} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] font-semibold text-white">
                    <span>Web Search API</span>
                    <span>324 runs</span>
                  </div>
                  <div className="h-1.5 bg-[#111216] rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: "50%" }} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] font-semibold text-white">
                    <span>Corporate Email Client</span>
                    <span>212 runs</span>
                  </div>
                  <div className="h-1.5 bg-[#111216] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: "35%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Knowledge Retrieval Heat */}
            <div className="bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-3">
              <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider text-left">Knowledge Cache Success</span>
              <div className="flex items-center gap-4 justify-center py-2">
                <div className="relative h-20 w-20 flex items-center justify-center">
                  {/* Gauge */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-neutral-800"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-blue-500"
                      strokeDasharray="92, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-sm font-black text-white">92%</span>
                </div>
                <div className="flex flex-col text-left gap-1">
                  <span className="text-[11px] font-bold text-white">Vector Ingest OK</span>
                  <span className="text-[9px] text-[#8D96A7]">Avg similarity threshold: 0.81</span>
                  <span className="text-[9px] text-[#8D96A7]">Cache hits: 782 today</span>
                </div>
              </div>
            </div>

            {/* Task Completion Ratios */}
            <div className="bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-3">
              <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider text-left">AI Task Completion</span>
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center justify-between text-xs text-[#8D96A7]">
                  <span className="font-semibold text-white text-[11px]">Success rate:</span>
                  <span className="font-black text-emerald-400">98.4%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#8D96A7]">
                  <span className="font-semibold text-white text-[11px]">Avg completion:</span>
                  <span className="font-black text-white">4.2 mins</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#8D96A7]">
                  <span className="font-semibold text-white text-[11px]">Re-tries triggered:</span>
                  <span className="font-black text-amber-500">2 cases</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Live Timeline & Quick Actions */}
        <div className="flex flex-col gap-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-white tracking-wider uppercase text-left">Operational Actions</h3>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <Link href="/agents" className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#111216] hover:bg-[#181a21] border border-border-color/60 hover:border-primary/50 text-center gap-1.5 transition-all cursor-pointer">
                <Plus className="h-4.5 w-4.5 text-primary" />
                <span className="text-[10px] font-bold text-white whitespace-nowrap">Create Agent</span>
              </Link>
              <Link href="/knowledge" className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#111216] hover:bg-[#181a21] border border-border-color/60 hover:border-primary/50 text-center gap-1.5 transition-all cursor-pointer">
                <Layers className="h-4.5 w-4.5 text-blue-400" />
                <span className="text-[10px] font-bold text-white whitespace-nowrap">Assign Knowledge</span>
              </Link>
              <Link href="/operations/approvals" className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#111216] hover:bg-[#181a21] border border-border-color/60 hover:border-primary/50 text-center gap-1.5 transition-all cursor-pointer">
                <ShieldCheck className="h-4.5 w-4.5 text-red-400" />
                <span className="text-[10px] font-bold text-white whitespace-nowrap">Review Approval</span>
              </Link>
              <Link href="/operations/analytics" className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#111216] hover:bg-[#181a21] border border-border-color/60 hover:border-primary/50 text-center gap-1.5 transition-all cursor-pointer">
                <TrendingUp className="h-4.5 w-4.5 text-pink-400" />
                <span className="text-[10px] font-bold text-white whitespace-nowrap">Open Analytics</span>
              </Link>
            </div>
            <Link href="/operations/reports" className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-border-color hover:bg-hover-bg text-xs font-semibold text-[#8D96A7] hover:text-white transition-all cursor-pointer">
              <FileText className="h-4 w-4" />
              <span>Generate Audit Report</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Live Activity Timeline */}
          <div className="bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-4 flex-1">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white tracking-wider uppercase text-left">Live Activity Timeline</h3>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="System online" />
            </div>
            
            <div className="flex flex-col gap-4 mt-2 h-[280px] overflow-y-auto pr-1 scrollbar-thin">
              {mockStats.activities.map((act) => (
                <div key={act.id} className="flex gap-3 text-left relative group">
                  {act.id < mockStats.activities.length && (
                    <span className="absolute left-[9px] top-6 bottom-[-16px] w-px bg-border-color/40" />
                  )}
                  <span className="h-4.5 w-4.5 rounded-full border-2 border-primary/50 bg-[#111216] flex-shrink-0 flex items-center justify-center mt-0.5 relative z-10">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-extrabold text-white">{act.agent}</span>
                      <span className="text-[9px] text-[#5b6375] font-semibold">{act.time}</span>
                    </div>
                    <span className="text-[9px] text-primary/80 font-bold uppercase tracking-wider">{act.action}</span>
                    <p className="text-[10px] text-[#8D96A7] mt-0.5 leading-relaxed">{act.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
