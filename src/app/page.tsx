"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Bot, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Zap,
  Activity,
  Cpu,
  Sun,
  Moon,
  Database,
  Lock,
  Layers,
  Terminal,
  ChevronRight,
  Star,
  Network
} from "lucide-react";
import { SynapseLogo } from "@/components/common/logo";

export default function LandingPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

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

  return (
    <div className="min-h-screen bg-app-bg text-text-primary transition-colors duration-200 overflow-hidden relative">
      <div className="absolute inset-0 bg-workspace-grid opacity-[0.15] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

      {/* Header Navigation */}
      <header className="border-b border-border-color/60 bg-sidebar-bg/85 backdrop-blur-md sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SynapseLogo size="md" />
            <span className="font-bold text-xs uppercase tracking-widest text-text-primary">
              Synapse OS
            </span>
          </div>

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-text-secondary">
            <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
            <a href="#integrations" className="hover:text-text-primary transition-colors">Integrations</a>
            <a href="#pricing" className="hover:text-text-primary transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-text-primary transition-colors">Testimonials</a>
          </nav>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border-color bg-card-bg hover:bg-hover-bg text-text-muted hover:text-text-primary transition-all duration-200 shadow-sm"
              title={theme === "dark" ? "Light Mode" : "Dark Mode"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Public CTA buttons */}
            <Link 
              href="/login" 
              className="hidden sm:inline-flex text-xs font-bold text-text-secondary hover:text-text-primary px-3 py-2 transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/register-org" 
              className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/10 cursor-pointer"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center relative z-10">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] text-primary font-bold uppercase tracking-widest mb-6 animate-pulse">
            <Sparkles className="h-3 w-3" />
            <span>Next-Gen Enterprise AI Automation Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-text-primary leading-[1.1] max-w-4xl">
            Orchestrate Your <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Enterprise AI Agents</span> in One Clean Control Plane
          </h1>

          {/* Subheading */}
          <p className="text-sm md:text-lg text-text-secondary max-w-2xl mt-6 leading-relaxed">
            Provision secure organization nodes, assign granular RBAC roles, invite employee seats, and deploy low-latency automation workloads with root-level audit clearance.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
            <Link 
              href="/register-org" 
              className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-extrabold tracking-wide transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 flex gap-2 group cursor-pointer"
            >
              <span>Onboard Organization</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded-xl border border-border-color bg-card-bg hover:bg-hover-bg text-text-primary text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Sign In to Dashboard
            </Link>
            <button 
              onClick={() => alert("Sales Consultation requests: sales@synapse.ai")}
              className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 text-text-secondary hover:text-text-primary text-xs font-semibold transition-colors cursor-pointer"
            >
              Contact Sales
            </button>
          </div>

          {/* Platform Screenshot Preview Mockup with perspective */}
          <div className="w-full max-w-5xl mt-16 md:mt-24 relative rounded-[24px] border border-border-color bg-sidebar-bg/60 p-4 shadow-2xl transition-all hover:scale-[1.01] duration-300">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="h-6 flex items-center gap-1.5 border-b border-border-color pb-3 mb-4 text-[#8D96A7]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-secondary/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E]/60" />
              <span className="text-[10px] font-mono ml-4 truncate">synapse-dashboard-client://acme_corp_main_node</span>
            </div>

            {/* Fake layout representation for preview */}
            <div className="grid grid-cols-12 gap-4 h-64 md:h-96 rounded-xl bg-card-bg/60 p-4 border border-border-color/40 select-none overflow-hidden relative">
              <div className="col-span-3 border-r border-border-color/40 pr-4 flex flex-col gap-2.5 text-left text-[10px] text-text-muted">
                <span className="h-5 bg-hover-bg rounded-lg w-3/4 mb-2" />
                <span className="h-7 bg-primary/10 rounded-lg flex items-center px-2 text-primary font-bold">Dashboard Overview</span>
                <span className="h-7 hover:bg-hover-bg rounded-lg flex items-center px-2">Projects Workspace</span>
                <span className="h-7 hover:bg-hover-bg rounded-lg flex items-center px-2">AI Worker Seats</span>
                <span className="h-7 hover:bg-hover-bg rounded-lg flex items-center px-2">Audit Footprints</span>
                <span className="h-7 hover:bg-hover-bg rounded-lg flex items-center px-2">Security Sessions</span>
              </div>
              <div className="col-span-9 flex flex-col gap-4 text-left">
                <div className="flex justify-between items-center pb-2 border-b border-border-color/30">
                  <span className="h-4 bg-hover-bg rounded-lg w-1/3" />
                  <span className="h-6 bg-secondary/15 text-secondary border border-secondary/10 px-2 rounded-lg text-[9px] flex items-center font-bold">NODE STATE: ACTIVE</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-hover-bg/30 border border-border-color/40 rounded-xl flex flex-col gap-1">
                    <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Active Employees</span>
                    <span className="text-xl font-bold text-text-primary">12 Members</span>
                  </div>
                  <div className="p-3 bg-hover-bg/30 border border-border-color/40 rounded-xl flex flex-col gap-1">
                    <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Departments</span>
                    <span className="text-xl font-bold text-text-primary">4 Units</span>
                  </div>
                  <div className="p-3 bg-hover-bg/30 border border-border-color/40 rounded-xl flex flex-col gap-1">
                    <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Active Sessions</span>
                    <span className="text-xl font-bold text-text-primary">5 Devices</span>
                  </div>
                </div>
                <div className="flex-1 bg-[#101114]/50 border border-border-color/40 rounded-xl p-3 font-mono text-[9px] text-text-secondary overflow-hidden">
                  <div>&gt; Syncing cluster maps... DONE (4ms)</div>
                  <div>&gt; Deploying Docker container workspace: DEV_AGENT (Healthy)</div>
                  <div>&gt; Security clearance synced for operator: admin@acme.com</div>
                  <div>&gt; Standing by for instruction sequences...</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 border-t border-border-color/60 bg-sidebar-bg/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-primary">High Performance Architecture</h2>
            <h3 className="text-2xl md:text-4xl font-bold mt-2 text-text-primary">Engineered for Safe Enterprise Autonomy</h3>
            <p className="text-xs md:text-sm text-text-secondary mt-3">
              Establish granular operations protocols, audit compliance checks, and secure container runtimes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Granular RBAC Clearances",
                desc: "Establish robust Role-Based Access Controls with checkbox clearance trees. Fine-tune access for members, leads, and administrators.",
                icon: <ShieldCheck className="h-6 w-6 text-primary" />
              },
              {
                title: "Autonomous Workflows",
                desc: "Schedule automated trigger hooks, listen to multi-tenant webhooks, and trigger Docker containers on secure cluster modules.",
                icon: <Zap className="h-6 w-6 text-secondary" />
              },
              {
                title: "Ledger Audit Trails",
                desc: "Compile complete system event streams. Review IP access records, executed action codes, and status logs on one central logs dashboard.",
                icon: <Terminal className="h-6 w-6 text-cyan-400" />
              },
              {
                title: "Department Hierarchy",
                desc: "Structure your business nodes into departments, designate heads, group employees into functional teams, and define job designations.",
                icon: <Layers className="h-6 w-6 text-[#22C55E]" />
              }
            ].map((f, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-card border border-border-color bg-card-bg hover:border-primary/20 transition-all hover:translate-y-[-2px] duration-200 text-left shadow-card"
              >
                <div className="p-3 bg-hover-bg rounded-xl inline-flex mb-4">
                  {f.icon}
                </div>
                <h4 className="font-bold text-sm text-text-primary">{f.title}</h4>
                <p className="text-xs text-text-secondary mt-2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-20 border-t border-border-color/60 max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 text-left">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-primary">Connected System Nodes</h2>
            <h3 className="text-2xl md:text-3xl font-bold mt-2 text-text-primary">Integrates with Your Core Dev & Cloud Stacks</h3>
            <p className="text-xs md:text-sm text-text-secondary mt-3 leading-relaxed">
              Sync credentials seamlessly. Retrieve vector datasets, broadcast Slack alerts, scrape PubMed documentation, and execute commits directly inside repository threads.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-primary mt-6 hover:underline cursor-pointer">
              <span>View All 50+ Integrations</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>

          <div className="flex-1 w-full grid grid-cols-3 gap-4">
            {[
              { name: "PostgreSQL", desc: "Data Storage", icon: <Database className="h-5 w-5 text-primary" /> },
              { name: "Slack Node", desc: "Alert Dispatcher", icon: <Sparkles className="h-5 w-5 text-secondary" /> },
              { name: "GitHub Repos", desc: "Version Control", icon: <Network className="h-5 w-5 text-[#22C55E]" /> },
              { name: "Pinecone DB", desc: "Vector Search", icon: <Database className="h-5 w-5 text-cyan-400" /> },
              { name: "OAuth Secure", desc: "Access Tokens", icon: <Lock className="h-5 w-5 text-[#EF4444]" /> },
              { name: "DevAgent v2", desc: "AI Orchestrator", icon: <Bot className="h-5 w-5 text-yellow-500" /> }
            ].map((node, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-xl border border-border-color bg-card-bg/60 text-center flex flex-col items-center justify-center gap-1.5 shadow-sm"
              >
                <div className="p-2 bg-hover-bg rounded-lg">
                  {node.icon}
                </div>
                <span className="font-bold text-[10px] text-text-primary">{node.name}</span>
                <span className="text-[9px] text-text-muted">{node.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section id="testimonials" className="py-20 border-t border-border-color/60 bg-sidebar-bg/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-primary">Security Verified</h2>
            <h3 className="text-2xl md:text-3xl font-bold mt-2 text-text-primary">Trusted by Systems Operators</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "Synapse's multi-step organization registration wizard allowed us to onboard our entire engineering team and allocate custom database access tokens within five minutes. Absolutely premium interface.",
                author: "Richard Hendricks",
                role: "Chief Architect, Pied Piper"
              },
              {
                quote: "The ability to visually trace AI workflow executions in a live terminal mockup combined with rigorous audit log ledgers makes it a perfect fit for enterprise security regulations.",
                author: "Monica Hall",
                role: "Managing Partner, Raviga Systems"
              },
              {
                quote: "We replaced our complex custom role databases with Synapse's RBAC clearance screens. The permission override check trees saved our devs weeks of backend coordination.",
                author: "Bertram Gilfoyle",
                role: "Lead Systems Architect"
              }
            ].map((t, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-card border border-border-color bg-card-bg text-left flex flex-col justify-between shadow-card"
              >
                <p className="text-xs text-text-secondary leading-relaxed italic">"{t.quote}"</p>
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border-color/40">
                  <div className="h-8 w-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-xs text-primary uppercase">
                    {t.author.substring(0,2)}
                  </div>
                  <div className="flex flex-col text-[10px]">
                    <span className="font-bold text-text-primary">{t.author}</span>
                    <span className="text-text-muted">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-t border-border-color/60 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-primary">Clear Subscription Plans</h2>
          <h3 className="text-2xl md:text-3xl font-bold mt-2 text-text-primary">Scale Automation Securely</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto gap-8 items-stretch">
          {/* Plan 1 */}
          <div className="p-8 rounded-card border border-border-color bg-card-bg flex flex-col justify-between text-left shadow-card">
            <div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs uppercase text-primary">Developer Cluster</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-bold uppercase">Sandbox</span>
              </div>
              <div className="text-2xl font-black text-text-primary font-mono mt-4">$0 <span className="text-xs text-text-secondary font-normal">/ month</span></div>
              <p className="text-xs text-text-secondary mt-2">Test and simulate workflow actions locally.</p>
              <ul className="flex flex-col gap-2 mt-6 text-xs text-text-secondary">
                <li className="flex items-center gap-2">✓ 1 Active Organization Seat</li>
                <li className="flex items-center gap-2">✓ Interactive Terminal Sandbox</li>
                <li className="flex items-center gap-2">✓ Limit 3 running AI workflows</li>
                <li className="flex items-center gap-2">✓ Standard audit log history</li>
              </ul>
            </div>
            <Link 
              href="/register-org" 
              className="h-10 rounded-xl border border-border-color hover:bg-hover-bg text-text-primary font-bold text-xs flex items-center justify-center mt-8 transition-colors cursor-pointer"
            >
              Get Started Free
            </Link>
          </div>

          {/* Plan 2 */}
          <div className="p-8 rounded-card border-2 border-primary bg-[#16181D]/40 flex flex-col justify-between text-left relative shadow-2xl">
            <div className="absolute top-4 right-4 text-[9px] font-extrabold text-white bg-primary px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              RECOMMENDED
            </div>
            <div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs uppercase text-primary">Enterprise Pro</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-bold uppercase">Cluster</span>
              </div>
              <div className="text-2xl font-black text-text-primary font-mono mt-4">$49 <span className="text-xs text-text-secondary font-normal">/ month</span></div>
              <p className="text-xs text-text-secondary mt-2">Scale AI deployments globally across your business units.</p>
              <ul className="flex flex-col gap-2 mt-6 text-xs text-text-secondary">
                <li className="flex items-center gap-2 font-semibold text-text-primary">✓ Up to 5 Seat Licences</li>
                <li className="flex items-center gap-2">✓ Full Departments & Teams Org</li>
                <li className="flex items-center gap-2">✓ Custom Checkbox RBAC Clearance</li>
                <li className="flex items-center gap-2">✓ Active Session device revokes</li>
                <li className="flex items-center gap-2">✓ Infinite automated workflows</li>
              </ul>
            </div>
            <Link 
              href="/register-org" 
              className="h-10 rounded-xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs flex items-center justify-center mt-8 transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              Provision Cluster Node
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-color/60 bg-sidebar-bg/60 py-12 text-center text-xs text-text-secondary mt-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <SynapseLogo size="sm" />
            <span className="font-bold text-xs uppercase tracking-widest text-text-primary">Synapse OS</span>
          </div>
          <p>© 2026 Synapse Technologies Inc. All systems operational. SOC2 Type II Certified.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
