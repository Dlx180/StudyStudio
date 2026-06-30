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


def test_upload_extracts_page_text_records(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("KNOWTREE_STORAGE_DIR", str(tmp_path))
    client = TestClient(app)

    upload_response = client.post(
        "/api/resources/upload",
        files={
            "file": (
                "text-demo.pdf",
                make_text_pdf(["Page one defines SourceSpan.", "Page two explains EvidenceEvent."]),
                "application/pdf",
            )
        },
    )

    assert upload_response.status_code == 200
    resource_id = upload_response.json()["resource_id"]

    pages_response = client.get(f"/api/resources/{resource_id}/pages")

    assert pages_response.status_code == 200
    pages = pages_response.json()["pages"]
    assert [page["page"] for page in pages] == [1, 2]
    assert pages[0]["resource_id"] == resource_id
    assert pages[0]["locator"] == {"kind": "pdf_page", "resource_id": resource_id, "page": 1}
    assert pages[0]["text"] == "Page one defines SourceSpan."
    assert pages[0]["extraction_status"] == "extracted"
    assert pages[1]["text"] == "Page two explains EvidenceEvent."
    assert pages[1]["extraction_status"] == "extracted"


def test_blank_pdf_pages_are_recorded_with_empty_status(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("KNOWTREE_STORAGE_DIR", str(tmp_path))
    client = TestClient(app)
    writer = PdfWriter()
    writer.add_blank_page(width=72, height=72)
    buffer = BytesIO()
    writer.write(buffer)

    upload_response = client.post(
        "/api/resources/upload",
        files={"file": ("blank.pdf", buffer.getvalue(), "application/pdf")},
    )

    assert upload_response.status_code == 200
    resource_id = upload_response.json()["resource_id"]

    pages_response = client.get(f"/api/resources/{resource_id}/pages")

    assert pages_response.status_code == 200
    pages = pages_response.json()["pages"]
    assert len(pages) == 1
    assert pages[0]["text"] == ""
    assert pages[0]["extraction_status"] == "empty"
    assert pages[0]["locator"] == {"kind": "pdf_page", "resource_id": resource_id, "page": 1}
