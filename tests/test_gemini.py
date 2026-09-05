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
