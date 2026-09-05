import asyncio
import json
import time
import uuid
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path
from uuid import UUID

import httpx
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.security import APIKeyHeader, HTTPBearer
from fastapi.staticfiles import StaticFiles

from app.accounts import AccountStore
from app.config import Settings, get_settings
from app.gemini import GeminiClient
from app.google_maps import GoogleMapsClient
from app.history import HistoryStore
from app.models import (
    ChatRequest,
    ChatResponse,
    ConversationResponse,
    Message,
    OpenAIChatRequest,
    Place,
    PlacePhotoRequest,
    PlaceSearchRequest,
)
from app.ollama import OllamaClient
from app.security import PUBLIC_PATHS, SlidingWindowLimiter, security_headers, verify_api_key
from app.service import PlacesAssistant

STATIC_DIR = Path(__file__).parent / "static"

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
    maps = GoogleMapsClient(client, settings)
    if settings.ai_provider == "ollama":
        gemini = OllamaClient(client, settings)
    else:
        gemini = GeminiClient(settings)
    app.state.settings = settings
    app.state.http_client = client
    app.state.maps = maps
    app.state.gemini = gemini
    app.state.assistant = PlacesAssistant(gemini, maps)
    history_store = HistoryStore(settings.history_database_path)
    await history_store.initialize()
    app.state.history_store = history_store
    app.state.accounts = AccountStore(settings.history_database_path)
    await app.state.accounts.run("initialize")
    app.state.limiter = SlidingWindowLimiter(
        settings.rate_limit_requests, settings.rate_limit_window_seconds
    )
    yield
    await client.aclose()


app = FastAPI(
    title="WanderAI API",
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
            await request.app.state.limiter.check(request.client.host if request.client else "unknown")
            if path not in {"/api/auth/login", "/api/auth/register"}:
                request.state.user_id = await request.app.state.accounts.run("authenticate", token)
        elif path.startswith("/v1/"):
            if Settings.reveal(request.app.state.settings.app_api_key):
                verify_api_key(request, request.app.state.settings)
            else:
                await request.app.state.accounts.run("authenticate", token)
            await request.app.state.limiter.check(request.client.host if request.client else "unknown")
    except HTTPException as exc:
        return await http_error_handler(request, exc)
    response = await call_next(request)
    # The interactive docs page loads Swagger UI from a CDN and needs a wider
    # CSP than the rest of the app; every other response keeps the strict one.
    security_headers(response.headers, allow_docs_ui=request.url.path == "/docs")
    return response


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
            settings.ollama_model if settings.ai_provider == "ollama" else settings.gemini_model
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
    }


@app.post("/api/chat", response_model=ChatResponse, dependencies=API_DEPENDENCIES)
async def chat(payload: ChatRequest, request: Request) -> ChatResponse:
    await load_owned_history(payload, request)
    result = await request.app.state.assistant.chat(payload)
    if payload.conversation_id:
        saved_answer = result.answer
        await request.app.state.history_store.append(
            str(payload.conversation_id),
            [
                Message(role="user", content=payload.message),
                Message(role="assistant", content=saved_answer),
            ],
        )
    return result


@app.post("/api/chat/stream", dependencies=API_DEPENDENCIES)
async def chat_stream(payload: ChatRequest, request: Request) -> StreamingResponse:
    """Stream the assistant answer as newline-delimited JSON events.

    Lines are either {"type": "delta", "text": "..."} token chunks or a final
    {"type": "done", "answer": "...", "places": [...]} event.
    """
    # Intent detection and the Places lookup run before streaming starts so that
    # failures surface as normal HTTP error responses instead of mid-stream.
    await load_owned_history(payload, request)
    prepared = await request.app.state.assistant.prepare_stream(payload)

    async def events() -> AsyncIterator[dict[str, object]]:
        parts: list[str] = []
        try:
            async for chunk in request.app.state.assistant.stream_answer(payload, prepared):
                parts.append(chunk)
                yield {"type": "delta", "text": chunk}
        except HTTPException as exc:
            yield {"type": "error", "message": str(exc.detail)}
            return
        answer = "".join(parts).strip()
        if payload.conversation_id:
            saved_answer = answer
            await request.app.state.history_store.append(
                str(payload.conversation_id),
                [
                    Message(role="user", content=payload.message),
                    Message(role="assistant", content=saved_answer),
                ],
            )
        yield {
            "type": "done",
            "answer": answer,
            "places": [place.model_dump() for place in prepared.places],
        }

    return StreamingResponse(
        (json.dumps(event, ensure_ascii=False) + "\n" async for event in events()),
        media_type="application/x-ndjson",
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


from pydantic import BaseModel, Field


class LoginInput(BaseModel):
    identifier: str = Field(min_length=1, max_length=254)
    password: str = Field(min_length=1, max_length=128)


class RegisterInput(BaseModel):
    username: str = Field(pattern=r"^[a-zA-Z0-9_]{3,32}$")
    email: str = Field(max_length=254, pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
    password: str = Field(min_length=8, max_length=128)


@app.post("/api/auth/register")
async def register(payload: RegisterInput, request: Request):
    await request.app.state.accounts.run("register", payload.username, payload.email, payload.password)
    return {"message": "Account created. Please log in."}


@app.post("/api/auth/login")
async def login(payload: LoginInput, request: Request):
    return await request.app.state.accounts.run("login", payload.identifier.strip(), payload.password)


@app.post("/api/auth/logout")
async def logout(request: Request):
    await request.app.state.accounts.run("logout", request.headers.get("authorization", "").removeprefix("Bearer "))
    return {"message": "Logged out"}


@app.get("/api/conversations")
async def list_conversations(request: Request):
    return await request.app.state.accounts.run("conversations", request.state.user_id)


async def load_owned_history(payload, request):
    if not payload.conversation_id:
        raise HTTPException(400, "Create a conversation before sending a message")
    await request.app.state.accounts.run("own", str(payload.conversation_id), request.state.user_id)
    payload.history = (await request.app.state.history_store.messages(str(payload.conversation_id)))[-20:]
