"use client";
import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Search, 
  Plus, 
  GitCommit, 
  Eye, 
  FileText, 
  Play, 
  Sliders, 
  Clock, 
  Check, 
  X,
  History,
  RotateCcw,
  Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  categoryId?: string;
  version: string;
  updatedAt: string;
  templateText: string;
  variables: string[];
  historyLog: { version: string; change: string; date: string; author: string; text: string }[];
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activePromptId, setActivePromptId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editorTab, setEditorTab] = useState<"edit" | "preview" | "history">("edit");

  // Create prompt modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPromptName, setNewPromptName] = useState("");
  const [newPromptCategory, setNewPromptCategory] = useState("");

  // Preview form values
  const [previewVarInputs, setPreviewVarInputs] = useState<Record<string, string>>({
    unit_test_cmd: "npm run test",
    user_name: "Santhosh",
    deprecated_libs: "moment, request"
  });

  const loadPromptsData = async (targetActiveId?: string) => {
    try {
      const [promptsRes, catsRes] = await Promise.all([
        apiClient.aiAgents.listPrompts().catch(() => ({ data: [] })),
        apiClient.aiAgents.listPromptCategories().catch(() => ({ data: [] }))
      ]);

      setCategories(catsRes.data || []);

      const list = (promptsRes.data || []).map((p: any) => {
        // Map versions log from backend nested versions list if any
        const logs = (p.versions || []).map((v: any) => ({
          version: `v${v.version_number}`,
          change: `Version ${v.version_number} template update.`,
          date: new Date(v.created_at).toLocaleDateString(),
          author: "Santhosh",
          text: v.template_text
        }));

        // Default base log if empty
        if (logs.length === 0) {
          logs.push({
            version: "v1.0",
            change: "Baseline system configuration.",
            date: new Date(p.created_at || Date.now()).toLocaleDateString(),
            author: "System",
            text: p.template_text
          });
        }

        return {
          id: p.id,
          name: p.name,
          category: p.category_details?.name || "General",
          categoryId: p.category,
          version: logs[0]?.version || "v1.0",
          updatedAt: new Date(p.updated_at).toLocaleDateString(),
          templateText: p.template_text || "",
          variables: p.variables || ["task_input"],
          historyLog: logs
        };
      });

      setPrompts(list);

      if (list.length > 0) {
        const nextId = targetActiveId || list[0].id;
        setActivePromptId(nextId);
      }
    } catch (e) {
      console.error("Failed to load prompts templates data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromptsData();
  }, []);

  const activePrompt = prompts.find(p => p.id === activePromptId);

  const handleUpdateTemplateText = (text: string) => {
    if (!activePromptId) return;
    setPrompts(prompts.map(p => p.id === activePromptId ? { ...p, templateText: text } : p));
  };

  const handleSaveCommit = async () => {
    if (!activePrompt) return;
    try {
      await apiClient.aiAgents.updatePrompt(activePrompt.id, {
        name: activePrompt.name,
        category: activePrompt.categoryId,
        template_text: activePrompt.templateText,
        variables: activePrompt.variables
      });
      await loadPromptsData(activePrompt.id);
    } catch (e) {
      console.error("Failed to save prompt commit:", e);
    }
  };

  const handleRestoreVersion = async (log: PromptTemplate["historyLog"][0]) => {
    if (!activePrompt) return;
    try {
      await apiClient.aiAgents.updatePrompt(activePrompt.id, {
        name: activePrompt.name,
        category: activePrompt.categoryId,
        template_text: log.text,
        variables: activePrompt.variables
      });
      await loadPromptsData(activePrompt.id);
      setEditorTab("edit");
    } catch (e) {
      console.error("Failed to restore prompt version:", e);
    }
  };

  const handleCreatePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromptName.trim()) return;

    try {
      const payload = {
        name: newPromptName.toLowerCase().replace(/\s+/g, "-"),
        category: newPromptCategory || (categories.length > 0 ? categories[0].id : ""),
        template_text: "You are a helpful assistant helper persona. Instructions: {task_input}",
        variables: ["task_input"]
      };

      const res = await apiClient.aiAgents.createPrompt(payload);
      await loadPromptsData(res.data.id);
      
      setNewPromptName("");
      setIsCreateModalOpen(false);
    } catch (e) {
      console.error("Failed to create prompt:", e);
    }
  };

  const getCompiledPreview = () => {
    if (!activePrompt) return "";
    let result = activePrompt.templateText;
    activePrompt.variables.forEach(v => {
      const val = previewVarInputs[v] || `{${v}}`;
      result = result.replaceAll(`{${v}}`, val);
    });
    return result;
  };

  const filteredPrompts = prompts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn text-left">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" /> Prompt Library
          </h1>
          <p className="text-xs text-[#8D96A7] mt-1">
            Design markdown instruction templates, trace version modifications history, and test tags parameters.
          </p>
        </div>
        <button
          onClick={() => {
            if (categories.length > 0) setNewPromptCategory(categories[0].id);
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/10 self-start md:self-auto transition-all cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>New Prompt</span>
        </button>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-xs text-[#8D96A7] gap-2 bg-[#16181D]/15 border border-border-color rounded-2xl">
          <span className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Syncing prompts library...</span>
        </div>
      )}

      {/* Editor Main Grid Layout */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch min-h-[520px]">
          
          {/* Left: Directory list */}
          <div className="bg-card-bg border border-border-color rounded-2xl p-5 flex flex-col gap-4 max-h-[600px] overflow-y-auto scrollbar-thin">
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8D96A7]" />
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#16181D] border border-border-color text-xs text-white pl-9 pr-3 py-2 rounded-xl outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              {filteredPrompts.map((p) => {
                const active = p.id === activePromptId;
                return (
                  <div
                    key={p.id}
                    onClick={() => setActivePromptId(p.id)}
                    className={cn(
                      "p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col gap-1.5 text-left",
                      active 
                        ? "border-primary bg-primary/5" 
                        : "border-border-color/60 bg-[#16181D]/30 hover:bg-[#16181D]/60"
                    )}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-bold text-white truncate max-w-[130px]">{p.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-mono">{p.version}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-[#8D96A7] font-semibold mt-1">
                      <span>{p.category}</span>
                      <span className="font-mono">Active {p.updatedAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Workspace Editor Console */}
          <div className="lg:col-span-2 bg-card-bg border border-border-color rounded-2xl flex flex-col shadow-card overflow-hidden">
            {activePrompt ? (
              <>
                {/* Header bar */}
                <div className="p-4 border-b border-border-color flex justify-between items-center bg-[#14161d]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{activePrompt.name}</span>
                    <span className="text-[10px] text-[#8D96A7]">({activePrompt.category})</span>
                  </div>
                  
                  <button
                    onClick={handleSaveCommit}
                    className="px-3.5 py-1.5 bg-primary/10 border border-primary/25 text-primary text-[10px] font-bold rounded-lg hover:bg-primary/25 transition-colors cursor-pointer"
                  >
                    Commit Changes
                  </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-border-color bg-[#16181d] px-4">
                  <button
                    onClick={() => setEditorTab("edit")}
                    className={cn("px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer", editorTab === "edit" ? "border-primary text-primary" : "border-transparent text-[#8D96A7] hover:text-white")}
                  >
                    System Editor
                  </button>
                  <button
                    onClick={() => setEditorTab("preview")}
                    className={cn("px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer", editorTab === "preview" ? "border-primary text-primary" : "border-transparent text-[#8D96A7] hover:text-white")}
                  >
                    Live Preview
                  </button>
                  <button
                    onClick={() => setEditorTab("history")}
                    className={cn("px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer", editorTab === "history" ? "border-primary text-primary" : "border-transparent text-[#8D96A7] hover:text-white")}
                  >
                    History ({activePrompt.historyLog.length})
                  </button>
                </div>

                {/* Tab Workstation */}
                <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-5 scrollbar-thin">
                  
                  {/* Editor tab */}
                  {editorTab === "edit" && (
                    <div className="flex flex-col gap-4 h-full">
                      <textarea
                        rows={8}
                        value={activePrompt.templateText}
                        onChange={(e) => handleUpdateTemplateText(e.target.value)}
                        className="w-full bg-[#16181D] border border-border-color focus:border-primary/50 text-xs text-white p-4 rounded-xl outline-none font-mono resize-none flex-1 leading-relaxed text-left"
                        placeholder="Define your prompt here..."
                      />

                      {/* Variables Config Tag panel */}
                      <div className="flex flex-col gap-2 text-left">
                        <span className="text-[10px] text-[#8D96A7] uppercase font-bold flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5 text-primary" /> Template variables tags resolved
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {activePrompt.variables.map(v => (
                            <span key={v} className="text-[10px] px-2.5 py-1 rounded bg-[#16181D] border border-border-color font-mono text-primary font-bold">
                              {"{"}{v}{"}"}
                            </span>
                          ))}
                          {activePrompt.variables.length === 0 && (
                            <span className="text-[10px] text-[#5A6376] italic">No variables defined. Wrap words in {"{brackets}"} to create tags.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Live compiler review */}
                  {editorTab === "preview" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      
                      {/* Input Fields */}
                      <div className="md:col-span-1 flex flex-col gap-3">
                        <span className="text-[10px] text-[#8D96A7] uppercase font-bold">Variable inputs</span>
                        
                        {activePrompt.variables.map(v => (
                          <div key={v} className="flex flex-col gap-1 text-left">
                            <label className="text-[9px] text-[#8D96A7] font-bold uppercase">{v}</label>
                            <input
                              type="text"
                              value={previewVarInputs[v] || ""}
                              onChange={(e) => setPreviewVarInputs({ ...previewVarInputs, [v]: e.target.value })}
                              className="bg-[#16181D] border border-border-color focus:border-primary/50 text-[11px] text-white px-2 py-1.5 rounded-lg outline-none"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Live Preview Display */}
                      <div className="md:col-span-2 flex flex-col gap-2 text-left">
                        <span className="text-[10px] text-[#8D96A7] uppercase font-bold">Compiled prompt output</span>
                        <div className="bg-[#101116] border border-border-color p-4 rounded-xl font-mono text-[11px] text-white leading-relaxed whitespace-pre-wrap select-all">
                          {getCompiledPreview()}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* History timeline */}
                  {editorTab === "history" && (
                    <div className="flex flex-col gap-4 text-left">
                      <span className="text-[10px] text-[#8D96A7] uppercase font-bold">Prompt Commit Log</span>
                      
                      <div className="relative pl-4 border-l border-border-color flex flex-col gap-5 py-2">
                        {activePrompt.historyLog.map((log, i) => (
                          <div key={i} className="relative flex flex-col gap-1 group">
                            <span className="absolute -left-[20.5px] top-1.5 h-3 w-3 rounded-full bg-[#111113] border-2 border-primary group-hover:bg-primary transition-colors" />
                            
                            <div className="flex items-center justify-between text-[11px] font-bold text-white">
                              <span>Version {log.version}</span>
                              <button 
                                onClick={() => handleRestoreVersion(log)}
                                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-primary hover:underline transition-opacity cursor-pointer"
                              >
                                <RotateCcw className="h-3 w-3" /> Restore Version
                              </button>
                            </div>
                            
                            <span className="text-[9px] text-[#5A6376] font-mono mt-0.5">Committed {log.date} by {log.author}</span>
                            <p className="text-[10px] text-[#8D96A7] mt-1 bg-[#16181D]/45 p-2 border border-border-color/30 rounded-lg">{log.change}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#8D96A7] py-20">
                <FileText className="h-8 w-8" />
                <span className="text-xs mt-2 font-semibold">Select a prompt template from library folder</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Modal: Create Prompt */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-card-bg border border-border-color rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-scaleIn">
            
            <div className="flex items-center justify-between p-5 border-b border-border-color">
              <h3 className="text-sm font-bold text-white">Create Prompt Template</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#8D96A7] hover:text-white">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreatePromptSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#8D96A7] uppercase font-bold">Prompt identifier</label>
                <input
                  type="text"
                  placeholder="e.g. system-debugger"
                  value={newPromptName}
                  onChange={(e) => setNewPromptName(e.target.value)}
                  className="bg-[#16181D] border border-border-color focus:border-primary/50 text-xs text-white p-2.5 rounded-xl outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#8D96A7] uppercase font-bold">Category</label>
                <select
                  value={newPromptCategory}
                  onChange={(e) => setNewPromptCategory(e.target.value as any)}
                  className="bg-[#16181D] border border-border-color text-xs text-white p-2.5 rounded-xl outline-none"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between items-center border-t border-border-color pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-border-color text-xs rounded-xl text-[#B7BDC8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95"
                >
                  Generate Template
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
