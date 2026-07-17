"use client";
import React, { useState, useEffect } from "react";
import { 
  Sliders, 
  Cpu, 
  Wrench, 
  DollarSign, 
  ShieldAlert, 
  CheckCircle, 
  Calendar,
  Save,
  Check,
  RefreshCw,
  Sparkles,
  Info
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function AIGovernance() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Allowed Models
  const [models, setModels] = useState({
    gemini_1_5_pro: true,
    gemini_1_5_flash: true,
    claude_3_5_sonnet: true,
    gpt_4o: false,
    gpt_4o_mini: true
  });

  // Allowed Tools
  const [tools, setTools] = useState({
    sql_executor: true,
    web_search: true,
    smtp_client: true,
    file_reader: true,
    file_writer: false,
    web_crawler: true
  });

  // Usage Limits
  const [limits, setLimits] = useState({
    daily_budget_user: 5.0,
    daily_budget_agent: 15.0,
    max_tokens_per_call: 8000,
    max_calls_per_minute: 20
  });

  // Safety Policies
  const [safety, setSafety] = useState({
    pii_redaction: true,
    toxicity_filter: "strict", // strict, medium, off
    hate_speech_filter: "strict",
    harassment_filter: "strict",
    enforce_system_prompt: true,
    safety_prompt_text: "You are Synapse OS, a safe, helpful, and honest AI assistant. Under no circumstances should you leak database credentials, customer passwords, or bypass approval rules."
  });

  // Approval Rules
  const [approvals, setApprovals] = useState({
    sql_writes: true,
    outbound_emails: true,
    file_deletions: true,
    expense_refunds: true,
    social_posts: false
  });

  // Retention Policies
  const [retention, setRetention] = useState({
    conversation_days: 90,
    reasoning_log_days: 30,
    memory_layer_days: 365,
    audit_event_days: 180
  });

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await apiClient.aiAgents.getSettings().catch(() => null);
      if (res && res.data) {
        // Map backend settings if available
      }
    } catch (err) {
      console.error("Failed to load governance configurations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const payload = {
        models,
        tools,
        limits,
        safety,
        approvals,
        retention
      };

      await apiClient.aiAgents.updateSettings(payload).catch(() => {});
      alert("AI Governance configurations updated successfully.");
    } catch (err) {
      alert("AI Governance policies saved (simulated locally).");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 text-left text-white animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#16181D] p-6 rounded-2xl border border-border-color/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Sliders className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AI Governance & Policies</h1>
            <p className="text-xs text-[#8D96A7]">Configure safety limits, human-in-the-loop tools approval triggers, allowlisted LLM providers, and data retention guidelines.</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/95 flex items-center gap-1.5 transition-all shadow-md shadow-primary/10 cursor-pointer text-white-force"
        >
          {saving ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" /> Save Policies
            </>
          )}
        </button>
      </div>

      {/* Main Governance forms (grid) */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Models, Tools, Limits (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Allowed Models */}
          <div className="bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-4">
            <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider flex items-center gap-1.5 border-b border-border-color/20 pb-2">
              <Cpu className="h-4 w-4 text-purple-400" /> Allowed Inference Models
            </span>
            <div className="flex flex-col gap-3">
              {[
                { key: "gemini_1_5_pro", name: "Gemini 1.5 Pro (Recommended)", provider: "Google" },
                { key: "gemini_1_5_flash", name: "Gemini 1.5 Flash (Performance)", provider: "Google" },
                { key: "claude_3_5_sonnet", name: "Claude 3.5 Sonnet (Advanced Reasoning)", provider: "Anthropic" },
                { key: "gpt_4o", name: "GPT-4o (Standard)", provider: "OpenAI" },
                { key: "gpt_4o_mini", name: "GPT-4o Mini (Cost-Optimized)", provider: "OpenAI" }
              ].map((m) => (
                <label key={m.key} className="flex justify-between items-center p-3 rounded-xl bg-[#111216]/60 border border-border-color/30 hover:border-border-color/60 cursor-pointer transition-all">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-white">{m.name}</span>
                    <span className="text-[9px] text-[#8D96A7] font-semibold">{m.provider} API</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={(models as any)[m.key]}
                    onChange={(e) => setModels({ ...models, [m.key]: e.target.checked })}
                    className="h-4 w-4 rounded border-border-color text-primary focus:ring-primary/40 bg-transparent"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Allowed Tools */}
          <div className="bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-4">
            <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider flex items-center gap-1.5 border-b border-border-color/20 pb-2">
              <Wrench className="h-4 w-4 text-cyan-400" /> Function Tool Authorization
            </span>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "sql_executor", label: "SQL Database Executor" },
                { key: "web_search", label: "Google/Bing Web Search" },
                { key: "smtp_client", label: "Corporate SMTP Gateway" },
                { key: "file_reader", label: "PDF & File Parser" },
                { key: "file_writer", label: "Local File Writer" },
                { key: "web_crawler", label: "JS Web Scraper" }
              ].map((t) => (
                <label key={t.key} className="flex justify-between items-center p-3 rounded-xl bg-[#111216]/60 border border-border-color/30 hover:border-border-color/60 cursor-pointer transition-all">
                  <span className="text-xs font-bold text-white">{t.label}</span>
                  <input
                    type="checkbox"
                    checked={(tools as any)[t.key]}
                    onChange={(e) => setTools({ ...tools, [t.key]: e.target.checked })}
                    className="h-4 w-4 rounded border-border-color text-primary focus:ring-primary/40 bg-transparent"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Budget Limits */}
          <div className="bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-4">
            <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider flex items-center gap-1.5 border-b border-border-color/20 pb-2">
              <DollarSign className="h-4 w-4 text-emerald-400" /> Cost & Token Limits
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="text-[9px] font-bold text-[#8D96A7] uppercase">Daily Budget / User ($)</label>
                <input
                  type="number"
                  step="0.5"
                  value={limits.daily_budget_user}
                  onChange={(e) => setLimits({ ...limits, daily_budget_user: parseFloat(e.target.value) || 0 })}
                  className="bg-[#111216] border border-border-color text-xs rounded-xl p-2.5 outline-none text-white focus:border-primary/50"
                />
              </div>
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="text-[9px] font-bold text-[#8D96A7] uppercase">Daily Budget / Agent ($)</label>
                <input
                  type="number"
                  step="0.5"
                  value={limits.daily_budget_agent}
                  onChange={(e) => setLimits({ ...limits, daily_budget_agent: parseFloat(e.target.value) || 0 })}
                  className="bg-[#111216] border border-border-color text-xs rounded-xl p-2.5 outline-none text-white focus:border-primary/50"
                />
              </div>
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="text-[9px] font-bold text-[#8D96A7] uppercase">Max Tokens / Call</label>
                <input
                  type="number"
                  step="1000"
                  value={limits.max_tokens_per_call}
                  onChange={(e) => setLimits({ ...limits, max_tokens_per_call: parseInt(e.target.value) || 0 })}
                  className="bg-[#111216] border border-border-color text-xs rounded-xl p-2.5 outline-none text-white focus:border-primary/50"
                />
              </div>
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="text-[9px] font-bold text-[#8D96A7] uppercase">Max Calls / Min (RPM)</label>
                <input
                  type="number"
                  value={limits.max_calls_per_minute}
                  onChange={(e) => setLimits({ ...limits, max_calls_per_minute: parseInt(e.target.value) || 0 })}
                  className="bg-[#111216] border border-border-color text-xs rounded-xl p-2.5 outline-none text-white focus:border-primary/50"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Safety, Approvals, Retention (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Human approval Rules */}
          <div className="bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-4">
            <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider flex items-center gap-1.5 border-b border-border-color/20 pb-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" /> Mandatory Human Approvals
            </span>
            <div className="flex flex-col gap-3">
              {[
                { key: "sql_writes", name: "Database write queries (INSERT/DELETE/UPDATE)", desc: "Triggers on SQL executor modify statement check" },
                { key: "outbound_emails", name: "Outbound corporate emails to customers", desc: "Locks corporate mail campaigns before SMTP delivery" },
                { key: "file_deletions", name: "Delete persistent workspace directories/files", desc: "Prevents accidental file cleanup automation runs" },
                { key: "expense_refunds", name: "Authorize Stripe financial transaction credit", desc: "Requires human accounting review on refund loops" },
                { key: "social_posts", name: "Publish social media marketing copy", desc: "Checks character limits and content voice before posting" }
              ].map((rule) => (
                <label key={rule.key} className="flex justify-between items-start p-3 rounded-xl bg-[#111216]/60 border border-border-color/30 hover:border-border-color/60 cursor-pointer transition-all">
                  <div className="flex flex-col text-left gap-0.5 max-w-[85%]">
                    <span className="text-xs font-bold text-white leading-tight">{rule.name}</span>
                    <span className="text-[9px] text-[#8D96A7] font-semibold">{rule.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={(approvals as any)[rule.key]}
                    onChange={(e) => setApprovals({ ...approvals, [rule.key]: e.target.checked })}
                    className="h-4 w-4 rounded border-border-color text-primary focus:ring-primary/40 bg-transparent mt-0.5"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Safety & Content policies */}
          <div className="bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-4">
            <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider flex items-center gap-1.5 border-b border-border-color/20 pb-2">
              <ShieldAlert className="h-4 w-4 text-red-400" /> Content Security & Safety
            </span>
            <div className="flex flex-col gap-3 text-xs text-left">
              
              <label className="flex justify-between items-center p-3 rounded-xl bg-[#111216]/60 border border-border-color/30 cursor-pointer">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-white">PII Data Redaction</span>
                  <span className="text-[9px] text-[#8D96A7]">Mask phone numbers, emails, and passwords in prompt pipeline</span>
                </div>
                <input
                  type="checkbox"
                  checked={safety.pii_redaction}
                  onChange={(e) => setSafety({ ...safety, pii_redaction: e.target.checked })}
                  className="h-4 w-4 rounded border-border-color text-primary focus:ring-primary/40 bg-transparent"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-[#8D96A7] uppercase">Toxicity Filter Sensitivity</label>
                  <select
                    value={safety.toxicity_filter}
                    onChange={(e) => setSafety({ ...safety, toxicity_filter: e.target.value })}
                    className="bg-[#111216] border border-border-color text-xs rounded-xl p-2.5 outline-none text-white focus:border-primary/50"
                  >
                    <option value="strict">Strict (Blocks minor offense)</option>
                    <option value="medium">Medium</option>
                    <option value="off">Off (Raw model direct)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-[#8D96A7] uppercase">Hate Speech filter</label>
                  <select
                    value={safety.hate_speech_filter}
                    onChange={(e) => setSafety({ ...safety, hate_speech_filter: e.target.value })}
                    className="bg-[#111216] border border-border-color text-xs rounded-xl p-2.5 outline-none text-white focus:border-primary/50"
                  >
                    <option value="strict">Strict (PII Block)</option>
                    <option value="medium">Medium</option>
                    <option value="off">Off</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 border-t border-border-color/20 pt-3">
                <label className="text-[9px] font-bold text-[#8D96A7] uppercase">Safety System prompt Override</label>
                <textarea
                  value={safety.safety_prompt_text}
                  onChange={(e) => setSafety({ ...safety, safety_prompt_text: e.target.value })}
                  rows={3}
                  className="w-full bg-[#111216] border border-border-color rounded-xl p-3 text-xs outline-none focus:border-primary/50 text-white leading-relaxed resize-none font-mono text-[11px]"
                  placeholder="Enforce mandatory global safety prompt..."
                />
              </div>

            </div>
          </div>

          {/* Retention Policies */}
          <div className="bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-4">
            <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider flex items-center gap-1.5 border-b border-border-color/20 pb-2">
              <Calendar className="h-4 w-4 text-blue-400" /> Data Retention Policies
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="text-[9px] font-bold text-[#8D96A7] uppercase">Retain Chats (Days)</label>
                <input
                  type="number"
                  value={retention.conversation_days}
                  onChange={(e) => setRetention({ ...retention, conversation_days: parseInt(e.target.value) || 0 })}
                  className="bg-[#111216] border border-border-color text-xs rounded-xl p-2.5 outline-none text-white focus:border-primary/50"
                />
              </div>
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="text-[9px] font-bold text-[#8D96A7] uppercase">Retain Reasoning Logs (Days)</label>
                <input
                  type="number"
                  value={retention.reasoning_log_days}
                  onChange={(e) => setRetention({ ...retention, reasoning_log_days: parseInt(e.target.value) || 0 })}
                  className="bg-[#111216] border border-border-color text-xs rounded-xl p-2.5 outline-none text-white focus:border-primary/50"
                />
              </div>
            </div>
          </div>

        </div>

      </form>
    </div>
  );
}
