"use client";
import React, { useState } from "react";
import { 
  Activity, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  Clock, 
  Terminal, 
  FileCode,
  ArrowRight,
  Filter,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutionCenterProps {
  executions: any[];
  onRetry: (id: number) => void;
  onCancel: (id: number) => void;
}

export function ExecutionCenter({ executions, onRetry, onCancel }: ExecutionCenterProps) {
  const [selectedId, setSelectedId] = useState<number>(executions[0]?.id || 1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const selectedExecution = executions.find((e) => e.id === selectedId) || executions[0];

  const filteredExecutions = executions.filter((e) => {
    const matchesSearch = e.workflowName.toLowerCase().includes(search.toLowerCase()) || e.id.toString().includes(search);
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Mock step details for the active execution details view
  const mockExecutionSteps = [
    { id: 1, node: "Webhook Trigger", type: "trigger", duration: "12ms", status: "success", input: '{ "lead_id": 4022, "source": "LinkedIn" }', output: '{ "score_weight": 1.2, "status": "active" }' },
    { id: 2, node: "AI Lead Parser", type: "ai", duration: "480ms", status: "success", input: '{ "prompt": "Evaluate lead fit...", "model": "Claude 3.5 Sonnet" }', output: '{ "fit_score": 0.88, "summary": "Highly matching candidate" }' },
    { id: 3, node: "Condition Decision", type: "logic", duration: "5ms", status: "success", input: "fit_score > 0.80", output: "true" },
    { id: 4, node: "Slack Notification", type: "action", duration: "120ms", status: "success", input: 'Channel: #marketing-alerts, Text: "New Lead score: 0.88!"', output: '{ "ok": true, "ts": "1720803522.00" }' }
  ];

  const failedSteps = [
    ...mockExecutionSteps.slice(0, 2),
    { id: 3, node: "Condition Decision", type: "logic", duration: "5ms", status: "success", input: "fit_score > 0.80", output: "true" },
    { id: 4, node: "Slack Notification", type: "action", duration: "250ms", status: "failed", input: "Channel: #marketing-alerts", output: "Error: 504 Gateway Timeout connecting to slack.com/api" }
  ];

  const activeSteps = selectedExecution?.status === "Failed" ? failedSteps : mockExecutionSteps;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn text-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-color/60 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span>Execution Center</span>
          </h1>
          <p className="text-xs text-[#8D96A7] mt-1">Audit execution histories, debug inputs/outputs, and manage rerun pipelines.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left Side: Runs List */}
        <div className="bg-card-bg border border-border-color rounded-card p-5 shadow-card flex flex-col gap-4 max-h-[640px]">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Run History</h3>

          {/* Search & Filter */}
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8D96A7]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search run ID or flow..."
                className="w-full pl-8.5 pr-3 py-2 rounded-xl border border-border-color bg-[#16181D]/40 text-white placeholder-[#8D96A7] focus:outline-none transition-all"
              />
            </div>
            
            <div className="flex bg-[#16181D]/30 border border-border-color rounded-xl p-1 justify-between">
              {["all", "Success", "Failed", "Running"].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={cn(
                    "flex-1 py-1 rounded-md text-[10px] font-bold capitalize cursor-pointer",
                    statusFilter === f ? "bg-primary text-white" : "text-[#8D96A7] hover:text-white"
                  )}
                >
                  {f === "all" ? "All" : f}
                </button>
              ))}
            </div>
          </div>

          {/* Execution List Scrollbar */}
          <div className="flex-grow overflow-y-auto scrollbar-thin flex flex-col gap-2 pr-1">
            {filteredExecutions.length > 0 ? (
              filteredExecutions.map((run) => {
                const isSelected = run.id === selectedId;
                return (
                  <div
                    key={run.id}
                    onClick={() => setSelectedId(run.id)}
                    className={cn(
                      "p-3 rounded-xl border cursor-pointer flex flex-col gap-2 transition-all text-left",
                      isSelected 
                        ? "border-primary bg-primary/5 text-primary" 
                        : "border-border-color/60 bg-[#16181D]/30 hover:bg-[#16181D]/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-white">#{run.id}</span>
                      <span className={cn(
                        "text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase",
                        run.status === "Success" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                        run.status === "Failed" && "bg-rose-500/10 text-rose-500 border-rose-500/20",
                        run.status === "Running" && "bg-primary/10 text-primary border-primary/20 animate-pulse"
                      )}>
                        {run.status}
                      </span>
                    </div>

                    <span className={cn("text-[11px] font-bold", isSelected ? "text-primary" : "text-white")}>
                      {run.workflowName}
                    </span>

                    <div className="flex items-center justify-between text-[9px] text-[#8D96A7] mt-0.5 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {run.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {run.triggeredBy}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-[#8D96A7] italic text-center">
                No matching executions found.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Selected Run Detail & Console Debugger */}
        {selectedExecution ? (
          <div className="lg:col-span-2 flex flex-col gap-5 text-left">
            {/* Metadata Card */}
            <div className="bg-card-bg border border-border-color rounded-card p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#8D96A7]">Run ID: #{selectedExecution.id}</span>
                  <span className={cn(
                    "text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase",
                    selectedExecution.status === "Success" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                    selectedExecution.status === "Failed" && "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  )}>
                    {selectedExecution.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1">{selectedExecution.workflowName}</h3>
                <p className="text-[10px] text-[#8D96A7] mt-0.5">Started: {selectedExecution.started} | Duration: {selectedExecution.duration}</p>
              </div>

              {/* Rerun / Cancel actions */}
              <div className="flex items-center gap-2">
                {selectedExecution.status === "Failed" && (
                  <button 
                    onClick={() => onRetry(selectedExecution.id)}
                    className="inline-flex items-center gap-1 px-3 py-2 text-[10px] font-bold rounded-xl bg-primary hover:bg-primary-hover text-white transition-all cursor-pointer text-white-force"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Retry Run</span>
                  </button>
                )}
                {selectedExecution.status === "Running" && (
                  <button 
                    onClick={() => onCancel(selectedExecution.id)}
                    className="inline-flex items-center gap-1 px-3 py-2 text-[10px] font-bold rounded-xl border border-rose-500 hover:bg-rose-500/10 text-rose-500 transition-all cursor-pointer"
                  >
                    <span>Abort Run</span>
                  </button>
                )}
              </div>
            </div>

            {/* Steps execution Timeline */}
            <div className="bg-card-bg border border-border-color rounded-card p-5 shadow-card flex flex-col gap-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Node Resolution Sequence</h4>

              <div className="flex flex-col gap-3">
                {activeSteps.map((step, idx) => (
                  <div key={step.id} className="border border-border-color/50 rounded-xl overflow-hidden">
                    {/* Step bar */}
                    <div className="bg-[#16181D]/30 px-4 py-2.5 flex items-center justify-between gap-3 border-b border-border-color/40">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-[10px] text-[#8D96A7] bg-[#16181D] h-5 w-5 rounded-full flex items-center justify-center border border-border-color/60">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-white">{step.node}</span>
                        <span className={cn(
                          "text-[8px] px-1.5 py-0.5 rounded border uppercase",
                          step.type === "trigger" && "bg-primary/10 text-primary border-primary/20",
                          step.type === "ai" && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                          step.type === "logic" && "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                          step.type === "action" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        )}>
                          {step.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="text-[#8D96A7] font-semibold">{step.duration}</span>
                        <span className={cn(
                          "h-2 w-2 rounded-full",
                          step.status === "success" ? "bg-emerald-500" : "bg-rose-500"
                        )} />
                      </div>
                    </div>

                    {/* Step inputs and outputs */}
                    <div className="p-3 bg-[#16181D]/10 grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[9px] text-[#B7BDC8]">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-bold text-[#8D96A7] uppercase tracking-wider text-[8px]">INPUT PARAMETERS</span>
                        <pre className="p-2 bg-black border border-border-color/50 rounded-lg overflow-x-auto max-h-[80px] scrollbar-thin">
                          {step.input}
                        </pre>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="font-bold text-[#8D96A7] uppercase tracking-wider text-[8px]">OUTPUT PAYLOAD</span>
                        <pre className={cn(
                          "p-2 border rounded-lg overflow-x-auto max-h-[80px] scrollbar-thin",
                          step.status === "success" ? "bg-black border-border-color/50" : "bg-rose-500/5 border-rose-500/20 text-rose-400"
                        )}>
                          {step.output}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Run logs console */}
            <div className="bg-black border border-border-color rounded-card p-4 shadow-card font-mono text-[9px] h-36 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-border-color/60 pb-2 mb-2 text-[#8D96A7] flex-shrink-0">
                <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Execution logs.txt</span>
                </span>
                <span className="text-[8px] bg-neutral-800 text-white px-2 py-0.5 rounded border border-neutral-700">STD_OUT</span>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin flex flex-col gap-1.5 text-[#B7BDC8]">
                {selectedExecution.status === "Success" ? (
                  <>
                    <div><span className="text-[#8D96A7]">[12:58:41.120]</span> <span className="text-emerald-500 font-bold">INFO:</span> Initializing workflow execution loop, loaded workflow #{selectedExecution.id}</div>
                    <div><span className="text-[#8D96A7]">[12:58:41.132]</span> <span className="text-emerald-500 font-bold">SUCCESS:</span> Webhook trigger compiled, POST payload verified: 200 OK</div>
                    <div><span className="text-[#8D96A7]">[12:58:41.140]</span> <span className="text-emerald-500 font-bold">INFO:</span> Dispatching token payload to Node 2 [AI Lead Parser]</div>
                    <div><span className="text-[#8D96A7]">[12:58:41.620]</span> <span className="text-emerald-500 font-bold">SUCCESS:</span> Claude 3.5 model returns scoring fit: 0.88 (Tokens: 412 prompt, 95 completion)</div>
                    <div><span className="text-[#8D96A7]">[12:58:41.625]</span> <span className="text-emerald-500 font-bold">INFO:</span> Branching decision true, routing output to channel Slack webhook</div>
                    <div><span className="text-[#8D96A7]">[12:58:41.745]</span> <span className="text-emerald-500 font-bold">SUCCESS:</span> Payload successfully delivered, 201 Created from slack.com</div>
                    <div><span className="text-[#8D96A7]">[12:58:41.747]</span> <span className="text-primary font-bold">COMPLETE:</span> Workflow cycle terminated successfully in {selectedExecution.duration}</div>
                  </>
                ) : (
                  <>
                    <div><span className="text-[#8D96A7]">[14:02:10.820]</span> <span className="text-emerald-500 font-bold">INFO:</span> Initializing workflow execution loop, loaded workflow #{selectedExecution.id}</div>
                    <div><span className="text-[#8D96A7]">[14:02:10.832]</span> <span className="text-emerald-500 font-bold">SUCCESS:</span> Webhook trigger compiled, POST payload verified: 200 OK</div>
                    <div><span className="text-[#8D96A7]">[14:02:10.840]</span> <span className="text-emerald-500 font-bold">INFO:</span> Dispatching token payload to Node 2 [AI Lead Parser]</div>
                    <div><span className="text-[#8D96A7]">[14:02:11.320]</span> <span className="text-emerald-500 font-bold">SUCCESS:</span> Claude 3.5 model returns scoring fit: 0.88</div>
                    <div><span className="text-[#8D96A7]">[14:02:11.325]</span> <span className="text-emerald-500 font-bold">INFO:</span> Branching decision true, routing output to channel Slack webhook</div>
                    <div><span className="text-[#8D96A7]">[14:02:11.575]</span> <span className="text-rose-500 font-bold">ERROR:</span> POST request to slack.com/api/chat.postMessage failed: 504 Gateway Timeout</div>
                    <div><span className="text-[#8D96A7]">[14:02:11.577]</span> <span className="text-rose-500 font-bold">FATAL:</span> Execution terminated with error. Active retry settings: (3 max, 5s delay)</div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-card-bg border border-border-color rounded-card p-10 flex flex-col items-center justify-center text-center">
            <Activity className="h-10 w-10 text-[#2C313C] mb-3" />
            <span className="font-bold text-white text-xs">No execution selected</span>
            <p className="text-[10px] text-[#8D96A7] mt-1">Select a run from the left panel to inspect detailed node logs and inputs/outputs.</p>
          </div>
        )}
      </div>
    </div>
  );
}
