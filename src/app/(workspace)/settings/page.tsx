"use client";
import React, { useState } from "react";
import { 
  Settings, 
  Shield, 
  CreditCard, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Check, 
  Save, 
  Sliders 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiKey {
  id: number;
  name: string;
  keyPrefix: string;
  status: "Active" | "Revoked";
  createdDate: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("workspace"); // workspace, security, billing, keys
  const [orgName, setOrgName] = useState("Acme Corporation");
  const [isSaved, setIsSaved] = useState(false);

  const [keys, setKeys] = useState<ApiKey[]>([
    { id: 1, name: "Staging Pipeline Key", keyPrefix: "anthopi_live_382a...94fa", status: "Active", createdDate: "2026-06-12" },
    { id: 2, name: "Production Agent Webhook Key", keyPrefix: "anthopi_live_942c...021d", status: "Active", createdDate: "2026-07-02" },
  ]);

  const [newKeyName, setNewKeyName] = useState("");

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const newKey: ApiKey = {
      id: Date.now(),
      name: newKeyName,
      keyPrefix: `anthopi_live_${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
      status: "Active",
      createdDate: new Date().toISOString().split("T")[0],
    };

    setKeys([...keys, newKey]);
    setNewKeyName("");
  };

  const handleRevokeKey = (id: number) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, status: "Revoked" as const } : k));
  };

  const handleSaveWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-6 items-start animate-fadeIn">
      {/* Left panel Settings Subsections */}
      <div className="w-full md:w-64 bg-card-bg border border-border-color rounded-card p-4 shadow-card flex flex-col gap-1 flex-shrink-0">
        {[
          { id: "workspace", label: "Workspace General", icon: <Settings className="h-4.5 w-4.5" /> },
          { id: "security", label: "Security & Audits", icon: <Shield className="h-4.5 w-4.5" /> },
          { id: "billing", label: "Billing & Subscription", icon: <CreditCard className="h-4.5 w-4.5" /> },
          { id: "keys", label: "Developer API Keys", icon: <Sliders className="h-4.5 w-4.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors border border-transparent",
              activeTab === tab.id 
                ? "bg-[#2F81F7]/15 text-primary" 
                : "text-[#8D96A7] hover:text-white hover:bg-hover-bg"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Right panel Viewport details */}
      <div className="flex-1 bg-card-bg border border-border-color rounded-card p-6 md:p-8 shadow-card w-full min-h-[480px]">
        {activeTab === "workspace" && (
          <form onSubmit={handleSaveWorkspace} className="flex flex-col gap-6 max-w-xl text-left animate-fadeIn">
            <div>
              <h3 className="font-bold text-sm text-white">General Workspace Settings</h3>
              <p className="text-[11px] text-[#8D96A7] mt-1">Configure your organization details and system routing settings.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Organization Name</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Primary Admin Seat Email</label>
              <input
                type="email"
                readOnly
                value="admin@anthopi.io"
                className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-[#8D96A7] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-xl bg-primary text-white font-semibold text-xs transition-colors hover:bg-primary-hover shadow-lg shadow-primary/10 self-start"
            >
              {isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              <span>{isSaved ? "Saved Successfully" : "Save Changes"}</span>
            </button>
          </form>
        )}

        {activeTab === "security" && (
          <div className="flex flex-col gap-6 text-left animate-fadeIn">
            <div>
              <h3 className="font-bold text-sm text-white">Security Controls</h3>
              <p className="text-[11px] text-[#8D96A7] mt-1">Manage single sign-on (SSO), logging sessions, and audit details.</p>
            </div>
            
            <div className="flex flex-col gap-4 border-t border-border-color/50 pt-4 mt-2">
              <div className="flex items-center justify-between text-xs text-[#B7BDC8]">
                <div className="flex flex-col">
                  <span className="font-bold text-white">Require Two-Factor Auth (2FA)</span>
                  <span className="text-[10px] text-[#8D96A7] mt-0.5">Enforce email OTP validation for all developer seats.</span>
                </div>
                <input type="checkbox" defaultChecked className="accent-primary h-4 w-4 border-border-color" />
              </div>

              <div className="flex items-center justify-between text-xs text-[#B7BDC8]">
                <div className="flex flex-col">
                  <span className="font-bold text-white">Strict IP Sandbox Access</span>
                  <span className="text-[10px] text-[#8D96A7] mt-0.5">Limit workspace connection queries to verified IPs.</span>
                </div>
                <input type="checkbox" className="accent-primary h-4 w-4 border-border-color" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "billing" && (
          <div className="flex flex-col gap-6 text-left animate-fadeIn">
            <div>
              <h3 className="font-bold text-sm text-white">Billing & Invoices</h3>
              <p className="text-[11px] text-[#8D96A7] mt-1">Check active plan details, download PDFs, and update credit cards.</p>
            </div>
            
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between mt-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Active Workspace Plan</span>
                <h4 className="font-bold text-sm text-white">Enterprise Developer Tier</h4>
                <p className="text-[10px] text-[#8D96A7] mt-1">Includes unlimited workflows, 5 seats, and $15 monthly API credits.</p>
              </div>
              <span className="text-sm font-bold text-white">$49 / mo</span>
            </div>
          </div>
        )}

        {activeTab === "keys" && (
          <div className="flex flex-col gap-6 text-left animate-fadeIn">
            <div>
              <h3 className="font-bold text-sm text-white">Workspace Developer API Keys</h3>
              <p className="text-[11px] text-[#8D96A7] mt-1">Generate credentials to query Anthopi OS triggers externally.</p>
            </div>

            {/* Create Key form */}
            <form onSubmit={handleCreateKey} className="flex gap-2 bg-[#16181D]/60 p-3 rounded-xl border border-border-color/60">
              <input
                type="text"
                required
                placeholder="Key label, e.g. production-s3"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="flex-1 h-9 px-3 text-xs rounded-lg border border-border-color bg-card-bg text-white focus:outline-none"
              />
              <button
                type="submit"
                className="h-9 px-4 rounded-lg bg-primary text-white hover:bg-primary-hover font-semibold text-xs transition-colors"
              >
                Generate Key
              </button>
            </form>

            {/* Keys Table */}
            <div className="overflow-x-auto border border-border-color/60 rounded-xl mt-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#16181D] border-b border-border-color/60 text-[#8D96A7] font-bold uppercase tracking-wider text-[9px] pb-2 pt-2 pl-2">
                    <th className="py-2.5 pl-3">Label Name</th>
                    <th className="py-2.5">API Token Prefix</th>
                    <th className="py-2.5">Date Created</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right pr-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color/40">
                  {keys.map((k) => (
                    <tr key={k.id} className="hover:bg-[#16181D]/20 transition-colors">
                      <td className="py-3 pl-3 font-bold text-white">{k.name}</td>
                      <td className="py-3 font-mono text-[#B7BDC8]">{k.keyPrefix}</td>
                      <td className="py-3 text-[#B7BDC8] font-mono">{k.createdDate}</td>
                      <td className="py-3">
                        <span className={cn(
                          "text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border",
                          k.status === "Active" 
                            ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" 
                            : "bg-neutral-800 text-[#8D96A7] border-neutral-700"
                        )}>
                          {k.status}
                        </span>
                      </td>
                      <td className="py-3 text-right pr-3">
                        {k.status === "Active" && (
                          <button
                            onClick={() => handleRevokeKey(k.id)}
                            className="p-1 rounded text-[#8D96A7] hover:text-[#EF4444] hover:bg-[#2A2F39]"
                            title="Revoke Token"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
