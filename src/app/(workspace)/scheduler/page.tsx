"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SchedulerRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/automations?tab=scheduler");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2 text-xs text-[#8D96A7]">
      <span className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span>Redirecting to Scheduler Workspace...</span>
    </div>
  );
}
