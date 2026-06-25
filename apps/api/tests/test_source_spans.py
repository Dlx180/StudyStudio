from fastapi.testclient import TestClient

from app.main import app


def test_create_pdf_text_range_source_span_and_read_it(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("KNOWTREE_STORAGE_DIR", str(tmp_path))
    client = TestClient(app)

    response = client.post(
        "/api/source-spans",
        json={
            "resource": {
                "resource_id": "resource-demo",
                "title": "Demo PDF",
                "kind": "pdf",
            },
            "page": 3,
            "text": "ReadingUnit groups source pages into a learning-sized unit.",
            "start_offset": 12,
            "end_offset": 68,
            "created_by": "user",
        },
    )

    assert response.status_code == 200
    source_span = response.json()
    assert source_span["source_span_id"].startswith("source-span-")
    assert source_span["resource"]["resource_id"] == "resource-demo"
    assert source_span["locator"] == {
        "kind": "pdf_text_range",
        "resource_id": "resource-demo",
        "page": 3,
        "start_offset": 12,
        "end_offset": 68,
    }
    assert source_span["text"] == "ReadingUnit groups source pages into a learning-sized unit."
    assert source_span["created_by"] == "user"

    read_response = client.get(f"/api/source-spans/{source_span['source_span_id']}")

    assert read_response.status_code == 200
    assert read_response.json() == source_span


def test_create_source_span_uses_page_locator_when_offsets_are_missing(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("KNOWTREE_STORAGE_DIR", str(tmp_path))
    client = TestClient(app)

    response = client.post(
        "/api/source-spans",
        json={
            "resource": {
                "resource_id": "resource-demo",
                "title": "Demo PDF",
                "kind": "pdf",
            },
            "page": 2,
            "text": "A selected passage without stable text offsets.",
            "bbox": [10.5, 20.0, 300.25, 80.75],
        },
    )

    assert response.status_code == 200
    source_span = response.json()
    assert source_span["locator"] == {
        "kind": "pdf_page",
        "resource_id": "resource-demo",
        "page": 2,
    }
    assert source_span["bbox"] == [10.5, 20.0, 300.25, 80.75]
    assert source_span["created_by"] == "user"


def test_source_span_rejects_incomplete_or_reversed_offsets(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("KNOWTREE_STORAGE_DIR", str(tmp_path))
    client = TestClient(app)

    base_payload = {
        "resource": {
            "resource_id": "resource-demo",
            "title": "Demo PDF",
            "kind": "pdf",
        },
        "page": 1,
        "text": "Offset ranges must be complete and ordered.",
    }

    incomplete_response = client.post("/api/source-spans", json={**base_payload, "start_offset": 3})
    reversed_response = client.post("/api/source-spans", json={**base_payload, "start_offset": 8, "end_offset": 4})

    assert incomplete_response.status_code == 400
    assert incomplete_response.json()["detail"] == "start_offset and end_offset must be provided together."
    assert reversed_response.status_code == 400
    assert reversed_response.json()["detail"] == "end_offset must be greater than start_offset."


def test_evidence_event_can_attach_source_refs(tmp_path, monkeypatch) -> None:
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
            "page": 1,
            "text": "Evidence should point back to trusted source material.",
        },
    ).json()

    response = client.post(
        "/api/evidence-events",
        json={
            "session_id": "session-demo",
            "event_type": "note_saved",
            "unit_id": "unit-1",
            "unit_title": "1. Course Overview",
            "summary": "Saved a source-backed note.",
            "source_refs": [source_span],
            "payload": {"note": "This passage defines the key unit."},
        },
    )

    assert response.status_code == 200
    evidence = response.json()
    assert evidence["source_refs"] == [source_span]

    list_response = client.get("/api/evidence-events?session_id=session-demo")

    assert list_response.status_code == 200
    assert list_response.json()["events"][0]["source_refs"] == [source_span]
