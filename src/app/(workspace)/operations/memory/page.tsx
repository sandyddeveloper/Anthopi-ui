"use client";
import React, { useState, useEffect } from "react";
import { 
  Brain, 
  Search, 
  Trash2, 
  Edit3, 
  SlidersHorizontal, 
  Merge, 
  FileText, 
  Layers, 
  Check, 
  X, 
  Info,
  Calendar,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Plus
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function AIMemoryCenter() {
  const [activeTab, setActiveTab] = useState<string>("all"); // 'all', 'user', 'project', 'organization', 'conversation', 'workflow', 'agent'
  const [memories, setMemories] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedType, setSelectedType] = useState(""); // fact, preference, decision, relationship, task, summary
  
  // Selection for Merge action
  const [selectedMemories, setSelectedMemories] = useState<string[]>([]);
  
  // Modals / Inspector Panel
  const [inspectingMemory, setInspectingMemory] = useState<any>(null);
  const [editingMemory, setEditingMemory] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form states
  const [newContent, setNewContent] = useState("");
  const [newLevel, setNewLevel] = useState("organization");
  const [newType, setNewType] = useState("fact");
  const [newConfidence, setNewConfidence] = useState(1.0);
  const [newAgentId, setNewAgentId] = useState("");
  const [newProjectId, setNewProjectId] = useState("");

  const mockMemories = [
    { id: "mem-1", level: "organization", type: "fact", content: "Platform operates on UTC. Database backup occurs daily at 02:00 UTC.", confidence_score: 1.0, agent: "Developer AI", project: "All Projects", updated_at: "2026-07-16T12:00:00Z" },
    { id: "mem-2", level: "user", type: "preference", content: "Lead Developer (Santhosh) prefers server-side rendering over client-side for public landing screens.", confidence_score: 0.95, agent: "Developer AI", project: "Anthopi-ui", updated_at: "2026-07-17T09:40:00Z" },
    { id: "mem-3", level: "project", type: "decision", content: "Deployment switched from Vercel to self-hosted AWS ECS for cost optimization.", confidence_score: 0.9, agent: "DevOps Agent", project: "Corporate Site", updated_at: "2026-07-15T15:20:00Z" },
    { id: "mem-4", level: "conversation", type: "relationship", content: "Client 'Alpha Corp' expressed frustration with API throttle rates; suggest rate limit upgrade.", confidence_score: 0.85, agent: "Support AI", project: "API Gateway", updated_at: "2026-07-17T14:10:00Z" },
    { id: "mem-5", level: "workflow", type: "summary", content: "Weekly invoice verification run successfully checked 14 invoices, 1 failed due to missing IBAN.", confidence_score: 1.0, agent: "Invoice Bot", project: "Finance Automations", updated_at: "2026-07-14T08:00:00Z" }
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const [memoriesRes, agentsRes, projectsRes] = await Promise.all([
        apiClient.operations.listMemories().catch(() => ({ data: [] })),
        apiClient.aiAgents.listAgents().catch(() => ({ data: [] })),
        apiClient.projects.listProjects().catch(() => ({ data: [] }))
      ]);

      // If backend has no data, fall back to mock data
      setMemories(memoriesRes.data?.length > 0 ? memoriesRes.data : mockMemories);
      setAgents(agentsRes.data || []);
      setProjects(projectsRes.data || []);
    } catch (err) {
      console.error("Failed to load Memory Center:", err);
      setMemories(mockMemories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      const payload = {
        level: newLevel,
        type: newType,
        content: newContent,
        confidence_score: newConfidence,
        agent: newAgentId || null,
        project: newProjectId || null
      };

      const res = await apiClient.operations.createMemory(payload);
      setMemories([res.data, ...memories]);
      setShowCreateModal(false);
      setNewContent("");
    } catch (err) {
      // Simulate creation locally if API throws or falls back
      const simulatedNew = {
        id: `mem-${Date.now()}`,
        level: newLevel,
        type: newType,
        content: newContent,
        confidence_score: newConfidence,
        agent: agents.find(a => a.id === newAgentId)?.name || "Manual Entry",
        project: projects.find(p => p.id === newProjectId)?.name || "Direct Input",
        updated_at: new Date().toISOString()
      };
      setMemories([simulatedNew, ...memories]);
      setShowCreateModal(false);
      setNewContent("");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMemory || !editingMemory.content.trim()) return;

    try {
      const res = await apiClient.operations.updateMemory(editingMemory.id, {
        content: editingMemory.content,
        level: editingMemory.level,
        type: editingMemory.type,
        confidence_score: editingMemory.confidence_score
      });

      setMemories(memories.map(m => m.id === editingMemory.id ? res.data : m));
      setEditingMemory(null);
    } catch (err) {
      // Simulate locally
      setMemories(memories.map(m => m.id === editingMemory.id ? { ...m, ...editingMemory, updated_at: new Date().toISOString() } : m));
      setEditingMemory(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want Synapse to forget this memory?")) return;
    try {
      await apiClient.operations.deleteMemory(id);
      setMemories(memories.filter(m => m.id !== id));
      if (inspectingMemory?.id === id) setInspectingMemory(null);
    } catch (err) {
      // Simulate locally
      setMemories(memories.filter(m => m.id !== id));
      if (inspectingMemory?.id === id) setInspectingMemory(null);
    }
  };

  const handleMerge = async () => {
    if (selectedMemories.length !== 2) return;
    const [primaryId, secondaryId] = selectedMemories;

    try {
      const res = await apiClient.operations.mergeMemories(primaryId, secondaryId);
      // Remove secondary, update primary
      setMemories(memories.filter(m => m.id !== secondaryId).map(m => m.id === primaryId ? res.data : m));
      setSelectedMemories([]);
      alert("Memories merged successfully!");
    } catch (err) {
      // Simulate merge locally
      const primary = memories.find(m => m.id === primaryId);
      const secondary = memories.find(m => m.id === secondaryId);
      if (primary && secondary) {
        const merged = {
          ...primary,
          content: `${primary.content}\n[Merged]: ${secondary.content}`,
          confidence_score: Math.max(primary.confidence_score, secondary.confidence_score),
          updated_at: new Date().toISOString()
        };
        setMemories(memories.filter(m => m.id !== secondaryId).map(m => m.id === primaryId ? merged : m));
      }
      setSelectedMemories([]);
      alert("Memories merged (locally simulated)!");
    }
  };

  const toggleSelectMemory = (id: string) => {
    if (selectedMemories.includes(id)) {
      setSelectedMemories(selectedMemories.filter(x => x !== id));
    } else {
      if (selectedMemories.length < 2) {
        setSelectedMemories([...selectedMemories, id]);
      } else {
        // Swap out the last selected item
        setSelectedMemories([selectedMemories[1], id]);
      }
    }
  };

  const levelTabs = [
    { id: "all", label: "All Memories" },
    { id: "user", label: "User Memory" },
    { id: "project", label: "Project Memory" },
    { id: "organization", label: "Organization Memory" },
    { id: "conversation", label: "Conversation Memory" },
    { id: "workflow", label: "Workflow Memory" }
  ];

  // Filtering Logic
  const filteredMemories = memories.filter(mem => {
    // 1. Tab filter
    if (activeTab !== "all" && mem.level !== activeTab) return false;
    
    // 2. Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const contentMatches = mem.content?.toLowerCase().includes(query);
      const typeMatches = mem.type?.toLowerCase().includes(query);
      const agentMatches = typeof mem.agent === "string" ? mem.agent.toLowerCase().includes(query) : mem.agent?.name?.toLowerCase().includes(query);
      const projectMatches = typeof mem.project === "string" ? mem.project.toLowerCase().includes(query) : mem.project?.name?.toLowerCase().includes(query);
      if (!contentMatches && !typeMatches && !agentMatches && !projectMatches) return false;
    }

    // 3. Agent Filter
    if (selectedAgent) {
      const memAgentId = typeof mem.agent === "object" ? mem.agent?.id : mem.agent;
      if (memAgentId !== selectedAgent && mem.agent !== selectedAgent) return false;
    }

    // 4. Project Filter
    if (selectedProject) {
      const memProjId = typeof mem.project === "object" ? mem.project?.id : mem.project;
      if (memProjId !== selectedProject && mem.project !== selectedProject) return false;
    }

    // 5. Type Filter
    if (selectedType && mem.type !== selectedType) return false;

    return true;
  });

  const getAgentLabel = (agent: any) => {
    if (!agent) return "System";
    if (typeof agent === "string") return agent;
    return agent.name || "AI Agent";
  };

  const getProjectLabel = (project: any) => {
    if (!project) return "Global";
    if (typeof project === "string") return project;
    return project.name || "Workspace";
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 text-left text-white animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#16181D] p-6 rounded-2xl border border-border-color/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AI Memory Center</h1>
            <p className="text-xs text-[#8D96A7]">Inspect, edit, and consolidate facts, preferences, and decisions saved by your AI workforce.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/95 flex items-center gap-1.5 transition-all cursor-pointer text-white-force"
        >
          <Plus className="h-4 w-4" /> Add Memory
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-border-color overflow-x-auto scrollbar-none gap-2">
        {levelTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedMemories([]); }}
            className={`px-4 py-2 text-xs font-bold whitespace-nowrap transition-all border-b-2 -mb-[2px] cursor-pointer ${
              activeTab === tab.id 
                ? "border-primary text-primary" 
                : "border-transparent text-[#8D96A7] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters Control & Operations actions */}
      <div className="bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8D96A7]" />
            <input
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111216] border border-border-color focus:border-primary/50 text-white rounded-xl pl-9.5 pr-4 py-2 text-xs outline-none transition-colors placeholder:text-[#5b6375]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Type selector */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-[#111216] border border-border-color text-xs rounded-xl px-3 py-2 text-[#8D96A7] outline-none hover:text-white transition-colors"
            >
              <option value="">All Types</option>
              <option value="fact">Fact</option>
              <option value="preference">Preference</option>
              <option value="decision">Decision</option>
              <option value="relationship">Relationship</option>
              <option value="task">Task</option>
              <option value="summary">Summary</option>
            </select>

            {/* Agent Selector */}
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="bg-[#111216] border border-border-color text-xs rounded-xl px-3 py-2 text-[#8D96A7] outline-none hover:text-white transition-colors"
            >
              <option value="">All Agents</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              <option value="Developer AI">Developer AI</option>
              <option value="Support AI">Support AI</option>
              <option value="Invoice Bot">Invoice Bot</option>
            </select>

            {/* Project Selector */}
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-[#111216] border border-border-color text-xs rounded-xl px-3 py-2 text-[#8D96A7] outline-none hover:text-white transition-colors"
            >
              <option value="">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              <option value="Anthopi-ui">Anthopi-ui</option>
              <option value="Corporate Site">Corporate Site</option>
            </select>

            {/* Merge Action Trigger */}
            {selectedMemories.length === 2 && (
              <button
                onClick={handleMerge}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all text-white-force cursor-pointer animate-pulse"
              >
                <Merge className="h-4 w-4" /> Merge Selected ({selectedMemories.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-[#16181D] border border-border-color rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-xs text-[#8D96A7]">Reading long-term memory...</span>
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
            <div className="h-16 w-16 bg-[#111216] border border-border-color rounded-2xl flex items-center justify-center">
              <Brain className="h-7 w-7 text-[#5b6375]" />
            </div>
            <div className="flex flex-col gap-1 max-w-sm">
              <h3 className="text-sm font-bold text-white">No memory stored yet.</h3>
              <p className="text-xs text-[#8D96A7]">AI agents create memory events automatically during conversation execution, or you can register new ones manually.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#111216] text-[#8D96A7] font-extrabold uppercase border-b border-border-color tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4.5 w-10">Select</th>
                  <th className="px-6 py-4.5">Memory Detail</th>
                  <th className="px-6 py-4.5">Level / Type</th>
                  <th className="px-6 py-4.5">AI Agent</th>
                  <th className="px-6 py-4.5">Source/Project</th>
                  <th className="px-6 py-4.5">Confidence</th>
                  <th className="px-6 py-4.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color/40">
                {filteredMemories.map((mem) => {
                  const isSelected = selectedMemories.includes(mem.id);
                  return (
                    <tr 
                      key={mem.id}
                      className={`hover:bg-[#1c1e26] transition-colors ${isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleSelectMemory(mem.id)}
                          className={`h-4 w-4 rounded border flex items-center justify-center transition-all cursor-pointer ${
                            isSelected 
                              ? "bg-primary border-primary text-white" 
                              : "border-border-color hover:border-[#8D96A7] bg-transparent text-transparent"
                          }`}
                        >
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </button>
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        <p className="text-white font-medium line-clamp-2 leading-relaxed">{mem.content}</p>
                        <span className="text-[10px] text-[#5b6375] font-semibold flex items-center gap-1.5 mt-1">
                          <Calendar className="h-3 w-3" /> Updated {new Date(mem.updated_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase self-start ${
                            mem.level === "organization" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                            mem.level === "project" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                            mem.level === "user" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                            "bg-neutral-800 text-neutral-400 border border-neutral-700"
                          }`}>
                            {mem.level}
                          </span>
                          <span className="text-[10px] text-[#8D96A7] font-semibold capitalize">{mem.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-white">
                        {getAgentLabel(mem.agent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-[#8D96A7]">
                        {getProjectLabel(mem.project)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-16 bg-[#111216] rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${mem.confidence_score > 0.9 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                              style={{ width: `${mem.confidence_score * 100}%` }}
                            />
                          </div>
                          <span className="font-extrabold text-[10px] text-white">{(mem.confidence_score * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectingMemory(mem)}
                            className="p-1.5 rounded-lg border border-border-color text-[#8D96A7] hover:text-white hover:bg-hover-bg transition-colors cursor-pointer"
                            title="Inspect Details"
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingMemory({ ...mem })}
                            className="p-1.5 rounded-lg border border-border-color text-[#8D96A7] hover:text-white hover:bg-hover-bg transition-colors cursor-pointer"
                            title="Edit Memory"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(mem.id)}
                            className="p-1.5 rounded-lg border border-border-color text-[#8D96A7] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-colors cursor-pointer"
                            title="Wipe Memory"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspector Details Modal/Drawer */}
      {inspectingMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#16181D] border border-border-color rounded-2xl shadow-2xl p-6 text-left">
            <button 
              onClick={() => setInspectingMemory(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-hover-bg text-[#8D96A7] hover:text-white cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <div className="flex items-center gap-2 border-b border-border-color pb-3 mb-4">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-black uppercase text-white">Inspect Memory Layer</h3>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="p-3 bg-[#111216] rounded-xl border border-border-color">
                <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider block mb-1">Content</span>
                <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">{inspectingMemory.content}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-[#8D96A7] uppercase block mb-0.5">Memory Level</span>
                  <span className="text-xs text-white capitalize">{inspectingMemory.level}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#8D96A7] uppercase block mb-0.5">Fact Classification</span>
                  <span className="text-xs text-white capitalize">{inspectingMemory.type}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#8D96A7] uppercase block mb-0.5">Author Agent</span>
                  <span className="text-xs text-white">{getAgentLabel(inspectingMemory.agent)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#8D96A7] uppercase block mb-0.5">Assigned Project</span>
                  <span className="text-xs text-white">{getProjectLabel(inspectingMemory.project)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#8D96A7] uppercase block mb-0.5">Confidence Level</span>
                  <span className="text-xs text-white">{(inspectingMemory.confidence_score * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#8D96A7] uppercase block mb-0.5">Memory Registered</span>
                  <span className="text-xs text-white">{new Date(inspectingMemory.updated_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editing Memory Modal */}
      {editingMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleEdit} className="relative w-full max-w-lg bg-[#16181D] border border-border-color rounded-2xl shadow-2xl p-6 text-left">
            <button 
              type="button"
              onClick={() => setEditingMemory(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-hover-bg text-[#8D96A7] hover:text-white cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <div className="flex items-center gap-2 border-b border-border-color pb-3 mb-4">
              <Edit3 className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-black uppercase text-white">Edit Memory Content</h3>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#8D96A7] uppercase">Memory Statement</label>
                <textarea
                  value={editingMemory.content}
                  onChange={(e) => setEditingMemory({ ...editingMemory, content: e.target.value })}
                  rows={4}
                  className="w-full bg-[#111216] border border-border-color rounded-xl p-3 text-xs outline-none focus:border-primary/50 text-white leading-relaxed resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#8D96A7] uppercase">Level</label>
                  <select
                    value={editingMemory.level}
                    onChange={(e) => setEditingMemory({ ...editingMemory, level: e.target.value })}
                    className="bg-[#111216] border border-border-color text-xs rounded-xl p-2.5 outline-none text-white focus:border-primary/50"
                  >
                    <option value="organization">Organization</option>
                    <option value="project">Project</option>
                    <option value="user">User</option>
                    <option value="conversation">Conversation</option>
                    <option value="workflow">Workflow</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#8D96A7] uppercase">Type</label>
                  <select
                    value={editingMemory.type}
                    onChange={(e) => setEditingMemory({ ...editingMemory, type: e.target.value })}
                    className="bg-[#111216] border border-border-color text-xs rounded-xl p-2.5 outline-none text-white focus:border-primary/50"
                  >
                    <option value="fact">Fact</option>
                    <option value="preference">Preference</option>
                    <option value="decision">Decision</option>
                    <option value="relationship">Relationship</option>
                    <option value="task">Task</option>
                    <option value="summary">Summary</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-border-color/40 pt-4">
              <button 
                type="button" 
                onClick={() => setEditingMemory(null)}
                className="px-4 py-2 border border-border-color hover:bg-hover-bg rounded-xl text-xs font-semibold text-[#8D96A7] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer text-white-force"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Memory Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleCreate} className="relative w-full max-w-lg bg-[#16181D] border border-border-color rounded-2xl shadow-2xl p-6 text-left">
            <button 
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-hover-bg text-[#8D96A7] hover:text-white cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <div className="flex items-center gap-2 border-b border-border-color pb-3 mb-4">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-black uppercase text-white">Register Long-term Memory</h3>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#8D96A7] uppercase">Memory Statement</label>
                <textarea
                  placeholder="Describe what Synapse should remember (e.g. 'Project Anthopi relies on Node 20.0.')"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={3}
                  className="w-full bg-[#111216] border border-border-color rounded-xl p-3 text-xs outline-none focus:border-primary/50 text-white leading-relaxed resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#8D96A7] uppercase">Level</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="bg-[#111216] border border-border-color text-xs rounded-xl p-2.5 outline-none text-white focus:border-primary/50"
                  >
                    <option value="organization">Organization</option>
                    <option value="project">Project</option>
                    <option value="user">User</option>
                    <option value="conversation">Conversation</option>
                    <option value="workflow">Workflow</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#8D96A7] uppercase">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="bg-[#111216] border border-border-color text-xs rounded-xl p-2.5 outline-none text-white focus:border-primary/50"
                  >
                    <option value="fact">Fact</option>
                    <option value="preference">Preference</option>
                    <option value="decision">Decision</option>
                    <option value="relationship">Relationship</option>
                    <option value="task">Task</option>
                    <option value="summary">Summary</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#8D96A7] uppercase">Agent Source</label>
                  <select
                    value={newAgentId}
                    onChange={(e) => setNewAgentId(e.target.value)}
                    className="bg-[#111216] border border-border-color text-xs rounded-xl p-2.5 outline-none text-white focus:border-primary/50"
                  >
                    <option value="">Manual/System</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    <option value="Developer AI">Developer AI</option>
                    <option value="Support AI">Support AI</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#8D96A7] uppercase">Linked Project</label>
                  <select
                    value={newProjectId}
                    onChange={(e) => setNewProjectId(e.target.value)}
                    className="bg-[#111216] border border-border-color text-xs rounded-xl p-2.5 outline-none text-white focus:border-primary/50"
                  >
                    <option value="">Global/None</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    <option value="Anthopi-ui">Anthopi-ui</option>
                    <option value="Corporate Site">Corporate Site</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-border-color/40 pt-4">
              <button 
                type="button" 
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-border-color hover:bg-hover-bg rounded-xl text-xs font-semibold text-[#8D96A7] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer text-white-force"
              >
                Register
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
