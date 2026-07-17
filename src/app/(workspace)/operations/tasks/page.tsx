"use client";
import React, { useState, useEffect } from "react";
import { 
  CheckSquare, 
  Search, 
  Filter, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Bot, 
  ChevronRight, 
  X, 
  Link as LinkIcon, 
  Info,
  Calendar,
  AlertTriangle,
  Play,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

export default function AITaskCenter() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const mockTasks = [
    {
      id: "job-1",
      task_name: "Audit Q2 invoice records for tax anomalies",
      agent: { name: "Finance AI", id: "agent-fin" },
      assigned_to: "Finance Manager",
      priority: "high",
      status: "processing",
      total_items: 250,
      processed_items: 184,
      created_at: "2026-07-17T11:00:00Z",
      due_date: "2026-07-20",
      result: {
        description: "Verify PDF invoice totals against bank statements to identify missing VAT matches or round-off differences.",
        reason_created: "A variance of $412.50 was flagged in the general ledger automation run.",
        suggested_solution: "Execute SQL query on ledger tables, isolate invoice dates between May 1 and June 30, and cross-reference with stripe transfers.",
        related_conversation_id: "conv-ledg-102",
        linked_workflow_id: "flow-inv-audit"
      }
    },
    {
      id: "job-2",
      task_name: "Draft release notes for Synapse OS v1.2",
      agent: { name: "Developer AI", id: "agent-dev" },
      assigned_to: "Product Owner",
      priority: "medium",
      status: "completed",
      total_items: 12,
      processed_items: 12,
      created_at: "2026-07-17T09:15:00Z",
      due_date: "2026-07-18",
      result: {
        description: "Consolidate git commits and pull requests since June 15 to write clean feature descriptions for the public release notes.",
        reason_created: "Deployment of release tag v1.2.0 triggered automatically in repository.",
        suggested_solution: "Read commits, categorize changes into Features, Fixes, and Under-the-hood, then generate final markdown formatting.",
        related_conversation_id: "conv-git-822",
        linked_workflow_id: "flow-git-release"
      }
    },
    {
      id: "job-3",
      task_name: "Investigate API throttle rate failure",
      agent: { name: "Developer AI", id: "agent-dev" },
      assigned_to: "Infrastructure Engineer",
      priority: "critical",
      status: "failed",
      total_items: 5,
      processed_items: 2,
      created_at: "2026-07-17T15:10:00Z",
      due_date: "2026-07-17",
      result: {
        description: "Identify why Twitter posting tool encounters 429 Too Many Requests rate limits.",
        reason_created: "Social media marketing workflow exited abnormally during execution #5524.",
        suggested_solution: "Verify request frequency setting in scheduler settings. Re-configure buffer delay constants to 30 seconds instead of 10.",
        related_conversation_id: "conv-rate-411",
        linked_workflow_id: "flow-tweet-publish"
      }
    },
    {
      id: "job-4",
      task_name: "Optimize HR resume database vectors",
      agent: { name: "HR Recruiter AI", id: "agent-hr" },
      assigned_to: "Recruitment Coordinator",
      priority: "low",
      status: "pending",
      total_items: 1500,
      processed_items: 0,
      created_at: "2026-07-16T17:40:00Z",
      due_date: "2026-07-25",
      result: {
        description: "Re-generate Pinecone vector embedding layers for candidate records using the text-embedding-3-small model.",
        reason_created: "Model migration: switching embedding encoder to achieve higher semantic retrieval accuracy.",
        suggested_solution: "Extract documents in batches of 100, execute openai embedding endpoints, and upsert vectors.",
        related_conversation_id: "conv-hr-vector-0",
        linked_workflow_id: "flow-vector-index"
      }
    }
  ];

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await apiClient.operations.listTasks();
      const dbTasks = res.data || [];
      
      const enriched = dbTasks.map((t: any, idx: number) => {
        const fall = mockTasks[idx] || mockTasks[0];
        const resObj = t.result || {};
        return {
          id: t.id || `job-${idx}`,
          task_name: t.task_name || fall.task_name,
          agent: t.agent || fall.agent,
          assigned_to: t.assigned_to || fall.assigned_to,
          priority: t.priority || fall.priority || (idx % 2 === 0 ? "high" : "medium"),
          status: t.status || fall.status,
          total_items: t.total_items || fall.total_items,
          processed_items: t.processed_items !== undefined ? t.processed_items : fall.processed_items,
          created_at: t.created_at || fall.created_at,
          due_date: t.due_date || fall.due_date,
          result: {
            description: resObj.description || fall.result.description,
            reason_created: resObj.reason_created || fall.result.reason_created,
            suggested_solution: resObj.suggested_solution || fall.result.suggested_solution,
            related_conversation_id: resObj.related_conversation_id || fall.result.related_conversation_id,
            linked_workflow_id: resObj.linked_workflow_id || fall.result.linked_workflow_id
          }
        };
      });

      setTasks(enriched.length > 0 ? enriched : mockTasks);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      setTasks(mockTasks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await apiClient.operations.updateTask(id, { status: newStatus });
      setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
      if (selectedTask?.id === id) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } catch (err) {
      setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
      if (selectedTask?.id === id) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p?.toLowerCase()) {
      case "critical": return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "high": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "medium": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "low": return "bg-neutral-800 text-neutral-400 border border-neutral-700";
      default: return "bg-neutral-800 text-neutral-400 border border-neutral-700";
    }
  };

  const getStatusIcon = (s: string) => {
    switch (s?.toLowerCase()) {
      case "completed": return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-400" />;
      case "processing": return <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />;
      default: return <Clock className="h-4 w-4 text-[#8D96A7]" />;
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatches = t.task_name?.toLowerCase().includes(q);
      const descMatches = t.result?.description?.toLowerCase().includes(q);
      if (!nameMatches && !descMatches) return false;
    }
    if (selectedAgent && t.agent?.id !== selectedAgent && t.agent?.name !== selectedAgent && t.agent !== selectedAgent) return false;
    if (selectedPriority && t.priority !== selectedPriority) return false;
    if (selectedStatus && t.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 text-left text-white animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#16181D] p-6 rounded-2xl border border-border-color/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <CheckSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AI Task Center</h1>
            <p className="text-xs text-[#8D96A7]">Manage and monitor background processes and administrative tasks delegated dynamically by AI agents.</p>
          </div>
        </div>
        <button 
          onClick={loadTasks}
          className="px-3.5 py-2 rounded-xl bg-[#1d1f27] border border-border-color text-xs font-semibold hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync Tasks
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8D96A7]" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111216] border border-border-color focus:border-primary/50 text-white rounded-xl pl-9.5 pr-4 py-2 text-xs outline-none transition-colors placeholder:text-[#5b6375]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Status selector */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#111216] border border-border-color text-xs rounded-xl px-3 py-2 text-[#8D96A7] outline-none hover:text-white transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>

            {/* Priority Selector */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-[#111216] border border-border-color text-xs rounded-xl px-3 py-2 text-[#8D96A7] outline-none hover:text-white transition-colors"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Agent Selector */}
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="bg-[#111216] border border-border-color text-xs rounded-xl px-3 py-2 text-[#8D96A7] outline-none hover:text-white transition-colors"
            >
              <option value="">All Creator Agents</option>
              <option value="Finance AI">Finance AI</option>
              <option value="Developer AI">Developer AI</option>
              <option value="HR Recruiter AI">HR Recruiter AI</option>
            </select>
          </div>
        </div>
      </div>

      {/* Split Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Table List (8 columns or full if nothing selected) */}
        <div className={`transition-all duration-300 ${selectedTask ? 'lg:col-span-7' : 'lg:col-span-12'} bg-[#16181D] border border-border-color rounded-2xl overflow-hidden shadow-sm`}>
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <span className="text-xs text-[#8D96A7]">Reading active execution pipelines...</span>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
              <div className="h-16 w-16 bg-[#111216] border border-border-color rounded-2xl flex items-center justify-center">
                <CheckSquare className="h-7 w-7 text-[#5b6375]" />
              </div>
              <h3 className="text-sm font-bold text-white">No tasks matching filters.</h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#111216] text-[#8D96A7] font-extrabold uppercase border-b border-border-color tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-4">Task Description</th>
                    <th className="px-5 py-4">Created By</th>
                    <th className="px-5 py-4">Assigned To</th>
                    <th className="px-5 py-4">Priority</th>
                    <th className="px-5 py-4">Execution Progress</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color/40">
                  {filteredTasks.map((t) => {
                    const isInspecting = selectedTask?.id === t.id;
                    const progressRatio = t.total_items > 0 ? (t.processed_items / t.total_items) * 100 : 0;
                    return (
                      <tr 
                        key={t.id}
                        onClick={() => setSelectedTask(t)}
                        className={`hover:bg-[#1c1e26] transition-colors cursor-pointer ${isInspecting ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                      >
                        <td className="px-5 py-4">
                          <span className="font-extrabold text-white block truncate max-w-[200px]">{t.task_name}</span>
                          <span className="text-[9px] text-[#5b6375] font-semibold flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" /> Due {t.due_date}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap font-bold text-white">
                          <span className="flex items-center gap-1.5">
                            <Bot className="h-3.5 w-3.5 text-primary" /> {typeof t.agent === "object" ? t.agent?.name : t.agent}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap font-semibold text-[#8D96A7]">
                          <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-[#5b6375]" /> {t.assigned_to}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${getPriorityColor(t.priority)}`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1.5 w-32">
                            <div className="flex justify-between text-[9px] font-bold text-[#8D96A7]">
                              <span>{t.processed_items} / {t.total_items} items</span>
                              <span>{progressRatio.toFixed(0)}%</span>
                            </div>
                            <div className="h-1 bg-[#111216] rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all duration-300"
                                style={{ width: `${progressRatio}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="flex items-center gap-1.5 capitalize font-semibold text-white">
                            {getStatusIcon(t.status)} {t.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedTask(t)}
                            className="p-1 rounded hover:bg-hover-bg text-[#8D96A7] hover:text-white"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Task Detail Inspector Side panel (5 columns) */}
        {selectedTask && (
          <div className="lg:col-span-5 bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-4 relative animate-fadeIn">
            <button 
              onClick={() => setSelectedTask(null)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-hover-bg text-[#8D96A7] hover:text-white cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="flex items-center gap-2 border-b border-border-color pb-3">
              <Info className="h-4.5 w-4.5 text-primary" />
              <h3 className="text-xs font-black uppercase text-white">AI Task Details</h3>
            </div>

            <div className="flex flex-col gap-3.5 text-xs">
              
              <div>
                <span className="text-[9px] font-bold text-[#8D96A7] uppercase block">Task Name</span>
                <span className="text-white font-bold text-sm mt-0.5 block">{selectedTask.task_name}</span>
              </div>

              <div>
                <span className="text-[9px] font-bold text-[#8D96A7] uppercase block">Reason Created / Variance Trigger</span>
                <p className="text-[#8D96A7] bg-[#111216]/60 border border-border-color/30 rounded-xl p-3 mt-1 leading-relaxed italic">
                  "{selectedTask.result?.reason_created}"
                </p>
              </div>

              <div>
                <span className="text-[9px] font-bold text-[#8D96A7] uppercase block">Task Description</span>
                <p className="text-white bg-[#111216]/60 border border-border-color/30 rounded-xl p-3 mt-1 leading-relaxed">
                  {selectedTask.result?.description}
                </p>
              </div>

              <div>
                <span className="text-[9px] font-bold text-[#8D96A7] uppercase block">Suggested AI Resolution</span>
                <p className="text-white bg-[#111216]/60 border border-border-color/30 rounded-xl p-3 mt-1 leading-relaxed font-medium">
                  {selectedTask.result?.suggested_solution}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-border-color/40 pt-3 mt-1">
                <div>
                  <span className="text-[9px] font-bold text-[#8D96A7] uppercase block">Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    <select
                      value={selectedTask.status}
                      onChange={(e) => handleUpdateStatus(selectedTask.id, e.target.value)}
                      className="bg-[#111216] border border-border-color text-xs rounded-lg px-2.5 py-1 text-white outline-none focus:border-primary/50"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-[#8D96A7] uppercase block">Priority</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase mt-1 inline-block ${getPriorityColor(selectedTask.priority)}`}>
                    {selectedTask.priority}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-border-color/40 pt-3">
                <span className="text-[9px] font-bold text-[#8D96A7] uppercase block">Associated Assets</span>
                <div className="flex flex-col gap-2">
                  <Link 
                    href={`/chat?id=${selectedTask.result?.related_conversation_id}`} 
                    className="flex items-center gap-2 p-2 bg-[#111216] border border-border-color/60 hover:border-primary/30 rounded-xl text-[11px] text-[#8D96A7] hover:text-white transition-colors"
                  >
                    <LinkIcon className="h-3.5 w-3.5 text-primary" />
                    <span>Open Related Conversation thread</span>
                  </Link>
                  <Link 
                    href={`/automations?tab=executions&id=${selectedTask.result?.linked_workflow_id}`}
                    className="flex items-center gap-2 p-2 bg-[#111216] border border-border-color/60 hover:border-primary/30 rounded-xl text-[11px] text-[#8D96A7] hover:text-white transition-colors"
                  >
                    <LinkIcon className="h-3.5 w-3.5 text-purple-400" />
                    <span>Inspect Linked Workflow execution logs</span>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
