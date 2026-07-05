// src/app/(workspace)/projects/page.tsx
"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Folder, 
  Plus, 
  Search, 
  Users, 
  Calendar, 
  CheckCircle2, 
  MoreVertical, 
  ArrowLeft,
  Briefcase,
  FileText,
  Clock,
  Sparkles,
  Check,
  Trash2,
  Edit,
  AlertCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Archive,
  RotateCcw,
  UploadCloud,
  Download,
  Shield,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

function ProjectsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Core Data Lists
  const [projects, setProjects] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [projectFiles, setProjectFiles] = useState<any[]>([]);
  const [projectActivities, setProjectActivities] = useState<any[]>([]);

  // Page States
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState("overview"); // overview, members, files, activity, settings

  // Search & Filters state
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  // Create Project Step-by-Step Form State
  const [createStep, setCreateStep] = useState(1);
  const [newProjName, setNewProjName] = useState("");
  const [newProjCode, setNewProjCode] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjManager, setNewProjManager] = useState("");
  const [newProjDept, setNewProjDept] = useState("");
  const [newProjPriority, setNewProjPriority] = useState("medium");
  const [newProjStartDate, setNewProjStartDate] = useState("");
  const [newProjEndDate, setNewProjEndDate] = useState("");
  const [selectedMembersList, setSelectedMembersList] = useState<string[]>([]);

  // Edit Project State
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [editPriority, setEditPriority] = useState("medium");

  // File Upload State inside Project
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Add Member Modal State inside Project
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberUserId, setNewMemberUserId] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("member");

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const projectsRes = await apiClient.projects.listProjects({
        status: filterStatus || undefined,
        priority: filterPriority || undefined
      });
      // Extract results from pagination
      const list = Array.isArray(projectsRes.data) ? projectsRes.data : (projectsRes.data as any).results || [];
      setProjects(list);
      
      const deptsRes = await apiClient.orgs.getDepartments();
      setDepartments(deptsRes.data || []);
      if (deptsRes.data?.length > 0) setNewProjDept(deptsRes.data[0].id);

      const usersRes = await apiClient.users.listUsers();
      setUsers(usersRes.data || []);
      if (usersRes.data?.length > 0) setNewProjManager(usersRes.data[0].id);
    } catch (e) {
      console.error("Failed to load projects list:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [filterStatus, filterPriority]);

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setIsCreatorOpen(true);
      setCreateStep(1);
    }
    const viewProj = searchParams.get("view");
    if (viewProj) {
      setSelectedProjectId(viewProj);
      setActiveSubTab("overview");
    }
  }, [searchParams]);

  // Load project detailed subtab items
  const loadProjectDetails = async (projectId: string) => {
    try {
      const [membersRes, filesRes, actsRes] = await Promise.all([
        apiClient.projects.listMembers(projectId),
        apiClient.knowledge.getFiles({ project: projectId }),
        apiClient.activities.listActivities()
      ]);
      setProjectMembers(membersRes.data || []);
      setProjectFiles(filesRes.data || []);

      const list = Array.isArray(actsRes.data) ? actsRes.data : (actsRes.data as any).results || [];
      // Filter activities specific to project or object repr
      const filteredActs = list.filter((a: any) => 
        a.object_id === projectId || 
        a.metadata?.project_id === projectId || 
        (a.module === "project" && a.object_repr?.toLowerCase().includes(projects.find(p => p.id === projectId)?.name?.toLowerCase()))
      );
      setProjectActivities(filteredActs);
    } catch (e) {
      console.error("Failed to load project details sub-elements:", e);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectDetails(selectedProjectId);
      const proj = projects.find(p => p.id === selectedProjectId);
      if (proj) {
        setEditName(proj.name || "");
        setEditDesc(proj.description || "");
        setEditStatus(proj.status || "active");
        setEditPriority(proj.priority || "medium");
      }
    }
  }, [selectedProjectId, projects]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (createStep < 3) {
      setCreateStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (createStep > 1) {
      setCreateStep(prev => prev - 1);
    }
  };

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = {
        name: newProjName,
        code: newProjCode || newProjName.substring(0, 3).toUpperCase(),
        description: newProjDesc,
        manager: newProjManager || null,
        department: newProjDept || null,
        priority: newProjPriority,
        status: "planning",
        start_date: newProjStartDate || null,
        end_date: newProjEndDate || null
      };

      const res = await apiClient.projects.createProject(body);
      const createdProjId = res.data.id;

      // Assign selected members
      if (selectedMembersList.length > 0) {
        await Promise.all(
          selectedMembersList.map(userId => 
            apiClient.projects.addMember(createdProjId, {
              user: userId,
              role: "member",
              status: "active"
            })
          )
        );
      }

      alert("Project Workspace Provisioned Successfully!");
      setIsCreatorOpen(false);
      setNewProjName("");
      setNewProjCode("");
      setNewProjDesc("");
      setSelectedMembersList([]);
      loadProjects();
    } catch (err: any) {
      alert(err?.message || "Failed to provision project cluster.");
    }
  };

  const handleToggleMemberSelect = (userId: string) => {
    setSelectedMembersList(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjectId) return;

    setIsUploadingFile(true);
    const formData = new FormData();
    formData.append("name", file.name);
    formData.append("file_path", file);
    formData.append("project", selectedProjectId);
    formData.append("visibility", "project");

    try {
      await apiClient.knowledge.createFile(formData);
      alert("Project file attachment uploaded!");
      loadProjectDetails(selectedProjectId);
    } catch (err: any) {
      alert(err?.message || "Failed to attach file.");
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberUserId || !selectedProjectId) return;
    try {
      await apiClient.projects.addMember(selectedProjectId, {
        user: newMemberUserId,
        role: newMemberRole,
        status: "active"
      });
      alert("Project member assigned successfully!");
      setIsAddMemberOpen(false);
      setNewMemberUserId("");
      loadProjectDetails(selectedProjectId);
    } catch (err: any) {
      alert(err?.message || "Failed to assign project member.");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member from the project?")) return;
    try {
      await apiClient.projects.deleteMember(memberId);
      alert("Project member access revoked.");
      if (selectedProjectId) loadProjectDetails(selectedProjectId);
    } catch (err: any) {
      alert(err?.message || "Failed to remove member.");
    }
  };

  const handleFileDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this attached project asset?")) return;
    try {
      await apiClient.knowledge.deleteFile(fileId);
      alert("Attached asset deleted.");
      if (selectedProjectId) loadProjectDetails(selectedProjectId);
    } catch (err: any) {
      alert(err?.message || "Failed to delete file.");
    }
  };

  const handleUpdateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    try {
      await apiClient.projects.updateProject(selectedProjectId, {
        name: editName,
        description: editDesc,
        status: editStatus,
        priority: editPriority
      });
      alert("Project settings updated successfully.");
      loadProjects();
    } catch (err: any) {
      alert(err?.message || "Failed to update project settings.");
    }
  };

  const handleArchiveProject = async () => {
    if (!selectedProjectId) return;
    const proj = projects.find(p => p.id === selectedProjectId);
    const isArchived = proj?.status === "archived";
    if (!confirm(`Are you sure you want to ${isArchived ? "restore" : "archive"} this project?`)) return;

    try {
      if (isArchived) {
        await apiClient.projects.restoreProject(selectedProjectId);
        alert("Project restored.");
      } else {
        await apiClient.projects.archiveProject(selectedProjectId);
        alert("Project archived.");
      }
      loadProjects();
      setSelectedProjectId(null);
    } catch (err: any) {
      alert(err?.message || "Failed to archive/restore project.");
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProjectId) return;
    if (!confirm("Are you sure you want to delete this project? This will soft-delete the project record.")) return;

    try {
      await apiClient.projects.deleteProject(selectedProjectId);
      alert("Project deleted successfully.");
      loadProjects();
      setSelectedProjectId(null);
    } catch (err: any) {
      alert(err?.message || "Failed to delete project.");
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Client side query search
  const filteredProjects = projects.filter((p) => 
    p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.code?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn text-left">
      
      {selectedProjectId === null ? (
        // List View
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-color pb-5">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white animate-slideIn">Organization Projects</h1>
              <p className="text-xs text-[#8D96A7] mt-1">Manage project workspaces, assign employees, and coordinate timelines securely.</p>
            </div>
            <button
              onClick={() => {
                setIsCreatorOpen(true);
                setCreateStep(1);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/10 transition-all cursor-pointer self-start md:self-auto"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Create Project</span>
            </button>
          </div>

          {/* Step-by-Step Project Creation Modal */}
          {isCreatorOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
              <div className="bg-[#20242C] w-full max-w-md rounded-modal border border-border-color shadow-2xl p-6 flex flex-col gap-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-border-color/60 pb-3">
                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">Initialize Project Workspace</span>
                    <span className="text-[9px] text-[#8D96A7] mt-0.5 block">Step {createStep} of 3: Core Configurations</span>
                  </div>
                  <button onClick={() => setIsCreatorOpen(false)} className="text-[#8D96A7] hover:text-white cursor-pointer">
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                <div className="flex gap-1.5 h-1 bg-[#16181D] rounded-full overflow-hidden mb-2">
                  {[1, 2, 3].map(idx => (
                    <div key={idx} className={cn("flex-1 h-full rounded-full transition-colors", createStep >= idx ? "bg-primary" : "bg-transparent")} />
                  ))}
                </div>

                {createStep === 1 && (
                  <form onSubmit={handleNextStep} className="flex flex-col gap-3.5 text-left">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Project Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Phoenix Web Platform"
                        value={newProjName}
                        onChange={(e) => setNewProjName(e.target.value)}
                        className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Project Code</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. PHX"
                        value={newProjCode}
                        onChange={(e) => setNewProjCode(e.target.value)}
                        className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Brief Description</label>
                      <textarea
                        required
                        placeholder="Detail the workspace objectives..."
                        value={newProjDesc}
                        onChange={(e) => setNewProjDesc(e.target.value)}
                        className="p-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary h-20 resize-none"
                      />
                    </div>
                    <button type="submit" className="h-10 rounded-xl bg-primary text-white font-semibold text-xs transition-colors hover:bg-primary-hover shadow-lg shadow-primary/10 mt-2 cursor-pointer flex items-center justify-center gap-1">
                      <span>Define Parameters</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </form>
                )}

                {createStep === 2 && (
                  <form onSubmit={handleNextStep} className="flex flex-col gap-3.5 text-left">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Workspace Department</label>
                      <select
                        value={newProjDept}
                        onChange={(e) => setNewProjDept(e.target.value)}
                        className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                      >
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Project Manager</label>
                      <select
                        value={newProjManager}
                        onChange={(e) => setNewProjManager(e.target.value)}
                        className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                      >
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Start Date</label>
                        <input
                          type="date"
                          value={newProjStartDate}
                          onChange={(e) => setNewProjStartDate(e.target.value)}
                          className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">End Date</label>
                        <input
                          type="date"
                          value={newProjEndDate}
                          onChange={(e) => setNewProjEndDate(e.target.value)}
                          className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Priority State</label>
                      <select
                        value={newProjPriority}
                        onChange={(e) => setNewProjPriority(e.target.value)}
                        className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button type="button" onClick={handlePrevStep} className="flex-1 h-10 rounded-xl border border-border-color hover:bg-hover-bg text-text-primary font-bold text-xs flex items-center justify-center gap-1 cursor-pointer">
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back</span>
                      </button>
                      <button type="submit" className="flex-1 h-10 rounded-xl bg-primary text-white font-semibold text-xs transition-colors hover:bg-primary-hover shadow-lg shadow-primary/10 cursor-pointer flex items-center justify-center gap-1">
                        <span>Assign Members</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                )}

                {createStep === 3 && (
                  <form onSubmit={handleCreateProjectSubmit} className="flex flex-col gap-3.5 text-left">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Assign Members Access</label>
                      <div className="p-3 bg-[#111113] border border-border-color/60 rounded-xl flex flex-col gap-2 max-h-40 overflow-y-auto scrollbar-thin">
                        {users.map(u => (
                          <label key={u.id} className="flex items-center gap-2 text-xs text-[#B7BDC8] hover:text-white cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={selectedMembersList.includes(u.id)}
                              onChange={() => handleToggleMemberSelect(u.id)}
                              className="accent-primary h-3.5 w-3.5"
                            />
                            <span>{u.full_name || u.email}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button type="button" onClick={handlePrevStep} className="flex-1 h-10 rounded-xl border border-border-color hover:bg-hover-bg text-text-primary font-bold text-xs flex items-center justify-center gap-1 cursor-pointer">
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back</span>
                      </button>
                      <button type="submit" className="flex-1 h-10 rounded-xl bg-primary text-white font-semibold text-xs transition-colors hover:bg-primary-hover shadow-lg shadow-primary/10 cursor-pointer flex items-center justify-center gap-1">
                        <Check className="h-4 w-4" />
                        <span>Provision Workspace</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Toolbar Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card-bg border border-border-color p-4 rounded-xl shadow-card">
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8D96A7]" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-9 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none max-w-[140px]"
              >
                <option value="">All Statuses</option>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="h-9 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none max-w-[140px]"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Project List / Cards */}
          {isLoading ? (
            <div className="py-24 text-center text-xs text-[#8D96A7]">
              <span className="inline-block h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2 align-middle" />
              <span>Fetching project directories...</span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-card-bg border border-border-color rounded-card p-12 text-center text-xs text-[#8D96A7] flex flex-col items-center justify-center gap-3">
              <Folder className="h-8 w-8 text-[#2C313C]" />
              <div>
                <span className="font-bold text-white block">No Projects Yet</span>
                <span className="mt-1 block">Provision your first project workspace to start delegating timelines.</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => { setSelectedProjectId(project.id); setActiveSubTab("overview"); }}
                  className="bg-card-bg border border-border-color hover:border-primary/20 rounded-card p-5 shadow-card hover:shadow-hover transition-all duration-200 cursor-pointer group flex flex-col justify-between h-56"
                >
                  <div className="flex flex-col gap-3 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-[#16181D] border border-border-color rounded-xl text-primary group-hover:scale-105 transition-transform flex-shrink-0">
                        <Folder className="h-5 w-5" />
                      </div>
                      <span className={cn(
                        "text-[8px] uppercase font-bold px-2 py-0.5 rounded border flex-shrink-0",
                        project.status === "active" && "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
                        project.status === "completed" && "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                        project.status === "planning" && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                        project.status === "on_hold" && "bg-orange-500/10 text-orange-400 border-orange-500/20",
                        project.status === "archived" && "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
                      )}>
                        {project.status || "Active"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-white group-hover:text-primary transition-colors truncate">
                        {project.name}
                      </h3>
                      <p className="text-[11px] text-[#B7BDC8] mt-1.5 leading-relaxed line-clamp-2">
                        {project.description || "No project description mapped."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border-color/40 pt-4 text-[9px] text-[#8D96A7] flex-shrink-0">
                    <span className="font-mono bg-[#16181D] px-1.5 py-0.5 rounded border border-border-color">CODE: {project.code}</span>
                    <span className="capitalize font-bold text-white">Priority: {project.priority || "Medium"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        // Detailed View
        <>
          {/* Inside Project Header */}
          <div className="flex items-center justify-between border-b border-border-color/60 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedProjectId(null)}
                className="p-2 rounded-xl border border-border-color hover:bg-hover-bg text-[#B7BDC8] hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4.5 w-4.5" />
              </button>
              <div>
                <div className="flex items-center gap-2 text-[9px] font-mono text-[#8D96A7]">
                  <span>Projects</span>
                  <span>/</span>
                  <span className="text-primary font-bold">CODE: {selectedProject?.code}</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">{selectedProject?.name}</h1>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleArchiveProject}
                className="inline-flex items-center gap-1 h-9 px-3 border border-border-color bg-card-bg hover:bg-hover-bg text-text-primary hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Archive className="h-4 w-4" />
                <span>{selectedProject?.status === "archived" ? "Restore" : "Archive"}</span>
              </button>
            </div>
          </div>

          {/* Subtabs Switch */}
          <div className="flex border-b border-border-color/60">
            {["overview", "members", "files", "activity", "settings"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={cn(
                  "px-4 py-2.5 text-xs font-semibold capitalize relative transition-colors border-b-2",
                  activeSubTab === tab 
                    ? "text-primary border-primary font-bold bg-primary/5" 
                    : "text-[#8D96A7] hover:text-white border-transparent"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Subtab Content */}
          <div className="bg-card-bg border border-border-color rounded-card p-6 shadow-card min-h-[300px]">
            
            {activeSubTab === "overview" && (
              <div className="flex flex-col gap-5 text-left animate-fadeIn">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Project Brief</h3>
                  <p className="text-xs text-[#B7BDC8] leading-relaxed max-w-2xl">{selectedProject?.description || "No brief descriptive parameters defined."}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-border-color/40 pt-4 mt-2">
                  <div className="p-4 bg-[#16181D]/30 border border-border-color rounded-xl flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-[#8D96A7] font-bold uppercase tracking-wider">Members Assigned</span>
                      <span className="text-base font-bold text-white mt-1">{projectMembers.length} Tiers</span>
                    </div>
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="p-4 bg-[#16181D]/30 border border-border-color rounded-xl flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-[#8D96A7] font-bold uppercase tracking-wider">File Attachments</span>
                      <span className="text-base font-bold text-white mt-1">{projectFiles.length} Assets</span>
                    </div>
                    <FileText className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div className="p-4 bg-[#16181D]/30 border border-border-color rounded-xl flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-[#8D96A7] font-bold uppercase tracking-wider">Status Node</span>
                      <span className="text-base font-bold text-[#22C55E] mt-1 capitalize">{selectedProject?.status}</span>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
                  </div>
                  <div className="p-4 bg-[#16181D]/30 border border-border-color rounded-xl flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-[#8D96A7] font-bold uppercase tracking-wider">Manager</span>
                      <span className="text-xs font-bold text-white mt-1.5 truncate max-w-[120px]">{selectedProject?.manager_details?.full_name || "Unassigned"}</span>
                    </div>
                    <Shield className="h-5 w-5 text-yellow-500" />
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === "members" && (
              <div className="flex flex-col gap-4 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-border-color/40 pb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Assigned Members</h3>
                  <button 
                    onClick={() => setIsAddMemberOpen(true)}
                    className="text-[10px] text-primary hover:underline font-bold"
                  >
                    + Assign Member Access
                  </button>
                </div>

                {isAddMemberOpen && (
                  <form onSubmit={handleAddMemberSubmit} className="p-4 bg-[#16181D]/40 border border-border-color rounded-xl flex flex-wrap gap-3 items-end max-w-xl animate-fadeIn">
                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                      <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Select User</label>
                      <select
                        value={newMemberUserId}
                        onChange={(e) => setNewMemberUserId(e.target.value)}
                        required
                        className="h-9 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none"
                      >
                        <option value="">Select User Seat</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Project Role</label>
                      <select
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value)}
                        className="h-9 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none"
                      >
                        <option value="manager">Manager</option>
                        <option value="lead">Lead</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                    <button type="submit" className="h-9 px-4 rounded-xl bg-primary text-white text-xs font-semibold cursor-pointer">
                      Assign Access
                    </button>
                  </form>
                )}

                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-[#8D96A7] font-bold uppercase tracking-wider text-[9px] border-b border-border-color/60 pb-2">
                        <th className="pb-2">Avatar</th>
                        <th className="pb-2">Name</th>
                        <th className="pb-2">Workspace Role</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2 text-right">Revoke</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color/30">
                      {projectMembers.map((m) => (
                        <tr key={m.id} className="hover:bg-hover-bg/15 transition-colors">
                          <td className="py-3.5">
                            <div className="h-7 w-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-[10px] text-primary uppercase">
                              {m.user_details?.full_name?.substring(0, 2) || "OP"}
                            </div>
                          </td>
                          <td className="py-3.5 font-bold text-white">{m.user_details?.full_name || m.user_details?.email}</td>
                          <td className="py-3.5 capitalize font-mono text-primary">{m.role}</td>
                          <td className="py-3.5">
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]">
                              {m.status || "Active"}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            <button 
                              onClick={() => handleRemoveMember(m.id)}
                              className="p-1 rounded text-[#8D96A7] hover:text-[#EF4444] transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeSubTab === "files" && (
              <div className="flex flex-col gap-4 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-border-color/40 pb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Project Files Node</h3>
                  
                  <label className="text-[10px] text-primary hover:underline font-bold cursor-pointer flex items-center gap-1">
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>Upload Attachment</span>
                    <input 
                      type="file" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      disabled={isUploadingFile}
                    />
                  </label>
                </div>

                {isUploadingFile && (
                  <div className="py-6 text-center text-xs text-[#8D96A7] bg-[#16181D]/30 border border-border-color rounded-xl animate-pulse">
                    <span>Uploading attachment asset node...</span>
                  </div>
                )}

                {projectFiles.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#8D96A7]">
                    No attached asset documents linked to project cluster.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {projectFiles.map((file) => (
                      <div key={file.id} className="p-4 bg-[#16181D]/30 border border-border-color rounded-xl flex flex-col gap-2.5 items-start justify-between hover:border-primary/20 transition-all group h-32">
                        <div className="flex justify-between items-start w-full">
                          <FileText className="h-6 w-6 text-[#8D96A7] group-hover:text-primary transition-colors" />
                          <button 
                            onClick={() => handleFileDelete(file.id)}
                            className="p-1 rounded opacity-0 group-hover:opacity-100 text-[#8D96A7] hover:text-[#EF4444] transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="w-full min-w-0">
                          <span className="text-[10px] font-bold text-white truncate block w-full">{file.name}</span>
                          <span className="text-[9px] text-[#8D96A7] font-mono mt-0.5 block">{parseFloat((file.file_size / 1024).toFixed(1))} KB</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSubTab === "activity" && (
              <div className="flex flex-col gap-4 animate-fadeIn">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-border-color/40 pb-2 mb-1">Project Log Timeline</h3>
                
                <div className="relative pl-4 border-l border-border-color/60 flex flex-col gap-4 py-1 ml-1.5">
                  {projectActivities.length === 0 ? (
                    <span className="text-xs text-text-muted py-6 text-center block">No modifications logged on this project workspace.</span>
                  ) : (
                    projectActivities.map((act) => (
                      <div key={act.id} className="relative flex flex-col gap-1 text-xs">
                        <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                        <span className="font-bold text-white">{act.actor_details?.full_name || "Operator"} {act.action} {act.module}</span>
                        <span className="text-[10px] text-[#8D96A7] leading-relaxed">{act.object_repr}</span>
                        <span className="text-[9px] text-text-muted mt-0.5 font-mono">{new Date(act.created_at).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeSubTab === "settings" && (
              <form onSubmit={handleUpdateProjectSubmit} className="flex flex-col gap-5 text-left animate-fadeIn max-w-xl">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-border-color/40 pb-2 mb-1">Configure Parameters</h3>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Project Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Description</label>
                  <textarea
                    required
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="p-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none h-20 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Status Node</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none"
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Priority State</label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border-color/60">
                  <button type="submit" className="h-10 px-6 rounded-xl bg-primary text-white font-semibold text-xs cursor-pointer hover:bg-primary-hover transition-colors">
                    Save Modifications
                  </button>
                  <button 
                    type="button"
                    onClick={handleDeleteProject}
                    className="h-10 px-6 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/5 hover:bg-[#EF4444]/15 text-[#EF4444] font-bold text-xs cursor-pointer transition-all"
                  >
                    Delete Project
                  </button>
                </div>
              </form>
            )}

          </div>
        </>
      )}

    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="py-20 flex flex-col items-center justify-center gap-2 text-xs text-text-muted">
        <span className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Loading projects panel...</span>
      </div>
    }>
      <ProjectsPageContent />
    </Suspense>
  );
}
