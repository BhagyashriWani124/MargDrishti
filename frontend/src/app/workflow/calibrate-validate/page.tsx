"use client";

import { Sliders, AlertCircle, Info } from "lucide-react";
import WorkflowPageShell from "@/components/Workflow/WorkflowPageShell";

interface DemandRow {
  direction: string;
  observed: string;
  simulated: string;
  delta: string;
  acceptable: boolean;
}

// Placeholder rows — clearly labelled as [MOCK DATA]
const MOCK_DEMAND: DemandRow[] = [
  { direction: "NE → SW (main)", observed: "—",    simulated: "—",    delta: "—", acceptable: false },
  { direction: "NW → SE",        observed: "—",    simulated: "—",    delta: "—", acceptable: false },
  { direction: "Left turns",     observed: "—",    simulated: "—",    delta: "—", acceptable: false },
];

export default function CalibrateValidatePage() {
  return (
    <WorkflowPageShell stageId="calibrate-validate">
      <div className="space-y-4">

        {/* Demand configuration */}
        <section className="md-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[var(--signal-green)]" aria-hidden />
            <h2 className="text-[13px] font-semibold md-text-primary">
              Traffic Demand Configuration
            </h2>
          </div>
          <p className="text-[12px] md-text-subtle">
            Configure vehicle demand derived from analysis output. Values feed
            directly into the SUMO route files.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField label="Total vehicles" unit="veh" placeholder="e.g. 500" />
            <InputField label="Simulation duration" unit="min" placeholder="e.g. 10" />
            <InputField label="Peak period start" unit="hh:mm" placeholder="07:30" />
            <InputField label="Dominant direction" unit="" placeholder="NE–SW" />
          </div>
        </section>

        {/* Validation table */}
        <section className="md-card overflow-hidden">
          <div className="px-4 py-3 border-b md-border flex items-center justify-between">
            <h2 className="text-[13px] font-semibold md-text-primary">
              Observation vs. Simulation Comparison
            </h2>
            <span className="text-[10px] font-mono md-text-muted px-2 py-0.5 rounded border md-border">
              [MOCK DATA — not real results]
            </span>
          </div>
          <table className="w-full text-[12px]" aria-label="Demand validation table">
            <thead>
              <tr className="border-b md-border">
                {["Direction", "Observed", "Simulated", "Δ", "Acceptable"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-2 text-[11px] font-semibold md-text-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_DEMAND.map((row) => (
                <tr key={row.direction} className="border-b md-border last:border-0">
                  <td className="px-4 py-3 md-text-primary">{row.direction}</td>
                  <td className="px-4 py-3 md-text-muted">{row.observed}</td>
                  <td className="px-4 py-3 md-text-muted">{row.simulated}</td>
                  <td className="px-4 py-3 md-text-muted">{row.delta}</td>
                  <td className="px-4 py-3 md-text-muted">Pending analysis</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="md-card p-4 flex gap-3 bg-[var(--status-ready-bg)]">
          <Info className="w-4 h-4 flex-shrink-0 text-[var(--status-ready-text)] mt-0.5" aria-hidden />
          <p className="text-[12px] text-[var(--status-ready-text)]">
            The existing <code className="font-mono text-[11px]">calibration.py</code> and{" "}
            <code className="font-mono text-[11px]">ratio.py</code> scripts in TrafficDT perform
            vehicle-count calibration. Their output will populate this table once integrated.
          </p>
        </div>

        <div className="md-card p-4 flex gap-3 bg-[var(--status-running-bg)]">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-[var(--status-running-text)] mt-0.5" aria-hidden />
          <p className="text-[12px] text-[var(--status-running-text)]">
            <strong>Note (UI demo):</strong> The table above shows structural mock data.
            No calibration computation has occurred. Run <code>calibration.py</code> first
            and connect its output to populate real values.
          </p>
        </div>

      </div>
    </WorkflowPageShell>
  );
}

function InputField({ label, unit, placeholder }: { label: string; unit: string; placeholder: string }) {
  return (
    <div>
      <label className="block text-[11px] font-medium md-text-muted mb-1">
        {label} {unit && <span className="md-text-muted">({unit})</span>}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        aria-label={label}
        className={
          "w-full px-3 py-2 rounded-lg text-[13px] md-text-primary " +
          "bg-[var(--bg)] border md-border " +
          "focus:outline-none focus:border-[var(--status-ready-text)] transition-colors"
        }
      />
    </div>
  );
}
