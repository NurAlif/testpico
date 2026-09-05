import json
from types import SimpleNamespace

import httpx
import pytest
from fastapi import HTTPException

from app.config import Settings
from app.models import AISelection
from app.providers import CompatibleClient, FallbackClient, make_client, provider_info


@pytest.mark.parametrize('provider', ['gemini', 'deepseek', 'openrouter', 'freerouter', 'groq'])
async def test_provider_routes_and_streams(provider):
    def handler(request):
        assert request.headers['authorization'] == 'Bearer personal-key'
        assert json.loads(request.content)['model'] == 'chosen-model'
        return httpx.Response(200, text='data: {"choices":[{"delta":{"content":"hello"}}]}\n\ndata: [DONE]\n\n')
    settings = Settings(_env_file=None)
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        client = CompatibleClient(http, settings, AISelection(provider=provider,model='chosen-model',api_key='personal-key'))
        assert await client._generate(system_instruction='Hi',prompt='Hi') == 'hello'
    assert 'personal-key' not in json.dumps(provider_info(settings))


async def test_freerouter_uses_configured_gateway_without_a_key():
    def handler(request):
        assert str(request.url) == 'http://gateway.test/v1/chat/completions'
        assert 'authorization' not in request.headers
        return httpx.Response(200, text='data: {"choices":[{"delta":{"content":"hello"}}]}\n\ndata: [DONE]\n\n')
    settings = Settings(_env_file=None, freerouter_base_url='http://gateway.test/v1')
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        client = CompatibleClient(http, settings, AISelection(provider='freerouter'))
        assert await client._generate(system_instruction='Hi', prompt='Hi') == 'hello'


async def test_missing_key_and_incomplete_stream():
    settings = Settings(_env_file=None)
    async with httpx.AsyncClient(transport=httpx.MockTransport(lambda r: httpx.Response(200,text='data: {"choices":[]}\n\n'))) as http:
        client = CompatibleClient(http,settings,AISelection(provider='groq'))
        with pytest.raises(HTTPException, match='not configured'):
            await client._generate(system_instruction='Hi',prompt='Hi')
        client.key = 'test'
        with pytest.raises(HTTPException, match='request failed'):
            await client._generate(system_instruction='Hi',prompt='Hi')


async def test_fallback_and_partial_output_protection():
    class Primary:
        partial = False
        async def agent_step_stream(self, context, emit):
            if self.partial:
                emit({'type':'delta','text':'partial'})
            raise RuntimeError('offline')
    class Local:
        calls = 0
        async def agent_step_stream(self, context, emit):
            self.calls += 1
            return {'action':'finish','answer':'local'}
    primary, local, events = Primary(), Local(), []
    client = FallbackClient(primary,local)
    assert (await client.agent_step_stream({},events.append))['answer'] == 'local'
    assert events[0]['type'] == 'status'
    primary.partial = True
    with pytest.raises(RuntimeError):
        await FallbackClient(primary,local).agent_step_stream({},events.append)
    assert local.calls == 1


def test_ollama_model_is_request_scoped():
    settings = Settings(_env_file=None,ollama_model='original')
    state = SimpleNamespace(settings=settings,http_client=None)
    client = make_client(state,AISelection(provider='ollama',model='selected',api_key='unused'))
    assert client.settings.ollama_model == 'selected'
    assert settings.ollama_model == 'original'

@pytest.mark.parametrize('provider', ['groq', 'ollama'])
async def test_list_models_uses_selected_provider(provider):
    from app.main import provider_models
    def handler(request):
        if provider == 'ollama':
            if request.url.path == '/api/show':
                return httpx.Response(200,json={'capabilities':['completion']})
            assert request.url.path == '/api/tags'
            assert 'authorization' not in request.headers
            return httpx.Response(200,json={'models':[{'name':'installed:latest'}]})
        assert request.url.host == 'api.groq.com'
        assert request.headers['authorization'] == 'Bearer test'
        return httpx.Response(200,json={'data':[{'id':'available-model'}]})
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        state = SimpleNamespace(settings=Settings(_env_file=None),http_client=http)
        request = SimpleNamespace(app=SimpleNamespace(state=state))
        result = await provider_models(AISelection(provider=provider,api_key='test'),request)
        assert result['models'] == (['installed:latest'] if provider == 'ollama' else ['available-model'])
