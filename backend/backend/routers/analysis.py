"""FastAPI router for Traffic Video Analysis (YOLO detection + tracking)."""

from __future__ import annotations

import shutil
import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from ..services.video_analysis_service import (
    PROCESSED_DIR,
    UPLOADS_DIR,
    JobProgress,
    analyzer,
    jobs,
)

router = APIRouter()

ALLOWED_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv"}
MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024  # 500 MB limit


@router.post("/upload-and-analyze")
async def upload_and_analyze(
    background_tasks: BackgroundTasks,
    video: UploadFile = File(...),
    confidence_threshold: float = Form(0.35),
    max_frames: Optional[int] = Form(None),
    frame_stride: int = Form(1),
):
    """Accept video file upload and queue detection analysis."""
    if not video.filename:
        raise HTTPException(status_code=400, detail="No video file provided.")

    ext = Path(video.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    job_id = f"job_{uuid.uuid4().hex[:10]}"
    safe_filename = f"{job_id}_{video.filename.replace(' ', '_')}"
    saved_path = UPLOADS_DIR / safe_filename

    # Stream file to disk to handle larger videos safely
    bytes_read = 0
    with open(saved_path, "wb") as buffer:
        while chunk := await video.read(1024 * 1024):  # 1MB chunks
            bytes_read += len(chunk)
            if bytes_read > MAX_FILE_SIZE_BYTES:
                saved_path.unlink(missing_ok=True)
                raise HTTPException(
                    status_code=413,
                    detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024*1024)} MB",
                )
            buffer.write(chunk)

    # Register initial job progress
    jobs[job_id] = JobProgress(
        job_id=job_id,
        status="queued",
    )

    # Run analysis in background or synchronously if short
    def run_worker():
        try:
            analyzer.analyze(
                job_id=job_id,
                input_video_path=saved_path,
                confidence_threshold=confidence_threshold,
                max_frames=max_frames,
                frame_stride=max(1, frame_stride),
            )
        except Exception as e:
            if job_id in jobs:
                jobs[job_id].status = "failed"
                jobs[job_id].error_message = str(e)

    background_tasks.add_task(run_worker)

    return {
        "job_id": job_id,
        "filename": video.filename,
        "file_size_bytes": bytes_read,
        "status": "queued",
        "message": "Video uploaded successfully. Analysis running in background.",
    }


@router.get("/status/{job_id}")
async def get_job_status(job_id: str):
    """Poll progress and metrics for a specific analysis job."""
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Analysis job '{job_id}' not found.")

    return {
        "job_id": job.job_id,
        "status": job.status,
        "progress_pct": job.progress_pct,
        "current_frame": job.current_frame,
        "total_frames": job.total_frames,
        "error_message": job.error_message,
        "result": job.result,
    }


@router.get("/video/{filename}")
async def get_processed_video(filename: str):
    """Stream or download the annotated video artifact."""
    file_path = PROCESSED_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Processed video file not found.")

    return FileResponse(
        path=str(file_path),
        media_type="video/mp4",
        filename=filename,
    )
