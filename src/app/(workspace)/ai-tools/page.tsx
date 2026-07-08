"use client";
import React, { useState, useEffect } from "react";
import { 
  Wrench, 
  Search, 
  Plus, 
  Check, 
  X, 
  ShieldAlert, 
  Sliders, 
  Cpu, 
  Bot, 
  Server, 
  ToggleLeft, 
  ToggleRight,
  Database,
  ExternalLink,
  Code
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

interface ToolCapability {
  id: string;
  name: string;
  category: "Search" | "Utilities" | "Sandbox" | "System DB";
  description: string;
  status: "Active" | "Inactive";
  endpoint: string;
}

export default function AIToolsPage() {
  const [tools, setTools] = useState<ToolCapability[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [matrix, setMatrix] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"catalog" | "matrix">("catalog");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isAddToolOpen, setIsAddToolOpen] = useState(false);
  const [newToolName, setNewToolName] = useState("");
  const [newToolCategory, setNewToolCategory] = useState<ToolCapability["category"]>("Search");
  const [newToolDesc, setNewToolDesc] = useState("");
  const [newToolEndpoint, setNewToolEndpoint] = useState("");

  const loadToolsData = async () => {
    try {
      const [toolsRes, agentsRes] = await Promise.all([
        apiClient.aiAgents.listTools().catch(() => ({ data: [] })),
        apiClient.aiAgents.listAgents().catch(() => ({ data: [] }))
      ]);

      const mappedTools = (toolsRes.data || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        category: (t.code?.includes("search") ? "Search" : "Utilities") as any,
        description: t.description || "API tool capability integrations.",
        status: "Active" as const,
        endpoint: t.code || "Local sandbox block"
      }));

      setTools(mappedTools);
      setAgents(agentsRes.data || []);

      // Populate matrix maps from agent tools lists
      const map: Record<string, boolean> = {};
      (agentsRes.data || []).forEach((agent: any) => {
        (agent.tools || []).forEach((at: any) => {
          if (at.is_enabled) {
            map[`${at.tool}_${agent.name}`] = true;
          }
        });
      });
      setMatrix(map);
    } catch (e) {
      console.error("Failed to load integrations tools matrix:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadToolsData();
  }, []);

  const handleToggleToolStatus = (id: string) => {
    setTools(tools.map(t => t.id === id ? { ...t, status: t.status === "Active" ? "Inactive" : "Active" } : t));
  };

  const handleToggleMatrix = async (toolId: string, agentId: string, agentName: string) => {
    const key = `${toolId}_${agentName}`;
    const isChecked = matrix[key] || false;
    
    try {
      if (isChecked) {
        // Find AgentTool link ID and delete it
        const agentObj = agents.find(a => a.id === agentId);
        const atObj = (agentObj?.tools || []).find((at: any) => at.tool === toolId);
        if (atObj) {
          await apiClient.aiAgents.deleteAgentTool(agentId, atObj.id);
        }
      } else {
        // Create link
        await apiClient.aiAgents.createAgentTool(agentId, {
          tool: toolId,
          is_enabled: true
        });
      }
      
      // Reload mappings
      await loadToolsData();
    } catch (e) {
      console.error("Failed to toggle matrix authorization:", e);
      // Fallback local toggle
      setMatrix({
        ...matrix,
        [key]: !isChecked
      });
    }
  };

  const handleAddToolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToolName.trim()) return;

    try {
      const payload = {
        name: newToolName,
        code: newToolName.toLowerCase().replace(/\s+/g, "-"),
        description: newToolDesc,
        schema: {}
      };

      await apiClient.aiAgents.createTool(payload);
      await loadToolsData();

      setNewToolName("");
      setNewToolDesc("");
      setNewToolEndpoint("");
      setIsAddToolOpen(false);
    } catch (e) {
      console.error("Failed to create new custom tool:", e);
    }
  };

  const filteredTools = tools.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn text-left">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" /> AI Tools Integration
          </h1>
          <p className="text-xs text-[#8D96A7] mt-1">
            Configure integration endpoints, authorize sandbox tools, and assign execution permissions to specific AI Employees.
          </p>
        </div>

        {/* Tab switch & Add button */}
        <div className="flex flex-wrap gap-2.5 items-center">
          <div className="flex bg-[#16181D] border border-border-color p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("catalog")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                activeTab === "catalog" ? "bg-primary text-white" : "text-[#8D96A7] hover:text-white"
              )}
            >
              Tool Catalog
            </button>
            <button
              onClick={() => setActiveTab("matrix")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                activeTab === "matrix" ? "bg-primary text-white" : "text-[#8D96A7] hover:text-white"
              )}
            >
              Authorization Matrix
            </button>
          </div>

          <button
            onClick={() => setIsAddToolOpen(true)}
            className="px-4 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-primary/10"
          >
            <Plus className="h-4.5 w-4.5" /> Integrate Custom Tool
          </button>
        </div>
      </div>

      {/* Search toolbar */}
      <div className="relative w-full bg-card-bg border border-border-color p-4 rounded-2xl shadow-card">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8D96A7]" />
        <input
          type="text"
          placeholder="Search tools catalog..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#16181D] border border-border-color focus:border-primary/50 text-xs text-white pl-12 pr-4 py-2.5 rounded-xl outline-none"
        />
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-xs text-[#8D96A7] gap-2 bg-[#16181D]/15 border border-border-color rounded-2xl">
          <span className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Syncing integrated tools registry...</span>
        </div>
      )}

      {/* TAB 1: Tool Catalog Card Grid */}
      {!loading && activeTab === "catalog" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="bg-card-bg border border-border-color rounded-2xl p-5 shadow-card hover:border-[#2C313C]/80 transition-all duration-300 flex flex-col justify-between h-[230px]"
            >
              <div className="flex flex-col gap-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-primary/10 border border-primary/20 text-primary">
                    {tool.category}
                  </span>
                  
                  <button 
                    onClick={() => handleToggleToolStatus(tool.id)}
                    className="text-[#8D96A7] hover:text-white cursor-pointer"
                  >
                    {tool.status === "Active" ? (
                      <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">Active</span>
                    ) : (
                      <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-red-500/10 border border-red-500/25 text-red-400">Inactive</span>
                    )}
                  </button>
                </div>

                <h3 className="text-xs font-bold text-white mt-1 group-hover:text-primary transition-colors">{tool.name}</h3>
                <p className="text-[11px] text-[#8D96A7] line-clamp-3 leading-relaxed mt-1">{tool.description}</p>
              </div>

              <div className="border-t border-[#1c1e24] pt-3 flex items-center justify-between text-[9px] text-[#8D96A7] font-mono">
                <span className="flex items-center gap-1"><Code className="h-3.5 w-3.5 text-[#5A6376]" /> {tool.endpoint}</span>
                <span className="font-sans font-bold text-white">
                  {agents.filter(ag => matrix[`${tool.id}_${ag.name}`]).length} authorized agents
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Agent Assignment Matrix */}
      {!loading && activeTab === "matrix" && (
        <div className="bg-card-bg border border-border-color rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#14161d] border-b border-border-color text-[#8D96A7] font-bold">
                  <th className="p-4 pl-6 w-1/3">Integration Tool</th>
                  <th className="p-4 w-1/6">Category</th>
                  {agents.map(ag => (
                    <th key={ag.id} className="p-4 text-center w-1/6">{ag.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c1e24] text-white">
                {filteredTools.map((tool) => (
                  <tr key={tool.id} className="hover:bg-hover-bg/20 transition-colors">
                    {/* Tool details */}
                    <td className="p-4 pl-6">
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="font-bold text-white">{tool.name}</span>
                        <span className="text-[10px] text-[#8D96A7] line-clamp-1 mt-0.5">{tool.description}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-primary/10 border border-primary/20 text-primary">
                        {tool.category}
                      </span>
                    </td>

                    {/* Agent columns authorization checkmarks */}
                    {agents.map((ag) => {
                      const key = `${tool.id}_${ag.name}`;
                      const isChecked = matrix[key] || false;
                      return (
                        <td key={ag.id} className="p-4 text-center">
                          <button
                            onClick={() => handleToggleMatrix(tool.id, ag.id, ag.name)}
                            className={cn(
                              "inline-flex items-center justify-center h-6 w-6 rounded-lg border transition-all cursor-pointer",
                              isChecked 
                                ? "border-primary bg-primary/10 text-primary" 
                                : "border-border-color bg-[#16181D] text-[#5A6376] hover:text-[#B7BDC8]"
                            )}
                          >
                            {isChecked ? <Check className="h-4 w-4" /> : <X className="h-3.5 w-3.5" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Custom Tool */}
      {isAddToolOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card-bg border border-border-color rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-scaleIn">
            
            <div className="flex items-center justify-between p-5 border-b border-border-color">
              <h3 className="text-sm font-bold text-white">Integrate Custom API Tool</h3>
              <button onClick={() => setIsAddToolOpen(false)} className="text-[#8D96A7] hover:text-white">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleAddToolSubmit} className="p-6 flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#8D96A7] uppercase font-bold">Tool Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sales Force API"
                  value={newToolName}
                  onChange={(e) => setNewToolName(e.target.value)}
                  className="bg-[#16181D] border border-border-color focus:border-primary/50 text-xs text-white p-2.5 rounded-xl outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#8D96A7] uppercase font-bold">Category</label>
                <select
                  value={newToolCategory}
                  onChange={(e) => setNewToolCategory(e.target.value as any)}
                  className="bg-[#16181D] border border-border-color text-xs text-white p-2.5 rounded-xl outline-none"
                >
                  <option value="Search">Search Query</option>
                  <option value="Utilities">Utility Compute</option>
                  <option value="Sandbox">Sandbox File IO</option>
                  <option value="System DB">System Database</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#8D96A7] uppercase font-bold">API Endpoint URL / Sandbox Block</label>
                <input
                  type="text"
                  placeholder="e.g. /api/v1/salesforce/queries/"
                  value={newToolEndpoint}
                  onChange={(e) => setNewToolEndpoint(e.target.value)}
                  className="bg-[#16181D] border border-border-color focus:border-primary/50 text-xs text-white p-2.5 rounded-xl outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#8D96A7] uppercase font-bold">Description</label>
                <textarea
                  rows={3}
                  placeholder="Explain how this integration tool works and its parameters details..."
                  value={newToolDesc}
                  onChange={(e) => setNewToolDesc(e.target.value)}
                  className="bg-[#16181D] border border-border-color focus:border-primary/50 text-xs text-white p-2.5 rounded-xl outline-none resize-none"
                />
              </div>

              <div className="flex justify-between items-center border-t border-border-color pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddToolOpen(false)}
                  className="px-4 py-2 border border-border-color text-xs rounded-xl text-[#B7BDC8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95"
                >
                  Integrate Tool
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
