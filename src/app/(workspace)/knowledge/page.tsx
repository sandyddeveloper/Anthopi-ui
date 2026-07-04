"use client";
import React, { useState } from "react";
import { 
  BookOpen, 
  Plus, 
  Search, 
  FileText, 
  Database, 
  ChevronRight, 
  UploadCloud, 
  Link2, 
  Compass, 
  CheckCircle,
  Clock,
  Layers,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentSource {
  id: number;
  name: string;
  type: "PDF" | "CSV" | "URL" | "Markdown";
  chunksCount: number;
  status: "Indexed" | "Syncing" | "Failed";
  updatedAt: string;
}

export default function KnowledgePage() {
  const [sources, setSources] = useState<DocumentSource[]>([
    { id: 1, name: "nextjs-agent-rules.md", type: "Markdown", chunksCount: 42, status: "Indexed", updatedAt: "1 hour ago" },
    { id: 2, name: "literature-review-rules.pdf", type: "PDF", chunksCount: 154, status: "Indexed", updatedAt: "Yesterday" },
    { id: 3, name: "sales-targets-q2.xlsx", type: "CSV", chunksCount: 88, status: "Indexed", updatedAt: "3 days ago" },
  ]);

  const [activeSourceId, setActiveSourceId] = useState<number>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [activeTab, setActiveTab] = useState("documents"); // documents, upload

  const activeSource = sources.find(s => s.id === activeSourceId) || sources[0];

  // Vector chunks mock data
  const MOCK_CHUNKS = [
    { id: "chunk-102a", text: "Rules mapping: Next.js 15 uses App Router conventions with breaking routing structure changes. Use absolute paths when referencing...", vector: "[0.12, -0.45, 0.89, 0.33, -0.09]" },
    { id: "chunk-102b", text: "Tailwind CSS v4 configures variables inline in globals.css. The @theme command overrides defaults without tailwind.config.ts...", vector: "[-0.23, 0.54, 0.11, -0.76, 0.45]" },
    { id: "chunk-102c", text: "Aceternity UI components use framer-motion and twMerge for styling. Ensure clsx is imported to handle dynamic conditional classes...", vector: "[0.67, -0.12, -0.34, 0.51, 0.88]" }
  ];

  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    setIsUploading(true);

    setTimeout(() => {
      const newSource: DocumentSource = {
        id: Date.now(),
        name: newUrl.replace("https://", "").replace("www.", ""),
        type: "URL",
        chunksCount: Math.floor(Math.random() * 40) + 10,
        status: "Indexed",
        updatedAt: "Just now",
      };

      setSources([newSource, ...sources]);
      setActiveSourceId(newSource.id);
      setNewUrl("");
      setIsUploading(false);
      setActiveTab("documents");
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-color/60 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Knowledge Hub</h1>
          <p className="text-xs text-[#8D96A7] mt-1">Ingest documentation files, scrap websites, and reference databases for AI agent retrieve contexts.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#16181D] border border-border-color p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("documents")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
              activeTab === "documents" ? "bg-primary text-white" : "text-[#8D96A7] hover:text-white"
            )}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
              activeTab === "upload" ? "bg-primary text-white" : "text-[#8D96A7] hover:text-white"
            )}
          >
            Ingest Source
          </button>
        </div>
      </div>

      {activeTab === "documents" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Left: Documents Directory list */}
          <div className="bg-card-bg border border-border-color rounded-card p-5 shadow-card flex flex-col gap-4 max-h-[560px] overflow-y-auto scrollbar-thin">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Indexed Documents</h3>
            <div className="flex flex-col gap-2">
              {sources.map((src) => {
                const isActive = src.id === activeSourceId;
                return (
                  <div
                    key={src.id}
                    onClick={() => setActiveSourceId(src.id)}
                    className={cn(
                      "p-3.5 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col gap-2",
                      isActive 
                        ? "border-primary bg-primary/5 text-primary" 
                        : "border-border-color/50 bg-[#16181D]/30 hover:bg-[#16181D]/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className={cn("h-4 w-4", isActive ? "text-primary" : "text-[#8D96A7]")} />
                      <span className="text-xs font-bold truncate flex-1">{src.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-[#8D96A7] mt-1">
                      <span>Type: {src.type}</span>
                      <span>Chunks: {src.chunksCount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Embeddings Preview Console */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-card-bg border border-border-color rounded-card p-6 shadow-card flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border-color/60 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Vector Chunks Preview</h3>
                  <p className="text-[10px] text-[#8D96A7] mt-0.5">Parsed text sections and compiled metadata embeddings.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#8D96A7]">Source Status:</span>
                  <span className="text-[9px] uppercase font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded border border-[#22C55E]/20">
                    Indexed
                  </span>
                </div>
              </div>

              {/* Chunks grid */}
              <div className="flex flex-col gap-4 max-h-[380px] overflow-y-auto scrollbar-thin">
                {MOCK_CHUNKS.map((chunk, idx) => (
                  <div key={idx} className="p-4 bg-[#16181D]/40 border border-border-color rounded-xl flex flex-col gap-2">
                    <div className="flex items-center justify-between border-b border-border-color/40 pb-1.5">
                      <span className="text-[9px] font-mono text-primary font-bold">{chunk.id}</span>
                      <span className="text-[9px] text-[#8D96A7]">Vector dimensions: 1536</span>
                    </div>
                    <p className="text-xs text-[#B7BDC8] leading-relaxed">
                      {chunk.text}
                    </p>
                    <div className="flex items-center gap-1.5 text-[9px] text-[#8D96A7] font-mono mt-1 bg-[#09090B]/50 p-1.5 rounded border border-border-color/40">
                      <Database className="h-3 w-3 text-secondary" />
                      <span>Embedding: {chunk.vector}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Ingestion/Upload screen
        <div className="bg-card-bg border border-border-color rounded-card p-8 shadow-card flex flex-col items-center justify-center min-h-[400px] max-w-2xl mx-auto w-full">
          <div className="p-4 bg-[#16181D] border border-border-color rounded-full text-primary mb-6">
            <UploadCloud className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-sm text-white">Ingest New Data Source</h3>
          <p className="text-[#8D96A7] text-xs mt-1.5 text-center leading-relaxed max-w-sm">
            Import documentation files, scrap URLs, or load SQL database connectors to expand the AI agents knowledge capabilities.
          </p>

          <form onSubmit={handleAddSource} className="w-full flex flex-col gap-4 mt-8">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Scrap URL Website</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#8D96A7]">
                  <Link2 className="h-4.5 w-4.5" />
                </span>
                <input
                  type="url"
                  required
                  placeholder="https://docs.nextjs.org"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full h-11 rounded-xl bg-primary text-white font-semibold text-xs transition-colors hover:bg-primary-hover shadow-lg shadow-primary/10 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <span className="h-4.5 w-4.5 rounded-full border-2 border-t-transparent border-white animate-spin" />
                  <span>Crawling URL & Vectorizing chunks...</span>
                </>
              ) : (
                <>
                  <span>Initialize Vectorization</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
