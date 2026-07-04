"use client";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface LogItem {
  id: string;
  type: "think" | "tool" | "output" | "error" | "info";
  text: string;
  timestamp: string;
}

interface TypewriterConsoleProps {
  logs: LogItem[];
  className?: string;
  isTypingSpeed?: number;
}

export const TypewriterConsole = ({
  logs,
  className,
  isTypingSpeed = 15,
}: TypewriterConsoleProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayedLogs, setDisplayedLogs] = useState<LogItem[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [currentLogIndex, setCurrentLogIndex] = useState(0);

  // Synchronize when the logs list changes/resets
  useEffect(() => {
    if (logs.length === 0) {
      setDisplayedLogs([]);
      setCurrentText("");
      setCurrentLogIndex(0);
      return;
    }

    // If new logs are added, handle them
    if (currentLogIndex < logs.length) {
      const logToType = logs[currentLogIndex];
      let charIndex = 0;
      setCurrentText("");

      const interval = setInterval(() => {
        if (charIndex < logToType.text.length) {
          setCurrentText((prev) => prev + logToType.text.charAt(charIndex));
          charIndex++;
          scrollToBottom();
        } else {
          clearInterval(interval);
          setDisplayedLogs((prev) => [...prev, logToType]);
          setCurrentText("");
          setCurrentLogIndex((prev) => prev + 1);
        }
      }, isTypingSpeed);

      return () => clearInterval(interval);
    }
  }, [logs, currentLogIndex, isTypingSpeed]);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayedLogs, currentText]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "bg-black border border-neutral-900 rounded-xl p-4 font-mono text-xs overflow-y-auto flex flex-col gap-2 shadow-2xl h-[360px] scrollbar-thin scrollbar-thumb-neutral-800",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-neutral-900 pb-2 mb-2">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-zinc-500 ml-2">agent@anthopi: console.sh</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 text-zinc-400 animate-pulse">
          LIVE STREAM
        </span>
      </div>

      {displayedLogs.map((log) => (
        <div key={log.id} className="flex flex-col gap-0.5 animate-fadeIn">
          <div className="flex items-center gap-2 text-zinc-600 text-[10px]">
            <span>[{log.timestamp}]</span>
            <span className={cn(
              "uppercase font-semibold text-[9px] px-1 rounded",
              log.type === "think" && "bg-indigo-950/60 text-indigo-400 border border-indigo-900/30",
              log.type === "tool" && "bg-cyan-950/60 text-cyan-400 border border-cyan-900/30",
              log.type === "output" && "bg-emerald-950/60 text-emerald-400 border border-emerald-900/30",
              log.type === "error" && "bg-rose-950/60 text-rose-400 border border-rose-900/30",
              log.type === "info" && "bg-neutral-900 text-zinc-400"
            )}>
              {log.type}
            </span>
          </div>
          <p className={cn(
            "pl-2 border-l border-neutral-900 leading-relaxed break-words whitespace-pre-wrap",
            log.type === "think" && "text-indigo-300 italic",
            log.type === "tool" && "text-cyan-300 font-medium",
            log.type === "output" && "text-emerald-400 font-semibold",
            log.type === "error" && "text-rose-400 font-semibold",
            log.type === "info" && "text-zinc-300"
          )}>
            {log.text}
          </p>
        </div>
      ))}

      {currentLogIndex < logs.length && (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 text-zinc-600 text-[10px]">
            <span>[{logs[currentLogIndex].timestamp}]</span>
            <span className={cn(
              "uppercase font-semibold text-[9px] px-1 rounded",
              logs[currentLogIndex].type === "think" && "bg-indigo-950/60 text-indigo-400",
              logs[currentLogIndex].type === "tool" && "bg-cyan-950/60 text-cyan-400",
              logs[currentLogIndex].type === "output" && "bg-emerald-950/60 text-emerald-400",
              logs[currentLogIndex].type === "error" && "bg-rose-950/60 text-rose-400",
              logs[currentLogIndex].type === "info" && "bg-neutral-900 text-zinc-400"
            )}>
              {logs[currentLogIndex].type}
            </span>
          </div>
          <div className={cn(
            "pl-2 border-l border-neutral-800 leading-relaxed flex items-center break-words whitespace-pre-wrap",
            logs[currentLogIndex].type === "think" && "text-indigo-300 italic",
            logs[currentLogIndex].type === "tool" && "text-cyan-300 font-medium",
            logs[currentLogIndex].type === "output" && "text-emerald-400 font-semibold",
            logs[currentLogIndex].type === "error" && "text-rose-400 font-semibold",
            logs[currentLogIndex].type === "info" && "text-zinc-300"
          )}>
            <span>{currentText}</span>
            <span className="w-1.5 h-3.5 ml-0.5 bg-accent-blue inline-block animate-blink" />
          </div>
        </div>
      )}

      {logs.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-600">
          <p>Terminal idle. Select or create an agent to initiate stream.</p>
        </div>
      )}
    </div>
  );
};
