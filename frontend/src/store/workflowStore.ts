/**
 * MargDrishti Workflow Store
 *
 * Manages the seven-stage digital-twin workflow state.
 * State is persisted to localStorage on every update so it
 * survives page reloads. Persistence is best-effort (SSR-safe).
 */
"use client";

import { create } from "zustand";

// ── Stage IDs ────────────────────────────────────────────────────────────────
export type StageId =
  | "traffic-source"
  | "analyze-traffic"
  | "build-digital-twin"
  | "calibrate-validate"
  | "run-simulation"
  | "test-whatif"
  | "compare-report";

// ── Stage status ─────────────────────────────────────────────────────────────
export type StageStatus =
  | "not-started"
  | "ready"
  | "running"
  | "completed"
  | "failed"
  | "blocked";

// ── Stage definition (static metadata) ──────────────────────────────────────
export interface StageDef {
  id: StageId;
  number: number;
  label: string;
  shortLabel: string;
  description: string;
  href: string;
  /** Stage IDs that must be completed before this one becomes ready. */
  prerequisites: StageId[];
}

// ── Per-stage runtime state ──────────────────────────────────────────────────
export interface StageState {
  id: StageId;
  status: StageStatus;
  /** ISO timestamp of the most recent status change. */
  updatedAt: string | null;
  /** Optional human-readable note (e.g., error message, file name). */
  note: string | null;
}

// ── Static stage definitions ─────────────────────────────────────────────────
export const STAGE_DEFS: StageDef[] = [
  {
    id: "traffic-source",
    number: 1,
    label: "Traffic Source",
    shortLabel: "Source",
    description: "Import CCTV footage and inspect metadata",
    href: "/workflow/traffic-source",
    prerequisites: [],
  },
  {
    id: "analyze-traffic",
    number: 2,
    label: "Analyze Traffic",
    shortLabel: "Analyze",
    description: "Detect, track, count, and summarize vehicles",
    href: "/workflow/analyze-traffic",
    prerequisites: ["traffic-source"],
  },
  {
    id: "build-digital-twin",
    number: 3,
    label: "Build Digital Twin",
    shortLabel: "Twin",
    description: "Select location and prepare road network",
    href: "/workflow/build-digital-twin",
    prerequisites: ["analyze-traffic"],
  },
  {
    id: "calibrate-validate",
    number: 4,
    label: "Calibrate & Validate",
    shortLabel: "Calibrate",
    description: "Configure demand and validate simulation assumptions",
    href: "/workflow/calibrate-validate",
    prerequisites: ["build-digital-twin"],
  },
  {
    id: "run-simulation",
    number: 5,
    label: "Run Simulation",
    shortLabel: "Simulate",
    description: "Execute the baseline SUMO simulation",
    href: "/workflow/run-simulation",
    prerequisites: ["calibrate-validate"],
  },
  {
    id: "test-whatif",
    number: 6,
    label: "Test What-if Scenarios",
    shortLabel: "What-if",
    description: "Change signal timing, demand, or road conditions",
    href: "/workflow/test-whatif",
    prerequisites: ["run-simulation"],
  },
  {
    id: "compare-report",
    number: 7,
    label: "Compare & Report",
    shortLabel: "Report",
    description: "Compare outcomes and export reports",
    href: "/workflow/compare-report",
    prerequisites: ["test-whatif"],
  },
];

// ── Store interface ──────────────────────────────────────────────────────────
interface WorkflowStore {
  stages: Record<StageId, StageState>;
  latestAnalysisResult: import("@/lib/types").VideoAnalysisResult | null;

  /** Update the status of a single stage. */
  setStageStatus: (id: StageId, status: StageStatus, note?: string) => void;

  /** Save the latest real video analysis result */
  setLatestAnalysisResult: (res: import("@/lib/types").VideoAnalysisResult | null) => void;

  /** Recompute 'blocked' status for all stages that have unmet prerequisites. */
  recomputeBlocked: () => void;

  /** Reset the entire workflow to not-started. */
  resetWorkflow: () => void;

  /** The recommended next stage to act on (first non-completed, non-running). */
  nextStage: () => StageId | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const LS_KEY = "md.workflow.v1";
const LS_ANALYSIS_KEY = "md.analysis.result.v1";

function makeDefaultStages(): Record<StageId, StageState> {
  return Object.fromEntries(
    STAGE_DEFS.map((def) => [
      def.id,
      {
        id: def.id,
        status: def.prerequisites.length === 0 ? "ready" : "blocked",
        updatedAt: null,
        note: null,
      } satisfies StageState,
    ]),
  ) as Record<StageId, StageState>;
}

function loadFromStorage(): Record<StageId, StageState> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Record<StageId, StageState>;
  } catch {
    return null;
  }
}

function saveToStorage(stages: Record<StageId, StageState>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(stages));
  } catch {
    // Quota exceeded or private mode — fail silently.
  }
}

function computeBlockedMap(
  stages: Record<StageId, StageState>,
): Record<StageId, StageState> {
  const next = { ...stages };
  for (const def of STAGE_DEFS) {
    const stage = { ...next[def.id] };
    if (stage.status === "running" || stage.status === "completed") {
      // Running / completed stages keep their status.
      next[def.id] = stage;
      continue;
    }
    const prereqsMet = def.prerequisites.every(
      (pid) => next[pid]?.status === "completed",
    );
    if (!prereqsMet && stage.status !== "failed") {
      stage.status = "blocked";
    } else if (stage.status === "blocked") {
      // Was blocked, now unblocked — promote to ready.
      stage.status = "ready";
    }
    next[def.id] = stage;
  }
  return next;
}

function loadAnalysisFromStorage(): import("@/lib/types").VideoAnalysisResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_ANALYSIS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ── Store ────────────────────────────────────────────────────────────────────
export const useWorkflowStore = create<WorkflowStore>((set, get) => {
  const initial = loadFromStorage() ?? makeDefaultStages();
  const initialAnalysis = loadAnalysisFromStorage();

  return {
    stages: initial,
    latestAnalysisResult: initialAnalysis,

    setStageStatus(id, status, note) {
      set((state) => {
        const updated: Record<StageId, StageState> = {
          ...state.stages,
          [id]: {
            ...state.stages[id],
            status,
            note: note ?? null,
            updatedAt: new Date().toISOString(),
          },
        };
        const recomputed = computeBlockedMap(updated);
        saveToStorage(recomputed);
        return { stages: recomputed };
      });
    },

    setLatestAnalysisResult(res) {
      if (typeof window !== "undefined") {
        try {
          if (res) localStorage.setItem(LS_ANALYSIS_KEY, JSON.stringify(res));
          else localStorage.removeItem(LS_ANALYSIS_KEY);
        } catch {
          // ignore storage errors
        }
      }
      set({ latestAnalysisResult: res });
    },

    recomputeBlocked() {
      set((state) => {
        const recomputed = computeBlockedMap(state.stages);
        saveToStorage(recomputed);
        return { stages: recomputed };
      });
    },

    resetWorkflow() {
      const fresh = makeDefaultStages();
      saveToStorage(fresh);
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(LS_ANALYSIS_KEY);
        } catch {
          // ignore
        }
      }
      set({ stages: fresh, latestAnalysisResult: null });
    },

    nextStage() {
      const { stages } = get();
      for (const def of STAGE_DEFS) {
        const s = stages[def.id];
        if (s.status !== "completed") return def.id;
      }
      return null;
    },
  };
});

// ── Selectors ────────────────────────────────────────────────────────────────
export function selectStageWithDef(
  stages: Record<StageId, StageState>,
  id: StageId,
): { def: StageDef; state: StageState } {
  return {
    def: STAGE_DEFS.find((d) => d.id === id)!,
    state: stages[id],
  };
}

export function selectBlockedByIds(
  stages: Record<StageId, StageState>,
  id: StageId,
): StageId[] {
  const def = STAGE_DEFS.find((d) => d.id === id);
  if (!def) return [];
  return def.prerequisites.filter((pid) => stages[pid]?.status !== "completed");
}

export function selectCompletedCount(stages: Record<StageId, StageState>): number {
  return Object.values(stages).filter((s) => s.status === "completed").length;
}
