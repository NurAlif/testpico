"""Local Ollama transport using the shared assistant prompts and intent handling."""

import json
from collections.abc import AsyncIterator

import httpx
from fastapi import HTTPException

from app.config import Settings
from app.gemini import GeminiClient


class OllamaClient(GeminiClient):
    def __init__(self, client: httpx.AsyncClient, settings: Settings) -> None:
        self.http_client = client
        self.settings = settings
        self.base_url = settings.ollama_base_url.rstrip("/")

    async def is_available(self) -> bool:
        try:
            response = await self.http_client.post(
                f"{self.base_url}/api/show",
                json={"model": self.settings.ollama_model},
                timeout=5,
            )
            return response.is_success
        except httpx.HTTPError:
            return False

    def _payload(self, system_instruction: str, prompt: str, stream: bool) -> dict:
        return {
            "model": self.settings.ollama_model,
            "messages": [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt},
            ],
            "stream": stream,
            "think": False,
            "options": {"num_ctx": self.settings.ollama_context_length, "temperature": 0.2},
        }

    async def _generate(
        self, *, system_instruction: str, prompt: str,
        json_schema: dict[str, object] | None = None,
    ) -> str:
        payload = self._payload(system_instruction, prompt, False)
        if json_schema:
            payload["format"] = json_schema
            payload["options"]["temperature"] = 0
        try:
            response = await self.http_client.post(
                f"{self.base_url}/api/chat", json=payload,
                timeout=self.settings.ollama_request_timeout_seconds,
            )
            response.raise_for_status()
            return response.json()["message"]["content"].strip()
        except (httpx.HTTPError, ValueError, KeyError) as exc:
            raise HTTPException(status_code=502, detail="Local Ollama request failed") from exc

    async def _generate_stream(
        self, *, system_instruction: str, prompt: str,
    ) -> AsyncIterator[str]:
        try:
            async with self.http_client.stream(
                "POST", f"{self.base_url}/api/chat",
                json=self._payload(system_instruction, prompt, True),
                timeout=self.settings.ollama_request_timeout_seconds,
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line:
                        continue
                    chunk = json.loads(line)
                    if "error" in chunk:
                        raise ValueError("Ollama stream failed")
                    content = chunk.get("message", {}).get("content", "")
                    if content:
                        yield content
        except (httpx.HTTPError, ValueError, KeyError) as exc:
            raise HTTPException(status_code=502, detail="Local Ollama request failed") from exc
