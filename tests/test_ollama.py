import json

import httpx
import pytest
from fastapi import HTTPException

from app.config import Settings
from app.ollama import OllamaClient


@pytest.mark.asyncio
async def test_local_default_and_structured_intent():
    settings = Settings(_env_file=None)
    assert settings.ai_provider == "ollama"

    def handler(request):
        assert request.url.host == "localhost"
        payload = json.loads(request.content)
        assert payload["model"] == "qwen3.5:9b"
        assert payload["format"]["type"] == "object"
        assert payload["stream"] is False
        return httpx.Response(200, json={"message": {"content": json.dumps({
            "is_place_search": True, "search_query": "Taman Sari Yogyakarta",
        })}})

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        intent = await OllamaClient(http, settings).extract_intent("Find Taman Sari")
    assert intent.is_place_search
    assert intent.search_query == "Taman Sari Yogyakarta"


@pytest.mark.asyncio
async def test_stream_and_local_failure():
    def handler(request):
        return httpx.Response(200, text='{"message":{"content":"Hello"}}\n{"done":true}\n')

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        client = OllamaClient(http, Settings(_env_file=None))
        assert [part async for part in client.normal_chat_stream("Hi", [])] == ["Hello"]

    def unavailable(request):
        raise httpx.ConnectError("offline", request=request)

    async with httpx.AsyncClient(transport=httpx.MockTransport(unavailable)) as http:
        client = OllamaClient(http, Settings(_env_file=None))
        assert await client.is_available() is False
        with pytest.raises(HTTPException, match="Local Ollama request failed"):
            _ = [part async for part in client.normal_chat_stream("Hi", [])]
