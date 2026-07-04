// src/app/(workspace)/settings/page.tsx
"use client";
import React, { useState, useEffect } from "react";
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
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("workspace"); // workspace, security, auditLogs, roles, billing
  
  // Workspace Organization General Settings
  const [organization, setOrganization] = useState<any>(null);
  const [orgName, setOrgName] = useState("");
  const [orgIndustry, setOrgIndustry] = useState("");
  const [orgTimezone, setOrgTimezone] = useState("UTC");
  const [orgLanguage, setOrgLanguage] = useState("en");
  const [orgAddress, setOrgAddress] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // Security Active Sessions
  const [sessions, setSessions] = useState<any[]>([]);
  // Audit logs
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  // RBAC roles and permissions
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleCode, setNewRoleCode] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Loading/Error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load Initial Settings data
  useEffect(() => {
    loadSettingsData();
  }, [activeTab]);

  const loadSettingsData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (activeTab === "workspace") {
        const orgsRes = await apiClient.orgs.getOrganizations();
        if (orgsRes.data && orgsRes.data.length > 0) {
          const org = orgsRes.data[0];
          setOrganization(org);
          setOrgName(org.name || "");
          setOrgIndustry(org.industry || "");
          setOrgTimezone(org.timezone || "UTC");
          setOrgLanguage(org.language || "en");
          setOrgAddress(org.address || "");
          setOrgPhone(org.phone || "");
          setOrgEmail(org.email || "");
        }
      } else if (activeTab === "security") {
        const sessionsRes = await apiClient.auth.getSessions();
        setSessions(sessionsRes.data || []);
      } else if (activeTab === "auditLogs") {
        const logsRes = await apiClient.auditLogs.getAuditLogs();
        // Backend returns logs, it could be paginated. Let's inspect meta
        const list = Array.isArray(logsRes.data) ? logsRes.data : (logsRes.data as any).results || [];
        setAuditLogs(list);
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

  // Save general organization settings
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

  // Revoke Specific Session
  const handleRevokeSession = async (sessionUuid: string) => {
    if (!confirm("Are you sure you want to terminate this login session? The device will be locked out immediately.")) return;
    try {
      await apiClient.auth.revokeSession(sessionUuid);
      loadSettingsData();
    } catch (err: any) {
      alert(err?.message || "Failed to revoke active session.");
    }
  };

  // Logout All other devices
  const handleLogoutAllOther = async () => {
    if (!confirm("Are you sure you want to terminate all other login sessions on other devices?")) return;
    try {
      await apiClient.auth.logoutAll();
      loadSettingsData();
    } catch (err: any) {
      alert(err?.message || "Failed to terminate other sessions.");
    }
  };

  // Toggle permission selection
  const handleTogglePermission = (permId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  // Create Custom Role
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
      alert("Role created successfully.");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to create custom role.");
    }
  };

  // Delete/Revoke Custom Role
  const handleDeleteRole = async (roleUuid: string) => {
    if (!confirm("Are you sure you want to soft delete this role? This cannot be undone.")) return;
    try {
      await apiClient.auth.deleteRole(roleUuid);
      loadSettingsData();
    } catch (err: any) {
      alert(err?.message || "Failed to delete role.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-6 items-start animate-fadeIn">
      {/* Left panel Settings Subsections */}
      <div className="w-full md:w-64 bg-card-bg border border-border-color rounded-card p-4 shadow-card flex flex-col gap-1 flex-shrink-0">
        {[
          { id: "workspace", label: "Workspace General", icon: <Settings className="h-4.5 w-4.5" /> },
          { id: "security", label: "Active Sessions", icon: <Shield className="h-4.5 w-4.5" /> },
          { id: "auditLogs", label: "Security Audit Trail", icon: <Terminal className="h-4.5 w-4.5" /> },
          { id: "roles", label: "Roles & RBAC Clearances", icon: <Sliders className="h-4.5 w-4.5" /> },
          { id: "billing", label: "Billing & Subscription", icon: <CreditCard className="h-4.5 w-4.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors border border-transparent cursor-pointer",
              activeTab === tab.id 
                ? "bg-[#2F81F7]/15 text-primary border-primary/10" 
                : "text-[#8D96A7] hover:text-white hover:bg-hover-bg"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Right panel Viewport details */}
      <div className="flex-1 bg-card-bg border border-border-color rounded-card p-6 md:p-8 shadow-card w-full min-h-[480px]">
        
        {/* Error Alert Display */}
        {errorMsg && (
          <div className="mb-4 p-3.5 text-xs text-[#EF4444] bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-xl text-left flex gap-2 items-start animate-fadeIn">
            <AlertTriangle className="h-4.5 w-4.5 text-[#EF4444] flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab Loader */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center gap-2 justify-center text-text-muted text-xs">
            <span className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Synchronizing workspace parameters...</span>
          </div>
        )}

        {/* 1. Workspace Tab */}
        {!isLoading && activeTab === "workspace" && (
          <form onSubmit={handleSaveWorkspace} className="flex flex-col gap-6 text-left animate-fadeIn">
            <div>
              <h3 className="font-bold text-sm text-white">General Workspace Settings</h3>
              <p className="text-[11px] text-[#8D96A7] mt-1">Configure your organization details and system routing settings.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Organization Name</label>
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
                  placeholder="e.g. Manufacturing, SaaS"
                  className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Primary Phone</label>
                <input
                  type="text"
                  value={orgPhone}
                  onChange={(e) => setOrgPhone(e.target.value)}
                  placeholder="e.g. +15550199"
                  className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Contact Email</label>
                <input
                  type="email"
                  value={orgEmail}
                  onChange={(e) => setOrgEmail(e.target.value)}
                  placeholder="info@acme.com"
                  className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">System Timezone</label>
                <select
                  value={orgTimezone}
                  onChange={(e) => setOrgTimezone(e.target.value)}
                  className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Language Settings</label>
                <select
                  value={orgLanguage}
                  onChange={(e) => setOrgLanguage(e.target.value)}
                  className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                >
                  <option value="en">English (en)</option>
                  <option value="es">Español (es)</option>
                  <option value="de">Deutsch (de)</option>
                  <option value="fr">Français (fr)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Business Address</label>
              <textarea
                value={orgAddress}
                onChange={(e) => setOrgAddress(e.target.value)}
                placeholder="123 Industrial Parkway..."
                className="h-20 p-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary resize-none"
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

        {/* 2. Security Active Sessions Tab */}
        {!isLoading && activeTab === "security" && (
          <div className="flex flex-col gap-6 text-left animate-fadeIn">
            <div className="flex justify-between items-start border-b border-border-color/60 pb-4">
              <div>
                <h3 className="font-bold text-sm text-white">Active Operator Sessions</h3>
                <p className="text-[11px] text-[#8D96A7] mt-1">Monitor devices, OS systems, and connection IPs authenticated on this seat.</p>
              </div>
              <button
                onClick={handleLogoutAllOther}
                className="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-[#EF4444]/20 bg-[#EF4444]/5 hover:bg-[#EF4444]/15 text-[#EF4444] transition-all cursor-pointer"
              >
                Logout All Other Devices
              </button>
            </div>

            {/* Sessions Table */}
            <div className="border border-border-color/60 rounded-xl overflow-hidden mt-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#16181D] border-b border-border-color/60 text-[#8D96A7] font-bold uppercase tracking-wider text-[9px] pb-2 pt-2">
                    <th className="py-2.5 pl-3">Device / Browser</th>
                    <th className="py-2.5">OS / Platform</th>
                    <th className="py-2.5">IP Address</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right pr-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color/40">
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-text-muted">No active sessions located.</td>
                    </tr>
                  ) : (
                    sessions.map((s) => (
                      <tr key={s.id} className="hover:bg-[#16181D]/20 transition-colors">
                        <td className="py-3 pl-3 font-bold text-white">
                          <span className="flex items-center gap-1.5">
                            <span className={cn("h-1.5 w-1.5 rounded-full", s.is_active ? "bg-[#22C55E]" : "bg-[#EF4444]")} />
                            {s.device || "Desktop"} / {s.browser || "Browser"}
                          </span>
                        </td>
                        <td className="py-3 text-[#B7BDC8] font-semibold">{s.os || "Linux"}</td>
                        <td className="py-3 font-mono text-[#8D96A7]">{s.ip_address || "127.0.0.1"}</td>
                        <td className="py-3">
                          <span className={cn(
                            "text-[8px] uppercase font-bold px-1.5 py-0.5 rounded border",
                            s.is_active
                              ? "bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]"
                              : "bg-neutral-800 border-neutral-700 text-[#8D96A7]"
                          )}>
                            {s.is_active ? "Active Now" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 text-right pr-3">
                          {s.is_active && (
                            <button
                              onClick={() => handleRevokeSession(s.id)}
                              className="p-1 rounded text-[#8D96A7] hover:text-[#EF4444] hover:bg-[#2A2F39] cursor-pointer"
                              title="Terminate Session"
                            >
                              <UserX className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Security Audit Logs Tab */}
        {!isLoading && activeTab === "auditLogs" && (
          <div className="flex flex-col gap-6 text-left animate-fadeIn">
            <div className="border-b border-border-color/60 pb-4">
              <h3 className="font-bold text-sm text-white">Workspace Security Audit Logs</h3>
              <p className="text-[11px] text-[#8D96A7] mt-1">Real-time ledger recording operator actions, network requests, and database transactions.</p>
            </div>

            {/* Audit Logs Table */}
            <div className="border border-border-color/60 rounded-xl overflow-hidden mt-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#16181D] border-b border-border-color/60 text-[#8D96A7] font-bold uppercase tracking-wider text-[9px] pb-2 pt-2">
                    <th className="py-2.5 pl-3">Operator Email</th>
                    <th className="py-2.5">Action Event</th>
                    <th className="py-2.5">Network Route</th>
                    <th className="py-2.5">Origin IP</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right pr-3">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color/40 text-[11px]">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-text-muted">No security audit footprints recorded.</td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#16181D]/20 transition-colors">
                        <td className="py-3 pl-3 font-semibold text-white truncate max-w-[120px]">{log.user_email || "System"}</td>
                        <td className="py-3 font-bold text-primary">{log.action}</td>
                        <td className="py-3 font-mono text-text-secondary">
                          <span className="px-1.5 py-0.5 rounded bg-black/40 text-[9px] border border-border-color/60 mr-1.5 font-bold uppercase text-primary">
                            {log.method}
                          </span>
                          {log.path}
                        </td>
                        <td className="py-3 font-mono text-[#8D96A7]">{log.ip_address}</td>
                        <td className="py-3">
                          <span className={cn(
                            "font-bold font-mono text-[9px]",
                            log.status_code >= 200 && log.status_code < 300 ? "text-[#22C55E]" : "text-[#EF4444]"
                          )}>
                            {log.status_code}
                          </span>
                        </td>
                        <td className="py-3 text-right pr-3 font-mono text-[#8D96A7]">
                          {log.created_at ? new Date(log.created_at).toISOString().replace("T", " ").substring(0, 19) : "Just now"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Roles & Clearances Tab */}
        {!isLoading && activeTab === "roles" && (
          <div className="flex flex-col gap-6 text-left animate-fadeIn">
            <div className="border-b border-border-color/60 pb-4">
              <h3 className="font-bold text-sm text-white">Roles-Based Access Control (RBAC)</h3>
              <p className="text-[11px] text-[#8D96A7] mt-1">Configure role permissions boundaries and operational clear level access tiers.</p>
            </div>

            {/* Create Custom Role Form */}
            <form onSubmit={handleCreateRole} className="flex flex-col gap-4 bg-[#16181D]/40 p-4 rounded-xl border border-border-color/80">
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

              {/* Permissions checkboxes grid */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Grant Clearances (Permissions)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-lg border border-border-color/60 bg-[#111113]">
                  {permissions.length === 0 ? (
                    <span className="text-[10px] text-text-muted col-span-3">No system permissions resolved.</span>
                  ) : (
                    permissions.map(p => (
                      <label key={p.id} className="flex items-center gap-2 text-[10px] text-[#B7BDC8] hover:text-white cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(p.id)}
                          onChange={() => handleTogglePermission(p.id)}
                          className="accent-primary h-3.5 w-3.5 border-border-color"
                        />
                        <span>{p.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="h-9 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-xs transition-colors self-start cursor-pointer"
              >
                Provision Access Role
              </button>
            </form>

            {/* List Roles */}
            <div className="flex flex-col gap-3 mt-2">
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-white">Registered Security Roles</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {roles.length === 0 ? (
                  <span className="text-xs text-text-muted">No custom roles created.</span>
                ) : (
                  roles.map(role => (
                    <div key={role.id} className="p-4 rounded-xl border border-border-color bg-[#16181D]/30 flex flex-col justify-between gap-3 text-left">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-bold text-xs text-white">{role.name}</h5>
                          <span className="text-[9px] font-mono text-primary font-bold uppercase tracking-wider">{role.code}</span>
                        </div>
                        {role.code !== "super_admin" && role.code !== "manager" && (
                          <button
                            onClick={() => handleDeleteRole(role.id)}
                            className="p-1 rounded text-[#8D96A7] hover:text-[#EF4444] hover:bg-[#2A2F39] cursor-pointer"
                            title="Soft Delete Role"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Permissions badges */}
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
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. Billing Tab */}
        {!isLoading && activeTab === "billing" && (
          <div className="flex flex-col gap-6 text-left animate-fadeIn">
            <div>
              <h3 className="font-bold text-sm text-white">Billing & Invoices</h3>
              <p className="text-[11px] text-[#8D96A7] mt-1">Check active plan details, download PDFs, and update credit cards.</p>
            </div>
            
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between mt-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Active Workspace Plan</span>
                <h4 className="font-bold text-sm text-white">Enterprise Developer Tier</h4>
                <p className="text-[10px] text-[#8D96A7] mt-1">Includes unlimited workflows, 5 seats, and $15 monthly API credits.</p>
              </div>
              <span className="text-sm font-bold text-white">$49 / mo</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
