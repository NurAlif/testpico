import asyncio
import json
import sqlite3
import uuid
from pathlib import Path

from app.models import Message


class HistoryStore:
    """Small SQLite-backed conversation store for a single Wander Pico deployment."""

    def __init__(self, database_path: Path) -> None:
        self.database_path = database_path

    async def initialize(self) -> None:
        await asyncio.to_thread(self._initialize)

    def _initialize(self) -> None:
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(self.database_path) as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS conversations (
                    id TEXT PRIMARY KEY,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
                    content TEXT NOT NULL,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )

            columns = {row[1] for row in connection.execute("PRAGMA table_info(messages)")}
            if "result_json" not in columns:
                connection.execute("ALTER TABLE messages ADD COLUMN result_json TEXT")

    async def create_conversation(self) -> str:
        conversation_id = str(uuid.uuid4())
        await asyncio.to_thread(self._create_conversation, conversation_id)
        return conversation_id

    def _create_conversation(self, conversation_id: str) -> None:
        with sqlite3.connect(self.database_path) as connection:
            connection.execute("INSERT INTO conversations (id) VALUES (?)", (conversation_id,))

    async def append(self, conversation_id: str, messages: list[Message]) -> None:
        await asyncio.to_thread(self._append, conversation_id, messages)

    def _append(self, conversation_id: str, messages: list[Message]) -> None:
        with sqlite3.connect(self.database_path) as connection:
            exists = connection.execute(
                "SELECT 1 FROM conversations WHERE id = ?", (conversation_id,)
            ).fetchone()
            if not exists:
                connection.execute("INSERT INTO conversations (id) VALUES (?)", (conversation_id,))
            connection.executemany(
                "INSERT INTO messages (conversation_id, role, content, result_json) VALUES (?, ?, ?, ?)",
                [(conversation_id, message.role, message.content, json.dumps({"places": message.places, "suggestions": message.suggestions})) for message in messages],
            )
            connection.execute(
                "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (conversation_id,),
            )

    async def messages(self, conversation_id: str) -> list[Message] | None:
        return await asyncio.to_thread(self._messages, conversation_id)

    def _messages(self, conversation_id: str) -> list[Message] | None:
        with sqlite3.connect(self.database_path) as connection:
            exists = connection.execute(
                "SELECT 1 FROM conversations WHERE id = ?", (conversation_id,)
            ).fetchone()
            if not exists:
                return None
            rows = connection.execute(
                "SELECT role, content, result_json FROM messages WHERE conversation_id = ? ORDER BY id",
                (conversation_id,),
            ).fetchall()
        return [Message(role=role, content=content, **(json.loads(result) if result else {})) for role, content, result in rows]
