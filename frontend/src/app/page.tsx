"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Lock,
  Video,
  ScanLine,
  Globe2,
  Sliders,
  Play,
  FlaskConical,
  BarChart3,
  RefreshCw,
  Map,
} from "lucide-react";
import {
  useWorkflowStore,
  STAGE_DEFS,
  selectCompletedCount,
  type StageId,
} from "@/store/workflowStore";
import StageStatusBadge from "@/components/Workflow/StageStatusBadge";

// Icon map
const ICONS: Record<StageId, React.ElementType> = {
  "traffic-source":     Video,
  "analyze-traffic":    ScanLine,
  "build-digital-twin": Globe2,
  "calibrate-validate": Sliders,
  "run-simulation":     Play,
  "test-whatif":        FlaskConical,
  "compare-report":     BarChart3,
};

export default function CommandCenterPage() {
  const stages = useWorkflowStore((s) => s.stages);
  const resetWorkflow = useWorkflowStore((s) => s.resetWorkflow);
  const nextStageId = useWorkflowStore((s) => s.nextStage)();
  const completedCount = selectCompletedCount(stages);
  const totalStages = STAGE_DEFS.length;
  const progressPct = Math.round((completedCount / totalStages) * 100);

  const nextDef = STAGE_DEFS.find((d) => d.id === nextStageId);

  return (
    <div className="flex-1 overflow-y-auto md-bg">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* ── Page heading ─────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold md-text-emphasis">Command Center</h1>
          <p className="text-[13px] md-text-subtle mt-1">
            Your end-to-end traffic digital-twin workflow at a glance.
          </p>
        </div>

        {/* ── Progress summary ──────────────────────────────────────────── */}
        <div className="md-card p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider md-text-muted">
                Overall Progress
              </p>
              <p className="text-3xl font-bold md-text-emphasis mt-1">
                {completedCount}
                <span className="text-xl md-text-subtle font-normal">
                  /{totalStages} stages
                </span>
              </p>
            </div>
            {nextDef && (
              <Link
                href={nextDef.href}
                className={
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm " +
                  "bg-[var(--signal-green)] text-white hover:opacity-90 transition-opacity flex-shrink-0"
                }
              >
                Continue
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            )}
            {!nextDef && completedCount === totalStages && (
              <span className="flex items-center gap-1.5 text-sm text-[var(--status-completed-text)] font-medium">
                <CheckCircle2 className="w-4 h-4" aria-hidden />
                All stages complete
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div>
            <div
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Workflow progress: ${progressPct}%`}
              className="w-full h-2 rounded-full bg-[var(--border)] overflow-hidden"
            >
              <div
                className="h-full rounded-full bg-[var(--signal-green)] transition-[width] duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-[11px] md-text-muted mt-1">{progressPct}% complete</p>
          </div>

          {/* Next step detail */}
          {nextDef && (
            <div className="pt-2 border-t md-border">
              <p className="text-[12px] md-text-subtle mb-1">Recommended next step</p>
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = ICONS[nextDef.id];
                  return <Icon className="w-4 h-4 text-[var(--signal-green)]" aria-hidden />;
                })()}
                <span className="text-[13px] font-medium md-text-primary">
                  {nextDef.number}. {nextDef.label}
                </span>
                <StageStatusBadge status={stages[nextDef.id].status} />
              </div>
              <p className="text-[12px] md-text-muted mt-0.5 ml-6">
                {nextDef.description}
              </p>
            </div>
          )}
        </div>

        {/* ── Workflow grid ─────────────────────────────────────────────── */}
        <section aria-label="Workflow stages">
          <h2 className="text-[13px] font-semibold md-text-subtle uppercase tracking-wider mb-3">
            Workflow Stages
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {STAGE_DEFS.map((def) => {
              const Icon = ICONS[def.id];
              const state = stages[def.id];
              const isBlocked = state.status === "blocked";

              return (
                <Link
                  key={def.id}
                  href={def.href}
                  className={
                    "md-card p-4 flex flex-col gap-2 hover:shadow-card-md " +
                    "transition-shadow group " +
                    (isBlocked ? "opacity-60" : "")
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 " +
                          (state.status === "completed"
                            ? "bg-[var(--status-completed-bg)] text-[var(--status-completed-text)]"
                            : isBlocked
                            ? "bg-[var(--border)] text-[var(--text-muted)]"
                            : "bg-[var(--status-ready-bg)] text-[var(--status-ready-text)]")
                        }
                      >
                        {isBlocked ? (
                          <Lock className="w-4 h-4" aria-hidden />
                        ) : (
                          <Icon className="w-4 h-4" aria-hidden />
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold md-text-muted">
                          Step {def.number}
                        </p>
                        <p className="text-[13px] font-semibold md-text-primary leading-tight">
                          {def.label}
                        </p>
                      </div>
                    </div>
                    <StageStatusBadge status={state.status} compact />
                  </div>
                  <p className="text-[12px] md-text-muted leading-snug">
                    {def.description}
                  </p>
                  {isBlocked && (
                    <p className="text-[11px] text-[var(--status-blocked-text)] flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" aria-hidden />
                      Complete earlier steps first
                    </p>
                  )}
                  {state.note && (
                    <p className="text-[11px] md-text-subtle border-t md-border pt-1.5 leading-snug">
                      {state.note}
                    </p>
                  )}
                  {/* Navigation arrow */}
                  <div className="flex justify-end mt-auto pt-1">
                    <ArrowRight
                      className="w-3.5 h-3.5 md-text-muted group-hover:text-[var(--signal-green)] transition-colors"
                      aria-hidden
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── System status cards ───────────────────────────────────────── */}
        <section aria-label="System status">
          <h2 className="text-[13px] font-semibold md-text-subtle uppercase tracking-wider mb-3">
            System Status
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatusCard
              label="Video Analysis"
              description="CCTV processing pipeline"
              stage="analyze-traffic"
            />
            <StatusCard
              label="Digital Twin"
              description="Road network model"
              stage="build-digital-twin"
            />
            <StatusCard
              label="Simulation"
              description="SUMO execution engine"
              stage="run-simulation"
            />
          </div>
        </section>

        {/* ── Map placeholder ───────────────────────────────────────────── */}
        <section aria-label="Map overview">
          <h2 className="text-[13px] font-semibold md-text-subtle uppercase tracking-wider mb-3">
            Location Overview
          </h2>
          <div className="md-card flex items-center justify-center h-48 gap-3 flex-col">
            <Map className="w-10 h-10 md-text-muted" aria-hidden />
            <div className="text-center">
              <p className="text-[13px] font-medium md-text-subtle">
                No location selected
              </p>
              <p className="text-[12px] md-text-muted mt-0.5">
                Complete{" "}
                <Link
                  href="/workflow/build-digital-twin"
                  className="text-[var(--status-ready-text)] hover:underline"
                >
                  Step 3 — Build Digital Twin
                </Link>{" "}
                to configure a location and see the road network here.
              </p>
            </div>
          </div>
        </section>

        {/* ── Recent activity placeholder ────────────────────────────────── */}
        <section aria-label="Recent activity">
          <h2 className="text-[13px] font-semibold md-text-subtle uppercase tracking-wider mb-3">
            Recent Activity
          </h2>
          <RecentActivity />
        </section>

        {/* ── Danger zone ────────────────────────────────────────────────── */}
        <section aria-label="Danger zone" className="border-t md-border pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold md-text-primary">
                Reset Workflow
              </p>
              <p className="text-[12px] md-text-muted mt-0.5">
                Clears all stage progress. This does not delete any files or simulation runs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    "Reset all workflow stage progress? Existing files and simulation runs are not affected.",
                  )
                ) {
                  resetWorkflow();
                }
              }}
              className={
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium " +
                "border border-[var(--signal-red)] text-[var(--status-failed-text)] " +
                "hover:bg-[var(--status-failed-bg)] transition-colors"
              }
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden />
              Reset
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatusCard({
  label,
  description,
  stage,
}: {
  label: string;
  description: string;
  stage: StageId;
}) {
  const stageState = useWorkflowStore((s) => s.stages[stage]);
  const def = STAGE_DEFS.find((d) => d.id === stage)!;

  return (
    <div className="md-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold md-text-primary">{label}</p>
        <StageStatusBadge status={stageState.status} />
      </div>
      <p className="text-[12px] md-text-muted">{description}</p>
      {stageState.status === "blocked" && (
        <p className="text-[11px] text-[var(--status-blocked-text)] flex items-center gap-1">
          <Lock className="w-2.5 h-2.5" aria-hidden />
          <span>
            Navigate to{" "}
            <Link href={def.href} className="underline">
              Step {def.number}
            </Link>{" "}
            to unlock
          </span>
        </p>
      )}
    </div>
  );
}

function RecentActivity() {
  const stages = useWorkflowStore((s) => s.stages);
  const recent = Object.values(stages)
    .filter((s) => s.updatedAt !== null)
    .sort((a, b) =>
      (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
    )
    .slice(0, 5);

  if (recent.length === 0) {
    return (
      <div className="md-card flex items-center gap-3 p-5 text-[13px] md-text-muted">
        <Clock className="w-5 h-5 flex-shrink-0" aria-hidden />
        No activity yet. Start with Step 1 — Traffic Source.
      </div>
    );
  }

  return (
    <ul className="md-card divide-y md-border">
      {recent.map((s) => {
        const def = STAGE_DEFS.find((d) => d.id === s.id);
        if (!def) return null;
        const Icon = ICONS[s.id];
        return (
          <li key={s.id} className="flex items-center gap-3 px-4 py-3">
            <Icon className="w-4 h-4 md-text-muted flex-shrink-0" aria-hidden />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium md-text-primary truncate">
                {def.label}
              </p>
              {s.note && (
                <p className="text-[11px] md-text-muted truncate">{s.note}</p>
              )}
            </div>
            <StageStatusBadge status={s.status} />
            <time
              dateTime={s.updatedAt ?? ""}
              className="text-[11px] md-text-muted flex-shrink-0 hidden sm:block"
            >
              {s.updatedAt ? new Date(s.updatedAt).toLocaleTimeString() : ""}
            </time>
          </li>
        );
      })}
    </ul>
  );
}
