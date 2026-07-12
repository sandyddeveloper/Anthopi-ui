"use client";
import React, { useState, useEffect } from "react";
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
  Copy,
  Folder,
  ArrowRight,
  Sliders,
  Database,
  Layers,
  Activity,
  X,
  Play,
  Pause,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

interface Agent {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
  description: string;
  category: string;
  category_details?: { id: string; name: string; code: string };
  status: "Running" | "Paused" | "Idle";
  tools: any[];
  knowledgeBase: string[];
  model: string;
  model_details?: { id: string; name: string; provider_name: string };
  provider: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  goal: string;
  behavior: string;
  restrictions: string;
  createdDate: string;
  lastUpdated: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Toolbar state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  // Wizard state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Wizard Form values
  const [wizName, setWizName] = useState("");
  const [wizAvatar, setWizAvatar] = useState("🤖");
  const [wizDesc, setWizDesc] = useState("");
  const [wizCategory, setWizCategory] = useState("");
  const [wizSystemPrompt, setWizSystemPrompt] = useState("");
  const [wizGoal, setWizGoal] = useState("");
  const [wizBehavior, setWizBehavior] = useState("");
  const [wizRestrictions, setWizRestrictions] = useState("");
  const [wizKnowledge, setWizKnowledge] = useState<string[]>([]);
  const [wizTools, setWizTools] = useState<string[]>([]);
  const [wizModelId, setWizModelId] = useState("");
  const [wizTemp, setWizTemp] = useState(0.7);
  const [wizTokens, setWizTokens] = useState(4096);

  // Details drawer overlay state
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [detailsTab, setDetailsTab] = useState<"overview" | "knowledge" | "tools" | "memory" | "prompt" | "usage" | "settings">("overview");

  // Actions context menu
  const [activeActionsMenu, setActiveActionsMenu] = useState<string | null>(null);

  // Fetch all initial data
  const loadWorkspaceData = async () => {
    setLoading(true);
    try {
      const [agentsRes, catsRes, modelsRes] = await Promise.all([
        apiClient.aiAgents.listAgents().catch(() => ({ data: [] })),
        apiClient.aiAgents.listCategories().catch(() => ({ data: [] })),
        apiClient.aiAgents.listModels().catch(() => ({ data: [] }))
      ]);

      const mappedAgents = (agentsRes.data || []).map((a: any) => ({
        id: a.id,
        name: a.name,
        avatar: a.avatar || "🤖",
        role: a.category_details?.name || "Assistant",
        description: a.description || "No description provided.",
        category: a.category_details?.name || "General",
        status: a.is_active ? ("Running" as const) : ("Paused" as const),
        tools: a.tools || [],
        knowledgeBase: a.knowledge_collections?.map((k: any) => k.name) || [],
        model: a.model_details?.name || "gpt-4o",
        provider: a.model_details?.provider_name || "OpenAI",
        temperature: a.temperature || 0.7,
        maxTokens: a.max_tokens || 4096,
        systemPrompt: a.system_prompt || "",
        goal: a.goal || "",
        behavior: a.behavior || "",
        restrictions: a.restrictions || "",
        createdDate: a.created_at ? new Date(a.created_at).toISOString().split("T")[0] : "Just now",
        lastUpdated: a.updated_at ? new Date(a.updated_at).toISOString().split("T")[0] : "Just now"
      }));

      setAgents(mappedAgents);
      setCategories(catsRes.data || []);
      setModels(modelsRes.data || []);

      if (catsRes.data && catsRes.data.length > 0) {
        setWizCategory(catsRes.data[0].id);
      }
      if (modelsRes.data && modelsRes.data.length > 0) {
        setWizModelId(modelsRes.data[0].id);
      }
    } catch (e) {
      console.error("Failed to load backend agents integration details:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, []);

  // Filter logic
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All" || agent.category === filterCategory;
    const matchesStatus = filterStatus === "All" || agent.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const nextStep = () => setWizardStep(prev => Math.min(prev + 1, 6));
  const prevStep = () => setWizardStep(prev => Math.max(prev - 1, 1));

  const resetWizard = () => {
    setWizName("");
    setWizAvatar("🤖");
    setWizDesc("");
    if (categories.length > 0) setWizCategory(categories[0].id);
    setWizSystemPrompt("");
    setWizGoal("");
    setWizBehavior("");
    setWizRestrictions("");
    setWizKnowledge([]);
    setWizTools([]);
    if (models.length > 0) setWizModelId(models[0].id);
    setWizTemp(0.7);
    setWizTokens(4096);
    setWizardStep(1);
    setIsWizardOpen(false);
  };

  const handleCreateAgentSubmit = async () => {
    if (!wizName.trim()) return;

    try {
      const payload = {
        name: wizName,
        description: wizDesc,
        category: wizCategory,
        system_prompt: wizSystemPrompt,
        temperature: wizTemp,
        model: wizModelId,
        visibility: "organization"
      };

      await apiClient.aiAgents.createAgent(payload);
      await loadWorkspaceData();
      resetWizard();
    } catch (e) {
      console.error("Failed to create agent:", e);
    }
  };

  const handleDuplicate = async (agent: Agent) => {
    try {
      await apiClient.aiAgents.duplicateAgent(agent.id);
      await loadWorkspaceData();
      setActiveActionsMenu(null);
    } catch (e) {
      console.error("Failed to duplicate agent:", e);
    }
  };

  const handleToggleStatus = (id: string) => {
    setAgents(agents.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === "Running" ? "Paused" : "Running";
        return { ...a, status: nextStatus };
      }
      return a;
    }));
    setActiveActionsMenu(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.aiAgents.deleteAgent(id);
      await loadWorkspaceData();
      setSelectedAgent(null);
      setActiveActionsMenu(null);
    } catch (e) {
      console.error("Failed to delete agent:", e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn text-left">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" /> AI Agents Workspace
          </h1>
          <p className="text-xs text-[#8D96A7] mt-1">
            Build, duplicate, and monitor autonomous AI employees configured with specific skills, models, and file access.
          </p>
        </div>
        <button
          onClick={() => setIsWizardOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/10 self-start md:self-auto transition-all cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Create Agent</span>
        </button>
      </div>

      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 bg-card-bg border border-border-color p-4 rounded-2xl shadow-card">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8D96A7]" />
          <input
            type="text"
            placeholder="Search agents by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#16181D] border border-border-color focus:border-primary/50 text-xs text-white pl-10 pr-4 py-2.5 rounded-xl outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#16181D] border border-border-color text-xs text-[#B7BDC8] px-3.5 py-2.5 rounded-xl outline-none focus:border-primary/50"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#16181D] border border-border-color text-xs text-[#B7BDC8] px-3.5 py-2.5 rounded-xl outline-none focus:border-primary/50"
          >
            <option value="All">All Statuses</option>
            <option value="Running">Running</option>
            <option value="Paused">Paused</option>
            <option value="Idle">Idle</option>
          </select>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-xs text-[#8D96A7] gap-2 bg-[#16181D]/15 border border-border-color rounded-2xl">
          <span className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Synchronizing agents registry...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredAgents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-[#16181D]/30 border border-dashed border-border-color rounded-2xl gap-4">
          <Bot className="h-10 w-10 text-[#8D96A7]" />
          <div className="text-center">
            <h3 className="text-sm font-bold text-white">No AI Agents Found</h3>
            <p className="text-xs text-[#8D96A7] mt-1">Create your first AI Employee to start automating work.</p>
          </div>
          <button 
            onClick={() => setIsWizardOpen(true)}
            className="px-4 py-2 text-xs font-bold bg-primary rounded-xl text-white hover:bg-primary/95 transition-all"
          >
            Create Agent
          </button>
        </div>
      )}

      {/* Grid of Agents */}
      {!loading && filteredAgents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="bg-card-bg border border-border-color hover:border-border-color/80 rounded-2xl p-5 shadow-card hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative group h-[290px]"
            >
              <div>
                {/* Card Title & Avatar */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-lg">
                      {agent.avatar}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white group-hover:text-primary transition-colors truncate max-w-[130px]">{agent.name}</span>
                      <span className="text-[10px] text-primary/80 font-bold uppercase tracking-wider mt-0.5">{agent.category}</span>
                    </div>
                  </div>

                  {/* Actions Dropdown Trigger */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveActionsMenu(activeActionsMenu === agent.id ? null : agent.id)}
                      className="p-1 rounded hover:bg-hover-bg text-[#8D96A7] hover:text-white"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    
                    {activeActionsMenu === agent.id && (
                      <div className="absolute right-0 top-7 w-36 bg-[#16181D] border border-border-color rounded-xl py-1 shadow-xl z-30">
                        <button
                          onClick={() => {
                            setSelectedAgent(agent);
                            setDetailsTab("overview");
                            setActiveActionsMenu(null);
                          }}
                          className="w-full text-left px-3 py-2 text-[11px] text-[#B7BDC8] hover:text-white hover:bg-hover-bg flex items-center gap-2"
                        >
                          <Eye className="h-3.5 w-3.5" /> Open details
                        </button>
                        <button
                          onClick={() => handleDuplicate(agent)}
                          className="w-full text-left px-3 py-2 text-[11px] text-[#B7BDC8] hover:text-white hover:bg-hover-bg flex items-center gap-2"
                        >
                          <Copy className="h-3.5 w-3.5" /> Duplicate
                        </button>
                        <button
                          onClick={() => handleToggleStatus(agent.id)}
                          className="w-full text-left px-3 py-2 text-[11px] text-[#B7BDC8] hover:text-white hover:bg-hover-bg flex items-center gap-2"
                        >
                          {agent.status === "Running" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                          {agent.status === "Running" ? "Disable" : "Enable"}
                        </button>
                        <div className="h-px bg-border-color/60 my-1" />
                        <button
                          onClick={() => handleDelete(agent.id)}
                          className="w-full text-left px-3 py-2 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11px] text-[#8D96A7] mt-4 line-clamp-3 leading-relaxed">
                  {agent.description}
                </p>
              </div>

              <div>
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-2 border-y border-[#1c1e24] py-3 my-4 text-[10px] text-[#8D96A7]">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-[#5A6376]">Model config</span>
                    <span className="font-bold text-white truncate">{agent.provider} - {agent.model}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-[#5A6376]">Knowledge</span>
                    <span className="font-bold text-white truncate">{agent.knowledgeBase.length} assets</span>
                  </div>
                </div>

                {/* Status Indicator & Tools */}
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border",
                    agent.status === "Running" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    agent.status === "Paused" && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                    agent.status === "Idle" && "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  )}>
                    {agent.status}
                  </span>
                  
                  <span className="text-[9px] text-[#5A6376] font-mono">
                    Updated {agent.lastUpdated}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6-Step Create Agent Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-left">
          <div className="w-full max-w-xl bg-card-bg border border-border-color rounded-2xl flex flex-col max-h-[85vh] overflow-hidden shadow-2xl animate-scaleIn">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border-color">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-primary/10 border border-primary/20 text-primary">
                  <Sparkles className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-bold text-white">Assemble AI Agent — Step {wizardStep} of 6</h3>
              </div>
              <button onClick={resetWizard} className="text-[#8D96A7] hover:text-white">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-5 scrollbar-thin">
              
              {/* STEP 1: General Settings */}
              {wizardStep === 1 && (
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">General Information</h4>
                  <div className="flex gap-4 items-center mb-2">
                    <span className="h-14 w-14 rounded-xl border border-border-color bg-[#16181D] flex items-center justify-center text-3xl">
                      {wizAvatar}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {["🤖", "✍️", "💬", "💼", "🚀", "📊", "🎯"].map(av => (
                        <button
                          key={av}
                          onClick={() => setWizAvatar(av)}
                          className={cn("h-8 w-8 rounded-lg border text-base flex items-center justify-center hover:bg-hover-bg cursor-pointer", wizAvatar === av ? "border-primary bg-primary/5" : "border-border-color")}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#8D96A7] uppercase font-bold">Agent Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Developer AI"
                      value={wizName}
                      onChange={(e) => setWizName(e.target.value)}
                      className="bg-[#16181D] border border-border-color focus:border-primary/50 text-xs text-white p-2.5 rounded-xl outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#8D96A7] uppercase font-bold">Category</label>
                    <select
                      value={wizCategory}
                      onChange={(e) => setWizCategory(e.target.value as any)}
                      className="bg-[#16181D] border border-border-color text-xs text-white p-2.5 rounded-xl outline-none"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#8D96A7] uppercase font-bold">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Describe what tasks this agent autonomously manages..."
                      value={wizDesc}
                      onChange={(e) => setWizDesc(e.target.value)}
                      className="bg-[#16181D] border border-border-color focus:border-primary/50 text-xs text-white p-2.5 rounded-xl outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Instructions */}
              {wizardStep === 2 && (
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Persona & Safety Constraints</h4>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#8D96A7] uppercase font-bold">System Prompt</label>
                    <textarea
                      rows={4}
                      placeholder="Define the prompt commands loaded in system context..."
                      value={wizSystemPrompt}
                      onChange={(e) => setWizSystemPrompt(e.target.value)}
                      className="bg-[#16181D] border border-border-color focus:border-primary/50 text-xs text-white p-2.5 rounded-xl outline-none font-mono resize-none text-[11px]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#8D96A7] uppercase font-bold">Primary Goal</label>
                    <input
                      type="text"
                      placeholder="e.g. Audit software code errors and compile builds"
                      value={wizGoal}
                      onChange={(e) => setWizGoal(e.target.value)}
                      className="bg-[#16181D] border border-border-color focus:border-primary/50 text-xs text-white p-2.5 rounded-xl outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-[#8D96A7] uppercase font-bold">Target Behavior</label>
                      <input
                        type="text"
                        placeholder="e.g. Precise, structured, debug-first"
                        value={wizBehavior}
                        onChange={(e) => setWizBehavior(e.target.value)}
                        className="bg-[#16181D] border border-border-color focus:border-primary/50 text-xs text-white p-2.5 rounded-xl outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-[#8D96A7] uppercase font-bold">Restrictions</label>
                      <input
                        type="text"
                        placeholder="e.g. Never update settings or delete records"
                        value={wizRestrictions}
                        onChange={(e) => setWizRestrictions(e.target.value)}
                        className="bg-[#16181D] border border-border-color focus:border-primary/50 text-xs text-white p-2.5 rounded-xl outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Knowledge Assignment */}
              {wizardStep === 3 && (
                <div className="flex flex-col gap-4 text-left">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Assign Knowledge Databases</h4>
                  <p className="text-[11px] text-[#8D96A7]">Select collections to expose as retrieved contexts in agent RAG loops.</p>
                  
                  <div className="flex flex-col gap-2">
                    {[
                      { id: "nextjs-agent-rules", title: "nextjs-agent-rules.md", size: "12 chunks" },
                      { id: "brand-identity-handbook", title: "brand-identity-handbook.pdf", size: "48 chunks" },
                      { id: "sales-targets-q2", title: "sales-targets-q2.xlsx", size: "140 chunks" }
                    ].map(item => {
                      const active = wizKnowledge.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (active) {
                              setWizKnowledge(wizKnowledge.filter(k => k !== item.id));
                            } else {
                              setWizKnowledge([...wizKnowledge, item.id]);
                            }
                          }}
                          className={cn("p-3 rounded-xl border flex items-center justify-between cursor-pointer hover:bg-hover-bg transition-colors", active ? "border-primary bg-primary/5 text-primary" : "border-border-color text-white")}
                        >
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            <span className="text-xs font-bold">{item.title}</span>
                          </div>
                          <span className="text-[10px] text-[#8D96A7]">{item.size}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: Tools Checkbox */}
              {wizardStep === 4 && (
                <div className="flex flex-col gap-4 text-left">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Assign Tools & Capabilities</h4>
                  <p className="text-[11px] text-[#8D96A7]">Tick the capabilities the agent is authorized to run during execution.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { id: "Search Projects", desc: "Allows searching team issues & code milestones." },
                      { id: "Search Employees", desc: "Retrieves profiles, email address details." },
                      { id: "Calculator", desc: "Performs precise mathematical compute loops." },
                      { id: "Files", desc: "Reads, writes, and edits markdown/txt files." }
                    ].map(tool => {
                      const active = wizTools.includes(tool.id);
                      return (
                        <div
                          key={tool.id}
                          onClick={() => {
                            if (active) {
                              setWizTools(wizTools.filter(t => t !== tool.id));
                            } else {
                              setWizTools([...wizTools, tool.id]);
                            }
                          }}
                          className={cn("p-4 rounded-xl border flex flex-col gap-1 cursor-pointer hover:bg-hover-bg transition-all", active ? "border-primary bg-primary/5" : "border-border-color")}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{tool.id}</span>
                            <span className={cn("h-4 w-4 rounded-md border flex items-center justify-center text-[10px]", active ? "border-primary bg-primary text-white" : "border-border-color")}>
                              {active && "✓"}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#8D96A7] leading-relaxed mt-1">{tool.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 5: Model Parameters */}
              {wizardStep === 5 && (
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">LLM Engine Configuration</h4>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#8D96A7] uppercase font-bold">Select Active Engine Model</label>
                    <select
                      value={wizModelId}
                      onChange={(e) => setWizModelId(e.target.value)}
                      className="bg-[#16181D] border border-border-color text-xs text-white p-2.5 rounded-xl outline-none"
                    >
                      {models.map(m => (
                        <option key={m.id} value={m.id}>{m.provider_name} - {m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1 mt-2">
                    <div className="flex justify-between text-[10px] text-[#8D96A7] font-bold uppercase">
                      <span>Temperature</span>
                      <span className="text-primary font-mono">{wizTemp}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={wizTemp}
                      onChange={(e) => setWizTemp(parseFloat(e.target.value))}
                      className="w-full accent-primary bg-[#16181D] h-1.5 rounded-full outline-none mt-2"
                    />
                    <div className="flex justify-between text-[8px] text-[#5A6376] mt-1 font-mono">
                      <span>0.0 (Strict)</span>
                      <span>1.0 (Creative)</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 mt-2">
                    <label className="text-[10px] text-[#8D96A7] uppercase font-bold">Max Output Tokens</label>
                    <input
                      type="number"
                      value={wizTokens}
                      onChange={(e) => setWizTokens(parseInt(e.target.value) || 2048)}
                      className="bg-[#16181D] border border-border-color text-xs text-white p-2.5 rounded-xl outline-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 6: Review & Assemble */}
              {wizardStep === 6 && (
                <div className="flex flex-col gap-4 text-left">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Confirm Configuration</h4>
                  
                  <div className="bg-[#16181D] border border-border-color rounded-xl p-4 flex flex-col gap-3 text-xs">
                    <div className="flex items-center gap-3 border-b border-border-color/60 pb-3">
                      <span className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-xl">
                        {wizAvatar}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{wizName || "Unnamed Agent"}</span>
                        <span className="text-[10px] text-[#8D96A7]">
                          Category: {categories.find(c => c.id === wizCategory)?.name || "General"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <span className="text-[9px] text-[#5A6376] uppercase font-bold block">Engine Model</span>
                        <span className="text-white font-medium">
                          {models.find(m => m.id === wizModelId)?.name || "Selected Engine"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#5A6376] uppercase font-bold block">Temperature</span>
                        <span className="text-white font-medium">{wizTemp}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#5A6376] uppercase font-bold block">Authorized Tools</span>
                        <span className="text-white font-medium">{wizTools.join(", ") || "None"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#5A6376] uppercase font-bold block">Knowledge Sources</span>
                        <span className="text-white font-medium">{wizKnowledge.length} assets assigned</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-xl text-[10px] text-primary">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>Confirming will immediately initialize this agent as an active member in the workspace.</span>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-border-color flex justify-between bg-[#16181D]/40">
              <button
                onClick={wizardStep === 1 ? resetWizard : prevStep}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border-color text-[#B7BDC8] hover:text-white hover:bg-hover-bg cursor-pointer"
              >
                {wizardStep === 1 ? "Cancel" : "Back"}
              </button>
              
              <button
                onClick={wizardStep === 6 ? handleCreateAgentSubmit : nextStep}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/95 transition-all shadow-md shadow-primary/10 cursor-pointer"
              >
                {wizardStep === 6 ? "Assemble Agent" : "Continue"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Sliding Side Drawer for Agent Details */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs text-left">
          <div className="fixed inset-0" onClick={() => setSelectedAgent(null)} />
          
          <div className="relative w-full max-w-2xl bg-card-bg border-l border-border-color h-full flex flex-col z-10 shadow-2xl animate-slideLeft">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-border-color flex items-center justify-between bg-[#14161d]">
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl">
                  {selectedAgent.avatar}
                </span>
                <div className="flex flex-col">
                  <h3 className="text-sm font-bold text-white">{selectedAgent.name}</h3>
                  <span className="text-[10px] text-[#8D96A7] font-semibold">Workspace member since {selectedAgent.createdDate}</span>
                </div>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="p-1 rounded hover:bg-hover-bg text-[#8D96A7]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-border-color bg-[#16181d] px-4 overflow-x-auto">
              {[
                { id: "overview", label: "Overview" },
                { id: "knowledge", label: "Knowledge" },
                { id: "tools", label: "Tools" },
                { id: "memory", label: "Memory" },
                { id: "prompt", label: "Prompt" },
                { id: "usage", label: "Usage" },
                { id: "settings", label: "Settings" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDetailsTab(tab.id as any)}
                  className={cn("px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap", detailsTab === tab.id ? "border-primary text-primary" : "border-transparent text-[#8D96A7] hover:text-white")}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Drawer Tab Content */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 scrollbar-thin">
              
              {/* TAB 1: Overview */}
              {detailsTab === "overview" && (
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#16181D] border border-border-color/60 rounded-xl p-4">
                      <span className="text-[9px] text-[#5A6376] uppercase font-bold block mb-1">Category</span>
                      <span className="text-xs font-bold text-white">{selectedAgent.category}</span>
                    </div>
                    <div className="bg-[#16181D] border border-border-color/60 rounded-xl p-4">
                      <span className="text-[9px] text-[#5A6376] uppercase font-bold block mb-1">Owner</span>
                      <span className="text-xs font-bold text-white">System Admin</span>
                    </div>
                    <div className="bg-[#16181D] border border-border-color/60 rounded-xl p-4">
                      <span className="text-[9px] text-[#5A6376] uppercase font-bold block mb-1">Created Date</span>
                      <span className="text-xs font-bold text-white">{selectedAgent.createdDate}</span>
                    </div>
                    <div className="bg-[#16181D] border border-border-color/60 rounded-xl p-4">
                      <span className="text-[9px] text-[#5A6376] uppercase font-bold block mb-1">Model Engine</span>
                      <span className="text-xs font-bold text-white">{selectedAgent.provider} ({selectedAgent.model})</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Agent Bio</h4>
                    <p className="text-xs text-[#8D96A7] leading-relaxed bg-[#16181D] border border-border-color/40 rounded-xl p-4">
                      {selectedAgent.description}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: Knowledge Table */}
              {detailsTab === "knowledge" && (
                <div className="flex flex-col gap-4 text-left">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Assigned Knowledge Bases</h4>
                  <div className="border border-border-color rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#16181D] border-b border-border-color text-[#8D96A7] font-bold">
                          <th className="p-3">Collection</th>
                          <th className="p-3">Documents</th>
                          <th className="p-3">Permission</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1c1e24] text-white">
                        <tr className="hover:bg-hover-bg/30">
                          <td className="p-3 font-semibold text-primary">nextjs-agent-rules</td>
                          <td className="p-3 font-mono text-[#8D96A7]">1 document</td>
                          <td className="p-3">
                            <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-primary/10 border border-primary/20 text-primary">
                              Read Only
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: Tools cards */}
              {detailsTab === "tools" && (
                <div className="flex flex-col gap-4 text-left">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-semibold">Authorized Tools</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedAgent.tools.map((t: any, idx) => (
                      <div key={idx} className="bg-[#16181D] border border-border-color rounded-xl p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-primary" />
                            <span className="text-xs font-bold text-white">{t.tool_details?.name || "API Tool"}</span>
                          </div>
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        </div>
                        <p className="text-[10px] text-[#8D96A7]">
                          {t.tool_details?.description || "Authorized sandbox execution capability."}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: Memory key values */}
              {detailsTab === "memory" && (
                <div className="flex flex-col gap-4 text-left">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Agent Episodic Memory</h4>
                  <div className="flex flex-col gap-2">
                    {[
                      { key: "active_project_id", value: "proj_902a", updated: "2 mins ago" },
                      { key: "user_preferences_draft", value: "clean-theme-typescript", updated: "1 hour ago" }
                    ].map((mem, idx) => (
                      <div key={idx} className="bg-[#16181D] border border-border-color rounded-xl p-3 flex justify-between items-center text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-primary text-[11px]">{mem.key}</span>
                          <span className="text-white text-[11px]">{mem.value}</span>
                        </div>
                        <span className="text-[9px] text-[#5A6376] font-mono">Updated {mem.updated}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: Prompt editor */}
              {detailsTab === "prompt" && (
                <div className="flex flex-col gap-4 text-left">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#8D96A7] uppercase font-bold">System Prompt Command</label>
                    <textarea
                      rows={5}
                      value={selectedAgent.systemPrompt}
                      onChange={(e) => {
                        const updatedPrompt = e.target.value;
                        setAgents(agents.map(a => a.id === selectedAgent.id ? { ...a, systemPrompt: updatedPrompt } : a));
                        setSelectedAgent({ ...selectedAgent, systemPrompt: updatedPrompt });
                      }}
                      className="w-full bg-[#16181D] border border-border-color focus:border-primary/50 text-xs text-white p-3 rounded-xl outline-none font-mono resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-[#8D96A7] uppercase font-bold">Instruction variables</span>
                    <div className="flex gap-2">
                      <span className="text-[10px] px-2.5 py-1 rounded bg-[#16181D] border border-border-color font-mono text-[#B7BDC8]">{"{user_name}"}</span>
                      <span className="text-[10px] px-2.5 py-1 rounded bg-[#16181D] border border-border-color font-mono text-[#B7BDC8]">{"{project_context}"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: Usage charts */}
              {detailsTab === "usage" && (
                <div className="flex flex-col gap-5 text-left">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Token throughput share</h4>
                  
                  {/* SVG Chart */}
                  <div className="h-44 bg-[#14151b] border border-border-color/40 rounded-xl p-4 relative flex items-end">
                    <svg className="absolute inset-0 h-full w-full p-2" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M 0,80 Q 25,20 50,45 T 100,10 L 100,100 L 0,100 Z" fill="url(#areaGrad)" />
                      <path d="M 0,80 Q 25,20 50,45 T 100,10" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
                    </svg>
                    <div className="absolute inset-x-0 bottom-1 flex justify-between px-3 text-[9px] text-[#5A6376] font-mono">
                      <span>10m ago</span>
                      <span>5m ago</span>
                      <span>Now</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="bg-[#16181D] border border-border-color/60 rounded-xl p-3">
                      <span className="text-[9px] text-[#8D96A7] uppercase block font-bold">Runs</span>
                      <span className="text-white font-extrabold text-lg mt-1 block">142</span>
                    </div>
                    <div className="bg-[#16181D] border border-border-color/60 rounded-xl p-3">
                      <span className="text-[9px] text-[#8D96A7] uppercase block font-bold">Total Tokens</span>
                      <span className="text-white font-extrabold text-lg mt-1 block">854k</span>
                    </div>
                    <div className="bg-[#16181D] border border-border-color/60 rounded-xl p-3">
                      <span className="text-[9px] text-[#8D96A7] uppercase block font-bold">Billing Cost</span>
                      <span className="text-emerald-400 font-extrabold text-lg mt-1 block">$17.08</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: Settings */}
              {detailsTab === "settings" && (
                <div className="flex flex-col gap-6 text-left">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Danger Zone</h4>
                    <p className="text-[11px] text-[#8D96A7]">Operations below cannot be undone. Exercise caution.</p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleToggleStatus(selectedAgent.id)}
                      className="px-4 py-3 bg-[#1d1f27] border border-border-color hover:border-[#EF4444]/35 hover:bg-[#EF4444]/5 text-xs text-white rounded-xl text-left font-semibold flex justify-between items-center group transition-all"
                    >
                      <div>
                        <span className="block font-bold">Disable Agent Employee</span>
                        <span className="text-[10px] text-[#8D96A7] font-medium mt-0.5 block">Temporarily suspend prompt polling activity.</span>
                      </div>
                      <span className="text-[10px] text-[#8D96A7] font-bold group-hover:text-white uppercase tracking-wider">
                        {selectedAgent.status === "Running" ? "Disable" : "Enable"}
                      </span>
                    </button>

                    <button
                      onClick={() => handleDelete(selectedAgent.id)}
                      className="px-4 py-3 bg-[#EF4444]/5 border border-[#EF4444]/20 hover:border-[#EF4444] hover:bg-[#EF4444]/10 text-xs text-red-400 rounded-xl text-left font-semibold flex justify-between items-center group transition-all cursor-pointer"
                    >
                      <div>
                        <span className="block font-bold">Permanently Terminate</span>
                        <span className="text-[10px] text-red-400/80 font-medium mt-0.5 block">Delete the agent configurations and memory indexes.</span>
                      </div>
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
