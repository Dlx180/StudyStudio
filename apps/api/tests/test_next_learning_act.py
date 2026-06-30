from fastapi.testclient import TestClient

from app.main import app


def test_next_learning_act_recommends_review_for_weak_state(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("KNOWTREE_STORAGE_DIR", str(tmp_path))
    client = TestClient(app)

    evidence = client.post(
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
    ).json()

    response = client.get("/api/next-learning-act?session_id=session-demo&unit_id=unit-1")

    assert response.status_code == 200
    act = response.json()
    assert act["act_type"] == "review"
    assert "review" in act["title"].lower()
    assert "needs_review" in act["reason"]
    assert act["evidence_refs"] == [
        {
            "event_id": evidence["event_id"],
            "event_type": "verification_submission",
            "summary": "Saved a weak understanding-check response.",
        }
    ]


def test_next_learning_act_recommends_practice_for_understood_state(tmp_path, monkeypatch) -> None:
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
            "payload": {
                "response_text": "A ReadingUnit is a source-backed learning chunk.",
                "assessment": "correct",
            },
        },
    )

    response = client.get("/api/next-learning-act?session_id=session-demo&unit_id=unit-1")

    assert response.status_code == 200
    act = response.json()
    assert act["act_type"] == "practice"
    assert "practice" in act["title"].lower()
    assert "understood" in act["reason"]


def test_next_learning_act_recommends_probe_without_evidence(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("KNOWTREE_STORAGE_DIR", str(tmp_path))

    response = TestClient(app).get("/api/next-learning-act?session_id=session-demo&unit_id=unit-1")

    assert response.status_code == 200
    act = response.json()
    assert act["act_type"] == "probe"
    assert "check" in act["title"].lower()
    assert act["evidence_refs"] == []
