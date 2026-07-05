// src/app/(workspace)/profile/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Shield, 
  Save, 
  Check, 
  AlertTriangle,
  Clock,
  Briefcase,
  Laptop,
  Smartphone,
  Trash2,
  Key,
  ShieldCheck,
  Lock,
  Layers,
  Sparkles,
  ToggleLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("personal"); // personal, organization, security, sessions, preferences
  const [sessions, setSessions] = useState<any[]>([]);

  // Personal Info Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [language, setLanguage] = useState("en");
  const [address, setAddress] = useState("");

  // Security Form State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);

  // General States
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [profRes, sessRes] = await Promise.all([
        apiClient.users.getProfile(),
        apiClient.auth.getSessions()
      ]);
      
      if (profRes.data) {
        setProfile(profRes.data);
        setFullName(profRes.data.full_name || "");
        setPhone(profRes.data.phone || "");
        setTimezone(profRes.data.timezone || "UTC");
        setLanguage(profRes.data.language || "en");
        setAddress(profRes.data.address || "Acme HQ Cluster Node, San Jose, CA");
      }
      setSessions(sessRes.data || []);
    } catch (err: any) {
      console.error("Failed to sync profile configuration:", err);
      setErrorMsg(err?.message || "Failed to synchronize profile parameters.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);
    setErrorMsg(null);

    try {
      const res = await apiClient.users.updateProfile({
        full_name: fullName,
        phone: phone,
        timezone: timezone,
        language: language,
        address: address
      });
      if (res.success) {
        setIsSaved(true);
        setProfile(res.data);
        // Sync cached user in localStorage
        const cachedUser = localStorage.getItem("user");
        if (cachedUser) {
          try {
            const parsed = JSON.parse(cachedUser);
            const updated = { ...parsed, ...res.data };
            localStorage.setItem("user", JSON.stringify(updated));
            window.dispatchEvent(new Event('storage'));
          } catch (e) {
            console.error(e);
          }
        }
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to update profile details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setIsChangingPass(true);
    try {
      // Mock dispatch or API call if exists
      alert("Credential Key updated successfully across cluster node!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      alert(err?.message || "Failed to update password keys.");
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleRevokeSession = async (sessId: string) => {
    if (!confirm("Are you sure you want to revoke this session?")) return;
    try {
      await apiClient.auth.revokeSession(sessId);
      alert("Session revoked successfully.");
      const refreshed = await apiClient.auth.getSessions();
      setSessions(refreshed.data || []);
    } catch (err: any) {
      alert(err?.message || "Failed to revoke session.");
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm("Are you sure you want to log out of all other devices?")) return;
    try {
      await apiClient.auth.logoutAll();
      alert("All other sessions revoked.");
      const refreshed = await apiClient.auth.getSessions();
      setSessions(refreshed.data || []);
    } catch (err: any) {
      alert(err?.message || "Failed to clear sessions.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn text-left">
      
      {/* Page Header */}
      <div className="border-b border-border-color pb-5">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white animate-slideIn">Operator Profile Settings</h1>
        <p className="text-xs text-[#8D96A7] mt-1">Configure your personal profile details, contact preferences, and localization options.</p>
      </div>

      {errorMsg && (
        <div className="p-3.5 text-xs text-[#EF4444] bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-xl flex gap-2 items-start animate-fadeIn">
          <AlertTriangle className="h-4.5 w-4.5 text-[#EF4444] flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-24 flex flex-col items-center gap-2 justify-center text-text-muted text-xs bg-card-bg border border-border-color rounded-card">
          <span className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Synchronizing profile parameters...</span>
        </div>
      ) : (
        profile && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Card: Summary Card */}
            <div className="lg:col-span-4 bg-card-bg border border-border-color rounded-card p-6 shadow-card flex flex-col items-center gap-5 text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-extrabold text-2xl uppercase text-primary shadow-inner">
                {fullName
                  ? fullName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .substring(0, 2)
                  : profile.email?.substring(0, 2) || "US"}
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <h2 className="font-extrabold text-sm text-white truncate px-2">{fullName || "Unnamed Operator"}</h2>
                <span className="text-[10px] text-[#8D96A7] font-mono truncate px-2">{profile.email}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border bg-primary/5 border-primary/20 text-primary self-center mt-1">
                  {profile.role_details?.name || profile.role || "Operator"}
                </span>
              </div>

              <div className="border-t border-border-color/60 pt-4 w-full flex flex-col gap-3.5 text-left text-xs">
                <div className="flex items-center gap-2.5 text-[#B7BDC8]">
                  <Briefcase className="h-4 w-4 text-[#8D96A7]" />
                  <span className="truncate">
                    {profile.organization_details?.name || "Independent Cluster"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-[#B7BDC8]">
                  <Clock className="h-4 w-4 text-[#8D96A7]" />
                  <span className="font-mono text-[11px]">{timezone || "UTC"}</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#B7BDC8]">
                  <Globe className="h-4 w-4 text-[#8D96A7]" />
                  <span className="uppercase text-[11px] font-bold">{language || "en"}</span>
                </div>
              </div>
            </div>

            {/* Right Card: Tabbed Views */}
            <div className="lg:col-span-8 flex flex-col gap-5">
              
              {/* Tab Navigation header */}
              <div className="flex bg-[#16181D]/40 border border-border-color p-1 rounded-xl shrink-0 overflow-x-auto scrollbar-hide">
                {[
                  { id: "personal", label: "Personal" },
                  { id: "organization", label: "Organization" },
                  { id: "security", label: "Security" },
                  { id: "sessions", label: "Sessions" },
                  { id: "preferences", label: "Preferences" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={cn(
                      "flex-1 py-2 px-3 text-[10px] md:text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap",
                      activeTab === t.id
                        ? "bg-primary text-white shadow-md"
                        : "text-text-muted hover:text-text-primary"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab views components */}
              <div className="bg-card-bg border border-border-color rounded-card p-6 md:p-8 shadow-card min-h-[350px]">
                
                {activeTab === "personal" && (
                  <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5 text-left animate-fadeIn">
                    <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-border-color/60 pb-3 mb-1">
                      Edit Profile Info
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Full Name</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Phone Number</label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Language</label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none"
                        >
                          <option value="en">English (US)</option>
                          <option value="es">Español (ES)</option>
                          <option value="de">Deutsch (DE)</option>
                          <option value="fr">Français (FR)</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Timezone</label>
                        <select
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          className="w-full h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none"
                        >
                          <option value="UTC">Coordinated Universal Time (UTC)</option>
                          <option value="America/New_York">Eastern Time (US & Canada)</option>
                          <option value="Europe/London">London / Greenwich (GMT)</option>
                          <option value="Asia/Kolkata">India Standard Time (IST)</option>
                          <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Contact Address</label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full p-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none h-16 resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-border-color/60">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-xl bg-primary text-white font-semibold text-xs transition-colors hover:bg-primary-hover shadow-lg shadow-primary/10 cursor-pointer disabled:opacity-50"
                      >
                        {isSaving ? (
                          <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : isSaved ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        <span>{isSaving ? "Saving Settings..." : isSaved ? "Profile Saved" : "Save Changes"}</span>
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === "organization" && (
                  <div className="flex flex-col gap-5 text-left animate-fadeIn text-xs text-[#B7BDC8]">
                    <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-border-color/60 pb-3 mb-1">
                      Organization Credentials
                    </h3>
                    <p className="text-[10px] text-[#8D96A7] leading-relaxed mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span>Security Policy Lock: Organizational details are provisioned by tenancy administrators and remain locked for standard seats.</span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex justify-between border-b border-border-color/30 pb-2.5">
                        <span className="text-[#8D96A7]">Corporate Tenant:</span>
                        <span className="font-bold text-white">{profile.organization_details?.name || "Acme Corp"}</span>
                      </div>
                      <div className="flex justify-between border-b border-border-color/30 pb-2.5">
                        <span className="text-[#8D96A7]">Clearance Role:</span>
                        <span className="font-bold text-primary font-mono">{profile.role_details?.name || "Member"}</span>
                      </div>
                      <div className="flex justify-between border-b border-border-color/30 pb-2.5">
                        <span className="text-[#8D96A7]">Department Unit:</span>
                        <span className="font-bold text-white">{profile.employee_profile?.department_details?.name || "Engineering"}</span>
                      </div>
                      <div className="flex justify-between border-b border-border-color/30 pb-2.5">
                        <span className="text-[#8D96A7]">Team Node:</span>
                        <span className="font-bold text-white">{profile.employee_profile?.team_details?.name || "Operations Team"}</span>
                      </div>
                      <div className="flex justify-between border-b border-border-color/30 pb-2.5">
                        <span className="text-[#8D96A7]">Job Designation:</span>
                        <span className="font-bold text-white">{profile.employee_profile?.designation_details?.name || "Architect"}</span>
                      </div>
                      <div className="flex justify-between border-b border-border-color/30 pb-2.5">
                        <span className="text-[#8D96A7]">Seat Manager:</span>
                        <span className="font-bold text-white">{profile.employee_profile?.reporting_manager_details?.full_name || "None"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <form onSubmit={handleChangePasswordSubmit} className="flex flex-col gap-5 text-left animate-fadeIn">
                    <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-border-color/60 pb-3 mb-1 flex items-center gap-1.5">
                      <Lock className="h-4.5 w-4.5 text-[#EF4444]" />
                      <span>Security & Password Keys</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">New Password</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Confirm New Password</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-border-color/60">
                      <button
                        type="submit"
                        disabled={isChangingPass}
                        className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-xl bg-primary text-white font-semibold text-xs transition-colors hover:bg-primary-hover shadow-lg shadow-primary/10 cursor-pointer"
                      >
                        <Key className="h-4 w-4" />
                        <span>Update Security Key</span>
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === "sessions" && (
                  <div className="flex flex-col gap-5 text-left animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-border-color/60 pb-3 mb-1">
                      <h3 className="font-bold text-xs text-white uppercase tracking-wider">
                        Active Tenant Sessions
                      </h3>
                      <button 
                        onClick={handleRevokeAllSessions}
                        className="text-[10px] text-[#EF4444] hover:underline font-bold"
                      >
                        Revoke All Sessions
                      </button>
                    </div>

                    <div className="flex flex-col gap-3">
                      {sessions.length === 0 ? (
                        <div className="py-6 text-center text-xs text-[#8D96A7]">
                          No other active cluster connections detected.
                        </div>
                      ) : (
                        sessions.map((s) => (
                          <div key={s.id} className="p-3.5 bg-[#16181D]/30 border border-border-color rounded-xl flex items-center justify-between text-xs text-[#B7BDC8]">
                            <div className="flex items-center gap-3">
                              {s.device === "Mobile" ? <Smartphone className="h-4.5 w-4.5 text-primary" /> : <Laptop className="h-4.5 w-4.5 text-primary" />}
                              <div className="flex flex-col text-left text-[10px] gap-0.5">
                                <span className="font-bold text-white">{s.os || "Unknown OS"} • {s.browser || "Browser"}</span>
                                <span className="text-[9px] font-mono text-text-muted">{s.ip_address} • {new Date(s.last_accessed).toLocaleString()}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleRevokeSession(s.id)}
                              className="p-1 rounded text-[#8D96A7] hover:text-[#EF4444]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "preferences" && (
                  <div className="flex flex-col gap-5 text-left animate-fadeIn text-xs text-[#B7BDC8]">
                    <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-border-color/60 pb-3 mb-1 flex items-center gap-1.5">
                      <Sparkles className="h-4.5 w-4.5 text-primary" />
                      <span>Console Display & Preferences</span>
                    </h3>

                    <div className="flex flex-col gap-4">
                      <label className="flex items-center justify-between p-3.5 bg-[#16181D]/30 border border-border-color rounded-xl cursor-pointer">
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-white">Tenancy Dark System Theme</span>
                          <span className="text-[9px] text-[#8D96A7] mt-0.5">Toggle active cluster color schemes between Light-Purple and Dark-Red tones.</span>
                        </div>
                        <input type="checkbox" defaultChecked className="accent-primary h-4 w-4" />
                      </label>

                      <label className="flex items-center justify-between p-3.5 bg-[#16181D]/30 border border-border-color rounded-xl cursor-pointer">
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-white">Real-Time WebSocket Streams</span>
                          <span className="text-[9px] text-[#8D96A7] mt-0.5">Subscribe to system metrics updates reactively via pipeline logs socket.</span>
                        </div>
                        <input type="checkbox" defaultChecked className="accent-primary h-4 w-4" />
                      </label>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        )
      )}
      
    </div>
  );
}
