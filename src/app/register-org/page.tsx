"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Building2, 
  User, 
  Phone, 
  Key, 
  Mail, 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Sun,
  Moon,
  ShieldCheck,
  Briefcase,
  AlertTriangle
} from "lucide-react";
import { SynapseLogo } from "@/components/common/logo";
import { apiClient } from "@/lib/api-client";

export default function RegisterOrgPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Step 1: Org Information
  const [orgName, setOrgName] = useState("Acme Corporation");
  const [industry, setIndustry] = useState("Technology");
  const [companySize, setCompanySize] = useState("11-50");
  const [country, setCountry] = useState("United States");
  const [timezone, setTimezone] = useState("UTC");
  const [language, setLanguage] = useState("en");

  // Step 2: Admin Information
  const [fullName, setFullName] = useState("Alex Mercer");
  const [email, setEmail] = useState("admin@acme.com");
  const [phone, setPhone] = useState("+1234567890");
  const [password, setPassword] = useState("SecurePassword123");
  const [confirmPassword, setConfirmPassword] = useState("SecurePassword123");

  // Step 3: Deployment & Loader states
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadStatus, setLoadStatus] = useState("Preparing server clusters...");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load theme settings
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

  // Automated timezone deduction
  useEffect(() => {
    try {
      const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (systemTimezone) setTimezone(systemTimezone);
    } catch (e) {
      console.warn("Timezone auto-fetch not supported.");
    }
  }, []);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!orgName.trim()) {
        setErrorMsg("Organization name is required.");
        return;
      }
      setErrorMsg(null);
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    setStep(3);
    setLoadProgress(10);
    setLoadStatus("Provisioning virtual operator cluster nodes...");

    try {
      // Phase 1: Register Admin operator
      setLoadStatus("Registering super administrator credentials...");
      setLoadProgress(25);
      const username = email.split("@")[0] + "_" + Math.floor(Math.random() * 100);
      await apiClient.auth.register({
        email,
        password,
        full_name: fullName,
        phone,
        username
      });

      // Phase 2: Log in to save session
      setLoadStatus("Establishing secure auth handshake...");
      setLoadProgress(45);
      const loginRes = await apiClient.auth.login({ email, password });
      localStorage.setItem("access_token", loginRes.data.access);
      localStorage.setItem("refresh_token", loginRes.data.refresh);
      localStorage.setItem("user", JSON.stringify(loginRes.data.user));

      // Phase 3: Create Organization
      setLoadStatus(`Provisioning tenant catalog: ${orgName}...`);
      setLoadProgress(65);
      const orgRes = await apiClient.orgs.createOrganization({
        name: orgName,
        email,
        industry,
        timezone,
        language
      });
      const orgId = orgRes.data.id;

      // Phase 4: Link Admin profiles
      setLoadStatus("Attaching administrative clearance policies...");
      setLoadProgress(80);
      await apiClient.users.updateProfile({ organization: orgId });

      // Phase 5: Fetch fresh profile details
      setLoadStatus("Synchronizing workspace node keys...");
      setLoadProgress(95);
      const profileRes = await apiClient.users.getProfile();
      localStorage.setItem("user", JSON.stringify(profileRes.data));

      setLoadProgress(100);
      setLoadStatus("Cluster workspace created successfully!");
      setSuccess(true);

      // Brief delay before launching dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);

    } catch (err: any) {
      if (!err.isApiError) {
        console.error(err);
      } else {
        console.warn("Registration failed:", err.message);
      }
      setErrorMsg(err?.message || "An error occurred during cluster provision.");
      setIsLoading(false);
      // Revert back to form input so user can fix credentials
      setStep(2);
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
        {/* Logo Branding */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-2">
            <SynapseLogo size="lg" />
          </div>
          <h1 className="text-base font-extrabold tracking-widest text-text-primary uppercase">Synapse OS</h1>
          <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider">Tenant Provision Wizard</p>
        </div>

        {/* Wizard Progress Stepper */}
        {step < 3 && (
          <div className="flex items-center justify-center gap-4 bg-sidebar-bg border border-border-color/80 p-2.5 rounded-xl">
            <div className="flex items-center gap-2">
              <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 1 ? "bg-primary text-white" : "bg-[#16181D] text-text-muted border border-border-color"}`}>1</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${step === 1 ? "text-text-primary" : "text-text-muted"}`}>Organization</span>
            </div>
            <ChevronRight className="h-3 w-3 text-text-muted" />
            <div className="flex items-center gap-2">
              <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 2 ? "bg-primary text-white" : "bg-[#16181D] text-text-muted border border-border-color"}`}>2</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${step === 2 ? "text-text-primary" : "text-text-muted"}`}>Administrator</span>
            </div>
          </div>
        )}

        {/* Wizard Body Card */}
        <div className="bg-card-bg border border-border-color rounded-[24px] p-6 md:p-8 shadow-2xl relative">
          
          {errorMsg && step < 3 && (
            <div className="mb-4 p-3 text-[11px] rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/5 text-[#EF4444] font-medium text-left flex items-start gap-2 animate-fadeIn">
              <AlertTriangle className="h-4 w-4 text-[#EF4444] flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: ORGANIZATION INFORMATION */}
          {step === 1 && (
            <form onSubmit={handleNext} className="flex flex-col gap-4 text-left">
              <div>
                <h2 className="text-sm font-bold text-text-primary">Company Profile</h2>
                <p className="text-[10px] text-text-muted mt-0.5">Define your organizational details to configure cluster spaces.</p>
              </div>

              {/* Org Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Organization Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Acme Corporation"
                    className="w-full h-11 pl-10 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Industry & Size */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Industry</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                      <Briefcase className="h-4 w-4" />
                    </span>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full h-11 pl-9 pr-2 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Company Size</label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full h-11 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="1-10">1-10 Employees</option>
                    <option value="11-50">11-50 Employees</option>
                    <option value="51-200">51-200 Employees</option>
                    <option value="201-500">201-500 Employees</option>
                    <option value="500+">500+ Employees</option>
                  </select>
                </div>
              </div>

              {/* Localization Country / Language */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. United States"
                    className="w-full h-11 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full h-11 px-3 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="en">English (en)</option>
                    <option value="es">Español (es)</option>
                    <option value="de">Deutsch (de)</option>
                    <option value="fr">Français (fr)</option>
                  </select>
                </div>
              </div>

              {/* Timezone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Cluster Timezone</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                    <Globe className="h-4 w-4" />
                  </span>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full h-11 pl-10 pr-2 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="UTC">UTC (GMT+00:00)</option>
                    <option value="America/New_York">America/New_York (EST/EDT)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                    <option value="Europe/London">Europe/London (BST/GMT)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-xs tracking-wide transition-all mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Continue to Step 2</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* STEP 2: ADMINISTRATOR SETUP */}
          {step === 2 && (
            <form onSubmit={handleProvision} className="flex flex-col gap-4 text-left">
              <div>
                <h2 className="text-sm font-bold text-text-primary">Super Administrator</h2>
                <p className="text-[10px] text-text-muted mt-0.5">Establish your root credentials profile to manage the workspace node.</p>
              </div>

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Richard Hendricks"
                    className="w-full h-11 pl-10 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@acme.com"
                      className="w-full h-11 pl-10 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+15550199"
                      className="w-full h-11 pl-10 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Secret Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                      <Key className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 pl-10 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                      <Key className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 pl-10 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Nav triggers */}
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 h-11 rounded-xl border border-border-color hover:bg-hover-bg text-text-primary font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="flex-[2] h-11 rounded-xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/15 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 fill-current" />
                  <span>Create Organization</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: PROVISIONING CLUSTER & SUCCESS PROGRESS */}
          {step === 3 && (
            <div className="flex flex-col items-center gap-5 text-center py-6 select-none animate-fadeIn">
              {success ? (
                <>
                  <CheckCircle2 className="h-14 w-14 text-[#22C55E]" />
                  <div>
                    <h2 className="text-base font-bold text-text-primary">Organization Created Successfully!</h2>
                    <p className="text-[11px] text-text-muted mt-1 bg-[#22C55E]/5 border border-[#22C55E]/10 p-2.5 rounded-xl text-left max-w-xs leading-relaxed mx-auto">
                      Verification link dispatched. Confirm access to finalize root seat clearances. Redirecting to console dashboard...
                    </p>
                  </div>
                  <span className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mt-2" />
                </>
              ) : (
                <>
                  <div className="mb-1">
                    <SynapseLogo size="lg" className="animate-bounce" />
                  </div>
                  
                  <div className="flex flex-col gap-1 w-full">
                    <h3 className="text-xs uppercase font-extrabold tracking-widest text-primary">Provisioning Cluster Node</h3>
                    <span className="text-lg font-black text-text-primary font-mono mt-1">
                      {loadProgress}%
                    </span>
                  </div>

                  <div className="h-1.5 w-48 bg-[#16181D] border border-border-color rounded-full overflow-hidden shadow-inner">
                    <div 
                      style={{ width: `${loadProgress}%` }}
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-150 ease-out" 
                    />
                  </div>

                  <p className="text-[10px] text-text-secondary leading-relaxed bg-[#16181D]/30 border border-border-color/60 px-3 py-2 rounded-xl w-full max-w-xs truncate font-mono">
                    {loadStatus}
                  </p>
                </>
              )}
            </div>
          )}

        </div>

        {/* Bottom footnotes */}
        <div className="text-center text-[10px] text-text-muted flex items-center justify-between px-2">
          <span>Enterprise Secure v1.0 • TLS Synced</span>
          <Link href="/login" className="hover:text-text-primary transition-colors text-primary font-bold">
            Sign In Instead
          </Link>
        </div>
      </div>
    </main>
  );
}
