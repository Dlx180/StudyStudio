from app.mock_data import get_mock_workspace


def test_mock_workspace_preserves_core_mvp_concepts() -> None:
    payload = get_mock_workspace()

    assert payload["resource"]["kind"] == "pdf"
    assert payload["unit_tree"]["resource_id"] == payload["resource"]["resource_id"]
    assert payload["unit_tree"]["units"][0]["start_page"] == 1


def test_health_endpoint_contract_when_fastapi_is_available() -> None:
    try:
        from fastapi.testclient import TestClient
    except ModuleNotFoundError:
        return

    from app.main import app

    response = TestClient(app).get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "knowtree-api"}
