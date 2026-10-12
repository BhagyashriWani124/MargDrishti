"use client";

import { useState } from "react";
import WorkflowSidebar from "@/components/Workflow/WorkflowSidebar";

interface Props {
  children: React.ReactNode;
}

/**
 * AppShell wraps the main layout area below the header.
 * It owns the sidebar collapsed state and handles mobile drawer behavior.
 */
export default function AppShell({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* ── Workflow sidebar ──────────────────────────────────────────── */}
      <WorkflowSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />

      {/* ── Main content ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}
