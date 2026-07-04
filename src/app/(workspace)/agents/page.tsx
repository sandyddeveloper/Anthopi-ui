"use client";
import React, { useState } from "react";
import { 
  Bot, 
  Plus, 
  Search, 
  Settings, 
  Sparkles, 
  Check, 
  Terminal, 
  Brain, 
  Wrench, 
  Lock, 
  ChevronRight,
  Eye,
  Trash2,
  Copy
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Agent {
  id: number;
  name: string;
  role: string;
  description: string;
  status: "Running" | "Paused" | "Idle" | "Draft";
  tools: string[];
  knowledgeBase: string[];
  memoryLimit: string;
  createdDate: string;
}

export default function AgentsPage() {
  // Mock AI agents data
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 1,
      name: "DevAgent v2.4",
      role: "Software Engineering & CI/CD",
      description: "Autonomously writes code, runs unit tests, resolves lint issues, and deploys builds to staging.",
      status: "Running",
      tools: ["File System Sandbox", "Git CLI", "Node Runner"],
      knowledgeBase: ["nextjs-agent-rules", "tsconfig-defaults"],
      memoryLimit: "Short-term buffer",
      createdDate: "2026-06-12",
    },
    {
      id: 2,
      name: "ResearchAgent v1.8",
      role: "Deep Web & PubMed Searcher",
      description: "Crawls medical databases, extracts full-text articles, builds citation trees, and drafts literature summaries.",
      status: "Running",
      tools: ["Google Search API", "PubMed API Client", "PDF Extractor"],
      knowledgeBase: ["protein-superposition-guidance", "literature-review-rules"],
      memoryLimit: "Long-term sliding window",
      createdDate: "2026-06-25",
    },
    {
      id: 3,
      name: "InsightAgent v3.0",
      role: "Analytics & Chart Plotter",
      description: "Ingests raw database tables, executes statistical analysis, plots interactive SVG charts, and delivers email summaries.",
      status: "Paused",
      tools: ["CSV Ingester", "Python Sandbox", "Chart Plotter"],
      knowledgeBase: ["sales-targets-q2", "chart-branding-tokens"],
      memoryLimit: "Episodic memory",
      createdDate: "2026-07-01",
    },
  ]);

  // Agent builder states
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [builderTab, setBuilderTab] = useState("general");
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("Developer helper");
  const [formDesc, setFormDesc] = useState("");
  const [formInstructions, setFormInstructions] = useState("");
  const [formTools, setFormTools] = useState<string[]>([]);
  const [formMemory, setFormMemory] = useState("Short-term buffer");

  const ALL_TOOLS = [
    "Google Search API",
    "PubMed API Client",
    "File System Sandbox",
    "Python Sandbox",
    "Git CLI",
    "Slack Webhook Messenger"
  ];

  const handleToolToggle = (tool: string) => {
    if (formTools.includes(tool)) {
      setFormTools(formTools.filter((t) => t !== tool));
    } else {
      setFormTools([...formTools, tool]);
    }
  };

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newAgent: Agent = {
      id: Date.now(),
      name: formName,
      role: formRole,
      description: formDesc || "Custom autonomous assistant.",
      status: "Idle",
      tools: formTools,
      knowledgeBase: ["default-system-rules"],
      memoryLimit: formMemory,
      createdDate: new Date().toISOString().split("T")[0],
    };

    setAgents([newAgent, ...agents]);
    setFormName("");
    setFormDesc("");
    setFormTools([]);
    setIsBuilderOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">AI Agents Workspace</h1>
          <p className="text-xs text-[#8D96A7] mt-1">Configure vector databases, tool sandboxes, and permissions for your AI employees.</p>
        </div>
        <button
          onClick={() => {
            setBuilderTab("general");
            setIsBuilderOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/10 self-start md:self-auto transition-all"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Assemble Agent</span>
        </button>
      </div>

      {/* Agents Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="bg-card-bg border border-border-color rounded-card p-5 shadow-card hover:border-[#2C313C]/80 transition-all duration-200 flex flex-col justify-between h-[300px]"
          >
            {/* Header info */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-[#16181D] border border-border-color rounded-xl text-primary">
                  <Bot className="h-5 w-5" />
                </div>
                <span className={cn(
                  "text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-full border",
                  agent.status === "Running" && "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
                  agent.status === "Paused" && "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20",
                  agent.status === "Idle" && "bg-neutral-800 text-[#B7BDC8] border-neutral-700",
                  agent.status === "Draft" && "bg-[#8D96A7]/10 text-[#8D96A7] border-[#8D96A7]/20"
                )}>
                  {agent.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-white">{agent.name}</h3>
                <span className="text-[10px] text-primary italic font-medium mt-0.5 inline-block">{agent.role}</span>
                <p className="text-[11px] text-[#B7BDC8] mt-2 leading-relaxed line-clamp-3">
                  {agent.description}
                </p>
              </div>
            </div>

            {/* Config summary details */}
            <div className="mt-4 pt-4 border-t border-border-color/40 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[9px] text-[#8D96A7]">
                <span>Active Tools Sandbox</span>
                <span className="font-mono text-white font-bold">{agent.tools.length} Attached</span>
              </div>
              <div className="flex items-center justify-between text-[9px] text-[#8D96A7]">
                <span>Knowledge Cache</span>
                <span className="font-mono text-white font-bold">{agent.knowledgeBase.length} docs</span>
              </div>
              <div className="flex items-center justify-between text-[9px] text-[#8D96A7] mt-1">
                <span>Created Date</span>
                <span className="font-mono">{agent.createdDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Multitab Agent Builder slide over/modal panel */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#20242C] w-full max-w-4xl rounded-modal border border-border-color shadow-2xl overflow-hidden flex flex-col h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-border-color flex items-center justify-between bg-card-bg flex-shrink-0">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-sm text-white">Assemble AI Agent Employee</h2>
              </div>
              <button 
                onClick={() => setIsBuilderOpen(false)}
                className="text-xs text-[#8D96A7] hover:text-white"
              >
                Close Builder
              </button>
            </div>

            {/* Builder tabs Switcher */}
            <div className="flex border-b border-border-color/60 bg-[#16181D]/60 flex-shrink-0">
              {["general", "instructions", "tools", "memory", "preview"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setBuilderTab(tab)}
                  className={cn(
                    "px-4 py-2.5 text-xs font-semibold capitalize relative transition-colors border-b-2",
                    builderTab === tab 
                      ? "text-primary border-primary font-bold bg-primary/5" 
                      : "text-[#8D96A7] hover:text-white border-transparent"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Builder form slot viewports */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              {builderTab === "general" && (
                <div className="flex flex-col gap-4 max-w-xl">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Agent Identifier / Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DocCompilerAgent"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Role Persona</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Software Quality Reviewer"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Description Brief</label>
                    <textarea
                      placeholder="Summarize the core tasks and automations this agent solves..."
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      className="p-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary h-24 resize-none"
                    />
                  </div>
                </div>
              )}

              {builderTab === "instructions" && (
                <div className="flex flex-col gap-4 h-full">
                  <div className="flex flex-col gap-1.5 h-full">
                    <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">System Instructions & Constraints</label>
                    <textarea
                      placeholder="You are an autonomous agent designed to... Follow these steps: 1... 2... Do not write logs without..."
                      value={formInstructions}
                      onChange={(e) => setFormInstructions(e.target.value)}
                      className="flex-1 p-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary font-mono leading-relaxed h-[260px] resize-none"
                    />
                  </div>
                </div>
              )}

              {builderTab === "tools" && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Select APIs & Tools Sandbox</h3>
                  <p className="text-[11px] text-[#8D96A7]">Grant this agent secure API credentials sandboxed accesses.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    {ALL_TOOLS.map((tool) => (
                      <button
                        key={tool}
                        type="button"
                        onClick={() => handleToolToggle(tool)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border text-xs text-left transition-all duration-150",
                          formTools.includes(tool)
                            ? "bg-primary/10 border-primary/40 text-primary"
                            : "bg-[#16181D] border-border-color text-[#B7BDC8] hover:text-white"
                        )}
                      >
                        <div className={cn(
                          "h-4.5 w-4.5 rounded border flex items-center justify-center flex-shrink-0",
                          formTools.includes(tool) ? "bg-primary border-primary text-white" : "border-border-color"
                        )}>
                          {formTools.includes(tool) && <Check className="h-3 w-3" />}
                        </div>
                        <span>{tool}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {builderTab === "memory" && (
                <div className="flex flex-col gap-4 max-w-xl">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Memory Allocation Settings</h3>
                  <div className="flex flex-col gap-4 mt-2">
                    {[
                      { label: "Short-term buffer", desc: "Saves current execution loop logs. Deleted after completion." },
                      { label: "Long-term sliding window", desc: "Indexes past runs in localized vector database for reference." },
                      { label: "Episodic memory", desc: "Custom summaries indexing target milestones in execution history." },
                    ].map((mem) => (
                      <label 
                        key={mem.label}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                          formMemory === mem.label 
                            ? "bg-primary/10 border-primary/40 text-primary" 
                            : "bg-[#16181D] border-border-color text-[#B7BDC8] hover:bg-hover-bg"
                        )}
                        onClick={() => setFormMemory(mem.label)}
                      >
                        <input 
                          type="radio" 
                          checked={formMemory === mem.label}
                          readOnly
                          className="mt-1 accent-primary" 
                        />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-white">{mem.label}</span>
                          <span className="text-[10px] text-[#8D96A7]">{mem.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {builderTab === "preview" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                  <div className="md:col-span-2 flex flex-col gap-2 bg-[#16181D] border border-border-color rounded-xl p-4 font-mono text-xs h-[300px]">
                    <div className="border-b border-border-color pb-2 mb-2 text-[#8D96A7]">
                      Copilot agent preview console.sh
                    </div>
                    <div className="flex-1 overflow-y-auto flex flex-col gap-1 text-[#8D96A7] scrollbar-thin">
                      <p className="text-primary font-bold">&gt; Mounting agent: {formName || "UntitledAgent"}</p>
                      <p>&gt; Loaded tools: {formTools.length || "None"}</p>
                      <p>&gt; Ready for test query.</p>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <input 
                        type="text" 
                        placeholder="Type test query here..." 
                        disabled
                        className="flex-1 px-3 py-2 text-xs rounded-lg border border-border-color bg-card-bg text-white focus:outline-none"
                      />
                      <button 
                        type="button" 
                        disabled
                        className="px-3 py-2 text-xs rounded-lg bg-primary text-white font-semibold"
                      >
                        Test
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-4 bg-[#16181D]/60 border border-border-color rounded-xl">
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] uppercase font-bold text-[#8D96A7]">Builder Status</span>
                      <h4 className="text-xs font-bold text-white">Assemble Complete</h4>
                      <p className="text-[10px] text-[#8D96A7] leading-relaxed">
                        Your agent is structured and ready to join active workflows. Confirm initialization below.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateAgent}
                      className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold text-xs transition-colors hover:bg-primary-hover shadow-lg shadow-primary/10"
                    >
                      Provision AI Agent
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer switcher */}
            <div className="p-4 border-t border-border-color bg-card-bg flex items-center justify-between flex-shrink-0 text-xs">
              <span className="text-[#8D96A7]">Workspace Seat allocation: 3/5 active</span>
              {builderTab !== "preview" && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs = ["general", "instructions", "tools", "memory", "preview"];
                    const nextIdx = tabs.indexOf(builderTab) + 1;
                    if (nextIdx < tabs.length) {
                      setBuilderTab(tabs[nextIdx]);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-colors"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
