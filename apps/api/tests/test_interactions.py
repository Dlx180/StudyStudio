from fastapi.testclient import TestClient

from app.main import app


def test_create_interaction_task_stores_task(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("KNOWTREE_STORAGE_DIR", str(tmp_path))

    response = TestClient(app).post(
        "/api/interaction-tasks",
        json={
            "session_id": "session-demo",
            "task_type": "build_concept_tree",
            "unit_id": "unit-1",
            "unit_title": "1. Course Overview",
            "prompt": "Arrange the concepts into a tree.",
            "context": {
                "page": 1,
                "selection_context": {
                    "text": "ReadingUnit groups source pages.",
                    "page": 1,
                    "source": "sample",
                },
                "visual_node_count": 0,
                "visual_root_count": 0,
            },
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["task_id"].startswith("task-")
    assert payload["session_id"] == "session-demo"
    assert payload["task_type"] == "build_concept_tree"
    assert payload["status"] == "created"
    assert payload["context"]["selection_context"]["page"] == 1
    assert "created_at" in payload


def test_create_evidence_event_and_list_by_session(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("KNOWTREE_STORAGE_DIR", str(tmp_path))
    client = TestClient(app)

    task_response = client.post(
        "/api/interaction-tasks",
        json={
            "session_id": "session-demo",
            "task_type": "build_concept_tree",
            "unit_id": "unit-1",
            "unit_title": "1. Course Overview",
            "prompt": "Arrange the concepts into a tree.",
            "context": {"page": 1},
        },
    )
    task_id = task_response.json()["task_id"]

    evidence_response = client.post(
        "/api/evidence-events",
        json={
            "session_id": "session-demo",
            "task_id": task_id,
            "event_type": "concept_tree_submission",
            "unit_id": "unit-1",
            "unit_title": "1. Course Overview",
            "summary": "Submitted concept tree with 2 nodes.",
            "selection_context": {
                "text": "ReadingUnit groups source pages.",
                "page": 1,
                "source": "sample",
            },
            "payload": {
                "node_count": 2,
                "root_count": 1,
                "draft_text": "Resource -> ReadingUnit",
            },
        },
    )

    assert evidence_response.status_code == 200
    evidence = evidence_response.json()
    assert evidence["event_id"].startswith("evidence-")
    assert evidence["task_id"] == task_id
    assert evidence["event_type"] == "concept_tree_submission"
    assert evidence["payload"]["node_count"] == 2

    list_response = client.get("/api/evidence-events?session_id=session-demo")
    assert list_response.status_code == 200
    events = list_response.json()["events"]
    assert len(events) == 1
    assert events[0]["event_id"] == evidence["event_id"]


def test_evidence_list_filters_by_session(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("KNOWTREE_STORAGE_DIR", str(tmp_path))
    client = TestClient(app)

    for session_id in ("session-a", "session-b"):
        client.post(
            "/api/evidence-events",
            json={
                "session_id": session_id,
                "event_type": "concept_tree_submission",
                "unit_id": "unit-1",
                "unit_title": "1. Course Overview",
                "summary": f"Submitted by {session_id}.",
                "payload": {"node_count": 0, "root_count": 0},
            },
        )

    response = client.get("/api/evidence-events?session_id=session-a")

    assert response.status_code == 200
    events = response.json()["events"]
    assert len(events) == 1
    assert events[0]["session_id"] == "session-a"
