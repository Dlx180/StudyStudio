"""Terminal command handlers for the first StudyStudio learning loop."""

from __future__ import annotations

import re
import uuid
from datetime import UTC, datetime
from typing import Any

from .ai_provider import AIProviderError, get_ai_provider
from .context_builder import build_current_unit_context


def _utc_now() -> str:
    return datetime.now(UTC).isoformat()


def _compact_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _preview(text: str, limit: int = 180) -> str:
    compacted = _compact_whitespace(text)
    if len(compacted) <= limit:
        return compacted

    return f"{compacted[: limit - 3]}..."


def _citation(selection_context: dict[str, Any], source_refs: list[dict[str, Any]]) -> dict[str, Any]:
    if source_refs:
        source_ref = source_refs[0]
        locator = source_ref.get("locator", {})
        page = locator.get("page", selection_context.get("page"))
        return {
            "label": f"page {page} / {source_ref['source_span_id']}",
            "source_span_id": source_ref["source_span_id"],
            "page": page,
            "locator": locator,
        }

    page = selection_context["page"]
    source = selection_context["source"]
    return {
        "label": f"page {page} / {source}",
        "page": page,
        "source": source,
    }


def explain_selection(payload: dict[str, Any]) -> dict[str, Any]:
    """Return a structured mock explanation for selected source text."""
    selection_context = payload["selection_context"]
    source_refs = payload.get("source_refs") or []
    selected_text = _compact_whitespace(selection_context["text"])
    selected_preview = _preview(selected_text)
    citation = _citation(selection_context, source_refs)

    explanation = {
        "summary": f"This passage is about: {selected_preview}",
        "key_points": [
            "Locate the main claim before memorizing details.",
            "Name the relationship between the key terms in your own words.",
            "Check which part of the passage is definition, condition, process, or consequence.",
        ],
        "study_hint": "After reading the explanation, close the source and restate the passage from memory.",
    }
    verification_task = {
        "task_type": "short_answer",
        "prompt": "Explain the selected passage in your own words, then name one term you are still unsure about.",
        "source_excerpt": selected_preview,
        "source": selection_context["source"],
        "page": selection_context["page"],
        "source_span_id": source_refs[0]["source_span_id"] if source_refs else None,
    }

    return {
        "result_id": f"terminal-result-{uuid.uuid4().hex}",
        "kind": "answer",
        "title": "Explain this",
        "message": f"{explanation['summary']} Cited from {citation['label']}.",
        "source_refs": source_refs,
        "payload": {
            "command": "explain_selection",
            "selection_context": selection_context,
            "citation": citation,
            "explanation": explanation,
            "verification_task": verification_task,
            "mocked": True,
            "created_at": _utc_now(),
        },
        "follow_up_actions": [
            {
                "action": "open_visual_task",
                "label": "Create verification task",
                "payload": {"verification_task": verification_task},
            }
        ],
    }


def ask_question(payload: dict[str, Any]) -> dict[str, Any]:
    """Answer a learner question from bounded StudyStudio context."""
    question = _compact_whitespace(payload["question"])
    context, warnings = build_current_unit_context(payload)
    try:
        provider = get_ai_provider()
        answer = provider.answer_question(question=question, context=context)
    except AIProviderError as exc:
        answer = f"StudyStudio could not get an AI answer: {exc}"
        provider_name = locals().get("provider").name if "provider" in locals() else "unavailable"
        failed = True
    else:
        provider_name = provider.name
        failed = False

    return {
        "result_id": f"terminal-result-{uuid.uuid4().hex}",
        "kind": "answer" if not failed else "system",
        "title": "Ask StudyStudio",
        "message": answer,
        "source_refs": payload.get("source_refs") or [],
        "payload": {
            "command": "ask",
            "question": question,
            "answer": answer,
            "provider": provider_name,
            "context": context,
            "context_warnings": warnings,
            "mocked": provider_name == "fake",
            "created_at": _utc_now(),
        },
        "follow_up_actions": [],
    }
