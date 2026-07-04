"use client";
import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: "assistant" | "user";
  text: string;
  timestamp: string;
}

export const FloatingAssistant = ({ isOpen, onClose }: FloatingAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hello! I am the Anthopi OS workspace assistant. I can help you monitor project runs, trigger webhook nodes, or register custom agent personas. What would you like to build today?",
      timestamp: new Date().toTimeString().split(" ")[0].slice(0, 5),
    },
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

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      text: input,
      timestamp: new Date().toTimeString().split(" ")[0].slice(0, 5),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate system agent reply after a delay
    setTimeout(() => {
      let replyText = "I've analyzed your query. To manage automations or trigger active webhook actions, you can navigate directly to the Automations canvas or the Scheduler tab.";
      const lower = input.toLowerCase();
      
      if (lower.includes("agent") || lower.includes("bot")) {
        replyText = "You currently have 3 AI Agents registered (DevAgent, ResearchAgent, InsightAgent). You can create new personas in the AI Agents tab using instructions, tools sandbox, and memory allocations.";
      } else if (lower.includes("project")) {
        replyText = "Projects gather your resources (automations, files, and credentials). You can configure a new folder structure or archive existing ones inside the Projects tab.";
      } else if (lower.includes("integration") || lower.includes("connect")) {
        replyText = "We support Slack, Notion, GitHub, and OpenAI. You can sync integrations and review credentials in the Integrations portal.";
      }

      const assistantMessage: Message = {
        role: "assistant",
        text: replyText,
        timestamp: new Date().toTimeString().split(" ")[0].slice(0, 5),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-[#111113] border-l border-[#2C313C] z-50 flex flex-col shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-[#2C313C] flex items-center justify-between bg-[#181B22]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-white">Anthopi Copilot</h3>
            <span className="text-[10px] text-primary font-medium">Platform Assistant</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-[#2A2F39] text-[#8D96A7] hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={cn(
              "flex gap-3 max-w-[85%]",
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div
              className={cn(
                "p-2 rounded-lg text-[10px] flex items-center justify-center flex-shrink-0 h-6 w-6 border",
                msg.role === "user"
                  ? "bg-neutral-800 border-neutral-700 text-white"
                  : "bg-primary/10 border-primary/20 text-primary"
              )}
            >
              {msg.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
            </div>

            <div className="flex flex-col gap-1">
              <div
                className={cn(
                  "p-3 rounded-2xl text-xs leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-white rounded-tr-none"
                    : "bg-[#181B22] border border-[#2C313C] text-[#B7BDC8] rounded-tl-none"
                )}
              >
                {msg.text}
              </div>
              <span
                className={cn(
                  "text-[9px] text-[#8D96A7]",
                  msg.role === "user" && "text-right"
                )}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center flex-shrink-0 h-6 w-6">
              <Bot className="h-3 w-3 animate-pulse" />
            </div>
            <div className="bg-[#181B22] border border-[#2C313C] p-3 rounded-2xl rounded-tl-none text-xs text-[#8D96A7]">
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

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-[#2C313C] bg-[#181B22] flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about the system..."
          className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#2C313C] bg-[#16181D] text-white placeholder-[#8D96A7] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="p-2 rounded-xl bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </form>
    </div>
  );
};
