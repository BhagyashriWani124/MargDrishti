"use client";

import {
  ScanLine,
  Car,
  Truck,
  Bike,
  AlertCircle,
  CheckCircle2,
  Download,
  Film,
  Layers,
  Activity,
  ArrowRight,
  TrendingUp,
  FileVideo,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import WorkflowPageShell from "@/components/Workflow/WorkflowPageShell";
import { useWorkflowStore } from "@/store/workflowStore";
import { getAnnotatedVideoUrl } from "@/lib/api";

export default function AnalyzeTrafficPage() {
  const latestAnalysisResult = useWorkflowStore((s) => s.latestAnalysisResult);
  const stageState = useWorkflowStore((s) => s.stages["analyze-traffic"]);

  const hasResults = Boolean(latestAnalysisResult && latestAnalysisResult.metrics);

  const videoUrl = latestAnalysisResult?.artifacts?.annotated_video_filename
    ? getAnnotatedVideoUrl(latestAnalysisResult.artifacts.annotated_video_filename)
    : null;

  return (
    <WorkflowPageShell stageId="analyze-traffic">
      <div className="space-y-6">

        {/* ── Active Status Banner ─────────────────────────────────────── */}
        {hasResults ? (
          <div className="md-card p-4 bg-[var(--status-completed-bg)] border-[var(--status-completed-text)] flex items-center justify-between">
            <div className="flex items-center gap-3 text-[var(--status-completed-text)]">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold">Genuine CV Analysis Results Available</p>
                <p className="text-[11px] opacity-90 mt-0.5">
                  Processed from source file &quot;{latestAnalysisResult?.video_metadata?.filename}&quot; with Ultralytics YOLOv11 + ByteTrack.
                </p>
              </div>
            </div>
            {videoUrl && (
              <a
                href={videoUrl}
                download
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border md-border bg-[var(--surface)] hover:bg-[var(--border)] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download Annotated MP4
              </a>
            )}
          </div>
        ) : (
          <div className="md-card p-4 flex gap-3 bg-[var(--status-ready-bg)]">
            <ScanLine className="w-4 h-4 flex-shrink-0 text-[var(--status-ready-text)] mt-0.5" />
            <div className="text-xs text-[var(--status-ready-text)]">
              <p className="font-semibold">No video analysis completed yet</p>
              <p className="mt-0.5">
                Head to{" "}
                <Link href="/workflow/traffic-source" className="underline font-semibold">
                  Step 1 — Traffic Source
                </Link>{" "}
                to upload a traffic video and run the computer-vision detection pipeline.
              </p>
            </div>
          </div>
        )}

        {/* ── Primary KPI Metrics Cards ─────────────────────────────────── */}
        <section aria-label="Detection metrics">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label="Unique Tracked Vehicles"
              value={hasResults ? latestAnalysisResult!.metrics.unique_tracked_vehicles : "—"}
              subtext={hasResults ? "Persistent ByteTrack IDs" : "Awaiting video processing"}
              icon={Car}
              highlight
            />
            <MetricCard
              label="Total Detection Bounding Boxes"
              value={hasResults ? latestAnalysisResult!.metrics.total_detection_instances : "—"}
              subtext={hasResults ? "Cumulative frame-by-frame boxes" : "Awaiting video processing"}
              icon={Layers}
            />
            <MetricCard
              label="Virtual Gate Line Crossings"
              value={hasResults ? latestAnalysisResult!.metrics.line_crossings_count : "—"}
              subtext={hasResults ? "Counted across directional line" : "Awaiting video processing"}
              icon={TrendingUp}
            />
          </div>
        </section>

        {/* ── Annotated Video Player ───────────────────────────────────── */}
        {hasResults && videoUrl && (
          <section aria-label="Annotated video output" className="md-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-[var(--signal-green)]" />
                <h3 className="text-xs font-semibold md-text-primary uppercase tracking-wider">
                  Annotated Video Stream (Detections + Persistent Track IDs + Gate Line)
                </h3>
              </div>
              <span className="text-[11px] font-mono md-text-muted">
                {latestAnalysisResult?.video_metadata?.width}×{latestAnalysisResult?.video_metadata?.height} px · {latestAnalysisResult?.video_metadata?.fps} FPS
              </span>
            </div>

            <div className="rounded-lg overflow-hidden bg-black aspect-video max-h-[460px] flex items-center justify-center">
              <video
                src={videoUrl}
                controls
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <p className="text-[11px] md-text-muted">
              Live bounding boxes with confidence scores, persistent track IDs, vehicle classes, and directional virtual counting gate rendered directly from OpenCV.
            </p>
          </section>
        )}

        {/* ── Vehicle Class Breakdown Table ────────────────────────────── */}
        {hasResults && latestAnalysisResult && (
          <section aria-label="Vehicle breakdown" className="md-card overflow-hidden">
            <div className="px-4 py-3 border-b md-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--signal-green)]" />
                <h3 className="text-xs font-semibold md-text-primary uppercase tracking-wider">
                  Vehicle Counts by Detected Classification
                </h3>
              </div>
              <span className="text-[11px] font-mono md-text-muted">
                YOLOv11 7-Class Dataset
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left" aria-label="Vehicle classifications">
                <thead>
                  <tr className="border-b md-border md-bg md-text-muted">
                    <th className="px-4 py-2.5 font-semibold">Classification Class</th>
                    <th className="px-4 py-2.5 font-semibold">Unique Tracked Vehicles</th>
                    <th className="px-4 py-2.5 font-semibold">Virtual Gate Crossings</th>
                    <th className="px-4 py-2.5 font-semibold">Total Frame Detections</th>
                  </tr>
                </thead>
                <tbody className="divide-y md-border">
                  {Object.keys(latestAnalysisResult.class_breakdown.unique_vehicles).length > 0 ? (
                    Object.entries(latestAnalysisResult.class_breakdown.unique_vehicles).map(([cls, uniqueCount]) => {
                      const crossings = latestAnalysisResult.class_breakdown.line_crossings[cls] || 0;
                      const totalDets = latestAnalysisResult.class_breakdown.total_detections[cls] || 0;
                      return (
                        <tr key={cls} className="hover:bg-[var(--border)] hover:bg-opacity-30 transition-colors">
                          <td className="px-4 py-3 font-medium md-text-primary capitalize flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[var(--signal-green)]" />
                            {cls.replace("_", " ")}
                          </td>
                          <td className="px-4 py-3 font-mono md-text-primary font-semibold">{uniqueCount}</td>
                          <td className="px-4 py-3 font-mono md-text-subtle">{crossings}</td>
                          <td className="px-4 py-3 font-mono md-text-muted">{totalDets}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center md-text-muted">
                        No vehicle classes detected in current range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── Metadata & Verification Details ──────────────────────────── */}
        {hasResults && latestAnalysisResult && (
          <section aria-label="Analysis metadata" className="md-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <FileVideo className="w-4 h-4 text-[var(--text-muted)]" />
              <h3 className="text-xs font-semibold md-text-primary uppercase tracking-wider">
                Execution Metadata & Timing
              </h3>
            </div>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <dt className="md-text-muted">Job ID</dt>
                <dd className="font-mono md-text-primary mt-0.5">{latestAnalysisResult.job_id}</dd>
              </div>
              <div>
                <dt className="md-text-muted">Processed Frames</dt>
                <dd className="font-mono md-text-primary mt-0.5">
                  {latestAnalysisResult.video_metadata.processed_frames} / {latestAnalysisResult.video_metadata.total_video_frames}
                </dd>
              </div>
              <div>
                <dt className="md-text-muted">Processing Time</dt>
                <dd className="font-mono md-text-primary mt-0.5">
                  {latestAnalysisResult.video_metadata.processing_time_seconds} s
                </dd>
              </div>
              <div>
                <dt className="md-text-muted">Video Clip Length</dt>
                <dd className="font-mono md-text-primary mt-0.5">
                  {latestAnalysisResult.video_metadata.video_duration_seconds} s
                </dd>
              </div>
            </dl>
          </section>
        )}

        {/* ── Scientific Integrity Notice ───────────────────────────────── */}
        <div className="md-card p-4 flex gap-3 bg-[var(--status-running-bg)]">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 text-[var(--status-running-text)] mt-0.5" />
          <div className="text-xs text-[var(--status-running-text)] leading-relaxed space-y-1">
            <p className="font-semibold">Metric Integrity & Distinctions</p>
            <p>
              • <strong>Cumulative Detections</strong> represent raw bounding boxes detected across individual frames.
              <br />
              • <strong>Unique Tracked Vehicles</strong> use ByteTrack state to ensure a single physical car observed over 50 consecutive frames is counted as 1 unique vehicle.
              <br />
              • Velocity, queue length, and turning percentages remain unasserted until calibration and road network geometry are verified in Steps 3 & 4.
            </p>
          </div>
        </div>

        {/* ── Next Step Forwarding ─────────────────────────────────────── */}
        {hasResults && (
          <div className="flex justify-end pt-2">
            <Link
              href="/workflow/build-digital-twin"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[var(--signal-green)] text-white hover:opacity-90 transition-opacity"
            >
              Proceed to Step 3: Build Digital Twin
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>
    </WorkflowPageShell>
  );
}

function MetricCard({
  label,
  value,
  subtext,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value: number | string;
  subtext: string;
  icon: React.ElementType;
  highlight?: boolean;
}) {
  return (
    <div className={`md-card p-4 space-y-2 ${highlight ? "border-[var(--signal-green)]" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold md-text-muted uppercase tracking-wider">{label}</span>
        <Icon className={`w-4 h-4 ${highlight ? "text-[var(--signal-green)]" : "md-text-muted"}`} />
      </div>
      <p className="text-2xl font-bold md-text-emphasis font-mono">{value}</p>
      <p className="text-[11px] md-text-muted">{subtext}</p>
    </div>
  );
}
