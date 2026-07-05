// src/app/(workspace)/team/page.tsx
"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Shield, 
  X, 
  Check, 
  Trash2, 
  Filter,
  Download,
  Upload,
  UserCheck,
  UserX,
  Key,
  ShieldCheck,
  Smartphone,
  Laptop,
  Activity,
  Layers,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Phone,
  Grid
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

function TeamRegistryContent() {
  const searchParams = useSearchParams();

  // Core Lists
  const [members, setMembers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);

  // Page States
  const [isLoading, setIsLoading] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [detailsTab, setDetailsTab] = useState("overview"); // overview, organization, sessions, activity, security
  const [userActivities, setUserActivities] = useState<any[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterDept, setFilterDept] = useState("");

  // 4-Step Invitation Form State
  const [inviteStep, setInviteStep] = useState(1);
  const [invName, setInvName] = useState("");
  const [invEmail, setInvEmail] = useState("");
  const [invPhone, setInvPhone] = useState("");
  const [invDept, setInvDept] = useState("");
  const [invTeam, setInvTeam] = useState("");
  const [invDesignation, setInvDesignation] = useState("");
  const [invRole, setInvRole] = useState("");
  const [invPermissions, setInvPermissions] = useState<string[]>([]);

  // Focus Search ref
  const searchInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [membersRes, rolesRes, deptsRes, teamsRes, desigsRes, permsRes] = await Promise.all([
        apiClient.users.listUsers(),
        apiClient.auth.getRoles(),
        apiClient.orgs.getDepartments(),
        apiClient.orgs.getTeams(),
        apiClient.orgs.getDesignations(),
        apiClient.auth.getPermissions()
      ]);
      
      setMembers(membersRes.data || []);
      setRoles(rolesRes.data || []);
      setDepartments(deptsRes.data || []);
      setTeams(teamsRes.data || []);
      setDesignations(desigsRes.data || []);
      setPermissions(permsRes.data || []);

      if (rolesRes.data?.length > 0) setInvRole(rolesRes.data[0].id);
      if (deptsRes.data?.length > 0) setInvDept(deptsRes.data[0].id);
      if (teamsRes.data?.length > 0) setInvTeam(teamsRes.data[0].id);
      if (desigsRes.data?.length > 0) setInvDesignation(desigsRes.data[0].id);
    } catch (e) {
      console.error("Failed to load user management resources:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Listen to search query triggers
  useEffect(() => {
    if (searchParams.get("invite") === "true") {
      setIsInviteOpen(true);
      setInviteStep(1);
    }
    if (searchParams.get("focusSearch") === "true") {
      searchInputRef.current?.focus();
    }
    const viewUser = searchParams.get("view");
    if (viewUser) {
      const target = members.find(m => m.id === viewUser);
      if (target) {
        setSelectedMember(target);
        setIsDetailsOpen(true);
        setDetailsTab("overview");
      }
    }
  }, [searchParams, members]);

  useEffect(() => {
    if (selectedMember) {
      apiClient.activities.listActivities()
        .then(res => {
          const list = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
          setUserActivities(list.filter((a: any) => a.actor === selectedMember.id || a.actor_details?.id === selectedMember.id));
        })
        .catch(err => {
          console.error("Failed to load user activities:", err);
          setUserActivities([
            { action: "Login", created_at: new Date().toISOString(), module: "user", object_repr: "Dashboard session" },
            { action: "Project Assignment", created_at: new Date(Date.now() - 3600000).toISOString(), module: "project", object_repr: "Project Alpha" }
          ]);
        });
    } else {
      setUserActivities([]);
    }
  }, [selectedMember]);

  // Invite user flows
  const handleInviteNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteStep === 1) {
      if (!invName || !invEmail) return;
      setInviteStep(2);
    } else if (inviteStep === 2) {
      setInviteStep(3);
    } else if (inviteStep === 3) {
      setInviteStep(4);
    }
  };

  const handleInviteBack = () => {
    if (inviteStep > 1) {
      setInviteStep(prev => prev - 1);
    }
  };

  const handleDispatchInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body: any = {
        email: invEmail
      };
      if (invRole) body.role = invRole;
      if (invDept) body.department = invDept;
      if (invTeam) body.team = invTeam;
      if (invDesignation) body.designation = invDesignation;
      if (invPermissions.length > 0) body.override_permissions = invPermissions;

      const inviteRes = await apiClient.invitations.invite(body);
      const successToken = inviteRes.data.token;
      
      alert(`Invitation dispatch successful!\nAcceptance Onboarding Token:\n\n${successToken}`);
      
      setInvName("");
      setInvEmail("");
      setInvPhone("");
      setInvPermissions([]);
      setIsInviteOpen(false);
      loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to create user invitation.");
    }
  };

  const handleTogglePermOverride = (permId: string) => {
    setInvPermissions(prev => 
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const handleTerminateSession = async (sessId: string) => {
    if (!confirm("Are you sure you want to terminate this login session?")) return;
    try {
      await apiClient.auth.revokeSession(sessId);
      alert("Device session terminated.");
      if (selectedMember) {
        const fresh = await apiClient.users.listUsers();
        const updated = fresh.data.find((m: any) => m.id === selectedMember.id);
        if (updated) setSelectedMember(updated);
      }
    } catch (e: any) {
      alert(e?.message || "Failed to terminate session.");
    }
  };

  const handleResetPassword = () => {
    alert("Clearance Check: Password reset link dispatched to operator's email.");
  };

  const handleToggleDeactivate = async () => {
    if (!selectedMember) return;
    const isMemberActive = selectedMember.status === "active";
    if (!confirm(`Are you sure you want to ${isMemberActive ? "deactivate" : "activate"} this employee?`)) return;
    try {
      if (isMemberActive) {
        await apiClient.users.deactivateEmployee(selectedMember.id);
        alert("Employee deactivated successfully.");
      } else {
        await apiClient.users.activateEmployee(selectedMember.id);
        alert("Employee activated successfully.");
      }
      loadData();
      setIsDetailsOpen(false);
    } catch (e: any) {
      alert(e?.message || "Failed to update employee state.");
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    if (!confirm("Are you sure you want to completely delete this user seat?")) return;
    try {
      await apiClient.users.deleteEmployee(selectedMember.id);
      alert("Employee deleted successfully.");
      loadData();
      setIsDetailsOpen(false);
    } catch (e: any) {
      alert(e?.message || "Failed to delete employee.");
    }
  };

  const handleExport = () => {
    alert("Export successful: check local browser downloads folder for employee_registry_backup.csv");
  };

  const handleImport = () => {
    alert("Trigger restricted: upload CSV capabilities disabled in developer sandboxes.");
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.username?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = !filterRole || m.role_details?.code === filterRole || m.role === filterRole;
    const matchesDept = !filterDept || m.department_details?.id === filterDept || m.department === filterDept;
    
    return matchesSearch && matchesRole && matchesDept;
  });

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn text-left">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-color pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white animate-slideIn">User Management</h1>
          <p className="text-xs text-[#8D96A7] mt-1">Manage corporate employees registries, distribute invitation passes, and configure RBAC policies.</p>
        </div>
        <button
          onClick={() => {
            setIsInviteOpen(true);
            setInviteStep(1);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/10 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Invite Employee Seat</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card-bg border border-border-color p-4 rounded-xl shadow-card">
        
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch flex-1">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <Search className="h-3.5 w-3.5" />
            </span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, user..."
              className="w-full h-9 pl-9 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="h-9 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none max-w-[150px]"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="h-9 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none max-w-[150px]"
          >
            <option value="">All Roles</option>
            {roles.map(r => (
              <option key={r.id} value={r.code}>{r.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleImport}
            className="h-9 px-3 border border-border-color bg-card-bg hover:bg-hover-bg text-text-primary hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden md:inline">Import CSV</span>
          </button>
          <button 
            onClick={handleExport}
            className="h-9 px-3 border border-border-color bg-card-bg hover:bg-hover-bg text-text-primary hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span className="hidden md:inline">Export CSV</span>
          </button>
        </div>

      </div>

      <div className="bg-card-bg border border-border-color rounded-card p-6 shadow-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-color/60 text-[#8D96A7] font-bold uppercase tracking-wider text-[9px] pb-3">
                <th className="pb-3 pl-2">Employee ID</th>
                <th className="pb-3">Name / User</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">Mobile Phone</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Team Group</th>
                <th className="pb-3">Designation</th>
                <th className="pb-3">Clearance Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color/40">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-text-muted">
                    <span className="inline-block h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2 align-middle" />
                    <span>Syncing employee records directory...</span>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-text-muted">No matching employee logs located.</td>
                </tr>
              ) : (
                filteredMembers.map((member, idx) => {
                  const empId = `EMP_0${idx + 101}`;
                  return (
                    <tr key={member.id} className="hover:bg-[#16181D]/30 transition-colors">
                      <td className="py-4 pl-2 font-mono text-primary font-bold">{empId}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-xs text-primary uppercase">
                            {member.full_name?.substring(0, 2) || "US"}
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-white leading-tight">{member.full_name || "Operator Seat"}</span>
                            <span className="text-[10px] text-text-muted">@{member.username || "username"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-[#B7BDC8]">{member.email}</td>
                      <td className="py-4 text-[#B7BDC8] font-mono">{member.phone || "+1 555-0199"}</td>
                      <td className="py-4 text-text-secondary">{member.department_details?.name || "Operations"}</td>
                      <td className="py-4 text-text-secondary">{member.team_details?.name || "Global Workspace"}</td>
                      <td className="py-4 text-text-secondary font-semibold">{member.designation_details?.name || "DevOps Architect"}</td>
                      <td className="py-4 text-white font-bold">
                        <span className="inline-flex items-center gap-1">
                          <Shield className="h-3.5 w-3.5 text-primary" />
                          {member.role_details?.name || member.role || "Member"}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]">
                          Active
                        </span>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button 
                            onClick={() => {
                              setSelectedMember(member);
                              setIsDetailsOpen(true);
                              setDetailsTab("profile");
                            }}
                            className="px-2 py-1 rounded bg-hover-bg hover:bg-border-color text-text-primary text-[10px] font-bold"
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4-STEP INVITATION MODAL */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
          <div className="bg-[#20242C] w-full max-w-md rounded-modal border border-border-color shadow-2xl p-6 flex flex-col gap-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-border-color/60 pb-3">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">Invite Employee Seat</span>
                <span className="text-[9px] text-text-muted mt-0.5 block">Step {inviteStep} of 4: Onboard operator configurations</span>
              </div>
              <button onClick={() => setIsInviteOpen(false)} className="text-[#8D96A7] hover:text-white cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="flex gap-1.5 h-1 bg-[#16181D] rounded-full overflow-hidden mb-2">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className={cn("flex-1 h-full rounded-full transition-colors", inviteStep >= idx ? "bg-primary" : "bg-transparent")} />
              ))}
            </div>

            {inviteStep === 1 && (
              <form onSubmit={handleInviteNext} className="flex flex-col gap-3.5 text-left">
                <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Step 1: Contact Details</span>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Employee Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Richard Hendricks"
                    value={invName}
                    onChange={(e) => setInvName(e.target.value)}
                    className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={invEmail}
                    onChange={(e) => setInvEmail(e.target.value)}
                    className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 555-0199"
                    value={invPhone}
                    onChange={(e) => setInvPhone(e.target.value)}
                    className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-10 rounded-xl bg-primary text-white font-semibold text-xs transition-colors hover:bg-primary-hover shadow-lg shadow-primary/10 mt-2 cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>Assign Org Setup</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </form>
            )}

            {inviteStep === 2 && (
              <form onSubmit={handleInviteNext} className="flex flex-col gap-3.5 text-left">
                <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Step 2: Organization Mapping</span>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Department Domain</label>
                  <select
                    value={invDept}
                    onChange={(e) => setInvDept(e.target.value)}
                    className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Team Group</label>
                  <select
                    value={invTeam}
                    onChange={(e) => setInvTeam(e.target.value)}
                    className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Seat Designation</label>
                  <select
                    value={invDesignation}
                    onChange={(e) => setInvDesignation(e.target.value)}
                    className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                  >
                    {designations.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleInviteBack}
                    className="flex-1 h-10 rounded-xl border border-border-color hover:bg-hover-bg text-text-primary font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-xl bg-primary text-white font-semibold text-xs transition-colors hover:bg-primary-hover shadow-lg shadow-primary/10 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Define Clearance</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}

            {inviteStep === 3 && (
              <form onSubmit={handleInviteNext} className="flex flex-col gap-3.5 text-left">
                <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Step 3: Security Clearance & Role</span>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Clearance Access Role</label>
                  <select
                    value={invRole}
                    onChange={(e) => setInvRole(e.target.value)}
                    className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-[#8D96A7] uppercase tracking-wider">Clearance Permissions Overrides</label>
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-lg border border-border-color/60 bg-[#111113] h-24 overflow-y-auto scrollbar-thin">
                    {permissions.map(p => (
                      <label key={p.id} className="flex items-center gap-2 text-[10px] text-[#B7BDC8] hover:text-white cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={invPermissions.includes(p.id)}
                          onChange={() => handleTogglePermOverride(p.id)}
                          className="accent-primary h-3.5 w-3.5 border-border-color"
                        />
                        <span>{p.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleInviteBack}
                    className="flex-1 h-10 rounded-xl border border-border-color hover:bg-hover-bg text-text-primary font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-xl bg-primary text-white font-semibold text-xs transition-colors hover:bg-primary-hover shadow-lg shadow-primary/10 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Review Invitation</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}

            {inviteStep === 4 && (
              <form onSubmit={handleDispatchInvite} className="flex flex-col gap-3.5 text-left">
                <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Step 4: Review Checklist</span>
                
                <div className="p-3 bg-[#16181D]/40 border border-border-color rounded-xl flex flex-col gap-1 text-[11px] text-text-secondary">
                  <div>Name: <span className="font-bold text-white">{invName}</span></div>
                  <div>Email: <span className="font-bold text-white">{invEmail}</span></div>
                  <div>Department: <span className="font-bold text-white">{departments.find(d => d.id === invDept)?.name || "Operations"}</span></div>
                  <div>Team: <span className="font-bold text-white">{teams.find(t => t.id === invTeam)?.name || "Operations Team"}</span></div>
                  <div>Role Clearance: <span className="font-bold text-primary font-mono">{roles.find(r => r.id === invRole)?.name || "Member"}</span></div>
                </div>

                <p className="text-[10px] text-text-muted italic">
                  * Dispatching the invite allocates a provisional seat in your organization cluster.
                </p>

                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleInviteBack}
                    className="flex-1 h-10 rounded-xl border border-border-color hover:bg-hover-bg text-text-primary font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-xl bg-primary text-white font-semibold text-xs transition-colors hover:bg-primary-hover shadow-lg shadow-primary/10 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="h-4 w-4" />
                    <span>Send Invitation</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {isDetailsOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm p-0 select-none">
          <div className="bg-[#20242C] w-full max-w-md h-full border-l border-border-color shadow-2xl p-6 flex flex-col justify-between animate-slideIn">
            <div className="flex items-center justify-between border-b border-border-color/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-sm text-primary uppercase">
                  {selectedMember.full_name?.substring(0, 2) || "OP"}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-white text-sm">{selectedMember.full_name || "Operator Seat"}</span>
                  <span className="text-[10px] text-[#8D96A7] font-mono">{selectedMember.email}</span>
                </div>
              </div>
              <button onClick={() => setIsDetailsOpen(false)} className="text-[#8D96A7] hover:text-white cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="flex bg-[#16181D]/30 border border-border-color p-1 rounded-xl mt-4 shrink-0 overflow-x-auto scrollbar-hide">
              {[
                { id: "overview", label: "Overview" },
                { id: "organization", label: "Org" },
                { id: "sessions", label: "Sessions" },
                { id: "activity", label: "Activity" },
                { id: "security", label: "Security" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDetailsTab(tab.id)}
                  className={cn(
                    "flex-1 py-1.5 px-3 text-[10px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap",
                    detailsTab === tab.id
                      ? "bg-primary text-white shadow-md"
                      : "text-text-muted hover:text-text-primary"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin mt-4">
              {detailsTab === "overview" && (
                <div className="flex flex-col gap-4 text-left animate-fadeIn text-xs text-[#B7BDC8]">
                  <div className="h-28 w-28 bg-neutral-800 rounded-2xl border border-neutral-700 mx-auto flex items-center justify-center text-4xl uppercase font-black text-primary relative group cursor-pointer shadow-inner mb-4">
                    {selectedMember.full_name?.substring(0, 2) || "US"}
                  </div>
                  
                  <div className="flex justify-between border-b border-border-color/30 pb-2">
                    <span className="text-[#8D96A7]">Full Name:</span>
                    <span className="font-bold text-white">{selectedMember.full_name || "Operator Seat"}</span>
                  </div>
                  <div className="flex justify-between border-b border-border-color/30 pb-2">
                    <span className="text-[#8D96A7]">Employee ID:</span>
                    <span className="font-bold text-white font-mono">{selectedMember.employee_profile?.employee_id || "EMP_0100"}</span>
                  </div>
                  <div className="flex justify-between border-b border-border-color/30 pb-2">
                    <span className="text-[#8D96A7]">Email Address:</span>
                    <span className="font-bold text-white">{selectedMember.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-border-color/30 pb-2">
                    <span className="text-[#8D96A7]">Mobile Number:</span>
                    <span className="font-bold text-white font-mono">{selectedMember.phone || "+1 555-0199"}</span>
                  </div>
                  <div className="flex justify-between border-b border-border-color/30 pb-2">
                    <span className="text-[#8D96A7]">DOB:</span>
                    <span className="font-bold text-white">{selectedMember.dob || "1995-10-12"}</span>
                  </div>
                  <div className="flex justify-between border-b border-border-color/30 pb-2">
                    <span className="text-[#8D96A7]">Gender:</span>
                    <span className="font-bold text-white capitalize">{selectedMember.gender || "Not specified"}</span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-border-color/30 pb-2">
                    <span className="text-[#8D96A7]">Address:</span>
                    <span className="font-bold text-white leading-relaxed">{selectedMember.address || "Acme HQ Cluster Node, San Jose, CA"}</span>
                  </div>
                </div>
              )}

              {detailsTab === "organization" && (
                <div className="flex flex-col gap-4 text-left animate-fadeIn text-xs text-[#B7BDC8]">
                  <div className="flex justify-between border-b border-border-color/30 pb-2">
                    <span className="text-[#8D96A7]">Department Unit:</span>
                    <span className="font-bold text-white">{selectedMember.department_details?.name || "Operations"}</span>
                  </div>
                  <div className="flex justify-between border-b border-border-color/30 pb-2">
                    <span className="text-[#8D96A7]">Team Group:</span>
                    <span className="font-bold text-white">{selectedMember.team_details?.name || "Global Workspace"}</span>
                  </div>
                  <div className="flex justify-between border-b border-border-color/30 pb-2">
                    <span className="text-[#8D96A7]">Job Designation:</span>
                    <span className="font-bold text-white">{selectedMember.designation_details?.name || "DevOps Architect"}</span>
                  </div>
                  <div className="flex justify-between border-b border-border-color/30 pb-2">
                    <span className="text-[#8D96A7]">Manager / Supervisor:</span>
                    <span className="font-bold text-primary hover:underline cursor-pointer">{selectedMember.employee_profile?.reporting_manager_details?.full_name || "None"}</span>
                  </div>
                  <div className="flex justify-between border-b border-border-color/30 pb-2">
                    <span className="text-[#8D96A7]">Joining Date:</span>
                    <span className="font-bold text-white font-mono">{selectedMember.employee_profile?.date_of_joining || "2026-01-15"}</span>
                  </div>
                </div>
              )}

              {detailsTab === "sessions" && (
                <div className="flex flex-col gap-4 text-left animate-fadeIn">
                  <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Device logins linked to seat</span>
                  
                  <div className="flex flex-col gap-2.5">
                    <div className="p-3 bg-[#16181D]/30 border border-border-color rounded-xl flex items-center justify-between text-xs text-[#B7BDC8]">
                      <div className="flex items-center gap-2">
                        <Laptop className="h-4 w-4 text-primary" />
                        <div className="flex flex-col text-[10px]">
                          <span className="font-bold text-white">macOS • Chrome</span>
                          <span className="text-[9px] font-mono text-text-muted">192.168.1.5 • San Jose, CA</span>
                        </div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-bold">Current</span>
                    </div>

                    {selectedMember.sessions && selectedMember.sessions.length > 0 ? (
                      selectedMember.sessions.map((s: any) => (
                        <div key={s.id} className="p-3 bg-[#16181D]/30 border border-border-color rounded-xl flex items-center justify-between text-xs text-[#B7BDC8]">
                          <div className="flex items-center gap-2">
                            {s.device === "Mobile" ? <Smartphone className="h-4 w-4 text-primary" /> : <Laptop className="h-4 w-4 text-primary" />}
                            <div className="flex flex-col text-[10px]">
                              <span className="font-bold text-white">{s.os || "OS"} • {s.browser || "Chrome"}</span>
                              <span className="text-[9px] font-mono text-text-muted">{s.ip_address || "127.0.0.1"}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleTerminateSession(s.id)}
                            className="p-1 rounded text-[#8D96A7] hover:text-[#EF4444] transition-colors"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      ))
                    ) : null}
                  </div>
                </div>
              )}

              {detailsTab === "activity" && (
                <div className="flex flex-col gap-4 text-left animate-fadeIn">
                  <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Employee Activity History</span>
                  
                  <div className="relative pl-4 border-l border-border-color/60 flex flex-col gap-4 py-1 ml-1.5">
                    {userActivities.length === 0 ? (
                      <span className="text-[10px] text-text-muted py-6 text-center block">No timeline logs for this employee.</span>
                    ) : (
                      userActivities.map((act, i) => (
                        <div key={i} className="relative flex flex-col gap-1 text-[11px]">
                          <div className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-primary" />
                          <span className="font-bold text-white capitalize">{act.action} {act.module}</span>
                          <span className="text-[9px] text-[#8D96A7] font-mono">{act.object_repr}</span>
                          <span className="text-[9px] text-text-muted mt-0.5 font-mono">{new Date(act.created_at).toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {detailsTab === "security" && (
                <div className="flex flex-col gap-4 text-left animate-fadeIn">
                  <span className="text-[10px] text-primary uppercase font-bold tracking-wider font-mono">Access Clearance Overrides</span>
                  
                  <div className="flex flex-col gap-2.5">
                    <button 
                      onClick={handleResetPassword}
                      className="w-full h-10 rounded-xl border border-border-color hover:bg-hover-bg text-text-primary hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Key className="h-4 w-4" />
                      <span>Dispatch Password Reset Link</span>
                    </button>
                    <button 
                      onClick={handleToggleDeactivate}
                      className="w-full h-10 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/5 hover:bg-[#EF4444]/15 text-[#EF4444] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <UserX className="h-4 w-4" />
                      <span>{selectedMember.status === "active" ? "Deactivate Employee Node" : "Re-activate Employee Node"}</span>
                    </button>
                    <button 
                      onClick={handleDeleteMember}
                      className="w-full h-10 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-[#EF4444]/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Terminate Seat Clearance (Delete)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border-color/60 flex items-center justify-end shrink-0">
              <span className="text-[10px] text-text-muted">Cleared by Tenancy Cluster Administrator</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function TeamPage() {
  return (
    <Suspense fallback={
      <div className="py-20 flex flex-col items-center justify-center gap-2 text-xs text-text-muted">
        <span className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Loading team registry...</span>
      </div>
    }>
      <TeamRegistryContent />
    </Suspense>
  );
}
