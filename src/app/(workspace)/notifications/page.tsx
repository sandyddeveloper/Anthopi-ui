// src/app/(workspace)/notifications/page.tsx
"use client";
import React, { useState, useEffect } from "react";
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
  Info,
  SlidersHorizontal,
  Mail,
  AlertTriangle,
  Server,
  Save,
  CheckSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // all, unread, workflow, security, system, preferences

  // Notification Preferences Form State
  const [prefEmail, setPrefEmail] = useState(true);
  const [prefSecurity, setPrefSecurity] = useState(true);
  const [prefWorkflow, setPrefWorkflow] = useState(true);
  const [prefSystem, setPrefSystem] = useState(true);
  const [prefSlackWebhook, setPrefSlackWebhook] = useState("");
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [notifRes, prefRes] = await Promise.all([
        apiClient.notifications.listNotifications(),
        apiClient.notifications.getPreferences()
      ]);
      
      const list = Array.isArray(notifRes.data) ? notifRes.data : (notifRes.data as any).results || [];
      setNotifications(list);

      if (prefRes.data) {
        setPrefEmail(prefRes.data.email_notifications ?? true);
        setPrefSecurity(prefRes.data.security_alerts ?? true);
        setPrefWorkflow(prefRes.data.workflow_notifications ?? true);
        setPrefSystem(prefRes.data.system_updates ?? true);
        setPrefSlackWebhook(prefRes.data.slack_webhook_url ?? "");
      }
    } catch (e) {
      console.error("Failed to load notifications or preferences:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const markAllRead = async () => {
    try {
      await apiClient.notifications.markRead();
      alert("All notifications marked as read.");
      loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to mark read.");
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await apiClient.notifications.markRead(id);
      loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to mark read.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.notifications.deleteNotification(id);
      loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to delete notification.");
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear your entire notifications inbox?")) return;
    try {
      await apiClient.notifications.clearAll();
      alert("Inbox cleared.");
      loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to clear inbox.");
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPrefs(true);
    try {
      await apiClient.notifications.updatePreferences({
        email_notifications: prefEmail,
        security_alerts: prefSecurity,
        workflow_notifications: prefWorkflow,
        system_updates: prefSystem,
        slack_webhook_url: prefSlackWebhook
      });
      alert("Notification preferences synced successfully.");
      loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to save preferences.");
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "workflow":
        return <Zap className="h-4.5 w-4.5 text-primary" />;
      case "security":
        return <ShieldAlert className="h-4.5 w-4.5 text-[#EF4444]" />;
      case "system":
        return <Server className="h-4.5 w-4.5 text-cyan-400" />;
      default:
        return <Info className="h-4.5 w-4.5 text-[#8D96A7]" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.read;
    if (activeTab === "workflow") return n.notification_type === "workflow";
    if (activeTab === "system") return n.notification_type === "system";
    if (activeTab === "security") return n.notification_type === "security";
    return true; // all
  });

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn text-left">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-color pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Notifications Inbox</h1>
          <p className="text-xs text-[#8D96A7] mt-1">Review system logs, execution faults, and credential safety details.</p>
        </div>

        {/* Action buttons */}
        {activeTab !== "preferences" && (
          <div className="flex items-center gap-2">
            <button 
              onClick={markAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-color hover:bg-hover-bg text-xs font-semibold text-[#B7BDC8] hover:text-white transition-colors cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Mark All Read</span>
            </button>
            <button 
              onClick={handleClearAll}
              className="p-1.5 rounded-xl border border-border-color hover:bg-hover-bg text-[#EF4444] cursor-pointer"
              title="Clear Inbox"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-color/60 shrink-0 overflow-x-auto scrollbar-hide">
        {["all", "unread", "workflow", "security", "system", "preferences"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2.5 text-xs font-semibold capitalize relative transition-colors border-b-2 whitespace-nowrap",
              activeTab === tab 
                ? "text-primary border-primary font-bold bg-primary/5" 
                : "text-[#8D96A7] hover:text-white border-transparent"
            )}
          >
            {tab === "preferences" ? "Preferences" : tab}
          </button>
        ))}
      </div>

      {/* Content Render */}
      {activeTab === "preferences" ? (
        // Preferences Form Tab
        <form onSubmit={handleSavePreferences} className="bg-card-bg border border-border-color rounded-card p-6 shadow-card max-w-2xl flex flex-col gap-6 animate-fadeIn">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <span>Notification Dispatch Settings</span>
            </h3>
            <p className="text-xs text-[#8D96A7] mt-1">Define which automated channels can send payload digests or access overrides reports.</p>
          </div>

          <div className="flex flex-col gap-4 border-t border-border-color/50 pt-4">
            
            <label className="flex items-center justify-between p-3.5 bg-[#16181D]/30 border border-border-color rounded-xl cursor-pointer hover:border-primary/20 transition-all">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-white">Email Dispatch Summary</span>
                  <span className="text-[10px] text-[#8D96A7] mt-0.5">Receive standard report metrics to your validated operator seat email.</span>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={prefEmail}
                onChange={(e) => setPrefEmail(e.target.checked)}
                className="accent-primary h-4.5 w-4.5 border-border-color" 
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-[#16181D]/30 border border-border-color rounded-xl cursor-pointer hover:border-primary/20 transition-all">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-[#EF4444]" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-white">Security & Audit Overrides alerts</span>
                  <span className="text-[10px] text-[#8D96A7] mt-0.5">Alert on password resets, deactivated clearance seats, and permission locks.</span>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={prefSecurity}
                onChange={(e) => setPrefSecurity(e.target.checked)}
                className="accent-primary h-4.5 w-4.5 border-border-color" 
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-[#16181D]/30 border border-border-color rounded-xl cursor-pointer hover:border-primary/20 transition-all">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-yellow-500" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-white">Workflow Execution logs</span>
                  <span className="text-[10px] text-[#8D96A7] mt-0.5">Push real-time failure nodes, trigger errors, and workflow completes.</span>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={prefWorkflow}
                onChange={(e) => setPrefWorkflow(e.target.checked)}
                className="accent-primary h-4.5 w-4.5 border-border-color" 
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-[#16181D]/30 border border-border-color rounded-xl cursor-pointer hover:border-primary/20 transition-all">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-cyan-400" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-white">System telemetry updates</span>
                  <span className="text-[10px] text-[#8D96A7] mt-0.5">Standard system announcements, version patches, and node syncs.</span>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={prefSystem}
                onChange={(e) => setPrefSystem(e.target.checked)}
                className="accent-primary h-4.5 w-4.5 border-border-color" 
              />
            </label>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Tenancy Slack Webhook Endpoint URL</label>
              <input 
                type="url" 
                placeholder="https://hooks.slack.com/services/..." 
                value={prefSlackWebhook}
                onChange={(e) => setPrefSlackWebhook(e.target.value)}
                className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
              />
            </div>

          </div>

          <div className="pt-4 border-t border-border-color/50 flex justify-end">
            <button 
              type="submit" 
              disabled={isSavingPrefs}
              className="inline-flex items-center gap-1.5 h-10 px-6 rounded-xl bg-primary text-white font-semibold text-xs transition-colors hover:bg-primary-hover shadow-lg shadow-primary/10 cursor-pointer"
            >
              {isSavingPrefs ? <span className="h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{isSavingPrefs ? "Saving..." : "Save Preferences"}</span>
            </button>
          </div>
        </form>
      ) : (
        // Notifications list layout
        <div className="flex flex-col gap-3 min-h-[300px]">
          {isLoading ? (
            <div className="py-24 text-center text-xs text-[#8D96A7]">
              <span className="inline-block h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2 align-middle" />
              <span>Checking inbox servers...</span>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "p-4 rounded-xl border flex gap-4 transition-all text-left",
                  notif.read 
                    ? "bg-card-bg/40 border-border-color/40 opacity-70" 
                    : "bg-card-bg border-border-color shadow-sm hover:border-[#2C313C]/80"
                )}
              >
                {/* Icon indicator */}
                <div className="p-2.5 bg-[#16181D] border border-border-color rounded-xl h-10 w-10 flex items-center justify-center flex-shrink-0">
                  {getIcon(notif.notification_type)}
                </div>

                {/* Message text */}
                <div className="flex-1 flex flex-col gap-1 text-left min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className={cn("text-xs font-bold truncate", notif.read ? "text-[#B7BDC8]" : "text-white")}>
                      {notif.title}
                    </h4>
                    <span className="text-[9px] text-[#8D96A7] font-mono flex-shrink-0">{formatTimeAgo(notif.created_at)}</span>
                  </div>
                  <p className="text-[11px] text-[#B7BDC8] leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col justify-between items-end flex-shrink-0">
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="p-1 rounded hover:bg-[#2A2F39] text-[#8D96A7] hover:text-[#EF4444]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  {!notif.read ? (
                    <button 
                      onClick={() => handleMarkRead(notif.id)}
                      className="p-1 rounded hover:bg-[#2A2F39] text-primary hover:text-white"
                      title="Mark read"
                    >
                      <CheckSquare className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
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
      )}

    </div>
  );
}
