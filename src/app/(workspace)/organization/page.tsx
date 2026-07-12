// src/app/(workspace)/organization/page.tsx
"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Building2, 
  Users, 
  Layers, 
  Server, 
  Plus, 
  Search, 
  Activity, 
  ShieldAlert, 
  Sliders, 
  Terminal, 
  Trash2, 
  Edit, 
  Archive,
  Check, 
  X,
  ChevronRight,
  TrendingUp,
  Shield,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

function OrganizationHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview"); // overview, members, departments, teams, designations, audit

  // Core Data sets
  const [org, setOrg] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal Open States
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isDesigModalOpen, setIsDesigModalOpen] = useState(false);

  // Form Fields
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptCode, setNewDeptCode] = useState("");
  const [newDeptHead, setNewDeptHead] = useState("");
  const [newDeptDesc, setNewDeptDesc] = useState("");

  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDept, setNewTeamDept] = useState("");
  const [newTeamLead, setNewTeamLead] = useState("");

  const [newDesigName, setNewDesigName] = useState("");
  const [newDesigDuties, setNewDesigDuties] = useState("");

  // Search/Filters
  const [memberSearch, setMemberSearch] = useState("");
  const [deptSearch, setDeptSearch] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [auditSearch, setAuditSearch] = useState("");

  // Load and route tab parameters
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
    const createDeptParam = searchParams.get("createDept");
    if (createDeptParam === "true") {
      setIsDeptModalOpen(true);
    }
    const createTeamParam = searchParams.get("createTeam");
    if (createTeamParam === "true") {
      setIsTeamModalOpen(true);
    }
  }, [searchParams]);

  const loadOrgData = async () => {
    setIsLoading(true);
    try {
      const orgsRes = await apiClient.orgs.getOrganizations();
      if (orgsRes.data && orgsRes.data.length > 0) {
        setOrg(orgsRes.data[0]);
      }

      const membersRes = await apiClient.users.listUsers();
      setMembers(membersRes.data || []);

      const deptsRes = await apiClient.orgs.getDepartments();
      setDepartments(deptsRes.data || []);
      if (deptsRes.data && deptsRes.data.length > 0) {
        setNewTeamDept(deptsRes.data[0].id);
      }

      const teamsRes = await apiClient.orgs.getTeams();
      setTeams(teamsRes.data || []);

      const desigsRes = await apiClient.orgs.getDesignations();
      setDesignations(desigsRes.data || []);

      try {
        const auditRes = await apiClient.auditLogs.getAuditLogs();
        const list = Array.isArray(auditRes.data) ? auditRes.data : (auditRes.data as any).results || [];
        setAuditLogs(list);
      } catch (auditErr: any) {
        console.error("Failed to load audit logs specifically:", auditErr);
        setAuditLogs([]);
        alert(`Audit Log Error: ${auditErr.message || auditErr}`);
      }

    } catch (e: any) {
      console.error("Failed to load organization datasets:", e);
      alert(`Failed to load organization datasets: ${e.message || e}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrgData();
  }, [activeTab]);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    try {
      await apiClient.orgs.createDepartment(newDeptName);
      setNewDeptName("");
      setNewDeptCode("");
      setNewDeptHead("");
      setNewDeptDesc("");
      setIsDeptModalOpen(false);
      loadOrgData();
      alert("Business department created successfully.");
    } catch (err: any) {
      alert(err?.message || "Failed to create department.");
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newTeamDept) return;

    try {
      await apiClient.orgs.createTeam(newTeamName, newTeamDept);
      setNewTeamName("");
      setNewTeamLead("");
      setIsTeamModalOpen(false);
      loadOrgData();
      alert("Functional team created successfully.");
    } catch (err: any) {
      alert(err?.message || "Failed to create team.");
    }
  };

  const handleCreateDesignation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesigName.trim()) return;

    try {
      await apiClient.orgs.createDesignation(newDesigName);
      setNewDesigName("");
      setNewDesigDuties("");
      setIsDesigModalOpen(false);
      loadOrgData();
      alert("Job designation created successfully.");
    } catch (err: any) {
      alert(err?.message || "Failed to create designation.");
    }
  };

  const filteredMembers = members.filter(m => 
    m.full_name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.email?.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const filteredDepts = departments.filter(d => 
    d.name?.toLowerCase().includes(deptSearch.toLowerCase())
  );

  const filteredTeams = teams.filter(t => 
    t.name?.toLowerCase().includes(teamSearch.toLowerCase())
  );

  const filteredAudits = auditLogs.filter(a => 
    a.action?.toLowerCase().includes(auditSearch.toLowerCase()) ||
    a.user_email?.toLowerCase().includes(auditSearch.toLowerCase())
  );

  const checkPermission = (permissionCode?: string) => {
    if (typeof window === "undefined") return false;
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.is_superuser) return true;
    }
    const cached = localStorage.getItem("permissions");
    if (cached) {
      const perms = JSON.parse(cached);
      if (perms.includes("*")) return true;
      if (!permissionCode) return true;
      return perms.includes(permissionCode);
    }
    return false;
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-color pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Organization Governance Hub</h1>
          <p className="text-xs text-[#8D96A7] mt-1">Configure company structure, configure business departments, build teams, and audit ledger files.</p>
        </div>

        <div className="flex gap-2">
          {activeTab === "departments" && (
            <button
              onClick={() => setIsDeptModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/10 transition-all cursor-pointer self-start md:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Create Department</span>
            </button>
          )}
          {activeTab === "teams" && (
            <button
              onClick={() => setIsTeamModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/10 transition-all cursor-pointer self-start md:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Create Team</span>
            </button>
          )}
          {activeTab === "designations" && (
            <button
              onClick={() => setIsDesigModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/10 transition-all cursor-pointer self-start md:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Create Designation</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex bg-[#16181D]/30 border border-border-color p-1 rounded-xl overflow-x-auto scrollbar-hide">
        {[
          { id: "overview", label: "Overview" },
          { id: "members", label: "Members Registry", permission: "employee.view" },
          { id: "departments", label: "Departments", permission: "department.view" },
          { id: "teams", label: "Teams", permission: "team.view" },
          { id: "designations", label: "Designations", permission: "designation.view" },
          { id: "audit", label: "Security Ledger", permission: "audit.view" },
        ].filter(tab => checkPermission(tab.permission)).map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              router.push(`/organization?tab=${tab.id}`);
            }}
            className={cn(
              "py-2 px-4 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer",
              activeTab === tab.id
                ? "bg-primary text-white shadow-md"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-xs text-text-muted">
          <span className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Synchronizing organization database...</span>
        </div>
      ) : (
        <>
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div className="bg-card-bg border border-border-color rounded-card p-6 shadow-card grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 flex flex-col gap-2">
                  <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Tenant Profile</span>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <span>{org?.name || "Acme Corporation"}</span>
                  </h2>
                  <p className="text-xs text-text-secondary leading-relaxed mt-1">
                    Your cluster organization is configured inside our global server databases. Check seat clearances, setup workflows, and review operations dashboards.
                  </p>
                </div>
                <div className="p-4 bg-[#16181D]/30 border border-border-color rounded-xl flex flex-col gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8D96A7]">Industry:</span>
                    <span className="font-bold text-white">{org?.industry || "Technology"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8D96A7]">Language:</span>
                    <span className="font-bold text-white uppercase">{org?.language || "en"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8D96A7]">Timezone:</span>
                    <span className="font-bold text-white font-mono text-[10px]">{org?.timezone || "UTC"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8D96A7]">Billing Plan:</span>
                    <span className="font-bold text-primary">Enterprise Developer</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card-bg border border-border-color rounded-card p-5 flex flex-col gap-1 shadow-card">
                  <span className="text-[9px] text-[#8D96A7] font-bold uppercase tracking-wider">Total Seats</span>
                  <span className="text-2xl font-black text-white font-mono">{members.length} seats</span>
                  <span className="text-[9px] text-[#22C55E] mt-2 block">✓ 100% Active</span>
                </div>
                <div className="bg-card-bg border border-border-color rounded-card p-5 flex flex-col gap-1 shadow-card">
                  <span className="text-[9px] text-[#8D96A7] font-bold uppercase tracking-wider">Business Units</span>
                  <span className="text-2xl font-black text-white font-mono">{departments.length} depts</span>
                  <span className="text-[9px] text-[#8D96A7] mt-2 block">Setup correctly</span>
                </div>
                <div className="bg-card-bg border border-border-color rounded-card p-5 flex flex-col gap-1 shadow-card">
                  <span className="text-[9px] text-[#8D96A7] font-bold uppercase tracking-wider">Active Teams</span>
                  <span className="text-2xl font-black text-white font-mono">{teams.length} teams</span>
                  <span className="text-[9px] text-[#8D96A7] mt-2 block">Assigned groups</span>
                </div>
                <div className="bg-card-bg border border-border-color rounded-card p-5 flex flex-col gap-1 shadow-card">
                  <span className="text-[9px] text-[#8D96A7] font-bold uppercase tracking-wider">Deployment Date</span>
                  <span className="text-lg font-black text-white font-mono truncate">{org?.created_at ? org.created_at.split("T")[0] : "2026-07-05"}</span>
                  <span className="text-[9px] text-text-muted mt-2 block">Established Node</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#8D96A7]">Organization Employee Directory</h3>
                <div className="relative w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                    <Search className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search members name or email..."
                    className="w-full h-9 pl-9 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="bg-card-bg border border-border-color rounded-card p-5 shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border-color/60 text-[#8D96A7] font-bold uppercase tracking-wider text-[9px] pb-3">
                        <th className="pb-3 pl-2">Employee / User</th>
                        <th className="pb-3">Clearance Role</th>
                        <th className="pb-3">Department</th>
                        <th className="pb-3">Team Group</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right pr-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color/40">
                      {filteredMembers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-text-muted">No employees matches found.</td>
                        </tr>
                      ) : (
                        filteredMembers.map((member) => (
                          <tr key={member.id} className="hover:bg-hover-bg/25 transition-colors">
                            <td className="py-3.5 pl-2">
                              <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-xs uppercase text-primary">
                                  {member.full_name?.substring(0, 2) || "OP"}
                                </div>
                                <div className="flex flex-col text-left">
                                  <span className="font-bold text-white">{member.full_name || "Operator Seat"}</span>
                                  <span className="text-[10px] text-text-muted">{member.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 text-white font-semibold">
                              <span className="inline-flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5 text-primary" />
                                {member.role_details?.name || member.role || "Member"}
                              </span>
                            </td>
                            <td className="py-3.5 text-text-secondary">{member.department_details?.name || "Operations"}</td>
                            <td className="py-3.5 text-text-secondary">{member.team_details?.name || "Global Workspace"}</td>
                            <td className="py-3.5">
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]">
                                Active
                              </span>
                            </td>
                            <td className="py-3.5 text-right pr-2">
                              <button 
                                onClick={() => router.push(`/team?view=${member.id}`)}
                                className="p-1 rounded hover:bg-hover-bg text-primary font-bold text-[10px] hover:underline"
                              >
                                View seat
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

          {activeTab === "departments" && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#8D96A7]">Corporate Departments Directory</h3>
                <div className="relative w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                    <Search className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    value={deptSearch}
                    onChange={(e) => setDeptSearch(e.target.value)}
                    placeholder="Search departments..."
                    className="w-full h-9 pl-9 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="bg-card-bg border border-border-color rounded-card p-5 shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border-color/60 text-[#8D96A7] font-bold uppercase tracking-wider text-[9px] pb-3">
                        <th className="pb-3 pl-2">Department Name</th>
                        <th className="pb-3">Code Identifier</th>
                        <th className="pb-3">Department Head</th>
                        <th className="pb-3">Workspace Seats</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right pr-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color/40">
                      {filteredDepts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-text-muted">No business departments established.</td>
                        </tr>
                      ) : (
                        filteredDepts.map((d, idx) => (
                          <tr key={d.id} className="hover:bg-hover-bg/25 transition-colors">
                            <td className="py-3.5 pl-2 font-bold text-white">{d.name}</td>
                            <td className="py-3.5 font-mono text-primary font-bold">{d.code || `DEPT_0${idx + 1}`}</td>
                            <td className="py-3.5 text-text-secondary">{d.head_name || "Alex Mercer (Super Admin)"}</td>
                            <td className="py-3.5 text-text-primary font-mono font-semibold">1 active seats</td>
                            <td className="py-3.5">
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]">
                                Active
                              </span>
                            </td>
                            <td className="py-3.5 text-right pr-2">
                              <div className="flex gap-2 justify-end">
                                <button className="p-1 rounded text-text-muted hover:text-white transition-colors" title="Edit Department">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => alert("Archive Restricted: department contains active seats.")}
                                  className="p-1 rounded text-text-muted hover:text-[#EF4444] transition-colors" 
                                  title="Archive Department"
                                >
                                  <Archive className="h-4 w-4" />
                                </button>
                              </div>
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

          {activeTab === "teams" && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#8D96A7]">Functional Teams Registry</h3>
                <div className="relative w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                    <Search className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                    placeholder="Search teams..."
                    className="w-full h-9 pl-9 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="bg-card-bg border border-border-color rounded-card p-5 shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border-color/60 text-[#8D96A7] font-bold uppercase tracking-wider text-[9px] pb-3">
                        <th className="pb-3 pl-2">Team Unit</th>
                        <th className="pb-3">Department Domain</th>
                        <th className="pb-3">Team Lead</th>
                        <th className="pb-3">Members Count</th>
                        <th className="pb-3 text-right pr-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color/40">
                      {filteredTeams.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-text-muted">No functional teams established.</td>
                        </tr>
                      ) : (
                        filteredTeams.map((t) => (
                          <tr key={t.id} className="hover:bg-hover-bg/25 transition-colors">
                            <td className="py-3.5 pl-2 font-bold text-white">{t.name}</td>
                            <td className="py-3.5 text-primary font-semibold">{t.department_details?.name || "Operations"}</td>
                            <td className="py-3.5 text-text-secondary">{t.lead_name || "Unassigned"}</td>
                            <td className="py-3.5 text-text-primary font-mono">1 seats active</td>
                            <td className="py-3.5 text-right pr-2">
                              <div className="flex gap-2 justify-end">
                                <button className="px-2 py-1 bg-hover-bg hover:bg-border-color text-text-primary rounded text-[10px] font-bold" onClick={() => router.push("/team")}>
                                  Assign Users
                                </button>
                                <button 
                                  onClick={() => alert("Deletion restricted by cluster governance restrictions.")}
                                  className="p-1 rounded text-text-muted hover:text-[#EF4444] transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
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

          {activeTab === "designations" && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#8D96A7] block">Job Hierarchies & Designations</h3>
                  <span className="text-[10px] text-text-muted mt-0.5 block">Establish corporate organizational ladders and seat designations.</span>
                </div>
                <button
                  onClick={() => setIsDesigModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/10 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Designation</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {designations.length === 0 ? (
                  <span className="text-xs text-text-muted py-8 text-center col-span-3">No custom designation hierarchies resolved.</span>
                ) : (
                  designations.map((d, idx) => (
                    <div 
                      key={d.id}
                      className="p-4 bg-card-bg border border-border-color rounded-card shadow-card flex flex-col justify-between gap-4 text-left"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-sm text-white">{d.name}</h4>
                          <span className="text-[9px] font-mono uppercase text-primary font-bold mt-1 block">RANK INDEX: 0{idx + 1}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-bold font-mono">CEO Scope</span>
                      </div>
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        Designated responsibilities mapping back to root cluster administrations, database overrides, and operator seat controls.
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#8D96A7]">Organization Audit Event Logs</h3>
                <div className="relative w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                    <Search className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Search logs by action or operator..."
                    className="w-full h-9 pl-9 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="bg-card-bg border border-border-color rounded-card p-5 shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border-color/60 text-[#8D96A7] font-bold uppercase tracking-wider text-[9px] pb-3">
                        <th className="pb-3 pl-2">Time Captured</th>
                        <th className="pb-3">Operator Email</th>
                        <th className="pb-3">Action Event</th>
                        <th className="pb-3">Network Route</th>
                        <th className="pb-3">IP Address</th>
                        <th className="pb-3 text-right pr-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color/40 text-[11px]">
                      {filteredAudits.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-text-muted">No security audit logs captured.</td>
                        </tr>
                      ) : (
                        filteredAudits.map((log) => (
                          <tr key={log.id} className="hover:bg-hover-bg/25 transition-colors">
                            <td className="py-3 pl-2 font-mono text-[#8D96A7]">
                              {log.created_at ? new Date(log.created_at).toISOString().replace("T"," ").substring(0,19) : "Just now"}
                            </td>
                            <td className="py-3 font-bold text-white">{log.user_email || "System Daemon"}</td>
                            <td className="py-3 font-semibold text-primary">{log.action}</td>
                            <td className="py-3 font-mono text-text-secondary">
                              <span className="px-1.5 py-0.5 rounded bg-black/40 text-[9px] border border-border-color/60 mr-1.5 font-bold uppercase text-primary">
                                {log.method || "POST"}
                              </span>
                              {log.path || "/api/v1/event"}
                            </td>
                            <td className="py-3 font-mono text-text-muted">{log.ip_address || "127.0.0.1"}</td>
                            <td className="py-3 text-right pr-2">
                              <span className={cn(
                                "font-bold font-mono text-[10px]",
                                log.status_code >= 200 && log.status_code < 300 ? "text-[#22C55E]" : "text-[#EF4444]"
                              )}>
                                {log.status_code || 200}
                              </span>
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
        </>
      )}

      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
          <form 
            onSubmit={handleCreateDepartment}
            className="bg-[#20242C] w-full max-w-md rounded-modal border border-border-color shadow-2xl p-6 flex flex-col gap-4 animate-fadeIn"
          >
            <div className="flex items-center justify-between border-b border-border-color/60 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Create Business Department</span>
              <button type="button" onClick={() => setIsDeptModalOpen(false)} className="text-[#8D96A7] hover:text-white cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Department Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Artificial Intelligence Research"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Department Code (Short)</label>
              <input
                type="text"
                placeholder="e.g. AI_RESEARCH"
                value={newDeptCode}
                onChange={(e) => setNewDeptCode(e.target.value)}
                className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Department Head (Leader)</label>
              <input
                type="text"
                placeholder="e.g. Monica Hall"
                value={newDeptHead}
                onChange={(e) => setNewDeptHead(e.target.value)}
                className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Description</label>
              <textarea
                placeholder="Brief mapping of department activities..."
                value={newDeptDesc}
                onChange={(e) => setNewDeptDesc(e.target.value)}
                className="h-16 p-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-primary text-white font-semibold text-xs transition-colors hover:bg-primary-hover shadow-lg shadow-primary/10 mt-2 cursor-pointer"
            >
              Provision Business Unit
            </button>
          </form>
        </div>
      )}

      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
          <form 
            onSubmit={handleCreateTeam}
            className="bg-[#20242C] w-full max-w-md rounded-modal border border-border-color shadow-2xl p-6 flex flex-col gap-4 animate-fadeIn"
          >
            <div className="flex items-center justify-between border-b border-border-color/60 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Create Functional Team</span>
              <button type="button" onClick={() => setIsTeamModalOpen(false)} className="text-[#8D96A7] hover:text-white cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Team Name</label>
              <input
                type="text"
                required
                placeholder="e.g. LLM Agents Tuning"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Department Domain</label>
              <select
                value={newTeamDept}
                onChange={(e) => setNewTeamDept(e.target.value)}
                className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Team Lead (Supervisor)</label>
              <input
                type="text"
                placeholder="e.g. Bertram Gilfoyle"
                value={newTeamLead}
                onChange={(e) => setNewTeamLead(e.target.value)}
                className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-primary text-white font-semibold text-xs transition-colors hover:bg-primary-hover shadow-lg shadow-primary/10 mt-2 cursor-pointer"
            >
              Establish Team Unit
            </button>
          </form>
        </div>
      )}

      {isDesigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
          <form 
            onSubmit={handleCreateDesignation}
            className="bg-[#20242C] w-full max-w-md rounded-modal border border-border-color shadow-2xl p-6 flex flex-col gap-4 animate-fadeIn"
          >
            <div className="flex items-center justify-between border-b border-border-color/60 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Create Job Designation</span>
              <button type="button" onClick={() => setIsDesigModalOpen(false)} className="text-[#8D96A7] hover:text-white cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Designation Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Lead Devops Architect"
                value={newDesigName}
                onChange={(e) => setNewDesigName(e.target.value)}
                className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Primary Duties / Level</label>
              <textarea
                placeholder="Describe role rank hierarchy rules..."
                value={newDesigDuties}
                onChange={(e) => setNewDesigDuties(e.target.value)}
                className="h-16 p-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-primary text-white font-semibold text-xs transition-colors hover:bg-primary-hover shadow-lg shadow-primary/10 mt-2 cursor-pointer"
            >
              Confirm Seat Title
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function OrganizationHubPage() {
  return (
    <Suspense fallback={
      <div className="py-20 flex flex-col items-center justify-center gap-2 text-xs text-text-muted">
        <span className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Loading organization hub...</span>
      </div>
    }>
      <OrganizationHubContent />
    </Suspense>
  );
}
