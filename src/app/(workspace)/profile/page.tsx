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
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [language, setLanguage] = useState("en");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.users.getProfile();
      if (res.data) {
        setProfile(res.data);
        setFullName(res.data.full_name || "");
        setPhone(res.data.phone || "");
        setTimezone(res.data.timezone || "UTC");
        setLanguage(res.data.language || "en");
      }
    } catch (err: any) {
      console.error("Failed to load user profile details:", err);
      setErrorMsg(err?.message || "Failed to load user profile information.");
    } finally {
      setIsLoading(false);
    }
  };

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
        language: language
      });
      if (res.success) {
        setIsSaved(true);
        setProfile(res.data);
        // Sync user in localStorage to update name dynamically in layout
        const cachedUser = localStorage.getItem("user");
        if (cachedUser) {
          try {
            const parsed = JSON.parse(cachedUser);
            const updated = { ...parsed, ...res.data };
            localStorage.setItem("user", JSON.stringify(updated));
            // Trigger a storage event to alert layout
            window.dispatchEvent(new Event('storage'));
          } catch (e) {
            console.error(e);
          }
        }
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (err: any) {
      console.error("Failed to update profile details:", err);
      setErrorMsg(err?.message || "Failed to update profile details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 text-left animate-fadeIn">
      
      {/* Page Header */}
      <div className="border-b border-border-color pb-5">
        <h1 className="text-xl font-extrabold text-text-primary tracking-tight">Operator Profile Settings</h1>
        <p className="text-xs text-text-muted mt-1">Configure your personal profile details, contact preferences, and localization options.</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Left Card: Summary & Details */}
            <div className="md:col-span-1 bg-card-bg border border-border-color rounded-card p-6 shadow-sm flex flex-col items-center gap-5 text-center">
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
                <span className="text-[10px] text-text-muted truncate px-2">{profile.email}</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border bg-[#2F81F7]/10 border-[#2F81F7]/20 text-primary self-center mt-1">
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
                  <span className="font-mono text-[11px]">{profile.timezone || "UTC"}</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#B7BDC8]">
                  <Globe className="h-4 w-4 text-[#8D96A7]" />
                  <span className="uppercase text-[11px] font-bold">{profile.language || "en"}</span>
                </div>
              </div>
            </div>

            {/* Right Card: Edit Form */}
            <div className="md:col-span-2 bg-card-bg border border-border-color rounded-card p-6 md:p-8 shadow-sm">
              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5 text-left">
                <h3 className="font-bold text-sm text-white border-b border-border-color/60 pb-3 mb-1">
                  Edit Personal Profiles
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8D96A7]" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Alex Mercer"
                        className="w-full h-10 pl-9 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8D96A7]" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 555-0199"
                        className="w-full h-10 pl-9 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Localization Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                    >
                      <option value="en">English (US)</option>
                      <option value="es">Español (ES)</option>
                      <option value="de">Deutsch (DE)</option>
                      <option value="fr">Français (FR)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">System Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                    >
                      <option value="UTC">Coordinated Universal Time (UTC)</option>
                      <option value="America/New_York">Eastern Time (US & Canada)</option>
                      <option value="Europe/London">London / Greenwich (GMT)</option>
                      <option value="Asia/Kolkata">India Standard Time (IST)</option>
                      <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3 pt-4 border-t border-border-color/60">
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

                  {isSaved && (
                    <span className="text-[11px] font-semibold text-[#22C55E] animate-fadeIn">
                      Profile metadata synchronized successfully.
                    </span>
                  )}
                </div>
              </form>
            </div>
            
          </div>
        )
      )}
      
    </div>
  );
}
