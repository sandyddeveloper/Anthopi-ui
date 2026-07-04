"use client";
import React from "react";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceLayout>{children}</WorkspaceLayout>;
}
