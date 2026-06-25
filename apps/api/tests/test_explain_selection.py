from fastapi.testclient import TestClient

from app.main import app


def test_explain_selection_returns_structured_result_with_source_span(tmp_path, monkeypatch) -> None:
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
            "page": 4,
            "text": "A SourceSpan keeps the selected source text traceable across learning interactions.",
        },
    ).json()

    response = client.post(
        "/api/terminal-commands/explain-selection",
        json={
            "session_id": "session-demo",
            "unit_id": "unit-1",
            "unit_title": "1. Course Overview",
            "selection_context": {
                "text": source_span["text"],
                "page": 4,
                "source": "pdf-text-layer",
                "resource": source_span["resource"],
                "source_span": source_span,
            },
            "source_refs": [source_span],
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["result_id"].startswith("terminal-result-")
    assert result["kind"] == "answer"
    assert result["title"] == "Explain this"
    assert result["source_refs"] == [source_span]
    assert result["payload"]["command"] == "explain_selection"
    assert result["payload"]["citation"]["source_span_id"] == source_span["source_span_id"]
    assert result["payload"]["explanation"]["summary"]
    assert result["payload"]["explanation"]["key_points"]
    assert result["payload"]["verification_task"]["prompt"]
    assert result["follow_up_actions"][0]["label"] == "Create verification task"


def test_explain_selection_can_cite_fallback_selection_context(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("KNOWTREE_STORAGE_DIR", str(tmp_path))

    response = TestClient(app).post(
        "/api/terminal-commands/explain-selection",
        json={
            "session_id": "session-demo",
            "unit_id": "unit-1",
            "unit_title": "1. Course Overview",
            "selection_context": {
                "text": "Fallback selected text can still be explained before durable SourceSpan persistence.",
                "page": 2,
                "source": "sample",
            },
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["source_refs"] == []
    assert result["payload"]["citation"] == {
        "label": "page 2 / sample",
        "page": 2,
        "source": "sample",
    }
    assert "page 2 / sample" in result["message"]
    assert result["follow_up_actions"][0]["payload"]["verification_task"]["source"] == "sample"
