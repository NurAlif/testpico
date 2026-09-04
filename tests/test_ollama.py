import httpx
import pytest

from app.config import Settings
from app.ollama import OllamaClient


@pytest.mark.asyncio
async def test_availability_requires_configured_model_to_be_installed():
    async def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={"models": [{"name": "qwen3.5:9b"}, {"name": "bge-m3:latest"}]},
        )

    settings = Settings(ollama_model="qwen3.5:9b")
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        assert await OllamaClient(client, settings).is_available() is True


@pytest.mark.asyncio
async def test_availability_is_false_when_configured_model_is_missing():
    async def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"models": [{"name": "another-model:latest"}]})

    settings = Settings(ollama_model="qwen3.5:9b")
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        assert await OllamaClient(client, settings).is_available() is False
