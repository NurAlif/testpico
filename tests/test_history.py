from app.history import HistoryStore
from app.models import Message


async def test_history_store_creates_and_reads_a_conversation(tmp_path):
    store = HistoryStore(tmp_path / "history.sqlite3")
    await store.initialize()
    conversation_id = await store.create_conversation()

    await store.append(
        conversation_id,
        [Message(role="user", content="Hello"), Message(role="assistant", content="Hi")],
    )

    assert await store.messages(conversation_id) == [
        Message(role="user", content="Hello"),
        Message(role="assistant", content="Hi"),
    ]


async def test_history_store_returns_none_for_an_unknown_conversation(tmp_path):
    store = HistoryStore(tmp_path / "history.sqlite3")
    await store.initialize()

    assert await store.messages("not-a-conversation") is None
