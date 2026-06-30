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


def test_create_verification_evidence_event_with_source_ref(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("KNOWTREE_STORAGE_DIR", str(tmp_path))
    client = TestClient(app)

    source_span = client.post(
        "/api/source-spans",
        json={
            "resource": {
                "resource_id": "resource-demo",
                "title": "Demo PDF",
                "kind": "pdf",
            },
            "page": 3,
            "text": "A SourceSpan keeps selected source text traceable.",
        },
    ).json()

    selection_context = {
        "text": "A SourceSpan keeps selected source text traceable.",
        "page": 3,
        "source": "pdf-text-layer",
        "resource": source_span["resource"],
        "source_span": source_span,
    }
    task_response = client.post(
        "/api/interaction-tasks",
        json={
            "session_id": "session-demo",
            "task_type": "quiz",
            "unit_id": "unit-2",
            "unit_title": "2. Core Concepts",
            "prompt": "Explain why SourceSpan matters.",
            "context": {
                "page": 3,
                "selection_context": selection_context,
                "source_refs": [source_span],
                "verification_task_id": "verification-task-demo",
            },
        },
    )
    task_id = task_response.json()["task_id"]

    evidence_response = client.post(
        "/api/evidence-events",
        json={
            "session_id": "session-demo",
            "task_id": task_id,
            "event_type": "verification_submission",
            "unit_id": "unit-2",
            "unit_title": "2. Core Concepts",
            "summary": "Saved an understanding-check response for page 3.",
            "selection_context": selection_context,
            "source_refs": [source_span],
            "payload": {
                "prompt": "Explain why SourceSpan matters.",
                "response_text": "It keeps the answer connected to the selected source.",
                "source_span_id": source_span["source_span_id"],
            },
        },
    )

    assert evidence_response.status_code == 200
    evidence = evidence_response.json()
    assert evidence["event_type"] == "verification_submission"
    assert evidence["task_id"] == task_id
    assert evidence["selection_context"] == selection_context
    assert evidence["source_refs"] == [source_span]
    assert evidence["payload"]["source_span_id"] == source_span["source_span_id"]

    list_response = client.get("/api/evidence-events?session_id=session-demo")
    assert list_response.status_code == 200
    assert list_response.json()["events"][0]["event_id"] == evidence["event_id"]


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
