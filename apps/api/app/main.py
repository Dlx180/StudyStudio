"""FastAPI application shell for KnowTree."""

from typing import Any, Literal

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from .interaction_store import create_evidence_event, create_interaction_task, list_evidence_events
from .mock_data import get_mock_workspace
from .resource_store import ResourceError, load_resource_metadata, save_pdf_resource
from .scheduler import recommend_next_learning_act
from .source_span_store import SourceSpanError, create_source_span, get_source_span
from .state_overlay import summarize_state
from .terminal_commands import explain_selection

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


class ResourceRefPayload(BaseModel):
    resource_id: str = Field(min_length=1)
    title: str = Field(min_length=1)
    kind: Literal["pdf", "pptx", "video", "webpage", "transcript", "markdown", "code_repo", "note", "unknown"]


class SourceSpanCreate(BaseModel):
    resource: ResourceRefPayload
    page: int = Field(ge=1)
    text: str = Field(min_length=1)
    start_offset: int | None = Field(default=None, ge=0)
    end_offset: int | None = Field(default=None, ge=0)
    bbox: tuple[float, float, float, float] | None = None
    created_by: Literal["system", "user", "ai"] = "user"


class SourceSpanRefPayload(BaseModel):
    source_span_id: str = Field(min_length=1)
    resource: ResourceRefPayload
    locator: dict[str, Any]
    text: str | None = None
    bbox: tuple[float, float, float, float] | None = None
    created_by: Literal["system", "user", "ai"]
    created_at: str | None = None


class SelectionContextPayload(BaseModel):
    text: str
    page: int
    source: Literal["pdf-text-layer", "sample"]
    resource: ResourceRefPayload | None = None
    source_span: SourceSpanRefPayload | None = None


class InteractionTaskCreate(BaseModel):
    session_id: str = Field(min_length=1)
    task_type: Literal["build_concept_tree", "ask", "note", "quiz"]
    unit_id: str = Field(min_length=1)
    unit_title: str = Field(min_length=1)
    prompt: str = Field(min_length=1)
    context: dict[str, Any] = Field(default_factory=dict)


class EvidenceEventCreate(BaseModel):
    session_id: str = Field(min_length=1)
    event_type: Literal["concept_tree_submission", "note_saved", "quiz_answer", "verification_submission", "question_asked"]
    unit_id: str = Field(min_length=1)
    unit_title: str = Field(min_length=1)
    summary: str = Field(min_length=1)
    task_id: str | None = None
    selection_context: SelectionContextPayload | None = None
    source_refs: list[SourceSpanRefPayload] = Field(default_factory=list)
    payload: dict[str, Any] = Field(default_factory=dict)


class ExplainSelectionCreate(BaseModel):
    session_id: str = Field(min_length=1)
    unit_id: str = Field(min_length=1)
    unit_title: str = Field(min_length=1)
    selection_context: SelectionContextPayload
    source_refs: list[SourceSpanRefPayload] = Field(default_factory=list)


@app.post("/api/source-spans")
def post_source_span(source_span: SourceSpanCreate) -> dict:
    """Create a durable source reference from selected source text."""
    if (source_span.start_offset is None) != (source_span.end_offset is None):
        raise HTTPException(status_code=400, detail="start_offset and end_offset must be provided together.")

    if source_span.start_offset is not None and source_span.end_offset is not None and source_span.end_offset <= source_span.start_offset:
        raise HTTPException(status_code=400, detail="end_offset must be greater than start_offset.")

    return create_source_span(source_span.model_dump())


@app.get("/api/source-spans/{source_span_id}")
def read_source_span(source_span_id: str) -> dict:
    """Return a persisted SourceSpan."""
    try:
        return get_source_span(source_span_id)
    except SourceSpanError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


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
    return create_evidence_event(event.model_dump(exclude_none=True))


@app.get("/api/evidence-events")
def get_evidence_events(session_id: str | None = Query(default=None)) -> dict[str, list[dict]]:
    """Return persisted evidence events, optionally scoped to a session."""
    return {"events": list_evidence_events(session_id)}


@app.get("/api/state-summary")
def get_state_summary(session_id: str = Query(min_length=1), unit_id: str = Query(min_length=1)) -> dict:
    """Return a conservative StateOverlay summary derived from evidence."""
    return summarize_state(list_evidence_events(session_id), unit_id)


@app.get("/api/next-learning-act")
def get_next_learning_act(session_id: str = Query(min_length=1), unit_id: str = Query(min_length=1)) -> dict:
    """Return one explainable next action from state and evidence."""
    events = list_evidence_events(session_id)
    state_summary = summarize_state(events, unit_id)
    return recommend_next_learning_act(events, state_summary, unit_id)


@app.post("/api/terminal-commands/explain-selection")
def post_explain_selection(command: ExplainSelectionCreate) -> dict:
    """Explain selected source text and return a structured terminal result."""
    return explain_selection(command.model_dump(exclude_none=True))
