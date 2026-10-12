"""Traffic video analysis service using YOLOv11 and OpenCV tracking."""

from __future__ import annotations

import os
import time
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import cv2
import numpy as np

# Path configurations
# video_analysis_service.py is at backend/backend/services/video_analysis_service.py -> .parent.parent.parent is ai-traffic-management-system root
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
STORAGE_DIR = BASE_DIR / "storage"
UPLOADS_DIR = STORAGE_DIR / "uploads"
PROCESSED_DIR = STORAGE_DIR / "processed"
MODEL_PATH = BASE_DIR / "packages" / "cv-pipeline" / "models" / "best.pt"

# Ensure storage directories exist
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

# Colors for bounding boxes & labels (BGR)
CLASS_COLORS = {
    "car": (0, 220, 255),        # Yellow/Gold
    "bus": (255, 140, 0),        # Deep Blue
    "truck": (0, 165, 255),      # Orange
    "bike": (255, 0, 255),       # Magenta
    "ambulance": (0, 0, 255),    # Red
    "police_car": (255, 50, 50), # Red/Blue
    "fire_truck": (0, 0, 220),   # Crimson
}
DEFAULT_COLOR = (0, 255, 100)


@dataclass
class JobProgress:
    job_id: str
    status: str  # "queued" | "processing" | "completed" | "failed"
    progress_pct: int = 0
    current_frame: int = 0
    total_frames: int = 0
    error_message: Optional[str] = None
    created_at: float = field(default_factory=time.time)
    completed_at: Optional[float] = None
    result: Optional[Dict[str, Any]] = None


# In-memory job registry
jobs: Dict[str, JobProgress] = {}


class TrafficVideoAnalyzer:
    """Manages video analysis with Ultralytics YOLOv11 + ByteTrack and counting line."""

    def __init__(self, model_path: Optional[Path] = None):
        self.model_path = model_path or MODEL_PATH
        self._model = None

    def _load_model(self):
        if self._model is None:
            from ultralytics import YOLO
            if not self.model_path.exists():
                raise FileNotFoundError(f"YOLO model weights not found at {self.model_path}")
            self._model = YOLO(str(self.model_path))

    def analyze(
        self,
        job_id: str,
        input_video_path: Path,
        confidence_threshold: float = 0.35,
        max_frames: Optional[int] = None,
        frame_stride: int = 1,
    ) -> Dict[str, Any]:
        """Process video file, track vehicles, and generate annotated output."""
        self._load_model()

        job = jobs.get(job_id)
        if not job:
            raise KeyError(f"Job {job_id} not registered")

        job.status = "processing"
        start_time = time.time()

        cap = cv2.VideoCapture(str(input_video_path))
        if not cap.isOpened():
            job.status = "failed"
            job.error_message = f"Failed to open video file: {input_video_path.name}"
            raise RuntimeError(job.error_message)

        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        total_video_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        frames_to_process = min(total_video_frames, max_frames) if max_frames else total_video_frames
        job.total_frames = frames_to_process

        # Output video configuration
        output_filename = f"annotated_{job_id}.mp4"
        output_video_path = PROCESSED_DIR / output_filename
        # Use mp4v which is universally supported on Windows OpenCV
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out_writer = cv2.VideoWriter(
            str(output_video_path),
            fourcc,
            fps / frame_stride,
            (width, height),
        )

        # Counting line setup: horizontal line at 65% height
        line_y = int(height * 0.65)

        # Tracking state
        # track_id -> class_name
        tracked_vehicles: Dict[int, str] = {}
        # track_id -> last_centroid (x, y)
        previous_centroids: Dict[int, Tuple[int, int]] = {}
        # Count of vehicles crossing counting line by class
        crossed_vehicle_ids: set[int] = set()
        crossed_counts_by_class: Dict[str, int] = {}
        
        # Cumulative detection counts by class (every box count)
        total_detections_by_class: Dict[str, int] = {}
        total_detection_instances = 0

        # Time series: per-second vehicle count snapshots
        time_series: List[Dict[str, Any]] = []

        frame_idx = 0
        processed_count = 0

        try:
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break

                if frame_idx >= frames_to_process:
                    break

                # Apply frame stride if specified
                if frame_idx % frame_stride != 0:
                    frame_idx += 1
                    continue

                # Run YOLO tracking with ByteTrack
                results = self._model.track(
                    frame,
                    persist=True,
                    tracker="bytetrack.yaml",
                    conf=confidence_threshold,
                    verbose=False,
                )[0]

                boxes = results.boxes
                names = results.names

                current_frame_detections = 0

                # Draw counting virtual line
                cv2.line(frame, (0, line_y), (width, line_y), (0, 200, 255), 2)
                cv2.putText(
                    frame,
                    "COUNTING GATE LINE",
                    (15, line_y - 8),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (0, 200, 255),
                    1,
                )

                if boxes is not None and len(boxes) > 0:
                    for box in boxes:
                        cls_id = int(box.cls[0])
                        class_name = names.get(cls_id, f"class_{cls_id}")
                        conf = float(box.conf[0])
                        x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]

                        # Track ID if available
                        track_id = int(box.id[0]) if box.id is not None else -1

                        current_frame_detections += 1
                        total_detection_instances += 1
                        total_detections_by_class[class_name] = total_detections_by_class.get(class_name, 0) + 1

                        centroid_x = int((x1 + x2) / 2)
                        centroid_y = int((y1 + y2) / 2)

                        if track_id != -1:
                            tracked_vehicles[track_id] = class_name

                            # Check for crossing line
                            if track_id in previous_centroids:
                                prev_y = previous_centroids[track_id][1]
                                # Check crossing in either direction
                                if (prev_y < line_y <= centroid_y) or (prev_y > line_y >= centroid_y):
                                    if track_id not in crossed_vehicle_ids:
                                        crossed_vehicle_ids.add(track_id)
                                        crossed_counts_by_class[class_name] = crossed_counts_by_class.get(class_name, 0) + 1

                            previous_centroids[track_id] = (centroid_x, centroid_y)

                        # Draw bounding box & label
                        color = CLASS_COLORS.get(class_name, DEFAULT_COLOR)
                        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                        cv2.circle(frame, (centroid_x, centroid_y), 3, (0, 0, 255), -1)

                        label_text = f"#{track_id} {class_name} {conf:.2f}" if track_id != -1 else f"{class_name} {conf:.2f}"
                        (tw, th), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
                        cv2.rectangle(frame, (x1, y1 - th - 6), (x1 + tw + 4, y1), color, -1)
                        cv2.putText(
                            frame,
                            label_text,
                            (x1 + 2, y1 - 4),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.45,
                            (0, 0, 0),
                            1,
                        )

                # Overlay stats on upper left
                overlay_bg_h = 95
                cv2.rectangle(frame, (10, 10), (320, overlay_bg_h), (20, 30, 40), -1)
                cv2.rectangle(frame, (10, 10), (320, overlay_bg_h), (60, 80, 100), 1)

                cv2.putText(frame, f"MargDrishti Traffic Vision", (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1)
                cv2.putText(frame, f"Frame: {frame_idx + 1}/{frames_to_process}", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (200, 220, 240), 1)
                cv2.putText(frame, f"Live Detections: {current_frame_detections}", (20, 68), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (100, 255, 150), 1)
                cv2.putText(frame, f"Unique Tracked: {len(tracked_vehicles)} | Line Crossings: {len(crossed_vehicle_ids)}", (20, 86), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (255, 200, 100), 1)

                # Write annotated frame
                out_writer.write(frame)

                # Update job progress
                processed_count += 1
                job.current_frame = processed_count
                job.progress_pct = int((processed_count / (frames_to_process / frame_stride)) * 100)

                # Record time series every second of video
                current_sec = int(frame_idx / fps)
                if not time_series or time_series[-1]["second"] != current_sec:
                    time_series.append({
                        "second": current_sec,
                        "active_detections": current_frame_detections,
                        "unique_vehicles_so_far": len(tracked_vehicles),
                        "crossings_so_far": len(crossed_vehicle_ids),
                    })

                frame_idx += 1

        finally:
            cap.release()
            out_writer.release()

        # Compute unique vehicles count by class from tracked dictionary
        unique_counts_by_class: Dict[str, int] = {}
        for _, cname in tracked_vehicles.items():
            unique_counts_by_class[cname] = unique_counts_by_class.get(cname, 0) + 1

        processing_duration = round(time.time() - start_time, 2)
        video_duration_s = round(frames_to_process / fps, 2)

        result_payload = {
            "job_id": job_id,
            "status": "completed",
            "video_metadata": {
                "filename": input_video_path.name,
                "width": width,
                "height": height,
                "fps": round(fps, 1),
                "total_video_frames": total_video_frames,
                "processed_frames": processed_count,
                "video_duration_seconds": video_duration_s,
                "processing_time_seconds": processing_duration,
            },
            "metrics": {
                "total_detection_instances": total_detection_instances,
                "unique_tracked_vehicles": len(tracked_vehicles),
                "line_crossings_count": len(crossed_vehicle_ids),
            },
            "class_breakdown": {
                "unique_vehicles": unique_counts_by_class,
                "line_crossings": crossed_counts_by_class,
                "total_detections": total_detections_by_class,
            },
            "time_series": time_series,
            "artifacts": {
                "annotated_video_url": f"/api/analysis/video/{output_filename}",
                "annotated_video_filename": output_filename,
            },
        }

        job.status = "completed"
        job.progress_pct = 100
        job.completed_at = time.time()
        job.result = result_payload

        return result_payload


analyzer = TrafficVideoAnalyzer()
