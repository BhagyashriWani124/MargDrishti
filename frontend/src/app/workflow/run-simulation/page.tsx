"use client";

import { Play, Settings2, Terminal, AlertCircle } from "lucide-react";
import WorkflowPageShell from "@/components/Workflow/WorkflowPageShell";
import Link from "next/link";

export default function RunSimulationPage() {
  return (
    <WorkflowPageShell stageId="run-simulation">
      <div className="space-y-4">

        {/* Simulation config summary */}
        <section className="md-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-[var(--signal-green)]" aria-hidden />
            <h2 className="text-[13px] font-semibold md-text-primary">
              Baseline Simulation Configuration
            </h2>
          </div>
          <p className="text-[12px] md-text-subtle">
            Run the SUMO baseline simulation using the calibrated demand and
            road network from earlier steps. This produces the reference metrics
            for all what-if comparisons.
          </p>

          <div className="grid grid-cols-2 gap-3 text-[12px]">
            {[
              { k: "Network",      v: "From Step 3 (not yet configured)" },
              { k: "Policy",       v: "Actuated signal control" },
              { k: "Demand",       v: "From calibration (Step 4)" },
              { k: "Duration",     v: "10 min (configurable)" },
              { k: "Seed",         v: "42" },
              { k: "SUMO GUI",     v: "Disabled (headless)" },
            ].map(({ k, v }) => (
              <div key={k} className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold md-text-muted uppercase tracking-wider">{k}</span>
                <span className="md-text-primary font-medium">{v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Launch panel */}
        <section className="md-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 md-text-subtle" aria-hidden />
            <h2 className="text-[13px] font-semibold md-text-primary">
              Launch Simulation
            </h2>
          </div>
          <p className="text-[12px] md-text-subtle">
            The existing simulation backend at{" "}
            <code className="font-mono text-[11px]">/api/simulation/start</code> will be
            called with the configured parameters. Progress and metrics will appear
            in the live dashboard.
          </p>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className={
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold " +
                "bg-[var(--signal-green)] text-white hover:opacity-90 transition-opacity"
              }
            >
              <Play className="w-3.5 h-3.5" aria-hidden />
              Open Live Dashboard
            </Link>
            <span className="text-[12px] md-text-muted">
              Simulation controls are in the existing dashboard sidebar
            </span>
          </div>
        </section>

        {/* Terminal output placeholder */}
        <section className="md-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b md-border bg-[var(--surface-elevated)]">
            <Terminal className="w-3.5 h-3.5 md-text-muted" aria-hidden />
            <span className="text-[11px] font-mono md-text-muted">SUMO output</span>
          </div>
          <div className="px-4 py-4 font-mono text-[11px] md-text-muted min-h-[100px]">
            Simulation not running. Start from the dashboard or via CLI:
            <br />
            <code className="text-[var(--status-ready-text)]">
              python script_with_export_interval.py
            </code>
          </div>
        </section>

        <div className="md-card p-4 flex gap-3 bg-[var(--status-running-bg)]">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-[var(--status-running-text)] mt-0.5" aria-hidden />
          <p className="text-[12px] text-[var(--status-running-text)]">
            <strong>Note (UI demo):</strong> Simulation launch from this page is not yet
            wired. Use the{" "}
            <Link href="/" className="underline">
              live dashboard
            </Link>{" "}
            sim controls, which already integrate with the WebSocket backend.
          </p>
        </div>

      </div>
    </WorkflowPageShell>
  );
}
