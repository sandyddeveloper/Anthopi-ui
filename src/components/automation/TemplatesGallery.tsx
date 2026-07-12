"use client";
import React, { useState } from "react";
import { 
  Sparkles, 
  Download, 
  Star, 
  Search, 
  Heart, 
  ExternalLink, 
  LayoutGrid, 
  Briefcase, 
  Bot, 
  Mail, 
  Code2, 
  UserCheck, 
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Template {
  id: string | number;
  name: string;
  description: string;
  category_name?: string;
  downloads_count?: number;
  rating_score?: number;
}

interface TemplatesGalleryProps {
  templates: Template[];
  onImportTemplate: (id: string | number) => void;
}

export function TemplatesGallery({ templates, onImportTemplate }: TemplatesGalleryProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Array<string | number>>([]);

  const categories = [
    { id: "all", label: "All Templates", icon: <LayoutGrid className="h-3.5 w-3.5" /> },
    { id: "Marketing", label: "Marketing", icon: <Mail className="h-3.5 w-3.5 text-rose-500" /> },
    { id: "HR & Operations", label: "HR & Operations", icon: <UserCheck className="h-3.5 w-3.5 text-[#8B5CF6]" /> },
    { id: "Project Mgmt", label: "Project Mgmt", icon: <Briefcase className="h-3.5 w-3.5 text-primary" /> },
    { id: "Dev Tools", label: "Dev Tools", icon: <Code2 className="h-3.5 w-3.5 text-cyan-500" /> },
    { id: "Sales & CRM", label: "Sales & CRM", icon: <Zap className="h-3.5 w-3.5 text-amber-500" /> },
    { id: "Customer Support", label: "Customer Support", icon: <Bot className="h-3.5 w-3.5 text-emerald-500" /> }
  ];

  const toggleFavorite = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const filteredTemplates = templates.filter((tpl) => {
    const categoryName = tpl.category_name || "General";
    const matchesCategory = activeCategory === "all" || categoryName.toLowerCase().includes(activeCategory.toLowerCase()) || activeCategory.toLowerCase().includes(categoryName.toLowerCase());
    const matchesSearch = tpl.name.toLowerCase().includes(search.toLowerCase()) || 
                          tpl.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 animate-fadeIn text-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-color/60 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500 fill-amber-500/10" />
            <span>Workflow Templates</span>
          </h1>
          <p className="text-xs text-[#8D96A7] mt-1">Jumpstart your automation setups with pre-engineered multi-node blueprints.</p>
        </div>
      </div>

      {/* Category Tabs & Search */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-[#16181D]/30 border border-border-color rounded-2xl w-fit">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-2 font-bold rounded-xl transition-all cursor-pointer",
                activeCategory === cat.id 
                  ? "bg-primary text-white" 
                  : "text-[#8D96A7] hover:text-white"
              )}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full xl:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8D96A7]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search blueprints..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border-color bg-[#16181D]/40 text-white placeholder-[#8D96A7] focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTemplates.map((tpl) => {
            const isFav = favorites.includes(tpl.id);
            return (
              <div 
                key={tpl.id}
                className="bg-card-bg border border-border-color rounded-card p-5 shadow-card hover:border-primary/40 group flex flex-col justify-between transition-all duration-200"
              >
                <div>
                  {/* Card top */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={cn(
                      "text-[9px] uppercase font-extrabold px-2 py-0.5 rounded border bg-primary/10 text-primary border-primary/20"
                    )}>
                      {tpl.category_name || "General"}
                    </span>
                    <button
                      onClick={(e) => toggleFavorite(tpl.id, e)}
                      className="p-1.5 rounded-lg border border-border-color/60 bg-[#16181D] hover:bg-hover-bg text-[#8D96A7] hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Heart className={cn("h-3.5 w-3.5", isFav && "fill-rose-500 text-rose-500")} />
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xs font-bold text-white group-hover:text-primary transition-colors text-left">
                    {tpl.name}
                  </h3>
                  <p className="text-[10px] text-[#8D96A7] leading-relaxed mt-2 text-left min-h-[50px] line-clamp-3">
                    {tpl.description}
                  </p>
                </div>

                {/* Card metrics & CTA */}
                <div className="mt-4 pt-3.5 border-t border-border-color/40 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-[10px] text-[#8D96A7] font-semibold">
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" /> {tpl.downloads_count || "120"} imports
                    </span>
                    <span className="flex items-center gap-1 text-white">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" /> {tpl.rating_score || "4.8"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      onClick={() => onImportTemplate(tpl.id)}
                      className="px-3 py-2 rounded-xl bg-primary text-white hover:bg-primary-hover font-bold flex items-center justify-center gap-1 text-[10px] cursor-pointer text-white-force"
                    >
                      <Download className="h-3 w-3" />
                      <span>Import</span>
                    </button>
                    <button
                      className="px-3 py-2 rounded-xl border border-border-color bg-[#16181D] text-white hover:bg-hover-bg font-bold flex items-center justify-center gap-1 text-[10px] cursor-pointer"
                    >
                      <span>Preview</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card-bg border border-border-color rounded-card p-12 text-center flex flex-col items-center justify-center">
          <LayoutGrid className="h-10 w-10 text-[#2C313C] mb-3" />
          <h4 className="text-xs font-bold text-white">No blueprints found</h4>
          <p className="text-[10px] text-[#8D96A7] mt-1 max-w-sm">
            Try adjusting your search criteria or choose another blueprint category above.
          </p>
        </div>
      )}
    </div>
  );
}
