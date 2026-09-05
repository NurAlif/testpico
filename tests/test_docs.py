from fastapi.testclient import TestClient

from app.main import app
from app.security import APP_CSP, DOCS_CSP, security_headers

client = TestClient(app, base_url="http://localhost")

PROTECTED_OPERATIONS = {
    ("/api/chat", "post"),
    ("/api/chat/stream", "post"),
    ("/api/conversations", "post"),
    ("/api/conversations/{conversation_id}", "get"),
    ("/api/places/search", "post"),
    ("/api/places/photo", "post"),
    ("/v1/models", "get"),
    ("/v1/chat/completions", "post"),
}

PUBLIC_OPERATIONS = {
    ("/health", "get"),
    ("/api/config", "get"),
}


def test_docs_page_uses_csp_that_allows_swagger_ui():
    response = client.get("/docs")
    assert response.status_code == 200
    assert "swagger-ui" in response.text
    assert "cdn.jsdelivr.net" in response.text
    csp = response.headers["content-security-policy"]
    assert "https://cdn.jsdelivr.net" in csp
    assert "'unsafe-inline'" in csp


def test_app_pages_keep_strict_csp():
    response = client.get("/")
    assert response.status_code == 200
    csp = response.headers["content-security-policy"]
    assert csp == APP_CSP
    assert "https://cdn.jsdelivr.net" not in csp
    assert "'unsafe-inline'" not in csp


def test_docs_and_app_csp_are_deliberately_different():
    assert DOCS_CSP != APP_CSP


def test_security_headers_flag_flips_between_csp_policies():
    headers: dict[str, str] = {}
    security_headers(headers)
    assert headers["Content-Security-Policy"] == APP_CSP
    security_headers(headers, allow_docs_ui=True)
    assert headers["Content-Security-Policy"] == DOCS_CSP


def test_openapi_declares_security_schemes():
    schema = app.openapi()
    schemes = schema["components"]["securitySchemes"]
    assert "HTTPBearer" in schemes
    assert schemes["HTTPBearer"]["scheme"] == "bearer"
    assert "APIKeyHeader" in schemes
    assert schemes["APIKeyHeader"]["in"] == "header"
    assert schemes["APIKeyHeader"]["name"] == "X-API-Key"


def test_openapi_marks_protected_routes_as_secured():
    schema = app.openapi()
    for path, method in PROTECTED_OPERATIONS:
        operation = schema["paths"][path][method]
        assert operation.get("security"), f"{method.upper()} {path} should declare security"


def test_openapi_leaves_public_routes_unsecured():
    schema = app.openapi()
    for path, method in PUBLIC_OPERATIONS:
        operation = schema["paths"][path][method]
        assert "security" not in operation, f"{method.upper()} {path} should stay public"