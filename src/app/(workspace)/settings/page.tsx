// src/app/(workspace)/settings/page.tsx
"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Settings, 
  Shield, 
  CreditCard, 
  Plus, 
  Trash2, 
  Check, 
  Save, 
  Sliders,
  Activity,
  Terminal,
  Key,
  ShieldCheck,
  UserCheck,
  UserX,
  X,
  AlertTriangle,
  Globe,
  Palette,
  Bell,
  Smartphone,
  Laptop
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("workspace"); // workspace, general, security, branding, localization, notifications, roles, billing
  
  // Organization Details
  const [organization, setOrganization] = useState<any>(null);
  const [orgName, setOrgName] = useState("");
  const [orgIndustry, setOrgIndustry] = useState("");
  const [orgTimezone, setOrgTimezone] = useState("UTC");
  const [orgLanguage, setOrgLanguage] = useState("en");
  const [orgAddress, setOrgAddress] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  
  // States
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Security variables
  const [sessions, setSessions] = useState<any[]>([]);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [failedLoginsCount, setFailedLoginsCount] = useState(0);

  // RBAC roles and permissions
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleCode, setNewRoleCode] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Branding
  const [primaryColor, setPrimaryColor] = useState("red");
  const [logoText, setLogoText] = useState("Synapse OS");

  // Notifications
  const [notifySecurity, setNotifySecurity] = useState(true);
  const [notifyOrg, setNotifyOrg] = useState(true);
  const [notifySystem, setNotifySystem] = useState(false);

  // Read search params on load
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const loadSettingsData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (activeTab === "workspace" || activeTab === "general" || activeTab === "localization") {
        const orgsRes = await apiClient.orgs.getOrganizations();
        if (orgsRes.data && orgsRes.data.length > 0) {
          const orgData = orgsRes.data[0];
          setOrganization(orgData);
          setOrgName(orgData.name || "");
          setOrgIndustry(orgData.industry || "");
          setOrgTimezone(orgData.timezone || "UTC");
          setOrgLanguage(orgData.language || "en");
          setOrgAddress(orgData.address || "");
          setOrgPhone(orgData.phone || "");
          setOrgEmail(orgData.email || "");
        }
      } else if (activeTab === "security") {
        const sessionsRes = await apiClient.auth.getSessions();
        setSessions(sessionsRes.data || []);
        setFailedLoginsCount(1);
      } else if (activeTab === "roles") {
        const [rolesRes, permissionsRes] = await Promise.all([
          apiClient.auth.getRoles(),
          apiClient.auth.getPermissions()
        ]);
        setRoles(rolesRes.data || []);
        setPermissions(permissionsRes.data || []);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to load settings configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, [activeTab]);

  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;
    setIsSaved(false);
    setErrorMsg(null);

    try {
      await apiClient.orgs.updateOrganization(organization.id, {
        name: orgName,
        industry: orgIndustry,
        timezone: orgTimezone,
        language: orgLanguage,
        address: orgAddress,
        phone: orgPhone,
        email: orgEmail
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      loadSettingsData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to update organization details.");
    }
  };

  const handleRevokeSession = async (sessionUuid: string) => {
    if (!confirm("Are you sure you want to terminate this login session?")) return;
    try {
      await apiClient.auth.revokeSession(sessionUuid);
      loadSettingsData();
    } catch (err: any) {
      alert(err?.message || "Failed to revoke active session.");
    }
  };

  const handleTogglePermission = (permId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim() || !newRoleCode.trim()) return;
    setErrorMsg(null);

    try {
      await apiClient.auth.createRole({
        name: newRoleName,
        code: newRoleCode,
        permission_ids: selectedPermissions
      });
      
      setNewRoleName("");
      setNewRoleCode("");
      setSelectedPermissions([]);
      loadSettingsData();
      alert("Clearance access role provisioned successfully.");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to create custom role.");
    }
  };

  const handleDeleteRole = async (roleUuid: string) => {
    if (!confirm("Are you sure you want to delete this custom clearance tier?")) return;
    try {
      await apiClient.auth.deleteRole(roleUuid);
      loadSettingsData();
    } catch (err: any) {
      alert(err?.message || "Failed to delete role.");
    }
  };

  const getCategorizedPerms = () => {
    const categories: { [key: string]: any[] } = {
      "Dashboard": [],
      "Users": [],
      "Projects": [],
      "Automation": [],
      "Knowledge": []
    };

    permissions.forEach(p => {
      const code = p.code?.toLowerCase() || "";
      if (code.includes("dashboard") || code.includes("view")) {
        categories["Dashboard"].push(p);
      } else if (code.includes("user") || code.includes("member") || code.includes("invite")) {
        categories["Users"].push(p);
      } else if (code.includes("project") || code.includes("file")) {
        categories["Projects"].push(p);
      } else if (code.includes("automation") || code.includes("scheduler") || code.includes("execute")) {
        categories["Automation"].push(p);
      } else if (code.includes("knowledge") || code.includes("upload")) {
        categories["Knowledge"].push(p);
      } else {
        categories["Users"].push(p);
      }
    });

    return categories;
  };

  const permTree = getCategorizedPerms();

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-6 items-start animate-fadeIn text-left">
      <div className="w-full md:w-64 bg-card-bg border border-border-color rounded-card p-4 shadow-card flex flex-col gap-1 flex-shrink-0">
        {[
          { id: "workspace", label: "Organization Details", icon: <Settings className="h-4.5 w-4.5" /> },
          { id: "general", label: "General Settings", icon: <Sliders className="h-4.5 w-4.5" /> },
          { id: "security", label: "Security & Sessions", icon: <Shield className="h-4.5 w-4.5" /> },
          { id: "roles", label: "Roles & Clearances", icon: <Sliders className="h-4.5 w-4.5" /> },
          { id: "branding", label: "Branding Customizer", icon: <Palette className="h-4.5 w-4.5" /> },
          { id: "localization", label: "Localization Clock", icon: <Globe className="h-4.5 w-4.5" /> },
          { id: "notifications", label: "Notification Triggers", icon: <Bell className="h-4.5 w-4.5" /> },
          { id: "billing", label: "Billing & Plans", icon: <CreditCard className="h-4.5 w-4.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              router.push(`/settings?tab=${tab.id}`);
            }}
            className={cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors border border-transparent cursor-pointer",
              activeTab === tab.id 
                ? "bg-primary/10 text-primary border-primary/5" 
                : "text-[#8D96A7] hover:text-white hover:bg-hover-bg"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 bg-card-bg border border-border-color rounded-card p-6 md:p-8 shadow-card w-full min-h-[480px]">
        {errorMsg && (
          <div className="mb-4 p-3 text-xs text-[#EF4444] bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-xl flex gap-2 items-start animate-fadeIn">
            <AlertTriangle className="h-4.5 w-4.5 text-[#EF4444] flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isLoading && (
          <div className="py-16 flex flex-col items-center gap-2 justify-center text-text-muted text-xs">
            <span className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Synchronizing configurations node...</span>
          </div>
        )}

        {!isLoading && activeTab === "workspace" && (
          <form onSubmit={handleSaveWorkspace} className="flex flex-col gap-6 animate-fadeIn">
            <div>
              <h3 className="font-bold text-sm text-white">Organization Details</h3>
              <p className="text-[11px] text-[#8D96A7] mt-1">Configure company name, business unit profile, and primary contact listings.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Company Name</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Industry Domain</label>
                <input
                  type="text"
                  value={orgIndustry}
                  onChange={(e) => setOrgIndustry(e.target.value)}
                  className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Contact Phone</label>
                <input
                  type="text"
                  value={orgPhone}
                  onChange={(e) => setOrgPhone(e.target.value)}
                  className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Contact Email</label>
                <input
                  type="email"
                  value={orgEmail}
                  onChange={(e) => setOrgEmail(e.target.value)}
                  className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Mailing Address</label>
              <textarea
                value={orgAddress}
                onChange={(e) => setOrgAddress(e.target.value)}
                className="h-16 p-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-xl bg-primary text-white font-semibold text-xs transition-colors hover:bg-primary-hover shadow-lg shadow-primary/10 self-start cursor-pointer"
            >
              {isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              <span>{isSaved ? "Saved Successfully" : "Save Changes"}</span>
            </button>
          </form>
        )}

        {!isLoading && activeTab === "general" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div>
              <h3 className="font-bold text-sm text-white">General Parameters</h3>
              <p className="text-[11px] text-[#8D96A7] mt-1">Configure workspace node parameters, default options, and telemetry locks.</p>
            </div>
            
            <div className="p-4 bg-hover-bg/30 border border-border-color rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-white">Enable Maintenance Mode</h4>
                <p className="text-[10px] text-[#8D96A7] mt-0.5">Place cluster nodes in maintenance state. Locks standard employee seats.</p>
              </div>
              <button 
                onClick={() => alert("Maintenance toggle restricted to host systems console (/admin).")}
                className="h-7 px-3 bg-[#EF4444]/15 border border-[#EF4444]/20 rounded-lg text-[10px] text-[#EF4444] font-bold"
              >
                Disable Switcher
              </button>
            </div>
          </div>
        )}

        {!isLoading && activeTab === "security" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div>
              <h3 className="font-bold text-sm text-white">Security & Active Sessions</h3>
              <p className="text-[11px] text-[#8D96A7] mt-1">Supervise active seat access, review failed login indicators, and configure password strength regulations.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="p-4 bg-hover-bg/30 border border-border-color rounded-xl text-left flex flex-col justify-between h-28">
                <div>
                  <h4 className="font-bold text-xs text-white">Multi-Factor Authentication (MFA)</h4>
                  <span className="text-[9px] text-[#8D96A7] mt-1 block">Coming Soon: secure TOTP authenticator sweeps.</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 text-[8px] font-extrabold uppercase border border-yellow-500/20 self-start">Development stage</span>
              </div>

              <div className="p-4 bg-[#EF4444]/5 border border-[#EF4444]/15 rounded-xl text-left flex flex-col justify-between h-28">
                <div>
                  <h4 className="font-bold text-xs text-white">Failed Logins Ledger</h4>
                  <span className="text-[9px] text-[#8D96A7] mt-1 block">Operator connection retries recorded in the past 24 hours.</span>
                </div>
                <span className="text-lg font-black text-[#EF4444] font-mono">{failedLoginsCount} Attempts</span>
              </div>
            </div>

            <div className="p-4 bg-hover-bg/30 border border-border-color rounded-xl flex flex-col gap-2">
              <h4 className="font-bold text-xs text-white">Corporate Password strength Policies</h4>
              <ul className="text-[10px] text-text-secondary flex flex-col gap-1 leading-normal list-disc pl-4">
                <li>Secret Passkeys must contain at least 8 alphanumeric characters</li>
                <li>Clearance requires minimum 1 uppercase letter and 1 special symbol</li>
                <li>Session access tokens expire automatically after 24 hours of inactivity</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <h4 className="font-bold text-xs text-white">Active Login Sessions</h4>
              <div className="border border-border-color/60 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#16181D]/30 border-b border-border-color/60 text-[#8D96A7] font-bold uppercase tracking-wider text-[9px] pb-2 pt-2">
                      <th className="py-2.5 pl-3">Device / Browser</th>
                      <th className="py-2.5">OS / Platform</th>
                      <th className="py-2.5">IP Address</th>
                      <th className="py-2.5 text-right pr-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-color/40">
                    {sessions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-text-muted">No device sessions.</td>
                      </tr>
                    ) : (
                      sessions.map(s => (
                        <tr key={s.id} className="hover:bg-hover-bg/15 transition-colors">
                          <td className="py-3 pl-3 font-bold text-white flex items-center gap-1.5">
                            {s.device === "Mobile" ? <Smartphone className="h-3.5 w-3.5 text-primary" /> : <Laptop className="h-3.5 w-3.5 text-primary" />}
                            {s.device || "Desktop"} / {s.browser || "Chrome"}
                          </td>
                          <td className="py-3 text-[#B7BDC8]">{s.os || "MacOS/Linux"}</td>
                          <td className="py-3 font-mono text-text-muted">{s.ip_address}</td>
                          <td className="py-3 text-right pr-3">
                            <button
                              onClick={() => handleRevokeSession(s.id)}
                              className="px-2 py-0.5 rounded border border-[#EF4444]/20 hover:bg-[#EF4444]/10 text-[#EF4444] text-[9px] font-bold"
                            >
                              Logout Device
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!isLoading && activeTab === "roles" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div>
              <h3 className="font-bold text-sm text-white">Roles & Permissions (RBAC)</h3>
              <p className="text-[11px] text-[#8D96A7] mt-1">Configure clearance authorization tiers and customize permission flags check trees.</p>
            </div>

            <form onSubmit={handleCreateRole} className="flex flex-col gap-4 bg-[#16181D]/30 p-4 rounded-xl border border-border-color">
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-white">Create Custom Access Role</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Role Display Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Security Architect"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="h-9 px-3 text-xs rounded-lg border border-border-color bg-card-bg text-white focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Role Code Identifier</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. senior_security_architect"
                    value={newRoleCode}
                    onChange={(e) => setNewRoleCode(e.target.value)}
                    className="h-9 px-3 text-xs rounded-lg border border-border-color bg-card-bg text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Configure Clearance Tree</label>
                <div className="flex flex-col gap-3 p-3 rounded-lg border border-border-color/60 bg-[#111113] max-h-56 overflow-y-auto scrollbar-thin">
                  {Object.keys(permTree).map(category => (
                    <div key={category} className="flex flex-col gap-1 border-b border-border-color/30 pb-2 last:border-0 last:pb-0">
                      <span className="text-[9px] uppercase tracking-wider text-primary font-black">{category}</span>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {permTree[category].map(p => (
                          <label key={p.id} className="flex items-center gap-2 text-[10px] text-[#B7BDC8] hover:text-white cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={selectedPermissions.includes(p.id)}
                              onChange={() => handleTogglePermission(p.id)}
                              className="accent-primary h-3.5 w-3.5 border-border-color"
                            />
                            <span>{p.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="h-9 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-xs transition-colors self-start cursor-pointer"
              >
                Provision Clearance Role
              </button>
            </form>

            <div className="flex flex-col gap-3">
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-white">Registered Custom Roles</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {roles.map(role => (
                  <div key={role.id} className="p-4 rounded-xl border border-border-color bg-[#16181D]/20 flex flex-col justify-between gap-3 text-left">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-bold text-xs text-white">{role.name}</h5>
                        <span className="text-[9px] font-mono text-primary font-bold uppercase tracking-wider">{role.code}</span>
                      </div>
                      {role.code !== "super_admin" && role.code !== "manager" && (
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          className="p-1 rounded text-[#8D96A7] hover:text-[#EF4444] hover:bg-[#2A2F39] cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {role.permissions && role.permissions.length > 0 ? (
                        role.permissions.map((p: any) => (
                          <span key={p.id} className="text-[8px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary uppercase">
                            {p.code}
                          </span>
                        ))
                      ) : (
                        <span className="text-[8px] text-text-muted">No permissions bounds.</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!isLoading && activeTab === "branding" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div>
              <h3 className="font-bold text-sm text-white">Branding Customize</h3>
              <p className="text-[11px] text-[#8D96A7] mt-1">Configure layout appearance, logo settings, and workspace primary color palettes.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Logo Branding Text</label>
                <input
                  type="text"
                  value={logoText}
                  onChange={(e) => setLogoText(e.target.value)}
                  className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Primary Color Theme</label>
                <div className="flex gap-2.5 items-center mt-1">
                  {["red", "purple", "blue", "green"].map(c => (
                    <button 
                      key={c}
                      onClick={() => {
                        setPrimaryColor(c);
                        alert(`Color theme switched: ${c.toUpperCase()}`);
                      }}
                      className={cn(
                        "h-6 w-6 rounded-full border cursor-pointer border-transparent",
                        c === "red" && "bg-red-500",
                        c === "purple" && "bg-purple-500",
                        c === "blue" && "bg-blue-500",
                        c === "green" && "bg-green-500",
                        primaryColor === c && "border-white ring-2 ring-primary/45"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {!isLoading && activeTab === "localization" && (
          <form onSubmit={handleSaveWorkspace} className="flex flex-col gap-6 animate-fadeIn">
            <div>
              <h3 className="font-bold text-sm text-white">Localization Configs</h3>
              <p className="text-[11px] text-[#8D96A7] mt-1">Configure timezone synchronization triggers and workspace clock settings.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Language (Localization)</label>
                <select
                  value={orgLanguage}
                  onChange={(e) => setOrgLanguage(e.target.value)}
                  className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none"
                >
                  <option value="en">English (en)</option>
                  <option value="es">Español (es)</option>
                  <option value="de">Deutsch (de)</option>
                  <option value="fr">Français (fr)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">System Timezone</label>
                <select
                  value={orgTimezone}
                  onChange={(e) => setOrgTimezone(e.target.value)}
                  className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-xl bg-primary text-white font-semibold text-xs transition-colors hover:bg-primary-hover shadow-lg shadow-primary/10 self-start cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Save Localization Changes</span>
            </button>
          </form>
        )}

        {!isLoading && activeTab === "notifications" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div>
              <h3 className="font-bold text-sm text-white">Notification Triggers</h3>
              <p className="text-[11px] text-[#8D96A7] mt-1">Determine what security updates, organization activities, and systems logs broadcast alerts.</p>
            </div>

            <div className="flex flex-col gap-3 p-3 rounded-lg border border-border-color/60 bg-[#111113]">
              <label className="flex items-center justify-between text-xs text-[#B7BDC8] hover:text-white cursor-pointer select-none py-1 border-b border-border-color/30 last:border-0 last:pb-0">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-white">Security & Authentications Alerts</span>
                  <span className="text-[9px] text-[#8D96A7]">Trigger emails on new login devices or failed passkey coordinates.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifySecurity}
                  onChange={(e) => setNotifySecurity(e.target.checked)}
                  className="accent-primary h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-[#B7BDC8] hover:text-white cursor-pointer select-none py-1 border-b border-border-color/30 last:border-0 last:pb-0">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-white">Organization Governance Alerts</span>
                  <span className="text-[9px] text-[#8D96A7]">Broadcast Slack hooks on team builds or employee seat invites.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOrg}
                  onChange={(e) => setNotifyOrg(e.target.checked)}
                  className="accent-primary h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-[#B7BDC8] hover:text-white cursor-pointer select-none py-1 border-b border-border-color/30 last:border-0 last:pb-0">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-white">System Daemon Telemetry Logs</span>
                  <span className="text-[9px] text-[#8D96A7]">Trigger slack logs when container memory capacities exceed 85%.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifySystem}
                  onChange={(e) => setNotifySystem(e.target.checked)}
                  className="accent-primary h-4 w-4"
                />
              </label>
            </div>
          </div>
        )}

        {!isLoading && activeTab === "billing" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div>
              <h3 className="font-bold text-sm text-white">Billing & Active Plan</h3>
              <p className="text-[11px] text-[#8D96A7] mt-1">Review active plan, seat licensing allowances, and invoice history logs.</p>
            </div>
            
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-primary uppercase font-bold tracking-wider">Active Subscription</span>
                <h4 className="font-bold text-sm text-white">Enterprise Developer Tier</h4>
                <p className="text-[9px] text-[#8D96A7] mt-0.5">Includes unlimited workflow tasks, 5 seat licences, and priority support.</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-white font-mono">$49.00 / month</span>
                <span className="text-[8px] text-[#22C55E] font-bold block mt-1 uppercase">Next invoice: Aug 05, 2026</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="py-20 flex flex-col items-center justify-center gap-2 text-xs text-text-muted">
        <span className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Loading configurations...</span>
      </div>
    }>
      <SettingsPageContent />
    </Suspense>
  );
}
