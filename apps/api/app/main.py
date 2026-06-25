"""FastAPI application shell for KnowTree."""

from typing import Any, Literal

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from .interaction_store import create_evidence_event, create_interaction_task, list_evidence_events
from .mock_data import get_mock_workspace
from .resource_store import ResourceError, load_resource_metadata, save_pdf_resource

app = FastAPI(
    title="KnowTree API",
    version="0.1.0",
    description="API shell for the MVP reading workflow.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SelectionContextPayload(BaseModel):
    text: str
    page: int
    source: Literal["pdf-text-layer", "sample"]


class InteractionTaskCreate(BaseModel):
    session_id: str = Field(min_length=1)
    task_type: Literal["build_concept_tree", "ask", "note", "quiz"]
    unit_id: str = Field(min_length=1)
    unit_title: str = Field(min_length=1)
    prompt: str = Field(min_length=1)
    context: dict[str, Any] = Field(default_factory=dict)


class EvidenceEventCreate(BaseModel):
    session_id: str = Field(min_length=1)
    event_type: Literal["concept_tree_submission", "note_saved", "quiz_answer", "question_asked"]
    unit_id: str = Field(min_length=1)
    unit_title: str = Field(min_length=1)
    summary: str = Field(min_length=1)
    task_id: str | None = None
    selection_context: SelectionContextPayload | None = None
    payload: dict[str, Any] = Field(default_factory=dict)


@app.get("/health")
def health() -> dict[str, str]:
    """Return API liveness for local development and smoke tests."""
    return {"status": "ok", "service": "knowtree-api"}


@app.get("/api/mock-workspace")
def mock_workspace() -> dict:
    """Return mock Resource and UnitTree data for the first workspace UI."""
    return get_mock_workspace()


@app.post("/api/resources/upload")
def upload_resource(file: UploadFile = File(...)) -> dict:
    """Upload a PDF Resource and return its stored metadata."""
    try:
        return save_pdf_resource(file.filename or "uploaded.pdf", file.file)
    except ResourceError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/resources/{resource_id}")
def get_resource(resource_id: str) -> dict:
    """Return metadata for a stored Resource."""
    try:
        return load_resource_metadata(resource_id)
    except ResourceError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.get("/api/resources/{resource_id}/file")
def get_resource_file(resource_id: str) -> FileResponse:
    """Return the original PDF file for frontend rendering."""
    try:
        metadata = load_resource_metadata(resource_id)
    except ResourceError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return FileResponse(
        metadata["storage_path"],
        media_type="application/pdf",
        filename=metadata["original_filename"],
    )


@app.post("/api/interaction-tasks")
def post_interaction_task(task: InteractionTaskCreate) -> dict:
    """Create a structured task that asks the user to do learning work."""
    return create_interaction_task(task.model_dump())


@app.post("/api/evidence-events")
def post_evidence_event(event: EvidenceEventCreate) -> dict:
    """Create a learning evidence event from user interaction output."""
    return create_evidence_event(event.model_dump())


@app.get("/api/evidence-events")
def get_evidence_events(session_id: str | None = Query(default=None)) -> dict[str, list[dict]]:
    """Return persisted evidence events, optionally scoped to a session."""
    return {"events": list_evidence_events(session_id)}
