"use client";

import { Globe2, MapPin, Network, AlertCircle } from "lucide-react";
import WorkflowPageShell from "@/components/Workflow/WorkflowPageShell";

const EXAMPLE_LOCATIONS = [
  { name: "Bellevue 116th & NE 12th", lat: 47.6062, lon: -122.1876, source: "Existing SUMO files" },
  { name: "Bellevue 150th & Newport",  lat: 47.5236, lon: -122.1869, source: "Existing SUMO files" },
];

export default function BuildDigitalTwinPage() {
  return (
    <WorkflowPageShell stageId="build-digital-twin">
      <div className="space-y-4">

        {/* Location selection */}
        <section className="md-card p-5 space-y-4">
          <h2 className="text-[13px] font-semibold md-text-primary">
            Select Road Network Location
          </h2>
          <p className="text-[12px] md-text-subtle">
            Choose a real-world intersection. The road network will be prepared as
            SUMO network files (edges, nodes, connections) for simulation.
          </p>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider md-text-muted">
              Available Networks (from existing sumo_files)
            </p>
            {EXAMPLE_LOCATIONS.map((loc) => (
              <div key={loc.name} className="md-card p-4 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[var(--signal-green)] flex-shrink-0 mt-0.5" aria-hidden />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium md-text-primary">{loc.name}</p>
                  <p className="text-[11px] md-text-muted mt-0.5">
                    {loc.lat.toFixed(4)}°N, {Math.abs(loc.lon).toFixed(4)}°W · {loc.source}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Network structure */}
        <section className="md-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 md-text-subtle" aria-hidden />
            <h2 className="text-[13px] font-semibold md-text-primary">
              SUMO Network Components
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[12px]">
            {["nod.xml (Nodes)", "edg.xml (Edges)", "type.xml (Road types)", "route.rou.xml (Routes)", "sumo_config.sumocfg", "net.xml (Compiled)"].map((c) => (
              <div key={c} className="md-card px-3 py-2 md-text-subtle font-mono text-[11px]">
                {c}
              </div>
            ))}
          </div>
        </section>

        {/* Map placeholder */}
        <section className="md-card flex items-center justify-center h-52 flex-col gap-2">
          <Globe2 className="w-10 h-10 md-text-muted" aria-hidden />
          <p className="text-[13px] font-medium md-text-subtle">
            Map integration placeholder
          </p>
          <p className="text-[12px] md-text-muted text-center max-w-xs">
            A real map (e.g. Leaflet or MapMyIndia) will render here once
            a location is selected and network coordinates are available.
          </p>
        </section>

        <div className="md-card p-4 flex gap-3 bg-[var(--status-running-bg)]">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-[var(--status-running-text)] mt-0.5" aria-hidden />
          <p className="text-[12px] text-[var(--status-running-text)]">
            <strong>Note (UI demo):</strong> Network import from OSM or MapMyIndia is not
            connected. The existing <code className="font-mono text-[11px]">sumo_files/</code> directory
            contains pre-built networks you can use directly.
          </p>
        </div>

      </div>
    </WorkflowPageShell>
  );
}
