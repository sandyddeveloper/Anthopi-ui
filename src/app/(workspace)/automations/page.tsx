"use client";
import React, { useState } from "react";
import { 
  Zap, 
  Plus, 
  Search, 
  Play, 
  ZoomIn, 
  ZoomOut, 
  History, 
  Settings, 
  Copy, 
  Check, 
  Trash2, 
  Database,
  ArrowRight,
  Terminal,
  Activity,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Workflow {
  id: number;
  name: string;
  status: "Running" | "Paused" | "Failed" | "Scheduled" | "Draft";
  runsCount: number;
  successRate: string;
  lastRun: string;
  nextRun?: string;
}

interface Node {
  id: string;
  label: string;
  type: "trigger" | "ai" | "condition" | "action";
  status: "idle" | "running" | "success" | "failed";
  details: string;
}

export default function AutomationsPage() {
  // Mock workflow lists
  const [workflows, setWorkflows] = useState<Workflow[]>([
    { id: 1, name: "GitHub Pull Request Vector Ingest", status: "Running", runsCount: 420, successRate: "99.2%", lastRun: "10 min ago" },
    { id: 2, name: "Customer Email Sentiment Hub", status: "Running", runsCount: 1250, successRate: "98.8%", lastRun: "2 hours ago" },
    { id: 3, name: "Daily Marketing SVG Compiler", status: "Scheduled", runsCount: 84, successRate: "100%", lastRun: "Yesterday", nextRun: "Midnight" },
    { id: 4, name: "CRM Database Synchronizer", status: "Paused", runsCount: 520, successRate: "97.5%", lastRun: "2 days ago" },
  ]);

  const [activeWorkflowId, setActiveWorkflowId] = useState<number>(1);
  const [zoom, setZoom] = useState(100);
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // Workflow Builder Canvas Nodes state
  const [nodes, setNodes] = useState<Node[]>([
    { id: "node-1", label: "Webhook Trigger", type: "trigger", status: "idle", details: "POST /v1/incoming-lead" },
    { id: "node-2", label: "AI Parser Node", type: "ai", status: "idle", details: "Model: Claude 3.5 Sonnet" },
    { id: "node-3", label: "Condition Filter", type: "condition", status: "idle", details: "If score > 0.8" },
    { id: "node-4", label: "Slack Notification", type: "action", status: "idle", details: "Channel: #marketing-alerts" }
  ]);

  const activeWorkflow = workflows.find((w) => w.id === activeWorkflowId) || workflows[0];

  // Run simulation debug animation
  const runWorkflowDebugger = () => {
    if (isDebugging) return;
    setIsDebugging(true);
    setDebugLogs(["Initializing workflow execution loop...", `Active template: ${activeWorkflow.name}`]);

    // Reset nodes state to idle first
    setNodes(prev => prev.map(n => ({ ...n, status: "idle" })));

    // Sequential trigger run simulation
    let currentStep = 0;
    const runStep = () => {
      if (currentStep < nodes.length) {
        const activeNode = nodes[currentStep];
        setNodes(prev => prev.map((n, idx) => idx === currentStep ? { ...n, status: "running" } : n));
        setDebugLogs(prev => [...prev, `[PROCESS] Processing Node: ${activeNode.label} (${activeNode.details})`]);

        setTimeout(() => {
          setNodes(prev => prev.map((n, idx) => idx === currentStep ? { ...n, status: "success" } : n));
          setDebugLogs(prev => [...prev, `[SUCCESS] Node completed: ${activeNode.label}`]);
          currentStep++;
          runStep();
        }, 800);
      } else {
        setIsDebugging(false);
        setDebugLogs(prev => [...prev, "[COMPLETE] Workflow run execution logs generated. All nodes reports: 200 OK."]);
      }
    };

    setTimeout(runStep, 400);
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-color/60 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Automation Engine</h1>
          <p className="text-xs text-[#8D96A7] mt-1">Design visual flowcharts linking integrations, triggers, and AI reasoning blocks.</p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/10 self-start md:self-auto transition-all"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>New Workflow</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left Side: Workflows List */}
        <div className="bg-card-bg border border-border-color rounded-card p-5 shadow-card flex flex-col gap-4 max-h-[600px] overflow-y-auto scrollbar-thin">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Workflows</h3>
          <div className="flex flex-col gap-2">
            {workflows.map((wf) => {
              const isActive = wf.id === activeWorkflowId;
              return (
                <div
                  key={wf.id}
                  onClick={() => {
                    setActiveWorkflowId(wf.id);
                    setNodes(prev => prev.map(n => ({ ...n, status: "idle" })));
                    setDebugLogs([]);
                  }}
                  className={cn(
                    "p-3.5 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col gap-2",
                    isActive 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border-color/50 bg-[#16181D]/30 hover:bg-[#16181D]/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs font-bold", isActive ? "text-primary" : "text-white")}>
                      {wf.name}
                    </span>
                    <span className={cn(
                      "text-[8px] uppercase font-extrabold px-1.5 py-0.5 rounded border",
                      wf.status === "Running" && "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
                      wf.status === "Failed" && "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
                      wf.status === "Paused" && "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20",
                      wf.status === "Scheduled" && "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20"
                    )}>
                      {wf.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-[9px] text-[#8D96A7] mt-1">
                    <span>Runs: {wf.runsCount}</span>
                    <span>Success: {wf.successRate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Visual Canvas & Toolbar */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Toolbar panel */}
          <div className="p-3 bg-card-bg border border-border-color rounded-card flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <button 
                onClick={runWorkflowDebugger}
                disabled={isDebugging}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#22C55E] text-white hover:opacity-95 disabled:opacity-50 transition-all shadow-md shadow-[#22C55E]/10"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Test run</span>
              </button>
              <button className="p-2 rounded-lg border border-border-color hover:bg-hover-bg text-[#8D96A7] hover:text-white" title="Copy Nodes">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setZoom(z => Math.max(z - 10, 50))} className="p-1.5 rounded hover:bg-hover-bg text-[#8D96A7]">
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-[10px] font-mono text-[#8D96A7] w-8 text-center">{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(z + 10, 150))} className="p-1.5 rounded hover:bg-hover-bg text-[#8D96A7]">
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Visual Canvas Simulator */}
          <div className="h-96 border border-border-color bg-card-bg rounded-card relative overflow-hidden flex items-center justify-center p-4">
            {/* Grid pattern background */}
            <div className="absolute inset-0 bg-workspace-grid opacity-[0.25] pointer-events-none" />
            
            {/* Connected nodes layout */}
            <div 
              style={{ transform: `scale(${zoom / 100})` }}
              className="flex flex-col sm:flex-row items-center gap-6 relative z-10 transition-transform duration-200"
            >
              {nodes.map((node, idx) => (
                <React.Fragment key={node.id}>
                  {/* Node Card */}
                  <div className={cn(
                    "p-4 rounded-xl border w-40 bg-[#16181D] shadow-lg flex flex-col gap-2 transition-all duration-300 relative",
                    node.status === "idle" && "border-border-color",
                    node.status === "running" && "border-primary ring-1 ring-primary/40 shadow-primary/10",
                    node.status === "success" && "border-[#22C55E] ring-1 ring-[#22C55E]/40 shadow-[#22C55E]/10"
                  )}>
                    <div className="flex items-center justify-between border-b border-border-color/60 pb-1.5">
                      <span className={cn(
                        "text-[9px] uppercase font-bold px-1.5 py-0.5 rounded",
                        node.type === "trigger" && "bg-primary/10 text-primary border border-primary/20",
                        node.type === "ai" && "bg-secondary/10 text-secondary border border-secondary/20",
                        node.type === "condition" && "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
                        node.type === "action" && "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20"
                      )}>
                        {node.type}
                      </span>
                      {node.status === "running" && (
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-white">{node.label}</span>
                    <span className="text-[9px] text-[#8D96A7] truncate font-mono">{node.details}</span>
                  </div>

                  {/* Connecting line */}
                  {idx < nodes.length - 1 && (
                    <div className="hidden sm:flex items-center text-[#8D96A7]">
                      <ArrowRight className="h-4 w-4 animate-pulse text-primary" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Debug logs panel */}
          <div className="p-4 bg-black border border-border-color rounded-card font-mono text-[10px] h-32 overflow-y-auto flex flex-col gap-1.5 scrollbar-thin text-[#B7BDC8]">
            <div className="flex items-center justify-between border-b border-border-color/60 pb-1.5 mb-1 text-[#8D96A7] flex-shrink-0">
              <span className="font-bold uppercase tracking-wider">Debugger Execution Console logs.sh</span>
              {isDebugging && <span className="animate-pulse text-primary">RUNNING...</span>}
            </div>
            {debugLogs.length > 0 ? (
              debugLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-[#8D96A7]">&gt;</span>
                  <span>{log}</span>
                </div>
              ))
            ) : (
              <span className="text-[#8D96A7] italic">No logs generated. Click 'Test run' above to start testing nodes.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
