import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Synapse OS | Premium AI Agent Orchestrator & Dashboard",
  description: "Deploy, monitor, and configure autonomous AI agents in real-time. Built with Aceternity UI and Next.js.",
  keywords: ["AI Agents", "Agentic Workflows", "Dashboard", "Aceternity UI", "Next.js", "TypeScript"],
  authors: [{ name: "Antigravity Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="bg-background-dark text-foreground antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
