"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Sun, Moon, Map, Wifi, WifiOff } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { useTrafficStore } from "@/store/trafficStore";

export default function AppHeader() {
  const { scheme, toggle, hydrate } = useThemeStore();
  const wsConnected = useTrafficStore((s) => s.wsConnected);
  const status = useTrafficStore((s) => s.status);
  const simTime = useTrafficStore((s) => s.simTime);

  // Hydrate theme from localStorage on first client render.
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const simLabel =
    status === "running"
      ? `Sim · ${formatTime(simTime)}`
      : status === "paused"
      ? `Paused · ${formatTime(simTime)}`
      : null;

  return (
    <header
      className={
        "flex-shrink-0 flex items-center gap-3 px-4 border-b md-border md-surface " +
        "h-[var(--header-height,52px)] z-40"
      }
    >
      {/* ── Brand ─────────────────────────────────────────────────────── */}
      <Link
        href="/"
        className="flex items-center gap-2 select-none flex-shrink-0"
        aria-label="MargDrishti — go to command center"
      >
        <div
          aria-hidden
          className={
            "w-7 h-7 rounded-md flex items-center justify-center " +
            "bg-[var(--signal-green)] text-white"
          }
        >
          <Map className="w-4 h-4" />
        </div>
        <span className="text-[15px] font-bold md-text-emphasis tracking-tight">
          MargDrishti
        </span>
        <span
          className={
            "text-[10px] px-1.5 py-0.5 rounded font-medium " +
            "bg-[var(--status-ready-bg)] text-[var(--status-ready-text)]"
          }
        >
          Digital Twin
        </span>
      </Link>

      {/* ── Spacer ────────────────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Sim status pill (shown when backend is active) ────────────── */}
      {simLabel && (
        <div
          className={
            "hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] " +
            "bg-[var(--status-running-bg)] text-[var(--status-running-text)] font-medium"
          }
          aria-live="polite"
          aria-label={`Simulation: ${simLabel}`}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-[var(--status-running-text)] animate-pulse"
            aria-hidden
          />
          {simLabel}
        </div>
      )}

      {/* ── WebSocket indicator ────────────────────────────────────────── */}
      <div
        title={wsConnected ? "Backend connected" : "Backend disconnected"}
        aria-label={wsConnected ? "Backend connected" : "Backend disconnected"}
        className="flex items-center"
      >
        {wsConnected ? (
          <Wifi className="w-4 h-4 text-[var(--status-completed-text)]" />
        ) : (
          <WifiOff className="w-4 h-4 text-[var(--text-muted)]" />
        )}
      </div>

      {/* ── Theme toggle ──────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={toggle}
        aria-label={
          scheme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
        title={scheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className={
          "flex items-center justify-center w-8 h-8 rounded-lg " +
          "border md-border md-text-subtle " +
          "hover:bg-[var(--border)] hover:text-[var(--text-primary)] " +
          "transition-colors flex-shrink-0"
        }
      >
        {scheme === "dark" ? (
          <Sun className="w-4 h-4" aria-hidden />
        ) : (
          <Moon className="w-4 h-4" aria-hidden />
        )}
      </button>
    </header>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
