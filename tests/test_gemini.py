import pytest
from fastapi import HTTPException

from app.config import Settings
from app.gemini import GeminiClient


@pytest.mark.asyncio
async def test_availability_requires_a_gemini_api_key():
    assert await GeminiClient(Settings(gemini_api_key=None)).is_available() is False
    assert await GeminiClient(Settings(gemini_api_key="test-key")).is_available() is True


@pytest.mark.asyncio
async def test_unconfigured_gemini_has_a_safe_error():
    client = GeminiClient(Settings(gemini_api_key=None))
    with pytest.raises(HTTPException) as error:
        await client._generate(system_instruction="test", prompt="hello")
    assert error.value.status_code == 503
    assert "key" not in error.value.detail.lower()


async def test_gemini_stream_keeps_thought_summary_out_of_answer():
    from types import SimpleNamespace

    from google.genai import types

    async def generate_content_stream(**kwargs):
        assert kwargs["config"].thinking_config.include_thoughts

        async def chunks():
            for text, thought in [
                ("A greeting fits.", True),
                ('{"action":"finish","answer":"Hello', False),
                ('!","suggestions":[]}', False),
            ]:
                yield types.GenerateContentResponse(
                    candidates=[
                        types.Candidate(
                            content=types.Content(parts=[types.Part(text=text, thought=thought)])
                        )
                    ]
                )

        return chunks()

    client = GeminiClient(Settings(gemini_api_key=None))
    client.client = SimpleNamespace(
        aio=SimpleNamespace(models=SimpleNamespace(generate_content_stream=generate_content_stream))
    )
    events = []
    result = await client.agent_step_stream({"message": "Hi"}, events.append)
    assert result["answer"] == "Hello!"
    assert events == [
        {"type": "reasoning", "text": "A greeting fits."},
        {"type": "delta", "text": "Hello"},
        {"type": "delta", "text": "!"},
    ]
