"""Rule-based NextLearningAct v1."""

from __future__ import annotations

import uuid
from typing import Any


def recommend_next_learning_act(events: list[dict[str, Any]], state_summary: dict[str, Any], unit_id: str) -> dict[str, Any]:
    """Return one explainable next learning action for a unit."""
    unit_events = [event for event in events if event.get("unit_id") == unit_id]
    latest_event = unit_events[-1] if unit_events else None
    evidence_refs = [_evidence_ref(latest_event)] if latest_event else []
    status = state_summary.get("status")

    if status in {"needs_review", "weak"}:
        return {
            "act_id": f"next-act-{uuid.uuid4().hex}",
            "act_type": "review",
            "title": "Review the selected passage and retry a smaller check",
            "reason": f"StateOverlay is {status}: mastery {state_summary.get('mastery')} with misconception risk {state_summary.get('misconception_risk')}.",
            "target_unit": _target_unit(latest_event, unit_id),
            "source_refs": latest_event.get("source_refs", []) if latest_event else [],
            "evidence_refs": evidence_refs,
        }

    if status == "understood":
        return {
            "act_id": f"next-act-{uuid.uuid4().hex}",
            "act_type": "practice",
            "title": "Practice the idea on a new example",
            "reason": f"StateOverlay is understood: mastery {state_summary.get('mastery')} and confidence {state_summary.get('confidence')}.",
            "target_unit": _target_unit(latest_event, unit_id),
            "source_refs": latest_event.get("source_refs", []) if latest_event else [],
            "evidence_refs": evidence_refs,
        }

    return {
        "act_id": f"next-act-{uuid.uuid4().hex}",
        "act_type": "probe",
        "title": "Run a quick understanding check",
        "reason": f"StateOverlay is {status}: no strong verification evidence is available yet.",
        "target_unit": _target_unit(latest_event, unit_id),
        "source_refs": latest_event.get("source_refs", []) if latest_event else [],
        "evidence_refs": evidence_refs,
    }


def _evidence_ref(event: dict[str, Any]) -> dict[str, str]:
    return {
        "event_id": event["event_id"],
        "event_type": event["event_type"],
        "summary": event["summary"],
    }


def _target_unit(event: dict[str, Any] | None, unit_id: str) -> dict[str, str]:
    return {
        "unit_id": unit_id,
        "title": str(event.get("unit_title") if event else unit_id),
    }
