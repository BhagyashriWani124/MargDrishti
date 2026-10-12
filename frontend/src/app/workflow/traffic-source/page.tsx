"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileVideo,
  Info,
  AlertCircle,
  PlayCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import WorkflowPageShell from "@/components/Workflow/WorkflowPageShell";
import { useWorkflowStore } from "@/store/workflowStore";
import { api } from "@/lib/api";

const SUPPORTED_EXTENSIONS = [".mp4", ".avi", ".mov", ".mkv"];
const MAX_SIZE_MB = 500;

export default function TrafficSourcePage() {
  const setStageStatus = useWorkflowStore((s) => s.setStageStatus);
  const setLatestAnalysisResult = useWorkflowStore((s) => s.setLatestAnalysisResult);
  const latestAnalysisResult = useWorkflowStore((s) => s.latestAnalysisResult);
  const stageState = useWorkflowStore((s) => s.stages["traffic-source"]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<string>("Reading metadata...");
  const [videoDimensions, setVideoDimensions] = useState<string>("—");
  const [dragging, setDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Analysis trigger settings & state
  const [confidence, setConfidence] = useState<number>(0.35);
  const [maxFrames, setMaxFrames] = useState<string>("150"); // default short clip for responsiveness
  const [frameStride, setFrameStride] = useState<number>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState<number>(0);
  const [jobStatus, setJobStatus] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Revoke object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [videoPreviewUrl]);

  // Handle local file selection
  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const f = files[0];
    setUploadError(null);

    // Validate extension
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      setUploadError(
        `Unsupported file type (${ext}). Supported formats: ${SUPPORTED_EXTENSIONS.join(", ")}`
      );
      return;
    }

    // Validate size
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`File size (${(f.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum limit of ${MAX_SIZE_MB} MB.`);
      return;
    }

    setSelectedFile(f);
    const objectUrl = URL.createObjectURL(f);
    setVideoPreviewUrl(objectUrl);

    // Read video metadata via temporary video element
    const tempVideo = document.createElement("video");
    tempVideo.preload = "metadata";
    tempVideo.src = objectUrl;
    tempVideo.onloadedmetadata = () => {
      const mins = Math.floor(tempVideo.duration / 60);
      const secs = Math.floor(tempVideo.duration % 60);
      setVideoDuration(`${mins}m ${secs}s (${tempVideo.duration.toFixed(1)}s)`);
      setVideoDimensions(`${tempVideo.videoWidth} × ${tempVideo.videoHeight} px`);
    };

    // Stage stays "ready", NOT "completed" merely because a file was selected.
    setStageStatus(
      "traffic-source",
      "ready",
      `Source selected: ${f.name} (${formatBytes(f.size)}) - Ready for analysis`
    );
  }

  // Load a pre-bundled test clip
  async function loadSampleVideo() {
    try {
      setUploadError(null);
      const res = await fetch("/samples/sample_short.mp4");
      if (!res.ok) throw new Error("Could not load sample video");
      const blob = await res.blob();
      const file = new File([blob], "sample_traffic_clip.mp4", { type: "video/mp4" });
      const dt = new DataTransfer();
      dt.items.add(file);
      handleFiles(dt.files);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Failed to load sample clip");
    }
  }

  // Submit video for real Computer Vision analysis
  async function handleStartAnalysis() {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);
    setJobStatus("Uploading video to analysis engine...");
    setJobProgress(5);

    try {
      const framesLimit = maxFrames.trim() ? parseInt(maxFrames, 10) : undefined;
      const uploadRes = await api.uploadVideoForAnalysis(selectedFile, {
        confidence_threshold: confidence,
        max_frames: framesLimit && !isNaN(framesLimit) ? framesLimit : undefined,
        frame_stride: frameStride,
      });

      setActiveJobId(uploadRes.job_id);
      setJobStatus("Processing frames with YOLOv11 & ByteTrack...");
      setStageStatus("traffic-source", "running", `Processing ${selectedFile.name}...`);
      setStageStatus("analyze-traffic", "running", `Detecting & tracking vehicles...`);

      // Poll analysis progress
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await api.getAnalysisJobStatus(uploadRes.job_id);
          setJobProgress(statusRes.progress_pct);

          if (statusRes.status === "completed" && statusRes.result) {
            clearInterval(pollInterval);
            setIsUploading(false);
            setJobStatus("Analysis completed successfully!");
            setLatestAnalysisResult(statusRes.result);

            // Mark Stage 01 and Stage 02 as COMPLETED
            const trackedCount = statusRes.result.metrics.unique_tracked_vehicles;
            const detCount = statusRes.result.metrics.total_detection_instances;
            setStageStatus(
              "traffic-source",
              "completed",
              `Analyzed: ${selectedFile.name} (${statusRes.result.video_metadata.processed_frames} frames processed)`
            );
            setStageStatus(
              "analyze-traffic",
              "completed",
              `Detected ${detCount} vehicle instances (${trackedCount} unique tracked vehicles)`
            );
          } else if (statusRes.status === "failed") {
            clearInterval(pollInterval);
            setIsUploading(false);
            const err = statusRes.error_message || "Video processing failed on backend";
            setUploadError(err);
            setJobStatus("Failed");
            setStageStatus("traffic-source", "failed", err);
          } else {
            setJobStatus(
              `Processing frame ${statusRes.current_frame} of ${statusRes.total_frames || "?"} (${statusRes.progress_pct}%)`
            );
          }
        } catch (pollErr) {
          console.error("Poll error:", pollErr);
        }
      }, 1500);
    } catch (err) {
      setIsUploading(false);
      const msg = err instanceof Error ? err.message : "Failed to initiate video analysis";
      setUploadError(msg);
      setJobStatus(null);
      setStageStatus("traffic-source", "failed", msg);
    }
  }

  return (
    <WorkflowPageShell stageId="traffic-source">
      <div className="space-y-6">

        {/* ── Upload Area ──────────────────────────────────────────────── */}
        <section aria-label="Video upload" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold md-text-primary">
              Import Real Traffic Video
            </h2>
            <button
              type="button"
              onClick={loadSampleVideo}
              disabled={isUploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border md-border hover:bg-[var(--border)] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Load Sample Highway Clip (3s)
            </button>
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-label="Drop a video file here or click to browse"
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => !isUploading && inputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && !isUploading && inputRef.current?.click()}
            className={[
              "md-card flex flex-col items-center justify-center gap-3 py-10 px-6",
              "border-2 border-dashed cursor-pointer transition-all",
              dragging
                ? "border-[var(--signal-green)] bg-[var(--status-completed-bg)]"
                : "border-[var(--border)] hover:border-[var(--text-muted)]",
              isUploading ? "opacity-60 cursor-not-allowed" : "",
            ].join(" ")}
          >
            <div className="w-12 h-12 rounded-full bg-[var(--status-ready-bg)] flex items-center justify-center text-[var(--status-ready-text)]">
              <Upload className="w-6 h-6" aria-hidden />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold md-text-primary">
                {selectedFile ? selectedFile.name : "Select or drag traffic video here"}
              </p>
              <p className="text-xs md-text-muted mt-0.5">
                MP4, AVI, MOV, MKV up to {MAX_SIZE_MB} MB
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept={SUPPORTED_EXTENSIONS.join(",")}
              className="sr-only"
              aria-label="Select traffic video file"
              onChange={(e) => handleFiles(e.target.files)}
              disabled={isUploading}
            />
          </div>

          {uploadError && (
            <div className="p-3 rounded-lg bg-[var(--status-failed-bg)] text-[var(--status-failed-text)] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </section>

        {/* ── Metadata & Configuration (when file is chosen) ────────────── */}
        {selectedFile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File metadata */}
            <section aria-label="Video metadata" className="md-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FileVideo className="w-4 h-4 text-[var(--signal-green)]" />
                <h3 className="text-xs font-semibold md-text-primary uppercase tracking-wider">
                  Video File Metadata
                </h3>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <MetaRow label="File name" value={selectedFile.name} />
                <MetaRow label="File size" value={formatBytes(selectedFile.size)} />
                <MetaRow label="Format" value={selectedFile.type || "video/mp4"} />
                <MetaRow label="Duration" value={videoDuration} />
                <MetaRow label="Resolution" value={videoDimensions} />
              </dl>
              {videoPreviewUrl && (
                <div className="pt-2">
                  <p className="text-[11px] md-text-muted mb-1">Source Preview:</p>
                  <video
                    src={videoPreviewUrl}
                    controls
                    className="w-full max-h-48 rounded bg-black object-contain"
                  />
                </div>
              )}
            </section>

            {/* Analysis Configuration */}
            <section aria-label="Analysis parameters" className="md-card p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-[var(--status-ready-text)]" />
                  <h3 className="text-xs font-semibold md-text-primary uppercase tracking-wider">
                    Pipeline Parameters
                  </h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between md-text-subtle mb-1">
                      <span>Detection Confidence Threshold</span>
                      <span className="font-mono">{Math.round(confidence * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.15}
                      max={0.8}
                      step={0.05}
                      value={confidence}
                      onChange={(e) => setConfidence(parseFloat(e.target.value))}
                      disabled={isUploading}
                      className="w-full accent-[var(--signal-green)]"
                    />
                  </div>

                  <div>
                    <label className="block md-text-subtle mb-1">
                      Frames to Process (blank = all frames)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 150 (approx 6 seconds)"
                      value={maxFrames}
                      onChange={(e) => setMaxFrames(e.target.value)}
                      disabled={isUploading}
                      className="w-full px-3 py-1.5 rounded bg-[var(--bg)] border md-border text-xs md-text-primary"
                    />
                    <span className="text-[10px] md-text-muted">
                      Tip: Keep at 100-200 frames for near-instant verification.
                    </span>
                  </div>

                  <div>
                    <label className="block md-text-subtle mb-1">Frame Stride (1 = every frame)</label>
                    <select
                      value={frameStride}
                      onChange={(e) => setFrameStride(parseInt(e.target.value, 10))}
                      disabled={isUploading}
                      className="w-full px-3 py-1.5 rounded bg-[var(--bg)] border md-border text-xs md-text-primary"
                    >
                      <option value={1}>1 (Full fidelity, all frames)</option>
                      <option value={2}>2 (Every 2nd frame, 2x faster)</option>
                      <option value={3}>3 (Every 3rd frame)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t md-border">
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  disabled={isUploading}
                  className={[
                    "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold",
                    "bg-[var(--signal-green)] text-white hover:opacity-90 transition-all",
                    isUploading ? "opacity-60 cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing Video ({jobProgress}%)
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4" />
                      Run Real Computer Vision Analysis
                    </>
                  )}
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ── Running Status Display ────────────────────────────────────── */}
        {isUploading && (
          <div className="md-card p-5 space-y-3 bg-[var(--status-running-bg)]">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--status-running-text)]">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {jobStatus}
              </span>
              <span className="font-mono">{jobProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--border)] overflow-hidden">
              <div
                className="h-full bg-[var(--signal-amber)] transition-all duration-300"
                style={{ width: `${jobProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Success Banner & Transition to Step 2 ─────────────────────── */}
        {latestAnalysisResult && stageState.status === "completed" && (
          <div className="md-card p-5 bg-[var(--status-completed-bg)] border-[var(--status-completed-text)] space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-[var(--status-completed-text)]">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold">Video Analysis Completed Successfully</h4>
                  <p className="text-xs opacity-90 mt-0.5">
                    Processed {latestAnalysisResult.video_metadata.processed_frames} frames in{" "}
                    {latestAnalysisResult.video_metadata.processing_time_seconds}s.
                  </p>
                </div>
              </div>
              <Link
                href="/workflow/analyze-traffic"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--signal-green)] text-white hover:opacity-90 transition-opacity"
              >
                Inspect Results in Step 2
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </WorkflowPageShell>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="md-text-muted">{label}</dt>
      <dd className="md-text-primary font-medium truncate">{value}</dd>
    </>
  );
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}
