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
  Code
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatSession {
  id: number;
  title: string;
  agentName: string;
  lastMessage: string;
  updatedAt: string;
}

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  codeBlock?: {
    lang: string;
    code: string;
  };
}

export default function ChatPage() {
  // Mock conversations list
  const [sessions, setSessions] = useState<ChatSession[]>([
    { id: 1, title: "Software Quality Audit", agentName: "DevAgent v2.4", lastMessage: "Audit completed successfully. All unit tests passed.", updatedAt: "10 min ago" },
    { id: 2, title: "Literature Citations Compilation", agentName: "ResearchAgent v1.8", lastMessage: "Compiled 14 PubMed references into citations tree.", updatedAt: "1 hour ago" },
    { id: 3, title: "Q3 Analytics Mapping", agentName: "InsightAgent v3.0", lastMessage: "Exported SVG bar chart sales curves.", updatedAt: "Yesterday" }
  ]);

  const [activeSessionId, setActiveSessionId] = useState<number>(1);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: "I have audited the active Next.js project. Here are the core files indexing complete. To compile array helper files, I've created the following typescript class:",
      timestamp: "12:30 PM",
      codeBlock: {
        lang: "typescript",
        code: `export class AsyncSorter {\n  static async bubbleSort(arr: number[]): Promise<number[]> {\n    let len = arr.length;\n    for (let i = 0; i < len; i++) {\n      for (let j = 0; j < len - i - 1; j++) {\n        if (arr[j] > arr[j + 1]) {\n          let temp = arr[j];\n          arr[j] = arr[j + 1];\n          arr[j + 1] = temp;\n        }\n      }\n    }\n    return arr;\n  }\n}`
      }
    }
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: "user",
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate streaming agent response
    setTimeout(() => {
      let replyText = "I have indexed your query parameters. Let me run the default workspace tool to extract analytical outputs.";
      let codeBlock = undefined;

      const lower = input.toLowerCase();
      if (lower.includes("sort") || lower.includes("code") || lower.includes("typescript")) {
        replyText = "Here is the revised search searcher helper class in Typescript:";
        codeBlock = {
          lang: "typescript",
          code: `export function binarySearch(arr: number[], target: number): number {\n  let left = 0;\n  let right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}`
        };
      } else if (lower.includes("pubmed") || lower.includes("search") || lower.includes("paper")) {
        replyText = "Reviewing PubMed index references: 4 new articles on structural domain maps retrieved. High probability mapping: PMCID PMC819023.";
      }

      const assistantMsg: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        codeBlock
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
      
      // Update last message in sessions list
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, lastMessage: replyText, updatedAt: "Just now" } : s));
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-6 items-stretch h-[calc(100vh-140px)] animate-fadeIn">
      {/* Left panel: Conversations List */}
      <div className="w-full md:w-80 bg-card-bg border border-border-color rounded-card p-4 shadow-card flex flex-col gap-4 overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between border-b border-border-color/60 pb-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Chat Sessions</h3>
          <button className="p-1 rounded-lg border border-border-color hover:bg-hover-bg text-[#8D96A7]">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          {sessions.map((sess) => {
            const isActive = sess.id === activeSessionId;
            return (
              <div
                key={sess.id}
                onClick={() => {
                  setActiveSessionId(sess.id);
                  setMessages([
                    {
                      id: Date.now(),
                      role: "assistant",
                      text: `Successfully initialized ${sess.title} workspace. The agent is listening for queries.`,
                      timestamp: "12:00 PM"
                    }
                  ]);
                }}
                className={cn(
                  "p-3 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col gap-1.5 text-left",
                  isActive 
                    ? "border-primary bg-primary/5 text-primary" 
                    : "border-border-color/50 bg-[#16181D]/30 hover:bg-[#16181D]/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn("text-xs font-bold truncate flex-1", isActive ? "text-primary" : "text-white")}>
                    {sess.title}
                  </span>
                </div>
                <span className="text-[9px] text-primary/80 italic font-medium">{sess.agentName}</span>
                <span className="text-[10px] text-[#8D96A7] truncate">{sess.lastMessage}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right panel: Active Chat Room */}
      <div className="flex-1 bg-card-bg border border-border-color rounded-card shadow-card flex flex-col overflow-hidden">
        {/* Header bar */}
        <div className="p-4 border-b border-border-color flex items-center justify-between bg-card-bg/40 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#16181D] border border-border-color rounded-xl text-primary">
              <Bot className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white">{activeSession.title}</h3>
              <span className="text-[9px] text-[#8D96A7]">{activeSession.agentName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded hover:bg-hover-bg text-[#8D96A7]" title="Pin chat"><Pin className="h-4 w-4" /></button>
            <button className="p-1.5 rounded hover:bg-hover-bg text-[#8D96A7]" title="Share chat"><Share2 className="h-4 w-4" /></button>
            <button className="p-1.5 rounded hover:bg-hover-bg text-[#8D96A7]" title="Settings"><MoreVertical className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Message Feed list */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-4 max-w-[85%] animate-fadeIn",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div
                className={cn(
                  "p-2.5 rounded-xl border flex items-center justify-center flex-shrink-0 h-8 w-8 text-xs font-bold",
                  msg.role === "user"
                    ? "bg-neutral-800 border-neutral-700 text-white"
                    : "bg-primary/10 border-primary/20 text-primary"
                )}
              >
                {msg.role === "user" ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
              </div>

              <div className="flex flex-col gap-1.5">
                <div
                  className={cn(
                    "p-4 rounded-2xl text-xs leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-white rounded-tr-none shadow-md shadow-primary/5"
                      : "bg-[#16181D]/80 border border-border-color text-[#B7BDC8] rounded-tl-none"
                  )}
                >
                  {msg.text}

                  {msg.codeBlock && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-border-color bg-black font-mono text-[10px] text-[#B7BDC8] p-3 max-w-full overflow-x-auto select-text">
                      <div className="flex items-center justify-between border-b border-border-color/40 pb-1.5 mb-2 text-[#8D96A7]">
                        <span className="flex items-center gap-1.5">
                          <Code className="h-3.5 w-3.5" />
                          {msg.codeBlock.lang}
                        </span>
                      </div>
                      <pre className="whitespace-pre">{msg.codeBlock.code}</pre>
                    </div>
                  )}
                </div>
                <span className={cn("text-[9px] text-[#8D96A7]", msg.role === "user" && "text-right")}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4 max-w-[85%] mr-auto">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center flex-shrink-0 h-8 w-8">
                <Bot className="h-4.5 w-4.5 animate-pulse" />
              </div>
              <div className="bg-[#16181D]/80 border border-border-color p-4 rounded-2xl rounded-tl-none text-xs text-[#8D96A7]">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 bg-[#8D96A7] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 bg-[#8D96A7] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 bg-[#8D96A7] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input prompt area */}
        <div className="p-4 border-t border-border-color bg-card-bg/40 flex-shrink-0">
          <form onSubmit={handleSend} className="relative flex items-center bg-[#16181D] border border-border-color rounded-xl px-4 py-2">
            <button type="button" className="p-1.5 rounded-lg text-[#8D96A7] hover:text-white hover:bg-hover-bg">
              <Paperclip className="h-4.5 w-4.5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Send instructions to ${activeSession.agentName}...`}
              className="flex-1 bg-transparent border-none text-xs text-white placeholder-[#8D96A7] px-3 focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <button type="button" className="p-1.5 rounded-lg text-[#8D96A7] hover:text-white hover:bg-hover-bg">
                <Mic className="h-4.5 w-4.5" />
              </button>
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-2 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-colors flex items-center justify-center"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
