from urllib.parse import urlencode

import httpx
from fastapi import HTTPException, status

from app.config import Settings
from app.models import Place, TravelMode

PLACES_TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"
PLACE_FIELD_MASK = ",".join(
    [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.location",
        "places.rating",
        "places.userRatingCount",
        "places.primaryType",
        "places.googleMapsUri",
    ]
)


class GoogleMapsClient:
    def __init__(self, client: httpx.AsyncClient, settings: Settings) -> None:
        self.client = client
        self.settings = settings

    @property
    def configured(self) -> bool:
        return self.places_configured

    @property
    def places_configured(self) -> bool:
        return bool(Settings.reveal(self.settings.google_places_api_key))

    @property
    def embed_configured(self) -> bool:
        return bool(Settings.reveal(self.settings.google_maps_embed_api_key))

    def _require_places_key(self) -> str:
        key = Settings.reveal(self.settings.google_places_api_key)
        if not key:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Google Places is not configured",
            )
        return key

    def _require_embed_key(self) -> str:
        key = Settings.reveal(self.settings.google_maps_embed_api_key)
        if not key:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Google Maps Embed is not configured",
            )
        return key

    def place_embed_url(self, place_id: str) -> str:
        params = urlencode({"key": self._require_embed_key(), "q": f"place_id:{place_id}"})
        return f"https://www.google.com/maps/embed/v1/place?{params}"

    def directions_urls(
        self,
        place_id: str,
        origin: str,
        travel_mode: TravelMode,
        destination: str = "Destination",
    ) -> tuple[str | None, str]:
        embed_key = Settings.reveal(self.settings.google_maps_embed_api_key)
        embed_url = None
        if embed_key:
            embed_params = urlencode(
                {
                    "key": embed_key,
                    "origin": origin,
                    "destination": f"place_id:{place_id}",
                    "mode": travel_mode,
                }
            )
            embed_url = f"https://www.google.com/maps/embed/v1/directions?{embed_params}"
        maps_params = urlencode(
            {
                "api": "1",
                "origin": origin,
                "destination": destination,
                "destination_place_id": place_id,
                "travelmode": travel_mode,
            }
        )
        return (
            embed_url,
            f"https://www.google.com/maps/dir/?{maps_params}",
        )

    async def search_text(
        self,
        query: str,
        *,
        origin: str | None = None,
        travel_mode: TravelMode = "driving",
        open_now: bool = False,
        language_code: str = "en",
    ) -> list[Place]:
        key = self._require_places_key()
        body: dict[str, object] = {
            "textQuery": query,
            "pageSize": self.settings.max_place_results,
            "languageCode": language_code,
        }
        if open_now:
            body["openNow"] = True

        try:
            response = await self.client.post(
                PLACES_TEXT_SEARCH_URL,
                headers={
                    "X-Goog-Api-Key": key,
                    "X-Goog-FieldMask": PLACE_FIELD_MASK,
                    "Content-Type": "application/json",
                },
                json=body,
                timeout=self.settings.google_request_timeout_seconds,
            )
            response.raise_for_status()
        except httpx.TimeoutException as exc:
            raise HTTPException(status_code=504, detail="Google Places timed out") from exc
        except httpx.HTTPStatusError as exc:
            # Do not return Google's response body: it can contain sensitive project details.
            if exc.response.status_code in {401, 403}:
                detail = "Google Places credentials or restrictions rejected the request"
            elif exc.response.status_code == 429:
                detail = "Google Places quota was reached"
            else:
                detail = "Google Places request failed"
            raise HTTPException(status_code=502, detail=detail) from exc
        except httpx.RequestError as exc:
            raise HTTPException(status_code=502, detail="Google Places is unavailable") from exc

        places: list[Place] = []
        for raw in response.json().get("places", [])[: self.settings.max_place_results]:
            place_id = raw.get("id")
            name = raw.get("displayName", {}).get("text")
            if not place_id or not name:
                continue
            if origin:
                embed_url, maps_url = self.directions_urls(
                    place_id, origin, travel_mode, destination=name
                )
            else:
                embed_url = self.place_embed_url(place_id) if self.embed_configured else None
                maps_url = raw.get("googleMapsUri") or self._fallback_maps_url(place_id)
            location = raw.get("location") or {}
            places.append(
                Place(
                    place_id=place_id,
                    name=name,
                    address=raw.get("formattedAddress"),
                    latitude=location.get("latitude"),
                    longitude=location.get("longitude"),
                    rating=raw.get("rating"),
                    rating_count=raw.get("userRatingCount"),
                    primary_type=raw.get("primaryType"),
                    google_maps_url=maps_url,
                    embed_url=embed_url,
                )
            )
        return places

    @staticmethod
    def _fallback_maps_url(place_id: str) -> str:
        return "https://www.google.com/maps/search/?" + urlencode(
            {"api": "1", "query": "Google", "query_place_id": place_id}
        )
