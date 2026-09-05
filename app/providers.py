"""Request-scoped provider selection; credentials never enter conversation storage."""
import json
from pathlib import Path

import httpx
from fastapi import HTTPException

from app.config import Settings
from app.gemini import GeminiClient
from app.ollama import OllamaClient
from app.service import PlacesAssistant

CATALOG = json.loads(Path(__file__).with_name('providers.json').read_text(encoding='utf-8-sig'))


def provider_info(settings):
    return {'default_provider': settings.ai_provider, 'providers': [
        {'id': key, 'name': value['name'],
         'model': getattr(settings, f'{key}_model', value['model']),
         'configured': key == 'ollama' or not value.get('requires_api_key', True) or bool(Settings.reveal(getattr(settings, f'{key}_api_key', None))),
         'available': True}
        for key, value in CATALOG.items()
    ]}


class CompatibleClient(GeminiClient):
    def __init__(self, client, settings, selection):
        self.http_client = client
        self.settings = settings
        self.provider = selection.provider
        self.model = selection.model or getattr(settings, f'{self.provider}_model')
        self.key = Settings.reveal(selection.api_key) or Settings.reveal(getattr(settings, f'{self.provider}_api_key'))
        definition = CATALOG[self.provider]
        base_url = getattr(settings, definition['base_url_env'].lower(), definition['url']) if definition.get('base_url_env') else definition['url']
        self.url = base_url.rstrip('/') + '/chat/completions'

    @property
    def requires_api_key(self):
        return CATALOG[self.provider].get('requires_api_key', True)

    async def is_available(self):
        return bool(self.key)

    async def _generate_stream(self, *, system_instruction, prompt, json_mode=False, emit=None):
        if self.requires_api_key and not self.key:
            raise HTTPException(503, f'{CATALOG[self.provider]["name"]} API key is not configured')
        payload = {'model': self.model, 'messages': [
            {'role': 'system', 'content': system_instruction}, {'role': 'user', 'content': prompt}],
            'stream': True, 'temperature': 0.2}
        if json_mode:
            payload['response_format'] = {'type': 'json_object'}
        try:
            async with self.http_client.stream('POST', self.url, json=payload,
                    headers={'Authorization': f'Bearer {self.key}'} if self.key else {}, timeout=120) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.startswith('data:'):
                        continue
                    data = line[5:].strip()
                    if data == '[DONE]':
                        return
                    chunk = json.loads(data)
                    if 'error' in chunk:
                        raise ValueError('Provider stream failed')
                    delta = (chunk.get('choices') or [{}])[0].get('delta', {})
                    if emit and delta.get('reasoning_content'):
                        emit({'type': 'reasoning', 'text': delta['reasoning_content']})
                    if delta.get('content'):
                        yield delta['content']
                raise ValueError('Incomplete stream')
        except httpx.TimeoutException as exc:
            raise HTTPException(
                504, f'{CATALOG[self.provider]["name"]} timed out'
            ) from exc
        except httpx.HTTPStatusError as exc:
            code = exc.response.status_code
            if code in {401, 403}:
                reason = 'rejected the API key or its permissions'
            elif code == 402:
                reason = 'requires credits or an active billing account'
            elif code == 404:
                reason = 'could not find the selected model'
            elif code == 429:
                reason = 'rate limit or quota was reached'
            else:
                reason = f'returned HTTP {code}'
            raise HTTPException(
                502, f'{CATALOG[self.provider]["name"]} {reason}'
            ) from exc
        except (httpx.RequestError, ValueError, KeyError) as exc:
            raise HTTPException(
                502,
                f'{CATALOG[self.provider]["name"]} request failed; '
                'check the model and API key',
            ) from exc

    async def _generate(self, *, system_instruction, prompt, json_schema=None):
        return ''.join([part async for part in self._generate_stream(
            system_instruction=system_instruction, prompt=prompt, json_mode=bool(json_schema))])


def make_client(state, selection):
    if selection.provider == 'ollama':
        settings = state.settings.model_copy(update={'ollama_model': selection.model or state.settings.ollama_model})
        return OllamaClient(state.http_client, settings)
    return CompatibleClient(state.http_client, state.settings, selection)


class FallbackClient:
    def __init__(self, primary, fallback):
        self.active = primary
        self.fallback = fallback

    async def agent_step_stream(self, context, emit):
        started = False
        def forward(event):
            nonlocal started
            if event['type'] in {'delta', 'reasoning'}:
                started = True
            emit(event)
        try:
            return await self.active.agent_step_stream(context, forward)
        except Exception:
            if started or self.active is self.fallback:
                raise
            self.active = self.fallback
            emit({'type': 'status', 'message': 'Primary provider unavailable. Using local Ollama…'})
            return await self.active.agent_step_stream(context, emit)

    async def agent_step(self, context):
        return await self.agent_step_stream(context, lambda event: None)


def selected_assistant(state, selection):
    if selection is None:
        return state.assistant
    client = make_client(state, selection)
    if selection.fallback and selection.provider != 'ollama':
        local = selection.model_copy(update={'provider': 'ollama', 'model': selection.fallback_model})
        client = FallbackClient(client, make_client(state, local))
    return PlacesAssistant(client, state.maps)
