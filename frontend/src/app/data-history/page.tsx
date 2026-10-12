"use client";

import { useState } from "react";
import { Database, Search, ArrowUpRight, History, Calendar, RefreshCw, Layers } from "lucide-react";
import Link from "next/link";

interface RunItem {
  id: string;
  name: string;
  network: string;
  policy: string;
  date: string;
  vehicles: number;
  duration: string;
  status: "completed" | "failed" | "archived";
}

const SAMPLE_RUNS: RunItem[] = [
  {
    id: "run-2026-10-12-001",
    name: "Bellevue 116th Baseline",
    network: "Arterial",
    policy: "Actuated",
    date: "2026-10-12 11:20",
    vehicles: 420,
    duration: "10m 00s",
    status: "completed",
  },
  {
    id: "run-2026-10-11-004",
    name: "Highway 150th Metering ALINEA",
    network: "Highway Metered",
    policy: "ALINEA",
    date: "2026-10-11 16:45",
    vehicles: 750,
    duration: "15m 00s",
    status: "completed",
  },
  {
    id: "run-2026-10-11-002",
    name: "Stress Test NS Corridor",
    network: "Combined",
    policy: "Fixed Time",
    date: "2026-10-11 09:12",
    vehicles: 900,
    duration: "04m 20s",
    status: "failed",
  },
];

export default function DataHistoryPage() {
  const [filter, setFilter] = useState("");

  const filteredRuns = SAMPLE_RUNS.filter(
    (r) =>
      r.name.toLowerCase().includes(filter.toLowerCase()) ||
      r.network.toLowerCase().includes(filter.toLowerCase()) ||
      r.policy.toLowerCase().includes(filter.toLowerCase()) ||
      r.id.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto md-bg">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs md-text-muted">
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
            Command Center
          </Link>
          <span aria-hidden>›</span>
          <span className="md-text-subtle">System</span>
          <span aria-hidden>›</span>
          <span className="md-text-primary font-medium">Data & Run History</span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[var(--signal-green)]" />
              <h1 className="text-xl font-bold md-text-emphasis">Data & Run History</h1>
            </div>
            <p className="text-xs md-text-subtle mt-1">
              Inspect historical SUMO simulations, calibrated parameter snapshots, and benchmark logs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/lab"
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium border md-border hover:bg-[var(--border)] transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              Open Lab Experiments
            </Link>
          </div>
        </div>

        {/* Filter bar */}
        <div className="md-card p-3 flex items-center gap-3">
          <Search className="w-4 h-4 md-text-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Filter runs by name, network, policy, or ID..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-transparent text-xs md-text-primary placeholder:text-[var(--text-muted)] focus:outline-none"
          />
          {filter && (
            <button
              onClick={() => setFilter("")}
              className="text-xs md-text-muted hover:text-[var(--text-primary)]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Runs Table */}
        <section className="md-card overflow-hidden">
          <div className="px-4 py-3 border-b md-border flex items-center justify-between">
            <span className="text-xs font-semibold md-text-primary">Recorded Simulation Runs</span>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              {filteredRuns.length} total recorded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left" aria-label="Data and run history table">
              <thead>
                <tr className="border-b md-border md-bg md-text-muted">
                  <th className="px-4 py-2.5 font-semibold">Run Name & ID</th>
                  <th className="px-4 py-2.5 font-semibold">Network Architecture</th>
                  <th className="px-4 py-2.5 font-semibold">Signal Policy</th>
                  <th className="px-4 py-2.5 font-semibold">Date / Time</th>
                  <th className="px-4 py-2.5 font-semibold">Vehicles</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y md-border">
                {filteredRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-[var(--border)] hover:bg-opacity-30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium md-text-primary">{run.name}</p>
                      <p className="font-mono text-[10px] md-text-muted">{run.id}</p>
                    </td>
                    <td className="px-4 py-3 md-text-subtle">{run.network}</td>
                    <td className="px-4 py-3 md-text-subtle">{run.policy}</td>
                    <td className="px-4 py-3 md-text-muted">{run.date}</td>
                    <td className="px-4 py-3 font-mono md-text-primary">{run.vehicles}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          run.status === "completed"
                            ? "bg-[var(--status-completed-bg)] text-[var(--status-completed-text)]"
                            : "bg-[var(--status-failed-bg)] text-[var(--status-failed-text)]"
                        }`}
                      >
                        {run.status === "completed" ? "Completed" : "Failed"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/lab`}
                        className="inline-flex items-center gap-1 text-[11px] text-[var(--status-ready-text)] hover:underline"
                      >
                        Inspect
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
