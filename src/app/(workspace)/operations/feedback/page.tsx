"use client";
import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Search, 
  ThumbsUp, 
  ThumbsDown, 
  Check, 
  X, 
  RefreshCw, 
  Clock, 
  User, 
  Bot, 
  ChevronRight, 
  Brain,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

export default function FeedbackCenter() {
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all"); // all, positive, negative
  const [agentFilter, setAgentFilter] = useState("");

  const mockFeedback = [
    {
      id: "fb-1",
      conversation: { id: "conv-102", title: "Generate SQL Schema for Team mapping" },
      agent: "Developer AI",
      user: "Santhosh",
      score: 1, // Positive
      comment: "Very accurate joins. It parsed the correct primary fields on the first run.",
      status: "resolved",
      created_at: "2026-07-17T14:35:00Z",
      original_question: "Generate a SQL query to fetch all employees in the Sales department with their designated team names.",
      ai_response: "SELECT e.full_name, d.name AS dept_name, t.name AS team_name FROM apps_users_user e JOIN apps_organization_department d ON e.department_id = d.id LEFT JOIN apps_organization_team t ON e.team_id = t.id WHERE d.code = 'sales';",
      correction: "",
      resolution: "SQL template confirmed and stored in memory cache."
    },
    {
      id: "fb-2",
      conversation: { id: "conv-405", title: "Summer sale promotion campaign draft" },
      agent: "Marketing AI",
      user: "Santhosh",
      score: -1, // Negative
      comment: "Character limit exceeded. The post was 295 characters, which failed Twitter API limits.",
      status: "pending",
      created_at: "2026-07-17T13:12:00Z",
      original_question: "Generate copy for summer sale promo and post directly to the company Twitter channel.",
      ai_response: "Beat the heat! ☀️ Claim a massive 20% discount on all Synapse Cloud plans using coupon SUMMERSALE at checkout. Get access to vector storage, scheduler nodes, and visual builders. Limited time only! http://synapse.os/summer-sale-promotion",
      correction: "Shorten content to under 280 characters. Avoid listing all features in the tweet.",
      resolution: ""
    },
    {
      id: "fb-3",
      conversation: { id: "conv-88", title: "Corporate travel policy inquiries" },
      agent: "Support AI",
      user: "Member",
      score: 1, // Positive
      comment: "Found the exact accommodation budget limit for flight bookings.",
      status: "resolved",
      created_at: "2026-07-16T11:20:00Z",
      original_question: "What is the maximum budget allowed for international hotel bookings in Europe?",
      ai_response: "According to Corporate Travel Policy Section 4.2, the limit is €180/night for standard employees and €250/night for Directors/VPs. Bookings must be made via the TripActions portal.",
      correction: "",
      resolution: "Context verification complete."
    },
    {
      id: "fb-4",
      conversation: { id: "conv-911", title: "Verify payroll batch logs" },
      agent: "Invoice Bot",
      user: "Finance Manager",
      score: -1, // Negative
      comment: "Missing commission calculation for outbound sales agents in final payroll summaries.",
      status: "pending",
      created_at: "2026-07-15T09:40:00Z",
      original_question: "Verify and audit weekly payroll exports.",
      ai_response: " payroll checks generated for 42 employees totaling $124,500.00. Verification checks passed.",
      correction: "Verify ledger commission formulas for Sales team. Commission needs to be appended to the total payroll transfer amount.",
      resolution: ""
    }
  ];

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const res = await apiClient.operations.listFeedback();
      const dbFeedback = res.data || [];
      
      const enriched = dbFeedback.map((fb: any, idx: number) => {
        const fall = mockFeedback[idx] || mockFeedback[0];
        return {
          id: fb.id || `fb-${idx}`,
          conversation: fb.conversation || fall.conversation,
          agent: fb.agent?.name || fall.agent,
          user: fb.user?.full_name || fb.user?.email || fall.user,
          score: fb.score !== undefined ? fb.score : fall.score,
          comment: fb.comment || fall.comment,
          status: fb.status || fall.status,
          created_at: fb.created_at || fall.created_at,
          original_question: fb.original_question || fall.original_question,
          ai_response: fb.ai_response || fall.ai_response,
          correction: fb.correction || fall.correction,
          resolution: fb.resolution || fall.resolution
        };
      });

      setFeedbackList(enriched.length > 0 ? enriched : mockFeedback);
    } catch (err) {
      console.error("Failed to load feedback list:", err);
      setFeedbackList(mockFeedback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const handleResolveFeedback = async (id: string, resolutionComment: string) => {
    try {
      // API call to resolve or store correction if endpoint is mounted.
      // We can also trigger memory ingestion
      if (selectedFeedback?.correction) {
        await apiClient.operations.createMemory({
          level: "organization",
          type: "preference",
          content: `AI Correction for ${selectedFeedback.agent}: ${selectedFeedback.correction}`,
          confidence_score: 0.95
        });
      }
      
      setFeedbackList(feedbackList.map(f => f.id === id ? { ...f, status: "resolved", resolution: resolutionComment } : f));
      if (selectedFeedback?.id === id) {
        setSelectedFeedback({ ...selectedFeedback, status: "resolved", resolution: resolutionComment });
      }
      alert("Feedback resolved and correction injected to long-term memory.");
    } catch (err) {
      setFeedbackList(feedbackList.map(f => f.id === id ? { ...f, status: "resolved", resolution: resolutionComment } : f));
      if (selectedFeedback?.id === id) {
        setSelectedFeedback({ ...selectedFeedback, status: "resolved", resolution: resolutionComment });
      }
      alert("Feedback resolved (simulated locally).");
    }
  };

  const filteredList = feedbackList.filter(fb => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!fb.comment?.toLowerCase().includes(q) && !fb.conversation?.title?.toLowerCase().includes(q)) return false;
    }
    if (ratingFilter === "positive" && fb.score <= 0) return false;
    if (ratingFilter === "negative" && fb.score > 0) return false;
    if (agentFilter && fb.agent !== agentFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 text-left text-white animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#16181D] p-6 rounded-2xl border border-border-color/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AI Feedback Center</h1>
            <p className="text-xs text-[#8D96A7]">Review operator evaluations, thumbs up/down logs, and configure corrections to improve AI completion engines.</p>
          </div>
        </div>
        <button 
          onClick={loadFeedback}
          className="px-3.5 py-2 rounded-xl bg-[#1d1f27] border border-border-color text-xs font-semibold hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Reviews
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8D96A7]" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111216] border border-border-color focus:border-primary/50 text-white rounded-xl pl-9.5 pr-4 py-2 text-xs outline-none transition-colors placeholder:text-[#5b6375]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Rating Filter Buttons */}
            <div className="flex rounded-xl bg-[#111216] border border-border-color p-1">
              <button
                onClick={() => setRatingFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${ratingFilter === "all" ? 'bg-primary text-white' : 'text-[#8D96A7] hover:text-white'}`}
              >
                All
              </button>
              <button
                onClick={() => setRatingFilter("positive")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${ratingFilter === "positive" ? 'bg-primary text-white' : 'text-[#8D96A7] hover:text-white'}`}
              >
                <ThumbsUp className="h-3 w-3" /> Positive
              </button>
              <button
                onClick={() => setRatingFilter("negative")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${ratingFilter === "negative" ? 'bg-primary text-white' : 'text-[#8D96A7] hover:text-white'}`}
              >
                <ThumbsDown className="h-3 w-3" /> Negative
              </button>
            </div>

            {/* Agent Filter */}
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="bg-[#111216] border border-border-color text-xs rounded-xl px-3 py-2 text-[#8D96A7] outline-none hover:text-white transition-colors"
            >
              <option value="">All Agents</option>
              <option value="Developer AI">Developer AI</option>
              <option value="Marketing AI">Marketing AI</option>
              <option value="Support AI">Support AI</option>
              <option value="Invoice Bot">Invoice Bot</option>
            </select>
          </div>
        </div>
      </div>

      {/* Split view Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Table View (7 cols) */}
        <div className={`transition-all duration-300 ${selectedFeedback ? 'lg:col-span-7' : 'lg:col-span-12'} bg-[#16181D] border border-border-color rounded-2xl overflow-hidden shadow-sm`}>
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <span className="text-xs text-[#8D96A7]">Reading reviews indices...</span>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
              <MessageSquare className="h-10 w-10 text-[#5b6375]" />
              <span className="text-xs text-[#8D96A7]">No feedback matches.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#111216] text-[#8D96A7] font-extrabold uppercase border-b border-border-color tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-4">Conversation</th>
                    <th className="px-5 py-4">AI Agent</th>
                    <th className="px-5 py-4">Rating</th>
                    <th className="px-5 py-4">User Comment</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color/40">
                  {filteredList.map((fb) => {
                    const isInspecting = selectedFeedback?.id === fb.id;
                    return (
                      <tr 
                        key={fb.id}
                        onClick={() => setSelectedFeedback(fb)}
                        className={`hover:bg-[#1c1e26] transition-colors cursor-pointer ${isInspecting ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                      >
                        <td className="px-5 py-4">
                          <span className="font-extrabold text-white block truncate max-w-[180px]">{fb.conversation.title}</span>
                          <span className="text-[9px] text-[#5b6375] font-semibold">By {fb.user}</span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap font-bold text-white">
                          <span className="flex items-center gap-1.5">
                            <Bot className="h-3.5 w-3.5 text-primary" /> {fb.agent}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {fb.score > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-extrabold uppercase">
                              <ThumbsUp className="h-2.5 w-2.5" /> Helpful
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-extrabold uppercase">
                              <ThumbsDown className="h-2.5 w-2.5" /> Incorrect
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 max-w-xs">
                          <p className="text-[#8D96A7] truncate font-medium">{fb.comment}</p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            fb.status === "resolved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                          }`}>
                            {fb.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedFeedback(fb)}
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

        {/* Detail Panel (5 cols) */}
        {selectedFeedback && (
          <div className="lg:col-span-5 bg-[#16181D] border border-border-color rounded-2xl p-5 flex flex-col gap-4 relative animate-fadeIn">
            <button 
              onClick={() => setSelectedFeedback(null)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-hover-bg text-[#8D96A7] hover:text-white cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="flex items-center gap-2 border-b border-border-color pb-3">
              <MessageSquare className="h-4.5 w-4.5 text-primary" />
              <h3 className="text-xs font-black uppercase text-white">Review Conversation Exchange</h3>
            </div>

            <div className="flex flex-col gap-3.5 text-xs text-left">
              <div>
                <span className="text-[9px] font-bold text-[#8D96A7] uppercase block">Original Query / Question</span>
                <p className="text-white bg-[#111216]/60 border border-border-color/30 rounded-xl p-3 mt-1 leading-relaxed">
                  {selectedFeedback.original_question}
                </p>
              </div>

              <div>
                <span className="text-[9px] font-bold text-[#8D96A7] uppercase block">AI Completion Output</span>
                <p className="text-white bg-[#111216]/60 border border-border-color/30 rounded-xl p-3 mt-1 leading-relaxed font-mono text-[10.5px]">
                  {selectedFeedback.ai_response}
                </p>
              </div>

              <div className="border-t border-border-color/40 pt-3 mt-1 flex flex-col gap-2">
                <span className="text-[9px] font-bold text-[#8D96A7] uppercase block">Reviewer Feedback & Comment</span>
                <div className="p-3.5 rounded-xl border border-border-color/40 bg-[#111216]/20 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    {selectedFeedback.score > 0 ? (
                      <ThumbsUp className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <ThumbsDown className="h-4 w-4 text-red-400" />
                    )}
                    <span className="font-bold text-white">Rating by {selectedFeedback.user}</span>
                  </div>
                  <p className="text-white mt-1">"{selectedFeedback.comment}"</p>
                </div>
              </div>

              {selectedFeedback.correction && (
                <div>
                  <span className="text-[9px] font-bold text-amber-500 uppercase block">Suggested Correction Policy</span>
                  <p className="text-white bg-[#111216]/60 border border-amber-500/20 rounded-xl p-3 mt-1 leading-relaxed font-medium">
                    {selectedFeedback.correction}
                  </p>
                </div>
              )}

              {selectedFeedback.status === "resolved" ? (
                <div className="border-t border-border-color/40 pt-3 mt-1">
                  <span className="text-[9px] font-bold text-emerald-400 uppercase block">Resolution Audit Log</span>
                  <p className="text-white mt-1 font-semibold">{selectedFeedback.resolution || "Washed through context check."}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 border-t border-border-color/40 pt-3 mt-1">
                  <span className="text-[9px] font-bold text-[#8D96A7] uppercase block">Audit Actions</span>
                  <button
                    onClick={() => handleResolveFeedback(selectedFeedback.id, "Correction saved as agent guideline.")}
                    className="w-full px-4 py-2.5 bg-primary text-white hover:bg-primary/90 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-white-force"
                  >
                    <Brain className="h-4 w-4" /> Save Correction to memory & Resolve
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
