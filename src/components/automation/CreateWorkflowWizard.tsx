"use client";
import React, { useState } from "react";
import { 
  X, 
  Sparkles, 
  Terminal, 
  Globe, 
  Calendar, 
  FolderPlus, 
  Plus, 
  ArrowRight, 
  ArrowLeft, 
  FileCode,
  Users,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorkflow: (data: any) => void;
}

export function CreateWorkflowWizard({ isOpen, onClose, onCreateWorkflow }: WizardProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [folder, setFolder] = useState("Root");
  const [tags, setTags] = useState("");
  const [triggerType, setTriggerType] = useState("Manual");

  if (!isOpen) return null;

  const triggerOptions = [
    { type: "Manual", label: "Manual Trigger", desc: "Run workflow with a single click button", icon: <Terminal className="h-5 w-5 text-neutral-400" /> },
    { type: "Webhook", label: "Webhook Event", desc: "Trigger workflow via external POST endpoint", icon: <Globe className="h-5 w-5 text-emerald-500" /> },
    { type: "Schedule", label: "Cron Schedule", desc: "Trigger at regular intervals or calendared times", icon: <Calendar className="h-5 w-5 text-cyan-500" /> },
    { type: "Project Event", label: "Project Hook", desc: "Trigger when projects are created or modified", icon: <Briefcase className="h-5 w-5 text-primary" /> },
    { type: "File Event", label: "File Uploaded", desc: "Run when a document or file is ingested", icon: <FileCode className="h-5 w-5 text-amber-500" /> },
    { type: "Employee Event", label: "Employee Ingested", desc: "Run when profile is updated or added", icon: <Users className="h-5 w-5 text-[#8B5CF6]" /> },
    { type: "AI Event", label: "AI Agent Output", desc: "Trigger when AI completes reasoning loops", icon: <Sparkles className="h-5 w-5 text-amber-400" /> },
  ];

  const handleNextStep = () => {
    if (step === 1 && !name.trim()) return; // Validation
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    onCreateWorkflow({
      name,
      description,
      category,
      folder,
      tags: tags ? tags.split(",").map(t => t.trim()) : [],
      triggerType
    });
    // Reset state
    setName("");
    setDescription("");
    setCategory("General");
    setTags("");
    setTriggerType("Manual");
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-card-bg border border-border-color rounded-modal shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-scaleIn text-xs">
        {/* Header */}
        <div className="p-5 border-b border-border-color/60 flex items-center justify-between bg-[#16181D]/30">
          <div>
            <h3 className="text-sm font-bold text-white">Create New Workflow</h3>
            <p className="text-[10px] text-[#8D96A7] mt-0.5">Configure the entry parameters and initial webhook mapping</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg border border-border-color hover:bg-hover-bg text-[#8D96A7] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stepper indicator */}
        <div className="px-5 py-3 border-b border-border-color/30 flex items-center justify-between text-[10px] bg-[#16181D]/10">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <span 
                key={s}
                className={cn(
                  "px-2 py-0.5 rounded font-bold border transition-colors",
                  step === s 
                    ? "bg-primary border-transparent text-white" 
                    : step > s 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                      : "bg-[#16181D] border-border-color text-[#8D96A7]"
                )}
              >
                Step {s}
              </span>
            ))}
          </div>
          <span className="text-[#8D96A7] font-semibold">
            {step === 1 && "General Metadata"}
            {step === 2 && "Trigger Mechanism"}
            {step === 3 && "Review Config"}
          </span>
        </div>

        {/* Step Body */}
        <div className="flex-1 p-5 max-h-[360px] overflow-y-auto scrollbar-thin text-left">
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-white">Workflow Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sync CRM Leads to Slack"
                  className="w-full px-3 py-2 rounded-xl border border-border-color bg-[#16181D]/30 text-white placeholder-[#8D96A7] focus:outline-none focus:border-primary/50 transition-all font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-white">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize what this automation pipeline accomplishes..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-border-color bg-[#16181D]/30 text-white placeholder-[#8D96A7] focus:outline-none focus:border-primary/50 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-white">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border-color bg-card-bg text-white focus:outline-none focus:border-primary/50 cursor-pointer font-bold"
                  >
                    <option value="General">General</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR / Ops">HR / Ops</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Sales / CRM">Sales / CRM</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-white">Target Folder</label>
                  <select
                    value={folder}
                    onChange={(e) => setFolder(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border-color bg-card-bg text-white focus:outline-none focus:border-primary/50 cursor-pointer font-bold"
                  >
                    <option value="Root">Root Folder</option>
                    <option value="Marketing Automation">Marketing Automation</option>
                    <option value="HR Pipelines">HR Pipelines</option>
                    <option value="Release Hooks">Release Hooks</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-white">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="AI, Sync, Slack, LeadGen"
                  className="w-full px-3 py-2 rounded-xl border border-border-color bg-[#16181D]/30 text-white placeholder-[#8D96A7] focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-3">
              <label className="font-bold text-white mb-1">Select Entry Trigger Node</label>
              <div className="flex flex-col gap-2">
                {triggerOptions.map((opt) => (
                  <div
                    key={opt.type}
                    onClick={() => setTriggerType(opt.type)}
                    className={cn(
                      "p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3",
                      triggerType === opt.type 
                        ? "border-primary bg-primary/5 shadow-md" 
                        : "border-border-color/60 hover:bg-[#16181D]/40"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#16181D] border border-border-color/60">
                        {opt.icon}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-white">{opt.label}</span>
                        <span className="text-[10px] text-[#8D96A7] mt-0.5">{opt.desc}</span>
                      </div>
                    </div>
                    <div className={cn(
                      "h-4 w-4 rounded-full border flex items-center justify-center",
                      triggerType === opt.type ? "border-primary bg-primary text-white" : "border-border-color"
                    )}>
                      {triggerType === opt.type && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4 text-left">
              <span className="font-bold text-white mb-2">Workflow Summary Review</span>

              <div className="bg-[#16181D]/40 border border-border-color/60 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex justify-between border-b border-border-color/20 pb-2">
                  <span className="text-[#8D96A7]">Workflow Name:</span>
                  <span className="font-bold text-white">{name}</span>
                </div>
                <div className="flex justify-between border-b border-border-color/20 pb-2">
                  <span className="text-[#8D96A7]">Description:</span>
                  <span className="font-medium text-white max-w-[240px] text-right truncate">{description || "No description provided."}</span>
                </div>
                <div className="flex justify-between border-b border-border-color/20 pb-2">
                  <span className="text-[#8D96A7]">Category / Folder:</span>
                  <span className="font-bold text-white capitalize">{category} ({folder})</span>
                </div>
                <div className="flex justify-between border-b border-border-color/20 pb-2">
                  <span className="text-[#8D96A7]">Trigger Mechanism:</span>
                  <span className="font-bold text-primary flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary" /> {triggerType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8D96A7]">Tags Attached:</span>
                  <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
                    {tags ? tags.split(",").map((t, i) => (
                      <span key={i} className="text-[9px] text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                        {t.trim()}
                      </span>
                    )) : <span className="text-[#8D96A7] italic">None</span>}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex gap-2.5 text-[10px] text-[#B7BDC8]">
                <Plus className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" />
                <span>Ready to compile canvas! Click save below to finalize. You will be redirected to the canvas workspace to insert actions and AI blocks.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-color/60 bg-[#16181D]/30 flex items-center justify-between">
          <button
            onClick={step === 1 ? onClose : handlePrevStep}
            className="inline-flex items-center gap-1 px-4.5 py-2 text-xs font-semibold rounded-xl border border-border-color hover:bg-hover-bg text-[#8D96A7] hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{step === 1 ? "Cancel" : "Back"}</span>
          </button>
          
          <button
            onClick={step === 3 ? handleSubmit : handleNextStep}
            disabled={step === 1 && !name.trim()}
            className="inline-flex items-center gap-1 px-4.5 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-all cursor-pointer text-white-force"
          >
            <span>{step === 3 ? "Save & Open Builder" : "Next Step"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
