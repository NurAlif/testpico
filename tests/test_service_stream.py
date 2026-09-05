from app.models import ChatRequest, Place, PlaceIntent
from app.service import PlacesAssistant


class StubGemini:
    def __init__(
        self,
        intent: PlaceIntent,
        chunks: list[str] | None = None,
        fail_grounded: bool = False,
    ):
        self.intent = intent
        self.chunks = chunks or ["Answer ", "chunk."]
        self.fail_grounded = fail_grounded

    async def extract_intent(self, message: str) -> PlaceIntent:
        return self.intent

    async def normal_chat_stream(self, message: str, history):
        for chunk in self.chunks:
            yield chunk

    async def grounded_answer_stream(self, message: str, places):
        if self.fail_grounded:
            raise RuntimeError("model down")
        for chunk in self.chunks:
            yield chunk


class StubMaps:
    def __init__(self, places: list[Place]):
        self.places = places

    async def search_text(self, query: str, **kwargs) -> list[Place]:
        return self.places


def make_place() -> Place:
    return Place(place_id="ChIJ_x", name="Test Cafe", google_maps_url="https://maps.google.com/x")


async def test_streamed_place_search_yields_chunks_and_places():
    gemini = StubGemini(PlaceIntent(is_place_search=True, search_query="coffee in Jakarta"))
    maps = StubMaps([make_place()])
    assistant = PlacesAssistant(gemini, maps)

    request = ChatRequest(message="find coffee")
    prepared = await assistant.prepare_stream(request)
    chunks = [c async for c in assistant.stream_answer(request, prepared)]

    assert chunks == ["Answer ", "chunk."]
    assert prepared.places[0].name == "Test Cafe"


async def test_streamed_normal_chat_uses_history_path():
    gemini = StubGemini(PlaceIntent(is_place_search=False))
    assistant = PlacesAssistant(gemini, StubMaps([]))

    prepared = await assistant.prepare_stream(ChatRequest(message="hi"))
    chunks = [c async for c in assistant.stream_answer(ChatRequest(message="hi"), prepared)]

    assert chunks == ["Answer ", "chunk."]


async def test_grounded_failure_falls_back_after_places_search():
    place = make_place()
    gemini = StubGemini(PlaceIntent(is_place_search=True, search_query="pizza"), fail_grounded=True)
    assistant = PlacesAssistant(gemini, StubMaps([place]))

    request = ChatRequest(message="pizza near me")
    prepared = await assistant.prepare_stream(request)
    chunks = [c async for c in assistant.stream_answer(request, prepared)]

    assert "".join(chunks) == assistant._fallback_answer([place])


async def test_chat_collects_stream_into_full_response():
    gemini = StubGemini(PlaceIntent(is_place_search=False))
    assistant = PlacesAssistant(gemini, StubMaps([]))

    response = await assistant.chat(ChatRequest(message="hi"))

    assert response.answer == "Answer chunk."
    assert response.places == []
