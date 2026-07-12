"use client";
import React, { useState } from "react";
import { 
  Search, 
  Layers, 
  User, 
  Sliders, 
  Folder, 
  MoreVertical, 
  Play, 
  Pause, 
  Edit3, 
  Copy, 
  Archive, 
  Trash2, 
  ExternalLink,
  ChevronDown,
  Filter,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowListProps {
  workflows: any[];
  onSelectWorkflow: (id: number) => void;
  onDuplicate: (id: number) => void;
  onToggleStatus: (id: number) => void;
  onDelete: (id: number) => void;
  onOpenWizard: () => void;
}

export function WorkflowList({
  workflows,
  onSelectWorkflow,
  onDuplicate,
  onToggleStatus,
  onDelete,
  onOpenWizard
}: WorkflowListProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Extract unique categories for filter
  const categories = ["all", ...Array.from(new Set(workflows.map((w) => w.category || "General")))];

  const filteredWorkflows = workflows.filter((w) => {
    const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || (w.category || "General") === categoryFilter;
    const matchesStatus = statusFilter === "all" || w.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-color/60 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            <span>Workflows</span>
          </h1>
          <p className="text-xs text-[#8D96A7] mt-1">Design, test, and manage all your visual automation logic nodes.</p>
        </div>
        <button
          onClick={onOpenWizard}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/10 transition-all cursor-pointer text-white-force"
        >
          <Edit3 className="h-4 w-4" />
          <span>Create Workflow</span>
        </button>
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch justify-between text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8D96A7]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workflows by title, tags or triggers..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border-color bg-[#16181D]/40 text-white placeholder-[#8D96A7] focus:outline-none focus:border-primary/50 focus:bg-card-bg transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <div className="relative flex items-center bg-[#16181D]/30 border border-border-color rounded-xl px-3 py-2 text-[#B7BDC8]">
            <Filter className="h-3.5 w-3.5 mr-2 text-[#8D96A7]" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-white font-semibold cursor-pointer outline-none capitalize"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-card-bg text-white">
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="relative flex items-center bg-[#16181D]/30 border border-border-color rounded-xl px-3 py-2 text-[#B7BDC8]">
            <Sliders className="h-3.5 w-3.5 mr-2 text-[#8D96A7]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white font-semibold cursor-pointer outline-none capitalize"
            >
              <option value="all" className="bg-card-bg text-white">All Statuses</option>
              <option value="Running" className="bg-card-bg text-white">Running</option>
              <option value="Paused" className="bg-card-bg text-white">Paused</option>
              <option value="Scheduled" className="bg-card-bg text-white">Scheduled</option>
              <option value="Failed" className="bg-card-bg text-white">Failed</option>
              <option value="Draft" className="bg-card-bg text-white">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Workflows Table */}
      <div className="bg-card-bg border border-border-color rounded-card shadow-card overflow-hidden">
        {filteredWorkflows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-color/60 text-[#8D96A7] font-bold uppercase tracking-wider text-[9px] bg-[#16181D]/20">
                  <th className="py-4.5 pl-5">Workflow Name</th>
                  <th className="py-4.5">Category</th>
                  <th className="py-4.5">Owner</th>
                  <th className="py-4.5">Status</th>
                  <th className="py-4.5 text-center">Total Runs</th>
                  <th className="py-4.5 text-center">Success Rate</th>
                  <th className="py-4.5">Last Run</th>
                  <th className="py-4.5">Next Run</th>
                  <th className="py-4.5 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color/40">
                {filteredWorkflows.map((wf) => (
                  <tr key={wf.id} className="hover:bg-[#16181D]/20 transition-colors group">
                    <td className="py-4.5 pl-5">
                      <div className="flex flex-col gap-1 text-left">
                        <span 
                          onClick={() => onSelectWorkflow(wf.id)}
                          className="font-bold text-white group-hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          {wf.name}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 text-[#8D96A7] transition-opacity" />
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] text-[#8D96A7] bg-[#16181D] px-1.5 py-0.5 rounded border border-border-color/40">
                            ID: {wf.id}
                          </span>
                          {wf.tags?.map((tag: string, idx: number) => (
                            <span key={idx} className="text-[9px] text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-4.5 text-[#B7BDC8] font-medium capitalize">
                      {wf.category || "General"}
                    </td>
                    <td className="py-4.5 text-[#B7BDC8]">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[9px] font-bold text-primary uppercase">
                          {wf.owner ? wf.owner.substring(0, 2) : "AI"}
                        </div>
                        <span>{wf.owner || "AI Orchestrator"}</span>
                      </div>
                    </td>
                    <td className="py-4.5">
                      <span className={cn(
                        "text-[8px] uppercase font-extrabold px-2 py-0.5 rounded border inline-block",
                        wf.status === "Running" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                        wf.status === "Failed" && "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse",
                        wf.status === "Paused" && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                        wf.status === "Scheduled" && "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                        wf.status === "Draft" && "bg-neutral-600/10 text-neutral-400 border-neutral-600/20"
                      )}>
                        {wf.status}
                      </span>
                    </td>
                    <td className="py-4.5 text-center text-white font-mono font-bold">
                      {wf.runsCount}
                    </td>
                    <td className="py-4.5 text-center font-mono">
                      <span className={cn(
                        "font-bold",
                        parseFloat(wf.successRate) > 98 ? "text-emerald-500" : "text-amber-500"
                      )}>
                        {wf.successRate}
                      </span>
                    </td>
                    <td className="py-4.5 text-[#B7BDC8] font-semibold">
                      {wf.lastRun || "Never"}
                    </td>
                    <td className="py-4.5 text-[#8D96A7] font-semibold">
                      {wf.nextRun || "--"}
                    </td>
                    <td className="py-4.5 text-right pr-5 relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === wf.id ? null : wf.id)}
                        className="p-1.5 rounded-lg border border-border-color/80 bg-[#16181D] hover:bg-hover-bg text-[#8D96A7] hover:text-white transition-colors cursor-pointer"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === wf.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setActiveMenuId(null)}
                          />
                          <div className="absolute right-5 mt-1.5 w-44 bg-[#15171C] border border-border-color rounded-xl shadow-xl z-20 py-1 text-left animate-fadeIn">
                            <button
                              onClick={() => {
                                onSelectWorkflow(wf.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-white hover:bg-hover-bg hover:text-primary transition-colors flex items-center gap-2 font-bold cursor-pointer"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              <span>Open in Builder</span>
                            </button>
                            <button
                              onClick={() => {
                                onToggleStatus(wf.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-white hover:bg-hover-bg transition-colors flex items-center gap-2 font-semibold cursor-pointer"
                            >
                              {wf.status === "Paused" ? (
                                <>
                                  <Play className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500/10" />
                                  <span>Resume Workflow</span>
                                </>
                              ) : (
                                <>
                                  <Pause className="h-3.5 w-3.5 text-amber-500" />
                                  <span>Pause Workflow</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                onDuplicate(wf.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-white hover:bg-hover-bg transition-colors flex items-center gap-2 font-semibold cursor-pointer"
                            >
                              <Copy className="h-3.5 w-3.5 text-cyan-500" />
                              <span>Duplicate Flow</span>
                            </button>
                            <div className="h-px bg-border-color/30 my-1" />
                            <button
                              onClick={() => {
                                onDelete(wf.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-2 font-bold cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete Workflow</span>
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <Layers className="h-12 w-12 text-[#2C313C] mb-4" />
            <h3 className="text-sm font-bold text-white">No workflows yet</h3>
            <p className="text-xs text-[#8D96A7] mt-1 max-w-sm">
              Get started by creating your first visually mapped custom automation pipeline.
            </p>
            <button
              onClick={onOpenWizard}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/10 transition-all cursor-pointer text-white-force"
            >
              <Plus className="h-4 w-4" />
              <span>Create your first workflow</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
