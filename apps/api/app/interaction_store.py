"""Local InteractionTask and EvidenceEvent storage for the MVP console slice."""

from __future__ import annotations

import json
import uuid
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from .resource_store import get_storage_root


def _interaction_root() -> Path:
    root = get_storage_root() / "interactions"
    root.mkdir(parents=True, exist_ok=True)
    return root


def _utc_now() -> str:
    return datetime.now(UTC).isoformat()


def _append_jsonl(path: Path, record: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as output:
        output.write(json.dumps(record, ensure_ascii=False) + "\n")


def _read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []

    records: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            records.append(json.loads(line))
    return records


def create_interaction_task(payload: dict[str, Any]) -> dict[str, Any]:
    """Persist an InteractionTask record and return it."""
    record = {
        "task_id": f"task-{uuid.uuid4().hex}",
        "status": "created",
        "created_at": _utc_now(),
        **payload,
    }
    _append_jsonl(_interaction_root() / "tasks.jsonl", record)
    return record


def create_evidence_event(payload: dict[str, Any]) -> dict[str, Any]:
    """Persist an EvidenceEvent record and return it."""
    record = {
        "event_id": f"evidence-{uuid.uuid4().hex}",
        "created_at": _utc_now(),
        **payload,
    }
    _append_jsonl(_interaction_root() / "evidence_events.jsonl", record)
    return record


def list_evidence_events(session_id: str | None = None) -> list[dict[str, Any]]:
    """Return evidence events, optionally scoped to a workspace session."""
    events = _read_jsonl(_interaction_root() / "evidence_events.jsonl")
    if session_id is None:
        return events

    return [event for event in events if event.get("session_id") == session_id]
