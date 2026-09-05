import asyncio
import ipaddress
import json
import time
import uuid
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path
from uuid import UUID

import httpx
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.security import APIKeyHeader, HTTPBearer
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, SecretStr

from app.accounts import AccountStore
from app.config import Settings, get_settings
from app.gemini import GeminiClient
from app.google_maps import GoogleMapsClient
from app.history import HistoryStore
from app.models import (
    AISelection,
    ChatRequest,
    ChatResponse,
    ConversationResponse,
    LocalSetupInput,
    Message,
    OpenAIChatRequest,
    Place,
    PlacePhotoRequest,
    PlaceSearchRequest,
)
from app.ollama import OllamaClient
from app.provider_vault import ProviderVault, resolve_selection
from app.providers import CompatibleClient, make_client, provider_info, selected_assistant
from app.security import PUBLIC_PATHS, SlidingWindowLimiter, security_headers, verify_api_key
from app.service import PlacesAssistant

STATIC_DIR = Path(__file__).parent / "static"
LOCAL_SETUP_HOSTS = {"localhost", "127.0.0.1", "::1"}


def local_setup_available(request: Request) -> bool:
    """The instance-wide setup writer is intentionally limited to localhost."""
    if (request.url.hostname or "").lower() not in LOCAL_SETUP_HOSTS:
        return False
    client_host = request.client.host if request.client else ""
    if client_host in {"localhost", "testclient"}:
        return True
    try:
        address = ipaddress.ip_address(client_host)
        return address.is_loopback or address.is_private
    except ValueError:
        return False


def validated_setup_secret(value: SecretStr | None, label: str) -> str | None:
    if value is None:
        return None
    revealed = value.get_secret_value().strip()
    if not revealed or any(ord(character) < 32 or ord(character) == 127 for character in revealed):
        raise HTTPException(400, f"Enter a valid {label}")
    return revealed

# Declared so the OpenAPI docs expose the same authentication the middleware
# enforces (Authorization: Bearer or X-API-Key). auto_error=False keeps the
# middleware as the single enforcement point; these only drive the schema.
_bearer = HTTPBearer(auto_error=False)
_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)
API_DEPENDENCIES = [Depends(_bearer), Depends(_api_key_header)]


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    client = httpx.AsyncClient(
        limits=httpx.Limits(max_connections=50, max_keepalive_connections=20),
        follow_redirects=False,
        headers={"User-Agent": "wanderai/1.0"},
    )
    app.state.settings = settings
    app.state.http_client = client
    history_store = HistoryStore(settings.history_database_path)
    await history_store.initialize()
    app.state.history_store = history_store
    app.state.provider_vault = ProviderVault(settings)
    app.state.accounts = AccountStore(settings.history_database_path)
    await app.state.accounts.run("initialize")
    for setting_name, field_name in {
        "google_places_api_key": "google_places_api_key",
        "google_maps_embed_api_key": "google_maps_embed_api_key",
    }.items():
        encrypted = await app.state.accounts.run("app_setting", setting_name)
        if encrypted:
            value = app.state.provider_vault.decrypt_instance(setting_name, encrypted)
            setattr(settings, field_name, SecretStr(value))
    maps = GoogleMapsClient(client, settings)
    if settings.ai_provider == "ollama":
        gemini = OllamaClient(client, settings)
    elif settings.ai_provider == "gemini":
        gemini = GeminiClient(settings)
    else:
        gemini = CompatibleClient(client, settings, AISelection(provider=settings.ai_provider))
    app.state.maps = maps
    app.state.gemini = gemini
    app.state.assistant = PlacesAssistant(gemini, maps)
    app.state.limiter = SlidingWindowLimiter(
        settings.rate_limit_requests, settings.rate_limit_window_seconds
    )
    yield
    await client.aclose()


app = FastAPI(
    title="Wander Pico API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
    lifespan=lifespan,
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-API-Key"],
)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.allowed_hosts)


@app.middleware("http")
async def protect_api(request: Request, call_next):
    try:
        path = request.url.path
        token = request.headers.get("authorization", "").removeprefix("Bearer ")
        if path.startswith("/api/") and path not in PUBLIC_PATHS:
            await request.app.state.limiter.check(
                request.client.host if request.client else "unknown"
            )
            if path not in {"/api/auth/login", "/api/auth/register"}:
                request.state.user_id = await request.app.state.accounts.run("authenticate", token)
        elif path.startswith("/v1/"):
            if Settings.reveal(request.app.state.settings.app_api_key):
                verify_api_key(request, request.app.state.settings)
            else:
                await request.app.state.accounts.run("authenticate", token)
            await request.app.state.limiter.check(
                request.client.host if request.client else "unknown"
            )
    except HTTPException as exc:
        return await http_error_handler(request, exc)
    response = await call_next(request)
    if request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store"
    # The interactive docs page loads Swagger UI from a CDN and needs a wider
    # CSP than the rest of the app; every other response keeps the strict one.
    security_headers(response.headers, allow_docs_ui=request.url.path == "/docs")
    return response


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    # Validation errors must not echo credential-bearing request input.
    return await http_error_handler(request, HTTPException(
        status_code=422, detail="Invalid request. Check the field values and lengths."))


@app.exception_handler(HTTPException)
async def http_error_handler(_request: Request, exc: HTTPException) -> JSONResponse:
    response = JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    for key, value in (exc.headers or {}).items():
        response.headers[key] = value
    security_headers(response.headers)
    return response


@app.get("/", include_in_schema=False)
async def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/health")
async def health(request: Request) -> dict[str, object]:
    settings: Settings = request.app.state.settings
    return {
        "status": "ok",
        "provider": settings.ai_provider,
        "model": (
            getattr(settings, f"{settings.ai_provider}_model")
        ),
        "model_available": await request.app.state.gemini.is_available(),
        "places_configured": bool(Settings.reveal(settings.google_places_api_key)),
        "embed_configured": bool(Settings.reveal(settings.google_maps_embed_api_key)),
    }


@app.get("/api/config")
async def public_config(request: Request) -> dict[str, object]:
    settings: Settings = request.app.state.settings
    return {
        "api_auth_required": False,
        "login_required": True,
        "maps_configured": request.app.state.maps.configured,
        "embed_configured": request.app.state.maps.embed_configured,
        "max_place_results": settings.max_place_results,
        "local_setup_available": local_setup_available(request),
    }


@app.post("/api/chat", response_model=ChatResponse, dependencies=API_DEPENDENCIES)
async def chat(payload: ChatRequest, request: Request) -> ChatResponse:
    await load_owned_history(payload, request)
    payload.ai = await resolve_selection(request, payload.ai)
    result = await selected_assistant(request.app.state, payload.ai).chat(payload)
    if payload.conversation_id:
        saved_answer = result.answer
        await request.app.state.history_store.append(
            str(payload.conversation_id),
            [
                Message(role="user", content=payload.message),
                Message(role="assistant", content=saved_answer, places=[p.model_dump() for p in result.places], suggestions=result.suggestions),
            ],
        )
    return result


@app.post("/api/chat/stream", dependencies=API_DEPENDENCIES)
async def chat_stream(payload: ChatRequest, request: Request) -> StreamingResponse:
    """Stream the assistant answer as newline-delimited JSON events.

    Emits status, tool, optional reasoning, and answer delta events, followed by
    a done event after saving the response, or an error event on failure.
    """
    await load_owned_history(payload, request)
    payload.ai = await resolve_selection(request, payload.ai)

    async def events():
        queue = asyncio.Queue()

        async def produce():
            try:
                prepared = await selected_assistant(request.app.state, payload.ai).prepare_stream(
                    payload, queue.put_nowait
                )
                if payload.conversation_id:
                    await request.app.state.history_store.append(
                        str(payload.conversation_id),
                        [
                            Message(role="user", content=payload.message),
                            Message(
                                role="assistant", content=prepared.answer,
                                places=[p.model_dump() for p in prepared.places],
                                suggestions=prepared.suggestions,
                            ),
                        ],
                    )
                queue.put_nowait({
                    "type": "done", "answer": prepared.answer,
                    "places": [p.model_dump() for p in prepared.places],
                    "suggestions": prepared.suggestions,
                })
            except Exception:
                queue.put_nowait({
                    "type": "error",
                    "message": "The response could not be completed. Please try again.",
                })
            finally:
                queue.put_nowait(None)

        task = asyncio.create_task(produce())
        try:
            while True:
                event = await queue.get()
                if event is None:
                    break
                yield json.dumps(event, ensure_ascii=False) + "\n"
        finally:
            task.cancel()
            await asyncio.gather(task, return_exceptions=True)

    return StreamingResponse(
        events(), media_type="application/x-ndjson",
        headers={"Cache-Control": "no-store", "X-Accel-Buffering": "no"},
    )


@app.post("/api/conversations", response_model=ConversationResponse, dependencies=API_DEPENDENCIES)
async def create_conversation(request: Request) -> ConversationResponse:
    conversation_id = await request.app.state.accounts.run("create", request.state.user_id)
    return ConversationResponse(id=conversation_id)


@app.get(
    "/api/conversations/{conversation_id}",
    response_model=ConversationResponse,
    dependencies=API_DEPENDENCIES,
)
async def get_conversation(conversation_id: UUID, request: Request) -> ConversationResponse:
    await request.app.state.accounts.run("own", str(conversation_id), request.state.user_id)
    messages = await request.app.state.history_store.messages(str(conversation_id))
    if messages is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return ConversationResponse(id=conversation_id, messages=messages)


@app.post("/api/places/search", response_model=list[Place], dependencies=API_DEPENDENCIES)
async def search_places(payload: PlaceSearchRequest, request: Request) -> list[Place]:
    return await request.app.state.maps.search_text(
        payload.query,
        open_now=payload.open_now,
        language_code=payload.language_code,
    )


@app.post("/api/places/photo", dependencies=API_DEPENDENCIES)
async def place_photo(payload: PlacePhotoRequest, request: Request) -> JSONResponse:
    url = await request.app.state.maps.photo_url(payload.name)
    return JSONResponse({"url": url}, headers={"Cache-Control": "no-store"})


@app.get("/v1/models", dependencies=API_DEPENDENCIES)
async def openai_models(request: Request) -> dict[str, object]:
    model = request.app.state.settings.api_model_name
    return {"object": "list", "data": [{"id": model, "object": "model", "owned_by": "local"}]}


def _openai_text(response: ChatResponse) -> str:
    if not response.places:
        return response.answer
    links = "\n".join(f"- [{place.name}]({place.google_maps_url})" for place in response.places)
    return f"{response.answer}\n\n### Maps and photos\n{links}"


@app.post("/v1/chat/completions", dependencies=API_DEPENDENCIES)
async def openai_chat(payload: OpenAIChatRequest, request: Request):
    user_messages = [message for message in payload.messages if message.role == "user"]
    if not user_messages:
        raise HTTPException(status_code=400, detail="At least one user message is required")
    latest = user_messages[-1]
    history = payload.messages[:-1][-20:]
    result = await request.app.state.assistant.chat(
        ChatRequest(message=latest.content, history=history)
    )
    content = _openai_text(result)
    completion_id = f"chatcmpl-{uuid.uuid4().hex}"
    created = int(time.time())
    model = request.app.state.settings.api_model_name

    if not payload.stream:
        return {
            "id": completion_id,
            "object": "chat.completion",
            "created": created,
            "model": model,
            "choices": [
                {
                    "index": 0,
                    "message": {"role": "assistant", "content": content},
                    "finish_reason": "stop",
                }
            ],
            "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
        }

    async def events() -> AsyncIterator[str]:
        chunk = {
            "id": completion_id,
            "object": "chat.completion.chunk",
            "created": created,
            "model": model,
            "choices": [
                {
                    "index": 0,
                    "delta": {"role": "assistant", "content": content},
                    "finish_reason": None,
                }
            ],
        }
        yield f"data: {json.dumps(chunk, ensure_ascii=False)}\n\n"
        await asyncio.sleep(0)
        chunk["choices"][0] = {"index": 0, "delta": {}, "finish_reason": "stop"}
        yield f"data: {json.dumps(chunk)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(events(), media_type="text/event-stream")


app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


class LoginInput(BaseModel):
    identifier: str = Field(min_length=1, max_length=254)
    password: str = Field(min_length=1, max_length=128)


class RegisterInput(BaseModel):
    username: str = Field(pattern=r"^[a-zA-Z0-9_]{3,32}$")
    email: str = Field(max_length=254, pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
    password: str = Field(min_length=8, max_length=128)


@app.post("/api/auth/register")
async def register(payload: RegisterInput, request: Request):
    await request.app.state.accounts.run(
        "register", payload.username, payload.email, payload.password
    )
    return {"message": "Account created. Please log in."}


@app.post("/api/auth/login")
async def login(payload: LoginInput, request: Request):
    return await request.app.state.accounts.run(
        "login", payload.identifier.strip(), payload.password
    )


@app.post("/api/auth/logout")
async def logout(request: Request):
    await request.app.state.accounts.run(
        "logout", request.headers.get("authorization", "").removeprefix("Bearer ")
    )
    return {"message": "Logged out"}


@app.get("/api/conversations")
async def list_conversations(request: Request):
    return await request.app.state.accounts.run("conversations", request.state.user_id)


async def load_owned_history(payload, request):
    if not payload.conversation_id:
        raise HTTPException(400, "Create a conversation before sending a message")
    await request.app.state.accounts.run("own", str(payload.conversation_id), request.state.user_id)
    payload.history = (
        await request.app.state.history_store.messages(str(payload.conversation_id))
    )[-20:]


@app.get("/api/providers")
async def providers(request: Request):
    return await provider_status(request)


async def provider_status(request: Request):
    info = provider_info(request.app.state.settings)
    saved = await request.app.state.accounts.run('provider_key_status', request.state.user_id)
    for provider in info['providers']:
        provider['saved_key'] = provider['id'] in saved
        provider['configured'] = provider['configured'] or provider['saved_key']
        if provider['id'] == 'ollama':
            try:
                provider['available'] = await OllamaClient(
                    request.app.state.http_client, request.app.state.settings
                ).is_reachable()
            except Exception:
                # Provider discovery is advisory and must never take down settings.
                provider['available'] = False
            provider['configured'] = provider['available']
    info['key_storage_available'] = True
    return info


async def setup_status(request: Request):
    if not local_setup_available(request):
        raise HTTPException(404, "Local setup is available only from localhost")
    providers = await provider_status(request)
    complete = await request.app.state.accounts.run('app_setting', 'setup_complete')
    return {
        "available": True,
        "complete": complete == "1",
        "google": {
            "places_configured": request.app.state.maps.places_configured,
            "embed_configured": request.app.state.maps.embed_configured,
        },
        **providers,
    }


@app.get("/api/setup")
async def get_local_setup(request: Request):
    return await setup_status(request)


@app.post("/api/setup")
async def save_local_setup(payload: LocalSetupInput, request: Request):
    if not local_setup_available(request):
        raise HTTPException(404, "Local setup is available only from localhost")
    fields = {
        "google_places_api_key": (
            payload.google_places_api_key,
            "Google Places API key",
        ),
        "google_maps_embed_api_key": (
            payload.google_maps_embed_api_key,
            "Google Maps Embed API key",
        ),
    }
    for field_name, (secret, label) in fields.items():
        value = validated_setup_secret(secret, label)
        if value is None:
            continue
        encrypted = request.app.state.provider_vault.encrypt_instance(field_name, value)
        await request.app.state.accounts.run(
            'save_app_setting', field_name, encrypted
        )
        setattr(request.app.state.settings, field_name, SecretStr(value))
    if payload.complete:
        if not request.app.state.maps.places_configured:
            raise HTTPException(400, "Configure and test Google Places before finishing setup")
        await request.app.state.accounts.run('save_app_setting', 'setup_complete', '1')
    return await setup_status(request)


@app.post("/api/setup/google/test")
async def test_google_setup(request: Request):
    if not local_setup_available(request):
        raise HTTPException(404, "Local setup is available only from localhost")
    return await request.app.state.maps.test_connection()


@app.post("/api/providers/test")
async def test_provider(payload: AISelection, request: Request):
    payload = await resolve_selection(request, payload)
    client = make_client(request.app.state, payload)
    if payload.provider == 'ollama':
        return await client.test_connection()
    await client._generate(system_instruction='Reply with JSON only.', prompt='Return {"ok":true}', json_schema={"type":"object"})
    return {"ok": True}


@app.post("/api/providers/models")
async def provider_models(payload: AISelection, request: Request):
    payload = await resolve_selection(request, payload)
    client = make_client(request.app.state, payload)
    if payload.provider == "ollama":
        return {"models": await client.list_models()}
    local = False
    url = f"{client.base_url}/api/tags" if local else client.url.removesuffix("/chat/completions") + "/models"
    if not local and client.requires_api_key and not client.key:
        raise HTTPException(503, "API key is not configured")
    headers = {} if local or not client.key else {"Authorization": f"Bearer {client.key}"}
    try:
        response = await request.app.state.http_client.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        data = response.json()
        models = [item.get("name" if local else "id") for item in data.get("models" if local else "data", [])]
        return {"models": sorted(item for item in models if isinstance(item, str))}
    except (httpx.HTTPError, ValueError, TypeError) as exc:
        raise HTTPException(502, "Could not load models. Check your provider connection.") from exc


@app.post("/api/providers/key")
async def save_provider_key(payload: AISelection, request: Request):
    if payload.provider == 'ollama':
        raise HTTPException(400, 'Local Ollama does not need a personal API key')
    key = Settings.reveal(payload.api_key)
    if key is not None and (not key.strip() or any(ord(c) < 32 or ord(c) == 127 for c in key)):
        raise HTTPException(400, 'Enter a valid API key')
    state = request.app.state
    encrypted = state.provider_vault.encrypt(request.state.user_id, payload.provider, key.strip()) if key else None
    await state.accounts.run('save_provider_key', request.state.user_id, payload.provider, encrypted)
    return {'saved': encrypted is not None}
