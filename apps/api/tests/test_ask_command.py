from io import BytesIO

from fastapi.testclient import TestClient
from pypdf import PdfWriter
from pypdf.generic import DecodedStreamObject, DictionaryObject, NameObject

from app.main import app


def make_text_pdf(page_texts: list[str]) -> bytes:
    writer = PdfWriter()
    font = DictionaryObject(
        {
            NameObject("/Type"): NameObject("/Font"),
            NameObject("/Subtype"): NameObject("/Type1"),
            NameObject("/BaseFont"): NameObject("/Helvetica"),
        }
    )
    font_ref = writer._add_object(font)

    for text in page_texts:
        page = writer.add_blank_page(width=300, height=200)
        page[NameObject("/Resources")] = DictionaryObject({NameObject("/Font"): DictionaryObject({NameObject("/F1"): font_ref})})
        stream = DecodedStreamObject()
        escaped = text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        stream.set_data(f"BT /F1 12 Tf 50 150 Td ({escaped}) Tj ET".encode("utf-8"))
        page[NameObject("/Contents")] = writer._add_object(stream)

    buffer = BytesIO()
    writer.write(buffer)
    return buffer.getvalue()


def upload_text_pdf(client: TestClient, page_texts: list[str]) -> dict:
    response = client.post(
        "/api/resources/upload",
        files={"file": ("ask-context.pdf", make_text_pdf(page_texts), "application/pdf")},
    )
    assert response.status_code == 200
    return response.json()


def test_ask_uses_fake_provider_with_bounded_current_page_context(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("KNOWTREE_STORAGE_DIR", str(tmp_path))
    monkeypatch.setenv("STUDYSTUDIO_AI_PROVIDER", "fake")
    client = TestClient(app)
    long_text = " ".join(["SourceSpan context should stay bounded."] * 120)
    resource = upload_text_pdf(client, [long_text, "Second page should not be included by default."])

    evidence_response = client.post(
        "/api/evidence-events",
        json={
            "session_id": "session-ask",
            "event_type": "question_asked",
            "unit_id": "unit-1",
            "unit_title": "1. Course Overview",
            "summary": "Earlier question about source spans.",
            "payload": {"question": "What is SourceSpan?"},
        },
    )
    assert evidence_response.status_code == 200

    response = client.post(
        "/api/terminal-commands/ask",
        json={
            "session_id": "session-ask",
            "unit_id": "unit-1",
            "unit_title": "1. Course Overview",
            "question": "What should I focus on here?",
            "current_page": 1,
            "resource": {
                "resource_id": resource["resource_id"],
                "title": resource["title"],
                "kind": resource["kind"],
            },
            "source_refs": [],
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["kind"] == "answer"
    assert result["title"] == "Ask StudyStudio"
    assert result["payload"]["command"] == "ask"
    assert result["payload"]["provider"] == "fake"
    assert result["payload"]["context"]["active_resource"]["resource_id"] == resource["resource_id"]
    assert result["payload"]["context"]["active_unit"]["unit_id"] == "unit-1"
    assert result["payload"]["context"]["page_context"][0]["page"] == 1
    assert len(result["payload"]["context"]["page_context"][0]["text"]) <= 1200
    assert "Second page should not be included" not in result["payload"]["context"]["page_context"][0]["text"]
    assert result["payload"]["context"]["recent_evidence"][0]["summary"] == "Earlier question about source spans."
    assert "Fake answer" in result["message"]


def test_ask_handles_missing_resource_context_with_warning(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("KNOWTREE_STORAGE_DIR", str(tmp_path))
    monkeypatch.setenv("STUDYSTUDIO_AI_PROVIDER", "fake")
    client = TestClient(app)

    response = client.post(
        "/api/terminal-commands/ask",
        json={
            "session_id": "session-missing-context",
            "unit_id": "unit-1",
            "unit_title": "1. Course Overview",
            "question": "Can you explain this unit?",
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["payload"]["provider"] == "fake"
    assert "No active resource supplied." in result["payload"]["context_warnings"]
    assert result["payload"]["context"]["page_context"] == []
