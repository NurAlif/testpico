from app.google_maps import GoogleMapsClient
from app.models import ChatRequest, ChatResponse
from app.ollama import OllamaClient


class PlacesAssistant:
    def __init__(self, ollama: OllamaClient, maps: GoogleMapsClient) -> None:
        self.ollama = ollama
        self.maps = maps

    async def chat(self, request: ChatRequest) -> ChatResponse:
        intent = await self.ollama.extract_intent(request.message)
        if not intent.is_place_search or not intent.search_query:
            answer = await self.ollama.normal_chat(request.message, request.history)
            return ChatResponse(answer=answer, intent=intent)

        # Explicit request fields take precedence over model extraction.
        origin = request.origin or intent.origin
        travel_mode = request.travel_mode or intent.travel_mode
        places = await self.maps.search_text(
            intent.search_query,
            origin=origin,
            travel_mode=travel_mode,
            open_now=intent.open_now,
            language_code=intent.language_code,
        )
        try:
            answer = await self.ollama.grounded_answer(request.message, places)
        except Exception:
            # Place data and maps remain useful if the second-generation call fails.
            answer = self._fallback_answer(places)
        return ChatResponse(answer=answer, places=places, intent=intent)

    @staticmethod
    def _fallback_answer(places: list) -> str:
        if not places:
            return "I couldn't find matching places. Try adding a city or neighborhood."
        names = ", ".join(place.name for place in places)
        return (
            f"I found {len(places)} matching places: {names}. "
            "Use the map cards for details and directions."
        )
