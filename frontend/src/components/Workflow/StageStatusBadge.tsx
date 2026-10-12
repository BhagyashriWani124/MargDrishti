"use client";

import type { StageStatus } from "@/store/workflowStore";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Lock,
  Loader2,
  Clock,
} from "lucide-react";

interface Props {
  status: StageStatus;
  /** When true, render a compact pill without a text label. */
  compact?: boolean;
  className?: string;
}

interface StatusConfig {
  label: string;
  Icon: React.ElementType;
  /** Tailwind color class for the icon. */
  iconColor: string;
  /** Inline CSS for the pill background and text (theme-aware via CSS vars). */
  pillStyle: React.CSSProperties;
  pillClass: string;
}

function getConfig(status: StageStatus): StatusConfig {
  switch (status) {
    case "completed":
      return {
        label: "Completed",
        Icon: CheckCircle2,
        iconColor: "text-[var(--status-completed-text)]",
        pillStyle: {},
        pillClass:
          "bg-[var(--status-completed-bg)] text-[var(--status-completed-text)]",
      };
    case "running":
      return {
        label: "Running",
        Icon: Loader2,
        iconColor: "text-[var(--status-running-text)] animate-spin",
        pillStyle: {},
        pillClass:
          "bg-[var(--status-running-bg)] text-[var(--status-running-text)]",
      };
    case "failed":
      return {
        label: "Failed",
        Icon: AlertCircle,
        iconColor: "text-[var(--status-failed-text)]",
        pillStyle: {},
        pillClass:
          "bg-[var(--status-failed-bg)] text-[var(--status-failed-text)]",
      };
    case "blocked":
      return {
        label: "Blocked",
        Icon: Lock,
        iconColor: "text-[var(--status-blocked-text)]",
        pillStyle: {},
        pillClass:
          "bg-[var(--status-blocked-bg)] text-[var(--status-blocked-text)]",
      };
    case "ready":
      return {
        label: "Ready",
        Icon: Clock,
        iconColor: "text-[var(--status-ready-text)]",
        pillStyle: {},
        pillClass:
          "bg-[var(--status-ready-bg)] text-[var(--status-ready-text)]",
      };
    case "not-started":
    default:
      return {
        label: "Not started",
        Icon: Circle,
        iconColor: "text-[var(--status-not-started-text)]",
        pillStyle: {},
        pillClass:
          "bg-[var(--status-not-started-bg)] text-[var(--status-not-started-text)]",
      };
  }
}

/**
 * StageStatusBadge — renders a status pill with an icon + readable label.
 * Never relies on color alone: always includes an icon and a text label.
 */
export default function StageStatusBadge({
  status,
  compact = false,
  className = "",
}: Props) {
  const cfg = getConfig(status);
  const { Icon } = cfg;

  if (compact) {
    return (
      <span
        title={cfg.label}
        aria-label={cfg.label}
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${cfg.pillClass} ${className}`}
      >
        <Icon className={`w-3 h-3 ${cfg.iconColor}`} aria-hidden />
      </span>
    );
  }

  return (
    <span
      aria-label={`Status: ${cfg.label}`}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium leading-none ${cfg.pillClass} ${className}`}
    >
      <Icon className={`w-3 h-3 flex-shrink-0 ${cfg.iconColor}`} aria-hidden />
      {cfg.label}
    </span>
  );
}
