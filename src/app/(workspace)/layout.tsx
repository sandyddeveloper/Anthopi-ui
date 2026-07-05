"use client";
import React, { Suspense } from "react";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#111113] flex flex-col items-center justify-center gap-2 text-xs text-[#8D96A7]">
        <span className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Initializing Workspace...</span>
      </div>
    }>
      <WorkspaceLayout>{children}</WorkspaceLayout>
    </Suspense>
  );
}
