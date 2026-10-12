"use client";

import { useState } from "react";
import { BarChart3, Download, FileSpreadsheet, FileText, CheckCircle2, TrendingUp, AlertTriangle, Layers } from "lucide-react";
import WorkflowPageShell from "@/components/Workflow/WorkflowPageShell";
import Link from "next/link";

interface MetricComparison {
  metric: string;
  baseline: string;
  scenario: string;
  change: string;
  status: "improved" | "degraded" | "neutral" | "not_calculated";
}

const COMPARISON_DATA: MetricComparison[] = [
  {
    metric: "Average Delay per Vehicle",
    baseline: "— s",
    scenario: "— s",
    change: "No calculation",
    status: "not_calculated",
  },
  {
    metric: "Network Throughput",
    baseline: "— veh/min",
    scenario: "— veh/min",
    change: "No calculation",
    status: "not_calculated",
  },
  {
    metric: "Average Control Delay",
    baseline: "— s",
    scenario: "— s",
    change: "No calculation",
    status: "not_calculated",
  },
  {
    metric: "Halting Vehicles",
    baseline: "— veh",
    scenario: "— veh",
    change: "No calculation",
    status: "not_calculated",
  },
  {
    metric: "Total Trip Time",
    baseline: "— s",
    scenario: "— s",
    change: "No calculation",
    status: "not_calculated",
  },
];

export default function CompareReportPage() {
  const [exported, setExported] = useState<string | null>(null);

  const handleExport = (format: "csv" | "pdf" | "json") => {
    setExported(`Report exported in ${format.toUpperCase()} format (local download simulated).`);
    setTimeout(() => setExported(null), 4000);
  };

  return (
    <WorkflowPageShell stageId="compare-report">
      <div className="space-y-6">
        {/* Header summary */}
        <section className="md-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[var(--signal-green)]" aria-hidden />
              <h2 className="text-sm font-semibold md-text-primary">
                Simulation Outcomes & What-If Comparison
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleExport("csv")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border md-border hover:bg-[var(--border)] transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" aria-hidden />
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => handleExport("json")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border md-border hover:bg-[var(--border)] transition-colors"
              >
                <Download className="w-3.5 h-3.5" aria-hidden />
                Export JSON
              </button>
            </div>
          </div>
          <p className="text-xs md-text-subtle">
            Evaluates baseline vs what-if alternative simulation runs. Note: Claims of performance
            improvements are only asserted when verifiable metrics from executed runs confirm them.
          </p>

          {exported && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--status-completed-bg)] text-[var(--status-completed-text)] text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{exported}</span>
            </div>
          )}
        </section>

        {/* Quantitative Comparison Table */}
        <section className="md-card overflow-hidden">
          <div className="px-4 py-3 border-b md-border flex items-center justify-between">
            <h3 className="text-xs font-semibold md-text-primary uppercase tracking-wider">
              Measured Simulation Outcomes
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border md-border text-[var(--text-muted)]">
              [UNPROCESSED / PENDING RUNS]
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left" aria-label="Comparison outcomes table">
              <thead>
                <tr className="border-b md-border md-bg md-text-muted">
                  <th className="px-4 py-2.5 font-semibold">Performance Metric</th>
                  <th className="px-4 py-2.5 font-semibold">Baseline Run</th>
                  <th className="px-4 py-2.5 font-semibold">What-if Scenario</th>
                  <th className="px-4 py-2.5 font-semibold">Delta / Difference</th>
                  <th className="px-4 py-2.5 font-semibold">Validation State</th>
                </tr>
              </thead>
              <tbody className="divide-y md-border">
                {COMPARISON_DATA.map((row) => (
                  <tr key={row.metric} className="hover:bg-[var(--border)] hover:bg-opacity-30 transition-colors">
                    <td className="px-4 py-3 font-medium md-text-primary">{row.metric}</td>
                    <td className="px-4 py-3 font-mono md-text-subtle">{row.baseline}</td>
                    <td className="px-4 py-3 font-mono md-text-subtle">{row.scenario}</td>
                    <td className="px-4 py-3 font-mono md-text-muted">{row.change}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--status-not-started-bg)] text-[var(--status-not-started-text)]">
                        Requires simulation data
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Lab Link & Verification Warning */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--status-ready-text)]" />
              <h4 className="text-xs font-semibold md-text-primary">Historical Comparisons</h4>
            </div>
            <p className="text-xs md-text-subtle">
              Full multi-run side-by-side experiments executed via the simulation engine can be inspected directly in the Simulation Lab.
            </p>
            <div className="pt-2">
              <Link
                href="/lab"
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--status-ready-text)] hover:underline"
              >
                Open Simulation Lab Experiments →
              </Link>
            </div>
          </div>

          <div className="md-card p-4 space-y-2 bg-[var(--status-running-bg)]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[var(--status-running-text)]" />
              <h4 className="text-xs font-semibold text-[var(--status-running-text)]">Integrity Notice</h4>
            </div>
            <p className="text-xs text-[var(--status-running-text)] leading-relaxed">
              MargDrishti adheres to strict metric honesty: green tags and claims of congestion relief
              are prohibited unless calculated outputs show statistically significant improvements.
            </p>
          </div>
        </div>
      </div>
    </WorkflowPageShell>
  );
}
