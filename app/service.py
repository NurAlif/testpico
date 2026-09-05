import json
from collections.abc import AsyncIterator
from dataclasses import dataclass, field

from app.gemini import GeminiClient
from app.google_maps import GoogleMapsClient
from app.models import ChatRequest, ChatResponse, Place, PlaceIntent


@dataclass
class PreparedStream:
    intent: PlaceIntent
    places: list[Place] = field(default_factory=list)
    answer: str = ""
    suggestions: list[str] = field(default_factory=list)


class PlacesAssistant:
    def __init__(self, gemini: GeminiClient, maps: GoogleMapsClient) -> None:
        self.gemini = gemini
        self.maps = maps

    async def prepare_stream(self, request: ChatRequest) -> PreparedStream:
        observations = []
        places = {}
        seen = set()
        history = [m.model_dump() for m in request.history[-12:] if m.role in {"user", "assistant"}]
        for step in range(9):
            action = await self.gemini.agent_step(
                {
                    "message": request.message,
                    "history": history,
                    "observations": observations,
                    "tools_remaining": 8 - step,
                }
            )
            if (
                action.get("action") == "finish"
                and isinstance(action.get("answer"), str)
                and action["answer"].strip()
            ):
                suggestions = action.get("suggestions", [])
                if not isinstance(suggestions, list):
                    suggestions = []
                suggestions = list(
                    dict.fromkeys(
                        x.strip()
                        for x in suggestions
                        if isinstance(x, str) and x.strip() and len(x) <= 180
                    )
                )[:3]
                return PreparedStream(
                    PlaceIntent(is_place_search=bool(places)),
                    list(places.values()),
                    action["answer"][:8000],
                    suggestions,
                )
            if step == 8:
                break
            key = json.dumps(action, sort_keys=True)
            if key in seen:
                observations.append({"error": "Duplicate action. Use existing results or finish."})
                continue
            seen.add(key)
            try:
                if (
                    action.get("action") == "search"
                    and isinstance(action.get("query"), str)
                    and 0 < len(action["query"].strip()) <= 300
                ):
                    found = await self.maps.search_text(
                        action["query"], open_now=action.get("open_now") is True
                    )
                    places.update((p.place_id, p) for p in found)
                    observations.append(
                        {"action": action, "results": [p.model_dump() for p in found]}
                    )
                elif (
                    action.get("action") == "details"
                    and isinstance(action.get("place_id"), str)
                    and action["place_id"] in places
                ):
                    data = await self.maps.details(action["place_id"])
                    places[action["place_id"]].details = data
                    observations.append({"action": action, "result": data})
                else:
                    observations.append(
                        {"error": "Invalid action or unknown place ID. Search first."}
                    )
            except Exception:
                observations.append(
                    {"action": action, "error": "Place lookup failed. Do not invent missing data."}
                )
        return PreparedStream(
            PlaceIntent(is_place_search=bool(places)),
            list(places.values()),
            (
                "I couldn't complete the comparison. "
                "Please narrow the request to two places and a city."
            ),
            ["Compare two places in my city", "Help me choose based on my budget"],
        )

    async def stream_answer(
        self, request: ChatRequest, prepared: PreparedStream
    ) -> AsyncIterator[str]:
        yield prepared.answer

    async def chat(self, request: ChatRequest) -> ChatResponse:
        prepared = await self.prepare_stream(request)
        return ChatResponse(
            answer=prepared.answer,
            places=prepared.places,
            intent=prepared.intent,
            suggestions=prepared.suggestions,
        )
