from fastapi.testclient import TestClient

from app.main import app


def test_state_summary_without_evidence_stays_reading(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("KNOWTREE_STORAGE_DIR", str(tmp_path))

    response = TestClient(app).get("/api/state-summary?session_id=session-demo&unit_id=unit-1")

    assert response.status_code == 200
    assert response.json() == {
        "status": "reading",
        "mastery": 0.1,
        "confidence": 0.2,
        "misconception_risk": 0.3,
        "evidence_count": 0,
    }


def test_correct_verification_nudges_state_toward_understood(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("KNOWTREE_STORAGE_DIR", str(tmp_path))
    client = TestClient(app)

    client.post(
        "/api/evidence-events",
        json={
            "session_id": "session-demo",
            "event_type": "verification_submission",
            "unit_id": "unit-1",
            "unit_title": "1. Course Overview",
            "summary": "Saved a strong understanding-check response.",
            "selection_context": {
                "text": "ReadingUnit groups source pages.",
                "page": 1,
                "source": "sample",
            },
            "payload": {
                "response_text": "A ReadingUnit is a source-backed chunk that can be measured.",
                "assessment": "correct",
            },
        },
    )

    response = client.get("/api/state-summary?session_id=session-demo&unit_id=unit-1")

    assert response.status_code == 200
    assert response.json()["status"] == "understood"
    assert response.json()["mastery"] == 0.65
    assert response.json()["confidence"] == 0.6
    assert response.json()["evidence_count"] == 1


def test_weak_verification_nudges_state_toward_needs_review(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("KNOWTREE_STORAGE_DIR", str(tmp_path))
    client = TestClient(app)

    client.post(
        "/api/evidence-events",
        json={
            "session_id": "session-demo",
            "event_type": "verification_submission",
            "unit_id": "unit-1",
            "unit_title": "1. Course Overview",
            "summary": "Saved a weak understanding-check response.",
            "payload": {
                "response_text": "I am not sure what the selected passage means.",
                "assessment": "weak",
            },
        },
    )

    response = client.get("/api/state-summary?session_id=session-demo&unit_id=unit-1")

    assert response.status_code == 200
    assert response.json()["status"] == "needs_review"
    assert response.json()["mastery"] == 0.25
    assert response.json()["misconception_risk"] == 0.65


def test_note_alone_does_not_mark_unit_mastered(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("KNOWTREE_STORAGE_DIR", str(tmp_path))
    client = TestClient(app)

    client.post(
        "/api/evidence-events",
        json={
            "session_id": "session-demo",
            "event_type": "note_saved",
            "unit_id": "unit-1",
            "unit_title": "1. Course Overview",
            "summary": "Saved a source-backed note.",
            "payload": {"note": "ReadingUnit is important."},
        },
    )

    response = client.get("/api/state-summary?session_id=session-demo&unit_id=unit-1")

    assert response.status_code == 200
    assert response.json()["status"] == "reading"
    assert response.json()["mastery"] == 0.2
    assert response.json()["evidence_count"] == 1
