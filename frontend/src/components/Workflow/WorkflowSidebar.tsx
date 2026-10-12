"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Video,
  ScanLine,
  Globe2,
  Sliders,
  Play,
  FlaskConical,
  BarChart3,
  Database,
  Settings,
  ChevronLeft,
  ChevronRight,
  Lock,
  ArrowRight,
} from "lucide-react";
import { useWorkflowStore, STAGE_DEFS, type StageId } from "@/store/workflowStore";
import StageStatusBadge from "./StageStatusBadge";

// ── Icon map ─────────────────────────────────────────────────────────────────
const STAGE_ICONS: Record<StageId, React.ElementType> = {
  "traffic-source":    Video,
  "analyze-traffic":   ScanLine,
  "build-digital-twin": Globe2,
  "calibrate-validate": Sliders,
  "run-simulation":    Play,
  "test-whatif":       FlaskConical,
  "compare-report":    BarChart3,
};

// ── System links ─────────────────────────────────────────────────────────────
const SYSTEM_LINKS = [
  { label: "Data & Run History", href: "/data-history", Icon: Database },
  { label: "Settings",           href: "/settings",     Icon: Settings },
];

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export default function WorkflowSidebar({ collapsed, onToggle }: Props) {
  const pathname = usePathname();
  const stages = useWorkflowStore((s) => s.stages);

  return (
    <aside
      data-sidebar
      aria-label="Workflow navigation"
      style={{ width: collapsed ? 64 : 280 }}
      className={
        "flex-shrink-0 flex flex-col border-r md-border md-surface " +
        "overflow-hidden transition-[width] duration-[220ms] ease-in-out"
      }
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-3 border-b md-border">
        {!collapsed && (
          <span className="text-[11px] font-semibold uppercase tracking-widest md-text-muted select-none">
            Workflow
          </span>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={
            "flex items-center justify-center w-7 h-7 rounded-md md-text-subtle " +
            "hover:bg-[var(--border)] transition-colors flex-shrink-0 " +
            (collapsed ? "mx-auto" : "ml-auto")
          }
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* ── Workflow stages ─────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-2" aria-label="Workflow stages">
        <ol className="relative px-3 space-y-1">
          {STAGE_DEFS.map((def, i) => {
            const Icon = STAGE_ICONS[def.id];
            const state = stages[def.id];
            const isActive =
              pathname === def.href || pathname.startsWith(def.href + "/");
            const isBlocked = state.status === "blocked";
            const isCompleted = state.status === "completed";
            const isLast = i === STAGE_DEFS.length - 1;

            return (
              <li key={def.id} className="relative">
                {/* ── Connector line between steps ── */}
                {!isLast && (
                  <div
                    aria-hidden
                    className={
                      "absolute left-[22px] top-[38px] bottom-[-6px] w-px " +
                      (isCompleted
                        ? "bg-[var(--signal-green)] opacity-60"
                        : "bg-[var(--border)]")
                    }
                  />
                )}

                <Link
                  href={def.href}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={
                    collapsed
                      ? `${def.number}. ${def.label} — ${state.status}`
                      : undefined
                  }
                  title={collapsed ? `${def.number}. ${def.label}` : undefined}
                  className={[
                    "relative flex items-start gap-3 px-2 py-2 rounded-lg",
                    "transition-colors group",
                    isActive
                      ? "bg-[var(--status-ready-bg)]"
                      : "hover:bg-[var(--border)] hover:bg-opacity-40",
                  ].join(" ")}
                >
                  {/* ── Step number bubble ── */}
                  <div
                    className={[
                      "flex-shrink-0 flex items-center justify-center",
                      "w-7 h-7 rounded-full text-xs font-bold leading-none",
                      "border-2 transition-colors",
                      isCompleted
                        ? "border-[var(--signal-green)] bg-[var(--status-completed-bg)] text-[var(--status-completed-text)]"
                        : isActive
                        ? "border-[var(--status-ready-text)] bg-[var(--status-ready-bg)] text-[var(--status-ready-text)]"
                        : isBlocked
                        ? "border-[var(--border)] bg-[var(--status-not-started-bg)] text-[var(--text-muted)]"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-subtle)]",
                    ].join(" ")}
                    aria-hidden
                  >
                    {isBlocked ? (
                      <Lock className="w-3 h-3" />
                    ) : (
                      def.number
                    )}
                  </div>

                  {/* ── Label area (hidden in collapsed mode) ── */}
                  {!collapsed && (
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={[
                            "text-[13px] font-medium leading-tight truncate",
                            isActive
                              ? "text-[var(--text-emphasis)]"
                              : "text-[var(--text-primary)]",
                          ].join(" ")}
                        >
                          {def.label}
                        </span>
                        <StageStatusBadge status={state.status} compact />
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-snug line-clamp-2">
                        {def.description}
                      </p>
                      {isBlocked && (
                        <p className="text-[11px] text-[var(--status-blocked-text)] mt-1 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5 flex-shrink-0" aria-hidden />
                          Requires previous steps
                        </p>
                      )}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* ── System section ──────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t md-border py-2 px-3">
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] px-2 mb-1">
            System
          </p>
        )}
        <ul className="space-y-0.5">
          {SYSTEM_LINKS.map(({ label, href, Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  title={collapsed ? label : undefined}
                  aria-label={collapsed ? label : undefined}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "flex items-center gap-3 px-2 py-2 rounded-lg transition-colors",
                    active
                      ? "bg-[var(--border)] text-[var(--text-emphasis)]"
                      : "text-[var(--text-subtle)] hover:bg-[var(--border)] hover:bg-opacity-50 hover:text-[var(--text-primary)]",
                  ].join(" ")}
                >
                  <Icon
                    className={[
                      "flex-shrink-0 w-4 h-4",
                      collapsed ? "mx-auto" : "",
                    ].join(" ")}
                    aria-hidden
                  />
                  {!collapsed && (
                    <span className="text-[13px] font-medium">{label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Continue prompt (expanded only) ─────────────────────────────── */}
      {!collapsed && <ContinuePrompt />}
    </aside>
  );
}

function ContinuePrompt() {
  const nextStage = useWorkflowStore((s) => s.nextStage)();
  if (!nextStage) return null;
  const def = STAGE_DEFS.find((d) => d.id === nextStage);
  if (!def) return null;

  return (
    <div className="flex-shrink-0 border-t md-border p-3">
      <Link
        href={def.href}
        className={
          "flex items-center justify-between gap-2 w-full px-3 py-2 rounded-lg " +
          "bg-[var(--signal-green)] text-white text-[12px] font-semibold " +
          "hover:opacity-90 transition-opacity"
        }
      >
        <span className="truncate">Continue → {def.shortLabel}</span>
        <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
      </Link>
    </div>
  );
}
