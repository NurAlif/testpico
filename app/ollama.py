"""Local Ollama transport using the shared assistant prompts and intent handling."""

import asyncio
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

    async def model_details(self, model):
        try:
            response = await self.http_client.post(
                f"{self.base_url}/api/show", json={"model": model}, timeout=15)
            if response.status_code == 404:
                raise HTTPException(400, "This model is not installed in Ollama. Refresh the model list and choose an installed model.")
            response.raise_for_status()
            return response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise HTTPException(502, "Cannot reach Ollama from the app backend. Check that Ollama is running and OLLAMA_BASE_URL points to it.") from exc

    async def list_models(self):
        try:
            response = await self.http_client.get(f"{self.base_url}/api/tags", timeout=15)
            response.raise_for_status()
            names = sorted({m['name'] for m in response.json().get('models', []) if isinstance(m.get('name'), str)})
        except (httpx.HTTPError, ValueError, TypeError) as exc:
            raise HTTPException(502, "Cannot list Ollama models. Check that Ollama is running and reachable from the app backend.") from exc
        semaphore = asyncio.Semaphore(4)
        async def supports_chat(name):
            async with semaphore:
                details = await self.model_details(name)
                capabilities = details.get('capabilities')
                return name if capabilities is None or 'completion' in capabilities else None
        models = await asyncio.gather(*(supports_chat(name) for name in names))
        return [name for name in models if name]

    async def test_connection(self):
        details = await self.model_details(self.settings.ollama_model)
        capabilities = details.get('capabilities')
        if capabilities is not None and 'completion' not in capabilities:
            raise HTTPException(400, "This Ollama model does not support chat. Choose a chat model from the list.")
        return {"ok": True, "model": self.settings.ollama_model,
                "message": "Ollama is connected and this chat model is installed."}

    async def is_reachable(self) -> bool:
        try:
            response = await self.http_client.get(f"{self.base_url}/api/tags", timeout=3)
            return response.is_success
        except httpx.HTTPError:
            return False

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
        self,
        *,
        system_instruction: str,
        prompt: str,
        json_schema: dict[str, object] | None = None,
    ) -> str:
        payload = self._payload(system_instruction, prompt, False)
        if json_schema:
            payload["format"] = json_schema
            payload["options"]["temperature"] = 0
        try:
            response = await self.http_client.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=self.settings.ollama_request_timeout_seconds,
            )
            response.raise_for_status()
            return response.json()["message"]["content"].strip()
        except (httpx.HTTPError, ValueError, KeyError) as exc:
            raise HTTPException(status_code=502, detail="Local Ollama request failed") from exc

    async def _generate_stream(
        self,
        *,
        system_instruction: str,
        prompt: str,
        json_mode=False,
        emit=None,
    ) -> AsyncIterator[str]:
        try:
            payload = self._payload(system_instruction, prompt, True)
            if json_mode:
                payload["format"] = "json"
            if emit:
                payload.pop("think", None)  # Use the model's native thinking support, if available.
            async with self.http_client.stream(
                "POST",
                f"{self.base_url}/api/chat",
                json=payload,
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
                    reasoning = chunk.get("message", {}).get("thinking", "")
                    if emit and reasoning:
                        emit({"type": "reasoning", "text": reasoning})
                    if content:
                        yield content
        except (httpx.HTTPError, ValueError, KeyError) as exc:
            raise HTTPException(status_code=502, detail="Local Ollama request failed") from exc
