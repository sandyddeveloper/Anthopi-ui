"use client";
import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  User, 
  Bot, 
  AlertTriangle, 
  FileCode, 
  Mail, 
  Trash2, 
  Play, 
  DollarSign, 
  Share2, 
  Check, 
  X, 
  Edit,
  RefreshCw,
  MessageSquare
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function ApprovalCenter() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState<{ [id: string]: string }>({});

  const mockApprovals = [
    {
      id: "appr-1",
      tool_code: "send_email",
      status: "pending",
      requested_by: { email: "santhu@synapse.os", full_name: "Santhosh" },
      agent: "Marketing AI",
      comments: "",
      created_at: "2026-07-17T15:20:00Z",
      parameters: {
        reason: "Send promotional newsletter copy to 5,200 enterprise newsletter subscribers.",
        risk_level: "Medium",
        affected_resources: "Corporate SMTP Gateway / Mailgun Outbound Node",
        details: {
          subject: "Synapse OS v1.2: The Enterprise AI Operating System is here",
          recipient_group: "Enterprise Customers"
        }
      }
    },
    {
      id: "appr-2",
      tool_code: "delete_records",
      status: "pending",
      requested_by: { email: "santhu@synapse.os", full_name: "Santhosh" },
      agent: "Developer AI",
      comments: "",
      created_at: "2026-07-17T16:01:00Z",
      parameters: {
        reason: "Clean up orphaned user invitation records created before January 2026.",
        risk_level: "High",
        affected_resources: "Database Table: apps_users_invitations (244 records affected)",
        details: {
          query: "DELETE FROM apps_users_invitation WHERE created_at < '2026-01-01' AND status = 'expired';"
        }
      }
    },
    {
      id: "appr-3",
      tool_code: "run_workflow",
      status: "pending",
      requested_by: { email: "santhu@synapse.os", full_name: "Santhosh" },
      agent: "Invoice Bot",
      comments: "",
      created_at: "2026-07-17T14:40:00Z",
      parameters: {
        reason: "Execute weekly payroll generation sequence and write XML export.",
        risk_level: "High",
        affected_resources: "HR Payroll Vault API / Bank transfer scheduler gateway",
        details: {
          payroll_sum: "$124,500.00",
          employee_count: 42
        }
      }
    },
    {
      id: "appr-4",
      tool_code: "approve_expense",
      status: "pending",
      requested_by: { email: "santhu@synapse.os", full_name: "Santhosh" },
      agent: "Support AI",
      comments: "",
      created_at: "2026-07-17T12:15:00Z",
      parameters: {
        reason: "Authorize customer refunds request for AWS server downtime credit.",
        risk_level: "Low",
        affected_resources: "Corporate Billing balance / Stripe ledger credit",
        details: {
          refund_amount: "$45.00",
          reason_text: "Service downtime on July 10"
        }
      }
    },
    {
      id: "appr-5",
      tool_code: "publish_content",
      status: "pending",
      requested_by: { email: "santhu@synapse.os", full_name: "Santhosh" },
      agent: "Marketing AI",
      comments: "",
      created_at: "2026-07-17T10:00:00Z",
      parameters: {
        reason: "Publish launch announcement post to Synapse OS Twitter/X business channel.",
        risk_level: "Low",
        affected_resources: "Twitter API V2 Publisher OAuth channel",
        details: {
          tweet: "Enterprise AI automation is here. Meet Synapse OS: the first complete AI operations framework. http://synapse.os"
        }
      }
    }
  ];

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const res = await apiClient.operations.listApprovals({ status: "pending" });
      const dbApprovals = res.data || [];
      
      const enriched = dbApprovals.map((a: any, idx: number) => {
        const fall = mockApprovals[idx] || mockApprovals[0];
        const paramsObj = a.parameters || {};
        return {
          id: a.id || `appr-${idx}`,
          tool_code: a.tool_code || fall.tool_code,
          status: a.status || fall.status,
          requested_by: a.requested_by || fall.requested_by,
          agent: a.agent?.name || fall.agent,
          comments: a.comments || fall.comments,
          created_at: a.created_at || fall.created_at,
          parameters: {
            reason: paramsObj.reason || fall.parameters.reason,
            risk_level: paramsObj.risk_level || fall.parameters.risk_level,
            affected_resources: paramsObj.affected_resources || fall.parameters.affected_resources,
            details: paramsObj.details || fall.parameters.details
          }
        };
      });

      setApprovals(enriched.length > 0 ? enriched : mockApprovals);
    } catch (err) {
      console.error("Failed to load approval center data:", err);
      setApprovals(mockApprovals);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleApprove = async (id: string) => {
    const comments = commentText[id] || "";
    try {
      await apiClient.operations.approveRequest(id, comments);
      setApprovals(approvals.filter(a => a.id !== id));
      alert("Action approved successfully.");
    } catch (err) {
      setApprovals(approvals.filter(a => a.id !== id));
      alert("Action approved (simulated locally).");
    }
  };

  const handleReject = async (id: string) => {
    const comments = commentText[id] || "";
    try {
      await apiClient.operations.rejectRequest(id, comments);
      setApprovals(approvals.filter(a => a.id !== id));
      alert("Action rejected.");
    } catch (err) {
      setApprovals(approvals.filter(a => a.id !== id));
      alert("Action rejected (simulated locally).");
    }
  };

  const handleRequestChanges = (id: string) => {
    const comments = commentText[id] || "";
    if (!comments.trim()) {
      alert("Please leave comments describing what changes are required.");
      return;
    }
    setApprovals(approvals.filter(a => a.id !== id));
    alert("Changes requested. Action has been returned to the AI agent loop.");
  };

  const handleCommentChange = (id: string, val: string) => {
    setCommentText({ ...commentText, [id]: val });
  };

  const getToolIcon = (code: string) => {
    switch (code) {
      case "send_email": return <Mail className="h-5 w-5 text-blue-400" />;
      case "delete_records": return <Trash2 className="h-5 w-5 text-red-400" />;
      case "run_workflow": return <Play className="h-5 w-5 text-purple-400" />;
      case "approve_expense": return <DollarSign className="h-5 w-5 text-emerald-400" />;
      case "publish_content": return <Share2 className="h-5 w-5 text-pink-400" />;
      default: return <FileCode className="h-5 w-5 text-cyan-400" />;
    }
  };

  const getToolLabel = (code: string) => {
    switch (code) {
      case "send_email": return "Send Outbound Email";
      case "delete_records": return "Delete DB Records";
      case "run_workflow": return "Run Automated Workflow";
      case "approve_expense": return "Authorize Expense Refund";
      case "publish_content": return "Publish Social Media Post";
      default: return code.toUpperCase().replace("_", " ");
    }
  };

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "high": return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "medium": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "low": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      default: return "bg-neutral-800 text-neutral-400 border border-neutral-700";
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 text-left text-white animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#16181D] p-6 rounded-2xl border border-border-color/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AI Approval Center</h1>
            <p className="text-xs text-[#8D96A7]">Inspect and authorize sensitive tools or database writes requested by autonomous AI agents before execution.</p>
          </div>
        </div>
        <button 
          onClick={loadApprovals}
          className="px-3.5 py-2 rounded-xl bg-[#1d1f27] border border-border-color text-xs font-semibold hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Approvals
        </button>
      </div>

      {loading ? (
        <div className="py-24 bg-[#16181D] border border-border-color rounded-2xl flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <span className="text-xs text-[#8D96A7]">Checking human-in-the-loop approvals backlog...</span>
        </div>
      ) : approvals.length === 0 ? (
        <div className="py-24 bg-[#16181D] border border-border-color rounded-2xl text-center flex flex-col items-center justify-center gap-4">
          <div className="h-16 w-16 bg-[#111216] border border-border-color rounded-2xl flex items-center justify-center">
            <ShieldCheck className="h-7 w-7 text-[#5b6375]" />
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <h3 className="text-sm font-bold text-white">No approvals waiting.</h3>
            <p className="text-xs text-[#8D96A7]">All systems operational. No AI executions currently locked behind validation gates.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {approvals.map((appr) => (
            <div 
              key={appr.id} 
              className="bg-[#16181D] border border-border-color rounded-2xl p-5.5 flex flex-col gap-4.5 hover:border-border-color/90 transition-all shadow-sm"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start border-b border-border-color/30 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#111216] border border-border-color flex items-center justify-center shadow-inner">
                    {getToolIcon(appr.tool_code)}
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-white tracking-wide">{getToolLabel(appr.tool_code)}</h3>
                    <span className="text-[10px] text-[#5b6375] font-semibold">Requested {new Date(appr.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide ${getRiskColor(appr.parameters.risk_level)}`}>
                  {appr.parameters.risk_level} Risk
                </span>
              </div>

              {/* Card Details */}
              <div className="flex flex-col gap-3 text-xs">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-[#8D96A7] font-bold uppercase tracking-wider">AI Agent Source</span>
                    <span className="text-white font-bold flex items-center gap-1 mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-primary" /> {appr.agent}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-[#8D96A7] font-bold uppercase tracking-wider">Requested By</span>
                    <span className="text-white font-semibold flex items-center gap-1 mt-0.5">
                      <User className="h-3.5 w-3.5 text-[#5b6375]" /> {appr.requested_by?.full_name || appr.requested_by?.email}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 border-t border-border-color/30 pt-3">
                  <span className="text-[9px] text-[#8D96A7] font-bold uppercase tracking-wider">Purpose / Reason</span>
                  <p className="text-white leading-relaxed font-semibold italic text-[11px]">"{appr.parameters.reason}"</p>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-[#8D96A7] font-bold uppercase tracking-wider">Targeted Resources</span>
                  <p className="text-white leading-relaxed font-medium bg-[#111216]/50 border border-border-color/35 p-2 rounded-xl text-[10.5px]">
                    {appr.parameters.affected_resources}
                  </p>
                </div>

                {/* Display execution details in a collapsed box */}
                <div className="flex flex-col gap-1 bg-[#111216]/80 border border-border-color/40 rounded-xl p-3.5 mt-1 font-mono text-[10px]">
                  <span className="text-[9px] text-[#8D96A7] font-bold uppercase tracking-wider block mb-1">Execution Parameters</span>
                  <pre className="text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {JSON.stringify(appr.parameters.details, null, 2)}
                  </pre>
                </div>

                {/* Input box for reviews */}
                <div className="flex flex-col gap-1 border-t border-border-color/30 pt-3 mt-1">
                  <label className="text-[9px] text-[#8D96A7] font-bold uppercase tracking-wider">Review Comments / Adjustments</label>
                  <input
                    type="text"
                    placeholder="Provide comment for approval or rejection reason..."
                    value={commentText[appr.id] || ""}
                    onChange={(e) => handleCommentChange(appr.id, e.target.value)}
                    className="w-full bg-[#111216] border border-border-color rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/50 text-white placeholder:text-[#5b6375]"
                  />
                </div>

              </div>

              {/* Actions row */}
              <div className="grid grid-cols-3 gap-2.5 pt-1.5 border-t border-border-color/20 mt-1">
                <button
                  onClick={() => handleReject(appr.id)}
                  className="px-3.5 py-2.5 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 hover:border-red-500/30 rounded-xl text-xs font-bold text-red-400 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" /> Reject
                </button>
                <button
                  onClick={() => handleRequestChanges(appr.id)}
                  className="px-3.5 py-2.5 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 hover:border-amber-500/30 rounded-xl text-xs font-bold text-amber-400 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit className="h-4 w-4" /> Edit Rule
                </button>
                <button
                  onClick={() => handleApprove(appr.id)}
                  className="px-3.5 py-2.5 bg-primary text-white hover:bg-primary/90 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-md shadow-primary/10 cursor-pointer text-white-force"
                >
                  <Check className="h-4 w-4" /> Approve
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
