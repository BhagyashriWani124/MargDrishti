"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import {
  useWorkflowStore,
  STAGE_DEFS,
  selectBlockedByIds,
  type StageId,
  type StageStatus,
} from "@/store/workflowStore";
import StageStatusBadge from "./StageStatusBadge";

interface Props {
  stageId: StageId;
  children: React.ReactNode;
  /** Optional override for the action button label. */
  actionLabel?: string;
  /** Optional callback for action button (e.g. "Start Analysis"). */
  onAction?: () => void;
  /** When true, the action button shows a loading state. */
  actionLoading?: boolean;
  /** When provided, disables the action button with this reason. */
  actionDisabledReason?: string;
}

/**
 * WorkflowPageShell — standard page wrapper for all 7 workflow stages.
 * Handles stage header, status badge, prerequisite blocking, prev/next nav.
 */
export default function WorkflowPageShell({
  stageId,
  children,
  actionLabel,
  onAction,
  actionLoading,
  actionDisabledReason,
}: Props) {
  const stages = useWorkflowStore((s) => s.stages);
  const setStageStatus = useWorkflowStore((s) => s.setStageStatus);
  const def = STAGE_DEFS.find((d) => d.id === stageId)!;
  const state = stages[stageId];

  const blockedBy = selectBlockedByIds(stages, stageId);
  const isBlocked = state.status === "blocked";

  const defIndex = STAGE_DEFS.findIndex((d) => d.id === stageId);
  const prevDef = defIndex > 0 ? STAGE_DEFS[defIndex - 1] : null;
  const nextDef = defIndex < STAGE_DEFS.length - 1 ? STAGE_DEFS[defIndex + 1] : null;

  return (
    <div className="flex-1 overflow-y-auto md-bg">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* ── Breadcrumb ───────────────────────────────────────────────── */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] md-text-muted">
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
            Command Center
          </Link>
          <span aria-hidden>›</span>
          <span className="md-text-subtle">Step {def.number}</span>
          <span aria-hidden>›</span>
          <span className="md-text-primary font-medium">{def.label}</span>
        </nav>

        {/* ── Stage header ─────────────────────────────────────────────── */}
        <div className="md-card p-5">
          <div className="flex items-start gap-4">
            {/* Step number */}
            <div
              aria-hidden
              className={
                "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center " +
                "text-lg font-bold border-2 " +
                (isBlocked
                  ? "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]"
                  : state.status === "completed"
                  ? "border-[var(--signal-green)] bg-[var(--status-completed-bg)] text-[var(--status-completed-text)]"
                  : "border-[var(--status-ready-text)] bg-[var(--status-ready-bg)] text-[var(--status-ready-text)]")
              }
            >
              {def.number}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-xl font-bold md-text-emphasis">{def.label}</h1>
                  <p className="text-[13px] md-text-subtle mt-0.5">{def.description}</p>
                </div>
                <StageStatusBadge status={state.status} />
              </div>

              {/* Note */}
              {state.note && (
                <p className="text-[12px] md-text-muted mt-2 border-t md-border pt-2">
                  {state.note}
                </p>
              )}

              {/* Action button */}
              {actionLabel && onAction && !isBlocked && (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={onAction}
                    disabled={!!actionDisabledReason || actionLoading}
                    title={actionDisabledReason}
                    aria-busy={actionLoading}
                    className={
                      "px-4 py-2 rounded-lg text-[13px] font-semibold transition-opacity " +
                      "bg-[var(--signal-green)] text-white " +
                      "disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                    }
                  >
                    {actionLoading ? "Working…" : actionLabel}
                  </button>
                  {actionDisabledReason && (
                    <span className="text-[11px] md-text-muted">{actionDisabledReason}</span>
                  )}
                </div>
              )}

              {/* Dev-mode manual status controls */}
              <DevStatusControls stageId={stageId} currentStatus={state.status} />
            </div>
          </div>
        </div>

        {/* ── Blocked state ─────────────────────────────────────────────── */}
        {isBlocked && (
          <div
            role="alert"
            className={
              "md-card border-[var(--status-blocked-text)] p-5 flex items-start gap-3 " +
              "bg-[var(--status-blocked-bg)]"
            }
          >
            <Lock
              className="w-5 h-5 flex-shrink-0 text-[var(--status-blocked-text)] mt-0.5"
              aria-hidden
            />
            <div>
              <p className="text-[13px] font-semibold text-[var(--status-blocked-text)]">
                Prerequisites required
              </p>
              <p className="text-[12px] md-text-muted mt-0.5">
                Complete the following stages before accessing this one:
              </p>
              <ul className="mt-2 space-y-1">
                {blockedBy.map((pid) => {
                  const pDef = STAGE_DEFS.find((d) => d.id === pid)!;
                  return (
                    <li key={pid}>
                      <Link
                        href={pDef.href}
                        className="text-[13px] text-[var(--status-ready-text)] hover:underline flex items-center gap-1"
                      >
                        <ArrowRight className="w-3 h-3" aria-hidden />
                        Step {pDef.number}: {pDef.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {/* ── Page content ─────────────────────────────────────────────── */}
        {!isBlocked && children}

        {/* ── Navigation row ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-4 border-t md-border">
          {prevDef ? (
            <Link
              href={prevDef.href}
              className="flex items-center gap-1.5 text-[13px] md-text-subtle hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden />
              {prevDef.label}
            </Link>
          ) : (
            <div />
          )}
          {nextDef ? (
            <Link
              href={nextDef.href}
              className="flex items-center gap-1.5 text-[13px] md-text-subtle hover:text-[var(--text-primary)] transition-colors"
            >
              {nextDef.label}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          ) : (
            <div />
          )}
        </div>

      </div>
    </div>
  );
}

// ── Dev controls: allow manually setting stage status for UI testing ──────

const STATUS_OPTIONS: StageStatus[] = [
  "not-started",
  "ready",
  "running",
  "completed",
  "failed",
];

function DevStatusControls({
  stageId,
  currentStatus,
}: {
  stageId: StageId;
  currentStatus: StageStatus;
}) {
  const setStageStatus = useWorkflowStore((s) => s.setStageStatus);

  if (process.env.NODE_ENV === "production") return null;

  return (
    <details className="mt-3">
      <summary className="text-[10px] font-mono md-text-muted cursor-pointer select-none hover:text-[var(--text-subtle)]">
        [DEV] Override stage status
      </summary>
      <div className="flex flex-wrap gap-1 mt-1.5">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStageStatus(stageId, s, s === "completed" ? "Completed via dev override" : undefined)}
            className={
              "text-[10px] font-mono px-2 py-0.5 rounded border transition-colors " +
              (currentStatus === s
                ? "border-[var(--status-ready-text)] text-[var(--status-ready-text)]"
                : "border-[var(--border)] md-text-muted hover:md-text-primary")
            }
          >
            {s}
          </button>
        ))}
      </div>
    </details>
  );
}
