"use client";

import { FlaskConical, AlertCircle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import WorkflowPageShell from "@/components/Workflow/WorkflowPageShell";
import Link from "next/link";

interface Scenario {
  id: string;
  name: string;
  change: string;
  status: "pending" | "queued";
}

const DEFAULT_SCENARIOS: Scenario[] = [
  { id: "s1", name: "Extend NS green phase +10s", change: "Signal timing", status: "pending" },
  { id: "s2", name: "Reduce demand by 20%",       change: "Traffic demand",  status: "pending" },
];

export default function TestWhatifPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>(DEFAULT_SCENARIOS);

  return (
    <WorkflowPageShell stageId="test-whatif">
      <div className="space-y-4">

        {/* Intro */}
        <section className="md-card p-5 space-y-2">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-[var(--signal-green)]" aria-hidden />
            <h2 className="text-[13px] font-semibold md-text-primary">
              What-if Scenario Builder
            </h2>
          </div>
          <p className="text-[12px] md-text-subtle">
            Define alternative scenarios by changing signal timing, demand
            level, or road conditions. Each scenario runs against the same
            baseline network and seed for a fair comparison.
          </p>
          <p className="text-[12px] md-text-subtle">
            For full scenario comparison, use the{" "}
            <Link href="/lab" className="text-[var(--status-ready-text)] hover:underline">
              Simulation Lab
            </Link>{" "}
            which already supports multi-run experiments.
          </p>
        </section>

        {/* Scenario list */}
        <section className="md-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b md-border">
            <h2 className="text-[13px] font-semibold md-text-primary">Scenarios</h2>
            <button
              type="button"
              onClick={() =>
                setScenarios((s) => [
                  ...s,
                  { id: `s${Date.now()}`, name: "New scenario", change: "Signal timing", status: "pending" },
                ])
              }
              className="flex items-center gap-1 text-[12px] text-[var(--status-ready-text)] hover:opacity-80"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden />
              Add scenario
            </button>
          </div>

          <ul className="divide-y md-border">
            {scenarios.map((sc) => (
              <li key={sc.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium md-text-primary truncate">{sc.name}</p>
                  <p className="text-[11px] md-text-muted">{sc.change}</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--status-not-started-bg)] text-[var(--status-not-started-text)]">
                  Pending
                </span>
                <button
                  type="button"
                  onClick={() => setScenarios((s) => s.filter((x) => x.id !== sc.id))}
                  aria-label={`Remove scenario: ${sc.name}`}
                  className="flex-shrink-0 text-[var(--text-muted)] hover:text-[var(--status-failed-text)] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden />
                </button>
              </li>
            ))}
            {scenarios.length === 0 && (
              <li className="px-4 py-6 text-center text-[12px] md-text-muted">
                No scenarios. Click &quot;Add scenario&quot; to create one.
              </li>
            )}
          </ul>
        </section>

        <div className="md-card p-4 flex gap-3 bg-[var(--status-running-bg)]">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-[var(--status-running-text)] mt-0.5" aria-hidden />
          <p className="text-[12px] text-[var(--status-running-text)]">
            <strong>Note (UI demo):</strong> Scenario execution is not connected. Use the
            Simulation Lab&apos;s RunBuilder for fully functional multi-run experiments.
          </p>
        </div>

      </div>
    </WorkflowPageShell>
  );
}
