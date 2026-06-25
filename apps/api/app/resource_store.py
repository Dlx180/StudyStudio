"""Local Resource storage for the early PDF upload milestone."""

from __future__ import annotations

import json
import os
import shutil
import uuid
from pathlib import Path
from typing import BinaryIO

from pypdf import PdfReader


REPO_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_STORAGE_ROOT = REPO_ROOT / "storage"


class ResourceError(ValueError):
    """Raised when a resource cannot be accepted or processed."""


def get_storage_root() -> Path:
    """Return the configured storage root, defaulting to repo-local storage."""
    configured = os.environ.get("KNOWTREE_STORAGE_DIR")
    return Path(configured).expanduser().resolve() if configured else DEFAULT_STORAGE_ROOT


def save_pdf_resource(filename: str, stream: BinaryIO) -> dict:
    """Store a PDF upload and return its Resource metadata."""
    original_filename = Path(filename or "uploaded.pdf").name
    if Path(original_filename).suffix.lower() != ".pdf":
        raise ResourceError("Only PDF uploads are supported in this milestone.")

    resource_id = f"resource-{uuid.uuid4().hex}"
    resource_dir = get_storage_root() / "resources" / resource_id
    resource_dir.mkdir(parents=True, exist_ok=False)

    pdf_path = resource_dir / original_filename
    with pdf_path.open("wb") as output:
        shutil.copyfileobj(stream, output)

    try:
        page_count = len(PdfReader(str(pdf_path)).pages)
    except Exception as exc:  # pypdf raises several parser-specific exceptions.
        shutil.rmtree(resource_dir, ignore_errors=True)
        raise ResourceError("Uploaded file is not a readable PDF.") from exc

    metadata = {
        "resource_id": resource_id,
        "title": Path(original_filename).stem,
        "kind": "pdf",
        "original_filename": original_filename,
        "storage_path": str(pdf_path),
        "page_count": page_count,
        "processing_status": "uploaded",
    }
    (resource_dir / "metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    return metadata


def load_resource_metadata(resource_id: str) -> dict:
    """Load metadata for a stored local Resource."""
    metadata_path = get_storage_root() / "resources" / resource_id / "metadata.json"
    if not metadata_path.exists():
        raise ResourceError("Resource was not found.")

    return json.loads(metadata_path.read_text(encoding="utf-8"))
