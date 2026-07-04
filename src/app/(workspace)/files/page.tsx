"use client";
import React, { useState } from "react";
import { 
  FolderClosed, 
  FileText, 
  Image, 
  Table, 
  UploadCloud, 
  Search, 
  Download, 
  Trash2, 
  ChevronRight,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DriveFile {
  id: number;
  name: string;
  type: "document" | "spreadsheet" | "image" | "folder";
  size: string;
  updatedAt: string;
  tag: string;
}

export default function FilesPage() {
  const [files, setFiles] = useState<DriveFile[]>([
    { id: 1, name: "Project Guidelines", type: "folder", size: "--", updatedAt: "1 hour ago", tag: "Engineering" },
    { id: 2, name: "monthly_revenue_q2.csv", type: "spreadsheet", size: "450 KB", updatedAt: "3 days ago", tag: "Analytics" },
    { id: 3, name: "architecture_flowchart.png", type: "image", size: "1.2 MB", updatedAt: "Yesterday", tag: "Development" },
    { id: 4, name: "unibind_ec_data.pdf", type: "document", size: "2.4 MB", updatedAt: "1 week ago", tag: "Research" },
  ]);

  const [search, setSearch] = useState("");

  const getIcon = (type: string) => {
    switch (type) {
      case "folder":
        return <FolderClosed className="h-4.5 w-4.5 text-primary" />;
      case "spreadsheet":
        return <Table className="h-4.5 w-4.5 text-[#22C55E]" />;
      case "image":
        return <Image className="h-4.5 w-4.5 text-purple-400" />;
      default:
        return <FileText className="h-4.5 w-4.5 text-[#8D96A7]" />;
    }
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.tag.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-color/60 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Files Explorer</h1>
          <p className="text-xs text-[#8D96A7] mt-1">Manage asset uploads, document guidelines, and vector files databases.</p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/10 self-start md:self-auto transition-all"
        >
          <UploadCloud className="h-4.5 w-4.5" />
          <span>Upload Asset</span>
        </button>
      </div>

      {/* Path Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-[#8D96A7]">
        <span>My Files</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-white font-semibold">Root Directory</span>
      </div>

      {/* Filter Control */}
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

      {/* Files List View */}
      <div className="bg-card-bg border border-border-color rounded-card p-6 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-color/60 text-[#8D96A7] font-bold uppercase tracking-wider text-[9px] pb-3">
                <th className="pb-3 pl-2">Name</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">File Size</th>
                <th className="pb-3">Upload Date</th>
                <th className="pb-3">Access tag</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color/40">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-[#16181D]/30 transition-colors">
                  <td className="py-4 pl-2 font-bold text-white flex items-center gap-2.5 cursor-pointer hover:text-primary transition-colors">
                    {getIcon(file.type)}
                    <span>{file.name}</span>
                  </td>
                  <td className="py-4 text-[#B7BDC8] capitalize">{file.type}</td>
                  <td className="py-4 text-[#B7BDC8] font-mono">{file.size}</td>
                  <td className="py-4 text-[#B7BDC8]">{file.updatedAt}</td>
                  <td className="py-4">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-primary/20 bg-primary/5 text-primary">
                      {file.tag}
                    </span>
                  </td>
                  <td className="py-4 text-right pr-2">
                    <div className="inline-flex gap-2">
                      <button className="p-1.5 rounded hover:bg-hover-bg text-[#8D96A7] hover:text-white">
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-hover-bg text-[#8D96A7] hover:text-[#EF4444]">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
