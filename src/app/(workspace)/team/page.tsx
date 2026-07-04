"use client";
import React, { useState } from "react";
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

interface Member {
  id: number;
  name: string;
  email: string;
  role: "Workspace Owner" | "Billing Admin" | "Developer seat";
  department: string;
  joinedDate: string;
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: "John Doe", email: "john@anthopi.io", role: "Workspace Owner", department: "Operations", joinedDate: "2026-06-01" },
    { id: 2, name: "Alice Smith", email: "alice@anthopi.io", role: "Billing Admin", department: "Finance", joinedDate: "2026-06-15" },
    { id: 3, name: "Bob Johnson", email: "bob@anthopi.io", role: "Developer seat", department: "Engineering", joinedDate: "2026-07-02" },
  ]);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"Developer seat" | "Billing Admin">("Developer seat");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;

    const newMember: Member = {
      id: Date.now(),
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      department: inviteRole === "Developer seat" ? "Engineering" : "Finance",
      joinedDate: new Date().toISOString().split("T")[0],
    };

    setMembers([...members, newMember]);
    setInviteEmail("");
    setInviteName("");
    setIsInviteOpen(false);
  };

  const handleRemove = (id: number) => {
    if (confirm("Are you sure you want to remove this member seat?")) {
      setMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-color/60 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Team Management</h1>
          <p className="text-xs text-[#8D96A7] mt-1">Manage seat invitations, role clearances, and organizational permissions access.</p>
        </div>
        <button
          onClick={() => setIsInviteOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/10 self-start md:self-auto transition-all"
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

      {/* Invite Member dialog form overlay modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form 
            onSubmit={handleInvite} 
            className="bg-[#20242C] w-full max-w-md rounded-modal border border-border-color shadow-2xl p-6 flex flex-col gap-4 animate-fadeIn"
          >
            <div className="flex items-center justify-between border-b border-border-color/60 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Invite Member Seat</span>
              <button type="button" onClick={() => setIsInviteOpen(false)} className="text-[10px] text-[#8D96A7] hover:text-white">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Richard Hendricks"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. richard@piedpiper.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider">Workspace Role Tier</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="h-10 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-white focus:outline-none focus:border-primary"
              >
                <option value="Developer seat">Developer seat</option>
                <option value="Billing Admin">Billing Admin</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-primary text-white font-semibold text-xs transition-colors hover:bg-primary-hover shadow-lg shadow-primary/10 mt-2"
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
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-[#16181D]/30 transition-colors">
                  <td className="py-4 pl-2 text-left">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-white">{member.name}</span>
                      <span className="text-[10px] text-[#8D96A7]">{member.email}</span>
                    </div>
                  </td>
                  <td className="py-4 font-semibold text-white">
                    <span className="inline-flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5 text-primary" />
                      {member.role}
                    </span>
                  </td>
                  <td className="py-4 text-[#B7BDC8]">{member.department}</td>
                  <td className="py-4 text-[#B7BDC8] font-mono">{member.joinedDate}</td>
                  <td className="py-4 text-right pr-2">
                    {member.role !== "Workspace Owner" ? (
                      <button
                        onClick={() => handleRemove(member.id)}
                        className="p-1.5 rounded hover:bg-hover-bg text-[#8D96A7] hover:text-[#EF4444]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-[9px] text-[#8D96A7] font-bold">Immutable</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
