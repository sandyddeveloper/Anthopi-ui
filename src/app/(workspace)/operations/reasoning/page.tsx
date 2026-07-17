"use client";
import React, { useState, useEffect } from "react";
import { 
  Eye, 
  Terminal, 
  Search, 
  Wrench, 
  Play, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  Cpu, 
  Clock, 
  FileText, 
  Database,
  RefreshCw,
  CornerDownRight,
  Code
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function ReasoningViewer() {
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePanelTab, setActivePanelTab] = useState<string>("summary"); // summary, docs, tools, validation, performance

  const mockLogs = [
    {
      id: "log-1",
      execution_id: "exec-921a-4c28",
      agent: "Developer AI",
      model: "Gemini 1.5 Pro",
      question: "Generate a SQL query to fetch all employees in the Sales department with their designated team names and display results in order of joined date.",
      chain_of_thought: "1. Identify target entities: Employee, Department, Team.\n2. Locate joining tables: Employee-Department link, Team-Employee assignment.\n3. Formulate SQL structure: SELECT e.full_name, d.name AS dept_name, t.name AS team_name FROM Employee e JOIN Department d ON e.department_id = d.id JOIN Team t ON e.team_id = t.id WHERE d.code = 'sales' ORDER BY e.date_joined ASC;\n4. Double-check joins to prevent cartesian products.\n5. Run check query to verify schema validity.",
      reflection: "Schema check shows 'date_joined' is named 'joined_at' on EmployeeMaster. Updating SQL mapping query accordingly to avoid ColumnNotFoundException. Self-critique verified: correct table relations mapping.",
      self_check_passed: true,
      error_recovery_actions: "Modified join fields column names from 'date_joined' to 'joined_at'.",
      created_at: "2026-07-17T14:32:00Z",
      metrics: {
        latency_ms: 1240,
        prompt_tokens: 420,
        completion_tokens: 180,
        cost: 0.0018
      },
      documents: [
        { title: "Schema_EmployeeMaster_v2.md", similarity: 0.89, text: "Table: EmployeeMaster has fields (id, full_name, email, role, joined_at, department_id, team_id)." },
        { title: "Organization_DB_Mapping.json", similarity: 0.81, text: "Department has columns (id, name, code). Sales department has code='sales'." }
      ],
      tool_calls: {
        tool_code: "sql_executor",
        input: { query: "SELECT e.full_name, d.name AS dept_name, t.name AS team_name FROM apps_users_user e JOIN apps_organization_department d ON e.department_id = d.id LEFT JOIN apps_organization_team t ON e.team_id = t.id WHERE d.code = 'sales' ORDER BY e.joined_at ASC LIMIT 5;" },
        output: { success: true, rows_returned: 3, rows: [{full_name: "John Doe", dept_name: "Sales", team_name: "Outbound"}, {full_name: "Jane Smith", dept_name: "Sales", team_name: "Enterprise"}] }
      },
      timeline: [
        { time: "14:32:00.101", event: "Load Memory", desc: "Retrieved 2 context points for 'Developer AI' preference." },
        { time: "14:32:00.220", event: "Search Knowledge", desc: "Queried collection 'Developer Docs'; retrieved 2 schemas." },
        { time: "14:32:00.640", event: "Execute SQL", desc: "Executed test query on connection 'Synapse_DB_Replica'." },
        { time: "14:32:01.120", event: "Generate Response", desc: "Synthesized markdown statement formatting." },
        { time: "14:32:01.340", event: "Store Summary", desc: "Saved transaction reference to memory collection." }
      ]
    },
    {
      id: "log-2",
      execution_id: "exec-442b-8a19",
      agent: "Marketing AI",
      model: "Claude 3.5 Sonnet",
      question: "Generate copy for summer sale promo and post directly to the company Twitter channel.",
      chain_of_thought: "1. Analyze promo details: 20% discount on all cloud plans using coupon SUMMERSALE.\n2. Design copy options: Option A (Direct, discount focused), Option B (Story focused).\n3. Twitter post limit check: Ensure copy remains under 280 characters.\n4. Call social media integration API to publish.",
      reflection: "Twitter API integration check failed with 401 Unauthorized. Access token expired.",
      self_check_passed: false,
      error_recovery_actions: "Triggered OAuth credentials rotation worker. Authenticating webhook. Re-trying channel post.",
      created_at: "2026-07-17T13:10:00Z",
      metrics: {
        latency_ms: 2450,
        prompt_tokens: 610,
        completion_tokens: 240,
        cost: 0.0062
      },
      documents: [
        { title: "Brand_Voice_Guidelines.pdf", similarity: 0.85, text: "Aesthetics: Modern, casual, clean. Limit emoji count in tweets to max 2." }
      ],
      tool_calls: {
        tool_code: "twitter_post_api",
        input: { content: "Beat the heat! ☀️ Claim 20% off all Synapse Cloud plans with code SUMMERSALE. Limited time only! http://synapse.os/summer" },
        output: { success: false, error: "Authentication failed. Code 401." }
      },
      timeline: [
        { time: "13:10:00.050", event: "Load Memory", desc: "Checked marketing preference rules." },
        { time: "13:10:00.120", event: "Search Knowledge", desc: "Loaded branding voice patterns." },
        { time: "13:10:00.410", event: "Execute API", desc: "Called POST /api/twitter/tweet; returned 401." },
        { time: "13:10:01.210", event: "Error Recovery", desc: "Triggered authentication refresh handler." },
        { time: "13:10:02.500", event: "Generate Log", desc: "Exited with failure alert dashboard warning." }
      ]
    }
  ];

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.operations.listReasoningLogs();
      const logsData = res.data?.length > 0 ? res.data : mockLogs;
      
      // Enriched logs with details if missing in response
      const fullyMapped = logsData.map((l: any, idx: number) => {
        const fall = mockLogs[idx] || mockLogs[0];
        return {
          id: l.id || `log-${idx}`,
          execution_id: l.execution_id || fall.execution_id,
          agent: l.agent || fall.agent,
          model: l.model || fall.model,
          question: l.question || fall.question,
          chain_of_thought: l.chain_of_thought || fall.chain_of_thought,
          reflection: l.reflection || fall.reflection,
          self_check_passed: l.self_check_passed !== undefined ? l.self_check_passed : fall.self_check_passed,
          error_recovery_actions: l.error_recovery_actions || fall.error_recovery_actions,
          created_at: l.created_at || fall.created_at,
          metrics: l.metrics || fall.metrics,
          documents: l.documents || fall.documents,
          tool_calls: l.tool_calls || fall.tool_calls,
          timeline: l.timeline || fall.timeline
        };
      });

      setLogs(fullyMapped);
      if (fullyMapped.length > 0) {
        setSelectedLog(fullyMapped[0]);
      }
    } catch (err) {
      console.error("Failed to load reasoning logs:", err);
      setLogs(mockLogs);
      setSelectedLog(mockLogs[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 text-left text-white animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#16181D] p-6 rounded-2xl border border-border-color/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Eye className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AI Reasoning Viewer</h1>
            <p className="text-xs text-[#8D96A7]">Inspect the internal thoughts, self-reflection gates, tool selections, and decision logic of running agents.</p>
          </div>
        </div>
        <button 
          onClick={loadLogs}
          className="px-3.5 py-2 rounded-xl bg-[#1d1f27] border border-border-color text-xs font-semibold hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Logs
        </button>
      </div>

      {/* Split view Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        
        {/* Left Sidebar: Runs Index (3 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3 bg-[#16181D] border border-border-color rounded-2xl p-4 overflow-hidden h-[620px]">
          <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider px-2 block">Recent Executions</span>
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 mt-2 scrollbar-thin">
            {logs.map((log) => {
              const isSelected = selectedLog?.id === log.id;
              return (
                <button
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer ${
                    isSelected 
                      ? "bg-primary/10 border-primary text-white" 
                      : "bg-[#111216]/60 border-border-color/40 hover:border-border-color text-[#8D96A7] hover:text-white"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white flex items-center gap-1">
                      <Terminal className="h-3 w-3 text-primary" /> {log.agent}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      log.self_check_passed ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    }`}>
                      {log.self_check_passed ? "Passed" : "Audit Alert"}
                    </span>
                  </div>
                  <p className="text-xs truncate font-medium text-white">{log.question}</p>
                  <div className="flex justify-between text-[9px] text-[#5b6375] font-semibold mt-1">
                    <span>{log.model}</span>
                    <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Detail Panel: Timeline & Inspector (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-[620px] overflow-y-auto pr-1 scrollbar-thin">
          {selectedLog ? (
            <div className="flex flex-col gap-6">
              
              {/* Question Banner */}
              <div className="bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-2.5">
                <div className="flex justify-between items-center border-b border-border-color/40 pb-2.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8D96A7] flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-primary" /> Active Thought loop
                  </span>
                  <span className="text-[10px] text-[#8D96A7] font-bold">Execution ID: <code className="font-mono text-white text-[11px]">{selectedLog.execution_id}</code></span>
                </div>
                <div className="text-left mt-1">
                  <span className="text-[9px] text-[#8D96A7] font-bold block uppercase tracking-wider">Input Prompt / Question</span>
                  <p className="text-xs font-semibold text-white mt-1 leading-relaxed">{selectedLog.question}</p>
                </div>
              </div>

              {/* Reasoning Path Timeline */}
              <div className="bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-4">
                <span className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Reasoning Path</span>
                
                <div className="flex flex-col gap-5 mt-2 relative pl-2">
                  <span className="absolute left-[13px] top-6 bottom-6 w-px bg-border-color/40" />

                  {/* 1. Planning stage */}
                  <div className="flex gap-4 relative">
                    <span className="h-6 w-6 rounded-full border-2 border-primary bg-[#111216] flex-shrink-0 flex items-center justify-center relative z-10 text-[10px] font-bold text-primary">1</span>
                    <div className="flex flex-col text-left gap-1">
                      <span className="text-xs font-extrabold text-white">Chain of Thought (Planning)</span>
                      <p className="text-xs text-[#8D96A7] leading-relaxed whitespace-pre-wrap bg-[#111216]/60 border border-border-color/40 rounded-xl p-3 mt-1 font-mono text-[11px]">{selectedLog.chain_of_thought}</p>
                    </div>
                  </div>

                  {/* 2. Self Reflection gate */}
                  <div className="flex gap-4 relative">
                    <span className={`h-6 w-6 rounded-full border-2 bg-[#111216] flex-shrink-0 flex items-center justify-center relative z-10 text-[10px] font-bold ${
                      selectedLog.self_check_passed ? "border-emerald-500 text-emerald-400" : "border-red-500 text-red-400"
                    }`}>2</span>
                    <div className="flex flex-col text-left gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-white">Self-Reflection & Gatekeeping</span>
                        {selectedLog.self_check_passed ? (
                          <span className="text-[8px] font-bold px-1 py-0.2 bg-emerald-500/10 text-emerald-400 rounded uppercase">Passed</span>
                        ) : (
                          <span className="text-[8px] font-bold px-1 py-0.2 bg-red-500/10 text-red-400 rounded uppercase">Failed Check</span>
                        )}
                      </div>
                      <p className="text-xs text-[#8D96A7] leading-relaxed bg-[#111216]/60 border border-border-color/40 rounded-xl p-3 mt-1">
                        {selectedLog.reflection || "No reflection logged."}
                      </p>
                    </div>
                  </div>

                  {/* 3. Error Recovery (if any) */}
                  {selectedLog.error_recovery_actions && (
                    <div className="flex gap-4 relative">
                      <span className="h-6 w-6 rounded-full border-2 border-amber-500 bg-[#111216] flex-shrink-0 flex items-center justify-center relative z-10 text-[10px] font-bold text-amber-500">3</span>
                      <div className="flex flex-col text-left gap-1">
                        <span className="text-xs font-extrabold text-white">Error Mitigation & Recovery</span>
                        <p className="text-xs text-[#8D96A7] leading-relaxed bg-[#111216]/60 border border-border-color/40 rounded-xl p-3 mt-1">
                          {selectedLog.error_recovery_actions}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Inspector Panels (Summary / Documents / Tool calls) */}
              <div className="bg-[#16181D] border border-border-color rounded-2xl overflow-hidden flex flex-col">
                <div className="flex border-b border-border-color/60 bg-[#111216]/40 text-xs font-bold text-[#8D96A7]">
                  <button 
                    onClick={() => setActivePanelTab("summary")}
                    className={`px-4.5 py-3 border-b-2 transition-all cursor-pointer ${activePanelTab === "summary" ? "border-primary text-primary bg-[#111216]/30" : "border-transparent hover:text-white"}`}
                  >
                    Timeline Log
                  </button>
                  <button 
                    onClick={() => setActivePanelTab("docs")}
                    className={`px-4.5 py-3 border-b-2 transition-all cursor-pointer ${activePanelTab === "docs" ? "border-primary text-primary bg-[#111216]/30" : "border-transparent hover:text-white"}`}
                  >
                    Retrieved Documents ({selectedLog.documents?.length || 0})
                  </button>
                  <button 
                    onClick={() => setActivePanelTab("tools")}
                    className={`px-4.5 py-3 border-b-2 transition-all cursor-pointer ${activePanelTab === "tools" ? "border-primary text-primary bg-[#111216]/30" : "border-transparent hover:text-white"}`}
                  >
                    Tool Executions
                  </button>
                  <button 
                    onClick={() => setActivePanelTab("performance")}
                    className={`px-4.5 py-3 border-b-2 transition-all cursor-pointer ${activePanelTab === "performance" ? "border-primary text-primary bg-[#111216]/30" : "border-transparent hover:text-white"}`}
                  >
                    Performance Metrics
                  </button>
                </div>

                <div className="p-5 text-left">
                  {/* Timeline Log Tab */}
                  {activePanelTab === "summary" && (
                    <div className="flex flex-col gap-3.5">
                      {selectedLog.timeline?.map((evt: any, idx: number) => (
                        <div key={idx} className="flex gap-4 items-start text-xs">
                          <code className="text-[10px] text-[#5b6375] font-mono whitespace-nowrap mt-0.5">{evt.time}</code>
                          <span className="font-extrabold text-white min-w-[120px] flex items-center gap-1.5">
                            <ChevronRight className="h-3 w-3 text-primary" /> {evt.event}
                          </span>
                          <span className="text-[#8D96A7]">{evt.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Documents Tab */}
                  {activePanelTab === "docs" && (
                    <div className="flex flex-col gap-3">
                      {selectedLog.documents && selectedLog.documents.length > 0 ? (
                        selectedLog.documents.map((doc: any, idx: number) => (
                          <div key={idx} className="border border-border-color/40 bg-[#111216]/50 rounded-xl p-3.5 flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-blue-400" /> {doc.title}
                              </span>
                              <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">Match: {(doc.similarity * 100).toFixed(0)}%</span>
                            </div>
                            <p className="text-[11px] text-[#8D96A7] leading-relaxed bg-[#111216]/20 p-2 rounded border border-border-color/20 font-mono">{doc.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[#8D96A7]">No documents retrieved for this run.</p>
                      )}
                    </div>
                  )}

                  {/* Tools Tab */}
                  {activePanelTab === "tools" && (
                    <div className="flex flex-col gap-3">
                      {selectedLog.tool_calls ? (
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-2 border-b border-border-color/20 pb-2">
                            <Wrench className="h-4 w-4 text-cyan-400" />
                            <span className="text-xs font-black text-white uppercase">{selectedLog.tool_calls.tool_code}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Input Arguments</span>
                              <pre className="bg-[#111216] border border-border-color/40 rounded-xl p-3 text-[10px] text-cyan-300 overflow-x-auto font-mono max-h-48">{JSON.stringify(selectedLog.tool_calls.input, null, 2)}</pre>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Execution Output</span>
                              <pre className="bg-[#111216] border border-border-color/40 rounded-xl p-3 text-[10px] text-emerald-300 overflow-x-auto font-mono max-h-48">{JSON.stringify(selectedLog.tool_calls.output, null, 2)}</pre>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-[#8D96A7]">No tool executions captured during this request loop.</p>
                      )}
                    </div>
                  )}

                  {/* Performance Metrics Tab */}
                  {activePanelTab === "performance" && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-[#111216]/50 border border-border-color/40 p-4.5 rounded-xl flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider flex items-center gap-1"><Clock className="h-3 w-3 text-teal-400" /> Latency</span>
                        <span className="text-base font-black text-white mt-1">{selectedLog.metrics?.latency_ms || "0"} ms</span>
                      </div>
                      <div className="bg-[#111216]/50 border border-border-color/40 p-4.5 rounded-xl flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider flex items-center gap-1"><Cpu className="h-3 w-3 text-purple-400" /> Prompt Vol</span>
                        <span className="text-base font-black text-white mt-1">{selectedLog.metrics?.prompt_tokens || "0"} tokens</span>
                      </div>
                      <div className="bg-[#111216]/50 border border-border-color/40 p-4.5 rounded-xl flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider flex items-center gap-1"><Code className="h-3 w-3 text-blue-400" /> Completion</span>
                        <span className="text-base font-black text-white mt-1">{selectedLog.metrics?.completion_tokens || "0"} tokens</span>
                      </div>
                      <div className="bg-[#111216]/50 border border-border-color/40 p-4.5 rounded-xl flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider flex items-center gap-1"><Clock className="h-3 w-3 text-yellow-400" /> Cost Burn</span>
                        <span className="text-base font-black text-white mt-1">${selectedLog.metrics?.cost ? selectedLog.metrics.cost.toFixed(4) : "0.0000"}</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-[#16181D] border border-border-color rounded-2xl py-32 text-center">
              <Eye className="h-10 w-10 text-[#5b6375]" />
              <span className="text-xs text-[#8D96A7]">Select an execution run from the left panel to inspect reasoning timeline logic.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
