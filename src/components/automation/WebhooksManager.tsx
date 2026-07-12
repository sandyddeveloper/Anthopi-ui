"use client";
import React, { useState } from "react";
import { 
  Link2, 
  Copy, 
  Check, 
  Terminal, 
  Trash2, 
  Play, 
  ChevronRight, 
  AlertCircle,
  Code,
  ShieldAlert,
  Sliders,
  Server
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Webhook {
  id: string | number;
  url: string;
  method: "POST" | "GET" | "PUT";
  status: "Active" | "Inactive";
  workflowName: string;
  created: string;
}

interface WebhooksManagerProps {
  webhooks: Webhook[];
  onToggleWebhook: (id: string | number) => void;
  onDeleteWebhook: (id: string | number) => void;
}

export function WebhooksManager({ webhooks, onToggleWebhook, onDeleteWebhook }: WebhooksManagerProps) {
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const [payloadText, setPayloadText] = useState('{\n  "lead_name": "Antigravity Dev",\n  "company": "DeepMind Partner",\n  "budget_size": 25000\n}');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | number | null>(null);

  const handleCopy = (id: string | number, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleTestTrigger = (id: string | number) => {
    setTestingId(id);
    setTestResult(null);

    // Simulate webhook dispatch execution latency
    setTimeout(() => {
      try {
        JSON.parse(payloadText); // validation check
        setTestResult(`{
  "status": "Success",
  "http_code": 200,
  "execution_id": 4025,
  "message": "Webhook payload received. Initiated workflow routing loop.",
  "runtime_ms": 142
}`);
      } catch (err) {
        setTestResult(`{
  "status": "Bad Request",
  "http_code": 400,
  "error": "SyntaxError: Invalid JSON payload input string format."
}`);
      }
      setTestingId(null);
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn text-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-color/60 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Link2 className="h-6 w-6 text-primary" />
            <span>Webhooks Ingestion</span>
          </h1>
          <p className="text-xs text-[#8D96A7] mt-1">Receive external HTTP POST payloads in real-time to trigger downstream workflows.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
        {/* Left Side: Webhooks List */}
        <div className="xl:col-span-2 bg-card-bg border border-border-color rounded-card p-5 shadow-card flex flex-col gap-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider text-left">Active Ingestion Endpoints</h3>

          <div className="flex flex-col gap-3">
            {webhooks.length > 0 ? (
              webhooks.map((hook) => (
                <div 
                  key={hook.id} 
                  className="p-4 rounded-xl border border-border-color bg-[#16181D]/20 flex flex-col gap-3 hover:border-primary/20 transition-all text-left"
                >
                  {/* Top Row: Method & Title */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-primary/10 text-primary border border-primary/20 font-bold px-2 py-0.5 rounded text-[8px] uppercase">
                        {hook.method}
                      </span>
                      <h4 className="font-bold text-white text-xs">{hook.workflowName} Trigger</h4>
                    </div>

                    <span className={cn(
                      "text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase inline-block w-fit",
                      hook.status === "Active" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-neutral-600/10 text-neutral-400 border-neutral-600/20"
                    )}>
                      {hook.status}
                    </span>
                  </div>

                  {/* URL Row */}
                  <div className="flex items-center gap-2 bg-black border border-border-color/60 rounded-xl px-3 py-2">
                    <span className="font-mono text-[9px] text-[#B7BDC8] truncate flex-1">{hook.url}</span>
                    <button 
                      onClick={() => handleCopy(hook.id, hook.url)}
                      className="p-1 rounded-lg hover:bg-hover-bg text-[#8D96A7] hover:text-white transition-colors cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedId === hook.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Metrics and Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-[#8D96A7] pt-2 border-t border-border-color/40">
                    <span>Created: {hook.created}</span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleWebhook(hook.id)}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg border font-semibold text-[9px] cursor-pointer",
                          hook.status === "Active" ? "border-border-color text-[#B7BDC8] hover:text-amber-500 hover:bg-hover-bg" : "bg-primary border-transparent text-white hover:bg-primary-hover text-white-force"
                        )}
                      >
                        {hook.status === "Active" ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => onDeleteWebhook(hook.id)}
                        className="p-1.5 rounded-lg border border-border-color hover:bg-rose-500/10 text-[#8D96A7] hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-[#8D96A7] italic text-center">
                No webhooks configured. Create a workflow with a webhook trigger to initialize an endpoint.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Payload Tester Console */}
        <div className="bg-card-bg border border-border-color rounded-card p-5 shadow-card flex flex-col justify-between min-h-[400px]">
          <div className="text-left border-b border-border-color/60 pb-3 mb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="h-4.5 w-4.5 text-[#8D96A7]" />
              <span>POST Request Tester</span>
            </h3>
            <p className="text-[10px] text-[#8D96A7] mt-0.5">Send a mock payload body parameters to test response outputs</p>
          </div>

          {/* Selector */}
          <div className="flex flex-col gap-3 text-left flex-grow">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-white">Target Webhook</label>
              <select className="w-full px-3 py-2 rounded-xl border border-border-color bg-card-bg text-white cursor-pointer font-bold">
                {webhooks.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.workflowName} Webhook
                  </option>
                ))}
              </select>
            </div>

            {/* Code Textarea */}
            <div className="flex flex-col gap-1.5 flex-1 min-h-[120px]">
              <label className="font-bold text-white">JSON Payload Body</label>
              <textarea
                value={payloadText}
                onChange={(e) => setPayloadText(e.target.value)}
                rows={5}
                className="w-full flex-1 px-3 py-2 rounded-xl border border-border-color bg-black font-mono text-[9px] text-[#B7BDC8] focus:outline-none resize-none"
              />
            </div>

            {/* Test Trigger Action */}
            <button
              onClick={() => handleTestTrigger(webhooks[0]?.id || 1)}
              disabled={testingId !== null || webhooks.length === 0}
              className="w-full py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover disabled:opacity-50 font-bold shadow-lg shadow-primary/10 transition-all cursor-pointer text-white-force flex items-center justify-center gap-1.5"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{testingId !== null ? "Dispatching..." : "Send Test POST Payload"}</span>
            </button>
          </div>

          {/* Test results debugger output */}
          {testResult && (
            <div className="mt-4 p-3 bg-black border border-border-color/60 rounded-xl text-left animate-slideDown flex flex-col gap-1">
              <span className="font-mono text-[8px] font-bold text-[#8D96A7] uppercase tracking-wider">RESPONSE CONSOLE</span>
              <pre className="font-mono text-[9px] text-[#B7BDC8] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[140px] scrollbar-thin">
                {testResult}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
