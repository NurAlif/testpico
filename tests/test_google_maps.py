from urllib.parse import parse_qs, urlparse

import httpx
import pytest
from pydantic import SecretStr

from app.config import Settings
from app.google_maps import GoogleMapsClient


def settings() -> Settings:
    return Settings(
        google_places_api_key=SecretStr("private-places-key"),
        google_maps_embed_api_key=SecretStr("public-embed-key"),
        max_place_results=2,
    )


@pytest.mark.asyncio
async def test_search_uses_private_key_field_mask_and_bounded_page_size():
    async def handler(request: httpx.Request) -> httpx.Response:
        assert request.headers["x-goog-api-key"] == "private-places-key"
        assert "places.id" in request.headers["x-goog-fieldmask"]
        assert "private-places-key" not in str(request.url)
        assert b'"pageSize":2' in request.content
        return httpx.Response(
            200,
            json={
                "places": [
                    {
                        "id": "ChIJ_test",
                        "displayName": {"text": "Test Cafe"},
                        "formattedAddress": "1 Test Street",
                        "location": {"latitude": -6.2, "longitude": 106.8},
                        "rating": 4.7,
                        "userRatingCount": 42,
                        "googleMapsUri": "https://maps.google.com/test",
                    }
                ]
            },
        )

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        result = await GoogleMapsClient(client, settings()).search_text("coffee in Jakarta")

    assert len(result) == 1
    assert result[0].name == "Test Cafe"
    assert "public-embed-key" in result[0].embed_url
    assert "private-places-key" not in result[0].model_dump_json()


def test_directions_urls_are_encoded_and_place_specific():
    client = GoogleMapsClient(httpx.AsyncClient(), settings())
    embed, maps = client.directions_urls(
        "ChIJ_test", "Monas, Jakarta", "walking", "Test & Cafe"
    )
    embed_query = parse_qs(urlparse(embed).query)
    maps_query = parse_qs(urlparse(maps).query)

    assert embed_query["origin"] == ["Monas, Jakarta"]
    assert embed_query["destination"] == ["place_id:ChIJ_test"]
    assert embed_query["mode"] == ["walking"]
    assert maps_query["destination"] == ["Test & Cafe"]
    assert maps_query["destination_place_id"] == ["ChIJ_test"]


def test_external_directions_do_not_require_an_embed_key():
    no_embed_settings = Settings(
        google_places_api_key=SecretStr("private-places-key"),
        google_maps_embed_api_key=SecretStr(""),
    )
    client = GoogleMapsClient(httpx.AsyncClient(), no_embed_settings)

    embed, maps = client.directions_urls(
        "ChIJ_test", "Monas, Jakarta", "walking", "Test Cafe"
    )

    assert embed is None
    assert maps.startswith("https://www.google.com/maps/dir/")


@pytest.mark.asyncio
async def test_place_search_does_not_require_an_embed_key():
    async def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "places": [
                    {
                        "id": "ChIJ_test",
                        "displayName": {"text": "Test Cafe"},
                        "googleMapsUri": "https://maps.google.com/test",
                    }
                ]
            },
        )

    no_embed_settings = Settings(
        google_places_api_key=SecretStr("private-places-key"),
        google_maps_embed_api_key=SecretStr(""),
    )
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        result = await GoogleMapsClient(client, no_embed_settings).search_text("coffee")

    assert len(result) == 1
    assert result[0].embed_url is None
    assert result[0].google_maps_url == "https://maps.google.com/test"


@pytest.mark.asyncio
async def test_google_auth_error_does_not_leak_response_body():
    async def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(403, json={"error": {"message": "project-secret-detail"}})

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        with pytest.raises(Exception) as error:
            await GoogleMapsClient(client, settings()).search_text("coffee")

    assert "project-secret-detail" not in str(error.value)
