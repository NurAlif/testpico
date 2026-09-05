import json
import sqlite3

import httpx
from fastapi.testclient import TestClient

from app.config import get_settings
from app.main import app


def test_saved_keys_persist_are_encrypted_and_account_scoped(tmp_path, monkeypatch):
    database = tmp_path / 'accounts.db'
    monkeypatch.setenv('HISTORY_DATABASE_PATH', str(database))
    monkeypatch.delenv('PROVIDER_ENCRYPTION_KEY', raising=False)
    get_settings.cache_clear()
    try:
        with TestClient(app, base_url='http://localhost') as client:
            def login(identifier='testpico', password='testpico'):
                token = client.post('/api/auth/login',json={'identifier':identifier,'password':password}).json()['token']
                return {'Authorization':f'Bearer {token}'}
            headers = login()
            assert client.post('/api/providers/key',json={'provider':'groq','api_key':'secret'}).status_code == 401
            result = client.post('/api/providers/key',headers=headers,json={'provider':'groq','api_key':'saved-api-secret'})
            assert result.json() == {'saved':True}
            with sqlite3.connect(database) as db:
                encrypted = db.execute('SELECT encrypted_key FROM provider_keys').fetchone()[0]
            assert 'saved-api-secret' not in encrypted
            assert (tmp_path / 'provider-encryption.key').exists()
            info = client.get('/api/providers',headers=headers).json()
            assert 'saved-api-secret' not in json.dumps(info)
            for provider in info['providers']:
                assert set(provider) <= {'id','name','model','configured','available','saved_key'}
            invalid = client.post('/api/providers/key',headers=headers,json={'provider':'groq','api_key':'sensitive-value' * 400})
            assert invalid.status_code == 422
            assert 'sensitive-value' not in invalid.text
            assert next(p for p in info['providers'] if p['id']=='groq')['saved_key'] is True
            client.post('/api/auth/register',json={'username':'alice','email':'alice@example.com','password':'password123'})
            other = login('alice','password123')
            info = client.get('/api/providers',headers=other).json()
            assert next(p for p in info['providers'] if p['id']=='groq')['saved_key'] is False
            client.post('/api/providers/key',headers=other,json={'provider':'groq','api_key':None})
            assert client.post('/api/providers/key',headers=headers,json={'provider':'groq','api_key':'bad\nkey'}).status_code == 400
            client.post('/api/auth/logout',headers=headers)
        # Recreate the backend: the database and encryption file survive.
        with TestClient(app, base_url='http://localhost') as client:
            headers = login()
            original_http = app.state.http_client
            captured = []
            def handler(request):
                captured.append(request.headers['authorization'])
                return httpx.Response(200,text='data: {"choices":[{"delta":{"content":"{\\"action\\":\\"finish\\",\\"answer\\":\\"Hello\\"}"}}]}\n\ndata: [DONE]\n\n')
            app.state.http_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
            try:
                assert client.post('/api/providers/test',headers=headers,json={'provider':'groq'}).status_code == 200
                assert captured[-1] == 'Bearer saved-api-secret'
                cid = client.post('/api/conversations',headers=headers).json()['id']
                response = client.post('/api/chat',headers=headers,json={'message':'Hello','conversation_id':cid,'ai':{'provider':'groq'}})
                assert response.status_code == 200
                assert response.json()['answer'] == 'Hello'
                assert 'saved-api-secret' not in client.get(f'/api/conversations/{cid}',headers=headers).text
                assert client.post('/api/providers/key',headers=headers,json={'provider':'groq','api_key':'replacement'}).json()['saved']
                assert client.post('/api/providers/test',headers=headers,json={'provider':'groq'}).status_code == 200
                assert captured[-1] == 'Bearer replacement'
                assert client.post('/api/providers/key',headers=headers,json={'provider':'groq','api_key':None}).json() == {'saved':False}
                info = client.get('/api/providers',headers=headers).json()
                assert not next(p for p in info['providers'] if p['id']=='groq')['saved_key']
            finally:
                app.state.http_client = original_http
    finally:
        get_settings.cache_clear()
