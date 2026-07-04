// src/app/invitations/accept/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  User, 
  Key, 
  Phone, 
  Sparkles, 
  ShieldCheck, 
  Sun, 
  Moon, 
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SynapseLogo } from "@/components/common/logo";
import { apiClient } from "@/lib/api-client";

function AcceptInvitationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Setup fields
  const [token, setToken] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  
  // UI States
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Read token from URL search params
  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  // Load and apply theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemDark ? "dark" : "light");
    
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setErrorMsg("Invitation accept token is required.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await apiClient.invitations.accept({
        token,
        password,
        full_name: fullName,
        phone
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to accept the invitation. Please verify the code/token.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-app-bg text-text-primary flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-200">
      {/* Floating Theme Toggler */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-border-color bg-card-bg hover:bg-hover-bg text-text-muted hover:text-text-primary transition-all duration-200 shadow-sm cursor-pointer"
        >
          {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>
      </div>

      <div className="absolute inset-0 bg-radial-gradient opacity-[0.25] pointer-events-none" />
      <div className="absolute top-1/4 -right-1/4 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md flex flex-col gap-6 relative z-10 animate-fadeIn">
        {/* Branding header */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-3">
            <SynapseLogo size="lg" />
          </div>
          <h1 className="text-base font-extrabold tracking-widest text-text-primary uppercase">Synapse Workspace</h1>
          <p className="text-[11px] text-text-muted mt-1 uppercase tracking-wider">Candidate Onboarding Portal</p>
        </div>

        {/* Setup card */}
        <div className="bg-card-bg border border-border-color rounded-[24px] p-6 md:p-8 shadow-2xl relative">
          {success ? (
            <div className="flex flex-col items-center gap-4 text-center py-6 animate-fadeIn">
              <CheckCircle2 className="h-12 w-12 text-[#22C55E]" />
              <h2 className="text-sm font-bold text-white">Account Created Successfully</h2>
              <p className="text-[11px] text-text-muted max-w-xs leading-relaxed">
                Your workspace seat is active. Redirecting you to the workspace access portal in a few seconds...
              </p>
              <span className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mt-2" />
            </div>
          ) : (
            <div className="flex flex-col gap-5 text-left">
              <div>
                <h2 className="text-sm font-bold text-text-primary mb-1">Set Up Your Developer Profile</h2>
                <p className="text-[10px] text-text-muted">Enter details below to establish your secure node credentials.</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {errorMsg && (
                  <div className="p-3 text-[11px] rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/5 text-[#EF4444] font-medium flex gap-2 items-start">
                    <AlertTriangle className="h-4 w-4 text-[#EF4444] flex-shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Token */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">
                    Invitation Access Token
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                      placeholder="Enter invitation secure token"
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                      placeholder="e.g. Richard Hendricks"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                      placeholder="e.g. +199988877"
                    />
                  </div>
                </div>

                {/* Secret Key / Password */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">
                    Secret Passkey
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                      <Key className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-xs tracking-wide transition-all duration-200 shadow-lg shadow-primary/10 hover:shadow-primary/25 mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Synchronizing profile...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 fill-current text-white-force" />
                      <span className="text-white-force">Establish Secure Profile</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footnotes */}
        <div className="text-center text-[10px] text-text-muted">
          <span>Enterprise Secure v1.0 • TLS Synced</span>
        </div>
      </div>
    </main>
  );
}

export default function AcceptInvitationPage() {
  return (
    <React.Suspense fallback={
      <main className="min-h-screen bg-[#111113] text-white flex items-center justify-center p-6">
        <span className="h-5 w-5 border-2 border-[#2F81F7] border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <AcceptInvitationForm />
    </React.Suspense>
  );
}
