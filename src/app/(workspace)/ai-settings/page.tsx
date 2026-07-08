"use client";
import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Save, 
  HelpCircle, 
  Sliders, 
  Cpu, 
  DollarSign, 
  ShieldAlert, 
  Check, 
  RefreshCw,
  Clock,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

export default function AISettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Available models list from backend
  const [modelsList, setModelsList] = useState<any[]>([]);

  // Settings states
  const [defaultModelId, setDefaultModelId] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [costLimit, setCostLimit] = useState("500.00");
  const [dailyLimit, setDailyLimit] = useState("25.00");
  
  // Provider checkboxes
  const [allowedProviders, setAllowedProviders] = useState<string[]>(["openai", "anthropic"]);

  const loadSettingsData = async () => {
    try {
      const [settingsRes, modelsRes] = await Promise.all([
        apiClient.aiAgents.getSettings().catch(() => ({ data: null })),
        apiClient.aiAgents.listModels().catch(() => ({ data: [] }))
      ]);

      setModelsList(modelsRes.data || []);

      if (settingsRes.data) {
        const s = settingsRes.data;
        setDefaultModelId(s.default_model || "");
        setTemperature(s.temperature || 0.7);
        setMaxTokens(s.max_tokens || 4096);
        setCostLimit(s.cost_limit || "500.00");
        setDailyLimit(s.daily_limit || "25.00");
        setAllowedProviders(s.allowed_providers || ["openai", "anthropic"]);
      } else {
        // Use first model as default if available
        if (modelsRes.data && modelsRes.data.length > 0) {
          setDefaultModelId(modelsRes.data[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to load global AI settings:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  const handleToggleProvider = (code: string) => {
    if (allowedProviders.includes(code)) {
      setAllowedProviders(allowedProviders.filter(p => p !== code));
    } else {
      setAllowedProviders([...allowedProviders, code]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const payload = {
        default_model: defaultModelId || null,
        temperature,
        max_tokens: maxTokens,
        allowed_providers: allowedProviders,
        cost_limit: costLimit ? parseFloat(costLimit) : null,
        daily_limit: dailyLimit ? parseFloat(dailyLimit) : null
      };

      await apiClient.aiAgents.updateSettings(payload);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (e) {
      console.error("Failed to save global AI settings:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn text-left">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" /> Workspace AI Settings
          </h1>
          <p className="text-xs text-[#8D96A7] mt-1">
            Configure system-wide temperature defaults, select engine models, set daily token budgets, and whitelist providers.
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-xs text-[#8D96A7] gap-2 bg-[#16181D]/15 border border-border-color rounded-2xl">
          <span className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Syncing settings parameters...</span>
        </div>
      )}

      {/* Main Settings Form */}
      {!loading && (
        <form onSubmit={handleSave} className="bg-card-bg border border-border-color rounded-2xl p-6 md:p-8 flex flex-col gap-8 shadow-card text-left">
          
          {/* Engine Parameters */}
          <div className="flex flex-col gap-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-border-color pb-3">
              <Sliders className="h-4.5 w-4.5 text-primary" /> Computational Persona Defaults
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-[#8D96A7] uppercase font-bold flex items-center gap-1.5">
                  Default Core Model Engine
                </label>
                <select
                  value={defaultModelId}
                  onChange={(e) => setDefaultModelId(e.target.value)}
                  className="bg-[#16181D] border border-border-color text-xs text-white p-2.5 rounded-xl outline-none"
                >
                  <option value="">No default model</option>
                  {modelsList.map(m => (
                    <option key={m.id} value={m.id}>{m.provider_name} - {m.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-[#8D96A7] uppercase font-bold flex items-center gap-1.5">
                  Max Output Tokens
                </label>
                <input
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value) || 2048)}
                  className="bg-[#16181D] border border-border-color text-xs text-white p-2.5 rounded-xl outline-none"
                />
              </div>
            </div>

            {/* Temperature Slider */}
            <div className="flex flex-col gap-1 text-left">
              <div className="flex justify-between text-[10px] text-[#8D96A7] font-bold uppercase">
                <span>Default Temperature</span>
                <span className="text-primary font-mono">{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-primary bg-[#16181D] h-1.5 rounded-full outline-none mt-2"
              />
              <div className="flex justify-between text-[8px] text-[#5A6376] mt-1 font-mono">
                <span>0.0 (Logical / Analytical)</span>
                <span>1.0 (Creative / Loose)</span>
              </div>
            </div>
          </div>

          {/* Budget Limits */}
          <div className="flex flex-col gap-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-border-color pb-3">
              <DollarSign className="h-4.5 w-4.5 text-[#8D96A7]" /> Spending Limits & Budgets
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-[#8D96A7] uppercase font-bold">Monthly Spending Cap ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={costLimit}
                  onChange={(e) => setCostLimit(e.target.value)}
                  className="bg-[#16181D] border border-border-color text-xs text-white p-2.5 rounded-xl outline-none"
                />
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-[#8D96A7] uppercase font-bold">Daily Running Budget ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(e.target.value)}
                  className="bg-[#16181D] border border-border-color text-xs text-white p-2.5 rounded-xl outline-none"
                />
              </div>
            </div>
          </div>

          {/* Whitelist Providers */}
          <div className="flex flex-col gap-4 text-left">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-border-color pb-3">
              <ShieldAlert className="h-4.5 w-4.5 text-[#8D96A7]" /> Whitelisted Model Engines
            </h3>
            <p className="text-[11px] text-[#8D96A7]">Select LLM engines approved for organization workspaces deployment.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              {[
                { code: "openai", name: "OpenAI" },
                { code: "anthropic", name: "Anthropic" },
                { code: "google", name: "Gemini / Google" },
                { code: "ollama", name: "Local Ollama" }
              ].map(provider => {
                const active = allowedProviders.includes(provider.code);
                return (
                  <button
                    key={provider.code}
                    type="button"
                    onClick={() => handleToggleProvider(provider.code)}
                    className={cn(
                      "p-4 rounded-xl border flex flex-col items-center gap-2 cursor-pointer hover:bg-hover-bg/30 transition-all",
                      active ? "border-primary bg-primary/5 text-primary" : "border-border-color text-[#B7BDC8]"
                    )}
                  >
                    <span className="text-xs font-bold">{provider.name}</span>
                    <span className={cn("text-[9px] px-2 py-0.5 rounded font-bold uppercase", active ? "bg-primary/20 text-primary" : "bg-[#16181D] text-[#8D96A7]")}>
                      {active ? "Allowed" : "Blocked"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t border-border-color pt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {success && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 animate-fadeIn">
                  <Check className="h-4 w-4" /> System settings updated successfully.
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-primary/10"
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Configuration
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
