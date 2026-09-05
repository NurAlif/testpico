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
async def test_connection_uses_a_minimal_places_request():
    async def handler(request: httpx.Request) -> httpx.Response:
        assert request.headers["x-goog-api-key"] == "private-places-key"
        assert request.headers["x-goog-fieldmask"] == "places.id"
        assert not request.url.query
        assert request.content == b'{"textQuery":"coffee","pageSize":1,"languageCode":"en"}'
        return httpx.Response(200, json={"places": [{"id": "test"}]})

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        result = await GoogleMapsClient(client, settings()).test_connection()
    assert result["ok"] is True


@pytest.mark.asyncio
async def test_search_uses_private_key_field_mask_and_bounded_page_size():
    async def handler(request: httpx.Request) -> httpx.Response:
        assert request.headers["x-goog-api-key"] == "private-places-key"
        assert "places.id" in request.headers["x-goog-fieldmask"]
        assert "places.photos" in request.headers["x-goog-fieldmask"]
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
                        "photos": [{
                            "name": "places/ChIJ_test/photos/sample",
                            "authorAttributions": [{
                                "displayName": "Photographer",
                                "uri": "https://maps.google.com/contributor",
                            }],
                        }],
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
    assert result[0].photo.name == "places/ChIJ_test/photos/sample"
    assert result[0].photo.authorAttributions[0].displayName == "Photographer"
    assert result[0].photos[0].name == "places/ChIJ_test/photos/sample"
    assert "public-embed-key" in result[0].embed_url
    assert "private-places-key" not in result[0].model_dump_json()


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
    assert result[0].photo is None
    assert result[0].google_maps_url == "https://maps.google.com/test"


@pytest.mark.asyncio
async def test_google_auth_error_does_not_leak_response_body():
    async def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(403, json={"error": {"message": "project-secret-detail"}})

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        with pytest.raises(Exception) as error:
            await GoogleMapsClient(client, settings()).search_text("coffee")

    assert "project-secret-detail" not in str(error.value)


@pytest.mark.asyncio
async def test_photo_resolves_image_without_exposing_google_key():
    async def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == '/v1/places/ChIJ_test/photos/sample/media'
        assert request.headers['x-goog-api-key'] == 'private-places-key'
        assert 'private-places-key' not in str(request.url)
        assert request.url.params['skipHttpRedirect'] == 'true'
        assert request.url.params['maxWidthPx'] == '800'
        return httpx.Response(200, json={'photoUri': 'https://lh3.googleusercontent.com/photo'})

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        url = await GoogleMapsClient(client, settings()).photo_url('places/ChIJ_test/photos/sample')
    assert url == 'https://lh3.googleusercontent.com/photo'


@pytest.mark.asyncio
@pytest.mark.parametrize('status_code', [403, 404, 429])
async def test_photo_failure_is_sanitized(status_code):
    from fastapi import HTTPException

    async def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(status_code, json={'error': 'private-project-detail'})

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        with pytest.raises(HTTPException) as error:
            await GoogleMapsClient(client, settings()).photo_url('places/ChIJ_test/photos/sample')
    assert error.value.status_code == 502
    assert 'private-project-detail' not in error.value.detail


def test_photo_resource_rejects_paths_and_query_injection():
    from pydantic import ValidationError

    from app.models import PlacePhotoRequest

    for name in ['../secret', 'places/id/photos/name?key=evil', 'https://example.com/photo']:
        with pytest.raises(ValidationError):
            PlacePhotoRequest(name=name)
