"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { SynapseLogo } from "@/components/common/logo";

export default function LandingPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [contactForm, setContactForm] = useState({ name: "", email: "", company: "" });
  const [submitted, setSubmitted] = useState(false);
  const [selectedMode, setSelectedMode] = useState("observe");
  const [spotlight, setSpotlight] = useState({ x: 55, y: 42 });

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const stats = [
    { label: "Autonomous agents", value: "24/7" },
    { label: "Secure deployments", value: "99.98%" },
    { label: "Global teams", value: "180+" },
  ];

  const features = [
    {
      title: "Neural command center",
      description: "Instantly view every workflow, dependency, and approval path from a single immersive control plane.",
      icon: <Cpu className="h-5 w-5 text-primary" />,
    },
    {
      title: "Zero-friction governance",
      description: "Set permissions, audit every action, and keep compliance visible without slowing delivery.",
      icon: <ShieldCheck className="h-5 w-5 text-secondary" />,
    },
    {
      title: "Interoperable by design",
      description: "Connect your cloud, data, and collaboration stack in minutes through secure integrations.",
      icon: <Database className="h-5 w-5 text-cyan-400" />,
    },
    {
      title: "Built for scale",
      description: "Expand from a single team to enterprise-wide orchestration with powerful role and workspace controls.",
      icon: <Layers className="h-5 w-5 text-[#22C55E]" />,
    },
  ];

  const controlModes = [
    {
      id: "observe",
      label: "Observe",
      title: "Live intelligence pulse",
      description: "Track every signal as it moves through your stack in real time.",
      badge: "Live pulse",
      icon: <Activity className="h-4 w-4 text-primary" />,
      stats: [
        { label: "Signals", value: "1.2k" },
        { label: "Decisions", value: "3.2k" },
        { label: "Risks", value: "0" },
      ],
      bullets: ["Automatic context routing", "Instant human handoff", "Daily risk summary"],
    },
    {
      id: "automate",
      label: "Automate",
      title: "Autonomous action loops",
      description: "Deploy repeatable workflows with clear approvals and instant feedback.",
      badge: "Auto-run",
      icon: <Zap className="h-4 w-4 text-secondary" />,
      stats: [
        { label: "Flows", value: "42" },
        { label: "Speed", value: "4x" },
        { label: "Uptime", value: "99.9%" },
      ],
      bullets: ["Mission-specific playbooks", "Approval gates", "Adaptive retries"],
    },
    {
      id: "scale",
      label: "Scale",
      title: "Enterprise-ready expansion",
      description: "Bring new teams and regions online without losing control of the system.",
      badge: "Scale up",
      icon: <Terminal className="h-4 w-4 text-cyan-400" />,
      stats: [
        { label: "Teams", value: "180+" },
        { label: "Regions", value: "8" },
        { label: "Guardrails", value: "24/7" },
      ],
      bullets: ["Multi-tenant workspaces", "Global compliance checks", "Synchronized operations"],
    },
  ];

  const activeMode = controlModes.find((mode) => mode.id === selectedMode) ?? controlModes[0];

  const handleSpotlight = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setSpotlight({ x, y });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-app-bg text-text-primary transition-colors duration-300 relative">
      <div className="absolute inset-0 bg-workspace-grid opacity-[0.14] pointer-events-none" />
      <div className="absolute left-[-6rem] top-[-4rem] h-64 w-64 rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute right-[-2rem] top-24 h-72 w-72 rounded-full bg-secondary/20 blur-[140px]" />
      <div className="absolute bottom-20 left-1/3 h-56 w-56 rounded-full bg-cyan-400/10 blur-[140px]" />

      <header className="sticky top-0 z-50 border-b border-border-color/60 bg-app-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <SynapseLogo size="md" />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-text-primary">
              Synapse OS
            </span>
          </div>

          <nav className="hidden items-center gap-6 text-xs font-semibold text-text-secondary md:flex">
            <a href="#features" className="transition-colors hover:text-text-primary">Features</a>
            <a href="#contact" className="transition-colors hover:text-text-primary">Contact</a>
            <a href="#pricing" className="transition-colors hover:text-text-primary">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-xl border border-border-color bg-card-bg/80 p-2 text-text-muted transition-all hover:bg-hover-bg hover:text-text-primary"
              title={theme === "dark" ? "Light Mode" : "Dark Mode"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link href="/login" className="hidden text-xs font-semibold text-text-secondary transition-colors hover:text-text-primary sm:inline-flex">
              Login
            </Link>
            <Link href="/register-org" className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-xs font-bold text-white transition-all hover:bg-primary-hover">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative px-6 pb-20 pt-20 md:pb-28 md:pt-28">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Next-gen enterprise orchestration
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-[0.95] tracking-tight text-text-primary sm:text-5xl lg:text-7xl">
                Build a calmer, smarter
                <span className="block bg-gradient-to-r from-primary via-secondary to-cyan-400 bg-clip-text text-transparent">
                  AI operating system.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-text-secondary sm:text-lg">
                Coordinate your people, workflows, and AI agents like a living constellation — secure, elegant, and ready for the next leap.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/register-org" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-hover">
                  Launch your workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#contact" className="inline-flex items-center justify-center rounded-2xl border border-border-color bg-card-bg/70 px-6 py-3 text-sm font-semibold text-text-primary transition-all hover:bg-hover-bg">
                  Book a demo
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-border-color/70 bg-card-bg/70 px-4 py-3 shadow-sm">
                    <div className="text-lg font-black text-text-primary">{stat.value}</div>
                    <div className="text-[11px] uppercase tracking-[0.25em] text-text-muted">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div
                className="glass-panel float-slow rounded-[32px] p-3 sm:p-4"
                onMouseMove={handleSpotlight}
                onMouseLeave={() => setSpotlight({ x: 55, y: 42 })}
              >
                <div className="relative overflow-hidden rounded-[28px] border border-border-color/70 bg-[linear-gradient(135deg,rgba(124,77,255,0.15),rgba(255,255,255,0.03))] p-4 sm:p-6">
                  <div
                    className="pointer-events-none absolute inset-0 transition-all duration-300"
                    style={{
                      background: `radial-gradient(240px circle at ${spotlight.x}% ${spotlight.y}%, rgba(124, 77, 255, 0.22), transparent 62%)`,
                    }}
                  />
                  <div className="relative flex items-center justify-between rounded-2xl border border-border-color/60 bg-sidebar-bg/70 px-4 py-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.35em] text-text-muted">Mission control</p>
                      <p className="text-sm font-semibold text-text-primary">Acme intelligence core</p>
                    </div>
                    <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-400">
                      Live
                    </div>
                  </div>

                  <div className="relative mt-4 flex flex-wrap gap-2">
                    {controlModes.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setSelectedMode(mode.id)}
                        className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] transition-all ${
                          selectedMode === mode.id
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "border border-border-color/60 bg-card-bg/70 text-text-secondary hover:border-primary/30 hover:text-text-primary"
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative mt-4 rounded-[24px] border border-border-color/60 bg-card-bg/80 p-4 shadow-inner">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                          {activeMode.icon}
                          {activeMode.title}
                        </div>
                        <p className="mt-2 text-sm leading-7 text-text-secondary">{activeMode.description}</p>
                      </div>
                      <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
                        {activeMode.badge}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {activeMode.stats.map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-border-color/60 bg-hover-bg/60 p-3">
                          <div className="text-base font-black text-text-primary">{stat.value}</div>
                          <div className="text-[10px] uppercase tracking-[0.25em] text-text-muted">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 space-y-3">
                      {activeMode.bullets.map((item) => (
                        <div key={item} className="flex items-center justify-between rounded-xl border border-border-color/60 bg-hover-bg/60 px-3 py-2 text-sm text-text-secondary">
                          <span>{item}</span>
                          <span className="text-primary">↗</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-border-color/60 bg-sidebar-bg/30 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 max-w-3xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-primary">Immersive control</p>
              <h2 className="mt-3 text-3xl font-black text-text-primary sm:text-4xl">Designed to feel futuristic, while staying operationally sane.</h2>
              <p className="mt-4 text-base leading-8 text-text-secondary">
                Every surface is built to reduce noise, amplify clarity, and make advanced automation feel natural for every team.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.title} className="group rounded-[24px] border border-border-color/70 bg-card-bg/80 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_50px_rgba(124,77,255,0.12)]">
                  <div className="mb-4 inline-flex rounded-2xl border border-border-color/60 bg-hover-bg/70 p-3">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-text-secondary">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-6 py-20">
          <div className="rounded-[32px] border border-border-color/70 bg-gradient-to-br from-primary/10 via-card-bg to-secondary/10 p-8 md:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-primary">Flexible plans</p>
                <h2 className="mt-3 text-3xl font-black text-text-primary sm:text-4xl">Scale from a focused launch to a full enterprise command center.</h2>
                <p className="mt-4 text-base leading-8 text-text-secondary">Start lightweight, then expand without changing your operating model.</p>
              </div>
              <Link href="/register-org" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-hover">
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section id="contact" className="px-6 pb-20">
          <div className="mx-auto max-w-7xl rounded-[32px] border border-border-color/70 bg-sidebar-bg/40 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.08)] md:p-10">
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-primary">Contact</p>
                <h2 className="mt-3 text-3xl font-black text-text-primary sm:text-4xl">Let’s shape an experience that feels truly extraordinary.</h2>
                <p className="mt-4 text-base leading-8 text-text-secondary">
                  Share your goals and we’ll help you turn the idea into a polished, high-trust AI workspace built for your team.
                </p>

                <div className="mt-8 space-y-3">
                  <a href="mailto:hello@synapse.ai" className="flex items-center gap-3 rounded-2xl border border-border-color/70 bg-card-bg/80 px-4 py-3 text-sm text-text-secondary transition-all hover:border-primary/30 hover:text-text-primary">
                    <Mail className="h-4 w-4 text-primary" />
                    hello@synapse.ai
                  </a>
                  <div className="rounded-2xl border border-border-color/70 bg-card-bg/80 px-4 py-3 text-sm text-text-secondary">
                    <p className="font-semibold text-text-primary">Response time</p>
                    <p className="mt-1">Usually within one business day.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="rounded-[28px] border border-border-color/70 bg-card-bg/80 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm text-text-secondary">
                    <span className="mb-2 block font-semibold text-text-primary">Name</span>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(event) => setContactForm({ ...contactForm, name: event.target.value })}
                      className="h-11 w-full rounded-2xl border border-border-color bg-app-bg px-3 outline-none transition focus:border-primary"
                      placeholder="Ava Chen"
                    />
                  </label>
                  <label className="text-sm text-text-secondary">
                    <span className="mb-2 block font-semibold text-text-primary">Email</span>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(event) => setContactForm({ ...contactForm, email: event.target.value })}
                      className="h-11 w-full rounded-2xl border border-border-color bg-app-bg px-3 outline-none transition focus:border-primary"
                      placeholder="you@company.com"
                    />
                  </label>
                </div>

                <label className="mt-4 block text-sm text-text-secondary">
                  <span className="mb-2 block font-semibold text-text-primary">Company</span>
                  <input
                    type="text"
                    value={contactForm.company}
                    onChange={(event) => setContactForm({ ...contactForm, company: event.target.value })}
                    className="h-11 w-full rounded-2xl border border-border-color bg-app-bg px-3 outline-none transition focus:border-primary"
                    placeholder="Northstar Labs"
                  />
                </label>

                <button type="submit" className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-hover">
                  Send inquiry
                  <ArrowRight className="h-4 w-4" />
                </button>

                {submitted ? (
                  <p className="mt-4 text-sm text-emerald-500">Thanks — we’ll reach out shortly with a tailored plan.</p>
                ) : null}
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-color/60 bg-sidebar-bg/60 py-8 text-center text-xs text-text-secondary">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <SynapseLogo size="sm" />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-text-primary">Synapse OS</span>
          </div>
          <p>© 2026 Synapse Technologies Inc. All systems operational.</p>
        </div>
      </footer>
    </div>
  );
}
