// src/app/(workspace)/files/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { 
  FolderClosed, 
  FileText, 
  Image as ImageIcon, 
  Table, 
  UploadCloud, 
  Search, 
  Download, 
  Trash2, 
  ChevronRight,
  Plus,
  ArrowLeft,
  X,
  Eye,
  AlertCircle,
  Clock,
  User as UserIcon,
  Shield,
  Layers,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

export default function FilesPage() {
  const searchParams = useSearchParams();

  // Core Data Lists
  const [folders, setFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Directory Navigation
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Modals & Drawers States
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);

  // Filter Search
  const [search, setSearch] = useState("");

  // Create Folder Form State
  const [folderName, setFolderName] = useState("");

  // Upload File Form State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadVisibility, setUploadVisibility] = useState("organization");
  const [uploadProject, setUploadProject] = useState("");
  const [uploadDept, setUploadDept] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const loadExplorerData = async () => {
    setIsLoading(true);
    try {
      const [foldRes, filesRes, projsRes, deptsRes] = await Promise.all([
        apiClient.knowledge.getFolders(),
        apiClient.knowledge.getFiles(),
        apiClient.projects.listProjects(),
        apiClient.orgs.getDepartments()
      ]);
      setFolders(foldRes.data || []);
      setFiles(filesRes.data || []);
      
      const projsList = Array.isArray(projsRes.data) ? projsRes.data : (projsRes.data as any).results || [];
      setProjects(projsList);
      setDepartments(deptsRes.data || []);
    } catch (e) {
      console.error("Failed to load cloud storage nodes:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExplorerData();
  }, []);

  useEffect(() => {
    if (searchParams.get("upload") === "true") {
      setIsUploadModalOpen(true);
    }
    const viewFileId = searchParams.get("view");
    if (viewFileId && files.length > 0) {
      const target = files.find(f => f.id === viewFileId || String(f.id) === String(viewFileId));
      if (target) {
        setSelectedFile(target);
      }
    }
  }, [searchParams, files]);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName) return;
    try {
      await apiClient.knowledge.createFolder({
        name: folderName,
        parent: currentFolderId
      });
      alert("Virtual folder node provisioned.");
      setIsFolderModalOpen(false);
      setFolderName("");
      loadExplorerData();
    } catch (err: any) {
      alert(err?.message || "Failed to create folder.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      if (!uploadName) setUploadName(file.name);
    }
  };

  const handleUploadFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("name", uploadName || uploadFile.name);
    formData.append("file_path", uploadFile);
    formData.append("visibility", uploadVisibility);
    
    if (currentFolderId) formData.append("folder", currentFolderId);
    if (uploadProject) formData.append("project", uploadProject);
    if (uploadDept) formData.append("department", uploadDept);

    try {
      await apiClient.knowledge.createFile(formData);
      alert("Asset uploaded successfully into workspace cluster.");
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadName("");
      loadExplorerData();
    } catch (err: any) {
      alert(err?.message || "Failed to upload file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to permanently delete this digital asset?")) return;
    try {
      await apiClient.knowledge.deleteFile(fileId);
      alert("Asset node terminated.");
      setSelectedFile(null);
      loadExplorerData();
    } catch (err: any) {
      alert(err?.message || "Failed to delete file.");
    }
  };

  const handleDownloadFile = (file: any) => {
    if (file.file_path) {
      window.open(file.file_path, "_blank");
    } else {
      alert("Download target not available.");
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName?.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return <ImageIcon className="h-4.5 w-4.5 text-purple-400" />;
      case "xlsx":
      case "xls":
      case "csv":
        return <Table className="h-4.5 w-4.5 text-[#22C55E]" />;
      case "pdf":
      case "doc":
      case "docx":
        return <FileText className="h-4.5 w-4.5 text-cyan-400" />;
      default:
        return <FileText className="h-4.5 w-4.5 text-[#8D96A7]" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0 || isNaN(bytes)) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Directory filter: Only show folders and files inside the current folder
  const currentFolders = folders.filter(f => f.parent === currentFolderId);
  const currentFiles = files.filter(f => f.folder === currentFolderId);

  const filteredFolders = currentFolders.filter(f => 
    f.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFiles = currentFiles.filter(f => 
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.visibility?.toLowerCase().includes(search.toLowerCase())
  );

  const currentFolderName = currentFolderId 
    ? folders.find(f => f.id === currentFolderId)?.name || "Subdirectory"
    : "Root Directory";

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn text-left">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-color pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white animate-slideIn">Files Explorer</h1>
          <p className="text-xs text-[#8D96A7] mt-1">Manage asset uploads, document guidelines, and vector files databases.</p>
        </div>
        <div className="flex gap-2 self-start md:self-auto">
          <button
            onClick={() => setIsFolderModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-border-color bg-card-bg hover:bg-hover-bg text-[#B7BDC8] hover:text-white transition-all cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Create Folder</span>
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/10 transition-all cursor-pointer"
          >
            <UploadCloud className="h-4.5 w-4.5" />
            <span>Upload Asset</span>
          </button>
        </div>
      </div>

      {/* Path Navigation Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-[#8D96A7]">
        <button 
          onClick={() => setCurrentFolderId(null)}
          className={cn("hover:text-white cursor-pointer font-medium", !currentFolderId && "text-white font-bold pointer-events-none")}
        >
          My Files
        </button>
        {currentFolderId && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <button 
              onClick={() => {
                const parent = folders.find(f => f.id === currentFolderId)?.parent;
                setCurrentFolderId(parent || null);
              }}
              className="hover:text-white cursor-pointer inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back</span>
            </button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white font-semibold">{currentFolderName}</span>
          </>
        )}
      </div>

      {/* Create Folder Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
          <div className="bg-[#20242C] w-full max-w-sm rounded-modal border border-border-color shadow-2xl p-6 flex flex-col gap-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-border-color/60 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Create Folder</span>
              <button onClick={() => setIsFolderModalOpen(false)} className="text-[#8D96A7] hover:text-white cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <form onSubmit={handleCreateFolder} className="flex flex-col gap-3.5 text-left">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Folder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Analytics Invoices"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                />
              </div>
              <button type="submit" className="h-10 rounded-xl bg-primary text-white font-semibold text-xs transition-colors hover:bg-primary-hover shadow-lg shadow-primary/10 mt-2 cursor-pointer">
                Create Folder
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
          <div className="bg-[#20242C] w-full max-w-md rounded-modal border border-border-color shadow-2xl p-6 flex flex-col gap-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-border-color/60 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Upload Digital Asset</span>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-[#8D96A7] hover:text-white cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <form onSubmit={handleUploadFileSubmit} className="flex flex-col gap-3.5 text-left">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Select File</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border-color hover:border-primary/45 rounded-xl p-6 text-center cursor-pointer hover:bg-hover-bg/15 transition-all flex flex-col items-center justify-center gap-1.5"
                >
                  <UploadCloud className="h-8 w-8 text-[#8D96A7]" />
                  <span className="text-xs text-[#B7BDC8]">
                    {uploadFile ? uploadFile.name : "Drag files or click to inspect"}
                  </span>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Financials"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Visibility Clearance</label>
                <select
                  value={uploadVisibility}
                  onChange={(e) => setUploadVisibility(e.target.value)}
                  className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                >
                  <option value="organization">Organization Wide</option>
                  <option value="project">Project Members</option>
                  <option value="department">Department Unit</option>
                  <option value="private">Private (Only Me)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Associate Project (Optional)</label>
                  <select
                    value={uploadProject}
                    onChange={(e) => setUploadProject(e.target.value)}
                    className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none"
                  >
                    <option value="">None</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Associate Dept (Optional)</label>
                  <select
                    value={uploadDept}
                    onChange={(e) => setUploadDept(e.target.value)}
                    className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none"
                  >
                    <option value="">None</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isUploading}
                className="h-10 rounded-xl bg-primary text-white font-semibold text-xs transition-colors hover:bg-primary-hover shadow-lg shadow-primary/10 mt-2 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isUploading ? <span className="h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                <span>{isUploading ? "Uploading Node..." : "Upload Asset"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Filter Control Search */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8D96A7]">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="Filter files by name or tag category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-11 pr-4 text-xs rounded-xl border border-border-color bg-card-bg text-white placeholder-[#8D96A7] focus:outline-none focus:border-primary"
        />
      </div>

      {/* Folders List Grid */}
      {filteredFolders.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-[#8D96A7]">Virtual Directories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {filteredFolders.map((fold) => (
              <div
                key={fold.id}
                onClick={() => setCurrentFolderId(fold.id)}
                className="p-4 bg-card-bg border border-border-color hover:border-primary/20 rounded-card flex items-center gap-3 hover:bg-[#16181D]/30 transition-all cursor-pointer group"
              >
                <div className="p-2 bg-[#16181D] border border-border-color rounded-xl text-primary group-hover:scale-105 transition-transform flex-shrink-0">
                  <FolderClosed className="h-5 w-5" />
                </div>
                <div className="flex flex-col min-w-0 text-left">
                  <span className="font-bold text-white text-xs truncate group-hover:text-primary transition-colors">{fold.name}</span>
                  <span className="text-[9px] text-[#8D96A7] mt-0.5">Directory folder</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files List View */}
      <div className="flex flex-col gap-3">
        <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-[#8D96A7]">Digital Assets</h2>
        <div className="bg-card-bg border border-border-color rounded-card p-6 shadow-card overflow-hidden">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#8D96A7]">
              <span className="inline-block h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2 align-middle" />
              <span>Parsing file indexes...</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8D96A7] flex flex-col items-center justify-center gap-2">
              <FileText className="h-6 w-6 text-[#2C313C]" />
              <span>No asset file items found in this directory folder.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-color/60 text-[#8D96A7] font-bold uppercase tracking-wider text-[9px] pb-3">
                    <th className="pb-3 pl-2">Name</th>
                    <th className="pb-3">Clearance</th>
                    <th className="pb-3">File Size</th>
                    <th className="pb-3">Upload Date</th>
                    <th className="pb-3 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color/30">
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-[#16181D]/15 transition-colors">
                      <td 
                        onClick={() => setSelectedFile(file)}
                        className="py-4 pl-2 font-bold text-white flex items-center gap-2.5 cursor-pointer hover:text-primary transition-colors text-left"
                      >
                        {getFileIcon(file.name)}
                        <span>{file.name}</span>
                      </td>
                      <td className="py-4 text-[#B7BDC8] capitalize font-mono text-[10px]">{file.visibility}</td>
                      <td className="py-4 text-[#B7BDC8] font-mono">{formatSize(file.file_size)}</td>
                      <td className="py-4 text-[#B7BDC8]">{new Date(file.created_at).toLocaleDateString()}</td>
                      <td className="py-4 text-right pr-2">
                        <div className="inline-flex gap-2">
                          <button 
                            onClick={() => handleDownloadFile(file)}
                            className="p-1.5 rounded hover:bg-hover-bg text-[#8D96A7] hover:text-white cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteFile(file.id)}
                            className="p-1.5 rounded hover:bg-hover-bg text-[#8D96A7] hover:text-[#EF4444] cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Asset Preview Details Drawer */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm p-0 select-none">
          <div className="bg-[#20242C] w-full max-w-sm h-full border-l border-border-color shadow-2xl p-6 flex flex-col justify-between animate-slideIn">
            <div className="flex items-center justify-between border-b border-border-color/60 pb-3">
              <div className="flex items-center gap-2.5">
                {getFileIcon(selectedFile.name)}
                <span className="font-bold text-white text-xs truncate max-w-[200px]">{selectedFile.name}</span>
              </div>
              <button onClick={() => setSelectedFile(null)} className="text-[#8D96A7] hover:text-white cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4 text-left text-xs text-[#B7BDC8]">
              
              {/* Optional image preview */}
              {selectedFile.file_path && (selectedFile.name.endsWith(".png") || selectedFile.name.endsWith(".jpg") || selectedFile.name.endsWith(".jpeg") || selectedFile.name.endsWith(".gif")) ? (
                <div className="border border-border-color rounded-xl overflow-hidden bg-[#16181D] aspect-video flex items-center justify-center p-2 mb-2">
                  <img src={selectedFile.file_path} alt={selectedFile.name} className="max-w-full max-h-full object-contain" />
                </div>
              ) : null}

              <div className="flex justify-between border-b border-border-color/30 pb-2">
                <span className="text-[#8D96A7]">Storage ID:</span>
                <span className="font-bold text-white font-mono text-[10px]">{selectedFile.id}</span>
              </div>
              <div className="flex justify-between border-b border-border-color/30 pb-2">
                <span className="text-[#8D96A7]">Visibility Clearance:</span>
                <span className="font-bold text-primary uppercase font-mono text-[10px]">{selectedFile.visibility}</span>
              </div>
              <div className="flex justify-between border-b border-border-color/30 pb-2">
                <span className="text-[#8D96A7]">File Size:</span>
                <span className="font-bold text-white font-mono">{formatSize(selectedFile.file_size)}</span>
              </div>
              <div className="flex justify-between border-b border-border-color/30 pb-2">
                <span className="text-[#8D96A7]">Uploader Seat:</span>
                <span className="font-bold text-white">{selectedFile.created_by_details?.full_name || "Workspace Operator"}</span>
              </div>
              <div className="flex justify-between border-b border-border-color/30 pb-2">
                <span className="text-[#8D96A7]">Associated Project:</span>
                <span className="font-bold text-white truncate max-w-[150px]">{selectedFile.project_details?.name || "None"}</span>
              </div>
              <div className="flex justify-between border-b border-border-color/30 pb-2">
                <span className="text-[#8D96A7]">Associated Dept:</span>
                <span className="font-bold text-white truncate max-w-[150px]">{selectedFile.department_details?.name || "None"}</span>
              </div>
              <div className="flex justify-between border-b border-border-color/30 pb-2">
                <span className="text-[#8D96A7]">Synced:</span>
                <span className="font-bold text-white font-mono">{new Date(selectedFile.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border-color/60 flex flex-col gap-2">
              <button 
                onClick={() => handleDownloadFile(selectedFile)}
                className="w-full h-10 rounded-xl bg-primary text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-primary-hover cursor-pointer shadow-lg shadow-primary/10 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download Asset</span>
              </button>
              <button 
                onClick={() => handleDeleteFile(selectedFile.id)}
                className="w-full h-10 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/5 hover:bg-[#EF4444]/15 text-[#EF4444] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Asset Node</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
