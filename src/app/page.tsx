"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Bot,
  Cpu,
  Database,
  Layers,
  Lock,
  Mail,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  Terminal,
  Zap,
  Clock,
  Play,
  Check,
  ChevronDown,
  Globe,
  Plus,
  Send,
  MessageSquare,
  Network,
  Eye,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Code,
  LineChart,
  HelpCircle,
  Menu,
  X,
  ExternalLink,
  Info,
  Server
} from "lucide-react";
import { SynapseLogo } from "@/components/common/logo";
import { SparklesCore } from "@/components/ui/sparkles";

interface LogItem {
  id: string;
  type: "think" | "tool" | "output" | "error" | "info";
  text: string;
  timestamp: string;
}

export default function LandingPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Contact Form
  const [contactForm, setContactForm] = useState({ name: "", email: "", company: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  // Simulation State Machine
  const [simPreset, setSimPreset] = useState<"webhook" | "cron">("webhook");
  const [simState, setSimState] = useState<"idle" | "trigger" | "ai" | "action" | "success">("idle");
  const [simLogs, setSimLogs] = useState<LogItem[]>([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [typingText, setTypingText] = useState("");
  const [typingCharIdx, setTypingCharIdx] = useState(0);

  // Initialize Theme
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

  const handleContactSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (contactForm.name && contactForm.email) {
      setSubmitted(true);
    }
  };

  // Define Preset logs
  const webhookLogs: LogItem[] = [
    { id: "w1", type: "info", text: "Initializing Synapse API Gateway...", timestamp: "12:00:01" },
    { id: "w2", type: "info", text: "POST webhook received on /v1/events/stripe-payment (IP: 54.187.205.12)", timestamp: "12:00:02" },
    { id: "w3", type: "think", text: "Spinning up Orchestrator Agent. Prompt: 'Evaluate payment payload. Route logic.'", timestamp: "12:00:03" },
    { id: "w4", type: "tool", text: "Running tool 'read_stripe_metadata' with transaction_id: tx_9a8B41", timestamp: "12:00:04" },
    { id: "w5", type: "output", text: "JSON Payload: { amount: 14900, status: 'succeeded', customer: 'alpha_labs' }", timestamp: "12:00:05" },
    { id: "w6", type: "think", text: "Valid payment verified. Dispatching alert and recording to PostgreSQL.", timestamp: "12:00:06" },
    { id: "w7", type: "tool", text: "Running tool 'write_db' payload: INSERT INTO billing (org, amount) VALUES ('alpha_labs', 149.00)", timestamp: "12:00:07" },
    { id: "w8", type: "output", text: "DB Update Response: { rowsAffected: 1, rowId: 5882 }", timestamp: "12:00:07" },
    { id: "w9", type: "tool", text: "Triggering Action Node: HTTP POST to Slack channel #sales-telemetry", timestamp: "12:00:08" },
    { id: "w10", type: "output", text: "Slack API responded: 200 OK (text: 'Event published')", timestamp: "12:00:08" },
    { id: "w11", type: "info", text: "Pipeline concluded successfully. Duration: 6.84s. Resource consumption: 0.04 credits.", timestamp: "12:00:09" }
  ];

  const cronLogs: LogItem[] = [
    { id: "c1", type: "info", text: "Scheduler daemon matched cron schedule '0 0 * * *' (midnight check)", timestamp: "00:00:01" },
    { id: "c2", type: "info", text: "Triggering daily intelligence snapshot worker...", timestamp: "00:00:01" },
    { id: "c3", type: "think", text: "Spinning up Analytics Agent (Claude 3.5 Sonnet context pool). Prompt: 'Compile metrics summaries.'", timestamp: "00:00:02" },
    { id: "c4", type: "tool", text: "Executing database aggregate: SELECT SUM(amount) FROM billing WHERE created_at >= NOW() - INTERVAL '1 day'", timestamp: "00:00:03" },
    { id: "c5", type: "output", text: "QueryResult: { dailyTotal: 42840.00, count: 120 }", timestamp: "00:00:04" },
    { id: "c6", type: "think", text: "Daily revenue: $42,840.00. Generating summarized report markdown block...", timestamp: "00:00:05" },
    { id: "c7", type: "tool", text: "Dispatching Action Node: Send email report to board@synapse.ai", timestamp: "00:00:06" },
    { id: "c8", type: "output", text: "SMTP server accepted message for delivery. 250 OK", timestamp: "00:00:07" },
    { id: "c9", type: "info", text: "Snapshot pipeline complete. Cleaned up temporary worker workspace.", timestamp: "00:00:08" }
  ];

  const activePresetLogs = simPreset === "webhook" ? webhookLogs : cronLogs;

  // Run Simulation Event Loop
  const startSimulation = (preset: "webhook" | "cron") => {
    setSimPreset(preset);
    setSimState("trigger");
    setSimLogs([]);
    setCurrentLogIndex(0);
    setTypingText("");
    setTypingCharIdx(0);
  };

  // Autoplay or progress simulation
  useEffect(() => {
    if (simState === "idle") return;

    const currentLog = activePresetLogs[currentLogIndex];
    if (!currentLog) {
      setSimState("success");
      const completeLog: LogItem = {
        id: "done",
        type: "info",
        text: "✔ PIPELINE IDLE - Awaiting trigger event...",
        timestamp: new Date().toTimeString().split(" ")[0]
      };
      setSimLogs(prev => [...prev, completeLog]);
      return;
    }

    // Determine nodes highlight matching current logs
    if (simPreset === "webhook") {
      if (currentLogIndex <= 1) setSimState("trigger");
      else if (currentLogIndex >= 2 && currentLogIndex <= 7) setSimState("ai");
      else if (currentLogIndex >= 8 && currentLogIndex <= 9) setSimState("action");
      else setSimState("success");
    } else {
      if (currentLogIndex <= 1) setSimState("trigger");
      else if (currentLogIndex >= 2 && currentLogIndex <= 5) setSimState("ai");
      else if (currentLogIndex >= 6 && currentLogIndex <= 7) setSimState("action");
      else setSimState("success");
    }

    // Type out the log text character by character for high-end look
    if (typingCharIdx < currentLog.text.length) {
      const timer = setTimeout(() => {
        setTypingText(prev => prev + currentLog.text.charAt(typingCharIdx));
        setTypingCharIdx(prev => prev + 1);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      // Hold complete line for a brief moment, then append to log list
      const timer = setTimeout(() => {
        setSimLogs(prev => [...prev, currentLog]);
        setCurrentLogIndex(prev => prev + 1);
        setTypingText("");
        setTypingCharIdx(0);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [simState, currentLogIndex, typingCharIdx, simPreset]);

  // Handle auto-start on mount
  useEffect(() => {
    startSimulation("webhook");
  }, []);

  // Stats Counters
  const stats = [
    { label: "AI Run-time Uptime", value: "99.99%" },
    { label: "Active Agent Networks", value: "12,480+" },
    { label: "Average Execution Delay", value: "84ms" },
    { label: "Supported Integrations", value: "140+" },
  ];

  // Integration Tools list
  const integrations = [
    { name: "Slack", category: "Alerts", icon: <MessageSquare className="h-5 w-5 text-emerald-400" /> },
    { name: "PostgreSQL", category: "Database", icon: <Database className="h-5 w-5 text-blue-400" /> },
    { name: "Stripe", category: "Payments", icon: <Zap className="h-5 w-5 text-indigo-400" /> },
    { name: "Gmail", category: "Email", icon: <Mail className="h-5 w-5 text-red-400" /> },
    { name: "Webhooks", category: "API Gateway", icon: <Globe className="h-5 w-5 text-cyan-400" /> },
    { name: "GitHub", category: "Version Control", icon: <Terminal className="h-5 w-5 text-purple-400" /> },
  ];

  // Feature Highlights
  const features = [
    {
      title: "Interactive Flow Canvas",
      description: "Visual node mapping links triggers directly to decision branches, AI processing steps, and output actions.",
      icon: <Network className="h-6 w-6 text-primary" />,
      status: "Active"
    },
    {
      title: "Granular Guardrails",
      description: "Approve actions in real time. Create custom rules to restrict tools and limit budget usage automatically.",
      icon: <ShieldCheck className="h-6 w-6 text-secondary" />,
      status: "Active"
    },
    {
      title: "Event-Driven Execution",
      description: "Deploy pipelines that trigger on webhook pulses, cron clocks, database updates, or user messages.",
      icon: <Zap className="h-6 w-6 text-yellow-400" />,
      status: "Active"
    },
    {
      title: "Claude & Gemini Fleet",
      description: "Load models dynamically with optimized custom prompts, temperature scaling, and context mapping.",
      icon: <Bot className="h-6 w-6 text-cyan-400" />,
      status: "Active"
    },
    {
      title: "PostgreSQL Integration",
      description: "Read, write, and map database tables directly into your AI workflows using parameterized query builders.",
      icon: <Database className="h-6 w-6 text-green-400" />,
      status: "Active"
    },
    {
      title: "Live Command Shell",
      description: "Monitor agent thoughts, tool requests, and JSON payloads live with low-latency streaming telemetry logs.",
      icon: <Terminal className="h-6 w-6 text-purple-400" />,
      status: "Beta"
    }
  ];

  // Fleet Telemetry data
  const fleetTelemetry = [
    { name: "Billing Auditor Claude", model: "Claude 3.5 Sonnet", load: 24, status: "STANDBY", speed: "1.2s avg", active: true },
    { name: "Customer Intent Classifier", model: "Gemini 1.5 Pro", load: 68, status: "RUNNING", speed: "840ms avg", active: true },
    { name: "Sync Database Sync Node", model: "Llama 3.1 70B", load: 0, status: "STANDBY", speed: "210ms avg", active: false },
  ];

  // Pricing Packages
  const pricingPlans = [
    {
      name: "Developer",
      desc: "For engineers prototyping autonomous flows.",
      priceMonthly: 0,
      priceYearly: 0,
      features: [
        "1 Workspace",
        "Up to 3 Active Agent Nodes",
        "500 execution runs / mo",
        "Community Slack support",
        "Standard Webhook ingress"
      ],
      cta: "Launch Free",
      popular: false
    },
    {
      name: "Pro Fleet",
      desc: "For growing teams deploying production integrations.",
      priceMonthly: 79,
      priceYearly: 63,
      features: [
        "Unlimited Workspaces",
        "Up to 15 Active Agent Nodes",
        "50,000 execution runs / mo",
        "Postgres & API connectors",
        "Priority Human-in-the-loop gates",
        "1-hour SLA email support"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      desc: "For security-first companies requiring total governance.",
      priceMonthly: 299,
      priceYearly: 239,
      features: [
        "Custom workspace isolation",
        "Unlimited Active Agent Nodes",
        "500,000+ execution runs / mo",
        "SAML SSO & Audit Logs",
        "Dedicated Agent endpoints",
        "Real-time custom DB integrations",
        "Dedicated account engineer"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  // FAQ Accordion items
  const faqs = [
    {
      q: "What exactly is Synapse OS?",
      a: "Synapse OS is an event-driven operating portal for orchestrating AI Agents. Unlike simple text chatbots, it connects triggers (like Stripe payments or webhooks) to a sequence of cognitive steps where LLM models (like Claude or Gemini) decide what actions to perform and execute them directly via integrated developer APIs."
    },
    {
      q: "Do I need to host the agents myself?",
      a: "No. Synapse OS handles execution hosting in a secure, sandboxed cloud infrastructure. You only need to define your agent workflows, configure API connectors, and specify parameters. We handle the event routing, scaling, and execution logs."
    },
    {
      q: "How does 'Human-in-the-Loop' governance work?",
      a: "For high-risk steps (like deleting records, emailing high-value clients, or transferring billing limits), you can set approval flags. The agent will pause its pipeline, trigger a webhook push notification, and wait until a workspace admin clicks 'Approve' or 'Reject' from their admin command center."
    },
    {
      q: "Is there support for local database connections?",
      a: "Yes. Using our secure database connector, you can map relational tables (Postgres, MySQL) directly. Database nodes allow you to parameterize prompts with SQL values and execute updates safely with full transactional rollbacks in case of agent errors."
    },
    {
      q: "Can I try it without inputting credit card details?",
      a: "Absolutely. The Developer plan is free forever, giving you standard access to visually edit nodes and run up to 500 workflow events every month. You can deploy it instantly."
    }
  ];

  return (
    <div className="min-h-screen bg-app-bg text-text-primary transition-colors duration-300 relative overflow-x-hidden w-full selection:bg-primary/30 selection:text-white">
      {/* Decorative glows — kept inside overflow-hidden so they never scroll horizontally */}
      <div className="absolute inset-0 bg-workspace-grid opacity-[0.06] pointer-events-none" />
      <div className="absolute left-0 top-[-10rem] h-96 w-64 rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
      <div className="absolute right-0 top-12 h-96 w-64 rounded-full bg-secondary/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-40 left-1/4 h-80 w-80 rounded-full bg-cyan-400/5 blur-[150px] pointer-events-none" />

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-50 border-b border-border-color/40 bg-app-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <SynapseLogo size="md" />
            <span className="hidden sm:block text-xs font-black uppercase tracking-[0.3em] text-text-primary whitespace-nowrap">
              Synapse OS
            </span>
          </div>

          {/* Desktop Nav — hidden below md */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold tracking-wider text-text-secondary uppercase">
            <a href="#features" className="transition-colors hover:text-text-primary">Features</a>
            <a href="#simulator" className="transition-colors hover:text-text-primary">Demo</a>
            <a href="#telemetry" className="transition-colors hover:text-text-primary">Telemetry</a>
            <a href="#pricing" className="transition-colors hover:text-text-primary">Pricing</a>
            <a href="#contact" className="transition-colors hover:text-text-primary">Contact</a>
          </nav>

          {/* Right-side actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme toggle — always visible */}
            <button
              onClick={toggleTheme}
              className="rounded-xl border border-border-color/60 bg-card-bg/60 p-2 text-text-muted transition-all hover:bg-hover-bg hover:text-text-primary flex-shrink-0"
              title={theme === "dark" ? "Light Mode" : "Dark Mode"}
            >
              {theme === "dark" ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-indigo-500" />}
            </button>

            {/* Login — only on sm+ */}
            <Link href="/login" className="hidden sm:inline-flex text-xs font-bold uppercase tracking-wider text-text-secondary transition-colors hover:text-text-primary whitespace-nowrap">
              Login
            </Link>

            {/* CTA — hidden on mobile (moved into mobile menu) */}
            <Link
              href="/register-org"
              className="hidden sm:inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-primary-hover shadow-lg shadow-primary/20 whitespace-nowrap"
            >
              Launch Workspace
            </Link>

            {/* Mobile hamburger — hidden on md+ */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl border border-border-color/60 bg-card-bg/60 p-2 text-text-muted hover:text-text-primary md:hidden flex-shrink-0"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 right-0 top-14 sm:top-16 border-b border-border-color bg-app-bg px-5 py-6 shadow-xl z-40 md:hidden"
            >
              <div className="flex flex-col gap-4 text-sm font-semibold text-text-secondary">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-text-primary">Features</a>
                <a href="#simulator" onClick={() => setMobileMenuOpen(false)} className="hover:text-text-primary">Interactive Demo</a>
                <a href="#telemetry" onClick={() => setMobileMenuOpen(false)} className="hover:text-text-primary">Telemetry</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-text-primary">Pricing</a>
                <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-text-primary">Inquire</a>
                <hr className="border-border-color/60" />
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="hover:text-text-primary">Login</Link>
                <Link
                  href="/register-org"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-primary text-xs font-black uppercase tracking-wider text-white shadow-md"
                >
                  Launch Workspace
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="w-full">
        {/* HERO SECTION WITH DYNAMIC STARS */}
        <section className="relative px-4 sm:px-6 py-12 md:py-24 overflow-hidden border-b border-border-color/40">
          <div className="absolute inset-0 z-0 opacity-40">
            <SparklesCore
              id="hero-sparkles"
              background="transparent"
              minSize={0.4}
              maxSize={1.5}
              particleDensity={70}
              particleColor={theme === "dark" ? "#EF4444" : "#7C4DFF"}
              speed={0.5}
            />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                Visual Orchestration Layer
              </div>

              <h1 className="text-4xl font-black tracking-tight text-text-primary sm:text-5xl md:text-7xl xl:text-8xl leading-[1.05]">
                Orchestrate Teams of
                <span className="block bg-gradient-to-r from-primary via-secondary to-cyan-400 bg-clip-text text-transparent py-2">
                  AI Agents. Visually.
                </span>
              </h1>

              <p className="mt-6 text-base leading-8 text-text-secondary sm:text-xl max-w-3xl mx-auto">
                Synapse OS connects event triggers directly to logical AI cognitive loops. 
                Deploy autonomous agent fleets with human approval gates, SQL database tools, and low-latency API dispatching.
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link href="/register-org" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-8 text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-primary-hover shadow-lg shadow-primary/25">
                  Launch Free Workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#simulator" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border-color bg-card-bg/60 px-8 text-sm font-bold uppercase tracking-wider text-text-primary transition-all hover:bg-hover-bg">
                  Run Event Simulator
                  <Play className="h-4 w-4 text-primary" />
                </a>
              </div>
            </div>

            {/* DUAL DISPLAY PANELS: MOCK CANVAS & TERMINAL LOGS */}
            <div id="simulator" className="mt-16 lg:mt-24 max-w-6xl mx-auto">
              <div className="mb-6 text-center">
                <h3 className="text-sm font-black uppercase tracking-[0.25em] text-primary">Live Workspace Simulation</h3>
                <p className="text-xs text-text-secondary mt-1">Choose a trigger to fire a workflow pulse and trace the visual node executions</p>
                
                <div className="mt-4 inline-flex items-center gap-2 p-1.5 bg-sidebar-bg/60 rounded-2xl border border-border-color/60">
                  <button 
                    onClick={() => startSimulation("webhook")} 
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${simPreset === "webhook" ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Stripe Webhook Event
                  </button>
                  <button 
                    onClick={() => startSimulation("cron")} 
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${simPreset === "cron" ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    Midnight Cron Trigger
                  </button>
                </div>
              </div>

              {/* Perspective wrapping wrapper for 3D card experience */}
              <div className="rounded-[28px] border border-border-color/50 bg-card-bg/50 p-3 sm:p-5 backdrop-blur-md shadow-2xl relative">
                
                {/* Visual Connector Dots Overlay for dynamic vibe */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] font-mono text-emerald-400">TELEMETRY SECURE</span>
                </div>

                <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
                  {/* LEFT INTERACTIVE FLOW CANVAS */}
                  <div className="rounded-2xl border border-border-color/60 bg-sidebar-bg/60 p-4 sm:p-6 flex flex-col justify-between min-h-[380px] relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-border-color/50 pb-3 mb-6">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-wider text-text-primary">Pipeline Flow Designer</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-card-bg text-text-muted border border-border-color/50">
                        {simPreset === "webhook" ? "stripe_webhook_pipeline.json" : "daily_analytics_cron.json"}
                      </span>
                    </div>

                    {/* Nodes flow tree container with animated neon wires */}
                    <div className="relative flex flex-col items-center justify-between flex-1 py-4">
                      {/* SVG wiring behind nodes */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                        <defs>
                          <linearGradient id="wire-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0.8" />
                          </linearGradient>
                        </defs>
                        {/* Wires */}
                        <path 
                          d="M 270 55 L 270 145" 
                          stroke={simState !== "idle" && simState !== "trigger" ? "url(#wire-gradient)" : "var(--color-border-color)"}
                          strokeWidth="2"
                          fill="none" 
                          className="transition-colors duration-500"
                        />
                        <path 
                          d="M 270 205 L 270 295" 
                          stroke={simState === "action" || simState === "success" ? "url(#wire-gradient)" : "var(--color-border-color)"}
                          strokeWidth="2"
                          fill="none"
                          className="transition-colors duration-500"
                        />
                        
                        {/* Light pulses */}
                        {simState === "trigger" && (
                          <circle r="4" fill="var(--primary)" className="animate-wirePulse">
                            <animateMotion path="M 270 55 L 270 145" dur="1s" repeatCount="indefinite" />
                          </circle>
                        )}
                        {simState === "ai" && (
                          <circle r="4" fill="var(--color-secondary)" className="animate-wirePulse">
                            <animateMotion path="M 270 55 L 270 145" dur="0.8s" repeatCount="indefinite" />
                          </circle>
                        )}
                        {simState === "action" && (
                          <circle r="4" fill="#10B981" className="animate-wirePulse">
                            <animateMotion path="M 270 205 L 270 295" dur="0.8s" repeatCount="indefinite" />
                          </circle>
                        )}
                      </svg>

                      {/* Node 1: Trigger */}
                      <div className={`relative z-10 w-full max-w-[280px] mx-auto sm:mx-0 sm:w-[240px] flex items-center gap-3 rounded-xl border transition-all duration-300 ${
                        simState === "trigger" 
                          ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(239,68,68,0.15)] scale-[1.03]" 
                          : "bg-card-bg border-border-color/70"
                      }`}>
                        <div className="p-3">
                          <div className={`p-2 rounded-lg ${simState === "trigger" ? "bg-primary/20 text-primary" : "bg-hover-bg text-text-muted"}`}>
                            {simPreset === "webhook" ? <Zap className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-text-muted font-bold">TRIGGER NODE</p>
                          <p className="text-xs font-bold text-text-primary">
                            {simPreset === "webhook" ? "Webhook Receiver" : "Cron Scheduler"}
                          </p>
                        </div>
                        {simState === "trigger" && (
                          <span className="absolute top-2 right-2 flex h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                        )}
                      </div>

                      {/* Node 2: AI Processor */}
                      <div className={`relative z-10 w-full max-w-[280px] mx-auto sm:mx-0 sm:w-[240px] flex items-center gap-3 rounded-xl border transition-all duration-300 ${
                        simState === "ai" 
                          ? "bg-secondary/15 border-secondary shadow-[0_0_15px_rgba(124,77,255,0.2)] scale-[1.03]" 
                          : "bg-card-bg border-border-color/70"
                      }`}>
                        <div className="p-3">
                          <div className={`p-2 rounded-lg ${simState === "ai" ? "bg-secondary/20 text-secondary" : "bg-hover-bg text-text-muted"}`}>
                            <Bot className="h-4 w-4" />
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-text-muted font-bold">AI COGNITIVE BRAIN</p>
                          <p className="text-xs font-bold text-text-primary">Claude 3.5 Assistant</p>
                        </div>
                        {simState === "ai" && (
                          <span className="absolute top-2 right-2 flex h-1.5 w-1.5 rounded-full bg-secondary animate-ping" />
                        )}
                      </div>

                      {/* Node 3: Action Endpoint */}
                      <div className={`relative z-10 w-full max-w-[280px] mx-auto sm:mx-0 sm:w-[240px] flex items-center gap-3 rounded-xl border transition-all duration-300 ${
                        simState === "action" 
                          ? "bg-emerald-500/10 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.15)] scale-[1.03]" 
                          : "bg-card-bg border-border-color/70"
                      }`}>
                        <div className="p-3">
                          <div className={`p-2 rounded-lg ${simState === "action" ? "bg-emerald-500/20 text-emerald-400" : "bg-hover-bg text-text-muted"}`}>
                            {simPreset === "webhook" ? <MessageSquare className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-text-muted font-bold">ACTION DISPATCH</p>
                          <p className="text-xs font-bold text-text-primary">
                            {simPreset === "webhook" ? "POST Slack Alert" : "SMTP Email Dispatch"}
                          </p>
                        </div>
                        {simState === "action" && (
                          <span className="absolute top-2 right-2 flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SIMULATED TELEMETRY LOGS */}
                  <div className="rounded-2xl border border-border-color/60 bg-black p-4 flex flex-col h-[300px] sm:h-[380px] overflow-hidden justify-between font-mono text-[11px] shadow-inner text-zinc-300">
                    <div className="flex items-center justify-between border-b border-neutral-900 pb-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] text-zinc-500 ml-2">telemetry@synapse-os:~$</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-900 text-primary animate-pulse font-bold">
                        ACTIVE RUNNER
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-neutral-900">
                      {simLogs.map((log) => (
                        <div key={log.id} className="space-y-0.5 animate-fadeIn">
                          <div className="flex items-center gap-2 text-zinc-600 text-[9px]">
                            <span>[{log.timestamp}]</span>
                            <span className={`uppercase font-bold text-[8px] px-1 rounded ${
                              log.type === "think" ? "bg-indigo-950/60 text-indigo-400 border border-indigo-900/30" :
                              log.type === "tool" ? "bg-cyan-950/60 text-cyan-400 border border-cyan-900/30" :
                              log.type === "output" ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/30" :
                              log.type === "error" ? "bg-rose-950/60 text-rose-400 border border-rose-900/30" :
                              "bg-neutral-900 text-zinc-400"
                            }`}>
                              {log.type}
                            </span>
                          </div>
                          <p className={`pl-2 border-l border-neutral-900 whitespace-pre-wrap break-words leading-relaxed ${
                            log.type === "think" ? "text-indigo-300 italic" :
                            log.type === "tool" ? "text-cyan-300 font-medium" :
                            log.type === "output" ? "text-emerald-400 font-semibold" :
                            log.type === "error" ? "text-rose-400 font-semibold" :
                            "text-zinc-300"
                          }`}>
                            {log.text}
                          </p>
                        </div>
                      ))}

                      {/* Actively typed line */}
                      {currentLogIndex < activePresetLogs.length && (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 text-zinc-600 text-[9px]">
                            <span>[{activePresetLogs[currentLogIndex].timestamp}]</span>
                            <span className={`uppercase font-bold text-[8px] px-1 rounded ${
                              activePresetLogs[currentLogIndex].type === "think" ? "bg-indigo-950 text-indigo-400" :
                              activePresetLogs[currentLogIndex].type === "tool" ? "bg-cyan-950 text-cyan-400" :
                              activePresetLogs[currentLogIndex].type === "output" ? "bg-emerald-955 text-emerald-400" :
                              "bg-neutral-900 text-zinc-400"
                            }`}>
                              {activePresetLogs[currentLogIndex].type}
                            </span>
                          </div>
                          <div className={`pl-2 border-l border-neutral-800 flex items-center leading-relaxed whitespace-pre-wrap break-words ${
                            activePresetLogs[currentLogIndex].type === "think" ? "text-indigo-300 italic" :
                            activePresetLogs[currentLogIndex].type === "tool" ? "text-cyan-300 font-medium" :
                            activePresetLogs[currentLogIndex].type === "output" ? "text-emerald-400 font-semibold" :
                            "text-zinc-300"
                          }`}>
                            <span>{typingText}</span>
                            <span className="w-1.5 h-3 ml-0.5 bg-primary inline-block animate-blink" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-neutral-900 pt-2 flex items-center justify-between text-[9px] text-zinc-500">
                      <span>Telemetry Socket: CONNECTED</span>
                      <span>Log Buffer: {simLogs.length} events</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LOGO CLOUD (SOCIAL PROOF) */}
        <section className="border-b border-border-color/40 bg-sidebar-bg/15 py-10 px-4 sm:px-0">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">
              Empowering autonomous engineering setups at scale
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
              <span className="text-sm font-black tracking-widest text-text-secondary uppercase">Cyberdyne Systems</span>
              <span className="text-sm font-black tracking-widest text-text-secondary uppercase">Weyland-Yutani</span>
              <span className="text-sm font-black tracking-widest text-text-secondary uppercase">Tyrell Corp</span>
              <span className="text-sm font-black tracking-widest text-text-secondary uppercase">Globex Corp</span>
              <span className="text-sm font-black tracking-widest text-text-secondary uppercase">Umbrella Corp</span>
            </div>
          </div>
        </section>

        {/* DETAILED STATS ROW */}
        <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6 border-b border-border-color/40">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border-color/70 bg-card-bg/50 p-6 backdrop-blur-md shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-3xl font-black text-text-primary tracking-tight">{stat.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-text-muted mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* INTEGRATIONS SLIDER / GRID */}
        <section className="py-14 sm:py-20 bg-sidebar-bg/20 border-b border-border-color/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Extendable Node Toolset</p>
                <h2 className="mt-3 text-3xl font-black text-text-primary tracking-tight sm:text-4xl leading-tight">
                  Seamlessly connect tools, databases, and APIs.
                </h2>
                <p className="mt-4 text-base leading-8 text-text-secondary">
                  Synapse OS works with your current developer tools. Feed live database variables into prompts, send emails via custom SMTP ports, or route agent outcomes to Slack commands.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="rounded-full border border-border-color bg-card-bg px-3.5 py-1 text-xs text-text-secondary">Webhook Ingress</span>
                  <span className="rounded-full border border-border-color bg-card-bg px-3.5 py-1 text-xs text-text-secondary">Postgres SSL</span>
                  <span className="rounded-full border border-border-color bg-card-bg px-3.5 py-1 text-xs text-text-secondary">OAuth Webflows</span>
                  <span className="rounded-full border border-border-color bg-card-bg px-3.5 py-1 text-xs text-text-secondary">Secure Env Vars</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {integrations.map((item) => (
                  <div key={item.name} className="flex items-center gap-4 rounded-2xl border border-border-color/70 bg-card-bg p-4 shadow-sm hover:border-primary/45 transition duration-200">
                    <div className="p-3 bg-sidebar-bg rounded-xl border border-border-color/60">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">{item.name}</h4>
                      <p className="text-[10px] uppercase tracking-wider text-text-muted mt-0.5">{item.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PRIMARY FEATURES GRID (USING WORKSPACE COMPONENT LOGIC) */}
        <section id="features" className="py-14 sm:py-20 border-b border-border-color/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-12 max-w-3xl">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Enterprise Architecture</p>
              <h2 className="mt-3 text-3xl font-black text-text-primary sm:text-4xl tracking-tight leading-tight">
                Built to coordinate agent loops, safely and auditably.
              </h2>
              <p className="mt-4 text-base leading-8 text-text-secondary">
                Every agent step is tracked, every run telemetry metric is visualized, and critical actions require explicit admin authorization.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, idx) => (
                <div 
                  key={idx} 
                  className="group rounded-2xl border border-border-color/70 bg-card-bg p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="mb-4 inline-flex rounded-xl border border-border-color/60 bg-sidebar-bg p-3 group-hover:border-primary/30 transition">
                        {feature.icon}
                      </div>
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                        feature.status === "Active" 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : "bg-primary/10 text-primary border-primary/20"
                      }`}>
                        {feature.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-text-primary group-hover:text-primary transition">{feature.title}</h3>
                    <p className="mt-2.5 text-xs leading-relaxed text-text-secondary">{feature.description}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Configure Node <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ACTIVE AGENT TELEMETRY / HEARTBEAT */}
        <section id="telemetry" className="py-14 sm:py-20 bg-sidebar-bg/10 border-b border-border-color/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-12 grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] items-center">
              <div>
                <div className="rounded-2xl border border-border-color/70 bg-card-bg p-5 font-mono text-[11px] shadow-lg">
                  <div className="flex items-center justify-between border-b border-border-color/60 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-primary animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-text-primary">Agent Network Heartbeat</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      ALL SYSTEMS STANDBY
                    </span>
                  </div>

                  <div className="space-y-4">
                    {fleetTelemetry.map((agent) => (
                      <div key={agent.name} className="border border-border-color/50 rounded-xl bg-sidebar-bg/40 p-3.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-text-primary">{agent.name}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                            agent.status === "RUNNING" ? "bg-secondary/15 text-secondary animate-pulse" : "bg-neutral-800 text-zinc-500"
                          }`}>{agent.status}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 text-[10px] text-text-muted">
                          <div>
                            <p>Model Pool</p>
                            <p className="text-text-secondary mt-0.5">{agent.model}</p>
                          </div>
                          <div>
                            <p>Avg Latency</p>
                            <p className="text-text-secondary mt-0.5">{agent.speed}</p>
                          </div>
                          <div>
                            <p>Resource Load</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="w-12 h-1 bg-border-color rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${agent.load}%` }} />
                              </div>
                              <span className="text-text-secondary">{agent.load}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Live Monitor Pools</p>
                <h2 className="mt-3 text-3xl font-black text-text-primary tracking-tight sm:text-4xl leading-tight">
                  Observe telemetry variables in absolute real time.
                </h2>
                <p className="mt-4 text-base leading-8 text-text-secondary">
                  Track token throughput, response latencies, cognitive decision durations, and error ratios. Use comprehensive telemetry charts to debug pipelines and optimize agent resource load.
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary font-bold">
                    <Check className="h-4 w-4 text-primary" /> Token counters
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary font-bold">
                    <Check className="h-4 w-4 text-primary" /> Log streaming
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary font-bold">
                    <Check className="h-4 w-4 text-primary" /> Credit reports
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ACCORDION FAQ */}
        <section className="py-14 sm:py-20 border-b border-border-color/40">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Faq</p>
              <h2 className="mt-3 text-3xl font-black text-text-primary tracking-tight sm:text-4xl leading-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-text-secondary mt-3">Learn more about orchestrating event-driven agent structures</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-border-color/60 bg-card-bg/60 rounded-2xl overflow-hidden transition-all duration-300">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)} 
                    className="w-full flex items-center justify-between p-5 text-left text-text-primary hover:bg-hover-bg/30 transition duration-200"
                  >
                    <span className="text-sm font-bold">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-text-muted transition-transform duration-300 ${activeFaq === idx ? "rotate-180 text-primary" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {activeFaq === idx && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-5 pb-5 pt-1 text-xs leading-relaxed text-text-secondary border-t border-border-color/40">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="py-14 sm:py-20 bg-sidebar-bg/10 border-b border-border-color/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Pricing tiers</p>
              <h2 className="mt-3 text-3xl font-black text-text-primary tracking-tight sm:text-4xl">
                Select your scale structure
              </h2>
              <p className="mt-4 text-text-secondary max-w-xl mx-auto">
                Prototyping flows is completely free. Upgrade for multi-workspace collaborations and massive run capacities.
              </p>

              {/* Billing Cycle Switcher */}
              <div className="mt-6 inline-flex items-center gap-1.5 p-1 bg-sidebar-bg rounded-xl border border-border-color/60">
                <button 
                  onClick={() => setBillingCycle("monthly")} 
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${billingCycle === "monthly" ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"}`}
                >
                  Monthly billing
                </button>
                <button 
                  onClick={() => setBillingCycle("yearly")} 
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${billingCycle === "yearly" ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"}`}
                >
                  Yearly billing
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-black">
                    -20%
                  </span>
                </button>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto items-stretch">
              {pricingPlans.map((plan) => {
                const currentPrice = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
                return (
                  <div 
                    key={plan.name} 
                    className={`rounded-[28px] border bg-card-bg p-8 flex flex-col justify-between shadow-sm relative transition duration-300 ${
                      plan.popular 
                        ? "border-primary/80 shadow-[0_15px_40px_rgba(239,68,68,0.06)]" 
                        : "border-border-color/70"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute top-0 right-8 -translate-y-1/2 bg-primary px-3.5 py-1 text-[9px] font-black uppercase tracking-wider text-white rounded-full">
                        MOST POPULAR
                      </span>
                    )}

                    <div>
                      <h3 className="text-lg font-black text-text-primary tracking-tight">{plan.name}</h3>
                      <p className="text-xs text-text-secondary mt-2">{plan.desc}</p>
                      
                      <div className="my-6 flex items-baseline gap-1">
                        <span className="text-4xl font-black text-text-primary tracking-tight">${currentPrice}</span>
                        <span className="text-xs text-text-muted">/ month</span>
                      </div>

                      <hr className="border-border-color/60 my-5" />

                      <ul className="space-y-3.5 text-xs text-text-secondary">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-8">
                      <Link 
                        href="/register-org" 
                        className={`w-full inline-flex h-11 items-center justify-center rounded-xl text-xs font-black uppercase tracking-wider transition ${
                          plan.popular 
                            ? "bg-primary text-white hover:bg-primary-hover shadow-md" 
                            : "border border-border-color bg-card-bg text-text-primary hover:bg-hover-bg"
                        }`}
                      >
                        {plan.cta}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* DYNAMIC CONTACT FORM WITH GLASSMORPHISM */}
        <section id="contact" className="py-14 sm:py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-5xl rounded-[32px] border border-border-color/70 bg-card-bg/40 p-5 sm:p-8 lg:p-12 shadow-[0_20px_80px_rgba(0,0,0,0.08)] backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="grid gap-10 grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Inquire Fleet Deployment</p>
                <h2 className="mt-3 text-3xl font-black text-text-primary tracking-tight sm:text-4xl leading-tight">
                  Let’s deploy an AI operation that runs autonomously.
                </h2>
                <p className="mt-4 text-base leading-8 text-text-secondary">
                  Share your workflow constraints and our workspace experts will help you assemble a custom set of agent nodes, compliance check gates, and secure database tools.
                </p>

                <div className="mt-8 space-y-4">
                  <a href="mailto:support@synapse.ai" className="flex items-center gap-3 rounded-2xl border border-border-color/70 bg-card-bg px-5 py-4 text-xs font-bold text-text-secondary transition hover:border-primary/45 hover:text-text-primary">
                    <Mail className="h-4.5 w-4.5 text-primary" />
                    support@synapse.ai
                  </a>
                  <div className="rounded-2xl border border-border-color/70 bg-card-bg px-5 py-4 text-xs text-text-secondary">
                    <p className="font-bold text-text-primary">Corporate Response SLA</p>
                    <p className="mt-1">Dedicated engineer review in under 3 hours for team evaluations.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border-color/60 bg-sidebar-bg/60 p-6 shadow-inner">
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-1.5 uppercase">Full name</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Ava Chen"
                      className="w-full h-11 px-3.5 bg-card-bg rounded-xl border border-border-color text-xs outline-none focus:border-primary transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-1.5 uppercase">Corporate Email</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="ava.chen@northstar.io"
                      className="w-full h-11 px-3.5 bg-card-bg rounded-xl border border-border-color text-xs outline-none focus:border-primary transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-1.5 uppercase">Company Name</label>
                    <input
                      type="text"
                      value={contactForm.company}
                      onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                      placeholder="Northstar Labs"
                      className="w-full h-11 px-3.5 bg-card-bg rounded-xl border border-border-color text-xs outline-none focus:border-primary transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-1.5 uppercase">Message / Requirements</label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Explain your automation goals..."
                      rows={3}
                      className="w-full p-3.5 bg-card-bg rounded-xl border border-border-color text-xs outline-none focus:border-primary transition resize-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-xs font-black uppercase tracking-wider text-white hover:bg-primary-hover shadow-md transition"
                  >
                    Send Evaluation Request
                    <Send className="h-3.5 w-3.5" />
                  </button>

                  {submitted && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="text-xs text-emerald-400 font-bold flex items-center gap-2 mt-2"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Message received. We'll contact you shortly!
                    </motion.div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border-color/50 bg-sidebar-bg/60 py-12 text-xs text-text-secondary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <SynapseLogo size="sm" />
                <span className="text-xs font-black uppercase tracking-[0.35em] text-text-primary">Synapse OS</span>
              </div>
              <p className="text-text-muted leading-relaxed max-w-xs">
                Deploy secure event-driven agent fleets to automate operational processes under full administrator governance.
              </p>
            </div>
            
            <div>
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3">Product</h4>
              <ul className="space-y-2 font-medium">
                <li><a href="#features" className="hover:text-text-primary transition">Features</a></li>
                <li><a href="#simulator" className="hover:text-text-primary transition">Flow Simulator</a></li>
                <li><a href="#telemetry" className="hover:text-text-primary transition">Telemetry Logs</a></li>
                <li><Link href="/register-org" className="hover:text-text-primary transition">Get Started</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3">Governance</h4>
              <ul className="space-y-2 font-medium">
                <li><span className="text-text-muted">Role permissions</span></li>
                <li><span className="text-text-muted">Human approval gates</span></li>
                <li><span className="text-text-muted">Audit records</span></li>
                <li><span className="text-text-muted">Secure credential storage</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3">Legal & Security</h4>
              <ul className="space-y-2 font-medium">
                <li><span className="text-text-muted">Privacy Policy</span></li>
                <li><span className="text-text-muted">Terms of Service</span></li>
                <li><span className="text-text-muted">SOC2 Compliance</span></li>
                <li><span className="text-text-muted">ISO 27001 readiness</span></li>
              </ul>
            </div>
          </div>

          <hr className="border-border-color/50 mb-6" />

          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row text-text-muted text-[11px]">
            <p>© 2026 Synapse Technologies Inc. All rights reserved.</p>
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              ALL SYSTEMS OPERATIONAL
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
