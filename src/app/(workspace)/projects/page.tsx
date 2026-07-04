"use client";
import React, { useState } from "react";
import { 
  Folder, 
  Plus, 
  Search, 
  Tag, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Lock, 
  MoreVertical, 
  ArrowLeft,
  Briefcase,
  Play,
  FileText,
  Clock,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: number;
  name: string;
  description: string;
  status: "Active" | "Completed" | "Pending";
  tags: string[];
  membersCount: number;
  tasksCount: number;
  automationsCount: number;
  updatedAt: string;
  isFavorite?: boolean;
}

export default function ProjectsPage() {
  // Mock projects list
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: "Software Architecture Ingestion",
      description: "Automate code scanning, indexing, and documentation vectorization using specialized dev agents.",
      status: "Active",
      tags: ["Engineering", "Vectordb"],
      membersCount: 3,
      tasksCount: 12,
      automationsCount: 2,
      updatedAt: "2 hours ago",
      isFavorite: true,
    },
    {
      id: 2,
      name: "Customer Feedback Pipeline",
      description: "Scrape feedback comments, perform sentiment analysis, categorization, and dispatch alerts to Slack.",
      status: "Active",
      tags: ["Operations", "Sentiment"],
      membersCount: 2,
      tasksCount: 8,
      automationsCount: 1,
      updatedAt: "Yesterday",
      isFavorite: false,
    },
    {
      id: 3,
      name: "Q3 Sales Analytics Report",
      description: "Scheduled automation compiling monthly CRM logs into SVG visualizations and email reports.",
      status: "Completed",
      tags: ["Marketing", "Reports"],
      membersCount: 4,
      tasksCount: 15,
      automationsCount: 3,
      updatedAt: "3 days ago",
      isFavorite: true,
    },
  ]);

  // Project details selected state (Inside Project view)
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [activeSubTab, setActiveSubTab] = useState("overview");

  // Project creator form states
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjTag, setNewProjTag] = useState("Engineering");

  const [search, setSearch] = useState("");

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    const newProject: Project = {
      id: Date.now(),
      name: newProjName,
      description: newProjDesc || "No description provided.",
      status: "Pending",
      tags: [newProjTag],
      membersCount: 1,
      tasksCount: 0,
      automationsCount: 0,
      updatedAt: "Just now",
    };

    setProjects([newProject, ...projects]);
    setNewProjName("");
    setNewProjDesc("");
    setIsCreatorOpen(false);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Filtered projects list
  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn">
      {selectedProjectId === null ? (
        // Projects List View
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Workspaces Projects</h1>
              <p className="text-xs text-[#8D96A7] mt-1">Manage, filter, and organize automations inside project folders.</p>
            </div>
            <button
              onClick={() => setIsCreatorOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/10 self-start md:self-auto transition-all"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Create Project</span>
            </button>
          </div>

          {/* Controls: Search & Creator Form */}
          {isCreatorOpen && (
            <form onSubmit={handleCreateProject} className="p-6 bg-card-bg border border-border-color rounded-card flex flex-col gap-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-border-color/60 pb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Initialize Project Workspace</span>
                <button type="button" onClick={() => setIsCreatorOpen(false)} className="text-[10px] text-[#8D96A7] hover:text-white">Cancel</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Project Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Marketing Sync"
                    value={newProjName}
                    onChange={(e) => setNewProjName(e.target.value)}
                    className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Workspace Category</label>
                  <select
                    value={newProjTag}
                    onChange={(e) => setNewProjTag(e.target.value)}
                    className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  >
                    <option>Engineering</option>
                    <option>Marketing</option>
                    <option>Operations</option>
                    <option>Analytics</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Description</label>
                <textarea
                  placeholder="Outline the core tasks and automations this project encompasses..."
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  className="p-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none h-20"
                />
              </div>
              <button type="submit" className="py-2.5 rounded-xl bg-primary text-white font-semibold text-xs self-end px-6">
                Provision Workspace
              </button>
            </form>
          )}

          {/* Search bar filter */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8D96A7]">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search projects by name or tag category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-11 pr-4 text-xs rounded-xl border border-border-color bg-card-bg text-white placeholder-[#8D96A7] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => { setSelectedProjectId(project.id); setActiveSubTab("overview"); }}
                className="bg-card-bg border border-border-color hover:border-primary/20 rounded-card p-5 shadow-card hover:shadow-hover transition-all duration-200 cursor-pointer group flex flex-col justify-between h-56"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-[#16181D] border border-border-color rounded-xl text-primary group-hover:text-primary-hover transition-colors">
                      <Folder className="h-5 w-5" />
                    </div>
                    <span className={cn(
                      "text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border",
                      project.status === "Active" && "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
                      project.status === "Completed" && "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                      project.status === "Pending" && "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                    )}>
                      {project.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-[11px] text-[#B7BDC8] mt-1.5 leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border-color/40 pt-4 text-[9px] text-[#8D96A7]">
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {project.membersCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {project.tasksCount} Tasks
                    </span>
                  </div>
                  <span>Updated {project.updatedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        // Inside Project Detailed Dashboard View
        <>
          {/* Inside Project Header */}
          <div className="flex items-center justify-between border-b border-border-color/60 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedProjectId(null)}
                className="p-2 rounded-xl border border-border-color hover:bg-hover-bg text-[#B7BDC8] hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4.5 w-4.5" />
              </button>
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#8D96A7]">
                  <span>Projects</span>
                  <span>/</span>
                  <span className="text-primary font-bold">{selectedProject?.tags[0]}</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">{selectedProject?.name}</h1>
              </div>
            </div>

            <span className="text-[10px] text-[#8D96A7] font-medium">Updated {selectedProject?.updatedAt}</span>
          </div>

          {/* Sub-tabs switch navigation */}
          <div className="flex border-b border-border-color/60">
            {["overview", "tasks", "automations", "files"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={cn(
                  "px-4 py-2.5 text-xs font-semibold capitalize relative transition-colors duration-150 border-b-2",
                  activeSubTab === tab 
                    ? "text-primary border-primary font-bold" 
                    : "text-[#8D96A7] hover:text-white border-transparent"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Sub-tab view components */}
          <div className="bg-card-bg border border-border-color rounded-card p-6 shadow-card min-h-[280px]">
            {activeSubTab === "overview" && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Project Brief</h3>
                  <p className="text-xs text-[#B7BDC8] leading-relaxed max-w-2xl">{selectedProject?.description}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-border-color/50 pt-4 mt-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-[#8D96A7] uppercase font-bold">Category Tags</span>
                    <div className="flex gap-1.5 mt-1">
                      {selectedProject?.tags.map((tag) => (
                        <span key={tag} className="text-[9px] font-semibold px-2 py-0.5 rounded-full border border-primary/20 bg-primary/5 text-primary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-[#8D96A7] uppercase font-bold">Attached Team Members</span>
                    <span className="text-xs text-white font-medium mt-1">John Doe + {selectedProject?.membersCount ? selectedProject.membersCount - 1 : 0} others</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-[#8D96A7] uppercase font-bold">Project State</span>
                    <span className="text-xs text-[#22C55E] font-medium mt-1">{selectedProject?.status}</span>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === "tasks" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-border-color/40 pb-2 mb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Project Checklist</h3>
                  <button className="text-[10px] text-primary hover:underline font-bold">+ New Task</button>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    "Index database connections schema",
                    "Configure pipeline run webhook trigger URL",
                    "Compile analytical report spreadsheets",
                  ].map((taskText, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-[#16181D]/30 border border-border-color/40 rounded-lg">
                      <CheckCircle2 className="h-4 w-4 text-[#8D96A7]" />
                      <span className="text-xs text-[#B7BDC8]">{taskText}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSubTab === "automations" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-border-color/40 pb-2 mb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Associated Automations</h3>
                  <button className="text-[10px] text-primary hover:underline font-bold">+ New Workflow</button>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="p-3 bg-[#16181D]/30 border border-border-color/40 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Play className="h-4 w-4 text-[#22C55E]" />
                      <span className="text-xs font-bold text-white">Daily Summary Compilation</span>
                    </div>
                    <span className="text-[9px] text-[#8D96A7]">Success rate: 99.4%</span>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === "files" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-border-color/40 pb-2 mb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Asset Repositories</h3>
                  <button className="text-[10px] text-primary hover:underline font-bold">Upload File</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {["arch_overview.pdf", "data_source.csv", "readme.md"].map((filename) => (
                    <div key={filename} className="p-3 bg-[#16181D]/30 border border-border-color/50 rounded-xl flex flex-col gap-2 items-start hover:border-primary/20 transition-all cursor-pointer">
                      <FileText className="h-6 w-6 text-[#8D96A7]" />
                      <span className="text-[10px] font-bold text-white truncate w-full">{filename}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
