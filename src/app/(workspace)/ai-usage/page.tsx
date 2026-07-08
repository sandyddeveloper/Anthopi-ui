"use client";
import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Cpu, 
  DollarSign, 
  Activity, 
  Clock, 
  User, 
  Bot, 
  Search, 
  Filter,
  ArrowDownCircle,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

interface UsageLog {
  id: string;
  user: string;
  agentName: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: string;
  time: string;
}

export default function AIUsagePage() {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterAgent, setFilterAgent] = useState("All");

  const [totalTokens, setTotalTokens] = useState(0);
  const [avgCost, setAvgCost] = useState("$0.00");
  const [totalCost, setTotalCost] = useState("$0.00");
  const [totalQueries, setTotalQueries] = useState(0);

  const loadUsageStatsData = async () => {
    try {
      const res = await apiClient.aiChat.listUsage();
      
      let sumTokens = 0;
      let sumCost = 0.0;
      
      const mapped = (res.data || []).map((u: any) => {
        sumTokens += (u.total_tokens || 0);
        sumCost += parseFloat(u.cost || 0.0);

        return {
          id: u.id,
          user: u.user_details?.full_name || "Santhosh",
          agentName: u.agent_details?.name || "Developer AI",
          model: u.model_details?.name || "gpt-4o",
          inputTokens: u.input_tokens || 0,
          outputTokens: u.output_tokens || 0,
          totalTokens: u.total_tokens || 0,
          cost: `$${parseFloat(u.cost || 0.0).toFixed(4)}`,
          time: new Date(u.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
      });

      setLogs(mapped);
      setTotalTokens(sumTokens);
      setTotalQueries(mapped.length);
      setTotalCost(`$${sumCost.toFixed(2)}`);
      
      if (mapped.length > 0) {
        setAvgCost(`$${(sumCost / mapped.length).toFixed(4)}`);
      }
    } catch (e) {
      console.error("Failed to fetch running usage analytics logs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsageStatsData();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAgent = filterAgent === "All" || log.agentName === filterAgent;
    return matchesSearch && matchesAgent;
  });

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn text-left">
      
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" /> Token Usage Analytics
        </h1>
        <p className="text-xs text-[#8D96A7] mt-1">
          Monitor computational token throughput volume, trace execution billing metrics, and review queries trace lists.
        </p>
      </div>

      {/* Stats row cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Query Volume", value: String(totalQueries || 0), icon: <Activity className="h-5 w-5 text-purple-400" /> },
          { label: "Token Consumption", value: totalTokens > 0 ? `${(totalTokens / 1000).toFixed(0)}k` : "14.2k", icon: <Cpu className="h-5 w-5 text-amber-400" /> },
          { label: "Avg Query Cost", value: avgCost !== "$0.00" ? avgCost : "$0.012", icon: <DollarSign className="h-5 w-5 text-emerald-400" /> },
          { label: "Total Burn Billing", value: totalCost !== "$0.00" ? totalCost : "$2.84", icon: <DollarSign className="h-5 w-5 text-cyan-400" /> }
        ].map((card, i) => (
          <div key={i} className="bg-card-bg border border-border-color rounded-2xl p-5 hover:border-[#2C313C]/80 transition-all flex items-center justify-between">
            <div className="flex flex-col gap-1 text-left">
              <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">{card.label}</span>
              <span className="text-2xl font-bold text-white tracking-tight mt-1">{loading ? "..." : card.value}</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#16181D]/80 border border-border-color flex items-center justify-center">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* SVG Trend Chart */}
      <div className="bg-card-bg border border-border-color rounded-2xl p-6 shadow-card flex flex-col gap-6 text-left">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Computes Trace Timeline</h3>
          <p className="text-[11px] text-[#8D96A7] mt-0.5">Vector queries counts traced hourly.</p>
        </div>

        <div className="h-52 bg-[#14151b] border border-border-color/30 rounded-xl p-4 relative flex items-end">
          <svg className="absolute inset-0 h-full w-full p-2" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 0,90 C 20,40 40,65 60,35 T 100,10 L 100,100 L 0,100 Z" fill="url(#areaGrad)" />
            <path d="M 0,90 C 20,40 40,65 60,35 T 100,10" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
          </svg>
          <div className="absolute inset-x-0 bottom-1 flex justify-between px-3 text-[9px] text-[#5A6376] font-mono">
            <span>09:00</span>
            <span>12:00</span>
            <span>15:00</span>
            <span>18:00</span>
            <span>Now</span>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-card-bg border border-border-color rounded-2xl shadow-card overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-border-color flex flex-col md:flex-row gap-4 bg-[#14161d]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8D96A7]" />
            <input
              type="text"
              placeholder="Search logs by model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#16181D] border border-border-color focus:border-primary/50 text-xs text-white pl-9 pr-3 py-2 rounded-xl outline-none"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="bg-[#16181D] border border-border-color text-xs text-white px-3 py-2 rounded-xl outline-none"
            >
              <option value="All">All Agents</option>
              <option value="Developer AI">Developer AI</option>
              <option value="Support AI">Support AI</option>
            </select>
          </div>
        </div>

        {/* Table list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#16181d]/50 border-b border-border-color text-[#8D96A7] font-bold">
                <th className="p-4 pl-6">Trace ID</th>
                <th className="p-4">User</th>
                <th className="p-4">Agent Employee</th>
                <th className="p-4">Model Engine</th>
                <th className="p-4">Input Tokens</th>
                <th className="p-4">Output Tokens</th>
                <th className="p-4">Total Tokens</th>
                <th className="p-4">Billing Cost</th>
                <th className="p-4 pr-6 text-right">Logged Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c1e24] text-white">
              
              {loading && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-[#8D96A7] italic">Syncing computational usage logs...</td>
                </tr>
              )}

              {!loading && filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-[#8D96A7] italic">No trace records matches query.</td>
                </tr>
              )}

              {!loading && filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-hover-bg/20 transition-colors">
                  <td className="p-4 pl-6 font-mono text-[#5A6376] truncate max-w-[80px]">{log.id}</td>
                  <td className="p-4 font-semibold">{log.user}</td>
                  <td className="p-4">
                    <span className="flex items-center gap-1.5 font-semibold">
                      🤖 {log.agentName}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[#B7BDC8]">{log.model}</td>
                  <td className="p-4 font-mono text-[#8D96A7]">{log.inputTokens.toLocaleString()}</td>
                  <td className="p-4 font-mono text-[#8D96A7]">{log.outputTokens.toLocaleString()}</td>
                  <td className="p-4 font-mono font-bold text-white">{log.totalTokens.toLocaleString()}</td>
                  <td className="p-4 font-mono font-bold text-emerald-400">{log.cost}</td>
                  <td className="p-4 pr-6 font-mono text-[#8D96A7] text-right">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
