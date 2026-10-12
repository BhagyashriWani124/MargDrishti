"use client";

import { useState } from "react";
import { Settings, Moon, Sun, Monitor, HardDrive, Bell, Check, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useThemeStore } from "@/store/themeStore";
import { useWorkflowStore } from "@/store/workflowStore";

export default function SettingsPage() {
  const { scheme, setScheme } = useThemeStore();
  const resetWorkflow = useWorkflowStore((s) => s.resetWorkflow);

  const [notifications, setNotifications] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleResetWorkflow = () => {
    if (window.confirm("Reset workflow progress across all 7 stages to initial state?")) {
      resetWorkflow();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 3000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto md-bg">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs md-text-muted">
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
            Command Center
          </Link>
          <span aria-hidden>›</span>
          <span className="md-text-subtle">System</span>
          <span aria-hidden>›</span>
          <span className="md-text-primary font-medium">Settings</span>
        </nav>

        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[var(--signal-green)]" />
            <h1 className="text-xl font-bold md-text-emphasis">Platform Settings</h1>
          </div>
          <p className="text-xs md-text-subtle mt-1">
            Configure appearance, theme persistence, simulation defaults, and storage.
          </p>
        </div>

        {/* Appearance & Theme Section */}
        <section className="md-card p-5 space-y-4">
          <h2 className="text-sm font-semibold md-text-primary">Appearance & Theme</h2>
          <p className="text-xs md-text-subtle">
            Select interface theme. Preferences persist in browser localStorage without requiring page refreshes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setScheme("light")}
              className={`flex items-center gap-3 p-3.5 rounded-lg border text-left transition-all ${
                scheme === "light"
                  ? "border-[var(--signal-green)] bg-[var(--status-completed-bg)] ring-1 ring-[var(--signal-green)]"
                  : "md-border hover:bg-[var(--border)] hover:bg-opacity-40"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-white text-gray-800 border flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sun className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold md-text-primary">Light Theme (Default)</span>
                  {scheme === "light" && <Check className="w-3.5 h-3.5 text-[var(--signal-green)]" />}
                </div>
                <p className="text-[11px] md-text-muted mt-0.5">High readability, clean surfaces</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setScheme("dark")}
              className={`flex items-center gap-3 p-3.5 rounded-lg border text-left transition-all ${
                scheme === "dark"
                  ? "border-[var(--signal-green)] bg-[var(--status-completed-bg)] ring-1 ring-[var(--signal-green)]"
                  : "md-border hover:bg-[var(--border)] hover:bg-opacity-40"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#202B35] text-white border border-[#364654] flex items-center justify-center flex-shrink-0 shadow-sm">
                <Moon className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold md-text-primary">Dark Theme (Road Charcoal)</span>
                  {scheme === "dark" && <Check className="w-3.5 h-3.5 text-[var(--signal-green)]" />}
                </div>
                <p className="text-[11px] md-text-muted mt-0.5">#202B35 surfaces, accessible contrast</p>
              </div>
            </button>
          </div>
        </section>

        {/* Accessibility & Motion */}
        <section className="md-card p-5 space-y-4">
          <h2 className="text-sm font-semibold md-text-primary">Motion & Accessibility</h2>
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-xs font-medium md-text-primary">Respect OS Reduced-Motion</p>
              <p className="text-[11px] md-text-muted mt-0.5">
                Automatically detects prefers-reduced-motion to eliminate all rapid transitions and pulses.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--status-completed-bg)] text-[var(--status-completed-text)] text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Active in CSS
            </div>
          </div>
        </section>

        {/* Storage & Workflow Persistence */}
        <section className="md-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[var(--text-muted)]" />
            <h2 className="text-sm font-semibold md-text-primary">Workflow Persistence & Cache</h2>
          </div>
          <p className="text-xs md-text-subtle">
            Workflow states are persisted in the browser via <code>localStorage (md.workflow.v1)</code>.
          </p>

          <div className="flex items-center justify-between pt-3 border-t md-border">
            <div>
              <p className="text-xs font-medium md-text-primary">Reset Workflow State</p>
              <p className="text-[11px] md-text-muted mt-0.5">
                Resets the 7 workflow stages to initial defaults without modifying server simulation files.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetWorkflow}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--signal-red)] text-[var(--status-failed-text)] hover:bg-[var(--status-failed-bg)] transition-colors"
            >
              {resetDone ? "Workflow Reset!" : "Reset Stages"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
