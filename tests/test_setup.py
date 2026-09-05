import sqlite3

from fastapi.testclient import TestClient

from app.config import get_settings
from app.main import app


def test_local_setup_saves_encrypted_google_keys_and_completes(tmp_path, monkeypatch):
    database = tmp_path / "setup.db"
    monkeypatch.setenv("HISTORY_DATABASE_PATH", str(database))
    monkeypatch.setenv("GOOGLE_PLACES_API_KEY", "")
    monkeypatch.setenv("GOOGLE_MAPS_EMBED_API_KEY", "")
    get_settings.cache_clear()

    try:
        with TestClient(app, base_url="http://localhost") as client:
            token = client.post(
                "/api/auth/login",
                json={"identifier": "testpico", "password": "testpico"},
            ).json()["token"]
            headers = {"Authorization": f"Bearer {token}"}

            status = client.get("/api/setup", headers=headers).json()
            assert status["available"] is True
            assert status["complete"] is False
            assert status["google"] == {
                "places_configured": False,
                "embed_configured": False,
            }

            response = client.post(
                "/api/setup",
                headers=headers,
                json={
                    "google_places_api_key": "private-places-key",
                    "google_maps_embed_api_key": "public-embed-key",
                },
            )
            assert response.status_code == 200
            assert response.json()["google"] == {
                "places_configured": True,
                "embed_configured": True,
            }
            assert "private-places-key" not in response.text
            assert "public-embed-key" not in response.text

            async def connected():
                return {"ok": True, "message": "Google Places is connected."}

            app.state.maps.test_connection = connected
            assert client.post(
                "/api/setup/google/test", headers=headers, json={}
            ).json()["ok"] is True
            completed = client.post(
                "/api/setup", headers=headers, json={"complete": True}
            ).json()
            assert completed["complete"] is True

        with sqlite3.connect(database) as connection:
            rows = dict(connection.execute("SELECT key,value FROM app_settings"))
        assert rows["setup_complete"] == "1"
        assert "private-places-key" not in rows["google_places_api_key"]
        assert "public-embed-key" not in rows["google_maps_embed_api_key"]

        with TestClient(app, base_url="http://localhost") as client:
            token = client.post(
                "/api/auth/login",
                json={"identifier": "testpico", "password": "testpico"},
            ).json()["token"]
            restored = client.get(
                "/api/setup", headers={"Authorization": f"Bearer {token}"}
            ).json()
            assert restored["complete"] is True
            assert restored["google"]["places_configured"] is True
            assert restored["google"]["embed_configured"] is True
    finally:
        get_settings.cache_clear()


def test_local_setup_writer_is_not_available_on_non_local_host(tmp_path, monkeypatch):
    monkeypatch.setenv("HISTORY_DATABASE_PATH", str(tmp_path / "remote.db"))
    get_settings.cache_clear()
    try:
        with TestClient(app, base_url="http://example.com") as client:
            # TrustedHost rejects the remote host before setup can be reached.
            assert client.get("/api/config").status_code == 400
    finally:
        get_settings.cache_clear()
