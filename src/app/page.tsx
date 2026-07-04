"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Bot, 
  Sparkles, 
  Key, 
  Mail, 
  ShieldCheck, 
  ArrowRight,
  Zap,
  CheckCircle2,
  Database,
  Activity,
  User,
  GitBranch,
  Terminal,
  Play,
  Cpu,
  Globe,
  Sun,
  Moon,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SynapseLogo } from "@/components/common/logo";

// Preset configurations for the interactive left pane pipeline simulator
const PIPELINE_PRESETS = {
  dev: [
    { label: "Git Push Commit", type: "trigger", desc: "repo: synapse-ui", icon: <GitBranch className="h-4 w-4" /> },
    { label: "AI Agent Audit", type: "ai", desc: "Model: DevAgent v2.4", icon: <Bot className="h-4 w-4" /> },
    { label: "Compiler Test", type: "action", desc: "npm run build (Success)", icon: <Terminal className="h-4 w-4" /> }
  ],
  crm: [
    { label: "Webhook Inbound", type: "trigger", desc: "POST /v1/leads", icon: <Activity className="h-4 w-4" /> },
    { label: "AI Lead Classifier", type: "ai", desc: "Model: InsightAgent v3.0", icon: <Bot className="h-4 w-4" /> },
    { label: "Slack Alert Dispatch", type: "action", desc: "Channel: #sales-alerts", icon: <Zap className="h-4 w-4" /> }
  ],
  crawler: [
    { label: "Cron Trigger", type: "trigger", desc: "Interval: */30 * * * *", icon: <Zap className="h-4 w-4" /> },
    { label: "PubMed Scraper", type: "ai", desc: "Model: ResearchAgent v1.8", icon: <Bot className="h-4 w-4" /> },
    { label: "Vector DB Ingestion", type: "action", desc: "Database: Pinecone", icon: <Database className="h-4 w-4" /> }
  ]
};

export default function AuthPage() {
  const router = useRouter();
  
  // Auth flow states
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("admin@synapse.io");
  const [org, setOrg] = useState("Acme Corporation");
  const [fullName, setFullName] = useState("John Doe");
  const [password, setPassword] = useState("••••••••••••");
  
  // Theme state
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  // Global loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadStatus, setLoadStatus] = useState("Initializing workspace node...");

  // Left banner interactive states
  const [runsCount, setRunsCount] = useState(14842);
  const [presetKey, setPresetKey] = useState<"dev" | "crm" | "crawler">("dev");
  const [simulatorStatus, setSimulatorStatus] = useState<"idle" | "running" | "success">("idle");
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "System: Standing by. Select a pipeline preset to test triggers."
  ]);

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

  // Toggle theme utility
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

  // Increment runs dynamically to show live interaction
  useEffect(() => {
    const interval = setInterval(() => {
      setRunsCount((prev) => prev + (Math.random() > 0.4 ? 1 : 0));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Preset switch
  const handlePresetSwitch = (key: "dev" | "crm" | "crawler") => {
    setPresetKey(key);
    setSimulatorStatus("idle");
    setConsoleLogs([
      `System: Switched template to ${key.toUpperCase()} pipeline preset.`,
      "System: Click 'Test Run Trigger' to simulate node executions."
    ]);
  };

  // Run pipeline simulator demo
  const triggerSimulatorDemo = () => {
    if (simulatorStatus === "running") return;
    setSimulatorStatus("running");
    setConsoleLogs([`[TEST TRIGGER] Mounting pipeline nodes sequence for preset: ${presetKey.toUpperCase()}...`]);

    const activeNodes = PIPELINE_PRESETS[presetKey];
    let step = 0;

    const executeNextNode = () => {
      if (step < activeNodes.length) {
        const node = activeNodes[step];
        setConsoleLogs(prev => [...prev, `[NODE RUN] Activating Node: ${node.label} (${node.desc})`]);
        
        setTimeout(() => {
          setConsoleLogs(prev => [...prev, `[NODE SUCCESS] Node completed: ${node.label}`]);
          step++;
          executeNextNode();
        }, 600);
      } else {
        setSimulatorStatus("success");
        setConsoleLogs(prev => [...prev, "[PIPELINE SUCCESS] Automation loop test completed. Status: 200 OK."]);
      }
    };

    setTimeout(executeNextNode, 300);
  };

  // Handle sign in or sign up with global loader
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadProgress(0);
    setLoadStatus("Authenticating access credentials...");

    // Simulated progress loading bar ticks
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);
        setLoadProgress(100);
        setLoadStatus("Workspace synchronized. Loading dashboard...");
        
        setTimeout(() => {
          router.push("/dashboard");
        }, 300);
      } else {
        setLoadProgress(progress);
        if (progress > 80) {
          setLoadStatus("Starting active agent threads...");
        } else if (progress > 55) {
          setLoadStatus("Syncing database vector indices...");
        } else if (progress > 30) {
          setLoadStatus(`Establishing cluster target: ${org}...`);
        }
      }
    }, 120);
  };

  const activeNodes = PIPELINE_PRESETS[presetKey];

  return (
    <main className="min-h-screen bg-app-bg text-text-primary flex flex-col md:flex-row relative overflow-hidden transition-colors duration-200">
      
      {/* Floating Theme Toggler (Top-Right) */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-border-color bg-card-bg hover:bg-hover-bg text-text-muted hover:text-text-primary transition-all duration-200 shadow-sm"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>
      </div>

      {/* 1. Left Side: Immersive Brand Showcase & Interactive Banner */}
      <section className="hidden md:flex flex-col justify-between w-[50%] lg:w-[55%] p-10 bg-sidebar-bg border-r border-border-color relative overflow-hidden h-screen select-none">
        {/* Abstract grids & moving glow blur backgrounds */}
        <div className="absolute inset-0 bg-workspace-grid opacity-[0.25] pointer-events-none" />
        <div className="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />

        {/* Top Header branding */}
        <div className="flex items-center gap-2.5 relative z-10">
          <SynapseLogo size="sm" />
          <span className="font-bold text-[11px] uppercase tracking-widest text-text-primary">
            Synapse OS Workspace
          </span>
        </div>

        {/* Immersive 3D Perspective Floating Dashboard Mockup */}
        <div className="relative flex flex-col items-center justify-center my-auto z-10 w-full">
          <div 
            style={{ 
              perspective: "1200px",
              transformStyle: "preserve-3d"
            }}
            className="w-full max-w-md"
          >
            <div 
              style={{
                transform: "rotateY(16deg) rotateX(12deg)",
                transformStyle: "preserve-3d"
              }}
              className="bg-card-bg border border-border-color/80 rounded-[24px] p-6 shadow-2xl relative transition-transform duration-500 hover:transform-none cursor-help group"
            >
              <div className="absolute inset-0 bg-radial-gradient opacity-[0.4] rounded-[24px] pointer-events-none" />
              
              <div className="flex flex-col gap-4 relative z-10">
                <div className="flex items-center justify-between border-b border-border-color pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
                    <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">
                      Live Command Terminal
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-text-muted">acme_cluster_status</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-border-color/60 bg-[#16181D]/30 flex flex-col gap-1 text-left">
                    <span className="text-[8px] text-text-muted uppercase font-bold tracking-wider">Completed Runs</span>
                    <span className="text-sm font-bold text-text-primary font-mono">{runsCount}</span>
                  </div>
                  <div className="p-3 rounded-xl border border-border-color/60 bg-[#16181D]/30 flex flex-col gap-1 text-left">
                    <span className="text-[8px] text-text-muted uppercase font-bold tracking-wider">Active Workers</span>
                    <span className="text-sm font-bold text-primary flex items-center gap-1">
                      <Cpu className="h-3.5 w-3.5" />
                      <span>3 Active</span>
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-border-color/60 bg-[#16181D]/20 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] text-text-muted uppercase font-bold tracking-wider">Daily System Health</span>
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <svg className="w-full h-12" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <path d="M0 35 Q 25 15, 50 25 T 100 5 L 100 40 L 0 40 Z" fill="rgba(47, 129, 247, 0.08)" />
                    <path d="M0 35 Q 25 15, 50 25 T 100 5" fill="none" stroke="var(--primary)" strokeWidth="1.5" />
                  </svg>
                </div>

                <div className="p-3 rounded-xl bg-black/80 border border-border-color/80 font-mono text-[9px] h-20 overflow-y-auto flex flex-col gap-0.5 text-left scrollbar-thin">
                  {consoleLogs.map((log, idx) => (
                    <div key={idx} className="truncate text-text-secondary">
                      <span className="text-text-muted mr-1.5">&gt;</span>
                      {log}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={triggerSimulatorDemo}
                  disabled={simulatorStatus === "running"}
                  className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-[10px] font-bold tracking-wide transition-all shadow-md shadow-primary/10 disabled:opacity-50"
                >
                  {simulatorStatus === "running" ? "Executing pipeline nodes..." : "Simulate Workspace Node Trigger"}
                </button>
              </div>
            </div>
          </div>
          
          <p className="text-[10px] text-text-muted mt-8 max-w-sm text-center leading-relaxed">
            Hover over the command terminal mockup to inspect coordinate depths. Toggle simulations to verify connection triggers instantly.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[9px] text-text-muted border-t border-border-color/40 pt-4 relative z-10">
          <span>Enterprise Secure v1.0</span>
          <div className="flex gap-3">
            <a href="#" className="hover:text-text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-text-primary transition-colors">Terms</a>
          </div>
        </div>
      </section>

      {/* 2. Right Side: Authentication Form Panel */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-8 bg-app-bg relative h-screen">
        <div className="absolute inset-0 bg-workspace-grid opacity-[0.1] md:hidden pointer-events-none" />

        <div className="w-full max-w-sm flex flex-col gap-6 relative z-10">
          
          {/* Branding (Mobile only) */}
          <div className="md:hidden flex flex-col items-center text-center">
            <div className="mb-2">
              <SynapseLogo size="md" />
            </div>
            <h1 className="text-sm font-bold text-text-primary">Synapse OS</h1>
            <p className="text-[10px] text-text-muted mt-1">AI Automation Workspace</p>
          </div>

          {/* Form Tabs */}
          <div className="flex bg-[#16181D]/30 border border-border-color p-1 rounded-xl">
            <button
              onClick={() => setAuthMode("signin")}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                authMode === "signin"
                  ? "bg-primary text-white shadow-md"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode("signup")}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                authMode === "signup"
                  ? "bg-primary text-white shadow-md"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              Create Account
            </button>
          </div>

          {/* Authentication Input Card */}
          <div className="bg-card-bg border border-border-color rounded-[24px] p-6 md:p-8 shadow-2xl">
            <h2 className="text-sm font-bold text-text-primary mb-1 text-left">
              {authMode === "signin" ? "Workspace Access Portal" : "Provision New Cluster Workspace"}
            </h2>
            <p className="text-[10px] text-text-muted mb-6 text-left">
              Enter details below to synchronize cluster database connections.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Full Name for Signup */}
              {authMode === "signup" && (
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">
                    Admin Name
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
              )}

              {/* Workspace Org Name */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">
                  Organization / Cluster
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 text-xs rounded-xl border border-border-color bg-[#16181D] text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">
                    Secret Key
                  </label>
                  {authMode === "signin" && (
                    <a href="#" className="text-[9px] text-primary hover:underline font-semibold">Forgot Key?</a>
                  )}
                </div>
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
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-xs tracking-wide transition-all duration-200 shadow-lg shadow-primary/10 hover:shadow-primary/25 mt-2 flex items-center justify-center gap-2"
              >
                <Sparkles className="h-3.5 w-3.5 fill-current text-white-force" />
                <span className="text-white-force">
                  {authMode === "signin" ? "Synchronize Cluster Node" : "Provision Cluster"}
                </span>
              </button>
            </form>
          </div>

          {/* Secure footnotes */}
          <div className="text-center text-[10px] text-text-muted flex items-center justify-between px-2">
            <span>Cluster Status: Healthy</span>
            <a href="#" className="hover:text-text-primary transition-colors text-primary font-bold">API Logs</a>
          </div>

        </div>
      </section>

      {/* 3. Global Fullscreen Boot-up Loader Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[300] bg-app-bg flex flex-col items-center justify-center animate-fadeIn select-none">
          <div className="absolute inset-0 bg-workspace-grid opacity-[0.25] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col items-center gap-4 text-center z-10">
            {/* Pulsing branding icon */}
            <div className="mb-2">
              <SynapseLogo size="lg" className="animate-bounce" />
            </div>
            
            <div className="flex flex-col gap-1 mt-2">
              <h3 className="text-sm font-bold text-text-primary tracking-wide">
                Initializing Workspace Node...
              </h3>
              <span className="text-[10px] text-primary font-mono font-bold uppercase tracking-wider animate-pulse">
                {loadProgress}% complete
              </span>
            </div>

            <p className="text-[10px] text-text-muted max-w-xs leading-relaxed mt-1">
              {loadStatus}
            </p>

            {/* Custom progress loading bar */}
            <div className="h-1.5 w-48 bg-[#16181D] border border-border-color rounded-full overflow-hidden mt-3 shadow-inner">
              <div 
                style={{ width: `${loadProgress}%` }}
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-150 ease-out" 
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
