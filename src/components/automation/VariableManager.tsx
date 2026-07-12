"use client";
import React, { useState } from "react";
import { 
  Wrench, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  HelpCircle,
  Sliders,
  Check,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Variable {
  id: string | number;
  key: string;
  type: "String" | "Number" | "Boolean" | "JSON" | "Secret";
  scope: "Workflow" | "Project" | "Employee" | "System" | "AI";
  defaultValue: string;
  required: boolean;
}

interface VariableManagerProps {
  variables: Variable[];
  onAddVariable: (variable: Omit<Variable, "id">) => void;
  onDeleteVariable: (id: string | number) => void;
}

export function VariableManager({ variables, onAddVariable, onDeleteVariable }: VariableManagerProps) {
  const [activeScope, setActiveScope] = useState<string>("all");
  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState<Variable["type"]>("String");
  const [newScope, setNewScope] = useState<Variable["scope"]>("Workflow");
  const [newVal, setNewVal] = useState("");
  const [newRequired, setNewRequired] = useState(false);
  const [revealSecrets, setRevealSecrets] = useState<Array<string | number>>([]);
  const [formOpen, setFormOpen] = useState(false);

  const scopes = ["all", "Workflow", "Project", "Employee", "System", "AI"];

  const filteredVariables = variables.filter((v) => {
    return activeScope === "all" || v.scope === activeScope;
  });

  const toggleRevealSecret = (id: string | number) => {
    setRevealSecrets(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    onAddVariable({
      key: newKey.toUpperCase().replace(/\s+/g, "_"),
      type: newType,
      scope: newScope,
      defaultValue: newVal,
      required: newRequired
    });

    setNewKey("");
    setNewVal("");
    setNewRequired(false);
    setFormOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn text-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-color/60 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Wrench className="h-6 w-6 text-[#8B5CF6]" />
            <span>Environment Variables</span>
          </h1>
          <p className="text-xs text-[#8D96A7] mt-1">Configure global, AI, or project-scoped context inputs to pass across node execution curves.</p>
        </div>
        <button
          onClick={() => setFormOpen(!formOpen)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/10 transition-all cursor-pointer text-white-force"
        >
          {formOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          <span>{formOpen ? "Close Form" : "Add Variable"}</span>
        </button>
      </div>

      {/* Grid containing create form or scope tags */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left Form: Add Variable */}
        {formOpen && (
          <div className="bg-card-bg border border-border-color rounded-card p-5 shadow-card flex flex-col gap-4 text-left animate-slideDown">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Define Variable</h3>
            <form onSubmit={handleAdd} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-white">Variable Key Name *</label>
                <input
                  type="text"
                  required
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g. SLACK_BOT_TOKEN"
                  className="w-full px-3 py-2 rounded-xl border border-border-color bg-[#16181D]/30 text-white focus:outline-none focus:border-primary/50 uppercase transition-all font-mono text-[10px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-white">Data Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-border-color bg-card-bg text-white outline-none cursor-pointer font-bold"
                  >
                    <option value="String">String</option>
                    <option value="Number">Number</option>
                    <option value="Boolean">Boolean</option>
                    <option value="JSON">JSON Object</option>
                    <option value="Secret">Secret (Encrypted)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-white">Target Scope</label>
                  <select
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-border-color bg-card-bg text-white outline-none cursor-pointer font-bold"
                  >
                    <option value="Workflow">Workflow Only</option>
                    <option value="Project">Project Global</option>
                    <option value="Employee">Employee Level</option>
                    <option value="System">System Base</option>
                    <option value="AI">AI Context Agent</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-white">Default Value</label>
                {newType === "Secret" ? (
                  <input
                    type="password"
                    value={newVal}
                    onChange={(e) => setNewVal(e.target.value)}
                    placeholder="••••••••••••••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-border-color bg-[#16181D]/30 text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                  />
                ) : (
                  <textarea
                    value={newVal}
                    onChange={(e) => setNewVal(e.target.value)}
                    placeholder="Enter default parameter value..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-border-color bg-[#16181D]/30 text-white focus:outline-none focus:border-primary/50 transition-all resize-none font-mono"
                  />
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requiredCheck"
                  checked={newRequired}
                  onChange={(e) => setNewRequired(e.target.checked)}
                  className="rounded border-border-color bg-[#16181D]/30 accent-primary h-4 w-4"
                />
                <label htmlFor="requiredCheck" className="font-bold text-white cursor-pointer select-none">
                  Mark as Required parameter for this workflow
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover font-bold shadow-lg shadow-primary/10 transition-all cursor-pointer text-white-force"
              >
                Save Parameter
              </button>
            </form>
          </div>
        )}

        {/* Right Section: Variables Listing Table */}
        <div className={cn(
          "bg-card-bg border border-border-color rounded-card p-5 shadow-card flex flex-col gap-4 text-left",
          formOpen ? "xl:col-span-2" : "xl:col-span-3"
        )}>
          {/* Scope Filters */}
          <div className="flex flex-wrap gap-1 border-b border-border-color/60 pb-3 mb-2">
            {scopes.map((scope) => (
              <button
                key={scope}
                onClick={() => setActiveScope(scope)}
                className={cn(
                  "px-3 py-1.5 font-bold rounded-lg capitalize transition-colors cursor-pointer",
                  activeScope === scope 
                    ? "bg-[#16181D] text-primary border border-primary/20" 
                    : "text-[#8D96A7] hover:text-white"
                )}
              >
                {scope === "all" ? "All Scopes" : `${scope} Scope`}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            {filteredVariables.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-color/60 text-[#8D96A7] font-bold uppercase tracking-wider text-[9px]">
                    <th className="pb-3 pl-2">Key Parameter</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Default Value / Context</th>
                    <th className="pb-3">Required</th>
                    <th className="pb-3 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color/40">
                  {filteredVariables.map((v) => {
                    const isSecret = v.type === "Secret";
                    const isSecretRevealed = revealSecrets.includes(v.id);
                    return (
                      <tr key={v.id} className="hover:bg-[#16181D]/30 transition-colors">
                        <td className="py-4 pl-2 text-left">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-mono font-bold text-white">{v.key}</span>
                            <span className={cn(
                              "text-[8px] font-extrabold px-1.5 py-0.5 rounded border inline-block w-fit capitalize",
                              v.scope === "Workflow" && "bg-primary/10 text-primary border-primary/20",
                              v.scope === "Project" && "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                              v.scope === "Employee" && "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20",
                              v.scope === "System" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                              v.scope === "AI" && "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            )}>
                              {v.scope} Scope
                            </span>
                          </div>
                        </td>
                        <td className="py-4 font-bold text-[#B7BDC8]">{v.type}</td>
                        <td className="py-4 font-mono text-[#B7BDC8] max-w-[200px] truncate">
                          {isSecret ? (
                            <div className="flex items-center gap-1.5">
                              <span>{isSecretRevealed ? v.defaultValue : "••••••••••••••••"}</span>
                              <button 
                                onClick={() => toggleRevealSecret(v.id)}
                                className="text-[#8D96A7] hover:text-white"
                              >
                                {isSecretRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          ) : (
                            <span>{v.defaultValue || <span className="text-[#8D96A7] italic">Empty</span>}</span>
                          )}
                        </td>
                        <td className="py-4 font-semibold">
                          {v.required ? (
                            <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded font-bold uppercase text-[8px]">Required</span>
                          ) : (
                            <span className="text-[#8D96A7]">Optional</span>
                          )}
                        </td>
                        <td className="py-4 text-right pr-2">
                          <button
                            onClick={() => onDeleteVariable(v.id)}
                            className="p-1.5 rounded-lg border border-border-color/80 bg-[#16181D] hover:bg-rose-500/10 text-[#8D96A7] hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-[#8D96A7]">
                <Wrench className="h-8 w-8 mb-4 text-[#2C313C]" />
                <span>No environment variables found under this scope filters.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
