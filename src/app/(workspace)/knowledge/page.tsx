"use client";
import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Plus, 
  Search, 
  FileText, 
  Database, 
  UploadCloud, 
  CheckCircle,
  Clock,
  Layers,
  ArrowRight,
  X,
  Bot,
  Sliders,
  Sparkles,
  Info,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

interface KnowledgeCollection {
  id: string;
  name: string;
  desc: string;
  documentsCount: number;
  assignedAgents: string[];
  updatedAt: string;
  agentsList?: string[];
}

interface KnowledgeDocument {
  id: string;
  name: string;
  type: "PDF" | "CSV" | "URL" | "Markdown";
  chunksCount: number;
  status: "Indexed" | "Syncing" | "Failed";
  collectionId?: string;
  summary: string;
  previewText: string;
  assignedAgents: string[];
  updatedAt: string;
}

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState<"collections" | "documents">("collections");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<KnowledgeCollection[]>([]);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [agentsList, setAgentsList] = useState<any[]>([]);

  // Modals state
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Form states for creation
  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [newColAgents, setNewColAgents] = useState<string[]>([]);

  // Document upload form
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFileType, setUploadedFileType] = useState<KnowledgeDocument["type"]>("PDF");

  const loadKnowledgeData = async () => {
    setLoading(true);
    try {
      const [colRes, filesRes, agentsRes] = await Promise.all([
        apiClient.knowledgeCollections.listCollections().catch(() => ({ data: [] })),
        apiClient.knowledge.getFiles().catch(() => ({ data: [] })),
        apiClient.aiAgents.listAgents().catch(() => ({ data: [] }))
      ]);

      setAgentsList(agentsRes.data || []);

      const mappedCols = (colRes.data || []).map((c: any) => {
        // Resolve agent names from IDs
        const names = (c.agents || []).map((id: string) => {
          const a = (agentsRes.data || []).find((item: any) => item.id === id);
          return a ? a.name : "AI Agent";
        });

        return {
          id: c.id,
          name: c.name,
          desc: c.description || "No description provided.",
          documentsCount: c.items?.length || 0,
          assignedAgents: names,
          updatedAt: new Date(c.updated_at).toLocaleDateString(),
          agentsList: c.agents || []
        };
      });

      const mappedDocs = (filesRes.data || []).map((f: any) => ({
        id: f.id,
        name: f.name,
        type: (f.file_type || "PDF") as any,
        chunksCount: 24, // simulated vectors chunks size
        status: "Indexed" as const,
        summary: `Document uploaded. Type: ${f.file_type || 'Unknown'}. Size: ${(f.file_size / 1024).toFixed(1)} KB.`,
        previewText: `Ingested content metadata. Visibility context: ${f.visibility || 'organization'}. File path: ${f.file_path || 'system'}`,
        assignedAgents: [],
        updatedAt: new Date(f.updated_at || f.created_at).toLocaleDateString()
      }));

      setCollections(mappedCols);
      setDocuments(mappedDocs);

      if (mappedDocs.length > 0) {
        setSelectedDocId(mappedDocs[0].id);
      }
    } catch (e) {
      console.error("Failed to load knowledge database integration stats:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKnowledgeData();
  }, []);

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  // Vectors mock chunk mappings
  const MOCK_CHUNKS = [
    { id: "chunk-102a", text: "Ingested content metadata. Visibility context is marked as organisation permissions.", vector: "[0.12, -0.45, 0.89, 0.33, -0.09]" },
    { id: "chunk-102b", text: "RAG contexts query retrieves vectors coordinates values from PostgreSQL indexing pgvector structures.", vector: "[-0.23, 0.54, 0.11, -0.76, 0.45]" }
  ];

  // Filters
  const filteredCollections = collections.filter(col => 
    col.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    col.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    try {
      const payload = {
        name: newColName,
        description: newColDesc,
        agents: newColAgents
      };

      await apiClient.knowledgeCollections.createCollection(payload);
      await loadKnowledgeData();

      setNewColName("");
      setNewColDesc("");
      setNewColAgents([]);
      setIsCollectionModalOpen(false);
    } catch (e) {
      console.error("Failed to create collection:", e);
    }
  };

  const handleUploadDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFileName.trim()) return;

    try {
      // Simulate file upload metadata creation
      const formData = new FormData();
      formData.append("name", uploadedFileName);
      formData.append("file_type", uploadedFileType);
      
      // Creating a blank blob for django backend file validation structure if needed
      const blob = new Blob(["mock content"], { type: "text/plain" });
      formData.append("file", blob, uploadedFileName);

      await apiClient.knowledge.createFile(formData);
      await loadKnowledgeData();

      setUploadedFileName("");
      setIsUploadModalOpen(false);
    } catch (e) {
      console.error("Failed to upload document file:", e);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    try {
      await apiClient.knowledgeCollections.deleteCollection(id);
      await loadKnowledgeData();
    } catch (e) {
      console.error("Failed to delete collection:", e);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      await apiClient.knowledge.deleteFile(id);
      await loadKnowledgeData();
    } catch (e) {
      console.error("Failed to delete file:", e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn text-left">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" /> Knowledge Base Hub
          </h1>
          <p className="text-xs text-[#8D96A7] mt-1">
            Expose documents, guidelines, FAQs, or folders to AI Agents to load contextual reference indexes.
          </p>
        </div>
        
        {/* Toggle & Buttons */}
        <div className="flex flex-wrap gap-2.5 items-center">
          <div className="flex bg-[#16181D] border border-border-color p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("collections")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                activeTab === "collections" ? "bg-primary text-white" : "text-[#8D96A7] hover:text-white"
              )}
            >
              Collections
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                activeTab === "documents" ? "bg-primary text-white" : "text-[#8D96A7] hover:text-white"
              )}
            >
              Documents
            </button>
          </div>

          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2.5 bg-[#1d1f27] border border-border-color hover:border-primary/40 rounded-xl text-xs font-bold text-[#B7BDC8] hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <UploadCloud className="h-4 w-4 text-[#8D96A7]" /> Upload Document
          </button>

          <button
            onClick={() => setIsCollectionModalOpen(true)}
            className="px-4 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-primary/10"
          >
            <Plus className="h-4.5 w-4.5" /> Create Collection
          </button>
        </div>
      </div>

      {/* Toolbar Search */}
      <div className="relative w-full bg-card-bg border border-border-color p-4 rounded-2xl shadow-card">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8D96A7]" />
        <input
          type="text"
          placeholder={activeTab === "collections" ? "Search collections..." : "Search documents..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#16181D] border border-border-color focus:border-primary/50 text-xs text-white pl-12 pr-4 py-2.5 rounded-xl outline-none"
        />
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-xs text-[#8D96A7] gap-2 bg-[#16181D]/15 border border-border-color rounded-2xl">
          <span className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Synchronizing knowledge contexts...</span>
        </div>
      )}

      {/* TABS 1: Collections Cards Grid */}
      {!loading && activeTab === "collections" && (
        <>
          {filteredCollections.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 bg-[#16181D]/30 border border-dashed border-border-color rounded-2xl gap-4">
              <Database className="h-10 w-10 text-[#8D96A7]" />
              <div className="text-center">
                <h3 className="text-sm font-bold text-white">No Collections Found</h3>
                <p className="text-xs text-[#8D96A7] mt-1">Create your first database folder to assign context documents.</p>
              </div>
            </div>
          )}

          {filteredCollections.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCollections.map((col) => (
                <div
                  key={col.id}
                  className="bg-card-bg border border-border-color hover:border-[#2C313C]/80 rounded-2xl p-5 shadow-card hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[220px] group"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                          <Database className="h-4.5 w-4.5" />
                        </span>
                        <span className="text-xs font-bold text-white group-hover:text-primary transition-colors truncate max-w-[140px]">{col.name}</span>
                      </div>

                      <button 
                        onClick={() => handleDeleteCollection(col.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#8D96A7] hover:text-[#EF4444] transition-opacity cursor-pointer"
                        title="Delete collection"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-[#8D96A7] line-clamp-3 leading-relaxed mt-2">{col.desc}</p>
                  </div>

                  <div className="border-t border-[#1c1e24] pt-3.5 flex items-center justify-between text-[10px]">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] uppercase font-bold text-[#5A6376] tracking-wider">Agents Assigned</span>
                      <span className="text-white font-bold">{col.assignedAgents.join(", ") || "None"}</span>
                    </div>
                    
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-white font-bold">{col.documentsCount} documents</span>
                      <span className="text-[9px] text-[#8D96A7] font-mono">Updated {col.updatedAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TABS 2: Documents directory layout */}
      {!loading && activeTab === "documents" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch min-h-[500px]">
          
          {/* Left panel: files list */}
          <div className="bg-card-bg border border-border-color rounded-2xl p-5 shadow-card flex flex-col gap-4 overflow-y-auto max-h-[600px] scrollbar-thin">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Indexed Documents</h3>
            
            {filteredDocuments.length === 0 && (
              <p className="text-[11px] text-[#8D96A7] py-6 text-center">No documents in registry.</p>
            )}

            <div className="flex flex-col gap-2">
              {filteredDocuments.map((doc) => {
                const isActive = doc.id === selectedDocId;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={cn(
                      "p-3.5 rounded-xl border cursor-pointer transition-all duration-150 relative group flex flex-col gap-2",
                      isActive 
                        ? "border-primary bg-primary/5" 
                        : "border-border-color/60 bg-[#16181D]/25 hover:bg-[#16181D]/60"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className={cn("h-4.5 w-4.5", isActive ? "text-primary" : "text-[#8D96A7]")} />
                        <span className="text-xs font-bold text-white truncate max-w-[130px]">{doc.name}</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc.id); }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-[#8D96A7] hover:text-[#EF4444]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-[#8D96A7] mt-1 font-mono">
                      <span>Type: {doc.type}</span>
                      <span>Chunks: {doc.chunksCount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel: Details Viewer */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {selectedDoc ? (
              <div className="bg-card-bg border border-border-color rounded-2xl p-6 shadow-card flex flex-col gap-5">
                
                {/* Title & Status */}
                <div className="flex justify-between items-center border-b border-border-color/60 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{selectedDoc.name}</span>
                      <span className="text-[9px] text-[#8D96A7] font-semibold mt-0.5">Updated {selectedDoc.updatedAt}</span>
                    </div>
                  </div>

                  <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    {selectedDoc.status}
                  </span>
                </div>

                {/* Summary View */}
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="text-[10px] text-[#8D96A7] uppercase font-bold flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-primary" /> Auto-Generated Summary
                  </span>
                  <p className="text-xs text-[#B7BDC8] bg-[#16181F]/40 border border-border-color/60 rounded-xl p-3.5 leading-relaxed">
                    {selectedDoc.summary}
                  </p>
                </div>

                {/* Vector Chunks Preview */}
                <div className="flex flex-col gap-3 text-left">
                  <span className="text-[10px] text-[#8D96A7] uppercase font-bold">Compiled Vector Embeddings Chunks</span>
                  <div className="flex flex-col gap-3">
                    {MOCK_CHUNKS.map((ch, i) => (
                      <div key={i} className="bg-[#16181D] border border-border-color rounded-xl p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[8px] text-[#5A6376] font-mono">
                          <span>Chunk ID: {ch.id}</span>
                          <span>Embedding vector: {ch.vector}</span>
                        </div>
                        <p className="text-[11px] text-[#B7BDC8] leading-relaxed mt-1 font-mono">
                          {ch.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-card-bg border border-border-color rounded-2xl p-6 flex flex-col items-center justify-center py-20 text-[#8D96A7]">
                <FileText className="h-8 w-8" />
                <p className="text-xs mt-2 font-semibold">Select a document in the index to view details.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Modal: Create Collection */}
      {isCollectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card-bg border border-border-color rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-scaleIn">
            
            <div className="flex items-center justify-between p-5 border-b border-border-color">
              <h3 className="text-sm font-bold text-white">Create Knowledge Collection</h3>
              <button onClick={() => setIsCollectionModalOpen(false)} className="text-[#8D96A7] hover:text-white">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateCollection} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#8D96A7] uppercase font-bold">Collection name</label>
                <input
                  type="text"
                  placeholder="e.g. faq-database"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="bg-[#16181D] border border-border-color focus:border-primary/50 text-xs text-white p-2.5 rounded-xl outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#8D96A7] uppercase font-bold">Description</label>
                <textarea
                  rows={3}
                  placeholder="What document context does this collection package?"
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  className="bg-[#16181D] border border-border-color focus:border-primary/50 text-xs text-white p-2.5 rounded-xl outline-none resize-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#8D96A7] uppercase font-bold">Assign to Agents</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {agentsList.map(ag => {
                    const active = newColAgents.includes(ag.id);
                    return (
                      <button
                        key={ag.id}
                        type="button"
                        onClick={() => {
                          if (active) {
                            setNewColAgents(newColAgents.filter(a => a !== ag.id));
                          } else {
                            setNewColAgents([...newColAgents, ag.id]);
                          }
                        }}
                        className={cn("px-2.5 py-1 text-[10px] rounded-full border flex items-center gap-1.5 cursor-pointer hover:bg-hover-bg", active ? "border-primary bg-primary/10 text-primary" : "border-border-color text-[#B7BDC8]")}
                      >
                        <Bot className="h-3.5 w-3.5" /> {ag.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-border-color pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCollectionModalOpen(false)}
                  className="px-4 py-2 border border-border-color text-xs rounded-xl text-[#B7BDC8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95"
                >
                  Create
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal: Upload Document */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card-bg border border-border-color rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-scaleIn">
            
            <div className="flex items-center justify-between p-5 border-b border-border-color">
              <h3 className="text-sm font-bold text-white">Upload Context Document</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-[#8D96A7] hover:text-white">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleUploadDocumentSubmit} className="p-6 flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#8D96A7] uppercase font-bold">Document Name</label>
                <input
                  type="text"
                  placeholder="e.g. guidelines.pdf"
                  value={uploadedFileName}
                  onChange={(e) => setUploadedFileName(e.target.value)}
                  className="bg-[#16181D] border border-border-color focus:border-primary/50 text-xs text-white p-2.5 rounded-xl outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#8D96A7] uppercase font-bold">Document Type</label>
                <select
                  value={uploadedFileType}
                  onChange={(e) => setUploadedFileType(e.target.value as any)}
                  className="bg-[#16181D] border border-border-color text-xs text-white p-2.5 rounded-xl outline-none"
                >
                  <option value="PDF">PDF Document</option>
                  <option value="CSV">CSV Data spreadsheet</option>
                  <option value="Markdown">Markdown guideline</option>
                  <option value="URL">Web URL scraper</option>
                </select>
              </div>

              {/* Mock Drag & Drop Box */}
              <div className="border border-dashed border-border-color rounded-xl p-8 flex flex-col items-center justify-center bg-[#16181D]/35 gap-2 text-[#8D96A7] mt-1 hover:border-primary/50 transition-colors">
                <UploadCloud className="h-8 w-8 text-[#5A6376]" />
                <span className="text-[11px] font-semibold text-white">Drag and drop file here</span>
                <span className="text-[9px]">Limit 50MB per file • PDF, CSV, TXT, MD</span>
              </div>

              <div className="flex justify-between items-center border-t border-border-color pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 border border-border-color text-xs rounded-xl text-[#B7BDC8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95"
                >
                  Parse & Ingest
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
