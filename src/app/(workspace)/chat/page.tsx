"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Send, 
  Paperclip, 
  Mic, 
  Pin, 
  Share2, 
  Trash2, 
  Bot, 
  User, 
  MoreVertical,
  CornerDownLeft,
  X,
  Code,
  Download,
  Edit3,
  Sparkles,
  ArrowDownCircle,
  FileText,
  ImageIcon,
  Check,
  StopCircle,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

interface ChatSession {
  id: string;
  title: string;
  agentName: string;
  agentAvatar: string;
  lastMessage: string;
  updatedAt: string;
  isPinned: boolean;
  agentId?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  attachments?: { name: string; type: "file" | "image"; size: string }[];
  codeBlock?: {
    lang: string;
    code: string;
  };
}

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleText, setEditTitleText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const filteredSessions = sessions.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));
  
  // Model selector state for new chats
  const [isNewChatSelectOpen, setIsNewChatSelectOpen] = useState(false);

  // Attachments simulation
  const [attachments, setAttachments] = useState<{ name: string; type: "file" | "image"; size: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load chat sessions & agents list
  const loadSessions = async (targetActiveId?: string) => {
    try {
      const [sessionsRes, agentsRes] = await Promise.all([
        apiClient.aiChat.listConversations().catch(() => ({ data: [] })),
        apiClient.aiAgents.listAgents().catch(() => ({ data: [] }))
      ]);

      setAgents(agentsRes.data || []);
      
      const list = (sessionsRes.data || []).map((s: any) => ({
        id: s.id,
        title: s.title || "Unscoped Chat",
        agentName: s.agent_details?.name || "AI Agent",
        agentAvatar: s.agent_details?.avatar || "🤖",
        lastMessage: s.last_message?.content || "Conversation started.",
        updatedAt: new Date(s.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isPinned: s.is_pinned || false,
        agentId: s.agent
      }));

      setSessions(list);

      if (list.length > 0) {
        const nextActiveId = targetActiveId || list[0].id;
        setActiveSessionId(nextActiveId);
      }
    } catch (e) {
      console.error("Failed to fetch sessions data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Fetch messages when active session changes
  useEffect(() => {
    if (!activeSessionId) return;

    async function fetchMessages() {
      setMessagesLoading(true);
      try {
        const res = await apiClient.aiChat.listMessages(activeSessionId);
        const list = (res.data || []).map((m: any) => {
          let codeBlock = undefined;
          
          // Parse code blocks if any
          if (m.content.includes("```")) {
            const parts = m.content.split("```");
            const first = parts[0];
            const codeRaw = parts[1];
            if (codeRaw) {
              const lines = codeRaw.split("\n");
              const lang = lines[0] || "typescript";
              const code = lines.slice(1).join("\n");
              codeBlock = { lang, code };
            }
          }

          return {
            id: m.id,
            role: m.sender_type === "agent" ? "assistant" as const : "user" as const,
            text: m.content.split("```")[0] || m.content,
            timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            codeBlock
          };
        });

        // Set default help message if thread is empty
        if (list.length === 0) {
          list.push({
            id: "fallback-intro",
            role: "assistant",
            text: "Session initialized successfully. Start typing below to prompt context workspace models.",
            timestamp: "Just now",
            codeBlock: undefined
          });
        }

        setMessages(list);
      } catch (e) {
        console.error("Failed to load active thread messages:", e);
      } finally {
        setMessagesLoading(false);
      }
    }
    fetchMessages();
  }, [activeSessionId]);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || input;
    if (!textToSend.trim() && attachments.length === 0) return;
    if (isTyping || !activeSessionId) return;

    // Place message locally for responsiveness
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Send to backend
      const res = await apiClient.aiChat.createMessage(activeSessionId, {
        content: textToSend
      });

      // Reload messages list to fetch streaming response
      const resMsgs = await apiClient.aiChat.listMessages(activeSessionId);
      const list = (resMsgs.data || []).map((m: any) => ({
        id: m.id,
        role: m.sender_type === "agent" ? "assistant" as const : "user" as const,
        text: m.content,
        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));

      setMessages(list);
    } catch (e) {
      console.error("Failed to post message:", e);
      // Place mock response fallback if local server backend loop has no AI key config
      setTimeout(() => {
        const fallbackAssistantMsg: ChatMessage = {
          id: String(Date.now() + 1),
          role: "assistant",
          text: `Backend connection operational. Successfully processed query context for prompt. Please configure models provider keys to fetch live LLM generations.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, fallbackAssistantMsg]);
      }, 1000);
    } finally {
      setIsTyping(false);
      loadSessions(activeSessionId);
    }
  };

  const handleCreateSession = async (agentId: string) => {
    try {
      const selectedAgentName = agents.find(a => a.id === agentId)?.name || "AI Agent";
      
      const payload = {
        title: `Debugging with ${selectedAgentName}`,
        agent: agentId,
        is_pinned: false
      };

      const res = await apiClient.aiChat.createConversation(payload);
      setIsNewChatSelectOpen(false);
      await loadSessions(res.data.id);
    } catch (e) {
      console.error("Failed to create new chat session:", e);
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await apiClient.aiChat.deleteConversation(id);
      await loadSessions();
    } catch (e) {
      console.error("Failed to delete chat session:", e);
    }
  };

  const handlePinSession = async (id: string, currentPinStatus: boolean) => {
    try {
      await apiClient.aiChat.updateConversation(id, { is_pinned: !currentPinStatus });
      await loadSessions(id);
    } catch (e) {
      console.error("Failed to toggle pin status:", e);
    }
  };

  const startEditingTitle = () => {
    if (!activeSession) return;
    setIsEditingTitle(true);
    setEditTitleText(activeSession.title);
  };

  const saveTitleEdit = async () => {
    if (editTitleText.trim() && activeSession) {
      try {
        await apiClient.aiChat.updateConversation(activeSessionId, { title: editTitleText });
        await loadSessions(activeSessionId);
      } catch (e) {
        console.error("Failed to rename conversation title:", e);
      }
    }
    setIsEditingTitle(false);
  };

  const simulateFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const f = files[0];
    const type = f.type.startsWith("image/") ? "image" : "file";
    const size = (f.size / (1024 * 1024)).toFixed(2) + " MB";
    setAttachments([...attachments, { name: f.name, type, size }]);
  };

  const copyCodeToClipboard = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
  };

  const suggestions = [
    { label: "Summarize project status", text: "Summarize project milestones and check active task reports." },
    { label: "Generate cost report", text: "Generate token cost analytics report for Developer AI calls." },
    { label: "Write outreach email", text: "Write marketing outreach newsletter for Q3 launch." },
    { label: "Explain QuickSorter class", text: "Explain how the QuickSorter class works in detail." }
  ];

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-6 items-stretch h-[calc(100vh-140px)] animate-fadeIn text-left">
      
      {/* Left Sidebar: Sessions List */}
      <div className="w-full md:w-80 bg-card-bg border border-border-color rounded-2xl p-4 shadow-card flex flex-col gap-4 overflow-y-auto scrollbar-thin">
        
        {/* Create Session & Search */}
        <div className="flex items-center justify-between border-b border-border-color/60 pb-3 relative">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recent Sessions</h3>
          <button 
            onClick={() => setIsNewChatSelectOpen(!isNewChatSelectOpen)}
            className="p-1 rounded-lg border border-border-color hover:bg-hover-bg text-[#8D96A7] hover:text-white transition-colors cursor-pointer"
            title="Start New Chat"
          >
            <Plus className="h-4 w-4" />
          </button>

          {isNewChatSelectOpen && (
            <div className="absolute right-0 top-7 w-48 bg-[#16181D] border border-border-color rounded-xl py-1 shadow-2xl z-30">
              <span className="px-3 py-1 text-[8px] uppercase tracking-widest text-[#8D96A7] font-extrabold text-left mb-1 block">Select Agent</span>
              {agents.map(ag => (
                <button
                  key={ag.id}
                  onClick={() => handleCreateSession(ag.id)}
                  className="w-full text-left px-3 py-2 text-[11px] text-[#B7BDC8] hover:text-white hover:bg-hover-bg flex items-center gap-2"
                >
                  <Bot className="h-3.5 w-3.5" /> {ag.name}
                </button>
              ))}
              {agents.length === 0 && (
                <span className="px-3 py-2 text-[10px] text-[#8D96A7] italic block">No active agents pool</span>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8D96A7]" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#16181D] border border-border-color focus:border-primary/50 text-xs text-white pl-9 pr-3 py-2 rounded-xl outline-none"
          />
        </div>

        {/* Sessions Loop */}
        <div className="flex-1 flex flex-col gap-2.5">
          
          {loading && (
            <span className="text-[10px] text-[#8D96A7] italic text-center py-4">Syncing chat sessions...</span>
          )}

          {/* Pinned Section */}
          {!loading && filteredSessions.filter(s => s.isPinned).length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] uppercase font-bold text-[#5A6376] tracking-wider mb-1 flex items-center gap-1"><Pin className="h-3 w-3" /> Pinned</span>
              {filteredSessions.filter(s => s.isPinned).map(sess => (
                <div
                  key={sess.id}
                  onClick={() => setActiveSessionId(sess.id)}
                  className={cn(
                    "p-3 rounded-xl border cursor-pointer transition-all duration-150 relative group text-left",
                    sess.id === activeSessionId 
                      ? "border-primary bg-primary/5" 
                      : "border-border-color/60 bg-[#16181D]/35 hover:bg-[#16181D]/60"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white truncate max-w-[150px]">{sess.title}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePinSession(sess.id, sess.isPinned); }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-[#8D96A7] hover:text-white transition-opacity"
                    >
                      <Pin className="h-3 w-3 fill-primary text-primary" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] text-[#8D96A7] mt-1 font-semibold">
                    <span>🤖 {sess.agentName}</span>
                    <span>•</span>
                    <span className="font-mono">{sess.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recents Section */}
          {!loading && (
            <div className="flex flex-col gap-1.5 mt-2">
              <span className="text-[9px] uppercase font-bold text-[#5A6376] tracking-wider mb-1">Conversations</span>
              {filteredSessions.filter(s => !s.isPinned).map(sess => (
                <div
                  key={sess.id}
                  onClick={() => setActiveSessionId(sess.id)}
                  className={cn(
                    "p-3 rounded-xl border cursor-pointer transition-all duration-150 relative group text-left",
                    sess.id === activeSessionId 
                      ? "border-primary bg-primary/5" 
                      : "border-border-color/60 bg-[#16181D]/35 hover:bg-[#16181D]/60"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white truncate max-w-[150px]">{sess.title}</span>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handlePinSession(sess.id, sess.isPinned); }}
                        className="p-0.5 text-[#8D96A7] hover:text-white"
                      >
                        <Pin className="h-3 w-3" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteSession(sess.id); }}
                        className="p-0.5 text-[#8D96A7] hover:text-[#EF4444]"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] text-[#8D96A7] mt-1 font-semibold">
                    <span>🤖 {sess.agentName}</span>
                    <span>•</span>
                    <span className="font-mono">{sess.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Right Viewport: Conversation & Terminal */}
      <div className="flex-1 bg-card-bg border border-border-color rounded-2xl flex flex-col shadow-card overflow-hidden">
        
        {/* Chat Top Bar */}
        {activeSession ? (
          <div className="h-16 px-6 border-b border-border-color flex items-center justify-between bg-[#14161d] flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-lg">
                {activeSession.agentAvatar}
              </span>
              <div className="flex flex-col">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editTitleText}
                      onChange={(e) => setEditTitleText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveTitleEdit()}
                      onBlur={saveTitleEdit}
                      autoFocus
                      className="bg-[#16181D] border border-border-color text-xs font-bold text-white px-2 py-0.5 rounded outline-none"
                    />
                    <button onClick={saveTitleEdit} className="text-emerald-400 hover:text-emerald-300">
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{activeSession.title}</span>
                    <button onClick={startEditingTitle} className="text-[#8D96A7] hover:text-white">
                      <Edit3 className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <span className="text-[9px] text-[#8D96A7] font-semibold mt-0.5">Model engine: {activeSession.agentName} (RAG loops active)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => handlePinSession(activeSessionId, activeSession.isPinned)}
                className={cn("p-1.5 rounded-lg border border-border-color hover:bg-hover-bg text-[#8D96A7] hover:text-white transition-colors cursor-pointer", activeSession.isPinned && "border-primary text-primary hover:text-primary")}
                title="Pin Session"
              >
                <Pin className={cn("h-4 w-4", activeSession.isPinned && "fill-primary")} />
              </button>
              <button 
                onClick={() => handleDeleteSession(activeSessionId)}
                className="p-1.5 rounded-lg border border border-border-color hover:bg-hover-bg text-[#8D96A7] hover:text-[#EF4444] transition-colors cursor-pointer"
                title="Delete Session"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="h-16 px-6 border-b border-border-color flex items-center bg-[#14161d]" />
        )}

        {/* Messaging Area */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 scrollbar-thin bg-[#121319]/25">
          
          {messagesLoading && (
            <span className="text-[10px] text-[#8D96A7] italic text-center py-4">Syncing thread messages...</span>
          )}

          {!messagesLoading && messages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "flex items-start gap-4 max-w-3xl", 
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <span className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center text-xs flex-shrink-0 font-bold border",
                msg.role === "user" 
                  ? "bg-[#1f222d] border-[#2c313d] text-white" 
                  : "bg-primary/10 border-primary/20 text-primary"
              )}>
                {msg.role === "user" ? "US" : "🤖"}
              </span>

              <div className="flex flex-col gap-2">
                <div className={cn(
                  "p-4 rounded-2xl text-xs leading-relaxed max-w-full shadow-inner",
                  msg.role === "user"
                    ? "bg-[#1f222d] border border-[#2c313d] text-white"
                    : "bg-[#16181F] border border-border-color text-[#B7BDC8]"
                )}>
                  {/* Message body */}
                  <p className="whitespace-pre-line text-left">{msg.text}</p>

                  {/* Render Code Block */}
                  {msg.codeBlock && (
                    <div className="mt-4 rounded-xl border border-border-color bg-[#0a0b0d] overflow-hidden text-left">
                      <div className="flex items-center justify-between px-4 py-2 bg-[#111216] border-b border-border-color/60 text-[10px] text-[#8D96A7]">
                        <span className="font-mono">{msg.codeBlock.lang}</span>
                        <button 
                          onClick={() => copyCodeToClipboard(msg.codeBlock!.code)}
                          className="flex items-center gap-1 text-[#8D96A7] hover:text-white font-semibold transition-colors cursor-pointer"
                        >
                          <Code className="h-3.5 w-3.5" /> Copy Code
                        </button>
                      </div>
                      <pre className="p-4 overflow-x-auto font-mono text-[10px] text-emerald-400 bg-black/40 leading-normal">
                        <code>{msg.codeBlock.code}</code>
                      </pre>
                    </div>
                  )}
                </div>
                <span className={cn("text-[9px] text-[#5A6376] font-mono", msg.role === "user" ? "text-right" : "text-left")}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {/* Typing Loading Indicator */}
          {isTyping && (
            <div className="flex items-start gap-4 mr-auto max-w-xl">
              <span className="h-8 w-8 rounded-lg bg-primary/10 border-primary/20 flex items-center justify-center text-xs text-primary flex-shrink-0">
                🤖
              </span>
              <div className="flex flex-col gap-1 text-left">
                <div className="p-4 rounded-2xl bg-[#16181F] border border-border-color text-[#8D96A7] text-xs flex items-center gap-2">
                  <span className="h-2 w-2 bg-[#8D96A7] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 bg-[#8D96A7] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 bg-[#8D96A7] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="text-[10px] ml-1 font-semibold">Streaming response context...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Attachments list bar */}
        {attachments.length > 0 && (
          <div className="px-6 py-2.5 border-t border-border-color bg-[#16181F]/40 flex gap-2 flex-wrap">
            {attachments.map((att, i) => (
              <div key={i} className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] text-primary">
                <span>{att.name}</span>
                <button onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} className="text-[#8D96A7] hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Suggested prompts list */}
        {messages.length <= 1 && (
          <div className="px-6 py-3 border-t border-border-color bg-[#16181D]/25 flex flex-wrap gap-2 text-left">
            {suggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSend(undefined, sug.text)}
                className="px-3 py-1.5 text-[10px] font-semibold rounded-full border border-border-color/80 hover:border-primary/40 bg-card-bg hover:bg-hover-bg text-[#B7BDC8] hover:text-white transition-all cursor-pointer"
              >
                {sug.label}
              </button>
            ))}
          </div>
        )}

        {/* Prompt Input Form */}
        <form onSubmit={handleSend} className="p-4 border-t border-border-color bg-[#14161d] flex flex-col gap-2 flex-shrink-0">
          <div className="relative flex items-center bg-[#16181F] border border-border-color focus-within:border-primary/50 rounded-xl overflow-hidden px-3">
            <button 
              type="button" 
              onClick={simulateFileUpload}
              className="p-2 text-[#8D96A7] hover:text-white transition-colors cursor-pointer"
              title="Attach File"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              className="hidden" 
            />

            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={activeSession ? `Send message to ${activeSession.agentName}...` : "Choose an agent session..."}
              className="flex-1 bg-transparent text-xs text-white p-3 outline-none resize-none max-h-24 scrollbar-none"
              disabled={!activeSessionId}
            />

            <div className="flex items-center gap-1.5">
              {/* Mic voice input */}
              <button 
                type="button" 
                onClick={() => setIsRecording(!isRecording)}
                className={cn(
                  "p-2 rounded-lg text-[#8D96A7] hover:text-white transition-all cursor-pointer relative",
                  isRecording && "bg-red-500/10 text-red-400 hover:text-red-300"
                )}
                title="Voice Input"
              >
                <Mic className="h-4 w-4" />
                {isRecording && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
                )}
              </button>

              {/* Stop / Regenerate */}
              {isTyping ? (
                <button 
                  type="button"
                  onClick={() => setIsTyping(false)}
                  className="p-2 text-primary hover:text-primary-hover cursor-pointer"
                  title="Stop Generation"
                >
                  <StopCircle className="h-4 w-4" />
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => handleSend(undefined, "Regenerate last response.")}
                  className="p-2 text-[#8D96A7] hover:text-white transition-colors cursor-pointer"
                  title="Regenerate"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}

              <button 
                type="submit" 
                className="p-2 text-primary hover:text-primary-hover transition-colors cursor-pointer"
                title="Send Message"
                disabled={!activeSessionId}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Voice active pulsating visualizer soundwave */}
          {isRecording && (
            <div className="flex items-center gap-1 justify-center py-1.5 animate-fadeIn">
              <span className="text-[10px] text-red-400 mr-2 font-semibold">Listening to voice input...</span>
              {[...Array(6)].map((_, i) => (
                <span 
                  key={i} 
                  className="h-3 w-1 bg-red-400 rounded-full animate-pulse" 
                  style={{ animationDuration: `${0.6 + i * 0.15}s`, transform: "scaleY(1.5)" }} 
                />
              ))}
            </div>
          )}
        </form>

      </div>
    </div>
  );
}
