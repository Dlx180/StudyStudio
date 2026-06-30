"""Rule-based StateOverlay v1 derived from explicit EvidenceEvents."""

from __future__ import annotations

from typing import Any, Literal

StateStatus = Literal["reading", "weak", "understood", "needs_review"]


def summarize_state(events: list[dict[str, Any]], unit_id: str) -> dict[str, Any]:
    """Return a conservative unit-level StateSummary from evidence."""
    unit_events = [event for event in events if event.get("unit_id") == unit_id]
    if not unit_events:
        return {
            "status": "reading",
            "mastery": 0.1,
            "confidence": 0.2,
            "misconception_risk": 0.3,
            "evidence_count": 0,
        }

    verification_events = [event for event in unit_events if event.get("event_type") == "verification_submission"]
    if verification_events:
        latest_verification = verification_events[-1]
        assessment = str((latest_verification.get("payload") or {}).get("assessment") or "").lower()
        response_text = str((latest_verification.get("payload") or {}).get("response_text") or "").lower()

        if assessment in {"correct", "strong", "understood"}:
            return {
                "status": "understood",
                "mastery": 0.65,
                "confidence": 0.6,
                "misconception_risk": 0.2,
                "evidence_count": len(unit_events),
                "latest_evidence_id": latest_verification.get("event_id"),
            }

        if assessment in {"incorrect", "weak", "failed", "skipped"} or _looks_uncertain(response_text):
            return {
                "status": "needs_review",
                "mastery": 0.25,
                "confidence": 0.3,
                "misconception_risk": 0.65,
                "evidence_count": len(unit_events),
                "latest_evidence_id": latest_verification.get("event_id"),
            }

        return {
            "status": "weak",
            "mastery": 0.35,
            "confidence": 0.35,
            "misconception_risk": 0.5,
            "evidence_count": len(unit_events),
            "latest_evidence_id": latest_verification.get("event_id"),
        }

    return {
        "status": "reading",
        "mastery": 0.2,
        "confidence": 0.25,
        "misconception_risk": 0.35,
        "evidence_count": len(unit_events),
        "latest_evidence_id": unit_events[-1].get("event_id"),
    }


def _looks_uncertain(response_text: str) -> bool:
    uncertainty_markers = ["not sure", "unsure", "don't know", "do not know"]
    return any(marker in response_text for marker in uncertainty_markers)
