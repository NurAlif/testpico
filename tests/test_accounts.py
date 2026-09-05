import sqlite3

from fastapi.testclient import TestClient

from app.config import get_settings
from app.main import app
from app.models import ChatResponse, PlaceIntent


def test_accounts_persist_and_isolate_chats(tmp_path, monkeypatch):
    monkeypatch.setenv("HISTORY_DATABASE_PATH", str(tmp_path / "accounts.db"))
    get_settings.cache_clear()

    class Assistant:
        async def chat(self, payload):
            assert [m.content for m in payload.history] == (
                [] if payload.message == "Hello" else ["Hello", "Saved answer"]
            )
            return ChatResponse(answer="Saved answer", intent=PlaceIntent())

    try:
        with TestClient(app, base_url="http://localhost") as client:
            app.state.assistant = Assistant()
            assert client.get("/api/conversations").status_code == 401
            assert (
                client.post(
                    "/api/auth/login", json={"identifier": "testpico", "password": "wrong"}
                ).status_code
                == 401
            )
            token = client.post(
                "/api/auth/login", json={"identifier": "TESTPICO", "password": "testpico"}
            ).json()["token"]
            headers = {"Authorization": f"Bearer {token}"}
            cid = client.post("/api/conversations", headers=headers).json()["id"]
            assert (
                client.post(
                    "/api/chat", headers=headers, json={"message": "Hello", "conversation_id": cid}
                ).status_code
                == 200
            )
            assert (
                client.post(
                    "/api/chat",
                    headers=headers,
                    json={
                        "message": "Continue",
                        "conversation_id": cid,
                        "history": [{"role": "user", "content": "Fake"}],
                    },
                ).status_code
                == 200
            )
            assert client.get("/api/conversations", headers=headers).json()[0]["title"] == "Hello"
            registration = {
                "username": "alice",
                "email": "alice@example.com",
                "password": "password123",
            }
            assert client.post("/api/auth/register", json=registration).status_code == 200
            assert client.post("/api/auth/register", json=registration).status_code == 409
            other = client.post(
                "/api/auth/login",
                json={"identifier": "ALICE@example.com", "password": "password123"},
            ).json()["token"]
            other_headers = {"Authorization": f"Bearer {other}"}
            assert client.get("/api/conversations", headers=other_headers).json() == []
            assert client.get(f"/api/conversations/{cid}", headers=other_headers).status_code == 404
            assert (
                client.post(
                    "/api/chat",
                    headers=other_headers,
                    json={"message": "steal", "conversation_id": cid},
                ).status_code
                == 404
            )
            assert client.post("/api/auth/logout", headers=headers).status_code == 200
            assert client.get("/api/conversations", headers=headers).status_code == 401
        with TestClient(app, base_url="http://localhost") as client:
            token = client.post(
                "/api/auth/login", json={"identifier": "testpico", "password": "testpico"}
            ).json()["token"]
            saved = client.get(
                f"/api/conversations/{cid}", headers={"Authorization": f"Bearer {token}"}
            ).json()
            assert len(saved["messages"]) == 4
        with sqlite3.connect(tmp_path / "accounts.db") as db:
            assert (
                db.execute("SELECT password_hash FROM users WHERE username='testpico'").fetchone()[
                    0
                ]
                != "testpico"
            )
    finally:
        get_settings.cache_clear()
