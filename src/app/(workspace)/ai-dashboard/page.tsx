"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Bot, 
  MessageSquare, 
  BookOpen, 
  TrendingUp, 
  Cpu, 
  DollarSign, 
  Plus, 
  Zap, 
  Database, 
  ArrowUpRight, 
  Activity, 
  Sparkles,
  Server
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

export default function AIDashboard() {
  const router = useRouter();

  // Integrated stats states
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: "AI Agents", value: "0 Active", change: "System pool", icon: <Bot className="h-5 w-5 text-purple-400" />, color: "from-purple-500/10 to-purple-500/0 border-purple-500/20" },
    { label: "Active Conversations", value: "0 Sessions", change: "Conversations thread", icon: <MessageSquare className="h-5 w-5 text-emerald-400" />, color: "from-emerald-500/10 to-emerald-500/0 border-emerald-500/20" },
    { label: "Knowledge Collections", value: "0 Collections", change: "Context stores", icon: <BookOpen className="h-5 w-5 text-blue-400" />, color: "from-blue-500/10 to-blue-500/0 border-blue-500/20" },
    { label: "Messages Sent", value: "0", change: "Logged throughput", icon: <TrendingUp className="h-5 w-5 text-pink-400" />, color: "from-pink-500/10 to-pink-500/0 border-pink-500/20" },
    { label: "Token Usage", value: "0", change: "Cumulative volume", icon: <Cpu className="h-5 w-5 text-amber-400" />, color: "from-amber-500/10 to-amber-500/0 border-amber-500/20" },
    { label: "Estimated Cost", value: "$0.00", change: "Calculated burns", icon: <DollarSign className="h-5 w-5 text-cyan-400" />, color: "from-cyan-500/10 to-cyan-500/0 border-cyan-500/20" }
  ]);

  const [activities, setActivities] = useState<any[]>([]);
  const [popularAgents, setPopularAgents] = useState<any[]>([]);
  const [usedTools, setUsedTools] = useState<any[]>([]);
  const [hasUsageHistory, setHasUsageHistory] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const [agentsRes, convsRes, kbRes, usageRes, toolsRes] = await Promise.all([
          apiClient.aiAgents.listAgents().catch(() => ({ data: [] })),
          apiClient.aiChat.listConversations().catch(() => ({ data: [] })),
          apiClient.knowledgeCollections.listCollections().catch(() => ({ data: [] })),
          apiClient.aiChat.listUsage().catch(() => ({ data: [] })),
          apiClient.aiAgents.listTools().catch(() => ({ data: [] }))
        ]);

        const activeAgentsCount = agentsRes.data?.length || 0;
        const activeConvsCount = convsRes.data?.length || 0;
        const kbCollectionsCount = kbRes.data?.length || 0;

        // Sum token metrics from usage logs
        let totalTokens = 0;
        let totalCost = 0;
        let totalMessages = 0;
        if (Array.isArray(usageRes.data) && usageRes.data.length > 0) {
          setHasUsageHistory(true);
          usageRes.data.forEach((u: any) => {
            totalTokens += (u.total_tokens || 0);
            totalCost += parseFloat(u.cost || 0);
            totalMessages += (u.message_count || 1);
          });
        } else {
          // If no usage, messages is calculated from last message count in active chats
          if (Array.isArray(convsRes.data)) {
            convsRes.data.forEach((c: any) => {
              if (c.last_message) totalMessages += 1;
            });
          }
        }

        setStats([
          { label: "AI Agents", value: `${activeAgentsCount} Active`, change: `System pool`, icon: <Bot className="h-5 w-5 text-purple-400" />, color: "from-purple-500/10 to-purple-500/0 border-purple-500/20" },
          { label: "Active Conversations", value: `${activeConvsCount} Sessions`, change: `Conversations thread`, icon: <MessageSquare className="h-5 w-5 text-emerald-400" />, color: "from-emerald-500/10 to-emerald-500/0 border-emerald-500/20" },
          { label: "Knowledge Collections", value: `${kbCollectionsCount} Collections`, change: `Context stores`, icon: <BookOpen className="h-5 w-5 text-blue-400" />, color: "from-blue-500/10 to-blue-500/0 border-blue-500/20" },
          { label: "Messages Sent", value: String(totalMessages), change: `Logged throughput`, icon: <TrendingUp className="h-5 w-5 text-pink-400" />, color: "from-pink-500/10 to-pink-500/0 border-pink-500/20" },
          { label: "Token Usage", value: totalTokens > 0 ? `${(totalTokens / 1000).toFixed(0)}k` : "0", change: `Cumulative volume`, icon: <Cpu className="h-5 w-5 text-amber-400" />, color: "from-amber-500/10 to-amber-500/0 border-amber-500/20" },
          { label: "Estimated Cost", value: totalCost > 0 ? `$${totalCost.toFixed(2)}` : "$0.00", change: `Calculated burns`, icon: <DollarSign className="h-5 w-5 text-cyan-400" />, color: "from-cyan-500/10 to-cyan-500/0 border-cyan-500/20" }
        ]);

        // Generate activity timelines from real data
        const list: any[] = [];
        if (Array.isArray(agentsRes.data) && agentsRes.data.length > 0) {
          agentsRes.data.slice(0, 3).forEach((a: any) => {
            list.push({ event: `Agent ${a.name} active`, time: "Sync OK", desc: `Model: ${a.llm_model || 'Gemini 1.5'}. Provider: ${a.llm_provider || 'Google'}.` });
          });
          
          setPopularAgents(agentsRes.data.slice(0, 3).map((a: any, idx: number) => {
            const widthClass = idx === 0 ? "w-[85%]" : idx === 1 ? "w-[60%]" : "w-[40%]";
            return {
              name: a.name,
              queries: `${a.calls_count || 0} calls`,
              share: `${widthClass} bg-purple-500`
            };
          }));
        } else {
          setPopularAgents([]);
        }

        if (Array.isArray(kbRes.data) && kbRes.data.length > 0) {
          kbRes.data.slice(0, 2).forEach((k: any) => {
            list.push({ event: `Collection ${k.name} connected`, time: "Ingested", desc: `Active vector database content mapping.` });
          });
        }
        
        setActivities(list);

        if (Array.isArray(toolsRes.data) && toolsRes.data.length > 0) {
          setUsedTools(toolsRes.data.slice(0, 3).map((t: any, idx: number) => {
            const widthClass = idx === 0 ? "w-[90%]" : idx === 1 ? "w-[65%]" : "w-[45%]";
            return {
              name: t.name,
              runs: `${t.runs_count || 0} runs`,
              share: `${widthClass} bg-cyan-400`
            };
          }));
        } else {
          setUsedTools([]);
        }

      } catch (err) {
        console.error("Failed to load integrations stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 animate-fadeIn text-left">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-primary/15 via-[#1a1b24] to-[#121318] border border-primary/20 rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-[radial-gradient(circle_at_top_right,var(--color-primary),transparent_65%)] opacity-20 pointer-events-none" />
        <div className="flex-1 flex flex-col gap-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider self-start">
            <Sparkles className="h-3 w-3" />
            AI Operating System Dashboard
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-1">Autonomous Workspaces</h1>
          <p className="text-sm text-[#8D96A7] max-w-2xl">
            Monitor autonomous AI employees, check system prompts, analyze token throughput, and deploy task-specific models across your organization.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 relative z-10 self-start lg:self-center">
          <Link href="/chat" className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 cursor-pointer text-white-force">
            Console Terminal
          </Link>
          <Link href="/agents" className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#1d1f27] text-white hover:bg-[#252833] border border-border-color transition-all cursor-pointer">
            Assemble Agent
          </Link>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className={`bg-card-bg border border-border-color rounded-2xl p-5 hover:border-border-color/80 bg-gradient-to-b ${stat.color} transition-all duration-300 flex items-center justify-between group`}
          >
            <div className="flex flex-col gap-1 text-left">
              <span className="text-[11px] font-semibold text-[#8D96A7] uppercase tracking-wider">{stat.label}</span>
              <span className="text-2xl font-bold text-white tracking-tight mt-1">{loading ? "..." : stat.value}</span>
              <span className="text-[10px] text-[#8D96A7] font-medium flex items-center gap-1 mt-1">
                {stat.change}
              </span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-[#16181D]/80 border border-border-color flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-200">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Charts Box (Left / Span 2) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-card-bg border border-border-color rounded-2xl p-6 shadow-card flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[#1c1e24] pb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">Conversation Trend & cost</h3>
                <p className="text-xs text-[#8D96A7] mt-0.5">Daily conversational messages and usage billings.</p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-semibold">
                <span className="flex items-center gap-1.5 text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary" /> Messages
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Cost ($)
                </span>
              </div>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="relative h-64 w-full bg-[#14151b] border border-border-color/30 rounded-xl p-4 overflow-hidden flex items-end">
              {hasUsageHistory ? (
                <>
                  <svg className="absolute inset-0 h-full w-full p-2" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="20" x2="100" y2="20" stroke="#1d2029" strokeWidth="0.5" strokeDasharray="3" />
                    <line x1="0" y1="40" x2="100" y2="40" stroke="#1d2029" strokeWidth="0.5" strokeDasharray="3" />
                    <line x1="0" y1="60" x2="100" y2="60" stroke="#1d2029" strokeWidth="0.5" strokeDasharray="3" />
                    <line x1="0" y1="80" x2="100" y2="80" stroke="#1d2029" strokeWidth="0.5" strokeDasharray="3" />

                    {/* Area Fill for Messages */}
                    <path d="M 0,90 Q 20,40 40,55 T 80,25 T 100,10 L 100,95 L 0,95 Z" fill="url(#areaGrad)" />
                    {/* Line Path for Messages */}
                    <path d="M 0,90 Q 20,40 40,55 T 80,25 T 100,10" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Line Path for Cost */}
                    <path d="M 0,85 Q 20,65 40,50 T 80,45 T 100,30" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="2" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-x-0 bottom-1 flex justify-between px-3 text-[9px] text-[#5A6376] font-mono">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-[#8D96A7] gap-2 px-6 text-center z-15">
                  <TrendingUp className="h-8 w-8 text-[#2C313C]" />
                  <h4 className="text-xs font-bold text-white">No usage analytics logged</h4>
                  <p className="text-[10px]">Usage rates, costs, and request graphs will map here after dispatching chat commands.</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Chart: Popular Agents */}
            <div className="bg-card-bg border border-border-color rounded-2xl p-5 flex flex-col gap-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Popular AI Agents</h4>
              {popularAgents.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {popularAgents.map((agent, i) => (
                    <div key={i} className="flex flex-col gap-1 text-left">
                      <div className="flex justify-between text-[11px] font-semibold text-[#B7BDC8]">
                        <span>{agent.name}</span>
                        <span className="text-[#8D96A7] font-mono">{agent.queries}</span>
                      </div>
                      <div className="h-1.5 bg-[#16181D] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${agent.share}`} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-[10px] text-[#8D96A7] italic">
                  No agents deployed yet. Create an agent to start tracking runs.
                </div>
              )}
            </div>

            {/* Chart: Most Used Tools */}
            <div className="bg-card-bg border border-border-color rounded-2xl p-5 flex flex-col gap-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Most Used API Tools</h4>
              {usedTools.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {usedTools.map((tool, i) => (
                    <div key={i} className="flex flex-col gap-1 text-left">
                      <div className="flex justify-between text-[11px] font-semibold text-[#B7BDC8]">
                        <span>{tool.name}</span>
                        <span className="text-[#8D96A7] font-mono">{tool.runs}</span>
                      </div>
                      <div className="h-1.5 bg-[#16181D] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${tool.share}`} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-[10px] text-[#8D96A7] italic">
                  No api integrations used yet. Mappings will populate automatically.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Quick Actions & Timeline (Right / Span 1) */}
        <div className="flex flex-col gap-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-card-bg border border-border-color rounded-2xl p-5 shadow-card flex flex-col gap-4 text-left">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-primary" /> Quick Operations
            </h3>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => router.push("/agents")} 
                className="w-full text-left px-4 py-3 bg-[#1d1f27]/50 hover:bg-[#1d1f27] border border-border-color hover:border-primary/30 rounded-xl text-xs font-semibold text-[#B7BDC8] hover:text-white flex items-center justify-between group transition-all cursor-pointer"
              >
                <span>Create Autonomous Agent</span>
                <Plus className="h-3.5 w-3.5 text-[#8D96A7] group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </button>
              <button 
                onClick={() => router.push("/chat")} 
                className="w-full text-left px-4 py-3 bg-[#1d1f27]/50 hover:bg-[#1d1f27] border border-border-color hover:border-primary/30 rounded-xl text-xs font-semibold text-[#B7BDC8] hover:text-white flex items-center justify-between group transition-all cursor-pointer"
              >
                <span>Start Direct Chat</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-[#8D96A7] group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </button>
              <button 
                onClick={() => router.push("/knowledge")} 
                className="w-full text-left px-4 py-3 bg-[#1d1f27]/50 hover:bg-[#1d1f27] border border-border-color hover:border-primary/30 rounded-xl text-xs font-semibold text-[#B7BDC8] hover:text-white flex items-center justify-between group transition-all cursor-pointer"
              >
                <span>Upload Knowledge DB</span>
                <Database className="h-3.5 w-3.5 text-[#8D96A7] group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </button>
              <button 
                onClick={() => router.push("/prompts")} 
                className="w-full text-left px-4 py-3 bg-[#1d1f27]/50 hover:bg-[#1d1f27] border border-border-color hover:border-primary/30 rounded-xl text-xs font-semibold text-[#B7BDC8] hover:text-white flex items-center justify-between group transition-all cursor-pointer"
              >
                <span>Create System Prompt</span>
                <Sparkles className="h-3.5 w-3.5 text-[#8D96A7] group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </button>
              <button 
                onClick={() => router.push("/models")} 
                className="w-full text-left px-4 py-3 bg-[#1d1f27]/50 hover:bg-[#1d1f27] border border-border-color hover:border-primary/30 rounded-xl text-xs font-semibold text-[#B7BDC8] hover:text-white flex items-center justify-between group transition-all cursor-pointer"
              >
                <span>Configure API Models</span>
                <Server className="h-3.5 w-3.5 text-[#8D96A7] group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-card-bg border border-border-color rounded-2xl p-5 shadow-card flex flex-col gap-4 text-left">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-[#8D96A7]" /> Recent Activity
            </h3>
            
            {activities.length > 0 ? (
              <div className="relative pl-4 border-l border-[#242731] flex flex-col gap-5 py-2">
                {activities.map((act, i) => (
                  <div key={i} className="relative flex flex-col gap-1 group">
                    <span className="absolute -left-[20.5px] top-1 h-3 w-3 rounded-full bg-[#111113] border-2 border-primary group-hover:bg-primary transition-colors" />
                    <div className="flex items-center justify-between text-[11px] font-bold text-white">
                      <span>{act.event}</span>
                      <span className="text-[9px] text-[#5A6376] font-semibold">{act.time}</span>
                    </div>
                    <p className="text-[10px] text-[#8D96A7] leading-relaxed mt-0.5">{act.desc}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-[10px] text-[#8D96A7] italic">
                No system activity events registered.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
