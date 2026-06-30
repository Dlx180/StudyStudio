from io import BytesIO

from fastapi.testclient import TestClient
from pypdf import PdfWriter

from app.main import app


def make_pdf(page_count: int = 2) -> bytes:
    writer = PdfWriter()
    for _ in range(page_count):
        writer.add_blank_page(width=72, height=72)

    buffer = BytesIO()
    writer.write(buffer)
    return buffer.getvalue()


def test_pdf_upload_stores_resource_metadata(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("KNOWTREE_STORAGE_DIR", str(tmp_path))

    response = TestClient(app).post(
        "/api/resources/upload",
        files={"file": ("demo.pdf", make_pdf(2), "application/pdf")},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["kind"] == "pdf"
    assert payload["title"] == "demo"
    assert payload["page_count"] == 2
    assert payload["processing_status"] == "pages_extracted"

    metadata_response = TestClient(app).get(f"/api/resources/{payload['resource_id']}")
    assert metadata_response.status_code == 200
    assert metadata_response.json()["original_filename"] == "demo.pdf"


def test_upload_rejects_non_pdf_filename(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("KNOWTREE_STORAGE_DIR", str(tmp_path))

    response = TestClient(app).post(
        "/api/resources/upload",
        files={"file": ("notes.txt", b"not a pdf", "text/plain")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Only PDF uploads are supported in this milestone."


def test_upload_rejects_invalid_pdf_bytes(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("KNOWTREE_STORAGE_DIR", str(tmp_path))

    response = TestClient(app).post(
        "/api/resources/upload",
        files={"file": ("broken.pdf", b"not a pdf", "application/pdf")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Uploaded file is not a readable PDF."
