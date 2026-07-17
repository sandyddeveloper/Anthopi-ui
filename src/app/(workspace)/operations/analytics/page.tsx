"use client";
import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  DollarSign, 
  Search, 
  Wrench, 
  Clock, 
  Percent, 
  Users, 
  Bot, 
  BookOpen, 
  Briefcase,
  Layers,
  Sparkles,
  PieChart,
  MessageSquare,
  Globe,
  Smile,
  ShieldCheck,
  Cpu,
  RefreshCw,
  ArrowUpRight,
  AlertTriangle
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function AIAnalyticsSuite() {
  const [activeTab, setActiveTab] = useState<string>("overview"); // overview, agents, knowledge, tools, costs, conversation
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<any>(null);
  
  // Agent Performance Detail states
  const [selectedAgent, setSelectedAgent] = useState<string>("agent-dev");
  const [agentDetailTab, setAgentDetailTab] = useState<string>("overview"); // overview, performance, knowledge, tools, memory, costs, feedback

  const mockAnalytics = {
    overviewStats: [
      { label: "Response Latency", value: "1.24s", change: "-0.15s vs yesterday", icon: <Clock className="h-4.5 w-4.5 text-teal-400" /> },
      { label: "AI Accuracy Score", value: "98.4%", change: "+0.2% vs last week", icon: <Percent className="h-4.5 w-4.5 text-emerald-400" /> },
      { label: "Task Success Rate", value: "97.8%", change: "+0.5% vs average", icon: <CheckCircleIcon /> },
      { label: "Tool Call Failures", value: "3 cases", change: "None critical today", icon: <XCircleIcon /> }
    ],
    agents: [
      { id: "agent-dev", name: "Developer AI", role: "Software Engineer", conversations: 184, tasks: 42, approvals: 12, rating: 4.8, cost: 24.50, success: 98.4, model: "Gemini 1.5 Pro" },
      { id: "agent-mkt", name: "Marketing AI", role: "Content Creator", conversations: 112, tasks: 28, approvals: 4, rating: 4.6, cost: 18.20, success: 97.2, model: "Claude 3.5 Sonnet" },
      { id: "agent-hr", name: "HR Recruiter AI", role: "Talent Sourcer", conversations: 85, tasks: 52, approvals: 8, rating: 4.9, cost: 12.10, success: 99.0, model: "Gemini 1.5 Flash" },
      { id: "agent-supp", name: "Support AI", role: "Customer Advocate", conversations: 312, tasks: 12, approvals: 1, rating: 4.7, cost: 8.80, success: 98.1, model: "GPT-4o Mini" }
    ],
    knowledge: {
      collections: [
        { code: "dev-docs", name: "Developer Guides", documents: 142, queries: 1240, agents: "Developer AI", updated: "2 hours ago" },
        { code: "corp-policies", name: "HR Corporate Policies", documents: 84, queries: 412, agents: "HR Recruiter AI, Support AI", updated: "1 day ago" },
        { code: "marketing-kit", name: "Brand Voice Guideline", documents: 24, queries: 820, agents: "Marketing AI", updated: "12 mins ago" }
      ],
      unused: [
        { name: "Archive_Sales_v1.pdf", size: "2.4 MB", type: "PDF" },
        { name: "Legacy_Credentials.json", size: "4 KB", type: "JSON" }
      ]
    },
    tools: [
      { name: "SQL Query Executor", executions: 542, failures: 4, avg_duration: "840ms", success: 99.2 },
      { name: "Google Search API", executions: 420, failures: 12, avg_duration: "1.2s", success: 97.1 },
      { name: "Mailgun SMTP Client", executions: 212, failures: 2, avg_duration: "1.5s", success: 99.0 },
      { name: "File Reader Tool", executions: 180, failures: 0, avg_duration: "120ms", success: 100 }
    ],
    costs: {
      today: "$12.45",
      monthly: "$284.10",
      budget: "$1,200.00",
      avgUser: "$1.42",
      avgAgent: "$24.50",
      providers: [
        { name: "Google AI Vertex", cost: 124.50, color: "bg-blue-500" },
        { name: "Anthropic API", cost: 98.20, color: "bg-amber-600" },
        { name: "OpenAI Platform", cost: 61.40, color: "bg-emerald-500" }
      ],
      departments: [
        { name: "Engineering", cost: 142.10, color: "bg-purple-500" },
        { name: "Marketing", cost: 84.50, color: "bg-pink-500" },
        { name: "Human Resources", cost: 57.50, color: "bg-blue-400" }
      ]
    },
    conversation: {
      sentiment: { positive: 82, neutral: 12, negative: 6 },
      topics: [
        { topic: "Database Schema queries", share: 45 },
        { topic: "Job resumes matching", share: 25 },
        { topic: "Twitter sale promotion", share: 20 },
        { topic: "General organization policies", share: 10 }
      ],
      languages: [
        { lang: "English", share: 88 },
        { lang: "Spanish", share: 7 },
        { lang: "German", share: 5 }
      ],
      resolved: 420,
      escalated: 12,
      needs_approval: 4,
      kb_used: 824
    }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await apiClient.operations.getAnalyticsOverview();
      setOverviewData(res.data);
    } catch (err) {
      console.error("Failed to load analytics overview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const getAgentLabel = (id: string) => {
    return mockAnalytics.agents.find(a => a.id === id)?.name || "Developer AI";
  };

  const selectedAgentData = mockAnalytics.agents.find(a => a.id === selectedAgent) || mockAnalytics.agents[0];

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 text-left text-white animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#16181D] p-6 rounded-2xl border border-border-color/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AI Operations Analytics</h1>
            <p className="text-xs text-[#8D96A7]">Inspect token costs, agent efficiency matrixes, knowledge vector lookup hits, and tool performance KPIs.</p>
          </div>
        </div>
        <button 
          onClick={loadAnalytics}
          className="px-3.5 py-2 rounded-xl bg-[#1d1f27] border border-border-color text-xs font-semibold hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh stats
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-border-color overflow-x-auto scrollbar-none gap-2">
        <button 
          onClick={() => setActiveTab("overview")}
          className={`px-4.5 py-2 text-xs font-bold whitespace-nowrap border-b-2 -mb-[2px] cursor-pointer ${activeTab === "overview" ? 'border-primary text-primary' : 'border-transparent text-[#8D96A7] hover:text-white'}`}
        >
          Operational Overview
        </button>
        <button 
          onClick={() => setActiveTab("agents")}
          className={`px-4.5 py-2 text-xs font-bold whitespace-nowrap border-b-2 -mb-[2px] cursor-pointer ${activeTab === "agents" ? 'border-primary text-primary' : 'border-transparent text-[#8D96A7] hover:text-white'}`}
        >
          Agent Performance
        </button>
        <button 
          onClick={() => setActiveTab("knowledge")}
          className={`px-4.5 py-2 text-xs font-bold whitespace-nowrap border-b-2 -mb-[2px] cursor-pointer ${activeTab === "knowledge" ? 'border-primary text-primary' : 'border-transparent text-[#8D96A7] hover:text-white'}`}
        >
          Knowledge Insights
        </button>
        <button 
          onClick={() => setActiveTab("tools")}
          className={`px-4.5 py-2 text-xs font-bold whitespace-nowrap border-b-2 -mb-[2px] cursor-pointer ${activeTab === "tools" ? 'border-primary text-primary' : 'border-transparent text-[#8D96A7] hover:text-white'}`}
        >
          Tool Usage
        </button>
        <button 
          onClick={() => setActiveTab("costs")}
          className={`px-4.5 py-2 text-xs font-bold whitespace-nowrap border-b-2 -mb-[2px] cursor-pointer ${activeTab === "costs" ? 'border-primary text-primary' : 'border-transparent text-[#8D96A7] hover:text-white'}`}
        >
          AI Cost Center
        </button>
        <button 
          onClick={() => setActiveTab("conversation")}
          className={`px-4.5 py-2 text-xs font-bold whitespace-nowrap border-b-2 -mb-[2px] cursor-pointer ${activeTab === "conversation" ? 'border-primary text-primary' : 'border-transparent text-[#8D96A7] hover:text-white'}`}
        >
          Conversation Intelligence
        </button>
      </div>

      {/* Main Tab content */}
      <div className="flex flex-col gap-6">

        {/* 1. Operational Overview */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockAnalytics.overviewStats.map((stat, idx) => (
                <div key={idx} className="bg-[#16181D] border border-border-color/60 rounded-xl p-5 flex items-center justify-between group hover:border-border-color transition-all">
                  <div className="flex flex-col text-left gap-1">
                    <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">{stat.label}</span>
                    <span className="text-2xl font-black text-white mt-0.5">{stat.value}</span>
                    <span className="text-[9px] text-[#5b6375] font-semibold">{stat.change}</span>
                  </div>
                  <div className="h-11 w-11 rounded-lg bg-[#111216] border border-border-color flex items-center justify-center">
                    {stat.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Latency Plot */}
              <div className="bg-[#16181D] border border-border-color rounded-2xl p-5.5 flex flex-col gap-4">
                <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider block">Agent Response Latency (ms)</span>
                <div className="h-44 w-full flex items-end gap-3.5 mt-2 justify-between">
                  {[450, 680, 520, 920, 810, 620, 480].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="w-full bg-primary/10 hover:bg-primary/20 border border-primary/20 group-hover:border-primary/40 rounded-lg relative flex items-end justify-center transition-all" style={{ height: `${(h / 1000) * 150}px` }}>
                        <span className="absolute bottom-full mb-1 text-[9px] font-mono text-primary font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{h}ms</span>
                        <div className="w-full bg-primary/30 group-hover:bg-primary/50 h-2/3 rounded-b-md" />
                      </div>
                      <span className="text-[9px] text-[#5b6375] font-semibold">10:0{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agent comparison throughput */}
              <div className="bg-[#16181D] border border-border-color rounded-2xl p-5.5 flex flex-col gap-4">
                <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider block">Agent Comparisons (Daily volume)</span>
                <div className="flex flex-col gap-3 mt-1">
                  {mockAnalytics.agents.map((agent) => (
                    <div key={agent.id} className="flex flex-col gap-1">
                      <div className="flex justify-between text-[11px] font-semibold text-white">
                        <span>{agent.name}</span>
                        <span>{agent.conversations} conversations</span>
                      </div>
                      <div className="h-2 bg-[#111216] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full" 
                          style={{ width: `${(agent.conversations / 312) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 2. Agent Performance Grid */}
        {activeTab === "agents" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
            
            {/* Grid of Agent Cards (4 columns) */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider px-1">Evaluate AI Employees</span>
              <div className="flex flex-col gap-2">
                {mockAnalytics.agents.map((agent) => {
                  const isSelected = selectedAgent === agent.id;
                  return (
                    <div 
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent.id)}
                      className={`p-4 rounded-xl border transition-all flex flex-col gap-2 cursor-pointer text-left ${
                        isSelected 
                          ? "bg-primary/10 border-primary" 
                          : "bg-[#16181D]/80 border-border-color hover:border-[#8D96A7]"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black uppercase text-white tracking-wide">{agent.name}</h4>
                        <span className="text-[10px] font-extrabold text-[#8D96A7]">{agent.role}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        <div className="flex flex-col">
                          <span className="text-[8px] text-[#5b6375] font-semibold uppercase">Calls</span>
                          <span className="text-xs font-bold text-white">{agent.conversations}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] text-[#5b6375] font-semibold uppercase">Rating</span>
                          <span className="text-xs font-bold text-white">⭐ {agent.rating}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] text-[#5b6375] font-semibold uppercase">Cost</span>
                          <span className="text-xs font-bold text-white">${agent.cost.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Agent performance Detail sub-tabs (8 columns) */}
            <div className="lg:col-span-8 bg-[#16181D] border border-border-color rounded-2xl overflow-hidden flex flex-col h-[520px]">
              
              {/* Agent Detail Header */}
              <div className="p-5 border-b border-border-color bg-[#111216]/40 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary animate-pulse" />
                  <div>
                    <h3 className="text-sm font-black text-white uppercase">{selectedAgentData.name} Evaluation</h3>
                    <span className="text-[10px] text-[#8D96A7] font-semibold">{selectedAgentData.model} - {selectedAgentData.role}</span>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">Success: {selectedAgentData.success}%</span>
              </div>

              {/* Detail Tabs bar */}
              <div className="flex border-b border-border-color/60 bg-[#111216]/20 text-[10px] font-bold uppercase tracking-wider text-[#8D96A7]">
                {["overview", "performance", "knowledge", "tools", "memory", "costs", "feedback"].map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setAgentDetailTab(sub)}
                    className={`px-4.5 py-3 border-b-2 transition-all cursor-pointer ${agentDetailTab === sub ? 'border-primary text-primary bg-[#111216]/30' : 'border-transparent hover:text-white'}`}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              {/* Sub tab details panel */}
              <div className="p-5 flex-1 overflow-y-auto text-left scrollbar-thin text-xs">
                {agentDetailTab === "overview" && (
                  <div className="grid grid-cols-2 gap-6 leading-relaxed">
                    <div className="flex flex-col gap-3">
                      <h4 className="font-extrabold text-white text-xs border-b border-border-color/20 pb-1">Operational Metrics</h4>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between">
                          <span className="text-[#8D96A7]">Active Conversations:</span>
                          <span className="font-bold text-white">{selectedAgentData.conversations}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8D96A7]">AI Jobs Completed:</span>
                          <span className="font-bold text-white">{selectedAgentData.tasks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8D96A7]">Approvals Processed:</span>
                          <span className="font-bold text-white">{selectedAgentData.approvals}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <h4 className="font-extrabold text-white text-xs border-b border-border-color/20 pb-1">Efficiency</h4>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between">
                          <span className="text-[#8D96A7]">Avg Response Time:</span>
                          <span className="font-bold text-white">1.12 seconds</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8D96A7]">Accumulated Cost:</span>
                          <span className="font-bold text-emerald-400">${selectedAgentData.cost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8D96A7]">Satisfaction score:</span>
                          <span className="font-bold text-white">⭐ {selectedAgentData.rating} / 5.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {agentDetailTab === "performance" && (
                  <div className="flex flex-col gap-4">
                    <span className="font-extrabold text-white">Execution Success Ratios</span>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-[#111216]/50 border border-border-color/40 p-4 rounded-xl text-center">
                        <span className="text-[9px] text-[#8D96A7] uppercase block">Success</span>
                        <span className="text-base font-black text-emerald-400 block mt-1">{selectedAgentData.success}%</span>
                      </div>
                      <div className="bg-[#111216]/50 border border-border-color/40 p-4 rounded-xl text-center">
                        <span className="text-[9px] text-[#8D96A7] uppercase block">Avg Accuracy</span>
                        <span className="text-base font-black text-white block mt-1">98.2%</span>
                      </div>
                      <div className="bg-[#111216]/50 border border-border-color/40 p-4 rounded-xl text-center">
                        <span className="text-[9px] text-[#8D96A7] uppercase block">Validation passed</span>
                        <span className="text-base font-black text-blue-400 block mt-1">42 runs</span>
                      </div>
                    </div>
                  </div>
                )}

                {agentDetailTab === "knowledge" && (
                  <div className="flex flex-col gap-3">
                    <span className="font-extrabold text-white">Associated Vector Ingestions</span>
                    <div className="border border-border-color/40 bg-[#111216]/50 rounded-xl p-3.5 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-400" />
                        <div>
                          <span className="font-bold text-white block">Guides Collection</span>
                          <span className="text-[10px] text-[#8D96A7]">Injected 142 vectors</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#8D96A7] font-semibold">Active context mapping</span>
                    </div>
                  </div>
                )}

                {agentDetailTab === "tools" && (
                  <div className="flex flex-col gap-3">
                    <span className="font-extrabold text-white">Injected Function Tools</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="border border-border-color/40 bg-[#111216]/30 p-3 rounded-xl flex items-center justify-between">
                        <span className="font-bold text-white">sql_executor</span>
                        <span className="text-[10px] text-cyan-400 font-extrabold uppercase">Read & Write</span>
                      </div>
                      <div className="border border-border-color/40 bg-[#111216]/30 p-3 rounded-xl flex items-center justify-between">
                        <span className="font-bold text-white">web_search_api</span>
                        <span className="text-[10px] text-blue-400 font-extrabold uppercase">Read-Only</span>
                      </div>
                    </div>
                  </div>
                )}

                {agentDetailTab === "memory" && (
                  <div className="flex flex-col gap-3">
                    <span className="font-extrabold text-white">Long-term Memory Layers</span>
                    <div className="flex flex-col gap-2">
                      <div className="p-3 bg-[#111216]/60 border border-border-color/30 rounded-xl">
                        <span className="text-[9px] text-[#8D96A7] font-bold uppercase block mb-1">User Preference</span>
                        <p className="text-white italic">"Lead Developer (Santhosh) prefers server-side rendering over client-side for public landing screens."</p>
                      </div>
                    </div>
                  </div>
                )}

                {agentDetailTab === "costs" && (
                  <div className="flex flex-col gap-3">
                    <span className="font-extrabold text-white">Usage and Provider Billing allocation</span>
                    <div className="flex flex-col gap-2 bg-[#111216]/50 p-4 rounded-xl border border-border-color/40">
                      <div className="flex justify-between text-[#8D96A7]">
                        <span>Prompt Token Cost:</span>
                        <span className="font-bold text-white">${(selectedAgentData.cost * 0.6).toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between text-[#8D96A7]">
                        <span>Completion Token Cost:</span>
                        <span className="font-bold text-white">${(selectedAgentData.cost * 0.4).toFixed(4)}</span>
                      </div>
                      <div className="h-px bg-border-color/20 my-1" />
                      <div className="flex justify-between text-white font-extrabold">
                        <span>Total Burn allocation:</span>
                        <span className="text-emerald-400">${selectedAgentData.cost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {agentDetailTab === "feedback" && (
                  <div className="flex flex-col gap-3">
                    <span className="font-extrabold text-white">Evaluator Reviews</span>
                    <div className="flex flex-col gap-2">
                      <div className="p-3 bg-[#111216]/40 border border-border-color/30 rounded-xl flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-[10px] font-bold text-[#8D96A7]">
                          <span>Manager Review</span>
                          <span>⭐ 5.0</span>
                        </div>
                        <p className="text-white">"Excellent performance generating Django SQL joins. Kept latency under 1.5s."</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* 3. Knowledge Insights */}
        {activeTab === "knowledge" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            
            {/* Charts Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Document Usage Chart */}
              <div className="bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-4">
                <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider block">Most Ingested Collections</span>
                <div className="flex flex-col gap-3 mt-1">
                  {mockAnalytics.knowledge.collections.map((col, idx) => (
                    <div key={col.code} className="flex flex-col gap-1">
                      <div className="flex justify-between text-[11px] font-semibold text-white">
                        <span>{col.name}</span>
                        <span>{col.documents} docs ({col.queries} queries)</span>
                      </div>
                      <div className="h-2 bg-[#111216] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${(col.documents / 142) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unused Knowledge list */}
              <div className="bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-4">
                <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider block">Unused Knowledge Files</span>
                <div className="flex flex-col gap-2 mt-1">
                  {mockAnalytics.knowledge.unused.map((file, idx) => (
                    <div key={idx} className="border border-border-color/45 bg-[#111216]/50 rounded-xl p-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-[#5b6375]" />
                        <div>
                          <span className="font-bold text-white block">{file.name}</span>
                          <span className="text-[9px] text-[#8D96A7]">Unused since ingestion</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#8D96A7] font-semibold">{file.size} - {file.type}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Collections Table */}
            <div className="bg-[#16181D] border border-border-color rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 bg-[#111216]/40 border-b border-border-color/60">
                <span className="text-xs font-bold text-[#8D96A7] uppercase tracking-wider">Vector Store Indexing Mapping</span>
              </div>
              <table className="w-full text-xs text-left">
                <thead className="bg-[#111216] text-[#8D96A7] font-extrabold uppercase border-b border-border-color tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-4">Collection</th>
                    <th className="px-5 py-4">Documents Ingested</th>
                    <th className="px-5 py-4">Retrieval Queries</th>
                    <th className="px-5 py-4">Assigned Agents</th>
                    <th className="px-5 py-4">Updated At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color/40">
                  {mockAnalytics.knowledge.collections.map((col, idx) => (
                    <tr key={idx} className="hover:bg-[#1a1b24] transition-colors">
                      <td className="px-5 py-4 font-bold text-white">{col.name}</td>
                      <td className="px-5 py-4 font-semibold text-white">{col.documents} docs</td>
                      <td className="px-5 py-4 font-medium text-[#8D96A7]">{col.queries} hits</td>
                      <td className="px-5 py-4 font-semibold text-white">{col.agents}</td>
                      <td className="px-5 py-4 text-[#8D96A7]">{col.updated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* 4. Tool Usage */}
        {activeTab === "tools" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
            {mockAnalytics.tools.map((tool, idx) => (
              <div key={idx} className="bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-border-color/20 pb-2">
                  <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">{tool.name}</span>
                  <Wrench className="h-4.5 w-4.5 text-cyan-400" />
                </div>
                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8D96A7]">Runs:</span>
                    <span className="font-black text-white">{tool.executions}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8D96A7]">Failures:</span>
                    <span className={`font-black ${tool.failures > 0 ? 'text-red-400' : 'text-white'}`}>{tool.failures}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8D96A7]">Avg Duration:</span>
                    <span className="font-black text-white">{tool.avg_duration}</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-border-color/10 pt-2">
                    <span className="text-[#8D96A7] font-semibold">Success rate:</span>
                    <span className="font-extrabold text-emerald-400">{tool.success}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. Cost Center */}
        {activeTab === "costs" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: "Today's Cost", value: mockAnalytics.costs.today, color: "text-emerald-400" },
                { label: "Monthly Cost", value: mockAnalytics.costs.monthly, color: "text-white" },
                { label: "Budget Remaining", value: mockAnalytics.costs.budget, color: "text-blue-400" },
                { label: "Avg Cost/User", value: mockAnalytics.costs.avgUser, color: "text-white" },
                { label: "Avg Cost/Agent", value: mockAnalytics.costs.avgAgent, color: "text-white" }
              ].map((item, idx) => (
                <div key={idx} className="bg-[#16181D] border border-border-color rounded-xl p-4.5">
                  <span className="text-[9px] font-bold text-[#8D96A7] uppercase block">{item.label}</span>
                  <span className={`text-xl font-black mt-1 block ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Provider and Dept breakdown charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Provider Allocation */}
              <div className="bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-4">
                <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider block">Provider Billing Distribution</span>
                <div className="flex flex-col gap-3 mt-1">
                  {mockAnalytics.costs.providers.map((p) => (
                    <div key={p.name} className="flex flex-col gap-1">
                      <div className="flex justify-between text-[11px] font-semibold text-white">
                        <span>{p.name}</span>
                        <span>${p.cost.toFixed(2)}</span>
                      </div>
                      <div className="h-2 bg-[#111216] rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${p.color} rounded-full`} 
                          style={{ width: `${(p.cost / 124.50) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department Allocation */}
              <div className="bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-4">
                <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider block">Department cost Allocation</span>
                <div className="flex flex-col gap-3 mt-1">
                  {mockAnalytics.costs.departments.map((d) => (
                    <div key={d.name} className="flex flex-col gap-1">
                      <div className="flex justify-between text-[11px] font-semibold text-white">
                        <span>{d.name}</span>
                        <span>${d.cost.toFixed(2)}</span>
                      </div>
                      <div className="h-2 bg-[#111216] rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${d.color} rounded-full`} 
                          style={{ width: `${(d.cost / 142.10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 6. Conversation Intelligence */}
        {activeTab === "conversation" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Resolved Chats", value: mockAnalytics.conversation.resolved, icon: <CheckCircleIcon className="text-emerald-400" /> },
                { label: "Escalated Cases", value: mockAnalytics.conversation.escalated, icon: <AlertTriangle className="text-amber-500" /> },
                { label: "Needs Approval", value: mockAnalytics.conversation.needs_approval, icon: <ShieldCheck className="text-red-400" /> },
                { label: "Knowledge references", value: mockAnalytics.conversation.kb_used, icon: <BookOpen className="text-blue-400" /> }
              ].map((item, idx) => (
                <div key={idx} className="bg-[#16181D] border border-border-color rounded-xl p-4.5 flex items-center justify-between">
                  <div className="flex flex-col text-left gap-1">
                    <span className="text-[9px] font-bold text-[#8D96A7] uppercase">{item.label}</span>
                    <span className="text-xl font-black text-white mt-0.5">{item.value}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#111216] border border-border-color">
                    {item.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* Sentiment and Topics Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Sentiment block */}
              <div className="bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-4 text-center items-center justify-center">
                <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider block self-start">Sentiment Analysis</span>
                <div className="flex gap-4.5 justify-center py-4">
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-black text-emerald-400">{mockAnalytics.conversation.sentiment.positive}%</span>
                    <span className="text-[9px] text-[#8D96A7] uppercase font-bold mt-1">Positive</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-black text-neutral-400">{mockAnalytics.conversation.sentiment.neutral}%</span>
                    <span className="text-[9px] text-[#8D96A7] uppercase font-bold mt-1">Neutral</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-black text-red-400">{mockAnalytics.conversation.sentiment.negative}%</span>
                    <span className="text-[9px] text-[#8D96A7] uppercase font-bold mt-1">Negative</span>
                  </div>
                </div>
              </div>

              {/* Topics block */}
              <div className="bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-4">
                <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider block">Topic Categories</span>
                <div className="flex flex-col gap-3.5 mt-1">
                  {mockAnalytics.conversation.topics.map((t) => (
                    <div key={t.topic} className="flex flex-col gap-1">
                      <div className="flex justify-between text-[11px] font-semibold text-white">
                        <span>{t.topic}</span>
                        <span>{t.share}%</span>
                      </div>
                      <div className="h-1.5 bg-[#111216] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${t.share}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages block */}
              <div className="bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-4">
                <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider block">Languages Inbound</span>
                <div className="flex flex-col gap-3.5 mt-1">
                  {mockAnalytics.conversation.languages.map((l) => (
                    <div key={l.lang} className="flex flex-col gap-1">
                      <div className="flex justify-between text-[11px] font-semibold text-white">
                        <span>{l.lang}</span>
                        <span>{l.share}%</span>
                      </div>
                      <div className="h-1.5 bg-[#111216] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${l.share}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

// Local helper icons
function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      className={`h-4.5 w-4.5 text-emerald-400 ${props.className || ''}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      className={`h-4.5 w-4.5 text-red-400 ${props.className || ''}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
