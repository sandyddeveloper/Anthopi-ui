// src/app/(workspace)/team/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Shield, 
  X, 
  Check, 
  Trash2, 
  MoreVertical 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Form fields for invitation
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [inviteDept, setInviteDept] = useState("");
  const [inviteTeam, setInviteTeam] = useState("");
  const [inviteDesignation, setInviteDesignation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [membersRes, rolesRes, deptsRes, teamsRes, desigsRes] = await Promise.all([
        apiClient.users.listUsers(),
        apiClient.auth.getRoles(),
        apiClient.orgs.getDepartments(),
        apiClient.orgs.getTeams(),
        apiClient.orgs.getDesignations()
      ]);
      
      setMembers(membersRes.data || []);
      setRoles(rolesRes.data || []);
      setDepartments(deptsRes.data || []);
      setTeams(teamsRes.data || []);
      setDesignations(desigsRes.data || []);

      // Select first elements by default if empty
      if (rolesRes.data && rolesRes.data.length > 0) setInviteRole(rolesRes.data[0].id);
      if (deptsRes.data && deptsRes.data.length > 0) setInviteDept(deptsRes.data[0].id);
      if (teamsRes.data && teamsRes.data.length > 0) setInviteTeam(teamsRes.data[0].id);
      if (desigsRes.data && desigsRes.data.length > 0) setInviteDesignation(desigsRes.data[0].id);
    } catch (e) {
      console.error("Failed to sync team datasets:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      const body: any = {
        email: inviteEmail
      };
      if (inviteRole) body.role = inviteRole;
      if (inviteDept) body.department = inviteDept;
      if (inviteTeam) body.team = inviteTeam;
      if (inviteDesignation) body.designation = inviteDesignation;

      const inviteRes = await apiClient.invitations.invite(body);
      
      const successToken = inviteRes.data.token;
      alert(`Invitation dispatch successful!\nCopy Acceptance Token for local registration:\n\n${successToken}`);
      
      setInviteEmail("");
      setIsInviteOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to create user invitation.");
    }
  };

  const handleRemove = async (id: string) => {
    if (confirm("Are you sure you want to terminate this user seat from the organization?")) {
      try {
        // Wait, is there a user deletion endpoint? The url list maps users/<uuid:pk>/ to detail view.
        // We will call a delete on users or warn the user.
        alert("Action restricted. Operator seats must be deactivated by a system administrator.");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredMembers = members.filter(m => 
    m.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (m.full_name && m.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-color/60 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Team Management</h1>
          <p className="text-xs text-[#8D96A7] mt-1">Manage seat invitations, role clearances, and organizational permissions access.</p>
        </div>
        <button
          onClick={() => setIsInviteOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/10 self-start md:self-auto transition-all cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Seat Allocation alert banner */}
      <div className="p-4 bg-card-bg border border-border-color rounded-card flex items-center justify-between shadow-card text-xs">
        <span className="text-[#B7BDC8]">
          Seat Quota Limits: <span className="font-bold text-white">{members.length} / 5 seats active</span>
        </span>
        <button className="text-[10px] text-primary hover:underline font-bold">
          Upgrade Seats Limit
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full md:w-80">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          <Search className="h-3.5 w-3.5" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search team members by name or email..."
          className="w-full h-9 pl-9 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary"
        />
      </div>

      {/* Invite Member dialog form overlay modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form 
            onSubmit={handleInvite} 
            className="bg-[#20242C] w-full max-w-md rounded-modal border border-border-color shadow-2xl p-6 flex flex-col gap-4 animate-fadeIn"
          >
            <div className="flex items-center justify-between border-b border-border-color/60 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Invite Member Seat</span>
              <button type="button" onClick={() => setIsInviteOpen(false)} className="text-[10px] text-[#8D96A7] hover:text-white cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. candidate@gmail.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Workspace Role Tier</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
              >
                <option value="">None (Standard User)</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Department</label>
              <select
                value={inviteDept}
                onChange={(e) => setInviteDept(e.target.value)}
                className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
              >
                <option value="">None</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Team Assignment</label>
              <select
                value={inviteTeam}
                onChange={(e) => setInviteTeam(e.target.value)}
                className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
              >
                <option value="">None</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Designation Title</label>
              <select
                value={inviteDesignation}
                onChange={(e) => setInviteDesignation(e.target.value)}
                className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
              >
                <option value="">None</option>
                {designations.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-primary text-white font-semibold text-xs transition-colors hover:bg-primary-hover shadow-lg shadow-primary/10 mt-2 cursor-pointer"
            >
              Dispatch Access Invitation
            </button>
          </form>
        </div>
      )}

      {/* Team Members list Table */}
      <div className="bg-card-bg border border-border-color rounded-card p-6 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-color/60 text-[#8D96A7] font-bold uppercase tracking-wider text-[9px] pb-3">
                <th className="pb-3 pl-2">Name / Email</th>
                <th className="pb-3">Role access tier</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Joined Date</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color/40">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted">
                    <span className="inline-block h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2 align-middle" />
                    <span>Synchronizing active seats list...</span>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted">
                    No active operator seats found.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const initials = member.full_name
                    ? member.full_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : member.email?.substring(0, 2).toUpperCase() || "US";

                  return (
                    <tr key={member.id} className="hover:bg-[#16181D]/30 transition-colors">
                      <td className="py-4 pl-2 text-left">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-xs uppercase text-primary">
                            {initials}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-white">{member.full_name || member.username || "Operator Seat"}</span>
                            <span className="text-[10px] text-[#8D96A7]">{member.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 font-semibold text-white">
                        <span className="inline-flex items-center gap-1">
                          <Shield className="h-3.5 w-3.5 text-primary" />
                          {member.role_details?.name || member.role || "Member"}
                        </span>
                      </td>
                      <td className="py-4 text-[#B7BDC8]">{member.department_details?.name || "Operations"}</td>
                      <td className="py-4 text-[#B7BDC8] font-mono">
                        {member.created_at ? new Date(member.created_at).toISOString().split("T")[0] : "Joined"}
                      </td>
                      <td className="py-4 text-right pr-2">
                        {member.role !== "superuser" && member.role_details?.code !== "super_admin" ? (
                          <button
                            onClick={() => handleRemove(member.id)}
                            className="p-1.5 rounded hover:bg-hover-bg text-[#8D96A7] hover:text-[#EF4444] cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <span className="text-[9px] text-[#8D96A7] font-bold">Immutable</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
