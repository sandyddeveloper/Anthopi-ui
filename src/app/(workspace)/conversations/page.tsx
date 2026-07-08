"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  MessageSquare, 
  Search, 
  Trash2, 
  Edit3, 
  ArrowUpRight, 
  Filter,
  Calendar,
  User,
  Bot,
  ChevronRight,
  MoreVertical,
  Check,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

interface ConversationHistory {
  id: string;
  title: string;
  agentName: string;
  agentAvatar: string;
  messagesCount: number;
  userName: string;
  createdDate: string;
  updatedDate: string;
}

export default function ConversationsPage() {
  const router = useRouter();

  const [history, setHistory] = useState<ConversationHistory[]>([]);
  const [agentsList, setAgentsList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Toolbar & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("All");
  const [selectedUser, setSelectedUser] = useState("All");
  const [selectedDate, setSelectedDate] = useState("All");

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Options dropdown state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const fetchConversationsData = async () => {
    try {
      const res = await apiClient.aiChat.listConversations();
      const mapped = (res.data || []).map((c: any) => ({
        id: c.id,
        title: c.title || "Unscoped Chat",
        agentName: c.agent_details?.name || "AI Agent",
        agentAvatar: c.agent_details?.avatar || "🤖",
        messagesCount: c.last_message ? 5 : 1, // simulated message count since API contains last message
        userName: c.participants?.[0]?.user_details?.full_name || "Santhosh",
        createdDate: new Date(c.created_at).toISOString().split("T")[0],
        updatedDate: new Date(c.updated_at).toLocaleDateString()
      }));
      setHistory(mapped);

      // Extract unique agent names for filters
      const names: string[] = [];
      mapped.forEach((item: any) => {
        if (!names.includes(item.agentName)) names.push(item.agentName);
      });
      setAgentsList(names);
    } catch (e) {
      console.error("Failed to load conversations logging history:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversationsData();
  }, []);

  // Filters mapping
  const filteredHistory = history.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAgent = selectedAgent === "All" || item.agentName === selectedAgent;
    const matchesUser = selectedUser === "All" || item.userName === selectedUser;
    return matchesSearch && matchesAgent && matchesUser;
  });

  const handleDelete = async (id: string) => {
    try {
      await apiClient.aiChat.deleteConversation(id);
      setHistory(history.filter(item => item.id !== id));
      setActiveMenuId(null);
    } catch (e) {
      console.error("Failed to delete conversation:", e);
    }
  };

  const startRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditingText(currentTitle);
    setActiveMenuId(null);
  };

  const saveRename = async (id: string) => {
    if (editingText.trim()) {
      try {
        await apiClient.aiChat.updateConversation(id, { title: editingText });
        setHistory(history.map(item => item.id === id ? { ...item, title: editingText } : item));
      } catch (e) {
        console.error("Failed to rename conversation:", e);
      }
    }
    setEditingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn text-left">
      
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" /> Conversation Logs
        </h1>
        <p className="text-xs text-[#8D96A7] mt-1">
          Review, open, rename, or prune past conversation history archives across all AI Employees.
        </p>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-col lg:flex-row gap-4 bg-card-bg border border-border-color p-4 rounded-2xl shadow-card">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8D96A7]" />
          <input
            type="text"
            placeholder="Search conversations by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#16181D] border border-border-color focus:border-primary/50 text-xs text-white pl-10 pr-4 py-2.5 rounded-xl outline-none"
          />
        </div>

        {/* Filters Grid */}
        <div className="flex flex-wrap gap-3">
          {/* Agent Filter */}
          <div className="flex items-center gap-2 bg-[#16181D] border border-border-color px-3.5 py-2.5 rounded-xl text-xs text-[#B7BDC8]">
            <Bot className="h-3.5 w-3.5 text-[#8D96A7]" />
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="bg-transparent border-none text-white outline-none focus:ring-0 cursor-pointer"
            >
              <option value="All">All Agents</option>
              {agentsList.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* User Owner Filter */}
          <div className="flex items-center gap-2 bg-[#16181D] border border-border-color px-3.5 py-2.5 rounded-xl text-xs text-[#B7BDC8]">
            <User className="h-3.5 w-3.5 text-[#8D96A7]" />
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="bg-transparent border-none text-white outline-none focus:ring-0 cursor-pointer"
            >
              <option value="All">All Users</option>
              <option value="Santhosh">Santhosh</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-xs text-[#8D96A7] gap-2 bg-[#16181D]/15 border border-border-color rounded-2xl">
          <span className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Syncing conversations logs...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredHistory.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-[#16181D]/30 border border-dashed border-border-color rounded-2xl gap-4">
          <MessageSquare className="h-10 w-10 text-[#8D96A7]" />
          <div>
            <h3 className="text-sm font-bold text-white">No Conversations Found</h3>
            <p className="text-xs text-[#8D96A7] mt-1">Change filters or prompt an agent to initialize logs.</p>
          </div>
        </div>
      )}

      {/* History Table */}
      {!loading && filteredHistory.length > 0 && (
        <div className="bg-card-bg border border-border-color rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#14161d] border-b border-border-color text-[#8D96A7] font-bold">
                  <th className="p-4 pl-6">Conversation</th>
                  <th className="p-4">Agent Config</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Messages</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4">Last Active</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c1e24] text-white">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-hover-bg/25 group transition-colors">
                    {/* Title */}
                    <td className="p-4 pl-6 font-semibold">
                      {editingId === item.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && saveRename(item.id)}
                            className="bg-[#16181D] border border-border-color focus:border-primary/50 text-xs text-white px-2 py-1 rounded outline-none"
                          />
                          <button onClick={() => saveRename(item.id)} className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1 rounded bg-[#EF4444]/10 border border-[#EF4444]/20 text-red-400">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-white hover:text-primary transition-colors cursor-pointer" onClick={() => router.push("/chat")}>
                          {item.title}
                        </span>
                      )}
                    </td>

                    {/* Agent */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 bg-primary/10 border border-primary/20 rounded flex items-center justify-center text-xs">
                          {item.agentAvatar}
                        </span>
                        <span className="font-semibold">{item.agentName}</span>
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="p-4 text-[#B7BDC8]">{item.userName}</td>

                    {/* Messages Count */}
                    <td className="p-4 font-mono font-bold text-[#8D96A7]">{item.messagesCount} items</td>

                    {/* Created Date */}
                    <td className="p-4 text-[#8D96A7] font-mono">{item.createdDate}</td>

                    {/* Updated Date */}
                    <td className="p-4 text-[#8D96A7] font-mono">{item.updatedDate}</td>

                    {/* Action Context Menu */}
                    <td className="p-4 pr-6 text-right relative">
                      <div className="inline-flex items-center gap-1">
                        <button 
                          onClick={() => router.push("/chat")}
                          className="p-1 rounded hover:bg-hover-bg text-[#8D96A7] hover:text-white"
                          title="Open Console"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </button>

                        <div className="relative">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                            className="p-1 rounded hover:bg-hover-bg text-[#8D96A7] hover:text-white cursor-pointer"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          
                          {activeMenuId === item.id && (
                            <div className="absolute right-0 top-7 w-32 bg-[#16181D] border border-border-color rounded-xl py-1 shadow-xl z-20 text-left">
                              <button
                                onClick={() => router.push("/chat")}
                                className="w-full px-3 py-2 text-[11px] text-[#B7BDC8] hover:text-white hover:bg-hover-bg flex items-center gap-2"
                              >
                                <ArrowUpRight className="h-3.5 w-3.5" /> Open log
                              </button>
                              <button
                                onClick={() => startRename(item.id, item.title)}
                                className="w-full px-3 py-2 text-[11px] text-[#B7BDC8] hover:text-white hover:bg-hover-bg flex items-center gap-2"
                              >
                                <Edit3 className="h-3.5 w-3.5" /> Rename
                              </button>
                              <div className="h-px bg-border-color/60 my-1" />
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="w-full px-3 py-2 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
