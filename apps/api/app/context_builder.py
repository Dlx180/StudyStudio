"""Build bounded StudyStudio context packs for terminal and AI commands."""

from __future__ import annotations

from typing import Any

from .interaction_store import list_evidence_events
from .resource_store import ResourceError, load_resource_pages

MAX_PAGE_TEXT_CHARS = 1200
MAX_SELECTED_SPANS = 3
MAX_RECENT_EVIDENCE = 5


def _clip(text: str, limit: int) -> str:
    compact = " ".join((text or "").split())
    if len(compact) <= limit:
        return compact
    return f"{compact[: limit - 3]}..."


def build_current_unit_context(payload: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    """Build a serializable, bounded context pack for `/ask`."""
    warnings: list[str] = []
    resource = payload.get("resource")
    current_page = payload.get("current_page")
    source_refs = payload.get("source_refs") or []
    session_id = payload["session_id"]

    page_context: list[dict[str, Any]] = []
    if resource and current_page:
        try:
            pages = load_resource_pages(resource["resource_id"])
            for page in pages:
                if page.get("page") == current_page:
                    page_context.append(
                        {
                            "page": page["page"],
                            "locator": page["locator"],
                            "text": _clip(page.get("text", ""), MAX_PAGE_TEXT_CHARS),
                            "extraction_status": page.get("extraction_status", "failed"),
                        }
                    )
                    break
            if not page_context:
                warnings.append(f"No Page record found for page {current_page}.")
        except ResourceError:
            warnings.append("Active resource page text was not found.")
    elif not resource:
        warnings.append("No active resource supplied.")
    else:
        warnings.append("No current page supplied.")

    recent_evidence = [
        {
            "event_id": event["event_id"],
            "event_type": event["event_type"],
            "summary": event["summary"],
        }
        for event in list_evidence_events(session_id)[-MAX_RECENT_EVIDENCE:]
    ]

    selected_spans = []
    for source_ref in source_refs[:MAX_SELECTED_SPANS]:
        selected_spans.append(
            {
                "source_span_id": source_ref["source_span_id"],
                "locator": source_ref.get("locator"),
                "text": _clip(source_ref.get("text") or "", MAX_PAGE_TEXT_CHARS // 2),
            }
        )

    context = {
        "session_id": session_id,
        "active_resource": resource,
        "active_locator": {"kind": "pdf_page", "resource_id": resource["resource_id"], "page": current_page}
        if resource and current_page
        else None,
        "active_unit": {
            "unit_id": payload["unit_id"],
            "title": payload["unit_title"],
        },
        "selected_spans": selected_spans,
        "page_context": page_context,
        "recent_evidence": recent_evidence,
    }
    return context, warnings
