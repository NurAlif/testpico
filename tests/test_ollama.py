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
        return httpx.Response(
            200,
            json={
                "message": {
                    "content": json.dumps(
                        {
                            "is_place_search": True,
                            "search_query": "Taman Sari Yogyakarta",
                        }
                    )
                }
            },
        )

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


async def test_agent_streams_public_answer_and_available_reasoning():
    events = []
    answer = 'Hello "Jakarta"!\nCafé 🧭'
    raw = json.dumps({"action": "finish", "answer": answer, "suggestions": []})

    def handler(request):
        payload = json.loads(request.content)
        assert payload["stream"] is True
        assert payload["format"] == "json"
        assert "think" not in payload
        lines = [json.dumps({"message": {"thinking": "A greeting fits."}})]
        lines.extend(json.dumps({"message": {"content": char}}) for char in raw)
        return httpx.Response(200, text="\n".join(lines) + '\n{"done":true}\n')

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        client = OllamaClient(http, Settings(_env_file=None))
        result = await client.agent_step_stream({"message": "Hi"}, events.append)
    assert result["answer"] == answer
    chunks = [event["text"] for event in events if event["type"] == "delta"]
    assert len(chunks) > 1
    assert "".join(chunks) == answer
    assert events[0] == {"type": "reasoning", "text": "A greeting fits."}

async def test_installed_chat_models_and_connection_without_generation():
    calls = []
    def handler(request):
        calls.append(request.url.path)
        if request.url.path == '/api/tags':
            return httpx.Response(200,json={'models':[{'name':'embed:latest'},{'name':'chat:small'},{'name':'chat:large'}]})
        assert request.url.path == '/api/show'
        model = json.loads(request.content)['model']
        if model == 'missing':
            return httpx.Response(404,json={'error':'model not found'})
        return httpx.Response(200,json={'capabilities':['embedding'] if model.startswith('embed') else ['completion']})
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        client = OllamaClient(http,Settings(_env_file=None,ollama_model='chat:small'))
        assert await client.list_models() == ['chat:large','chat:small']
        assert (await client.test_connection())['ok']
        client.settings.ollama_model = 'embed:latest'
        with pytest.raises(HTTPException,match='does not support chat'):
            await client.test_connection()
        client.settings.ollama_model = 'missing'
        with pytest.raises(HTTPException,match='not installed'):
            await client.test_connection()
    assert '/api/chat' not in calls


async def test_model_discovery_offline_and_empty():
    async with httpx.AsyncClient(transport=httpx.MockTransport(lambda r: httpx.Response(200,json={'models':[]}))) as http:
        assert await OllamaClient(http,Settings(_env_file=None)).list_models() == []
    def offline(request):
        raise httpx.ConnectError('offline',request=request)
    async with httpx.AsyncClient(transport=httpx.MockTransport(offline)) as http:
        with pytest.raises(HTTPException,match='Cannot list Ollama models'):
            await OllamaClient(http,Settings(_env_file=None)).list_models()
