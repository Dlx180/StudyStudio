"""Local SourceSpan storage for the MVP source-reference slice."""

from __future__ import annotations

import json
import uuid
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from .resource_store import get_storage_root


class SourceSpanError(ValueError):
    """Raised when a SourceSpan cannot be created or found."""


def _source_span_root() -> Path:
    root = get_storage_root() / "source_spans"
    root.mkdir(parents=True, exist_ok=True)
    return root


def _utc_now() -> str:
    return datetime.now(UTC).isoformat()


def _source_span_path() -> Path:
    return _source_span_root() / "source_spans.jsonl"


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


def create_source_span(payload: dict[str, Any]) -> dict[str, Any]:
    """Persist a SourceSpan for selected source text and return it."""
    resource = payload["resource"]
    resource_id = resource["resource_id"]
    page = payload["page"]
    start_offset = payload.get("start_offset")
    end_offset = payload.get("end_offset")

    if start_offset is None or end_offset is None:
        locator = {
            "kind": "pdf_page",
            "resource_id": resource_id,
            "page": page,
        }
    else:
        locator = {
            "kind": "pdf_text_range",
            "resource_id": resource_id,
            "page": page,
            "start_offset": start_offset,
            "end_offset": end_offset,
        }

    record = {
        "source_span_id": f"source-span-{uuid.uuid4().hex}",
        "resource": resource,
        "locator": locator,
        "text": payload["text"],
        "created_by": payload.get("created_by", "user"),
        "created_at": _utc_now(),
    }

    bbox = payload.get("bbox")
    if bbox is not None:
        record["bbox"] = bbox

    _append_jsonl(_source_span_path(), record)
    return record


def get_source_span(source_span_id: str) -> dict[str, Any]:
    """Return one SourceSpan by id."""
    for source_span in _read_jsonl(_source_span_path()):
        if source_span.get("source_span_id") == source_span_id:
            return source_span

    raise SourceSpanError("SourceSpan was not found.")
