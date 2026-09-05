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


async def test_rich_results_survive_restart_and_continuation(tmp_path):
    path = tmp_path / "saved.sqlite3"
    store = HistoryStore(path)
    await store.initialize()
    cid = await store.create_conversation()
    rich = Message(role="assistant", content="Try this cafe", places=[{"place_id": "cafe", "name": "Cafe", "photo": {"name": "places/cafe/photos/photo"}, "details": {"priceLevel": "MODERATE"}}], suggestions=["Compare its hours"])
    await store.append(cid, [Message(role="user", content="Find a cafe"), rich])
    reopened = HistoryStore(path)
    await reopened.initialize()
    assert (await reopened.messages(cid))[1] == rich
    await reopened.append(cid, [Message(role="user", content="Compare its hours")])
    assert len(await reopened.messages(cid)) == 3
    assert (await reopened.messages(cid))[1] == rich
