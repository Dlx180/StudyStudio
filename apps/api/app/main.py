"""FastAPI application shell for KnowTree."""

from fastapi import FastAPI

from .mock_data import get_mock_workspace

app = FastAPI(
    title="KnowTree API",
    version="0.1.0",
    description="API shell for the MVP reading workflow.",
)


@app.get("/health")
def health() -> dict[str, str]:
    """Return API liveness for local development and smoke tests."""
    return {"status": "ok", "service": "knowtree-api"}


@app.get("/api/mock-workspace")
def mock_workspace() -> dict:
    """Return mock Resource and UnitTree data for the first workspace UI."""
    return get_mock_workspace()
