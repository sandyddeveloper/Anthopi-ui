"use client";
import React, { useState } from "react";
import { 
  Bell, 
  Check, 
  Trash2, 
  Archive, 
  Settings, 
  Sliders, 
  ShieldAlert, 
  Zap, 
  Bot,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: number;
  type: "workflow" | "security" | "system";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    [
      { id: 1, type: "workflow", title: "Daily Marketing SVG Compiler Failed", body: "Node Action: SVG Chart Plotter failed with exit status 1 (out of range layout).", time: "1 hour ago", read: false },
      { id: 2, type: "security", title: "Slack Webhook Token Expiring", body: "Acme Slack notification API credential expires in 3 days. Please refresh token.", time: "4 hours ago", read: false },
      { id: 3, type: "system", title: "Anthopi Core Node Updated", body: "OS Engine upgraded to v1.2.4 successfully. Review settings logs for changelog.", time: "Yesterday", read: true },
    ]
  );

  const [activeTab, setActiveTab] = useState("all");

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "workflow":
        return <Zap className="h-4.5 w-4.5 text-primary" />;
      case "security":
        return <ShieldAlert className="h-4.5 w-4.5 text-[#EF4444]" />;
      default:
        return <Info className="h-4.5 w-4.5 text-[#8D96A7]" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.read;
    if (activeTab === "workflow") return n.type === "workflow";
    if (activeTab === "system") return n.type === "system";
    if (activeTab === "security") return n.type === "security";
    return true; // all
  });

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-color/60 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Notifications Inbox</h1>
          <p className="text-xs text-[#8D96A7] mt-1">Review system logs, execution faults, and credential safety details.</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-color hover:bg-hover-bg text-xs text-[#B7BDC8]"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Mark all read</span>
          </button>
          <button 
            onClick={() => setNotifications([])}
            className="p-1.5 rounded-lg border border-border-color hover:bg-hover-bg text-[#EF4444]"
            title="Clear all"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-color/60">
        {["all", "unread", "workflow", "security", "system"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2.5 text-xs font-semibold capitalize relative transition-colors border-b-2",
              activeTab === tab 
                ? "text-primary border-primary font-bold bg-primary/5" 
                : "text-[#8D96A7] hover:text-white border-transparent"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications list layout */}
      <div className="flex flex-col gap-3 min-h-[250px]">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                "p-4 rounded-xl border flex gap-4 transition-all",
                notif.read 
                  ? "bg-card-bg/40 border-border-color/40 opacity-70" 
                  : "bg-card-bg border-border-color shadow-sm hover:border-[#2C313C]/80"
              )}
            >
              {/* Icon indicator */}
              <div className="p-2.5 bg-[#16181D] border border-border-color rounded-xl h-10 w-10 flex items-center justify-center flex-shrink-0">
                {getIcon(notif.type)}
              </div>

              {/* Message text */}
              <div className="flex-1 flex flex-col gap-1 text-left">
                <div className="flex items-center justify-between">
                  <h4 className={cn("text-xs font-bold", notif.read ? "text-[#B7BDC8]" : "text-white")}>
                    {notif.title}
                  </h4>
                  <span className="text-[9px] text-[#8D96A7] font-mono">{notif.time}</span>
                </div>
                <p className="text-[11px] text-[#B7BDC8] leading-relaxed">
                  {notif.body}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col justify-between items-end flex-shrink-0">
                <button
                  onClick={() => deleteNotification(notif.id)}
                  className="p-1 rounded hover:bg-[#2A2F39] text-[#8D96A7] hover:text-[#EF4444]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                {!notif.read && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card-bg border border-border-color rounded-card p-12 text-center text-xs text-[#8D96A7] flex flex-col items-center justify-center gap-3">
            <Bell className="h-8 w-8 text-[#2C313C]" />
            <span>No notifications match your active filter tab.</span>
          </div>
        )}
      </div>
    </div>
  );
}
